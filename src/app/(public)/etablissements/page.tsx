import { publicGet, getSiteSettings } from "@/lib/public-api";
import type { Metadata } from "next";
import EtablissementsPageClient from "./EtablissementsPageClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mahajanga-univ.mg";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const siteName = settings?.site_name || "Université de Mahajanga";
  const pageUrl = `${BASE_URL}/etablissements`;

  return {
    title: "Établissements",
    description: "Découvrez les facultés, écoles et instituts de l'Université de Mahajanga. Formations universitaires, recherche et vie étudiante à Madagascar.",
    keywords: ["établissements", "facultés", "écoles", "instituts", "formation", "université", "mahajanga", "madagascar"],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "website",
      locale: "fr_MG",
      url: pageUrl,
      siteName,
      title: `Établissements | ${siteName}`,
      description: "Les facultés, écoles et instituts de l'Université de Mahajanga",
    },
    twitter: {
      card: "summary",
      title: `Établissements | ${siteName}`,
      description: "Les facultés, écoles et instituts de l'Université de Mahajanga",
    },
  };
}

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
  logo: { url: string } | null;
  cover_image: { url: string } | null;
  is_doctoral: boolean;
};

export default async function EtablissementsPage() {
  let etablissements: Etablissement[] = [];
  try {
    const res = await publicGet<{ data: Etablissement[] }>("/etablissements?per_page=50", 300);
    etablissements = (res.data || []).filter((etablissement) => !etablissement.is_doctoral);
  } catch {
    // No etablissements yet
  }

  return <EtablissementsPageClient etablissements={etablissements} />;
}
