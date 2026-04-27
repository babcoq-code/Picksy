// src/components/chat/ChatHeader.tsx
"use client";

import type { ChatCategory } from "@/app/constants/chat-categories";

const PHASES = [
  { label: "Besoins", minHistory: 0 },
  { label: "Affinage", minHistory: 4 },
  { label: "Résultats", minHistory: 8 },
] as const;

function getPhaseIndex(historyLength: number) {
  if (historyLength >= 8) return 2;
  if (historyLength >= 4) return 1;
  return 0;
}

interface ChatHeaderProps {
  category: ChatCategory;
  historyLength: number;
  onReset: () => void;
}

export function ChatHeader({ category, historyLength, onReset }: ChatHeaderProps) {
  const phaseIdx = getPhaseIndex(historyLength);

  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{
        background: "white",
        borderBottom: "1px solid rgba(22,24,39,0.06)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/5"
          style={{ fontFamily: "'Inter', sans-serif", color: "rgba(22,24,39,0.55)" }}
        >
          ← Autre catégorie
        </button>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shrink-0"
          style={{
            background: `${category.color}14`,
            border: `1px solid ${category.color}35`,
            color: category.color,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <span className="text-sm">{category.emoji}</span>
          {category.label}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {PHASES.map((phase, i) => {
          const isActive = i === phaseIdx;
          const isDone = i < phaseIdx;
          return (
            <div key={phase.label} className="flex items-center gap-1">
              <span
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: isActive ? "24px" : "8px",
                  background: isActive ? "#4257FF" : isDone ? "#3ED6A3" : "rgba(22,24,39,0.14)",
                }}
              />
              {isActive && (
                <span className="text-xs font-semibold" style={{ fontFamily: "'Inter', sans-serif", color: "#4257FF" }}>
                  {phase.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
