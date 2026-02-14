"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Save, Image as ImageIcon, X, Plus, Trash2,
  GraduationCap, Bell, Calendar, Info, AlertCircle, Star
} from "lucide-react";
import { MediaPickerModal, Media } from "@/components/admin/media/MediaPickerModal";
import { Button } from "@/components/ui/Button";

interface PopupItem {
  icon: string;
  icon_color: string;
  title: string;
  description: string;
}

interface PopupData {
  id: number;
  title: string;
  content_html: string | null;
  button_text: string;
  button_url: string | null;
  image_id: number | null;
  image_url: string | null;
  image: { id: number; url: string } | null;
  icon: string | null;
  icon_color: string | null;
  items: PopupItem[] | null;
  delay_ms: number;
  show_on_all_pages: boolean;
  target_pages: string[] | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  priority: number;
}

const ICON_OPTIONS = [
  { value: "graduation-cap", label: "Diplôme", icon: GraduationCap },
  { value: "bell", label: "Cloche", icon: Bell },
  { value: "calendar", label: "Calendrier", icon: Calendar },
  { value: "info", label: "Info", icon: Info },
  { value: "alert-circle", label: "Alerte", icon: AlertCircle },
  { value: "star", label: "Étoile", icon: Star },
];

const COLOR_OPTIONS = [
  { value: "blue", label: "Bleu", class: "bg-blue-500" },
  { value: "emerald", label: "Vert", class: "bg-emerald-500" },
  { value: "amber", label: "Jaune", class: "bg-amber-500" },
  { value: "red", label: "Rouge", class: "bg-red-500" },
  { value: "purple", label: "Violet", class: "bg-purple-500" },
  { value: "slate", label: "Gris", class: "bg-slate-500" },
];

function formatDateForInput(isoDate: string | null): string {
  if (!isoDate) return "";
  try {
    const date = new Date(isoDate);
    return date.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export default function EditPopupPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const popupId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);

  const [form, setForm] = useState({
    title: "",
    content_html: "",
    button_text: "J'ai compris",
    button_url: "",
    image_id: null as number | null,
    icon: "",
    icon_color: "blue",
    delay_ms: 0,
    show_on_all_pages: true,
    target_pages: [] as string[],
    start_date: "",
    end_date: "",
    is_active: false,
    priority: 0,
  });

  const [items, setItems] = useState<PopupItem[]>([]);
  const [newTargetPage, setNewTargetPage] = useState("");

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const res = await fetch(`/api/admin/popups/${popupId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          const data: PopupData = json.data;

          setForm({
            title: data.title,
            content_html: data.content_html || "",
            button_text: data.button_text || "J'ai compris",
            button_url: data.button_url || "",
            image_id: data.image_id,
            icon: data.icon || "",
            icon_color: data.icon_color || "blue",
            delay_ms: data.delay_ms,
            show_on_all_pages: data.show_on_all_pages,
            target_pages: data.target_pages || [],
            start_date: formatDateForInput(data.start_date),
            end_date: formatDateForInput(data.end_date),
            is_active: data.is_active,
            priority: data.priority,
          });

          if (data.image) {
            setSelectedImage({ id: data.image.id, url: data.image.url } as Media);
          }

          if (data.items) {
            setItems(data.items);
          }
        } else {
          router.push("/admin/popups");
        }
      } catch (error) {
        console.error("Error fetching popup:", error);
        router.push("/admin/popups");
      } finally {
        setLoading(false);
      }
    };

    fetchPopup();
  }, [popupId, router]);

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

  const addItem = () => {
    setItems([...items, { icon: "info", icon_color: "blue", title: "", description: "" }]);
  };

  const updateItem = (index: number, field: keyof PopupItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addTargetPage = () => {
    if (newTargetPage && !form.target_pages.includes(newTargetPage)) {
      setForm({ ...form, target_pages: [...form.target_pages, newTargetPage] });
      setNewTargetPage("");
    }
  };

  const removeTargetPage = (page: string) => {
    setForm({ ...form, target_pages: form.target_pages.filter((p) => p !== page) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        content_html: form.content_html || null,
        button_text: form.button_text || "J'ai compris",
        button_url: form.button_url || null,
        image_id: form.image_id,
        icon: form.icon || null,
        icon_color: form.icon_color || null,
        items: items.length > 0 ? items.filter((i) => i.title.trim()) : null,
        delay_ms: form.delay_ms,
        show_on_all_pages: form.show_on_all_pages,
        target_pages: form.show_on_all_pages ? null : form.target_pages,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        is_active: form.is_active,
        priority: form.priority,
      };

      const res = await fetch(`/api/admin/popups/${popupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/popups");
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error updating popup:", error);
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
          href="/admin/popups"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Modifier le popup</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{form.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Informations principales
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Titre *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Informations aux étudiants"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Contenu (HTML)
              </label>
              <textarea
                value={form.content_html}
                onChange={(e) => setForm({ ...form, content_html: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="<p>Votre message ici...</p>"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Image (optionnel)
              </label>
              {selectedImage ? (
                <div className="relative aspect-video max-w-xs rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 group">
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
                    <Button type="button" variant="danger" size="sm" onClick={handleRemoveImage}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Choisir une image
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Button */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Bouton d&apos;action
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Texte du bouton
                </label>
                <input
                  type="text"
                  value={form.button_text}
                  onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="J'ai compris"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  URL du bouton (optionnel)
                </label>
                <input
                  type="text"
                  value={form.button_url}
                  onChange={(e) => setForm({ ...form, button_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="/page-destination"
                />
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Liste d&apos;éléments (optionnel)
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ajoutez des éléments pour créer une liste avec icônes
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Élément {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Icône</label>
                        <select
                          value={item.icon}
                          onChange={(e) => updateItem(index, "icon", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Couleur</label>
                        <select
                          value={item.icon_color}
                          onChange={(e) => updateItem(index, "icon_color", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                        >
                          {COLOR_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Titre *</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItem(index, "title", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                        placeholder="Titre de l'élément"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                        placeholder="Description optionnelle"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publication */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Configuration</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Délai avant affichage
              </label>
              <select
                value={form.delay_ms}
                onChange={(e) => setForm({ ...form, delay_ms: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Immédiat</option>
                <option value={5000}>5 secondes</option>
                <option value={10000}>10 secondes</option>
                <option value={30000}>30 secondes</option>
                <option value={60000}>1 minute</option>
                <option value={120000}>2 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Priorité
              </label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                min="0"
                max="100"
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
              <span className="text-sm text-slate-700 dark:text-slate-300">Popup actif</span>
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
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>

          {/* Period */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Période d&apos;affichage
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Date de début
              </label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Date de fin
              </label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Target Pages */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pages cibles</h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.show_on_all_pages}
                onChange={(e) => setForm({ ...form, show_on_all_pages: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Afficher sur toutes les pages
              </span>
            </label>

            {!form.show_on_all_pages && (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTargetPage}
                    onChange={(e) => setNewTargetPage(e.target.value)}
                    placeholder="/actualites"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTargetPage}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {form.target_pages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.target_pages.map((page) => (
                      <span
                        key={page}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs"
                      >
                        {page}
                        <button
                          type="button"
                          onClick={() => removeTargetPage(page)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
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
