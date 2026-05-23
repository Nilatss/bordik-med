/**
 * Regression tests for lib/curriculum-stats.ts.
 *
 * Bug: the file was missing from the repo, causing:
 *   - TypeScript compilation to fail with TS2307 "Cannot find module"
 *   - Runtime crash on the home page (module resolution error)
 *   - isModuleTestUnlocked() in store.ts to throw at runtime
 *
 * These tests verify the generated file exports the expected shapes and
 * that the computed values are consistent with lib/curriculum.ts.
 */
import { describe, it, expect } from 'vitest';
import {
  SECTIONS,
  getSectionByIdFast,
  SECTION_TOTAL_COURSES,
  SECTION_COURSE_IDS,
  MODULE_META,
  MODULE_COURSE_IDS,
} from '@/lib/curriculum-stats';
import { sections, modules } from '@/lib/curriculum';

describe('curriculum-stats · exports exist and are typed', () => {
  it('SECTIONS is a non-empty array matching lib/curriculum sections', () => {
    expect(Array.isArray(SECTIONS)).toBe(true);
    expect(SECTIONS.length).toBe(sections.length);
    for (const s of sections) {
      const found = SECTIONS.find((x) => x.id === s.id);
      expect(found).toBeDefined();
      expect(found?.title).toBe(s.title);
    }
  });

  it('getSectionByIdFast returns correct section for known id', () => {
    const s = getSectionByIdFast('clinical');
    expect(s).toBeDefined();
    expect(s?.id).toBe('clinical');
  });

  it('getSectionByIdFast returns undefined for unknown id', () => {
    // @ts-expect-error -- intentional unknown id
    expect(getSectionByIdFast('nonexistent')).toBeUndefined();
  });

  it('SECTION_TOTAL_COURSES has an entry for every section', () => {
    for (const s of sections) {
      expect(typeof SECTION_TOTAL_COURSES[s.id]).toBe('number');
      expect(SECTION_TOTAL_COURSES[s.id]).toBeGreaterThan(0);
    }
  });

  it('SECTION_TOTAL_COURSES values match actual course counts in curriculum.ts', () => {
    const computed: Record<string, number> = {};
    for (const m of modules) {
      computed[m.sectionId] = (computed[m.sectionId] ?? 0) + m.courses.length;
    }
    for (const [sectionId, count] of Object.entries(computed)) {
      expect(SECTION_TOTAL_COURSES[sectionId as keyof typeof SECTION_TOTAL_COURSES]).toBe(count);
    }
  });

  it('SECTION_COURSE_IDS has correct course id arrays', () => {
    for (const s of sections) {
      const ids = SECTION_COURSE_IDS[s.id];
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBe(SECTION_TOTAL_COURSES[s.id]);
    }
  });

  it('MODULE_META has an entry for every module', () => {
    for (const m of modules) {
      const meta = MODULE_META[m.id];
      expect(meta).toBeDefined();
      expect(meta?.title).toBe(m.title);
      expect(meta?.color).toBe(m.color);
    }
  });

  it('MODULE_COURSE_IDS maps each module to its course ids', () => {
    for (const m of modules) {
      const ids = MODULE_COURSE_IDS[m.id];
      expect(Array.isArray(ids)).toBe(true);
      expect(ids ?? []).toHaveLength(m.courses.length);
      for (const c of m.courses) {
        expect(ids).toContain(c.id);
      }
    }
  });
});
