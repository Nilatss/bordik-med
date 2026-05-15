'use client';

import { useState } from 'react';
import { TOTAL_COURSES } from '@/lib/curriculum';
import { useAppStore, formatStudyTime, getTotalStudyTime } from '@/lib/store';
import { MAX_TEST_LEVELS } from '@/lib/quiz';
import { useT, useLang, languages } from '@/lib/i18n';
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
import { EmailRow } from './EmailRow';

// Все 4 sub-components вынесены:
// - ScoreWidgets (ScoreGauge / MiniScore / MetricCard)
// - Row + ICONS
// - EditableName
// - EmailRow

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
    <div className="w-full">
      <div className="profile-2col grid grid-cols-[500px_1fr] gap-4 items-stretch">

        {/* LEFT: User card */}
        <div className="bg-[#F5F6F8] rounded-[20px] pt-7 px-6 pb-0 flex flex-col items-center border-none overflow-visible">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-[#E2E4EA] flex items-center justify-center mb-3">
            <span className="font-[var(--font-display)] text-[22px] font-bold text-[#555]">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>

          <EditableName value={userName} onSave={(v) => setUserProfile({ userName: v })} />

          <p className="font-[var(--font-body)] text-xs text-[#AAA] mb-5">
            {dateStr}
          </p>

          {/* 3 stats bar */}
          <div className="flex w-full bg-white rounded-[14px] py-3 px-2 mb-5">
            <div className="flex-1 text-center border-r border-[#E8E9ED]">
              <p className="font-[var(--font-display)] text-lg font-bold text-[#1A1A1A]">
                {completeness}
              </p>
              <p className="font-[var(--font-body)] text-[10px] text-[#999] mt-0.5">
                {t('profile.progress')}
              </p>
            </div>
            <div className="flex-1 text-center border-r border-[#E8E9ED]">
              <p className="font-[var(--font-display)] text-lg font-bold text-[#1A1A1A]">
                {testPassRate}
              </p>
              <p className="font-[var(--font-body)] text-[10px] text-[#999] mt-0.5">
                {t('profile.tests')}
              </p>
            </div>
            <div className="flex-1 text-center">
              <p className="font-[var(--font-display)] text-lg font-bold text-[#1A1A1A]">
                {avgScore > 0 ? `${avgScore}%` : '-'}
              </p>
              <p className="font-[var(--font-body)] text-[10px] text-[#999] mt-0.5">
                {t('profile.avgScore')}
              </p>
            </div>
          </div>

          {/* Student info */}
          <div className="w-full pb-6 flex flex-col gap-1">
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
        <div className="flex flex-col gap-4">
          <div className="bg-[#F5F6F8] rounded-[20px] pt-8 px-6 pb-6 flex flex-col items-center border-none">
            <ScoreGauge score={progress} label={gaugeLabel} />
          </div>

          <div className="flex flex-col gap-2.5">
            {metrics.map((m) => (
              <MetricCard key={m.title} {...m} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
