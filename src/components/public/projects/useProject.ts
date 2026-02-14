"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export function useProject(slug: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"not_found" | "error" | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/projects/${encodeURIComponent(slug)}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          if (cancelled) return;
          setProject(null);
          setError(res.status === 404 ? "not_found" : "error");
          setLoading(false);
          return;
        }
        const json = await res.json();
        const data = json?.data as Project | undefined;
        if (!data || cancelled) return;
        setProject(data);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setProject(null);
        setError("error");
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { project, loading, error };
}
