'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  { id: 'diagnostic', title: 'Диагностический тест', description: 'Определите свой текущий уровень знаний по основным медицинским дисциплинам', category: 'Диагностика', questions: 30, duration: '45 мин', unlocked: true },
  { id: 'placement', title: 'Тест на распределение', description: 'Узнайте, с какого раздела начать обучение, исходя из ваших знаний', category: 'Диагностика', questions: 20, duration: '25 мин', unlocked: false },
  // ═══ Международные экзамены ═══
  { id: 'usmle-step1', title: 'USMLE Step 1 — пробный', description: 'Базовые науки, патология, фармакология', category: 'Международные экзамены', questions: 100, duration: '2 часа', unlocked: false },
  { id: 'plab', title: 'PLAB Part 1 — пробный', description: 'Британский медицинский экзамен PLAB в формате Best of Five', category: 'Международные экзамены', questions: 180, duration: '3 часа', unlocked: false },
  { id: 'mcat', title: 'MCAT — пробный', description: 'Medical College Admission Test: биология, химия, физика, критическое мышление', category: 'Международные экзамены', questions: 230, duration: '6 часов', unlocked: false },
  // ═══ Тематические ═══
  { id: 'anatomy', title: 'Анатомия человека', description: 'Комплексный тест по анатомии всех систем организма', category: 'Тематические', questions: 60, duration: '75 мин', unlocked: false },
  { id: 'pharma', title: 'Фармакология', description: 'Механизмы действия препаратов, побочные эффекты, взаимодействия, дозировки', category: 'Тематические', questions: 80, duration: '90 мин', unlocked: false },
  { id: 'physiology', title: 'Физиология', description: 'Нормальные механизмы работы систем: ССС, эндокринная, нервная, почечная', category: 'Тематические', questions: 70, duration: '85 мин', unlocked: false },
  // ═══ Клинические случаи ═══
  { id: 'clinical-cases', title: 'Клинические случаи', description: 'Разбор реальных клинических ситуаций с постановкой диагноза и выбором тактики', category: 'Клинические случаи', questions: 40, duration: '60 мин', unlocked: false },
  { id: 'emergency', title: 'Неотложные состояния', description: 'ОКС, инсульт, анафилаксия, шок — алгоритмы первой помощи', category: 'Клинические случаи', questions: 50, duration: '70 мин', unlocked: false },
];

/* ═══ Status badge — colored pill (Active / Coming Soon / etc.) ═══ */
type Status = 'available' | 'locked';
const STATUS: Record<Status, { label: string; bg: string; fg: string; dot: string; icon: 'check' | 'lock' }> = {
  available: { label: 'Доступен', bg: '#DCFCE7', fg: '#166534', dot: '#16A34A', icon: 'check' },
  locked:    { label: 'Скоро',    bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF', icon: 'lock' },
};

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px',
      borderRadius: 999,
      background: s.bg, color: s.fg,
      fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600,
      flexShrink: 0,
    }}>
      {s.icon === 'check' ? (
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
          stroke={s.dot} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
          stroke={s.dot} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      )}
      {s.label}
    </span>
  );
}

function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px',
      borderRadius: 999,
      background: '#FEF3C7', color: '#92400E',
      fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 600,
      flexShrink: 0,
    }}>
      <svg width={10} height={10} viewBox="0 0 24 24" fill={'#F59E0B'} stroke="none">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <circle cx="7" cy="7" r="1.2" fill="#FFFFFF" />
      </svg>
      {children}
    </span>
  );
}

/* ═══ Single row ═══ */
function TestRow({ test, index }: { test: StandaloneTest; index: number }) {
  const [open, setOpen] = useState(false);
  const status: Status = test.unlocked ? 'available' : 'locked';
  const statusMeta = STATUS[status];
  const accent = status === 'available' ? '#DCFCE7' : '#F5F6F8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
      style={{
        background: open ? '#FFFFFF' : accent,
        border: open ? '1px solid #E5E7EB' : '1px solid transparent',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: open ? '0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.04)' : 'none',
        transition: 'background 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
      }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          background: 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 600,
          color: '#1A1A1A', flexShrink: 0,
        }}>
          {test.title}
        </span>

        <StatusBadge status={status} />

        {test.unlocked && <TagPill>BFREE</TagPill>}

        {/* Spacer pushes the right-side cluster to the edge */}
        <span style={{ flex: 1 }} />

        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
          color: '#1A1A1A', flexShrink: 0,
        }}>
          {test.questions} вопр.
        </span>

        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 24, height: 24, borderRadius: 6,
          background: '#F5F6F8',
          color: '#6B7280', flexShrink: 0,
          transition: 'transform 250ms cubic-bezier(0.2,0,0,1)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 16,
              padding: '14px 18px 18px',
              borderTop: '1px solid #F0F1F5',
            }}>
              <Detail label="Длительность" value={test.duration} icon="clock" />
              <Detail label="Вопросов" value={String(test.questions)} icon="list" />
              <Detail label="Раздел" value={test.category} icon="tag" />
              <Detail label="Статус" value={statusMeta.label} icon="info" />
            </div>
            <div style={{
              padding: '0 18px 18px',
              fontFamily: 'var(--font-body)', fontSize: 13, color: '#4B5563',
              lineHeight: 1.55,
            }}>
              {test.description}
            </div>
            <div style={{
              padding: '0 18px 18px',
              display: 'flex', justifyContent: 'flex-end',
            }}>
              <button
                disabled={!test.unlocked}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px',
                  fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600,
                  color: test.unlocked ? '#FFFFFF' : '#9CA3AF',
                  background: test.unlocked ? '#3B82F6' : '#F3F4F6',
                  border: 'none', borderRadius: 999,
                  cursor: test.unlocked ? 'pointer' : 'not-allowed',
                  transition: 'background 180ms ease',
                }}
                onMouseEnter={(e) => { if (test.unlocked) e.currentTarget.style.background = '#2563EB'; }}
                onMouseLeave={(e) => { if (test.unlocked) e.currentTarget.style.background = '#3B82F6'; }}
              >
                {test.unlocked ? 'Начать тест' : 'Тест в разработке'}
                {test.unlocked && (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <line x1={5} y1={12} x2={19} y2={12} />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon: string }) {
  const iconEl = {
    clock: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></svg>,
    list: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1={8} y1={6} x2={21} y2={6} /><line x1={8} y1={12} x2={21} y2={12} /><line x1={8} y1={18} x2={21} y2={18} /><circle cx={4} cy={6} r={1} /><circle cx={4} cy={12} r={1} /><circle cx={4} cy={18} r={1} /></svg>,
    tag: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><circle cx={7} cy={7} r={1.5} /></svg>,
    info: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10} /><line x1={12} y1={16} x2={12} y2={12} /><line x1={12} y1={8} x2={12.01} y2={8} /></svg>,
  }[icon] ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {iconEl}
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600,
        color: '#1A1A1A',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  );
}

export default function TestsPage() {
  const grouped = TESTS.reduce<Record<string, StandaloneTest[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  let runningIndex = 0;

  return (
    <div style={{ width: '100%', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.02em',
        }}>
          Тесты
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280',
          lineHeight: 1.5,
        }}>
          Отдельные тесты для подготовки к экзаменам и проверки знаний.
          Кликни на строку, чтобы развернуть детали.
        </p>
      </div>

      {/* Categories — stacked rows */}
      {Object.entries(grouped).map(([category, tests]) => (
        <section key={category} style={{ marginBottom: 28 }}>
          <h3 style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 10,
          }}>
            {category}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tests.map((test) => (
              <TestRow key={test.id} test={test} index={runningIndex++} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
