"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileStack,
  AlertTriangle,
  CircleCheck,
  MessagesSquare,
  UploadCloud,
  ArrowUpRight,
  ArrowRight,
  ScanText,
  BrainCircuit,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "@/components/shared/stat-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchDashboardSummary } from "@/lib/api";
import { mapDashboardSummaryResponse } from "@/lib/report-mappers";
import type { DashboardSummary } from "@/lib/types";

const statusBadge = {
  normal: { variant: "success" as const, label: "Normal" },
  attention: { variant: "warning" as const, label: "Attention" },
  critical: { variant: "error" as const, label: "Critical" },
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadSummary() {
      try {
        const data = await fetchDashboardSummary();
        if (!cancelled) {
          setSummary(mapDashboardSummaryResponse(data));
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void loadSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalReports = summary?.reportCount ?? 0;
  const highRisk = summary?.highRiskCount ?? 0;
  const normal = summary?.normalCount ?? 0;
  const conversationCount = summary?.conversationCount ?? 0;
  const trend = summary?.trend ?? [];
  const recentActivity = summary?.recentActivity ?? [];
  const recentReports = summary?.recentReports ?? [];
  const reportTrendLabel = loading ? "Loading..." : totalReports > 0 ? `${totalReports} reports` : "No reports yet";
  const highRiskTrendLabel = loading ? "Loading..." : highRisk > 0 ? `${highRisk} flagged` : "No urgent flags";
  const normalTrendLabel = loading ? "Loading..." : normal > 0 ? `${normal} in range` : "No stable reports";
  const conversationTrendLabel = loading ? "Loading..." : conversationCount > 0 ? `${conversationCount} messages` : "Start a chat";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Your dashboard</h1>
          <p className="mt-1 text-sm text-muted">Here&apos;s an overview of your health data and recent activity.</p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <UploadCloud className="h-4 w-4" />
            Quick Upload
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Reports" value={String(totalReports)} icon={FileStack} tone="primary" index={0} trend={reportTrendLabel} />
        <StatCard label="High Risk Reports" value={String(highRisk)} icon={AlertTriangle} tone="error" index={1} trend={highRiskTrendLabel} />
        <StatCard label="Normal Reports" value={String(normal)} icon={CircleCheck} tone="primary" index={2} trend={normalTrendLabel} />
        <StatCard label="AI Conversations" value={String(conversationCount)} icon={MessagesSquare} tone="neutral" index={3} trend={conversationTrendLabel} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Health Score Overview</CardTitle>
              <p className="mt-1 text-sm text-muted">Composite score across your last 6 reports</p>
            </div>
            <Badge variant={summary && summary.healthScore >= 70 ? "primary" : summary && summary.healthScore >= 45 ? "warning" : "error"}>
              {loading ? "Loading" : summary ? `${summary.healthScore}% Health` : "No Data"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend.length > 0 ? trend : [{ month: "No Data", score: 0 }]} margin={{ left: -20, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 13 }}
                    labelStyle={{ color: "#111827", fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#22C55E" strokeWidth={2.5} fill="url(#scoreFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent AI Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm leading-snug text-foreground">{a.label}</p>
                  <p className="text-xs text-muted">{a.time}</p>
                </div>
              </motion.div>
            ))}
            <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
              <Link href="/chat">
                Open AI Chat
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <SectionHeader title="Recent Reports" className="max-w-none" />
          <Link href="/reports" className="flex items-center gap-1 text-sm font-medium text-primary-dark hover:underline">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentReports.slice(0, 3).map((r, i) => {
            const badge = statusBadge[r.status];
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/reports/${r.id}`}>
                  <Card className="h-full p-5 transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-medium text-muted">
                        {new Date(r.reportDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <h3 className="mt-3 font-display text-base font-semibold text-foreground">{r.reportType}</h3>
                    <p className="mt-1 text-sm text-muted">{r.hospital}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted">
                      <span>{r.abnormalParameters}/{r.totalParameters} abnormal</span>
                      <span className="font-semibold text-foreground">Risk {r.riskScore}%</span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { href: "/upload", icon: UploadCloud, title: "Upload New Report", description: "Add a lab report for AI analysis" },
            { href: "/chat", icon: ScanText, title: "Ask MediLens AI", description: "Chat about your latest results" },
            { href: "/reports", icon: BrainCircuit, title: "Compare Risk Trends", description: "Review your full report history" },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3 }}
          >
            <Link href={item.href}>
              <Card className="flex h-full items-center gap-4 p-5 transition-shadow hover:shadow-md">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted">{item.description}</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
