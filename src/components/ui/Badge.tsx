import { clsx } from "clsx";
import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "primary";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200",
  success: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  error: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  info: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  primary: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  primary: "bg-indigo-500",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium rounded-full gap-1.5",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            "w-1.5 h-1.5 rounded-full",
            dotStyles[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
