"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Minus,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { Input } from "@/components/ui/Input";
import { SkeletonListPage } from "@/components/ui/Skeleton";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

type Formation = {
  id?: number;
  title: string;
  level: string | null;
  description: string | null;
};

type Parcours = {
  id?: number;
  title: string;
  mode: string | null;
  description: string | null;
};

type DoctoralTeam = {
  id?: number;
  name: string;
  focus: string | null;
};

type ListKey = "formations" | "parcours" | "doctoral_teams";

type Etablissement = {
  id: number;
  name: string;
  slug: string;
  acronym: string | null;
  description: string | null;
  director_name: string | null;
  director_title: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  logo: { id: number; url: string } | null;
  cover_image: { id: number; url: string } | null;
  order: number;
  is_active: boolean;
  created_at: string;
  formations: Formation[];
  parcours: Parcours[];
  doctoral_teams: DoctoralTeam[];
};

const emptyForm = {
  name: "",
  acronym: "",
  description: "",
  director_name: "",
  director_title: "Directeur",
  address: "",
  phone: "",
  email: "",
  website: "",
  facebook: "",
  twitter: "",
  linkedin: "",
  logo_id: null as number | null,
  cover_image_id: null as number | null,
  is_active: true,
  formations: [] as Formation[],
  parcours: [] as Parcours[],
  doctoral_teams: [] as DoctoralTeam[],
};

export default function AdminEtablissementsPage() {
  const [data, setData] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState<Etablissement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [pickingFor, setPickingFor] = useState<"logo" | "cover" | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<ListKey, boolean>>({
    formations: false,
    parcours: false,
    doctoral_teams: false,
  });

  const toggleSection = (key: ListKey) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const listKeys: Record<ListKey, { label: string; description: string }> = {
    formations: {
      label: "Formations",
      description: "Ajouter les diplômes ou formations proposées par cet établissement.",
    },
    parcours: {
      label: "Parcours",
      description: "Précisez les parcours ou spécialités et leurs modes (présentiel, distanciel).",
    },
    doctoral_teams: {
      label: "Équipes doctorales",
      description: "Listez les équipes d’accueil (doctoriales) liées à cet établissement.",
    },
  };

  const handleListChange = (
    key: ListKey,
    index: number,
    field: keyof Formation | keyof Parcours | keyof DoctoralTeam,
    value: string | number | null
  ) => {
    const updated = [...(form[key] as any[])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, [key]: updated });
  };

  const handleAddListItem = (key: ListKey) => {
    const template: any = {
      formations: { title: "", level: "", description: "" },
      parcours: { title: "", mode: "", description: "" },
      doctoral_teams: { name: "", focus: "" },
    };
    setForm({ ...form, [key]: [...(form[key] as any[]), template[key]] });
  };

  const handleRemoveListItem = (key: ListKey, index: number) => {
    const updated = [...(form[key] as any[])];
    updated.splice(index, 1);
    setForm({ ...form, [key]: updated });
  };

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/etablissements?per_page=50");
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
    setLogoPreviewUrl(null);
    setCoverPreviewUrl(null);
    setModalOpen(true);
  }

  function openEdit(item: Etablissement) {
    setSelected(item);
    setForm({
      name: item.name,
      acronym: item.acronym || "",
      description: item.description || "",
      director_name: item.director_name || "",
      director_title: item.director_title || "Directeur",
      address: item.address || "",
      phone: item.phone || "",
      email: item.email || "",
      website: item.website || "",
      facebook: item.facebook || "",
      twitter: item.twitter || "",
      linkedin: item.linkedin || "",
      logo_id: item.logo?.id || null,
      cover_image_id: item.cover_image?.id || null,
      is_active: item.is_active,
      formations: item.formations ?? [],
      parcours: item.parcours ?? [],
      doctoral_teams: item.doctoral_teams ?? [],
    });
    setLogoPreviewUrl(item.logo?.url || null);
    setCoverPreviewUrl(item.cover_image?.url || null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = selected
        ? `/api/admin/etablissements/${selected.id}`
        : "/api/admin/etablissements";
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
      const res = await fetch(`/api/admin/etablissements/${selected.id}`, {
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
    if (media.length > 0) {
      if (pickingFor === "cover") {
        setForm({ ...form, cover_image_id: media[0].id });
        setCoverPreviewUrl(media[0].url);
      } else {
        setForm({ ...form, logo_id: media[0].id });
        setLogoPreviewUrl(media[0].url);
      }
    }
    setMediaPickerOpen(false);
    setPickingFor(null);
  }

  const columns = [
    {
      key: "name" as keyof Etablissement,
      header: "Établissement",
      sortable: true,
      render: (item: Etablissement) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              {item.logo ? (
                <img src={item.logo.url} alt="" className="w-8 h-8 object-contain rounded" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 dark:text-white truncate">
                {item.name}
                {item.acronym && <span className="text-slate-500 ml-1">({item.acronym})</span>}
              </p>
              {item.director_name && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.director_title}: {item.director_name}
                </p>
              )}
            </div>
          </div>
        ),
      },
    {
      key: "cover_image" as keyof Etablissement,
      header: "Couverture",
      render: (item: Etablissement) => (
        item.cover_image ? (
          <img
            src={item.cover_image.url}
            alt={`Couverture ${item.name}`}
            className="h-10 w-16 rounded-lg object-cover"
          />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )
      ),
    },
    {
      key: "address" as keyof Etablissement,
      header: "Contact",
      render: (item: Etablissement) => (
        <div className="text-sm space-y-1">
          {item.phone && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5" />
              {item.phone}
            </div>
          )}
          {item.email && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5" />
              {item.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "is_active" as keyof Etablissement,
      header: "Statut",
      render: (item: Etablissement) => (
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Établissements</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez les établissements de l'université
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Nouvel établissement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total"
          value={data.length}
          icon={<Building2 className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Actifs"
          value={data.filter((e) => e.is_active).length}
          icon={<Building2 className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Inactifs"
          value={data.filter((e) => !e.is_active).length}
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data}
        keyField="id"
        loading={loading}
        emptyMessage="Aucun établissement"
        searchPlaceholder="Rechercher un établissement..."
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
        title={selected ? "Modifier l'établissement" : "Nouvel établissement"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nom de l'établissement"
            />
            <Input
              label="Sigle"
              value={form.acronym}
              onChange={(e) => setForm({ ...form, acronym: e.target.value })}
              placeholder="Ex: ENSTIM, FSA"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du responsable"
              value={form.director_name}
              onChange={(e) => setForm({ ...form, director_name: e.target.value })}
              placeholder="Nom du directeur/doyen"
            />
            <Input
              label="Titre"
              value={form.director_title}
              onChange={(e) => setForm({ ...form, director_title: e.target.value })}
              placeholder="Directeur, Doyen, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Description de l'établissement"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Téléphone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+261 20 XX XXX XX"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contact@etablissement.mg"
            />
          </div>

          <Input
            label="Adresse"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Adresse complète"
          />

          <Input
            label="Site web"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://..."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Facebook"
              value={form.facebook}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              placeholder="URL Facebook"
            />
            <Input
              label="Twitter"
              value={form.twitter}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              placeholder="URL Twitter"
            />
            <Input
              label="LinkedIn"
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              placeholder="URL LinkedIn"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Logo (optionnel)
              </label>
              <div className="flex items-center gap-2">
                {(logoPreviewUrl || (form.logo_id && (selected?.logo || data.find(e => e.logo?.id === form.logo_id)?.logo))) && (
                  <img
                    src={logoPreviewUrl || (selected?.logo || data.find(e => e.logo?.id === form.logo_id)?.logo)?.url}
                    alt="Logo"
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPickingFor("logo");
                    setMediaPickerOpen(true);
                  }}
                >
                  {form.logo_id ? "Changer" : "Sélectionner"}
                </Button>
                {form.logo_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm({ ...form, logo_id: null });
                      setLogoPreviewUrl(null);
                    }}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Image de couverture (optionnel)
              </label>
              <div className="flex items-center gap-2">
                {(coverPreviewUrl || (form.cover_image_id && (selected?.cover_image || data.find(e => e.cover_image?.id === form.cover_image_id)?.cover_image))) && (
                  <img
                    src={coverPreviewUrl || (selected?.cover_image || data.find(e => e.cover_image?.id === form.cover_image_id)?.cover_image)?.url}
                    alt="Couverture"
                    className="h-12 w-20 rounded-lg object-cover"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPickingFor("cover");
                    setMediaPickerOpen(true);
                  }}
                >
                  {form.cover_image_id ? "Changer" : "Sélectionner"}
                </Button>
                {form.cover_image_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm({ ...form, cover_image_id: null });
                      setCoverPreviewUrl(null);
                    }}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
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
              Établissement actif (visible sur le site public)
            </label>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {/* Formations Section */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("formations")}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expandedSections.formations ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                  {expandedSections.formations ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Formations</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Diplômes & licences</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {form.formations.length}
              </span>
            </button>
            {expandedSections.formations && (
              <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-end mb-3">
                  <Button variant="outline" size="sm" onClick={() => handleAddListItem("formations")}>
                    <Plus className="w-3 h-3 mr-1" /> Ajouter
                  </Button>
                </div>
                {form.formations.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Aucune formation définie pour le moment.</p>
                )}
                <div className="space-y-3">
                  {form.formations.map((formation, index) => (
                    <div key={`formation-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            label="Titre"
                            value={formation.title}
                            onChange={(event) => handleListChange("formations", index, "title", event.target.value)}
                            placeholder="Ex: Master en biologie"
                          />
                          <Input
                            label="Niveau"
                            value={formation.level ?? ""}
                            onChange={(event) => handleListChange("formations", index, "level", event.target.value)}
                            placeholder="Licence, Master, Doctorat..."
                          />
                        </div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Description
                        </label>
                        <textarea
                          value={formation.description ?? ""}
                          onChange={(event) => handleListChange("formations", index, "description", event.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="Courte description de la formation"
                        />
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveListItem("formations", index)}>
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Parcours Section */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("parcours")}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expandedSections.parcours ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                  {expandedSections.parcours ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Parcours</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Spécialités & modes</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {form.parcours.length}
              </span>
            </button>
            {expandedSections.parcours && (
              <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-end mb-3">
                  <Button variant="outline" size="sm" onClick={() => handleAddListItem("parcours")}>
                    <Plus className="w-3 h-3 mr-1" /> Ajouter
                  </Button>
                </div>
                {form.parcours.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Aucun parcours renseigné.</p>
                )}
                <div className="space-y-3">
                  {form.parcours.map((parcours, index) => (
                    <div key={`parcours-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          label="Titre"
                          value={parcours.title}
                          onChange={(event) => handleListChange("parcours", index, "title", event.target.value)}
                          placeholder="Ex: Parcours architecture durable"
                        />
                        <Input
                          label="Mode"
                          value={parcours.mode ?? ""}
                          onChange={(event) => handleListChange("parcours", index, "mode", event.target.value)}
                          placeholder="Présentiel | Distanciel | Mixte"
                        />
                      </div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mt-3">
                        Description
                      </label>
                      <textarea
                        value={parcours.description ?? ""}
                        onChange={(event) => handleListChange("parcours", index, "description", event.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Détaillez les spécificités du parcours"
                      />
                      <div className="flex justify-end mt-2">
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveListItem("parcours", index)}>
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Équipes doctorales Section */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("doctoral_teams")}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expandedSections.doctoral_teams ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                  {expandedSections.doctoral_teams ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Équipes doctorales</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Accueil des doctorants</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {form.doctoral_teams.length}
              </span>
            </button>
            {expandedSections.doctoral_teams && (
              <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-end mb-3">
                  <Button variant="outline" size="sm" onClick={() => handleAddListItem("doctoral_teams")}>
                    <Plus className="w-3 h-3 mr-1" /> Ajouter
                  </Button>
                </div>
                {form.doctoral_teams.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Les écoles doctorales peuvent être liées ici.</p>
                )}
                <div className="space-y-3">
                  {form.doctoral_teams.map((team, index) => (
                    <div key={`doctoral-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                      <div className="grid grid-cols-1 gap-3">
                        <Input
                          label="Nom de l'équipe"
                          value={team.name}
                          onChange={(event) => handleListChange("doctoral_teams", index, "name", event.target.value)}
                          placeholder="Équipe Génie du Vivant"
                        />
                      </div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mt-3">
                        Focus de recherche
                      </label>
                      <textarea
                        value={team.focus ?? ""}
                        onChange={(event) => handleListChange("doctoral_teams", index, "focus", event.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Décrivez brièvement les axes de l'équipe"
                      />
                      <div className="flex justify-end mt-2">
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveListItem("doctoral_teams", index)}>
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer l'établissement"
        message={`Êtes-vous sûr de vouloir supprimer "${selected?.name}" ?`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
