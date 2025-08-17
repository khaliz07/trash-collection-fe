import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "error" | "info" | "default" | "primary";
}

const badgeVariantStyles = {
  success:
    "inline-flex h-6 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 text-xs font-medium text-emerald-700 dark:text-emerald-400",
  warning:
    "inline-flex h-6 items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 text-xs font-medium text-amber-700 dark:text-amber-400",
  error:
    "inline-flex h-6 items-center rounded-full border border-red-500/30 bg-red-500/10 px-2 text-xs font-medium text-red-700 dark:text-red-400",
  info: "inline-flex h-6 items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2 text-xs font-medium text-blue-700 dark:text-blue-400",
  default:
    "inline-flex h-6 items-center rounded-full border border-gray-300 bg-gray-50 px-2 text-xs font-medium text-gray-700 dark:text-gray-300",
  primary:
    "inline-flex h-6 items-center rounded-full border border-primary/30 bg-primary/10 px-2 text-xs font-medium text-primary dark:text-primary-400",
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariantStyles[variant],
          className,
          "whitespace-nowrap"
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
