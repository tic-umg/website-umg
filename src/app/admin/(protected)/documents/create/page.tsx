"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, FolderOpen, Upload, File as FileIcon, X, Eye, Library } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { MediaPickerModal, type Media } from "@/components/admin/media/MediaPickerModal";

interface DocumentCategory {
  id: number;
  name: string;
}

export default function CreateDocumentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category_id: "",
    is_public: true,
    is_important: false,
    status: "published", // Default to published for better UX
  });

  // Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Fetch categories
  async function fetchCategories() {
       try {
        const res = await fetch("/api/admin/document-categories?per_page=100");
        if (res.ok) {
            const data = await res.json();
            setCategories(data.data || []);
        } else {
             const res2 = await fetch("/api/admin/categories?type=document&per_page=100");
             if (res2.ok) {
                 const data = await res2.json();
                 setCategories(data.data || []);
             }
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoadingConfig(false);
      }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreateCategory() {
      if (!newCategoryName.trim()) return;
      try {
          const res = await fetch("/api/admin/document-categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: newCategoryName, slug: generateSlug(newCategoryName), type: 'document' })
          });
          
          if (res.ok) {
              const newCat = await res.json();
              await fetchCategories(); // Refresh list
              setFormData(prev => ({ ...prev, category_id: newCat.data?.id || "" }));
              setIsCategoryModalOpen(false);
              setNewCategoryName("");
          } else {
              // Try generic categories if specific endpoint fails
               const res2 = await fetch("/api/admin/categories", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: newCategoryName, slug: generateSlug(newCategoryName), type: 'document' })
              });
              if (res2.ok) {
                  const newCat = await res2.json();
                  await fetchCategories();
                  setFormData(prev => ({ ...prev, category_id: newCat.data?.id || "" }));
                  setIsCategoryModalOpen(false);
                  setNewCategoryName("");
              } else {
                  alert("Erreur lors de la création de la catégorie");
              }
          }
      } catch (e) {
          console.error(e);
          alert("Erreur réseau");
      }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(title: string) {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSelectedMedia(null); // Clear selected media if uploading new file
    }
  }

  function handleMediaSelect(medias: Media[]) {
    if (medias.length > 0) {
      setSelectedMedia(medias[0]);
      setFile(null); // Clear uploaded file if selecting from library
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !selectedMedia) {
        alert("Veuillez sélectionner un fichier ou choisir depuis la médiathèque");
        return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("description", formData.description);
      if (formData.category_id) {
          data.append("document_category_id", formData.category_id);
      }
      data.append("is_public", formData.is_public ? "1" : "0");
      data.append("is_important", formData.is_important ? "1" : "0");
      data.append("status", formData.status);

      // Use existing media or upload new file
      if (selectedMedia) {
        data.append("file_id", String(selectedMedia.id));
      } else if (file) {
        data.append("file", file);
      }

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        router.push("/admin/documents");
      } else {
          const err = await res.json();
          alert("Erreur: " + (err.message || "Impossible d'uploader le document"));
      }
    } catch (e) {
        console.error(e);
        alert("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/documents"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Nouveau document
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Téléchargez et publiez un document
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()}>
                Annuler
            </Button>
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>Fichier</CardHeader>
            <CardBody>
                {!file && !selectedMedia ? (
                    <div className="space-y-4">
                        {/* Option 1: Médiathèque */}
                        <div
                            className="border-2 border-dashed border-indigo-200 dark:border-indigo-700 rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer bg-indigo-50/50 dark:bg-indigo-900/20"
                            onClick={() => setIsMediaPickerOpen(true)}
                        >
                            <Library className="w-8 h-8 mx-auto text-indigo-500 dark:text-indigo-400 mb-2" />
                            <p className="text-indigo-700 dark:text-indigo-300 font-medium mb-1">
                                Choisir depuis la médiathèque
                            </p>
                            <p className="text-sm text-indigo-500/70 dark:text-indigo-400/70">
                                Sélectionner un fichier existant
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase">ou</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        </div>

                        {/* Option 2: Téléverser */}
                        <div
                            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/50"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
                            <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">
                                Téléverser un nouveau fichier
                            </p>
                            <p className="text-sm text-slate-400 dark:text-slate-500">
                                PDF, Word, Excel, Images (max 50MB)
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                ) : selectedMedia ? (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                            <Library className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                                {selectedMedia.name || selectedMedia.url?.split("/").pop() || "Fichier sélectionné"}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formatBytes(selectedMedia.size)} • Depuis la médiathèque
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMedia(null)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ) : file ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center shrink-0">
                            <FileIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                                {file.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formatBytes(file.size)} • Nouveau fichier
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Informations</CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Titre"
                placeholder="Titre du document"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                helperText="URL du téléchargement"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  placeholder="À propos de ce document..."
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>Publication</CardHeader>
                <CardBody className="space-y-4">
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
                        </select>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>Classement</CardHeader>
                <CardBody className="space-y-4">
                    {/* Categorization with Quick Add */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Catégorie
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                                <span className="text-lg leading-none">+</span> Nouveau
                            </button>
                        </div>
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Requis pour l'organisation</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_public}
                                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Visible par le public
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_important}
                                onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Marquer comme important
                            </span>
                        </label>
                    </div>
                </CardBody>
            </Card>
        </div>
      </div>

      {/* Category Creation Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nouvelle catégorie</h3>
                    <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                    <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Ex: Rapports 2024"
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsCategoryModalOpen(false)}>Annuler</Button>
                    <Button size="sm" onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>Créer</Button>
                </div>
            </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        multiple={false}
        uploadHint="PDF, Word, Excel, Images (max 50MB)"
      />
    </div>
  );
}
