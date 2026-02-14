"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Globe,
  Image as ImageIcon,
  Search,
  Share2,
  Shield,
  Save,
  AlertTriangle,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Link2,
  BarChart3,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { SkeletonFormPage } from "@/components/ui/Skeleton";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import { compressImageFile } from "@/lib/image-compress";

type SettingItem = {
  key: string;
  value: string | null;
  type: string;
  group: string;
};

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "topbar" | "header" | "seo" | "social" | "maintenance" | "stats">("general");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Media for logo and favicon
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [aboutVideoUrl, setAboutVideoUrl] = useState<string | null>(null);
  const [aboutVideoPosterUrl, setAboutVideoPosterUrl] = useState<string | null>(null);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [posterPickerOpen, setPosterPickerOpen] = useState(false);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        const map: Record<string, string> = {};
        (json.data || []).forEach((s: SettingItem) => {
          map[s.key] = s.value || "";
        });
        setSettings(map);

        // Load logo and favicon URLs if IDs exist
        if (map.logo_id) {
          const logoRes = await fetch(`/api/admin/media/${map.logo_id}`);
          if (logoRes.ok) {
            const logoData = await logoRes.json();
            setLogoUrl(logoData.data?.url || null);
          }
        }
        if (map.favicon_id) {
          const faviconRes = await fetch(`/api/admin/media/${map.favicon_id}`);
          if (faviconRes.ok) {
            const faviconData = await faviconRes.json();
            setFaviconUrl(faviconData.data?.url || null);
          }
        }
        if (map.about_video_id) {
          const videoRes = await fetch(`/api/admin/media/${map.about_video_id}`);
          if (videoRes.ok) {
            const videoData = await videoRes.json();
            setAboutVideoUrl(videoData.data?.url || null);
          }
        }
        if (map.about_video_poster_id) {
          const posterRes = await fetch(`/api/admin/media/${map.about_video_poster_id}`);
          if (posterRes.ok) {
            const posterData = await posterRes.json();
            setAboutVideoPosterUrl(posterData.data?.url || null);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        showToast("error", "Erreur lors du chargement des paramètres");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsArray }),
      });
      if (res.ok) {
        showToast("success", "Paramètres enregistrés avec succès !");
      } else {
        showToast("error", "Erreur lors de la sauvegarde");
      }
    } catch {
      showToast("error", "Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadImage = async (type: "logo" | "favicon", file: File) => {
    if (type === "logo") setUploadingLogo(true);
    else setUploadingFavicon(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
      const tokenRes = await fetch("/api/auth/token", { credentials: "include" });
      const tokenData = tokenRes.ok ? await tokenRes.json().catch(() => null) : null;
      const token = tokenData?.token as string | undefined;
      const authHeader: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
      if (!token) {
        showToast("error", "Session expirée. Veuillez vous reconnecter.");
        return;
      }
      const formData = new FormData();
      const preparedFile = await compressImageFile(file).catch(() => file);
      formData.append("file", preparedFile);
      formData.append("alt", type === "logo" ? "Logo du site" : "Favicon du site");

      const res = await fetch(`${apiUrl}/admin/media`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: authHeader,
      });

      if (res.ok) {
        const data = await res.json();
        const mediaId = data.data?.id;
        const mediaUrl = data.data?.url;

        if (mediaId) {
          updateSetting(type === "logo" ? "logo_id" : "favicon_id", String(mediaId));
          if (type === "logo") setLogoUrl(mediaUrl);
          else setFaviconUrl(mediaUrl);
          showToast("success", `${type === "logo" ? "Logo" : "Favicon"} téléchargé avec succès !`);
        }
      } else {
        showToast("error", "Erreur lors du téléchargement");
      }
    } catch {
      showToast("error", "Erreur de connexion");
    } finally {
      if (type === "logo") setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  const removeImage = (type: "logo" | "favicon") => {
    updateSetting(type === "logo" ? "logo_id" : "favicon_id", "");
    if (type === "logo") setLogoUrl(null);
    else setFaviconUrl(null);
    showToast("success", `${type === "logo" ? "Logo" : "Favicon"} supprimé`);
  };

  const handleVideoSelect = (mediaId: number, mediaUrl: string) => {
    updateSetting("about_video_id", String(mediaId));
    setAboutVideoUrl(mediaUrl);
    showToast("success", "Vidéo mise à jour");
  };

  const handlePosterSelect = (mediaId: number, mediaUrl: string) => {
    updateSetting("about_video_poster_id", String(mediaId));
    setAboutVideoPosterUrl(mediaUrl);
    showToast("success", "Image de couverture mise à jour");
  };

  const removeVideo = () => {
    updateSetting("about_video_id", "");
    setAboutVideoUrl(null);
    showToast("success", "Vidéo supprimée");
  };

  const removePoster = () => {
    updateSetting("about_video_poster_id", "");
    setAboutVideoPosterUrl(null);
    showToast("success", "Image de couverture supprimée");
  };

  const tabs = [
    { id: "general", label: "Général", icon: <Globe className="w-4 h-4" /> },
    { id: "topbar", label: "Barre supérieure", icon: <Link2 className="w-4 h-4" /> },
    { id: "header", label: "Bouton CTA", icon: <MousePointerClick className="w-4 h-4" /> },
    { id: "stats", label: "Chiffres Clés", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "seo", label: "SEO", icon: <Search className="w-4 h-4" /> },
    { id: "social", label: "Réseaux sociaux", icon: <Share2 className="w-4 h-4" /> },
    { id: "maintenance", label: "Maintenance", icon: <Shield className="w-4 h-4" /> },
  ];

  if (loading) {
    return <SkeletonFormPage />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-in-up ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres du site</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Configuration générale, SEO et maintenance</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "general" && (
            <>
              {/* Logo & Favicon */}
              <Card>
                <CardHeader>Identité visuelle</CardHeader>
                <CardBody>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Logo */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Logo du site
                      </label>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4">
                        {logoUrl ? (
                          <div className="relative group">
                            <img
                              src={logoUrl}
                              alt="Logo"
                              className="max-h-24 mx-auto object-contain"
                            />
                            <button
                              onClick={() => removeImage("logo")}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                            {uploadingLogo ? (
                              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-slate-400" />
                                <span className="text-sm text-slate-500">Cliquez pour télécharger</span>
                                <span className="text-xs text-slate-400">PNG, JPG, SVG - Max 2MB</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadImage("logo", file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Favicon */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Favicon
                      </label>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4">
                        {faviconUrl ? (
                          <div className="relative group flex justify-center">
                            <img
                              src={faviconUrl}
                              alt="Favicon"
                              className="w-16 h-16 object-contain"
                            />
                            <button
                              onClick={() => removeImage("favicon")}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                            {uploadingFavicon ? (
                              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <ImageIcon className="w-8 h-8 text-slate-400" />
                                <span className="text-sm text-slate-500">Cliquez pour télécharger</span>
                                <span className="text-xs text-slate-400">ICO, PNG - 32x32 ou 64x64</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,.ico"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadImage("favicon", file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* General Info */}
              <Card>
                <CardHeader>Informations générales</CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <Input
                      label="Nom du site"
                      value={settings.site_name || ""}
                      onChange={(e) => updateSetting("site_name", e.target.value)}
                      placeholder="Université de Mahajanga"
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Description du site
                      </label>
                      <textarea
                        value={settings.site_description || ""}
                        onChange={(e) => updateSetting("site_description", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        placeholder="Description de votre site..."
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Email de contact"
                        type="email"
                        value={settings.site_email || ""}
                        onChange={(e) => updateSetting("site_email", e.target.value)}
                        placeholder="contact@umahajanga.mg"
                      />
                      <Input
                        label="Téléphone"
                        value={settings.site_phone || ""}
                        onChange={(e) => updateSetting("site_phone", e.target.value)}
                        placeholder="+261 20 XX XXX XX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Adresse
                      </label>
                      <textarea
                        value={settings.site_address || ""}
                        onChange={(e) => updateSetting("site_address", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">Vidéo “À propos”</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Sélectionnez une vidéo pour la section d&apos;accueil.
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setVideoPickerOpen(true)}>
                          Parcourir
                        </Button>
                      </div>
                      {aboutVideoUrl ? (
                        <div className="flex flex-col gap-3">
                          <div className="mx-auto w-full max-w-lg aspect-video relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <video className="h-full w-full object-contain bg-black/90" controls preload="metadata">
                              <source src={aboutVideoUrl} />
                            </video>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={removeVideo}>
                              Retirer la vidéo
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">Aucune vidéo sélectionnée.</p>
                      )}
                    </div>
                    <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">Image de couverture vidéo</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Image affichée avant la lecture de la vidéo.
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setPosterPickerOpen(true)}>
                          Parcourir
                        </Button>
                      </div>
                      {aboutVideoPosterUrl ? (
                        <div className="flex flex-col gap-3">
                          <div className="mx-auto w-full max-w-lg aspect-video relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <img
                              src={aboutVideoPosterUrl}
                              alt="Couverture vidéo"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={removePoster}>
                              Retirer l&apos;image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">Aucune image sélectionnée.</p>
                      )}
                    </div>
                  </div>
                </CardBody>
                <CardFooter>
                  <Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
                    Enregistrer
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}

          {activeTab === "topbar" && (
            <Card>
              <CardHeader>Liens de la barre supérieure</CardHeader>
              <CardBody>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Configurez les liens affichés dans la barre supérieure du site public.
                </p>
                <div className="space-y-6">
                  {/* Bibliothèque */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bibliothèque</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Libellé"
                        value={settings.topbar_library_label || ""}
                        onChange={(e) => updateSetting("topbar_library_label", e.target.value)}
                        placeholder="Bibliothèque"
                      />
                      <Input
                        label="URL"
                        value={settings.topbar_library_url || ""}
                        onChange={(e) => updateSetting("topbar_library_url", e.target.value)}
                        placeholder="https://bibliotheque.univ-mahajanga.mg"
                      />
                    </div>
                  </div>

                  {/* Webmail */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Webmail</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Libellé"
                        value={settings.topbar_webmail_label || ""}
                        onChange={(e) => updateSetting("topbar_webmail_label", e.target.value)}
                        placeholder="Webmail"
                      />
                      <Input
                        label="URL"
                        value={settings.topbar_webmail_url || ""}
                        onChange={(e) => updateSetting("topbar_webmail_url", e.target.value)}
                        placeholder="https://webmail.univ-mahajanga.mg"
                      />
                    </div>
                  </div>

                  {/* Espace Numérique */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Espace Numérique</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Libellé"
                        value={settings.topbar_digital_label || ""}
                        onChange={(e) => updateSetting("topbar_digital_label", e.target.value)}
                        placeholder="Espace Numérique"
                      />
                      <Input
                        label="URL"
                        value={settings.topbar_digital_url || ""}
                        onChange={(e) => updateSetting("topbar_digital_url", e.target.value)}
                        placeholder="https://espace.univ-mahajanga.mg"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
                  Enregistrer
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "header" && (
            <Card>
              <CardHeader>Bouton d'action du header</CardHeader>
              <CardBody>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Configurez le bouton d'appel à l'action (CTA) affiché dans le header du site public.
                </p>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <MousePointerClick className="w-5 h-5" />
                    <h4 className="text-sm font-semibold">Bouton CTA Principal</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Texte du bouton"
                      value={settings.header_cta_text || ""}
                      onChange={(e) => updateSetting("header_cta_text", e.target.value)}
                      placeholder="Candidater/Résultats/Inscription"
                      helperText="Le texte affiché sur le bouton"
                    />
                    <Input
                      label="URL de destination"
                      value={settings.header_cta_url || ""}
                      onChange={(e) => updateSetting("header_cta_url", e.target.value)}
                      placeholder="/inscription ou https://..."
                      helperText="Lien vers lequel le bouton redirige"
                    />
                  </div>
                  <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Aperçu du bouton :</p>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        className="bg-accent hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg"
                      >
                        {settings.header_cta_text || "Candidater/Résultats/Inscription"}
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
                  Enregistrer
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "stats" && (
            <Card>
              <CardHeader>Chiffres Clés</CardHeader>
              <CardBody>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Ces statistiques sont affichées sur la page d'accueil du site public.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Étudiants"
                    type="number"
                    value={settings.stat_students || ""}
                    onChange={(e) => updateSetting("stat_students", e.target.value)}
                    placeholder="12000"
                  />
                  <Input
                    label="Enseignants"
                    type="number"
                    value={settings.stat_teachers || ""}
                    onChange={(e) => updateSetting("stat_teachers", e.target.value)}
                    placeholder="500"
                  />
                  <Input
                    label="Personnels Administratifs"
                    type="number"
                    value={settings.stat_staff || ""}
                    onChange={(e) => updateSetting("stat_staff", e.target.value)}
                    placeholder="200"
                  />
                  <Input
                    label="Établissements"
                    type="number"
                    value={settings.stat_establishments || ""}
                    onChange={(e) => updateSetting("stat_establishments", e.target.value)}
                    placeholder="6"
                  />
                </div>
              </CardBody>
              <CardFooter>
                <Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
                  Enregistrer
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "seo" && (
            <Card>
              <CardHeader>Optimisation SEO</CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <Input
                    label="Meta Title"
                    value={settings.meta_title || ""}
                    onChange={(e) => updateSetting("meta_title", e.target.value)}
                    placeholder="Université de Mahajanga - Madagascar"
                    helperText="Affiché dans les résultats de recherche"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Meta Description
                    </label>
                    <textarea
                      value={settings.meta_description || ""}
                      onChange={(e) => updateSetting("meta_description", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                      placeholder="Description pour les moteurs de recherche..."
                    />
                    <p className="text-xs text-slate-500 mt-1">Maximum 160 caractères recommandés</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Mots-clés
                    </label>
                    <textarea
                      value={settings.meta_keywords || ""}
                      onChange={(e) => updateSetting("meta_keywords", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                      placeholder="université, mahajanga, madagascar, enseignement supérieur"
                    />
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
                  Enregistrer
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "social" && (
            <Card>
              <CardHeader>Réseaux sociaux</CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <Input
                    label="Facebook"
                    value={settings.facebook_url || ""}
                    onChange={(e) => updateSetting("facebook_url", e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                  <Input
                    label="Twitter / X"
                    value={settings.twitter_url || ""}
                    onChange={(e) => updateSetting("twitter_url", e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                  <Input
                    label="LinkedIn"
                    value={settings.linkedin_url || ""}
                    onChange={(e) => updateSetting("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/..."
                  />
                  <Input
                    label="YouTube"
                    value={settings.youtube_url || ""}
                    onChange={(e) => updateSetting("youtube_url", e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </CardBody>
              <CardFooter>
                <Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
                  Enregistrer
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "maintenance" && (
            <Card>
              <CardHeader>Mode maintenance</CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl cursor-pointer">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Activer le mode maintenance</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Le site public sera inaccessible
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenance_mode === "true"}
                      onChange={(e) => updateSetting("maintenance_mode", e.target.checked ? "true" : "false")}
                      className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Message de maintenance
                    </label>
                    <textarea
                      value={settings.maintenance_message || ""}
                      onChange={(e) => updateSetting("maintenance_message", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Le site est en maintenance..."
                    />
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
                  Enregistrer
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      <MediaPickerModal
        isOpen={videoPickerOpen}
        onClose={() => setVideoPickerOpen(false)}
        onSelect={(medias) => {
          const media = medias[0];
          if (media) {
            handleVideoSelect(media.id, media.url);
          }
        }}
        filterType="video"
        accept="video/mp4"
        uploadHint="MP4 uniquement - max 50MB"
      />
      <MediaPickerModal
        isOpen={posterPickerOpen}
        onClose={() => setPosterPickerOpen(false)}
        onSelect={(medias) => {
          const media = medias[0];
          if (media) {
            handlePosterSelect(media.id, media.url);
          }
        }}
        filterType="image"
        accept="image/*"
        uploadHint="JPG, PNG jusqu'à 10MB"
      />
    </div>
  );
}
