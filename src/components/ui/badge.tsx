import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-border bg-black/[0.03] text-foreground",
        success: "border-success/20 bg-success-tint text-success",
        warning: "border-warning/25 bg-warning-tint text-[#92400E]",
        error: "border-error/20 bg-error-tint text-error",
        primary: "border-primary/20 bg-primary-tint text-primary-dark",
        outline: "border-border bg-white text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
