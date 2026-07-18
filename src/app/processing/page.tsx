"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ProgressStepper, type Step } from "@/components/shared/progress-stepper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchReport } from "@/lib/api";

const steps: Step[] = [
  { id: "s1", title: "Upload Complete", description: "Report received and queued for processing." },
  { id: "s2", title: "Extracting Text", description: "Running OCR across the document." },
  { id: "s3", title: "Detecting Medical Parameters", description: "Identifying test names, values, and units." },
  { id: "s4", title: "Running Machine Learning Model", description: "Scoring disease risk against clinical baselines." },
  { id: "s5", title: "Generating AI Explanation", description: "Translating findings into plain language." },
  { id: "s6", title: "Completed", description: "Your report is ready to view." },
];

export default function ProcessingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId") ?? "";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      router.replace("/upload");
      return;
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const pollReport = async (attempt = 0) => {
      try {
        await fetchReport(reportId);
        if (cancelled) return;
        setCurrentIndex(steps.length);
      } catch (err) {
        if (!cancelled) {
          if (attempt >= 6) {
            setError(err instanceof Error ? err.message : "Processing failed");
            return;
          }
          setCurrentIndex((value) => Math.min(value + 1, steps.length - 1));
          retryTimer = setTimeout(() => {
            void pollReport(attempt + 1);
          }, 900);
        }
      }
    };

    setCurrentIndex(0);
    setError(null);
    void pollReport();
    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [reportId, router]);

  useEffect(() => {
    if (!reportId || error) {
      return;
    }

    if (currentIndex >= steps.length) {
      const timeout = setTimeout(() => router.push(`/reports/${reportId}`), 700);
      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => setCurrentIndex((value) => Math.min(value + 1, steps.length)), 1000);
    return () => clearTimeout(timer);
  }, [currentIndex, error, reportId, router]);

  const done = currentIndex >= steps.length && !error;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 py-12 sm:px-6">
      <motion.div
        animate={{ rotate: done ? 0 : 360 }}
        transition={{ duration: 2.4, repeat: done ? 0 : Infinity, ease: "linear" }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-tint text-primary-dark"
      >
        <Sparkles className="h-7 w-7" />
      </motion.div>

      <h1 className="mt-6 text-center font-display text-2xl font-bold tracking-tight text-foreground">
        {error ? "Analysis paused" : done ? "Analysis complete" : "Analyzing your report"}
      </h1>
      <p className="mt-2 text-center text-sm text-muted">
        {error
          ? "The backend returned an error. Please try uploading the file again."
          : done
            ? "Redirecting to your results..."
            : "This usually takes under a minute. Please keep this tab open."}
      </p>

      <Card className="mt-10 w-full p-6 sm:p-8">
        <ProgressStepper steps={steps} currentIndex={currentIndex} />
      </Card>
      {error && (
        <Card className="mt-4 w-full border-error/20 bg-error-tint p-4">
          <p className="text-sm font-medium text-error">Processing failed</p>
          <p className="mt-1 text-sm text-error">{error}</p>
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link href="/upload">Upload another PDF</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/reports">View reports</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
