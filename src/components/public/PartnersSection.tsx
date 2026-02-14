"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Handshake, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Partner } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
const FALLBACK_LOGO = "/images/placeholder.jpg";

export default function PartnersSection() {
  const { t } = useI18n();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);
  const FALLBACK_PARTNERS: Partner[] = [
    { id: -1, name: t("partners.fallback.1"), logo_url: FALLBACK_LOGO, is_active: true, type: "national" },
    { id: -2, name: t("partners.fallback.2"), logo_url: FALLBACK_LOGO, is_active: true, type: "international" },
    { id: -3, name: t("partners.fallback.3"), logo_url: FALLBACK_LOGO, is_active: true, type: "national" },
    { id: -4, name: t("partners.fallback.4"), logo_url: FALLBACK_LOGO, is_active: true, type: "international" },
    { id: -5, name: t("partners.fallback.5"), logo_url: FALLBACK_LOGO, is_active: true, type: "national" },
  ];

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(2);
      } else if (window.innerWidth < 768) {
        setItemsPerView(3);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(4);
      } else {
        setItemsPerView(5);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch(`${API_URL}/partners?is_active=1`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          setPartners(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
        setPartners(FALLBACK_PARTNERS);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const maxIndex = Math.max(0, partners.length - itemsPerView);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }, [maxIndex]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (partners.length <= itemsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [partners.length, itemsPerView, maxIndex]);

  if (loading) {
    return (
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!partners || partners.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(partners.length / itemsPerView);
  const currentPage = Math.floor(currentIndex / itemsPerView);
  const translateX = currentIndex * (100 / itemsPerView);
  const itemWidth = 100 / itemsPerView;

  return (
    <section id="partenaires" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Handshake className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {t("partners.kicker")}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {t("partners.title")}
            </h2>
          </div>

          {partners.length > itemsPerView && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label={t("partners.prev")}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                disabled={currentIndex >= maxIndex}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label={t("partners.next")}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="relative">
          {partners.length > itemsPerView && (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="sm:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label={t("partners.prev")}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                disabled={currentIndex >= maxIndex}
                className="sm:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label={t("partners.next")}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${translateX}%)` }}
            >
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${itemWidth}%` }}
                >
                  <PartnerCard partner={partner} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Indicators */}
        {partners.length > itemsPerView && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: Math.min(totalPages, 8) }).map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => goToSlide(index * itemsPerView)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentPage === index
                    ? "w-6 bg-blue-600 dark:bg-blue-500"
                    : "w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                }`}
                aria-label={`Page ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* View All */}
        <div className="text-center mt-8">
          <Link
            href="/partenaires"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {t("partners.viewAll")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  const { t } = useI18n();
  const content = (
    <div className="group flex flex-col items-center text-center p-4 rounded-xl from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
      {/* Logo Container */}
      <div className="relative w-full h-16 mb-3 flex items-center justify-center">
        <Image
          src={partner.logo_url || FALLBACK_LOGO}
          alt={partner.name}
          fill
          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
      </div>

      {/* Partner Name */}
      <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
        {partner.name}
      </h3>

      {/* Type Badge */}
      {partner.type && (
        <span className={`mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${
          partner.type === 'international'
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
        }`}>
          {partner.type === 'international' ? t("partners.type.international") : t("partners.type.national")}
        </span>
      )}
    </div>
  );

  if (partner.website_url) {
    return (
      <Link
        href={partner.website_url}
        target="_blank"
        rel="noopener noreferrer"
        title={`Visiter ${partner.name}`}
        className="block h-full"
      >
        {content}
      </Link>
    );
  }

  return <div title={partner.name} className="h-full">{content}</div>;
}
