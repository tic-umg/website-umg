import Container from "@/components/Container";
import Link from "next/link";
import { Building2, FileText, Landmark, ArrowRight } from "lucide-react";
import { AnimatedCounter } from "@/components/public";
import { publicGet } from "@/lib/public-api";

export const metadata = {
  title: "Université - Université de Mahajanga",
  description: "Découvrez l'Université de Mahajanga, son histoire, son organisation et ses établissements",
};

const sections = [
  {
    href: "/universite/historique",
    title: "Historique",
    description: "L'évolution de l'université, ses grandes étapes et ses accomplissements.",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
  },
  {
    href: "/universite/organisation",
    title: "Organisation",
    description: "Présidence, directions et services structurants de l'université.",
    icon: Landmark,
    color: "from-indigo-500 to-violet-600",
  },
  {
    href: "/universite/textes",
    title: "Textes & Arrêtés",
    description: "Cadre réglementaire, textes officiels et documents institutionnels.",
    icon: FileText,
    color: "from-amber-500 to-orange-600",
  },
];

export default async function UniversitePage() {
  const stats = await publicGet<{
    students: number;
    teachers: number;
    staff: number;
    establishments: number;
  }>("/stats", 300).catch(() => null);

  const mappedStats = {
    students: stats?.students ?? 10000,
    teachers: stats?.teachers ?? 500,
    staff: stats?.staff ?? 200,
    establishments: stats?.establishments ?? 5,
  };

  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-10 md:py-12">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Université</p>
            <h1 className="mt-4 text-xl md:text-3xl font-bold tracking-tight">
              Une institution académique de référence à Madagascar
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              L&apos;Université de Mahajanga conjugue excellence académique, recherche et impact sociétal
              pour former les leaders de demain.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/universite/historique"
                className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg hover:bg-amber-300"
              >
                Découvrir notre histoire
              </Link>
              <Link
                href="/etablissements"
                className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Voir les établissements
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-6 md:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${section.color}`}>
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{section.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                  Explorer
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}

            <div className="rounded-3xl border border-slate-200/70 bg-slate-50/60 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Établissements</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Découvrez les facultés, écoles et instituts qui composent l'université.
              </p>
              <Link
                href="/etablissements"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
              >
                Voir les établissements
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-16 dark:bg-slate-900">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Impact</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Une université engagée au service du territoire
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                Enracinée dans la région Boeny, l'Université de Mahajanga valorise l'innovation,
                la recherche appliquée et les partenariats pour accélérer le développement durable.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <AnimatedCounter value={mappedStats.establishments} suffix="+" label="Établissements" />
              <AnimatedCounter value={mappedStats.students} suffix="+" label="Étudiants" />
              <AnimatedCounter value={mappedStats.teachers} suffix="+" label="Enseignants" />
              <AnimatedCounter value={mappedStats.staff} suffix="+" label="Personnels" />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
