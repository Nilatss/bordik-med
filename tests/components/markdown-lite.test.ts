/**
 * Tests for MarkdownLite — the shared markdown renderer used by
 * components/tools/view/Result.tsx for calculator `details` and by
 * NeonatalHandbook GuidelineContent for protocols/articles.
 *
 * Regression: Bili-2022 КЛИНИЧЕСКАЯ ИНТЕРПРЕТАЦИЯ section displayed raw
 * `###`, `**bold**`, and `|table|` syntax. parseMarkdownLite now
 * converts these into block structures.
 */
import { describe, it, expect } from 'vitest';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseMarkdownLite, normalizeDashes, renderInlineMd } from '@/components/ui/MarkdownLite';

// Unicode dash/minus built via fromCharCode so this source stays ASCII.
const MINUS = String.fromCharCode(0x2212);
const ENDASH = String.fromCharCode(0x2013);
const EMDASH = String.fromCharCode(0x2014);
const renderInline = (s: string) =>
  renderToStaticMarkup(createElement(Fragment, null, renderInlineMd(s)));

describe('parseMarkdownLite', () => {
  it('parses ### h3 headings into h3 block', () => {
    const blocks = parseMarkdownLite('### Текущий уровень\n');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.kind).toBe('h3');
    if (blocks[0]?.kind === 'h3') {
      expect(blocks[0].text).toBe('Текущий уровень');
    }
  });

  it('parses # as h1', () => {
    const blocks = parseMarkdownLite('# Top');
    expect(blocks[0]?.kind).toBe('h1');
  });

  it('parses ## as h2', () => {
    const blocks = parseMarkdownLite('## Section');
    expect(blocks[0]?.kind).toBe('h2');
  });

  it('parses GFM table with separator row', () => {
    const md = '| Header | Value |\n|---|---|\n| A | 1 |\n| B | 2 |';
    const blocks = parseMarkdownLite(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.kind).toBe('table');
    if (blocks[0]?.kind === 'table') {
      expect(blocks[0].headers).toEqual(['Header', 'Value']);
      expect(blocks[0].rows).toHaveLength(2);
      expect(blocks[0].rows[0]).toEqual(['A', '1']);
    }
  });

  it('strips trailing #s from an ATX-closed heading', () => {
    const blocks = parseMarkdownLite('## Title ##');
    expect(blocks[0]?.kind).toBe('h2');
    if (blocks[0]?.kind === 'h2') expect(blocks[0].text).toBe('Title');
  });

  it('pads a GFM row that has fewer cells than the header', () => {
    const blocks = parseMarkdownLite('| A | B | C |\n|---|---|---|\n| 1 | 2 |');
    expect(blocks[0]?.kind).toBe('table');
    if (blocks[0]?.kind === 'table') {
      expect(blocks[0].rows[0]).toEqual(['1', '2', '']);
    }
  });

  it('preserves **bold** for inline rendering downstream', () => {
    // Bold is rendered inline (by renderInlineMd), but parseMarkdownLite
    // keeps the literal text intact for that downstream pass.
    const blocks = parseMarkdownLite('Some **bold** text.');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.kind).toBe('para');
    if (blocks[0]?.kind === 'para') {
      expect(blocks[0].text).toContain('**bold**');
    }
  });

  it('parses a bullet list', () => {
    const md = '- first\n- second\n- third';
    const blocks = parseMarkdownLite(md);
    expect(blocks[0]?.kind).toBe('list');
    if (blocks[0]?.kind === 'list') {
      expect(blocks[0].items).toEqual(['first', 'second', 'third']);
    }
  });

  it('parses the Bili-2022 details fragment without crashing', () => {
    // Exact shape produced by neo-bili-2022 compute().details.
    const md = `### Текущий уровень

- TSB: **200 мкмоль/л** = **11.7 мг/дл**
- Hour of life: 24 ч
- GA: 38 нед

### Пороги (AAP 2022)

| Уровень | Порог mg/dL | Расстояние |
|---|---|---|
| Phototherapy | **14.0** | 2.3 мг/дл ниже |
| Exchange | **21.0** | 9.3 мг/дл ниже |`;
    const blocks = parseMarkdownLite(md);
    // Expect: h3 (### heading), list, h3, table
    expect(blocks.map((b) => b.kind)).toEqual(['h3', 'list', 'h3', 'table']);
  });
});

describe('normalizeDashes', () => {
  it('collapses a long dash between words to a spaced hyphen', () => {
    expect(normalizeDashes(`schema ${EMDASH} value`)).toBe('schema - value');
  });

  it('keeps a numeric range tight', () => {
    expect(normalizeDashes(`7,35${ENDASH}7,45`)).toBe('7,35-7,45');
  });

  it('renders a unary minus as a tight negative, not a spaced dash', () => {
    expect(normalizeDashes(`NFS = ${MINUS}1,675`)).toBe('NFS = -1,675');
    expect(normalizeDashes(`BE: ${MINUS}5`)).toBe('BE: -5');
    expect(normalizeDashes(`(${MINUS}3)`)).toBe('(-3)');
  });

  it('leaves binary subtraction spaced', () => {
    expect(normalizeDashes(`age ${MINUS} 0,013`)).toBe('age - 0,013');
  });
});

describe('renderInlineMd italic flanking', () => {
  it('does NOT italicise a multiplication between numbers', () => {
    expect(renderInline('5*10^9/l leukocytes')).not.toContain('<em');
    expect(renderInline('2 * 3 = 6')).not.toContain('<em');
  });

  it('still italicises *word*', () => {
    expect(renderInline('this is *important* text')).toContain('<em');
  });

  it('still renders **bold** and `code`', () => {
    expect(renderInline('this is **important**')).toContain('<strong');
    expect(renderInline('value `x`')).toContain('<code');
  });
});
