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
import { fadeProps, primaryBtn, secondaryBtn, pillStyle } from './styles';

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
    <motion.div key="done" {...fadeProps} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Hero card with profession */}
      <div style={{
        padding: 'clamp(20px, 4vw, 32px)',
        background: '#F5F6F8',
        borderRadius: 18,
      }}>
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Рекомендуемое направление
        </p>
        <h3 style={{
          margin: '8px 0 10px',
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>
          {final.profession}
        </h3>
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#374151',
          lineHeight: 1.55,
        }}>
          {final.professionRationale}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          <span style={pillStyle}>Уровень: {levelRu(final.level)}</span>
          <span style={pillStyle}>{correctSoFar}/{historyLength} верных ответов</span>
        </div>
      </div>

      {/* Strengths + weaknesses */}
      {(final.strengths.length > 0 || final.weaknesses.length > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}>
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
        <div style={{
          padding: '16px 18px', borderRadius: 14,
          background: '#FFFFFF', border: '1px solid #E5E7EB',
        }}>
          <p style={{
            margin: 0,
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            План обучения
          </p>
          <p style={{
            margin: '6px 0 0',
            fontFamily: 'var(--font-body)', fontSize: 14, color: '#1A1A1A',
            lineHeight: 1.55,
          }}>
            {final.studyPlan}
          </p>
        </div>
      )}

      {/* Recommended modules */}
      {final.recommendedModuleIds.length > 0 && (
        <div>
          <h4 style={{
            margin: '0 0 12px',
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
            color: '#1A1A1A',
          }}>
            Рекомендуемые модули
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                  style={{
                    textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    background: '#F5F6F8', border: 'none',
                    borderRadius: 12, cursor: 'pointer',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F0F2F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F5F6F8';
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: '#2563EB', color: '#FFFFFF',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                      color: '#1A1A1A', lineHeight: 1.3,
                    }}>
                      {mod.title}
                    </span>
                    <span style={{
                      display: 'block', marginTop: 2,
                      fontFamily: 'var(--font-body)', fontSize: 12, color: '#6B7280',
                      lineHeight: 1.4,
                    }}>
                      {mod.description}
                    </span>
                  </span>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                    stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0 }}>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
        <button onClick={onRestart} style={secondaryBtn}>Пройти заново</button>
        <button onClick={onClose} style={primaryBtn}>Закрыть</button>
      </div>
    </motion.div>
  );
}
