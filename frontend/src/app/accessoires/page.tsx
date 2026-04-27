import { AccessoryCard } from '@/components/accessories/AccessoryCard';
import { AccessoryFilters } from '@/components/accessories/AccessoryFilters';
import { apiFetch } from '@/lib/api';
import { Accessory, AccessoryCategory } from '@/lib/types/accessories';

export const revalidate = 3600;

export default async function AccessoriesPage({
  searchParams,
}: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams;

  const [categories, accessories] = await Promise.all([
    apiFetch<AccessoryCategory[]>('/api/accessories/categories'),
    apiFetch<Accessory[]>(`/api/accessories${categorie ? `?category=${categorie}` : ''}`),
  ]);

  return (
    <main className="min-h-screen bg-stone-50">
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-10">
          <p className="text-sm font-black uppercase tracking-wide text-stone-500">Guides accessoires</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-stone-950 md:text-6xl">
            Accessoires fiables pour prolonger la vie de vos appareils
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
            Batteries, filtres, brosses, sacs ou stations — Troviio sélectionne les accessoires certifiés,
            compatibles et sûrs. Les copies dangereuses sont signalées explicitement.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <AccessoryFilters categories={categories} selectedCategory={categorie} />
          <section>
            <p className="mb-5 text-sm font-bold text-stone-600">
              {accessories.length} accessoire{accessories.length > 1 ? 's' : ''} sélectionné{accessories.length > 1 ? 's' : ''}
            </p>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {accessories.map((a) => (
                <AccessoryCard key={a.id} accessory={a} placement="accessories_index" />
              ))}
            </div>
            {accessories.length === 0 && (
              <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-stone-200">
                <h3 className="text-2xl font-black text-stone-950">Aucun accessoire dans cette catégorie</h3>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
