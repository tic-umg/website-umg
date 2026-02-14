"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { MediaPickerModal, type Media } from "@/components/admin/media/MediaPickerModal";

type BadgeVariant = "primary" | "amber" | "emerald";
type TabType = "richText" | "gallery" | "carousel";

type MetaBadge = { variant: BadgeVariant; label: string };
type MetaImage = { src: string; alt?: string; caption?: string | null; media_id?: number };
type MetaSlide = { src: string; alt?: string; title?: string; subtitle?: string; media_id?: number };

type MetaTab = {
  key: string;
  label: string;
  type: TabType;
  content_html?: string;
  images?: MetaImage[];
  slides?: MetaSlide[];
};

export type ProjectMeta = {
  hero?: { badges?: MetaBadge[] };
  tabs?: MetaTab[];
};

export type ProjectFormInitialData = {
  id?: number;
  title: string;
  slug: string;
  kicker?: string | null;
  description?: string | null;
  hero_image_url?: string | null;
  is_active: boolean;
  meta?: ProjectMeta | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeMeta(value: unknown): ProjectMeta {
  if (!isRecord(value)) return {};
  return value as ProjectMeta;
}

export function ProjectForm({
  initialData,
  isEditing,
}: {
  initialData?: ProjectFormInitialData;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ tabKey: string; mode: "gallery" | "carousel" } | null>(null);

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(initialData?.hero_image_url ?? null);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    kicker: initialData?.kicker ?? "Projets Internationale",
    description: initialData?.description ?? "",
    is_active: initialData?.is_active ?? true,
  });

  const [meta, setMeta] = useState<ProjectMeta>(() => safeMeta(initialData?.meta));

  const tabs = meta.tabs || [];
  const badges = meta.hero?.badges || [];

  const openPicker = (tabKey: string, mode: "gallery" | "carousel") => {
    setMediaPickerTarget({ tabKey, mode });
    setShowMediaPicker(true);
  };

  const updateTab = (tabKey: string, updater: (tab: MetaTab) => MetaTab) => {
    setMeta((prev) => {
      const nextTabs = (prev.tabs || []).map((t) => (t.key === tabKey ? updater(t) : t));
      return { ...prev, tabs: nextTabs };
    });
  };

  const addTab = () => {
    const key = slugify(`tab-${Date.now()}`);
    setMeta((prev) => ({
      ...prev,
      tabs: [
        ...(prev.tabs || []),
        { key, label: "Nouvel onglet", type: "richText", content_html: "<p>Contenu…</p>" },
      ],
    }));
  };

  const removeTab = (tabKey: string) => {
    if (!confirm("Supprimer cet onglet ?")) return;
    setMeta((prev) => ({ ...prev, tabs: (prev.tabs || []).filter((t) => t.key !== tabKey) }));
  };

  const addBadge = () => {
    setMeta((prev) => ({
      ...prev,
      hero: {
        ...(prev.hero || {}),
        badges: [...(prev.hero?.badges || []), { variant: "primary", label: "Nouveau badge" }],
      },
    }));
  };

  const removeBadge = (idx: number) => {
    setMeta((prev) => ({
      ...prev,
      hero: { ...(prev.hero || {}), badges: (prev.hero?.badges || []).filter((_, i) => i !== idx) },
    }));
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setHeroPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleMediaPicked = (picked: Media) => {
    if (!mediaPickerTarget) return;

    updateTab(mediaPickerTarget.tabKey, (tab) => {
      if (mediaPickerTarget.mode === "gallery") {
        const nextImages: MetaImage[] = [
          ...(tab.images || []),
          { src: picked.url, alt: picked.alt || undefined, caption: null, media_id: picked.id },
        ];
        return { ...tab, images: nextImages };
      }

      const nextSlides: MetaSlide[] = [
        ...(tab.slides || []),
        { src: picked.url, alt: picked.alt || undefined, title: "", subtitle: "", media_id: picked.id },
      ];
      return { ...tab, slides: nextSlides };
    });
  };

  const submitUrl = useMemo(() => {
    if (!isEditing) return "/api/admin/projects";
    if (!initialData?.id) return "/api/admin/projects";
    return `/api/admin/projects/${initialData.id}`;
  }, [initialData?.id, isEditing]);

  const submitMethod = isEditing ? "POST" : "POST";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append("title", form.title);
      if (form.slug) data.append("slug", form.slug);
      if (form.kicker) data.append("kicker", form.kicker);
      if (form.description) data.append("description", form.description);
      data.append("is_active", form.is_active ? "1" : "0");
      data.append("meta", JSON.stringify(meta));
      if (heroFile) data.append("hero_image", heroFile);

      const res = await fetch(submitUrl, { method: submitMethod, credentials: "include", body: data });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.message || "Erreur lors de l'enregistrement");
        return;
      }

      router.push("/admin/projects");
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditing ? "Modifier le projet" : "Nouveau projet"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tout le contenu est géré via les onglets (meta)
            </p>
          </div>
        </div>
        <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
          Enregistrer
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>Informations</CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Titre"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((prev) => ({ ...prev, title, slug: prev.slug || (!isEditing ? slugify(title) : prev.slug) }));
                }}
                required
              />
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Slug"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  required
                />
                <Input
                  label="Kicker"
                  value={form.kicker}
                  onChange={(e) => setForm((prev) => ({ ...prev, kicker: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <label className="flex items-center gap-3 text-sm font-medium text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Projet actif (visible)
              </label>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Image (banner)</CardHeader>
            <CardBody className="space-y-3">
              {heroPreview ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPreview} alt="Hero" className="h-20 w-60 object-contain" />
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucune image.</p>
              )}
              <input type="file" accept="image/*" onChange={handleHeroChange} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              action={
                <Button type="button" variant="outline" size="sm" icon={<Plus className="w-4 h-4" />} onClick={addTab}>
                  Ajouter
                </Button>
              }
            >
              Onglets (contenu)
            </CardHeader>
            <CardBody className="space-y-5">
              {tabs.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucun onglet. Ajoute-en un.</p>
              ) : null}

              {tabs.map((tab) => (
                <div key={tab.key} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="grid md:grid-cols-3 gap-3 flex-1 min-w-[240px]">
                      <Input
                        label="Key"
                        value={tab.key}
                        onChange={(e) => {
                          const nextKey = slugify(e.target.value) || tab.key;
                          setMeta((prev) => ({
                            ...prev,
                            tabs: (prev.tabs || []).map((t) => (t.key === tab.key ? { ...t, key: nextKey } : t)),
                          }));
                        }}
                      />
                      <Input
                        label="Label"
                        value={tab.label}
                        onChange={(e) => updateTab(tab.key, (t) => ({ ...t, label: e.target.value }))}
                      />
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                          Type
                        </label>
                        <select
                          value={tab.type}
                          onChange={(e) =>
                            updateTab(tab.key, (t) => ({
                              ...t,
                              type: e.target.value as TabType,
                              content_html: e.target.value === "richText" ? t.content_html || "<p>…</p>" : undefined,
                              images: e.target.value === "gallery" ? t.images || [] : undefined,
                              slides: e.target.value === "carousel" ? t.slides || [] : undefined,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="richText">Texte</option>
                          <option value="gallery">Galerie</option>
                          <option value="carousel">Carrousel</option>
                        </select>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeTab(tab.key)}
                    >
                      Supprimer
                    </Button>
                  </div>

                  {tab.type === "richText" ? (
                    <div>
                      <RichTextEditor
                        value={tab.content_html || ""}
                        onChange={(html) => updateTab(tab.key, (t) => ({ ...t, content_html: html }))}
                      />
                    </div>
                  ) : null}

                  {tab.type === "gallery" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Images</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openPicker(tab.key, "gallery")}
                        >
                          Ajouter une image
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {(tab.images || []).map((img, idx) => (
                          <div key={`${img.src}-${idx}`} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.src} alt={img.alt || "Image"} className="h-28 w-full object-cover rounded-lg" />
                            <div className="mt-2 space-y-2">
                              <Input
                                label="Alt"
                                value={img.alt || ""}
                                onChange={(e) =>
                                  updateTab(tab.key, (t) => {
                                    const images = [...(t.images || [])];
                                    images[idx] = { ...images[idx], alt: e.target.value };
                                    return { ...t, images };
                                  })
                                }
                              />
                              <Input
                                label="Caption"
                                value={img.caption || ""}
                                onChange={(e) =>
                                  updateTab(tab.key, (t) => {
                                    const images = [...(t.images || [])];
                                    images[idx] = { ...images[idx], caption: e.target.value };
                                    return { ...t, images };
                                  })
                                }
                              />
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  updateTab(tab.key, (t) => ({ ...t, images: (t.images || []).filter((_, i) => i !== idx) }))
                                }
                              >
                                Retirer
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {tab.type === "carousel" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Slides</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openPicker(tab.key, "carousel")}
                        >
                          Ajouter une slide
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {(tab.slides || []).map((slide, idx) => (
                          <div
                            key={`${slide.src}-${idx}`}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 grid md:grid-cols-[180px_1fr] gap-3"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={slide.src} alt={slide.alt || "Slide"} className="h-28 w-full object-cover rounded-lg" />
                            <div className="space-y-2">
                              <Input
                                label="Titre"
                                value={slide.title || ""}
                                onChange={(e) =>
                                  updateTab(tab.key, (t) => {
                                    const slides = [...(t.slides || [])];
                                    slides[idx] = { ...slides[idx], title: e.target.value };
                                    return { ...t, slides };
                                  })
                                }
                              />
                              <Input
                                label="Sous-titre"
                                value={slide.subtitle || ""}
                                onChange={(e) =>
                                  updateTab(tab.key, (t) => {
                                    const slides = [...(t.slides || [])];
                                    slides[idx] = { ...slides[idx], subtitle: e.target.value };
                                    return { ...t, slides };
                                  })
                                }
                              />
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  updateTab(tab.key, (t) => ({ ...t, slides: (t.slides || []).filter((_, i) => i !== idx) }))
                                }
                              >
                                Retirer
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              action={
                <Button type="button" variant="outline" size="sm" icon={<Plus className="w-4 h-4" />} onClick={addBadge}>
                  Ajouter
                </Button>
              }
            >
              Badges (banner)
            </CardHeader>
            <CardBody className="space-y-3">
              {badges.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucun badge.</p>
              ) : null}
              {badges.map((b, idx) => (
                <div key={`${b.variant}-${idx}`} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                        Variant
                      </label>
                      <select
                        value={b.variant}
                        onChange={(e) =>
                          setMeta((prev) => ({
                            ...prev,
                            hero: {
                              ...(prev.hero || {}),
                              badges: (prev.hero?.badges || []).map((x, i) =>
                                i === idx ? { ...x, variant: e.target.value as BadgeVariant } : x
                              ),
                            },
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
                      >
                        <option value="primary">Primary</option>
                        <option value="amber">Amber</option>
                        <option value="emerald">Emerald</option>
                      </select>
                    </div>
                    <Input
                      label="Label"
                      value={b.label}
                      onChange={(e) =>
                        setMeta((prev) => ({
                          ...prev,
                          hero: {
                            ...(prev.hero || {}),
                            badges: (prev.hero?.badges || []).map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                          },
                        }))
                      }
                    />
                  </div>
                  <Button type="button" variant="danger" size="sm" onClick={() => removeBadge(idx)}>
                    Retirer
                  </Button>
                </div>
              ))}
            </CardBody>
            <CardFooter>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ces badges s&apos;affichent sous le banner sur le site public.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => {
          setShowMediaPicker(false);
          setMediaPickerTarget(null);
        }}
        onSelect={(picked) => {
          const first = picked[0];
          if (first) handleMediaPicked(first);
          setShowMediaPicker(false);
          setMediaPickerTarget(null);
        }}
        multiple={false}
      />
    </form>
  );
}
