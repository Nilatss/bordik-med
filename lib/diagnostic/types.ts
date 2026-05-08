/**
 * Shared types for the adaptive diagnostic test (`components/tests/DiagnosticTest.tsx`).
 *
 * P1-CR-3 god-component split — extracted from DiagnosticTest.tsx step 1/N.
 * Lives outside the component file so sub-components in `components/tests/`
 * can import the same types without circular dependencies via the parent.
 */

/** A single answered turn — what the user picked and the correct option. */
export interface Turn {
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number;
  topic: string;
  explanation?: string;
}

/** Server response for `POST /api/diagnostic action=next`. */
export interface ServerQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
  explanation: string;
  index: number;
  total: number;
}

/** Server response for `POST /api/diagnostic action=finalize`. */
export interface FinalResult {
  profession: string;
  professionRationale: string;
  level: 'basic' | 'intermediate' | 'advanced';
  strengths: string[];
  weaknesses: string[];
  recommendedModuleIds: number[];
  studyPlan: string;
}

/** State-machine phases of the diagnostic UI. */
export type Phase = 'loading' | 'asking' | 'reviewing' | 'finalizing' | 'done' | 'error';
