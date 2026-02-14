"use client";

import { useEffect, useState } from "react";
import {
  CookieConsent,
  readCookieConsent,
  saveCookieConsent,
  getDefaultConsent,
  CookieCategory,
} from "@/lib/cookie-consent";
import { useI18n } from "./i18n/LanguageProvider";

export default function CookieConsentBanner() {
  const { t } = useI18n();
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const savedConsent = readCookieConsent();
    setConsent(savedConsent);
    if (!savedConsent) {
      setShowBanner(true);
      setConsent(getDefaultConsent());
    }
  }, []);

  const handleAcceptAll = () => {
    if (!consent) return;
    const newConsent: CookieConsent = {
      ...consent,
      categories: {
        necessary: true,
        preferences: true,
        analytics: true,
        marketing: true,
      },
    };
    saveCookieConsent(newConsent);
    setConsent(newConsent);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    if (!consent) return;
    saveCookieConsent(consent);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleCategoryChange = (category: CookieCategory, value: boolean) => {
    if (!consent) return;
    setConsent({
      ...consent,
      categories: {
        ...consent.categories,
        [category]: value,
      },
    });
  };

  if (!showBanner) {
    return null;
  }

  const commonButtonStyles =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors";
  const primaryButtonStyles = `bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${commonButtonStyles}`;
  const secondaryButtonStyles = `bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${commonButtonStyles}`;
  const tertiaryButtonStyles = `text-sm text-gray-600 hover:underline ${commonButtonStyles}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm text-white p-4 shadow-lg">
      <div className="container mx-auto">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">{t("cookie.banner.title")}</h3>
              <p className="text-sm text-gray-300">
                {t("cookie.banner.description")}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowPreferences(true)}
                className={tertiaryButtonStyles}
              >
                {t("cookie.banner.managePreferences")}
              </button>
              <button onClick={handleAcceptAll} className={primaryButtonStyles}>
                {t("cookie.banner.acceptAll")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold">
                {t("cookie.preferences.title")}
              </h3>
              <p className="text-sm text-gray-300">
                {t("cookie.preferences.description")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2 p-3 bg-gray-800 rounded-md">
                <input
                  type="checkbox"
                  id="necessary"
                  checked={consent?.categories.necessary}
                  disabled
                  className="mt-1"
                />
                <div>
                  <label htmlFor="necessary" className="font-semibold">
                    {t("cookie.preferences.necessary.title")}
                  </label>
                  <p className="text-xs text-gray-400">
                    {t("cookie.preferences.necessary.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-gray-800 rounded-md">
                <input
                  type="checkbox"
                  id="preferences"
                  checked={consent?.categories.preferences}
                  onChange={(e) =>
                    handleCategoryChange("preferences", e.target.checked)
                  }
                  className="mt-1"
                />
                <div>
                  <label htmlFor="preferences" className="font-semibold">
                    {t("cookie.preferences.preferences.title")}
                  </label>
                  <p className="text-xs text-gray-400">
                    {t("cookie.preferences.preferences.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-gray-800 rounded-md">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={consent?.categories.analytics}
                  onChange={(e) =>
                    handleCategoryChange("analytics", e.target.checked)
                  }
                  className="mt-1"
                />
                <div>
                  <label htmlFor="analytics" className="font-semibold">
                    {t("cookie.preferences.analytics.title")}
                  </label>
                  <p className="text-xs text-gray-400">
                    {t("cookie.preferences.analytics.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-gray-800 rounded-md">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={consent?.categories.marketing}
                  onChange={(e) =>
                    handleCategoryChange("marketing", e.target.checked)
                  }
                  className="mt-1"
                />
                <div>
                  <label htmlFor="marketing" className="font-semibold">
                    {t("cookie.preferences.marketing.title")}
                  </label>
                  <p className="text-xs text-gray-400">
                    {t("cookie.preferences.marketing.description")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleSavePreferences}
                className={primaryButtonStyles}
              >
                {t("cookie.preferences.save")}
              </button>
              <button onClick={handleAcceptAll} className={secondaryButtonStyles}>
                {t("cookie.preferences.acceptAll")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
