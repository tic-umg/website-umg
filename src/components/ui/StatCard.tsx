import { clsx } from "clsx";
import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  description?: string;
  className?: string;
  color?: "indigo" | "emerald" | "amber" | "red" | "blue";
}

const colorStyles = {
  indigo: {
    icon: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    icon: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    icon: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
  red: {
    icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  },
  blue: {
    icon: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
  color = "indigo",
}: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={clsx(
        "bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6",
        "hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5">
              {trend.direction === "up" ? (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{trend.value}%
                </span>
              ) : (
                <span className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  -{trend.value}%
                </span>
              )}
              <span className="text-slate-400 dark:text-slate-500 text-sm">vs mois dernier</span>
            </div>
          )}
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={clsx(
              "p-3 rounded-xl",
              styles.icon
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
