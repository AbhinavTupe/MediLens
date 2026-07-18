"use client";

import { motion } from "framer-motion";

export function HealthScoreGauge({ score }: { score: number }) {
  const radius = 80;
  const circumference = Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference - (clamped / 100) * circumference;

  const color = clamped >= 70 ? "var(--success)" : clamped >= 40 ? "var(--warning)" : "var(--error)";
  const label = clamped >= 70 ? "Good" : clamped >= 40 ? "Needs Attention" : "At Risk";

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="112" viewBox="0 0 200 112">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--border)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="-mt-9 flex flex-col items-center">
        <span className="font-display text-4xl font-bold text-foreground">{clamped}</span>
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}
