"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import ScoreRing from "@/components/ScoreRing";
import WhyThisProduct from "@/components/product/WhyThisProduct";
import PriceComparisonTable, { PriceSkeleton } from "@/components/product/PriceComparisonTable";
import PriceHistoryChart from "@/components/product/PriceHistoryChart";
import ProductTestSection from "@/components/product/ProductTestSection";

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

interface ProductClientProps {
  product: any;
}

export default function ProductClient({ product }: ProductClientProps) {
  return (
    <main className="min-h-screen bg-[#0E1020] text-white">

      {/* ── HEADER ────────────────────────────────────────── */}
      <section className="border-b border-white/10 bg-gradient-to-b from-[#151B4F]/60 to-[#0E1020]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-[#8B8FA3]">
            <Link href="/" className="hover:text-white transition">
              Accueil
            </Link>
            <span>/</span>
            <span className="truncate max-w-[300px] text-white">
              {product.name}
            </span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-center">
            {/* Image produit */}
            <div className="animate-fade-slide-up relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[#1A1D2E] shadow-2xl">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={`${product.brand} ${product.name}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 380px, 100vw"
                  className="object-contain p-8"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-6xl font-bold text-[#4257FF]/40">
                    {product.brand?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="animate-fade-slide-up flex flex-col gap-5" style={{ animationDelay: "0.08s" }}>
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.rank_label && (
                  <span className="rounded-full bg-[#4257FF]/20 px-4 py-1.5 text-sm font-semibold ring-1 ring-[#4257FF]/40">
                    {product.rank_label}
                  </span>
                )}
                <span className="rounded-full bg-white/8 px-4 py-1.5 text-sm text-[#8B8FA3] ring-1 ring-white/10">
                  {product.brand}
                </span>
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl leading-tight">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-[#C9CCDA] text-base leading-7 max-w-2xl">
                  {product.description}
                </p>
              )}

              {/* Score + Prix */}
              <div className="flex flex-wrap items-center gap-6">
                {product.estimated_score != null && (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                    <ScoreRing score={product.estimated_score} />
                  </div>
                )}
                {product.price_eur != null && (
                  <div className="rounded-3xl border border-white/10 bg-[#1A1D2E]/80 p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#8B8FA3]">
                      Prix dès
                    </p>
                    <p className="mt-1 text-3xl font-bold text-white">
                      {EUR.format(product.price_eur)}
                    </p>
                    <p className="mt-1 text-xs text-[#8B8FA3]">
                      Comparaison live ci-dessous ↓
                    </p>
                  </div>
                )}
              </div>

              {/* Mention affiliation */}
              <p className="text-xs text-[#8B8FA3] border-t border-white/10 pt-4">
                🔗 Certains liens vers les marchands sont des <strong>liens affiliés</strong>.
                En tant que Partenaire Amazon, Troviio perçoit une commission sur les achats éligibles.
                Cela n&apos;influence pas nos recommandations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENU ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl flex flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Section 2 — Pourquoi ce produit */}
        <WhyThisProduct product={product} />

        {/* Section 3 — Comparaison prix */}
        <section className="rounded-3xl border border-white/10 bg-[#1A1D2E] p-6 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#3ED6A3] mb-2">
            Comparer les prix
          </p>
          <h2 className="text-2xl font-bold mb-6">
            Où l&apos;acheter au meilleur prix ?
          </h2>
          <React.Suspense fallback={<PriceSkeleton />}>
            <PriceComparisonTable slug={product.slug} />
          </React.Suspense>
        </section>

        {/* Section 4 — Historique prix */}
        <section className="rounded-3xl border border-white/10 bg-[#1A1D2E] p-6 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#3ED6A3] mb-2">
            Historique prix
          </p>
          <h2 className="text-2xl font-bold mb-6">
            Évolution du prix sur 90 jours
          </h2>
          <PriceHistoryChart slug={product.slug} />
        </section>

        {/* Section 5 — Test détaillé */}
        <ProductTestSection product={product} />

        {/* Section 6 — Pour qui / Pas pour qui */}
        <AudienceSection product={product} />
      </div>
    </main>
  );
}

// ── Composant Audience ─────────────────────────────────────────────────────────

function AudienceSection({ product }: { product: any }) {
  const entries = Object.entries(product.use_case_scores || {}) as [string, number][];
  const sorted = [...entries].sort(([, a], [, b]) => b - a);

  if (sorted.length === 0) return null;

  const forYou = sorted.filter(([, s]) => s >= 7.5);
  const notForYou = sorted.filter(([, s]) => s < 7.5);

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {/* Fait pour toi */}
      <div className="animate-fade-slide-up rounded-3xl border border-[#3ED6A3]/25 bg-[#3ED6A3]/8 p-6">
        <h2 className="text-xl font-bold mb-4">✅ Fait pour toi si...</h2>
        <div className="space-y-3">
          {(forYou.length > 0 ? forYou : sorted.slice(0, 3)).map(([label, score]) => (
            <div
              key={label}
              className="flex justify-between items-center rounded-2xl bg-white/5 p-3 ring-1 ring-white/10"
            >
              <span className="capitalize">
                {label.replace(/_/g, " ")}
              </span>
              <span className="text-[#3ED6A3] font-bold text-sm">
                {score.toFixed(1)}/10
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pas fait pour toi */}
      <div
        className="animate-fade-slide-up rounded-3xl border border-[#FF6B5F]/25 bg-[#FF6B5F]/8 p-6"
        style={{ animationDelay: "0.05s" }}
      >
        <h2 className="text-xl font-bold mb-4">❌ Pas fait pour toi si...</h2>
        <div className="space-y-3">
          {(notForYou.length > 0 ? notForYou : sorted.slice(-3)).map(([label, score]) => (
            <div
              key={label}
              className="flex justify-between items-center rounded-2xl bg-white/5 p-3 ring-1 ring-white/10"
            >
              <span className="capitalize">
                {label.replace(/_/g, " ")}
              </span>
              <span className="text-[#FF6B5F] font-bold text-sm">
                {score.toFixed(1)}/10
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
