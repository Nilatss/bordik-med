/**
 * Tests for the JSON-LD escaping helper (lib/json-ld.ts).
 *
 * Inline <script type="application/ld+json"> blocks are rendered via
 * dangerouslySetInnerHTML. Plain JSON.stringify is unsafe: a value
 * containing "</script>" (or a lone "<") terminates the script element
 * early — a stored-XSS vector wherever a field is attacker-influenced
 * (drug names, article titles, ICD descriptions, tool inputs).
 *
 * The helper must escape <, >, & and the U+2028 / U+2029 line terminators
 * while keeping the output valid JSON that round-trips to the original
 * object (so crawlers still read the structured data).
 */
import { describe, it, expect } from 'vitest';
import { jsonLdHtml } from '@/lib/json-ld';

describe('jsonLdHtml · safe inline-script embedding', () => {
  it('escapes < and > so an inline <script> cannot be broken out of', () => {
    const out = jsonLdHtml({ name: '</script><img src=x onerror=alert(1)>' });
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).toContain('\\u003c');
    expect(out).toContain('\\u003e');
  });

  it('escapes ampersands (HTML entity context)', () => {
    const out = jsonLdHtml({ a: 'Tom & Jerry' });
    expect(out).toContain('\\u0026');
    expect(out).not.toContain('&');
  });

  it('escapes U+2028 / U+2029 line terminators', () => {
    const LS = String.fromCharCode(0x2028);
    const PS = String.fromCharCode(0x2029);
    const obj = { a: `line${LS}sep${PS}end` };
    const out = jsonLdHtml(obj);
    expect(out).toContain('\\u2028');
    expect(out).toContain('\\u2029');
    expect(out).not.toContain(LS);
    expect(out).not.toContain(PS);
  });

  it('stays valid JSON that round-trips to the original object', () => {
    const obj = {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'A < B & C > D',
      nested: { items: [1, 2, '</script>'], flag: true },
    };
    expect(JSON.parse(jsonLdHtml(obj))).toEqual(obj);
  });

  it('handles benign content without spurious escaping', () => {
    const out = jsonLdHtml({ url: 'https://bordik.app/drugs', n: 42 });
    expect(JSON.parse(out)).toEqual({ url: 'https://bordik.app/drugs', n: 42 });
  });
});
