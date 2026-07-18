"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  CalendarDays,
  FileType,
  ListChecks,
  AlertOctagon,
  FileDown,
  Lightbulb,
  Utensils,
  ClipboardList,
  ShieldAlert,
} from "lucide-react";
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ParameterTable } from "@/components/shared/parameter-table";
import { RiskCard } from "@/components/shared/risk-card";
import { FeatureContributionBars } from "@/components/shared/feature-contribution-bars";
import { HealthScoreGauge } from "@/components/shared/health-score-gauge";
import { API_BASE_URL, fetchReport } from "@/lib/api";
import { mapReportDetailResponse } from "@/lib/report-mappers";
import type { FullReport } from "@/lib/types";

const summaryTiles = (report: FullReport) => [
  { icon: User, label: "Patient Name", value: report.patientName },
  { icon: Building2, label: "Hospital", value: report.hospital },
  { icon: CalendarDays, label: "Report Date", value: new Date(report.reportDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
  { icon: FileType, label: "Report Type", value: report.reportType },
  { icon: ListChecks, label: "Total Parameters", value: String(report.totalParameters) },
  { icon: AlertOctagon, label: "Abnormal Parameters", value: String(report.abnormalParameters) },
];

const barColor = (status: string) => (status === "critical" ? "#DC2626" : status === "borderline" ? "#F59E0B" : "#22C55E");

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchReport(id);
        setReport(mapReportDetailResponse(result));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10">Loading report...</div>;
  if (error || !report) return <div className="mx-auto max-w-7xl px-4 py-10 text-error">{error || "Report not found"}</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Report Analysis</p>
            <Badge className="border-success/20 bg-success/10 text-success">Analysis complete</Badge>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {report.reportType}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/reports">Back to reports</Link>
          </Button>
          <Button asChild onClick={() => window.open(`${API_BASE_URL}/report/${id}/download`, "_blank", "noopener,noreferrer")}>
            <span className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Download Summary
            </span>
          </Button>
          <Button variant="outline" onClick={() => window.open(`${API_BASE_URL}/report/${id}/download`, "_blank", "noopener,noreferrer")}>
            Print PDF
          </Button>
        </div>
      </div>

      {/* A. Summary */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryTiles(report).map((tile, i) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
              <tile.icon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{tile.value}</p>
              <p className="text-xs text-muted">{tile.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* B. Extracted Parameters */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-foreground">Extracted Parameters</h2>
        <p className="mt-1 text-sm text-muted">Every value MediLens identified from your report, compared against clinical reference ranges.</p>
        <div className="mt-4">
          <ParameterTable parameters={report.parameters} />
        </div>
      </section>

      {/* C. Disease Risk Prediction */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-foreground">Disease Risk Prediction</h2>
        <p className="mt-1 text-sm text-muted">Model-estimated probability for common conditions based on this report.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {report.risks.map((risk, i) => (
            <RiskCard key={risk.id} risk={risk} index={i} />
          ))}
        </div>
      </section>

      {/* D. Explainable AI */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary-dark" />
            <h3 className="font-display text-base font-semibold text-foreground">Feature Importance</h3>
          </div>
          <p className="mt-1 text-sm text-muted">Which parameters most influenced the top risk prediction.</p>
          <div className="mt-6">
            <FeatureContributionBars data={report.contributions} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parameter Values vs. Range Midpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.parameters.slice(0, 8)} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {report.parameters.slice(0, 8).map((p) => (
                      <Cell key={p.id} fill={barColor(p.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Charts: Radar + Gauge */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System-wise Health Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={report.radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar dataKey="value" stroke="#22C55E" fill="#22C55E" fillOpacity={0.28} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Health Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pb-8">
            <HealthScoreGauge score={100 - report.riskScore} />
            <p className="mt-4 max-w-xs text-center text-sm text-muted">
              Calculated from parameter deviations, risk probabilities, and trend direction.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* E. AI Explanation */}
      <section className="mt-10">
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-primary-tint/60 px-6 py-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary-dark" />
              <h3 className="font-display text-base font-semibold text-foreground">AI Explanation</h3>
            </div>
          </div>
          <CardContent className="pt-6">
            <p className="text-sm leading-relaxed text-foreground">{report.aiExplanation}</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Utensils className="h-4 w-4 text-primary-dark" />
                  Lifestyle Suggestions
                </div>
                <ul className="mt-3 space-y-2.5">
                  {report.lifestyleSuggestions.map((s) => (
                    <li key={s} className="flex gap-2.5 text-sm text-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ClipboardList className="h-4 w-4 text-primary-dark" />
                  General Recommendations
                </div>
                <ul className="mt-3 space-y-2.5">
                  {report.recommendations.map((s) => (
                    <li key={s} className="flex gap-2.5 text-sm text-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex gap-3 rounded-xl border border-warning/25 bg-warning-tint p-4">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-[#92400E]" />
              <p className="text-xs leading-relaxed text-[#92400E]">
                <strong>Medical Disclaimer:</strong> MediLens provides AI-generated informational insights only and
                does not constitute medical advice, diagnosis, or treatment. Always consult a licensed physician
                before making health decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
