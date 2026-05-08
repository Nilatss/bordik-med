/**
 * useResponsiveCols — viewport-tracking hook returning the grid column count
 * for ToolsPage.
 *
 * P1-CR-3 step 4/6 — extracted from ToolsPage.tsx.
 *
 *   3 → wide desktop (≥ 1400 px) — big screens breathe
 *   2 → standard desktop / tablet — cards stay comfortably wide
 *   1 → mobile (≤ 620 px) — single column
 */
import { useState, useEffect } from 'react';

export function useResponsiveCols(): number {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = () => {
      const w = window.innerWidth;
      if (w >= 1400) return 3;
      if (w >= 620) return 2;
      return 1;
    };
    setCols(compute());
    const onResize = () => setCols(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return cols;
}
