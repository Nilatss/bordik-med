/**
 * Runner: neo-pge1-dose — Простагландин E1 (alprostadil) — duct-dependent ВПС
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Расчёт дозы простагландина E1 (alprostadil) для поддержания открытого
 * артериального протока (PDA) у новорождённых с duct-dependent
 * congenital heart disease (CHD).
 *
 * Показания:
 *   - Cyanotic CHD: TGA (без VSD), Pulmonary atresia, Tricuspid atresia,
 *     Severe TOF, Critical pulmonary stenosis
 *   - Left-sided obstructive: HLHS, Critical aortic stenosis,
 *     Coarctation, Interrupted aortic arch
 *
 * Дозы:
 *   Стандарт: 0.05-0.1 мкг/кг/мин IV continuous infusion
 *   Low-dose: 0.01-0.03 мкг/кг/мин (если PDA уже частично открыт + side effects)
 *   Initial response: обычно через 10-30 мин (PaO₂ ↑ для cyanotic; pulses
 *     improvement для obstructive)
 *
 * SOURCES:
 *   - AAP / AHA Statement on CHD management 2018
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - BNFc
 *   - КР МЗ РФ "Врождённые пороки сердца у н/р" (2024)
 *   - Akkinapally S et al. Cochrane PGE1 for ductal-dependent CHD 2018
 *   - Lim DS et al. Pediatr Cardiol 2003 — high vs low dose PGE1
 *
 * Side effects:
 *   - Apnea (10-30 % при > 0.05 мкг/кг/мин) — готовность к ИВЛ
 *   - Hypotension (vasodilation)
 *   - Гипертермия / fever (pyrogenic)
 *   - Cortical hyperostosis (long-term, > 7 дней)
 *   - Гипогликемия (транзиторная)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / AHA / NeoFax) · РФ',
  reference: 'AAP/AHA CHD 2018. NeoFax. Akkinapally S Cochrane 2018. КР МЗ РФ ВПС н/р 2024.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 1,
      max: 5,
      step: 0.01,
    },
    {
      id: 'rate',
      label: 'Скорость инфузии (мкг/кг/мин)',
      type: 'select',
      options: [
        { value: '0.01', label: '0.01 (very low — maintenance after PDA opened)' },
        { value: '0.025', label: '0.025 (low — частично открыт PDA)' },
        { value: '0.05', label: '0.05 (стандарт initial)' },
        { value: '0.075', label: '0.075 (med-high)' },
        { value: '0.1', label: '0.1 (high — severe duct closure)' },
      ],
    },
    {
      id: 'concentration',
      label: 'Концентрация раствора',
      type: 'select',
      options: [
        { value: '5', label: '5 мкг/мл (standard NICU dilution: 0.5 мг alprostadil + 100 мл D5W)' },
        { value: '10', label: '10 мкг/мл (high-conc: 0.5 мг + 50 мл D5W)' },
        { value: '20', label: '20 мкг/мл (very high-conc: 0.5 мг + 25 мл D5W)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const rate = Number(values.rate ?? 0.05);
    const conc = Number(values.concentration ?? 5);

    if (w <= 0 || w > 5) {
      return {
        value: '—',
        interpretation: 'Введите массу 1-5 кг',
        color: '#9CA3AF',
        details: '',
      };
    }

    // мкг/кг/мин × кг = мкг/мин
    // мкг/мин ÷ мкг/мл = мл/мин
    // мл/мин × 60 = мл/ч
    const microPerMin = rate * w;
    const microPerHour = microPerMin * 60;
    const mlPerHour = microPerMin / conc * 60;

    const actions: string[] = [];
    actions.push(`PGE1 (alprostadil) infusion: ${microPerMin.toFixed(3)} мкг/мин = ${microPerHour.toFixed(1)} мкг/ч`);
    actions.push(`Скорость инфузии: ${mlPerHour.toFixed(2)} мл/ч @ ${conc} мкг/мл`);
    actions.push(`Доза: ${rate} мкг/кг/мин × ${w} кг`);

    actions.push('--- Подготовка раствора ---');
    if (conc === 5) {
      actions.push('Стандарт: 0.5 мг alprostadil + 100 мл D5W = 5 мкг/мл');
    } else if (conc === 10) {
      actions.push('High-conc: 0.5 мг alprostadil + 50 мл D5W = 10 мкг/мл (для maintenance restricted volume)');
    } else {
      actions.push('Very high-conc: 0.5 мг + 25 мл D5W = 20 мкг/мл (severe fluid restriction)');
    }
    actions.push('Stable 24 ч @ 25°C; D5W или 0.9 % NaCl;НЕ свет');
    actions.push('Доступ: central preferred (UVC) — irritant; peripheral допустимо для start');

    actions.push('--- Мониторинг ---');
    actions.push('Continuous: ЧСС, SpO₂ (4-extremity для duct-dependent), АД');
    actions.push('Готовность к интубации/ИВЛ — apnea частая (10-30 % при ≥ 0.05)');
    actions.push('Эхокардиография: подтверждение PDA flow, функция AV, оценка response');
    actions.push('Газы крови q1-2h: cyanotic CHD — PaO₂ должен ↑');

    actions.push('--- Тактика дозирования ---');
    actions.push('Initial: 0.05 мкг/кг/мин (или 0.1 если severe closure);');
    actions.push('Response window: 10-30 мин (PaO₂ ↑ для cyanotic; pulses ↑ для obstructive)');
    actions.push('После ответа: ↓ до 0.025 мкг/кг/мин; затем 0.01 как maintenance');
    actions.push('Если no response за 30-60 мин: подтвердить diagnosis; перейти к surgery / catheter intervention');

    actions.push('--- Side effects ---');
    actions.push('Apnea — 10-30 % при ≥ 0.05; готовность к ИВЛ');
    actions.push('Hypotension — vasopressors, volume');
    actions.push('Fever (pyrogenic) — паpacetamol; не stop PGE1 если только fever');
    actions.push('Hypocalcemia, гипогликемия — мониторинг');
    actions.push('Cortical hyperostosis при курсе > 7 дней (long-term — обратимо после прекращения)');
    actions.push('Гastric outlet obstruction (рare) — abdominal U/S при vomiting');

    let band = '#3B82F6';
    if (rate >= 0.1) band = '#EF4444';
    else if (rate >= 0.05) band = '#F59E0B';
    else band = '#84CC16';

    return {
      value: microPerMin.toFixed(3),
      unit: `мкг/мин (${mlPerHour.toFixed(2)} мл/ч)`,
      interpretation: `${rate} мкг/кг/мин × ${w} кг`,
      color: band,
      details: `${rate} мкг/кг/мин × ${w} кг = ${microPerMin.toFixed(3)} мкг/мин = ${microPerHour.toFixed(1)} мкг/ч; раствор @ ${conc} мкг/мл → ${mlPerHour.toFixed(2)} мл/ч.`,
      actions,
    };
  },
  caveats: [
    'Duct-dependent CHD diagnosis suspected при cyanosis + low SpO₂ + duct-dependent murmur, или murmur + ↓ pulses (HLHS, coarctation)',
    'Hyperoxia test: 100% O₂ × 10 мин — если PaO₂ < 100 мм рт ст после = cyanotic CHD likely',
    'Pulse oximetry в 4 конечностях обязательна — pre-ductal (правая рука) vs post-ductal (нога) разница > 3-5 % saturation suggests CCHD',
    'Apnea — частый side effect (10-30 % при ≥ 0.05 мкг/кг/мин); готовность к интубации обязательна',
    'У TGA с restrictive ASD — may worsen с PGE1 (увеличивает pulmonary blood flow без mixing); balloon atrial septostomy first-line',
    'TGA / HLHS / IAA — emergency referral в кардиохирургический центр',
    'PGE1 НЕ обходимости — surgery is definitive; goal stabilize for transfer',
    'High-conc concentration economical для transport, fluid restriction но requires precise pump',
    'Vital signs / SpO₂ q15 мин в первый час; затем continuous',
    'Cohorte newborns presenting with CCHD: 80% diagnosed antenatally в развитых странах; в LMIC — постнатальная diagnosis',
  ],
  related: [
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
    { id: 'apgar', title: 'Apgar' },
    { id: 'neo-resp-indices', title: 'OI / OSI' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
  ],
  info: `### PGE1 (Alprostadil) — Duct-dependent CHD

Простагландин E1 для поддержания открытого артериального протока (PDA)
у новорождённых с duct-dependent congenital heart disease.

### Показания

#### Cyanotic CHD (cyanosis с low PaO₂):
- TGA без VSD (transposition of great arteries)
- Pulmonary atresia
- Tricuspid atresia
- Severe Tetralogy of Fallot
- Critical pulmonary stenosis
- Ebstein anomaly tяжёлый

#### Left-sided obstructive (cardiogenic shock):
- HLHS (hypoplastic left heart syndrome)
- Critical aortic stenosis
- Coarctation of aorta
- Interrupted aortic arch (IAA)
- Critical mitral stenosis

### Дозы

| Уровень | Скорость | Применение |
|---|---|---|
| Very low | 0.01 мкг/кг/мин | Maintenance после opening |
| Low | 0.025 мкг/кг/мин | Частично открыт PDA |
| **Standard** | 0.05 мкг/кг/мин | Initial |
| Med-high | 0.075 мкг/кг/мин | Slow response |
| High | 0.1 мкг/кг/мин | Severe duct closure / emergency |

### Концентрация раствора

| Conc | Recipe | Применение |
|---|---|---|
| 5 мкг/мл | 0.5 мг + 100 мл D5W | Standard NICU |
| 10 мкг/мл | 0.5 мг + 50 мл D5W | Volume restriction |
| 20 мкг/мл | 0.5 мг + 25 мл D5W | Severe restriction / transport |

Stable 24 ч; D5W или NS; protect from light.

### Алгоритм titration

1. **Suspect duct-dependent CHD** (cyanosis или ↓ pulses)
2. **Hyperoxia test** (100% O₂ × 10 мин)
3. **Echo confirmation** ASAP
4. **Start PGE1 0.05 мкг/кг/мин**
5. **Response 10-30 мин:**
   - PaO₂ ↑ для cyanotic
   - Pulses, perfusion ↑ для obstructive
6. **После response: ↓ до 0.025 → 0.01**
7. **Surgery / catheter intervention** в кардиохирургическом центре

### Hyperoxia test

| PaO₂ после 100% O₂ × 10 мин | Интерпретация |
|---|---|
| ≥ 250 мм рт ст | Pulmonary disease likely |
| 150-250 | Indeterminate |
| < 100 | CCHD (cyanotic) likely → start PGE1 |

### 4-extremity SpO₂

| Расхождение | Подозрение |
|---|---|
| Right arm > leg by > 3-5 % | Coarctation / IAA |
| Pre-ductal < post-ductal | TGA с RV outflow obstruction (rare) |
| Equal at < 90 % | Cyanotic CHD без duct-dependence |

### Side effects

| Эффект | Частота | Tactic |
|---|---|---|
| Apnea | 10-30 % | Готовность к ИВЛ |
| Hypotension | 5-10 % | Volume, vasopressors |
| Fever | 10-15 % | Парацетамол |
| Hypocalcemia | rare | Контроль iCa |
| Hypoglycemia | rare | Контроль гликемии |
| Cortical hyperostosis | > 7 d usage | Reversible после стопа |

### Источники

- AAP / AHA Statement on CHD management 2018
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- Akkinapally S et al. Cochrane PGE1 2018
- Lim DS et al. Pediatr Cardiol 2003 — high vs low dose
- КР МЗ РФ "Врождённые пороки сердца у н/р" (2024)
`,
};

export default runner;
