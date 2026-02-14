"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Users, BookOpen, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTheme } from "next-themes";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch for theme
  if (!mounted) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j?.message ?? "Échec de la connexion");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setErr("Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">
      {/* Theme Toggle Button - Floating */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Toggle Theme"
      >
        <Sun className="w-5 h-5 text-amber-500 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
        <Moon className="w-5 h-5 text-indigo-400 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle Theme</span>
      </button>

      {/* Left Side - Animated Gradient & Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 animate-gradient-x" />
        
        {/* Animated Shapes - Optimized */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 bg-[length:32px_32px]" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] animate-blob" />
          <div className="absolute bottom-0 left-20 w-80 h-80 bg-violet-500/20 rounded-full blur-[80px] animate-blob animation-delay-2000" />
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-start justify-center w-full h-full p-16 text-white text-left">
          <div className={`transition-all duration-1000 ease-out delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8 hover:bg-white/20 transition-all duration-300 shadow-xl shadow-indigo-900/10 cursor-default">
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
              <span className="text-sm font-medium tracking-wide">Accès Sécurisé Administration</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-semibold mb-6 leading-tight tracking-tight">
              Université de <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white drop-shadow-sm">Mahajanga</span>
            </h1>
            
            <p className="text-base text-indigo-100/90 mb-10 max-w-lg leading-relaxed font-light">
              Plateforme unifiée pour la gestion académique complète. Accédez aux ressources, administrez les parcours et suivez les performances en temps réel.
            </p>
          </div>

          {/* Stats Cards - Staggered Animation */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            {[
              { icon: Users, label: "Utilisateurs", sub: "Gestion centralisée", color: "indigo" },
              { icon: BookOpen, label: "Ressources", sub: "Accès intégral", color: "purple" }
            ].map((stat, i) => (
              <div 
                key={i}
                className={`group p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 shadow-lg shadow-black/5 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${300 + (i * 150)}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-300`} />
                </div>
                <div className="text-lg font-semibold mb-0.5">{stat.label}</div>
                <div className="text-indigo-200/70 text-xs font-light">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 dark:bg-slate-950">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent dark:from-indigo-500/10 opacity-60" />
           <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent dark:from-violet-500/5 opacity-60" />
        </div>

        <div className={`w-full max-w-[400px] transition-all duration-700 ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="bg-white/70 dark:bg-slate-900/70 p-8 rounded-3xl shadow-2xl shadow-indigo-100/50 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl relative z-10 hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/20 transition-shadow duration-500">
            
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 mb-4">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Bon retour 👋</h2>
              <p className="text-slate-500 dark:text-slate-400 font-light text-sm">
                Connectez-vous pour accéder à votre espace de gestion.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-5">
                <Input
                  label="Email professionnel"
                  type="email"
                  placeholder="nom@universite.mg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-5 h-5" />}
                  required
                  className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 h-12"
                />

                <Input
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  required
                  className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 h-12"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all duration-200 shadow-sm"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200 transform scale-90 peer-checked:scale-100">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-medium">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors hover:underline underline-offset-4"
                >
                  Oublié ?
                </button>
              </div>

              {err && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex gap-3 animate-slide-in-up items-start">
                   <div className="text-red-500 shrink-0 mt-0.5">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <div className="text-sm text-red-600 dark:text-red-400 font-medium leading-tight">
                     {err}
                   </div>
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full py-4 text-base font-bold tracking-wide shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border-none rounded-xl h-14"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                SE CONNECTER
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                &copy; {new Date().getFullYear()} Université de Mahajanga. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}