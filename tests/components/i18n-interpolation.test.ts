/**
 * Regression: `t()` interpolated `{var}` placeholders via
 * `str.replace(pattern, String(v))` — a *string* replacer, which makes
 * `.replace()` interpret `$&`, `$'`, `` $` ``, `$1`-`$9` in the value as
 * special replacement patterns instead of literal text. A user-controlled
 * value containing one of those tokens (e.g. an uploaded filename) would
 * silently corrupt the rendered message instead of showing the literal
 * text.
 */
import { describe, it, expect } from 'vitest';
import { t } from '@/lib/i18n';

describe('t() interpolation', () => {
  it('inserts a plain value literally', () => {
    expect(t('ru', 'sidebar.feedback.errFileTooLarge', { name: 'report.pdf' }))
      .toBe('Файл «report.pdf» больше 5 МБ.');
  });

  it('inserts a value containing "$&" literally instead of duplicating the match', () => {
    expect(t('ru', 'sidebar.feedback.errFileTooLarge', { name: 'a$&b.pdf' }))
      .toBe('Файл «a$&b.pdf» больше 5 МБ.');
  });

  it("inserts a value containing \"$'\" literally instead of splicing in trailing text", () => {
    expect(t('ru', 'sidebar.feedback.errFileTooLarge', { name: "report$'.pdf" }))
      .toBe("Файл «report$'.pdf» больше 5 МБ.");
  });

  it('inserts a value containing "$1" literally (no capture group to substitute)', () => {
    expect(t('ru', 'sidebar.feedback.errFileTooLarge', { name: 'v$1.pdf' }))
      .toBe('Файл «v$1.pdf» больше 5 МБ.');
  });
});
