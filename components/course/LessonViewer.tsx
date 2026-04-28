'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen } from '@/components/icons';
import { safeUrlTransform } from '@/lib/safe-markdown';

interface LessonViewerProps {
  content: string | null;
}

export default function LessonViewer({ content }: LessonViewerProps) {
  if (!content) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 'var(--content-max)', padding: 'var(--space-8)' }}>
          <div style={{
            color: 'var(--md-sys-color-on-surface-variant)',
            marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'center',
          }}>
            <BookOpen size={40} strokeWidth={1} />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 500,
            color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-2)',
          }}>
            Контент готовится
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
            color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6,
          }}>
            Статья для этого курса ещё не добавлена. Она появится здесь по мере наполнения.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div className="lesson-content" style={{ maxWidth: 'var(--content-max)' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={safeUrlTransform}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
