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

/** Get 20 questions for a specific course test level */
export function getTestQuestions(courseId: string, testLevel: TestLevel): TestQuestion[] {
  const moduleId = parseInt(courseId.split('.')[0]);
  const data = moduleData[moduleId];

  // Use real questions if available
  if (data?.courseQuestions[courseId]?.[testLevel]) {
    return data.courseQuestions[courseId][testLevel];
  }

  // Fall back to placeholders
  return generatePlaceholder(courseId, testLevel);
}

/** Get 100 questions for a module final test */
export function getModuleTestQuestions(moduleId: number): TestQuestion[] {
  const data = moduleData[moduleId];

  if (data?.moduleTestQuestions?.length) {
    return data.moduleTestQuestions;
  }

  return generateModulePlaceholder(moduleId);
}

/** Check if real (non-placeholder) questions exist for a course test */
export function hasRealQuestions(courseId: string, testLevel: TestLevel): boolean {
  const moduleId = parseInt(courseId.split('.')[0]);
  const data = moduleData[moduleId];
  return !!data?.courseQuestions[courseId]?.[testLevel]?.length;
}
