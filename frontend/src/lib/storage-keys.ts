// frontend/src/lib/storage-keys.ts
// Source de vérité pour toutes les clés de stockage navigateur

export const STORAGE_KEYS = {
  HISTORY:         "troviio_history",
  CHAT:            "troviio_chat",
  CURRENT_HISTORY: "troviio_current_history",
  CURRENT_CHAT:    "troviio_current_chat",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Migration one-shot des anciennes clés Picksy → Troviio.
 * À appeler une fois au boot dans layout.tsx.
 */
export function migrateLegacyStorageKeys(): void {
  if (typeof window === "undefined") return;
  const legacyMap: Record<string, string> = {
    picksy_history:         STORAGE_KEYS.HISTORY,
    picksy_chat:            STORAGE_KEYS.CHAT,
    picksy_current_history: STORAGE_KEYS.CURRENT_HISTORY,
    picksy_current_chat:    STORAGE_KEYS.CURRENT_CHAT,
  };
  for (const [oldKey, newKey] of Object.entries(legacyMap)) {
    const lsVal = localStorage.getItem(oldKey);
    if (lsVal !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, lsVal);
      localStorage.removeItem(oldKey);
    }
    const ssVal = sessionStorage.getItem(oldKey);
    if (ssVal !== null && sessionStorage.getItem(newKey) === null) {
      sessionStorage.setItem(newKey, ssVal);
      sessionStorage.removeItem(oldKey);
    }
  }
}
