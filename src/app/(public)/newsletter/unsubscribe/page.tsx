"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Jeton de désinscription manquant.");
      return;
    }

    const unsubscribe = async () => {
      setStatus("loading");
      try {
        const res = await fetch("/api/newsletter/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.message || "Impossible de se désinscrire.");
        }
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Impossible de se désinscrire.");
      }
    };

    void unsubscribe();
  }, [token]);

  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto p-8 bg-white dark:bg-[#1e2634] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      {status === "loading" && (
        <>
          <Loader2 className="w-12 h-12 text-[#135bec] animate-spin mb-4" />
          <h1 className="text-xl font-bold mb-2">Désinscription en cours...</h1>
          <p className="text-gray-500">Veuillez patienter un instant.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Vous êtes désinscrit</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Votre désinscription a été prise en compte.
          </p>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#135bec] px-6 text-sm font-bold text-white transition-colors hover:bg-[#0d4abf]"
          >
            Retour à l&apos;accueil
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Échec de désinscription</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-6 text-sm font-bold transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Retour à l&apos;accueil
          </Link>
        </>
      )}
    </div>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20 bg-[#f6f6f8] dark:bg-[#111318]">
      <Container>
        <Suspense fallback={<div className="text-center p-10">Chargement...</div>}>
          <UnsubscribeContent />
        </Suspense>
      </Container>
    </div>
  );
}

