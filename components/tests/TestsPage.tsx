'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight } from '@/components/icons';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';

// Heavy chunk - only loaded when the user actually starts the diagnostic.
const DiagnosticTest = dynamic(() => import('./DiagnosticTest'), { ssr: false });

interface StandaloneTest {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: number;
  duration: string;
  unlocked: boolean;
}

const TESTS: StandaloneTest[] = [
  // ═══ Диагностика ═══
  {
    id: 'diagnostic',
    title: 'Диагностический тест',
    description: 'Определите свой текущий уровень знаний по основным медицинским дисциплинам',
    category: 'Диагностика',
    questions: 30,
    duration: '45 мин',
    unlocked: true,
  },
  {
    id: 'placement',
    title: 'Тест на распределение',
    description: 'Узнайте, с какого раздела начать обучение, исходя из ваших знаний',
    category: 'Диагностика',
    questions: 20,
    duration: '25 мин',
    unlocked: false,
  },

  // ═══ Международные экзамены ═══
  {
    id: 'usmle-step1',
    title: 'USMLE Step 1 - пробный',
    description: 'Пробный тест в формате USMLE Step 1: базовые науки, патология, фармакология',
    category: 'Международные экзамены',
    questions: 100,
    duration: '2 часа',
    unlocked: false,
  },
  {
    id: 'plab',
    title: 'PLAB Part 1 - пробный',
    description: 'Британский медицинский экзамен PLAB в формате Best of Five',
    category: 'Международные экзамены',
    questions: 180,
    duration: '3 часа',
    unlocked: false,
  },
  {
    id: 'mcat',
    title: 'MCAT - пробный тест',
    description: 'Medical College Admission Test: биология, химия, физика, критическое мышление',
    category: 'Международные экзамены',
    questions: 230,
    duration: '6 часов',
    unlocked: false,
  },

  // ═══ Тематические ═══
  {
    id: 'anatomy',
    title: 'Анатомия человека',
    description: 'Комплексный тест по анатомии всех систем организма - от остео до нервной системы',
    category: 'Тематические',
    questions: 60,
    duration: '75 мин',
    unlocked: false,
  },
  {
    id: 'pharma',
    title: 'Фармакология',
    description: 'Механизмы действия препаратов, побочные эффекты, взаимодействия, дозировки',
    category: 'Тематические',
    questions: 80,
    duration: '90 мин',
    unlocked: false,
  },
  {
    id: 'physiology',
    title: 'Физиология',
    description: 'Нормальные механизмы работы систем: сердечно-сосудистая, эндокринная, нервная, почечная',
    category: 'Тематические',
    questions: 70,
    duration: '85 мин',
    unlocked: false,
  },

  // ═══ Клинические случаи ═══
  {
    id: 'clinical-cases',
    title: 'Клинические случаи',
    description: 'Разбор реальных клинических ситуаций с постановкой диагноза и выбором тактики',
    category: 'Клинические случаи',
    questions: 40,
    duration: '60 мин',
    unlocked: false,
  },
  {
    id: 'emergency',
    title: 'Неотложные состояния',
    description: 'Острый коронарный синдром, инсульт, анафилаксия, шок - алгоритмы первой помощи',
    category: 'Клинические случаи',
    questions: 50,
    duration: '70 мин',
    unlocked: false,
  },
];

export default function TestsPage() {
  const t = useT();
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const lastDiagnostic = useAppStore((s) => s.lastDiagnosticResult);
  // Group by category
  const grouped = TESTS.reduce<Record<string, StandaloneTest[]>>((acc, item) => {
    const bucket = acc[item.category] ?? (acc[item.category] = []);
    bucket.push(item);
    return acc;
  }, {});

  // The diagnostic test takes over the whole TestsPage when active.
  // Other unlocked tests can hook in here later.
  if (activeTest === 'diagnostic') {
    return <DiagnosticTest onClose={() => setActiveTest(null)} />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        className="mb-6"
      >
        <h2 className="font-[var(--font-display)] text-[28px] font-bold text-[#1A1A1A] mb-1.5 tracking-[-0.02em]">
          {t('testsPage.title')}
        </h2>
        <p className="font-[var(--font-body)] text-sm text-[#6B7280] leading-[1.5]">
          {t('testsPage.subtitle')}
        </p>
      </motion.div>

      {/* Карточка «Последний результат диагностики» — slim strip в Bordik-стиле.
          Был большой #EFF6FF блок с белыми бордерами и 40×40 иконкой —
          контрастировал с остальной /tests страницей (все карточки на #F5F6F8).
          Теперь: тот же серый surface, 28×28 синий иконо-чип как акцент,
          компактная типографика в одну/две строки. */}
      {lastDiagnostic && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1], delay: 0.04 }}
          onClick={() => setActiveTest('diagnostic')}
          className="w-full flex items-center gap-3 py-3 px-4 bg-[#F5F6F8] hover:bg-[#F0F2F5] border-none rounded-[12px] cursor-pointer mb-5 text-left font-[inherit] transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <span className="flex-[0_0_auto] inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#2563EB] text-white">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="flex items-baseline gap-2 flex-wrap font-[var(--font-display)] text-sm font-semibold text-[#1A1A1A] tracking-[-0.005em] leading-[1.3]">
              <span className="font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em]">
                Диагностика
              </span>
              <span>{lastDiagnostic.profession}</span>
            </span>
            <span className="font-[var(--font-body)] text-xs text-[#6B7280] leading-[1.4]">
              {lastDiagnostic.correct}/{lastDiagnostic.total} верных · {' '}
              {lastDiagnostic.level === 'basic' ? 'базовый'
                : lastDiagnostic.level === 'intermediate' ? 'средний' : 'продвинутый'} · {' '}
              {(() => {
                const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(lastDiagnostic.completedAt);
                return m ? `${m[3]}.${m[2]}.${m[1]}` : 'недавно';
              })()}
            </span>
          </span>
          <ArrowRight size={14} color="#9CA3AF" />
        </motion.button>
      )}

      {/* Categories */}
      {Object.entries(grouped).map(([category, tests], catIdx) => (
        <motion.section
          key={category}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 + catIdx * 0.06 }}
          className="mb-7"
        >
          <h3 className="font-[var(--font-mono)] text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-3">
            {category}
          </h3>
          <div className="rg-3">
            {tests.map((test, i) => {
              const cardStateClass = test.unlocked
                ? 'cursor-pointer opacity-100 hover:bg-[#F0F2F5] hover:-translate-y-px'
                : 'cursor-not-allowed opacity-[0.48]';
              return (
                <motion.button
                  key={test.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: test.unlocked ? 1 : 0.48, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
                  disabled={!test.unlocked}
                  onClick={() => { if (test.unlocked) setActiveTest(test.id); }}
                  className={`bg-[#F5F6F8] rounded-[var(--md-sys-shape-corner-extra-large)] border-none p-[var(--space-5)] text-left relative overflow-hidden min-h-[160px] flex flex-col justify-between transition-[background,transform] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${cardStateClass}`}
                >
                {/* "Скоро" lock badge - top-right */}
                {!test.unlocked && (
                  <div className="absolute top-3 right-3 z-[2] inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[#1A1A1A] text-white font-[var(--font-mono)] text-[10px] font-bold tracking-[0.06em] uppercase shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    {t('testsPage.soon')}
                  </div>
                )}

                {/* Top pill - questions + duration */}
                <div className="mb-[var(--space-3)] relative z-[1]">
                  <span className="inline-flex items-center gap-[var(--space-1)] py-1 px-[var(--space-2)] rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)]">
                    {t('testsPage.questionsDuration', { n: test.questions, duration: test.duration })}
                  </span>
                </div>

                {/* Middle: title + description */}
                <div className="relative z-[1] flex-1">
                  <h3 className="font-[var(--font-display)] text-[length:var(--text-base)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-1)] leading-[1.25]">
                    {test.title}
                  </h3>
                  <p className="font-[var(--font-body)] text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.4] overflow-hidden [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box]">
                    {test.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-[var(--space-1)] mt-[var(--space-3)] relative z-[1]">
                  <span className={`font-[var(--font-body)] text-[length:var(--text-xs)] font-medium ${test.unlocked ? 'text-[color:var(--md-sys-color-on-surface)]' : 'text-[#9CA3AF]'}`}>
                    {test.unlocked ? t('testsPage.startTest') : t('testsPage.inDevelopment')}
                  </span>
                  {test.unlocked && <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />}
                </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
