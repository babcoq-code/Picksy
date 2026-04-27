"use client";

import * as React from "react";

interface WhyThisProductProps {
  product: any;
}

export default function WhyThisProduct({ product }: WhyThisProductProps) {
  // Compute average compatibility percentage from use_case_scores
  const useCaseValues = product.use_case_scores
    ? (Object.values(product.use_case_scores) as number[]).filter(
        (v) => typeof v === "number"
      )
    : [];
  const avgScore =
    useCaseValues.length > 0
      ? Math.round(
          (useCaseValues.reduce((a, b) => a + b, 0) / useCaseValues.length) * 10
        )
      : null;

  // Sort scores descending
  const sortedScores = product.use_case_scores
    ? (Object.entries(product.use_case_scores) as [string, number][])
        .filter(([, v]) => typeof v === "number")
        .sort(([, a], [, b]) => b - a)
    : [];

  const compatibilityColor =
    avgScore != null
      ? avgScore >= 80
        ? "text-mint"
        : avgScore >= 60
        ? "text-blue"
        : avgScore >= 40
        ? "text-yellow-400"
        : "text-coral"
      : "text-muted";

  return (
    <section className="animate-fade-slide-up">
      <div className="relative rounded-2xl overflow-hidden p-[1px]">
        {/* Gradient border */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue via-purple-500 to-mint opacity-60" />
        <div className="relative bg-night rounded-2xl p-6 sm:p-8">
          {/* Header with badge */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold font-display text-white mb-2">
                Pourquoi ce produit ?
              </h2>
              <p className="text-sm text-muted">
                Analyse basée sur tes critères de compatibilité
              </p>
            </div>
            {avgScore != null && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${compatibilityColor}`}
                style={{
                  backgroundColor:
                    avgScore >= 80
                      ? "rgba(62,214,163,0.15)"
                      : avgScore >= 60
                      ? "rgba(66,87,255,0.15)"
                      : avgScore >= 40
                      ? "rgba(255,180,71,0.15)"
                      : "rgba(255,107,95,0.15)",
                }}
              >
                <span className="text-lg">🎯</span>
                {avgScore}% compatible
              </div>
            )}
          </div>

          {/* Why perfect text */}
          {product.why_perfect && (
            <div className="bg-surface/50 rounded-xl p-5 mb-6 border border-white/5">
              <p className="text-sm text-white/80 leading-relaxed">
                {product.why_perfect}
              </p>
            </div>
          )}

          {/* Score bars */}
          {sortedScores.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">
                Scores par usage
              </h3>
              {sortedScores.map(([key, value], index) => {
                const percentage = Math.min(100, Math.max(0, value * 10));
                const barColor =
                  percentage >= 80
                    ? "linear-gradient(135deg, #3ED6A3, #8AF0CC)"
                    : percentage >= 60
                    ? "linear-gradient(135deg, #4257FF, #8C98FF)"
                    : percentage >= 40
                    ? "linear-gradient(135deg, #FFB347, #FFD699)"
                    : "linear-gradient(135deg, #FF6B5F, #FF9A92)";

                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {value.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-surface-light overflow-hidden">
                      <div
                        className="h-full rounded-full animate-bar-grow"
                        style={
                          {
                            "--target-width": `${percentage}%`,
                            width: percentage + "%",
                            background: barColor,
                            animationDelay: `${index * 0.1}s`,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
