"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  MapPin,
  Phone,
  User,
  Search,
} from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { Input } from "@/components/ui/Input";
import { SkeletonListPage } from "@/components/ui/Skeleton";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

type Service = {
  id: number;
  name: string;
  slug: string;
  chef_service: string | null;
  address: string | null;
  contact: string | null;
  logo: { id: number; url: string } | null;
  document: { id: number; title: string; slug: string; file_url: string | null } | null;
  order: number;
  is_active: boolean;
  created_at: string;
};

const emptyForm = {
  name: "",
  chef_service: "",
  address: "",
  contact: "",
  logo_id: null as number | null,
  document_id: null as number | null,
  order: 0,
  is_active: true,
};

export default function AdminServicesPage() {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [documentPickerOpen, setDocumentPickerOpen] = useState(false);
  const [pickingFor, setPickingFor] = useState<'logo' | 'document' | null>(null);
  const [documents, setDocuments] = useState<{ id: number; title: string; slug: string }[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services?per_page=50");
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

  async function loadDocuments() {
    setLoadingDocuments(true);
    try {
      const res = await fetch("/api/admin/documents?per_page=100");
      if (!res.ok) {
        setDocuments([]);
        return;
      }
      const json = await res.json().catch(() => null);
      setDocuments(json?.data ?? []);
    } catch (e) {
      console.error("Failed to load documents", e);
    } finally {
      setLoadingDocuments(false);
    }
  }

  useEffect(() => {
    if (documentPickerOpen) {
      loadDocuments();
    }
  }, [documentPickerOpen]);

  function openCreate() {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: Service) {
    setSelected(item);
    setForm({
      name: item.name,
      chef_service: item.chef_service || "",
      address: item.address || "",
      contact: item.contact || "",
      logo_id: item.logo?.id || null,
      document_id: item.document?.id || null,
      order: item.order,
      is_active: item.is_active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = selected
        ? `/api/admin/services/${selected.id}`
        : "/api/admin/services";
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
      const res = await fetch(`/api/admin/services/${selected.id}`, {
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

  function handleMediaSelect(media: { id: number; url: string }[]) {
    if (pickingFor === 'logo' && media.length > 0) {
      setForm({ ...form, logo_id: media[0].id });
    }
    setMediaPickerOpen(false);
    setPickingFor(null);
  }

  function handleDocumentSelect(document: { id: number; title: string }) {
    if (pickingFor === 'document') {
      setForm({ ...form, document_id: document.id });
    }
    setDocumentPickerOpen(false);
    setPickingFor(null);
  }

  const activeCount = data.filter((s) => s.is_active).length;
  const inactiveCount = data.length - activeCount;

  if (loading) {
    return <SkeletonListPage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez les services administratifs et académiques
          </p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
          Nouveau service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total"
          value={data.length}
          icon={<Briefcase className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Actifs"
          value={activeCount}
          icon={<Briefcase className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Inactifs"
          value={inactiveCount}
          icon={<Briefcase className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      <Table
        data={data}
        keyField="id"
        columns={[
          {
            key: "name",
            header: "Nom",
            render: (item) => (
              <div className="flex items-center gap-3">
                {item.logo && (
                  <img
                    src={item.logo.url}
                    alt={item.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                )}
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {item.name}
                  </div>
                  {item.chef_service && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.chef_service}
                    </div>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "address",
            header: "Adresse",
            render: (item) => (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                {item.address ? (
                  <>
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate max-w-xs">{item.address}</span>
                  </>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </div>
            ),
          },
          {
            key: "contact",
            header: "Contact",
            render: (item) => (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                {item.contact ? (
                  <>
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{item.contact}</span>
                  </>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </div>
            ),
          },
          {
            key: "is_active",
            header: "Statut",
            render: (item) => (
              <Badge variant={item.is_active ? "success" : "default"}>
                {item.is_active ? "Actif" : "Inactif"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (item) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelected(item);
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? "Modifier le service" : "Nouveau service"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nom du service *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Service des Affaires Académiques"
          />

          <Input
            label="Chef de service"
            value={form.chef_service}
            onChange={(e) => setForm({ ...form, chef_service: e.target.value })}
            placeholder="Nom du chef de service"
            leftIcon={<User />}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Adresse
            </label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Adresse complète du service"
            />
          </div>

          <Input
            label="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder="Téléphone, email, etc."
            leftIcon={<Phone />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Logo (optionnel)
              </label>
              <div className="flex items-center gap-2">
                {form.logo_id && (selected?.logo || data.find(s => s.logo?.id === form.logo_id)?.logo) && (
                  <img
                    src={(selected?.logo || data.find(s => s.logo?.id === form.logo_id)?.logo)?.url}
                    alt="Logo"
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPickingFor('logo');
                    setMediaPickerOpen(true);
                  }}
                >
                  {form.logo_id ? "Changer" : "Sélectionner"}
                </Button>
                {form.logo_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({ ...form, logo_id: null })}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Document (optionnel)
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {form.document_id && (() => {
                  const selectedDoc = selected?.document || data.find(s => s.document?.id === form.document_id)?.document || documents.find(d => d.id === form.document_id);
                  return selectedDoc ? (
                    <span className="text-sm text-slate-600 dark:text-slate-300 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                      {selectedDoc.title}
                    </span>
                  ) : null;
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPickingFor('document');
                    setDocumentPickerOpen(true);
                  }}
                >
                  {form.document_id ? "Changer" : "Sélectionner"}
                </Button>
                {form.document_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({ ...form, document_id: null })}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Input
            label="Ordre d'affichage"
            type="number"
            value={form.order.toString()}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_active" className="text-sm text-slate-700 dark:text-slate-300">
              Service actif (visible sur le site public)
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

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => {
          setMediaPickerOpen(false);
          setPickingFor(null);
        }}
        onSelect={handleMediaSelect}
      />

      {/* Document Picker */}
      <Modal
        isOpen={documentPickerOpen}
        onClose={() => {
          setDocumentPickerOpen(false);
          setPickingFor(null);
        }}
        title="Sélectionner un document"
        size="lg"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loadingDocuments ? (
            <div className="text-center py-8 text-slate-500">Chargement...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Aucun document disponible
            </div>
          ) : (
            documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleDocumentSelect(doc)}
                className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-500 transition-colors"
              >
                <div className="font-medium text-slate-900 dark:text-white">{doc.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{doc.slug}</div>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le service"
        message={`Êtes-vous sûr de vouloir supprimer "${selected?.name}" ?`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
