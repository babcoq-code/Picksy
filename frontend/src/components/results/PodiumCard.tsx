"use client";

import { ScoreRing } from "@/components/ScoreRing";
import type { RecommendationItem } from "@/types/recommendation";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface PodiumCardProps {
  /** Données de la recommandation */
  recommendation: RecommendationItem;
  /** URL d'affiliation construite (déjà taggée) */
  affiliateUrl: string | null;
  /** Index dans la grille pour les délais d'animation */
  index?: number;
  /** Classes CSS additionnelles */
  className?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const MEDAL: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const TOP_COLOR: Record<number, string> = {
  1: "bg-[#FF6B5F]",
  2: "bg-[#3ED6A3]",
  3: "bg-[#4257FF]",
};

const RANK_LABEL: Record<number, string> = {
  1: "Meilleur choix",
  2: "Excellent rapport Q/P",
  3: "Alternative solide",
};

function fmtEur(v: number | null): string | null {
  if (v === null || v === undefined) return null;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * PodiumCard — Carte individuelle pour le podium des recommandations.
 * Affiche le rang, le score, l'image, le nom, la marque, le prix
 * et un bouton d'affiliation Amazon.
 */
export default function PodiumCard({
  recommendation: reco,
  affiliateUrl,
  index = 0,
  className = "",
}: PodiumCardProps) {
  const isFirst = reco.rank === 1;
  const delay = `${index * 150}ms`;

  return (
    <article
      className={[
        "group relative flex flex-col overflow-hidden rounded-[2rem] border bg-white shadow-[0_20px_60px_rgba(14,16,32,0.10)] animate-slide-up",
        isFirst
          ? "border-[#FF6B5F]/30 md:min-h-[520px] md:scale-[1.04] md:shadow-[0_32px_80px_rgba(255,107,95,0.18)]"
          : "border-slate-200 md:min-h-[460px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ animationDelay: delay, animationFillMode: "both" }}
      aria-label={`${RANK_LABEL[reco.rank] ?? `#${reco.rank}`} : ${reco.brand} ${reco.name}`}
    >
      {/* Barre de couleur supérieure */}
      <div className={`h-1.5 w-full ${TOP_COLOR[reco.rank] ?? "bg-slate-300"}`} />

      <div className="flex flex-1 flex-col p-5">
        {/* En-tête : médaille + rang + score */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-3xl" aria-hidden>
              {MEDAL[reco.rank] ?? `#${reco.rank}`}
            </span>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              #{reco.rank}
            </p>
            <h3 className="mt-1 font-sora text-lg font-bold leading-snug tracking-tight">
              {reco.rank_label}
            </h3>
          </div>
          <ScoreRing score={reco.score} size={isFirst ? 84 : 72} />
        </div>

        {/* Image produit */}
        <div className="mt-4 flex flex-1 items-center justify-center rounded-2xl bg-slate-50 p-4">
          {reco.image_url ? (
            <img
              src={reco.image_url}
              alt={`${reco.brand} ${reco.name}`}
              className="max-h-44 w-full object-contain transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
              Image bientôt disponible
            </div>
          )}
        </div>

        {/* Marque, nom, prix */}
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-500">{reco.brand}</p>
          <h4 className="mt-1 font-sora text-xl font-bold tracking-tight">
            {reco.name}
          </h4>
          <p className="mt-1 font-sora text-2xl font-bold text-[#0E1020]">
            {fmtEur(reco.price_eur) ?? reco.price_range}
          </p>
        </div>

        {/* Bouton d'affiliation */}
        <div className="mt-4">
          {affiliateUrl ? (
            <a
              href={affiliateUrl}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className={[
                "inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4",
                isFirst
                  ? "bg-[#FF6B5F] shadow-[#FF6B5F]/30 hover:bg-[#e55a4d] focus:ring-[#FF6B5F]/25"
                  : "bg-[#0E1020] shadow-black/20 hover:bg-slate-800 focus:ring-slate-500/25",
              ].join(" ")}
              aria-label={`Voir le prix de ${reco.brand} ${reco.name} sur Amazon`}
            >
              Voir le prix sur Amazon
            </a>
          ) : (
            <button
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500"
            >
              Lien bientôt disponible
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
