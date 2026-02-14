"use client";

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, MapPin, Mail, Phone, GraduationCap } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';
import { useI18n } from "@/components/i18n/LanguageProvider";

interface SiteFooterProps {
  settings?: SiteSettings | null;
}

function limitString(value: string, max = 100) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
}

export default function SiteFooter({ settings }: SiteFooterProps) {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  const social = settings?.social;
  const siteDescription = limitString(
    settings?.site_description ||
      "L'établissement public d'enseignement supérieur de référence, engagé pour le développement durable et l'innovation à Madagascar.",
    100
  );

  return (
    <footer className="bg-primary dark:bg-[#0B1120] text-white pt-20 pb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                
                {/* Column 1: Brand */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                            <GraduationCap className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <span className="block text-lg font-black tracking-tight leading-none">UMG</span>
                            <span className="text-[10px] text-white/60 uppercase font-medium">Université de Mahajanga</span>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed text-blue-100/80">
                        {siteDescription}
                    </p>
                    <div className="flex gap-3">
                        {social?.facebook && (
                            <a href={social.facebook} className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all text-white">
                                <Facebook className="w-4 h-4" />
                            </a>
                        )}
                        {social?.linkedin && (
                            <a href={social.linkedin} className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all text-white">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        )}
                        {social?.twitter && (
                            <a href={social.twitter} className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all text-white">
                                <Twitter className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Column 2: Contact */}
                <div>
                    <h4 className="text-white font-bold mb-6 text-base flex items-center gap-2">
                        {t("footer.contact")}
                        <span className="h-px flex-grow bg-white/10 ml-2"></span>
                    </h4>
                    <ul className="flex flex-col gap-4 text-sm text-blue-100/80">
                        <li className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            <span>{settings?.site_address || "B.P. 652, Campus Ambondrona"}<br/>Mahajanga 401, Madagascar</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-accent shrink-0" />
                            <span>{settings?.site_phone || "+261 20 62 227 24"}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-accent shrink-0" />
                            <span>{settings?.site_email || "contact@univ-mahajanga.mg"}</span>
                        </li>
                    </ul>
                </div>

                {/* Column 3: Accès Rapide */}
                <div>
                    <h4 className="text-white font-bold mb-6 text-base flex items-center gap-2">
                        {t("footer.quickAccess")}
                        <span className="h-px flex-grow bg-white/10 ml-2"></span>
                    </h4>
                    <ul className="flex flex-col gap-3 text-sm text-blue-100/80">
                         <li><Link className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block" href="#">Calendrier Universitaire</Link></li>
                        <li><Link className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block" href="#">Bibliothèque Numérique</Link></li>
                        <li><Link className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block" href="#">Offres de Stage</Link></li>
                        <li><Link className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block" href="#">Vie Associative</Link></li>
                        <li><Link className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block" href="#">Bourses et Aides</Link></li>
                    </ul>
                </div>

                {/* Column 4: Institution */}
                <div>
                    <h4 className="text-white font-bold mb-6 text-base flex items-center gap-2">
                        {t("footer.institution")}
                        <span className="h-px flex-grow bg-white/10 ml-2"></span>
                    </h4>
                    <ul className="flex flex-col gap-3 text-sm text-blue-100/80">
                        <li><Link className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block" href="/president-message">Présidence</Link></li>
                        <li><Link className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block" href="#">Recherche</Link></li>
                        <li><Link className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block" href="/partenaires">International</Link></li>
                        <li><Link className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block" href="#">Alumni</Link></li>
                        <li><Link className="hover:text-blue-600 hover:translate-x-1 transition-all inline-block" href="/contact">Recrutement</Link></li>
                    </ul>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-blue-200/60">
                <p>© {currentYear} {settings?.site_name || "Université de Mahajanga"}. Tous droits réservés.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link className="hover:text-blue-400 transition-colors" href="/mentions-legales">{t("footer.legal")}</Link>
                    <Link className="hover:text-blue-400 transition-colors" href="/politique-de-confidentialite">{t("footer.privacy")}</Link>
                    <Link className="hover:text-blue-400 transition-colors" href="/plan-du-site">{t("footer.sitemap")}</Link>
                </div>
            </div>
        </div>
    </footer>
  );
}
