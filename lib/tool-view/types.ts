/**
 * Shared types for ToolView.
 *
 * P1-CR-3 god-component split — extracted from ToolView.tsx step 1/N.
 */

/** A single tab in the ToolView sidebar (calculator | info | reference). */
export interface Tab {
  id: string;
  title: string;
  /** Short label for sidebar pills (≤ 28 chars). */
  short: string;
  /** Icon family key for sidebar (see TabIcon switch). */
  iconKey: string;
  kind: 'calculator' | 'info' | 'reference';
  /** Markdown body for 'info' tabs. */
  body?: string;
}
