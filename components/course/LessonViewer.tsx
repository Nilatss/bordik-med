'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { BookOpen } from '@/components/icons';
import { safeUrlTransform, sanitizeSchema } from '@/lib/safe-markdown';

interface LessonViewerProps {
  content: string | null;
}

export default function LessonViewer({ content }: LessonViewerProps) {
  if (!content) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-[var(--content-max)] p-[var(--space-8)]">
          <div className="text-[color:var(--md-sys-color-on-surface-variant)] mb-[var(--space-4)] flex justify-center">
            <BookOpen size={40} strokeWidth={1} />
          </div>
          <h3 className="font-[var(--font-display)] text-[length:var(--text-lg)] font-medium text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-2)]">
            Контент готовится
          </h3>
          <p className="font-[var(--font-body)] text-[length:var(--text-sm)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.6]">
            Статья для этого курса ещё не добавлена. Она появится здесь по мере наполнения.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="lesson-content max-w-[var(--content-max)]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
          urlTransform={safeUrlTransform}
          components={{
            // Все таблицы оборачиваем в scroll-wrapper, чтобы 4+
            // колонок не обрезались справа на узких контентных
            // колонках (рядом с TOC-сайдбаром).
            table: ({ children }) => (
              <div className="table-scroll">
                <table>{children}</table>
              </div>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
