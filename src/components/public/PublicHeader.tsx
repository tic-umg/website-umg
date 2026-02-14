"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import {
  Laptop,
  BookOpen,
  Mail,
  ChevronDown,
  Search,
  Menu,
  X,
  History,
  Building2,
  FileText,
  Globe,
  Briefcase,
  FolderKanban,
  GraduationCap
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import type { SiteSettings } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

interface TopbarLinks {
  library: { label: string; url: string };
  webmail: { label: string; url: string };
  digital: { label: string; url: string };
}

interface HeaderSettings {
  cta: { text: string; url: string };
}

interface PublicHeaderProps {
  settings?: SiteSettings | null;
}

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

type ApiListResponse<T> = {
  data?: T[];
};

type SearchItem = {
  id: string | number;
  title: string;
  href: string;
  subtitle?: string;
};

type PostSearchApiItem = {
  id: number | string;
  title: string;
  slug: string;
  published_at?: string | null;
};

type DocumentSearchApiItem = {
  id: number | string;
  title: string;
  slug: string;
  category?: { name?: string | null } | null;
};

type ServiceSearchApiItem = {
  id: number | string;
  name: string;
  slug: string;
  chef_service?: string | null;
};

type EtablissementSearchApiItem = {
  id: number | string;
  name: string;
  slug: string;
  acronym?: string | null;
};

type PartnerSearchApiItem = {
  id: number | string;
  name: string;
  website_url?: string | null;
  type?: string | null;
};

export default function PublicHeader({ settings }: PublicHeaderProps) {
  const { lang, setLang, t } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [hash, setHash] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{
    posts: SearchItem[];
    documents: SearchItem[];
    services: SearchItem[];
    etablissements: SearchItem[];
    partners: SearchItem[];
  }>({
    posts: [],
    documents: [],
    services: [],
    etablissements: [],
    partners: [],
  });
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchRequestId = useRef(0);
  const [topbarLinks, setTopbarLinks] = useState<TopbarLinks>({
    library: { label: "Bibliothèque", url: "#" },
    webmail: { label: "Webmail", url: "#" },
    digital: { label: "Espace Numérique", url: "#" },
  });
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);

  // Fetch topbar links and header settings
  useEffect(() => {
    const fetchTopbar = async () => {
      const res = await fetch(`${API_URL}/topbar`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setTopbarLinks(data);
      }
    };

    const fetchHeader = async () => {
      const res = await fetch(`${API_URL}/header`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setHeaderSettings(data);
      }
    };

    fetchTopbar();
    fetchHeader();
  }, []);

  // Écouter les changements de hash dans l'URL
  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  // Close lang dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setLangOpen(false);
    if (langOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [langOpen]);

  useEffect(() => {
    if (searchOpen) {
      const id = window.setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const query = searchQuery.trim();
    setSearchError(null);

    if (!query) {
      setSearchResults({
        posts: [],
        documents: [],
        services: [],
        etablissements: [],
        partners: [],
      });
      return;
    }

    const currentId = ++searchRequestId.current;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const encoded = encodeURIComponent(query);
        const [postsRes, documentsRes, servicesRes, etablissementsRes, partnersRes] = await Promise.all([
          fetch(`${API_URL}/posts?q=${encoded}&per_page=5`, { signal: controller.signal }),
          fetch(`${API_URL}/documents?q=${encoded}&per_page=5`, { signal: controller.signal }),
          fetch(`${API_URL}/services?search=${encoded}&per_page=5`, { signal: controller.signal }),
          fetch(`${API_URL}/etablissements?search=${encoded}&per_page=5`, { signal: controller.signal }),
          fetch(`${API_URL}/partners?per_page=100`, { signal: controller.signal }),
        ]);

        if (searchRequestId.current !== currentId) return;

        const [postsJson, documentsJson, servicesJson, etablissementsJson, partnersJson] = (await Promise.all([
          postsRes.ok ? postsRes.json() : { data: [] },
          documentsRes.ok ? documentsRes.json() : { data: [] },
          servicesRes.ok ? servicesRes.json() : { data: [] },
          etablissementsRes.ok ? etablissementsRes.json() : { data: [] },
          partnersRes.ok ? partnersRes.json() : { data: [] },
        ])) as [
          ApiListResponse<PostSearchApiItem>,
          ApiListResponse<DocumentSearchApiItem>,
          ApiListResponse<ServiceSearchApiItem>,
          ApiListResponse<EtablissementSearchApiItem>,
          ApiListResponse<PartnerSearchApiItem>
        ];

        const partnersFiltered = (partnersJson?.data || [])
          .filter((partner) => partner?.name?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)
          .map((partner) => ({
            id: partner.id,
            title: partner.name,
            href: partner.website_url || "/partenaires",
            subtitle: partner.type === "international" ? "Partenaire international" : "Partenaire national",
          }));

        setSearchResults({
          posts: (postsJson?.data || []).map((post) => ({
            id: post.id,
            title: post.title,
            href: `/actualites/${post.slug}`,
            subtitle: post.published_at ? new Date(post.published_at).toLocaleDateString("fr-FR") : "Actualité",
          })),
          documents: (documentsJson?.data || []).map((doc) => ({
            id: doc.id,
            title: doc.title,
            href: `/documents/${doc.slug}`,
            subtitle: doc.category?.name || "Document",
          })),
          services: (servicesJson?.data || []).map((service) => ({
            id: service.id,
            title: service.name,
            href: `/services/${service.slug}`,
            subtitle: service.chef_service || "Service",
          })),
          etablissements: (etablissementsJson?.data || []).map((etab) => ({
            id: etab.id,
            title: etab.name,
            href: `/etablissements/${etab.slug}`,
            subtitle: etab.acronym || "Établissement",
          })),
          partners: partnersFiltered,
        });
      } catch (error: unknown) {
        const errorName = error instanceof Error ? error.name : null;
        if (errorName !== "AbortError") {
          setSearchError("Impossible de charger la recherche.");
        }
      } finally {
        if (searchRequestId.current === currentId) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [searchQuery, searchOpen]);

  const navItems: NavItem[] = [
    {
      label: t("nav.university"),
      children: [
        { label: t("nav.university.history"), href: '/universite/historique', icon: History },
        { label: t("nav.university.organization"), href: '/universite/organisation', icon: Building2 },
        { label: t("nav.university.services"), href: '/services', icon: Briefcase },
        { label: t("nav.university.texts"), href: '/universite/textes', icon: FileText },
      ]
    },
    { label: t("nav.establishments"), href: '/etablissements' },
    {
      label: t("nav.research"),
      children: [
        { label: t("nav.research.doctoralSchool"), href: '/recherche/ecole-doctorale', icon: GraduationCap },
        { label: t("nav.project.infprev"), href: '/projets-internationale/infprev4frica', icon: FolderKanban },
        { label: t("nav.project.docet"), href: '/projets-internationale/docet4africa', icon: FolderKanban },
      ],
    },
    { label: t("nav.news"), href: '/actualites' },
    { label: t("nav.partners"), href: '/partenaires' },
    { label: t("nav.contact"), href: '/contact' },
  ];

  // Vérifier si un lien est actif
  const isActive = (href?: string) => {
    if (!href) return false;
    // Liens ancrés (ex: /#partenaires) - actif SEULEMENT si hash correspond exactement
    if (href.startsWith('/#')) {
      const targetHash = href.replace('/', ''); // "#partenaires"
      return hash === targetHash;
    }
    // Autres liens normaux
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Vérifier si un dropdown contient un lien actif
  const hasActiveChild = (children?: NavItem[]) => {
    if (!children) return false;
    return children.some(child => isActive(child.href));
  };

  return (
    <>
      {/* Topbar */}
      <div className="relative z-[60] bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-2 text-xs font-medium transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              className="hover:text-blue-600 dark:hover:text-blue-500 transition-colors flex items-center gap-1.5"
              href={topbarLinks.library.url}
              target={topbarLinks.library.url.startsWith("http") ? "_blank" : undefined}
              rel={topbarLinks.library.url.startsWith("http") ? "noopener noreferrer" : undefined}>
              <BookOpen className="w-4 h-4 text-amber-500" /> {topbarLinks.library.label}
            </Link>
            <Link
              className="hover:text-blue-600 dark:hover:text-blue-500 transition-colors flex items-center gap-1.5"
              href={topbarLinks.digital.url}
              target={topbarLinks.digital.url.startsWith("http") ? "_blank" : undefined}
              rel={topbarLinks.digital.url.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <Laptop className="w-4 h-4 text-amber-500" /> {topbarLinks.digital.label}
            </Link>
          </div>
          <div className="flex w-full sm:w-auto justify-end items-center gap-4 shrink-0">
            <div className="hidden md:flex gap-4 items-center">
              <Link
                className="hover:text-blue-600 dark:hover:text-blue-500 transition-colors flex items-center gap-1.5"
                href={topbarLinks.webmail.url}
                target={topbarLinks.webmail.url.startsWith("http") ? "_blank" : undefined}
                rel={topbarLinks.webmail.url.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                <Mail className="w-3.5 h-3.5" /> {topbarLinks.webmail.label}
              </Link>
            </div>
            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLangOpen(!langOpen);
                }}
                className="flex items-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-blue-600 dark:text-blue-400">{lang === "fr" ? t("lang.fr") : t("lang.en")}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden min-w-[100px] z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setLang("fr");
                      setLangOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                      lang === "fr"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="w-5 h-4 rounded overflow-hidden flex-shrink-0 bg-slate-200 flex items-center justify-center text-[10px] font-bold">{t("lang.fr")}</span>
                    {t("lang.french")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLang("en");
                      setLangOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                      lang === "en"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="w-5 h-4 rounded overflow-hidden flex-shrink-0 bg-slate-200 flex items-center justify-center text-[10px] font-bold">{t("lang.en")}</span>
                    {t("lang.english")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-3 group min-w-0">
              <div className="relative size-10 flex items-center justify-center">
                <Image
                  src={settings?.logo_url || "/images/placeholder.jpg"}
                  alt="Logo"
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-primary dark:text-white text-xl font-bold leading-none tracking-tight group-hover:text-primary-light dark:group-hover:text-blue-300 transition-colors truncate">
                  {settings?.site_name || "UMG"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-semibold truncate">{t("header.tagline")}</p>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = item.children ? hasActiveChild(item.children) : isActive(item.href);

              return (
                <div key={item.label} className="relative group/dropdown">
                  {item.children ? (
                    <button
                      type="button"
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        active
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        active
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  {item.children && (
                    <div className="absolute top-full left-0 w-56 pt-2 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all transform translate-y-2 group-hover/dropdown:translate-y-0">
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden py-1">
                        {item.children.map((child) => {
                          const Icon = child.icon;
                          const childActive = isActive(child.href);
                          return (
                            <Link
                              key={child.label}
                              href={child.href || '#'}
                              className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                                childActive
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-500'
                              }`}
                            >
                              {Icon && <Icon className={`w-4 h-4 ${childActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />}
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="size-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
              onClick={() => setSearchOpen(true)}
              aria-label={t("search.open")}
            >
              <Search className="w-5 h-5" />
            </button>
            {headerSettings?.cta?.text && (
              <Link href={headerSettings.cta.url} className="hidden md:flex bg-accent hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-amber-500/20 items-center gap-2 hover:-translate-y-0.5">
                {headerSettings.cta.text}
              </Link>
            )}
            <button
              type="button"
              className="lg:hidden text-slate-800 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-lg animate-slide-in-up max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map((item) => {
                const active = item.children ? hasActiveChild(item.children) : isActive(item.href);

                return (
                  <div key={item.label}>
                    {item.children ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(dropdownOpen === item.label ? null : item.label)}
                          className={`flex w-full items-center justify-between px-4 py-3 text-sm font-bold rounded-lg transition-colors ${
                            active
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                          <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen === item.label ? 'rotate-180' : ''}`} />
                        </button>
                        {dropdownOpen === item.label && (
                          <div className="pl-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-2">
                            {item.children.map((child) => {
                              const Icon = child.icon;
                              const childActive = isActive(child.href);
                              return (
                                <Link
                                  key={child.label}
                                  href={child.href || '#'}
                                  className={`flex items-center gap-2 px-4 py-3 text-sm border-l-2 ml-2 ${
                                    childActive
                                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500 font-semibold'
                                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-blue-600 dark:hover:text-blue-500 hover:border-blue-600 dark:hover:border-blue-500'
                                  }`}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {Icon && <Icon className="w-4 h-4" />}
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href || '#'}
                        className={`block px-4 py-3 text-sm font-bold rounded-lg transition-colors ${
                          active
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
              {headerSettings?.cta?.text && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                  <Link
                    href={headerSettings.cta.url}
                    className="text-center bg-accent hover:bg-amber-600 text-white px-5 py-3 rounded-lg text-sm font-bold transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {headerSettings.cta.text}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {searchOpen && (
        <div
          className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center px-4 py-10"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-6 pt-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("search.placeholder")}
                  className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={t("search.clear")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="size-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label={t("search.close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-4">
              {searchLoading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("search.loading")}</p>
              )}
              {searchError && (
                <p className="text-sm text-red-500">{searchError}</p>
              )}
              {!searchLoading && !searchError && searchQuery && (
                <div className="space-y-5">
                  {([
                    { label: t("search.section.news"), items: searchResults.posts },
                    { label: t("search.section.documents"), items: searchResults.documents },
                    { label: t("search.section.services"), items: searchResults.services },
                    { label: t("search.section.establishments"), items: searchResults.etablissements },
                    { label: t("search.section.partners"), items: searchResults.partners },
                  ] as const).map((section) => (
                    <div key={section.label}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                          {section.label}
                        </p>
                        <span className="text-xs text-slate-400">{section.items.length}</span>
                      </div>
                      {section.items.length ? (
                        <div className="mt-3 grid gap-2">
                          {section.items.map((item) => (
                            <Link
                              key={`${section.label}-${item.id}`}
                              href={item.href}
                              target={section.label === "Partenaires" && item.href.startsWith("http") ? "_blank" : undefined}
                              rel={section.label === "Partenaires" && item.href.startsWith("http") ? "noreferrer" : undefined}
                              onClick={() => setSearchOpen(false)}
                              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-4 py-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                              {item.subtitle && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                              )}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("search.noResults")}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!searchLoading && !searchError && !searchQuery && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("search.hint")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
