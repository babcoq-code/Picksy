import { AccessoryCard } from '@/components/accessories/AccessoryCard';
import { AccessoriesChat } from '@/components/accessories/AccessoriesChat';
import { apiFetch } from '@/lib/api';
import { AccessoriesForProductResponse, AccessoryCategory } from '@/lib/types/accessories';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export default async function AccessoriesForProductPage({
  params,
}: { params: Promise<{ 'product-slug': string }> }) {
  const { 'product-slug': productSlug } = await params;

  const data = await apiFetch<AccessoriesForProductResponse>(
    `/api/accessories/for-product/${productSlug}`
  ).catch(() => null);

  if (!data) notFound();

  const groupedByCategory = data.accessories.reduce<Record<string, { categoryName: string; accessories: typeof data.accessories }>>(
    (acc, a) => {
      const key = a.category?.slug || 'autres';
      if (!acc[key]) {
        acc[key] = {
          categoryName: a.category?.name || 'Autres',
          accessories: [],
        };
      }
      acc[key].accessories.push(a);
      return acc;
    },
    {}
  );

  // Top recommendation = first accessory sorted by scoreQuality
  const topRecommendation = [...data.accessories].sort(
    (a, b) => b.scoreQuality - a.scoreQuality
  )[0];

  return (
    <main className="min-h-screen bg-stone-50">
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-black uppercase tracking-wide text-stone-500">
            Accessoires compatibles
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-stone-950 md:text-6xl">
            Les meilleurs accessoires pour {data.product.name}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
            Tous les accessoires compatibles, vérifiés et certifiés. Évitez les copies dangereuses
            grâce à notre sélection rigoureuse.
          </p>
        </div>

        {/* Top recommendation */}
        {topRecommendation && (
          <div className="mb-10">
            <h2 className="mb-6 text-2xl font-black text-stone-950">
              🏆 Recommandation Troviio
            </h2>
            <div className="max-w-md">
              <AccessoryCard
                accessory={topRecommendation}
                productId={data.product.id}
                placement="product_guide_top"
              />
            </div>
          </div>
        )}

        {/* Dangerous copy warnings */}
        {data.dangerousCopyWarnings.length > 0 && (
          <div className="mb-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <h3 className="text-xl font-black">⚠️ Attention aux copies dangereuses</h3>
            <ul className="mt-4 space-y-3">
              {data.dangerousCopyWarnings.map((w) => (
                <li key={w.categorySlug} className="flex items-start gap-3">
                  <span className="mt-1 text-lg">⚠️</span>
                  <div>
                    <p className="font-black">{w.categoryName}</p>
                    <p className="text-sm leading-6">{w.warning}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Grouped by category */}
        {Object.entries(groupedByCategory).map(([slug, group]) => (
          <section key={slug} className="mb-12">
            <h2 className="mb-6 text-2xl font-black text-stone-950">
              {group.categoryName}
              <span className="ml-2 text-base font-bold text-stone-500">
                ({group.accessories.length} accessoire{group.accessories.length > 1 ? 's' : ''})
              </span>
            </h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {group.accessories.map((a) => (
                <AccessoryCard
                  key={a.id}
                  accessory={a}
                  productId={data.product.id}
                  placement="product_guide"
                />
              ))}
            </div>
          </section>
        ))}

        {/* Chat */}
        <AccessoriesChat productId={data.product.id} productName={data.product.name} />
      </section>
    </main>
  );
}
