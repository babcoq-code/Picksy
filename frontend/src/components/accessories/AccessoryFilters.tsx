'use client';

import { useState } from 'react';
import { AccessoryCategory } from '@/lib/types/accessories';

export function AccessoryFilters({ categories, selectedCategory }: {
  categories: AccessoryCategory[]; selectedCategory?: string;
}) {
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-2">
      <a href="/accessoires"
        className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
          !selectedCategory ? 'bg-stone-950 text-white' : 'bg-white text-stone-800 hover:bg-stone-100'}`}>
        Toutes les catégories
      </a>
      {categories.map((cat) => (
        <a key={cat.id} href={`/accessoires?categorie=${cat.slug}`}
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition ${
            selectedCategory === cat.slug ? 'bg-stone-950 text-white' : 'bg-white text-stone-800 hover:bg-stone-100'}`}>
          <span>{cat.name}</span>
          {typeof cat.count === 'number' && (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{cat.count}</span>
          )}
        </a>
      ))}
    </nav>
  );

  return (
    <>
      <div className="lg:hidden">
        <button type="button" onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-3xl bg-white px-5 py-4 font-black text-stone-950 ring-1 ring-stone-200">
          <span>{selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name : 'Toutes les catégories'}</span>
          <span>{open ? '✕ Fermer' : '☰ Filtrer'}</span>
        </button>
        {open && <div className="mt-3 rounded-3xl bg-stone-100 p-3">{nav}</div>}
      </div>
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-3xl bg-stone-100 p-4">
          <h2 className="mb-4 px-2 text-lg font-black text-stone-950">Catégories</h2>
          {nav}
        </div>
      </aside>
    </>
  );
}
