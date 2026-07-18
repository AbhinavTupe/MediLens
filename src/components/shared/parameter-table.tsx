import { Badge } from "@/components/ui/badge";
import type { ExtractedParameter } from "@/lib/types";

const statusConfig = {
  normal: { badge: "success" as const, label: "Normal" },
  borderline: { badge: "warning" as const, label: "Borderline" },
  critical: { badge: "error" as const, label: "Critical" },
};

export function ParameterTable({ parameters }: { parameters: ExtractedParameter[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-black/[0.02]">
              <th className="px-5 py-3.5 font-medium text-muted">Parameter</th>
              <th className="px-5 py-3.5 font-medium text-muted">Value</th>
              <th className="px-5 py-3.5 font-medium text-muted">Unit</th>
              <th className="px-5 py-3.5 font-medium text-muted">Normal Range</th>
              <th className="px-5 py-3.5 font-medium text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((p, i) => {
              const config = statusConfig[p.status];
              return (
                <tr
                  key={p.id}
                  className={i !== parameters.length - 1 ? "border-b border-border/70" : ""}
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">{p.name}</td>
                  <td className="px-5 py-3.5 font-semibold text-foreground">{p.value.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-muted">{p.unit}</td>
                  <td className="px-5 py-3.5 text-muted">{p.normalRange}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={config.badge}>{config.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
