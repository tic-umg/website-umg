"use client";

export type CookieCategory = "necessary" | "preferences" | "analytics" | "marketing";

export type CookieConsent = {
  version: number;
  updatedAt: string;
  categories: Record<CookieCategory, boolean>;
};

const CONSENT_COOKIE_NAME = "umg_cookie_consent";
const CONSENT_VERSION = 1;
const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60; // 6 months

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=/`,
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

export function getDefaultConsent(): CookieConsent {
  return {
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    categories: {
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
    },
  };
}

export function readCookieConsent(): CookieConsent | null {
  const raw = readCookie(CONSENT_COOKIE_NAME);
  if (!raw) return null;
  const parsed = safeJsonParse<CookieConsent>(raw);
  if (!parsed) return null;
  if (parsed.version !== CONSENT_VERSION) return null;
  if (!parsed.categories?.necessary) return null;
  return parsed;
}

export function saveCookieConsent(consent: CookieConsent) {
  const normalized: CookieConsent = {
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    categories: {
      necessary: true,
      preferences: Boolean(consent.categories?.preferences),
      analytics: Boolean(consent.categories?.analytics),
      marketing: Boolean(consent.categories?.marketing),
    },
  };

  writeCookie(CONSENT_COOKIE_NAME, JSON.stringify(normalized));
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("umg:cookie-consent-changed", { detail: normalized })
    );
  }
}

export function hasConsent(category: CookieCategory, consent?: CookieConsent | null) {
  const resolved = consent ?? readCookieConsent();
  if (!resolved) return category === "necessary" ? true : false;
  return Boolean(resolved.categories[category]);
}

