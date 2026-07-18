import { Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-tint text-primary-dark">
        <Sparkles className="h-7 w-7 animate-pulse" />
      </div>
      <h1 className="mt-6 text-center font-display text-2xl font-bold tracking-tight text-foreground">
        Analyzing your report
      </h1>
      <p className="mt-2 text-center text-sm text-muted">This usually takes under a minute. Please keep this tab open.</p>
      <Card className="mt-8 flex w-full items-center justify-center gap-2 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Preparing the AI pipeline...
      </Card>
    </div>
  );
}
