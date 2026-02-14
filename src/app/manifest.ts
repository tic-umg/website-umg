import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Universite de Mahajanga",
    short_name: "UMG",
    description: "Site officiel de l'Universite de Mahajanga",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f6f8",
    theme_color: "#101622",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
