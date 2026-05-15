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
      className="bg-white rounded-[var(--md-sys-shape-corner-extra-large)] p-[var(--space-6)] border border-[#F0F1F5] flex flex-col gap-5"
    >
      <div>
        <p className="font-[var(--font-mono)] text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-2">
          {t('course.intro.label')}
        </p>
        <h2 className="font-[var(--font-display)] text-[22px] font-bold text-[#1A1A1A] leading-[1.25] tracking-[-0.01em] mb-2">
          {titleN}
        </h2>
        <p className="font-[var(--font-body)] text-sm text-[#6B7280] leading-[1.55] max-w-[640px]">
          {introBody}
        </p>
      </div>

      {/* Stat row */}
      <div className="grid gap-2.5 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
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
      <div className="flex justify-end pt-2 border-t border-dashed border-[#E5E7EB]">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2.5 py-3 px-6 font-[var(--font-body)] text-[14.5px] font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] hover:-translate-y-px border-none rounded-full cursor-pointer transition-[background,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)]"
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
