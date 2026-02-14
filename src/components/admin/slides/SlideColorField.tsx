"use client";

import { useMemo } from "react";
import { normalizeHexColor } from "@/lib/colors";

interface SlideColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  defaultColor: string;
  helperText?: string;
}

export default function SlideColorField({
  label,
  value,
  onChange,
  defaultColor,
  helperText,
}: SlideColorFieldProps) {
  const colorInputValue = useMemo(() => normalizeHexColor(value, defaultColor), [value, defaultColor]);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={colorInputValue}
          onChange={(event) => onChange(event.target.value)}
          className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 p-0 bg-white dark:bg-slate-800 cursor-pointer"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#002147 or bg-blue-900"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
        Valeur envoyée : {value || "—"}
      </p>
    </div>
  );
}
