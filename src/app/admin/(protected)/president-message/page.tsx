"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  User,
  Check,
  Star,
} from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SkeletonListPage } from "@/components/ui/Skeleton";
import { MediaPickerModal, Media } from "@/components/admin/media/MediaPickerModal";

type PresidentMessage = {
  id: number;
  title: string;
  intro: string | null;
  content: string;
  president_name: string;
  president_title: string | null;
  mandate_period: string | null;
  photo: { id: number; url: string } | null;
  is_active: boolean;
  created_at: string;
};

type PresidentPhoto = { id: number; url: string };

const emptyForm = {
  title: "",
  intro: "",
  content: "",
  president_name: "",
  president_title: "Président",
  mandate_period: "",
  photo_id: null as number | null,
  photo: null as PresidentPhoto | null,
  is_active: false,
};

type PresidentMessageForm = typeof emptyForm;

export default function AdminPresidentMessagePage() {
  const [data, setData] = useState<PresidentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState<PresidentMessage | null>(null);
  const [form, setForm] = useState<PresidentMessageForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/president-messages");
    const json = await res.json();
    setData(json?.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: PresidentMessage) {
    setSelected(item);
    setForm({
      title: item.title,
      intro: item.intro || "",
      content: item.content,
      president_name: item.president_name,
      president_title: item.president_title || "Président",
      mandate_period: item.mandate_period || "",
      photo_id: item.photo?.id || null,
      photo: item.photo || null,
      is_active: item.is_active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { photo, ...payload } = form;
      const url = selected
        ? `/api/admin/president-messages/${selected.id}`
        : "/api/admin/president-messages";
      const method = selected ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      const res = await fetch(`/api/admin/president-messages/${selected.id}`, {
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

  async function handleActivate(item: PresidentMessage) {
    await fetch(`/api/admin/president-messages/${item.id}/activate`, { method: "POST" });
    load();
  }

  const handleSelectPhoto = (medias: Media[]) => {
    if (!medias.length) return;
    setForm((prev) => ({
      ...prev,
      photo_id: medias[0].id,
      photo: { id: medias[0].id, url: medias[0].url },
    }));
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photo_id: null, photo: null }));
  };

  const columns = [
    {
      key: "title" as keyof PresidentMessage,
      header: "Message",
      sortable: true,
      render: (item: PresidentMessage) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center overflow-hidden">
            {item.photo ? (
              <img src={item.photo.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 dark:text-white truncate flex items-center gap-2">
              {item.title}
              {item.is_active && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {item.president_name} • {item.mandate_period || "Mandat non spécifié"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "is_active" as keyof PresidentMessage,
      header: "Statut",
      render: (item: PresidentMessage) => (
        <Badge variant={item.is_active ? "success" : "default"} dot>
          {item.is_active ? "Actif" : "Inactif"}
        </Badge>
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mot du Président</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez le message de bienvenue du Président
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Nouveau message
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data}
        keyField="id"
        loading={loading}
        emptyMessage="Aucun message"
        actions={(item) => (
          <div className="flex items-center gap-1">
            {!item.is_active && (
              <button
                onClick={() => handleActivate(item)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Activer"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
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
        title={selected ? "Modifier le message" : "Nouveau message du Président"}
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Titre *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Message du Président"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du Président *"
              value={form.president_name}
              onChange={(e) => setForm({ ...form, president_name: e.target.value })}
              placeholder="Pr. Jean DUPONT"
            />
            <Input
              label="Titre"
              value={form.president_title}
              onChange={(e) => setForm({ ...form, president_title: e.target.value })}
              placeholder="Président"
            />
          </div>

          <Input
            label="Période du mandat"
            value={form.mandate_period}
            onChange={(e) => setForm({ ...form, mandate_period: e.target.value })}
            placeholder="2020-2025"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Photo du Président
            </label>
            {form.photo ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                <img
                  src={form.photo.url}
                  alt="Photo du président"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="danger" size="sm" onClick={handleRemovePhoto}>
                    Retirer
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setShowPhotoPicker(true)}
                className="aspect-video cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-400 dark:hover:text-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 transition-all"
              >
                Ajouter une photo
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Introduction
            </label>
            <textarea
              value={form.intro}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Introduction courte..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Contenu du message *
            </label>
            <RichTextEditor
              value={form.content}
              onChange={(val) => setForm({ ...form, content: val })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_active" className="text-sm text-slate-700 dark:text-slate-300">
              Définir comme message actif (affiché sur le site)
            </label>
          </div>
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

      <MediaPickerModal
        isOpen={showPhotoPicker}
        onClose={() => setShowPhotoPicker(false)}
        onSelect={handleSelectPhoto}
        multiple={false}
        filterType="image"
        accept="image/*"
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le message"
        message={`Êtes-vous sûr de vouloir supprimer "${selected?.title}" ?`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
