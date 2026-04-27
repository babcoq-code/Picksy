import type { ReactNode } from "react";
import Link from "next/link";
import { LegalNavigation } from "@/components/legal/LegalNavigation";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="transition hover:text-slate-950">Accueil</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-slate-700">Informations légales</li>
          </ol>
        </nav>
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-8"><LegalNavigation /></aside>
          <section className="rounded-3xl border border-slate-200 bg-white px-5 py-8 shadow-sm sm:px-8 lg:px-12">{children}</section>
        </div>
      </div>
    </main>
  );
}
