"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  onFileSelected,
}: {
  onFileSelected?: (file: File | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      clearProgressTimer();
      setFile(f);
      onFileSelected?.(f);
      setProgress(0);
      progressIntervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearProgressTimer();
            return 100;
          }
          return p + Math.random() * 22;
        });
      }, 180);
    },
    [clearProgressTimer, onFileSelected]
  );

  useEffect(() => () => clearProgressTimer(), [clearProgressTimer]);

  return (
    <div>
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        animate={{ scale: isDragging ? 1.01 : 1 }}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors",
          isDragging ? "border-primary bg-primary-tint" : "border-border bg-white hover:border-primary/40 hover:bg-primary-tint/40"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-tint text-primary">
          <UploadCloud className="h-7 w-7" />
        </span>
        <p className="mt-5 font-display text-lg font-semibold text-foreground">
          Drag and drop your PDF medical report
        </p>
        <p className="mt-1.5 text-sm text-muted">or click to browse from your device</p>
        <Button
          className="mt-5"
          size="sm"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Browse Files
        </Button>
        <p className="mt-5 text-xs text-muted">Supports PDF files - max file size 20MB</p>
      </motion.div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-white p-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <button
                type="button"
                onClick={() => {
                  clearProgressTimer();
                  setFile(null);
                  setProgress(0);
                  onFileSelected?.(null);
                }}
                className="text-muted transition-colors hover:text-error"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Progress value={Math.min(progress, 100)} className="mt-2 h-1.5" />
            <p className="mt-1 text-xs text-muted">
              {(file.size / 1024).toFixed(0)} KB - {progress >= 100 ? "Upload complete" : "Uploading..."}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
