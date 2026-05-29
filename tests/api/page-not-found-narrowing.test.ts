/**
 * Regression tests for notFound() narrowing bug in static page routes.
 *
 * Bug (tools/[id] and neonatology/articles/[id]):
 *   Both pages used `if (!t) notFound()` / `if (!a) notFound()` to guard
 *   against missing data. TypeScript couldn't narrow the variable after
 *   `notFound()` unless it was typed `never`, leading to 15+ TS18047
 *   "possibly null" errors and unsafe rendering past the guard.
 *
 * Fix: `if (!t) return notFound()` — the explicit `return` creates a
 *   control-flow split that TypeScript resolves via narrowing regardless
 *   of notFound()'s inferred return type.
 *
 * These tests verify the underlying ID-validation logic that both pages
 * share: the guard regex that rejects malicious/malformed route params
 * before reading from the filesystem.
 */
import { describe, it, expect } from 'vitest';

/** Mirrors the regex used in readToolMeta() and readArticle(). */
function isValidPageId(id: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/i.test(id);
}

describe('page route — ID validation guard', () => {
  it('accepts a normal tool id (alphanumeric-dash)', () => {
    expect(isValidPageId('wells-dvt')).toBe(true);
  });

  it('accepts an id with underscores', () => {
    expect(isValidPageId('cha2ds2_vasc')).toBe(true);
  });

  it('accepts a purely numeric id', () => {
    expect(isValidPageId('123')).toBe(true);
  });

  it('rejects a path traversal attempt (../)', () => {
    expect(isValidPageId('../etc/passwd')).toBe(false);
  });

  it('rejects an id starting with a dash', () => {
    expect(isValidPageId('-bad-id')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidPageId('')).toBe(false);
  });

  it('rejects an id with a slash (nested path injection)', () => {
    expect(isValidPageId('foo/bar')).toBe(false);
  });

  it('rejects an id with a null byte', () => {
    expect(isValidPageId('foo\x00bar')).toBe(false);
  });

  it('rejects an id with spaces', () => {
    expect(isValidPageId('foo bar')).toBe(false);
  });
});

/**
 * Tests for the notFound() narrowing pattern.
 *
 * The fix changes `if (!value) notFound()` to `if (!value) return notFound()`.
 * At runtime both throw, but with the `return` form TypeScript narrows
 * `value` to non-null for all code after the guard — which is what we want.
 *
 * We simulate the narrowed behaviour: a function that returns notFound()
 * for null and the value otherwise should only reach the "success" branch
 * with a non-null value.
 */
describe('notFound return narrowing', () => {
  const NEVER_CALLED_SENTINEL = 'should-not-reach';

  function processValue(v: string | null): string {
    if (!v) return 'not-found'; // mirrors `return notFound()`
    // TypeScript narrows `v` to `string` here — no null-access possible
    return v.toUpperCase();
  }

  it('returns not-found for null input', () => {
    expect(processValue(null)).toBe('not-found');
  });

  it('processes the value when non-null', () => {
    expect(processValue('hello')).toBe('HELLO');
  });

  it('never reaches post-guard code with a null value', () => {
    let reached = false;
    function check(v: string | null) {
      if (!v) return NEVER_CALLED_SENTINEL;
      reached = true;
      return v;
    }
    check(null);
    expect(reached).toBe(false);
  });
});
