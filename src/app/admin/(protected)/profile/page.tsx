"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Save,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";

type Feedback = {
  type: 'success' | 'error';
  message: string;
} | null;


export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications" | "appearance">("profile");
  
  // Generic saving state
  const [saving, setSaving] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);

  // Password state
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', passwordConfirmation: '' });
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);


  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoadingProfile(true);
        const res = await fetch('/api/admin/me');
        if (!res.ok) {
          throw new Error('Impossible de charger les données du profil.');
        }
        const userData = await res.json();
        setProfile({
          name: userData.data.name,
          email: userData.data.email,
        });
      } catch (err: any) {
        setProfileFeedback({ type: 'error', message: err.message });
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, []);


  const handleSaveProfile = async () => {
    setSaving(true);
    setProfileFeedback(null);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || "Une erreur s'est produite.");
        throw new Error(message);
      }
      
      setProfile(data.data);
      setProfileFeedback({ type: 'success', message: 'Profil mis à jour avec succès !' });

    } catch (err: any) {
      setProfileFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setSaving(true);
    setPasswordFeedback(null);

    if (passwordData.newPassword !== passwordData.passwordConfirmation) {
        setPasswordFeedback({ type: 'error', message: "Le nouveau mot de passe et sa confirmation ne correspondent pas."});
        setSaving(false);
        return;
    }

    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          password: passwordData.newPassword,
          password_confirmation: passwordData.passwordConfirmation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || "Une erreur s'est produite.");
        throw new Error(message);
      }
      
      setPasswordFeedback({ type: 'success', message: 'Mot de passe mis à jour avec succès !' });
      setPasswordData({ currentPassword: '', newPassword: '', passwordConfirmation: '' });

    } catch (err: any) {
      setPasswordFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "profile", label: "Profil", icon: <User className="w-4 h-4" /> },
    { id: "password", label: "Mot de passe", icon: <Lock className="w-4 h-4" /> },
  ];

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mon Profil</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Gérez vos informations personnelles et préférences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
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

        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>Informations du profil</CardHeader>
              <CardBody>
                {loadingProfile ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Button variant="outline" size="sm" disabled>Changer la photo</Button>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JPG, PNG max 2MB (à venir)</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Nom complet"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        leftIcon={<User className="w-4 h-4" />}
                      />
                      <Input
                        label="Adresse email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        leftIcon={<Mail className="w-4 h-4" />}
                      />
                    </div>
                  </>
                )}
              </CardBody>
              <CardFooter className="flex-col items-start gap-4">
                {profileFeedback && (
                  <div className={`w-full flex items-start gap-3 p-3 rounded-lg text-sm ${profileFeedback.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                    {profileFeedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {profileFeedback.message}
                  </div>
                )}
                <Button onClick={handleSaveProfile} loading={saving} icon={<Save className="w-4 h-4" />}>
                  Enregistrer les modifications
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "password" && (
            <Card>
              <CardHeader>Changer le mot de passe</CardHeader>
              <CardBody>
                <div className="max-w-md space-y-4">
                  <Input
                    name="currentPassword"
                    label="Mot de passe actuel"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-4 h-4" />}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  <Input
                    name="newPassword"
                    label="Nouveau mot de passe"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-4 h-4" />}
                    helperText="Minimum 8 caractères"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  <Input
                    name="passwordConfirmation"
                    label="Confirmer le mot de passe"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-4 h-4" />}
                    value={passwordData.passwordConfirmation}
                    onChange={handlePasswordChange}
                  />
                </div>
              </CardBody>
              <CardFooter className="flex-col items-start gap-4">
                {passwordFeedback && (
                   <div className={`w-full flex items-start gap-3 p-3 rounded-lg text-sm ${passwordFeedback.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                    {passwordFeedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {passwordFeedback.message}
                  </div>
                )}
                <Button onClick={handleUpdatePassword} loading={saving} icon={<Save className="w-4 h-4" />}>
                  Mettre à jour le mot de passe
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
