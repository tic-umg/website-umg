"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowUpRight, Send, Folder } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";

export default function NewsletterSection() {
  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Précharger la page de confirmation
  useEffect(() => {
    router.prefetch("/newsletter/confirm");
  }, [router]);

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail) {
      toast.warning(t("home.newsletter.requiredEmail"));
      return;
    }

    setIsLoading(true);
    const emailToSend = newsletterEmail;

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: emailToSend }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // Email déjà existant ou autre erreur
        toast.error(data?.message || t("home.newsletter.errorDefault"));
        setIsLoading(false);
        return;
      }

      // Succès - rediriger vers la page de confirmation
      router.push(`/newsletter/confirm?email=${encodeURIComponent(emailToSend)}`);
    } catch (error) {
      console.error("Newsletter subscribe error:", error);
      toast.error(t("home.newsletter.errorDefault"));
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-[#101622]">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Newsletter Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-2xl p-8 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20" />
              <div className="absolute -left-5 -bottom-5 w-32 h-32 rounded-full bg-white/20" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 mb-4">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t("home.newsletter.badge")}</span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {t("home.newsletter.title")}
              </h3>
              <p className="text-blue-100 text-sm mb-6">
                {t("home.newsletter.subtitle")}
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(event) => setNewsletterEmail(event.target.value)}
                      placeholder={t("home.newsletter.emailPlaceholder")}
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 whitespace-nowrap shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                        {t("home.newsletter.submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t("home.newsletter.subscribeCta")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Candidature Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white" />
              <div className="absolute -left-5 -bottom-5 w-32 h-32 rounded-full bg-white" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 rounded-full px-3 py-1.5 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider">{t("home.apply.badge")}</span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {t("home.apply.title")}
              </h3>
              <p className="text-slate-300 text-sm mb-6">
                {t("home.apply.subtitle")}
              </p>

	              <div className="flex flex-wrap gap-3">
	                <Link
	                  href="/etablissements"
	                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3 text-sm font-bold transition-colors shadow-lg"
	                >
	                  {t("home.apply.cta")}
	                  <ArrowUpRight className="w-4 h-4" />
	                </Link>
		                <Link
	                  href="/documents"
		                  className="inline-flex items-center gap-2 rounded-xl border border-slate-600 hover:border-slate-500 text-white px-6 py-3 text-sm font-bold hover:bg-slate-700/50 transition-colors"
		                >
		                  <Folder className="w-4 h-4" />
		                  {t("home.apply.secondary")}
		                </Link>
	              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
