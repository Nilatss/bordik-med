/**
 * Runner: neo-morphine-dose — Морфин (analgesia / sedation / NAS treatment)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * SOURCES:
 *   - AAP CFN 2016 — Pain Assessment & Management
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - BNFc
 *   - Hudak ML, Tan RC. AAP NAS Pediatrics 2012;129:e540
 *   - Anand KJS NEOPAIN trial NEJM 2003
 *   - КР МЗ РФ "Боль у новорождённых" / "НАС" (2024)
 *
 * Дозы:
 *   IV болюс (acute pain): 0.05-0.1 мг/кг slow push 3-5 мин q4-6h
 *   IV continuous infusion (sedation на ИВЛ): 10-20 мкг/кг/ч (range 5-30)
 *   PO (NAS treatment): 0.04-0.08 мг/кг q3-4h, ↑ по mFNAS protocol
 *     Maximum: 0.2 мг/кг q3h при resistant withdrawal
 *
 * NAS Tapering:
 *   После 24-48 ч stable scoring (mFNAS < 8), снижение 10 % q24h
 *   Полное прекращение когда доза < 0.024 мг/кг q3h
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / NeoFax / BNFc) · РФ',
  reference: 'AAP CFN 2016. NeoFax. Hudak/Tan AAP 2012. Anand NEOPAIN NEJM 2003.',
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
        { value: 'iv_low', label: 'IV болюс 0.05 мг/кг q4-6h (лёгкая боль)' },
        { value: 'iv_med', label: 'IV болюс 0.1 мг/кг q4-6h (стандартный)' },
        { value: 'inf_low', label: 'Инфузия 10 мкг/кг/ч (лёгкая седация)' },
        { value: 'inf_med', label: 'Инфузия 20 мкг/кг/ч (стандарт)' },
        { value: 'inf_high', label: 'Инфузия 30 мкг/кг/ч (тяжёлая боль / толерантность)' },
        { value: 'nas_low', label: 'NAS PO 0.04 мг/кг q3-4h' },
        { value: 'nas_med', label: 'NAS PO 0.08 мг/кг q3-4h' },
        { value: 'nas_high', label: 'NAS PO 0.16 мг/кг q3h (resistant)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'iv_med');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    const modes: Record<string, { perKg: number; route: string; freq: string; isInfusion: boolean; label: string; isMcg?: boolean }> = {
      iv_low: { perKg: 0.05, route: 'IV slow push 3-5 мин', freq: 'q4-6h', isInfusion: false, label: 'IV болюс лёгкий' },
      iv_med: { perKg: 0.1, route: 'IV slow push 3-5 мин', freq: 'q4-6h', isInfusion: false, label: 'IV болюс стандартный' },
      inf_low: { perKg: 10, route: 'IV continuous', freq: '/ч', isInfusion: true, label: 'Инфузия лёгкая', isMcg: true },
      inf_med: { perKg: 20, route: 'IV continuous', freq: '/ч', isInfusion: true, label: 'Инфузия стандартная', isMcg: true },
      inf_high: { perKg: 30, route: 'IV continuous', freq: '/ч', isInfusion: true, label: 'Инфузия высокая', isMcg: true },
      nas_low: { perKg: 0.04, route: 'PO через зонд', freq: 'q3-4h', isInfusion: false, label: 'NAS PO низкая' },
      nas_med: { perKg: 0.08, route: 'PO через зонд', freq: 'q3-4h', isInfusion: false, label: 'NAS PO стандарт' },
      nas_high: { perKg: 0.16, route: 'PO через зонд', freq: 'q3h', isInfusion: false, label: 'NAS PO resistant' },
    };
    const m = modes[mode] ?? modes.iv_med;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    const conc = m.isMcg ? 100 : 1; // мг/мл стандартный для морфина (1 мг/мл) или мкг/мл для diluted infusion
    const vol = m.isMcg ? total / conc : total / conc; // вычислили объём независимо

    const actions: string[] = [];
    const unit = m.isMcg ? 'мкг' : 'мг';
    const concLabel = m.isMcg ? '100 мкг/мл (diluted)' : '1 мг/мл (стандарт ампула)';
    actions.push(`Морфин: ${total.toFixed(m.isMcg ? 1 : 3)} ${unit}${m.isInfusion ? '/ч' : ''} = ${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''} @ ${concLabel}`);
    actions.push(`Доза: ${m.perKg} ${unit}/кг ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    if (m.isInfusion) {
      actions.push('IV continuous: titrate по NIPS/PIPP-R/N-PASS до целевой anaальgesia');
      actions.push('Onset: 5-10 мин IV; peak 20-30 мин; t½ 6-12 ч у н/р');
      actions.push('Толерантность через 5-7 дней — повышение / rotate to fentanyl');
    } else if (mode.startsWith('nas')) {
      actions.push('NAS treatment: оценка mFNAS q3-4h после кормления');
      actions.push('Старт при 3 последовательных mFNAS ≥ 8 ИЛИ 2 ≥ 12');
      actions.push('Tapering: после 24-48 ч stable (mFNAS < 8) → ↓ 10 % q24h');
      actions.push('Полное прекращение: доза < 0.024 мг/кг q3h');
      actions.push('Адъювант: клонидин 1-2 мкг/кг q4-6h при тяжёлой автономной симптоматике');
    } else {
      actions.push('IV slow push 3-5 мин (rapid push → histamine release, hypotension)');
      actions.push('Onset 5-10 мин IV; peak 20-30 мин; duration 3-5 ч');
    }

    actions.push('--- Мониторинг ---');
    actions.push('Continuous SpO₂, ЧСС; готовность к ИВЛ (apnea возможна)');
    actions.push('АД (vasodilation, hypotension)');
    actions.push('Pain assessment: NIPS / PIPP-R / N-PASS / mFNAS (NAS)');

    actions.push('--- Side effects ---');
    actions.push('Apnea / гипотензия / bradycardia');
    actions.push('Histamine release: flushing, бронхоspasm (rare)');
    actions.push('Constipation, urinary retention');
    actions.push('Tolerance через 5-7 дней; withdrawal при abrupt stop');

    actions.push('--- Antagonist ---');
    actions.push('Налоксон 0.01 мг/кг IV (повторять — short t½)');
    actions.push('Caution: реверс анальгезии у dependent newborns → withdrawal seizures');

    return {
      value: total.toFixed(m.isMcg ? 1 : 3),
      unit: `${unit}${m.isInfusion ? '/ч' : ''} (${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''})`,
      interpretation: `${m.label} (${m.perKg} ${unit}/кг ${m.freq})`,
      color: '#8B5CF6',
      details: `${m.perKg} ${unit}/кг${m.isInfusion ? '/ч' : ''} × ${w} кг = ${total.toFixed(m.isMcg ? 1 : 3)} ${unit}${m.isInfusion ? '/ч' : ''}.`,
      actions,
    };
  },
  caveats: [
    'Morphine vs fentanyl: больше hypotension (histamine release) → у unstable patients предпочтителен fentanyl',
    'NAS — first-line PO morphine для opioid abstinence (Hudak/Tan AAP 2012)',
    'NEOPAIN trial: routine morphine у preterm не улучшает outcomes (IVH/death rates similar) — pain management individualized',
    'Tolerance через 5-7 дней — повышение/rotation; withdrawal при > 5 дней usage (taper 10-20% q24h)',
    'У ELBW < 1000 г: redusee dose 25-50%, увеличить interval (slower clearance)',
    'Half-life у н/р удлинён: term 6-12 ч; preterm 9-15 ч (vs 2-4 ч adults)',
    'ESC (Eat-Sleep-Console) NEJM 2023 — функциональная альтернатива morphine для NAS, снижает usage и LOS',
    'Совместимость: 0.9% NaCl, 5% glucose, lipid emulsion; НЕСОВМЕСТИМО с phenobarbital, furosemide, NaHCO₃',
  ],
  related: [
    { id: 'neo-fentanyl-dose', title: 'Фентанил н/р' },
    { id: 'neo-finnegan', title: 'Modified Finnegan (NAS)' },
    { id: 'neo-pipp-r', title: 'PIPP-R боль преэрм' },
    { id: 'neo-nips', title: 'NIPS боль термин' },
  ],
  info: `### Морфин — analgesia / NAS у новорождённых

Базовый opioid; стандарт для NAS treatment + IV analgesia на ИВЛ.

### Дозы

#### IV для analgesia/sedation
| Mode | Доза | Применение |
|---|---|---|
| Болюс лёгкий | 0.05 мг/кг q4-6h | Mild pain |
| Болюс стандарт | 0.1 мг/кг q4-6h | Standard analgesia |
| Инфузия низкая | 10 мкг/кг/ч | Light sedation |
| Инфузия стандарт | 20 мкг/кг/ч | На ИВЛ |
| Инфузия высокая | 30 мкг/кг/ч | Тяжёлая боль / tolerance |

#### PO для NAS (Modified Finnegan ≥ 8/12 trigger)
| Уровень | Доза |
|---|---|
| Низкая | 0.04 мг/кг q3-4h |
| Стандартная | 0.08 мг/кг q3-4h |
| Resistant | 0.16 мг/кг q3h |

### NAS treatment protocol (AAP 2012)

1. **Trigger:** 3 последовательных mFNAS ≥ 8 ИЛИ 2 ≥ 12
2. **Initial dose:** 0.04-0.08 мг/кг q3-4h PO
3. **Titration:** ↑ 10-20% q24h до mFNAS < 8 stable × 24 ч
4. **Adjuvant:** clonidine 1-2 мкг/кг q4-6h при autonomic симптомах
5. **Tapering:** ↓ 10% q24h после 48 ч stable
6. **Прекращение:** при дозе < 0.024 мг/кг q3h
7. **Continued mFNAS:** до 24-48 ч после стопа

### PK у новорождённых

| Параметр | Term | Preterm | Adult |
|---|---|---|---|
| **Onset IV** | 5-10 мин | 5-10 мин | 5-10 мин |
| **Peak** | 20-30 мин | 20-30 мин | 20-30 мин |
| **t½** | 6-12 ч | 9-15 ч | 2-4 ч |

### Сравнение с fentanyl

| | Morphine | Fentanyl |
|---|---|---|
| **Potency** | 1× | 75-125× |
| **Onset IV** | 5-10 мин | 1-2 мин |
| **Histamine release** | + (hypotension) | minimal |
| **Hemodynamic** | ↓ BP | stable |
| **Cost** | ↓ | ↑↑ |
| **NAS use** | first-line PO | rarely |
| **Tolerance** | 5-7 d | 3-5 d |

### NEOPAIN (Anand 2003 NEJM)

Routine morphine infusion у preterm на ИВЛ vs placebo:
- Не уменьшает IVH или death rate
- Pain management individualized — не routine

### Antidote

- **Naloxone 0.01 мг/кг IV** (повторять q2-3 мин)
- Caution: dependent newborns — withdrawal seizures

### Источники

- AAP CFN 2016 — Pain Assessment & Management
- Hudak ML, Tan RC. AAP NAS Pediatrics 2012;129:e540
- Anand KJS NEOPAIN trial NEJM 2003
- ESC trial NEJM 2023
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Боль у н/р" / "НАС" (2024)
`,
};

export default runner;
