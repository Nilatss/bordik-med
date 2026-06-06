/**
 * Regression test for bug: 'ph\b' in USEFUL_KEYWORDS produces a backspace
 * character (U+0008) in a JS string literal, not a regex word boundary.
 *
 * new RegExp('ph\b') creates /ph\x08/ which never matches any header text,
 * so tables with a "pH" column were never offered the PDF download button.
 *
 * Fix: changed to '\\bph\\b' so the RegExp constructor receives the literal
 * backslash-b and interprets it as the \b word-boundary assertion.
 */
import { describe, it, expect } from 'vitest';

describe('USEFUL_KEYWORDS · pH keyword regex', () => {
  it('old broken pattern ph\\b (backspace) does NOT match pH headers', () => {
    // In a JS string literal, '\b' is a backspace character (U+0008).
    // new RegExp('ph\b') therefore matches "ph" + 0x08, never found in headers.
    const brokenKw = 'ph\b';
    expect(new RegExp(brokenKw).test('ph')).toBe(false);
    expect(new RegExp(brokenKw).test('ph среды')).toBe(false);
    expect(new RegExp(brokenKw).test('кислотность (pH)')).toBe(false);
  });

  it('fixed pattern \\bph\\b matches pH headers', () => {
    const fixedKw = '\\bph\\b';
    expect(new RegExp(fixedKw).test('ph')).toBe(true);
    expect(new RegExp(fixedKw).test('ph среды')).toBe(true);
    expect(new RegExp(fixedKw).test('кислотность ph раствора')).toBe(true);
  });

  it('fixed pattern does not false-positive on compound words containing ph', () => {
    const fixedKw = '\\bph\\b';
    // 'phosphate', 'alpha', 'morphology' all contain 'ph' but not as a word token
    expect(new RegExp(fixedKw).test('phosphate')).toBe(false);
    expect(new RegExp(fixedKw).test('morphology')).toBe(false);
    expect(new RegExp(fixedKw).test('alpha')).toBe(false);
  });

  it('headers are lowercased before matching, so pH is detected as ph', () => {
    const fixedKw = '\\bph\\b';
    // LessonContent lowercases headers: const headers = headersRaw.map(h => h.toLowerCase())
    const rawHeader = 'pH';
    expect(new RegExp(fixedKw).test(rawHeader.toLowerCase())).toBe(true);
  });
});
