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
    <div className="bg-[#F5F6F8] border-none rounded-[14px] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-[14px] py-[14px] px-[18px] bg-transparent hover:bg-[#EFF1F4] border-none cursor-pointer text-left font-[inherit] transition-colors duration-150"
      >
        <span className="flex-[0_0_auto] font-[var(--font-mono,ui-monospace)] text-[11px] font-bold py-1 px-3 rounded-full bg-white text-[#2563EB] border border-[#DBEAFE] tracking-[0.04em] min-w-[60px] text-center">
          {chapter.id}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-[#1A1A1A] leading-[1.35]">
            {chapter.title}
          </span>
          <span className="block mt-0.5 text-xs text-[#9CA3AF] font-[var(--font-mono,ui-monospace)]">
            {chapter.range} · {count} {pluralCodes(count)}
          </span>
        </span>
        <span className={`flex-[0_0_auto] text-[#6B7280] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
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
            className="overflow-hidden"
          >
            <div className="border-t border-[#E5E7EB] py-2">
              {visible.map((c) => (
                <CodeRow key={c.code} code={c} />
              ))}
              {/* Pagination footer: подгружает по CHUNK_SIZE кодов за клик.
                  Защищает от freeze при огромных главах (МКБ-11 0X = 16k). */}
              {(remaining > 0 || chunks > 0) && (
                <div className="flex gap-2 pt-2 px-[18px] pb-1 flex-wrap">
                  {remaining > 0 && (
                    <button
                      type="button"
                      onClick={onLoadMore}
                      className="py-2 px-3.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#DBEAFE] hover:border-[#BFDBFE] rounded-full cursor-pointer font-[var(--font-body)] text-xs font-semibold text-[#2563EB] transition-[background,border-color] duration-150"
                    >
                      {`Показать ещё ${Math.min(CHUNK_SIZE, remaining)} (показано ${visibleCount} из ${count})`}
                    </button>
                  )}
                  {chunks > 0 && (
                    <button
                      type="button"
                      onClick={onCollapse}
                      className="py-2 px-3.5 bg-[#F5F6F8] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-full cursor-pointer font-[var(--font-body)] text-xs font-medium text-[#6B7280] transition-colors duration-150"
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
