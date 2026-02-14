import { Suspense } from "react";
import { getSiteSettings } from "@/lib/public-api";
import type { Post, PresidentMessage as PresidentMessageType, Document } from "@/lib/types";
import type { Slide } from "@/components/public/HeroSection";

import HeroSection from "@/components/public/HeroSection";
import StatsSection from "@/components/public/StatsSection";
import AboutSection from "@/components/public/AboutSection";
import PresidentMessage from "@/components/public/PresidentMessage";
import NewsSection from "@/components/public/NewsSection";
import DocumentsSection from "@/components/public/DocumentsSection";
import PartnersSection from "@/components/public/PartnersSection";
import NewsletterSection from "@/components/public/NewsletterSection";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function HeroBlock() {
  const slidesData = await fetchData<{ data: Slide[] }>("/slides");
  const slides = slidesData?.data || [];
  return <HeroSection slides={slides} />;
}

async function StatsBlock() {
  const statsData = await fetchData<any>("/stats");
  const stats = statsData || { students: 12000, staff: 450, teachers: 500, establishments: 6 };
  const mappedStats = {
    students: stats.students || 12000,
    teachers: stats.teachers || 500,
    staff: stats.staff || 200,
    establishments: stats.establishments || 6,
  };
  return <StatsSection stats={mappedStats} />;
}

async function AboutBlock() {
  const settings = await getSiteSettings().catch(() => null);
  return (
    <AboutSection
      videoUrl={settings?.about_video_url}
      videoPosterUrl={settings?.about_video_poster_url}
    />
  );
}

async function PresidentBlock() {
  const presidentData = await fetchData<{ data: PresidentMessageType }>("/president-message");
  return <PresidentMessage data={presidentData?.data || null} />;
}

async function NewsDocumentsBlock() {
  const [postsData, documentsData] = await Promise.all([
    fetchData<{ data: Post[] }>("/posts?per_page=7"),
    fetchData<{ data: Document[] }>("/documents?per_page=6"),
  ]);
  const posts = postsData?.data || [];
  const documents = documentsData?.data || [];

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-[#101622] transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <NewsSection posts={posts} />
          </div>
          <div className="lg:col-span-3">
            <DocumentsSection documents={documents} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative bg-slate-900 overflow-hidden pb-16 pt-8 lg:pt-16 lg:pb-20">
      <div className="absolute top-0 right-0 h-[28rem] w-[28rem] sm:h-[42rem] sm:w-[42rem] lg:h-[50rem] lg:w-[50rem] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 flex flex-col gap-6">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-10 w-3/4" />
            <SkeletonText lines={3} className="max-w-lg" />
            <Skeleton className="h-12 w-40 rounded-lg" />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 pt-4 border-t border-white/10">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <Skeleton className="order-1 lg:order-2 aspect-[4/3] lg:aspect-[16/11] rounded-2xl" />
        </div>
      </div>
    </section>
  );
}

function StatsSkeleton() {
  return (
    <section className="relative z-20 -mt-10 pb-4">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3"
            >
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSkeleton() {
  return (
    <section className="py-16 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2 space-y-6">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-8 w-3/4" />
            <SkeletonText lines={3} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-52 rounded-lg" />
          </div>
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -right-4 -bottom-4 w-2/3 h-2/3 bg-slate-100 dark:bg-slate-800 rounded-2xl -z-10" />
            <Skeleton className="aspect-video rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PresidentSkeleton() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-[#0B1120]/50 border-y border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="absolute top-4 left-4 w-full h-full border-2 border-primary dark:border-blue-500 rounded-2xl" />
              <div className="relative bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl">
                <Skeleton className="aspect-[4/5] w-full rounded-xl" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-7/12 space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-px w-8" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-48" />
            <SkeletonText lines={3} />
            <SkeletonText lines={2} />
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsDocumentsSkeleton() {
  return (
    <section className="py-12 md:py-16 bg-white dark:bg-[#101622] transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-3 h-1 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="mt-4 h-5 w-3/4" />
                  <SkeletonText lines={2} className="mt-3" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 space-y-4">
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-3 h-1 w-16 rounded-full" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnersSkeleton() {
  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="hidden sm:flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSkeleton() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-[#101622]">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-blue-600 to-blue-700">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="mt-4 h-8 w-3/4" />
            <SkeletonText lines={2} className="mt-4" />
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-slate-900 to-slate-800">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="mt-4 h-8 w-2/3" />
            <SkeletonText lines={2} className="mt-4" />
            <div className="mt-6 flex gap-3">
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  return (
    <div className="bg-slate-50 dark:bg-[#101622] min-h-screen">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroBlock />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsBlock />
      </Suspense>

      <Suspense fallback={<AboutSkeleton />}>
        <AboutBlock />
      </Suspense>

      <Suspense fallback={<PresidentSkeleton />}>
        <PresidentBlock />
      </Suspense>

      <Suspense fallback={<NewsDocumentsSkeleton />}>
        <NewsDocumentsBlock />
      </Suspense>

      <Suspense fallback={<PartnersSkeleton />}>
        <PartnersSection />
      </Suspense>

      <Suspense fallback={<NewsletterSkeleton />}>
        <NewsletterSection />
      </Suspense>
    </div>
  );
}
