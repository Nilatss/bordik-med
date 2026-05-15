/**
 * QuestionPanel — phases 'asking' и 'reviewing'. Topic chip + question text +
 * lettered option list (A, B, C, D) + (review-mode) explanation + Next button.
 *
 * P1-CR-3 step 5/6 — extracted from DiagnosticTest.tsx.
 */
import { motion } from 'framer-motion';
import type { ServerQuestion, Phase } from '@/lib/diagnostic/types';
import { topicRu } from '@/lib/diagnostic/utils';
import { fadeProps, panelClass, primaryBtnClass } from './styles';

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
    <motion.div key={`q-${indexNow}`} {...fadeProps} className={panelClass}>
      <p className="font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mt-0 mb-2 mx-0">
        Тема · {topicRu(current.topic)}
      </p>
      <h3 className="font-[var(--font-display)] text-lg font-bold text-[#1A1A1A] tracking-[-0.01em] leading-[1.35] mt-0 mb-[18px] mx-0">
        {current.question}
      </h3>
      <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
        {current.options.map((opt, i) => {
          const isPicked = picked === i;
          const isReview = phase === 'reviewing';
          const isCorrect = i === current.correctIndex;
          let stateClass = 'bg-[#F5F6F8] hover:bg-[#E8E9ED] text-[#1A1A1A] border-none';
          if (isReview) {
            if (isCorrect) stateClass = 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]';
            else if (isPicked) stateClass = 'bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B]';
            else stateClass = 'bg-[#F5F6F8] text-[#1A1A1A] border-none';
          } else if (isPicked) {
            stateClass = 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF]';
          }
          const letterBg = isReview && isCorrect
            ? 'bg-[#10B981]'
            : isReview && isPicked
              ? 'bg-[#DC2626]'
              : isPicked
                ? 'bg-[#3B82F6]'
                : 'bg-[#E2E4EA]';
          return (
            <li key={i}>
              <button
                onClick={() => onPick(i)}
                disabled={isReview}
                className={`w-full text-left py-3 px-4 rounded-[12px] font-[var(--font-body)] text-sm leading-[1.45] flex items-start gap-3 transition-[background,border-color,color] duration-[160ms] ${isReview ? 'cursor-default' : 'cursor-pointer'} ${stateClass}`}
              >
                <span className={`shrink-0 mt-0.5 w-[22px] h-[22px] rounded-[6px] text-white font-[var(--font-mono)] text-[11px] font-bold inline-flex items-center justify-center ${letterBg}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {phase === 'reviewing' && current.explanation && (
        <div className="mt-4 py-3 px-[14px] bg-[#F8FAFC] rounded-[10px] font-[var(--font-body)] text-[13px] text-[#475569] leading-[1.55]">
          <strong className="text-[#1A1A1A] block mb-1">Пояснение</strong>
          {current.explanation}
        </div>
      )}

      {phase === 'reviewing' && (
        <div className="flex justify-end mt-[18px]">
          <button onClick={onNext} className={primaryBtnClass}>
            {historyLength + 1 >= total ? 'Получить рекомендацию' : 'Следующий вопрос →'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
