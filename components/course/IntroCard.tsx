/**
 * IntroCard — the left-side intro panel on the course page (before user
 * clicks "Начать обучение"). Contains the title block, stat row,
 * progress bar and start CTA.
 *
 * Extracted from CoursePage.tsx (P1-CR-3 god-component split).
 * Self-contained: receives precomputed copy + props from parent so
 * CoursePage stays a thin orchestrator.
 */
'use client';

import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import CourseProgressBar from './CourseProgressBar';
import StatPill from './StatPill';

interface IntroCardProps {
  titleN: string;
  introBody: string;
  totalTopics: number;
  hasTests: boolean;
  sectionTitle: string;
  progressPct: number;
  onStart: () => void;
}

export default function IntroCard({
  titleN,
  introBody,
  totalTopics,
  hasTests,
  sectionTitle,
  progressPct,
  onStart,
}: IntroCardProps) {
  const t = useT();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.05 }}
      style={{
        background: '#FFFFFF',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--space-6)',
        border: '1px solid #F0F1F5',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}
    >
      <div>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 8,
        }}>
          {t('course.intro.label')}
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: '#1A1A1A', lineHeight: 1.25, letterSpacing: '-0.01em',
          marginBottom: 8,
        }}>
          {titleN}
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280',
          lineHeight: 1.55, maxWidth: 640,
        }}>
          {introBody}
        </p>
      </div>

      {/* Stat row */}
      <div style={{
        display: 'grid', gap: 10,
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      }}>
        <StatPill label={t('course.stat.topics')} value={totalTopics > 0 ? String(totalTopics) : '—'} />
        <StatPill label={t('course.stat.tests')} value={hasTests ? t('course.stat.testsYes') : t('course.stat.testsNo')} />
        <StatPill label={t('course.stat.section')} value={sectionTitle} />
      </div>

      {/* Progress bar — striped green track + position marker */}
      <CourseProgressBar
        currentLabel={progressPct === 0
          ? t('course.progress.start')
          : t('course.intro.topicN', { n: Math.max(1, Math.round((progressPct / 100) * totalTopics)) })}
        endLabel={t('course.intro.topicsTotal', { n: totalTopics })}
        startCaption={t('course.intro.startCaption')}
        endCaption={t('course.intro.endCaption')}
        pct={progressPct}
      />

      {/* Start CTA */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        paddingTop: 8, borderTop: '1px dashed #E5E7EB',
      }}>
        <button
          onClick={onStart}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '12px 24px',
            fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: 600,
            color: '#FFFFFF',
            background: '#3B82F6',
            border: 'none', borderRadius: 999,
            cursor: 'pointer',
            transition: 'background 200ms cubic-bezier(0.2,0,0,1), transform 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2563EB';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3B82F6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {t('course.startBtn')}
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1={5} y1={12} x2={19} y2={12} />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
