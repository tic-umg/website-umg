"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { PostForm, PostFormData } from "@/components/admin/posts/PostForm";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<PostFormData | undefined>(undefined);
  
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/posts/${postId}`);
        if (!res.ok) throw new Error("Post not found");
        
        const json = await res.json();
        const post = json.data;
        
        setInitialData({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || "",
            content_html: post.content_html || "",
            content_markdown: post.content_markdown || "",
            is_important: !!post.is_important,
            category_ids: post.categories?.map((c: any) => c.id) || [],
            tag_ids: post.tags?.map((t: any) => t.id) || [],
            status: post.status,
            notify_subscribers: false,
            cover_image_id: post.cover_image?.id || null,
            cover_image: post.cover_image || null,
            gallery: post.gallery?.map((m: any) => ({
                media: m,
                position: m.pivot?.position || 0,
                caption: m.pivot?.caption || ""
            })) || [],
        });

      } catch (error) {
        console.error("Failed to load data", error);
        alert("Erreur lors du chargement de l'article");
        router.push("/admin/posts");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [postId, router]);

  if (loading) {
      return <div className="p-8 text-center text-slate-500 animate-pulse">Chargement de l'article...</div>;
  }

  if (!initialData) return null;

  return <PostForm initialData={initialData} isEditing={true} />;
}
