import Link from "next/link";
import { GraduationCap, FolderKanban, ArrowRight } from "lucide-react";

const doctoralSchools = [
  {
    sigle: "EDGVM",
    name: "École Doctorale Génie du Vivant et Modélisation",
    overview:
      "Former des doctorants capables de modéliser les systèmes vivants, dʼinnover en biotechnologie et de valoriser les ressources naturelles de Madagascar.",
    teamFocus: "Équipe Génie du Vivant et Modélisation",
    slug: "edgvm",
  },
  {
    sigle: "EDEN",
    name: "École Doctorale des Écosystèmes Naturels",
    overview:
      "Développer des recherches sur les écosystèmes terrestres et marins, la conservation de la biodiversité et lʼadaptation aux changements climatiques.",
    teamFocus: "Équipe Écosystèmes Naturels",
    slug: "eden",
  },
  {
    sigle: "EDNES",
    name: "École Doctorale Nutrition–Environnement–Santé",
    overview:
      "Articuler nutrition durable, santé publique et environnement pour soutenir des politiques et pratiques adaptées au contexte régional.",
    teamFocus: "Équipe Nutrition–Environnement–Santé",
    slug: "ednes",
  },
];

export const metadata = {
  title: "École doctorale - Université de Mahajanga",
  description: "Informations sur l'École doctorale de l'Université de Mahajanga.",
};

export default function EcoleDoctoralePage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
            Recherche
          </p>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Écoles doctorales
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl">
            L’Université de Mahajanga fédère trois écoles doctorales spécialisées dans les enjeux du vivant,
            des écosystèmes et de la santé-régénération. Elles soutiennent la recherche doctorale et accompagnent
            les porteurs de projets dans la collaboration avec des partenaires institutionnels, territoriaux et
            internationaux.
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 md:px-10 py-12 lg:py-16 space-y-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Doctorat</p>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Les écoles doctorales de l’UMG</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
            Chaque école doctorale structure des formations recherches longues, accompagne les doctorants en mobilité
            et coordonne des laboratoires partenaires sur le territoire mélanésien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctoralSchools.map((school) => (
            <article
              key={school.sigle}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{school.sigle}</p>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{school.name}</h3>
                </div>
                <GraduationCap className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{school.overview}</p>
              <p className="text-xs uppercase text-slate-400 tracking-[0.2em]">Équipe d'accueil</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{school.teamFocus}</p>
              <Link
                href={`/etablissements/${school.slug}`}
                className="mt-auto inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
              >
                Consulter la fiche
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-10 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Partenariats</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Projets soutenus</h2>
          </div>
          <Link
            href="/projets-internationale"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Voir tous les projets
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              href: "/projets-internationale/infprev4frica",
              title: "Projet InfPrev4frica",
              description: "Renforcer les capacités en agriculture intelligente et résiliente face aux changements climatiques.",
            },
            {
              href: "/projets-internationale/docet4africa",
              title: "Projet DOCET4AFRICA",
              description: "Soutenir les technologies culturelles et l’implication des communautés dans la transition écologique.",
            },
          ].map((project) => (
            <Link
              key={project.href}
              href={project.href}
              className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {project.title}
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
              </div>
              <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 gap-1">
                <span>Voir la fiche</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
