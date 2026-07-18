import Link from "next/link";
import { Activity } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Upload Report", href: "/upload" },
      { label: "AI Chat", href: "/chat" },
      { label: "Report History", href: "/reports" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About MediLens", href: "/settings" },
      { label: "Technology", href: "/#technology" },
      { label: "How it Works", href: "/#how-it-works" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Medical Disclaimer", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Activity className="h-4.5 w-4.5" strokeWidth={2.5} />
              </span>
              <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
                MediLens
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Explainable AI that reads your lab reports and turns them into insights you can actually act on.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted transition-colors hover:text-primary-dark">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted">Copyright 2026 MediLens Health Technologies. For informational purposes only - not a substitute for professional medical advice.</p>
          <p className="text-xs text-muted">Built with Next.js, FastAPI, and LangChain</p>
        </div>
      </div>
    </footer>
  );
}
