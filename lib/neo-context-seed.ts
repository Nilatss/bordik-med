/**
 * Pre-seed a neonatology calculator's inputs from the shared PatientContextBar
 * (weight grams / GA weeks / postnatal day).
 *
 * The PatientContextBar promised "enter once, auto-fill every calculator" but
 * nothing consumed it. This matches by BOTH input id AND unit so a neonatal
 * value never lands in the wrong field: weight is grams (unit "г"), GA is
 * weeks ("нед"), day is "сут"/"день". Scoped to `neo-*` tools only, so a
 * generic adult calculator with a kg "weight" input is never touched.
 *
 * Pure (no React/store) so it is unit-testable.
 */
export interface NeoPatientContext {
  weightG: number;
  gaWeeks: number;
  postnatalDay: number;
}

interface SeedInput {
  id: string;
  type: string;
  unit?: string | undefined;
}

export function seedNeoContext(
  toolId: string,
  inputs: readonly SeedInput[],
  ctx: NeoPatientContext,
): Record<string, number> {
  if (!toolId.startsWith('neo-')) return {};
  const seed: Record<string, number> = {};
  for (const inp of inputs) {
    if (inp.type !== 'number') continue;
    const id = inp.id.toLowerCase();
    const unit = (inp.unit ?? '').toLowerCase();
    if (ctx.weightG > 0 && (id === 'weight' || id === 'weight_g' || id === 'weightg') && unit === 'г') {
      seed[inp.id] = ctx.weightG;
    } else if (ctx.gaWeeks > 0 && (id === 'ga' || id.includes('gestational')) && unit.includes('нед')) {
      seed[inp.id] = ctx.gaWeeks;
    } else if (
      ctx.postnatalDay > 0
      && (id === 'day' || id.includes('postnatal'))
      && (unit.includes('сут') || unit.includes('день') || unit.includes('дн'))
    ) {
      seed[inp.id] = ctx.postnatalDay;
    }
  }
  return seed;
}
