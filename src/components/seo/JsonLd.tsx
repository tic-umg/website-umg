import type { SiteSettings, Post, Etablissement, Document } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mahajanga-univ.mg";

interface JsonLdProps {
  type: "Organization" | "WebSite" | "Article" | "BreadcrumbList" | "EducationalOrganization";
  data?: Record<string, unknown>;
}

export function JsonLd({ type, data }: JsonLdProps) {
  const jsonLd = { "@context": "https://schema.org", "@type": type, ...data };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Organization Schema for University
export function OrganizationJsonLd({ settings }: { settings: SiteSettings | null }) {
  const siteName = settings?.site_name || "Université de Mahajanga";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${BASE_URL}/#organization`,
    name: siteName,
    alternateName: "UMG",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: settings?.logo_url || `${BASE_URL}/icons/icon.svg`,
    },
    description: settings?.site_description || "Université de Mahajanga - Enseignement supérieur à Madagascar",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.site_address || "Mahajanga",
      addressLocality: "Mahajanga",
      addressRegion: "Boeny",
      addressCountry: "MG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings?.site_phone || "",
      email: settings?.site_email || "",
      contactType: "customer service",
      availableLanguage: ["French", "Malagasy"],
    },
    sameAs: [
      settings?.social?.facebook,
      settings?.social?.twitter,
      settings?.social?.linkedin,
      settings?.social?.youtube,
      settings?.social?.instagram,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// WebSite Schema with Search
export function WebSiteJsonLd({ settings }: { settings: SiteSettings | null }) {
  const siteName = settings?.site_name || "Université de Mahajanga";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: siteName,
    description: settings?.site_description,
    publisher: {
      "@id": `${BASE_URL}/#organization`,
    },
    inLanguage: ["fr-MG", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/actualites?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Article Schema for News/Blog posts
export function ArticleJsonLd({ post, settings }: { post: Post; settings: SiteSettings | null }) {
  const siteName = settings?.site_name || "Université de Mahajanga";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${BASE_URL}/actualites/${post.slug}/#article`,
    headline: post.title,
    description: post.excerpt || `Article: ${post.title}`,
    image: post.cover_image?.url || settings?.logo_url,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: siteName,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: settings?.logo_url || `${BASE_URL}/icons/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/actualites/${post.slug}`,
    },
    articleSection: post.categories?.map((c) => c.name).join(", ") || "Actualités",
    keywords: post.tags?.map((t) => t.name).join(", "),
    wordCount: post.content_html?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0,
    inLanguage: "fr-MG",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Breadcrumb Schema
export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// EducationalOrganization Schema for Etablissements (Faculties)
export function EtablissementJsonLd({
  etablissement,
  settings
}: {
  etablissement: Etablissement;
  settings: SiteSettings | null
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "@id": `${BASE_URL}/etablissements/${etablissement.slug}/#etablissement`,
    name: etablissement.name,
    alternateName: etablissement.short_name,
    description: etablissement.description?.replace(/<[^>]*>/g, "").slice(0, 300),
    url: `${BASE_URL}/etablissements/${etablissement.slug}`,
    logo: etablissement.logo_url,
    address: etablissement.address ? {
      "@type": "PostalAddress",
      streetAddress: etablissement.address,
      addressCountry: "MG",
    } : undefined,
    telephone: etablissement.phone,
    email: etablissement.email,
    parentOrganization: {
      "@type": "EducationalOrganization",
      "@id": `${BASE_URL}/#organization`,
      name: settings?.site_name || "Université de Mahajanga",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Document/Publication Schema
export function DocumentJsonLd({ document }: { document: Document }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    "@id": `${BASE_URL}/documents/${document.slug}/#document`,
    name: document.title,
    description: document.excerpt,
    url: `${BASE_URL}/documents/${document.slug}`,
    datePublished: document.created_at,
    dateModified: document.updated_at || document.created_at,
    encodingFormat: document.file_type || "application/pdf",
    contentSize: document.file_size ? `${Math.round(document.file_size / 1024)} KB` : undefined,
    category: document.category?.name,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// FAQ Schema (useful for contact/services pages)
export function FAQJsonLd({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
