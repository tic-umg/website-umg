"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Mail,
  Calendar,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Search,
  Users,
  AlertCircle,
  Copy,
  Pencil,
} from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";

type Subscriber = {
  id: number;
  email: string;
  name?: string;
  status: "active" | "unsubscribed" | "pending" | "bounced";
  subscribed_at: string;
  unsubscribed_at?: string;
};

type BulkImportResult = {
  imported: number;
  duplicates: number;
  invalid: number;
  total_processed: number;
} | null;

type Stats = {
  total: number;
  active: number;
  unsubscribed: number;
  pending: number;
};

export default function AdminSubscribersPage() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({ email: "", name: "", status: "active" });
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkResult, setBulkResult] = useState<BulkImportResult>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  async function load() {
    setLoading(true);
    // Fetch paginated data with status filter
    const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/newsletter/subscribers?per_page=50&page=${page}${statusParam}`);
    const json = await res.json();
    setItems(json?.data ?? []);

    // Get pagination meta
    const meta = json?.meta;
    if (meta) {
      setTotalPages(meta.last_page || 1);
    }

    // Fetch stats separately (all statuses)
    const [activeRes, unsubRes, pendingRes] = await Promise.all([
      fetch("/api/admin/newsletter/subscribers?per_page=1&status=active"),
      fetch("/api/admin/newsletter/subscribers?per_page=1&status=unsubscribed"),
      fetch("/api/admin/newsletter/subscribers?per_page=1&status=pending"),
    ]);

    const [activeJson, unsubJson, pendingJson] = await Promise.all([
      activeRes.json(),
      unsubRes.json(),
      pendingRes.json(),
    ]);

    const activeCount = activeJson?.meta?.total || 0;
    const unsubCount = unsubJson?.meta?.total || 0;
    const pendingCount = pendingJson?.meta?.total || 0;

    setStats({
      total: activeCount + unsubCount + pendingCount,
      active: activeCount,
      unsubscribed: unsubCount,
      pending: pendingCount,
    });

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [page, statusFilter]);

  async function handleCreate() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/newsletter/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, name: formData.name }),
      });
      if (res.ok) {
        setCreateModalOpen(false);
        setFormData({ email: "", name: "", status: "active" });
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!selectedSubscriber) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers/${selectedSubscriber.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEditModalOpen(false);
        setSelectedSubscriber(null);
        setFormData({ email: "", name: "", status: "active" });
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(subscriber: Subscriber) {
    setSelectedSubscriber(subscriber);
    setFormData({
      email: subscriber.email,
      name: subscriber.name || "",
      status: subscriber.status,
    });
    setEditModalOpen(true);
  }

  async function handleDelete() {
    if (!selectedSubscriber) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers/${selectedSubscriber.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setSelectedSubscriber(null);
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkImport() {
    if (!bulkEmails.trim()) return;
    setSaving(true);
    setBulkResult(null);
    try {
      const res = await fetch("/api/admin/newsletter/subscribers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: bulkEmails, status: "active" }),
      });
      const json = await res.json();
      if (res.ok) {
        setBulkResult(json.data);
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setSaving(true);
    try {
      const idsToDelete = Array.from(selectedIds).map(Number);
      console.log("Deleting IDs:", idsToDelete);

      const res = await fetch("/api/admin/newsletter/subscribers/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      const json = await res.json().catch(() => null);
      console.log("Response:", res.status, json);

      if (res.ok) {
        setBulkDeleteModalOpen(false);
        setSelectedIds(new Set());
        load();
      } else {
        console.error("Bulk delete failed:", json);
        alert(json?.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Erreur lors de la suppression");
    } finally {
      setSaving(false);
    }
  }

  function closeBulkModal() {
    setBulkModalOpen(false);
    setBulkEmails("");
    setBulkResult(null);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success" dot>Actif</Badge>;
      case "unsubscribed":
        return <Badge variant="warning" dot>Désabonné</Badge>;
      case "pending":
        return <Badge variant="info" dot>En attente</Badge>;
      case "bounced":
        return <Badge variant="error" dot>Erreur</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      key: "email" as keyof Subscriber,
      header: "Email",
      sortable: true,
      render: (item: Subscriber) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-semibold">
            {item.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{item.email}</p>
            {item.name && <p className="text-xs text-slate-500 dark:text-slate-400">{item.name}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "status" as keyof Subscriber,
      header: "Statut",
      sortable: true,
      render: (item: Subscriber) => getStatusBadge(item.status),
    },
    {
      key: "subscribed_at" as keyof Subscriber,
      header: "Date d'inscription",
      sortable: true,
      render: (item: Subscriber) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-sm">
          <Calendar className="w-4 h-4" />
          {new Date(item.subscribed_at).toLocaleDateString("fr-FR")}
        </div>
      ),
    },
    {
      key: "unsubscribed_at" as keyof Subscriber,
      header: "Date désabonnement",
      sortable: true,
      render: (item: Subscriber) => (
        item.unsubscribed_at ? (
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm">
            <XCircle className="w-4 h-4" />
            {new Date(item.unsubscribed_at).toLocaleDateString("fr-FR")}
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-sm">—</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Abonnés Newsletter</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gérez votre liste d&apos;abonnés</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setBulkDeleteModalOpen(true)}
            >
              Supprimer ({selectedIds.size})
            </Button>
          )}
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Exporter CSV
          </Button>
          <Button variant="outline" icon={<Upload className="w-4 h-4" />} onClick={() => setBulkModalOpen(true)}>
            Import en masse
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateModalOpen(true)}>
            Ajouter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total abonnés"
          value={stats.total}
          icon={<Mail className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Actifs"
          value={stats.active}
          icon={<CheckCircle className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Désabonnés"
          value={stats.unsubscribed}
          icon={<XCircle className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">Filtrer par statut :</span>
        <div className="flex gap-2">
          {[
            { value: "all", label: "Tous", count: stats.total },
            { value: "active", label: "Actifs", count: stats.active },
            { value: "unsubscribed", label: "Désabonnés", count: stats.unsubscribed },
            { value: "pending", label: "En attente", count: stats.pending },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => { setStatusFilter(filter.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={items}
        keyField="id"
        loading={loading}
        emptyMessage="Aucun abonné trouvé"
        searchPlaceholder="Rechercher par email..."
        pageSize={50}
        rowSelection={{
          selectedKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        actions={(item) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEditModal(item)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Modifier"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedSubscriber(item);
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="px-4 text-sm text-slate-600 dark:text-slate-400">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Ajouter un abonné"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Adresse email"
            type="email"
            placeholder="exemple@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Nom (optionnel)"
            placeholder="Jean Dupont"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreate} loading={saving}>
            Ajouter
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedSubscriber(null); }}
        title="Modifier l'abonné"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Adresse email"
            type="email"
            placeholder="exemple@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Nom (optionnel)"
            placeholder="Jean Dupont"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Actif</option>
              <option value="unsubscribed">Désabonné</option>
              <option value="pending">En attente</option>
              <option value="bounced">Erreur</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => { setEditModalOpen(false); setSelectedSubscriber(null); }}>
            Annuler
          </Button>
          <Button onClick={handleEdit} loading={saving}>
            Enregistrer
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer l'abonné"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedSubscriber?.email}" ?`}
        confirmText="Supprimer"
        variant="danger"
        loading={saving}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title="Supprimer les abonnés sélectionnés"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedIds.size} abonné(s) ? Cette action est irréversible.`}
        confirmText={`Supprimer (${selectedIds.size})`}
        variant="danger"
        loading={saving}
      />

      {/* Bulk Import Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={closeBulkModal}
        title="Ajouter des emails en masse"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Liste d&apos;emails (un par ligne)
            </label>
            <textarea
              className="w-full h-64 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder={"exemple1@email.com\nexemple2@email.com\nexemple3@email.com"}
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              disabled={saving}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Les emails invalides ou déjà existants seront ignorés
            </p>
          </div>

          {/* Results */}
          {bulkResult && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Résultat de l&apos;import
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{bulkResult.imported}</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">Importés</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{bulkResult.duplicates}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">Doublons</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{bulkResult.invalid}</p>
                  <p className="text-xs text-red-700 dark:text-red-300">Invalides</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={closeBulkModal}>
            {bulkResult ? "Fermer" : "Annuler"}
          </Button>
          {!bulkResult && (
            <Button
              onClick={handleBulkImport}
              loading={saving}
              disabled={!bulkEmails.trim()}
              icon={<Upload className="w-4 h-4" />}
            >
              Importer
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
}
