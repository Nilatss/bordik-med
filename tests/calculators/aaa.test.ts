/**
 * Golden tests for abdominal aortic aneurysm (AAA) management decision.
 *
 * Reference: SVS 2018 Practice Guidelines + ESVS 2019.
 *
 * Decision drivers (in priority order):
 *   1. status='rupt'  → emergency surgery
 *   2. status='sym'   → urgent surgery (24-72 h)
 *   3. rapid growth >10 mm/y → elective repair
 *   4. diameter < 30 mm → not an AAA
 *   5. 30-39 mm → small, q3y surveillance
 *   6. 40-44 mm (♂) / 40-49 mm (♀) → medium
 *   7. ≥55 mm (♂) or ≥50 mm (♀) → repair indicated
 */
import { describe, it, expect } from 'vitest';
import aaa from '@/lib/runners/aaa';

interface AaaResult { interpretation: string }

interface Args {
  diameter: number;
  sex: 'm' | 'f';
  status: 'screen' | 'sym' | 'rupt';
  rapid: boolean;
}

function call(args: Args): AaaResult {
  return (aaa.compute as unknown as (v: Args) => unknown)(args) as AaaResult;
}

describe('aaa · compute', () => {
  it('rupture trumps everything → emergency surgery', () => {
    const r = call({ diameter: 25, sex: 'm', status: 'rupt', rapid: false });
    expect(r.interpretation).toMatch(/разрыв|экстренная/i);
  });

  it('symptomatic AAA → urgent surgery, even if size below threshold', () => {
    const r = call({ diameter: 35, sex: 'm', status: 'sym', rapid: false });
    expect(r.interpretation).toMatch(/Симптомная|срочная/i);
  });

  it('rapid growth flag → elective repair indicated', () => {
    const r = call({ diameter: 45, sex: 'm', status: 'screen', rapid: true });
    expect(r.interpretation).toMatch(/Быстрый рост|10 мм/);
  });

  it('< 30 mm = not an AAA', () => {
    const r = call({ diameter: 28, sex: 'm', status: 'screen', rapid: false });
    expect(r.interpretation).toMatch(/Не аневризма|расширение/i);
  });

  it('small AAA 30-39 mm → q3y surveillance', () => {
    const r = call({ diameter: 35, sex: 'm', status: 'screen', rapid: false });
    expect(r.interpretation).toMatch(/малого размера|q3/i);
  });
});
