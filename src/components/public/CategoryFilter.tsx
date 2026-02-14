'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Category, Tag } from '@/lib/types';
import { useI18n } from "@/components/i18n/LanguageProvider";

interface CategoryFilterProps {
  categories: Category[];
  activeSlug?: string;
  baseUrl?: string;
  className?: string;
}

export function CategoryFilter({ 
  categories, 
  activeSlug,
  baseUrl = '/actualites',
  className = '' 
}: CategoryFilterProps) {
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
      <div className="flex flex-wrap gap-2">
        <Link
          href={getUrl()}
          className={`
            rounded-lg px-3 py-2 text-sm font-medium transition-colors
            ${!activeSlug 
              ? 'bg-indigo-600 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }
          `}
        >
          {t("filters.all")}
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={getUrl(category.slug)}
            className={`
              rounded-lg px-3 py-2 text-sm font-medium transition-colors
              ${activeSlug === category.slug 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }
            `}
          >
            {category.name}
            {category.posts_count !== undefined && (
              <span className="ml-1 text-xs opacity-70">({category.posts_count})</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

interface TagFilterProps {
  tags: Tag[];
  activeSlugs?: string[];
  baseUrl?: string;
  className?: string;
}

export function TagFilter({ 
  tags, 
  activeSlugs = [],
  baseUrl = '/actualites',
  className = '' 
}: TagFilterProps) {
  const searchParams = useSearchParams();
  
  const getUrl = (tagSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTags = params.get('tags')?.split(',').filter(Boolean) || [];
    
    if (currentTags.includes(tagSlug)) {
      // Remove tag
      const newTags = currentTags.filter(t => t !== tagSlug);
      if (newTags.length > 0) {
        params.set('tags', newTags.join(','));
      } else {
        params.delete('tags');
      }
    } else {
      // Add tag
      currentTags.push(tagSlug);
      params.set('tags', currentTags.join(','));
    }
    params.delete('page');
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={getUrl(tag.slug)}
            className={`
              rounded-full px-3 py-1.5 text-xs font-medium transition-colors border
              ${activeSlugs.includes(tag.slug)
                ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }
            `}
          >
            #{tag.name}
            {tag.posts_count !== undefined && (
              <span className="ml-1 opacity-70">({tag.posts_count})</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
