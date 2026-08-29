/**
 * Regression tests for the "useful table" detector in LessonContent.tsx
 * (drives the "Скачать PDF" button per CLAUDE.md's PDF-download standard).
 *
 * Two stacked bugs, found while investigating a scan-flagged `'ph\b'`
 * regex typo:
 *
 * 1. ROOT CAUSE — `extractText(c.children as never)` was called on hast
 *    nodes (the `node` prop react-markdown passes to component overrides,
 *    whose text leaves are `{ type: 'text', value: '...' }`), but
 *    `extractText` (lib/course/lesson-utils) walks *React* children
 *    (`.props.children`). A hast node has no `.props`, so this always
 *    returned '' — EVERY table header was read as an empty string,
 *    meaning the entire keyword rule never matched anything, for any of
 *    the ~40 documented keywords, on any course table. Only the
 *    "3+ cols AND 4+ rows" size fallback ever granted the button in
 *    production. Fixed by a dedicated `hastText` walker.
 *
 * 2. SYMPTOM (masked by #1, but wrong on its own) — `USEFUL_KEYWORDS`
 *    contained the string literal `'ph\b'`. Inside a plain JS/TS string,
 *    `\b` is the *backspace* escape character, not a regex word-boundary
 *    token — `new RegExp('ph\b')` only matches a literal backspace byte,
 *    which never occurs in real text. Fixed to plain `'ph'`, consistent
 *    with every other entry in the list (none of which use `\b`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LessonContent } from '@/components/course/lesson/LessonContent';

function renderTable(body: string): string {
  return renderToStaticMarkup(
    createElement(LessonContent, { body, tabContext: {} }),
  );
}

const PH_TABLE = [
  '| pH | Значение |',
  '| --- | --- |',
  '| Артериальная кровь | 7.35–7.45 |',
  '| Венозная кровь | 7.32–7.42 |',
].join('\n');

const DOSAGE_TABLE = [
  '| Препарат | Дозировка |',
  '| --- | --- |',
  '| Аспирин | 100 мг |',
].join('\n');

const UNRELATED_SMALL_TABLE = [
  '| A | B |',
  '| --- | --- |',
  '| x | y |',
].join('\n');

describe('LessonContent · "useful table" keyword detection', () => {
  it('root cause: reads real header text from a 1-word header, not an empty string', () => {
    // A 1-col x 1-row table can only get the button via the keyword rule
    // (isLarge needs 3+ cols and 4+ rows) — so this isolates header-text
    // extraction from the size fallback entirely.
    const html = renderTable(DOSAGE_TABLE);
    expect(html).toContain('Скачать PDF');
  });

  it('gives a 2-col/2-row table headed "pH" the PDF download button', () => {
    const html = renderTable(PH_TABLE);
    expect(html).toContain('Скачать PDF');
  });

  it('does NOT give a small table with an unrelated header the PDF button', () => {
    const html = renderTable(UNRELATED_SMALL_TABLE);
    expect(html).not.toContain('Скачать PDF');
  });
});
