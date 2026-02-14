"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post } from "@/lib/types";
import NewsCard from "./NewsCard";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface NewsSectionProps {
  posts: Post[];
  maxItems?: number;
}

export default function NewsSection({ posts, maxItems = 3 }: NewsSectionProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col h-full">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("home.news.title")}
          </h2>
          <Link
            href="/actualites"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all"
          >
            {t("home.news.seeAll")}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="h-1 w-16 bg-blue-600 rounded-full"></div>
      </div>

      {/* Posts Grid */}
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.slice(0, maxItems).map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 border-dashed">
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t("home.news.empty")}</p>
        </div>
      )}
    </div>
  );
}
