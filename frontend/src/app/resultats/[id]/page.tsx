import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { RecommendationResult, RecommendationItem } from "@/types/recommendation";
import { ResultClientComponents } from "./result-client";
import ScoreRing from "@/components/ScoreRing";

// ─── Fetch ────────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://picksy.babcoq.tech";
const API_URL = process.env.PICKSY_API_URL ?? APP_URL;

async function getResult(id: string): Promise<RecommendationResult | null> {
  try {
    const res = await fetch(`${API_URL}/api/results/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 600, tags: [`result-${id}`] },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return (await res.json()) as RecommendationResult;
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getResult(id);
  if (!result) return { title: "Recommandation introuvable | Troviio", robots: { index: false, follow: false } };
  const best = result.recommendations.find((r) => r.rank === 1);
  return {
    title: `Meilleures ${result.profile.categorie} pour ton profil | Troviio`,
    description: best
      ? `Troviio recommande ${best.brand} ${best.name} – score ${best.score}/10 pour ton profil.`
      : `Tes recommandations personnalisées Troviio pour ${result.profile.categorie}.`,
    alternates: { canonical: `${APP_URL}/resultats/${result.result_id}` },
    openGraph: {
      title: `Recommandations ${result.profile.categorie} | Troviio`,
      description: result.profile.resume,
      url: `${APP_URL}/resultats/${result.result_id}`,
      type: "website",
      ...(best?.image_url && {
        images: [{ url: best.image_url, alt: `${best.brand} ${best.name}` }],
      }),
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtEur(v: number | null) {
  if (!v) return null;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

function fmtDate(v: string) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d);
}

function podiumOrder(recs: RecommendationItem[]): RecommendationItem[] {
  const sorted = [...recs].sort((a, b) => a.rank - b.rank);
  const [first, second, third] = [
    sorted.find((r) => r.rank === 1),
    sorted.find((r) => r.rank === 2),
    sorted.find((r) => r.rank === 3),
  ];
  return [second, first, third].filter(Boolean) as RecommendationItem[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result || result.recommendations.length === 0) notFound();

  const sorted = [...result.recommendations].sort((a, b) => a.rank - b.rank);
  const podium = podiumOrder(result.recommendations);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF7ED] via-white to-[#FFF7ED] text-[#0E1020]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/90 p-6 shadow-[0_32px_80px_rgba(14,16,32,0.10)] backdrop-blur-xl sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF6B5F] via-[#4257FF] to-[#3ED6A3]" />

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FF6B5F]/20 bg-[#FF6B5F]/10 px-3 py-1.5 text-sm font-semibold text-[#FF6B5F]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF6B5F]" />
                Résultat personnalisé par IA
              </span>

              <h1 className="mt-5 font-sora text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Voici tes recommandations<br />
                <span className="text-[#FF6B5F]">Troviio</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Pour ta recherche en{" "}
                <strong className="text-[#0E1020]">{result.profile.categorie}</strong>,
                Troviio a analysé des dizaines de produits et pondéré les scores selon tes critères.
              </p>

              {result.profile.resume && (
                <blockquote className="mt-4 rounded-2xl border-l-4 border-[#4257FF] bg-[#4257FF]/5 px-4 py-3 text-sm italic leading-7 text-slate-600">
                  &ldquo;{result.profile.resume}&rdquo;
                </blockquote>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {result.profile.criteres.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-[#4257FF]/10 px-3 py-1.5 text-sm font-semibold text-[#4257FF]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl bg-[#0E1020] p-5 text-white shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Budget max</p>
              <p className="mt-2 font-sora text-4xl font-bold tracking-tight">
                {fmtEur(result.profile.budget_max) ?? `${result.profile.budget_max}€`}
              </p>
              <div className="mt-4 h-px bg-white/10" />
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-white/50">Générée le</dt>
                  <dd className="mt-0.5 text-white/90">{fmtDate(result.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-white/50">ID de ta reco</dt>
                  <dd className="mt-0.5 font-mono text-xs text-white/70">{result.result_id}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        {/* ── PODIUM ── */}
        <section className="mt-12" aria-labelledby="podium-title">
          <div className="mb-8 text-center">
            <p className="font-sora text-sm font-semibold uppercase tracking-[0.2em] text-[#3ED6A3]">
              Podium Troviio
            </p>
            <h2 id="podium-title" className="mt-2 font-sora text-3xl font-bold tracking-tight sm:text-4xl">
              Les 3 meilleurs choix pour ton profil
            </h2>
          </div>

          <div className="grid items-end gap-4 md:grid-cols-3">
            {podium.map((reco, i) => {
              const isFirst = reco.rank === 1;
              const medal = reco.rank === 1 ? "🥇" : reco.rank === 2 ? "🥈" : "🥉";
              const topColor =
                reco.rank === 1 ? "bg-[#FF6B5F]" : reco.rank === 2 ? "bg-[#3ED6A3]" : "bg-[#4257FF]";
              const delay = ["0ms", "150ms", "300ms"][i];
              const affiliateUrl = reco.affiliate_url
                ? (() => {
                    try {
                      const u = new URL(reco.affiliate_url);
                      u.searchParams.set("tag", "picksy-21");
                      return u.toString();
                    } catch {
                      return reco.affiliate_url;
                    }
                  })()
                : reco.amazon_asin
                ? `https://www.amazon.fr/dp/${reco.amazon_asin}?tag=picksy-21`
                : null;

              return (
                <article
                  key={`${reco.rank}-${reco.name}`}
                  className={[
                    "group relative flex flex-col overflow-hidden rounded-[2rem] border bg-white shadow-[0_20px_60px_rgba(14,16,32,0.10)] animate-slide-up",
                    isFirst
                      ? "border-[#FF6B5F]/30 md:min-h-[520px] md:scale-[1.04] md:shadow-[0_32px_80px_rgba(255,107,95,0.18)]"
                      : "border-slate-200 md:min-h-[460px]",
                  ].join(" ")}
                  style={{ animationDelay: delay, animationFillMode: "both" }}
                >
                  <div className={`h-1.5 w-full ${topColor}`} />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-3xl">{medal}</span>
                        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          #{reco.rank}
                        </p>
                        <h3 className="mt-1 font-sora text-lg font-bold leading-snug tracking-tight">
                          {reco.rank_label}
                        </h3>
                      </div>
                      <ScoreRing score={reco.score} size={isFirst ? 84 : 72} />
                    </div>

                    <div className="mt-4 flex flex-1 items-center justify-center rounded-2xl bg-slate-50 p-4">
                      {reco.image_url ? (
                        <img
                          src={reco.image_url}
                          alt={`${reco.brand} ${reco.name}`}
                          className="max-h-44 w-full object-contain transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
                          Image bientôt disponible
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-500">{reco.brand}</p>
                      <h4 className="mt-1 font-sora text-xl font-bold tracking-tight">{reco.name}</h4>
                      <p className="mt-1 font-sora text-2xl font-bold text-[#0E1020]">
                        {fmtEur(reco.price_eur) ?? reco.price_range}
                      </p>
                    </div>

                    <div className="mt-4">
                      {affiliateUrl ? (
                        <a
                          href={affiliateUrl}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className={[
                            "inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4",
                            isFirst
                              ? "bg-[#FF6B5F] shadow-[#FF6B5F]/30 hover:bg-[#e55a4d] focus:ring-[#FF6B5F]/25"
                              : "bg-[#0E1020] shadow-black/20 hover:bg-slate-800 focus:ring-slate-500/25",
                          ].join(" ")}
                          aria-label={`Voir le prix de ${reco.brand} ${reco.name} sur Amazon`}
                        >
                          Voir le prix sur Amazon
                        </a>
                      ) : (
                        <button
                          disabled
                          className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500"
                        >
                          Lien bientôt disponible
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── FICHES DÉTAILLÉES ── */}
        <section className="mt-16" aria-labelledby="detail-title">
          <p className="font-sora text-sm font-semibold uppercase tracking-[0.2em] text-[#4257FF]">
            Analyse complète
          </p>
          <h2 id="detail-title" className="mt-2 font-sora text-3xl font-bold tracking-tight sm:text-4xl">
            Le détail de chaque recommandation
          </h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {sorted.map((reco) => {
              const affiliateUrl = reco.affiliate_url
                ? (() => {
                    try {
                      const u = new URL(reco.affiliate_url);
                      u.searchParams.set("tag", "picksy-21");
                      return u.toString();
                    } catch {
                      return reco.affiliate_url;
                    }
                  })()
                : reco.amazon_asin
                ? `https://www.amazon.fr/dp/${reco.amazon_asin}?tag=picksy-21`
                : null;

              const specEntries = Object.entries(reco.specs ?? {}).slice(0, 6);

              return (
                <article
                  key={`detail-${reco.rank}-${reco.name}`}
                  className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_54px_rgba(14,16,32,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-600">
                        #{reco.rank} · {reco.rank_label}
                      </span>
                      <p className="mt-4 text-sm font-semibold text-slate-500">{reco.brand}</p>
                      <h3 className="mt-1 font-sora text-2xl font-bold tracking-tight">{reco.name}</h3>
                    </div>
                    <ScoreRing score={reco.score} size={76} />
                  </div>

                  {/* Pourquoi c'est parfait pour toi */}
                  <div className="mt-4 rounded-2xl border border-[#3ED6A3]/20 bg-[#3ED6A3]/8 p-4">
                    <p className="font-sora text-xs font-bold uppercase tracking-widest text-[#3ED6A3]">
                      Pourquoi c'est adapté pour toi
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{reco.why_perfect}</p>
                  </div>

                  {/* Pros / Cons */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-sora text-xs font-bold text-slate-500 uppercase tracking-wider">Points forts</p>
                      <ul className="mt-2 space-y-2">
                        {reco.pros.map((p) => (
                          <li key={p} className="flex gap-2 text-sm leading-6 text-slate-700">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#3ED6A3]" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-sora text-xs font-bold text-slate-500 uppercase tracking-wider">À savoir</p>
                      <ul className="mt-2 space-y-2">
                        {reco.cons.map((c) => (
                          <li key={c} className="flex gap-2 text-sm leading-6 text-slate-700">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#FF6B5F]" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Specs */}
                  {specEntries.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="font-sora text-xs font-bold uppercase tracking-wider text-slate-500">
                        Spécifications clés
                      </p>
                      <dl className="mt-3 space-y-2">
                        {specEntries.map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-4 text-sm">
                            <dt className="capitalize text-slate-500">{k.replace(/_/g, " ")}</dt>
                            <dd className="font-semibold text-slate-700">
                              {typeof v === "string" || typeof v === "number" ? String(v) : JSON.stringify(v)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  <div className="mt-auto pt-5">
                    <p className="mb-2 font-sora text-xl font-bold">
                      {fmtEur(reco.price_eur) ?? reco.price_range}
                    </p>
                    {affiliateUrl ? (
                      <a
                        href={affiliateUrl}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B5F] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,107,95,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e55a4d] focus:outline-none focus:ring-4 focus:ring-[#FF6B5F]/25"
                        aria-label={`Voir le prix de ${reco.brand} ${reco.name} sur Amazon`}
                      >
                        Voir le prix sur Amazon
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500"
                      >
                        Lien bientôt disponible
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── CLASSEMENT PAR USAGE ── */}
        <UsageComparisonSection recommendations={sorted} />

        {/* ── POURQUOI PICKSY A CHOISI ÇA ── */}
        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(14,16,32,0.08)] sm:p-8">
          <p className="font-sora text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B5F]">
            Logique de recommandation
          </p>
          <h2 className="mt-2 font-sora text-2xl font-bold tracking-tight sm:text-3xl">
            Pourquoi Troviio a choisi ça pour toi
          </h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Tes critères prioritaires</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.profile.criteres.map((c) => (
                  <span key={c} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold shadow-sm text-slate-700">
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">Budget maximum</p>
              <p className="mt-1 font-sora text-2xl font-bold">
                {fmtEur(result.profile.budget_max) ?? `${result.profile.budget_max}€`}
              </p>
            </div>

            <div className="text-sm leading-8 text-slate-700">
              <p>
                Troviio a filtré les produits compatibles avec ton budget, puis a pondéré les scores
                selon les critères que tu as indiqués pendant le chat. Les produits retenus maximisent
                l'équilibre entre performance réelle, adéquation à tes usages et valeur pour le prix.
              </p>
              <p className="mt-4">
                En cas d'égalité, Troviio privilégie <strong>la fiabilité des avis utilisateurs</strong> et
                la qualité des données disponibles sur chaque modèle. Les produits avec des données
                insuffisantes sont automatiquement écartés.
              </p>
              <p className="mt-4 rounded-xl border border-[#4257FF]/20 bg-[#4257FF]/5 px-4 py-3 text-xs text-slate-600">
                ⚡ <strong>EU AI Act — Article 50.</strong> Cette recommandation a été générée par un système d'IA.
                Les prix et disponibilités peuvent varier. Vérifiez les informations sur Amazon avant achat.
              </p>
            </div>
          </div>
        </section>

        {/* ── ACTION PANEL ── */}
        <ResultClientComponents resultId={result.result_id} />

        {/* ── FOOTER DISCLOSURE ── */}
        <footer className="mt-10 pb-6 text-center text-xs leading-7 text-slate-500">
          <p>
            Troviio participe au Programme Partenaires d'Amazon EU. En tant que Partenaire Amazon, Troviio réalise
            un bénéfice sur les achats remplissant les conditions requises. Les liens de cette page peuvent être
            des liens d'affiliation. Cela ne vous coûte rien de plus et nous permet de rester gratuit.
          </p>
        </footer>

      </div>
    </main>
  );
}

// ─── Composant Serveur : Tableau des usages ───────────────────────────────────

function UsageComparisonSection({ recommendations }: { recommendations: RecommendationItem[] }) {
  const allUseCases = Array.from(
    new Set(recommendations.flatMap((r) => Object.keys(r.use_case_scores ?? {})))
  );

  if (allUseCases.length === 0) return null;

  return (
    <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(14,16,32,0.08)] sm:p-8">
      <p className="font-sora text-sm font-semibold uppercase tracking-[0.2em] text-[#4257FF]">
        Classement par usage
      </p>
      <h2 className="mt-2 font-sora text-2xl font-bold tracking-tight sm:text-3xl">
        Compare les scores selon tes usages
      </h2>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-1 text-left">
          <thead>
            <tr>
              <th className="rounded-l-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">Usage</th>
              {recommendations.map((r) => (
                <th key={r.rank} className="bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 last:rounded-r-xl">
                  #{r.rank} {r.brand}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allUseCases.map((useCase) => {
              const scores = recommendations.map((r) => {
                const s: unknown = r.use_case_scores?.[useCase] ?? 0;
                if (typeof s === "string") {
                  const m = s.match(/([\d.]+)\/([\d.]+)/);
                  return m ? (parseFloat(m[1]) / parseFloat(m[2])) * 10 : parseFloat(s) || 0;
                }
                return typeof s === "number" ? s : 0;
              });
              const maxScore = Math.max(...scores, 0.001);

              return (
                <tr key={useCase}>
                  <td className="bg-white px-4 py-3 text-sm font-bold capitalize text-[#0E1020]">
                    {useCase.replace(/_/g, " ")}
                  </td>
                  {recommendations.map((r) => {
                    const score = r.use_case_scores?.[useCase] ?? 0;
                    const numericScore = typeof score === "string"
                      ? (() => {
                          const m = (score as string).match(/([\d.]+)\/([\d.]+)/);
                          return m ? (parseFloat(m[1]) / parseFloat(m[2])) * 10 : parseFloat(score) || 0;
                        })()
                      : (typeof score === "number" ? score : 0);
                    const pct = (numericScore / 10) * 100;
                    const isBest = numericScore === maxScore && numericScore > 0;

                    return (
                      <td key={r.rank} className="border-t border-slate-100 bg-white px-4 py-3">
                        <div className="flex min-w-36 items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${isBest ? "bg-gradient-to-r from-[#3ED6A3] to-[#4257FF]" : "bg-slate-300"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`w-9 text-right font-sora text-sm font-bold ${isBest ? "text-[#3ED6A3]" : "text-slate-500"}`}>
                            {numericScore.toFixed(1)}
                            {isBest && " 🏆"}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-6 text-slate-500">
        Scores sur 10. 🏆 = meilleur score dans cet usage parmi les 3 recommandations.
      </p>
    </section>
  );
}
