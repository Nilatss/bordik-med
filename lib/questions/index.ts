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
import { AI_COURSE_TESTS, AI_MODULE_SLICES } from './generated';

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
 *  Priority order:
 *   1. Hand-written questions registered in `moduleData`.
 *   2. AI-generated questions baked at build time by
 *      `scripts/ai-generate-questions.mjs` — semantically coherent,
 *      pedagogy-aware MCQs grounded in the lesson body.
 *   3. Cloze-deletion questions mined from lesson markdown at runtime
 *      (mechanical fallback when AI generation hasn't been run yet).
 *   4. Static placeholder questions (final fallback for courses without
 *      hand-written questions or lesson content).
 */
export function getTestQuestions(courseId: string, testLevel: TestLevel): TestQuestion[] {
  const moduleId = parseInt(courseId.split('.')[0]);
  const data = moduleData[moduleId];

  if (data?.courseQuestions[courseId]?.[testLevel]) {
    return data.courseQuestions[courseId][testLevel];
  }

  const ai = AI_COURSE_TESTS[courseId]?.[testLevel];
  if (ai && ai.length >= 20) return ai.slice(0, 20);

  const generated = getCourseTestSlice(courseId, testLevel);
  if (generated.length === 20) return generated;
  if (generated.length > 0) {
    const filler = generatePlaceholder(courseId, testLevel).slice(generated.length, 20);
    return [...generated, ...filler];
  }

  return generatePlaceholder(courseId, testLevel);
}

/** Get 100 questions for a module final test. AI-generated slices win first. */
export function getModuleTestQuestions(moduleId: number): TestQuestion[] {
  const data = moduleData[moduleId];
  if (data?.moduleTestQuestions?.length) {
    return data.moduleTestQuestions;
  }

  const mod = getModuleById(moduleId);
  if (mod) {
    // Aggregate AI module slices from each course in the module.
    const aiAggregate: TestQuestion[] = [];
    const seen = new Set<string>();
    for (const c of mod.courses) {
      const slice = AI_MODULE_SLICES[c.id];
      if (!slice) continue;
      for (const q of slice) {
        if (aiAggregate.length >= 100) break;
        const k = q.question.trim().toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        aiAggregate.push(q);
      }
      if (aiAggregate.length >= 100) break;
    }
    if (aiAggregate.length >= 100) return aiAggregate.slice(0, 100);

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
 *  "Real" means hand-written, AI-generated, or sufficient cloze-generated. */
export function hasRealQuestions(courseId: string, testLevel: TestLevel): boolean {
  const moduleId = parseInt(courseId.split('.')[0]);
  const data = moduleData[moduleId];
  if (data?.courseQuestions[courseId]?.[testLevel]?.length) return true;
  if (AI_COURSE_TESTS[courseId]?.[testLevel]?.length) return true;
  return generateContentQuestions(courseId).length >= 20;
}
