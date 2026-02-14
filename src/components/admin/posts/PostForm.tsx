"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { MediaPickerModal, Media } from "../media/MediaPickerModal";
import { GalleryEditor, GalleryItem } from "./GalleryEditor";
import { markdownToHtml } from "@/lib/markdown";

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export interface PostFormData {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  content_markdown?: string;
  category_ids: number[];
  tag_ids: number[];
  status: string;
  notify_subscribers: boolean;
  is_important?: boolean;
  cover_image_id?: number | null;
  cover_image?: Media | null;
  gallery: GalleryItem[];
}

interface PostFormProps {
  initialData?: PostFormData;
  isEditing?: boolean;
}

export function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [contentMode, setContentMode] = useState<"rich" | "markdown">(
    initialData?.content_markdown ? "markdown" : "rich"
  );
  
  // Config state
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Modal State
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);

  // Form State
  const [formData, setFormData] = useState<PostFormData>(
    initialData || {
      title: "",
      slug: "",
      excerpt: "",
      content_html: "",
      content_markdown: "",
      category_ids: [],
      tag_ids: [],
      status: "draft",
      notify_subscribers: false,
      is_important: false,
      cover_image_id: null,
      cover_image: null,
      gallery: [],
    }
  );

  // Load Categories & Tags
  useEffect(() => {
    async function fetchConfig() {
      try {
        const [catsRes, tagsRes] = await Promise.all([
          fetch("/api/admin/categories?per_page=100"),
          fetch("/api/admin/tags?per_page=100"),
        ]);
        const catsData = await catsRes.json();
        const tagsData = await tagsRes.json();
        setCategories(catsData.data || []);
        setTags(tagsData.data || []);
      } catch (error) {
        console.error("Failed to load config", error);
      }
    }
    fetchConfig();
  }, []);

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(title: string) {
    setFormData((prev) => {
        const updates: any = { title };
        if (!isEditing && (!prev.slug || prev.slug === generateSlug(prev.title))) {
            updates.slug = generateSlug(title);
        }
        return { ...prev, ...updates };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const markdown = (formData.content_markdown || "").trim();
    const content_html =
      contentMode === "markdown" ? (markdown ? markdownToHtml(markdown) : "") : formData.content_html;

    if (!content_html || content_html.trim().length === 0) {
      alert("Le contenu est obligatoire.");
      setSaving(false);
      return;
    }

    const payload = {
        ...formData,
        content_html,
        content_markdown: contentMode === "markdown" ? (markdown || null) : null,
        gallery: formData.gallery.map(item => ({
            media_id: item.media.id,
            position: item.position,
            caption: item.caption
        }))
    };

    try {
      const url = isEditing && initialData?.id
        ? `/api/admin/posts/${initialData.id}`
        : "/api/admin/posts";
      
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        let newsletterQueued: number | undefined;
        let newsletterCampaignId: number | undefined;
        let resolvedSlug: string | undefined;

        try {
          const json = await res.json().catch(() => null);
          resolvedSlug = (json?.data?.slug as string | undefined) || formData.slug;
          newsletterQueued = json?.meta?.newsletter?.queued as number | undefined;
          newsletterCampaignId = json?.meta?.newsletter?.campaign_id as number | undefined;

          if (resolvedSlug) {
            await fetch("/api/admin/revalidate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                paths: ["/actualites", `/actualites/${resolvedSlug}`],
              }),
            }).catch(() => null);
          }
        } catch {
          // ignore
        }

        if (formData.notify_subscribers && typeof newsletterQueued === "number") {
          const params = new URLSearchParams();
          params.set("newsletterQueued", String(newsletterQueued));
          if (typeof newsletterCampaignId === "number") {
            params.set("newsletterCampaignId", String(newsletterCampaignId));
          }
          router.push(`/admin/posts?${params.toString()}`);
        } else {
          router.push("/admin/posts");
        }
        router.refresh();
      } else {
        const err = await res.json();
        alert("Erreur: " + (err.message || "Impossible d'enregistrer l'article"));
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  // Media Handlers
  const handleSelectCover = (medias: Media[]) => {
      if (medias.length > 0) {
          setFormData(prev => ({
              ...prev,
              cover_image_id: medias[0].id,
              cover_image: medias[0]
          }));
      }
  };

  const handleRemoveCover = () => {
      setFormData(prev => ({
          ...prev,
          cover_image_id: null,
          cover_image: null
      }));
  };

  const handleAddGallery = (medias: Media[]) => {
      setFormData(prev => {
          const currentCount = prev.gallery.length;
          const newItems: GalleryItem[] = medias.map((m, i) => ({
              media: m,
              position: currentCount + i,
              caption: ""
          }));
          return {
              ...prev,
              gallery: [...prev.gallery, ...newItems]
          };
      });
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const tagOptions = tags.map((t) => ({ value: t.id, label: t.name }));

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditing ? "Modifier l'article" : "Nouvel article"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {isEditing ? `Édition de : ${initialData?.title}` : "Rédigez et publiez un nouveau contenu"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()}>Annuler</Button>
            <Button
                onClick={handleSubmit}
                loading={saving}
                icon={<Save className="w-4 h-4" />}
            >
                Enregistrer
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody className="space-y-6">
              <Input
                label="Titre"
                placeholder="Titre de l'article"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="text-lg font-semibold"
              />
              
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                helperText="URL de l'article"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Extrait
                </label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Court résumé..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Contenu
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setContentMode("rich")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                        contentMode === "rich"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                      }`}
                    >
                      Riche
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentMode("markdown")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                        contentMode === "markdown"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                      }`}
                    >
                      Markdown
                    </button>
                  </div>
                </div>

                {contentMode === "rich" ? (
                  <RichTextEditor
                    value={formData.content_html}
                    onChange={(val) => setFormData({ ...formData, content_html: val, content_markdown: "" })}
                    minHeight="min-h-[440px]"
                    placeholder="Rédigez votre article ici..."
                  />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <textarea
                        value={formData.content_markdown || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            content_markdown: e.target.value,
                            content_html: "",
                          })
                        }
                        rows={18}
                        placeholder="Écrivez en Markdown..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Astuce : utilisez # titres, **gras**, - listes, &gt; citations.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                        Aperçu
                      </p>
                    <div
                      className="prose prose-slate dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                          __html: markdownToHtml((formData.content_markdown || "").trim()),
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Gallery Section */}
          <Card>
            <CardHeader>Galerie photos</CardHeader>
            <CardBody>
                <GalleryEditor
                    items={formData.gallery}
                    onChange={(items) => setFormData({ ...formData, gallery: items })}
                    onAdd={() => setShowGalleryPicker(true)}
                />
            </CardBody>
          </Card>
        </div>

        {/* Sidebar (Right) */}
        <div className="lg:col-span-1 space-y-6">
            {/* Publication */}
            <Card>
            <CardHeader>Publication</CardHeader>
            <CardBody className="space-y-4">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-900 dark:text-white">
                        <input
                            type="checkbox"
                            checked={!!formData.is_important}
                            onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Article important (mis en avant)
                    </label>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Statut
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="draft">Brouillon</option>
                            <option value="published">Publié</option>
                            <option value="archived">Archivé</option>
                        </select>
                    </div>

                    {formData.status === 'published' && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/50">
                            <div className="mt-0.5">
                                <input
                                    type="checkbox"
                                    id="notify"
                                    checked={formData.notify_subscribers}
                                    onChange={(e) => setFormData({ ...formData, notify_subscribers: e.target.checked })}
                                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                />
                            </div>
                            <label htmlFor="notify" className="text-sm cursor-pointer select-none">
                                <span className="font-medium text-amber-900 dark:text-amber-100 block">Envoyer aux abonnés</span>
                                <span className="text-amber-700 dark:text-amber-300 text-xs">
                                    {isEditing ? "Renvoyer une newsletter" : "Envoyer automatique"}
                                </span>
                            </label>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Cover Image */}
            <Card>
                <CardHeader>Image à la une</CardHeader>
                <CardBody>
                    {formData.cover_image ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                            <img
                                src={formData.cover_image.url}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="danger" size="sm" onClick={handleRemoveCover}>
                                    <X className="w-4 h-4 mr-1" /> Retirer
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => setShowCoverPicker(true)}
                            className="aspect-video cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-400 dark:hover:text-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 transition-all"
                        >
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Choisir une image</span>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Categorization */}
            <Card>
                <CardHeader>Classement</CardHeader>
                <CardBody className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Catégories
                        </label>
                        <MultiSelect
                            options={categoryOptions}
                            value={formData.category_ids}
                            onChange={(ids) => setFormData({ ...formData, category_ids: ids as number[] })}
                            placeholder="Sélectionner..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Tags
                        </label>
                        <MultiSelect
                            options={tagOptions}
                            value={formData.tag_ids}
                            onChange={(ids) => setFormData({ ...formData, tag_ids: ids as number[] })}
                            placeholder="Ajouter des tags..."
                        />
                    </div>
                </CardBody>
            </Card>
        </div>
      </div>

      {/* Modals */}
      <MediaPickerModal
        isOpen={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        onSelect={handleSelectCover}
        multiple={false}
      />

      <MediaPickerModal
        isOpen={showGalleryPicker}
        onClose={() => setShowGalleryPicker(false)}
        onSelect={handleAddGallery}
        multiple={true}
      />
    </div>
  );
}
