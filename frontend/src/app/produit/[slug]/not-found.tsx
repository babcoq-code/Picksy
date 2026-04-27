import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md text-center bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-3xl font-black">Produit introuvable</h1>
        <p className="mt-4 text-stone-600">
          Ce produit n'existe pas ou a été retiré du catalogue Troviio.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white hover:bg-stone-800 transition"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
