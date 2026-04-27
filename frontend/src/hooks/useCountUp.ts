"use client";

import { useEffect, useState } from "react";

/**
 * Anime un nombre de 0 → target (ease-out cubic).
 * enabled permet de déclencher depuis une ref useInView.
 */
export function useCountUp(
  target: number,
  { enabled = true, duration = 900 }: { enabled?: boolean; duration?: number } = {},
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let frameId: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    setValue(0);
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [enabled, target, duration]);

  return value;
}
