import type { RecommendationItem } from "@/types/recommendation";
import PodiumCard from "./PodiumCard";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface PodiumProps {
  /** Les 3 recommandations à afficher sur le podium */
  recommendations: RecommendationItem[];
  /** Tag d'affiliation Amazon (ex: "troviio-21") */
  amazonTag?: string;
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Ordonne les recommandations pour l'affichage podium :
 * [2nd, 1er, 3ème] pour un rendu visuel cohérent.
 */
function podiumOrder(recs: RecommendationItem[]): RecommendationItem[] {
  const sorted = [...recs].sort((a, b) => a.rank - b.rank);
  const [first, second, third] = [
    sorted.find((r) => r.rank === 1),
    sorted.find((r) => r.rank === 2),
    sorted.find((r) => r.rank === 3),
  ];
  return [second, first, third].filter(Boolean) as RecommendationItem[];
}

/**
 * Construit l'URL d'affiliation avec le tag Amazon.
 */
function buildAffiliateUrl(
  affiliateUrl: string | null | undefined,
  amazonAsin: string | null | undefined,
  tag: string
): string | null {
  if (affiliateUrl) {
    try {
      const u = new URL(affiliateUrl);
      u.searchParams.set("tag", tag);
      return u.toString();
    } catch {
      return affiliateUrl;
    }
  }
  if (amazonAsin) {
    return `https://www.amazon.fr/dp/${amazonAsin}?tag=${tag}`;
  }
  return null;
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Podium — Affiche les 3 meilleures recommandations dans une disposition
 * en grille 3 colonnes (2nd, 1er, 3ème) avec des cartes PodiumCard.
 *
 * Usage :
 *   <Podium recommendations={recommendations} amazonTag="troviio-21" />
 */
export default function Podium({
  recommendations,
  amazonTag = "troviio-21",
  className = "",
}: PodiumProps) {
  const ordered = podiumOrder(recommendations);

  if (ordered.length === 0) return null;

  return (
    <div
      className={`grid items-end gap-4 md:grid-cols-3 ${className}`}
      role="list"
      aria-label="Podium des 3 meilleurs choix"
    >
      {ordered.map((reco, i) => {
        const url = buildAffiliateUrl(
          reco.affiliate_url,
          reco.amazon_asin,
          amazonTag
        );
        return (
          <PodiumCard
            key={`${reco.rank}-${reco.name}`}
            recommendation={reco}
            affiliateUrl={url}
            index={i}
          />
        );
      })}
    </div>
  );
}
