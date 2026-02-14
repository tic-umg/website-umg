"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Lightbulb, Users, Globe, Award, Play } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";

type AboutSectionProps = {
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
};

export default function AboutSection({ videoUrl, videoPosterUrl }: AboutSectionProps) {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  return (
    <section className="py-16 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Content */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 text-xs font-bold uppercase rounded-full tracking-wider">
                {t("about.badge")}
              </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-6">
              {t("about.title.before")}{" "}
              <span className="text-primary dark:text-blue-400">{t("about.title.highlight")}</span>{" "}
              {t("about.title.after")}
            </h2>
            
            <div className="prose prose-slate dark:prose-invert text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              <p>
                {t("about.lead")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="size-10 rounded-lg bg-slate-50 dark:bg-slate-800 text-primary dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t("about.value.innovation.title")}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("about.value.innovation.desc")}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="size-10 rounded-lg bg-slate-50 dark:bg-slate-800 text-primary dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t("about.value.inclusion.title")}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("about.value.inclusion.desc")}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="size-10 rounded-lg bg-slate-50 dark:bg-slate-800 text-primary dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t("about.value.opening.title")}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("about.value.opening.desc")}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="size-10 rounded-lg bg-slate-50 dark:bg-slate-800 text-primary dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t("about.value.excellence.title")}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("about.value.excellence.desc")}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <a href="/etablissements" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-light transition-colors shadow-lg shadow-blue-900/10">
                {t("about.cta.establishments")}
              </a>
            </div>
          </div>

          {/* Video / Image */}
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -right-4 -bottom-4 w-2/3 h-2/3 bg-slate-100 dark:bg-slate-800 rounded-2xl -z-10"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 aspect-video group">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                controls
                preload="none"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              >
                <source src={videoUrl || "/videos/umg-about.mp4"} type="video/mp4" />
                {t("about.video.unsupported")}
              </video>
              
              {/* Custom Poster Image Overlay using Next.js Image for optimization */}
              {!isPlaying && (
                <div 
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.play();
                      setIsPlaying(true);
                    }
                  }}
                >
                  <Image
                    src={videoPosterUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDcpjwCYNIEJfBuhZ1IHDeBOHrR4PVVxEDu_xqJVpLCisZNz5JjtFVICSnSujXPhiUJ6EVumFAE4I6jfhzazjnR_Y-9PzjLWcjF7e9_f1ysmQAhRjSqVM__i9m03z70PIfh5xJIQ33pbumIqE17sm3vvjaPw1MdxHC9RwwmI4kLvditZqu5mzrpUfvVcGIeQyTyEe830Ao7OuMZNARkWqb1B6mupfZnwtC5oTZm9gqGYvA_Ehq64Yka-Pqvguf1SK3cRwqaamk4xPo"}
                    alt="Présentation UMG"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-16 rounded-full bg-white/90 text-primary shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-white pl-1">
                      <Play className="w-7 h-7 fill-current" />
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}