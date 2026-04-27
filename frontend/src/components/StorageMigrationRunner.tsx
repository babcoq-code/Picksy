"use client";

import { useEffect } from "react";
import { migrateLegacyStorageKeys } from "@/lib/storage-keys";

/**
 * Composant React qui exécute la migration des clés legacy au montage.
 * À placer une fois dans layout.tsx (sous le body).
 */
export function StorageMigrationRunner() {
  useEffect(() => { migrateLegacyStorageKeys(); }, []);
  return null;
}
