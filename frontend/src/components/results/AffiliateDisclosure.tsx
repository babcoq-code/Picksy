/**
 * AffiliateDisclosure — Mention légale d'affiliation Amazon / partenaires.
 * Conforme EU AI Act Article 50 et Amazon Associates Programme Requirements.
 *
 * @path /src/components/results/AffiliateDisclosure.tsx
 */

export interface AffiliateDisclosureProps {
  /** Variant d'affichage : 'badge' (court, inline) | 'footer' (complet, bloc) | 'tooltip' (compact) */
  variant?: "badge" | "footer" | "tooltip";
  /** Nom du partenaire principal (défaut: Amazon) */
  partner?: string;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * AffiliateDisclosure — Affiche la mention d'affiliation obligatoire.
 *
 * Usage:
 *   <AffiliateDisclosure variant="badge" />
 *   <AffiliateDisclosure variant="footer" />
 *   <AffiliateDisclosure variant="tooltip" />
 */
export default function AffiliateDisclosure({
  variant = "badge",
  partner = "Amazon",
  className = "",
}: AffiliateDisclosureProps) {
  if (variant === "tooltip") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ${className}`}
        title="Ce lien est un lien d'affiliation — Troviio peut percevoir une commission sans frais pour vous."
      >
        💰 Pub
      </span>
    );
  }

  if (variant === "badge") {
    return (
      <p
        className={`text-xs leading-relaxed text-slate-500 ${className}`}
      >
        <span className="font-semibold">🔗 Lien d&apos;affiliation</span> —{" "}
        Troviio participe au Programme Partenaires d&apos;{partner} EU. En tant que
        Partenaire, Troviio réalise un bénéfice sur les achats remplissant les
        conditions requises. Cela ne vous coûte rien de plus.
      </p>
    );
  }

  // variant === "footer"
  return (
    <div
      className={`rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-xs leading-7 text-slate-600 ${className}`}
    >
      <p className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
        <span className="text-base">⚖️</span> Transparence &amp; Affiliation
      </p>
      <p>
        Troviio participe au Programme Partenaires d&apos;{partner} EU et d&apos;autres
        programmes d&apos;affiliation. Lorsque vous cliquez sur un lien produit et
        effectuez un achat, Troviio peut percevoir une commission — sans
        surcoût pour vous.
      </p>
      <p className="mt-2">
        <strong>Indépendance éditoriale :</strong> Nos recommandations sont
        générées par intelligence artificielle en fonction de vos critères
        personnels (budget, usages, préférences). L&apos;affiliation n&apos;influence
        en rien le classement ni la sélection des produits proposés.
      </p>
      <p className="mt-2 text-[11px] text-slate-400">
        ⚡ <strong>EU AI Act — Article 50.</strong> Cette recommandation a été
        générée par un système d&apos;IA. Les prix et disponibilités peuvent
        varier. Vérifiez les informations sur {partner} avant achat.
      </p>
    </div>
  );
}
