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

  const containerClass = isCard
    ? 'bg-white hover:bg-[#F5F6F8] border border-[#F0F1F5] hover:border-[#E2E4EA] rounded-[14px] overflow-hidden transition-[border-color,background] duration-150'
    : 'bg-transparent hover:bg-[#EFF1F4] transition-colors duration-[120ms]';

  const headerClass = `flex items-center gap-[14px] ${isCard ? 'py-[14px] px-5' : 'py-2.5 px-5'} bg-transparent border-none w-full text-left font-[inherit] text-inherit ${hasDetails ? 'cursor-pointer' : 'cursor-default'}`;

  const TitleNode = query
    ? <Highlight text={titleText} query={query} />
    : titleText;

  return (
    <div className={containerClass}>
      <button
        type="button"
        onClick={() => { if (hasDetails) setExpanded((v) => !v); }}
        aria-expanded={hasDetails ? expanded : undefined}
        className={headerClass}
      >
        <span className={`flex-[0_0_80px] font-[var(--font-mono,ui-monospace)] font-bold ${isCard ? 'text-[13px]' : 'text-[12.5px]'} text-[#2563EB] tracking-[0.02em]`}>
          {query ? <Highlight text={code.code} query={query} /> : code.code}
        </span>
        <span className={`flex-1 ${isCard ? 'text-sm' : 'text-[13.5px]'} text-[#1A1A1A] leading-[1.45]`}>
          {TitleNode}
        </span>
        {isCard && (
          <span className="flex-[0_0_auto] font-[var(--font-mono,ui-monospace)] text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] py-0.5 px-2 rounded-full whitespace-nowrap tracking-[0.04em]">
            {code.chapter}
          </span>
        )}
        {hasDetails && (
          <span
            className={`flex-[0_0_auto] text-[#9CA3AF] text-xs transition-transform duration-150 inline-flex ${expanded ? 'rotate-90' : ''}`}
            aria-hidden
          >
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
            className="overflow-hidden"
          >
            <div className={`pt-[14px] px-5 pb-[18px] ${isCard ? 'bg-[#FAFBFC]' : 'bg-white'} border-t border-[#F0F1F5] text-[13.5px] leading-[1.55] text-[#374151] flex flex-col gap-3`}>
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
                  <ul className="m-0 pl-[18px]">
                    {code.inclusion.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </DetailBlock>
              )}
              {!code.inclusion?.length && code.inheritedInclusion && code.inheritedInclusion.length > 0 && (
                <DetailBlock label={`Включает (от родителя ${code.inheritedFrom ?? ''})`}>
                  <ul className="m-0 pl-[18px]">
                    {code.inheritedInclusion.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </DetailBlock>
              )}
              {code.exclusion && code.exclusion.length > 0 && (
                <DetailBlock label="Не включает (исключения)">
                  <ul className="m-0 pl-[18px]">
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
