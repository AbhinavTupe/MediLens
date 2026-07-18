"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Trash2, FileStack, Loader2 } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchReports, deleteReport } from "@/lib/api";
import { mapReportSummaryResponse } from "@/lib/report-mappers";
import type { ReportSummary } from "@/lib/types";

const statusBadge = {
  normal: { variant: "success" as const, label: "Normal" },
  attention: { variant: "warning" as const, label: "Attention" },
  critical: { variant: "error" as const, label: "Critical" },
};

const filters = ["All", "Normal", "Attention", "Critical"] as const;

export default function ReportHistoryPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await fetchReports();
        setReports(data.map(mapReportSummaryResponse));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchesQuery =
        r.reportType.toLowerCase().includes(query.toLowerCase()) ||
        r.hospital.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All" || statusBadge[r.status].label === filter;
      return matchesQuery && matchesFilter;
    });
  }, [reports, query, filter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="History" title="Report History" description="Every report you've uploaded, in one place." />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by report type or hospital..." />

        <div className="flex items-center gap-1.5 rounded-xl bg-black/[0.04] p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {actionError && <div className="mt-4 rounded-2xl border border-error/20 bg-error-tint p-4 text-sm text-error">{actionError}</div>}

      {loading ? (
        <div className="mt-16 flex items-center justify-center rounded-2xl border border-border py-16">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading reports...
        </div>
      ) : error ? (
        <div className="mt-16 rounded-2xl border border-error/20 bg-error-tint p-6 text-sm text-error">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-tint text-primary-dark">
            <FileStack className="h-6 w-6" />
          </span>
          <p className="mt-4 font-display text-base font-semibold text-foreground">No reports found</p>
          <p className="mt-1 max-w-sm text-sm text-muted">Try a different search term or filter, or upload a new report to get started.</p>
          <Button className="mt-5" asChild>
            <Link href="/upload">Upload a Report</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-black/[0.02]">
                  <th className="px-5 py-3.5 font-medium text-muted">Report Name</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Upload Date</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Risk Score</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Status</th>
                  <th className="px-5 py-3.5 font-medium text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const badge = statusBadge[r.status];
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/70 last:border-0 hover:bg-black/[0.015]"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">{r.reportType}</p>
                        <p className="text-xs text-muted">{r.hospital}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {new Date(r.reportDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/[0.06]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${r.riskScore}%`,
                                background: r.riskScore > 60 ? "var(--error)" : r.riskScore > 35 ? "var(--warning)" : "var(--success)",
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-foreground">{r.riskScore}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/reports/${r.id}`} aria-label="Open report">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted hover:text-error"
                            aria-label="Delete report"
                            disabled={deletingId === r.id}
                            onClick={async () => {
                              setActionError(null);
                              setDeletingId(r.id);
                              try {
                                await deleteReport(r.id);
                                setReports((prev) => prev.filter((x) => x.id !== r.id));
                              } catch (err) {
                                setActionError(err instanceof Error ? err.message : "Failed to delete report");
                              } finally {
                                setDeletingId(null);
                              }
                            }}
                          >
                            {deletingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
