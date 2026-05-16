/**
 * RenderedRow — Virtuoso row renderer для ToolsPage.
 *
 * P1-CR-3 step 4/6 — extracted from ToolsPage.tsx.
 *
 * Three row kinds:
 *   - category — h2 заголовок ("Кардиология 42")
 *   - subcategory — small uppercase pill ("ШКАЛЫ · 8")
 *   - cards — row of up to `cols` ToolCard'ов с CSS-cascade анимацией
 *
 * Memoised — identical rows aren't reconciled on every parent re-render.
 */
import React from 'react';
import type { CatalogTool, Row } from '@/lib/tools-page/types';
import { stripCategoryNumber } from '@/lib/tools-page/helpers';
import { ToolCard } from './ToolCard';

export const RenderedRow = React.memo(function RenderedRow({
  row,
  cols,
}: {
  row: Row;
  cols: number;
}) {
  if (row.kind === 'empty') return null;

  if (row.kind === 'category') {
    return (
      <div className="pt-[14px] pb-0.5">
        <h2 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mb-[18px] tracking-[-0.01em] flex items-baseline gap-2">
          {stripCategoryNumber(row.category)}
          <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
            {row.count}
          </span>
        </h2>
      </div>
    );
  }

  if (row.kind === 'subcategory') {
    return (
      <div className="pt-1">
        <h3 className="font-[var(--font-mono)] text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-3">
          {row.subcategory}
          <span className="ml-2 text-[#D1D5DB]">· {row.count}</span>
        </h3>
      </div>
    );
  }

  // Cards row — pad with invisible slots so the grid layout stays consistent.
  const padded = [...row.tools];
  while (padded.length < cols) padded.push(null as unknown as CatalogTool);
  return (
    <div
      className="tools-row-grid grid gap-[var(--space-3)] mb-3 grid-cols-[var(--cols)]"
      // eslint-disable-next-line react/forbid-dom-props -- dynamic columns count
      style={{ ['--cols' as string]: `repeat(${cols}, 1fr)` }}
    >
      {padded.map((tool, idx) =>
        tool ? (
          // Plain <div> с CSS cascade keyframe вместо motion.div.
          // Virtuoso recycles rows on scroll — per-card framer-motion бы
          // запускался 4-5 cards × per-row × per-scroll-step. CSS animation
          // runs on the compositor и GC'д браузером.
          <div
            key={tool.id}
            className="tools-card-cascade flex flex-col min-w-0 [animation-delay:var(--anim-delay)]"
            // eslint-disable-next-line react/forbid-dom-props -- dynamic animation delay per card
            style={{ ['--anim-delay' as string]: `${idx * 40}ms` }}
          >
            <ToolCard tool={tool} />
          </div>
        ) : (
          <div key={`ph-${idx}`} />
        )
      )}
    </div>
  );
});
