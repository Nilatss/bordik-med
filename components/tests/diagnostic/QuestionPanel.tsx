/**
 * QuestionPanel — phases 'asking' и 'reviewing'. Topic chip + question text +
 * lettered option list (A, B, C, D) + (review-mode) explanation + Next button.
 *
 * P1-CR-3 step 5/6 — extracted from DiagnosticTest.tsx.
 */
import { motion } from 'framer-motion';
import type { ServerQuestion, Phase } from '@/lib/diagnostic/types';
import { topicRu } from '@/lib/diagnostic/utils';
import { fadeProps, panelStyle, primaryBtn } from './styles';

interface Props {
  current: ServerQuestion;
  phase: Phase;
  picked: number | null;
  indexNow: number;
  historyLength: number;
  total: number;
  onPick: (i: number) => void;
  onNext: () => void;
}

export function QuestionPanel({
  current,
  phase,
  picked,
  indexNow,
  historyLength,
  total,
  onPick,
  onNext,
}: Props) {
  return (
    <motion.div key={`q-${indexNow}`} {...fadeProps} style={panelStyle}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
        margin: '0 0 8px',
      }}>
        Тема · {topicRu(current.topic)}
      </p>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
        color: '#1A1A1A', letterSpacing: '-0.01em', lineHeight: 1.35,
        margin: '0 0 18px',
      }}>
        {current.question}
      </h3>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {current.options.map((opt, i) => {
          const isPicked = picked === i;
          const isReview = phase === 'reviewing';
          const isCorrect = i === current.correctIndex;
          let bg = '#F5F6F8';
          let border = 'none';
          let color = '#1A1A1A';
          if (isReview) {
            if (isCorrect) { bg = '#ECFDF5'; border = '1px solid #A7F3D0'; color = '#065F46'; }
            else if (isPicked) { bg = '#FEF2F2'; border = '1px solid #FCA5A5'; color = '#991B1B'; }
          } else if (isPicked) {
            bg = '#EFF6FF'; border = '1px solid #BFDBFE'; color = '#1E40AF';
          }
          return (
            <li key={i}>
              <button
                onClick={() => onPick(i)}
                disabled={isReview}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '12px 16px', borderRadius: 12,
                  background: bg, border, color,
                  cursor: isReview ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.45,
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  transition: 'background 160ms, border-color 160ms, color 160ms',
                }}
                onMouseEnter={(e) => {
                  if (!isReview && !isPicked) e.currentTarget.style.background = '#E8E9ED';
                }}
                onMouseLeave={(e) => {
                  if (!isReview && !isPicked) e.currentTarget.style.background = '#F5F6F8';
                }}
              >
                <span style={{
                  flexShrink: 0, marginTop: 2,
                  width: 22, height: 22, borderRadius: 6,
                  background: isReview && isCorrect ? '#10B981'
                    : isReview && isPicked ? '#DC2626'
                    : isPicked ? '#3B82F6'
                    : '#E2E4EA',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {phase === 'reviewing' && current.explanation && (
        <div style={{
          marginTop: 16, padding: '12px 14px',
          background: '#F8FAFC', borderRadius: 10,
          fontFamily: 'var(--font-body)', fontSize: 13, color: '#475569',
          lineHeight: 1.55,
        }}>
          <strong style={{ color: '#1A1A1A', display: 'block', marginBottom: 4 }}>Пояснение</strong>
          {current.explanation}
        </div>
      )}

      {phase === 'reviewing' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button onClick={onNext} style={primaryBtn}>
            {historyLength + 1 >= total ? 'Получить рекомендацию' : 'Следующий вопрос →'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
