// src/components/home/CategoryGrid.tsx
"use client";

import { useMemo, useState } from "react";
import {
  CHAT_CATEGORIES,
  type ChatCategorySlug,
} from "@/app/constants/chat-categories";

// ── Types ──────────────────────────────────────────────────────────────────────

type Family = "home" | "tech" | "mobility" | "comfort";

const FAMILY_META: Record<
  Family,
  { label: string; color: string; bg: string }
> = {
  home:     { label: "Maison",   color: "#FF6B5F", bg: "rgba(255,107,95,0.14)" },
  tech:     { label: "Tech",     color: "#4257FF", bg: "rgba(66,87,255,0.14)" },
  mobility: { label: "Mobilité", color: "#3ED6A3", bg: "rgba(62,214,163,0.14)" },
  comfort:  { label: "Confort",  color: "#9B7FD4", bg: "rgba(155,127,212,0.14)" },
};

// Map slug → family (maintenu en parallèle de CHAT_CATEGORIES)
const SLUG_FAMILY: Record<string, Family> = {
  "robot-aspirateur":       "home",
  "aspirateur-balai":       "home",
  "lave-linge":             "home",
  "lave-vaisselle":         "home",
  "refrigerateur":          "home",
  "purificateur-air":       "home",
  "friteuse-air":           "home",
  "machine-cafe":           "home",
  "robot-cuisine":          "home",
  "cave-a-vin":             "home",
  "four-encastrable":       "home",
  "climatiseur-mobile":     "home",
  "serrure-connectee":      "home",
  "tv-oled":                "tech",
  "casque-audio":           "tech",
  "barre-son":              "tech",
  "smartphone":             "tech",
  "ordinateur-etudiant":    "tech",
  "imprimante":             "tech",
  "camera-securite":        "tech",
  "thermostat-connecte":    "tech",
  "montre-connectee":       "tech",
  "tablette-tactile":       "tech",
  "videoprojecteur":        "tech",
  "ecran-pc":               "tech",
  "station-electrique":     "tech",
  "appareil-photo-hybride": "tech",
  "trottinette-electrique": "mobility",
  "velo-electrique":        "mobility",
  "matelas":                "comfort",
  "poussette":              "comfort",
  "tapis-de-course":        "comfort",
};

const TABS = [
  { key: "all"      as const, label: "Tout" },
  { key: "home"     as const, label: "🏠 Maison" },
  { key: "tech"     as const, label: "📱 Tech" },
  { key: "mobility" as const, label: "🛴 Mobilité" },
  { key: "comfort"  as const, label: "🛏️ Confort" },
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  onSelect: (slug: ChatCategorySlug) => void;
  selectedSlug?: string | null;
}

// ── Composant ──────────────────────────────────────────────────────────────────

export default function CategoryGrid({ onSelect, selectedSlug }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | Family>("all");

  const filtered = useMemo(
    () =>
      activeTab === "all"
        ? CHAT_CATEGORIES
        : CHAT_CATEGORIES.filter((c) => SLUG_FAMILY[c.slug] === activeTab),
    [activeTab]
  );

  return (
    <div className="relative">

      {/* ── HEADER ── */}
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        {/* Badge compteur */}
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-white/70"
          style={{
            borderColor: "rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          ✨ {CHAT_CATEGORIES.length} catégories couvertes
        </span>

        <h2
          className="text-xl font-bold text-white sm:text-2xl"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Troviio sait tout choisir.{" "}
          <span className="text-white/50">
            Même ce à quoi tu n'avais pas pensé.
          </span>
        </h2>

        <p className="text-sm text-white/40">
          Clique sur une catégorie — l'IA démarre la conversation.
        </p>
      </div>

      {/* ── TABS FILTRES ── */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const meta =
            tab.key !== "all"
              ? FAMILY_META[tab.key]
              : { color: "#FF6B5F", bg: "rgba(255,107,95,0.14)" };

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#3ED6A3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1020]"
              style={{
                color: isActive ? meta.color : "rgba(255,255,255,0.45)",
                background: isActive ? meta.bg : "transparent",
                border: `1px solid ${isActive ? meta.color + "40" : "rgba(255,255,255,0.10)"}`,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── GRID ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((cat, i) => {
          const family = SLUG_FAMILY[cat.slug] ?? "tech";
          const meta = FAMILY_META[family];
          const isSelected = selectedSlug === cat.slug;

          return (
            <button
              key={cat.slug}
              onClick={() => onSelect(cat.slug as ChatCategorySlug)}
              className="group relative flex min-h-[140px] flex-col overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3ED6A3] sm:min-h-[160px] sm:p-5"
              style={{
                background: isSelected ? meta.bg : "rgba(255,255,255,0.03)",
                borderColor: isSelected
                  ? meta.color + "80"
                  : "rgba(255,255,255,0.08)",
                boxShadow: isSelected
                  ? `0 8px 32px ${meta.color}30`
                  : "none",
                animation: `fade-slide-up 0.35s ease-out ${i * 0.03}s both`,
              }}
              onMouseEnter={(e) => {
                if (isSelected) return;
                e.currentTarget.style.borderColor = meta.color + "60";
                e.currentTarget.style.boxShadow = `0 12px 32px ${meta.color}20`;
                e.currentTarget.style.background = meta.bg + "80";
              }}
              onMouseLeave={(e) => {
                if (isSelected) return;
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            >
              {/* Badge famille */}
              <span
                className="mb-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: meta.bg, color: meta.color }}
              >
                {meta.label}
              </span>

              {/* Emoji */}
              <span className="mb-1 text-2xl leading-none">{cat.emoji}</span>

              {/* Nom */}
              <span className="text-sm font-bold leading-tight text-white">
                {cat.label}
              </span>

              {/* Subtext */}
              {cat.subtext && (
                <span className="mt-1 line-clamp-2 text-[11px] text-white/40">
                  {cat.subtext}
                </span>
              )}

              {/* Indicateur sélection */}
              {isSelected && (
                <span
                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: meta.color }}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
