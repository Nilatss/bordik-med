/**
 * Runner: neo-fentanyl-dose — Фентанил (анальгезия / седация)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Расчёт дозы фентанила для анальгезии и седации у новорождённых на ИВЛ.
 * Synthetic opioid, ~ 75-125× более potent чем morphine.
 *
 * SOURCES:
 *   - AAP CFN 2016 — Pain Assessment & Management
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - BNFc
 *   - КР МЗ РФ "Боль у новорождённых" (2024)
 *   - Anand KJS et al. NEOPAIN trial (NEJM 2003)
 *   - Hall RW et al. — Cochrane opioids in NICU (2017)
 *
 * Дозы:
 *   Болюс (анальгезия / премедикация):
 *     - 0.5-2 мкг/кг IV slow push (1-2 мин)
 *     - Pre-procedure: 1-2 мкг/кг 5-10 мин до
 *     - Pre-LISA: 1-2 мкг/кг (controversial — risk apnea)
 *
 *   Continuous infusion (sedation/analgesia на ИВЛ):
 *     - 0.5-2 мкг/кг/ч (диапазон 1-5 в тяжёлых случаях)
 *     - Толерантность развивается через 3-5 дней — ↑ доза
 *     - Tapering: ↓ 10-20 % q6-12h при weaning
 *
 *   Procedural sedation: 1-3 мкг/кг IV (max 5)
 *
 * Concentration:
 *   Стандартный 50 мкг/мл; для н/р развести до 10-12.5 мкг/мл
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP CFN / NeoFax / BNFc) · РФ',
  reference: 'AAP CFN 2016. NeoFax. Anand KJS NEOPAIN NEJM 2003. КР МЗ РФ "Боль у н/р" 2024.',
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
      label: 'Режим введения',
      type: 'select',
      options: [
        { value: 'bolus_low', label: 'Болюс низкий (0.5 мкг/кг)' },
        { value: 'bolus_med', label: 'Болюс стандартный (1 мкг/кг)' },
        { value: 'bolus_high', label: 'Болюс высокий (2 мкг/кг, premedication / procedure)' },
        { value: 'inf_low', label: 'Инфузия 0.5 мкг/кг/ч' },
        { value: 'inf_med', label: 'Инфузия 1 мкг/кг/ч (стандарт)' },
        { value: 'inf_high', label: 'Инфузия 2 мкг/кг/ч (тяжёлая боль)' },
        { value: 'inf_max', label: 'Инфузия 4 мкг/кг/ч (с толерантностью)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'bolus_med');

    if (w <= 0 || w > 5) {
      return {
        value: '—',
        interpretation: 'Введите массу 0.4-5 кг',
        color: '#9CA3AF',
        details: '',
      };
    }

    const modes: Record<string, { perKg: number; isInfusion: boolean; label: string }> = {
      bolus_low: { perKg: 0.5, isInfusion: false, label: 'Болюс низкий' },
      bolus_med: { perKg: 1, isInfusion: false, label: 'Болюс стандартный' },
      bolus_high: { perKg: 2, isInfusion: false, label: 'Болюс высокий' },
      inf_low: { perKg: 0.5, isInfusion: true, label: 'Инфузия низкая' },
      inf_med: { perKg: 1, isInfusion: true, label: 'Инфузия стандартная' },
      inf_high: { perKg: 2, isInfusion: true, label: 'Инфузия высокая' },
      inf_max: { perKg: 4, isInfusion: true, label: 'Инфузия max (tolerance)' },
    };
    const m = modes[mode] ?? modes.bolus_med;
    if (!m) {
      return {
        value: '—',
        interpretation: 'Неизвестный режим',
        color: '#9CA3AF',
        details: '',
      };
    }
    const total = w * m.perKg;
    // Diluted concentration for safer NICU use: 10 мкг/мл (0.5 мл of 50 мкг/мл fentanyl + 1.5 мл NS = 10 мкг/мл)
    const conc = 10; // мкг/мл (диluted)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Фентанил: ${total.toFixed(1)} мкг = ${vol.toFixed(2)} мл @ 10 мкг/мл (diluted)`);
    actions.push(`Доза: ${m.perKg} мкг/кг${m.isInfusion ? '/ч (continuous)' : ' (болюс)'}`);

    if (m.isInfusion) {
      actions.push(`Инфузия: ${vol.toFixed(2)} мл/ч @ 10 мкг/мл (или ${(vol / 5).toFixed(3)} мл/ч @ 50 мкг/мл undiluted)`);
      actions.push('Bone of attention при start: peak effect через 4-5 мин (быстрее morphine)');
      actions.push('Steady state через 4-6 t½: толерантность развивается за 3-5 дней');
    } else {
      actions.push('IV slow push 1-2 мин (НЕ rapid push — chest wall rigidity)');
      actions.push('Onset: 1-2 мин IV; peak 4-5 мин; t½ ≈ 5-30 ч у н/р (vs 2-4 у взрослых)');
    }

    actions.push('--- Мониторинг ---');
    actions.push('Пульсоксиметрия continuous; готовность к ИВЛ (apnea, ↓ RR)');
    actions.push('Артериальное давление (vasodilation, hypotension)');
    actions.push('Работа дыхания (chest wall rigidity при rapid push — может потребовать налоксона / релаксанта)');
    actions.push('NIPS / N-PASS / PIPP-R q1-2h до titration efficacy');

    actions.push('--- Side effects ---');
    actions.push('Apnea, гипотензия, bradycardia');
    actions.push('Chest wall rigidity (особенно > 5 мкг/кг IV) — может потребовать suxamethonium / naloxone');
    actions.push('Гastrointestinal: ileus, paralytic reduce GI motility');
    actions.push('Tolerance после 3-5 дней инфузии — повышение дозы до 4-5 мкг/кг/ч');
    actions.push('Withdrawal при abrupt stop > 5 дней — taper 10-20 % q6-12h');

    actions.push('--- Antagonist ---');
    actions.push('Налоксон 0.01 мг/кг IV (могут потребоваться повторные дозы — short t½ налоксона)');
    actions.push('Caution: реверс анальгезии у длительно седированных может вызвать withdrawal seizures');

    return {
      value: total.toFixed(1),
      unit: m.isInfusion ? `мкг/ч (${vol.toFixed(2)} мл/ч @ 10 мкг/мл)` : `мкг (${vol.toFixed(2)} мл)`,
      interpretation: `${m.label} (${m.perKg} мкг/кг${m.isInfusion ? '/ч' : ''})`,
      color: '#8B5CF6',
      details: `${m.perKg} мкг/кг${m.isInfusion ? '/ч' : ''} × ${w} кг = ${total.toFixed(1)} мкг${m.isInfusion ? '/ч' : ''}.`,
      actions,
    };
  },
  caveats: [
    'Фентанил ~ 75-125× более potent чем morphine (1 мкг fentanyl ≈ 0.1 мг morphine)',
    'Onset быстрее morphine (1-2 мин vs 5-10 мин IV) — preferred для acute pain',
    'Half-life у н/р удлинён 5-30 ч (vs 2-4 ч у взрослых) — accumulation возможна',
    'Chest wall rigidity при rapid push (> 5 мкг/кг IV) — характерный side effect; suxamethonium / naloxone',
    'Меньше histamine release vs morphine — preferred у hemodynamically unstable',
    'Толерантность (3-5 дней) и withdrawal (> 5 дней usage) — taper 10-20 % q6-12h',
    'NEOPAIN trial (Anand 2003): morphine routine у preterm IVH/death rates similar — pain management individualized',
    'У ECMO patients: dose adjustment + 30-50 % (binding to circuit, increased Vd)',
    'Cocaine drug screen: не cross-react (vs morphine — opioid screen positive)',
    'У PMA < 28 нед: дольше t½, redusee dose 25-50 %, увеличить interval',
  ],
  related: [
    { id: 'neo-pipp-r', title: 'PIPP-R боль преэрм' },
    { id: 'neo-npass', title: 'N-PASS боль + sedation' },
    { id: 'neo-nips', title: 'NIPS боль термин' },
    { id: 'neo-finnegan', title: 'Modified Finnegan (NAS)' },
  ],
  info: `### Фентанил — analgesia / sedation у новорождённых

Synthetic opioid, ~75-125× более potent чем morphine. Standard для
анальгезии/седации на ИВЛ и procedural pain в NICU.

### Дозы

#### Болюс
| Mode | Доза | Применение |
|---|---|---|
| Низкий | 0.5 мкг/кг | Mild pain |
| Стандартный | 1 мкг/кг | Procedure / pre-LISA |
| Высокий | 2 мкг/кг | Significant procedure |

#### Continuous infusion
| Уровень | Скорость | Применение |
|---|---|---|
| Low | 0.5 мкг/кг/ч | Mild sedation |
| Standard | 1 мкг/кг/ч | На ИВЛ |
| High | 2 мкг/кг/ч | Тяжёлая боль |
| Max | 4-5 мкг/кг/ч | С толерантностью |

### PK у новорождённых

| Параметр | Term | Preterm | Adult |
|---|---|---|---|
| **Onset IV** | 1-2 мин | 1-2 мин | 1-2 мин |
| **Peak** | 4-5 мин | 4-5 мин | 4-5 мин |
| **t½** | 5-15 ч | 10-30 ч | 2-4 ч |
| **Vd** | ↑ vs adult | ↑↑ vs adult | norm |

### Сравнение с morphine

| | Fentanyl | Morphine |
|---|---|---|
| **Potency** | × 75-125 stronger | baseline |
| **Onset IV** | 1-2 мин | 5-10 мин |
| **t½** | 5-30 ч н/р | 6-12 ч н/р |
| **Histamine release** | minimal | ↑↑ (hypotension) |
| **Hemodynamic** | stable | ↓ BP at high dose |
| **Chest wall rigidity** | + (при rapid push) | rare |
| **Cost** | ↑↑ | ↓ |
| **Tolerance** | быстрее (3-5 d) | 5-7 d |

### Side effects

| Effect | Mechanism | Management |
|---|---|---|
| Apnea / bradypnea | μ-receptor | Bag-mask, naloxone |
| Hypotension | sympatholytic | Volume, vasopressors |
| Chest wall rigidity | rapid push | Suxamethonium / naloxone |
| Tolerance | receptor desensitization | ↑ dose / rotate to morphine |
| Withdrawal | abrupt stop > 5 d | Taper 10-20 % q6-12h |
| GI ileus | μ on gut | Avoid prolonged use |

### Antidote

- **Naloxone 0.01 мг/кг IV/IO/IM** (может повторять)
- Caution: short t½ налоксона (40 мин) — repeat dose / infusion
- Reversal в long-term opioid → withdrawal с judorgами

### Tolerance + withdrawal protocol

Tolerance: после 3-5 дней инфузии — снижение эффективности
- Solution: ↑ dose to 4-5 мкг/кг/ч ИЛИ rotate to morphine

Withdrawal (> 5 дней usage): tapering
- Reduce dose 10-20 % q6-12h
- Mark with mFNAS / Finnegan для оценки симптомов
- Adjuvants: clonidine 1-2 мкг/кг q4-6h при severe withdrawal

### Источники

- AAP CFN 2016 — Pain Assessment & Management
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- Anand KJS et al. NEOPAIN trial (NEJM 2003)
- Hall RW et al. — Cochrane opioids in NICU (2017)
- КР МЗ РФ "Боль у новорождённых" (2024)
`,
};

export default runner;
