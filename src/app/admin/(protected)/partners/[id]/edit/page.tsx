"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import type { Partner } from "@/lib/types";

export default function EditPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    website_url: "",
    description: "",
    type: "national" as "national" | "international",
    is_active: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await fetch(`/api/admin/partners/${partnerId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          // Handle both { data: partner } and direct partner response
          const data = json.data || json;
          setPartner(data);
          setFormData({
            name: data.name || "",
            website_url: data.website_url || "",
            description: data.description || "",
            type: data.type || "national",
            is_active: data.is_active ?? true,
          });
          // Handle logo_url from logo relation or direct field
          const logoUrl = data.logo_url || data.logo?.url;
          if (logoUrl) {
            setLogoPreview(logoUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching partner:", error);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchPartner();
    }
  }, [partnerId]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("website_url", formData.website_url);
      data.append("description", formData.description);
      data.append("type", formData.type);
      data.append("is_active", formData.is_active ? "1" : "0");

      if (logoFile) {
        data.append("logo", logoFile);
      }

      const res = await fetch(`/api/admin/partners/${partnerId}`, {
        method: "PUT",
        body: data,
        credentials: "include",
      });

      if (res.ok) {
        router.push("/admin/partners");
      } else {
        const error = await res.json();
        alert(error.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error updating partner:", error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-800 dark:text-red-300">Partenaire introuvable</p>
          <Link
            href="/admin/partners"
            className="text-sm text-red-600 dark:text-red-400 hover:underline mt-2 inline-block"
          >
            Retour aux partenaires
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/partners"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux partenaires
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Modifier le partenaire
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {partner.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Nom du partenaire <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Université de Paris"
            />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Logo
            </label>
            <div className="flex items-start gap-4">
              {logoPreview && (
                <div className="relative h-24 w-32 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                  {logoFile ? (
                    <img src={logoPreview} alt="Preview" className="max-h-full max-w-full object-contain p-2" />
                  ) : (
                    <Image src={logoPreview} alt="Logo actuel" fill className="object-contain p-2" />
                  )}
                </div>
              )}
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {logoFile ? logoFile.name : "Changer le logo"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Format recommandé: PNG avec fond transparent, 200x100px
            </p>
          </div>

          {/* URL du site */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Site web
            </label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://exemple.com"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "national" | "international" })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="national">National</option>
              <option value="international">International</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description du partenaire..."
            />
          </div>

          {/* Statut */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-900 dark:text-white">
              Partenaire actif (visible sur le site)
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </>
            )}
          </button>
          <Link
            href="/admin/partners"
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-semibold"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
