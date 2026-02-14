export const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL;
import type { SiteSettings } from "./types";

const DEFAULT_TIMEOUT_MS = 8000;

type PublicGetOptions = {
  revalidate?: number;
  cache?: RequestCache;
  tags?: string[];
};

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const signal = init.signal ?? controller.signal;

  try {
    return await fetch(input, { ...init, signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function getBaseUrl() {
  return PUBLIC_API;
}

async function safeJson(res: Response) {
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return { message: txt };
  }
}

export async function publicGet<T>(
  path: string,
  options: number | PublicGetOptions = 60,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL missing");
  }

  const normalized: PublicGetOptions = typeof options === "number" ? { revalidate: options } : options;
  const cache = normalized.cache;
  const next =
    cache === "no-store"
      ? undefined
      : {
          revalidate: normalized.revalidate ?? 60,
          tags: normalized.tags,
        };

  const res = await fetchWithTimeout(`${baseUrl}${path}`, {
    headers: { Accept: "application/json" },
    cache,
    next,
  }, timeoutMs);

  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(body?.message || `API error ${res.status}`);
  }
  return res.json();
}

export async function getSiteSettings() {
  return publicGet<SiteSettings>("/settings", 300);
}

export async function publicPost<T>(path: string, body: any, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL missing");
  }

  const res = await fetchWithTimeout(`${baseUrl}${path}`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Accept: "application/json" 
    },
    body: JSON.stringify(body),
  }, timeoutMs);

  if (!res.ok) {
    const json = await safeJson(res);
    throw new Error(json?.message || `API error ${res.status}`);
  }
  return res.json();
}
