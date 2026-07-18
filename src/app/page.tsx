"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileScan,
  Gauge,
  Lightbulb,
  MessageSquareText,
  FileDown,
  UploadCloud,
  ScanText,
  BrainCircuit,
  Sparkles,
  MessageCircle,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    icon: FileScan,
    title: "AI Report Analysis",
    description: "Upload any lab report and MediLens extracts every parameter automatically — no manual entry required.",
  },
  {
    icon: Gauge,
    title: "Disease Risk Prediction",
    description: "Machine learning models trained on clinical data estimate your risk for anemia, diabetes, and kidney disease.",
  },
  {
    icon: Lightbulb,
    title: "Explainable AI",
    description: "See exactly which parameters drove each prediction, with transparent feature-contribution breakdowns.",
  },
  {
    icon: MessageSquareText,
    title: "Medical Chat",
    description: "Ask follow-up questions in plain language and get clear, grounded answers about your own results.",
  },
  {
    icon: FileDown,
    title: "Download Summary",
    description: "Generate a clean, shareable PDF summary to bring to your next appointment.",
  },
];

const steps = [
  { icon: UploadCloud, title: "Upload Report", description: "Drop in a PDF or photo of your lab report." },
  { icon: ScanText, title: "Extract Parameters", description: "OCR and NLP pull out every measurable value." },
  { icon: BrainCircuit, title: "Predict Disease Risk", description: "ML models score risk across key conditions." },
  { icon: Sparkles, title: "AI Explanation", description: "Generative AI translates results into plain language." },
  { icon: MessageCircle, title: "Ask Questions", description: "Chat with MediLens about anything in your report." },
];

const techStack = [
  { name: "Next.js", detail: "Frontend framework" },
  { name: "FastAPI", detail: "Backend services" },
  { name: "Machine Learning", detail: "Risk prediction models" },
  { name: "Generative AI", detail: "Plain-language explanations" },
  { name: "LangChain", detail: "AI orchestration" },
  { name: "SQLite", detail: "Report storage" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

function ToneChip({ tone, children }: { tone: "error" | "warning" | "success"; children: React.ReactNode }) {
  const map = {
    error: "bg-error-tint text-error",
    warning: "bg-warning-tint text-[#92400E]",
    success: "bg-success-tint text-success",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[tone]}`}>{children}</span>;
}

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
            <div>
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-tint px-3 py-1 text-xs font-semibold text-primary-dark">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Explainable AI for lab reports
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]"
              >
                Understand your lab report
                <span className="text-primary"> before your doctor even calls back.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                className="mt-5 max-w-lg text-lg leading-relaxed text-muted"
              >
                MediLens reads your medical report, predicts disease risk with machine learning, and explains every
                finding in plain language — so you walk into your next appointment already informed.
              </motion.p>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Button size="lg" asChild>
                  <Link href="/upload">
                    Upload Medical Report
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">View Live Dashboard</Link>
                </Button>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
                className="mt-10 flex items-center gap-6 text-sm text-muted"
              >
                <div>
                  <span className="font-display text-xl font-bold text-foreground">40K+</span> reports analyzed
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <span className="font-display text-xl font-bold text-foreground">96.2%</span> extraction accuracy
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative rounded-2xl border border-border bg-white p-5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Complete Blood Count</p>
                    <p className="text-xs text-muted">Analyzed 2 hours ago</p>
                  </div>
                  <ToneChip tone="warning">Needs Attention</ToneChip>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-black/[0.02] px-3.5 py-2.5">
                    <span className="text-sm text-foreground">Hemoglobin</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">10.8 g/dL</span>
                      <ToneChip tone="error">Critical</ToneChip>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-black/[0.02] px-3.5 py-2.5">
                    <span className="text-sm text-foreground">WBC Count</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">11,800 /mm³</span>
                      <ToneChip tone="warning">Borderline</ToneChip>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-black/[0.02] px-3.5 py-2.5">
                    <span className="text-sm text-foreground">Platelet Count</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">410,000 /mm³</span>
                      <ToneChip tone="success">Normal</ToneChip>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-primary-tint p-3.5">
                  <div className="flex items-center gap-2 text-primary-dark">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-semibold">Anemia Risk: 81% probability</span>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 -top-6 hidden rounded-2xl border border-border bg-white p-3.5 shadow-lg sm:block"
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Health Score</p>
                <p className="font-display text-2xl font-bold text-primary">78</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Platform"
            title="Everything you need to make sense of a lab report"
            description="From raw PDF to plain-language insight, MediLens handles the entire pipeline."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Process"
            title="From upload to understanding in five steps"
            align="center"
            className="mx-auto"
          />

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary-tint text-primary-dark">
                  <step.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{step.description}</p>
                {i !== steps.length - 1 && (
                  <div className="mt-4 hidden h-px w-full bg-gradient-to-r from-border to-transparent lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="technology" className="border-t border-border bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Under the hood" title="Built on a modern, production-grade stack" />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.03] font-display text-sm font-bold text-primary-dark">
                  {tech.name.slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tech.name}</p>
                  <p className="text-xs text-muted">{tech.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary-dark px-8 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/[0.06]" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/[0.05]" />
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Your next report doesn&apos;t have to be confusing.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/80">
              Upload a report and get a full AI breakdown in under a minute.
            </p>
            <Button size="lg" className="mt-7 bg-white text-primary-dark hover:bg-white/90" asChild>
              <Link href="/upload">
                Upload Medical Report
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
