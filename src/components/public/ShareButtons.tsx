"use client";

import { Facebook, Linkedin, Twitter } from "lucide-react";
import { usePathname } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahajanga-univ.mg";

export default function ShareButtons() {
  const pathname = usePathname();
  const url = `${baseUrl}${pathname}`;
  const encoded = encodeURIComponent(url);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-300">Partager</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-300"
        aria-label="Partager sur Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-sky-500 hover:text-white dark:bg-slate-800 dark:text-slate-300"
        aria-label="Partager sur X"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-blue-700 hover:text-white dark:bg-slate-800 dark:text-slate-300"
        aria-label="Partager sur LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>
    </div>
  );
}
