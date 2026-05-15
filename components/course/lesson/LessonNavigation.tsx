/**
 * P1-CR-3 step 5/7 — Lesson prev/next navigation buttons.
 *
 * Принимает optional prevTab / nextTab (Tab subset с {id, short}) и
 * onSelect callback. Скрывает кнопки при отсутствии prev/next (но
 * сохраняет space-between layout через placeholder span).
 *
 * Стили: prev — серый F5F6F8 / hover EFF1F4, next — primary blue
 * 3B82F6 / hover 2563EB. Hover через inline onMouseEnter (не CSS),
 * чтобы избежать conflict'a с глобальными hover'ами.
 */
import type { Tab } from '@/lib/course/lesson-tabs';

interface LessonNavigationProps {
  prevTab?: Pick<Tab, 'id' | 'short'> | undefined;
  nextTab?: Pick<Tab, 'id' | 'short'> | undefined;
  onSelect: (tabId: string) => void;
}

export function LessonNavigation({ prevTab, nextTab, onSelect }: LessonNavigationProps) {
  return (
    <div className="flex justify-between gap-3 mt-8 pt-5 border-t border-[#F0F0F0]">
      {prevTab ? (
        <button
          onClick={() => onSelect(prevTab.id)}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#F5F6F8] hover:bg-[#EFF1F4] text-[#1A1A1A] border-none rounded-[10px] cursor-pointer font-[var(--font-body)] text-[13px] font-medium transition-colors duration-[180ms]"
        >
          ← {prevTab.short}
        </button>
      ) : <span />}
      {nextTab ? (
        <button
          onClick={() => onSelect(nextTab.id)}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white border-none rounded-[10px] cursor-pointer font-[var(--font-body)] text-[13px] font-semibold transition-colors duration-[180ms]"
        >
          {nextTab.short} →
        </button>
      ) : null}
    </div>
  );
}
