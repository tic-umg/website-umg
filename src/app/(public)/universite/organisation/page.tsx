import Container from "@/components/Container";
import LightboxImage from "@/components/public/LightboxImage";

export const metadata = {
  title: "Organisation - Université de Mahajanga",
  description: "Organisation, présidence, directions et services de l'Université de Mahajanga",
};

const abbreviations = [
  { abbr: "S.L.D.C.", label: "Service Législation, Documentation et Contentieux" },
  { abbr: "A.I.S.E.", label: "Audit Interne et Suivi-Évaluation" },
  { abbr: "P.R.M.P.", label: "Personne Responsable des Marchés Publiques" },
  { abbr: "DIR CAB", label: "Directeur du Cabinet" },
  { abbr: "D.R", label: "Direction de Recherches" },
  { abbr: "D.M.J", label: "Direction des Musées et Jardin Botanique" },
  { abbr: "D.P", label: "Direction du Patrimoine" },
  { abbr: "DAAF", label: "Direction des Affaires Administratives et Financières" },
  { abbr: "D.T.I.C", label: "Direction des Technologies de l’Information et de la Communication" },
  { abbr: "DOB", label: "Direction de l’Office du Baccalauréat" },
  { abbr: "DVU", label: "Direction de la Vie Universitaire" },
  { abbr: "D.F", label: "Direction de la Formation" },
  { abbr: "COUM", label: "Centre des Œuvres Universitaires de Mahajanga" },
  { abbr: "PAT", label: "Personnel Administratif et Technique" },
  { abbr: "PGI", label: "Progiciel de Gestion Intégrée" },
  { abbr: "FOAD", label: "Formation Ouverte à Distance" },
];

const establishments = [
  { abbr: "I.O.S.T.M.", label: "Institut d’Odonto-Stomatologie Tropicale de Madagascar" },
  { abbr: "F.S.T.E.", label: "Faculté de Sciences, de Technologies et de l’Environnement" },
  { abbr: "E.D.S.P.", label: "École de Droit et de Science Politique" },
  { abbr: "ILC-SS", label: "Institut des Lettres, Civilisations et Sciences Sociales" },
  { abbr: "E.T.", label: "École de Tourisme" },
  { abbr: "U.F.R.S.S", label: "Unité de Formation et de Recherche en Sciences Sociales" },
  { abbr: "E.L.C.I.", label: "École de Langues Commerciales Internationales" },
  { abbr: "I.S.S.T.M.", label: "Institut Supérieur de Sciences et Technologies de Mahajanga" },
  { abbr: "I.U.T.A.M.", label: "Institut Universitaire de Technologies et d’Agronomie de Mahajanga" },
  { abbr: "I.U.G.M.", label: "Institut Universitaire de Gestion et Management" },
  { abbr: "E.A.T.P.", label: "École des Arts et Prothèse Dentaire" },
];

const attachedOrganizations = [
  "Conseil d’Administration",
  "Président",
  "Conseil Scientifique",
];

const attachedCouncils = ["Conseil des sages", "Comité d’éthique"];

const attachedDetails = [
  {
    title: "Services rattachés à la présidence",
    items: [
      "Service de digitalisation et de bourse nationale et internationale",
      "Service de Législation, Documentation et Contentieux",
      "Service de l’Audit Interne et unité de Suivi-Évaluation",
      "Service anti-corruption et violence universitaire",
      "Personne Responsable des Marchés Publiques",
    ],
  },
  {
    title: "Cabinet de la présidence",
    items: ["Directeur du cabinet", "Conseillers", "Service sureté et prévention"],
  },
  {
    title: "Premier Vice-Président",
    items: [
      {
        label: "Direction de la vie universitaire",
        children: [
          "Service des Sports, Arts et Culture",
          "Service de la Médecine Préventive et de la Promotion de la Santé (SMPPS)",
          "Service COUM",
          "Service Espace Vert",
          "Service sécurité",
        ],
      },
      {
        label: "Direction des Musées et Jardin Botanique",
        children: [
          "Service Jardin botanique et centre Mandravasarotra Antsanitia",
          "Service Mozea Akiba",
          "Service Musée de la Mer",
          "Service Musée de l’Androna",
        ],
      },
    ],
  },
  {
    title: "Deuxième Vice-Président",
    items: [
      {
        label: "Direction de la Formation",
        children: [
          "Service de formation et perfectionnement",
          "Service LMD",
          "Service scolarité centrale",
        ],
      },
      {
        label: "Direction de la Recherche",
        children: [
          "Service d’Appui à la Recherche",
          "Service de partenariat et des relations internationales",
        ],
      },
    ],
  },
  {
    title: "Directions rattachées au Président",
    items: [
      {
        label: "Direction du Patrimoine",
        children: ["Service Maintenance des Infrastructures et Logistique", "Service du Patrimoine"],
      },
      {
        label: "Direction des Affaires Administratives et Financières",
        children: [
          "Service Financier",
          "Service de la Gestion des Ressources Humaines",
          "Service de Suivi et Contrôle Interne",
          "Service Formation du PAT",
          "Services des Relations et Actions Sociales",
        ],
      },
      {
        label: "Direction des Technologies de l’Information et de la Communication",
        children: [
          "Service de Maintenance Informatique",
          "Service d’administration réseau et Informatisation",
          "Communication Universitaire",
          "Service Radio Université Mahajanga",
          "Service de la Communication et Informatique en Ligne",
        ],
      },
    ],
  },
  {
    title: "Direction de l’Office du Baccalauréat",
    items: [
      "Chargé de Coordination et de Contrôle",
      "Service Administratif et Logistique",
      "Service Technique et Informatique",
      "Service Financier",
    ],
  },
];

const leadership = [
  {
    name: "Professeur Titulaire RANDRIANAMBININA Blanchard",
    role: "Président",
    image:
      "https://api.mahajanga-univ.mg/storage/president/sZSkn7mxKvaG83Yw2edsW14el2QDC3i7Vb9lbi8c.png",
  },
  {
    name: "Dr. RAKOTOARIVELO Geoslin",
    role: "Vice Président I",
    image: "https://api.mahajanga-univ.mg/assets/images/avatar/vice_president.jpg",
    rank: "1ère",
  },
  {
    name: "Pr Titulaire RAZAFIMAHEFA",
    role: "Vice Président II",
    image: "https://api.mahajanga-univ.mg/assets/images/avatar/pr_mahefa.jpg",
    rank: "2ème",
  },
];

export default function OrganisationPage() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-10 md:py-12">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Université</p>
            <h1 className="mt-4 text-xl md:text-3xl font-bold tracking-tight">Organisation</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Une université performante au service du développement !
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200/70 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:border-slate-800 dark:text-slate-300">
                  Université de Mahajanga
                </div>
                <div className="space-y-8 px-6 py-6 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Abreviations</h2>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {abbreviations.map((item) => (
                        <li
                          key={item.abbr}
                          className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                        >
                          <span className="font-semibold text-slate-800 dark:text-white">{item.abbr}</span>
                          <span className="ml-2">: {item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Établissements et Formations rattachés
                    </h2>
                    <ul className="mt-4 grid gap-2">
                      {establishments.map((item) => (
                        <li
                          key={item.abbr}
                          className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                        >
                          <span className="font-semibold text-slate-800 dark:text-white">{item.abbr}</span>
                          <span className="ml-2">: {item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Organisations</h2>
                    <div className="flex flex-wrap gap-2">
                      {attachedOrganizations.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200/70 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="h-px w-full bg-slate-200/70 dark:bg-slate-800" />
                    <div className="flex flex-wrap gap-2">
                      {attachedCouncils.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200/70 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {attachedDetails.map((detail) => (
                      <details
                        key={detail.title}
                        className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 open:bg-white open:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:open:bg-slate-900"
                      >
                        <summary className="cursor-pointer text-sm font-semibold text-slate-800 dark:text-white">
                          {detail.title}
                        </summary>
                        <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                          {detail.items.map((item) =>
                            typeof item === "string" ? (
                              <p
                                key={item}
                                className="rounded-xl border border-slate-200/70 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
                              >
                                {item}
                              </p>
                            ) : (
                              <div
                                key={item.label}
                                className="rounded-xl border border-slate-200/70 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                              >
                                <p className="font-semibold text-slate-800 dark:text-white">{item.label}</p>
                                <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                  {item.children.map((child) => (
                                    <li key={child}>{child}</li>
                                  ))}
                                </ul>
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200/70 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:border-slate-800 dark:text-slate-300">
                  Présidence de l’Université de Mahajanga
                </div>
                <div className="grid gap-4 px-6 py-6">
                  {leadership.map((leader) => (
                    <div
                      key={leader.name}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="relative">
                        <img
                          src={leader.image}
                          alt={leader.name}
                          className="h-14 w-14 rounded-full border-2 border-white object-cover"
                        />
                        {leader.rank && (
                          <span className="absolute -right-2 -top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
                            {leader.rank}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{leader.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{leader.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200/70 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:border-slate-800 dark:text-slate-300">
                  Organigramme visuel
                </div>
                <div className="px-6 py-6">
                  <LightboxImage
                    src="https://api.mahajanga-univ.mg/storage/orga/cuC6QctO4NrCIvQOgBj4GDfQ2ZcUM9U4QrPMqp0s.jpg"
                    alt="Organigramme de l'Université de Mahajanga"
                  />
                </div>
              </section>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
