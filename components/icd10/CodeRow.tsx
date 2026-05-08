/**
 * P1-CR-3 (Icd10Lookup split, step 4/6) — single ICD code row.
 *
 * Самый "толстый" sub-component (~190 LOC). Используется в двух
 * вариантах:
 *   - 'compact' (default) — внутри ChapterAccordion, плотная row
 *   - 'card' — внутри FlatList (search results), белая карточка с
 *     border + bigger padding + chapter-badge справа
 *
 * Состояние раскрытия (expanded) — локальное useState. Если в будущем
 * понадобится "expand all" / persist через URL — можно поднять в context.
 *
 * Hover-effect inline:
 *   compact: transparent → #EFF1F4 (на 1 шаг темнее F5F6F8 родителя)
 *   card:    #FFFFFF → #F5F6F8 + borderColor #F0F1F5 → #E2E4EA
 *
 * Expand-area: framer-motion AnimatePresence + height/opacity (0.22s).
 *
 * DetailBlock использует для аккуратного label/value layout
 * (см. ./DetailBlock.tsx).
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Highlight from '@/components/ui/Highlight';
import type { CodeEntry } from '@/lib/icd10/types';
import { displayTitle } from '@/lib/icd10/utils';
import { DetailBlock } from './DetailBlock';

interface CodeRowProps {
  code: CodeEntry;
  query?: string;
  variant?: 'compact' | 'card';
}

export function CodeRow({ code, query, variant = 'compact' }: CodeRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = !!(
    code.definition || code.longDefinition || code.codingNote
    || (code.inclusion && code.inclusion.length)
    || (code.exclusion && code.exclusion.length)
    || code.inheritedDefinition || code.inheritedLongDefinition
    || (code.inheritedInclusion && code.inheritedInclusion.length)
  );
  const isCard = variant === 'card';
  const titleText = displayTitle(code);

  // Compact (внутри ChapterAccordion) и Card (в FlatList search results) —
  // одна и та же модель, но разная плотность.
  const containerStyle: React.CSSProperties = isCard ? {
    background: '#FFFFFF',
    border: '1px solid #F0F1F5',
    borderRadius: 14,
    overflow: 'hidden',
    transition: 'border-color 150ms, background 150ms',
  } : {
    transition: 'background 120ms',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: isCard ? '14px 20px' : '10px 20px',
    background: 'transparent',
    border: 'none',
    width: '100%',
    cursor: hasDetails ? 'pointer' : 'default',
    textAlign: 'left',
    fontFamily: 'inherit',
    color: 'inherit',
  };

  const TitleNode = query
    ? <Highlight text={titleText} query={query} />
    : titleText;

  return (
    <div
      style={containerStyle}
      onMouseEnter={(e) => {
        if (isCard) {
          // Card variant: parent — белая сетка, hover из белого → серый
          e.currentTarget.style.background = '#F5F6F8';
          e.currentTarget.style.borderColor = '#E2E4EA';
        } else {
          // Compact variant: parent уже #F5F6F8 — hover нужен темнее
          // чтобы было видно. #EFF1F4 — на 1 шаг темнее серого.
          e.currentTarget.style.background = '#EFF1F4';
        }
      }}
      onMouseLeave={(e) => {
        if (isCard) {
          e.currentTarget.style.background = '#FFFFFF';
          e.currentTarget.style.borderColor = '#F0F1F5';
        } else {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <button
        type="button"
        onClick={() => { if (hasDetails) setExpanded((v) => !v); }}
        aria-expanded={hasDetails ? expanded : undefined}
        style={headerStyle}
      >
        <span style={{
          flex: '0 0 80px',
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontWeight: 700, fontSize: isCard ? 13 : 12.5, color: '#2563EB',
          letterSpacing: '0.02em',
        }}>
          {query ? <Highlight text={code.code} query={query} /> : code.code}
        </span>
        <span style={{
          flex: 1, fontSize: isCard ? 14 : 13.5,
          color: '#1A1A1A', lineHeight: 1.45,
        }}>
          {TitleNode}
        </span>
        {isCard && (
          <span style={{
            flex: '0 0 auto',
            fontFamily: 'var(--font-mono, ui-monospace)',
            fontSize: 11, fontWeight: 700,
            color: '#2563EB',
            background: '#EFF6FF',
            border: '1px solid #DBEAFE',
            padding: '2px 8px', borderRadius: 999,
            whiteSpace: 'nowrap',
            letterSpacing: '0.04em',
          }}>
            {code.chapter}
          </span>
        )}
        {hasDetails && (
          <span style={{
            flex: '0 0 auto',
            color: '#9CA3AF',
            fontSize: 12,
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 150ms',
            display: 'inline-flex',
          }} aria-hidden>
            ▶
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {hasDetails && expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.22, ease: [0.05, 0.7, 0.1, 1] },
              opacity: { duration: 0.16 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '14px 20px 18px',
              background: isCard ? '#FAFBFC' : '#FFFFFF',
              borderTop: '1px solid #F0F1F5',
              fontSize: 13.5, lineHeight: 1.55, color: '#374151',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {code.definition && (
                <DetailBlock label="Определение">
                  {code.definition}
                </DetailBlock>
              )}
              {code.longDefinition && code.longDefinition !== code.definition && (
                <DetailBlock label="Описание">
                  {code.longDefinition}
                </DetailBlock>
              )}
              {/* Inherited (от родителя) — показываем только если своих нет */}
              {!code.definition && code.inheritedDefinition && (
                <DetailBlock label={`Определение (от родителя ${code.inheritedFrom ?? ''})`}>
                  {code.inheritedDefinition}
                </DetailBlock>
              )}
              {!code.longDefinition && code.inheritedLongDefinition && code.inheritedLongDefinition !== code.inheritedDefinition && (
                <DetailBlock label={`Описание (от родителя ${code.inheritedFrom ?? ''})`}>
                  {code.inheritedLongDefinition}
                </DetailBlock>
              )}
              {code.codingNote && (
                <DetailBlock label="Заметка по кодированию" tone="warning">
                  {code.codingNote}
                </DetailBlock>
              )}
              {code.inclusion && code.inclusion.length > 0 && (
                <DetailBlock label="Включает">
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {code.inclusion.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </DetailBlock>
              )}
              {!code.inclusion?.length && code.inheritedInclusion && code.inheritedInclusion.length > 0 && (
                <DetailBlock label={`Включает (от родителя ${code.inheritedFrom ?? ''})`}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {code.inheritedInclusion.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </DetailBlock>
              )}
              {code.exclusion && code.exclusion.length > 0 && (
                <DetailBlock label="Не включает (исключения)">
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {code.exclusion.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </DetailBlock>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
