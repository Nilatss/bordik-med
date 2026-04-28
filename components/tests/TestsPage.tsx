'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight } from '@/components/icons';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';

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
    <div style={{ width: '100%' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        style={{ marginBottom: 24 }}
      >
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.02em',
        }}>
          {t('testsPage.title')}
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280',
          lineHeight: 1.5,
        }}>
          {t('testsPage.subtitle')}
        </p>
      </motion.div>

      {/* Categories */}
      {Object.entries(grouped).map(([category, tests], catIdx) => (
        <motion.section
          key={category}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 + catIdx * 0.06 }}
          style={{ marginBottom: 28 }}
        >
          <h3 style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 12,
          }}>
            {category}
          </h3>
          <div className="rg-3">
            {tests.map((test, i) => (
              <motion.button
                key={test.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: test.unlocked ? 1 : 0.48, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
                disabled={!test.unlocked}
                onClick={() => { if (test.unlocked) setActiveTest(test.id); }}
                style={{
                  background: '#F5F6F8',
                  borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                  border: 'none',
                  padding: 'var(--space-5)',
                  textAlign: 'left',
                  cursor: test.unlocked ? 'pointer' : 'not-allowed',
                  opacity: test.unlocked ? 1 : 0.48,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'background 400ms cubic-bezier(0.22,1,0.36,1), transform 400ms cubic-bezier(0.22,1,0.36,1)',
                }}
                onMouseEnter={(e) => {
                  if (test.unlocked) {
                    e.currentTarget.style.background = '#F0F2F5';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F5F6F8';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* "Скоро" lock badge - top-right */}
                {!test.unlocked && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12, zIndex: 2,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}>
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    {t('testsPage.soon')}
                  </div>
                )}

                {/* Top pill - questions + duration */}
                <div style={{ marginBottom: 'var(--space-3)', position: 'relative', zIndex: 1 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                    padding: '4px var(--space-2)',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                    background: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 500,
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}>
                    {t('testsPage.questionsDuration', { n: test.questions, duration: test.duration })}
                  </span>
                </div>

                {/* Middle: title + description */}
                <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface)',
                    marginBottom: 'var(--space-1)', lineHeight: 1.25,
                  }}>
                    {test.title}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                    color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {test.description}
                  </p>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                  marginTop: 'var(--space-3)', position: 'relative', zIndex: 1,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
                    color: test.unlocked ? 'var(--md-sys-color-on-surface)' : '#9CA3AF',
                  }}>
                    {test.unlocked ? t('testsPage.startTest') : t('testsPage.inDevelopment')}
                  </span>
                  {test.unlocked && <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
