"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { clsx } from "clsx";

interface Option {
  value: number | string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: number | string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);

  return (
    <div className={clsx("relative", className)} ref={containerRef}>
      <div
        className="min-h-[42px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label, i) => (
              <span
                key={i}
                className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1"
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const val = options.find((o) => o.label === label)?.value;
                    if (val) handleSelect(val);
                  }}
                  className="hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="max-h-60 overflow-y-auto p-1">
            {options.length === 0 ? (
              <div className="p-2 text-sm text-center text-slate-500">
                Aucune option
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  className={clsx(
                    "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                    value.includes(option.value) &&
                      "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <div
                    className={clsx(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-900/20 dark:border-slate-50/20",
                      value.includes(option.value)
                        ? "bg-indigo-600 border-indigo-600"
                        : "opacity-50"
                    )}
                  >
                    {value.includes(option.value) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
