"use client";

import * as React from "react";

interface ProductTestSectionProps {
  product: any;
}

// ─── Rating Criteria ────────────────────────────────────────

interface Criterion {
  key: string;
  label: string;
}

const CRITERIA: Criterion[] = [
  { key: "design", label: "Design" },
  { key: "ease_of_use", label: "Prise en main" },
  { key: "performance", label: "Performance" },
  { key: "value_for_money", label: "Rapport qualité/prix" },
  { key: "customer_service", label: "Service client" },
];

function getScoreColor(score: number): string {
  if (score >= 8) return "#3ED6A3";
  if (score >= 6) return "#4257FF";
  if (score >= 4) return "#FFB347";
  return "#FF6B5F";
}

function getScoreLabel(score: number): string {
  if (score >= 9) return "Excellent";
  if (score >= 8) return "Très bien";
  if (score >= 7) return "Bien";
  if (score >= 6) return "Correct";
  if (score >= 5) return "Passable";
  return "Moyen";
}

// ─── Product Test Section ───────────────────────────────────

export default function ProductTestSection({ product }: ProductTestSectionProps) {
  // Check if we have test data
  const hasTestSummary = !!product.test_summary;
  const hasCriteria = CRITERIA.some(
    (c) =>
      product[c.key] != null && typeof product[c.key] === "number"
  );
  const hasPros = product.pros?.length > 0;
  const hasCons = product.cons?.length > 0;
  const hasVerdict = !!product.verdict;

  // If no test data at all, show a minimal fallback
  if (!hasTestSummary && !hasCriteria && !hasPros && !hasCons && !hasVerdict) {
    return (
      <section className="animate-fade-slide-up">
        <h2 className="text-xl font-bold font-display text-white mb-6">
          Test & Avis
        </h2>
        <div className="bg-surface rounded-2xl border border-white/5 p-8 text-center">
          <p className="text-muted text-sm">
            Aucun test détaillé disponible pour ce produit.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-slide-up">
      <h2 className="text-xl font-bold font-display text-white mb-6">
        Test & Avis
      </h2>

      <div className="bg-surface rounded-2xl border border-white/5 p-6 sm:p-8 space-y-8">
        {/* Rating criteria bars */}
        {hasCriteria && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">
              Notes détaillées
            </h3>
            <div className="space-y-4">
              {CRITERIA.map((criterion, index) => {
                const score = product[criterion.key];
                if (score == null || typeof score !== "number") return null;

                const percentage = Math.min(100, score * 10);
                const color = getScoreColor(score);
                const label = getScoreLabel(score);

                return (
                  <div key={criterion.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">
                        {criterion.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: color + "20",
                            color: color,
                          }}
                        >
                          {label}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-surface-light overflow-hidden">
                      <div
                        className="h-full rounded-full animate-bar-grow"
                        style={
                          {
                            "--target-width": `${percentage}%`,
                            width: percentage + "%",
                            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                            animationDelay: `${index * 0.1}s`,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Test summary */}
        {hasTestSummary && (
          <div>
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-3">
              Résumé du test
            </h3>
            <div className="space-y-3">
              {(Array.isArray(product.test_summary)
                ? product.test_summary
                : [product.test_summary]
              ).map((paragraph: string, i: number) => (
                <p
                  key={i}
                  className="text-sm text-white/80 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Pros / Cons grid */}
        {(hasPros || hasCons) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hasPros && (
              <div className="bg-mint/5 rounded-xl border border-mint/15 p-5">
                <h3 className="text-sm font-bold text-mint uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>+</span> Points forts
                </h3>
                <ul className="space-y-2.5">
                  {product.pros.map((pro: string, i: number) => (
                    <li
                      key={i}
                      className="text-sm text-white/80 flex gap-2.5"
                    >
                      <span className="text-mint shrink-0 mt-0.5">●</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasCons && (
              <div className="bg-coral/5 rounded-xl border border-coral/15 p-5">
                <h3 className="text-sm font-bold text-coral uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>−</span> Points faibles
                </h3>
                <ul className="space-y-2.5">
                  {product.cons.map((con: string, i: number) => (
                    <li
                      key={i}
                      className="text-sm text-white/80 flex gap-2.5"
                    >
                      <span className="text-coral shrink-0 mt-0.5">●</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Verdict */}
        {hasVerdict && (
          <div className="relative">
            <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-blue to-mint" />
            <div className="pl-6">
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">
                Verdict
              </h3>
              <blockquote className="text-base text-white/90 font-medium leading-relaxed font-display">
                &ldquo;{product.verdict}&rdquo;
              </blockquote>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
