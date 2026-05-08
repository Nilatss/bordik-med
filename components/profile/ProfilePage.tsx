'use client';

import { useState, useRef, useEffect } from 'react';
import { TOTAL_COURSES } from '@/lib/curriculum';
import { useAppStore, formatStudyTime, getTotalStudyTime } from '@/lib/store';
import { MAX_TEST_LEVELS } from '@/lib/quiz';
import { useT, useLang, languages, isValidEmail } from '@/lib/i18n';
import {
  countries, statuses, specialties, goals,
  findOption,
} from '@/lib/profile-options';
import Dropdown from '@/components/ui/Dropdown';
// P1-CR-3 — score widgets (ScoreGauge, MiniScore, MetricCard) вынесены
// в отдельный файл. См. ScoreWidgets.tsx — все 3 связанных visualization
// компонента с общей color-логикой для метрик профиля.
import { ScoreGauge, MetricCard } from './ScoreWidgets';
import { Row } from './Row';
import { EditableName } from './EditableName';

// EditableName вынесен в ./EditableName.tsx
// ICONS + Row вынесены в ./Row.tsx

/* ═══ Email row with validation ═══ */
function EmailRow({ value, onSave, t }: { value: string; onSave: (v: string) => void; t: (k: string) => string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [isEditing]);

  const isValid = draft === '' || isValidEmail(draft);
  const showError = touched && !isValid;

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === '' || isValidEmail(trimmed)) {
      if (trimmed !== value) onSave(trimmed);
      setIsEditing(false);
      setTouched(false);
    } else {
      setTouched(true);
    }
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
    setTouched(false);
  };

  if (isEditing) {
    return (
      <Row icon="mail" label={t('profile.email')}>
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            type="email"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setTouched(true); }}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); commit(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') cancel();
            }}
            placeholder="name@example.com"
            aria-invalid={showError || undefined}
            title={showError ? t('profile.invalidEmail') : undefined}
            style={{
              width: '100%',
              height: 38,
              padding: showError ? '8px 36px 8px 14px' : '8px 14px',
              background: showError ? '#FDF3F3' : (focused ? '#DFE2E8' : '#E8EAEF'),
              border: 'none',
              borderRadius: 8,
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              color: showError ? '#9F4848' : '#1A1A1A',
              outline: 'none',
              textAlign: 'left',
              transition: 'background 180ms, color 180ms, padding 180ms',
            }}
          />
          {showError && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18, height: 18,
                color: '#C97878',
                pointerEvents: 'none',
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
          )}
        </div>
      </Row>
    );
  }

  return (
    <Row icon="mail" label={t('profile.email')}>
      <button
        onClick={() => { setDraft(value); setIsEditing(true); }}
        style={{
          width: '100%',
          height: 38,
          padding: '8px 12px 8px 14px',
          background: '#EEF0F3',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
          color: value ? '#1A1A1A' : '#9CA3AF',
          textAlign: 'left',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#E8EAEF'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#EEF0F3'; }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || t('profile.chooseEmail')}
        </span>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </button>
    </Row>
  );
}

/* ═══ Main ProfilePage ═══ */
export default function ProfilePage() {
  const t = useT();
  const lang = useLang();
  const {
    completedCourses, studyTime, testAttempts, courseTestProgress,
    userName, userEmail, userStatus, userCountry, userSpecialty, userLanguage, userGoal,
    setUserProfile,
  } = useAppStore();

  const totalCompleted = completedCourses.length;
  const totalTime = getTotalStudyTime(studyTime);
  const progress = Math.round((totalCompleted / TOTAL_COURSES) * 100);

  const totalTestsPassed = Object.values(courseTestProgress).reduce((s, v) => s + v, 0);
  const totalTestsMax = TOTAL_COURSES * MAX_TEST_LEVELS;
  const totalAttempts = Object.values(testAttempts).reduce((s, arr) => s + arr.length, 0);

  const allScores = Object.values(testAttempts).flat();
  const avgScore = allScores.length > 0
    ? Math.round(allScores.reduce((s, a) => s + (a.score / a.total) * 100, 0) / allScores.length)
    : 0;

  const hours = Math.round(totalTime / 3600);

  // Gauge label
  const gaugeLabel =
    progress >= 80 ? t('profile.excellent') :
    progress >= 50 ? t('profile.good') :
    progress >= 10 ? t('profile.start') : t('profile.start');

  // Metrics
  const metrics = [
    {
      value: totalCompleted, max: TOTAL_COURSES,
      title: t('profile.courses'),
      description: t('profile.coursesDone', { n: totalCompleted, total: TOTAL_COURSES }),
      impact: totalCompleted > 50 ? t('profile.excellent') : totalCompleted > 10 ? t('profile.good') : t('profile.start'),
      impactColor: totalCompleted > 50 ? '#C0392B' : totalCompleted > 10 ? '#E67E22' : '#27AE60',
      impactBg: totalCompleted > 50 ? '#FDEDEC' : totalCompleted > 10 ? '#FEF5E7' : '#E8F8F0',
      circleColor: '#E74C3C',
    },
    {
      value: totalTestsPassed, max: totalTestsMax,
      title: t('profile.tests'),
      description: t('profile.testsDone', { n: totalTestsPassed, total: totalTestsMax }),
      impact: totalTestsPassed > 100 ? t('profile.excellent') : totalTestsPassed > 20 ? t('profile.good') : t('profile.start'),
      impactColor: '#E67E22',
      impactBg: '#FEF5E7',
      circleColor: '#F39C12',
    },
    {
      value: Math.min(hours, 100), max: 100,
      title: t('profile.studyTime'),
      description: totalTime > 0 ? formatStudyTime(totalTime) : (lang === 'en' ? '0 min' : '0 минут'),
      impact: hours > 50 ? t('profile.much') : hours > 10 ? t('profile.medium') : t('profile.little'),
      impactColor: '#2980B9',
      impactBg: '#EBF5FB',
      circleColor: '#3498DB',
    },
    {
      value: avgScore, max: 100,
      title: t('profile.avgScore'),
      description: allScores.length > 0 ? t('profile.scoreBy', { score: avgScore, n: totalAttempts }) : t('profile.noAttempts'),
      impact: avgScore >= 90 ? t('profile.excellent') : avgScore >= 70 ? t('profile.good') : t('profile.needImprove'),
      impactColor: '#27AE60',
      impactBg: '#E8F8F0',
      circleColor: '#2ECC71',
    },
  ];

  const completeness = `${progress}%`;
  const testPassRate = totalTestsMax > 0 ? `${Math.round((totalTestsPassed / totalTestsMax) * 100)}%` : '0%';

  // Language options for the interface-language dropdown
  const languageOptions = languages.map((l) => ({
    value: l.code,
    label: l.label,
    emoji: l.flag,
  }));

  // Resolve language current value to a language code
  const currentLangCode = lang;

  // Date in current locale
  const localeMap: Record<string, string> = { ru: 'ru-RU', en: 'en-GB', uz: 'uz-UZ' };
  const dateStr = new Date().toLocaleDateString(localeMap[lang] || 'ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{ width: '100%' }}>
      <div className="profile-2col" style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: 16, alignItems: 'stretch' }}>

        {/* LEFT: User card */}
        <div style={{
          background: '#F5F6F8',
          borderRadius: 20,
          padding: '28px 24px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          border: 'none',
          overflow: 'visible',
        }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#E2E4EA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#555',
            }}>
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>

          <EditableName value={userName} onSave={(v) => setUserProfile({ userName: v })} />

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 12, color: '#AAA', marginBottom: 20,
          }}>
            {dateStr}
          </p>

          {/* 3 stats bar */}
          <div style={{
            display: 'flex', width: '100%',
            background: '#FFFFFF', borderRadius: 14,
            padding: '12px 8px',
            marginBottom: 20,
          }}>
            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #E8E9ED' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>
                {completeness}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#999', marginTop: 2 }}>
                {t('profile.progress')}
              </p>
            </div>
            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #E8E9ED' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>
                {testPassRate}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#999', marginTop: 2 }}>
                {t('profile.tests')}
              </p>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>
                {avgScore > 0 ? `${avgScore}%` : '-'}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#999', marginTop: 2 }}>
                {t('profile.avgScore')}
              </p>
            </div>
          </div>

          {/* Student info */}
          <div style={{
            width: '100%', paddingBottom: 24,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {/* Email (validated) */}
            <EmailRow value={userEmail} onSave={(v) => setUserProfile({ userEmail: v })} t={t} />

            {/* Status */}
            <Row icon="book" label={t('profile.status')}>
              <Dropdown
                value={findOption(statuses, userStatus)?.value || ''}
                options={statuses}
                placeholder={t('profile.notSetM')}
                onChange={(v) => setUserProfile({ userStatus: v })}
              />
            </Row>

            {/* Country (searchable) */}
            <Row icon="globe" label={t('profile.country')}>
              <Dropdown
                value={findOption(countries, userCountry)?.value || ''}
                options={countries}
                placeholder={t('profile.notSetF')}
                searchable
                searchPlaceholder={t('common.search')}
                onChange={(v) => setUserProfile({ userCountry: v })}
              />
            </Row>

            {/* Specialty (searchable) */}
            <Row icon="briefcase" label={t('profile.specialty')}>
              <Dropdown
                value={findOption(specialties, userSpecialty)?.value || ''}
                options={specialties}
                placeholder={t('profile.notSet')}
                searchable
                searchPlaceholder={t('common.search')}
                onChange={(v) => setUserProfile({ userSpecialty: v })}
              />
            </Row>

            {/* Language (changes UI) */}
            <Row icon="language" label={t('profile.language')}>
              <Dropdown
                value={currentLangCode}
                options={languageOptions}
                onChange={(v) => setUserProfile({ userLanguage: v })}
              />
            </Row>

            {/* Goal */}
            <Row icon="target" label={t('profile.goal')}>
              <Dropdown
                value={findOption(goals, userGoal)?.value || ''}
                options={goals}
                placeholder={t('profile.notSetF')}
                onChange={(v) => setUserProfile({ userGoal: v })}
              />
            </Row>
          </div>
        </div>

        {/* RIGHT: Gauge + metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: '#F5F6F8',
            borderRadius: 20,
            padding: '32px 24px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            border: 'none',
          }}>
            <ScoreGauge score={progress} label={gaugeLabel} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {metrics.map((m) => (
              <MetricCard key={m.title} {...m} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
