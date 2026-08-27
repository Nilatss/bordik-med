/**
 * Tests for `hasUsefulTableKeyword` in lib/course/lesson-utils.ts.
 *
 * Bug being fixed: the chemistry/physics keyword list had `'ph\b'` — a JS
 * string literal where `\b` is the BACKSPACE escape character (U+0008),
 * not a regex word-boundary. `new RegExp('ph\b')` compiles to a pattern
 * that matches the literal text "ph" followed by an actual backspace
 * character, which never occurs in real table headers — so "pH" headers
 * (e.g. a chemistry reference table "Норма pH крови") silently never
 * triggered the PDF-download button that CLAUDE.md's product spec
 * documents for this exact keyword. The fix escapes the backslash
 * (`'ph\\b'`) so the string value is the two characters `\b`, which
 * becomes a real regex word-boundary.
 */
import { describe, it, expect } from 'vitest';
import { hasUsefulTableKeyword, USEFUL_TABLE_KEYWORDS } from '@/lib/course/lesson-utils';

describe('hasUsefulTableKeyword', () => {
  it('matches a lowercased header containing "pH" as a whole word', () => {
    // Callers lowercase headers before matching (see LessonContent.tsx);
    // "pH".toLowerCase() === "ph".
    expect(hasUsefulTableKeyword(['норма ph крови'])).toBe(true);
    expect(hasUsefulTableKeyword(['ph'])).toBe(true);
  });

  it('does not false-positive when "ph" is mid-word, not at a boundary', () => {
    // The \b anchors on the position right after "ph" — "phone" has more
    // word characters immediately following "ph", so no boundary there.
    expect(hasUsefulTableKeyword(['phone'])).toBe(false);
  });

  it('the raw keyword list entry is a valid, non-degenerate RegExp source', () => {
    const kw = USEFUL_TABLE_KEYWORDS.find((k) => k.startsWith('ph'));
    expect(kw).toBe('ph\\b');
    // A backspace character (from an unescaped \b) would make this regex
    // never match plain "ph" text — assert it actually does.
    expect(new RegExp(kw!).test('ph')).toBe(true);
  });

  it('still matches an existing (non-regressed) keyword category', () => {
    expect(hasUsefulTableKeyword(['препарат', 'дозировка'])).toBe(true);
    expect(hasUsefulTableKeyword(['a', 'b'])).toBe(false);
  });
});
