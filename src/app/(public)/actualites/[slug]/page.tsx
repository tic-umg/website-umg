import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { publicGet, getSiteSettings } from '@/lib/public-api';
import type { Post, Event, SiteSettings } from '@/lib/types';
import type { Metadata } from 'next';
import Container from '@/components/Container';
import { Breadcrumb } from '@/components/layout';
import SidebarRight, { EventsWidget, NewsletterWidget } from '@/components/layout/SidebarRight';
import { ArticleGallery, ShareButtons, NewsCard, EventList } from '@/components/public';
import { markdownToHtml } from "@/lib/markdown";
import PostViewsCount from "@/components/public/posts/PostViewsCount";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mahajanga-univ.mg";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const NEWS_FETCH_OPTIONS = { cache: "no-store" as const };
const HERO_IMAGE_CLASS = "object-cover object-[50%_25%]";

function looksLikeMarkdown(value: string) {
  if (!value) return false;
  if (value.includes("<")) return false;
  return /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|>\s)/.test(value) || /\*\*.+\*\*/.test(value);
}

function toAbsoluteUrl(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url, BASE_URL).toString();
  } catch {
    return null;
  }
}

function extractFirstImageUrl(post: Post) {
  const html = post.content_html || "";
  const markdown = post.content_markdown || "";
  const htmlMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1];
  const mdMatch = markdown.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (mdMatch?.[1]) return mdMatch[1];
  return post.gallery?.map((m) => m.url).find(Boolean) || null;
}

// Fetch single post
async function fetchPost(slug: string) {
  try {
    const res = await publicGet<{ data: Post }>(`/posts/${slug}`, NEWS_FETCH_OPTIONS);
    return res.data;
  } catch {
    return null;
  }
}

// Fetch related posts
async function fetchRelatedPosts(post: Post) {
  try {
    const categorySlug = post.categories?.[0]?.slug;
    const tagSlugs = (post.tags || []).map((t) => t.slug).filter(Boolean);

    const queryParts: string[] = [`per_page=12`, `exclude=${post.id}`];
    if (categorySlug) queryParts.push(`category=${categorySlug}`);

    const res = await publicGet<{ data: Post[] }>(`/posts?${queryParts.join("&")}`, NEWS_FETCH_OPTIONS);
    const candidates = (res.data || []).filter((p) => p.id !== post.id);

    const uniqueById = new Map<number, Post>();
    for (const p of candidates) uniqueById.set(p.id, p);
    const unique = Array.from(uniqueById.values());

    if (!tagSlugs.length) return unique.slice(0, 3);

    const score = (p: Post) =>
      (p.tags || []).reduce((acc, t) => acc + (tagSlugs.includes(t.slug) ? 1 : 0), 0);

    return unique
      .map((p) => ({ p, s: score(p) }))
      .sort((a, b) => b.s - a.s)
      .map(({ p }) => p)
      .slice(0, 3);
  } catch {
    return [];
  }
}

// Fetch events for sidebar
async function fetchEvents() {
  try {
    const res = await publicGet<{ data: Event[] }>('/events?upcoming=true&per_page=3', 300);
    return res.data || [];
  } catch {
    return [];
  }
}

const heroImage =
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80';

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  const post = await fetchPost(slug);

  if (!post) {
    notFound();
  }

  const [relatedPosts, events, settings] = await Promise.all([
    fetchRelatedPosts(post),
    fetchEvents(),
    getSiteSettings().catch(() => null) as Promise<SiteSettings | null>,
  ]);

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Publication récente';

  const coverImageUrl = post.cover_image?.url || heroImage;
  const excerpt = post.excerpt?.trim() || null;

  const markdown = post.content_markdown?.trim() || "";
  const contentHtml = markdown
    ? markdownToHtml(markdown)
    : post.content_html
      ? looksLikeMarkdown(post.content_html)
        ? markdownToHtml(post.content_html)
        : post.content_html
      : "";

  const breadcrumbItems = [
    { name: "Accueil", url: "/" },
    { name: post.status === "archived" ? "Archives" : "Actualités", url: post.status === "archived" ? "/actualites/archives" : "/actualites" },
    { name: post.title, url: `/actualites/${slug}` },
  ];

  return (
    <main className="bg-white dark:bg-slate-950">
      <ArticleJsonLd post={post} settings={settings} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {post.status === "archived" ? (
        <div className="bg-amber-50 text-amber-900 border-b border-amber-200 dark:bg-amber-900/20 dark:text-amber-100 dark:border-amber-800/50">
          <Container>
            <div className="py-3 text-sm">
              <span className="font-semibold">Archive :</span> cet article est archivé, mais reste consultable.
            </div>
          </Container>
        </div>
      ) : null}

      {/* Hero Section */}
      <section className="relative h-[52vh] min-h-[360px] md:h-[60vh] md:min-h-[420px] overflow-hidden">
        <Image
          src={coverImageUrl}
          alt={post.title}
          fill
          priority
          className={HERO_IMAGE_CLASS}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950/90" />
        
        <Container className="h-full">
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {post.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-900"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
            
            <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight md:text-5xl">
              {post.title}
            </h1>

            {excerpt ? (
              <p className="mt-4 max-w-3xl text-sm md:text-base text-white/80 line-clamp-3">
                {excerpt}
              </p>
            ) : null}
            
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              {post.reading_time && (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.reading_time} min de lecture
                </span>
              )}
              <PostViewsCount slug={slug} initialViews={post.views_count ?? 0} />
            </div>
          </div>
        </Container>
      </section>

      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Container>
          <div className="py-3">
            <Breadcrumb
              items={[
                post.status === "archived"
                  ? { label: 'Archives', href: '/actualites/archives' }
                  : { label: 'Actualités', href: '/actualites' },
                { label: post.title },
              ]}
            />
          </div>
        </Container>
      </div>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            {/* Main Content */}
            <div className="space-y-10">
              {/* Article Content */}
              <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl">
                {contentHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                ) : (
                  <p className="text-slate-600 dark:text-slate-300">
                    Contenu de l&apos;article non disponible.
                  </p>
                )}
	              </article>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/actualites?tags=${tag.slug}`}
                        className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {post.gallery && post.gallery.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Galerie
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Temps forts et moments clés de cette actualité.
                  </p>
                  <div className="mt-6">
                    <ArticleGallery images={post.gallery.map((m) => m.url).filter(Boolean)} />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <SidebarRight sticky>
              {/* Share */}
	              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
	                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
	                  Partager l&apos;article
	                </h3>
	                <ShareButtons />
	              </div>

              {/* Upcoming Events */}
              {events.length > 0 && (
                <EventsWidget>
                  <EventList events={events} maxItems={3} />
                </EventsWidget>
              )}

              {/* Newsletter */}
              <NewsletterWidget />
            </SidebarRight>
          </div>
        </Container>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="bg-slate-50 dark:bg-slate-900 py-16">
          <Container>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  À lire aussi
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Articles similaires
                </h2>
              </div>
              <Link
                href="/actualites"
                className="text-sm font-semibold text-indigo-600 hover:text-blue-600 flex items-center gap-1"
              >
                Voir toutes les actualités
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <NewsCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    fetchPost(slug),
    getSiteSettings().catch(() => null),
  ]);

  if (!post) {
    return {
      title: 'Article non trouvé',
      robots: { index: false, follow: false },
    };
  }

  const siteName = settings?.site_name || "Université de Mahajanga";
  const articleUrl = `${BASE_URL}/actualites/${slug}`;
  const description = post.excerpt || `Découvrez : ${post.title}`;
  const rawImageUrl =
    post.cover_image?.url ||
    extractFirstImageUrl(post) ||
    settings?.logo_url ||
    `${BASE_URL}/icons/icon.svg`;
  const imageUrl = toAbsoluteUrl(rawImageUrl) || `${BASE_URL}/icons/icon.svg`;
  const keywords = [
    ...(post.categories?.map(c => c.name) || []),
    ...(post.tags?.map(t => t.name) || []),
    "actualités",
    "université",
    "mahajanga",
  ];

  return {
    title: post.title,
    description,
    keywords,
    authors: [{ name: siteName }],
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      type: "article",
      locale: "fr_MG",
      url: articleUrl,
      siteName,
      title: post.title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.published_at || undefined,
      authors: [siteName],
      section: post.categories?.[0]?.name || "Actualités",
      tags: post.tags?.map(t => t.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [imageUrl],
    },
    robots: post.status === "archived"
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}
