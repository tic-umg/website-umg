"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProjectHeader from "@/components/public/projects/ProjectHeader";
import ProjectTabsLayout, { type ProjectTab } from "@/components/public/projects/ProjectTabsLayout";
import { useProject } from "@/components/public/projects/useProject";

type BadgeVariant = "primary" | "amber" | "emerald";

type ProjectMetaTabType = "richText" | "gallery" | "carousel";

type ProjectMetaTab = {
  key: string;
  label: string;
  type: ProjectMetaTabType;
  content_html?: string;
  images?: Array<{ src: string; alt?: string; caption?: string | null }>;
  slides?: Array<{ src: string; alt?: string; title?: string; subtitle?: string }>;
};

type ProjectMeta = {
  hero?: { badges?: Array<{ variant: BadgeVariant; label: string }> };
  tabs?: ProjectMetaTab[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeProjectMeta(value: unknown): ProjectMeta | null {
  if (!isRecord(value)) return null;

  const hero = isRecord(value.hero) ? value.hero : null;
  const heroBadgesRaw = hero && Array.isArray(hero.badges) ? hero.badges : null;
  const heroBadges =
    heroBadgesRaw
      ?.filter(isRecord)
      .map((b) => ({
        variant:
          b.variant === "primary" || b.variant === "amber" || b.variant === "emerald"
            ? (b.variant as BadgeVariant)
            : ("primary" as const),
        label: typeof b.label === "string" ? b.label : "",
      }))
      .filter((b) => b.label.length > 0) ?? [];

  const tabsRaw = Array.isArray(value.tabs) ? value.tabs : null;
  const tabs: ProjectMetaTab[] =
    tabsRaw
      ?.filter(isRecord)
      .map((t) => {
        const key = typeof t.key === "string" ? t.key : "tab";
        const label = typeof t.label === "string" ? t.label : key;
        const type =
          t.type === "richText" || t.type === "gallery" || t.type === "carousel"
            ? (t.type as ProjectMetaTabType)
            : ("richText" as const);

        const content_html = typeof t.content_html === "string" ? t.content_html : undefined;

        const imagesRaw = Array.isArray(t.images) ? t.images : null;
        const images =
          imagesRaw
            ?.filter(isRecord)
            .map((img) => ({
              src: typeof img.src === "string" ? img.src : "",
              alt: typeof img.alt === "string" ? img.alt : undefined,
              caption: typeof img.caption === "string" ? img.caption : null,
            }))
            .filter((img) => img.src.length > 0) ?? undefined;

        const slidesRaw = Array.isArray(t.slides) ? t.slides : null;
        const slides =
          slidesRaw
            ?.filter(isRecord)
            .map((s) => ({
              src: typeof s.src === "string" ? s.src : "",
              alt: typeof s.alt === "string" ? s.alt : undefined,
              title: typeof s.title === "string" ? s.title : undefined,
              subtitle: typeof s.subtitle === "string" ? s.subtitle : undefined,
            }))
            .filter((s) => s.src.length > 0) ?? undefined;

        return { key, label, type, content_html, images, slides };
      })
      .filter((t) => t.key.length > 0 && t.label.length > 0) ?? [];

  return {
    hero: heroBadges.length ? { badges: heroBadges } : undefined,
    tabs: tabs.length ? tabs : undefined,
  };
}

function HeroBadge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    primary: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
    emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles[variant]}`}>{label}</span>;
}

export default function ProjectDynamicPage({ slug }: { slug: string }) {
  const { project, loading, error } = useProject(slug);
  const meta = useMemo(() => safeProjectMeta(project?.meta), [project?.meta]);

  const headerTitle = project?.title ?? "Projet";
  const headerDescription = project?.description ?? null;
  const headerKicker = project?.kicker ?? undefined;
  const headerImageUrl = project?.hero_image_url ?? null;

  const tabs: ProjectTab[] = useMemo(
    () => (meta?.tabs || []).map((t) => ({ key: t.key, label: t.label })),
    [meta?.tabs]
  );

  const firstTabKey = tabs[0]?.key;
  const [slideIndexByTab, setSlideIndexByTab] = useState<Record<string, number>>({});

  if (loading) {
    return (
      <main className="bg-slate-50/60 dark:bg-slate-950">
        <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
          <div className="max-w-[1280px] px-5 md:px-10 mx-auto">
            <div className="py-6 md:py-8 animate-pulse">
              <div className="h-3 w-48 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-4 h-8 w-72 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-4 space-y-2 max-w-2xl">
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="mt-6 h-16 w-48 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </section>

        <div className="max-w-[1280px] px-5 md:px-10 mx-auto py-8 md:py-12 animate-pulse">
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="h-6 w-64 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-11/12 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-10/12 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="bg-slate-50/60 dark:bg-slate-950">
        <ProjectHeader title={headerTitle} description={headerDescription} kicker={headerKicker} imageUrl={headerImageUrl} />
        <div className="max-w-[1280px] px-5 md:px-10 mx-auto py-10">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {error === "not_found" ? "Projet introuvable." : "Impossible de charger le projet pour le moment."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const heroBadges = meta?.hero?.badges || [];

  return (
    <main className="bg-slate-50/60 dark:bg-slate-950">
      <ProjectHeader
        title={headerTitle}
        description={headerDescription}
        kicker={headerKicker}
        imageUrl={headerImageUrl}
      />

      {heroBadges.length ? (
        <div className="max-w-[1280px] px-5 md:px-10 mx-auto -mt-2 pb-2">
          <div className="flex flex-wrap gap-2">
            {heroBadges.map((b) => (
              <HeroBadge key={`${b.variant}-${b.label}`} variant={b.variant} label={b.label} />
            ))}
          </div>
        </div>
      ) : null}

      {tabs.length ? (
        <ProjectTabsLayout
          tabs={tabs}
          defaultTabKey={firstTabKey}
          onTabChange={(tabKey) => setSlideIndexByTab((prev) => ({ ...prev, [tabKey]: 0 }))}
        >
          {(activeTab) => {
            const tab = (meta?.tabs || []).find((t) => t.key === activeTab);
            if (!tab) return null;

            if (tab.type === "richText") {
              return (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: tab.content_html || "" }}
                  />
                </div>
              );
            }

            if (tab.type === "gallery") {
              const images = tab.images || [];
              return (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {images.map((img) => (
                      <div
                        key={`${img.src}-${img.alt || ""}`}
                        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/20"
                      >
                        <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
                          <Image src={img.src} alt={img.alt || headerTitle} fill className="object-cover" unoptimized />
                        </div>
                        {img.caption ? (
                          <div className="p-4">
                            <p className="text-xs text-slate-600 dark:text-slate-300">{img.caption}</p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (tab.type === "carousel") {
              const slides = tab.slides || [];
              const idx = Math.min(slideIndexByTab[activeTab] ?? 0, Math.max(slides.length - 1, 0));
              const current = slides[idx];
              const canNavigate = slides.length > 1;
              const goPrev = () =>
                setSlideIndexByTab((prev) => ({ ...prev, [activeTab]: (idx - 1 + slides.length) % slides.length }));
              const goNext = () => setSlideIndexByTab((prev) => ({ ...prev, [activeTab]: (idx + 1) % slides.length }));

              return (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-800">
                    <div className="relative h-[260px]">
                      {current ? (
                        <>
                          <Image src={current.src} alt={current.alt || headerTitle} fill className="object-cover" unoptimized />
                          {(current.title || current.subtitle) ? (
                            <div className="absolute inset-x-0 bottom-0 bg-black/55 p-3 text-white">
                              {current.title ? <p className="text-sm font-bold">{current.title}</p> : null}
                              {current.subtitle ? <p className="text-xs text-white/90">{current.subtitle}</p> : null}
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3">
                      <div className="flex items-center gap-2">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSlideIndexByTab((prev) => ({ ...prev, [activeTab]: i }))}
                            aria-label={`Aller à la diapositive ${i + 1}`}
                            className={`h-2.5 w-2.5 rounded-full transition-colors ${
                              i === idx ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={goPrev}
                          disabled={!canNavigate}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Précédent
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          disabled={!canNavigate}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Suivant
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          }}
        </ProjectTabsLayout>
      ) : (
        <div className="max-w-[1280px] px-5 md:px-10 mx-auto py-10">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {headerDescription || "Contenu du projet non disponible."}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
