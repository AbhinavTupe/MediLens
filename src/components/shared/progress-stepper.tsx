"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  title: string;
  description: string;
}

export function ProgressStepper({ steps, currentIndex }: { steps: Step[]; currentIndex: number }) {
  return (
    <div className="relative">
      {steps.map((step, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "pending";
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <div className="absolute left-[19px] top-10 h-full w-px bg-border">
                <motion.div
                  className="w-px bg-primary"
                  initial={{ height: 0 }}
                  animate={{ height: state === "done" ? "100%" : "0%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}

            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white"
              style={{ borderColor: state === "pending" ? "var(--border)" : "var(--primary)" }}
            >
              {state === "done" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-full w-full items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-4.5 w-4.5" strokeWidth={3} />
                </motion.div>
              )}
              {state === "active" && (
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-primary-tint text-primary">
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                </div>
              )}
              {state === "pending" && <span className="h-2 w-2 rounded-full bg-border" />}
            </div>

            <div className={cn("pt-1.5 transition-opacity", state === "pending" && "opacity-50")}>
              <p className={cn("font-medium", state === "active" ? "text-primary-dark" : "text-foreground")}>
                {step.title}
              </p>
              <p className="mt-0.5 text-sm text-muted">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
