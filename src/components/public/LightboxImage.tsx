"use client";

import { useEffect, useState } from "react";
import type { WheelEventHandler } from "react";
import clsx from "clsx";

type LightboxImageProps = {
  src: string;
  alt: string;
  className?: string;
  caption?: string;
};

export default function LightboxImage({ src, alt, className, caption }: LightboxImageProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return;
    setZoom(1);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const handleWheel: WheelEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -0.1 : 0.1;
    setZoom((current) => Math.min(3, Math.max(1, Number((current + direction).toFixed(2)))));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "group relative block overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800",
          className
        )}
        aria-label="Agrandir l'image"
      >
        <img
          src={src}
          alt={alt}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/0 text-xs font-semibold uppercase tracking-[0.2em] text-white opacity-0 transition group-hover:bg-slate-900/50 group-hover:opacity-100">
          Agrandir
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-zoom-out"
            aria-label="Fermer l'image"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white"
            aria-label="Fermer l'image"
          >
            ×
          </button>
          <div
            className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-auto"
            onWheel={handleWheel}
          >
            <img
              src={src}
              alt={alt}
              className="h-full w-full rounded-2xl object-contain transition-transform duration-150"
              style={{ transform: `scale(${zoom})` }}
            />
            {caption && (
              <p className="mt-4 text-center text-sm text-slate-100">{caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
