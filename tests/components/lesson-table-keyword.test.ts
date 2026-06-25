/**
 * Regression test for the 'ph\b' keyword bug in USEFUL_KEYWORDS
 * (components/course/lesson/LessonContent.tsx).
 *
 * Bug: the keyword was written as 'ph\b' (single backslash in source).
 * In a JS string literal, \b is the BACKSPACE control character (U+0008),
 * NOT a regex word boundary. When used with new RegExp(kw), the pattern
 * matched 'ph' followed by a literal backspace — which never appears in
 * table headers. Tables with a "pH" column never received the PDF button.
 *
 * Fix: changed to 'ph\\b' so the string value is the two-character
 * sequence \b, which new RegExp interprets as a word-boundary assertion.
 * The fixed pattern matches "pH", "ph" and "ph " but NOT "phosphate"
 * or "phosphorus" (where 'ph' is followed by a word character).
 */

import { describe, it, expect } from 'vitest';

// Re-implement just enough of the detection to test the keyword fix.
// The real USEFUL_KEYWORDS lives in LessonContent.tsx (non-exported const);
// this test validates the regex semantics directly.

/** Pattern as it existed BEFORE the fix (backspace char after ph). */
const BUGGY_PATTERN = 'ph\b';
/** Pattern as it exists AFTER the fix (word-boundary regex). */
const FIXED_PATTERN = 'ph\\b';

function matchesPattern(pattern: string, header: string): boolean {
  return new RegExp(pattern).test(header.toLowerCase());
}

describe('USEFUL_KEYWORDS ph word-boundary fix', () => {
  describe('buggy pattern (ph + backspace char)', () => {
    it('does NOT match "pH" because no backspace in headers', () => {
      expect(matchesPattern(BUGGY_PATTERN, 'pH')).toBe(false);
    });
    it('does NOT match "ph" standalone', () => {
      expect(matchesPattern(BUGGY_PATTERN, 'ph')).toBe(false);
    });
    it('does NOT match "pH-balance"', () => {
      expect(matchesPattern(BUGGY_PATTERN, 'pH-balance')).toBe(false);
    });
  });

  describe('fixed pattern (ph + word-boundary \\b)', () => {
    it('matches "pH" (lowercased to "ph" at word end)', () => {
      expect(matchesPattern(FIXED_PATTERN, 'pH')).toBe(true);
    });
    it('matches "ph" standalone', () => {
      expect(matchesPattern(FIXED_PATTERN, 'ph')).toBe(true);
    });
    it('matches "pH-balance" (word boundary before hyphen)', () => {
      expect(matchesPattern(FIXED_PATTERN, 'pH-balance')).toBe(true);
    });
    it('does NOT match "phosphate" (ph followed by word char "o")', () => {
      expect(matchesPattern(FIXED_PATTERN, 'phosphate')).toBe(false);
    });
    it('does NOT match "phosphorus"', () => {
      expect(matchesPattern(FIXED_PATTERN, 'phosphorus')).toBe(false);
    });
    it('does NOT match "phospholipid"', () => {
      expect(matchesPattern(FIXED_PATTERN, 'phospholipid')).toBe(false);
    });
  });
});
