import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { NetworkStatusBanner } from "@/components/ui/NetworkStatusBanner";
import { CookieConsentProvider } from "@/components/cookie-consent-provider";
import { getRequestLang } from "@/i18n/server";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { ApiPreconnect } from "@/components/ApiPreconnect";
import "./globals.css";

import { Nunito } from "next/font/google"; // Updated font requested by user

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Université de Mahajanga",
  description: "Site officiel de l'Université de Mahajanga",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#101622",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getRequestLang();
  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${nunito.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider initialLang={lang}>
            <CookieConsentProvider>
              <ApiPreconnect />
              <PwaRegister />
              <NetworkStatusBanner />
              {children}
              <Analytics />
            </CookieConsentProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
