"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface SeoImageProps extends Omit<ImageProps, "alt"> {
  alt: string;
  fallbackSrc?: string;
}

/**
 * SEO-optimized Image component
 * - Enforces alt text (required)
 * - Automatic lazy loading (default in Next.js Image)
 * - Fallback image support
 * - WebP format optimization (handled by Next.js)
 */
export function SeoImage({
  alt,
  src,
  fallbackSrc = "/images/placeholder.jpg",
  ...props
}: SeoImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={handleError}
      loading={props.priority ? undefined : "lazy"}
      decoding="async"
    />
  );
}

/**
 * Generate structured alt text for different content types
 */
export function generateAltText(
  type: "article" | "profile" | "logo" | "banner" | "gallery",
  title: string,
  context?: string
): string {
  switch (type) {
    case "article":
      return `Image illustrant l'article: ${title}`;
    case "profile":
      return `Photo de ${title}${context ? `, ${context}` : ""}`;
    case "logo":
      return `Logo de ${title}`;
    case "banner":
      return `Bannière: ${title}`;
    case "gallery":
      return `${title}${context ? ` - ${context}` : ""}`;
    default:
      return title;
  }
}
