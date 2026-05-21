/**
 * Tests for the definition-list → table conversion in preprocessContent.
 *
 * Regression (2026-05-19 user report "что это за груда текста"): the
 * Physics course "Справочные величины" appendix was authored as ~20
 * consecutive `**Термин**: значение` lines. Markdown joins consecutive
 * non-blank lines into one paragraph, so it rendered as an unreadable
 * wall. preprocessContent now turns a run of ≥3 such lines into a
 * 2-column GFM table.
 */
import { describe, it, expect } from 'vitest';
import { preprocessContent } from '@/lib/course/lesson-utils';
import { content } from '@/lib/content';

describe('preprocessContent · definition list → table', () => {
  it('converts a run of ≥3 "**Term**: value" lines into a GFM table', () => {
    const md = [
      '**Артериальное давление**: 120/80 мм рт. ст.',
      '**ЧСС в покое**: 60-80/мин.',
      '**pH крови**: 7,35-7,45.',
    ].join('\n');
    const out = preprocessContent(md);
    expect(out).toContain('| Показатель | Значение |');
    expect(out).toContain('| --- | --- |');
    expect(out).toContain('| **Артериальное давление** | 120/80 мм рт. ст. |');
    expect(out).toContain('| **ЧСС в покое** | 60-80/мин. |');
  });

  it('leaves a short run (<3) as plain lines (likely prose emphasis)', () => {
    const md = '**Важно**: одно.\n**Ещё**: два.';
    const out = preprocessContent(md);
    expect(out).not.toContain('| Показатель | Значение |');
    expect(out).toContain('**Важно**: одно.');
  });

  it('escapes pipe characters inside term/value cells', () => {
    const md = [
      '**A**: x | y.',
      '**B**: z.',
      '**C**: w.',
    ].join('\n');
    const out = preprocessContent(md);
    expect(out).toContain('| **A** | x \\| y. |');
  });

  it('puts a blank line before and after the generated table', () => {
    const md = [
      'Вступление.',
      '**A**: 1.',
      '**B**: 2.',
      '**C**: 3.',
      'Заключение.',
    ].join('\n');
    const out = preprocessContent(md);
    const lines = out.split('\n');
    const tableStart = lines.findIndex((l) => l.includes('| Показатель |'));
    expect(tableStart).toBeGreaterThan(0);
    expect(lines[tableStart - 1]).toBe(''); // blank line before
  });
});

describe('preprocessContent · real Physics appendix', () => {
  it('Physics "Справочные величины" no longer renders as one wall', () => {
    const body = content['100.4']?.main ?? '';
    const start = body.indexOf('# Приложение. Справочные величины');
    expect(start).toBeGreaterThan(0);
    const after = body.slice(start);
    const nextH = after.indexOf('\n# ', 3);
    const appendix = nextH > 0 ? after.slice(0, nextH) : after;
    const out = preprocessContent(appendix);
    // Должна появиться таблица справочных величин.
    expect(out).toContain('| Показатель | Значение |');
    // И сохраниться значения.
    expect(out).toContain('Артериальное давление');
    expect(out).toContain('7,35-7,45');
  });
});
