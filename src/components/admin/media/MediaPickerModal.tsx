"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Upload, Check, Image as ImageIcon, Loader2, Video, FileText, Folder } from "lucide-react";
import { clsx } from "clsx";
import { compressImageFile } from "@/lib/image-compress";
import { fetchWithTimeout, getFriendlyNetworkErrorMessage, getNetworkProblemKind } from "@/lib/network";

export interface Media {
  id: number;
  url: string;
  disk: string;
  mime: string;
  size: number;
  name?: string;
  alt?: string;
  created_at?: string;
  entry_type?: "file" | "folder";
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: Media[]) => void;
  multiple?: boolean;
  filterType?: "image" | "video" | "application";
  accept?: string;
  uploadHint?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  filterType,
  accept,
  uploadHint,
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [loading, setLoading] = useState(false);
  const [medias, setMedias] = useState<Media[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: number | null; name: string }[]>([
    { id: null, name: "Accueil" },
  ]);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  
  // Pagination / Search state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchMedias = useCallback(
    async (p = 1, q = "", folderId: number | null = null) => {
      setLoading(true);
      setLibraryError(null);
      try {
        const typeParam = filterType ? `&type=${filterType}` : "";
        const parentParam = folderId ? `&parent_id=${folderId}` : "&parent_id=root";
        const res = await fetchWithTimeout(
          `/api/admin/media?page=${p}&q=${encodeURIComponent(q)}&per_page=18${typeParam}${parentParam}`,
          {},
          20_000
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || `Chargement impossible (code ${res.status}).`);
        }
        const data = await res.json().catch(() => null);
        setMedias(data.data || []);
        setTotalPages(data.meta?.last_page || 1);
        setPage(data.meta?.current_page || 1);
      } catch (err) {
        console.error(err);
        setLibraryError(getFriendlyNetworkErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [filterType]
  );

  useEffect(() => {
    if (isOpen && activeTab === "library") {
      fetchMedias(1, search, currentFolderId);
    }
  }, [isOpen, activeTab, fetchMedias, search, currentFolderId]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentFolderId(null);
      setBreadcrumbs([{ id: null, name: "Accueil" }]);
      setSelectedIds([]);
      setUploadFiles(null);
      setUploadError(null);
      setLibraryError(null);
    }
  }, [isOpen]);

  const handleSelect = (media: Media) => {
    if (multiple) {
      setSelectedIds((prev) =>
        prev.includes(media.id)
          ? prev.filter((id) => id !== media.id)
          : [...prev, media.id]
      );
    } else {
      setSelectedIds([media.id]);
    }
  };

  const confirmSelection = () => {
    const selected = medias.filter((m) => selectedIds.includes(m.id));
    onSelect(selected);
    onClose();
    setSelectedIds([]);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) return;
    setUploadError(null);

    if (accept === "video/mp4") {
      const invalidFile = Array.from(uploadFiles).find((file) => file.type !== "video/mp4");
      if (invalidFile) {
        setUploadError("Veuillez sélectionner uniquement des vidéos MP4.");
        return;
      }
    }

    setUploading(true);
    setOptimizing(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
      const tokenRes = await fetchWithTimeout("/api/auth/token", { credentials: "include" }, 15_000);
      const tokenData = tokenRes.ok ? await tokenRes.json().catch(() => null) : null;
      const token = tokenData?.token as string | undefined;
      const authHeader: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
      if (!token) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      // Upload files sequentially or in parallel
      const uploadPromises = Array.from(uploadFiles).map(async (file) => {
          const preparedFile = await compressImageFile(file).catch(() => file);
          const formData = new FormData();
          formData.append("file", preparedFile);
          const res = await fetch(`${apiUrl}/admin/media`, {
              method: "POST",
              body: formData,
              credentials: "include",
              headers: authHeader,
          });
          if (!res.ok) {
            if (res.status === 413) {
              throw new Error("Fichier trop volumineux (limite serveur).");
            }
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.message || `Échec de l'upload ${file.name} (code ${res.status}).`);
          }
          return res.json();
      });

      await Promise.all(uploadPromises);

      setUploadFiles(null);
      setUploadError(null);
      setActiveTab("library");
      fetchMedias(1, ""); // Refresh library
    } catch (err) {
      console.error(err);
      if (getNetworkProblemKind(err)) {
        setUploadError(getFriendlyNetworkErrorMessage(err));
        return;
      }
      setUploadError(
        err instanceof Error ? err.message : "Erreur lors de l'upload. Vérifiez la taille/format du fichier."
      );
    } finally {
      setOptimizing(false);
      setUploading(false);
    }
  };

  const getFolderLabel = (media: Media) =>
    media.name || media.alt || media.url?.split("/").pop() || `Dossier ${media.id}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Médiathèque"
      size="xl"
      footer={
        activeTab === "library" ? (
          <>
            <div className="flex-1 text-sm text-slate-500">
              {selectedIds.length} fichier(s) sélectionné(s)
            </div>
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={confirmSelection} disabled={selectedIds.length === 0}>
              Insérer
            </Button>
          </>
        ) : null
      }
    >
      <div className="flex flex-col h-[60vh]">
        {/* Tabs */}
	        <div className="flex gap-4 border-b border-slate-100 dark:border-slate-700 mb-4">
	          <button
	            onClick={() => {
                setActiveTab("library");
                setUploadError(null);
              }}
	            className={clsx(
	              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
	              activeTab === "library"
	                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
	                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            Bibliothèque
	          </button>
	          <button
	            onClick={() => {
                setActiveTab("upload");
                setUploadError(null);
              }}
	            className={clsx(
	              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
	              activeTab === "upload"
	                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            Téléverser
          </button>
        </div>

        {activeTab === "library" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                {breadcrumbs.map((crumb, index) => (
                  <button
                    key={`${crumb.id ?? "root"}-${index}`}
                    type="button"
                    onClick={() => {
                      if (crumb.id === currentFolderId) return;
                      setCurrentFolderId(crumb.id);
                      setBreadcrumbs((prev) => prev.slice(0, index + 1));
                      setSelectedIds([]);
                    }}
                    className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-slate-400"
                  >
                    {crumb.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  className="max-w-xs"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 relative">
              {loading && (
                <div className="absolute inset-0 z-10 grid place-items-center gap-2 text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-black/60">
                  <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
                  <p className="text-sm font-medium">Chargement des médias en cours…</p>
                </div>
              )}
	              <div className={clsx("relative z-0 h-full", loading && "opacity-30 pointer-events-none")}>
	                {loading ? (
	                  <div className="flex items-center justify-center h-full">
	                    <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
	                  </div>
	                ) : libraryError ? (
	                  <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-300 text-center px-6">
	                    <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
	                    <p className="font-medium">Impossible de charger la médiathèque</p>
	                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{libraryError}</p>
	                    <Button
	                      className="mt-4"
	                      variant="outline"
	                      onClick={() => fetchMedias(1, search, currentFolderId)}
	                    >
	                      Réessayer
	                    </Button>
	                  </div>
	                ) : medias.length === 0 ? (
	                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
	                    <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
	                    <p>Aucun média trouvé</p>
	                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {medias.map((media) => {
                      const isFolder = media.entry_type === "folder";
                      const isImage = media.mime?.startsWith("image/");
                      const isVideo = media.mime?.startsWith("video/");
                      const isPdf = media.mime === "application/pdf";

                      const handleItemClick = () => {
                        if (isFolder) {
                          setCurrentFolderId(media.id);
                          setBreadcrumbs((prev) => [...prev, { id: media.id, name: getFolderLabel(media) }]);
                          setSelectedIds([]);
                          return;
                        }
                        handleSelect(media);
                      };

                      return (
                        <div
                          key={media.id}
                          onClick={handleItemClick}
                          className={clsx(
                            "group relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all",
                            selectedIds.includes(media.id)
                              ? "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900"
                              : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                          )}
                        >
                          {isFolder ? (
                            <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-300">
                              <Folder className="w-10 h-10 text-yellow-500" />
                              <span className="text-[12px] font-semibold uppercase tracking-wider">
                                {getFolderLabel(media)}
                              </span>
                            </div>
                          ) : isImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={media.url}
                              alt={media.alt || "Media"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-300">
                              {isVideo ? <Video className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                              <span className="text-[10px] font-semibold uppercase tracking-wider">
                                {isVideo ? "Video" : isPdf ? "PDF" : "Fichier"}
                              </span>
                            </div>
                          )}

                          {selectedIds.includes(media.id) && (
                            <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center">
                              <Check className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => fetchMedias(page - 1, search, currentFolderId)}
                  >
                    Précédent
                  </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {page} / {totalPages}
                </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => fetchMedias(page + 1, search, currentFolderId)}
                  >
                    Suivant
                  </Button>
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                  <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Sélectionnez un fichier
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {uploadHint || "JPG, PNG, GIF, MP4, PDF jusqu'à 10MB"}
              </p>
              
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                onChange={(e) => setUploadFiles(e.target.files)}
                accept={accept || "image/*,application/pdf,video/*"}
              />
              
              {!uploadFiles ? (
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-colors"
                >
                  Choisir sur l'ordinateur
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
                    {uploadFiles.length} fichier(s) sélectionné(s)
                  </div>
	                <div className="flex gap-2 justify-center">
	                  <Button variant="ghost" onClick={() => setUploadFiles(null)}>Annuler</Button>
	                  <Button onClick={handleUpload} loading={uploading}>Envoyer</Button>
	                </div>
                  {uploadError && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      {uploadError}
                    </div>
                  )}
	                {optimizing && (
	                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
	                    Optimisation des images en cours...
	                  </div>
	                )}
	              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
