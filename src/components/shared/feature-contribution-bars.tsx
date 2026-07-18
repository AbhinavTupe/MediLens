"use client";

import { motion } from "framer-motion";
import type { FeatureContribution } from "@/lib/types";

export function FeatureContributionBars({ data }: { data: FeatureContribution[] }) {
  const max = Math.max(...data.map((d) => Math.abs(d.contribution)), 1);

  return (
    <div className="space-y-4">
      {data.map((d, i) => {
        const positive = d.contribution >= 0;
        const widthPct = (Math.abs(d.contribution) / max) * 100;

        return (
          <div key={d.parameter}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{d.parameter}</span>
              <span className={positive ? "text-error" : "text-success"}>
                {positive ? "+" : ""}
                {d.contribution}%
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: positive ? "var(--error)" : "var(--success)" }}
                initial={{ width: 0 }}
                whileInView={{ width: `${widthPct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-xs text-muted">
        Positive values increase predicted risk; negative values are protective factors.
      </p>
    </div>
  );
}
