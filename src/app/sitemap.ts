import type { MetadataRoute } from "next";
import { publicGet } from "@/lib/public-api";
import type { Post, Document, Etablissement, Project, PaginatedResponse } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mahajanga-univ.mg";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/actualites`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/documents`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/etablissements`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/universite`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/universite/historique`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/universite/organisation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/universite/textes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/president-message`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/partenaires`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/projets-internationale`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Fetch dynamic content
  const [posts, documents, etablissements, projects] = await Promise.all([
    fetchAllPosts(),
    fetchAllDocuments(),
    fetchAllEtablissements(),
    fetchAllProjects(),
  ]);

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/actualites/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const documentPages: MetadataRoute.Sitemap = documents.map((doc) => ({
    url: `${BASE_URL}/documents/${doc.slug}`,
    lastModified: doc.updated_at ? new Date(doc.updated_at) : new Date(doc.created_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const etablissementPages: MetadataRoute.Sitemap = etablissements.map((etab) => ({
    url: `${BASE_URL}/etablissements/${etab.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BASE_URL}/projets-internationale/${project.slug}`,
    lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...postPages,
    ...documentPages,
    ...etablissementPages,
    ...projectPages,
  ];
}

async function fetchAllPosts(): Promise<Post[]> {
  try {
    const response = await publicGet<PaginatedResponse<Post>>("/posts?per_page=100&status=published", {
      revalidate: 3600,
      tags: ["sitemap-posts"],
    });
    return response.data || [];
  } catch {
    return [];
  }
}

async function fetchAllDocuments(): Promise<Document[]> {
  try {
    const response = await publicGet<PaginatedResponse<Document>>("/documents?per_page=100", {
      revalidate: 3600,
      tags: ["sitemap-documents"],
    });
    return response.data || [];
  } catch {
    return [];
  }
}

async function fetchAllEtablissements(): Promise<Etablissement[]> {
  try {
    const response = await publicGet<{ data: Etablissement[] }>("/etablissements", {
      revalidate: 3600,
      tags: ["sitemap-etablissements"],
    });
    return response.data || [];
  } catch {
    return [];
  }
}

async function fetchAllProjects(): Promise<Project[]> {
  try {
    const response = await publicGet<{ data: Project[] }>("/projects", {
      revalidate: 3600,
      tags: ["sitemap-projects"],
    });
    return response.data || [];
  } catch {
    return [];
  }
}
