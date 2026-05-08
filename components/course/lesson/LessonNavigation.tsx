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
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 12,
      marginTop: 32, paddingTop: 20,
      borderTop: '1px solid #F0F0F0',
    }}>
      {prevTab ? (
        <button
          onClick={() => onSelect(prevTab.id)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: '#F5F6F8', color: '#1A1A1A',
            border: 'none', borderRadius: 10,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
            transition: 'background 180ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
        >
          ← {prevTab.short}
        </button>
      ) : <span />}
      {nextTab ? (
        <button
          onClick={() => onSelect(nextTab.id)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: '#3B82F6', color: '#FFF',
            border: 'none', borderRadius: 10,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            transition: 'background 180ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#3B82F6'; }}
        >
          {nextTab.short} →
        </button>
      ) : null}
    </div>
  );
}
