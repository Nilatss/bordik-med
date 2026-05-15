'use client';

import { motion } from 'framer-motion';
import { getCourseById, getModuleForCourse, getSectionById } from '@/lib/curriculum';
import { useT } from '@/lib/i18n';

// Short detail string for the level pill — kept in English for all locales.
const DIFFICULTY_DETAILS: Record<string, string> = {
  basic: 'Pre-Entry',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

interface CourseHeaderProps {
  courseId: string;
}

/* ═══ Info pill component ═══ */
function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex-1 bg-[#F5F6F8] rounded-[12px] py-3 px-4 flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-1.5 text-[#6B7280]">
        {icon}
        <span className="font-[var(--font-mono)] text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.06em]">
          {label}
        </span>
      </div>
      <span className="font-[var(--font-body)] text-[13px] font-semibold text-[#1A1A1A] leading-[1.35] overflow-hidden text-ellipsis">
        {value}
      </span>
    </div>
  );
}

export default function CourseHeader({ courseId }: CourseHeaderProps) {
  const t = useT();
  const course = getCourseById(courseId);
  const mod = getModuleForCourse(courseId);
  if (!course || !mod) return null;
  const section = getSectionById(mod.sectionId);

  const difficultyLabel = t(`courseHeader.level.${course.difficulty}`);
  const level = `${difficultyLabel}${DIFFICULTY_DETAILS[course.difficulty] ? ` (${DIFFICULTY_DETAILS[course.difficulty]})` : ''}`;
  // Localised audience by section — falls back to «all levels» for sections
  // we don't have a specific audience description for.
  const audienceKey = `courseHeader.audience.${mod.sectionId}`;
  const audience = t(audienceKey) === audienceKey ? t('courseHeader.audience.allLevels') : t(audienceKey);
  // Volume is computed (8 topics × hours-per-difficulty), then formatted.
  const topics = 8;
  const hoursPerTopic = course.difficulty === 'advanced' ? 6
    : course.difficulty === 'intermediate' ? 5 : 5;
  const totalHours = topics * hoursPerTopic;
  const volume = t('courseHeader.volume', { topics, hours: totalHours });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
      className="mb-5"
    >
      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="py-[3px] px-2.5 text-[11px] font-[var(--font-body)] font-medium rounded-full bg-[#E2E4EA] text-[#374151]">
          {difficultyLabel}
        </span>
        {course.tags.map((tag) => (
          <span key={tag} className="py-[3px] px-2.5 text-[11px] font-[var(--font-body)] font-normal text-[#6B7280] bg-[#F0F1F5] rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h1 className="font-[var(--font-display)] text-[length:var(--text-2xl)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-2 tracking-[-0.02em] leading-[1.2]">
        {course.title}
      </h1>

      {/* Description */}
      <p className="font-[var(--font-body)] text-[length:var(--text-sm)] text-[color:var(--md-sys-color-on-surface-variant)] max-w-[var(--content-max)] leading-[1.6] mb-4">
        {course.description}
      </p>

      {/* Info pills: Уровень · Аудитория · Объём.
          On mobile (< 640 px) the .course-info-pills CSS class stacks them
          one-per-row instead of squeezing into 3 narrow columns. */}
      <div className="course-info-pills flex gap-2.5 flex-wrap">
        <InfoPill
          icon={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
          }
          label={t('courseHeader.field.level')}
          value={level}
        />
        <InfoPill
          icon={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
          label={t('courseHeader.field.audience')}
          value={audience}
        />
        <InfoPill
          icon={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          }
          label={t('courseHeader.field.volume')}
          value={volume}
        />
      </div>
    </motion.div>
  );
}
