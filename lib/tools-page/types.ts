/**
 * Shared types for the tools-catalog page (`components/tools/ToolsPage.tsx`).
 *
 * P1-CR-3 god-component split — extracted from ToolsPage.tsx step 1/N.
 */
import type { CatalogMetaItem } from '@/lib/catalog-client';

/** Drop-in alias — was imported from `lib/tools-catalog`. New shape served via JSON. */
export type CatalogTool = CatalogMetaItem;

/** Three independent filter dropdowns + closed state. */
export type FilterKey = 'cat' | 'sub' | 'cou' | null;

/** One option in a filter dropdown (category / subcategory / country). */
export interface FilterOption {
  value: string;
  count: number;
  /** Optional leading glyph (e.g. country flag emoji) rendered before the label. */
  flag?: string;
  /**
   * Optional pretty label shown to the user (defaults to `value`). Used to
   * strip internal "N. " numeric prefixes from categories without breaking
   * filter identity.
   */
  label?: string;
}

/**
 * One logical row in the virtualised list. Three kinds:
 *   - category header (h2 "Кардиология 42")
 *   - subcategory header (small uppercase pill "ШКАЛЫ · 8")
 *   - row of up to 3 cards
 *
 * Rows also carry the enclosing category so we can build unique keys even
 * when the same subcategory name ("Депрессия") occurs in multiple categories.
 */
export type Row =
  | { kind: 'category'; category: string; count: number; key: string }
  | { kind: 'subcategory'; category: string; subcategory: string; count: number; key: string }
  | { kind: 'cards'; category: string; subcategory: string; tools: CatalogTool[]; key: string }
  | { kind: 'empty'; key: string };
