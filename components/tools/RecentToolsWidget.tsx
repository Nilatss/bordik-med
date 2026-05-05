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
      style={{ marginBottom: 18 }}
    >
      <h3 style={{
        margin: '0 0 10px',
        fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 11, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        Недавние
      </h3>

      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        {items.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onOpen(t.id)}
            title={t.title}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              maxWidth: 320,
              background: '#F5F6F8',
              border: '1px solid transparent',
              borderRadius: 999,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              color: '#1A1A1A',
              textAlign: 'left',
              transition: 'background 160ms, border-color 160ms, color 160ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EFF6FF';
              e.currentTarget.style.borderColor = '#DBEAFE';
              e.currentTarget.style.color = '#2563EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F5F6F8';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.color = '#1A1A1A';
            }}
          >
            <span style={{
              flex: 1, minWidth: 0,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {t.title}
            </span>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, opacity: 0.6 }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
