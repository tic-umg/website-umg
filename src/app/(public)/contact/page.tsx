import Container from "@/components/Container";
import { getSiteSettings } from "@/lib/public-api";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import ContactForm from "./ContactForm";
import { getServerI18n } from "@/i18n/server";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mahajanga-univ.mg";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const siteName = settings?.site_name || "Université de Mahajanga";
  const pageUrl = `${BASE_URL}/contact`;

  return {
    title: "Contact",
    description: "Contactez l'Université de Mahajanga. Adresse, téléphone, email et formulaire de contact pour toutes vos questions et demandes d'information.",
    keywords: ["contact", "adresse", "téléphone", "email", "université", "mahajanga", "inscription", "admission"],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "website",
      locale: "fr_MG",
      url: pageUrl,
      siteName,
      title: `Contact | ${siteName}`,
      description: "Contactez l'Université de Mahajanga pour toutes vos questions",
    },
    twitter: {
      card: "summary",
      title: `Contact | ${siteName}`,
      description: "Contactez l'Université de Mahajanga pour toutes vos questions",
    },
  };
}

export default async function ContactPage() {
  const { t } = await getServerI18n();
  const settings = await getSiteSettings().catch(() => null);
  const address = settings?.site_address || "Campus Universitaire, Mahajanga 401, Madagascar";
  const phone = settings?.site_phone || "+261 32 00 000 00";
  const email = settings?.site_email || "contact@umg.mg";

  return (
    <main className="bg-slate-50/70 dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-10 md:py-12">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("contact.kicker")}</p>
            <h1 className="mt-4 text-xl md:text-3xl font-bold tracking-tight">{t("contact.title")}</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              {t("contact.subtitle")}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 pb-4 shadow-lg dark:border-slate-800 dark:bg-slate-900 flex flex-col">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t("contact.form.title")}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {t("contact.form.subtitle")}
              </p>
              <ContactForm />
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t("contact.details.title")}</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-indigo-500" />
                    {address}
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-indigo-500" />
                    <a href={`tel:${phone}`} className="hover:text-blue-600">
                      {phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    <a href={`mailto:${email}`} className="hover:text-blue-600">
                      {email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    {t("contact.hours")}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <iframe
                  title="Carte Université de Mahajanga"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=46.30%2C-15.76%2C46.40%2C-15.70&layer=mapnik&marker=-15.74%2C46.33"
                  className="h-64 w-full rounded-2xl"
                />
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 p-6 text-white shadow-lg">
                <h3 className="text-lg font-semibold">{t("contact.quick.title")}</h3>
                <p className="mt-2 text-sm text-indigo-100">
                  {t("contact.quick.items")}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
