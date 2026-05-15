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
    <div className="flex gap-2 mb-4 flex-wrap">
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        const activeClass = isActive
          ? 'bg-[#1A1A1A] text-white font-semibold'
          : 'bg-[#F5F6F8] text-[#555] font-medium hover:bg-[#E8E9ED]';
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`py-2 px-4 rounded-[var(--md-sys-shape-corner-full)] ${activeClass} border-none cursor-pointer font-[var(--font-body)] text-[13px] transition-all duration-150 ease-in`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
