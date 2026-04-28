'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from './store';
import ru from './i18n/ru';
import type { LangCode, Dict } from './i18n/types';

export type { LangCode, Dict };

/**
 * Locale loader.
 *
 * Russian is the source-of-truth and is statically imported (every page
 * needs SOMETHING immediately while it boots). English / Uzbek are loaded
 * via dynamic import - their JSON-as-TS chunks (~11 KB each) only land in
 * the bundle when a user actually picks that language. For the typical
 * Russian user this saves ~21 KB of main-bundle parse cost.
 *
 * The loaded dict is cached at module level so subsequent reads are
 * synchronous after the first language switch.
 */

export const languages: { code: LangCode; label: string; flag: string }[] = [
  { code: 'ru', label: 'Русский',     flag: '🇷🇺' },
  { code: 'en', label: 'English',     flag: '🇬🇧' },
  { code: 'uz', label: "O'zbekcha",   flag: '🇺🇿' },
];

const cache: Partial<Record<LangCode, Dict>> = { ru };
const inFlight: Partial<Record<LangCode, Promise<Dict>>> = {};

const loaders: Record<LangCode, () => Promise<{ default: Dict }>> = {
  ru: () => Promise.resolve({ default: ru }),
  en: () => import('./i18n/en'),
  uz: () => import('./i18n/uz'),
};

function loadDict(lang: LangCode): Promise<Dict> {
  const cached = cache[lang];
  if (cached) return Promise.resolve(cached);
  const flight = inFlight[lang];
  if (flight) return flight;
  inFlight[lang] = loaders[lang]()
    .then((m) => {
      cache[lang] = m.default;
      delete inFlight[lang];
      return m.default;
    })
    .catch((err) => {
      delete inFlight[lang];
      console.warn(`[i18n] failed to load ${lang}, falling back to ru`, err);
      // Fallback: cache the Russian dict under that lang code so we don't
      // retry forever; the user just sees Russian text.
      cache[lang] = ru;
      return ru;
    });
  return inFlight[lang]!;
}

/** Backward compat: map legacy label → code (handles old kk / uk values
 *  stored before we dropped those locales — they fall back to ru). */
export function normalizeLang(v: string): LangCode {
  if (v === 'Русский' || v === 'ru') return 'ru';
  if (v === 'English' || v === 'en') return 'en';
  if (v === "O'zbekcha" || v === 'uz' || v === "O‘zbekcha") return 'uz';
  // Legacy values → fall back to Russian (the old kk/uk locales were
  // removed; see the change to remove Kazakh and Ukrainian from picker).
  if (v === 'Қазақша' || v === 'kk') return 'ru';
  if (v === 'Українська' || v === 'uk') return 'ru';
  return 'ru';
}

/**
 * Synchronous translation. If the requested locale isn't loaded yet,
 * falls back to Russian. Use this when:
 *   - The locale is `'ru'`, OR
 *   - You can tolerate showing Russian for the first ~50 ms after a
 *     language switch (acceptable for non-critical UI).
 *
 * Components that need ALWAYS-correct translations should use `useT()`
 * which automatically re-renders when the dict finishes loading.
 */
export function t(lang: LangCode, key: string, vars?: Record<string, string | number>): string {
  const dict = cache[lang] ?? ru;
  let str = dict[key] ?? ru[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

/**
 * React hook: returns a translator bound to the active language. Triggers
 * a lazy load on first use of a non-Russian locale; while loading, shows
 * Russian text and re-renders once the dict arrives.
 */
export function useT() {
  const userLanguage = useAppStore((s) => s.userLanguage);
  const lang = normalizeLang(userLanguage);
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (cache[lang]) return;
    let cancelled = false;
    loadDict(lang).then(() => {
      if (!cancelled) setVersion((v) => v + 1);
    });
    return () => { cancelled = true; };
  }, [lang]);

  return (key: string, vars?: Record<string, string | number>) => t(lang, key, vars);
}

export function useLang(): LangCode {
  const userLanguage = useAppStore((s) => s.userLanguage);
  return normalizeLang(userLanguage);
}

/* Email validation */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
