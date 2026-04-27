function Skel({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-stone-200 ${className}`} />;
}
export default function Loading() {
  return (
    <main className="min-h-screen bg-stone-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            <Skel className="h-5 w-48" />
            <Skel className="h-10 w-3/4" />
            <Skel className="h-24 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skel className="h-28" />
              <Skel className="h-28" />
              <Skel className="h-28" />
            </div>
          </div>
          <Skel className="h-96 rounded-3xl" />
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        <Skel className="h-40 w-full" />
        <Skel className="h-64 w-full" />
        <Skel className="h-96 w-full" />
      </div>
    </main>
  );
}
