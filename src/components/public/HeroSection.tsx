"use client";

import { useMemo, useCallback, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { ArrowRight, CheckCircle, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { Swiper as SwiperInstance } from "swiper";
import { isHexColor } from "@/lib/colors";

export interface Slide {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image_url?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  post?: { id: number; title: string; slug: string } | null;
  category?: { id: number; name: string; slug: string } | null;
  bg_color_light?: string;
  bg_color_dark?: string;
}

// Helper function to limit text to max words
function limitWords(text: string | null | undefined, maxWords: number): string {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

// Helper function to parse bg color and build proper Tailwind classes
function buildBgClasses(lightColor?: string, darkColor?: string): string {
  const light = lightColor?.replace("bg-", "") || "blue-900";
  const dark = darkColor?.replace("bg-", "") || "slate-800";
  return `bg-${light} dark:bg-${dark}`;
}

const FALLBACK_LIGHT_COLOR = "#002147";
const FALLBACK_DARK_COLOR = "#0B1120";

interface HeroSectionProps {
  slides: Slide[];
}

export default function HeroSection({ slides }: HeroSectionProps) {
  const { t } = useI18n();
  const verifiedSlides = useMemo(() => {
    if (!slides || slides.length === 0) {
      return [
        {
          id: 0,
          title: t("hero.fallback.title"),
          subtitle: t("hero.fallback.subtitle"),
          description: t("hero.fallback.description"),
          image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkeQiz_Jk1Dn_hBcGJfNF7fspqvjw6x0ui9NCGA4COyiBNWWl0QlARhUcuLIB9_jA4kAwbh0q5WR6fz8iGk4DBfmU3_Yzx7Ln3y19QjfryHwWuT7G-fRz_e-uomhlmdGP62gYnUpm-DcXeGA7pn2G4zzj9EYkO2isVINku9zw-uYvZttEyQoVegWdanUiM0Yb10NIHRa13pbhLRyBxSlmZF3jZj71m08_cTT3QP-ChRIfRWwxM42ZIMlSVjHZRK5sN9vYpqVsZ0-Y",
          cta_text: t("hero.fallback.cta"),
          cta_url: "/etablissements",
          category: { id: 0, name: t("hero.fallback.category"), slug: "umg" },
          bg_color_light: "bg-blue-900",
          bg_color_dark: "bg-slate-800",
        }
      ];
    }
    return slides;
  }, [slides, t]);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const heroBackground = useMemo(() => {
    const safeIndex = verifiedSlides.length
      ? Math.min(Math.max(activeSlideIndex, 0), verifiedSlides.length - 1)
      : 0;
    const slide = verifiedSlides[safeIndex];
    const lightColor = slide?.bg_color_light;
    const darkColor = slide?.bg_color_dark;
    const useCssVars = isHexColor(lightColor) && isHexColor(darkColor);

    if (useCssVars) {
      return {
        classes: "bg-[var(--hero-light-color)] dark:bg-[var(--hero-dark-color)]",
        style: {
          "--hero-light-color": lightColor || FALLBACK_LIGHT_COLOR,
          "--hero-dark-color": darkColor || FALLBACK_DARK_COLOR,
        } as CSSProperties,
      };
    }

    return {
      classes: buildBgClasses(lightColor, darkColor),
      style: undefined,
    };
  }, [verifiedSlides, activeSlideIndex]);

  const handleSlideChange = useCallback(
    (swiper: SwiperInstance) => {
      if (verifiedSlides.length === 0) return;
      const rawIndex = swiper.realIndex ?? swiper.activeIndex ?? 0;
      const safeIndex = Math.min(
        Math.max(rawIndex, 0),
        verifiedSlides.length - 1
      );
      setActiveSlideIndex(safeIndex);
    },
    [verifiedSlides]
  );

  return (
    <section
      className={`relative ${heroBackground.classes} overflow-hidden pb-16 pt-8 lg:pt-16 lg:pb-20`}
      style={heroBackground.style}
    >
      {/* Background Effects */}
      <div className="absolute top-0 right-0 h-[28rem] w-[28rem] sm:h-[42rem] sm:w-[42rem] lg:h-[50rem] lg:w-[50rem] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10">
        <div className="relative">
          <Swiper
            modules={[Autoplay, EffectFade, Pagination, Navigation]}
            effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          loop={verifiedSlides.length > 1}
          onSlideChange={handleSlideChange}
          className="w-full"
          navigation={{
            prevEl: '.custom-prev',
            nextEl: '.custom-next'
          }}
          pagination={{
            clickable: true,
            el: '.custom-dots',
            bulletClass: 'w-2 h-1 bg-white/40 rounded-full cursor-pointer transition-all duration-300 mx-1',
            bulletActiveClass: '!bg-white !w-8'
          }}
        >
          {verifiedSlides.map((slide, index) => (
              <SwiperSlide key={slide.id}>
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="order-2 lg:order-1 flex flex-col gap-6">
                  {(slide.category || slide.subtitle) && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm w-fit">
                      <span className="size-2 rounded-full bg-accent animate-pulse"></span>
                      <span className="text-accent text-[11px] font-bold uppercase tracking-widest">
                        {slide.category?.name || slide.subtitle}
                      </span>
                    </div>
                  )}

                  <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-black leading-[1.1] tracking-tight">
                    {slide.title}
                  </h1>

                  {slide.description && (
                    <p className="text-blue-100 text-base md:text-lg font-light leading-relaxed max-w-lg">
                      {limitWords(slide.description, 20)}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 mt-2">
                    {slide.cta_text && (
                      <Link
                        href={slide.cta_url || (slide.post ? `/actualites/${slide.post.slug}` : '/actualites')}
                        className="bg-accent hover:bg-amber-600 text-white h-12 px-8 rounded-lg text-sm font-bold transition-all shadow-lg shadow-amber-900/20 flex items-center gap-2 hover:-translate-y-0.5"
                      >
                        {slide.cta_text}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-accent w-5 h-5" />
                      <span className="text-sm font-medium text-blue-100">{t("hero.check.recognizedDegrees")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="text-accent w-5 h-5" />
                      <span className="text-sm font-medium text-blue-100">{t("hero.check.internationalPartners")}</span>
                    </div>
                  </div>
                </div>

                {/* Media Content */}
                <div className="order-1 lg:order-2 relative w-full aspect-[4/3] lg:aspect-[16/11] rounded-2xl overflow-hidden shadow-2xl shadow-black/20 group">
                  <Image
                    src={slide.image_url || "/images/placeholder.jpg"}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                  <div className="absolute bottom-6 left-6 text-white max-w-xs z-20">
                    <p className="font-bold text-sm">{slide.category?.name || t("hero.fallback.category")}</p>
                    <p className="text-xs text-white/70">{slide.subtitle || t("hero.fallback.subtitle")}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {verifiedSlides.length > 1 && (
          <div className="absolute bottom-6 right-6 flex items-center gap-3 z-20">
            <div className="custom-dots flex gap-1.5 mr-4"></div>
            <button
              type="button"
              title="Slide précédent"
              className="custom-prev nav-button-base bg-white/10 text-white hover:bg-white hover:text-blue-600 dark:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              title="Slide suivant"
              className="custom-next nav-button-base bg-white text-primary hover:bg-accent hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  </section>
  );
}
