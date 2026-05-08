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
  return (
    <div>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: tone === 'warning' ? '#92400E' : '#9CA3AF',
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        color: tone === 'warning' ? '#78350F' : '#374151',
      }}>
        {children}
      </div>
    </div>
  );
}
