import Container from "@/components/Container";
import { publicGet, PUBLIC_API, getSiteSettings } from "@/lib/public-api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Document as DocumentType, SiteSettings } from "@/lib/types";
import { DocumentJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/layout";
import { FileText, Download, Calendar, Folder } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mahajanga-univ.mg";

type Doc = DocumentType & { content_html?: string | null };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [res, settings] = await Promise.all([
      publicGet<{ data: Doc }>(`/documents/${slug}`, 60),
      getSiteSettings().catch(() => null),
    ]);
    const d = res.data;
    const siteName = settings?.site_name || "Université de Mahajanga";
    const description = d.excerpt || `Document: ${d.title} - Téléchargez ce document officiel de l'Université de Mahajanga`;
    const pageUrl = `${BASE_URL}/documents/${slug}`;

    return {
      title: d.title,
      description,
      keywords: [d.title, d.category?.name, "document", "téléchargement", "université", "mahajanga"].filter(Boolean) as string[],
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        type: "article",
        locale: "fr_MG",
        url: pageUrl,
        siteName,
        title: d.title,
        description,
      },
      twitter: {
        card: "summary",
        title: d.title,
        description,
      },
    };
  } catch {
    return {
      title: "Document",
      robots: { index: false, follow: true },
    };
  }
}

export default async function DocumentShow({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let d: Doc;
  let settings: SiteSettings | null = null;

  try {
    const [res, settingsRes] = await Promise.all([
      publicGet<{ data: Doc }>(`/documents/${slug}`, 60),
      getSiteSettings().catch(() => null),
    ]);
    d = res.data;
    settings = settingsRes;
  } catch {
    notFound();
  }

  const breadcrumbItems = [
    { name: "Accueil", url: "/" },
    { name: "Documents", url: "/documents" },
    { name: d.title, url: `/documents/${slug}` },
  ];

  const formattedDate = d.created_at
    ? new Date(d.created_at).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const formattedSize = d.file_size
    ? d.file_size > 1024 * 1024
      ? `${(d.file_size / (1024 * 1024)).toFixed(1)} Mo`
      : `${Math.round(d.file_size / 1024)} Ko`
    : null;

  return (
    <main className="bg-white dark:bg-slate-950 min-h-screen">
      <DocumentJsonLd document={d} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Container>
          <div className="py-4">
            <Breadcrumb
              items={[
                { label: "Documents", href: "/documents" },
                { label: d.title },
              ]}
            />
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-10 max-w-4xl">
          {/* Document Header */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {d.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                {d.category && (
                  <span className="inline-flex items-center gap-1.5">
                    <Folder className="w-4 h-4" />
                    {d.category.name}
                  </span>
                )}
                {formattedDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formattedDate}
                  </span>
                )}
                {formattedSize && (
                  <span className="text-slate-500">
                    {formattedSize}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="mt-6">
            <a
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition-colors"
              href={`${PUBLIC_API}/documents/${d.id}/download`}
              download
            >
              <Download className="w-4 h-4" />
              Télécharger le document
            </a>
          </div>

          {/* Excerpt */}
          {d.excerpt && (
            <p className="mt-6 text-slate-600 dark:text-slate-300 leading-relaxed">
              {d.excerpt}
            </p>
          )}

          {/* Content */}
          {d.content_html && (
            <article className="prose prose-slate dark:prose-invert mt-8 max-w-none">
              <div dangerouslySetInnerHTML={{ __html: d.content_html }} />
            </article>
          )}
        </div>
      </Container>
    </main>
  );
}