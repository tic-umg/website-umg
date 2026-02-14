import { User, Calendar, Building2, GraduationCap, BookOpen } from "lucide-react";
import Image from "next/image";
import { publicGet } from "@/lib/public-api";

export const metadata = {
  title: "Historique - Université de Mahajanga",
  description: "Découvrez l'histoire de l'Université de Mahajanga, ses présidents et recteurs à travers les années.",
};

type President = {
  id: number;
  name: string;
  title: string | null;
  mandate_start: number;
  mandate_end: number | null;
  mandate_period: string;
  bio: string | null;
  photo: { id: number; url: string } | null;
  is_current: boolean;
  order: number;
};

type HistoriquePage = {
  id: number;
  title: string;
  content: string | null;
  slug: string;
  order: number;
};

export default async function HistoriquePage() {
  // Récupérer les présidents
  let presidents: President[] = [];
  try {
    const res = await publicGet<{ data: President[] }>("/presidents", 60);
    presidents = res.data || [];
  } catch {
    // Pas de présidents
  }

  // Récupérer les pages de contenu type "historique"
  let pages: HistoriquePage[] = [];
  try {
    const res = await publicGet<{ data: HistoriquePage[] }>("/organization-pages/type/historique", 60);
    pages = res.data || [];
  } catch {
    // Pas de pages
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Hero Section */}
      <div className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
            Université
          </p>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold tracking-tight">
            Notre Histoire
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl">
            Découvrez le parcours de l&apos;Université de Mahajanga.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Dynamic Content from OrganizationPages */}
            {pages.length > 0 && (
              <div className="space-y-5 mb-6">
                {pages.map((page) => (
                  <article
                    key={page.id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        {page.title}
                      </h2>
                    </div>
                    {page.content && (
                      <div
                        className="p-4 prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                      />
                    )}
                  </article>
                ))}
              </div>
            )}

            {/* Presidents Section - Juste après les grandes dates */}
            {presidents.length > 0 && (
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        Nos Présidents et Recteurs
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {presidents.length} personnalités depuis 1988
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compact Grid */}
                <div className="p-3">
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {presidents.map((president) => (
                      <div
                        key={president.id}
                        className={`group bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden hover:shadow-md transition-all ${
                          president.is_current
                            ? 'ring-2 ring-blue-500'
                            : 'border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {/* Photo - Square compact */}
                        <div className="aspect-square relative bg-slate-200 dark:bg-slate-600">
                          {president.photo ? (
                            <Image
                              src={president.photo.url}
                              alt={president.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <User className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            </div>
                          )}
                          {president.is_current && (
                            <div className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[7px] font-bold px-1 py-0.5 rounded">
                              Actuel
                            </div>
                          )}
                        </div>

                        {/* Info - Very Compact */}
                        <div className="p-1.5">
                          <h3 className="font-medium text-slate-900 dark:text-white text-[9px] leading-tight line-clamp-2">
                            {president.name}
                          </h3>
                          <p className="text-[8px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 mt-0.5">
                            <Calendar className="w-2 h-2 flex-shrink-0" />
                            {president.mandate_period}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 space-y-4">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-blue-600" />
                En chiffres
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">Création</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-xs">1988</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">Facultés</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-xs">2</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">Instituts</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-xs">5</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">Écoles</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-xs">4</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">Écoles Doctorales</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-xs">3</span>
                </div>
              </div>
            </div>

            {/* Établissements */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Établissements
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Facultés</h4>
                  <p className="text-slate-600 dark:text-slate-400">FSTE, Médecine</p>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Instituts</h4>
                  <p className="text-slate-600 dark:text-slate-400">IOSTM, IUGM, ISST, IUTAM, ILCSS</p>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Écoles</h4>
                  <p className="text-slate-600 dark:text-slate-400">ENS, EDSP, ET, ELCI, EV, EP</p>
                </div>
              </div>
            </div>

            {/* Texte juridique */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
              <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Base juridique
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-blue-700 dark:text-blue-300">Décret 2002-565</strong> du 04/07/2002
              </p>
            </div>
          </aside>
        </div>

        {/* Empty State */}
        {pages.length === 0 && presidents.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-7 h-7 text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Contenu en cours de préparation
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                L&apos;historique de l&apos;université sera bientôt disponible.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
