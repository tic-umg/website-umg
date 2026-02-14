import Link from "next/link";
import Container from "@/components/Container";
import PresidentMessage from "@/components/public/PresidentMessage";
import { publicGet } from "@/lib/public-api";
import type { PresidentMessage as PresidentMessageType } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mot du Président - Université de Mahajanga",
  description: "Découvrez le message officiel du Président de l'Université de Mahajanga.",
};

export default async function PresidentMessagePage() {
  const data = await publicGet<{ data: PresidentMessageType }>("/president-message", { cache: "no-store" }).catch(
    () => null
  );

  return (
    <main className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <section className="bg-gray-100 dark:bg-indigo-950 text-gray-800 dark:text-white">
        <Container className="max-w-6xl px-4 md:px-8">
          <div className="py-8 md:py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-indigo-300/70 mb-4">
              <Link href="/" className="hover:text-gray-600 dark:hover:text-indigo-200 transition-colors">
                Accueil
              </Link>
              <span>/</span>
              <span className="text-gray-500 dark:text-indigo-200">Mot du Président</span>
            </nav>

            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-indigo-400 mb-2">
              Présidence
            </p>

            <h1 className="text-xl md:text-2xl text-gray-800 dark:text-white">
              Le mot du Président
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-indigo-200/70 max-w-xl">
              Message officiel de la présidence de l'Université de Mahajanga.
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <PresidentMessage data={data?.data ?? null} fullPage />

      {/* Footer links */}
      <section className="py-8 bg-gray-50 dark:bg-indigo-950/30">
        <Container className="max-w-6xl px-4 md:px-8">
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-gray-500 dark:text-indigo-300/70 hover:text-gray-700 dark:hover:text-indigo-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Accueil
            </Link>
            <span className="text-gray-300 dark:text-indigo-700">|</span>
            <Link
              href="/universite/organisation"
              className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Organisation
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}

