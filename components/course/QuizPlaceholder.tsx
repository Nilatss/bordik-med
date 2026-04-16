'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';

interface QuizPlaceholderProps {
  courseId: string;
}

/**
 * Quiz placeholder — shows a "Take test" button.
 * When real quizzes are added, this will load questions per courseId.
 * For now: marks course as completed on "pass".
 */
export default function QuizPlaceholder({ courseId }: QuizPlaceholderProps) {
  const { completedCourses, markCompleted } = useAppStore();
  const isCompleted = completedCourses.includes(courseId);
  const [showQuiz, setShowQuiz] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  if (isCompleted && !showQuiz) {
    return (
      <div style={{
        background: 'var(--md-sys-color-primary-container)',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--space-5)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500,
          color: 'var(--md-sys-color-on-primary-container)',
        }}>
          Курс пройден
        </span>
        <button
          onClick={() => setShowQuiz(true)}
          style={{
            marginLeft: 'auto', padding: '4px var(--space-3)',
            borderRadius: 'var(--md-sys-shape-corner-full)',
            background: 'transparent', border: '1px solid var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-primary)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Пройти тест снова
        </button>
      </div>
    );
  }

  if (!showQuiz) {
    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--space-6)',
        textAlign: 'center',
      }}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-on-surface-variant)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--space-3)' }}>
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        <h4 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-2)',
        }}>
          Проверьте знания
        </h4>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
          color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--space-4)',
        }}>
          Пройдите тест для оценки прогресса по этому курсу
        </p>
        <button
          onClick={() => setShowQuiz(true)}
          style={{
            padding: '0 var(--space-6)', height: 40,
            borderRadius: 'var(--md-sys-shape-corner-full)',
            background: 'var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-on-primary)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600,
          }}
        >
          Начать тест
        </button>
      </div>
    );
  }

  // Simple placeholder quiz
  if (score === null) {
    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--space-6)',
      }}>
        <h4 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-4)',
        }}>
          Тест
        </h4>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
          color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--space-6)',
        }}>
          Вопросы для этого курса будут добавлены. Пока вы можете отметить курс как пройденный.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={() => { setScore(100); markCompleted(courseId); }}
            style={{
              padding: '0 var(--space-6)', height: 40,
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600,
            }}
          >
            Отметить пройденным
          </button>
          <button
            onClick={() => setShowQuiz(false)}
            style={{
              padding: '0 var(--space-6)', height: 40,
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: 'transparent',
              color: 'var(--md-sys-color-on-surface-variant)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500,
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  // Score result
  return (
    <div style={{
      background: 'var(--md-sys-color-primary-container)',
      borderRadius: 'var(--md-sys-shape-corner-extra-large)',
      padding: 'var(--space-6)', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700,
        color: 'var(--md-sys-color-primary)', marginBottom: 'var(--space-2)',
      }}>
        {score}%
      </div>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
        color: 'var(--md-sys-color-on-primary-container)',
      }}>
        Курс отмечен как пройденный
      </p>
    </div>
  );
}
