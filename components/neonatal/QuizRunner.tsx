'use client';

/**
 * QuizRunner — interactive multi-choice quiz UI для Neonatology Module.
 * Audit Е1-Е4 — closes тесты и оценка знаний gap.
 *
 * Features:
 *   - Per-quiz score tracking (correct / total + percent)
 *   - Per-question feedback (correct/incorrect + explanation reveal)
 *   - Topic + level metadata (filterable)
 *   - Reset / retry per quiz
 *   - localStorage persists last-attempt scores per quiz id
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function QuizRunner({ query }: { query: string }) {
  const [bank, setBank] = useState<QuizBank | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openQuiz, setOpenQuiz] = useState<string | null>(null);
  const [state, setState] = useState<QuizState>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = window.localStorage.getItem('bordik-neonatal-quiz-state');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {};
  });

  // Persist quiz state to localStorage so users see their previous attempts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem('bordik-neonatal-quiz-state', JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/neonatal-quizzes.json?v=1.0.0', { cache: 'force-cache' });
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

  const handleSelect = (quizId: string, qIdx: number, optionIdx: number) => {
    setState((prev) => {
      const cur = prev[quizId] ?? { selected: {}, submitted: false, score: 0 };
      // Don't allow re-selection after submitted
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
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12 }} />
      </div>
    );
  }

  const totalQuestions = bank.quizzes.reduce((s, q) => s + q.questions.length, 0);

  return (
    <>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Показано: <strong style={{ color: '#1A1A1A' }}>{filteredQuizzes.length}</strong> из {bank.quizzes.length} тестов · {totalQuestions} вопросов всего
        {' · '}
        <span style={{ color: '#9CA3AF' }}>
          выбирайте ответы, нажмите «Проверить», чтобы увидеть результат
        </span>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredQuizzes.map((quiz) => {
          const qState = state[quiz.id];
          const isOpen = openQuiz === quiz.id;
          const submitted = qState?.submitted ?? false;
          const score = qState?.score ?? 0;
          const total = quiz.questions.length;
          const passingScore = Math.ceil(total * 0.7); // 70 % to pass
          const passed = submitted && score >= passingScore;
          const lvl = LEVEL_LABELS[quiz.level];
          const topicLabel = TOPIC_LABELS[quiz.topic] ?? quiz.topic;
          return (
            <div key={quiz.id} style={{
              background: '#F5F6F8',
              border: isOpen ? '1px solid #E5E7EB' : 'none',
              borderRadius: 14,
              overflow: 'hidden',
              transition: 'border-color 150ms ease',
            }}>
              <button
                type="button"
                onClick={() => setOpenQuiz(isOpen ? null : quiz.id)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 18px',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
                      color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
                    }}>
                      {quiz.title_ru}
                    </span>
                    {lvl && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: lvl.color,
                        background: '#FFFFFF',
                        padding: '2px 6px', borderRadius: 4,
                        border: `1px solid ${lvl.color}33`,
                      }}>
                        {lvl.label}
                      </span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: '#9CA3AF',
                      background: '#FFFFFF',
                      padding: '2px 6px', borderRadius: 4,
                      border: '1px solid #E5E7EB',
                    }}>
                      {topicLabel}
                    </span>
                  </span>
                  <span style={{
                    display: 'flex', gap: 12, fontSize: 12, color: '#6B7280',
                  }}>
                    <span>{total} вопросов</span>
                    {submitted && (
                      <span style={{
                        fontWeight: 700,
                        color: passed ? '#059669' : '#B45309',
                      }}>
                        Результат: {score}/{total} ({Math.round((score / total) * 100)}%) — {passed ? 'PASS' : 'FAIL'}
                      </span>
                    )}
                  </span>
                </span>
                <span style={{
                  flexShrink: 0,
                  color: '#9CA3AF',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms',
                  marginTop: 4,
                }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.25, ease: [0.05, 0.7, 0.1, 1] },
                      opacity: { duration: 0.18 },
                    }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '14px 20px 18px',
                      background: '#FFFFFF',
                      borderTop: '1px solid #E5E7EB',
                    }}>
                      {quiz.questions.map((qu, qIdx) => {
                        const selected = qState?.selected[qIdx];
                        return (
                          <div key={qIdx} style={{
                            marginBottom: 18,
                            paddingBottom: 14,
                            borderBottom: qIdx < quiz.questions.length - 1 ? '1px solid #F3F4F6' : 'none',
                          }}>
                            <div style={{
                              fontSize: 13.5, fontWeight: 600,
                              color: '#1F2937',
                              marginBottom: 10,
                              lineHeight: 1.45,
                            }}>
                              <span style={{
                                display: 'inline-block',
                                background: '#EFF6FF',
                                color: '#2563EB',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 11, fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 4,
                                marginRight: 8,
                              }}>
                                Q{qIdx + 1}
                              </span>
                              {qu.q}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {qu.options.map((opt, optIdx) => {
                                const isSelected = selected === optIdx;
                                const isCorrect = qu.answer === optIdx;
                                let bg = '#F9FAFB';
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
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleSelect(quiz.id, qIdx, optIdx)}
                                    disabled={submitted}
                                    style={{
                                      width: '100%',
                                      display: 'flex', alignItems: 'flex-start', gap: 10,
                                      padding: '10px 12px',
                                      background: bg,
                                      border: border,
                                      borderRadius: 8,
                                      cursor: submitted ? 'default' : 'pointer',
                                      fontSize: 13,
                                      fontFamily: 'inherit',
                                      color: color,
                                      textAlign: 'left',
                                      transition: 'background 120ms',
                                    }}
                                  >
                                    <span style={{
                                      flexShrink: 0,
                                      width: 20, height: 20,
                                      borderRadius: '50%',
                                      border: `2px solid ${isSelected ? '#2563EB' : '#D1D5DB'}`,
                                      background: isSelected ? '#2563EB' : 'transparent',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      color: '#FFFFFF',
                                      fontSize: 11, fontWeight: 700,
                                      marginTop: 1,
                                    }}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span style={{ lineHeight: 1.4, flex: 1 }}>
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
                              <div style={{
                                marginTop: 10,
                                padding: '10px 14px',
                                background: '#F9FAFB',
                                borderRadius: 8,
                                fontSize: 12.5,
                                lineHeight: 1.55,
                                color: '#374151',
                                borderLeft: '3px solid #2563EB',
                              }}>
                                <strong>Объяснение:</strong> {qu.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Submit / Reset */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        {!submitted ? (
                          <button
                            onClick={() => handleSubmit(quiz)}
                            disabled={Object.keys(qState?.selected ?? {}).length < total}
                            style={{
                              padding: '10px 20px',
                              background: '#2563EB',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: 8,
                              cursor: Object.keys(qState?.selected ?? {}).length === total ? 'pointer' : 'not-allowed',
                              opacity: Object.keys(qState?.selected ?? {}).length === total ? 1 : 0.5,
                              fontSize: 13,
                              fontWeight: 600,
                              fontFamily: 'inherit',
                            }}
                          >
                            Проверить ({Object.keys(qState?.selected ?? {}).length}/{total} ответов)
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReset(quiz.id)}
                            style={{
                              padding: '10px 20px',
                              background: '#F5F6F8',
                              color: '#374151',
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 500,
                              fontFamily: 'inherit',
                            }}
                          >
                            Пройти ещё раз
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
    </>
  );
}
