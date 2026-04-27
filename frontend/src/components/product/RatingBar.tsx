export function RatingBar({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(10, value));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-stone-800">{label}</p>
        <p className="text-sm font-black">
          {v.toFixed(1)}
          <span className="text-stone-400 font-normal">/10</span>
        </p>
      </div>
      <div
        className="h-3 rounded-full bg-stone-200 overflow-hidden"
        role="meter"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600"
          style={{ width: `${v * 10}%` }}
        />
      </div>
    </div>
  );
}
