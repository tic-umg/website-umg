"use client";

import { useMemo, useState } from "react";
import Container from "@/components/Container";
import Link from "next/link";
import { Briefcase, MapPin, Phone, FileText } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";

type Service = {
  id: number;
  name: string;
  slug: string;
  chef_service: string | null;
  address: string | null;
  contact: string | null;
  logo: { url: string } | null;
  document: { id: number; title: string; slug: string; file_url: string | null } | null;
};

type DocumentFilter = "all" | "with" | "without";
type SortOrder = "asc" | "desc";

export default function ServicesPageClient({ services }: { services: Service[] }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [docFilter, setDocFilter] = useState<DocumentFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return services.filter((service) => {
      if (docFilter === "with" && !service.document?.file_url) return false;
      if (docFilter === "without" && service.document?.file_url) return false;
      if (!keyword) return true;
      const haystack = [
        service.name,
        service.chef_service,
        service.address,
        service.contact,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [services, query, docFilter]);

  const sorted = useMemo(() => {
    const items = [...filtered];
    items.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
    if (sortOrder === "desc") items.reverse();
    return items;
  }, [filtered, sortOrder]);

  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-10 md:py-12">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("services.kicker")}</p>
            <h1 className="mt-4 text-xl md:text-3xl font-bold tracking-tight">
              {t("services.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              {t("services.subtitle")}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-[#1e2736]">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#616f89]">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("services.searchPlaceholder")}
                  className="h-12 w-full rounded-lg border border-[#dbdfe6] bg-white pl-10 pr-3 text-[#111318] placeholder-[#616f89] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
                <div className="relative min-w-[200px]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#616f89]">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <select
                    value={docFilter}
                    onChange={(event) => setDocFilter(event.target.value as DocumentFilter)}
                    className="h-12 w-full appearance-none rounded-lg border border-[#dbdfe6] bg-white pl-10 pr-10 text-[#111318] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="all">{t("services.filter.all")}</option>
                    <option value="with">{t("services.filter.withDocument")}</option>
                    <option value="without">{t("services.filter.withoutDocument")}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#616f89]">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="flex h-12 items-center gap-2 rounded-lg border border-[#dbdfe6] bg-white px-4 text-sm font-medium text-[#111318] transition-all hover:border-primary/40 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#616f89]">sort_by_alpha</span>
                  <span>{sortOrder === "asc" ? t("services.sort.az") : t("services.sort.za")}</span>
                  <span className="material-symbols-outlined text-[18px] text-[#616f89]">
                    {sortOrder === "asc" ? "south" : "north"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {sorted.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((service) => (
                <div
                  key={service.id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex h-24 items-center justify-center bg-slate-100 dark:bg-slate-800">
                    {service.logo ? (
                      <img src={service.logo.url} alt={service.name} className="h-12 w-auto object-contain" />
                    ) : (
                      <Briefcase className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white">
                      {service.name}
                    </h2>

                    {service.chef_service && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-medium">{t("services.card.chefService")}:</span> {service.chef_service}
                      </p>
                    )}

                    {service.address && (
                      <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{service.address}</span>
                      </div>
                    )}

                    {service.contact && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{service.contact}</span>
                      </div>
                    )}

                    {service.document && service.document.file_url && (
                      <Link
                        href={service.document.file_url}
                        target="_blank"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FileText className="h-4 w-4" />
                        {t("services.card.download")}
                      </Link>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-blue-600/0 transition-colors duration-300 group-hover:bg-blue-600/5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500 dark:text-slate-300">
                {t("services.empty")}
              </p>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
