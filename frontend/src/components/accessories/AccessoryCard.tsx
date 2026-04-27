'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Accessory } from '@/lib/types/accessories';
import { trackClick } from '@/lib/tracking';

const BADGE_CONFIG = {
  official: { label: '🟢 Officiel', className: 'bg-emerald-100 text-emerald-900 ring-emerald-200' },
  recommended: { label: '🔵 Recommandé Troviio', className: 'bg-blue-100 text-blue-950 ring-blue-200' },
  compatibility_warning: { label: '⚠️ Vérifier la compatibilité', className: 'bg-amber-100 text-amber-950 ring-amber-200' },
};

function formatPrice(price?: number, currency = 'EUR') {
  if (typeof price !== 'number') return 'Prix indisponible';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

export function AccessoryCard({
  accessory, productId, placement = 'accessory_card', compact = false,
}: {
  accessory: Accessory; productId?: string; placement?: string; compact?: boolean;
}) {
  const badge = BADGE_CONFIG[accessory.qualityBadge] ?? BADGE_CONFIG.recommended;
  const bestPrice = accessory.bestPrice;
  const offerUrl = bestPrice?.affiliateUrl || bestPrice?.url || '#';

  const handleClick = async () => {
    await trackClick({ type: 'affiliate_click', productId, accessoryId: accessory.id,
      merchantName: bestPrice?.merchantName, url: offerUrl, placement });
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/accessoires/${accessory.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-stone-100">
        {accessory.imageUrl ? (
          <Image src={accessory.imageUrl} alt={accessory.name} fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain p-5 transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-stone-400">
            Image indisponible
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${badge.className}`}>
            {badge.label}
          </span>
          {accessory.category?.name && (
            <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
              {accessory.category.name}
            </span>
          )}
          {accessory.certifications.slice(0, 2).map((cert) => (
            <span key={cert}
              className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700 ring-1 ring-green-200">
              {cert}
            </span>
          ))}
        </div>

        <p className="text-xs font-black uppercase tracking-wide text-stone-500">{accessory.brand}</p>
        <h3 className="mt-1 line-clamp-2 text-lg font-black leading-tight text-stone-950">
          <Link href={`/accessoires/${accessory.slug}`}>{accessory.name}</Link>
        </h3>

        {!compact && accessory.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-700">{accessory.description}</p>
        )}

        {accessory.hasDangerousCopies && (
          <details className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-950">
            <summary className="cursor-pointer font-black">Pourquoi éviter les copies ?</summary>
            <p className="mt-2 leading-6">
              {accessory.whyAvoidCopies ||
                "Les copies peuvent être non certifiées CE. Pour les batteries et chargeurs, le risque d'incendie est réel et documenté."}
            </p>
          </details>
        )}

        {accessory.safetyLevel === 'avoid' && (
          <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-900 ring-1 ring-red-200">
            🔴 Catégorie à risque — vérifier la certification CE avant achat
          </div>
        )}

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-stone-50 p-3">
            <div>
              <p className="text-xs font-bold text-stone-500">Meilleur prix</p>
              <p className="text-xl font-black text-stone-950">
                {formatPrice(bestPrice?.price, bestPrice?.currency)}
              </p>
            </div>
            {bestPrice?.merchantName && (
              <span className="text-xs font-black text-stone-600">{bestPrice.merchantName}</span>
            )}
          </div>
          <a href={offerUrl} target="_blank" rel="nofollow sponsored noopener noreferrer"
            onClick={handleClick}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-stone-950 px-5 py-3 text-sm font-black text-white transition hover:bg-stone-800">
            Voir l&apos;offre
          </a>
        </div>
      </div>
    </article>
  );
}
