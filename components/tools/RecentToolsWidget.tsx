'use client';

/**
 * Виджет «Последние инструменты» на странице /tools.
 *
 * Источник — useAppStore.recentToolIds (MRU, top-10). Показываем top-5
 * как горизонтальный список pill-карточек с иконкой ⏱ и названием.
 * Клик — openTool(id), как клик по обычной карточке каталога.
 *
 * Зачем: P0-A6 из аудита. У врача в дежурстве 80 % времени работают
 * 5–10 любимых инструментов (CrCl, GCS, Wells, qSOFA, Apgar) — этот
 * виджет даёт one-click возврат к ним без поиска и фильтров.
 *
 * Невидим, если нет ни одного использованного инструмента (новый
 * пользователь — пустой стейт без виджета чище, чем «История пуста»).
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import type { CatalogMetaItem } from '@/lib/catalog-client';

const VISIBLE = 5;

interface Props {
  catalog: readonly CatalogMetaItem[];
  onOpen: (id: string) => void;
}

export default function RecentToolsWidget({ catalog, onOpen }: Props) {
  const recent = useAppStore((s) => s.recentToolIds);

  const items = useMemo(() => {
    if (recent.length === 0 || catalog.length === 0) return [];
    const byId = new Map(catalog.map((t) => [t.id, t]));
    const out: CatalogMetaItem[] = [];
    for (const id of recent) {
      const t = byId.get(id);
      if (t && (t.available || t.hasRunner)) out.push(t);
      if (out.length >= VISIBLE) break;
    }
    return out;
  }, [recent, catalog]);

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1], delay: 0.04 }}
      aria-label="Недавно использованные инструменты"
      className="mb-[18px]"
    >
      <h3 className="mt-0 mb-2.5 mx-0 font-[var(--font-mono,ui-monospace)] text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em]">
        Недавние
      </h3>

      <div className="flex gap-2 flex-wrap">
        {items.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onOpen(t.id)}
            title={t.title}
            className="inline-flex items-center gap-2 py-2 px-3.5 max-w-[320px] bg-[#F5F6F8] hover:bg-[#EFF6FF] border border-transparent hover:border-[#DBEAFE] rounded-full cursor-pointer font-[var(--font-body)] text-[13px] font-medium text-[#1A1A1A] hover:text-[#2563EB] text-left transition-[background,border-color,color] duration-[160ms]"
          >
            <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
              {t.title}
            </span>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0 opacity-60">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
