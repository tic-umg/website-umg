"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Landmark,
  FileText,
} from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SkeletonListPage } from "@/components/ui/Skeleton";

type OrganizationPage = {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  page_type: string;
  order: number;
  is_published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
};

const PAGE_TYPES = [
  { value: "historique", label: "Historique", color: "blue" },
  { value: "organisation", label: "Organisation", color: "indigo" },
  { value: "textes", label: "Textes & Arrêtés", color: "amber" },
  { value: "organigramme", label: "Organigramme", color: "emerald" },
];

const emptyForm = {
  title: "",
  content: "",
  page_type: "historique",
  order: 0,
  is_published: false,
  meta_title: "",
  meta_description: "",
};

export default function AdminOrganizationPage() {
  const [data, setData] = useState<OrganizationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState<OrganizationPage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/organization-pages?per_page=50");
      if (!res.ok) {
        console.error("Failed to load organization pages", res.status);
        setData([]);
        return;
      }
      const json = await res.json().catch(() => ({ data: [] }));
      setData(json?.data ?? []);
    } catch (error) {
      console.error("Error loading organization pages", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: OrganizationPage) {
    setSelected(item);
    setForm({
      title: item.title,
      content: item.content || "",
      page_type: item.page_type,
      order: item.order,
      is_published: item.is_published,
      meta_title: item.meta_title || "",
      meta_description: item.meta_description || "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = selected
        ? `/api/admin/organization-pages/${selected.id}`
        : "/api/admin/organization-pages";
      const method = selected ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setModalOpen(false);
        load();
      } else {
        const body = await res.json();
        alert(body.message || "Erreur");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/organization-pages/${selected.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setSelected(null);
        load();
      }
    } finally {
      setDeleting(false);
    }
  }

  function getTypeLabel(type: string) {
    return PAGE_TYPES.find((t) => t.value === type)?.label || type;
  }

  function getTypeBadge(type: string) {
    const config = PAGE_TYPES.find((t) => t.value === type);
    const variant = config?.color === "blue" ? "info" 
      : config?.color === "indigo" ? "default"
      : config?.color === "amber" ? "warning"
      : "success";
    return <Badge variant={variant}>{config?.label || type}</Badge>;
  }

  const columns = [
    {
      key: "title" as keyof OrganizationPage,
      header: "Page",
      sortable: true,
      render: (item: OrganizationPage) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 dark:text-white truncate">{item.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">/{item.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "page_type" as keyof OrganizationPage,
      header: "Type",
      render: (item: OrganizationPage) => getTypeBadge(item.page_type),
    },
    {
      key: "is_published" as keyof OrganizationPage,
      header: "Statut",
      render: (item: OrganizationPage) => (
        <Badge variant={item.is_published ? "success" : "default"} dot>
          {item.is_published ? "Publié" : "Brouillon"}
        </Badge>
      ),
    },
    {
      key: "order" as keyof OrganizationPage,
      header: "Ordre",
      render: (item: OrganizationPage) => (
        <span className="text-slate-600 dark:text-slate-400">{item.order}</span>
      ),
    },
  ];

  if (loading) {
    return <SkeletonListPage />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pages Université</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez les pages institutionnelles
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Nouvelle page
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {PAGE_TYPES.map((type) => (
          <StatCard
            key={type.value}
            title={type.label}
            value={data.filter((p) => p.page_type === type.value).length}
            icon={<Landmark className="w-6 h-6" />}
            color={type.color as "blue" | "indigo" | "amber" | "emerald"}
          />
        ))}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data}
        keyField="id"
        loading={loading}
        emptyMessage="Aucune page"
        searchPlaceholder="Rechercher une page..."
        actions={(item) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEdit(item)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Modifier"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelected(item);
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? "Modifier la page" : "Nouvelle page"}
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Titre *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Titre de la page"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" id="page_type_label">
                Type de page *
              </label>
              <select
                value={form.page_type}
                onChange={(e) => setForm({ ...form, page_type: e.target.value })}
                aria-labelledby="page_type_label"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              >
                {PAGE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Contenu
            </label>
            <RichTextEditor
              value={form.content}
              onChange={(val) => setForm({ ...form, content: val })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ordre d'affichage"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
            />
            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="is_published" className="text-sm text-slate-700 dark:text-slate-300">
                Publier cette page
              </label>
            </div>
          </div>

          <details className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
              Options SEO
            </summary>
            <div className="mt-4 space-y-4">
              <Input
                label="Meta Title"
                value={form.meta_title}
                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                placeholder="Titre pour les moteurs de recherche"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Meta Description
                </label>
                <textarea
                  value={form.meta_description}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="Description pour les moteurs de recherche"
                />
              </div>
            </div>
          </details>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {selected ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer la page"
        message={`Êtes-vous sûr de vouloir supprimer "${selected?.title}" ?`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
