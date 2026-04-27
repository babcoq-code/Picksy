import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Image from "next/image";
import Link from "next/link";
import { PriceChart } from "@/components/product/PriceChart";
import { PriceComparison } from "@/components/product/PriceComparison";
import { RatingBar } from "@/components/product/RatingBar";
import { UseCaseScores } from "@/components/product/UseCaseScores";
import { SpecsTable } from "@/components/product/SpecsTable";
import { AccessoriesWidget } from "@/components/accessories/AccessoriesWidget";

export const revalidate = 3600;

type PageProps = { params: Promise<{ slug: string }> };

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
}

// Pas de generateStaticParams — rendu dynamique (ISR avec revalidate)
// generateStaticParams serait idéal mais nécessite les vars Supabase au build time

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sb = await getSupabase();
  const { data: p } = await sb
    .from("products")
    .select("name,brand,description,image_url")
    .eq("slug", slug)
    .single();
  if (!p) return { title: "Produit introuvable | Troviio" };
  return {
    title: `${p.name} — Test complet, avis & prix | Troviio`,
    description: (p.description || "").slice(0, 155),
    openGraph: { images: p.image_url ? [{ url: p.image_url }] : [] },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const sb = await getSupabase();

  const { data: product } = await sb
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const pid = product.id;

  const [{ data: prices }, { data: history }] = await Promise.all([
    sb
      .from("latest_price_by_merchant")
      .select("*")
      .eq("product_id", pid),
    sb
      .from("price_history")
      .select("merchant_name,price_eur,scraped_at")
      .eq("product_id", pid)
      .gte(
        "scraped_at",
        new Date(Date.now() - 12 * 7 * 86400 * 1000).toISOString()
      )
      .order("scraped_at", { ascending: true }),
  ]);

  const sortedPrices = [...(prices ?? [])].sort(
    (a, b) => a.price_eur - b.price_eur
  );
  const bestPrice = sortedPrices[0]?.price_eur ?? product.price_eur;
  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(v);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    image: product.image_url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.estimated_score,
      bestRating: 10,
      worstRating: 0,
      reviewCount: 1,
    },
    offers: sortedPrices.map((p) => ({
      "@type": "Offer",
      priceCurrency: "EUR",
      price: p.price_eur,
      availability: p.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: p.affiliate_url,
      seller: { "@type": "Organization", name: p.merchant_name },
    })),
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div>
            <nav className="mb-4 text-sm text-stone-500 flex gap-2">
              <Link href="/" className="hover:text-stone-900">Accueil</Link>
              <span>/</span>
              <span className="text-stone-800">{product.name}</span>
            </nav>
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900 mb-4">
              {product.rank_label}
            </span>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
              {product.brand} {product.name}
            </h1>
            <p className="mt-4 text-lg text-stone-600 max-w-3xl leading-8">
              {product.description}
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-sm font-medium text-stone-500">Score Troviio</p>
                <p className="mt-2 text-3xl font-black text-emerald-700">
                  {product.estimated_score?.toFixed(1)}/10
                </p>
              </div>
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-sm font-medium text-stone-500">Meilleur prix</p>
                <p className="mt-2 text-3xl font-black text-stone-950">
                  {fmt(bestPrice)}
                </p>
              </div>
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-sm font-medium text-stone-500">Marque</p>
                <p className="mt-2 text-3xl font-black text-stone-950">
                  {product.brand}
                </p>
              </div>
            </div>
          </div>
          <aside className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
            {product.image_url && (
              <div className="relative aspect-square rounded-2xl bg-white overflow-hidden">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-contain p-6"
                  priority
                  sizes="400px"
                />
              </div>
            )}
            <div className="mt-5">
              <PriceComparison
                prices={sortedPrices}
                productId={String(product.id)}
              />
            </div>
          </aside>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Notre verdict</h2>
            <p className="mt-4 leading-8 text-stone-700">{product.verdict}</p>
          </article>

          {product.why_perfect && (
            <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Pourquoi ce produit est parfait</h2>
              <p className="mt-4 leading-8 text-stone-700">{product.why_perfect}</p>
            </article>
          )}

          {product.test_summary && (
            <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Test complet</h2>
              <p className="mt-4 leading-8 text-stone-700">{product.test_summary}</p>
            </article>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="text-xl font-black text-emerald-950">✅ Points forts</h2>
              <ul className="mt-4 space-y-2">
                {(product.pros ?? []).map((p: string) => (
                  <li key={p} className="text-emerald-900">• {p}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
              <h2 className="text-xl font-black text-rose-950">❌ Points faibles</h2>
              <ul className="mt-4 space-y-2">
                {(product.cons ?? []).map((c: string) => (
                  <li key={c} className="text-rose-900">• {c}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Évolution des prix — 12 semaines</h2>
            <p className="mt-1 text-sm text-stone-500">
              Prix relevés automatiquement chez les marchands partenaires.
            </p>
            <div className="mt-6">
              <PriceChart
                data={(history ?? []).map((h) => ({
                  merchantName: h.merchant_name,
                  priceEur: h.price_eur,
                  scrapedAt: h.scraped_at,
                }))}
              />
            </div>
          </article>

          {product.use_case_scores &&
            Object.keys(product.use_case_scores).length > 0 && (
              <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black">Scores par profil d'usage</h2>
                <div className="mt-6">
                  <UseCaseScores scores={product.use_case_scores} />
                </div>
              </article>
            )}

          {product.specs && Object.keys(product.specs).length > 0 && (
            <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Caractéristiques techniques</h2>
              <div className="mt-6">
                <SpecsTable specs={product.specs} />
              </div>
            </article>
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
          {product.ratings && Object.keys(product.ratings).length > 0 && (
            <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">Notes détaillées</h2>
              <div className="mt-6 space-y-5">
                {Object.entries(
                  product.ratings as Record<string, number>
                ).map(([key, val]) => (
                  <RatingBar
                    key={key}
                    label={
                      {
                        design: "Design",
                        ease_of_use: "Facilité d'utilisation",
                        performance: "Performance",
                        value_for_money: "Rapport qualité/prix",
                        customer_service: "Service client",
                      }[key] ?? key
                    }
                    value={val}
                  />
                ))}
              </div>
            </article>
          )}
          <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Meilleurs prix du moment</h2>
            <div className="mt-5">
              <PriceComparison
                prices={sortedPrices}
                productId={String(product.id)}
              />
            </div>
          </article>
        </aside>
      </section>

      <AccessoriesWidget
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
      />
    </main>
  );
}
