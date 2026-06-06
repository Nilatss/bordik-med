/**
 * P1-CR-3 step 6/7 — Lesson markdown content с custom renderers.
 *
 * Самый большой extracted sub-component (~140 LOC) — оборачивает
 * ReactMarkdown с overrides:
 *
 * - `table` — детектит "useful tables" (header keywords / 3+ cols + 4+ rows)
 *   и оборачивает в DownloadableTable (PDF export). Простые таблицы
 *   просто получают .table-scroll wrapper для узких контентных колонок.
 *
 * - `blockquote` — детектит leading emoji (ℹ ⚠ 📷 ✓ ✅ 🎯 💡) и
 *   рендерит соответствующий callout-style. 📷 со специальным синтаксисом
 *   #N.M.K вызывает CourseIllustration.
 *
 * Принимает `body` (preprocessed markdown — em-dashes replaced, callout-
 * tables converted to blockquotes; см. lib/course/lesson-utils.ts).
 *
 * Также принимает `tabContext` — для генерации title'а downloadable
 * tables в формате "<Tab short> - Col1 / Col2 / Col3".
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { safeUrlTransform, sanitizeSchema } from '@/lib/safe-markdown';
import { extractText, stripLeadingEmoji } from '@/lib/course/lesson-utils';
import { CourseIllustration } from '../CourseIllustrations';
import DownloadableTable from '../DownloadableTable';

interface LessonContentProps {
  /** Pre-processed markdown body (см. preprocessContent). */
  body: string;
  /** Контекст активной вкладки для table title generation. */
  tabContext: { short?: string; title?: string };
}

// "Useful table" keywords — определяют, надо ли давать PDF-кнопку.
const USEFUL_KEYWORDS = [
  // словари / термины
  'корень', 'префикс', 'суффикс', 'термин', 'аббревиат', 'обозначени',
  // нормы и значения
  'норма', 'референс', 'диапазон', 'показател',
  // препараты
  'препарат', 'дозировк', 'доза', 'лекарств', 'действующ',
  // формулы / классификации
  'формула', 'классификаци', 'стадия', 'стадии', 'шкала', 'балл', 'градац',
  // симптомы / диагнозы
  'симптом', 'синдром', 'критери', 'признак',
  'этиологи', 'патоген', 'заболеван', 'болезн', 'диагноз', 'диагностик',
  // анатомия / физиология
  'орган', 'систем', 'функция', 'роль', 'структур', 'ткань',
  // химия / физика
  'вещество', 'элемент', 'реакци', 'соединени', '\\bph\\b',
  // методы и процессы
  'метод', 'процесс', 'применени', 'лечени', 'терапи',
  // статистика / единицы
  'единиц', 'размер', 'масштаб',
];

export function LessonContent({ body, tabContext }: LessonContentProps) {
  return (
    <div className="lesson-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        urlTransform={safeUrlTransform}
        components={{
          table: ({ children, node }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const theadNode = (node as any)?.children?.find?.((c: any) => c.tagName === 'thead');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const thRow = theadNode?.children?.find?.((c: any) => c.tagName === 'tr');
            const headersRaw: string[] = thRow?.children
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ?.filter((c: any) => c.tagName === 'th')
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ?.map((c: any) => extractText(c.children as never)) || [];
            const headers = headersRaw.map((h) => h.toLowerCase());
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tbodyNode = (node as any)?.children?.find?.((c: any) => c.tagName === 'tbody');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rowCount = tbodyNode?.children?.filter?.((c: any) => c.tagName === 'tr').length || 0;
            const colCount = headers.length;

            const hasKeyword = headers.some((h) =>
              USEFUL_KEYWORDS.some((kw) => new RegExp(kw).test(h))
            );
            const isLarge = colCount >= 3 && rowCount >= 4;
            const isUseful = hasKeyword || isLarge;

            if (!isUseful) {
              return (
                <div className="table-scroll">
                  <table>{children}</table>
                </div>
              );
            }
            // Build a descriptive title: "<Tab> - Col1 / Col2 / Col3"
            const headerLabel = headersRaw.length > 0
              ? headersRaw
                  .slice(0, 3)
                  .map((h) => h.trim())
                  .map((h) => h.charAt(0).toUpperCase() + h.slice(1))
                  .join(' / ')
              : '';
            const contextTitle = tabContext.short && tabContext.short !== 'Введение'
              ? tabContext.short
              : ((tabContext.title || '').replace(/^Тема\s+\d+\.?\s*/, '').split(/[--]/)[0] ?? '').trim();
            const title = [contextTitle, headerLabel].filter(Boolean).join(' - ')
              || headerLabel
              || 'Справочная таблица';
            return (
              <DownloadableTable title={title}>
                <table>{children}</table>
              </DownloadableTable>
            );
          },
          blockquote: ({ children }) => {
            const text = extractText(children).trim();
            let className = 'callout';
            let icon = '';
            let label = '';
            if (text.startsWith('ℹ')) {
              className += ' callout-info';
              icon = 'ℹ';
              label = 'Информация';
            } else if (text.startsWith('⚠')) {
              className += ' callout-warning';
              icon = '⚠';
              label = 'Важно';
            } else if (text.startsWith('📷')) {
              className += ' callout-image';
              label = 'Иллюстрация';
              const idMatch = text.match(/#(\d+\.\d+\.\d+)/);
              const illustrationId = idMatch ? idMatch[1] : null;
              return (
                <blockquote className={className}>
                  <div className="callout-label">
                    <span>{label}</span>
                  </div>
                  {illustrationId && <CourseIllustration id={illustrationId} />}
                </blockquote>
              );
            } else if (text.startsWith('✓') || text.startsWith('✅')) {
              className += ' callout-success';
              icon = '✓';
              label = 'Главное';
            } else if (text.startsWith('🎯')) {
              className += ' callout-goal';
              icon = '🎯';
              label = 'Цель';
            } else if (text.startsWith('💡')) {
              className += ' callout-tip';
              icon = '💡';
              label = 'Совет';
            }
            return (
              <blockquote className={className}>
                {icon && (
                  <div className="callout-label">
                    <span>{label}</span>
                  </div>
                )}
                <div className="callout-body">{stripLeadingEmoji(children)}</div>
              </blockquote>
            );
          },
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
