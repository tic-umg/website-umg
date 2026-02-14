import { Suspense } from 'react';
import { publicGet, getSiteSettings } from '@/lib/public-api';
import type { Post, Category, Tag, Event, Announcement, PaginatedResponse } from '@/lib/types';
import type { Metadata } from 'next';
import Container from '@/components/Container';
import PageLayout from '@/components/layout/PageLayout';
import { SidebarWidget } from '@/components/layout/SidebarLeft';
import SidebarRight, { EventsWidget, AnnouncementWidget, NewsletterWidget } from '@/components/layout/SidebarRight';
import { NewsCard, EventList, AnnouncementList } from '@/components/public';
import Pagination from '@/components/ui/Pagination';
import SearchBox from '@/components/ui/SearchBox';
import { CategoryFilter, TagFilter } from '@/components/public/CategoryFilter';
import Link from 'next/link';
import ArchiveMonthSelect, { type ArchiveMonth } from '@/components/public/ArchiveMonthSelect';
import { getServerI18n } from '@/i18n/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mahajanga-univ.mg";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const siteName = settings?.site_name || "Université de Mahajanga";
  const pageUrl = `${BASE_URL}/actualites`;

  return {
    title: "Actualités",
    description: "Retrouvez toutes les actualités, événements et annonces de l'Université de Mahajanga. Restez informé des dernières nouvelles de notre établissement.",
    keywords: ["actualités", "news", "événements", "université", "mahajanga", "madagascar", "enseignement supérieur"],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "website",
      locale: "fr_MG",
      url: pageUrl,
      siteName,
      title: `Actualités | ${siteName}`,
      description: "Retrouvez toutes les actualités et événements de l'Université de Mahajanga",
    },
    twitter: {
      card: "summary",
      title: `Actualités | ${siteName}`,
      description: "Retrouvez toutes les actualités et événements de l'Université de Mahajanga",
    },
  };
}

const NEWS_FETCH_OPTIONS = { cache: "no-store" as const };

interface NewsPageSearchParams {
  page?: string;
  category?: string;
  tags?: string;
  q?: string;
}

interface NewsPageProps {
  searchParams: Promise<NewsPageSearchParams>;
}

// Fetch posts with filters
async function fetchPosts(params: NewsPageSearchParams) {
  const page = params.page || '1';
  const queryParts: string[] = [`per_page=10`, `page=${page}`, `status=published`];
  
  if (params.category) {
    queryParts.push(`category=${params.category}`);
  }
  if (params.tags) {
    queryParts.push(`tags=${params.tags}`);
  }
  if (params.q) {
    queryParts.push(`q=${encodeURIComponent(params.q)}`);
  }
  
  return publicGet<PaginatedResponse<Post>>(`/posts?${queryParts.join('&')}`, NEWS_FETCH_OPTIONS);
}

async function fetchArchiveMonths() {
  return publicGet<{ data: ArchiveMonth[] }>(`/posts/archive-months?status=archived`, NEWS_FETCH_OPTIONS).catch(() => ({ data: [] }));
}

// Fetch categories for sidebar
async function fetchCategories() {
  return publicGet<{ data: Category[] }>('/categories?with_count=true', NEWS_FETCH_OPTIONS).catch(() => ({ data: [] }));
}

// Fetch tags for sidebar
async function fetchTags() {
  return publicGet<{ data: Tag[] }>('/tags?with_count=true', NEWS_FETCH_OPTIONS).catch(() => ({ data: [] }));
}

// Fetch events for sidebar
async function fetchEvents() {
  return publicGet<{ data: Event[] }>('/events?upcoming=true&per_page=4', 300).catch(() => ({ data: [] }));
}

// Fetch announcements for sidebar
async function fetchAnnouncements() {
  return publicGet<{ data: Announcement[] }>('/announcements?active=true&per_page=4', 300).catch(() => ({ data: [] }));
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { t } = await getServerI18n();
  const params = await searchParams;
  
  // Parallel data fetching
  const [postsRes, categoriesRes, tagsRes, eventsRes, announcementsRes, archiveMonthsRes] = await Promise.all([
    fetchPosts(params).catch(() => ({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    })),
    fetchCategories(),
    fetchTags(),
    fetchEvents(),
    fetchAnnouncements(),
    fetchArchiveMonths(),
  ]);

  const posts = postsRes.data || [];
  const meta = postsRes.meta || { current_page: 1, last_page: 1, per_page: 9, total: 0 };
  const categories = categoriesRes.data || [];
  const tags = tagsRes.data || [];
  const events = eventsRes.data || [];
  const announcements = announcementsRes.data || [];
  const archiveMonths = archiveMonthsRes.data || [];

  const activeTags = params.tags?.split(',').filter(Boolean) || [];

  return (
    <main className="bg-slate-50/60 dark:bg-slate-950">
      {/* Page Header */}
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-6 md:py-8">
            <div className="flex items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
              {t("news.page.kicker")}
            </p>
              <Link
                href="/actualites/archives"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {t("news.archives.link")}
              </Link>
            </div>
            <h1 className="mt-3 text-xl md:text-3xl font-bold tracking-tight">
              {t("news.page.title")}
            </h1>
            <p className="mt-3 max-w-xl text-base text-slate-600 dark:text-slate-300">
              {t("news.page.subtitle")}
            </p>
          </div>
        </Container>
      </section>

      {/* Breadcrumb removed */}

      {/* Main Content */}
      <PageLayout
        variant="with-right"
        containerClassName="max-w-[1280px] px-5 md:px-10"
        sidebarRight={
          <SidebarRight sticky>
            {/* Search */}
            <SidebarWidget title={t("news.sidebar.search")}>
              <Suspense fallback={<div className="h-12 animate-pulse bg-slate-100 rounded" />}>
                <SearchBox 
                  placeholder={t("news.sidebar.searchPlaceholder")}
                  paramName="q"
                />
              </Suspense>
            </SidebarWidget>

            {/* Categories Widget */}
            <SidebarWidget title={t("news.sidebar.categories")}>
              <Suspense fallback={<div className="h-20 animate-pulse bg-slate-100 rounded" />}>
                <CategoryFilter 
                  categories={categories} 
                  activeSlug={params.category}
                />
              </Suspense>
            </SidebarWidget>

            {/* Archives */}
            {archiveMonths.length > 0 && (
              <SidebarWidget title={t("news.sidebar.archives")}>
                <ArchiveMonthSelect options={archiveMonths} baseUrl="/actualites/archives" label={t("news.sidebar.archivesByMonth")} />
              </SidebarWidget>
            )}

            {/* Tags Widget */}
            {tags.length > 0 && (
              <SidebarWidget title={t("news.sidebar.tagsPopular")}>
                <Suspense fallback={<div className="h-16 animate-pulse bg-slate-100 rounded" />}>
                  <TagFilter 
                    tags={tags} 
                    activeSlugs={activeTags}
                  />
                </Suspense>
              </SidebarWidget>
            )}

            {/* Announcements */}
            {announcements.length > 0 && (
              <AnnouncementWidget title="" variant="highlight">
                <AnnouncementList announcements={announcements} maxItems={3} />
              </AnnouncementWidget>
            )}

            {/* Upcoming Events */}
            {events.length > 0 && (
              <EventsWidget title="">
                <EventList events={events} maxItems={4} />
              </EventsWidget>
            )}

            {/* Newsletter Signup */}
            <NewsletterWidget />
          </SidebarRight>
        }
      >
        {/* Posts Grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              {posts.map((post, index) => (
                <NewsCard 
                  key={post.id} 
                  post={post} 
                  priority={index < 2}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <Pagination
                  currentPage={meta.current_page}
                  totalPages={meta.last_page}
                  baseUrl="/actualites"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("news.empty.title")}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("news.empty.subtitle")}
            </p>
          </div>
        )}
      </PageLayout>
    </main>
  );
}
