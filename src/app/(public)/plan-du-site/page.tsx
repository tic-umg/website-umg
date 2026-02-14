import { InstitutionalPageLayout } from "@/components/layout/InstitutionalPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plan du site",
  description: "Explorez la structure complète du site de l'Université de Mahajanga. Trouvez rapidement les pages et ressources que vous cherchez.",
};

// TODO: Vérifier et activer les liens lorsque les routes correspondantes seront créées.
// Les liens désactivés sont marqués avec `pointer-events-none text-gray-400`.

export default function SitemapPage() {
  const linkStyles = "text-blue-600 hover:underline";
  const disabledLinkStyles = "text-gray-400 pointer-events-none";

  const sections = [
    {
      title: "Université",
      links: [
        { href: "/", text: "Accueil" },
        { href: "/universite/historique", text: "Historique", disabled: true }, // TODO
        { href: "/universite/presidence", text: "Présidence", disabled: true }, // TODO
        { href: "/universite/gouvernance", text: "Gouvernance", disabled: true }, // TODO
        { href: "/president-message", text: "Mot du Président" },
        { href: "/universite/chiffres-cles", text: "Chiffres clés", disabled: true }, // TODO
      ],
    },
    {
      title: "Établissements",
      links: [
        { href: "/etablissements?type=faculte", text: "Facultés" },
        { href: "/etablissements?type=institut", text: "Instituts" },
        { href: "/etablissements?type=ecole", text: "Écoles" },
        { href: "/recherche/ecole-doctorale", text: "Écoles Doctorales", disabled: true }, // TODO
      ],
    },
    {
      title: "Projets & Partenariats",
      links: [
        { href: "/projets", text: "Projets internationaux", disabled: true }, // TODO
        { href: "/partenaires", text: "Partenaires" },
      ],
    },
    {
      title: "Actualités",
      links: [
        { href: "/actualites", text: "Actualités" },
        { href: "/evenements", text: "Événements", disabled: true }, // TODO
        { href: "/communiques", text: "Communiqués", disabled: true }, // TODO
      ],
    },
     {
      title: "Documents",
      links: [
        { href: "/documents", text: "Documents & Ressources" },
      ],
    },
    {
      title: "Services",
      links: [
        { href: "/services/bibliotheque", text: "Bibliothèque numérique", disabled: true }, // TODO
        { href: "https://webmail.univ-mahajanga.mg", text: "Webmail", isExternal: true },
        { href: "/#newsletter", text: "Newsletter" },
        { href: "/contact", text: "Contact" },
      ],
    },
     {
      title: "Institutionnel",
      links: [
        { href: "/mentions-legales", text: "Mentions Légales" },
        { href: "/politique-de-confidentialite", text: "Politique de confidentialité" },
        { href: "/plan-du-site", text: "Plan du site" },
      ],
    },
  ];

  return (
    <InstitutionalPageLayout
      title="Plan du site"
      subtitle="Retrouvez l'ensemble des pages et sections du site de l'Université de Mahajanga."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary dark:text-white">{section.title}</h2>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link.text}>
                  <Link
                    href={link.href}
                    className={link.disabled ? disabledLinkStyles : linkStyles}
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
                  >
                    {link.text}
                    {link.isExternal && ' ↗'}
                    {link.disabled && <span className="text-xs ml-2">(bientôt)</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </InstitutionalPageLayout>
  );
}
