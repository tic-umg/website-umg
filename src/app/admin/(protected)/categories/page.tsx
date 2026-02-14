"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tags, MoreHorizontal } from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

type Category = {
  id: number;
  name: string;
  slug: string;
  type?: string;
  posts_count?: number;
  documents_count?: number;
  created_at?: string;
};

type CategoryFormData = {
  name: string;
  slug: string;
  type: string;
};

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<"posts" | "documents">("posts");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: "", slug: "", type: "posts" });
  const [saving, setSaving] = useState(false);

  const getEndpoint = () => {
    return activeType === "posts" ? "/api/admin/categories" : "/api/admin/document-categories";
  };

  async function load() {
    setLoading(true);
    const url = activeType === "posts" 
      ? `/api/admin/categories?type=posts&per_page=50` 
      : `/api/admin/document-categories?per_page=50`;
      
    const res = await fetch(url);
    const json = await res.json();
    setItems(json?.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [activeType]);

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  }

  async function handleCreate() {
    setSaving(true);
    try {
      const endpoint = getEndpoint();
      const payload = activeType === "posts" 
        ? { ...formData, type: "posts" }
        : { name: formData.name, slug: formData.slug }; // Document categories don't need 'type'

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setCreateModalOpen(false);
        setFormData({ name: "", slug: "", type: "posts" });
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!selectedCategory) return;
    setSaving(true);
    try {
      const endpoint = `${getEndpoint()}/${selectedCategory.id}`;
      const payload = activeType === "posts" 
        ? formData
        : { name: formData.name, slug: formData.slug };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditModalOpen(false);
        setSelectedCategory(null);
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedCategory) return;
    setSaving(true);
    try {
      const endpoint = `${getEndpoint()}/${selectedCategory.id}`;
      const res = await fetch(endpoint, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setSelectedCategory(null);
        load();
      } else {
        const body = await res.json();
        alert(body.message || "Impossible de supprimer cette catégorie");
      }
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(category: Category) {
    setSelectedCategory(category);
    setFormData({ name: category.name, slug: category.slug, type: category.type ?? activeType });
    setEditModalOpen(true);
  }

  function openDeleteModal(category: Category) {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  }

  const columns = [
    {
      key: "name" as keyof Category,
      header: "Nom",
      sortable: true,
      render: (item: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type" as keyof Category,
      header: "Type",
      sortable: true,
      render: (item: Category) => (
        <Badge variant={activeType === "posts" ? "primary" : "info"}>
          {activeType === "posts" ? "Article" : "Document"}
        </Badge>
      ),
    },
    {
      key: "posts_count" as keyof Category,
      header: "Éléments",
      sortable: true,
      render: (item: Category) => (
        <span className="text-slate-600 dark:text-slate-300">
          {activeType === "posts" ? (item.posts_count ?? 0) : (item.documents_count ?? 0)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Catégories</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez les catégories pour les articles et documents
          </p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData({ name: "", slug: "", type: activeType });
            setCreateModalOpen(true);
          }}
        >
          Nouvelle catégorie
        </Button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveType("posts")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeType === "posts"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Articles
        </button>
        <button
          onClick={() => setActiveType("documents")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeType === "documents"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Documents
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={items}
        keyField="id"
        loading={loading}
        emptyMessage="Aucune catégorie trouvée"
        searchPlaceholder="Rechercher une catégorie..."
        actions={(item) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEditModal(item)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Modifier"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(item)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Nouvelle catégorie"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nom de la catégorie"
            placeholder="Ex: Actualités"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <Input
            label="Slug"
            placeholder="Ex: actualites"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            helperText="URL-friendly identifier (auto-généré)"
          />
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreate} loading={saving}>
            Créer
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modifier la catégorie"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nom de la catégorie"
            placeholder="Ex: Actualités"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <Input
            label="Slug"
            placeholder="Ex: actualites"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleUpdate} loading={saving}>
            Enregistrer
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${selectedCategory?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={saving}
      />
    </div>
  );
}
