// src/components/home/CategoryGrid.tsx
"use client";

import { CHAT_CATEGORIES, type ChatCategorySlug } from "@/app/constants/chat-categories";

interface CategoryGridProps {
  onSelect: (slug: ChatCategorySlug) => void;
  selectedSlug?: string | null;
}

const CARD_BG = "rgba(255,255,255,0.06)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_SECONDARY = "rgba(255,255,255,0.5)";
const TEXT_LABEL = "#FFFFFF";

export default function CategoryGrid({ onSelect, selectedSlug }: CategoryGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <p
        className="text-center text-xs font-semibold mb-4 uppercase tracking-widest"
        style={{
          fontFamily: "'Inter', sans-serif",
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.15em",
        }}
      >
        Choisis une catégorie pour commencer
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {CHAT_CATEGORIES.map((cat, i) => {
          const isSelected = selectedSlug === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelect(cat.slug)}
              className="group flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition-all duration-200 hover:-translate-y-0.5"
              style={{
                animationDelay: `${i * 35}ms`,
                background: isSelected ? `${cat.color}25` : CARD_BG,
                border: isSelected
                  ? `1.5px solid ${cat.color}`
                  : `1.5px solid ${CARD_BORDER}`,
                boxShadow: isSelected
                  ? `0 4px 12px ${cat.color}20`
                  : "none",
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                if (isSelected) return;
                e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                e.currentTarget.style.borderColor = `${cat.color}50`;
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.2)`;
              }}
              onMouseLeave={(e) => {
                if (isSelected) return;
                e.currentTarget.style.background = CARD_BG;
                e.currentTarget.style.borderColor = CARD_BORDER;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                {cat.emoji}
              </span>
              <span
                className="text-xs font-semibold leading-snug"
                style={{ fontFamily: "'Sora', sans-serif", color: isSelected ? cat.color : TEXT_LABEL }}
              >
                {cat.label}
              </span>
              {cat.subtext && (
                <span
                  className="text-[10px] leading-tight line-clamp-2"
                  style={{ fontFamily: "'Inter', sans-serif", color: TEXT_SECONDARY }}
                >
                  {cat.subtext}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
