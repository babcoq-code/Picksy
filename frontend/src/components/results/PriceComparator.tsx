"use client";

import { useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PriceOffer {
  /** Nom du marchand (ex: "Amazon", "Darty", "Fnac") */
  merchant_name: string;
  /** URL du logo du marchand */
  merchant_logo_url: string | null;
  /** Prix en euros */
  price_eur: number;
  /** Prix précédent (pour afficher une réduction) */
  previous_price_eur?: number | null;
  /** URL d'affiliation */
  affiliate_url: string;
  /** Disponibilité */
  in_stock: boolean;
  /** Date du relevé de prix */
  scraped_at: string;
  /** Nom du vendeur/tiers sur la marketplace */
  seller_name?: string | null;
  /** Délai de livraison estimé */
  delivery_info?: string | null;
}

export interface PriceComparatorProps {
  /** Liste des offres disponibles */
  offers: PriceOffer[];
  /** Identifiant du produit pour le tracking */
  productId?: string;
  /** Classes CSS additionnelles */
  className?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(v);

const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(s));

async function trackClick(
  productId: string,
  merchantName: string,
  affiliateUrl: string
) {
  try {
    await fetch("/api/affiliate/click", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, merchantName, affiliateUrl }),
    });
  } catch {
    // Échec silencieux — ne pas bloquer la navigation
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * PriceComparator — Tableau comparatif des offres marchandes.
 * Affiche le meilleur prix, la disponibilité, et un lien d'affiliation
 * pour chaque marchand. Tracking des clics intégré.
 *
 * Usage :
 *   <PriceComparator offers={offers} productId="prod-123" />
 */
export default function PriceComparator({
  offers,
  productId,
  className = "",
}: PriceComparatorProps) {
  const [loading, setLoading] = useState<string | null>(null);

  // Trier : meilleur prix d'abord, puis en stock avant rupture
  const sorted = [...offers].sort((a, b) => {
    if (a.in_stock && !b.in_stock) return -1;
    if (!a.in_stock && b.in_stock) return 1;
    return a.price_eur - b.price_eur;
  });

  if (sorted.length === 0) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 ${className}`}
      >
        <span className="text-2xl">🔍</span>
        <p className="mt-2 font-semibold">Aucune offre disponible</p>
        <p className="mt-1 text-xs">
          Revenez dans quelques jours, les marchands ajoutent régulièrement
          des offres.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`divide-y divide-stone-200 rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden ${className}`}
      role="list"
      aria-label="Comparateur de prix"
    >
      {sorted.map((offer, i) => {
        const reduction =
          offer.previous_price_eur && offer.previous_price_eur > offer.price_eur
            ? Math.round(
                (1 - offer.price_eur / offer.previous_price_eur) * 100
              )
            : null;

        return (
          <div
            key={`${offer.merchant_name}-${i}`}
            className="p-4 transition hover:bg-stone-50"
            role="listitem"
          >
            <div className="flex items-center gap-3">
              {/* Logo marchand */}
              {offer.merchant_logo_url ? (
                <img
                  src={offer.merchant_logo_url}
                  alt={offer.merchant_name}
                  className="size-8 rounded-full bg-stone-100 object-contain"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-stone-200 text-xs font-bold text-stone-500 uppercase">
                  {offer.merchant_name.charAt(0)}
                </div>
              )}

              {/* Infos marchand */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">
                  {offer.merchant_name}
                </p>
                {offer.seller_name && (
                  <p className="text-xs text-stone-400 truncate">
                    Vendu par {offer.seller_name}
                  </p>
                )}
                <p className="text-xs text-stone-500">
                  Relevé le {fmtDate(offer.scraped_at)}
                </p>
              </div>

              {/* Prix + badges */}
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black">{fmt(offer.price_eur)}</p>
                  {reduction && (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      -{reduction}%
                    </span>
                  )}
                </div>
                {offer.previous_price_eur && (
                  <p className="text-xs text-stone-400 line-through">
                    {fmt(offer.previous_price_eur)}
                  </p>
                )}
              </div>
            </div>

            {/* Badges disponibilité */}
            <div className="mt-2 flex flex-wrap gap-2">
              {i === 0 && sorted.length > 1 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                  Meilleur prix 🏆
                </span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  offer.in_stock
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {offer.in_stock ? "En stock" : "Rupture de stock"}
              </span>
              {offer.delivery_info && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                  📦 {offer.delivery_info}
                </span>
              )}
            </div>

            {/* Bouton CTA */}
            <a
              href={offer.affiliate_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => {
                setLoading(offer.merchant_name);
                if (productId) {
                  void trackClick(
                    productId,
                    offer.merchant_name,
                    offer.affiliate_url
                  );
                }
              }}
              className="mt-3 flex w-full items-center justify-center rounded-full bg-stone-950 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-stone-800 active:translate-y-0"
              aria-label={`Voir l'offre chez ${offer.merchant_name} à ${fmt(offer.price_eur)}`}
            >
              {loading === offer.merchant_name
                ? "Chargement…"
                : `Voir l'offre →`}
            </a>
          </div>
        );
      })}
    </div>
  );
}
