/**
 * Golden tests for Salter-Harris classification (paediatric physeal fractures).
 *
 * Reference: Salter RB, Harris WR. Injuries involving the epiphyseal
 * plate. J Bone Joint Surg Am 1963;45:587-622.
 *
 * Mnemonic SALTR:
 *   I    Slip — through physis only             (~6-8%, low growth-arrest risk)
 *   II   Above — physis + metaphysis            (~75%, low risk; Thurston-Holland Δ)
 *   III  Lower — physis + epiphysis (intra-articular) (~10%, medium risk)
 *   IV   Through — metaphysis + physis + epiphysis     (~10%, high risk)
 *   V    Rammed — crush of physis              (~1%, highest risk)
 */
import { describe, it, expect } from 'vitest';
import sh from '@/lib/runners/salter-harris';
import type { ScoreBand } from '@/lib/tools-runners';

const bands = (sh as { bands: ScoreBand[] }).bands;

describe('salter-harris · classification', () => {
  it('declares 5 type bands (I-V)', () => {
    expect(bands.length).toBe(5);
  });

  it('each band labelled with Roman numeral I..V', () => {
    const labels = bands.map((b) => b.label);
    expect(labels.some((l) => /SH I /.test(l))).toBe(true);
    expect(labels.some((l) => /SH II /.test(l))).toBe(true);
    expect(labels.some((l) => /SH III /.test(l))).toBe(true);
    expect(labels.some((l) => /SH IV /.test(l))).toBe(true);
    expect(labels.some((l) => /SH V /.test(l))).toBe(true);
  });

  it('SH I is "Slip" (low risk)', () => {
    const sh1 = bands.find((b) => /SH I /.test(b.label) && !/SH II|SH III|SH IV|SH V/.test(b.label))!;
    expect(sh1.label.toLowerCase()).toMatch(/slip/);
    expect(sh1.color).toMatch(/^#22/i); // green
  });

  it('SH V is "Crush" (highest risk)', () => {
    const sh5 = bands.find((b) => /SH V /.test(b.label))!;
    expect(sh5.label.toLowerCase()).toMatch(/crush/);
    // Dark red
    expect(sh5.color.toLowerCase()).toMatch(/^#(7|8|9|a|b)/i);
  });

  it('SH III and IV recommend anatomic ORIF (intra-articular / through-physis)', () => {
    const sh3 = bands.find((b) => /SH III /.test(b.label))!;
    const sh4 = bands.find((b) => /SH IV /.test(b.label))!;
    const text3 = `${(sh3.actions ?? []).join(' ')}`.toLowerCase();
    const text4 = `${(sh4.actions ?? []).join(' ')}`.toLowerCase();
    expect(text3).toMatch(/orif|анатомичн|винт/);
    expect(text4).toMatch(/orif|анатомичн/);
  });

  it('SH I and II recommend cast / closed reduction', () => {
    const sh1 = bands.find((b) => /SH I /.test(b.label) && !/SH II|SH III|SH IV|SH V/.test(b.label))!;
    const sh2 = bands.find((b) => /SH II /.test(b.label))!;
    const text1 = `${(sh1.actions ?? []).join(' ')}`.toLowerCase();
    const text2 = `${(sh2.actions ?? []).join(' ')}`.toLowerCase();
    expect(text1).toMatch(/гипс|cast|закрыт/);
    expect(text2).toMatch(/гипс|cast|закрыт/);
  });

  it('SH V mentions retrospective diagnosis (often missed initially)', () => {
    const sh5 = bands.find((b) => /SH V /.test(b.label))!;
    const text = `${sh5.description ?? ''} ${sh5.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/ретроспект|нормальн|рентген|growth arrest/);
  });
});
