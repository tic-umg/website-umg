"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  FileText,
  File,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileArchive,
  Presentation,
  Calendar,
  HardDrive,
  Grid,
  List,
  Star,
} from "lucide-react";

// Custom PDF Icon component - clean and readable
function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document shape */}
      <path d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2H6Z" fill="currentColor" fillOpacity="0.15"/>
      <path d="M14 2L20 8H15C14.4477 8 14 7.55228 14 7V2Z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8M14 2L20 8M14 2V7C14 7.55228 14.4477 8 15 8H20M14 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* PDF text */}
      <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="bold" fontFamily="system-ui, sans-serif">PDF</text>
    </svg>
  );
}

// Custom Word Icon component
function WordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 13L8.5 18L10 14.5L11.5 18L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface FileIconConfig {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
}
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";

type Document = {
  id: number;
  title: string;
  slug: string;
  file_type: string;
  file_size: number;
  downloads_count: number;
  is_important?: boolean;
  category?: { name: string };
  created_at: string;
};

export default function AdminDocumentsPage() {
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/documents?per_page=50");
      if (!res.ok) {
        setItems([]);
        return;
      }
      const json = await res.json().catch(() => null);
      setItems(json?.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleDelete() {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/documents/${selectedDoc.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setSelectedDoc(null);
        load();
      }
    } finally {
      setDeleting(false);
    }
  }

  const getFileConfig = (type: string | undefined | null): FileIconConfig => {
    const t = type?.toLowerCase() || '';

    // PDF
    if (t.includes('pdf')) {
      return { icon: PdfIcon, bgColor: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400' };
    }

    // Word documents
    if (t.includes('word') || t.includes('document') || t.includes('docx') || t.includes('doc') || t.includes('msword')) {
      return { icon: WordIcon, bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' };
    }

    // Excel/Spreadsheets
    if (t.includes('spreadsheet') || t.includes('excel') || t.includes('xlsx') || t.includes('xls') || t.includes('csv')) {
      return { icon: FileSpreadsheet, bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' };
    }

    // PowerPoint
    if (t.includes('presentation') || t.includes('powerpoint') || t.includes('pptx') || t.includes('ppt')) {
      return { icon: Presentation, bgColor: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' };
    }

    // Images
    if (t.includes('image') || t.includes('png') || t.includes('jpg') || t.includes('jpeg') || t.includes('gif') || t.includes('webp')) {
      return { icon: FileImage, bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' };
    }

    // Videos
    if (t.includes('video') || t.includes('mp4') || t.includes('avi') || t.includes('mov') || t.includes('webm')) {
      return { icon: FileVideo, bgColor: 'bg-pink-100 dark:bg-pink-900/30', iconColor: 'text-pink-600 dark:text-pink-400' };
    }

    // Archives
    if (t.includes('archive') || t.includes('zip') || t.includes('rar') || t.includes('7z') || t.includes('tar') || t.includes('gz')) {
      return { icon: FileArchive, bgColor: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' };
    }

    // Text files
    if (t.includes('text') || t.includes('txt')) {
      return { icon: FileText, bgColor: 'bg-slate-100 dark:bg-slate-700', iconColor: 'text-slate-600 dark:text-slate-300' };
    }

    // Default
    return { icon: File, bgColor: 'bg-slate-100 dark:bg-slate-700', iconColor: 'text-slate-500 dark:text-slate-400' };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns = [
    {
      key: "title" as keyof Document,
      header: "Document",
      sortable: true,
      render: (item: Document) => {
        const config = getFileConfig(item.file_type);
        const IconComponent = config.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${config.bgColor} rounded-xl flex items-center justify-center relative`}>
              <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
              {item.is_important && (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900 dark:text-white truncate max-w-xs">{item.title}</p>
                {item.is_important && (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">{item.file_type?.split('/').pop() || 'Fichier'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "category" as keyof Document,
      header: "Catégorie",
      render: (item: Document) => (
        <Badge variant="primary">{item.category?.name ?? "Non classé"}</Badge>
      ),
    },
    {
      key: "file_size" as keyof Document,
      header: "Taille",
      sortable: true,
      render: (item: Document) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <HardDrive className="w-4 h-4" />
          {formatFileSize(item.file_size)}
        </div>
      ),
    },
    {
      key: "downloads_count" as keyof Document,
      header: "Téléchargements",
      sortable: true,
      render: (item: Document) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Download className="w-4 h-4" />
          <a
            href={`/documents/${item.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {item.downloads_count}
          </a>
        </div>
      ),
    },
    {
      key: "created_at" as keyof Document,
      header: "Date",
      sortable: true,
      render: (item: Document) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-sm">
          <Calendar className="w-4 h-4" />
          {new Date(item.created_at).toLocaleDateString("fr-FR")}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Documents</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gérez vos documents et fichiers</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
          <Link href="/admin/documents/create">
            <Button icon={<Plus className="w-4 h-4" />}>Ajouter</Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total documents</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{items.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Téléchargements</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {items.reduce((acc, item) => acc + (item.downloads_count || 0), 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Taille totale</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatFileSize(items.reduce((acc, item) => acc + (item.file_size || 0), 0))}
          </p>
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <Table
          columns={columns}
          data={items}
          keyField="id"
          loading={loading}
          emptyMessage="Aucun document trouvé"
          searchPlaceholder="Rechercher un document..."
          actions={(item) => (
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/documents/${item.id}/edit`}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Modifier"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  setSelectedDoc(item);
                  setDeleteModalOpen(true);
                }}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const config = getFileConfig(item.file_type);
            const IconComponent = config.icon;
            return (
            <Card key={item.id} hover padding="md" className="group">
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${config.bgColor} rounded-xl flex items-center justify-center mb-3 relative`}>
                  <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
                  {item.is_important && (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <p className="font-medium text-slate-900 dark:text-white truncate max-w-[120px]">{item.title}</p>
                  {item.is_important && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatFileSize(item.file_size)} • {item.downloads_count} téléchargements
                </p>
                <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDoc(item);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le document"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedDoc?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
