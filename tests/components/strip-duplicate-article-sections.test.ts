/**
 * Tests for `stripDuplicateArticleSections` — the helper that removes
 * trailing `## Источники` / `## Калькуляторы Bordik` blocks from the
 * markdown body of `neonatal-articles.json` entries before rendering.
 *
 * Why: many articles in the bank duplicate their structured fields
 * (`references[]`, `related_calculators[]`) inside the markdown body
 * as well. The ArticleCard renders the structured arrays as proper
 * chips/numbered lists below the body, so the in-body sections show
 * twice to the clinician. This helper strips them at render time so
 * the JSON bank doesn't need a one-off migration.
 *
 * Imports the REAL helper from `@/lib/neonatal/article-format` (the same
 * module `NeonatalHandbook.tsx` consumes) so the test guards shipped
 * behaviour rather than a local copy of the regex.
 */
import { describe, it, expect } from 'vitest';
import { stripDuplicateArticleSections } from '@/lib/neonatal/article-format';

describe('stripDuplicateArticleSections', () => {
  it('removes a trailing "## Источники" section', () => {
    const input = `## Лечение\n\n- IVIG\n- Phototherapy\n\n## Источники\n\n- AAP 2022 — Pediatrics 150:e2022058859\n- NICE CG98 (2023)`;
    const out = stripDuplicateArticleSections(input);
    expect(out).toBe(`## Лечение\n\n- IVIG\n- Phototherapy`);
  });

  it('removes a trailing "## Калькуляторы Bordik" section', () => {
    const input = `## Лечение\n\n- Surfactant LISA\n\n## Калькуляторы Bordik\n- neo-surfactant-dose\n- neo-rds-class`;
    const out = stripDuplicateArticleSections(input);
    expect(out).toBe(`## Лечение\n\n- Surfactant LISA`);
  });

  it('strips the FIRST matching duplicate section through end-of-content', () => {
    // Real-world shape from art-rop — both blocks exist sequentially at the
    // end of the markdown body. The regex anchors at end ($) so both are
    // stripped in one shot starting at the first match.
    const input = [
      '## Профилактика',
      '',
      '- Caffeine — CAP trial',
      '',
      '## Калькуляторы Bordik',
      '- neo-icrop3',
      '- neo-rop-screen-timing',
      '',
      '## Источники',
      '',
      '- Chiang MF et al. **Ophthalmology 2021**',
      '- AAP/AAO/AAPOS. **Pediatrics 2018**',
    ].join('\n');
    const out = stripDuplicateArticleSections(input);
    expect(out).toBe(`## Профилактика\n\n- Caffeine — CAP trial`);
  });

  it('is case-insensitive (matches "источники", "REFERENCES", etc.)', () => {
    const input1 = `## Body\n\n## источники\n- ref`;
    expect(stripDuplicateArticleSections(input1)).toBe(`## Body`);
    const input2 = `## Body\n\n## REFERENCES\n- ref`;
    expect(stripDuplicateArticleSections(input2)).toBe(`## Body`);
  });

  it('matches "References" (English) as well as "Источники"', () => {
    const input = `## Body\n\n## References\n- Smith 2024`;
    expect(stripDuplicateArticleSections(input)).toBe(`## Body`);
  });

  it('does NOT strip a mid-body heading that happens to be named similarly', () => {
    // "Источники инфекции" is a valid clinical heading — we only strip
    // when the heading is exactly the dedup'd label, not when it has
    // a continuation (the regex requires `\b` word boundary + no
    // continuation that isn't whitespace/newline).
    const input = `## Источники инфекции\n\nGBS, E. coli, Listeria.\n\n## Лечение\n\nAmpi + genta.`;
    const out = stripDuplicateArticleSections(input);
    // Should NOT strip — the heading text is "Источники инфекции", not bare "Источники".
    expect(out).toContain('GBS, E. coli');
    expect(out).toContain('## Лечение');
  });

  it('passes through articles that legitimately have no duplicate section', () => {
    const input = `## Определение\n\nRDS is...\n\n## Терапия\n\nSurfactant.`;
    expect(stripDuplicateArticleSections(input)).toBe(input);
  });

  it('trims trailing whitespace after the strip', () => {
    const input = `## Body\n\n  \n## Источники\n- ref\n\n`;
    expect(stripDuplicateArticleSections(input)).toBe(`## Body`);
  });
});
