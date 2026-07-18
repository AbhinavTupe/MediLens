import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-tint text-primary-dark">
        <FileSearch className="h-9 w-9" />
      </span>
      <p className="mt-6 font-display text-5xl font-bold tracking-tight text-foreground">404</p>
      <h1 className="mt-2 font-display text-xl font-semibold text-foreground">This report doesn&apos;t exist</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The page you&apos;re looking for may have been moved or the report reference is invalid.
      </p>
      <Button className="mt-7" asChild>
        <Link href="/dashboard">Go Back Home</Link>
      </Button>
    </div>
  );
}
