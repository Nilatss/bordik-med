/**
 * Tests for `parseGlossary` — covers the markdown-bullet glossary format
 * used by the imported довузовые courses, on top of the legacy
 * `Term: definition` colon format.
 *
 * Regression (2026-05-19 user report): the Biology course glossary
 * rendered as a literal wall of text with raw `**` / `*` markers because
 * parseGlossary only understood `Term: def` and dumped the bullet list
 * into `intro`. Now it splits `- **Term** (etymology) — def` into cards,
 * captures trailing prose as `outro`, and drops a leaked module footer.
 */
import { describe, it, expect } from 'vitest';
import { parseGlossary } from '@/lib/course/lesson-utils';
import { content } from '@/lib/content';

describe('parseGlossary · markdown bullet format', () => {
  it('parses "- **Term** (etymology) — def" into term + def', () => {
    const body = '- **Геном** (genome; греч. *gen* — род) — совокупность всей ДНК клетки.';
    const { terms } = parseGlossary(body);
    expect(terms).toHaveLength(1);
    expect(terms[0]?.term).toBe('Геном');
    // Etymology + definition kept together for inline-markdown rendering.
    expect(terms[0]?.def).toContain('совокупность всей ДНК клетки');
    expect(terms[0]?.def).toContain('*gen*'); // italic markers preserved for renderInlineMd
  });

  it('parses a term with no definition ("- **Митоз** (*mitos* — нить).")', () => {
    const { terms } = parseGlossary('- **Митоз** (*mitos* — нить).');
    expect(terms[0]?.term).toBe('Митоз');
    expect(terms[0]?.def).toContain('mitos');
  });

  it('strips a leading em-dash from the definition', () => {
    const { terms } = parseGlossary('- **Аллель** — вариант гена.');
    expect(terms[0]?.def).toBe('вариант гена.');
  });

  it('still supports the legacy "Term: definition" colon format', () => {
    const { terms } = parseGlossary('pH: логарифмическая шкала кислотности');
    expect(terms[0]?.term).toBe('pH');
    expect(terms[0]?.def).toBe('логарифмическая шкала кислотности');
  });

  it('captures leading prose as intro, trailing prose as outro', () => {
    const body = [
      'Ключевые термины модуля.',
      '- **Геном** — вся ДНК.',
      '- **Протеом** — все белки.',
      'Этот модуль обеспечивает прочный фундамент.',
    ].join('\n');
    const { intro, outro, terms } = parseGlossary(body);
    expect(intro).toBe('Ключевые термины модуля.');
    expect(terms).toHaveLength(2);
    expect(outro).toBe('Этот модуль обеспечивает прочный фундамент.');
  });

  it('drops a leaked "- Конец Модуля" footer line', () => {
    const body = '- **Геном** — вся ДНК.\n- Конец Модуля 1.2 -';
    const { terms, outro } = parseGlossary(body);
    expect(terms).toHaveLength(1);
    expect(outro).not.toContain('Конец Модуля');
  });
});

describe('parseGlossary · Biology course glossary (real data)', () => {
  it('Biology glossary splits into many term cards, not one text blob', () => {
    const body = content['100.2']?.main ?? '';
    // Extract the glossary tab body (between the glossary heading and the
    // next `# ` heading).
    const start = body.indexOf('# ГЛОССАРИЙ');
    expect(start).toBeGreaterThan(0);
    const after = body.slice(start);
    const nextH = after.indexOf('\n# ', 3);
    const glossBody = nextH > 0 ? after.slice(0, nextH) : after;
    const { terms } = parseGlossary(glossBody);
    // Biology glossary has ~27 terms.
    expect(terms.length).toBeGreaterThan(20);
    // Геном must be a real card, not buried in prose.
    expect(terms.some((t) => t.term === 'Геном')).toBe(true);
    // No card should still carry raw bullet/bold markers in the term.
    expect(terms.every((t) => !t.term.includes('**'))).toBe(true);
  });

  it('footer no longer leaks into the glossary tab', () => {
    const body = content['100.2']?.main ?? '';
    const start = body.indexOf('# ГЛОССАРИЙ');
    const after = body.slice(start);
    const nextH = after.indexOf('\n# ', 3);
    const glossBody = nextH > 0 ? after.slice(0, nextH) : after;
    // The footer now lives in a separate `# Что дальше?` section.
    expect(glossBody).not.toContain('Конец Модуля');
  });
});
