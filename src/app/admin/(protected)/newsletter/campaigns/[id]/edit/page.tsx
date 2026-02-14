"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Mail, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";

type Campaign = {
  id: number;
  subject: string;
  status: string;
  content_html?: string;
  content_text?: string;
  sent_at?: string;
  created_at: string;
};

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    content_html: "",
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}?include_content=1`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setCampaign(data);
        setFormData({
          subject: data.subject || "",
          content_html: data.content_html || "",
        });
      } else {
        alert("Campagne non trouvée");
        router.push("/admin/newsletter");
      }
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content_html.trim()) {
      alert("Veuillez remplir le sujet et le contenu.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/admin/newsletter");
      } else {
        const err = await res.json();
        alert(err.message || "Erreur lors de la mise à jour");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/newsletter");
      } else {
        const err = await res.json();
        alert(err.message || "Erreur lors de la suppression");
      }
    } finally {
      setDeleting(false);
    }
  }

  const isEditable = campaign?.status === "draft";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/newsletter"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Modifier la campagne</h1>
              <Badge variant={campaign?.status === "draft" ? "default" : campaign?.status === "sent" ? "success" : "info"}>
                {campaign?.status === "draft" ? "Brouillon" : campaign?.status === "sent" ? "Envoyée" : campaign?.status}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {isEditable ? "Modifiez le contenu de votre campagne" : "Cette campagne a déjà été envoyée et ne peut plus être modifiée"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditable && (
            <Button 
              variant="outline" 
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setDeleteModalOpen(true)}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              Supprimer
            </Button>
          )}
          <Button 
            variant="outline" 
            icon={<Eye className="w-4 h-4" />}
            onClick={() => setPreviewOpen(!previewOpen)}
          >
            {previewOpen ? "Fermer aperçu" : "Aperçu"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className={previewOpen ? "lg:col-span-2" : "lg:col-span-3"}>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">Contenu de la campagne</span>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <Input
                    label="Sujet de l'email"
                    placeholder="Objet de votre email..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    disabled={!isEditable}
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Contenu de l'email
                    </label>
                    {isEditable ? (
                      <RichTextEditor
                        value={formData.content_html}
                        onChange={(value) => setFormData({ ...formData, content_html: value })}
                        placeholder="Rédigez le contenu de votre newsletter..."
                      />
                    ) : (
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                        dangerouslySetInnerHTML={{ __html: formData.content_html }}
                      />
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Actions */}
            {isEditable && (
              <div className="flex items-center justify-between mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Button variant="ghost" type="button" onClick={() => router.back()}>
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  loading={saving} 
                  icon={<Save className="w-4 h-4" />}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Preview Panel */}
        {previewOpen && (
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <span className="font-medium text-slate-900 dark:text-white">Aperçu</span>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Sujet</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formData.subject || "(Aucun sujet)"}
                    </p>
                  </div>
                  <hr className="border-slate-200 dark:border-slate-700" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Contenu</p>
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ 
                        __html: formData.content_html || "<p class='text-slate-400'>(Aucun contenu)</p>" 
                      }}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer la campagne"
        message={`Êtes-vous sûr de vouloir supprimer "${campaign?.subject}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
