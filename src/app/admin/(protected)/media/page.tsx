"use client";

import { useEffect, useState } from "react";
import {
  Trash2,
  Image,
  File,
  FileText,
  Video,
  Music,
  Grid,
  List,
  Upload,
  X,
  ZoomIn,
  Download,
  Folder,
  FolderInput,
  CopyPlus,
  Link2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { compressImageFile } from "@/lib/image-compress";
import { fetchWithTimeout, getFriendlyNetworkErrorMessage, getNetworkProblemKind } from "@/lib/network";

type MediaItem = {
  id: number;
  name: string;
  url: string;
  entry_type: 'file' | 'folder';
  mime: string; // Mime type
  size: number;
  created_at: string;
  width?: number;
  height?: number;
  parent_id?: number;
  children_count?: number | null;
  files_count?: number | null;
  folders_count?: number | null;
  files_size?: number | null;
};

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<globalThis.File[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: number | null; name: string }[]>([
    { id: null, name: "Médiathèque" },
  ]);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [search, setSearch] = useState("");
  const fileTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Vidéos' },
    { value: 'audio', label: 'Audio' },
    { value: 'application/pdf', label: 'PDF' },
  ];
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [draggedItem, setDraggedItem] = useState<MediaItem | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  async function load(folderId: number | null, fileType: string, q: string) {
    setLoading(true);
    setListError(null);
    let url = "/api/admin/media?per_page=100";
    if (folderId) {
      url += `&parent_id=${folderId}`;
    } else {
      url += `&parent_id=root`;
    }
    if (fileType) {
        url += `&type=${fileType}`;
    }
    if (q) {
        url += `&q=${encodeURIComponent(q)}`;
    }
    try {
      const res = await fetchWithTimeout(url, {}, 20_000);
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Chargement impossible (code ${res.status}).`);
      }
      const json = await res.json().catch(() => null);
      const nextItems = (json?.data ?? []) as MediaItem[];
      nextItems.sort((a, b) => {
        if (a.entry_type !== b.entry_type) return a.entry_type === "folder" ? -1 : 1;
        return (a.name || "").localeCompare((b.name || ""), "fr", { sensitivity: "base" });
      });
      setItems(nextItems);
    } catch (err) {
      console.error("Failed to load medias", err);
      setItems([]);
      setListError(
        getNetworkProblemKind(err) ? getFriendlyNetworkErrorMessage(err) : err instanceof Error ? err.message : "Erreur."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      void load(currentFolderId, selectedFileType, search.trim());
    }, 200);
    return () => clearTimeout(t);
  }, [currentFolderId, selectedFileType, search]);

  const getFileIcon = (item: MediaItem) => {
    if (item.entry_type === 'folder') return <Folder className="w-6 h-6 text-yellow-500" />;
    const mime = item.mime;
    if (!mime) return <File className="w-6 h-6 text-slate-500 dark:text-slate-400" />;
    if (mime.startsWith("image/")) return <Image className="w-6 h-6 text-blue-500" />;
    if (mime.startsWith("video/")) return <Video className="w-6 h-6 text-purple-500" />;
    if (mime.startsWith("audio/")) return <Music className="w-6 h-6 text-pink-500" />;
    if (mime.includes("pdf")) return <FileText className="w-6 h-6 text-red-500" />;
    return <File className="w-6 h-6 text-slate-500 dark:text-slate-400" />;
  };
  
  const handleItemClick = (item: MediaItem) => {
    if (item.entry_type === 'folder') {
      setCurrentFolderId(item.id);
      const newBreadcrumbs = [...breadcrumbs, { id: item.id, name: item.name }];
      setBreadcrumbs(newBreadcrumbs);
    } else {
      setPreviewItem(item);
    }
  };

  const handleBreadcrumbClick = (id: number | null, index: number) => {
    setCurrentFolderId(id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
        const res = await fetch(`/api/admin/media/folders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newFolderName, parent_id: currentFolderId }),
        });
        if (res.ok) {
            setCreateFolderModalOpen(false);
            setNewFolderName("");
            load(currentFolderId, selectedFileType, search.trim());
        }
    } catch (e) {
        // handle error
    }
  };

  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const handleDropOnFolder = async (e: React.DragEvent, folder: MediaItem) => {
      e.preventDefault();
      e.stopPropagation();
      setDropTarget(null);
      if (!draggedItem || draggedItem.id === folder.id || draggedItem.parent_id === folder.id) {
          return;
      }

      try {
          const res = await fetch(`/api/admin/media/${draggedItem.id}/move`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ parent_id: folder.id }),
          });

          if (res.ok) {
              load(currentFolderId, selectedFileType, search.trim());
          } else {
              console.error('Failed to move item');
          }
      } catch (error) {
          console.error('Failed to move item', error);
      }
      setDraggedItem(null);
  };

  const handleDragEnter = (e: React.DragEvent, folderId: number) => {
      e.preventDefault();
      setDropTarget(folderId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setDropTarget(null);
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameItem, setRenameItem] = useState<MediaItem | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [folderPickerMode, setFolderPickerMode] = useState<"move" | "copy">("move");
  const [folderPickerItem, setFolderPickerItem] = useState<MediaItem | null>(null);
  const [pickerFolderId, setPickerFolderId] = useState<number | null>(null);
  const [pickerBreadcrumbs, setPickerBreadcrumbs] = useState<{ id: number | null; name: string }[]>([
    { id: null, name: "Racine" },
  ]);
  const [pickerFolders, setPickerFolders] = useState<MediaItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const openFolderPicker = (mode: "move" | "copy", item: MediaItem) => {
    setFolderPickerMode(mode);
    setFolderPickerItem(item);
    setPickerFolderId(null);
    setPickerBreadcrumbs([{ id: null, name: "Racine" }]);
    setFolderPickerOpen(true);
  };

  const openRename = (item: MediaItem) => {
    setRenameItem(item);
    setRenameValue(item.name || "");
    setRenameModalOpen(true);
  };

  const handleRename = async () => {
    if (!renameItem) return;
    const name = renameValue.trim();
    if (!name) return;

    const res = await fetch(`/api/admin/media/${renameItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      alert(errorData?.message || "Renommage impossible.");
      return;
    }

    setRenameModalOpen(false);
    setRenameItem(null);
    await load(currentFolderId, selectedFileType, search.trim());
  };

  const loadPickerFolders = async (folderId: number | null) => {
    setPickerLoading(true);
    try {
      let url = "/api/admin/media?per_page=200&entry_type=folder";
      if (folderId) url += `&parent_id=${folderId}`;
      else url += "&parent_id=root";
      const res = await fetch(url);
      const json = await res.json();
      const folders = (json?.data ?? []) as MediaItem[];
      folders.sort((a, b) => (a.name || "").localeCompare((b.name || ""), "fr", { sensitivity: "base" }));
      setPickerFolders(folders);
    } finally {
      setPickerLoading(false);
    }
  };

  useEffect(() => {
    if (folderPickerOpen) void loadPickerFolders(pickerFolderId);
     
  }, [folderPickerOpen, pickerFolderId]);

  const handlePickerBreadcrumbClick = (id: number | null, index: number) => {
    setPickerFolderId(id);
    setPickerBreadcrumbs(pickerBreadcrumbs.slice(0, index + 1));
  };

  const handlePickerOpenFolder = (folder: MediaItem) => {
    setPickerFolderId(folder.id);
    setPickerBreadcrumbs([...pickerBreadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const handleMoveOrCopy = async () => {
    if (!folderPickerItem) return;
    const endpoint =
      folderPickerMode === "move"
        ? `/api/admin/media/${folderPickerItem.id}/move`
        : `/api/admin/media/${folderPickerItem.id}/copy`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parent_id: pickerFolderId }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      alert(errorData?.message || "Opération impossible.");
      return;
    }

    setFolderPickerOpen(false);
    setFolderPickerItem(null);
    await load(currentFolderId, selectedFileType, search.trim());
  };

  const handleFilesSelection = (files: FileList) => {
    const fileArray = Array.from(files);
    setUploadError(null);
    setSelectedFiles(fileArray);
    setUploadModalOpen(true);
  };

  const handleUploadConfirm = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setOptimizing(true);
    setUploadError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    const tokenRes = await fetch("/api/auth/token", { credentials: "include" });
    const tokenData = tokenRes.ok ? await tokenRes.json().catch(() => null) : null;
    const token = tokenData?.token as string | undefined;
    const authHeader: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
    if (!token) {
      setUploadError("Session expirée. Veuillez vous reconnecter.");
      setUploading(false);
      return;
    }

    try {
      for (const file of selectedFiles) {
        const preparedFile = await compressImageFile(file).catch(() => file);
        const formData = new FormData();
        formData.append("file", preparedFile);
        if (currentFolderId) {
          formData.append("parent_id", String(currentFolderId));
        }

        const res = await fetch(`${apiUrl}/admin/media`, {
          method: "POST",
          body: formData,
          credentials: "include", // Important for sending cookies cross-domain
          headers: authHeader,
        });

        if (!res.ok) {
          if (res.status === 413) {
            throw new Error("Fichier trop volumineux (limite serveur).");
          }
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || `L'upload de ${file.name} a échoué (code ${res.status}).`);
        }
      }
      
      setUploadModalOpen(false);
      setSelectedFiles([]);
      await load(currentFolderId, selectedFileType, search.trim()); // Refresh list
    } catch (e: any) {
      console.error("Upload failed", e);
      if (getNetworkProblemKind(e)) {
        setUploadError(getFriendlyNetworkErrorMessage(e));
        return;
      }
      setUploadError(e?.message || "Erreur lors de l'upload. Vérifiez la taille/format du fichier.");
    } finally {
      setOptimizing(false);
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelection(e.dataTransfer.files);
    }
  };

  async function handleDelete() {
    if (!selectedItem) return;
    try {
      const res = await fetch(`/api/admin/media/${selectedItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setSelectedItem(null);
        load(currentFolderId, selectedFileType, search.trim());
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.message || "Suppression impossible.");
      }
    } catch (e) {
      // Handle error
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
  };

  const totalSize = items.reduce((acc, item) => acc + (item.size || 0), 0);
  const imageCount = items.filter((i) => i.mime && i.mime.startsWith("image/")).length;
  const formatFilesCount = (n: number) => (n === 1 ? "1 fichier" : `${n} fichiers`);
  const currentLocationLabel = breadcrumbs[breadcrumbs.length - 1]?.name ?? "Médiathèque";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Médiathèque</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gérez vos images et fichiers</p>
        </div>
        <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setCreateFolderModalOpen(true)}>
            <Folder className="w-4 h-4 mr-2" />
            Créer un dossier
        </Button>
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <label>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFilesSelection(e.target.files)}
            />
            <span className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30 transition-all">
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Télécharger
                </>
              )}
            </span>
          </label>
        </div>
      </div>
        
      {/* Breadcrumbs & Filters */}
      <div className="flex items-center justify-between gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id || 'root'} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                <button
                    onClick={() => handleBreadcrumbClick(crumb.id, index)}
                    className={`hover:text-indigo-600 ${
                    crumb.id === currentFolderId ? "font-semibold text-slate-900 dark:text-white" : ""
                    }`}
                >
                    {crumb.name}
                </button>
                </div>
            ))}
        </div>

        {/* File Type Filter */}
        <div className="flex items-center gap-2">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <label htmlFor="type-filter" className="text-sm font-medium text-slate-600 dark:text-slate-300">Type</label>
            <select
                id="type-filter"
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2"
            >
                {fileTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total éléments"
          value={items.length}
          icon={<File className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Images"
          value={imageCount}
          icon={<Image className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Espace utilisé"
          value={formatFileSize(totalSize)}
          icon={<Upload className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
        <p className="text-slate-600 dark:text-slate-300 mb-2">
          Glissez-déposez vos fichiers ici (dans <span className="font-medium text-slate-900 dark:text-white">{currentLocationLabel}</span>) ou{" "}
          <label className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer font-medium">
            parcourez
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFilesSelection(e.target.files)}
            />
          </label>
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500">PNG, JPG, PDF, DOC jusqu'à 10MB</p>
      </div>

      {/* Upload Preview Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
            if (!uploading) {
                setUploadModalOpen(false);
                setSelectedFiles([]);
            }
        }}
        title={`Confirmer l'upload (${selectedFiles.length} fichier${selectedFiles.length > 1 ? 's' : ''})`}
        size="lg"
      >
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto p-2">
                {selectedFiles.map((file, i) => (
                    <div key={i} className="relative group bg-slate-50 dark:bg-slate-700 rounded-lg p-2 border border-slate-200 dark:border-slate-600">
                        <button 
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 shadow-sm hover:bg-red-600 transition-colors z-10"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <div className="aspect-square bg-slate-200 dark:bg-slate-600 rounded-md overflow-hidden mb-2 flex items-center justify-center">
                            {file.type.startsWith('image/') ? (
                                <img 
                                    src={URL.createObjectURL(file)} 
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                            ) : (
                                <File className="w-8 h-8 text-slate-400" />
                            )}
                        </div>
                        <p className="text-xs text-center truncate text-slate-700 dark:text-slate-300 font-medium">
                            {file.name}
                        </p>
                        <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">
                             {formatFileSize(file.size)}
                        </p>
                    </div>
                ))}
            </div>

            {uploadError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {uploadError}
              </div>
            )}
            {optimizing && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Optimisation des images en cours...
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-100 dark:border-slate-700 pt-4">
                <Button variant="ghost" onClick={() => setUploadModalOpen(false)} disabled={uploading}>
                    Annuler
                </Button>
                <Button onClick={handleUploadConfirm} loading={uploading} icon={<Upload className="w-4 h-4" />}>
                    {uploading ? "Upload en cours..." : "Uploader les fichiers"}
                </Button>
            </div>
        </div>
      </Modal>

      {/* Media Grid/List */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : listError ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center px-6">
          <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Impossible de charger la médiathèque</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{listError}</p>
          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" onClick={() => load(currentFolderId, selectedFileType, search.trim())}>
              Réessayer
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Aucun élément</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center px-6">
            Dans <span className="font-medium text-slate-700 dark:text-slate-300">{currentLocationLabel}</span> : créez un sous-dossier ou téléversez des fichiers.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" onClick={() => setCreateFolderModalOpen(true)} icon={<Folder className="w-4 h-4" />}>
              Créer un dossier
            </Button>
            <label>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFilesSelection(e.target.files)}
              />
              <span className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30 transition-all">
                <Upload className="w-4 h-4" />
                Téléverser
              </span>
            </label>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className={`group relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all border border-transparent dark:border-slate-700 ${item.entry_type === 'folder' && dropTarget === item.id ? 'ring-2 ring-indigo-500' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onClick={() => handleItemClick(item)}
              onDragOver={item.entry_type === 'folder' ? handleDragOver : undefined}
              onDrop={item.entry_type === 'folder' ? (e) => handleDropOnFolder(e, item) : undefined}
              onDragEnter={item.entry_type === 'folder' ? (e) => handleDragEnter(e, item.id) : undefined}
              onDragLeave={item.entry_type === 'folder' ? handleDragLeave : undefined}
            >
              {item.entry_type === 'folder' ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <Folder className="w-16 h-16 text-yellow-500" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 text-center px-2 truncate max-w-full">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center px-2 truncate max-w-full">
                    {formatFilesCount(item.files_count ?? 0)} • {formatFileSize(item.files_size ?? 0)}
                  </span>
                </div>
              ) : item.mime && item.mime.startsWith("image/") ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  {getFileIcon(item)}
                  <span className="text-xs text-slate-500 dark:text-slate-400 text-center px-2 truncate max-w-full">
                    {item.name}
                  </span>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-2 p-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRename(item);
                  }}
                  className="p-2 bg-white rounded-lg text-slate-700 hover:bg-slate-100"
                  title="Renommer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {item.entry_type === "file" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewItem(item);
                    }}
                    className="p-2 bg-white rounded-lg text-slate-700 hover:bg-slate-100"
                    title="Aperçu"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                )}
                {item.entry_type === "file" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFolderPicker("move", item);
                    }}
                    className="p-2 bg-white rounded-lg text-slate-700 hover:bg-slate-100"
                    title="Déplacer"
                  >
                    <FolderInput className="w-4 h-4" />
                  </button>
                )}
                {item.entry_type === "file" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFolderPicker("copy", item);
                    }}
                    className="p-2 bg-white rounded-lg text-slate-700 hover:bg-slate-100"
                    title="Copier vers un dossier"
                  >
                    <CopyPlus className="w-4 h-4" />
                  </button>
                )}
                {item.entry_type === "file" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.url);
                    }}
                    className="p-2 bg-white rounded-lg text-slate-700 hover:bg-slate-100"
                    title="Copier l'URL"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                item.entry_type === 'folder' && dropTarget === item.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
              }`}
              onClick={() => handleItemClick(item)}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={item.entry_type === 'folder' ? handleDragOver : undefined}
              onDrop={item.entry_type === 'folder' ? (e) => handleDropOnFolder(e, item) : undefined}
              onDragEnter={item.entry_type === 'folder' ? (e) => handleDragEnter(e, item.id) : undefined}
              onDragLeave={item.entry_type === 'folder' ? handleDragLeave : undefined}
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {item.entry_type === 'folder' ? (
                  <Folder className="w-6 h-6 text-yellow-500" />
                ) : item.mime && item.mime.startsWith("image/") ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getFileIcon(item)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.entry_type === "folder"
                    ? `${formatFilesCount(item.files_count ?? 0)} • ${formatFileSize(item.files_size ?? 0)}`
                    : `${formatFileSize(item.size)} • ${new Date(item.created_at).toLocaleDateString("fr-FR")}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRename(item);
                  }}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Renommer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {item.entry_type === "file" && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFolderPicker("move", item);
                      }}
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Déplacer"
                    >
                      <FolderInput className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFolderPicker("copy", item);
                      }}
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Copier vers un dossier"
                    >
                      <CopyPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.url);
                      }}
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Copier l'URL"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={previewItem.name}
          size="xl"
        >
          <div className="flex flex-col items-center">
            {previewItem.mime && previewItem.mime.startsWith("image/") ? (
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="max-h-[60vh] rounded-lg"
              />
            ) : (
              <div className="p-12 bg-slate-100 dark:bg-slate-700 rounded-xl">
                {getFileIcon(previewItem)}
              </div>
            )}
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {formatFileSize(previewItem.size)}
                {previewItem.width && ` • ${previewItem.width}×${previewItem.height}px`}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FolderInput className="w-4 h-4" />}
                  onClick={() => openFolderPicker("move", previewItem)}
                >
                  Déplacer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<CopyPlus className="w-4 h-4" />}
                  onClick={() => openFolderPicker("copy", previewItem)}
                >
                  Copier vers...
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Link2 className="w-4 h-4" />}
                  onClick={() => copyToClipboard(previewItem.url)}
                >
                  Copier l'URL
                </Button>
                <a href={previewItem.url} download>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                  >
                    Télécharger
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Move/Copy Picker */}
      <Modal
        isOpen={folderPickerOpen}
        onClose={() => setFolderPickerOpen(false)}
        title={folderPickerMode === "move" ? "Déplacer vers..." : "Copier vers..."}
      >
        <div className="space-y-4">
          {folderPickerItem && (
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Élément : <span className="font-medium text-slate-900 dark:text-white">{folderPickerItem.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {pickerBreadcrumbs.map((crumb, index) => (
              <div key={`${crumb.id ?? "root"}-${index}`} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                <button
                  onClick={() => handlePickerBreadcrumbClick(crumb.id, index)}
                  className={crumb.id === pickerFolderId ? "font-semibold text-slate-900 dark:text-white" : "hover:text-indigo-600"}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {pickerLoading ? (
              <div className="p-4 text-sm text-slate-500">Chargement...</div>
            ) : pickerFolders.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">Aucun dossier ici.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {pickerFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handlePickerOpenFolder(folder)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <Folder className="w-5 h-5 text-yellow-500 shrink-0" />
                    <span className="text-sm text-slate-900 dark:text-white truncate">{folder.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setFolderPickerOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleMoveOrCopy}>
              {folderPickerMode === "move" ? "Déplacer ici" : "Copier ici"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title={renameItem?.entry_type === "folder" ? "Renommer le dossier" : "Renommer le fichier"}
      >
        <div className="space-y-4">
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Nouveau nom"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRenameModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRename}>Renommer</Button>
          </div>
        </div>
      </Modal>
      
      {/* Create Folder Modal */}
      <Modal
        isOpen={createFolderModalOpen}
        onClose={() => setCreateFolderModalOpen(false)}
        title="Créer un nouveau dossier"
      >
        <div className="space-y-4">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nom du dossier"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateFolderModalOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateFolder}>Créer</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedItem?.name}" ?`}
        confirmText="Supprimer"
        variant="danger"
      />
    </div>
  );
}
