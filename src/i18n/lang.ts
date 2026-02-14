export type Lang = "fr" | "en";

export const DEFAULT_LANG: Lang = "fr";
export const LANG_COOKIE = "umg_lang";

export function normalizeLang(value?: string | null): Lang {
  if (!value) return DEFAULT_LANG;
  const v = value.trim().toLowerCase();
  if (v === "fr" || v.startsWith("fr-")) return "fr";
  if (v === "en" || v.startsWith("en-")) return "en";
  return DEFAULT_LANG;
}

