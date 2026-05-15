/**
 * P1-CR-3 (Icd10Lookup split, step 3/6) — labelled detail block.
 *
 * Простой layout-helper: uppercase label сверху, body снизу.
 * Используется в CodeRow для отображения полей expanded code-card
 * (definition, longDefinition, inclusion, exclusion, codingNote).
 *
 * tone:
 *  - 'neutral' (default) — серый label + текст
 *  - 'warning' — янтарный (для exclusion блоков)
 */
import type { ReactNode } from 'react';

interface DetailBlockProps {
  label: string;
  tone?: 'neutral' | 'warning';
  children: ReactNode;
}

export function DetailBlock({ label, tone = 'neutral', children }: DetailBlockProps) {
  const labelColor = tone === 'warning' ? 'text-[#92400E]' : 'text-[#9CA3AF]';
  const bodyColor = tone === 'warning' ? 'text-[#78350F]' : 'text-[#374151]';
  return (
    <div>
      <div className={`text-[11px] font-semibold tracking-[0.06em] uppercase mb-1.5 ${labelColor}`}>
        {label}
      </div>
      <div className={bodyColor}>
        {children}
      </div>
    </div>
  );
}
