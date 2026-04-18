'use client';

import type { Difficulty } from '@/lib/curriculum';

export type DifficultyFilterValue = 'all' | Difficulty;

const OPTIONS: { value: DifficultyFilterValue; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'basic', label: 'Базовый' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
];

interface Props {
  value: DifficultyFilterValue;
  onChange: (v: DifficultyFilterValue) => void;
}

export default function DifficultyFilter({ value, onChange }: Props) {
  return (
    <div style={{
      display: 'flex', gap: 8, marginBottom: 'var(--space-4)', flexWrap: 'wrap',
    }}>
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: isActive ? '#1A1A1A' : '#F5F6F8',
              color: isActive ? '#FFFFFF' : '#555',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = '#E8E9ED';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = '#F5F6F8';
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
