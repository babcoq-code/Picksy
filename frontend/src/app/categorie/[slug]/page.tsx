import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ScoreRing } from "@/components/ScoreRing";
import { fetchProductsByCategorySSR } from "@/lib/api";
import { siteConfig } from "@/lib/site";
import type { Product } from "@/types";

// ─── Mapping catégories connues ───────────────────────────

const CATEGORY_META: Record<
  string,
  { name: string; emoji: string; description: string }
> = {
  robot_aspirateur: {
    name: "Aspirateur robot",
    emoji: "🤖",
    description:
      "Aspirateurs robots intelligents pour sols durs, moquettes et animaux.",
  },
  tv_oled: {
    name: "TV OLED",
    emoji: "📺",
    description:
      "Téléviseurs OLED pour le cinéma, le gaming et les salons lumineux.",
  },
  machine_cafe: {
    name: "Machine à café",
    emoji: "☕",
    description:
      "Machines à café expresso, dosettes, grain et filtre pour tous les budgets.",
  },
  casque_audio: {
    name: "Casque audio",
    emoji: "🎧",
    description:
      "Casques audio sans fil, nomades et studio pour la musique et les appels.",
  },
  "casque-audio": {
    name: "Casque audio",
    emoji: "🎧",
    description:
      "Casques audio sans fil, nomades et studio pour la musique et les appels.",
  },
  "lave-vaisselle": {
    name: "Lave-vaisselle",
    emoji: "🍽️",
    description:
      "Lave-vaisselle silencieux, économes et compacts pour toutes les cuisines.",
  },
  poussette: {
    name: "Poussette",
    emoji: "👶",
    description:
      "Poussettes légères, pliables et tout-terrain pour bébé et parents.",
  },
  "barre-son": {
    name: "Barre de son",
    emoji: "🔊",
    description:
      "Barres de son pour TV, gaming et home cinéma avec Dolby Atmos.",
  },
  "barre-de-son": {
    name: "Barre de son",
    emoji: "🔊",
    description:
      "Barres de son pour TV, gaming et home cinéma avec Dolby Atmos.",
  },
};

function getCategoryMeta(slug: string) {
  return (
    CATEGORY_META[slug] || {
      name: slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      emoji: "🏷️",
      description: `Découvre notre sélection de produits dans la catégorie ${slug}.`,
    }
  );
}

// ─── Metadata dynamique (SEO) ─────────────────────────────

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const meta = getCategoryMeta(slug);

  const title = `Meilleurs ${meta.name} 2026 — Troviio`;
  const description = `Comparatif indépendant des meilleurs ${meta.name.toLowerCase()} en 2026. ${meta.description} Scores Troviio, avis et prix.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

// ─── Page Catégorie ───────────────────────────────────────

export default async function CategoryPage({ params }: Props) {
  const slug = (await params).slug;
  const meta = getCategoryMeta(slug);

  let products: Product[];
  try {
    products = await fetchProductsByCategorySSR(slug, 50);
  } catch {
    notFound();
  }

  // Safety check — if backend returned non-array or empty for bad slug
  if (!Array.isArray(products)) {
    notFound();
  }

  // Already sorted by estimated_score desc from backend
  const sorted = products;

  return (
    <main className="min-h-screen bg-night text-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-night/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/logo-dark.svg" alt="Troviio" style={{ height: 34 }} />
          </Link>
          <span className="text-xs text-muted hidden sm:block tracking-wide uppercase">
            Le conseiller maison
          </span>
        </div>
      </header>

      {/* ── Breadcrumb ── */}
      <nav className="max-w-6xl mx-auto px-4 py-4" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-2 text-sm text-muted">
          <li>
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-white font-medium">{meta.name}</li>
        </ol>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pb-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blueberry/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{meta.emoji}</span>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight font-display">
                Meilleurs {meta.name} 2026
              </h1>
              <p className="text-base text-muted mt-2 max-w-2xl leading-relaxed">
                {meta.description}
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-white/5">
              <span className="w-2 h-2 rounded-full bg-mint" />
              {sorted.length} produits analysés
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-white/5">
              <span className="w-2 h-2 rounded-full bg-blue" />
              Scores Troviio vérifiés
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-white/5">
              <span className="w-2 h-2 rounded-full bg-coral" />
              Recommandations indépendantes
            </span>
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">{meta.emoji}</p>
            <h2 className="text-xl font-bold mb-2">Aucun produit trouvé</h2>
            <p className="text-muted text-sm mb-6">
              Cette catégorie est en cours d&apos;alimentation. Reviens
              bientôt !
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #4257FF, #8A7CFF)",
                boxShadow: "0 4px 16px rgba(66,87,255,0.3)",
              }}
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((product) => (
              <ProductCardItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="max-w-3xl mx-auto px-4 mb-20 text-center">
        <div className="bg-surface rounded-2xl border border-white/5 p-8">
          <h2 className="text-xl font-bold mb-2 font-display">
            Tu ne trouves pas ton bonheur ?
          </h2>
          <p className="text-muted text-sm mb-6">
            Dis à Troviio tes contraintes réelles — il te trouvera le produit
            parfait pour toi.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-bold transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #FF6B5F, #FFB020)",
              boxShadow: "0 8px 32px rgba(255,107,95,0.35)",
            }}
          >
            🎯 Demander une recommandation personnalisée
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <Link
              href="/mentions-legales"
              className="hover:text-white transition-colors"
            >
              Mentions légales
            </Link>
            <Link
              href="/affiliation"
              className="hover:text-white transition-colors"
            >
              Affiliation Amazon
            </Link>
            <Link
              href="/methodologie"
              className="hover:text-white transition-colors"
            >
              Méthodologie
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted border-t border-white/5 pt-6">
            <span>© 2026 {siteConfig.name}</span>
            <span className="text-xs">
              Liens affiliés Amazon · Recommandations indépendantes
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ─── Product Card (inline, no framer-motion) ────────────────

function ProductCardItem({ product }: { product: Product }) {
  const score = product.estimated_score ?? 0;
  const emoji = product.category_emoji || "🏷️";

  return (
    <Link
      href={`/produit/${product.slug}`}
      className="block bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-blueberry/30 hover:shadow-lg hover:shadow-blueberry/5 hover:-translate-y-1 group"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-surface-light overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl text-muted">
            {emoji}
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blueberry text-white text-xs font-bold shadow-lg">
          <span>{emoji}</span>
          <span>{product.category_name || product.category_slug}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-base text-white truncate group-hover:text-coral transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted font-medium">{product.brand}</p>
          </div>
          <ScoreRing score={score} size="sm" />
        </div>

        {/* Key features from specs */}
        {product.specs &&
          Object.keys(product.specs).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(product.specs)
                .slice(0, 3)
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-0.5 rounded-md bg-surface-light text-xs text-muted"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
            </div>
          )}

        {/* Price + Score indicator */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-extrabold text-white">
            {product.price_eur ? (
              <>
                {product.price_eur}€{" "}
                <span className="text-coral text-sm">↗</span>
              </>
            ) : (
              <span className="text-sm text-muted">Prix non dispo</span>
            )}
          </span>
          <span className="text-xs font-bold text-mint uppercase tracking-wider">
            ● IA vérifiée
          </span>
        </div>
      </div>
    </Link>
  );
}
