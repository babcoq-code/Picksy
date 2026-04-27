"use client";

import * as React from "react";

// ─── Types ──────────────────────────────────────────────────

interface PriceEntry {
  platform: string;
  price_eur: number;
  in_stock: boolean;
  url: string | null;
  last_updated: string | null;
}

// ─── Price Skeleton ────────────────────────────────────────

export function PriceSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-surface rounded-2xl border border-white/5 p-5 space-y-4 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-light" />
            <div className="h-4 bg-surface-light rounded w-24" />
          </div>
          <div className="h-8 bg-surface-light rounded w-20" />
          <div className="h-3 bg-surface-light rounded w-32" />
          <div className="h-10 bg-surface-light rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

// ─── Price Comparison Table ────────────────────────────────

interface PriceComparisonTableProps {
  slug: string;
}

export default function PriceComparisonTable({
  slug,
}: PriceComparisonTableProps) {
  const [prices, setPrices] = React.useState<PriceEntry[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/products/${slug}/prices`);
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}`);
        }
        const json = await res.json();
        // Backend returns { prices: [...], price_history: [...] }
        // prices items: { platform, price, is_available, url, updated_at }
        const raw = (json.prices ?? json) as any[];
        const data: PriceEntry[] = raw.map((p: any) => ({
          platform: p.platform || "",
          price_eur: p.price_eur ?? p.price ?? 0,
          in_stock: p.is_available ?? true,
          url: p.url || p.affiliate_url || null,
          last_updated: p.updated_at || p.last_updated || null,
        }));
        if (!cancelled) {
          setPrices(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Impossible de charger les prix"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPrices();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Loading state
  if (loading) {
    return <PriceSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-coral/30 bg-coral/5 p-6 text-center">
        <p className="text-coral font-medium mb-1">Erreur de chargement</p>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!prices || prices.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface p-8 text-center">
        <p className="text-muted text-sm">
          Aucune offre disponible pour le moment.
        </p>
        <p className="text-xs text-muted/60 mt-2">
          Reviens plus tard — les prix sont mis à jour régulièrement.
        </p>
      </div>
    );
  }

  // Sort: in_stock first, then by price ascending
  const sorted = [...prices].sort((a, b) => {
    if (a.in_stock !== b.in_stock) return a.in_stock ? -1 : 1;
    return a.price_eur - b.price_eur;
  });

  const bestPrice = sorted[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((entry, index) => {
          const isBest =
            entry.in_stock && entry.price_eur === bestPrice.price_eur;

          return (
            <div
              key={`${entry.platform}-${index}`}
              className={`relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${
                isBest
                  ? "border-mint/40 bg-mint/5 shadow-lg shadow-mint/10"
                  : "border-white/5 bg-surface"
              }`}
            >
              {/* Best price badge */}
              {isBest && (
                <div className="absolute -top-2.5 left-4 px-3 py-1 rounded-full bg-mint text-night text-xs font-bold">
                  Meilleur prix 🏆
                </div>
              )}

              {/* Platform logo/name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    isBest ? "bg-mint text-night" : "bg-surface-light text-muted"
                  }`}
                >
                  {entry.platform.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-white">
                  {entry.platform}
                </span>
              </div>

              {/* Price */}
              <p
                className={`text-2xl font-extrabold mb-1 ${
                  isBest ? "text-mint" : "text-white"
                }`}
              >
                {priceFormatter.format(entry.price_eur)}
              </p>

              {/* Stock status */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    entry.in_stock ? "bg-mint" : "bg-coral"
                  }`}
                />
                <span
                  className={`text-xs ${
                    entry.in_stock ? "text-mint" : "text-coral"
                  }`}
                >
                  {entry.in_stock ? "En stock" : "Rupture"}
                </span>
              </div>

              {/* Last updated */}
              <p className="text-xs text-muted mb-4">
                Mis à jour le {formatDate(entry.last_updated)}
              </p>

              {/* CTA */}
              {entry.url && entry.in_stock ? (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-all ${
                    isBest
                      ? "bg-mint text-night hover:bg-mint-dark"
                      : "bg-blue text-white hover:bg-blue-dark"
                  }`}
                >
                  Voir l&apos;offre
                </a>
              ) : (
                <button
                  disabled
                  className="block w-full text-center py-3 rounded-xl text-sm font-bold bg-surface-light text-muted cursor-not-allowed"
                >
                  Indisponible
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Affiliate disclosure */}
      <p className="text-xs text-muted/60 text-center leading-relaxed pt-4 border-t border-white/5">
        Liens affiliés. Prix vérifiés régulièrement — Troviio peut percevoir une
        commission sans surcoût pour toi.
      </p>
    </div>
  );
}
