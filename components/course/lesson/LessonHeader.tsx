/**
 * P1-CR-3 step 4/7 — Lesson card header (icon + title + bottom border).
 *
 * Тонкий presentational. Принимает iconKey (см. TabIcon допустимые
 * значения) и title (полный, не short). Используется как заголовок
 * tab content card в TabbedLessonViewer.
 */
import { TabIcon } from './TabIcon';

interface LessonHeaderProps {
  iconKey: string;
  title: string;
}

export function LessonHeader({ iconKey, title }: LessonHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F0F0F0]">
      <span className="flex text-[#1A1A1A]">
        <TabIcon name={iconKey} size={24} />
      </span>
      <h2 className="font-[var(--font-display)] text-[22px] font-bold text-[#1A1A1A] leading-[1.2] tracking-[-0.01em]">
        {title}
      </h2>
    </div>
  );
}
