'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  letter: string;
  text: string;
  correct: boolean;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
  explanation: string;
}

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** Parse markdown of "Тема 8" into structured questions. */
export function parseQuestions(md: string): Question[] {
  const rows = md.split('\n').filter((l) => /^\|.+\|\s*$/.test(l) && !/^\|\s*---/.test(l));
  const questions: Question[] = [];

  for (let idx = 0; idx < rows.length; idx++) {
    const raw = rows[idx].replace(/^\|\s*|\s*\|$/g, '').trim();
    if (!/^Вопрос/i.test(raw)) continue;

    const parts = raw.split(/<br>/i).map((s) => s.trim()).filter(Boolean);
    const header = parts[0].replace(/^Вопрос\s*\d+:\s*/i, '');

    const options: Option[] = [];
    let explanation = '';

    for (let i = 1; i < parts.length; i++) {
      const p = parts[i];
      const optMatch = p.match(/^([A-DА-Г])\)\s*(.+)$/);
      if (optMatch) {
        let text = optMatch[2];
        const correct = /←\s*правильный\s*ответ/i.test(text);
        text = text.replace(/←\s*правильный\s*ответ/i, '').trim();
        options.push({ letter: optMatch[1], text, correct });
        continue;
      }
      if (/^Объяснение:/i.test(p)) {
        explanation = p.replace(/^Объяснение:\s*/i, '');
      }
    }

    if (options.length === 0) continue;
    questions.push({ id: questions.length + 1, text: header, options, explanation });
  }

  return questions;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface SavedState {
  lastAt: number;
  answers: Record<number, string>; // questionId -> original option letter
}

function storageKey(courseId: string) {
  return `bordik:selfcheck:${courseId}`;
}

function loadState(courseId: string): SavedState {
  if (typeof window === 'undefined') return { lastAt: 0, answers: {} };
  try {
    const raw = localStorage.getItem(storageKey(courseId));
    if (!raw) return { lastAt: 0, answers: {} };
    const parsed = JSON.parse(raw) as SavedState;
    if (!parsed.lastAt || Date.now() - parsed.lastAt > COOLDOWN_MS) {
      return { lastAt: 0, answers: {} };
    }
    return parsed;
  } catch {
    return { lastAt: 0, answers: {} };
  }
}

function saveState(courseId: string, state: SavedState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(courseId), JSON.stringify(state));
}

function clearState(courseId: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(storageKey(courseId));
}

/* ═══ Countdown label for cooldown ═══ */
function formatRemaining(ms: number): string {
  if (ms <= 0) return '';
  const h = Math.floor(ms / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
}

/* ═══ One question card ═══ */
function QuestionCard({
  q,
  shuffledOptions,
  pickedLetter,
  expanded,
  index,
  onPick,
  onToggle,
  onNavigateToTab,
}: {
  q: Question;
  shuffledOptions: Option[];
  pickedLetter: string | null;
  expanded: boolean;
  index: number;
  onPick: (letter: string) => void;
  onToggle: () => void;
  onNavigateToTab?: (shortOrIcon: string) => void;
}) {
  const topic = onNavigateToTab ? detectTopic(q.text + ' ' + (q.explanation || '')) : null;
  const revealed = pickedLetter !== null;
  // Collapsed when answered AND not manually expanded
  const collapsed = revealed && !expanded;

  const pickedOption = revealed ? shuffledOptions.find((o) => o.letter === pickedLetter) : null;
  const isCorrect = pickedOption?.correct ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.05, 0.7, 0.1, 1] }}
      style={{
      background: '#F5F6F8',
      border: 'none',
      borderRadius: 14,
      padding: '14px 18px',
      marginBottom: 6,
    }}>
      {/* Header row - clickable if revealed */}
      <div
        onClick={revealed ? onToggle : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: revealed ? 'pointer' : 'default',
          userSelect: revealed ? 'none' : 'auto',
        }}
      >
        <span style={{
          background: revealed ? (isCorrect ? '#22C55E' : '#F87171') : '#1A1A1A',
          color: '#FFFFFF',
          borderRadius: 999, minWidth: 26, height: 26,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
          flexShrink: 0,
          transition: 'background 180ms',
        }}>
          {revealed ? (isCorrect ? '✓' : '✗') : q.id}
        </span>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          fontWeight: 600,
          color: '#1A1A1A',
          margin: 0, lineHeight: 1.4, flex: 1,
        }}>
          {q.text}
        </p>
        {revealed && (
          <>
            {collapsed && pickedOption && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                color: isCorrect ? '#15803D' : '#B91C1C',
                padding: '3px 8px', borderRadius: 999,
                background: isCorrect ? '#F0FDF4' : '#FEF7F7',
                flexShrink: 0,
              }}>
                {isCorrect ? 'Верно' : 'Ошибка'}
              </span>
            )}
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{
                flexShrink: 0,
                transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 200ms',
              }}>
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </>
        )}
      </div>

      {/* Body - conditionally rendered. Unanswered = always visible. Answered = only when expanded. */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={revealed ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {shuffledOptions.map((opt, i) => {
                  const displayLetter = String.fromCharCode(65 + i); // A, B, C, D after shuffle
                  const isPicked = pickedLetter === opt.letter;
                  const isCorrectOpt = opt.correct;
                  let bg = '#FFFFFF';
                  let color = '#1A1A1A';
                  if (revealed) {
                    if (isCorrectOpt) {
                      bg = '#F0FDF4'; color = '#15803D';
                    } else if (isPicked) {
                      bg = '#FEF7F7'; color = '#B91C1C';
                    }
                  }
                  return (
                    <button
                      key={opt.letter}
                      disabled={revealed}
                      onClick={() => onPick(opt.letter)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px',
                        background: bg,
                        border: 'none',
                        borderRadius: 10,
                        cursor: revealed ? 'default' : 'pointer',
                        textAlign: 'left', width: '100%',
                        fontFamily: 'var(--font-body)', fontSize: 14,
                        color,
                        transition: 'background 180ms',
                      }}
                      onMouseEnter={(e) => {
                        if (!revealed) e.currentTarget.style.background = '#FAFBFC';
                      }}
                      onMouseLeave={(e) => {
                        if (!revealed) e.currentTarget.style.background = '#FFFFFF';
                      }}
                    >
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: 6,
                        background: revealed && isCorrectOpt ? '#22C55E' : revealed && isPicked ? '#F87171' : '#F0F1F5',
                        color: revealed && (isCorrectOpt || isPicked) ? '#FFFFFF' : '#666',
                        fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                        border: 'none',
                        flexShrink: 0,
                      }}>
                        {revealed && isCorrectOpt ? '✓' : revealed && isPicked ? '✗' : displayLetter}
                      </span>
                      <span style={{ flex: 1 }}>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {revealed && q.explanation && (
                <div style={{
                  marginTop: 14, padding: '14px 18px',
                  background: '#EEF4FF',
                  borderLeft: '3px solid #3B82F6',
                  borderRadius: 12,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                    color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.05em',
                    marginBottom: 8,
                  }}>
                    Объяснение
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 14, color: '#333',
                    margin: 0, lineHeight: 1.6,
                  }}>
                    {q.explanation}
                  </p>
                  {topic && onNavigateToTab && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigateToTab(topic.short); }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        marginTop: 12,
                        padding: '7px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #C7DDFF',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                        color: '#1D4ED8',
                        transition: 'background 180ms, border-color 180ms',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#EEF4FF';
                        e.currentTarget.style.borderColor = '#3B82F6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#C7DDFF';
                      }}
                    >
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                      </svg>
                      К теме: {topic.label}
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12,5 19,12 12,19" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══ Main quiz ═══ */
/** Detect target tab topic from question text/explanation */
function detectTopic(text: string): { short: string; label: string } | null {
  const t = text.toLowerCase();
  const topics: { pattern: RegExp; short: string; label: string }[] = [
    { pattern: /клетк|днк|хромосом|ген|наследован|митохондр|рибосом|органоид|мейоз|митоз|эритроцит|вирус|бактери|антибиотик|гомеостаз|организм|эволюц|биолог/, short: 'Биология', label: 'Биология' },
    { pattern: /ph\b|ацид|щелоч|кисл|молекул|белок|липид|углевод|атф|фермент|электролит|хим/, short: 'Химия', label: 'Химия' },
    { pattern: /давлен|закон.*пуазей|потенциал|рентген|узи|мрт|инфракрасн|физик|напряжен|ток\b|сил[ыа]\b|энерги/, short: 'Физика', label: 'Физика' },
    { pattern: /статистик|вероятн|среднее|медиан|процент|коэффициент|матриц|график|формул|математик/, short: 'Математика', label: 'Математика' },
    { pattern: /пациент|психолог|стресс|когнитив|эмоци|мотивац|поведение|личность/, short: 'Психология', label: 'Психология' },
    { pattern: /english|англ|перевод|термин|словар/, short: 'Английский', label: 'Английский' },
    { pattern: /обуч|память|забыван|повторен|учить|эббингауз/, short: 'Как учиться', label: 'Как учиться' },
  ];
  for (const topic of topics) {
    if (topic.pattern.test(t)) return { short: topic.short, label: topic.label };
  }
  return null;
}

export default function InlineQuiz({
  source,
  courseId,
  onNavigateToTab,
}: {
  source: string;
  courseId: string;
  onNavigateToTab?: (shortOrIcon: string) => void;
}) {
  const questions = useMemo(() => parseQuestions(source), [source]);
  const intro = useMemo(() => {
    const lines = source.split('\n');
    const out: string[] = [];
    for (const l of lines) {
      if (/^\|/.test(l)) break;
      if (l.trim()) out.push(l.trim());
    }
    return out.join(' ');
  }, [source]);

  // Mount timestamp - re-shuffle on mount (new session)
  // Shuffled options stable per mount
  const [shuffledPerQuestion] = useState<Record<number, Option[]>>(() => {
    const map: Record<number, Option[]> = {};
    for (const q of questions) map[q.id] = shuffle(q.options);
    return map;
  });

  // Load saved answers synchronously on first render (so collapsed state is correct from the start,
  // no flash of "expanded then collapses" for previously-answered questions)
  const [answers, setAnswers] = useState<Record<number, string>>(() => loadState(courseId).answers);
  const [remainingMs, setRemainingMs] = useState(() => {
    const s = loadState(courseId);
    if (!s.lastAt) return 0;
    return Math.max(0, COOLDOWN_MS - (Date.now() - s.lastAt));
  });
  // Manually-expanded questions (override auto-collapse)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Tick cooldown label every minute while there is a cooldown
  useEffect(() => {
    if (remainingMs <= 0) return;
    const t = setInterval(() => {
      setRemainingMs((prev) => Math.max(0, prev - 60_000));
    }, 60_000);
    return () => clearInterval(t);
  }, [remainingMs]);

  const allAnswered = questions.length > 0 && Object.keys(answers).length >= questions.length;

  const pick = (qId: number, letter: string) => {
    const next = { ...answers, [qId]: letter };
    setAnswers(next);
    const now = Date.now();
    // Start 24h cooldown when first answer is registered; reset timestamp on every new pick
    saveState(courseId, { lastAt: now, answers: next });
    setRemainingMs(COOLDOWN_MS);
    // Auto-collapse answered question after a short delay so user sees feedback
    setTimeout(() => {
      setExpanded((prev) => ({ ...prev, [qId]: false }));
    }, 1200);
    // Briefly keep expanded so user sees correct/incorrect feedback
    setExpanded((prev) => ({ ...prev, [qId]: true }));
  };

  const toggleExpanded = (qId: number) => {
    setExpanded((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const resetNow = () => {
    clearState(courseId);
    setAnswers({});
    setExpanded({});
    setRemainingMs(0);
  };

  if (questions.length === 0) {
    return <p style={{ color: '#888' }}>Нет вопросов для самопроверки.</p>;
  }

  const correctCount = questions.reduce((acc, q) => {
    const picked = answers[q.id];
    if (!picked) return acc;
    return acc + (q.options.find((o) => o.letter === picked)?.correct ? 1 : 0);
  }, 0);

  return (
    <div>
      {intro && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#555',
          lineHeight: 1.65, marginBottom: 18,
        }}>
          {intro}
        </p>
      )}

      {/* Progress / cooldown bar - matches question card size */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
        style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', marginBottom: 6,
        background: '#F5F6F8', borderRadius: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
            color: '#1A1A1A',
          }}>
            {Object.keys(answers).length} / {questions.length}
          </span>
          {allAnswered && (
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 12, color: '#047857',
              fontWeight: 600,
            }}>
              · Правильных: {correctCount} из {questions.length}
            </span>
          )}
        </div>
        {remainingMs > 0 ? (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: '#888',
          }}>
            Сброс через {formatRemaining(remainingMs)}
          </span>
        ) : (
          Object.keys(answers).length > 0 && (
            <button
              onClick={resetNow}
              style={{
                background: 'transparent', border: 'none',
                color: '#1D4ED8', fontFamily: 'var(--font-body)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Сбросить ответы
            </button>
          )
        )}
      </motion.div>

      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          q={q}
          index={i}
          shuffledOptions={shuffledPerQuestion[q.id] ?? q.options}
          pickedLetter={answers[q.id] ?? null}
          expanded={expanded[q.id] ?? false}
          onPick={(letter) => pick(q.id, letter)}
          onToggle={() => toggleExpanded(q.id)}
          onNavigateToTab={onNavigateToTab}
        />
      ))}
    </div>
  );
}
