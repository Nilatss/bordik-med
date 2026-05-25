/**
 * Tests for lib/output-guard.ts.
 *
 * Bug fixed: the plain-text protocol check previously used
 * `FORBIDDEN_PROTOCOL` (anchored with `^`), so it only caught responses
 * whose VERY FIRST characters were `javascript:` or `vbscript:`.  A
 * response like "Learn more at javascript:alert(1)" passed unchecked.
 * The fix introduces `FORBIDDEN_PROTOCOL_IN_TEXT` which scans anywhere
 * in the decoded output for these two dangerous schemes.
 */
import { describe, it, expect } from 'vitest';
import { isOutputSafe } from '@/lib/output-guard';

describe('isOutputSafe · safe inputs', () => {
  it('accepts empty string', () => {
    expect(isOutputSafe('').safe).toBe(true);
  });

  it('accepts plain medical text', () => {
    const text = 'Гемоглобин — это белок эритроцитов, переносящий кислород. Норма: 120-160 г/л.';
    expect(isOutputSafe(text).safe).toBe(true);
  });

  it('accepts markdown with bold, headings and tables', () => {
    const md = '## Диагноз\n**Анемия** — снижение гемоглобина.\n| Показатель | Норма |\n|---|---|\n| Hb | 120-160 |';
    expect(isOutputSafe(md).safe).toBe(true);
  });

  it('accepts text that mentions "data: analysis" without URI scheme', () => {
    expect(isOutputSafe('The data: pH = 7.4, pO2 = 80 mmHg').safe).toBe(true);
  });

  it('accepts safe http links inside markdown', () => {
    expect(isOutputSafe('[UpToDate](https://www.uptodate.com)').safe).toBe(true);
  });
});

describe('isOutputSafe · javascript: detection (Bug #3)', () => {
  it('rejects response starting with javascript:', () => {
    expect(isOutputSafe('javascript:alert(1)').safe).toBe(false);
  });

  it('rejects response with javascript: embedded mid-sentence', () => {
    // This is the regression case: the old `^` regex would let this through.
    const result = isOutputSafe('Check this link: javascript:alert(document.cookie)');
    expect(result.safe).toBe(false);
    expect(result.reason).toBe('forbidden_protocol_in_text');
  });

  it('rejects response with javascript: after whitespace and text', () => {
    const result = isOutputSafe('Для подробностей перейдите по ссылке javascript:void(0)');
    expect(result.safe).toBe(false);
  });

  it('rejects vbscript: mid-sentence', () => {
    const result = isOutputSafe('старая IE ссылка: vbscript:msgbox(1)');
    expect(result.safe).toBe(false);
    expect(result.reason).toBe('forbidden_protocol_in_text');
  });

  it('is case-insensitive for JAVASCRIPT:', () => {
    expect(isOutputSafe('JAVASCRIPT:alert(1)').safe).toBe(false);
    expect(isOutputSafe('JaVaScRiPt:alert(1)').safe).toBe(false);
  });
});

describe('isOutputSafe · HTML-encoded evasion attempts', () => {
  it('rejects &#x6A;avascript: (hex-encoded j)', () => {
    expect(isOutputSafe('&#x6A;avascript:alert(1)').safe).toBe(false);
  });

  it('rejects entity-double-encoded javascript:', () => {
    // &amp;#x6A; → decode → &#x6A; → decode → j → javascript:
    expect(isOutputSafe('&amp;#x6A;avascript:alert(1)').safe).toBe(false);
  });
});

describe('isOutputSafe · forbidden HTML tags', () => {
  it('rejects <script> tag', () => {
    const r = isOutputSafe('<script>alert(1)</script>');
    expect(r.safe).toBe(false);
    expect(r.reason).toContain('forbidden_tag');
  });

  it('rejects <iframe>', () => {
    expect(isOutputSafe('<iframe src="https://evil.com"></iframe>').safe).toBe(false);
  });

  it('rejects <svg onload>', () => {
    expect(isOutputSafe('<svg onload="alert(1)">').safe).toBe(false);
  });

  it('rejects event handler attribute (onclick)', () => {
    const r = isOutputSafe('<div onclick="alert(1)">click me</div>');
    expect(r.safe).toBe(false);
    expect(r.reason).toContain('forbidden_attr');
  });
});

describe('isOutputSafe · attribute-level protocol checks', () => {
  it('rejects href with javascript: URI', () => {
    const r = isOutputSafe('<a href="javascript:alert(1)">click</a>');
    expect(r.safe).toBe(false);
  });

  it('rejects href with data:text/html', () => {
    expect(isOutputSafe('<a href="data:text/html,<script>evil</script>">x</a>').safe).toBe(false);
  });

  it('rejects href with whitespace-padded javascript:', () => {
    expect(isOutputSafe('<a href="  javascript:alert(1)">x</a>').safe).toBe(false);
  });

  it('rejects style attribute entirely', () => {
    expect(isOutputSafe('<div style="color:red">text</div>').safe).toBe(false);
  });

  it('accepts plain https href', () => {
    expect(isOutputSafe('<a href="https://safe.example.com">link</a>').safe).toBe(true);
  });
});
