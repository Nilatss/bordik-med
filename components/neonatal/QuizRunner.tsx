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

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  /** Maps DISPLAY index (0..displayCount-1) → option index. */
  selected: Record<number, number>;
  submitted: boolean;
  score: number;
  /** Sequence of bank-question indices for the current attempt.
   *  Empty/undefined for legacy state (will be lazily initialised). */
  playOrder?: number[];
  /** Permanent ledger of bank-indices the user has already seen across
   *  ALL prior attempts. Used to avoid repeats on retry: we prefer unseen
   *  questions first, only re-pulling seen ones if the bank is exhausted. */
  seenIndices?: number[];
}>;

const QUIZ_DISPLAY_COUNT = 10;

/** Fisher-Yates shuffle (in-place, returns same array). */
function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Builds a fresh play order for an attempt. Prefers unseen indices first
 *  (so retries pull NEW questions until the bank is exhausted), then
 *  falls back to a fresh shuffle of previously-seen indices. */
function buildPlayOrder(bankSize: number, seenIndices: ReadonlyArray<number>): number[] {
  const want = Math.min(QUIZ_DISPLAY_COUNT, bankSize);
  const seenSet = new Set(seenIndices);
  const all = Array.from({ length: bankSize }, (_, i) => i);
  const unseen = shuffleInPlace(all.filter((i) => !seenSet.has(i)));
  if (unseen.length >= want) return unseen.slice(0, want);
  // Bank exhausted — recycle seen, re-shuffled, to fill the gap.
  const seenShuffled = shuffleInPlace(all.filter((i) => seenSet.has(i)));
  return [...unseen, ...seenShuffled].slice(0, want);
}

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
        const r = await fetch('/neonatal-quizzes.json?v=1.4.0', { cache: 'force-cache' });
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

  const handleSelect = (quizId: string, displayIdx: number, optionIdx: number) => {
    setState((prev) => {
      const cur = prev[quizId];
      if (!cur || cur.submitted) return prev;
      return {
        ...prev,
        [quizId]: {
          ...cur,
          selected: { ...cur.selected, [displayIdx]: optionIdx },
        },
      };
    });
  };

  const handleSubmit = (quiz: Quiz) => {
    setState((prev) => {
      const cur = prev[quiz.id];
      if (!cur) return prev;
      const order = cur.playOrder ?? Array.from({ length: quiz.questions.length }, (_, i) => i);
      let correct = 0;
      order.forEach((bankIdx, displayIdx) => {
        const selectedOpt = cur.selected[displayIdx];
        const qu = quiz.questions[bankIdx];
        if (qu && selectedOpt === qu.answer) correct += 1;
      });
      // Add this attempt's questions to the seen ledger so retry pulls
      // a fresh set if the bank has more than displayCount items.
      const seenSet = new Set(cur.seenIndices ?? []);
      for (const i of order) seenSet.add(i);
      return {
        ...prev,
        [quiz.id]: {
          ...cur,
          submitted: true,
          score: correct,
          seenIndices: Array.from(seenSet),
        },
      };
    });
  };

  /** Reset = start a fresh attempt. Builds a new randomised playOrder
   *  preferring unseen bank indices, preserves seenIndices ledger. */
  const handleReset = (quiz: Quiz) => {
    setState((prev) => {
      const cur = prev[quiz.id];
      const seen = cur?.seenIndices ?? [];
      const playOrder = buildPlayOrder(quiz.questions.length, seen);
      return {
        ...prev,
        [quiz.id]: {
          selected: {},
          submitted: false,
          score: 0,
          playOrder,
          seenIndices: seen,
        },
      };
    });
  };

  /** Ensures a quiz state has a playOrder before user starts answering.
   *  Idempotent — won't re-shuffle if attempt is already in progress. */
  const ensurePlayOrder = useCallback((quiz: Quiz) => {
    setState((prev) => {
      const cur = prev[quiz.id];
      if (cur?.playOrder?.length) return prev;
      const seen = cur?.seenIndices ?? [];
      const playOrder = buildPlayOrder(quiz.questions.length, seen);
      return {
        ...prev,
        [quiz.id]: {
          selected: cur?.selected ?? {},
          submitted: cur?.submitted ?? false,
          score: cur?.score ?? 0,
          playOrder,
          seenIndices: seen,
        },
      };
    });
  }, []);

  if (error) {
    return (
      <div className="py-6 px-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[12px] text-[#991B1B] text-sm">
        Не удалось загрузить тесты: {error}.
      </div>
    );
  }

  if (!bank) {
    return (
      <div>
        <div className="lc-shimmer h-12 w-full rounded-[12px] mb-3" />
        <div className="lc-shimmer h-[160px] w-full rounded-[24px] mb-3" />
        <div className="lc-shimmer h-[160px] w-full rounded-[24px]" />
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
        ensurePlayOrder={ensurePlayOrder}
        onClose={() => setActiveQuiz(null)}
        onSelect={(displayIdx, optionIdx) => handleSelect(quiz.id, displayIdx, optionIdx)}
        onSubmit={() => handleSubmit(quiz)}
        onReset={() => handleReset(quiz)}
      />
    );
  }

  // List view
  return (
    <div className="w-full">
      <p className="text-[13px] text-[#6B7280] mt-0 mb-[14px] mx-0">
        Показано: <strong className="text-[#1A1A1A]">{filteredQuizzes.length}</strong> из {bank.quizzes.length} тестов
        {' · '}
        <span className="text-[#9CA3AF]">
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
          className="mb-7"
        >
          <h3 id={headingId} className="font-[var(--font-mono)] text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-3">
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
                  className="bg-[#F5F6F8] hover:bg-[#F0F2F5] hover:-translate-y-px rounded-[var(--md-sys-shape-corner-extra-large)] border-none p-[var(--space-5)] text-left cursor-pointer relative overflow-hidden min-h-[160px] flex flex-col justify-between transition-[background,transform] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                >
                  {/* Status badge top-right (submitted score or level) */}
                  {submitted ? (
                    <div className={`absolute top-3 right-3 z-[2] inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-white font-[var(--font-mono)] text-[10px] font-bold tracking-[0.06em] uppercase shadow-[0_2px_8px_rgba(0,0,0,0.12)] ${passed ? 'bg-[#059669]' : 'bg-[#B45309]'}`}>
                      {passed ? 'PASS' : 'FAIL'} {score}/{total}
                    </div>
                  ) : null}

                  {/* Top pills - questions + duration + level */}
                  <div className="mb-[var(--space-3)] relative z-[1] flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-[var(--space-1)] py-1 px-[var(--space-2)] rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)]">
                      {total} вопросов · {estimateDuration(total)}
                    </span>
                    {lvl && (
                      <span className="inline-flex items-center py-1 px-[var(--space-2)] rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] uppercase tracking-[0.04em]">
                        {lvl.label}
                      </span>
                    )}
                  </div>

                  {/* Middle: title + description */}
                  <div className="relative z-[1] flex-1">
                    <h3 className="font-[var(--font-display)] text-[length:var(--text-base)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-1)] leading-[1.25]">
                      {quiz.title_ru}
                    </h3>
                    <p className="font-[var(--font-body)] text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.4] overflow-hidden [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box]">
                      {description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-[var(--space-1)] mt-[var(--space-3)] relative z-[1]">
                    <span className="font-[var(--font-body)] text-[length:var(--text-xs)] font-medium text-[color:var(--md-sys-color-on-surface)]">
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
        <div className="py-8 px-4 bg-[#F5F6F8] rounded-[12px] text-center text-[#6B7280] text-sm">
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
  quiz, state, ensurePlayOrder, onClose, onSelect, onSubmit, onReset,
}: {
  quiz: Quiz;
  state: {
    selected: Record<number, number>;
    submitted: boolean;
    score: number;
    playOrder?: number[];
    seenIndices?: number[];
  } | undefined;
  ensurePlayOrder: (quiz: Quiz) => void;
  onClose: () => void;
  onSelect: (displayIdx: number, optionIdx: number) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  // On first mount/when state has no playOrder yet — initialise it.
  // ensurePlayOrder is idempotent so repeat renders are no-ops.
  useEffect(() => {
    ensurePlayOrder(quiz);
  }, [quiz, ensurePlayOrder, state?.playOrder?.length]);

  // playOrder may be undefined for a tick on first open — fall back to
  // sequential 0..N-1 so the UI doesn't flicker empty. The actual
  // randomised order replaces it on the next tick from ensurePlayOrder.
  const playOrder = state?.playOrder ?? Array.from({ length: Math.min(QUIZ_DISPLAY_COUNT, quiz.questions.length) }, (_, i) => i);
  const displayQuestions = playOrder
    .map((bankIdx) => quiz.questions[bankIdx])
    .filter((q): q is QuizQuestion => Boolean(q));

  const submitted = state?.submitted ?? false;
  const score = state?.score ?? 0;
  const total = displayQuestions.length;
  const passingScore = Math.ceil(total * 0.7);
  const passed = submitted && score >= passingScore;
  const answeredCount = Object.keys(state?.selected ?? {}).length;
  const allAnswered = answeredCount === total;
  const lvl = LEVEL_LABELS[quiz.level];

  const bankSize = quiz.questions.length;
  const seenSize = state?.seenIndices?.length ?? 0;
  const remainingFresh = Math.max(0, bankSize - seenSize);

  const quizTitleId = `quiz-title-${quiz.id}`;
  const pillClass = 'inline-flex items-center py-1 px-[var(--space-2)] rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] uppercase tracking-[0.04em] whitespace-nowrap';
  return (
    <div role="region" aria-labelledby={quizTitleId} className="w-full">
      {/* Back button + title */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Вернуться к списку тестов"
        className="inline-flex items-center gap-2 py-2 px-3.5 mb-4 bg-[#F5F6F8] hover:bg-[#EFF1F4] text-[#374151] border-none rounded-[10px] cursor-pointer text-[13px] font-medium font-[inherit] transition-colors duration-150"
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
        className="mb-6"
      >
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={pillClass}>
            {TOPIC_LABELS[quiz.topic] ?? quiz.topic}
          </span>
          {lvl && (
            <span className={pillClass}>
              {lvl.label}
            </span>
          )}
        </div>
        <h2 id={quizTitleId} className="font-[var(--font-display)] text-[28px] font-bold text-[#1A1A1A] mb-1.5 tracking-[-0.02em]">
          {quiz.title_ru}
        </h2>
        <p
          aria-live="polite"
          className="font-[var(--font-body)] text-sm text-[#6B7280] leading-[1.5]"
        >
          {total} вопросов · {estimateDuration(total)} ·{' '}
          {submitted ? (
            <span className={`font-bold ${passed ? 'text-[#059669]' : 'text-[#B45309]'}`}>
              Результат: {score}/{total} ({Math.round((score / total) * 100)}%) — {passed ? 'PASS' : 'FAIL'}
            </span>
          ) : (
            <span>Прогресс: {answeredCount}/{total} ответов</span>
          )}
          {bankSize > total && (
            <span className="text-[#9CA3AF] ml-1.5">
              · бaнк {bankSize} вопросов{remainingFresh > 0 && remainingFresh < bankSize ? `, ещё ${remainingFresh} новых при retry` : ''}
            </span>
          )}
        </p>
      </motion.div>

      {/* Questions — отображаются по playOrder (рандомизированному) */}
      {displayQuestions.map((qu, qIdx) => {
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
            className="py-5 px-[22px] bg-[#F5F6F8] rounded-[14px] mb-[14px]"
          >
            <div id={questionLabelId} className="text-[14.5px] font-semibold text-[#1F2937] mb-[14px] leading-[1.45] flex items-baseline gap-2.5">
              <span aria-hidden="true" className="shrink-0 inline-flex items-center py-1 px-[var(--space-2)] rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-bold text-[#2563EB] tracking-[0.04em] whitespace-nowrap">
                Q{qIdx + 1}
              </span>
              <span>
                <span className="sr-only">Вопрос {qIdx + 1}: </span>
                {qu.q}
              </span>
            </div>
            <div role="radiogroup" aria-labelledby={questionLabelId} className="flex flex-col gap-1.5">
              {qu.options.map((opt, optIdx) => {
                const isSelected = selected === optIdx;
                const isCorrect = qu.answer === optIdx;
                let optClass = 'bg-white border border-transparent text-[#374151]';
                if (submitted) {
                  if (isCorrect) optClass = 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]';
                  else if (isSelected && !isCorrect) optClass = 'bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]';
                  else optClass = 'bg-white border border-transparent text-[#374151]';
                } else if (isSelected) {
                  optClass = 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF]';
                }
                const optLetter = String.fromCharCode(65 + optIdx);
                const optAriaLabel = submitted
                  ? `Вариант ${optLetter}: ${opt}.${isCorrect ? ' Правильный ответ.' : ''}${isSelected && !isCorrect ? ' Ваш ответ — неверно.' : ''}${isSelected && isCorrect ? ' Ваш ответ — верно.' : ''}`
                  : `Вариант ${optLetter}: ${opt}`;
                const radioClass = isSelected
                  ? 'border-[#2563EB] bg-[#2563EB]'
                  : 'border-[#D1D5DB] bg-transparent';
                return (
                  <button
                    key={optIdx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={optAriaLabel}
                    onClick={() => onSelect(qIdx, optIdx)}
                    disabled={submitted}
                    className={`w-full flex items-start gap-3 py-3 px-3.5 rounded-[10px] text-[13.5px] font-[inherit] text-left transition-colors duration-[120ms] ${submitted ? 'cursor-default' : 'cursor-pointer'} ${optClass}`}
                  >
                    <span aria-hidden="true" className={`shrink-0 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-white text-[11px] font-bold mt-px ${radioClass}`}>
                      {optLetter}
                    </span>
                    <span aria-hidden="true" className="leading-[1.45] flex-1">
                      {opt}
                      {submitted && isCorrect && (
                        <span className="ml-2 text-[#059669] font-bold">✓</span>
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <span className="ml-2 text-[#DC2626] font-bold">✗</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div role="note" className="mt-3 py-3 px-3.5 bg-white rounded-lg text-[12.5px] leading-[1.55] text-[#374151] border-l-[3px] border-[#2563EB]">
                <strong>Объяснение:</strong> {qu.explanation}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Submit / reset */}
      <div className="sticky bottom-0 mt-5 py-[14px] bg-gradient-to-t from-white from-80% to-transparent flex gap-2.5 flex-wrap">
        {!submitted ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered}
            aria-label={allAnswered
              ? `Проверить тест: дано ${answeredCount} из ${total} ответов`
              : `Проверить тест недоступно: дано ${answeredCount} из ${total} ответов, ответьте на все вопросы`
            }
            className={`py-3 px-6 text-white border-none rounded-[10px] text-sm font-semibold font-[inherit] transition-colors duration-150 ${allAnswered ? 'bg-[#2563EB] cursor-pointer' : 'bg-[#9CA3AF] cursor-not-allowed'}`}
          >
            Проверить ({answeredCount}/{total})
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onReset}
              aria-label="Сбросить ответы и пройти тест ещё раз"
              className="py-3 px-6 bg-[#F5F6F8] text-[#374151] border-none rounded-[10px] cursor-pointer text-sm font-medium font-[inherit]"
            >
              Пройти ещё раз
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть тест и вернуться к списку"
              className="py-3 px-6 bg-[#2563EB] text-white border-none rounded-[10px] cursor-pointer text-sm font-semibold font-[inherit]"
            >
              К списку тестов
            </button>
          </>
        )}
      </div>
    </div>
  );
}
