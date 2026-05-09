/**
 * Runner: neo-ibuprofen-pda-dose — Ибупрофен для закрытия PDA
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Pharmacological PDA closure у preterm с hemodynamically significant
 * PDA (hsPDA). Ибупрофен — preferred agent (vs indomethacin) благодаря
 * меньшему влиянию на mesenteric / renal blood flow.
 *
 * Дозы (стандартный 3-day course):
 *   Day 1: 10 мг/кг IV
 *   Day 2: 5 мг/кг IV
 *   Day 3: 5 мг/кг IV
 *   (введение q24h)
 *
 * Альтернативный high-dose (early gestation < 27 нед):
 *   Day 1: 20 мг/кг IV
 *   Day 2: 10 мг/кг IV
 *   Day 3: 10 мг/кг IV
 *   (Hirt et al 2008 — у extreme preterm)
 *
 * PO course (если IV недоступен):
 *   Same dosing PO; bioavailability ~80%
 *
 * SOURCES:
 *   - Ohlsson A, Walia R, Shah SS. Cochrane PDA pharmacological closure 2020
 *   - Mitra S et al. JAMA 2018;319(12):1221 — comparative meta-analysis
 *   - Ohlsson A et al. Cochrane Ibuprofen vs Indomethacin 2020
 *   - Hirt D et al. Br J Clin Pharmacol 2008
 *   - КР МЗ РФ "Открытый артериальный проток у н/р" (2024)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Cochrane / JAMA Mitra 2018) · РФ',
  reference: 'Cochrane Ibuprofen for PDA 2020. Mitra S JAMA 2018;319:1221. Hirt Br J Clin Pharmacol 2008.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.4,
      max: 3,
      step: 0.01,
    },
    {
      id: 'day',
      label: 'День курса',
      type: 'select',
      options: [
        { value: '1', label: 'Day 1 (10 мг/кг standard / 20 мг/кг high)' },
        { value: '2', label: 'Day 2 (5 мг/кг standard / 10 мг/кг high)' },
        { value: '3', label: 'Day 3 (5 мг/кг standard / 10 мг/кг high)' },
      ],
    },
    {
      id: 'regimen',
      label: 'Режим',
      type: 'select',
      options: [
        { value: 'standard', label: 'Standard (10/5/5 мг/кг)' },
        { value: 'high', label: 'High-dose Hirt 2008 (20/10/10 мг/кг — < 27 нед)' },
      ],
    },
    {
      id: 'route',
      label: 'Путь',
      type: 'select',
      options: [
        { value: 'iv', label: 'IV (Pedea 5 мг/мл)' },
        { value: 'po', label: 'PO (suspension 100 мг/5 мл)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const day = Number(values.day ?? 1);
    const regimen = String(values.regimen ?? 'standard');
    const route = String(values.route ?? 'iv');

    if (w <= 0 || w > 3) {
      return { value: '—', interpretation: 'Введите массу 0.4-3 кг (для preterm)', color: '#9CA3AF', details: '' };
    }

    let dosePerKg = 0;
    if (regimen === 'high') {
      dosePerKg = day === 1 ? 20 : 10;
    } else {
      dosePerKg = day === 1 ? 10 : 5;
    }

    const total = w * dosePerKg;
    const conc = route === 'iv' ? 5 : 20; // 5 мг/мл (Pedea) или 20 мг/мл (suspension 100 мг/5 мл)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Ибупрофен: ${total.toFixed(1)} мг = ${vol.toFixed(2)} мл @ ${conc} мг/мл`);
    actions.push(`Day ${day}: ${dosePerKg} мг/кг × ${w} кг`);
    actions.push(`Путь: ${route === 'iv' ? 'IV slow infusion 15 мин' : 'PO через зонд'}`);
    actions.push(`Frequency: q24h × 3 дня total`);

    actions.push('--- Подтверждение перед инициированием ---');
    actions.push('Echo: PDA с lева→правый shunt + hemodynamic significance');
    actions.push('Hemodynamic significance: > 1.5 мм diameter, LA/Ao > 1.4, descending aorta diastolic flow reverse');
    actions.push('Возраст: ASAP (< 14 дней) для maximum closure rate');
    actions.push('Adequate hydration; нет concomitant NSAIDs');

    actions.push('--- Контраиндикации ---');
    actions.push('Active hemorrhage / тромбоцитопения < 50 × 10⁹/л');
    actions.push('NEC active / suspected');
    actions.push('Renal failure (Cr > 1.5 мг/дл, диурез < 1 мл/кг/ч за 8 ч)');
    actions.push('Sepsis active');
    actions.push('Right-to-left shunt (duct-dependent CHD)');
    actions.push('Coagulopathy (INR > 2.0 без anticoagulation)');

    actions.push('--- Мониторинг ---');
    actions.push('Echo через 24-48 ч после курса для оценки closure');
    actions.push('Cr / urea / диурез q24h (renal function)');
    actions.push('Тромбоциты, coag panel');
    actions.push('CBC (тромбоцитопения)');
    actions.push('Гликемия (особенно при glucose-restricted infants)');

    actions.push('--- Side effects ---');
    actions.push('Renal: oliguria, ↑ Cr (transient у 10-20 %)');
    actions.push('GI: NEC risk (~5-10 % при concomitant indomethacin/steroids)');
    actions.push('Hematologic: тромбоцитопения, кровотечение');
    actions.push('Hepatic: hyperbilirubinemia (displacement albumin binding)');
    actions.push('Pulmonary hypertension: уменьшает PVR, opposite effect indomethacin');

    actions.push('--- Если no closure ---');
    actions.push('Repeat course × 1 (50-70 % closure после 2 курсов)');
    actions.push('Surgical ligation если remains hsPDA + clinical signs');
    actions.push('Conservative management — также option (Conservative Treatment of PDA Trial — Bell 2011)');

    return {
      value: total.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: `Day ${day} ${regimen} — ${dosePerKg} мг/кг`,
      color: '#3B82F6',
      details: `${dosePerKg} мг/кг × ${w} кг = ${total.toFixed(1)} мг ${route.toUpperCase()} q24h.`,
      actions,
    };
  },
  caveats: [
    'Ибупрофен vs indomethacin: ибупрофен предпочтительнее (Mitra JAMA 2018) — меньше mesenteric / renal vasoconstriction',
    'Cochrane 2020: ibuprofen равноценен indomethacin для PDA closure, но меньше NEC и oliguria',
    'High-dose regimen (Hirt 2008): 20/10/10 у < 27 нед — повышает closure rate',
    'PO bioavailability ~80%; IV предпочтительно для первой dose в acute setting',
    'Conservative management — alternative для < 32 нед asymptomatic PDA (TIPP / BeNeDuctus trials suggest no benefit of pharm closure for non-hsPDA)',
    'Concomitant с hydrocortisone — повышает GI perforation risk в 5-10×',
    'Renal function — pre-dose check критично; oliguria за 24 ч → задержать следующую дозу',
    'Albumin displacement: caution при hyperbilirubinemia близкой к exchange threshold',
    'У ELBW < 750 g — surgical closure часто predпочтительна (low pharm response, complications)',
    'Furosemide concomitantly — НЕ рекомендуется (ибупрофен blunts furosemide effect)',
  ],
  related: [
    { id: 'neo-bili-2022', title: 'Bili-2022' },
    { id: 'neo-furosemide-dose', title: 'Furosemide н/р' },
    { id: 'neo-pge1-dose', title: 'PGE1 (для poддержания PDA)' },
    { id: 'neo-bell-nec', title: 'Bell NEC staging' },
  ],
  info: `### Ибупрофен — pharmacological PDA closure

Cyclooxygenase inhibitor для closure hemodynamically significant PDA
у preterm. Preferred над indomethacin.

### Дозы

#### Standard regimen (10/5/5)
| Day | Доза |
|---|---|
| 1 | 10 мг/кг IV q24h |
| 2 | 5 мг/кг IV q24h |
| 3 | 5 мг/кг IV q24h |

#### High-dose Hirt 2008 (для < 27 нед)
| Day | Доза |
|---|---|
| 1 | 20 мг/кг IV q24h |
| 2 | 10 мг/кг IV q24h |
| 3 | 10 мг/кг IV q24h |

### Hemodynamically significant PDA (hsPDA) — критерии

| Параметр | Значение |
|---|---|
| **Diameter** | > 1.5 мм |
| **LA/Ao ratio** | > 1.4 |
| **Descending aorta** | Diastolic flow reverse |
| **Pulse pressure** | ↑↑ |
| **Continuous murmur** | + |

### Противопоказания

- Active hemorrhage / тромбоцитопения < 50 × 10⁹/л
- NEC active / suspected
- Renal failure (Cr > 1.5 мг/дл, диурез < 1 мл/кг/ч)
- Sepsis active
- Right-to-left shunt (duct-dependent CHD)

### Сравнение agents

| | Ибупрофен | Indomethacin | Paracetamol |
|---|---|---|---|
| **Closure rate** | ~ 70 % | ~ 70 % | ~ 60 % |
| **Renal effect** | minimal | ↓ flow | none |
| **GI / NEC risk** | low | higher | minimal |
| **Pulmonary HTN** | ↓ | possible | none |
| **Hyperbilirubinemia** | + (displacement) | + | none |
| **Cost** | medium | low | low |
| **Reference** | Mitra JAMA 2018 | older | Allegaert 2014 |

### Conservative management (option)

#### Argument:
- > 70 % PDA spontaneously close by ~ 12 нед PMA
- Pharm closure не улучшает long-term outcomes (BPD, NEC, IVH, mortality)
- TIPP trial (Schmidt 2001): closure не улучшает death/disability
- BeNeDuctus trial (Hundscheid 2022 NEJM): conservative non-inferior

#### When to choose conservative:
- Asymptomatic PDA
- GA > 30 нед
- No hsPDA criteria

#### When pharm closure indicated:
- hsPDA + ИВЛ-dependence
- Persistent feeding intolerance
- IVH worsening
- < 28 нед symptomatic в первые 2 нед

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Oliguria | 10-20 % | Hold next dose if persistent |
| Тромбоцитопения | 5-10 % | Skip course если < 50 |
| Hyperbilirubinemia | 10-15 % | Лечение по AAP/NICE bili guidelines |
| NEC | 1-3 % | Stop, abx, NPO |
| Hepatic dysfunction | rare | Monitor LFT |

### Источники

- Ohlsson A, Walia R, Shah SS. Cochrane PDA pharm closure 2020
- Mitra S et al. JAMA 2018;319:1221 — meta-analysis
- Hirt D et al. Br J Clin Pharmacol 2008
- Hundscheid T et al. NEJM 2022;387:683 (BeNeDuctus)
- Schmidt B TIPP trial 2001
- КР МЗ РФ "Открытый артериальный проток" (2024)
`,
};

export default runner;
