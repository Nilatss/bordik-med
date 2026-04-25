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
    <div style={{
      flex: 1,
      background: '#F5F6F8',
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
      minWidth: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        color: '#6B7280',
      }}>
        {icon}
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {label}
        </span>
      </div>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
        color: '#1A1A1A', lineHeight: 1.35,
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
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
      style={{ marginBottom: 20 }}
    >
      {/* Tags */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        gap: 6, marginBottom: 12,
      }}>
        <span style={{
          padding: '3px 10px',
          fontSize: 11,
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          borderRadius: 999,
          backgroundColor: '#E2E4EA',
          color: '#374151',
        }}>
          {difficultyLabel}
        </span>
        {course.tags.map((tag) => (
          <span key={tag} style={{
            padding: '3px 10px',
            fontSize: 11,
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            color: '#6B7280',
            background: '#F0F1F5',
            borderRadius: 999,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 700,
        color: 'var(--md-sys-color-on-surface)',
        marginBottom: 8,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      }}>
        {course.title}
      </h1>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--md-sys-color-on-surface-variant)',
        maxWidth: 'var(--content-max)',
        lineHeight: 1.6,
        marginBottom: 16,
      }}>
        {course.description}
      </p>

      {/* Info pills: Уровень · Аудитория · Объём.
          On mobile (< 640 px) the .course-info-pills CSS class stacks them
          one-per-row instead of squeezing into 3 narrow columns. */}
      <div className="course-info-pills" style={{
        display: 'flex', gap: 10, flexWrap: 'wrap',
      }}>
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
