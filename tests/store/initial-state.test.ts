/**
 * Regression tests for the Zustand store initial state.
 *
 * showLearning must default to `true` so the SSR-rendered home page
 * delivers real DOM content (SectionCards, eagerly imported) instead of
 * NewsFeed (dynamic ssr:false, no SSR output). Without this, every cold
 * page load — including synthetic Lighthouse / Sentry monitoring probes —
 * sees an empty shell and measures LCP >5 s (Sentry JAVASCRIPT-NEXTJS-V,
 * 48 events). With showLearning:true the LCP element (a section card
 * heading) is present in the initial HTML and LCP drops to ~TTFB + hydration.
 *
 * showLearning is intentionally NOT in the `partialize` list, so the
 * initial value is always applied on page load (no persist hydration
 * conflict).
 */
import { describe, it, expect } from 'vitest';
import { useAppStore } from '@/lib/store';

describe('store initial state', () => {
  it('showLearning defaults to true (SSR LCP fix)', () => {
    // useAppStore.getState() reads the initial state synchronously.
    // Zustand does not require React / DOM to read state.
    const state = useAppStore.getState();
    expect(state.showLearning).toBe(true);
  });

  it('all other view flags default to false (no overlapping views)', () => {
    const {
      showProfile, showTools, showStats, showTests,
      showIcd10, showDrugs, showNeonatal, showNotes,
    } = useAppStore.getState();
    expect(showProfile).toBe(false);
    expect(showTools).toBe(false);
    expect(showStats).toBe(false);
    expect(showTests).toBe(false);
    expect(showIcd10).toBe(false);
    expect(showDrugs).toBe(false);
    expect(showNeonatal).toBe(false);
    expect(showNotes).toBe(false);
  });
});
