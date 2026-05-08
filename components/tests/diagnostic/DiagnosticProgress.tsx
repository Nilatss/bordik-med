/**
 * DiagnosticProgress — top progress bar + counter ("Вопрос N из M · X/Y верных").
 *
 * P1-CR-3 step 3/6 — extracted from DiagnosticTest.tsx.
 */
import { motion } from 'framer-motion';
import type { Phase } from '@/lib/diagnostic/types';

interface Props {
  phase: Phase;
  indexNow: number;
  total: number;
  correctSoFar: number;
  historyLength: number;
  progressPct: number;
}

export function DiagnosticProgress({
  phase,
  indexNow,
  total,
  correctSoFar,
  historyLength,
  progressPct,
}: Props) {
  // Hidden in done/error phases — caller may also gate, мы дублируем для
  // safety + чтобы компонент был «honest» в self-contained использовании.
  if (phase === 'done' || phase === 'error') return null;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 6,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6B7280' }}>
          {phase === 'finalizing'
            ? 'Собираем рекомендацию…'
            : `Вопрос ${Math.min(indexNow + 1, total)} из ${total}`}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9CA3AF' }}>
          {correctSoFar}/{historyLength} верных
        </span>
      </div>
      <div style={{
        height: 6, borderRadius: 999, background: '#F1F3F6', overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: [0.05, 0.7, 0.1, 1] }}
          style={{ height: '100%', background: '#2563EB', borderRadius: 999 }}
        />
      </div>
    </div>
  );
}
