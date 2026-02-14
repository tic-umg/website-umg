"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, normalizeLang, type Lang } from "@/i18n/lang";
import { t as translate, type TranslationKey } from "@/i18n/t";

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function setLangCookie(lang: Lang) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LANG_COOKIE}=${lang}; Max-Age=${oneYear}; Path=/; SameSite=Lax`;
}

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(() => normalizeLang(initialLang));

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next);
      setLangCookie(next);
      document.documentElement.lang = next;
      router.refresh();
    },
    [router]
  );

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

