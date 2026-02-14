"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, Palette } from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

type TagItem = {
  id: number;
  name: string;
  slug: string;
  color?: string;
  posts_count?: number;
};

const colors = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Emerald", value: "#10b981" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Teal", value: "#14b8a6" },
];

export default function AdminTagsPage() {
  const [items, setItems] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", color: "#6366f1" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/tags?per_page=100");
    const json = await res.json();
    setItems(json?.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

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
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setCreateModalOpen(false);
        setFormData({ name: "", slug: "", color: "#6366f1" });
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!selectedTag) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tags/${selectedTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEditModalOpen(false);
        setSelectedTag(null);
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedTag) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tags/${selectedTag.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setSelectedTag(null);
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(tag: TagItem) {
    setSelectedTag(tag);
    setFormData({ name: tag.name, slug: tag.slug, color: tag.color || "#6366f1" });
    setEditModalOpen(true);
  }

  const columns = [
    {
      key: "name" as keyof TagItem,
      header: "Tag",
      sortable: true,
      render: (item: TagItem) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${item.color || "#6366f1"}20` }}
          >
            <Tag className="w-5 h-5" style={{ color: item.color || "#6366f1" }} />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">/{item.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "color" as keyof TagItem,
      header: "Couleur",
      render: (item: TagItem) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
            style={{ backgroundColor: item.color || "#6366f1" }}
          />
          <span className="text-sm text-slate-600 dark:text-slate-300">{item.color || "#6366f1"}</span>
        </div>
      ),
    },
    {
      key: "posts_count" as keyof TagItem,
      header: "Articles",
      sortable: true,
      render: (item: TagItem) => (
        <Badge variant="default" className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700">{item.posts_count ?? 0}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tags</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gérez les tags pour vos articles</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData({ name: "", slug: "", color: "#6366f1" });
            setCreateModalOpen(true);
          }}
        >
          Nouveau tag
        </Button>
      </div>

      {/* Tags Grid Preview */}
      <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        {items.slice(0, 10).map((tag) => (
          <span
            key={tag.id}
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${tag.color || "#6366f1"}15`,
              color: tag.color || "#6366f1",
            }}
          >
            {tag.name}
          </span>
        ))}
        {items.length > 10 && (
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
            +{items.length - 10} autres
          </span>
        )}
        {items.length === 0 && (
          <span className="text-sm text-slate-500 dark:text-slate-400">Aucun tag créé</span>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={items}
        keyField="id"
        loading={loading}
        emptyMessage="Aucun tag trouvé"
        searchPlaceholder="Rechercher un tag..."
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
              onClick={() => {
                setSelectedTag(item);
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
        isOpen={createModalOpen || editModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditModalOpen(false);
        }}
        title={createModalOpen ? "Nouveau tag" : "Modifier le tag"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nom du tag"
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
          
          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Couleur
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color.value
                      ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Aperçu:</p>
            <span
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${formData.color}15`,
                color: formData.color,
              }}
            >
              {formData.name || "Nom du tag"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setCreateModalOpen(false);
              setEditModalOpen(false);
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={createModalOpen ? handleCreate : handleUpdate}
            loading={saving}
          >
            {createModalOpen ? "Créer" : "Enregistrer"}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le tag"
        message={`Êtes-vous sûr de vouloir supprimer le tag "${selectedTag?.name}" ?`}
        confirmText="Supprimer"
        variant="danger"
        loading={saving}
      />
    </div>
  );
}
