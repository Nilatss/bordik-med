'use client';

/**
 * SPA-обёртка над <Icd10Lookup/>. Подгружает /icd10-starter.json
 * клиентским fetch (force-cache + SW precache → мгновенно после
 * первого визита) и рендерит ту же UI-карточку, что и /icd10.
 *
 * Зачем дублировать вместо `redirect('/icd10')`:
 *   - страница /icd10 — отдельный SSG-роут, у неё нет нашего сайдбара
 *     (его добавит только wrap в layout, и это слом UX в других местах);
 *   - переход из сайдбара должен оставаться внутри SPA-shell-а — иначе
 *     теряется навигация, поиск и текущий стейт;
 *   - JSON один и тот же, дополнительный bundle-overhead 0 — Icd10Lookup
 *     уже precache-ит SW для офлайна.
 */

import { useEffect, useState } from 'react';
import Icd10Lookup from './Icd10Lookup';

interface Chapter { id: string; range: string; title: string }
interface CodeEntry { code: string; title: string; chapter: string }
interface Bank {
  version: string;
  lastUpdated: string;
  source: string;
  chapters: Chapter[];
  codes: CodeEntry[];
}

function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export default function Icd10View() {
  const [bank, setBank] = useState<Bank | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        // ?v= bust для обхода Serwist precache: иначе после расширения
        // базы (92→506 кодов) пользователи продолжают видеть старую
        // версию пока SW не активирует новый бандл. v параметр
        // увеличиваем при значимых изменениях содержимого JSON.
        const r = await fetch('/icd10-starter.json?v=0.2.0', { cache: 'no-cache' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!cancelled) setBank(json);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <main id="main-content" style={{
        maxWidth: 960, margin: '0 auto', padding: '32px 24px',
        fontFamily: 'var(--font-body, system-ui)',
        color: 'var(--md-sys-color-on-surface, #1A1A1A)',
      }}>
        <p style={{ color: '#EF4444' }}>
          Не удалось загрузить справочник МКБ-10: {error}.
        </p>
      </main>
    );
  }

  if (!bank) {
    return (
      <main id="main-content" style={{ padding: '40px 24px' }}>
        <div className="lc-shimmer" style={{ height: 28, width: 240, borderRadius: 8, marginBottom: 14 }} />
        <div className="lc-shimmer" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 24 }} />
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 64, width: '100%', borderRadius: 12 }} />
      </main>
    );
  }

  return (
    <Icd10Lookup
      chapters={bank.chapters}
      codes={bank.codes}
      version={bank.version}
      lastUpdated={formatDate(bank.lastUpdated)}
      source={bank.source}
    />
  );
}
