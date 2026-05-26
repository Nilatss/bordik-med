/**
 * Regression tests for `migratePersistedState` — the hardened zustand
 * `persist` migration for the `bordik-progress` store (lib/store.ts).
 *
 * Context: the migrate body was inlined into the persist config and
 * UNtested. It silently dropped `lastDiagnosticResult` on every version
 * bump (re-persisting it as null) until audit2 #139 added the
 * carry-through. These tests lock in that fix plus the other defensive
 * guards (type-stripping of corrupt keys, patient-context 24h TTL, the
 * v<2 legacy-quiz cleanup).
 *
 * The function is extracted + exported purely so it can be unit-tested
 * directly; behaviour is identical to the shipped inline closure.
 */
import { describe, it, expect } from 'vitest';
import { migratePersistedState } from '@/lib/store';

// migrate returns only the keys that pass its guards; treat as a loose
// record for assertions (the production type-cast to AppState is a partial,
// so go through `unknown` — AppState has no index signature).
type Migrated = Record<string, unknown>;
const mig = (state: unknown, version: number): Migrated =>
  migratePersistedState(state, version) as unknown as Migrated;

const VALID_DIAGNOSTIC = {
  profession: 'Неонатолог',
  professionRationale: 'rationale',
  level: 'intermediate' as const,
  strengths: ['ventilation'],
  weaknesses: ['nutrition'],
  recommendedModuleIds: [1, 2, 3],
  studyPlan: 'plan',
  correct: 24,
  total: 30,
  completedAt: '2026-05-20T10:00:00.000Z',
};

describe('migratePersistedState', () => {
  describe('(a) lastDiagnosticResult carry-through (the key regression)', () => {
    it('preserves lastDiagnosticResult across a version bump (v4 → current)', () => {
      const persisted = {
        userName: 'Анна',
        lastDiagnosticResult: VALID_DIAGNOSTIC,
      };
      const out = mig(persisted, 4);
      expect(out.lastDiagnosticResult).toEqual(VALID_DIAGNOSTIC);
    });

    it('also preserves it through the oldest (version < 2) migration path', () => {
      const persisted = {
        lastDiagnosticResult: VALID_DIAGNOSTIC,
        // legacy quiz keys that the v<2 path must wipe
        quizAttempts: { foo: 1 },
        quizBestScores: { foo: 90 },
      };
      const out = mig(persisted, 1);
      expect(out.lastDiagnosticResult).toEqual(VALID_DIAGNOSTIC);
    });

    it('drops a non-object lastDiagnosticResult (corrupt blob)', () => {
      const out = mig(
        { lastDiagnosticResult: 'not-an-object' },
        5,
      );
      expect(out.lastDiagnosticResult).toBeUndefined();
    });

    it('drops a null lastDiagnosticResult rather than carrying it', () => {
      // null is not an object per the isObj guard → key is absent, store
      // falls back to its initial-state default (also null).
      const out = mig({ lastDiagnosticResult: null }, 5);
      expect(out.lastDiagnosticResult).toBeUndefined();
    });
  });

  describe('(b) corrupt / wrong-type top-level keys are dropped', () => {
    it('drops a numeric userName (type mismatch)', () => {
      const out = mig({ userName: 123 }, 5);
      expect(out.userName).toBeUndefined();
    });

    it('keeps a valid string userName (and length-caps it)', () => {
      const out = mig({ userName: 'Доктор' }, 5);
      expect(out.userName).toBe('Доктор');
    });

    it('length-caps an over-long userName to 200 chars', () => {
      const long = 'x'.repeat(500);
      const out = mig({ userName: long }, 5);
      expect((out.userName as string).length).toBe(200);
    });

    it('drops a completedCourses array that contains non-strings', () => {
      const out = mig(
        { completedCourses: ['ok', 42, 'also-ok'] },
        5,
      );
      expect(out.completedCourses).toBeUndefined();
    });

    it('keeps a clean completedCourses string array', () => {
      const out = mig(
        { completedCourses: ['a', 'b'] },
        5,
      );
      expect(out.completedCourses).toEqual(['a', 'b']);
    });

    it('drops an array passed where an object is expected (studyTime)', () => {
      const out = mig({ studyTime: [1, 2, 3] }, 5);
      expect(out.studyTime).toBeUndefined();
    });

    it('returns an essentially empty result for a fully-junk blob', () => {
      const out = mig(
        { userName: 1, userEmail: {}, completedCourses: 'nope', studyTime: [] },
        5,
      );
      expect(out.userName).toBeUndefined();
      expect(out.userEmail).toBeUndefined();
      expect(out.completedCourses).toBeUndefined();
      expect(out.studyTime).toBeUndefined();
      // toolsFavouritesUpdatedAt is always defaulted (LWW timestamp), so the
      // object is never literally empty — but no junk key survives.
      expect(typeof out.toolsFavouritesUpdatedAt).toBe('number');
    });

    it('tolerates a null/undefined persistedState without throwing', () => {
      expect(() => migratePersistedState(null, 5)).not.toThrow();
      expect(() => migratePersistedState(undefined, 5)).not.toThrow();
      const out = mig(null, 5);
      expect(typeof out.toolsFavouritesUpdatedAt).toBe('number');
    });
  });

  describe('(c) patientContext 24h TTL', () => {
    it('rejects a patientContext older than 24h', () => {
      const old = Date.now() - (25 * 60 * 60 * 1000);
      const out = mig(
        {
          patientContext: { weightG: 1500, gaWeeks: 30, postnatalDay: 3 },
          patientContextSetAt: old,
        },
        5,
      );
      expect(out.patientContext).toBeUndefined();
      expect(out.patientContextSetAt).toBeUndefined();
    });

    it('keeps a fresh patientContext and clamps its fields', () => {
      const fresh = Date.now() - (60 * 1000); // 1 min ago
      const out = mig(
        {
          // out-of-range values to prove clamping runs
          patientContext: { weightG: 99999, gaWeeks: 200, postnatalDay: -5 },
          patientContextSetAt: fresh,
        },
        5,
      );
      expect(out.patientContext).toEqual({
        weightG: 10000, // clamped to max
        gaWeeks: 44,    // clamped to max
        postnatalDay: 0, // clamped to min (negative → min)
      });
      expect(out.patientContextSetAt).toBe(fresh);
    });

    it('rejects a future-dated patientContext (negative age)', () => {
      const future = Date.now() + (60 * 60 * 1000);
      const out = mig(
        {
          patientContext: { weightG: 1500, gaWeeks: 30, postnatalDay: 3 },
          patientContextSetAt: future,
        },
        5,
      );
      expect(out.patientContext).toBeUndefined();
    });
  });

  describe('(d) version < 2 clears legacy quiz keys', () => {
    it('wipes quizAttempts/quizBestScores and resets test maps', () => {
      const out = mig(
        {
          quizAttempts: { q1: 5 },
          quizBestScores: { q1: 88 },
        },
        1,
      );
      // legacy keys must not survive (they aren't even re-validated)
      expect(out.quizAttempts).toBeUndefined();
      expect(out.quizBestScores).toBeUndefined();
      // the v<2 path seeds empty test maps, which then pass the isObj guard
      expect(out.testAttempts).toEqual({});
      expect(out.courseTestProgress).toEqual({});
      expect(out.moduleTestAttempts).toEqual({});
      expect(out.completedModules).toEqual([]);
    });

    it('does NOT run the legacy reset for version >= 2', () => {
      // For v2+, an existing testAttempts object should pass through intact,
      // not be reset to {} by the v<2 branch.
      const out = mig(
        { testAttempts: { 'course-1': { level1: { score: 90 } } } },
        2,
      );
      expect(out.testAttempts).toEqual({ 'course-1': { level1: { score: 90 } } });
    });
  });

  describe('(e) readTopics deep validation (Bug: inner values were not checked)', () => {
    it('keeps readTopics when all inner values are string arrays', () => {
      const out = mig(
        { readTopics: { 'bio-1': ['tab-1', 'tab-2'] } },
        5,
      );
      expect(out.readTopics).toEqual({ 'bio-1': ['tab-1', 'tab-2'] });
    });

    it('drops readTopics when any inner value is a non-array (string)', () => {
      // Before the fix, isObj() let { "bio-1": "bad" } pass through,
      // causing [...cur, topicId] to spread a string character-by-character.
      const out = mig(
        { readTopics: { 'bio-1': 'not-an-array' } },
        5,
      );
      expect(out.readTopics).toBeUndefined();
    });

    it('drops readTopics when any inner value is a number', () => {
      const out = mig(
        { readTopics: { 'bio-1': 42 } },
        5,
      );
      expect(out.readTopics).toBeUndefined();
    });

    it('drops readTopics when any inner array contains non-strings', () => {
      const out = mig(
        { readTopics: { 'bio-1': ['tab-1', 99] } },
        5,
      );
      expect(out.readTopics).toBeUndefined();
    });
  });

  describe('(f) studyTime deep validation (Bug: inner values were not checked)', () => {
    it('keeps studyTime when all inner values are finite numbers', () => {
      const out = mig(
        { studyTime: { 'bio-1': 120, 'chem-2': 300 } },
        5,
      );
      expect(out.studyTime).toEqual({ 'bio-1': 120, 'chem-2': 300 });
    });

    it('drops studyTime when any inner value is a string', () => {
      // Before the fix, isObj() let { "bio-1": "bad" } pass through,
      // causing ("bad" || 0) + seconds → string concatenation in addStudyTime.
      const out = mig(
        { studyTime: { 'bio-1': 'bad-data' } },
        5,
      );
      expect(out.studyTime).toBeUndefined();
    });

    it('drops studyTime when any inner value is NaN', () => {
      const out = mig(
        { studyTime: { 'bio-1': NaN } },
        5,
      );
      expect(out.studyTime).toBeUndefined();
    });

    it('drops studyTime when any inner value is Infinity', () => {
      const out = mig(
        { studyTime: { 'bio-1': Infinity } },
        5,
      );
      expect(out.studyTime).toBeUndefined();
    });
  });
});
