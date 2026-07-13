/**
 * Regression: `hasRealQuestions(courseId, testLevel)` ignored `testLevel`
 * and only checked whether the course's cloze-generated pool had >= 20
 * total questions. But `getTestQuestions` slices that pool per level
 * (level N = pool[(N-1)*20 : N*20]), so a course with enough content for
 * level 1 but not level 3-5 was reported as having "real" questions at
 * every level. `TestPanel` gates the whole panel (and, before this fix,
 * every level's availability) on `hasRealQuestions`, so this let a real
 * test-taker be served a course-test level where most options were
 * silently padded with giveaway placeholder answers ("Правильный ответ").
 *
 * Same bug shape for `hasRealModuleQuestions` / `getModuleTestQuestions`
 * at the 100-question module-final level.
 *
 * These tests mock the content-mining layer (`question-generator`,
 * `questions/generated`, `curriculum`) so the assertions target the
 * *gating contract* — hasRealQuestions/hasRealModuleQuestions must never
 * report "real" for a slice that getTestQuestions/getModuleTestQuestions
 * would actually pad with filler — independent of the real (large, hard
 * to control precisely) markdown-mining heuristics.
 */
import { describe, it, expect, vi } from 'vitest';
import type { TestQuestion } from '@/lib/quiz';
import type { Course, Module } from '@/lib/curriculum-types';

function mkQ(id: string): TestQuestion {
  return { id, question: `Q ${id}`, options: ['A', 'B', 'C', 'D'], correctIndex: 0 };
}

function mkCourse(id: string, moduleId: number): Course {
  return { id, moduleId, title: id, description: '', tags: [], difficulty: 'basic' };
}

function mkModule(id: number, courses: Course[]): Module {
  return { id, sectionId: 'fundamentals', title: `Module ${id}`, description: '', color: '#000', courses };
}

const COURSES: Record<string, Course> = {
  'course-full': mkCourse('course-full', 1),
  'course-partial': mkCourse('course-partial', 2),
  'course-thin': mkCourse('course-thin', 3),
};

const MODULES: Record<number, Module> = {
  1: mkModule(1, [COURSES['course-full']!]),
  2: mkModule(2, [COURSES['course-partial']!]),
};

vi.mock('@/lib/curriculum', () => ({
  getCourseById: (id: string) => COURSES[id],
  getModuleById: (id: number) => MODULES[id],
  getModuleForCourse: () => undefined,
}));

vi.mock('@/lib/questions/generated', () => ({
  AI_COURSE_TESTS: {},
  AI_MODULE_SLICES: {},
}));

vi.mock('@/lib/question-generator', () => ({
  // 'course-full' has a full 20-question slice at every level.
  // 'course-partial' only has enough content for level 1 (slice empty
  // from level 2 on) — the exact shape of the original bug.
  // 'course-thin' can't even fill level 1 (partial 5-question slice).
  getCourseTestSlice: (courseId: string, level: number) => {
    if (courseId === 'course-full') return Array.from({ length: 20 }, (_, i) => mkQ(`full-${level}-${i}`));
    if (courseId === 'course-partial') {
      return level === 1 ? Array.from({ length: 20 }, (_, i) => mkQ(`partial-1-${i}`)) : [];
    }
    if (courseId === 'course-thin') return Array.from({ length: 5 }, (_, i) => mkQ(`thin-${level}-${i}`));
    return [];
  },
  // Module 1's course has a full 100-question slice; module 2's course
  // only has 40 real questions available.
  getModuleTestSlice: (courseIds: string[]) => {
    if (courseIds.includes('course-full')) return Array.from({ length: 100 }, (_, i) => mkQ(`mod-full-${i}`));
    if (courseIds.includes('course-partial')) return Array.from({ length: 40 }, (_, i) => mkQ(`mod-partial-${i}`));
    return [];
  },
}));

const { getTestQuestions, hasRealQuestions, getModuleTestQuestions, hasRealModuleQuestions } =
  await import('@/lib/questions');

describe('hasRealQuestions · per-level gating', () => {
  it('reports real content for every level of a fully-stocked course', () => {
    expect(hasRealQuestions('course-full', 1)).toBe(true);
    expect(hasRealQuestions('course-full', 5)).toBe(true);
  });

  it('reports real content for level 1 but NOT for level 2+ when the pool runs out', () => {
    expect(hasRealQuestions('course-partial', 1)).toBe(true);
    expect(hasRealQuestions('course-partial', 2)).toBe(false);
    expect(hasRealQuestions('course-partial', 5)).toBe(false);
  });

  it('reports no real content when even level 1 is short of 20 questions', () => {
    expect(hasRealQuestions('course-thin', 1)).toBe(false);
  });
});

describe('getTestQuestions · never disagrees with hasRealQuestions', () => {
  it('returns exactly the real slice when hasRealQuestions is true', () => {
    const qs = getTestQuestions('course-partial', 1);
    expect(qs).toHaveLength(20);
    expect(qs.every((q) => q.id.startsWith('partial-1-'))).toBe(true);
  });

  it('pads a level hasRealQuestions flags as false with placeholder — proving the UI must gate on hasRealQuestions before calling this', () => {
    const qs = getTestQuestions('course-partial', 2);
    expect(qs).toHaveLength(20);
    // Every option is the giveaway placeholder shape, not real content.
    expect(qs.every((q) => q.options[0].startsWith('Правильный ответ'))).toBe(true);
  });

  it('blends partial real content with filler for a thin pool', () => {
    const qs = getTestQuestions('course-thin', 1);
    expect(qs).toHaveLength(20);
    expect(qs.slice(0, 5).every((q) => q.id.startsWith('thin-1-'))).toBe(true);
    expect(qs.slice(5).every((q) => q.options[0].startsWith('Правильный ответ'))).toBe(true);
  });
});

describe('hasRealModuleQuestions / getModuleTestQuestions', () => {
  it('module 1 (full 100-question pool) is real', () => {
    expect(hasRealModuleQuestions(1)).toBe(true);
    const qs = getModuleTestQuestions(1);
    expect(qs).toHaveLength(100);
    expect(qs.every((q) => q.id.startsWith('mod-full-'))).toBe(true);
  });

  it('module 2 (only 40 of 100 real) is NOT real, even though getModuleTestQuestions still pads it to 100', () => {
    expect(hasRealModuleQuestions(2)).toBe(false);
    const qs = getModuleTestQuestions(2);
    expect(qs).toHaveLength(100);
    expect(qs.slice(0, 40).every((q) => q.id.startsWith('mod-partial-'))).toBe(true);
    expect(qs.slice(40).every((q) => q.options[0].startsWith('Правильный ответ'))).toBe(true);
  });
});
