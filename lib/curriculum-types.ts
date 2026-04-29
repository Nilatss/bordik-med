/* Lightweight type-only file. Used by:
 *   - lib/curriculum.ts (re-exports types from here)
 *   - lib/curriculum-stats.ts (auto-generated; only needs SectionId)
 *
 * Keeping the types separate lets curriculum-stats.ts (and any other
 * tiny modules) import the type without dragging in the 230 KB
 * curriculum data via type-elision quirks under noEmit + isolatedModules.
 */

export type Difficulty = 'basic' | 'intermediate' | 'advanced';

export type LessonType =
  | 'main'
  | 'physiology'
  | 'pathophysiology'
  | 'clinic'
  | 'protocol'
  | 'errors';

export type SectionId =
  | 'fundamentals'
  | 'biomedical'
  | 'clinical'
  | 'allied'
  | 'skills'
  | 'hss'
  | 'threads'
  | 'frontier'
  | 'business'
  | 'regulatory'
  | 'career'
  | 'tech';

export interface Course {
  id: string;
  moduleId: number;
  title: string;
  description: string;
  tags: string[];
  difficulty: Difficulty;
}

export interface Module {
  id: number;
  sectionId: SectionId;
  title: string;
  description: string;
  color: string;
  courses: Course[];
}

export interface Section {
  id: SectionId;
  title: string;
  description: string;
  icon: string;
}
