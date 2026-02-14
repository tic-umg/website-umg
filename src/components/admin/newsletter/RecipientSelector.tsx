"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Users,
  UserPlus,
  X,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";

type SendMode = "subscribers" | "custom";
type SubscriberStatus = "active" | "pending" | "unsubscribed";

interface Subscriber {
  id: number;
  email: string;
  name?: string;
  status: SubscriberStatus;
}

interface SubscriberCounts {
  total: number;
  active: number;
  pending: number;
  unsubscribed: number;
}

export interface RecipientSelection {
  mode: SendMode;
  status: SubscriberStatus;
  subscriber_ids: number[];
  extra_emails: string[];
  totalRecipients: number;
}

interface RecipientSelectorProps {
  onChange: (selection: RecipientSelection) => void;
  className?: string;
}

export function RecipientSelector({ onChange, className }: RecipientSelectorProps) {
  // Mode et état général
  const [mode, setMode] = useState<SendMode>("subscribers");

  // Mode Abonnés
  const [targetStatus, setTargetStatus] = useState<SubscriberStatus>("active");
  const [counts, setCounts] = useState<SubscriberCounts | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Mode Personnalisé
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Subscriber[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubscribers, setSelectedSubscribers] = useState<Map<number, Subscriber>>(new Map());
  const [extraEmails, setExtraEmails] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Charger les compteurs au montage
  useEffect(() => {
    loadCounts();
  }, []);

  // Notifier le parent des changements
  useEffect(() => {
    const totalRecipients =
      mode === "subscribers"
        ? counts?.[targetStatus] ?? 0
        : selectedSubscribers.size + extraEmails.length;

    onChange({
      mode,
      status: targetStatus,
      subscriber_ids: Array.from(selectedSubscribers.keys()),
      extra_emails: extraEmails,
      totalRecipients,
    });
  }, [mode, targetStatus, counts, selectedSubscribers, extraEmails, onChange]);

  // Recherche avec debounce
  useEffect(() => {
    if (mode !== "custom") return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchSubscribers(searchTerm, 1);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, mode]);

  const loadCounts = async () => {
    setLoadingCounts(true);
    try {
      const res = await fetch("/api/admin/newsletter/subscribers/counts");
      if (res.ok) {
        const data = await res.json();
        setCounts(data.data);
      }
    } catch (err) {
      console.error("Failed to load counts:", err);
    } finally {
      setLoadingCounts(false);
    }
  };

  const searchSubscribers = useCallback(async (q: string, p: number) => {
    setLoadingSearch(true);
    try {
      const params = new URLSearchParams({
        per_page: "10",
        page: String(p),
      });
      if (q.trim()) {
        params.set("q", q.trim());
      }
      const res = await fetch(`/api/admin/newsletter/subscribers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data || []);
        setTotalPages(data.meta?.last_page || 1);
        setPage(data.meta?.current_page || 1);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  const toggleSubscriber = (subscriber: Subscriber) => {
    setSelectedSubscribers((prev) => {
      const next = new Map(prev);
      if (next.has(subscriber.id)) {
        next.delete(subscriber.id);
      } else {
        next.set(subscriber.id, subscriber);
      }
      return next;
    });
  };

  const removeSelectedSubscriber = (id: number) => {
    setSelectedSubscribers((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const addExtraEmail = () => {
    const email = newEmailInput.trim().toLowerCase();
    setEmailError(null);

    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Format d'email invalide");
      return;
    }

    if (extraEmails.includes(email)) {
      setEmailError("Cet email est déjà ajouté");
      return;
    }

    const alreadySelected = Array.from(selectedSubscribers.values()).some(
      (s) => s.email.toLowerCase() === email
    );
    if (alreadySelected) {
      setEmailError("Cet email est déjà sélectionné");
      return;
    }

    setExtraEmails((prev) => [...prev, email]);
    setNewEmailInput("");
  };

  const removeExtraEmail = (email: string) => {
    setExtraEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addExtraEmail();
    }
  };

  const getStatusLabel = (status: SubscriberStatus) => {
    switch (status) {
      case "active":
        return "Actifs";
      case "pending":
        return "En attente";
      case "unsubscribed":
        return "Désinscrits";
    }
  };

  const getStatusBadge = (status: SubscriberStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success" size="sm">Actif</Badge>;
      case "pending":
        return <Badge variant="warning" size="sm">En attente</Badge>;
      case "unsubscribed":
        return <Badge variant="default" size="sm">Désinscrit</Badge>;
    }
  };

  return (
    <div className={clsx("space-y-4", className)}>
      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setMode("subscribers")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            mode === "subscribers"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Users className="w-4 h-4" />
          Abonnés
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("custom");
            if (searchResults.length === 0) {
              searchSubscribers("", 1);
            }
          }}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            mode === "custom"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <UserPlus className="w-4 h-4" />
          Personnalisé
        </button>
      </div>

      {/* Mode Abonnés */}
      {mode === "subscribers" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(["active", "pending", "unsubscribed"] as SubscriberStatus[]).map((status) => {
              const count = counts?.[status] ?? 0;
              const isSelected = targetStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTargetStatus(status)}
                  disabled={count === 0}
                  className={clsx(
                    "relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : count === 0
                      ? "border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {loadingCounts ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      count
                    )}
                  </span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {getStatusLabel(status)}
                  </span>
                </button>
              );
            })}
          </div>

          {targetStatus !== "active" && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-sm text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Attention : vous envoyez aux abonnés "{getStatusLabel(targetStatus).toLowerCase()}".
                {targetStatus === "unsubscribed" && " Ces utilisateurs se sont désinscrits."}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mode Personnalisé */}
      {mode === "custom" && (
        <div className="space-y-4">
          {/* Recherche */}
          <div className="space-y-3">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par email ou nom..."
              leftIcon={<Search className="w-4 h-4" />}
            />

            {/* Résultats de recherche */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {loadingSearch ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <Users className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-sm">Aucun abonné trouvé</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {searchResults.map((subscriber) => {
                      const isSelected = selectedSubscribers.has(subscriber.id);
                      return (
                        <button
                          key={subscriber.id}
                          type="button"
                          onClick={() => toggleSubscriber(subscriber)}
                          className={clsx(
                            "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-900/20"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          <div
                            className={clsx(
                              "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "border-indigo-500 bg-indigo-500"
                                : "border-slate-300 dark:border-slate-600"
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {subscriber.email}
                            </p>
                            {subscriber.name && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {subscriber.name}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(subscriber.status)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <button
                    type="button"
                    onClick={() => searchSubscribers(searchTerm, page - 1)}
                    disabled={page === 1 || loadingSearch}
                    className="p-1 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs text-slate-500">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => searchSubscribers(searchTerm, page + 1)}
                    disabled={page === totalPages || loadingSearch}
                    className="p-1 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-40"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ajouter email manuel */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Ajouter un email manuellement
            </label>
            <div className="flex gap-2">
              <Input
                value={newEmailInput}
                onChange={(e) => {
                  setNewEmailInput(e.target.value);
                  setEmailError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="email@exemple.com"
                error={emailError || undefined}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addExtraEmail}
                disabled={!newEmailInput.trim()}
              >
                Ajouter
              </Button>
            </div>
          </div>

          {/* Emails sélectionnés */}
          {(selectedSubscribers.size > 0 || extraEmails.length > 0) && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Emails sélectionnés ({selectedSubscribers.size + extraEmails.length})
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl max-h-32 overflow-y-auto">
                {Array.from(selectedSubscribers.values()).map((subscriber) => (
                  <span
                    key={subscriber.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium"
                  >
                    {subscriber.email}
                    <button
                      type="button"
                      onClick={() => removeSelectedSubscriber(subscriber.id)}
                      className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {extraEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeExtraEmail(email)}
                      className="p-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
