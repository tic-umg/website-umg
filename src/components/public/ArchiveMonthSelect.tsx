"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/LanguageProvider";

export type ArchiveMonth = {
  year: number;
  month: number;
  count: number;
  label?: string | null;
};

type Props = {
  options: ArchiveMonth[];
  baseUrl: string;
  yearParam?: string;
  monthParam?: string;
  label?: string;
};

export default function ArchiveMonthSelect({
  options,
  baseUrl,
  yearParam = "year",
  monthParam = "month",
  label = "Archives",
}: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const year = searchParams.get(yearParam);
  const month = searchParams.get(monthParam);
  const currentValue = year && month ? `${year}-${month}` : "";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-900 dark:text-white">
        {label}
      </label>
      <select
        value={currentValue}
        onChange={(e) => {
          const v = e.target.value;
          const params = new URLSearchParams(searchParams.toString());
          params.delete("page");

          if (!v) {
            params.delete(yearParam);
            params.delete(monthParam);
          } else {
            const [yy, mm] = v.split("-");
            params.set(yearParam, yy);
            params.set(monthParam, mm);
          }

          const qs = params.toString();
          router.push(qs ? `${baseUrl}?${qs}` : baseUrl);
        }}
        className="
          w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200
        "
      >
        <option value="">{t("archives.allDates")}</option>
        {options.map((o) => {
          const y = String(o.year).padStart(4, "0");
          const m = String(o.month).padStart(2, "0");
          const value = `${y}-${m}`;
          const text = o.label ? `${o.label} (${o.count})` : `${m}/${y} (${o.count})`;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </div>
  );
}
