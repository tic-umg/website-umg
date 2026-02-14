"use client";

import Link from "next/link";

export default function AdminTopbar() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/admin" className="font-semibold">Admin UMG</Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin/categories" className="text-slate-700 hover:text-slate-950">Catégories</Link>
          <Link href="/admin/newsletter/subscribers" className="text-slate-700 hover:text-slate-950">Newsletter</Link>
          <button onClick={logout} className="rounded-xl bg-slate-900 px-3 py-2 text-white">
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}