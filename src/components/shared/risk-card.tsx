"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { DiseaseRisk } from "@/lib/types";
import { cn } from "@/lib/utils";

const severityConfig = {
  low: { color: "var(--success)", badge: "success" as const, label: "Low Severity" },
  moderate: { color: "var(--warning)", badge: "warning" as const, label: "Moderate Severity" },
  high: { color: "var(--error)", badge: "error" as const, label: "High Severity" },
};

function ProgressCircle({ value, color }: { value: number; color: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="var(--border)" strokeWidth="9" />
        <motion.circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl font-bold text-foreground">{value}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted">Probability</span>
      </div>
    </div>
  );
}

export function RiskCard({ risk, index = 0 }: { risk: DiseaseRisk; index?: number }) {
  const config = severityConfig[risk.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="rounded-2xl border border-border bg-surface p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">{risk.name}</h3>
          <p className="mt-1 text-xs text-muted">Confidence: {risk.confidence}%</p>
        </div>
        <Badge variant={config.badge}>{config.label}</Badge>
      </div>

      <div className="mt-5 flex items-center justify-center">
        <ProgressCircle value={risk.probability} color={config.color} />
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted">{risk.summary}</p>

      <div className={cn("mt-4 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]")}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: config.color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${risk.confidence}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
}
