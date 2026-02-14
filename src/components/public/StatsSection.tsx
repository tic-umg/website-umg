"use client";

import { Users, GraduationCap, UserCog, Building2 } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface StatsProps {
  stats?: {
    students: number;
    teachers: number;
    staff: number;
    establishments: number;
  };
}

export default function StatsSection({ stats }: StatsProps) {
  const { lang, t } = useI18n();
  const numberLocale = lang === "fr" ? "fr-FR" : "en-US";
  const statsData = [
    {
      icon: Users,
      value: stats?.students ? stats.students.toLocaleString(numberLocale) : "12,000",
      label: t("stats.students"),
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/30"
    },
    {
      icon: GraduationCap,
      value: stats?.teachers ? stats.teachers.toLocaleString(numberLocale) : "500",
      label: t("stats.teachers"),
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30"
    },
    {
      icon: UserCog,
      value: stats?.staff ? stats.staff.toLocaleString(numberLocale) : "200",
      label: t("stats.staff"),
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/30"
    },
    {
      icon: Building2,
      value: stats?.establishments?.toString() || "6",
      label: t("stats.establishments"),
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30"
    },
  ];

  return (
    <section className="relative z-20 -mt-10 pb-4">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 flex items-center gap-3"
              >
                <div className={`size-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
