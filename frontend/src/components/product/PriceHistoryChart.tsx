"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  CartesianGrid,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────

interface PricePoint {
  date: string;
  price: number;
  platform: string;
}

type Period = 7 | 30 | 90;

// ─── Helpers ────────────────────────────────────────────────

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

function formatChartDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

function formatTooltipDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function filterByPeriod(data: PricePoint[], period: Period): PricePoint[] {
  const now = Date.now();
  const cutoff = now - period * 24 * 60 * 60 * 1000;
  return data.filter((p) => new Date(p.date).getTime() >= cutoff);
}

// ─── Custom Tooltip ─────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PricePoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="bg-surface border border-white/10 rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="text-xs text-muted mb-1">
        {formatTooltipDate(entry.date)}
      </p>
      <p className="text-sm font-bold text-white">
        {priceFormatter.format(entry.price)}
      </p>
      <p className="text-xs text-muted">{entry.platform}</p>
    </div>
  );
}

// ─── Chart Skeleton ─────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-white/5 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 bg-surface-light rounded w-32" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-surface-light rounded-lg w-12" />
          ))}
        </div>
      </div>
      <div className="h-64 bg-surface-light rounded-xl" />
    </div>
  );
}

// ─── Price History Chart ────────────────────────────────────

interface PriceHistoryChartProps {
  slug: string;
}

export default function PriceHistoryChart({ slug }: PriceHistoryChartProps) {
  const [data, setData] = React.useState<PricePoint[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [period, setPeriod] = React.useState<Period>(30);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/products/${slug}/prices`);
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}`);
        }
        const json = await res.json();
        // Backend returns { prices: [...], price_history: [...] }
        // price_history items: { price, recorded_at, platform }
        const raw = (json.price_history ?? json) as any[];
        const data: PricePoint[] = raw.map((p: any) => ({
          date: p.recorded_at || p.date || "",
          price: p.price || p.price_eur || 0,
          platform: p.platform || "",
        }));
        if (!cancelled) {
          setData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger l'historique"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Loading
  if (loading) return <ChartSkeleton />;

  // Error
  if (error) {
    return (
      <div className="rounded-2xl border border-coral/30 bg-coral/5 p-6 text-center">
        <p className="text-coral font-medium mb-1">Erreur de chargement</p>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }

  // Empty
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface p-8 text-center">
        <p className="text-muted text-sm">
          Aucun historique de prix disponible.
        </p>
      </div>
    );
  }

  const filtered = filterByPeriod(data, period);
  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface p-8 text-center">
        <p className="text-muted text-sm">
          Aucune donnée pour la période sélectionnée.
        </p>
      </div>
    );
  }

  // Compute stats
  const prices = filtered.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minEntry = filtered.find((p) => p.price === minPrice);
  const maxEntry = filtered.find((p) => p.price === maxPrice);

  const periods: { label: string; value: Period }[] = [
    { label: "7j", value: 7 },
    { label: "30j", value: 30 },
    { label: "90j", value: 90 },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-white/5 p-6">
      {/* Header with controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Period selector */}
          <div className="flex bg-surface-light rounded-lg p-0.5">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  period === p.value
                    ? "bg-blue text-white shadow-sm"
                    : "text-muted hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Min / Max stats */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mint" />
              <span className="text-muted">
                Min {priceFormatter.format(minPrice)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-coral" />
              <span className="text-muted">
                Max {priceFormatter.format(maxPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filtered}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3ED6A3" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3ED6A3" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatChartDate}
              tick={{ fontSize: 11, fill: "#8B8FA3" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: number) => `${Math.round(v)}€`}
              tick={{ fontSize: 11, fill: "#8B8FA3" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3ED6A3"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#3ED6A3", stroke: "#0E1020", strokeWidth: 2 }}
            />
            {/* Min reference dot */}
            {minEntry && (
              <ReferenceDot
                x={minEntry.date}
                y={minEntry.price}
                r={5}
                fill="#3ED6A3"
                stroke="#0E1020"
                strokeWidth={2}
              />
            )}
            {/* Max reference dot */}
            {maxEntry && (
              <ReferenceDot
                x={maxEntry.date}
                y={maxEntry.price}
                r={5}
                fill="#FF6B5F"
                stroke="#0E1020"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
