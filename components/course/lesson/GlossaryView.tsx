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
import { renderInlineMd } from '@/components/ui/MarkdownLite';

interface GlossaryViewProps {
  body: string;
}

export function GlossaryView({ body }: GlossaryViewProps) {
  const { intro, outro, terms } = parseGlossary(body);
  return (
    <div>
      {intro && (
        <p className="font-[var(--font-body)] text-sm text-[#555] leading-[1.65] mb-[18px]">
          {renderInlineMd(intro)}
        </p>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2.5">
        {terms.map(({ term, def }, i) => (
          <div
            key={i}
            className="bg-[#F5F6F8] rounded-[12px] py-[14px] px-4 flex flex-col gap-1"
          >
            <p className="font-[var(--font-display)] text-sm font-bold text-[#1A1A1A] tracking-[-0.01em] leading-[1.3]">
              {renderInlineMd(term)}
            </p>
            {def && (
              <p className="font-[var(--font-body)] text-[13px] text-[#4B5563] leading-[1.55]">
                {renderInlineMd(def)}
              </p>
            )}
          </div>
        ))}
      </div>
      {outro && (
        <p className="font-[var(--font-body)] text-sm text-[#555] leading-[1.65] mt-[18px]">
          {renderInlineMd(outro)}
        </p>
      )}
    </div>
  );
}
