import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight, Clock, Eye, Star } from 'lucide-react';
import type { Post } from '@/lib/types';

type NewsCardVariant = 'default' | 'featured' | 'compact' | 'horizontal';

interface NewsCardProps {
  post: Post;
  variant?: NewsCardVariant;
  className?: string;
  priority?: boolean;
}

export default function NewsCard({ 
  post, 
  variant = 'default', 
  className = '',
  priority = false 
}: NewsCardProps) {
  const formattedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Publication récente';

  const categoryName = post.categories?.[0]?.name || 'Communiqué';
  const isImportant = !!post.is_important;
  const isArchived = post.status === "archived";
  const readingTime = typeof post.reading_time === "number" ? post.reading_time : null;
  const views = typeof post.views_count === "number" ? post.views_count : null;

  // Fallback image
  const imageUrl = post.cover_image?.url ||
    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80';

  if (variant === 'featured') {
    return (
      <article className={`group relative overflow-hidden rounded-3xl ${className}`}>
        <div className="relative h-[400px] md:h-[500px]">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex flex-wrap gap-2">
            <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-900">
              {categoryName}
            </span>
            {isImportant ? (
              <span className="inline-flex items-center justify-center rounded-full bg-amber-500 p-1.5" title="Important">
                <Star className="w-3.5 h-3.5 fill-current text-white" />
              </span>
            ) : null}
            {isArchived ? (
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                Archivé
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 text-2xl md:text-4xl font-bold text-white tracking-tight">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-3 text-slate-200 line-clamp-2 max-w-2xl">
              {post.excerpt}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            {readingTime ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {readingTime} min
              </span>
            ) : null}
            {views !== null ? (
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {views}
              </span>
            ) : null}
          </div>
          <Link
            href={`/actualites/${post.slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Lire l'article
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className={`group flex items-start gap-4 ${className}`}>
        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="80px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {categoryName}
            </span>
            {isImportant ? (
              <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 p-1 dark:bg-amber-500/30" title="Important">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              </span>
            ) : null}
            {isArchived ? (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                Archivé
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
            <Link href={`/actualites/${post.slug}`}>
              {post.title}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formattedDate}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            {readingTime ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {readingTime} min
              </span>
            ) : null}
            {views !== null ? (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {views}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article className={`group flex flex-col md:flex-row gap-6 ${className}`}>
        <div className="relative w-full md:w-64 h-44 flex-shrink-0 rounded-2xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 256px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-600">
            {categoryName}
          </span>
          {isImportant ? (
            <span className="inline-flex items-center justify-center rounded-full bg-amber-500 p-1.5" title="Important">
              <Star className="w-3.5 h-3.5 fill-current text-white" />
            </span>
          ) : null}
          {isArchived ? (
            <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Archivé
            </span>
          ) : null}
        </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            {readingTime ? (
              <span className="inline-flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {readingTime} min
              </span>
            ) : null}
            {views !== null ? (
              <span className="inline-flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                {views}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
            <Link href={`/actualites/${post.slug}`}>
              {post.title}
            </Link>
          </h3>
          {post.excerpt && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              {post.excerpt}
            </p>
          )}
          <Link
            href={`/actualites/${post.slug}`}
            className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-blue-600"
          >
            Lire la suite
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article
      className={`
        group overflow-hidden rounded-2xl border border-slate-200/80 bg-white 
        shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
        dark:border-slate-800 dark:bg-slate-900
        ${className}
      `}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-600 backdrop-blur-sm">
            {categoryName}
          </span>
          {isImportant ? (
            <span className="inline-flex items-center justify-center rounded-full bg-amber-500 p-1.5 backdrop-blur-sm" title="Important">
              <Star className="w-3.5 h-3.5 fill-current text-white" />
            </span>
          ) : null}
          {isArchived ? (
            <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Archivé
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </span>
          {readingTime ? (
            <span className="inline-flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{readingTime} min</span>
            </span>
          ) : null}
          {views !== null ? (
            <span className="inline-flex items-center gap-2">
              <Eye className="h-3.5 w-3.5" />
              <span>{views}</span>
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900 dark:text-white line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <Link
          href={`/actualites/${post.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-blue-600"
        >
          Lire la suite
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
