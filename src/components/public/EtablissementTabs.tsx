"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Globe, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

type ListItem = {
  title: string;
  subtitle?: string | null;
};

type EtablissementTabsProps = {
  presentation?: string | null;
  contacts: {
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };
  formations?: ListItem[];
  parcours?: ListItem[];
  doctoralTeams?: ListItem[];
  isDoctoral?: boolean;
};

const INITIAL_VISIBLE_COUNT = 4;

export default function EtablissementTabs({
  presentation,
  contacts,
  formations = [],
  parcours = [],
  doctoralTeams = [],
  isDoctoral = false,
}: EtablissementTabsProps) {
  // Build dynamic tabs
  const baseTabs = ["Présentation"];
  if (isDoctoral && doctoralTeams.length > 0) {
    baseTabs.push("Équipes d'accueil");
  }
  if (formations.length > 0) {
    baseTabs.push("Formations");
  }
  if (parcours.length > 0) {
    baseTabs.push("Parcours");
  }
  baseTabs.push("Contacts");

  const [active, setActive] = useState(baseTabs[0]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderList = (items: ListItem[], sectionKey: string, emptyMessage: string) => {
    const isExpanded = expandedSections[sectionKey] ?? false;
    const visibleItems = isExpanded ? items : items.slice(0, INITIAL_VISIBLE_COUNT);
    const hasMoreItems = items.length > INITIAL_VISIBLE_COUNT;

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            {items.length} élément{items.length > 1 ? "s" : ""}
          </p>
          {items.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {items.length}
            </span>
          )}
        </div>
        {items.length ? (
          <>
            <ul className="grid gap-3 md:grid-cols-2">
              {visibleItems.map((item, index) => (
                <li
                  key={`${sectionKey}-${item.title}-${index}`}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/70 p-4 text-sm text-slate-600 dark:text-slate-300"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  {item.subtitle && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                  )}
                </li>
              ))}
            </ul>
            {hasMoreItems && (
              <button
                type="button"
                onClick={() => toggleSection(sectionKey)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Voir tout ({items.length - INITIAL_VISIBLE_COUNT} de plus)
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/60 p-6 shadow-lg">
      <div className="flex flex-wrap gap-2">
        {baseTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === tab
                ? "bg-indigo-600 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
            aria-pressed={active === tab}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active === "Présentation" && (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {presentation ? (
              <ReactMarkdown>{presentation}</ReactMarkdown>
            ) : (
              <p>Présentation en cours de rédaction.</p>
            )}
          </div>
        )}

        {active === "Équipes d'accueil" && renderList(doctoralTeams, "doctoral", "Aucune équipe d'accueil définie.")}

        {active === "Formations" && renderList(formations, "formations", "Aucune formation définie.")}

        {active === "Parcours" && renderList(parcours, "parcours", "Aucun parcours défini.")}

        {active === "Contacts" && (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {contacts.address && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>{contacts.address}</span>
              </div>
            )}
            {contacts.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <a className="hover:text-blue-600" href={`tel:${contacts.phone}`}>
                  {contacts.phone}
                </a>
              </div>
            )}
            {contacts.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <a className="hover:text-blue-600" href={`mailto:${contacts.email}`}>
                  {contacts.email}
                </a>
              </div>
            )}
            {contacts.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-slate-400" />
                <a
                  className="text-indigo-600 hover:underline"
                  href={contacts.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Site web officiel
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
