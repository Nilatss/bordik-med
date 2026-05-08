/**
 * P1-CR-3 step 3/7 — GlossaryView для лесcon-табов с iconKey='glossary'.
 *
 * Парсит plain-text body вида "Term: definition" в карточки grid.
 * Используется в TabbedLessonViewer когда `active.iconKey === 'glossary'`.
 *
 * parseGlossary вынесен отдельно в lib/course/lesson-utils.ts —
 * pure-функция без React-зависимостей, чтобы можно было unit-test'ить.
 */
import { parseGlossary } from '@/lib/course/lesson-utils';

interface GlossaryViewProps {
  body: string;
}

export function GlossaryView({ body }: GlossaryViewProps) {
  const { intro, terms } = parseGlossary(body);
  return (
    <div>
      {intro && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#555',
          lineHeight: 1.65, marginBottom: 18,
        }}>
          {intro}
        </p>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 10,
      }}>
        {terms.map(({ term, def }, i) => (
          <div
            key={i}
            style={{
              background: '#F5F6F8',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
              color: '#1A1A1A', letterSpacing: '-0.01em', lineHeight: 1.3,
            }}>
              {term}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13, color: '#4B5563',
              lineHeight: 1.55,
            }}>
              {def}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
