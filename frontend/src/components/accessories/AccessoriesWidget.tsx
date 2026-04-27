'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AccessoryCard } from './AccessoryCard';
import { AccessoriesForProductResponse } from '@/lib/types/accessories';

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-stone-200 bg-white">
      <div className="aspect-[4/3] bg-stone-200" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-32 rounded-full bg-stone-200" />
        <div className="h-6 w-4/5 rounded bg-stone-200" />
        <div className="h-4 w-full rounded bg-stone-200" />
        <div className="h-12 rounded-2xl bg-stone-200" />
      </div>
    </div>
  );
}

export function AccessoriesWidget({ productId, productSlug, productName }: {
  productId: string; productSlug: string; productName: string;
}) {
  const [data, setData] = useState<AccessoriesForProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const displayed = useMemo(() => data?.accessories.slice(0, 6) || [], [data]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/accessories/for-product/${productId}`, { signal: controller.signal })
      .then((r) => r.json()).then(setData).catch(() => null).finally(() => setLoading(false));
    return () => controller.abort();
  }, [productId]);

  if (loading) {
    return (
      <section className="mt-12 rounded-3xl bg-stone-50 p-6 md:p-8">
        <div className="mb-6 h-8 w-80 animate-pulse rounded bg-stone-200" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </section>
    );
  }

  if (!data || displayed.length === 0) return null;

  return (
    <section className="mt-12 rounded-3xl bg-stone-50 p-6 md:p-8">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-stone-500">Accessoires compatibles</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-stone-950 md:text-4xl">
            Les bons accessoires pour {productName}
          </h2>
          <p className="mt-3 max-w-2xl text-stone-700">
            Troviio sélectionne uniquement des accessoires certifiés, officiels ou fiables.
            Les copies dangereuses sont signalées clairement.
          </p>
        </div>
        <Link href={`/accessoires/pour/${productSlug}`}
          className="inline-flex items-center justify-center rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-black text-stone-950 transition hover:bg-stone-100">
          Voir tous les accessoires →
        </Link>
      </div>

      {(data.dangerousCopyWarnings?.length ?? 0) > 0 && (
        <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <h3 className="text-lg font-black">⚠️ Méfiez-vous des copies</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.dangerousCopyWarnings.map((w) => (
              <span key={w.categorySlug} title={w.warning}
                className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-950 ring-1 ring-amber-200">
                {w.categoryName}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {displayed.map((a) => (
          <AccessoryCard key={a.id} accessory={a} productId={productId} placement="product_page_widget" />
        ))}
      </div>

      {data.accessories.length > 6 && (
        <div className="mt-7 text-center">
          <Link href={`/accessoires/pour/${productSlug}`}
            className="inline-flex items-center justify-center rounded-2xl bg-stone-950 px-6 py-3 text-sm font-black text-white transition hover:bg-stone-800">
            Voir les {data.accessories.length} accessoires compatibles
          </Link>
        </div>
      )}
    </section>
  );
}
