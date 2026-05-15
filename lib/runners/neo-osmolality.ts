/**
 * Runner: neo-osmolality — Serum osmolality calculator
 *
 * NEONATOLOGY MODULE A44 (P3).
 *
 * Calculated serum osmolality (mOsm/kg):
 *   Osm = 2 × Na + glucose/18 + BUN/2.8   (US units, glucose+BUN в mg/dL)
 *   Osm = 2 × Na + glucose + urea         (SI units, ммоль/л)
 *
 * Норма у новорождённого: 275-295 mOsm/kg
 *
 * Osmolal gap = measured − calculated. > 10 mOsm/kg = подозрение на
 * необычные osmoles (ethanol, methanol, ethylene glycol, mannitol,
 * propylene glycol — последний накапливается у preterm на high-dose
 * lorazepam / phenobarb solutions).
 *
 * Clinical context (neonates):
 *   - **Hyperosmolar состояние** (> 300): IVH risk у preterm
 *     (resus boluses с hypertonic solutions). Slow correction только.
 *   - **Hypoosmolar** (< 275): SIADH, IV fluid overload, hyponatremia —
 *     symptomatic seizures возможны < 270.
 *   - **Osmolal gap > 10** (если measured доступен): toxic ingestion
 *     или benzyl alcohol/propylene glycol toxicity у preterm.
 *
 * SOURCES:
 *   - Smellie WS. BMJ 2007;334:701 — Plasma osmolality
 *   - Bhargava M. Pediatr Rev 2003;24:179 — Neonatal fluid balance
 *   - КР МЗ РФ "Нарушения водно-электролитного обмена у н/р" (2024)
 *   - Avery's Diseases of the Newborn 11th ed., ch 27
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный',
  reference:
    'Smellie WS. BMJ 2007;334:701. Avery 11th ed. КР МЗ РФ ВЭО н/р (2024).',
  inputs: [
    {
      id: 'na',
      label: 'Na⁺ (ммоль/л)',
      type: 'number',
      min: 100,
      max: 180,
      step: 1,
    },
    {
      id: 'glucose',
      label: 'Glucose (ммоль/л)',
      type: 'number',
      min: 0,
      max: 30,
      step: 0.1,
    },
    {
      id: 'urea',
      label: 'Urea / BUN (ммоль/л)',
      type: 'number',
      min: 0,
      max: 50,
      step: 0.1,
    },
    {
      id: 'measured',
      label: 'Измеренная osmolality (mOsm/kg, опционально)',
      type: 'number',
      min: 200,
      max: 400,
      step: 1,
    },
  ],
  compute(values): CalculatorResult {
    // Distinguish "user didn't enter" vs "user entered 0" — required
    // for clinical safety (osmolality calc нужны все 3 параметра).
    const hasNa = values.na !== undefined && values.na !== '' && !Number.isNaN(Number(values.na));
    const hasGluc = values.glucose !== undefined && values.glucose !== '' && !Number.isNaN(Number(values.glucose));
    const hasUrea = values.urea !== undefined && values.urea !== '' && !Number.isNaN(Number(values.urea));

    if (!hasNa || !hasGluc || !hasUrea) {
      return {
        value: '—',
        interpretation: 'Введите Na⁺, glucose и urea (все 3 параметра)',
        color: '#9CA3AF',
        details: 'Минимум Na + glucose + urea (в ммоль/л) для расчёта.',
      };
    }

    const na = Number(values.na);
    const glucose = Number(values.glucose);
    const urea = Number(values.urea);
    const measured = Number(values.measured ?? 0);

    if (na <= 0 || glucose < 0 || urea < 0) {
      return {
        value: '—',
        interpretation: 'Na⁺ должен быть > 0, glucose и urea ≥ 0',
        color: '#9CA3AF',
        details: 'Проверьте введённые значения.',
      };
    }

    // SI formula: Osm = 2 × Na + glucose + urea (все в ммоль/л)
    const calculated = 2 * na + glucose + urea;
    const calcRounded = Math.round(calculated);

    let interpretation = '';
    let color = '#22C55E';
    const actions: string[] = [];

    if (calcRounded < 275) {
      color = '#3B82F6';
      interpretation = `Гипоосмолярное состояние (${calcRounded} mOsm/kg, норма 275-295)`;
      actions.push('Оценить hyponatremia (SIADH, IV fluid overload, потери)');
      actions.push('При Na < 130 + симптомы (seizures) → 3 % NaCl 2-4 мл/кг slow');
      actions.push('Restrict free water; switch IV maintenance с D5W на D5/0.45 NS');
      actions.push('Cortisol / TSH если SIADH-like — exclude adrenal/thyroid');
    } else if (calcRounded > 295) {
      color = '#EF4444';
      interpretation = `Гиперосмолярное состояние (${calcRounded} mOsm/kg, норма 275-295)`;
      actions.push('Hypernatremia? Dehydration (free water deficit)?');
      actions.push('Hyperglycemia (DM, неонатальный диабет, IV glucose excess)?');
      actions.push('Uremia (AKI)?');
      actions.push('У preterm + acute hyperosmolality: IVH risk высокий');
      actions.push('Slow correction: ≤ 0,5 ммоль/л/ч Na, либо 8-12 ммоль/л/24h max');
      actions.push('Avoid hypertonic boluses (NaHCO₃ 8.4 %, glucose 50 %) у preterm');
    } else {
      interpretation = `В норме (${calcRounded} mOsm/kg, норма 275-295)`;
    }

    // Osmolal gap (если measured предоставлен)
    let gapText = '';
    if (measured > 0) {
      const gap = measured - calculated;
      const gapRounded = Math.round(gap);
      if (gap > 10) {
        color = '#EF4444';
        gapText = ` · Osmolal gap ${gapRounded} (> 10) — подозрение на «unmeasured osmoles»`;
        actions.push(
          'High osmolal gap: ethanol, methanol, ethylene glycol, propylene glycol (особенно у preterm на high-dose lorazepam / phenobarb), mannitol',
        );
        actions.push('Lactate + ketones + toxicology screen');
      } else {
        gapText = ` · Osmolal gap ${gapRounded} (норма ≤ 10)`;
      }
    }

    return {
      value: `${calcRounded} mOsm/kg`,
      interpretation: interpretation + gapText,
      color,
      details: `Calculated osmolality = 2 × ${na} + ${glucose.toFixed(1)} + ${urea.toFixed(1)} = ${calculated.toFixed(1)} mOsm/kg.\nНорма 275-295. ` +
        (actions.length > 0 ? '\n\n**Действия:**\n' + actions.map((a) => `- ${a}`).join('\n') : ''),
    };
  },
  info: `
### Для чего используется
**Calculated serum osmolality** — расчётный показатель тонико-осмотической нагрузки плазмы у новорождённого. Используется для:
- Оценки hydration status (dehydration / overload)
- Calculation osmolal gap при подозрении на toxic ingestion
- Управления гипернатриемией / гипонатриемией
- Мониторинга у preterm на TPN или hyperglycemia

### Формула (SI units)
\`\`\`
Osmolality = 2 × Na⁺ + glucose + urea
\`\`\`
все в ммоль/л.

US формула:
\`\`\`
Osmolality = 2 × Na⁺ + glucose/18 + BUN/2.8
\`\`\`
(Na в mEq/L, glucose+BUN в mg/dL)

### Норма у новорождённого
275-295 mOsm/kg.

### Osmolal gap
\`\`\`
Gap = Measured (lab) − Calculated
\`\`\`

| Gap | Интерпретация |
|---|---|
| ≤ 10 | Норма |
| 10-20 | Подозрение на unmeasured osmoles |
| > 20 | Высокий риск toxic ingestion / propylene glycol |

### Клинические сценарии

#### Hyperosmolar (> 295 mOsm/kg)
- **Hypernatremia + dehydration** — диарея, рвота, lactation failure, фототерапия + low intake
- **Hyperglycemia** — IDM, IV glucose excess, неонатальный СД, sepsis-related
- **Uremia (AKI)** — sepsis, HIE, nephrotoxic drugs
- **IATROGENIC**: hypertonic saline, NaHCO₃ 8,4 %, glucose 50 %, mannitol

#### Hypoosmolar (< 275 mOsm/kg)
- **SIADH** — meningitis, asphyxia, post-cardiac surgery, IPPV
- **CSW (cerebral salt wasting)** — HIE, ICH
- **Iatrogenic dilution** — high-volume hypotonic IV
- **Adrenal insufficiency** — congenital adrenal hyperplasia

#### High osmolal gap (> 10)
- **Propylene glycol toxicity** у preterm — high-dose lorazepam (vehicle), phenobarb IV (часто), trimethoprim-sulfa IV
- **Ethanol / methanol / ethylene glycol** — accidental ingestion (rare neonates)
- **Mannitol** infusion

### Управление

#### Острая hypernatremia (> 150 ммоль/л)
- Если symptomatic (seizures, coma): **slow** correction 0,5 ммоль/л/ч max
- Aim ↓ Na not faster than 10-12 ммоль/л/24h
- Free water deficit: \`Deficit = 0,6 × BW × (Na real − 140) / 140\`
- Replace 50 % over 24 h, 50 % over next 24 h

#### Острая hyponatremia (< 125 ммоль/л + симптомы)
- 3 % NaCl 2-4 мл/кг slow IV bolus
- Aim ↑ Na 4-6 ммоль/л за first 6 h, max 10 ммоль/л/24h
- Risk osmotic demyelination при rapid correction (rare neonates)

### Предостережения
- Calculated формула предполагает absent unmeasured osmoles
- Pseudohyponatremia (hyperlipidemia, hyperproteinemia) — measured high но calc normal
- В neonates часто SI units (ммоль/л) — calc без unit conversion

### Связанные tools
- \`neo-fluid\` — fluid management по возрасту
- \`neo-abg\` — acid-base interpretation (anion gap)
- \`neo-gir\` — glucose infusion rate

### Источники
- Smellie WS. **BMJ 2007;334:701** — Plasma osmolality
- Bhargava M. **Pediatr Rev 2003;24:179** — Neonatal fluid balance
- КР МЗ РФ "Нарушения водно-электролитного обмена у н/р" (2024)
- Avery's Diseases of the Newborn 11th ed., ch 27
- Roberts JR. Pediatr Emerg Care 2009;25:734 — Propylene glycol toxicity neonates
`,
};

export default runner;
