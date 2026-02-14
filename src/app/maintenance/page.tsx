"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { publicGet } from "@/lib/public-api";

interface MaintenanceData {
  maintenance_message: string;
  site_name: string;
  site_email: string;
  logo_url: string | null;
}

export default function MaintenancePage() {
  const [data, setData] = useState<MaintenanceData | null>(null);

  useEffect(() => {
    publicGet<MaintenanceData>("/maintenance-status")
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  // Use a default message if loading or failed
  const message = data?.maintenance_message || "Le site est actuellement en maintenance. Nous serons de retour très bientôt.";
  const siteName = data?.site_name || "Université de Mahajanga";
  const siteEmail = data?.site_email || "contact@umahajanga.mg";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
        
        {/* Logo */}
        <div className="flex justify-center">
          {data?.logo_url ? (
            <img src={data.logo_url} alt="Logo" className="h-20 object-contain" />
          ) : (
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Site en maintenance
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {message}
          </p>
        </div>

        {siteEmail && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500 mb-4">Besoin de nous contacter ?</p>
            <a
              href={`mailto:${siteEmail}`}
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              <Mail className="w-4 h-4" />
              {siteEmail}
            </a>
          </div>
        )}
        
        <div className="pt-4">
            <Link href="/admin/login">
                <Button variant="ghost" size="sm" className="text-xs text-slate-400">
                    Accès Administration
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
