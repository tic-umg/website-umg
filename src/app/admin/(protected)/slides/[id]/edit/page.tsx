"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import SlideColorField from "@/components/admin/slides/SlideColorField";

interface Post {
  id: number;
  title: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const DEFAULT_BG_LIGHT = "#002147";
const DEFAULT_BG_DARK = "#0B1120";

interface Slide {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_id: number | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  post_id: number | null;
  category_id: number | null;
  bg_color_light: string;
  bg_color_dark: string;
  order: number;
  is_active: boolean;
}

export default function EditSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    cta_text: "",
    cta_url: "",
    post_id: "",
    category_id: "",
    bg_color_light: DEFAULT_BG_LIGHT,
    bg_color_dark: DEFAULT_BG_DARK,
    order: "0",
    is_active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slideRes, postsRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/slides/${id}`, { credentials: "include" }),
          fetch("/api/admin/posts?per_page=100&status=published", { credentials: "include" }),
          fetch("/api/admin/categories?per_page=100", { credentials: "include" }),
        ]);

        if (slideRes.ok) {
          const slideData = await slideRes.json();
          const slide: Slide = slideData.data;
          setForm({
            title: slide.title || "",
            subtitle: slide.subtitle || "",
            description: slide.description || "",
            cta_text: slide.cta_text || "",
            cta_url: slide.cta_url || "",
            post_id: slide.post_id?.toString() || "",
            category_id: slide.category_id?.toString() || "",
            bg_color_light: slide.bg_color_light || DEFAULT_BG_LIGHT,
            bg_color_dark: slide.bg_color_dark || DEFAULT_BG_DARK,
            order: slide.order?.toString() || "0",
            is_active: slide.is_active,
          });
          if (slide.image_url) {
            setOriginalImageUrl(slide.image_url);
            setImagePreview(slide.image_url);
          }
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.data?.data || postsData.data || []);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data?.data || categoriesData.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setOriginalImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("description", form.description);
      formData.append("cta_text", form.cta_text);
      formData.append("cta_url", form.cta_url);
      formData.append("post_id", form.post_id);
      formData.append("category_id", form.category_id);
      formData.append("bg_color_light", form.bg_color_light);
      formData.append("bg_color_dark", form.bg_color_dark);
      formData.append("order", form.order);
      formData.append("is_active", form.is_active ? "1" : "0");
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`/api/admin/slides/${id}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        router.push("/admin/slides");
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error updating slide:", error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/slides"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Modifier le slide
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Modifier les informations du slide
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Upload */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Image du slide
            </h3>
            {imagePreview ? (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[16/9] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Cliquez pour télécharger
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  PNG, JPG jusqu&apos;à 5MB (1920x1080 recommandé)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Title & Content */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Titre *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Titre principal du slide"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Sous-titre
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sous-titre optionnel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description optionnelle..."
              />
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Bouton d&apos;action (CTA)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Texte du bouton
                </label>
                <input
                  type="text"
                  value={form.cta_text}
                  onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: En savoir plus"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  URL du bouton
                </label>
                <input
                  type="text"
                  value={form.cta_url}
                  onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: /actualites/mon-article"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Ou lier à une actualité
              </label>
              <select
                value={form.post_id}
                onChange={(e) => setForm({ ...form, post_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Sélectionner une actualité --</option>
                {posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Si une actualité est sélectionnée, le CTA redirigera vers cette actualité
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Publication
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Catégorie
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <SlideColorField
              label="Couleur de fond (mode clair)"
              value={form.bg_color_light}
              onChange={(value) => setForm({ ...form, bg_color_light: value })}
              defaultColor={DEFAULT_BG_LIGHT}
              helperText="Saisissez un code hex (#RRGGBB) ou une classe Tailwind (ex: bg-blue-900)."
            />

            <SlideColorField
              label="Couleur de fond (mode sombre)"
              value={form.bg_color_dark}
              onChange={(value) => setForm({ ...form, bg_color_dark: value })}
              defaultColor={DEFAULT_BG_DARK}
              helperText="Saisissez un code hex (#RRGGBB) ou une classe Tailwind (ex: bg-slate-800)."
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Ordre d&apos;affichage
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Slide actif
              </span>
            </label>

            <button
              type="submit"
              disabled={saving || !form.title}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Enregistrement..." : "Mettre à jour"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
