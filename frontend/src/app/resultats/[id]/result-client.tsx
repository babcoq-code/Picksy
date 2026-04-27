"use client";

import Link from "next/link";
import { useState } from "react";

export function ResultClientComponents({ resultId }: { resultId: string }) {
  return (
    <>
      {/* Bouton retour en haut */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF6B5F]/30 hover:text-[#FF6B5F] hover:shadow-md"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>

      <section className="rounded-[2rem] bg-[#0E1020] p-6 text-white shadow-[0_24px_80px_rgba(14,16,32,0.20)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-sora text-2xl font-bold tracking-tight">
              Tu veux partager ou affiner ta recherche ?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/70">
              Envoie ce lien à un proche ou relance le chat Troviio pour préciser ton budget,
              tes usages ou tes préférences.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ShareButton resultId={resultId} />
            <WhatsAppShareButton resultId={resultId} />
            <RefineSearchButton />
          </div>
        </div>
      </section>
    </>
  );
}

function ShareButton({ resultId }: { resultId: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleShare() {
    const url = `${window.location.origin}/resultats/${resultId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ma recommandation Troviio", url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setStatus("copied");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setStatus("copied");
      } catch {
        setStatus("error");
      }
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0E1020] transition hover:-translate-y-0.5 hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20"
    >
      {status === "copied"
        ? "✓ Lien copié !"
        : status === "error"
        ? "Copie impossible"
        : "🔗 Partager ma reco"}
    </button>
  );
}

function WhatsAppShareButton({ resultId }: { resultId: string }) {
  function handleWhatsApp() {
    const url = encodeURIComponent(`${window.location.origin}/resultats/${resultId}`);
    const text = encodeURIComponent("J'ai trouvé 3 produits parfaits grâce à Troviio, regarde :");
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
  }

  return (
    <button
      type="button"
      onClick={handleWhatsApp}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
    >
      WhatsApp 📲
    </button>
  );
}

function RefineSearchButton() {
  return (
    <Link
      href="/"
      onClick={() => {
        // L'historique est déjà dans localStorage (sauvegardé par ResultRedirectMessage)
        // On vérifie qu'il existe, sinon on nettoie
        const savedHistory = localStorage.getItem("picksy_history");
        if (!savedHistory) {
          localStorage.removeItem("picksy_chat");
        }
      }}
      className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/20"
    >
      🔍 Affiner ma recherche
    </Link>
  );
}
