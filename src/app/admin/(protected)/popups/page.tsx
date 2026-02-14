"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, Bell, Eye, EyeOff, Copy,
  Calendar, Clock, ToggleLeft, ToggleRight
} from "lucide-react";

interface Popup {
  id: number;
  title: string;
  content_html: string | null;
  button_text: string;
  button_url: string | null;
  image_url: string | null;
  icon: string | null;
  items: { icon?: string; title: string; description?: string }[] | null;
  delay_ms: number;
  show_on_all_pages: boolean;
  target_pages: string[] | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  is_in_period: boolean;
  priority: number;
  created_at: string;
}

export default function PopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchPopups = async () => {
    try {
      const res = await fetch("/api/admin/popups?per_page=50", {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setPopups(json.data?.data || json.data || []);
      }
    } catch (error) {
      console.error("Error fetching popups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce popup ?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/popups/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPopups(popups.filter((p) => p.id !== id));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting popup:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (popup: Popup) => {
    setToggling(popup.id);
    try {
      const res = await fetch(`/api/admin/popups/${popup.id}/toggle`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setPopups(popups.map((p) => (p.id === popup.id ? json.data : p)));
      }
    } catch (error) {
      console.error("Error toggling popup:", error);
    } finally {
      setToggling(null);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/popups/${id}/duplicate`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        fetchPopups();
      }
    } catch (error) {
      console.error("Error duplicating popup:", error);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDelay = (ms: number) => {
    if (ms === 0) return "Immédiat";
    if (ms < 60000) return `${ms / 1000}s`;
    return `${ms / 60000} min`;
  };

  const activeCount = popups.filter((p) => p.is_active).length;
  const inPeriodCount = popups.filter((p) => p.is_active && p.is_in_period).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Popups
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez les messages popup affichés aux visiteurs
          </p>
        </div>
        <Link
          href="/admin/popups/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouveau popup
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{popups.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{inPeriodCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Actifs maintenant</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <EyeOff className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {popups.length - activeCount}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Inactifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popups List */}
      {popups.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Aucun popup
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Commencez par ajouter votre premier popup
          </p>
          <Link
            href="/admin/popups/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau popup
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Popup
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Délai
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    Période
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {popups.map((popup) => (
                  <tr
                    key={popup.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {popup.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Priorité: {popup.priority}
                            </span>
                            {popup.items && popup.items.length > 0 && (
                              <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                                {popup.items.length} éléments
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        {formatDelay(popup.delay_ms)}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {popup.start_date || popup.end_date
                            ? `${formatDate(popup.start_date)} - ${formatDate(popup.end_date)}`
                            : "Permanent"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggle(popup)}
                        disabled={toggling === popup.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          popup.is_active && popup.is_in_period
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : popup.is_active
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        } disabled:opacity-50`}
                      >
                        {popup.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        {popup.is_active && popup.is_in_period
                          ? "Actif"
                          : popup.is_active
                          ? "Hors période"
                          : "Inactif"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDuplicate(popup.id)}
                          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/popups/${popup.id}/edit`}
                          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(popup.id)}
                          disabled={deleting === popup.id}
                          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
