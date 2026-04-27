// src/hooks/useConversationHistory.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/storage-keys";

// ── Types ─────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  categorySlug: string;
  categoryLabel: string;
  categoryEmoji: string;
  summary: string;
  score?: number;
  createdAt: string;
  resultId?: string;
}

export const HISTORY_STORAGE_KEY = STORAGE_KEYS.HISTORY;
export const MAX_HISTORY_ENTRIES = 30;

// ── Helpers ───────────────────────────────────────────────────────

export function formatRelativeDate(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (isNaN(date.getTime())) return "Date inconnue";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(date);
}

function readFromStorage(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return parsed
      .filter((e) => e?.id && e?.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

function writeToStorage(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY_ENTRIES)));
  } catch {}
}

// ── Hook ─────────────────────────────────────────────────────────

export function useConversationHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    setEntries(readFromStorage());
  }, []);

  const upsertEntry = useCallback((entry: HistoryEntry) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== entry.id);
      const updated = [entry, ...filtered];
      writeToStorage(updated);
      return updated;
    });
  }, []);

  const setResultId = useCallback((sessionId: string, resultId: string) => {
    setEntries((prev) => {
      const updated = prev.map((e) => (e.id === sessionId ? { ...e, resultId } : e));
      writeToStorage(updated);
      return updated;
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setRemovingId(id);
    window.setTimeout(() => {
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        writeToStorage(updated);
        return updated;
      });
      setRemovingId(null);
    }, 240);
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  }, []);

  const startNewSearch = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CHAT);
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_HISTORY);
    } catch {}
    router.push("/");
  }, [router]);

  return { entries, isMounted, removingId, upsertEntry, setResultId, deleteEntry, clearHistory, startNewSearch };
}
