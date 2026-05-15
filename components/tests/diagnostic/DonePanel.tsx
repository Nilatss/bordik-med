/**
 * DonePanel — phase 'done'. Final result hero (profession + rationale + level
 * pills), strengths/weaknesses lists, study plan, recommended modules,
 * restart/close footer.
 *
 * P1-CR-3 step 6/6 — extracted from DiagnosticTest.tsx.
 *
 * Bordik monochrome (no blue gradient) — same #F5F6F8 surface as section/
 * module cards so the result page reads as part of the platform.
 */
import { motion } from 'framer-motion';
import { modules } from '@/lib/curriculum';
import type { FinalResult } from '@/lib/diagnostic/types';
import { levelRu } from '@/lib/diagnostic/utils';
import { ListPanel } from './ListPanel';
import { fadeProps, primaryBtnClass, secondaryBtnClass, pillClass } from './styles';

interface Props {
  final: FinalResult;
  correctSoFar: number;
  historyLength: number;
  onOpenCourse: (id: string) => void;
  onRestart: () => void;
  onClose: () => void;
}

export function DonePanel({
  final,
  correctSoFar,
  historyLength,
  onOpenCourse,
  onRestart,
  onClose,
}: Props) {
  return (
    <motion.div key="done" {...fadeProps} className="flex flex-col gap-[18px]">
      {/* Hero card with profession */}
      <div className="p-[clamp(20px,4vw,32px)] bg-[#F5F6F8] rounded-[18px]">
        <p className="m-0 font-[var(--font-mono)] text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.08em]">
          Рекомендуемое направление
        </p>
        <h3 className="mt-2 mb-2.5 mx-0 font-[var(--font-display)] text-[28px] font-bold text-[#1A1A1A] tracking-[-0.02em] leading-[1.1]">
          {final.profession}
        </h3>
        <p className="m-0 font-[var(--font-body)] text-sm text-[#374151] leading-[1.55]">
          {final.professionRationale}
        </p>
        <div className="flex flex-wrap gap-2 mt-[14px]">
          <span className={pillClass}>Уровень: {levelRu(final.level)}</span>
          <span className={pillClass}>{correctSoFar}/{historyLength} верных ответов</span>
        </div>
      </div>

      {/* Strengths + weaknesses */}
      {(final.strengths.length > 0 || final.weaknesses.length > 0) && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[14px]">
          {final.strengths.length > 0 && (
            <ListPanel title="Сильные стороны" tone="green" items={final.strengths} />
          )}
          {final.weaknesses.length > 0 && (
            <ListPanel title="Над чем поработать" tone="amber" items={final.weaknesses} />
          )}
        </div>
      )}

      {/* Study plan */}
      {final.studyPlan && (
        <div className="py-4 px-[18px] rounded-[14px] bg-white border border-[#E5E7EB]">
          <p className="m-0 font-[var(--font-mono)] text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.08em]">
            План обучения
          </p>
          <p className="mt-1.5 mb-0 mx-0 font-[var(--font-body)] text-sm text-[#1A1A1A] leading-[1.55]">
            {final.studyPlan}
          </p>
        </div>
      )}

      {/* Recommended modules */}
      {final.recommendedModuleIds.length > 0 && (
        <div>
          <h4 className="mt-0 mb-3 mx-0 font-[var(--font-display)] text-base font-bold text-[#1A1A1A]">
            Рекомендуемые модули
          </h4>
          <div className="flex flex-col gap-2">
            {final.recommendedModuleIds.map((id, idx) => {
              const mod = modules.find((m) => m.id === id);
              if (!mod) return null;
              return (
                <button
                  key={id}
                  onClick={() => {
                    // Open the module — if it has courses, jump to the first one
                    if (mod.courses[0]) onOpenCourse(mod.courses[0].id);
                  }}
                  className="text-left flex items-center gap-[14px] py-[14px] px-4 bg-[#F5F6F8] hover:bg-[#F0F2F5] border-none rounded-[12px] cursor-pointer transition-colors duration-150"
                >
                  <span className="w-8 h-8 rounded-[10px] bg-[#2563EB] text-white inline-flex items-center justify-center font-[var(--font-mono)] text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-[var(--font-body)] text-sm font-semibold text-[#1A1A1A] leading-[1.3]">
                      {mod.title}
                    </span>
                    <span className="block mt-0.5 font-[var(--font-body)] text-xs text-[#6B7280] leading-[1.4]">
                      {mod.description}
                    </span>
                  </span>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                    stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    className="shrink-0">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex justify-end gap-2 mt-1.5">
        <button onClick={onRestart} className={secondaryBtnClass}>Пройти заново</button>
        <button onClick={onClose} className={primaryBtnClass}>Закрыть</button>
      </div>
    </motion.div>
  );
}
