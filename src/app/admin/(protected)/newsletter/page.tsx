"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Send,
  Mail,
  Users,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  Archive,
  RotateCcw,
  Filter,
  X,
  Copy,
  Download,
  CalendarRange,
} from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";

type CampaignStatus = "draft" | "scheduled" | "sent" | "sending" | "archived";

type Campaign = {
  id: number;
  subject: string;
  status: CampaignStatus;
  recipients_count: number;
  opens_count: number;
  clicks_count: number;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  content_html?: string;
};

type StatusFilter = "all" | "draft" | "sending" | "sent" | "archived";

export default function AdminNewsletterPage() {
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [bulkArchiving, setBulkArchiving] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkRestoring, setBulkRestoring] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  async function load() {
    setLoading(true);
    let url = "/api/admin/newsletter/campaigns?per_page=100";

    if (statusFilter === "archived") {
      url += "&status=archived";
    } else if (statusFilter !== "all") {
      url += `&status=${statusFilter}`;
    }

    if (dateFrom) url += `&date_from=${dateFrom}`;
    if (dateTo) url += `&date_to=${dateTo}`;

    const res = await fetch(url);
    const json = await res.json();
    setCampaigns(json?.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    setSelectedKeys(new Set());
    void load();
  }, [statusFilter, dateFrom, dateTo]);

  async function handleSend() {
    if (!selectedCampaign) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${selectedCampaign.id}/send`, {
        method: "POST",
      });
      if (res.ok) {
        setSendModalOpen(false);
        setSelectedCampaign(null);
        toast.success("Campagne envoyée avec succès");
        load();
      } else {
        const body = await res.json();
        toast.error(body.message || "Erreur lors de l'envoi");
      }
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!selectedCampaign) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${selectedCampaign.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setSelectedCampaign(null);
        toast.success("Campagne supprimée");
        load();
      } else {
        const body = await res.json();
        toast.error(body.message || "Erreur lors de la suppression");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleArchive() {
    if (!selectedCampaign) return;
    setArchiving(true);
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${selectedCampaign.id}/archive`, {
        method: "POST",
      });
      if (res.ok) {
        setArchiveModalOpen(false);
        setSelectedCampaign(null);
        toast.success("Campagne archivée");
        load();
      } else {
        const body = await res.json();
        toast.error(body.message || "Erreur lors de l'archivage");
      }
    } finally {
      setArchiving(false);
    }
  }

  async function handleRestore() {
    if (!selectedCampaign) return;
    setRestoring(true);
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${selectedCampaign.id}/restore`, {
        method: "POST",
      });
      if (res.ok) {
        setRestoreModalOpen(false);
        setSelectedCampaign(null);
        toast.success("Campagne restaurée");
        load();
      } else {
        const body = await res.json();
        toast.error(body.message || "Erreur lors de la restauration");
      }
    } finally {
      setRestoring(false);
    }
  }

  async function handleDuplicate(campaign: Campaign) {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${campaign.id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Campagne dupliquée");
        load();
      } else {
        const body = await res.json();
        toast.error(body.message || "Erreur lors de la duplication");
      }
    } finally {
      setDuplicating(false);
    }
  }

  async function handlePreview(campaign: Campaign) {
    setPreviewLoading(true);
    setPreviewModalOpen(true);
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${campaign.id}?include_content=true`);
      if (res.ok) {
        const data = await res.json();
        setPreviewContent(data.data?.content_html || "<p>Aucun contenu</p>");
      } else {
        setPreviewContent("<p>Erreur lors du chargement</p>");
      }
    } finally {
      setPreviewLoading(false);
    }
  }

  // Bulk actions
  async function handleBulkSend() {
    const draftIds = Array.from(selectedKeys)
      .map(Number)
      .filter((id) => campaigns.find((c) => c.id === id)?.status === "draft");

    if (draftIds.length === 0) {
      toast.warning("Aucun brouillon sélectionné");
      return;
    }

    setBulkSending(true);
    try {
      const results = await Promise.allSettled(
        draftIds.map((id) =>
          fetch(`/api/admin/newsletter/campaigns/${id}/send`, { method: "POST" })
        )
      );
      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const failedCount = results.filter((r) => r.status === "rejected").length;

      if (failedCount > 0) {
        toast.warning(`${successCount} envoyée(s), ${failedCount} échouée(s)`);
      } else {
        toast.success(`${successCount} campagne(s) envoyée(s)`);
      }
      setSelectedKeys(new Set());
      load();
    } finally {
      setBulkSending(false);
    }
  }

  async function handleBulkArchive() {
    if (selectedKeys.size === 0) return;
    setBulkArchiving(true);
    try {
      const ids = Array.from(selectedKeys).map(Number);
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/admin/newsletter/campaigns/${id}/archive`, { method: "POST" })
        )
      );
      const failedCount = results.filter((r) => r.status === "rejected").length;
      if (failedCount > 0) {
        toast.warning(`${failedCount} campagne(s) n'ont pas pu être archivée(s)`);
      } else {
        toast.success(`${ids.length} campagne(s) archivée(s)`);
      }
      setSelectedKeys(new Set());
      load();
    } finally {
      setBulkArchiving(false);
    }
  }

  async function handleBulkRestore() {
    if (selectedKeys.size === 0) return;
    setBulkRestoring(true);
    try {
      const ids = Array.from(selectedKeys).map(Number);
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/admin/newsletter/campaigns/${id}/restore`, { method: "POST" })
        )
      );
      const failedCount = results.filter((r) => r.status === "rejected").length;
      if (failedCount > 0) {
        toast.warning(`${failedCount} campagne(s) n'ont pas pu être restaurée(s)`);
      } else {
        toast.success(`${ids.length} campagne(s) restaurée(s)`);
      }
      setSelectedKeys(new Set());
      load();
    } finally {
      setBulkRestoring(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedKeys.size === 0) return;
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedKeys).map(Number);
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/admin/newsletter/campaigns/${id}`, { method: "DELETE" })
        )
      );
      const failedCount = results.filter((r) => r.status === "rejected").length;
      if (failedCount > 0) {
        toast.warning(`${failedCount} campagne(s) n'ont pas pu être supprimée(s)`);
      } else {
        toast.success(`${ids.length} campagne(s) supprimée(s)`);
      }
      setSelectedKeys(new Set());
      load();
    } finally {
      setBulkDeleting(false);
    }
  }

  function handleExportCSV() {
    const headers = ["ID", "Sujet", "Statut", "Destinataires", "Ouvertures", "Taux ouverture", "Date envoi", "Date création"];
    const rows = campaigns.map((c) => [
      c.id,
      `"${c.subject.replace(/"/g, '""')}"`,
      c.status,
      c.recipients_count,
      c.opens_count,
      c.recipients_count > 0 ? `${Math.round((c.opens_count / c.recipients_count) * 100)}%` : "0%",
      c.sent_at ? new Date(c.sent_at).toLocaleDateString("fr-FR") : "",
      new Date(c.created_at).toLocaleDateString("fr-FR"),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `campagnes-newsletter-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="success" dot>Envoyé</Badge>;
      case "sending":
        return <Badge variant="info" dot>En cours</Badge>;
      case "scheduled":
        return <Badge variant="warning" dot>Programmé</Badge>;
      case "archived":
        return <Badge variant="default" dot>Archivé</Badge>;
      default:
        return <Badge variant="default" dot>Brouillon</Badge>;
    }
  };

  const columns = [
    {
      key: "subject" as keyof Campaign,
      header: "Campagne",
      sortable: true,
      render: (item: Campaign) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${item.status === "archived" ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"} rounded-xl flex items-center justify-center`}>
            {item.status === "archived" ? <Archive className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className={`font-medium truncate max-w-xs ${item.status === "archived" ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>{item.subject}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {item.recipients_count} destinataires
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status" as keyof Campaign,
      header: "Statut",
      sortable: true,
      render: (item: Campaign) => getStatusBadge(item.status),
    },
    {
      key: "opens_count" as keyof Campaign,
      header: "Ouvertures",
      sortable: true,
      render: (item: Campaign) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Eye className="w-4 h-4" />
          {item.opens_count} ({item.recipients_count > 0 ? Math.round((item.opens_count / item.recipients_count) * 100) : 0}%)
        </div>
      ),
    },
    {
      key: "sent_at" as keyof Campaign,
      header: "Date",
      sortable: true,
      render: (item: Campaign) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-sm">
          <Calendar className="w-4 h-4" />
          {item.sent_at
            ? new Date(item.sent_at).toLocaleDateString("fr-FR")
            : item.scheduled_at
            ? `Prévu: ${new Date(item.scheduled_at).toLocaleDateString("fr-FR")}`
            : "-"}
        </div>
      ),
    },
  ];

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Toutes" },
    { value: "draft", label: "Brouillons" },
    { value: "sending", label: "En cours" },
    { value: "sent", label: "Envoyées" },
    { value: "archived", label: "Archivées" },
  ];

  // Check if any selected item is a draft (for bulk send button)
  const hasSelectedDrafts = Array.from(selectedKeys).some(
    (id) => campaigns.find((c) => c.id === Number(id))?.status === "draft"
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Newsletter</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gérez vos campagnes et abonnés</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Link href="/admin/newsletter/subscribers">
            <Button variant="outline" icon={<Users className="w-4 h-4" />}>
              Abonnés
            </Button>
          </Link>
          <Link href="/admin/newsletter/campaigns/create">
            <Button icon={<Plus className="w-4 h-4" />}>Nouvelle campagne</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total campagnes"
          value={campaigns.length}
          icon={<Mail className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Envoyées"
          value={campaigns.filter((c) => c.status === "sent").length}
          icon={<CheckCircle className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Brouillons"
          value={campaigns.filter((c) => c.status === "draft").length}
          icon={<Clock className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="Taux d'ouverture moy."
          value={(() => {
            const sentCampaigns = campaigns.filter((c) => c.status === "sent" && c.recipients_count > 0);
            if (sentCampaigns.length === 0) return "—";
            const totalOpens = sentCampaigns.reduce((sum, c) => sum + c.opens_count, 0);
            const totalRecipients = sentCampaigns.reduce((sum, c) => sum + c.recipients_count, 0);
            if (totalRecipients === 0) return "0%";
            return `${Math.round((totalOpens / totalRecipients) * 100)}%`;
          })()}
          icon={<Eye className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Statut :</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === filter.value
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showDateFilter || dateFrom || dateTo
                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            Date
          </button>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              title="Effacer les dates"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      {showDateFilter && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 dark:text-slate-400">Du :</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 dark:text-slate-400">Au :</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Selection Bar */}
      {selectedKeys.size > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {selectedKeys.size} campagne{selectedKeys.size > 1 ? "s" : ""} sélectionnée{selectedKeys.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setSelectedKeys(new Set())}
              className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-600 dark:text-indigo-400"
              title="Désélectionner tout"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {statusFilter === "archived" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={handleBulkRestore}
                  loading={bulkRestoring}
                >
                  Restaurer
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={handleBulkDelete}
                  loading={bulkDeleting}
                >
                  Supprimer
                </Button>
              </>
            ) : (
              <>
                {hasSelectedDrafts && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Send className="w-4 h-4" />}
                    onClick={handleBulkSend}
                    loading={bulkSending}
                  >
                    Envoyer
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Archive className="w-4 h-4" />}
                  onClick={handleBulkArchive}
                  loading={bulkArchiving}
                >
                  Archiver
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={campaigns}
        keyField="id"
        loading={loading}
        emptyMessage="Aucune campagne trouvée"
        searchPlaceholder="Rechercher une campagne..."
        rowSelection={{
          selectedKeys,
          onChange: setSelectedKeys,
        }}
        actions={(item) => (
          <div className="flex items-center gap-1">
            {/* Preview button - always visible */}
            <button
              onClick={() => handlePreview(item)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Aperçu"
            >
              <Eye className="w-4 h-4" />
            </button>

            {item.status !== "archived" ? (
              <>
                {/* Send button - only for drafts */}
                {item.status === "draft" && (
                  <button
                    onClick={() => {
                      setSelectedCampaign(item);
                      setSendModalOpen(true);
                    }}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    title="Envoyer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}

                {/* Edit button - always visible for non-archived */}
                <Link
                  href={`/admin/newsletter/campaigns/${item.id}/edit`}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </Link>

                {/* Duplicate button */}
                <button
                  onClick={() => handleDuplicate(item)}
                  disabled={duplicating}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-50"
                  title="Dupliquer"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Archive button */}
                <button
                  onClick={() => {
                    setSelectedCampaign(item);
                    setArchiveModalOpen(true);
                  }}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  title="Archiver"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Restore button - only for archived */}
                <button
                  onClick={() => {
                    setSelectedCampaign(item);
                    setRestoreModalOpen(true);
                  }}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  title="Restaurer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Delete button - only for archived */}
                <button
                  onClick={() => {
                    setSelectedCampaign(item);
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer la campagne"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedCampaign?.subject}" ?`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />

      {/* Send Confirmation */}
      <ConfirmModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onConfirm={handleSend}
        title="Envoyer la campagne"
        message={`Êtes-vous sûr de vouloir envoyer "${selectedCampaign?.subject}" à tous les abonnés actifs ? Cette action est irréversible.`}
        confirmText="Envoyer maintenant"
        variant="primary"
        loading={sending}
      />

      {/* Archive Confirmation */}
      <ConfirmModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleArchive}
        title="Archiver la campagne"
        message={`Êtes-vous sûr de vouloir archiver "${selectedCampaign?.subject}" ? Elle ne sera plus visible dans la liste par défaut.`}
        confirmText="Archiver"
        variant="primary"
        loading={archiving}
      />

      {/* Restore Confirmation */}
      <ConfirmModal
        isOpen={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        onConfirm={handleRestore}
        title="Restaurer la campagne"
        message={`Êtes-vous sûr de vouloir restaurer "${selectedCampaign?.subject}" ? Elle redeviendra un brouillon.`}
        confirmText="Restaurer"
        variant="primary"
        loading={restoring}
      />

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewContent("");
        }}
        title="Aperçu de la campagne"
        size="lg"
      >
        <div className="p-4">
          {previewLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
