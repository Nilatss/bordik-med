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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="lc-shimmer" style={{ height: 28, width: 240, borderRadius: 8 }} />
        <div className="lc-shimmer" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 8 }} />
        <div className="lc-shimmer" style={{ height: 140, width: '100%', borderRadius: 14 }} />
        <div className="lc-shimmer" style={{ height: 140, width: '100%', borderRadius: 14 }} />
      </div>
    );
  }

  if (releases.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
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
          Что нового
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280', lineHeight: 1.5,
        }}>
          Свежие апдейты Bordik: новые калькуляторы, контент, фичи и улучшения
          интерфейса.{' '}
          <a href="/releases" style={{ color: '#1A1A1A', textDecoration: 'underline', textUnderlineOffset: 2 }}>
            Полная история →
          </a>
        </p>
      </motion.div>

      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {releases.map((r, i) => (
          <motion.li
            key={r.version}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 + i * 0.04 }}
            style={{
              padding: '20px 22px',
              background: '#FFFFFF',
              border: '1px solid #F0F1F5',
              borderRadius: 14,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              marginBottom: 8,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono, ui-monospace)',
                fontSize: 11, fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#1A1A1A',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
              }}>
                v{r.version}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono, ui-monospace)',
                fontSize: 11, color: '#9CA3AF',
              }}>
                {formatDate(r.date)}
              </span>
            </div>
            <h3 style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 18, fontWeight: 700,
              color: '#1A1A1A',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}>
              {r.title}
            </h3>
            <p style={{
              margin: '8px 0 0',
              fontSize: 14, color: '#4B5563', lineHeight: 1.55,
            }}>
              {r.summary}
            </p>
            {r.changes.length > 0 && (
              <ul style={{
                margin: '14px 0 0',
                padding: 0, listStyle: 'none',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                {r.changes.map((change, j) => (
                  <li key={j} style={{
                    display: 'flex', gap: 10,
                    fontSize: 13, color: '#374151', lineHeight: 1.5,
                  }}>
                    <span aria-hidden="true" style={{
                      flex: '0 0 4px', marginTop: 8,
                      width: 4, height: 4, borderRadius: '50%',
                      background: '#1A1A1A',
                    }} />
                    <span style={{ flex: 1 }}>{change}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.li>
        ))}
      </ul>

      <p style={{
        marginTop: 20, fontSize: 12, color: '#9CA3AF',
      }}>
        Показано {releases.length} последн{releases.length === 1 ? 'ий' : 'их'} релиз{releases.length === 1 ? '' : 'а'}.{' '}
        <a href="/releases" style={{ color: '#6B7280', textDecoration: 'underline', textUnderlineOffset: 2 }}>
          Все релизы
        </a>
      </p>
    </div>
  );
}
