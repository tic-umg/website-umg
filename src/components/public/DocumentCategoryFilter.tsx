'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { DocumentCategory } from '@/lib/types';
import { useI18n } from "@/components/i18n/LanguageProvider";

interface DocumentCategoryFilterProps {
  categories: DocumentCategory[];
  activeSlug?: string;
  baseUrl?: string;
  className?: string;
}

export function DocumentCategoryFilter({ 
  categories, 
  activeSlug,
  baseUrl = '/documents',
  className = '' 
}: DocumentCategoryFilterProps) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  
  const getUrl = (categorySlug?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    params.delete('page'); // Reset pagination
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  return (
    <div className={className}>
      <div className="space-y-1">
        <Link
          href={getUrl()}
          className={`
            flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
            ${!activeSlug 
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            }
          `}
        >
          <span>{t("documents.categories.all")}</span>
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={getUrl(category.slug)}
            className={`
              flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
              ${activeSlug === category.slug 
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }
            `}
          >
            <span>{category.name}</span>
            {category.documents_count !== undefined && (
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {category.documents_count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
