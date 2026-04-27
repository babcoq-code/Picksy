"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/storage-keys";

type ResultRedirectMessageProps = {
  result_id: string;
};

const REDIRECT_DELAY_SECONDS = 3;

export function ResultRedirectMessage({ result_id }: ResultRedirectMessageProps) {
  const router = useRouter();
  const [remainingSeconds, setRemainingSeconds] = useState(REDIRECT_DELAY_SECONDS);

  useEffect(() => {
    if (!result_id) return;

    // Sauvegarder l'historique pour "Affiner" sur la page résultat
    try {
      const savedHistory = sessionStorage.getItem(STORAGE_KEYS.CURRENT_HISTORY);
      const savedChat    = sessionStorage.getItem(STORAGE_KEYS.CURRENT_CHAT);
      if (savedHistory) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, savedHistory);
        localStorage.setItem(STORAGE_KEYS.CHAT,    savedChat || "[]");
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_HISTORY);
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
      }
    } catch {}

    const countdownInterval = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    const redirectTimeout = window.setTimeout(() => {
      router.push(`/resultats/${encodeURIComponent(result_id)}`);
    }, REDIRECT_DELAY_SECONDS * 1000);

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(redirectTimeout);
    };
  }, [result_id, router]);

  return (
    <section
      className="my-4 overflow-hidden rounded-3xl p-5 text-white shadow-xl"
      style={{
        background: "linear-gradient(135deg, #0E1020 0%, #4257FF 100%)",
        boxShadow: "0 12px 40px rgba(66,87,255,0.3)",
      }}
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">
          🏆
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold leading-snug">
            Troviio a trouvé tes recommandations !
          </p>
          <p className="mt-1 text-sm text-white/75">
            Redirection dans {remainingSeconds} seconde{remainingSeconds > 1 ? "s" : ""}…
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full animate-picksy-result-progress"
              style={{ backgroundColor: "#3ED6A3" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
