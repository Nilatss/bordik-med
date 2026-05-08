/**
 * Pure helpers for ToolView (no React/JSX dependencies).
 *
 * P1-CR-3 — extracted from ToolView.tsx step 1/N.
 */
import type { Tab } from './types';

/** Slugify heading text → tab id. */
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-+|-+$/g, '');
}

/**
 * URL regex for inline-link extraction in plain-text fields
 * (actions / caveats / details).
 */
export const URL_REGEX = /(https?:\/\/[^\s<>()"']+[^\s<>()"'.,;:!?])/g;

/** Shorten long H3 titles for sidebar pills (keep ≤ 28 chars at word boundary). */
export function shortenTitle(title: string): string {
  if (title.length <= 28) return title;
  const cut = title.slice(0, 28);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 12 ? cut.slice(0, lastSpace) : cut) + '…';
}

/**
 * Choose an icon family key based on title text. Used by sidebar TabIcon
 * to render category-appropriate glyphs without manual per-runner config.
 */
export function iconKeyForTitle(t: string): string {
  const x = t.toLowerCase();
  if (/для чего|описани|что (с|и|о)/.test(x)) return 'info';
  if (/когда|применени|показани|время|период/.test(x)) return 'clock';
  if (/формул|расч|уравнен/.test(x)) return 'formula';
  if (/интерпрет|значени|шкал|класс|оцен|стади|групп|порог/.test(x)) return 'bar';
  if (/тактик|лечени|терапи|алгоритм|действи|ведени|препарат|лекарств|терапии/.test(x)) return 'action';
  if (/преимущ|сравнени|альтернатив|vs/.test(x)) return 'compare';
  if (/ограничени|противопоказ|предостер|ошиб|не работ/.test(x)) return 'warn';
  if (/критер|компонент|ключев|состав|параметр/.test(x)) return 'check';
  if (/возбуд|инфекц|микро|бактер|вирус|этиолог/.test(x)) return 'germ';
  if (/педиатр|дет/.test(x)) return 'child';
  if (/беремен|акушер/.test(x)) return 'preg';
  if (/мониторинг|контрол|отслеж/.test(x)) return 'pulse';
  if (/профилакт|предупрежд/.test(x)) return 'shield';
  if (/пример|расчёт|вычислен/.test(x)) return 'numbers';
  if (/свя[зз]|связанные|дополнительн|другие шкалы/.test(x)) return 'link';
  if (/ответ/.test(x)) return 'check';
  if (/кроме|эволюц/.test(x)) return 'compare';
  return 'doc';
}

/** Split the info markdown into H3-based sections. Each section becomes a tab. */
export function buildInfoTabs(md: string): Tab[] {
  const lines = md.split('\n');
  const tabs: Tab[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];

  const push = () => {
    if (!currentTitle) return;
    tabs.push({
      id: slugify(currentTitle),
      title: currentTitle,
      short: shortenTitle(currentTitle),
      iconKey: iconKeyForTitle(currentTitle),
      kind: 'info',
      body: currentLines.join('\n').trim(),
    });
  };

  for (const line of lines) {
    const m = line.match(/^###\s+(.+?)\s*$/);
    if (m && m[1]) {
      push();
      currentTitle = m[1].trim();
      currentLines = [];
    } else if (currentTitle) {
      currentLines.push(line);
    }
  }
  push();
  return tabs;
}
