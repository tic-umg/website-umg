"use client";

import { useMemo, useState } from "react";
import Container from "@/components/Container";
import type { ReactNode } from "react";

export type ProjectTab = { key: string; label: string };

export default function ProjectTabsLayout({
  tabs,
  defaultTabKey,
  onTabChange,
  children,
}: {
  tabs: ProjectTab[];
  defaultTabKey?: string;
  onTabChange?: (nextKey: string) => void;
  children: (activeTab: string) => ReactNode;
}) {
  const firstKey = useMemo(() => tabs[0]?.key, [tabs]);
  const initialKey = defaultTabKey ?? firstKey ?? "presentation";
  const [activeTab, setActiveTab] = useState<string>(initialKey);

  const safeActive = tabs.some((t) => t.key === activeTab) ? activeTab : initialKey;

  return (
    <Container className="max-w-[1280px] px-5 md:px-10">
      <div className="py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <aside className="md:sticky md:top-24 md:self-start">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                {tabs.map((t) => {
                  const active = t.key === safeActive;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        setActiveTab(t.key);
                        onTabChange?.(t.key);
                      }}
                      className={`whitespace-nowrap md:whitespace-normal text-left rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <section className="min-w-0">{children(safeActive)}</section>
        </div>
      </div>
    </Container>
  );
}

