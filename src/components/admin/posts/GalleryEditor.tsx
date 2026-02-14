"use client";

import { Media } from "../media/MediaPickerModal";
import { Button } from "@/components/ui/Button";
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { clsx } from "clsx";

export interface GalleryItem {
  media: Media;
  position: number;
  caption?: string;
}

interface GalleryEditorProps {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  onAdd: () => void;
}

export function GalleryEditor({ items, onChange, onAdd }: GalleryEditorProps) {
  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    updatePositions(newItems);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const newItems = [...items];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    // Swap
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    updatePositions(newItems);
  };

  const updatePositions = (newItems: GalleryItem[]) => {
    // Re-index positions
    const reindexed = newItems.map((item, idx) => ({ ...item, position: idx }));
    onChange(reindexed);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {items.map((item, index) => (
          <div
            key={`${item.media.id}-${index}`}
            className="group relative w-32 aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          >
            {/* Image */}
            <img
              src={item.media.url}
              alt={item.media.alt || "Gallery Image"}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === items.length - 1}
                  className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1 rounded-full bg-red-500/80 hover:bg-red-600 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Position Badge */}
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white">
                #{index + 1}
            </div>
          </div>
        ))}

        {/* Add Button */}
        <button
          type="button"
          onClick={onAdd}
          className="w-32 aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-indigo-600 hover:border-indigo-400 dark:hover:text-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
        >
          <Plus className="w-8 h-8 mb-1" />
          <span className="text-xs font-medium">Ajouter</span>
        </button>
      </div>
    </div>
  );
}
