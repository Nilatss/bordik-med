/**
 * Tests for inline-markdown formatting in MarkdownLite:
 *   - normalizeDashes: long dashes (— – ― ‒ −) → plain hyphen
 *     (user request 2026-05-19: no long dashes anywhere on the site)
 *   - renderInlineMd: *italic* support (the glossary showed literal `*gen*`)
 *
 * normalizeDashes is a pure string fn (tested directly). renderInlineMd
 * returns React nodes, exercised via react-dom/server renderToStaticMarkup
 * (works in the node test environment, no DOM needed). JSX avoided so the
 * file stays a plain .test.ts picked up by the vitest include glob.
 */
import { describe, it, expect } from 'vitest';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { normalizeDashes, renderInlineMd } from '@/components/ui/MarkdownLite';

describe('normalizeDashes', () => {
  it('replaces a spaced em-dash with a spaced hyphen', () => {
    expect(normalizeDashes('геном — вся ДНК')).toBe('геном - вся ДНК');
  });

  it('replaces en-dash, horizontal bar, figure dash, minus sign', () => {
    expect(normalizeDashes('a – b')).toBe('a - b');
    expect(normalizeDashes('a ― b')).toBe('a - b');
    expect(normalizeDashes('a ‒ b')).toBe('a - b');
    expect(normalizeDashes('a − b')).toBe('a - b');
  });

  it('tightens numeric ranges (no surrounding spaces)', () => {
    expect(normalizeDashes('1990–2003')).toBe('1990-2003');
    expect(normalizeDashes('7,35 – 7,45')).toBe('7,35-7,45');
  });

  it('handles a dash with no surrounding spaces (word—word)', () => {
    expect(normalizeDashes('слово—слово')).toBe('слово - слово');
  });

  it('leaves plain hyphens untouched', () => {
    expect(normalizeDashes('anti-VEGF')).toBe('anti-VEGF');
  });

  it('handles multiple dashes in one string', () => {
    expect(normalizeDashes('4A — extra-foveal, 4B — fovea')).toBe('4A - extra-foveal, 4B - fovea');
  });
});

describe('renderInlineMd · italic + bold + dash', () => {
  const html = (s: string) => renderToStaticMarkup(createElement(Fragment, null, renderInlineMd(s)));

  it('renders *italic* as <em> (no literal asterisks)', () => {
    const out = html('греч. *gen* — род');
    expect(out).toContain('<em');
    expect(out).toContain('gen');
    expect(out).not.toContain('*gen*');
  });

  it('renders **bold** as <strong>', () => {
    const out = html('**Геном** (genome)');
    expect(out).toContain('<strong');
    expect(out).toContain('Геном');
    expect(out).not.toContain('**Геном**');
  });

  it('normalizes the em-dash inside rendered text', () => {
    const out = html('genome — вся ДНК');
    expect(out).not.toContain('—');
  });

  it('renders the real Biology glossary line cleanly (no * or —)', () => {
    const out = html('(genome; греч. *gen* — род + *-oma*) — совокупность всей ДНК клетки.');
    expect(out).not.toContain('*'); // no literal italic markers
    expect(out).not.toContain('—'); // no long dash
    expect(out).toContain('<em');   // roots italicised
  });
});
