"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Container from "@/components/Container";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto p-8 bg-white dark:bg-[#1e2634] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      {/* Animated Mail Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Mail className="w-10 h-10 text-[#135bec]" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-xs font-bold text-amber-900">1</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
        Confirmez votre adresse email
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mb-2">
        Un email de confirmation a été envoyé à :
      </p>

      {email && (
        <p className="font-semibold text-[#135bec] mb-4 break-all">
          {email}
        </p>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 w-full">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cliquez sur le lien dans l'email pour activer votre inscription à la newsletter.
          <span className="block mt-2 text-gray-500 dark:text-gray-400">
            Pensez à vérifier vos spams si vous ne le trouvez pas.
          </span>
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 h-10 justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-6 text-sm font-bold transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default function NewsletterConfirmPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20 bg-[#f6f6f8] dark:bg-[#111318]">
      <Container>
        <Suspense fallback={<div className="text-center p-10">Chargement...</div>}>
          <ConfirmContent />
        </Suspense>
      </Container>
    </div>
  );
}
