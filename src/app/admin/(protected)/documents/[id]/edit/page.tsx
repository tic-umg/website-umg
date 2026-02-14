"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, File as FileIcon, X, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

interface DocumentCategory {
  id: number;
  name: string;
}

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const resolvedParams = use(params);
  const docId = resolvedParams.id;

  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [currentFile, setCurrentFile] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category_id: "",
    is_public: true,
    is_important: false,
    status: "draft",
  });

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [docRes, catRes] = await Promise.all([
             fetch(`/api/admin/documents/${docId}`),
             fetch("/api/admin/document-categories?per_page=100")
        ]);

        if (!docRes.ok) throw new Error("Document not found");

        const docData = await docRes.json();
        const doc = docData.data;

        setFormData({
            title: doc.title,
            slug: doc.slug,
            description: doc.description || "",
            category_id: doc.category?.id || "",
            is_public: !!doc.is_public,
            is_important: !!doc.is_important,
            status: doc.status,
        });
        setCurrentFile(doc.file);

        if (catRes.ok) {
            const catData = await catRes.json();
            setCategories(catData.data || []);
        } else {
             // Fallback
             const res2 = await fetch("/api/admin/categories?type=document&per_page=100");
             if (res2.ok) {
                 const data = await res2.json();
                 setCategories(data.data || []);
             }
        }

      } catch (error) {
        console.error("Failed to load document", error);
        router.push("/admin/documents");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [docId, router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
    setSaving(true);
    try {
      let res: Response;

      if (file) {
        // If uploading a new file, use FormData with POST and _method=PUT
        const data = new FormData();
        data.append("_method", "PUT");
        data.append("title", formData.title);
        data.append("slug", formData.slug);
        data.append("description", formData.description);
        if (formData.category_id) {
          data.append("document_category_id", formData.category_id);
        }
        data.append("is_public", formData.is_public ? "1" : "0");
        data.append("is_important", formData.is_important ? "1" : "0");
        data.append("status", formData.status);
        data.append("file", file);

        res = await fetch(`/api/admin/documents/${docId}`, {
          method: "POST",
          body: data,
        });
      } else {
        // If no file, use JSON with PUT method directly
        const jsonData: Record<string, unknown> = {
          title: formData.title,
          slug: formData.slug,
          description: formData.description || null,
          is_public: formData.is_public,
          is_important: formData.is_important,
          status: formData.status,
        };

        // Only include category_id if it has a value
        if (formData.category_id) {
          jsonData.document_category_id = parseInt(formData.category_id, 10);
        }

        console.log("Sending update:", jsonData); // Debug log

        res = await fetch(`/api/admin/documents/${docId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonData),
        });

        console.log("Response status:", res.status); // Debug log
      }

      if (res.ok) {
        router.push("/admin/documents");
      } else {
        const err = await res.json().catch(() => ({ message: "Erreur inconnue" }));
        alert("Erreur: " + (err.message || "Impossible de mettre à jour le document"));
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center animate-pulse">Chargement...</div>;

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
              Modifier le document
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Édition : {formData.title}
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
                Mettre à jour
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>Fichier</CardHeader>
            <CardBody>
                {/* Current File Info */}
                {currentFile && !file && (
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                                <FileIcon className="w-6 h-6 text-slate-500" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Fichier actuel</p>
                                <p className="text-sm text-slate-500">{formatBytes(currentFile.size)} • {currentFile.mime}</p>
                            </div>
                        </div>
                        <a 
                            href={currentFile.url} 
                            target="_blank" 
                            download 
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Télécharger l'actuel"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                    </div>
                )}

                {!file ? (
                    <div 
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">
                            Remplacer le fichier ?
                        </p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">
                            Cliquez pour sélectionner un nouveau fichier
                        </p>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            onChange={handleFileChange}
                        />
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                        >
                            Choisir un fichier
                        </Button>
                    </div>
                ) : (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex items-center gap-4 animate-in fade-in">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                            <FileIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                                {file.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formatBytes(file.size)} • Nouveau
                            </p>
                        </div>
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
                )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Informations</CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Titre"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
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
                            <option value="archived">Archivé</option>
                        </select>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>Classement</CardHeader>
                <CardBody className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Catégorie
                        </label>
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
    </div>
  );
}
