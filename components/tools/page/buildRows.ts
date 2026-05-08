/**
 * buildRows — build a flat row model from filtered/grouped tools.
 * One row of up to 3 cards → matches the visual 3-col grid.
 *
 * P1-CR-3 step 4/6 — extracted from ToolsPage.tsx.
 */
import type { CatalogTool, Row } from '@/lib/tools-page/types';

export function buildRows(
  byCategory: { category: string; tools: CatalogTool[] }[],
  COLS: number
): Row[] {
  const rows: Row[] = [];
  for (const { category, tools } of byCategory) {
    rows.push({ kind: 'category', category, count: tools.length, key: `c:${category}` });

    // Group by subcategory, preserving first-seen order (for stable UI).
    const order: string[] = [];
    const groups = new Map<string, CatalogTool[]>();
    for (const t of tools) {
      let arr = groups.get(t.subcategory);
      if (!arr) {
        arr = [];
        groups.set(t.subcategory, arr);
        order.push(t.subcategory);
      }
      arr.push(t);
    }

    for (const sub of order) {
      const arr = groups.get(sub)!;
      rows.push({ kind: 'subcategory', category, subcategory: sub, count: arr.length, key: `s:${category}:${sub}` });
      for (let i = 0; i < arr.length; i += COLS) {
        const slice = arr.slice(i, i + COLS);
        // Key includes first tool id + count — stable while filter result
        // order is stable. Avoids per-render .map().join() in computeItemKey.
        const key = `r:${category}:${sub}:${slice[0]?.id ?? ''}:${slice.length}`;
        rows.push({ kind: 'cards', category, subcategory: sub, tools: slice, key });
      }
    }
  }
  return rows;
}
