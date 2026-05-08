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
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      marginBottom: 16, paddingBottom: 16,
      borderBottom: '1px solid #F0F0F0',
    }}>
      <span style={{ display: 'flex', color: '#1A1A1A' }}>
        <TabIcon name={iconKey} size={24} />
      </span>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
        color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.01em',
      }}>
        {title}
      </h2>
    </div>
  );
}
