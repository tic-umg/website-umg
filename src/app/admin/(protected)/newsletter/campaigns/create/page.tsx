"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Mail, Send, Eye, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RecipientSelector, RecipientSelection } from "@/components/admin/newsletter/RecipientSelector";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    content_html: "",
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [recipientSelection, setRecipientSelection] = useState<RecipientSelection>({
    mode: "subscribers",
    status: "active",
    subscriber_ids: [],
    extra_emails: [],
    totalRecipients: 0,
  });

  const handleRecipientChange = useCallback((selection: RecipientSelection) => {
    setRecipientSelection(selection);
  }, []);

  async function handleSubmit(e: React.FormEvent, sendNow = false) {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content_html.trim()) {
      alert("Veuillez remplir le sujet et le contenu.");
      return;
    }

    if (sendNow && recipientSelection.totalRecipients === 0) {
      alert("Aucun destinataire sélectionné.");
      return;
    }

    setSaving(true);
    try {
      // Create campaign
      const res = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();

        if (sendNow && data.data?.id) {
          // Immediately send the campaign with recipient options
          const sendRes = await fetch(`/api/admin/newsletter/campaigns/${data.data.id}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: recipientSelection.mode,
              status: recipientSelection.status,
              subscriber_ids: recipientSelection.subscriber_ids,
              extra_emails: recipientSelection.extra_emails,
            }),
          });

          if (!sendRes.ok) {
            const errData = await sendRes.json().catch(() => null);
            alert(errData?.message || "Campagne créée mais l'envoi a échoué. Vous pouvez l'envoyer depuis la liste.");
          }
        }

        router.push("/admin/newsletter");
      } else {
        const err = await res.json();
        alert(err.message || "Erreur lors de la création");
      }
    } finally {
      setSaving(false);
    }
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nouvelle campagne</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Créez et envoyez une campagne newsletter</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
          <form onSubmit={(e) => handleSubmit(e, false)}>
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
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Contenu de l'email
                    </label>
                    <RichTextEditor
                      value={formData.content_html}
                      onChange={(value) => setFormData({ ...formData, content_html: value })}
                      placeholder="Rédigez le contenu de votre newsletter..."
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Destinataires */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">Destinataires</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {recipientSelection.totalRecipients} destinataire(s) sélectionné(s)
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <RecipientSelector onChange={handleRecipientChange} />
              </CardBody>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Button variant="ghost" type="button" onClick={() => router.back()}>
                Annuler
              </Button>
              <div className="flex items-center gap-3">
                <Button 
                  type="submit" 
                  variant="outline"
                  loading={saving} 
                  icon={<Save className="w-4 h-4" />}
                >
                  Enregistrer brouillon
                </Button>
                <Button 
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  loading={saving} 
                  icon={<Send className="w-4 h-4" />}
                >
                  Envoyer maintenant
                </Button>
              </div>
            </div>
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
    </div>
  );
}
