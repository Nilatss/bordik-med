/**
 * Regression: `USEFUL_KEYWORDS` had 'ph\b' written as a plain string
 * literal, where `\b` is the JS *backspace* escape (U+0008) rather than
 * a regex word-boundary — so the entry could never match any real
 * header text and pH reference tables never got a PDF-download button
 * unless they also happened to be "large" (3+ cols, 4+ rows).
 */
import { describe, it, expect } from 'vitest';
import { USEFUL_KEYWORDS, isUsefulTable } from '@/components/course/lesson/LessonContent';

describe('LessonContent · pH keyword', () => {
  it('the pH keyword source is a real regex word-boundary, not a backspace char', () => {
    const kw = USEFUL_KEYWORDS.find((k) => k.toLowerCase().startsWith('ph'));
    expect(kw).toBe('ph\\b');
    expect(kw?.includes('\b')).toBe(false);
  });

  it('matches a lower-cased "pH" header', () => {
    expect(new RegExp('ph\\b').test('ph')).toBe(true);
    expect(new RegExp('ph\\b').test('ph показатель')).toBe(true);
  });
});

describe('isUsefulTable', () => {
  it('gives a small 2-column pH table the PDF button via keyword match', () => {
    // 2 cols / 2 rows — below the "large table" fallback threshold, so
    // this only passes if the keyword match itself works.
    expect(isUsefulTable(['ph', 'значение'], 2, 2)).toBe(true);
  });

  it('does not flag an unrelated small table as useful', () => {
    expect(isUsefulTable(['a', 'b'], 2, 2)).toBe(false);
  });

  it('flags any large table regardless of headers', () => {
    expect(isUsefulTable(['a', 'b', 'c'], 3, 4)).toBe(true);
  });
});
