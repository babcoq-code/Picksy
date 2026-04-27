const clr = (s: number) =>
  s >= 8.5
    ? "border-emerald-200 bg-emerald-50"
    : s >= 7
    ? "border-lime-200 bg-lime-50"
    : s >= 5.5
    ? "border-amber-200 bg-amber-50"
    : "border-rose-200 bg-rose-50";

const lbl = (k: string) =>
  k
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function UseCaseScores({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(scores).sort(([, a], [, b]) => b - a);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map(([k, v]) => {
        const s = Math.max(0, Math.min(10, v));
        return (
          <div key={k} className={`rounded-3xl border p-5 ${clr(s)}`}>
            <p className="text-sm font-bold opacity-75">{lbl(k)}</p>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-3xl font-black">{s.toFixed(1)}</span>
              <span className="mb-1 text-sm opacity-60">/10</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-current"
                style={{ width: `${s * 10}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
