'use client';

/**
 * Главная страница как новостной фид.
 *
 * Источник — public/release-notes.json (тот же файл, что питает /releases
 * и тост «Обновить» из PwaRegistrar). Здесь показываем 5 последних
 * записей с полным саммари и булет-листом изменений.
 *
 * Зачем дублировать /releases:
 *   - /releases — это публичный changelog, индексируется Google,
 *     SSG-страница; на неё ведёт «Что нового» из toast
 *   - Главная — стартовый экран приложения; нам нужна лента в Bordik-shell
 *     с возможностью пролистать что было, и тут же ссылка на инструменты,
 *     не уходя из shell-а
 *
 * Фид → клиентский fetch /release-notes.json (force-cache + SW precache),
 * никакого SSR — Главная и так клиентская.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ReleaseEntry {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: string[];
}

interface ReleasesFile {
  releases?: ReleaseEntry[];
}

const VISIBLE_COUNT = 5;

function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  const monthIdx = parseInt(m[2]!, 10) - 1;
  const day = parseInt(m[3]!, 10);
  return `${day} ${months[monthIdx] ?? m[2]} ${m[1]}`;
}

export default function NewsFeed() {
  const [releases, setReleases] = useState<ReleaseEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        // cache: 'no-cache' — обходит SW/HTTP-кэш, заставляет браузер
        // делать conditional GET (If-None-Match → 304 Not Modified если
        // сервер не менял JSON). Раньше с force-cache пользователи
        // зависали на старой версии после деплоя нового релиза.
        const r = await fetch('/release-notes.json', { cache: 'no-cache' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as ReleasesFile;
        if (!cancelled) setReleases((json.releases ?? []).slice(0, VISIBLE_COUNT));
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'fetch failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return null; // тихо: главная не должна падать из-за фида
  }

  if (!releases) {
    return (
      <div className="flex flex-col gap-4">
        <div className="lc-shimmer h-7 w-60 rounded-lg" />
        <div className="lc-shimmer h-4 w-3/5 rounded-md mb-2" />
        <div className="lc-shimmer h-[140px] w-full rounded-[14px]" />
        <div className="lc-shimmer h-[140px] w-full rounded-[14px]" />
      </div>
    );
  }

  if (releases.length === 0) return null;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        className="mb-6"
      >
        <h2 className="font-[var(--font-display)] text-[28px] font-bold text-[#1A1A1A] mb-1.5 tracking-[-0.02em]">
          Что нового
        </h2>
        <p className="font-[var(--font-body)] text-sm text-[#6B7280] leading-[1.5]">
          Свежие апдейты Bordik: новые калькуляторы, контент, фичи и улучшения
          интерфейса.{' '}
          <a href="/releases" className="text-[#1A1A1A] underline underline-offset-2">
            Полная история →
          </a>
        </p>
      </motion.div>

      <ul className="list-none p-0 m-0 flex flex-col gap-[14px]">
        {releases.map((r, i) => (
          <motion.li
            key={r.version}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 + i * 0.04 }}
            className="py-5 px-[22px] bg-white border border-[#F0F1F5] rounded-[14px]"
          >
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <span className="font-[var(--font-mono,ui-monospace)] text-[11px] font-bold py-0.5 px-2 rounded-full bg-[#1A1A1A] text-white tracking-[0.02em]">
                v{r.version}
              </span>
              <span className="font-[var(--font-mono,ui-monospace)] text-[11px] text-[#9CA3AF]">
                {formatDate(r.date)}
              </span>
            </div>
            <h3 className="m-0 font-[var(--font-display)] text-lg font-bold text-[#1A1A1A] tracking-[-0.01em] leading-[1.3]">
              {r.title}
            </h3>
            <p className="mt-2 mb-0 text-sm text-[#4B5563] leading-[1.55]">
              {r.summary}
            </p>
            {r.changes.length > 0 && (
              <ul className="mt-[14px] mb-0 p-0 list-none flex flex-col gap-1.5">
                {r.changes.map((change, j) => (
                  <li key={j} className="flex gap-2.5 text-[13px] text-[#374151] leading-[1.5]">
                    <span aria-hidden="true" className="flex-[0_0_4px] mt-2 w-1 h-1 rounded-full bg-[#1A1A1A]" />
                    <span className="flex-1">{change}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-[#9CA3AF]">
        Показано {releases.length} последн{releases.length === 1 ? 'ий' : 'их'} релиз{releases.length === 1 ? '' : 'а'}.{' '}
        <a href="/releases" className="text-[#6B7280] underline underline-offset-2">
          Все релизы
        </a>
      </p>
    </div>
  );
}
