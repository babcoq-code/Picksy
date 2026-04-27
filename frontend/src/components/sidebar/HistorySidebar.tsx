// src/components/sidebar/HistorySidebar.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { HistoryEntryCard } from "./HistoryEntryCard";
import { EmptyHistoryState } from "./EmptyHistoryState";
import { NewSearchButton } from "./NewSearchButton";
import { SidebarToggleButton } from "./SidebarToggleButton";
import { useConversationHistory, type HistoryEntry } from "@/hooks/useConversationHistory";

interface Props {
  isCollapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

export function HistorySidebar({ isCollapsed, onToggle, onMobileClose }: Props) {
  const { entries, isMounted, removingId, deleteEntry, startNewSearch } = useConversationHistory();
  const pathname = usePathname();
  const router = useRouter();

  if (!isMounted) return null;

  function handleSelectEntry(entry: HistoryEntry) {
    onMobileClose?.();
    if (entry.resultId) router.push(`/resultats/${entry.resultId}`);
    else router.push("/");
  }

  function handleNewSearch() {
    onMobileClose?.();
    startNewSearch();
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, #FFFAF3 0%, #FFF7ED 100%)",
        borderRight: "1px solid rgba(176,170,162,0.22)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(176,170,162,0.16)" }}>
        {!isCollapsed && (
          <span className="font-bold text-base flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif", color: "#161827", letterSpacing: "-0.02em" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="#4257FF" strokeWidth="1.5" />
              <path d="M9 5v4l2.5 2.5" stroke="#4257FF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Historique
          </span>
        )}
        {onMobileClose && (
          <button type="button" onClick={onMobileClose} className="ml-auto p-2 rounded-full hover:bg-black/5 transition-colors" aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#161827" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        )}
      </div>

      {/* Nouvelle recherche */}
      <div className={`px-3 py-3 flex-shrink-0 ${isCollapsed ? "flex justify-center" : ""}`}>
        <NewSearchButton collapsed={isCollapsed} onClick={handleNewSearch} />
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto px-3 pb-16 space-y-2">
        {entries.length === 0 ? (
          <EmptyHistoryState onStart={handleNewSearch} />
        ) : (
          entries.map((entry, i) => {
            const isActive = !!entry.resultId && pathname === `/resultats/${entry.resultId}`;
            const isRemoving = removingId === entry.id;
            if (isCollapsed) {
              return (
                <button key={entry.id} type="button" className="w-full flex justify-center py-2 rounded-2xl hover:bg-black/5 transition-colors text-xl" title={entry.categoryLabel} onClick={() => handleSelectEntry(entry)}>
                  {entry.categoryEmoji}
                </button>
              );
            }
            return (
              <HistoryEntryCard key={entry.id} entry={entry} isActive={isActive} isRemoving={isRemoving} animDelay={i} onSelect={handleSelectEntry} onDelete={deleteEntry} />
            );
          })
        )}
      </div>

      {/* Toggle */}
      <SidebarToggleButton collapsed={isCollapsed} onToggle={onToggle} />
    </div>
  );
}
