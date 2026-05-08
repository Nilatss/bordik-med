/**
 * P1-CR-3 (Icd10Lookup split, step 6/6 — FINAL) — chapter accordion.
 *
 * Browse-режим: показывает раскрытую/свёрнутую главу + её коды.
 *
 * Pagination footer (защита от freeze на больших главах типа МКБ-11 0X
 * с 16k extension-кодами):
 *   - INITIAL_PER_CHAPTER (50) показано сразу
 *   - «Показать ещё» подгружает CHUNK_SIZE (500) за клик
 *   - «Свернуть до 50» возвращает к initial state
 *
 * Header — soft-blue badge с chapter.id, title + range/count подзаголовок,
 * chevron rotates 180° при isOpen.
 */
import { motion, AnimatePresence } from 'framer-motion';
import type { Chapter, CodeEntry } from '@/lib/icd10/types';
import { pluralCodes, INITIAL_PER_CHAPTER, CHUNK_SIZE } from '@/lib/icd10/utils';
import { CodeRow } from './CodeRow';

interface ChapterAccordionProps {
  chapter: Chapter;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  visible: CodeEntry[];
  visibleCount: number;
  remaining: number;
  chunks: number;
  onLoadMore: () => void;
  onCollapse: () => void;
}

export function ChapterAccordion({
  chapter, count, isOpen, onToggle,
  visible, visibleCount, remaining, chunks, onLoadMore, onCollapse,
}: ChapterAccordionProps) {
  return (
    <div style={{
      background: '#F5F6F8',
      border: 'none',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px',
          background: 'transparent',
          border: 'none', cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{
          flex: '0 0 auto',
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontSize: 11, fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 999,
          // Soft-blue badge на сером (#F5F6F8) фоне карточки —
          // белый fill держит бейдж читаемым, синий текст соотносится
          // с активной фильтр-пиллой и подсветкой кодов.
          background: '#FFFFFF',
          color: '#2563EB',
          border: '1px solid #DBEAFE',
          letterSpacing: '0.04em',
          minWidth: 60, textAlign: 'center',
        }}>
          {chapter.id}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block',
            fontSize: 14, fontWeight: 600, color: '#1A1A1A',
            lineHeight: 1.35,
          }}>
            {chapter.title}
          </span>
          <span style={{
            display: 'block', marginTop: 2,
            fontSize: 12, color: '#9CA3AF',
            fontFamily: 'var(--font-mono, ui-monospace)',
          }}>
            {chapter.range} · {count} {pluralCodes(count)}
          </span>
        </span>
        <span style={{
          flex: '0 0 auto',
          color: '#6B7280',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: [0.05, 0.7, 0.1, 1] },
              opacity: { duration: 0.18 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid #E5E7EB',
              padding: '8px 0',
            }}>
              {visible.map((c) => (
                <CodeRow key={c.code} code={c} />
              ))}
              {/* Pagination footer: подгружает по CHUNK_SIZE кодов за клик.
                  Защищает от freeze при огромных главах (МКБ-11 0X = 16k). */}
              {(remaining > 0 || chunks > 0) && (
                <div style={{ display: 'flex', gap: 8, padding: '8px 18px 4px', flexWrap: 'wrap' }}>
                  {remaining > 0 && (
                    <button
                      type="button"
                      onClick={onLoadMore}
                      style={{
                        padding: '8px 14px',
                        background: '#EFF6FF',
                        border: '1px solid #DBEAFE',
                        borderRadius: 999,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                        color: '#2563EB',
                        transition: 'background 150ms, border-color 150ms',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#DBEAFE';
                        e.currentTarget.style.borderColor = '#BFDBFE';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#EFF6FF';
                        e.currentTarget.style.borderColor = '#DBEAFE';
                      }}
                    >
                      {`Показать ещё ${Math.min(CHUNK_SIZE, remaining)} (показано ${visibleCount} из ${count})`}
                    </button>
                  )}
                  {chunks > 0 && (
                    <button
                      type="button"
                      onClick={onCollapse}
                      style={{
                        padding: '8px 14px',
                        background: '#F5F6F8',
                        border: '1px solid #E5E7EB',
                        borderRadius: 999,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                        color: '#6B7280',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#E5E7EB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F5F6F8';
                      }}
                    >
                      Свернуть до {INITIAL_PER_CHAPTER}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
