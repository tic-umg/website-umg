import Container from "@/components/Container";
import { publicGet, getSiteSettings } from "@/lib/public-api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { EtablissementTabs } from "@/components/public";
import { EtablissementJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import type { SiteSettings } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mahajanga-univ.mg";

type Etablissement = {
  id: number;
  name: string;
  slug: string;
  acronym: string | null;
  description: string | null;
  director_name: string | null;
  director_title: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  logo: { url: string } | null;
  cover_image: { url: string } | null;
  is_doctoral: boolean;
  formations: { title: string; level?: string | null; description?: string | null }[];
  parcours: { title: string; mode?: string | null; description?: string | null }[];
  doctoral_teams: { name: string; focus?: string | null }[];
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [res, settings] = await Promise.all([
      publicGet<{ data: Etablissement }>(`/etablissements/${slug}`, 60),
      getSiteSettings().catch(() => null),
    ]);
    const etab = res.data;
    const siteName = settings?.site_name || "Université de Mahajanga";
    const description = etab.description?.replace(/<[^>]*>/g, "").slice(0, 160) || `${etab.name} - Faculté de l'Université de Mahajanga`;
    const pageUrl = `${BASE_URL}/etablissements/${slug}`;
    const imageUrl = etab.cover_image?.url || etab.logo?.url || settings?.logo_url;

    return {
      title: etab.name,
      description,
      keywords: [etab.name, etab.acronym, "faculté", "école", "université", "mahajanga", "formation", "enseignement supérieur"].filter(Boolean) as string[],
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        type: "website",
        locale: "fr_MG",
        url: pageUrl,
        siteName,
        title: `${etab.name}${etab.acronym ? ` (${etab.acronym})` : ""}`,
        description,
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: etab.name }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: etab.name,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  } catch {
    return {
      title: "Établissement",
      robots: { index: false, follow: true },
    };
  }
}

export default async function EtablissementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let etab: Etablissement;
  let settings: SiteSettings | null = null;
  let otherEtablissements: Etablissement[] = [];
  try {
    const [res, settingsRes, allRes] = await Promise.all([
      publicGet<{ data: Etablissement }>(`/etablissements/${slug}`, 60),
      getSiteSettings().catch(() => null),
      publicGet<{ data: Etablissement[] }>("/etablissements", 60).catch(() => ({ data: [] })),
    ]);
    etab = res.data;
    settings = settingsRes;
    // Filter by same type (doctoral or not) and exclude current
    otherEtablissements = allRes.data
      .filter((e) => e.slug !== slug && e.is_doctoral === res.data.is_doctoral)
      .slice(0, 4);
  } catch {
    notFound();
  }

  const mapQuery = encodeURIComponent(etab.address || "Université de Mahajanga");

  // Format data for tabs
  const formationsData = (etab.formations || []).map((item) => ({
    title: item.title,
    subtitle: [item.level, item.description].filter(Boolean).join(" • ") || undefined,
  }));

  const parcoursData = (etab.parcours || []).map((item) => ({
    title: item.title,
    subtitle: [item.mode, item.description].filter(Boolean).join(" • ") || undefined,
  }));

  const doctoralTeamsData = (etab.doctoral_teams || []).map((team) => ({
    title: team.name,
    subtitle: team.focus || undefined,
  }));

  const breadcrumbItems = [
    { name: "Accueil", url: "/" },
    { name: "Établissements", url: "/etablissements" },
    { name: etab.name, url: `/etablissements/${slug}` },
  ];

  // Convert to Etablissement type for JSON-LD
  const etablissementForJsonLd = {
    id: etab.id,
    name: etab.name,
    slug: etab.slug,
    short_name: etab.acronym,
    description: etab.description,
    logo_url: etab.logo?.url,
    address: etab.address,
    phone: etab.phone,
    email: etab.email,
    website: etab.website,
  };

  return (
    <main className="bg-white dark:bg-slate-950">
      <EtablissementJsonLd etablissement={etablissementForJsonLd} settings={settings} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <section className="relative min-h-[200px] md:min-h-[240px] overflow-hidden bg-gray-200 dark:bg-slate-800">
        <Container className="relative z-10 flex h-full min-h-[200px] md:min-h-[240px] flex-col justify-end pb-8">
          <Link
            href="/etablissements"
            className="absolute left-4 top-6 inline-flex items-center gap-2 rounded-full bg-slate-900/10 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-900/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            {etab.logo && (
              <div className="h-24 w-24 shrink-0 rounded-2xl border-2 border-slate-300 bg-white p-2 shadow-xl dark:border-slate-600 md:h-28 md:w-28">
                <img src={etab.logo.url} alt={etab.name} className="h-full w-full object-contain" />
              </div>
            )}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl lg:text-5xl">
                {etab.name}
                {etab.acronym && (
                  <span className="ml-3 inline-block rounded-lg bg-emerald-600/20 px-3 py-1 text-lg font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 md:text-xl">
                    {etab.acronym}
                  </span>
                )}
              </h1>
              {etab.director_name && (
                <p className="text-base text-slate-600 dark:text-slate-300 md:text-lg">
                  <span className="text-slate-500 dark:text-slate-400">{etab.director_title}:</span>{" "}
                  <span className="font-medium text-slate-800 dark:text-white">{etab.director_name}</span>
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-8">
              <EtablissementTabs
                presentation={etab.description}
                formations={formationsData}
                parcours={parcoursData}
                doctoralTeams={doctoralTeamsData}
                isDoctoral={etab.is_doctoral}
                contacts={{
                  address: etab.address,
                  phone: etab.phone,
                  email: etab.email,
                  website: etab.website,
                }}
              />
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Localisation</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Retrouvez l'établissement sur la carte.
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700">
                  <iframe
                    title={`Carte ${etab.name}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=46.30%2C-15.76%2C46.40%2C-15.70&layer=mapnik&marker=-15.74%2C46.33&query=${mapQuery}`}
                    className="h-64 w-full"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  {etab.address || "Mahajanga, Madagascar"}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
                <h3 className="text-lg font-semibold">Contact direct</h3>
                <p className="mt-2 text-sm text-emerald-100">
                  Notre équipe vous répond pour toute question sur les formations et admissions.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 block w-full rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/20"
                >
                  Prendre rendez-vous
                </Link>
              </div>

              {otherEtablissements.length > 0 && (
                <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {etab.is_doctoral ? "Autres écoles doctorales" : "Voir aussi"}
                  </h3>
                  <div className="mt-4 space-y-3">
                    {otherEtablissements.map((other) => (
                      <Link
                        key={other.id}
                        href={`/etablissements/${other.slug}`}
                        className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-700 dark:hover:bg-slate-700"
                      >
                        {other.logo ? (
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-white p-1.5 dark:bg-slate-600">
                            <img src={other.logo.url} alt={other.name} className="h-full w-full object-contain" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {other.acronym?.[0] || other.name[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                            {other.acronym || other.name}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
