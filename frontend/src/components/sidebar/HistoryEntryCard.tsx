// src/components/sidebar/HistoryEntryCard.tsx
"use client";

import { useState, useMemo } from "react";
import type { HistoryEntry } from "@/hooks/useConversationHistory";
import { formatRelativeDate } from "@/hooks/useConversationHistory";

// ── Score Ring SVG (28px) ─────────────────────────────────────────

function MiniScoreRing({ score }: { score: number }) {
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = circumference - (clamped / 100) * circumference;
  const color = clamped >= 80 ? "#3ED6A3" : clamped >= 60 ? "#FFB020" : "#FF6B5F";

  return (
    <div className="relative w-7 h-7 flex-shrink-0 mt-0.5" title={`Score ${clamped}/100`}>
      <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="14" cy="14" r={radius} fill="none" stroke="rgba(176,170,162,0.28)" strokeWidth="3" />
        <circle
          cx="14" cy="14" r={radius} fill="none"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.42s cubic-bezier(0.2,0.8,0.2,1)" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: "'Nunito', sans-serif", fontSize: "9px", fontWeight: 800, color: "#161827", letterSpacing: "-0.04em" }}>
        {Math.round(clamped)}
      </span>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────

interface Props {
  entry: HistoryEntry;
  isActive: boolean;
  isRemoving: boolean;
  animDelay?: number;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

export function HistoryEntryCard({ entry, isActive, isRemoving, animDelay = 0, onSelect, onDelete }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const relDate = useMemo(() => formatRelativeDate(entry.createdAt), [entry.createdAt]);

  const cardClass = ["troviio-entry-card", isActive ? "is-active" : "", confirmingDelete ? "is-deleting" : "", isRemoving ? "is-removing" : ""]
    .filter(Boolean)
    .join(" ");

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirmingDelete) { setConfirmingDelete(true); return; }
    onDelete(entry.id);
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmingDelete(false);
  }

  return (
    <article className={cardClass} style={{ animationDelay: `${Math.min(animDelay * 42, 280)}ms` }} onClick={() => !confirmingDelete && onSelect(entry)}>
      <div className="troviio-entry-main">
        {entry.score !== undefined ? (
          <MiniScoreRing score={entry.score} />
        ) : (
          <span className="text-xl leading-none mt-0.5">{entry.categoryEmoji}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="troviio-entry-category-name">
              {entry.score !== undefined && <span className="mr-1">{entry.categoryEmoji}</span>}
              {entry.categoryLabel}
            </span>
            <time className="troviio-entry-date flex-shrink-0">{relDate}</time>
          </div>
          <p className="troviio-entry-summary">{entry.summary}</p>
        </div>
        <button type="button" className="troviio-entry-delete-btn" aria-label={confirmingDelete ? "Confirmer la suppression" : "Supprimer"} onClick={handleDeleteClick}>
          ×
        </button>
      </div>
      {confirmingDelete && (
        <div className="troviio-entry-confirm">
          <span>Supprimer cette recherche ?</span>
          <div className="flex items-center gap-1.5">
            <button type="button" className="troviio-mini-btn ghost" onClick={handleCancelDelete}>Annuler</button>
            <button type="button" className="troviio-mini-btn danger" onClick={handleDeleteClick}>Supprimer</button>
          </div>
        </div>
      )}
    </article>
  );
}
