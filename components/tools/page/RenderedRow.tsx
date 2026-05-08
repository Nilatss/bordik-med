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
      <div style={{ paddingTop: 14, paddingBottom: 2 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 18, letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          {stripCategoryNumber(row.category)}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            color: '#9CA3AF',
          }}>
            {row.count}
          </span>
        </h2>
      </div>
    );
  }

  if (row.kind === 'subcategory') {
    return (
      <div style={{ paddingTop: 4 }}>
        <h3 style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 12,
        }}>
          {row.subcategory}
          <span style={{ marginLeft: 8, color: '#D1D5DB' }}>· {row.count}</span>
        </h3>
      </div>
    );
  }

  // Cards row — pad with invisible slots so the grid layout stays consistent.
  const padded = [...row.tools];
  while (padded.length < cols) padded.push(null as unknown as CatalogTool);
  return (
    <div className="tools-row-grid" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 'var(--space-3)',
      marginBottom: 12,
    }}>
      {padded.map((tool, idx) =>
        tool ? (
          // Plain <div> с CSS cascade keyframe вместо motion.div.
          // Virtuoso recycles rows on scroll — per-card framer-motion бы
          // запускался 4-5 cards × per-row × per-scroll-step. CSS animation
          // runs on the compositor и GC'д браузером.
          <div
            key={tool.id}
            className="tools-card-cascade"
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              animationDelay: `${idx * 40}ms`,
            }}
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
