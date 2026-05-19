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
import { parseMarkdownLite } from '@/components/ui/MarkdownLite';

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
