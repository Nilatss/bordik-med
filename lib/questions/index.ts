/**
 * Question Bank - lookup functions for test questions.
 *
 * Currently returns placeholder questions. Replace with real questions by:
 * 1. Creating module-specific files (e.g., module-0.ts, module-1.ts)
 * 2. Exporting courseQuestions and moduleTestQuestions from each
 * 3. Registering them in the moduleData map below
 *
 * Or: populate the placeholder generator with real question data.
 */

import type { TestQuestion, TestLevel } from '../quiz';
import { getCourseById, getModuleById, getModuleForCourse } from '../curriculum';
import { getCourseTestSlice, getModuleTestSlice, generateContentQuestions } from '../question-generator';

/* ═══════════════════════════════════════════
   Placeholder question generator
   Used until real questions are provided.
   ═══════════════════════════════════════════ */

function generatePlaceholder(courseId: string, testLevel: TestLevel): TestQuestion[] {
  const course = getCourseById(courseId);
  const title = course?.title ?? courseId;
  const questions: TestQuestion[] = [];

  for (let i = 1; i <= 20; i++) {
    questions.push({
      id: `${courseId}-t${testLevel}-q${i}`,
      question: `[Тест ${testLevel}] Вопрос ${i}: ${title}`,
      options: [
        `Правильный ответ (${i})`,
        `Неправильный вариант Б`,
        `Неправильный вариант В`,
        `Неправильный вариант Г`,
      ],
      correctIndex: 0,
    });
  }

  return questions;
}

function generateModulePlaceholder(moduleId: number): TestQuestion[] {
  const mod = getModuleById(moduleId);
  const title = mod?.title ?? `Модуль ${moduleId}`;
  const questions: TestQuestion[] = [];

  for (let i = 1; i <= 100; i++) {
    questions.push({
      id: `mod${moduleId}-q${i}`,
      question: `[Финальный тест] Вопрос ${i}: ${title}`,
      options: [
        `Правильный ответ (${i})`,
        `Неправильный вариант Б`,
        `Неправильный вариант В`,
        `Неправильный вариант Г`,
      ],
      correctIndex: 0,
    });
  }

  return questions;
}

/* ═══════════════════════════════════════════
   Real question data registry
   Import and register real question files here.
   ═══════════════════════════════════════════ */

// Example:
// import * as m0 from './module-0';
// const moduleData: Record<number, { ... }> = { 0: m0 };

const moduleData: Record<number, {
  courseQuestions: Record<string, Record<number, TestQuestion[]>>;
  moduleTestQuestions: TestQuestion[];
}> = {};

/* ═══════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════ */

/** Get 20 questions for a specific course test level.
 *
 *  Priority:
 *   1. Hand-written questions registered in `moduleData`.
 *   2. Auto-generated cloze questions mined from the course's lesson content
 *      (no duplicates between test levels — each level reads a distinct
 *      slice of the same deterministic pool).
 *   3. Static placeholder questions (last-resort fallback for courses with
 *      neither hand-written questions nor lesson content yet).
 */
export function getTestQuestions(courseId: string, testLevel: TestLevel): TestQuestion[] {
  const moduleId = parseInt(courseId.split('.')[0]);
  const data = moduleData[moduleId];

  if (data?.courseQuestions[courseId]?.[testLevel]) {
    return data.courseQuestions[courseId][testLevel];
  }

  const generated = getCourseTestSlice(courseId, testLevel);
  if (generated.length === 20) return generated;
  // If generator produced something but not a full 20, top up with placeholders
  // to keep the test playable.
  if (generated.length > 0) {
    const filler = generatePlaceholder(courseId, testLevel)
      .slice(generated.length, 20);
    return [...generated, ...filler];
  }

  return generatePlaceholder(courseId, testLevel);
}

/** Get 100 questions for a module final test (drawn from later slices of
 *  each course in the module so it never duplicates per-course tests). */
export function getModuleTestQuestions(moduleId: number): TestQuestion[] {
  const data = moduleData[moduleId];
  if (data?.moduleTestQuestions?.length) {
    return data.moduleTestQuestions;
  }

  const mod = getModuleById(moduleId);
  if (mod) {
    const generated = getModuleTestSlice(mod.courses.map((c) => c.id));
    if (generated.length === 100) return generated;
    if (generated.length > 0) {
      const filler = generateModulePlaceholder(moduleId).slice(generated.length, 100);
      return [...generated, ...filler];
    }
  }

  return generateModulePlaceholder(moduleId);
}

/** Check if real (non-placeholder) questions exist for a course test.
 *  "Real" means either hand-written or successfully generated from content. */
export function hasRealQuestions(courseId: string, testLevel: TestLevel): boolean {
  const moduleId = parseInt(courseId.split('.')[0]);
  const data = moduleData[moduleId];
  if (data?.courseQuestions[courseId]?.[testLevel]?.length) return true;
  return generateContentQuestions(courseId).length >= 20;
}
