<<<<<<< HEAD
"use client";

import { useMemo, useRef, useState } from "react";
import { useCountUp } from "@/hooks/useCountUp";

// ── Types ──────────────────────────────────────────────────────────────────────

type Family = "home" | "tech" | "mobility" | "comfort";

type Category = {
  slug: string;
  label: string;
  emoji: string;
  family: Family;
  hook: string;
};

type Props = {
  onSelect: (slug: string, label: string) => void;
};

// ── Données ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: "robot-aspirateur",   label: "Robot aspirateur",   emoji: "🤖", family: "home" as Family, hook: "Sol, animaux, patience" },
  { slug: "aspirateur-balai",   label: "Aspirateur balai",   emoji: "🧹", family: "home" as Family, hook: "Léger, puissant, sans fil" },
  { slug: "lave-linge",         label: "Lave-linge",         emoji: "🌀", family: "home" as Family, hook: "Capacité, bruit, conso" },
  { slug: "lave-vaisselle",     label: "Lave-vaisselle",     emoji: "🍽️", family: "home" as Family, hook: "Taille, silencieux, eco" },
  { slug: "refrigerateur",      label: "Réfrigérateur",      emoji: "🧊", family: "home" as Family, hook: "Volume, No Frost, portes" },
  { slug: "purificateur-air",   label: "Purificateur d'air", emoji: "💨", family: "home" as Family, hook: "Allergies, surface, bruit" },
  { slug: "friteuse-air",       label: "Friteuse à air",     emoji: "🍟", family: "home" as Family, hook: "Capacité, rapidité, nettoie" },
  { slug: "machine-cafe",       label: "Machine à café",     emoji: "☕", family: "home" as Family, hook: "Grains, capsules, silence" },
  { slug: "robot-cuisine",      label: "Robot cuisine",      emoji: "🍳", family: "home" as Family, hook: "Pâtisserie, cuisson, polyv." },
  { slug: "cave-a-vin",         label: "Cave à vin",         emoji: "🍷", family: "home" as Family, hook: "Capacité, température, style" },
  { slug: "tv-oled",            label: "TV OLED",            emoji: "📺", family: "tech" as Family, hook: "Salon, luminosité, gaming" },
  { slug: "casque-audio",       label: "Casque audio",       emoji: "🎧", family: "tech" as Family, hook: "Nomade, réduction, qualité" },
  { slug: "smartphone",         label: "Smartphone",         emoji: "📱", family: "tech" as Family, hook: "Photo, batterie, budget" },
  { slug: "ordinateur-etudiant",label: "Laptop étudiant",    emoji: "💻", family: "tech" as Family, hook: "Autonomie, légèreté, perfs" },
  { slug: "imprimante",         label: "Imprimante",         emoji: "🖨️", family: "tech" as Family, hook: "Jet, laser, couleur" },
  { slug: "barre-son",          label: "Barre de son",       emoji: "🔊", family: "tech" as Family, hook: "TV, gaming, Dolby" },
  { slug: "camera-securite",    label: "Caméra sécurité",    emoji: "📷", family: "tech" as Family, hook: "Intérieur, extérieur, cloud" },
  { slug: "thermostat-connecte",label: "Thermostat connecté",emoji: "🌡️", family: "tech" as Family, hook: "Économies, confort, compat." },
  { slug: "trottinette-electrique", label: "Trottinette élec.", emoji: "🛴", family: "mobility" as Family, hook: "Autonomie, poids, homologuée" },
  { slug: "velo-electrique",    label: "Vélo électrique",    emoji: "🚲", family: "mobility" as Family, hook: "Urbain, trail, autonomie" },
  { slug: "matelas",            label: "Matelas",            emoji: "🛏️", family: "comfort" as Family, hook: "Fermeté, couple, dos" },
  { slug: "poussette",          label: "Poussette",          emoji: "👶", family: "comfort" as Family, hook: "Légère, pliable, tout terrain" },
];

const FAMILY_META: Record<Family, { label: string; color: string; bg: string }> = {
  home:     { label: "Maison",   color: "#FF6B5F", bg: "rgba(255,107,95,0.14)" },
  tech:     { label: "Tech",     color: "#4257FF", bg: "rgba(66,87,255,0.14)" },
  mobility: { label: "Mobilité", color: "#3ED6A3", bg: "rgba(62,214,163,0.14)" },
  comfort:  { label: "Confort",  color: "#9B7FD4", bg: "rgba(155,127,212,0.14)" },
};

const TABS = [
  { key: "all" as const,      label: "Tout" },
  { key: "home" as const,     label: "🏠 Maison" },
  { key: "tech" as const,     label: "📱 Tech" },
  { key: "mobility" as const, label: "🛴 Mobilité" },
  { key: "comfort" as const,  label: "🛏️ Confort" },
];

// ── Composant ──────────────────────────────────────────────────────────────────

export default function CategoryGrid({ onSelect }: Props) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [badgeVisible, setBadgeVisible] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const count = useCountUp(CATEGORIES.length, { enabled: badgeVisible, duration: 900 });

  // IntersectionObserver for badge counter
  const observerRef = useRef<IntersectionObserver | null>(null);
  const intersectRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(
    () => (activeTab === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.family === activeTab)),
    [activeTab],
  );

  return (
    <section
      aria-labelledby="cat-grid-title"
      className="relative overflow-hidden bg-[#0E1020] px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16"
    >
      {/* Observateur viewport pour le compteur */}
      <div
        ref={(el) => {
          intersectRef.current = el;
          if (el && !observerRef.current) {
            observerRef.current = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting) {
                  setBadgeVisible(true);
                  observerRef.current?.disconnect();
                }
              },
              { rootMargin: "-80px" },
            );
            observerRef.current.observe(el);
          }
        }}
        className="pointer-events-none absolute inset-0"
      />

      {/* Glows décoratifs */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#4257FF]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-0 h-60 w-60 rounded-full bg-[#FF6B5F]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#3ED6A3]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* ── HEADER ── */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge compteur animé */}
          <div
            ref={badgeRef}
            className="animate-fade-slide-up mx-auto mb-5 inline-flex items-center gap-2
                       rounded-full border border-white/10 bg-white/[0.06] px-4 py-2
                       text-sm font-semibold shadow-[0_0_40px_rgba(66,87,255,0.18)] backdrop-blur"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#3ED6A3]" />
            ✨ <span>{count} catégories couvertes</span>
          </div>

          <h2
            id="cat-grid-title"
            className="animate-fade-slide-up font-['Sora'] text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ animationDelay: "0.08s" }}
          >
            Troviio sait tout choisir.{" "}
            <br className="hidden sm:block" />
            <span className="text-[#FF6B5F]">Même ce à quoi tu n&apos;avais pas pensé.</span>
          </h2>

          <p
            className="animate-fade-slide-up mx-auto mt-5 max-w-xl text-base leading-7 text-[#8B8FA3] sm:text-lg"
            style={{ animationDelay: "0.14s" }}
          >
            Clique sur une catégorie — l&apos;IA démarre la conversation.
          </p>
        </div>

        {/* ── TABS FILTRES ── */}
        <div className="mt-10 flex justify-center overflow-x-auto pb-1">
          <div
            role="tablist"
            aria-label="Filtrer les catégories"
            className="flex gap-1 rounded-full border border-white/10
                       bg-[#1A1D2E]/80 p-1 shadow-2xl shadow-black/20 backdrop-blur"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative whitespace-nowrap rounded-full px-4 py-2 text-sm
                             font-semibold outline-none transition-colors
                             focus-visible:ring-2 focus-visible:ring-[#3ED6A3]
                             focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1020]
                             sm:px-5"
                >
                  <span
                    className={`relative z-10 transition-colors ${
                      isActive ? "text-[#0E1020]" : "text-[#8B8FA3] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {/* Active pill */}
                  {isActive && (
                    <span className="absolute inset-0 z-0 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── GRID CATÉGORIES ── */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((cat, i) => {
            const meta = FAMILY_META[cat.family];
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => onSelect(cat.slug, cat.label)}
                className="group relative min-h-[168px] overflow-hidden rounded-3xl
                           border border-white/10 bg-[#242840] p-4 text-left
                           transition-all duration-300 ease-out
                           hover:-translate-y-1 hover:shadow-xl
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-[#3ED6A3] sm:min-h-[188px] sm:p-5"
                style={{
                  animation: `fade-slide-up 0.35s ease-out ${i * 0.035}s both`,
                  boxShadow: "0 0 0 0 transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 50px ${meta.color}30`;
                  e.currentTarget.style.borderColor = meta.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                {/* Glow hover interne */}
                <div
                  className="absolute -right-10 -top-10 h-24 w-24 rounded-full
                             opacity-0 blur-2xl transition-opacity duration-300
                             group-hover:opacity-70"
                  style={{ backgroundColor: meta.color }}
                />

                {/* Badge famille */}
                <span
                  className="absolute right-3 top-3 rounded-full border border-white/10
                             bg-black/20 px-2 py-0.5 text-[10px] font-bold
                             uppercase tracking-wide backdrop-blur"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>

                {/* Emoji */}
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full
                             text-3xl ring-1 ring-white/10 transition-transform
                             duration-300 group-hover:scale-110"
                  style={{ backgroundColor: meta.bg }}
                  aria-hidden="true"
                >
                  {cat.emoji}
                </div>

                {/* Nom */}
                <h3 className="font-['Sora'] text-base font-bold leading-tight text-white sm:text-lg">
                  {cat.label}
                </h3>

                {/* Hook */}
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#8B8FA3]">
                  {cat.hook}
                </p>

                {/* Barre accent */}
                <div
                  className="mt-3 h-1 w-10 rounded-full transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: meta.color }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
=======
// src/components/home/CategoryGrid.tsx
"use client";

import { CHAT_CATEGORIES, type ChatCategorySlug } from "@/app/constants/chat-categories";

interface CategoryGridProps {
  onSelect: (slug: ChatCategorySlug) => void;
  selectedSlug?: string | null;
}

export default function CategoryGrid({ onSelect, selectedSlug }: CategoryGridProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <p
        className="text-center text-sm font-semibold mb-5 uppercase tracking-widest"
        style={{
          fontFamily: "'Inter', sans-serif",
          color: "rgba(22,24,39,0.40)",
          letterSpacing: "0.15em",
        }}
      >
        Choisis une catégorie pour commencer
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {CHAT_CATEGORIES.map((cat, i) => {
          const isSelected = selectedSlug === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelect(cat.slug)}
              className="group flex flex-col items-center gap-3 rounded-[20px] p-5 text-center transition-all duration-200 hover:-translate-y-0.5"
              style={{
                animationDelay: `${i * 45}ms`,
                background: isSelected ? `${cat.color}12` : "#FFF7ED",
                border: isSelected
                  ? `2px solid ${cat.color}`
                  : "2px solid rgba(22,24,39,0.06)",
                boxShadow: isSelected
                  ? `0 8px 24px ${cat.color}28`
                  : "0 2px 8px rgba(22,24,39,0.04)",
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                if (isSelected) return;
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = `${cat.color}60`;
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(22,24,39,0.10)`;
              }}
              onMouseLeave={(e) => {
                if (isSelected) return;
                e.currentTarget.style.background = "#FFF7ED";
                e.currentTarget.style.borderColor = "rgba(22,24,39,0.06)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(22,24,39,0.04)";
              }}
            >
              <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
                {cat.emoji}
              </span>
              <span
                className="text-sm font-semibold leading-snug"
                style={{ fontFamily: "'Sora', sans-serif", color: isSelected ? cat.color : "#161827" }}
              >
                {cat.label}
              </span>
              {cat.subtext && (
                <span
                  className="text-xs leading-tight line-clamp-2"
                  style={{ fontFamily: "'Inter', sans-serif", color: "rgba(22,24,39,0.48)" }}
                >
                  {cat.subtext}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
>>>>>>> 4e3d4795 (feat(chat): Chat IA v2 — clic catégorie → IA parle en premier)
  );
}
