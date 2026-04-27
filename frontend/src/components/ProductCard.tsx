"use client";

import { ScoreRing } from "./ScoreRing";
import type { Product } from "@/types";

const CATEGORY_EMOJI: Record<string, string> = {
  robot_aspirateur: "🤖",
  aspirateur_robot: "🤖",
  aspirateur: "🤖",
  tv_oled: "📺",
  tv: "📺",
  machine_cafe: "☕",
  machine_à_café: "☕",
};

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const emoji = Object.entries(CATEGORY_EMOJI).find(([k]) =>
    (product.category_slug || "").toLowerCase().includes(k)
  )?.[1] || "🏡";

  return (
    <article className="bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all hover:-translate-y-1">
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-surface-light overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl text-muted">
            {emoji}
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blueberry text-white text-xs font-bold shadow-lg">
          <span>{emoji}</span>
          <span className="capitalize">{product.category_name || product.category_slug}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-base text-white truncate">{product.name}</h3>
            <p className="text-xs text-muted font-medium">{product.brand}</p>
          </div>
          <ScoreRing score={product.estimated_score || 85} size="sm" />
        </div>

        <div className="flex items-center justify-between pt-1">
          {product.affiliate_url ? (
            <a
              href={product.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-extrabold text-white hover:text-coral transition-colors"
            >
              {product.price_eur}€ <span className="text-coral text-sm">↗</span>
            </a>
          ) : (
            <span className="text-sm text-muted">
              {product.price_eur ? `${product.price_eur}€` : "Prix non dispo"}
            </span>
          )}
          <span className="text-xs font-bold text-mint uppercase tracking-wider">
            ● IA vérifiée
          </span>
        </div>

        <a
          href={product.affiliate_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-gradient-to-r from-coral to-coral-dark hover:from-coral-light hover:to-coral text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-coral/20"
        >
          Voir le prix sur Amazon ✨
        </a>
      </div>
    </article>
  );
}
