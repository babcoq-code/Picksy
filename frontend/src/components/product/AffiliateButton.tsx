"use client";

import { buildAffiliateUrl, type ProductForAffiliate } from "@/lib/amazon/affiliate";

interface AffiliateButtonProps {
  product: ProductForAffiliate;
  label?: string;
  className?: string;
}

/**
 * AffiliateButton — Lien vers Amazon avec tag d'affiliation Troviio.
 * Conforme aux exigences Amazon Associates (divulgation, lien direct).
 */
export default function AffiliateButton({
  product,
  label = "Voir le prix sur Amazon →",
  className = "",
}: AffiliateButtonProps) {
  const url = buildAffiliateUrl(product);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 ${className}`}
      style={{
        background: "linear-gradient(135deg, #FF6B5F, #E5554A)",
        boxShadow: "0 4px 16px rgba(255,107,95,0.3)",
      }}
    >
      {label}
    </a>
  );
}

/**
 * DisclosureBadge — Mention légale d'affiliation Amazon.
 * À placer à proximité des liens affiliés.
 */
export function DisclosureBadge() {
  return (
    <p className="text-xs text-muted leading-relaxed">
      Troviio perçoit une commission sur les achats via ce lien Amazon, sans surcoût pour toi.
      Nos recommandations restent indépendantes — nous recommandons ce qui correspond à ton profil,
      pas ce qui rapporte le plus.
    </p>
  );
}
