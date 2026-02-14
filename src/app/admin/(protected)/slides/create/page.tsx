"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react";
import SlideColorField from "@/components/admin/slides/SlideColorField";
import { MediaPickerModal, Media } from "@/components/admin/media/MediaPickerModal";
import { Button } from "@/components/ui/Button";

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

export default function CreateSlidePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);

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
    image_id: null as number | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/posts?per_page=100&status=published", { credentials: "include" }),
          fetch("/api/admin/categories?per_page=100", { credentials: "include" }),
        ]);

        if (postsRes.ok) {
          const data = await postsRes.json();
          setPosts(data.data?.data || data.data || []);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data?.data || data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSelectImage = (medias: Media[]) => {
    if (medias.length > 0) {
      setSelectedImage(medias[0]);
      setForm({ ...form, image_id: medias[0].id });
    }
    setShowMediaPicker(false);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setForm({ ...form, image_id: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description || null,
        cta_text: form.cta_text || null,
        cta_url: form.cta_url || null,
        post_id: form.post_id ? parseInt(form.post_id) : null,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        bg_color_light: form.bg_color_light,
        bg_color_dark: form.bg_color_dark,
        order: parseInt(form.order),
        is_active: form.is_active,
        image_id: form.image_id,
      };

      const res = await fetch("/api/admin/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/slides");
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Error creating slide:", error);
      alert("Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

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
            Nouveau slide
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Créer un nouveau slide pour le carrousel
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Image du slide
            </h3>
            {selectedImage ? (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 group">
                <Image
                  src={selectedImage.url}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaPicker(true)}
                    className="bg-white/90 hover:bg-white"
                  >
                    Changer
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4 mr-1" /> Retirer
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setShowMediaPicker(true)}
                className="flex flex-col items-center justify-center aspect-[16/9] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Choisir depuis la médiathèque
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  1920x1080 recommandé
                </span>
              </div>
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
              {saving ? "Enregistrement..." : "Créer le slide"}
            </button>
          </div>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleSelectImage}
        multiple={false}
      />
    </div>
  );
}
