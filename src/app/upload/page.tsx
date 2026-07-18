"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Info, ShieldCheck } from "lucide-react";
import { UploadDropzone } from "@/components/shared/upload-dropzone";
import { SectionHeader } from "@/components/shared/section-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { uploadReport } from "@/lib/api";

const supportedTypes = [
  { icon: FileText, label: "CBC / Blood Reports" },
  { icon: FileText, label: "Lipid Profile" },
  { icon: FileText, label: "Kidney & Liver Function" },
  { icon: FileText, label: "Diabetes / HbA1c Panel" },
  { icon: FileText, label: "Scanned PDF Reports" },
  { icon: FileText, label: "Printable Lab Summaries" },
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF report.");
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const result = await uploadReport(file);
      router.push(`/processing?reportId=${result.report_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Step 1 of 3"
        title="Upload your medical report"
        description="MediLens processes PDF lab reports securely on the backend and keeps the workflow simple."
      />

      <Card className="mt-8 p-6 sm:p-8">
        <UploadDropzone onFileSelected={setFile} />

        <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Encrypted in transit - analyzed securely on the backend
          </p>
          <Button size="lg" disabled={!file || isUploading} onClick={handleUpload}>
            {isUploading ? "Uploading..." : "Start AI Analysis"}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="mt-4 rounded-xl border border-error/20 bg-error-tint p-3 text-sm text-error">{error}</div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary-dark" />
            <h3 className="font-display text-sm font-semibold text-foreground">Supported Report Types</h3>
          </div>
          <ul className="mt-4 space-y-2.5">
            {supportedTypes.map((t) => (
              <li key={t.label} className="flex items-center gap-2.5 text-sm text-muted">
                <t.icon className="h-4 w-4 text-primary" />
                {t.label}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary-dark" />
            <h3 className="font-display text-sm font-semibold text-foreground">Tips for best results</h3>
          </div>
          <motion.ul className="mt-4 space-y-3 text-sm text-muted">
            <li>Use text-based PDF reports whenever possible for the best extraction quality.</li>
            <li>Ensure the file opens correctly before uploading.</li>
            <li>Password-protected PDFs should be unlocked before upload.</li>
            <li>One report per upload gives the most accurate analysis.</li>
          </motion.ul>
        </Card>
      </div>
    </div>
  );
}
