"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  trend,
  index = 0,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "warning" | "error" | "neutral";
  trend?: string;
  index?: number;
}) {
  const toneStyles: Record<string, string> = {
    primary: "bg-primary-tint text-primary-dark",
    warning: "bg-warning-tint text-[#92400E]",
    error: "bg-error-tint text-error",
    neutral: "bg-black/[0.04] text-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", toneStyles[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        {trend && <span className="text-xs font-medium text-success">{trend}</span>}
      </div>
      <p className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </motion.div>
  );
}
