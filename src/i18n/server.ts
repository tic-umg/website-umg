import { cookies, headers } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, normalizeLang, type Lang } from "./lang";
import { t, type TranslationKey } from "./t";

export async function getRequestLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LANG_COOKIE)?.value;
  if (cookieValue) return normalizeLang(cookieValue);
  const headerStore = await headers();
  const accept = headerStore.get("accept-language");
  if (accept) return normalizeLang(accept.split(",")[0] ?? DEFAULT_LANG);
  return DEFAULT_LANG;
}

export async function getServerI18n() {
  const lang = await getRequestLang();
  return {
    lang,
    t: (key: TranslationKey, vars?: Record<string, string | number>) => t(lang, key, vars),
  };
}
