"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { PresidentMessage } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface PresidentMessageProps {
  data?: PresidentMessage | null;
  fullPage?: boolean;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export default function PresidentMessage({ data, fullPage = false }: PresidentMessageProps) {
  const { t } = useI18n();
  const photoUrl =
    data?.photo?.url ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCJsTyyt3qhu-9IbTwrB9In9ZkJ7cyG_NpJuOLXUCuXwkgnHBKdrUdm5F2qmT-3CGXAAmL_ICYgygjj_-TPlDcZlPlgUYcPrmX0HnJl0TKMJJmodknVFAuu39kxmu7ZzWzWtEx7TOSUaNzCyKfjSP0dA7usQKNv86m2xU1vL_xTyTAGvjBxR_ts11Yny5tjnhnVb2in91zKIZxxNNT41Pd_Zv4fY_Mq8EHdc7e5-jIcP6q_SkR4_ROMwV86XA1gjfTyTRwbLQytYtc";

  const contentHtml = useMemo(() => {
    const content = (data?.content ?? "").trim();
    if (!content) return "";
    if (looksLikeHtml(content)) return content;
    return `<p>${escapeHtml(content).replaceAll("\n", "<br />")}</p>`;
  }, [data?.content]);

  const hasContent = Boolean(contentHtml);

  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-indigo-950/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

          {/* Photo */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="relative">
              <div className="absolute top-3 left-3 w-full h-full border-2 border-primary dark:border-blue-500 rounded-lg" />
              <div className="relative bg-white dark:bg-slate-800/50 p-1.5 rounded-lg shadow-sm">
                <div
                  className="aspect-[4/5] w-full rounded bg-gray-200 dark:bg-slate-700 bg-cover bg-center"
                  style={{ backgroundImage: `url("${photoUrl}")` }}
                />
              </div>
            </div>
            {/* Name - mobile */}
            <div className="md:hidden mt-4 text-center">
              <p className="text-gray-800 dark:text-gray-200 text-sm">
                {data?.president_name || "Prof. Ravelomanana Jean"}
              </p>
              <p className="text-xs text-gray-500 dark:text-indigo-300 mt-0.5">
                {data?.president_title || t("president.fallback.title")}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            {/* Kicker */}
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-indigo-400 mb-2">
              {t("president.kicker")}
            </p>

            {/* Title */}
            <h2 className="text-xl md:text-2xl text-gray-800 dark:text-white mb-5">
              {t("president.title")}
            </h2>

            {/* Quote */}
            <div className="border-l-2 border-gray-300 dark:border-indigo-500/50 pl-4 mb-5">
              <p className="text-gray-600 dark:text-gray-300 italic text-sm leading-relaxed text-justify">
                "{data?.intro || t("president.fallback.quote")}"
              </p>
            </div>

            {/* Lead text */}
            <p className={`text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-justify ${fullPage ? "mb-5" : "mb-4 line-clamp-3"}`}>
              {data?.title ? data.title : t("president.fallback.lead")}
            </p>

            {/* Full content */}
            {fullPage && hasContent ? (
              <article className="prose prose-sm prose-gray dark:prose-invert max-w-none mb-6 [&_p]:text-gray-500 dark:[&_p]:text-gray-400 [&_p]:text-justify [&_p]:leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              </article>
            ) : null}

            {/* CTA */}
            {!fullPage && (
              <div className="mb-6">
                <Link
                  href="/president-message"
                  className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <span>{t("president.more")}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}

            {/* President Info - Desktop */}
            <div className="hidden md:block border-t border-gray-200 dark:border-slate-700/50 pt-5">
              <p className="text-gray-700 dark:text-gray-200 text-sm">
                {data?.president_name || "Prof. Ravelomanana Jean"}
              </p>
              <p className="text-xs text-gray-500 dark:text-indigo-300 mt-0.5">
                {data?.president_title || t("president.fallback.title")}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
