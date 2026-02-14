import { messagesEn, type TranslationKey } from "./messages.en";
import { messagesFr } from "./messages.fr";
import type { Lang } from "./lang";

const messagesByLang: Record<Lang, Record<TranslationKey, string>> = {
  fr: messagesFr,
  en: messagesEn,
};

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key];
    return v === undefined || v === null ? `{${key}}` : String(v);
  });
}

export function t(lang: Lang, key: TranslationKey, vars?: Record<string, string | number>) {
  const table = messagesByLang[lang] ?? messagesByLang.fr;
  const raw = table[key] ?? messagesByLang.fr[key] ?? key;
  return interpolate(raw, vars);
}

export type { TranslationKey };

