import type { LessonType } from './curriculum';
import { course100_1 } from './content/course-100-1';
import { course100_2 } from './content/course-100-2';
import { course100_3 } from './content/course-100-3';
import { course100_4 } from './content/course-100-4';
import { course100_5 } from './content/course-100-5';
import { course100_6 } from './content/course-100-6';
import { course100_7 } from './content/course-100-7';

/**
 * Static article content for each course.
 *
 * Structure:
 *   content[courseId][lessonType] = markdown string
 *
 * To add an article:
 *   1. Find the courseId (e.g. '0.1', '1.3', '11.2')
 *   2. Pick a lessonType: 'main' | 'physiology' | 'pathophysiology' | 'clinic' | 'protocol' | 'errors'
 *   3. Write the markdown content as a template literal
 *
 * Example:
 *   '1.1': {
 *     main: `## Углеводы\n\nТекст лекции...`,
 *   },
 */
export const content: Record<string, Partial<Record<LessonType, string>>> = {
  '100.1': {
    main: course100_1,
  },
  '100.2': {
    main: course100_2,
  },
  '100.3': {
    main: course100_3,
  },
  '100.4': {
    main: course100_4,
  },
  '100.5': {
    main: course100_5,
  },
  '100.6': {
    main: course100_6,
  },
  '100.7': {
    main: course100_7,
  },
  // Блок 0 - Доклинический фундамент: '0.1', '0.2', '0.3'
  // Блок 1 - Биохимия: '1.1'-'1.6'
  // Блок 2 - Анатомия: '2.1'-'2.9'
  // Блок 3 - Гистология и эмбриология: '3.1'-'3.3'
  // Блок 4 - Физиология: '4.1'-'4.8'
  // Блок 5 - Патофизиология: '5.1'-'5.6'
  // Блок 6 - Микробиология: '6.1'-'6.6'
  // Блок 7 - Фармакология: '7.1'-'7.7'
  // Блок 8 - Пропедевтика: '8.1'-'8.7'
  // Блок 9 - Клинические дисциплины: '9.1'-'9.7'
  // Блок 10 - Экстренная медицина: '10.1'-'10.7'
  // Блок 11 - Военная медицина: '11.1'-'11.7'
  // Блок 12 - Специальные темы: '12.1'-'12.7'
  // Блок 13 - Навыки и процедуры: '13.1'-'13.5'
  // Блок 14 - Профессиональные основы: '14.1'-'14.5'
};

/** Get article content for a course + lesson type. Returns null if not yet written. */
export function getArticle(courseId: string, lessonType: LessonType): string | null {
  return content[courseId]?.[lessonType] ?? null;
}

/** Get all available lesson types for a course (only those with written content). */
export function getAvailableLessonTypes(courseId: string): LessonType[] {
  const courseContent = content[courseId];
  if (!courseContent) return [];
  return (Object.keys(courseContent) as LessonType[]).filter(
    (type) => courseContent[type] && courseContent[type]!.trim().length > 0
  );
}

/** Check if a course has any articles at all. */
export function hasContent(courseId: string): boolean {
  return getAvailableLessonTypes(courseId).length > 0;
}
