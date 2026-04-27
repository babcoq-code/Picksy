"use client";
import { useState } from "react";

type Price = {
  merchant_name: string;
  merchant_logo_url: string;
  price_eur: number;
  affiliate_url: string;
  in_stock: boolean;
  scraped_at: string;
};

const fmt = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);

const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(s));

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
  } catch {}
}

export function PriceComparison({
  prices,
  productId,
}: {
  prices: Price[];
  productId: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!prices.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-500 text-center">
        Aucun prix marchand disponible pour le moment.
        <br />
        Revenez dans quelques jours !
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-200 rounded-3xl border border-stone-200 bg-white overflow-hidden">
      {prices.map((p, i) => (
        <div key={`${p.merchant_name}-${i}`} className="p-4">
          <div className="flex items-center gap-3">
            {p.merchant_logo_url ? (
              <img
                src={p.merchant_logo_url}
                alt={p.merchant_name}
                className="size-6 object-contain rounded-full bg-stone-100"
              />
            ) : (
              <div className="size-6 rounded-full bg-stone-200" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{p.merchant_name}</p>
              <p className="text-xs text-stone-500">
                Relevé le {fmtDate(p.scraped_at)}
              </p>
            </div>
            <p className="text-lg font-black">{fmt(p.price_eur)}</p>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {i === 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                Meilleur prix 🏆
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                p.in_stock
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {p.in_stock ? "En stock" : "Rupture de stock"}
            </span>
          </div>
          <a
            href={p.affiliate_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() => {
              setLoading(p.merchant_name);
              void trackClick(productId, p.merchant_name, p.affiliate_url);
            }}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-stone-950 py-3 text-sm font-bold text-white hover:bg-stone-800 transition"
            aria-label={`Voir l'offre chez ${p.merchant_name}`}
          >
            {loading === p.merchant_name ? "Chargement…" : "Voir l'offre →"}
          </a>
        </div>
      ))}
    </div>
  );
}
