"use client";

import { useEffect, useState, use } from "react";
import type { Project } from "@/lib/types";
import { ProjectForm, type ProjectFormInitialData, type ProjectMeta } from "@/components/admin/projects/ProjectForm";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<ProjectFormInitialData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/projects/${id}`, { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        const project: Project = json.data;
        setInitialData({
          id: project.id,
          title: project.title || "",
          slug: project.slug || "",
          kicker: project.kicker || "Projets Internationale",
          description: project.description || "",
          is_active: project.is_active,
          hero_image_url: project.hero_image_url || null,
          meta: (project.meta as ProjectMeta) || null,
        });
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return <ProjectForm initialData={initialData || undefined} isEditing />;
}
