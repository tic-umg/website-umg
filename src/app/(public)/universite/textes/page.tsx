import Container from "@/components/Container";
import { publicGet } from "@/lib/public-api";

export const metadata = {
  title: "Textes & Arrêtés - Université de Mahajanga",
  description: "Textes réglementaires, décrets et arrêtés officiels de l'Université de Mahajanga",
};

type Page = {
  id: number;
  title: string;
  content: string | null;
  slug: string;
};

export default async function TextesPage() {
  let pages: Page[] = [];
  try {
    const res = await publicGet<{ data: Page[] }>("/organization-pages/type/textes", 60);
    pages = res.data || [];
  } catch {
    // No pages yet
  }

  return (
    <main>
      {/* Hero */}
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container>
          <div className="py-10 md:py-12">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
              Université
            </p>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold">Textes & Arrêtés</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Textes réglementaires et documents officiels
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-12">
        <Container>
          {pages.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-8">
              {pages.map((page) => (
                <article key={page.id} className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">{page.title}</h2>
                  {page.content && (
                    <div 
                      className="prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: page.content }} 
                    />
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">Aucun texte disponible pour le moment.</p>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
