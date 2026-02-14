"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export default function PostViewsCount({ slug, initialViews = 0 }: { slug: string; initialViews?: number }) {
  const [views, setViews] = useState<number>(initialViews);

  useEffect(() => {
    let cancelled = false;

    async function track() {
      try {
        const res = await fetch(`${API_URL}/posts/${encodeURIComponent(slug)}/view`, {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json().catch(() => null);
        const nextViews = json?.data?.views_count;
        if (!cancelled && typeof nextViews === "number") setViews(nextViews);
      } catch {
        // ignore
      }
    }

    void track();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <span className="inline-flex items-center gap-2">
      <Eye className="h-4 w-4" />
      {views} vue{views > 1 ? "s" : ""}
    </span>
  );
}

