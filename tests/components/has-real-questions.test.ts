/**
 * Tests for `hasRealQuestions` in lib/questions/index.ts.
 *
 * Bug being fixed: hasRealQuestions() ignored its `testLevel` parameter
 * for the cloze-generated fallback and checked the course's TOTAL question
 * pool size (`generateContentQuestions(courseId).length >= 20`) instead of
 * the specific level's slice. getCourseTestSlice() slices that same pool
 * per level — `pool.slice((level-1)*20, level*20)` — so a course whose
 * pool covers early levels but runs dry before level 5 (e.g. 66 questions:
 * levels 1-3 full, level 4 partial, level 5 empty) was reported as having
 * real questions for EVERY level. TestPanel used that to gate whether a
 * level shows as "available" to take — so a level that is 100% placeholder
 * filler ("Правильный ответ (i)" style guessable options) was served to
 * users as if the test genuinely assessed their knowledge, letting them
 * "pass" a course/module on a fake test.
 */
import { describe, it, expect } from 'vitest';
import { modules } from '@/lib/curriculum';
import { generateContentQuestions, getCourseTestSlice } from '@/lib/question-generator';
import { hasRealQuestions } from '@/lib/questions';
import { AI_COURSE_TESTS } from '@/lib/questions/generated';
import type { TestLevel } from '@/lib/quiz';

const ALL_LEVELS: TestLevel[] = [1, 2, 3, 4, 5];

// moduleData (hand-written questions) is currently empty for every module,
// so hasRealQuestions() reduces to: AI override, else the per-level cloze
// slice. Restrict to courses with no AI override so the assertions below
// test the cloze fallback path in isolation.
function coursesWithoutAiOverride(): { id: string }[] {
  const out: { id: string }[] = [];
  for (const m of modules) {
    for (const c of m.courses) {
      if (!AI_COURSE_TESTS[c.id]) out.push(c);
    }
  }
  return out;
}

describe('hasRealQuestions', () => {
  it('is false for a level whose cloze slice runs dry, even though the total pool is >= 20', () => {
    // Find at least one real course in the curriculum whose cloze pool is
    // large enough to cover some levels but not all 5 (100 questions
    // needed for 5 full levels of 20). This is exactly the case the bug
    // mishandled — assert it's still present in content so the test keeps
    // exercising the regression instead of vacuously passing.
    const partialPoolCourses = coursesWithoutAiOverride().filter((c) => {
      const n = generateContentQuestions(c.id).length;
      return n >= 20 && n < 100;
    });
    expect(partialPoolCourses.length).toBeGreaterThan(0);

    for (const c of partialPoolCourses) {
      for (const level of ALL_LEVELS) {
        const sliceLen = getCourseTestSlice(c.id, level).length;
        expect(hasRealQuestions(c.id, level)).toBe(sliceLen >= 20);
      }
      // Level 1 always has real questions once the pool is >= 20.
      expect(hasRealQuestions(c.id, 1)).toBe(true);
    }
  });

  it('is true for every level of a course with a full (>=100) cloze pool', () => {
    const fullPoolCourses = coursesWithoutAiOverride().filter(
      (c) => generateContentQuestions(c.id).length >= 100,
    );
    expect(fullPoolCourses.length).toBeGreaterThan(0);

    for (const c of fullPoolCourses) {
      for (const level of ALL_LEVELS) {
        expect(hasRealQuestions(c.id, level)).toBe(true);
      }
    }
  });

  it('is false for every level of a content-light course (pool < 20)', () => {
    const emptyCourses = coursesWithoutAiOverride().filter(
      (c) => generateContentQuestions(c.id).length < 20,
    );
    expect(emptyCourses.length).toBeGreaterThan(0);

    // Just check a handful — this set covers most of the curriculum.
    for (const c of emptyCourses.slice(0, 25)) {
      for (const level of ALL_LEVELS) {
        expect(hasRealQuestions(c.id, level)).toBe(false);
      }
    }
  });
});
