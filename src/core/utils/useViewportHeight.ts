import { useEffect, useState } from "react";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";

/**
 * Smart height calculation.
 * 
 * @param offsetPx   - subtract from viewport (header + toolbar height)
 * @param minPx      - minimum allowed height
 * @param maxPx      - maximum allowed height (for big screens)
 */
export const useViewportHeight = (
  offsetPx: number = 0,
  minPx: number = 300,
  maxPx: number = 900,
  debounceMs: number = 120
) => {
  const calculate = () => {
    const viewport = window.innerHeight;
    const raw = viewport - offsetPx;

    // clamp height (min ≤ height ≤ max)
    const height = Math.min(Math.max(raw, minPx), maxPx);

    return height;
  };

  const [height, setHeight] = useState(() => {
    if (typeof window === "undefined") return minPx;
    return calculate();
  });

  const debouncedResize = useDebouncedCallback(() => {
    setHeight(calculate());
  }, debounceMs);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => debouncedResize();

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      debouncedResize.cancel?.();
    };
  }, [offsetPx, minPx, maxPx, debouncedResize]);

  return height;
};
