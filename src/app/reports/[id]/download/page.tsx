"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Download, Loader2, Printer } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL, fetchReport } from "@/lib/api";
import { mapReportDetailResponse } from "@/lib/report-mappers";
import type { FullReport } from "@/lib/types";

const barColor = (status: string) => (status === "critical" ? "#DC2626" : status === "borderline" ? "#F59E0B" : "#22C55E");

export default function DownloadSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const result = await fetchReport(id);
        if (!cancelled) {
          setReport(mapReportDetailResponse(result));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load summary");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 py-10 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="mt-3 font-medium text-foreground">Loading summary...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 py-10 text-center">
        <p className="font-display text-xl font-semibold text-foreground">Summary unavailable</p>
        <p className="mt-2 max-w-md text-sm text-muted">{error || "This report could not be loaded."}</p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href={`/reports/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to report
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/reports">Report history</Link>
          </Button>
        </div>
      </div>
    );
  }

  const downloadHref = `${API_BASE_URL}/report/${id}/download`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Step 3 of 3</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">Download Summary</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button asChild>
            <a href={downloadHref}>
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="mt-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-primary-tint/50 px-8 py-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Activity className="h-4.5 w-4.5" strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-bold text-foreground">MediLens</span>
            </div>
            <p className="text-xs text-muted">Report ID: {report.id.toUpperCase()}</p>
          </div>

          <div className="space-y-8 px-8 py-8">
            <section>
              <h2 className="font-display text-base font-semibold text-foreground">Medical Report</h2>
              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-3">
                <div><span className="text-muted">Patient — </span><span className="font-medium text-foreground">{report.patientName}</span></div>
                <div><span className="text-muted">Hospital — </span><span className="font-medium text-foreground">{report.hospital}</span></div>
                <div><span className="text-muted">Date — </span><span className="font-medium text-foreground">{new Date(report.reportDate).toLocaleDateString("en-IN")}</span></div>
                <div><span className="text-muted">Type — </span><span className="font-medium text-foreground">{report.reportType}</span></div>
                <div><span className="text-muted">Parameters — </span><span className="font-medium text-foreground">{report.totalParameters}</span></div>
                <div><span className="text-muted">Abnormal — </span><span className="font-medium text-foreground">{report.abnormalParameters}</span></div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-foreground">Prediction Summary</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {report.risks.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border p-3.5">
                    <p className="text-xs font-medium text-muted">{r.name}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-display text-lg font-bold text-foreground">{r.probability}%</span>
                      <Badge variant={r.severity === "high" ? "error" : r.severity === "moderate" ? "warning" : "success"}>
                        {r.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-foreground">Parameter Chart</h2>
              <div className="mt-3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.parameters.slice(0, 8)} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={55} />
                    <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={30} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {report.parameters.slice(0, 8).map((p) => (
                        <Cell key={p.id} fill={barColor(p.status)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-foreground">AI Explanation</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{report.aiExplanation}</p>
            </section>

            <div className="rounded-xl border border-warning/25 bg-warning-tint p-4 text-xs leading-relaxed text-[#92400E]">
              <strong>Medical Disclaimer:</strong> This summary is generated by AI for informational purposes only
              and does not replace professional medical advice, diagnosis, or treatment.
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
