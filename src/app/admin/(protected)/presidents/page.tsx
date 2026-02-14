"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  User,
  Star,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { SkeletonListPage } from "@/components/ui/Skeleton";
import { MediaPickerModal, Media } from "@/components/admin/media/MediaPickerModal";

type President = {
  id: number;
  name: string;
  title: string | null;
  mandate_start: number;
  mandate_end: number | null;
  mandate_period: string;
  bio: string | null;
  photo: { id: number; url: string } | null;
  is_current: boolean;
  order: number;
  created_at: string;
};

const emptyForm = {
  name: "",
  title: "Recteur",
  mandate_start: new Date().getFullYear(),
  mandate_end: null as number | null,
  bio: "",
  photo_id: null as number | null,
  is_current: false,
};

export default function AdminPresidentsPage() {
  const [data, setData] = useState<President[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [selected, setSelected] = useState<President | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedPhoto, setSelectedPhoto] = useState<{ id: number; url: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/presidents");
      if (!res.ok) {
        setData([]);
        return;
      }
      const json = await res.json().catch(() => null);
      setData(json?.data ?? []);
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
    setSelectedPhoto(null);
    setModalOpen(true);
  }

  function openEdit(item: President) {
    setSelected(item);
    setForm({
      name: item.name,
      title: item.title || "Recteur",
      mandate_start: item.mandate_start,
      mandate_end: item.mandate_end,
      bio: item.bio || "",
      photo_id: item.photo?.id || null,
      is_current: item.is_current,
    });
    setSelectedPhoto(item.photo);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = selected
        ? `/api/admin/presidents/${selected.id}`
        : "/api/admin/presidents";
      const method = selected ? "PUT" : "POST";

      const payload = {
        ...form,
        mandate_end: form.mandate_end || null,
      };

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
      const res = await fetch(`/api/admin/presidents/${selected.id}`, {
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

  function handlePhotoSelect(medias: Media[]) {
    if (medias.length > 0) {
      const media = medias[0];
      setForm({ ...form, photo_id: media.id });
      setSelectedPhoto({ id: media.id, url: media.url });
    }
  }

  function removePhoto() {
    setForm({ ...form, photo_id: null });
    setSelectedPhoto(null);
  }

  const columns = [
    {
      key: "order" as keyof President,
      header: "",
      render: () => (
        <div className="cursor-grab text-slate-400">
          <GripVertical className="w-4 h-4" />
        </div>
      ),
    },
    {
      key: "name" as keyof President,
      header: "Président / Recteur",
      sortable: true,
      render: (item: President) => (
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
              {item.name}
              {item.is_current && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {item.title || "Recteur"} • {item.mandate_period}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "is_current" as keyof President,
      header: "Statut",
      render: (item: President) => (
        <Badge variant={item.is_current ? "success" : "default"} dot>
          {item.is_current ? "Actuel" : "Ancien"}
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Présidents / Recteurs</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez la liste historique des présidents et recteurs de l&apos;université
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Ajouter un président
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Avec photo</p>
          <p className="text-2xl font-bold text-emerald-600">{data.filter(p => p.photo).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Actuel</p>
          <p className="text-2xl font-bold text-indigo-600">{data.filter(p => p.is_current).length}</p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data}
        keyField="id"
        loading={loading}
        emptyMessage="Aucun président enregistré"
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
        title={selected ? "Modifier le président" : "Ajouter un président / recteur"}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Photo Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Photo
            </label>
            <div className="flex items-center gap-4">
              {selectedPhoto ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={selectedPhoto.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMediaPickerOpen(true)}
              >
                {selectedPhoto ? "Changer" : "Sélectionner"}
              </Button>
            </div>
          </div>

          <Input
            label="Nom complet *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Pr. Jean DUPONT"
          />

          <Input
            label="Titre / Fonction"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Recteur"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Début du mandat *"
              type="number"
              min={1900}
              max={2100}
              value={form.mandate_start}
              onChange={(e) => setForm({ ...form, mandate_start: parseInt(e.target.value) || new Date().getFullYear() })}
              placeholder="2020"
            />
            <Input
              label="Fin du mandat"
              type="number"
              min={1900}
              max={2100}
              value={form.mandate_end || ""}
              onChange={(e) => setForm({ ...form, mandate_end: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Laisser vide si actuel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Biographie courte
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Courte biographie du président..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={form.is_current}
              onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_current" className="text-sm text-slate-700 dark:text-slate-300">
              Président / Recteur actuel
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

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handlePhotoSelect}
        multiple={false}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le président"
        message={`Êtes-vous sûr de vouloir supprimer "${selected?.name}" de la liste ?`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
