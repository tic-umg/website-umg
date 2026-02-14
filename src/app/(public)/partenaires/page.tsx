import Container from "@/components/Container";
import { publicGet } from "@/lib/public-api";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

type Partner = {
  id: number;
  name: string;
  type: "national" | "international";
  website_url?: string | null;
  description?: string | null;
  country?: string | null;
  is_featured: boolean;
  logo?: { url: string; alt?: string | null } | null;
};

export default async function PartnershipsPage() {
  const res = await publicGet<{ data: Partner[] }>("/partners?per_page=100", 300).catch(() => ({ data: [] }));
  const partners = res.data ?? [];

  const list = partners;

  return (
    <main className="bg-slate-50/60 dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-10 md:py-12">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Partenariats</p>
            <h1 className="mt-4 text-xl md:text-3xl font-bold tracking-tight">
              Réseaux nationaux et internationaux
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              L'Université de Mahajanga collabore avec des institutions académiques, entreprises et
              organismes publics.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Partenaires
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {list.length} partenaires
              </span>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((partner) => (
                <div
                  key={partner.id}
                  className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-3">
                    {partner.logo?.url ? (
                      <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700">
                        <img
                          src={partner.logo.url}
                          alt={partner.logo.alt || partner.name}
                          className="h-9 w-9 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200 flex items-center justify-center font-bold">
                        {partner.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white">
                          {partner.name}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                            partner.type === "international"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                          }`}
                        >
                          {partner.type === "international" ? "International" : "National"}
                        </span>
                      </div>
                      {partner.country && (
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{partner.country}</p>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {partner.description || "Partenariat actif autour de la recherche et de la mobilité étudiante."}
                  </p>
                  {partner.website_url && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
                    >
                      Visiter le site
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
