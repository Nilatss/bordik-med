/**
 * Tests for the 6 pre-university (довузовые) courses imported from the
 * source markdown files into `lib/content/course-100-{2..7}.ts`.
 *
 * These verify the IMPORT was structurally correct (tab splitting works,
 * headings shifted, content preserved) — NOT the source facts, which are
 * the editorial authors' responsibility.
 *
 * Also covers the `splitIntoTabs` change that gives section-prefixed
 * headings (РАЗДЕЛ / ЧАСТЬ / Глава / Блок) distinct short labels instead
 * of collapsing them all to a single subject keyword.
 */
import { describe, it, expect } from 'vitest';
import { content, getAvailableLessonTypes, hasContent } from '@/lib/content';
import { splitIntoTabs } from '@/lib/course/lesson-tabs';

const COURSE_IDS = ['100.2', '100.3', '100.4', '100.5', '100.6', '100.7'] as const;

describe('prevuz courses · registration', () => {
  it('all 6 courses are registered with main content', () => {
    for (const id of COURSE_IDS) {
      expect(hasContent(id), `course ${id} should have content`).toBe(true);
      expect(getAvailableLessonTypes(id)).toContain('main');
    }
  });

  it('each course body is substantial (> 30 KB — full module)', () => {
    for (const id of COURSE_IDS) {
      const body = content[id]?.main ?? '';
      expect(body.length, `course ${id} length`).toBeGreaterThan(30_000);
    }
  });
});

describe('prevuz courses · tab structure', () => {
  it('every course splits into an intro tab + multiple topic tabs', () => {
    for (const id of COURSE_IDS) {
      const body = content[id]?.main ?? '';
      const tabs = splitIntoTabs(body);
      // At least intro + 5 sections for any of these deep modules.
      expect(tabs.length, `course ${id} tab count`).toBeGreaterThan(5);
      // First tab is the intro.
      expect(tabs[0]?.short).toBe('Введение');
    }
  });

  it('header chrome before the first `# ` is dropped (not a tab)', () => {
    const tabs = splitIntoTabs(content['100.2']?.main ?? '');
    // No tab should be titled with the platform header line.
    expect(tabs.some((t) => /ГЛОБАЛЬНАЯ МЕДИЦИНСКАЯ/i.test(t.title))).toBe(false);
  });

  it('Biology section tabs get DISTINCT short labels (not all "Биология")', () => {
    const tabs = splitIntoTabs(content['100.2']?.main ?? '');
    // Drop the intro tab; the remaining section tabs must not all collapse
    // to the same subject keyword (the bug the splitter fix addresses).
    const sectionShorts = tabs.slice(1).map((t) => t.short);
    const distinct = new Set(sectionShorts);
    expect(distinct.size, `distinct labels among ${sectionShorts.length} sections`).toBeGreaterThan(3);
  });

  it('exactly ONE "Введение" tab per course (no duplicate from section titles)', () => {
    // Regression: "Раздел 1. Введение в социологию" matched /введение/
    // before the section-prefix branch → a SECOND "Введение" tab. The
    // splitter now runs section-prefix detection first.
    for (const id of COURSE_IDS) {
      const tabs = splitIntoTabs(content[id]?.main ?? '');
      const introTabs = tabs.filter((t) => t.short === 'Введение');
      expect(introTabs.length, `course ${id} should have exactly one "Введение" tab`).toBe(1);
    }
  });

  it('section headings are NOT all-caps (de-shouted to sentence case)', () => {
    for (const id of COURSE_IDS) {
      const body = content[id]?.main ?? '';
      const headings = body.split('\n').filter((l) => /^# /.test(l));
      for (const h of headings) {
        const text = h.replace(/^#\s+/, '');
        const letters = text.replace(/[^А-Яа-яЁёA-Za-z]/g, '');
        const upper = text.replace(/[^А-ЯЁA-Z]/g, '');
        if (letters.length < 8) continue; // skip very short headings
        // A de-shouted heading must not be >60% uppercase letters.
        expect(
          upper.length / letters.length,
          `heading in ${id} still shouting: "${text}"`,
        ).toBeLessThan(0.6);
      }
    }
  });

  it('acronyms survive de-shouting (ДНК / РНК / ЭКГ / ВОЗ stay uppercase)', () => {
    const bio = content['100.2']?.main ?? '';
    expect(bio).toContain('ДНК');
    expect(bio).toContain('РНК');
    const phys = content['100.4']?.main ?? '';
    expect(phys).toContain('ЭКГ');
  });

  it('"Заключение" content is preserved (renamed, not skipped)', () => {
    // The splitter skips `# Заключение` / `# Что дальше` tabs. The importer
    // renames Заключение → "Итоги модуля" so the content survives. Verify
    // no course silently lost a conclusion to the skip-rule by checking the
    // raw body still contains the renamed heading where the source had one.
    const bio = content['100.2']?.main ?? '';
    expect(bio).toContain('# Итоги модуля');
  });
});

describe('prevuz courses · content preservation (heading shift only)', () => {
  it('Biology preserves a known fact verbatim (info not altered)', () => {
    const bio = content['100.2']?.main ?? '';
    // Sentinel from the source file — must survive the import unchanged.
    expect(bio).toContain('концепция разработана В. И. Вернадским (1926)'.replace('концепция', 'Концепция'));
    expect(bio).toContain('~37 трлн клеток');
  });

  it('source `### N.N` subsections became `## N.N` (shifted up one level)', () => {
    const bio = content['100.2']?.main ?? '';
    // "1.1. Биосферный уровень" was `### 1.1.` in source → `## 1.1.` now.
    expect(bio).toContain('## 1.1. Биосферный уровень');
    // And must NOT still be a `### `.
    expect(bio).not.toContain('### 1.1. Биосферный уровень');
  });

  it('markdown tables are preserved (Biology has multi-column tables)', () => {
    const bio = content['100.2']?.main ?? '';
    expect(bio).toMatch(/\|\s*---\s*\|/); // a table separator row exists
  });

  it('horizontal-rule `---` lines were dropped (sections delimited by # )', () => {
    // No standalone `---` HR lines should remain (only table separators
    // which always live between `|...|` rows).
    for (const id of COURSE_IDS) {
      const body = content[id]?.main ?? '';
      const hrLines = body.split('\n').filter((l) => /^\s*-{3,}\s*$/.test(l));
      expect(hrLines.length, `course ${id} should have no bare --- HR lines`).toBe(0);
    }
  });
});

describe('splitIntoTabs · section-prefixed labels', () => {
  it('extracts descriptive label from "РАЗДЕЛ N. TITLE"', () => {
    const md = '# РАЗДЕЛ 3. МОЛЕКУЛЯРНАЯ БИОЛОГИЯ\nbody text';
    const tabs = splitIntoTabs(md);
    expect(tabs).toHaveLength(1);
    // Should NOT collapse to "Биология" despite containing "биолог".
    expect(tabs[0]?.short).not.toBe('Биология');
    expect(tabs[0]?.short).toMatch(/молекулярн/i);
  });

  it('handles Roman-numeral parts "ЧАСТЬ I. ALGEBRA"', () => {
    const md = '# ЧАСТЬ I. АЛГЕБРА И ФУНКЦИИ В МЕДИЦИНЕ\nbody';
    const tabs = splitIntoTabs(md);
    expect(tabs[0]?.short).toMatch(/алгебр/i);
  });

  it('still maps a plain "Введение" heading to the intro tab', () => {
    const md = '# Введение в модуль\nbody';
    const tabs = splitIntoTabs(md);
    expect(tabs[0]?.short).toBe('Введение');
  });
});
