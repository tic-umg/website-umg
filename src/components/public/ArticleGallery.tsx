"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const sampleImages = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
];

type ArticleGalleryProps = {
  images?: string[];
};

export default function ArticleGallery({ images = sampleImages }: ArticleGalleryProps) {
  const galleryImages = useMemo(() => (images.length ? images : sampleImages), [images]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openAt = (index: number) => setActiveIndex(index);
  const close = () => setActiveIndex(null);

  const goPrev = () =>
    setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + galleryImages.length) % galleryImages.length));
  const goNext = () =>
    setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % galleryImages.length));

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {galleryImages.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => openAt(index)}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/5 dark:bg-white/5"
            aria-label={`Voir l'image ${index + 1}`}
          >
            <img
              src={src}
              alt={`Galerie ${index + 1}`}
              className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <button
            type="button"
            onClick={close}
            className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Fermer la galerie"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 md:left-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Image précédente"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="max-w-4xl w-full">
            <img
              src={galleryImages[activeIndex]}
              alt={`Image ${activeIndex + 1} en grand`}
              className="mx-auto max-h-[80vh] w-full rounded-3xl object-contain shadow-2xl"
            />
          </div>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 md:right-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Image suivante"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
