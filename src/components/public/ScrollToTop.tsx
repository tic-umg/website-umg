"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const SIZE = 56;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScrollToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = height > 0 ? Math.min((scrollTop / height) * 100, 100) : 0;
      setProgress(pct);
      setVisible(scrollTop > 240);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <button
      type="button"
      aria-label="Remonter en haut"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-[70] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="relative flex items-center justify-center">
        <svg width={SIZE} height={SIZE} className="rotate-[-90deg]">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            className="text-slate-200 dark:text-slate-700"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="text-indigo-600 dark:text-indigo-400"
            stroke="currentColor"
            fill="transparent"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 shadow-lg border border-slate-200/70 dark:border-blue-200/70 text-slate-800 dark:text-blue-100">
          <div className="flex flex-col items-center text-[10px] font-semibold leading-tight">
            <ArrowUp className="h-4 w-4" />
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </button>
  );
}
