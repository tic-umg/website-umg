"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  CookieConsent,
  readCookieConsent,
  hasConsent as hasConsentLib,
} from "@/lib/cookie-consent";
import CookieConsentBanner from "@/components/cookie-consent-banner";

type CookieConsentContextType = {
  consent: CookieConsent | null;
  hasConsent: (category: "analytics" | "marketing" | "preferences")
    => boolean;
};

const CookieConsentContext = createContext<CookieConsentContextType>({
  consent: null,
  hasConsent: () => false,
});

export const useCookieConsent = () => useContext(CookieConsentContext);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const initialConsent = readCookieConsent();
    setConsent(initialConsent);

    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsent>;
      setConsent(customEvent.detail);
    };

    window.addEventListener("umg:cookie-consent-changed", handleConsentChange);

    return () => {
      window.removeEventListener(
        "umg:cookie-consent-changed",
        handleConsentChange
      );
    };
  }, []);

  const hasConsent = (category: "analytics" | "marketing" | "preferences") => {
      return hasConsentLib(category, consent);
  }

  return (
    <CookieConsentContext.Provider value={{ consent, hasConsent }}>
      {children}
      <CookieConsentBanner />
    </CookieConsentContext.Provider>
  );
}
