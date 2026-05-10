'use client';

/**
 * QuizRunner — interactive multi-choice quiz UI для Neonatology Module.
 * Audit Е1-Е4 — closes тесты и оценка знаний gap.
 *
 * UX (1:1 с TestsPage):
 *   - List view: grid карточек (rg-3), grouped by topic
 *   - Card: pill (вопросы + длительность), title, description, footer
 *   - Click card → fullscreen quiz takeover
 *   - Per-quiz score tracking + 70 % pass threshold
 *   - localStorage persists last attempts
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from '@/components/icons';

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title_ru: string;
  title_en: string;
  topic: string;
  level: string;
  questions: QuizQuestion[];
}

interface QuizBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  quizzes: Quiz[];
}

type QuizState = Record<string, {
  selected: Record<number, number>;
  submitted: boolean;
  score: number;
}>;

const TOPIC_LABELS: Record<string, string> = {
  resuscitation: 'Реанимация',
  respiratory: 'Респираторная',
  hepatic: 'Гепатобилиарная',
  infection: 'Инфекции',
  neuro: 'Неврология',
  gastro: 'ЖКТ + питание',
  metabolic: 'Метаболизм',
  screening: 'Скрининги',
};

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  basic: { label: 'Базовый', color: '#10B981' },
  intermediate: { label: 'Средний', color: '#F59E0B' },
  advanced: { label: 'Продвинутый', color: '#DC2626' },
};

const TOPIC_DESCRIPTIONS: Record<string, string> = {
  'quiz-resus-1': 'Положение, ЧСС, компрессии, адреналин, FiO₂ и SpO₂ цели по NRP 8 ed.',
  'quiz-rds': 'Сурфактант, antenatal стероиды, LISA, сравнение препаратов, FiO₂ thresholds.',
  'quiz-bili': 'Фототерапия, DVET volume, IVIG dose, формы ГБН и их частота.',
  'quiz-sepsis': 'EOS vs LOS этиология, empiric ABX, threshold sample timing, GBS.',
  'quiz-hie': 'Окно TH, целевая T core, критерии включения, antiконвульсанты.',
  'quiz-nutrition': 'Aminoacids start, GIR ranges, lipid emulsions, trophic feeds.',
  'quiz-iem': 'Принципы IEM rescue, hyperammonemia management, B12-responsive forms.',
  'quiz-screening': 'Sample timing, CCHD pulse oximetry, ROP screen для preterm.',
  'quiz-pphn': 'iNO, sildenafil, milrinone, ECMO criteria, vasopressin для warm shock.',
  'quiz-nec': 'Bell staging, pneumatosis intestinalis, triple ABX, surgical indications.',
  'quiz-pda': 'HSPDA ECHO criteria, ibuprofen / paracetamol / indomethacin closure.',
  'quiz-cooling-protocol': 'Rewarming rate, anticonvulsants, Hb targets во время cooling.',
  'quiz-eos-puopolo': 'Kaiser EOS calc, Puopolo Tiered, maternal risk factors, ABX duration.',
  'quiz-feeding-vlbw': 'Trophic feeds, advancement rate, HMF timing, ESPGHAN 2022.',
  'quiz-rop-treatment': 'Screening timing, Type 1 ETROP criteria, anti-VEGF preferred.',
  'quiz-bpd-management': 'NIH 2018 grades, BPD prevention, postnatal steroids DART scheme.',
  'quiz-glucose-thresholds': 'PES 2015 thresholds, critical sample workup, glucagon stim test.',
  'quiz-coag-thrombocytopenia': 'VKDB prophylaxis, PlaNeT-2 thresholds, NAIT management.',
  'quiz-cyanosis-shock': 'Hyperoxia test, cold/warm shock, reverse differential SpO₂ TGA.',
  'quiz-extubation': 'Extubation readiness criteria, NIPPV post-extubation < 1000 g.',
  'quiz-cardiac-defects-screening': 'CCHD pulse ox criteria, timing 24-48 h, fail thresholds.',
  'quiz-nas-ess': 'Modified Finnegan ≥ 8 × 3, BBORN buprenorphine, ESC functional approach.',
};

function estimateDuration(questionCount: number): string {
  // ~1.5 мин per question conservative
  const min = Math.ceil(questionCount * 1.5);
  return `${min} мин`;
}

export default function QuizRunner({
  query,
  onActiveChange,
}: {
  query: string;
  /** Notifies parent when an individual quiz is opened/closed (fullscreen
   *  takeover mode). Parent uses it to hide page header + search + breadcrumb
   *  while taking the test. */
  onActiveChange?: (isActive: boolean) => void;
}) {
  const [bank, setBank] = useState<QuizBank | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [state, setState] = useState<QuizState>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = window.localStorage.getItem('bordik-neonatal-quiz-state');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {};
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem('bordik-neonatal-quiz-state', JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  // Notify parent (NeonatalHandbook) when active quiz changes — used
  // to hide page header / search / breadcrumb during the takeover.
  useEffect(() => {
    onActiveChange?.(activeQuiz !== null);
  }, [activeQuiz, onActiveChange]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/neonatal-quizzes.json?v=1.2.0', { cache: 'force-cache' });
        if (!r.ok) throw new Error(`quizzes ${r.status}`);
        const json = await r.json();
        if (!cancelled) setBank(json as QuizBank);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredQuizzes = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    if (!q) return bank.quizzes;
    return bank.quizzes.filter((quiz) =>
      quiz.title_ru.toLowerCase().includes(q)
      || quiz.title_en.toLowerCase().includes(q)
      || quiz.topic.toLowerCase().includes(q)
      || quiz.questions.some((qu) => qu.q.toLowerCase().includes(q))
    );
  }, [bank, query]);

  const groupedByTopic = useMemo(() => {
    const map = new Map<string, Quiz[]>();
    for (const quiz of filteredQuizzes) {
      const topic = TOPIC_LABELS[quiz.topic] ?? quiz.topic;
      const arr = map.get(topic) ?? [];
      arr.push(quiz);
      map.set(topic, arr);
    }
    return Array.from(map.entries());
  }, [filteredQuizzes]);

  const handleSelect = (quizId: string, qIdx: number, optionIdx: number) => {
    setState((prev) => {
      const cur = prev[quizId] ?? { selected: {}, submitted: false, score: 0 };
      if (cur.submitted) return prev;
      return {
        ...prev,
        [quizId]: {
          ...cur,
          selected: { ...cur.selected, [qIdx]: optionIdx },
        },
      };
    });
  };

  const handleSubmit = (quiz: Quiz) => {
    setState((prev) => {
      const cur = prev[quiz.id] ?? { selected: {}, submitted: false, score: 0 };
      let correct = 0;
      quiz.questions.forEach((qu, idx) => {
        if (cur.selected[idx] === qu.answer) correct += 1;
      });
      return {
        ...prev,
        [quiz.id]: { ...cur, submitted: true, score: correct },
      };
    });
  };

  const handleReset = (quizId: string) => {
    setState((prev) => {
      const next = { ...prev };
      delete next[quizId];
      return next;
    });
  };

  if (error) {
    return (
      <div style={{
        padding: '24px 16px', background: '#FEF2F2',
        border: '1px solid #FECACA', borderRadius: 12,
        color: '#991B1B', fontSize: 14,
      }}>
        Не удалось загрузить тесты: {error}.
      </div>
    );
  }

  if (!bank) {
    return (
      <div>
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 160, width: '100%', borderRadius: 24, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 160, width: '100%', borderRadius: 24 }} />
      </div>
    );
  }

  // Active quiz view — full quiz interaction
  if (activeQuiz) {
    const quiz = bank.quizzes.find((qq) => qq.id === activeQuiz);
    if (!quiz) {
      setActiveQuiz(null);
      return null;
    }
    return (
      <ActiveQuizView
        quiz={quiz}
        state={state[quiz.id]}
        onClose={() => setActiveQuiz(null)}
        onSelect={(qIdx, optionIdx) => handleSelect(quiz.id, qIdx, optionIdx)}
        onSubmit={() => handleSubmit(quiz)}
        onReset={() => handleReset(quiz.id)}
      />
    );
  }

  // List view
  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Показано: <strong style={{ color: '#1A1A1A' }}>{filteredQuizzes.length}</strong> из {bank.quizzes.length} тестов
        {' · '}
        <span style={{ color: '#9CA3AF' }}>
          выберите тест и нажмите карточку чтобы начать
        </span>
      </p>

      {groupedByTopic.map(([topic, quizzes], catIdx) => {
        const headingId = `quiz-topic-${topic.replace(/\s+/g, '-')}-${catIdx}`;
        return (
        <motion.section
          key={topic}
          aria-labelledby={headingId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 + catIdx * 0.06 }}
          style={{ marginBottom: 28 }}
        >
          <h3 id={headingId} style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 12,
          }}>
            {topic}
          </h3>
          <div className="rg-3">
            {quizzes.map((quiz, i) => {
              const qState = state[quiz.id];
              const submitted = qState?.submitted ?? false;
              const score = qState?.score ?? 0;
              const total = quiz.questions.length;
              const passingScore = Math.ceil(total * 0.7);
              const passed = submitted && score >= passingScore;
              const lvl = LEVEL_LABELS[quiz.level];
              const description = TOPIC_DESCRIPTIONS[quiz.id] ?? `Тест по теме ${TOPIC_LABELS[quiz.topic] ?? quiz.topic}`;
              const cardAriaLabel = submitted
                ? `Тест: ${quiz.title_ru}. ${total} вопросов, ${lvl?.label ?? 'уровень не указан'}. Результат прошлой попытки: ${score} из ${total}, ${passed ? 'тест пройден' : 'тест не пройден'}. Нажмите чтобы пройти ещё раз.`
                : `Тест: ${quiz.title_ru}. ${total} вопросов, ${lvl?.label ?? 'уровень не указан'}. ${description} Нажмите чтобы начать.`;
              return (
                <motion.button
                  key={quiz.id}
                  type="button"
                  aria-label={cardAriaLabel}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
                  onClick={() => setActiveQuiz(quiz.id)}
                  style={{
                    background: '#F5F6F8',
                    borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                    border: 'none',
                    padding: 'var(--space-5)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'background 400ms cubic-bezier(0.22,1,0.36,1), transform 400ms cubic-bezier(0.22,1,0.36,1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F0F2F5';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F5F6F8';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Status badge top-right (submitted score or level) */}
                  {submitted ? (
                    <div style={{
                      position: 'absolute', top: 12, right: 12, zIndex: 2,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: passed ? '#059669' : '#B45309',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }}>
                      {passed ? 'PASS' : 'FAIL'} {score}/{total}
                    </div>
                  ) : null}

                  {/* Top pills - questions + duration + level */}
                  <div style={{
                    marginBottom: 'var(--space-3)', position: 'relative', zIndex: 1,
                    display: 'flex', flexWrap: 'wrap', gap: 6,
                  }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                      padding: '4px var(--space-2)',
                      borderRadius: 'var(--md-sys-shape-corner-full)',
                      background: '#FFFFFF',
                      boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 500,
                      color: 'var(--md-sys-color-on-surface-variant)',
                    }}>
                      {total} вопросов · {estimateDuration(total)}
                    </span>
                    {lvl && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '4px var(--space-2)',
                        borderRadius: 'var(--md-sys-shape-corner-full)',
                        background: '#FFFFFF',
                        boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                        fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 600,
                        color: lvl.color,
                      }}>
                        {lvl.label}
                      </span>
                    )}
                  </div>

                  {/* Middle: title + description */}
                  <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700,
                      color: 'var(--md-sys-color-on-surface)',
                      marginBottom: 'var(--space-1)', lineHeight: 1.25,
                    }}>
                      {quiz.title_ru}
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                      color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                    marginTop: 'var(--space-3)', position: 'relative', zIndex: 1,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
                      color: 'var(--md-sys-color-on-surface)',
                    }}>
                      {submitted ? 'Пройти ещё раз' : 'Начать тест'}
                    </span>
                    <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
        );
      })}

      {filteredQuizzes.length === 0 && (
        <div style={{
          padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
          textAlign: 'center', color: '#6B7280', fontSize: 14,
        }}>
          Ничего не найдено.
        </div>
      )}
    </div>
  );
}

/**
 * ActiveQuizView — fullscreen quiz interaction (когда test active).
 * Mirrors DiagnosticTest takeover-pattern.
 */
function ActiveQuizView({
  quiz, state, onClose, onSelect, onSubmit, onReset,
}: {
  quiz: Quiz;
  state: { selected: Record<number, number>; submitted: boolean; score: number } | undefined;
  onClose: () => void;
  onSelect: (qIdx: number, optionIdx: number) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const submitted = state?.submitted ?? false;
  const score = state?.score ?? 0;
  const total = quiz.questions.length;
  const passingScore = Math.ceil(total * 0.7);
  const passed = submitted && score >= passingScore;
  const answeredCount = Object.keys(state?.selected ?? {}).length;
  const allAnswered = answeredCount === total;
  const lvl = LEVEL_LABELS[quiz.level];

  const quizTitleId = `quiz-title-${quiz.id}`;
  return (
    <div role="region" aria-labelledby={quizTitleId} style={{ width: '100%' }}>
      {/* Back button + title */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Вернуться к списку тестов"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px',
          marginBottom: 16,
          background: '#F5F6F8',
          color: '#374151',
          border: 'none',
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: 'inherit',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" focusable="false">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        К списку тестов
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        style={{ marginBottom: 24 }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '4px var(--space-2)',
            borderRadius: 'var(--md-sys-shape-corner-full)',
            background: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem', fontWeight: 500,
            color: 'var(--md-sys-color-on-surface-variant)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>
            {TOPIC_LABELS[quiz.topic] ?? quiz.topic}
          </span>
          {lvl && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px var(--space-2)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: `0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)`,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 600,
              color: lvl.color,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {lvl.label}
            </span>
          )}
        </div>
        <h2 id={quizTitleId} style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.02em',
        }}>
          {quiz.title_ru}
        </h2>
        <p
          aria-live="polite"
          style={{
            fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280',
            lineHeight: 1.5,
          }}
        >
          {total} вопросов · {estimateDuration(total)} ·{' '}
          {submitted ? (
            <span style={{ color: passed ? '#059669' : '#B45309', fontWeight: 700 }}>
              Результат: {score}/{total} ({Math.round((score / total) * 100)}%) — {passed ? 'PASS' : 'FAIL'}
            </span>
          ) : (
            <span>Прогресс: {answeredCount}/{total} ответов</span>
          )}
        </p>
      </motion.div>

      {/* Questions */}
      {quiz.questions.map((qu, qIdx) => {
        const selected = state?.selected[qIdx];
        const questionLabelId = `quiz-${quiz.id}-q${qIdx}-label`;
        return (
          <motion.div
            key={qIdx}
            role="group"
            aria-labelledby={questionLabelId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIdx * 0.05, duration: 0.3 }}
            style={{
              padding: '20px 22px',
              background: '#F5F6F8',
              borderRadius: 14,
              marginBottom: 14,
            }}
          >
            <div id={questionLabelId} style={{
              fontSize: 14.5, fontWeight: 600,
              color: '#1F2937',
              marginBottom: 14,
              lineHeight: 1.45,
              display: 'flex', alignItems: 'baseline', gap: 10,
            }}>
              <span aria-hidden="true" style={{
                flexShrink: 0,
                display: 'inline-flex', alignItems: 'center',
                padding: '4px var(--space-2)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                background: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem', fontWeight: 700,
                color: '#2563EB',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                Q{qIdx + 1}
              </span>
              <span>
                <span className="sr-only">Вопрос {qIdx + 1}: </span>
                {qu.q}
              </span>
            </div>
            <div role="radiogroup" aria-labelledby={questionLabelId} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {qu.options.map((opt, optIdx) => {
                const isSelected = selected === optIdx;
                const isCorrect = qu.answer === optIdx;
                let bg = '#FFFFFF';
                let border = '1px solid transparent';
                let color = '#374151';
                if (submitted) {
                  if (isCorrect) {
                    bg = '#ECFDF5';
                    border = '1px solid #A7F3D0';
                    color = '#065F46';
                  } else if (isSelected && !isCorrect) {
                    bg = '#FEF2F2';
                    border = '1px solid #FECACA';
                    color = '#991B1B';
                  }
                } else if (isSelected) {
                  bg = '#EFF6FF';
                  border = '1px solid #BFDBFE';
                  color = '#1E40AF';
                }
                const optLetter = String.fromCharCode(65 + optIdx);
                const optAriaLabel = submitted
                  ? `Вариант ${optLetter}: ${opt}.${isCorrect ? ' Правильный ответ.' : ''}${isSelected && !isCorrect ? ' Ваш ответ — неверно.' : ''}${isSelected && isCorrect ? ' Ваш ответ — верно.' : ''}`
                  : `Вариант ${optLetter}: ${opt}`;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={optAriaLabel}
                    onClick={() => onSelect(qIdx, optIdx)}
                    disabled={submitted}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 14px',
                      background: bg,
                      border: border,
                      borderRadius: 10,
                      cursor: submitted ? 'default' : 'pointer',
                      fontSize: 13.5,
                      fontFamily: 'inherit',
                      color: color,
                      textAlign: 'left',
                      transition: 'background 120ms',
                    }}
                  >
                    <span aria-hidden="true" style={{
                      flexShrink: 0,
                      width: 22, height: 22,
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#2563EB' : '#D1D5DB'}`,
                      background: isSelected ? '#2563EB' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: 11, fontWeight: 700,
                      marginTop: 1,
                    }}>
                      {optLetter}
                    </span>
                    <span aria-hidden="true" style={{ lineHeight: 1.45, flex: 1 }}>
                      {opt}
                      {submitted && isCorrect && (
                        <span style={{ marginLeft: 8, color: '#059669', fontWeight: 700 }}>✓</span>
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <span style={{ marginLeft: 8, color: '#DC2626', fontWeight: 700 }}>✗</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div role="note" style={{
                marginTop: 12,
                padding: '12px 14px',
                background: '#FFFFFF',
                borderRadius: 8,
                fontSize: 12.5,
                lineHeight: 1.55,
                color: '#374151',
                borderLeft: '3px solid #2563EB',
              }}>
                <strong>Объяснение:</strong> {qu.explanation}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Submit / reset */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        marginTop: 20,
        padding: '14px 0',
        background: 'linear-gradient(to top, #FFFFFF 80%, transparent)',
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        {!submitted ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered}
            aria-label={allAnswered
              ? `Проверить тест: дано ${answeredCount} из ${total} ответов`
              : `Проверить тест недоступно: дано ${answeredCount} из ${total} ответов, ответьте на все вопросы`
            }
            style={{
              padding: '12px 24px',
              background: allAnswered ? '#2563EB' : '#9CA3AF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'background 150ms',
            }}
          >
            Проверить ({answeredCount}/{total})
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onReset}
              aria-label="Сбросить ответы и пройти тест ещё раз"
              style={{
                padding: '12px 24px',
                background: '#F5F6F8',
                color: '#374151',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'inherit',
              }}
            >
              Пройти ещё раз
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть тест и вернуться к списку"
              style={{
                padding: '12px 24px',
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              К списку тестов
            </button>
          </>
        )}
      </div>
    </div>
  );
}
