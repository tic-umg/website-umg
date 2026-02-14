import { clsx } from "clsx";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ children, className, hover = false, padding = "md" }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm",
        "transition-all duration-200",
        hover && "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer",
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700",
        className
      )}
    >
      <div className="font-semibold text-slate-900 dark:text-white">{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={clsx("py-4", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={clsx(
        "pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}
