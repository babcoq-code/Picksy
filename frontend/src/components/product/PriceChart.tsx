"use client";
import {
  CategoryScale, Chart as ChartJS, Filler, Legend,
  LinearScale, LineElement, PointElement, Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend, Filler
);

const COLORS = [
  "#166534","#92400e","#7f1d1d",
  "#44403c","#854d0e","#065f46","#581c87",
];

type Point = { merchantName: string; priceEur: number; scrapedAt: string };

function weekKey(d: string): string {
  const date = new Date(d);
  const day = date.getDay();
  const mon = new Date(date);
  mon.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  mon.setHours(0, 0, 0, 0);
  return mon.toISOString();
}

const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(s));

const fmtPrice = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);

export function PriceChart({ data }: { data: Point[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-stone-300 text-sm text-stone-500">
        L'historique sera disponible après les premières semaines de suivi des prix.
      </div>
    );
  }

  const merchants = [...new Set(data.map((p) => p.merchantName))].sort();
  const weeks = [...new Set(data.map((p) => weekKey(p.scrapedAt)))].sort();

  const latest = new Map<string, Point>();
  for (const p of data) {
    const k = `${p.merchantName}__${weekKey(p.scrapedAt)}`;
    const ex = latest.get(k);
    if (!ex || new Date(p.scrapedAt) > new Date(ex.scrapedAt)) {
      latest.set(k, p);
    }
  }

  return (
    <div className="h-72 w-full">
      <Line
        data={{
          labels: weeks.map(fmtDate),
          datasets: merchants.map((m, i) => ({
            label: m,
            data: weeks.map((w) => latest.get(`${m}__${w}`)?.priceEur ?? null),
            borderColor: COLORS[i % COLORS.length],
            backgroundColor: `${COLORS[i % COLORS.length]}22`,
            borderWidth: 2,
            tension: 0.3,
            spanGaps: true,
            pointRadius: 3,
            pointHoverRadius: 5,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "nearest", intersect: false },
          plugins: {
            legend: {
              position: "bottom",
              labels: { boxWidth: 10, font: { size: 11 } },
            },
            tooltip: {
              backgroundColor: "#1c1917",
              titleColor: "#fafaf9",
              bodyColor: "#fafaf9",
              padding: 12,
              callbacks: {
                title: (items) =>
                  items[0] ? fmtDate(weeks[items[0].dataIndex ?? ""]) : "",
                label: (ctx) =>
                  `${ctx.dataset.label}: ${ctx.parsed.y !== null ? fmtPrice(ctx.parsed.y) : "N/D"}`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: "#e7e5e4" },
              ticks: { color: "#78716c", font: { size: 11 } },
              border: { display: false },
            },
            y: {
              grid: { color: "#e7e5e4" },
              ticks: { color: "#78716c", callback: (v) => `${v} €` },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  );
}
