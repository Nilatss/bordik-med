/**
 * Runner: neo-naloxone-dose — Налоксон (opioid antagonist)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * μ-receptor antagonist для reversal opioid-induced respiratory depression.
 * Standard dose 0.1 мг/кг IV/IM/IO при апноэ от maternal opioid exposure
 * или iatrogenic opioid overdose.
 *
 * Дозы:
 *   Standard reversal: 0.1 мг/кг IV/IM/IO/ETT
 *   Repeat q2-3 мин до 5 раз (short t½ 40-60 мин)
 *   Continuous infusion (если recurrent depression): 0.005-0.16 мг/кг/ч
 *
 * NB:
 *   - НЕ использовать в neonatal resuscitation routinely (NRP 8 ed. изменили)
 *   - Routine use removed from NRP — оценить на indication only
 *   - У newborns of opioid-dependent matери — CONTRAINDICATED (precipitates withdrawal)
 *
 * SOURCES:
 *   - NRP 8 ed. 2021 — Naloxone removed from routine use
 *   - AAP CFN 2014 — Naloxone use in neonates
 *   - Hudak ML, Tan RC. AAP NAS Pediatrics 2012
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Реанимация новорождённых" (2024)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NRP 8 ed. / AAP CFN) · РФ',
  reference: 'NRP 8 ed. 2021. AAP CFN 2014. Hudak/Tan AAP 2012. NeoFax. КР МЗ РФ.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.4,
      max: 5,
      step: 0.01,
    },
    {
      id: 'mode',
      label: 'Режим',
      type: 'select',
      options: [
        { value: 'iv', label: 'IV bolus 0.1 мг/кг (стандарт)' },
        { value: 'im', label: 'IM 0.1 мг/кг (если IV недоступен)' },
        { value: 'io', label: 'IO 0.1 мг/кг (intra-osseous)' },
        { value: 'ett', label: 'ETT 0.1-0.2 мг/кг (если уже интубирован)' },
        { value: 'inf_low', label: 'Infusion 0.005 мг/кг/ч (low maintenance)' },
        { value: 'inf_med', label: 'Infusion 0.04 мг/кг/ч (стандарт)' },
        { value: 'inf_high', label: 'Infusion 0.16 мг/кг/ч (high maintenance)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'iv');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type NaloxoneMode = { perKg: number; route: string; freq: string; isInfusion: boolean; label: string };
    const modes: Record<string, NaloxoneMode> = {
      iv: { perKg: 0.1, route: 'IV slow push', freq: 'q2-3 мин (max 5 повторов)', isInfusion: false, label: 'IV bolus standard' },
      im: { perKg: 0.1, route: 'IM (если IV недоступен)', freq: 'однократно', isInfusion: false, label: 'IM bolus' },
      io: { perKg: 0.1, route: 'IO intra-osseous', freq: 'q2-3 мин', isInfusion: false, label: 'IO bolus' },
      ett: { perKg: 0.2, route: 'ETT (через эндотрахеальную трубку)', freq: 'q2-3 мин', isInfusion: false, label: 'ETT bolus' },
      inf_low: { perKg: 0.005, route: 'IV continuous', freq: '/ч', isInfusion: true, label: 'Infusion low' },
      inf_med: { perKg: 0.04, route: 'IV continuous', freq: '/ч', isInfusion: true, label: 'Infusion standard' },
      inf_high: { perKg: 0.16, route: 'IV continuous', freq: '/ч', isInfusion: true, label: 'Infusion high' },
    };
    const m = modes[mode] ?? modes.iv;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    const conc = 0.4; // 0.4 мг/мл стандартный (1 мг/2.5 мл vials)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Налоксон: ${total.toFixed(3)} мг${m.isInfusion ? '/ч' : ''} = ${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''} @ 0.4 мг/мл`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    actions.push('--- ⚠️ NRP 8 ed. изменения ---');
    actions.push('Налоксон УДАЛЁН из routine NRP algorithm (с NRP 7 ed.)');
    actions.push('Reasoning: рандомизированные исследования НЕ показали benefit у newborn resuscitation');
    actions.push('Use ONLY на indication (true opioid-induced respiratory depression)');

    actions.push('--- Показания ---');
    actions.push('Apnea / respiratory depression у newborn от:');
    actions.push('  - Maternal opioids during labor (особенно morphine, meperidine, < 4 ч до родов)');
    actions.push('  - Iatrogenic neonatal opioid overdose');
    actions.push('После adequate ventilation (PPV) — если apnea persists с pinpoint pupils');

    actions.push('--- ПРОТИВОПОКАЗАНИЯ ---');
    actions.push('⚠️ Newborns of opioid-DEPENDENT matери — precipitates withdrawal seizures');
    actions.push('Если матери на methadone, buprenorphine, chronic opioids → НЕ использовать');
    actions.push('Если sympotms NAS — НЕ использовать (treat NAS instead)');

    if (m.isInfusion) {
      actions.push('--- Continuous infusion ---');
      actions.push('При recurrent respiratory depression (long-acting opioid maternal exposure)');
      actions.push('Onset infusion: continuous; effect dependent на rate');
      actions.push('Wean по recurrence sympotms; обычно 4-12 ч infusion enough');
    } else {
      actions.push('--- Bolus reversal ---');
      actions.push('Onset: 1-2 мин IV; peak 5-15 мин; t½ 40-60 мин');
      actions.push('Repeat q2-3 мин до 5 раз — short t½ означает recurrence opioid effect');
      actions.push('Если no response после 5 доз — alternative diagnosis (asphyxia, sepsis, congenital)');
    }

    actions.push('--- Мониторинг ---');
    actions.push('Continuous: SpO₂, ЧСС, RR, level of consciousness');
    actions.push('Готовность к ИВЛ если no response');
    actions.push('Heart rate: tachycardia ожидаемая при reversal; bradycardia atypical');

    actions.push('--- Side effects ---');
    actions.push('Withdrawal symptoms у opioid-dependent newborns (judorги, ажитация)');
    actions.push('Acute pulmonary edema (rare, у adults — описано у newborn rarely)');
    actions.push('Тахикардия, гипертензия (catecholamine surge)');
    actions.push('Resedation после wear-off (при long-acting opioid maternal source)');

    return {
      value: total.toFixed(3),
      unit: `мг${m.isInfusion ? '/ч' : ''} (${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''})`,
      interpretation: m.label,
      color: '#3B82F6',
      details: `${m.perKg} мг/кг${m.isInfusion ? '/ч' : ''} × ${w} кг = ${total.toFixed(3)} мг${m.isInfusion ? '/ч' : ''}.`,
      actions,
    };
  },
  caveats: [
    'NRP 8 ed. removed naloxone from routine resuscitation — use ONLY на indication',
    'Adequate ventilation (PPV) — first; naloxone не replaces respiratory support',
    'Maternal opioid history MUST be checked: if dependent → НЕ использовать (withdrawal seizures)',
    'Repeat q2-3 мин до 5 раз; если no response — alternative diagnosis',
    'Long-acting maternal opioids (methadone t½ ~ 24 ч) — recurrence after naloxone wear-off; consider infusion',
    'Pulmonary edema rare у н/р, but described — caution',
    'НЕ использовать в asphyxia (no benefit, может worsen outcome)',
    'У NAS sympotms — НЕ давать (treat NAS instead)',
    'IV preferred; ETT less reliable absorption (× 2 dose); IM/IO acceptable если no IV',
    'Tachycardia / hypertension expected; bradycardia atypical (другая причина)',
  ],
  related: [
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
    { id: 'neo-morphine-dose', title: 'Морфин н/р' },
    { id: 'neo-fentanyl-dose', title: 'Фентанил н/р' },
    { id: 'neo-finnegan', title: 'Modified Finnegan (NAS)' },
  ],
  info: `### Налоксон у новорождённых

μ-opioid receptor antagonist для reversal opioid-induced respiratory
depression.

⚠️ **NRP 8 ed. (2021):** Naloxone REMOVED from routine algorithm.
Use ONLY на specific indication.

### Дозы

| Mode | Доза | Frequency |
|---|---|---|
| **IV bolus** | 0.1 мг/кг | q2-3 мин до 5 повторов |
| IM | 0.1 мг/кг | однократно |
| IO | 0.1 мг/кг | q2-3 мин |
| ETT | 0.1-0.2 мг/кг (× 2 absorption) | q2-3 мин |
| Continuous low | 0.005 мг/кг/ч | maintenance |
| **Continuous standard** | **0.04 мг/кг/ч** | recurrent depression |
| Continuous high | 0.16 мг/кг/ч | severe |

### Показания (post-NRP 8 ed.)

#### YES — use:
- Apnea + pinpoint pupils + maternal opioids < 4 ч intrapartum
- Iatrogenic neonatal opioid overdose
- After adequate PPV ventilation if persistent depression

#### NO — DO NOT use:
- ⚠️ **Maternal opioid-dependent** — precipitates withdrawal seizures
- Maternal methadone / buprenorphine / chronic opioid use
- NAS симптомы (treat NAS instead)
- Asphyxia без opioid history
- "Just in case" routine resuscitation

### NRP 8 ed. rationale

Randomized studies НЕ показали naloxone benefit в neonatal
resuscitation:
- Same long-term outcomes
- Может precipitate withdrawal в exposed
- Adequate ventilation — primary intervention

### Algorithm post-NRP 8

1. **Adequate PPV** ventilation
2. If apnea persists + maternal opioids < 4 ч + NOT dependent:
3. **Naloxone 0.1 мг/кг IV/IM**
4. Repeat q2-3 мин (max 5 повторов)
5. If no response — alternative diagnosis (asphyxia, sepsis, CHD)
6. Continued ventilation as needed
7. Long-acting maternal opioid → consider infusion 0.04 мг/кг/ч

### Pharmacokinetics

| Параметр | Value |
|---|---|
| **Onset IV** | 1-2 мин |
| **Peak** | 5-15 мин |
| **t½** | 40-60 мин |
| **Duration** | 30-90 мин |

⚠️ **t½ значительно короче чем у opioid (особенно methadone, fentanyl
infusion) → recurrence after wear-off → may need infusion.**

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Withdrawal seizures | у dependent | DO NOT USE |
| Pulmonary edema | rare | Supportive |
| Тахикардия / АГ | expected | Self-limiting |
| Resedation | long-acting opioid | Consider infusion |

### Источники

- NRP 8 ed. 2021 — Naloxone removal rationale
- AAP CFN 2014 — Use in neonates
- Hudak ML, Tan RC. AAP NAS Pediatrics 2012
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- КР МЗ РФ "Реанимация новорождённых" (2024)
`,
};

export default runner;
