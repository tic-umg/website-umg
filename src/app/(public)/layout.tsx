import { Nunito } from "next/font/google";
import { getSiteSettings } from "@/lib/public-api";
import PublicHeader from "@/components/public/PublicHeader";
import ScrollToTop from "@/components/public/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";
import WelcomePopup from "@/components/public/WelcomePopup";
import PublicProviders from "@/components/public/PublicProviders";
import type { Metadata } from "next";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mahajanga-univ.mg";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const siteName = settings?.site_name || "Université de Mahajanga";
  const siteDescription = settings?.site_description || "Site officiel de l'Université de Mahajanga - Enseignement supérieur, recherche et formation à Madagascar";
  const siteKeywords = settings?.site_keywords || "université, mahajanga, madagascar, enseignement supérieur, formation, recherche, faculté, école";
  const logoUrl = settings?.logo_url || `${BASE_URL}/icons/icon.svg`;

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: siteKeywords.split(",").map((k: string) => k.trim()),
    authors: [{ name: siteName, url: BASE_URL }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: "/",
      languages: {
        "fr-MG": "/",
        "en": "/en",
      },
    },
    icons: {
      icon: settings?.favicon_url || "/favicon.ico",
      apple: settings?.favicon_url || "/icons/icon.svg",
    },
    openGraph: {
      type: "website",
      locale: "fr_MG",
      alternateLocale: ["en_US"],
      url: BASE_URL,
      siteName: siteName,
      title: siteName,
      description: siteDescription,
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: [logoUrl],
      creator: settings?.social?.twitter || "@UnivMahajanga",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
    category: "education",
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings().catch(() => null);

  return (
    <>
      <OrganizationJsonLd settings={settings} />
      <WebSiteJsonLd settings={settings} />
      <div className={`min-h-screen flex flex-col ${nunito.className} bg-[#f6f6f8] dark:bg-[#101622] text-[#111318] dark:text-white transition-colors duration-300`}>
        {/* Material Symbols */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
        {/* Nunito Font Fallback */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap" 
          rel="stylesheet" 
        />
        <style>{`
            .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
            }
        `}</style>
        <PublicProviders>
          <PublicHeader settings={settings} />
          <main className="flex-1 w-full flex flex-col">
            {children}
          </main>
          <ScrollToTop />
          <SiteFooter settings={settings} />
          <WelcomePopup />
        </PublicProviders>
      </div>
    </>
  );
}
