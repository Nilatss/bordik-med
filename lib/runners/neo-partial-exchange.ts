/**
 * Runner: neo-partial-exchange — Partial Exchange Transfusion для полицитемии
 *
 * NEONATOLOGY MODULE A38 (P2).
 *
 * Расчёт объёма частичного обменного переливания при симптомной
 * неонатальной полицитемии (Hct ≥ 65 %).
 *
 * Формула (Rawlings 1982):
 *   Volume_exchange = BV × (Hct_actual − Hct_desired) / Hct_actual
 *
 * Где:
 *   BV  ≈ 85 мл/кг у термин, ≈ 95 мл/кг у недоношенных
 *   Hct_actual  — текущий гематокрит (%)
 *   Hct_desired — целевой 50-55 %
 *   Замещение: 0.9 % NaCl (предпочтительно, не альбумин)
 *
 * SOURCES:
 *   - Rawlings JS et al. AJDC 1982;136(8):685-686
 *   - MDCalc Partial exchange neonatal polycythemia
 *   - AAP CFN: Polycythemia in the Newborn (Pediatrics 2008;122(6):1395)
 *   - КР МЗ РФ "Полицитемия новорождённого" (2024)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Rawlings 1982 / AAP) · РФ',
  reference: 'Rawlings JS et al. AJDC 1982;136:685. AAP CFN Polycythemia. Pediatrics 2008;122:1395.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.5,
      max: 10,
      step: 0.01,
    },
    {
      id: 'hct_actual',
      label: 'Текущий Hct (%, венозный)',
      type: 'number',
      min: 50,
      max: 95,
      step: 0.5,
    },
    {
      id: 'hct_desired',
      label: 'Целевой Hct (%)',
      type: 'select',
      options: [
        { value: '50', label: '50 % (стандартный target)' },
        { value: '55', label: '55 % (умеренный target)' },
      ],
    },
    {
      id: 'preterm',
      label: 'Преждевременно рождённый (< 37 нед)?',
      type: 'select',
      options: [
        { value: '0', label: 'Нет (BV ≈ 85 мл/кг)' },
        { value: '1', label: 'Да (BV ≈ 95 мл/кг)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const hctA = Number(values.hct_actual ?? 0);
    const hctD = Number(values.hct_desired ?? 50);
    const preterm = String(values.preterm ?? '0') === '1';

    if (w <= 0 || w > 10) {
      return {
        value: '—',
        unit: 'мл',
        interpretation: 'Введите массу 0.5-10 кг',
        color: '#9CA3AF',
        details: 'Расчёт применим только для новорождённых с массой 0.5-10 кг.',
      };
    }
    if (hctA < 50 || hctA > 95) {
      return {
        value: '—',
        unit: 'мл',
        interpretation: 'Введите Hct 50-95 %',
        color: '#9CA3AF',
        details: 'Гематокрит должен быть в диапазоне 50-95 %; полицитемия ≥ 65 %.',
      };
    }

    const bvPerKg = preterm ? 95 : 85;
    const bv = w * bvPerKg;
    const volume = (bv * (hctA - hctD)) / hctA;

    let color = '#22C55E';
    let interpretation = 'Не показан обмен';
    const actions: string[] = [];

    if (hctA < 65) {
      color = '#22C55E';
      interpretation = 'Hct < 65 % — обмен не показан';
      actions.push('Hct < 65 % — наблюдение, гидратация, контроль глюкозы');
      actions.push('Повторный анализ через 4-6 ч если симптомы');
    } else if (hctA >= 65 && hctA < 70) {
      color = '#F59E0B';
      interpretation = `Объём обмена ≈ ${volume.toFixed(0)} мл`;
      actions.push('При наличии симптомов hyperviscosity — частичный обмен');
      actions.push('Бессимптомные с Hct 65-70 % — наблюдение, повтор через 4-6 ч');
      actions.push('Гидратация PO/IV; контроль глюкозы каждые 1-2 ч');
    } else {
      color = '#EF4444';
      interpretation = `Объём обмена ≈ ${volume.toFixed(0)} мл`;
      actions.push(`Частичный обмен 0.9 % NaCl: ${volume.toFixed(0)} мл (Rawlings)`);
      actions.push('Доступ: UVC (предпочтительно) или периферический; 5-10 мл шагами');
      actions.push('Контроль Hct через 1, 4, 12 ч');
      actions.push('Мониторинг: SpO₂, ЧСС, АД, диурез, гликемия');
      actions.push('Альбумин не используется — равноценен/хуже NaCl и связан с риском NEC');
    }

    return {
      value: volume.toFixed(0),
      unit: 'мл',
      interpretation,
      color,
      details: `BV = ${w} × ${bvPerKg} = ${bv.toFixed(0)} мл. Целевой Hct ${hctD} %.`,
      actions,
    };
  },
  caveats: [
    'Симптомы hyperviscosity: плохое питание, тахипноэ, цианоз, гипогликемия, тромбоцитопения, тромбоз',
    'У 50 % новорождённых с Hct ≥ 65 % симптомы не развиваются',
    'Замещение: 0.9 % NaCl стандарт; альбумин/плазма не показаны (повышают риск NEC)',
  ],
  related: [
    { id: 'neo-bili-2022', title: 'Bili-2022' },
    { id: 'neo-uvc-uac', title: 'UVC/UAC размер' },
    { id: 'neo-fluid', title: 'Жидкость н/р' },
  ],
  info: `### Partial Exchange Transfusion (полицитемия)

Расчёт объёма частичного обменного переливания 0.9 % NaCl при
симптомной неонатальной полицитемии (Hct ≥ 65 %).

### Формула (Rawlings 1982)

\`\`\`
V = BV × (Hct_actual − Hct_desired) / Hct_actual
\`\`\`

| Параметр | Значение |
|---|---|
| BV (термин) | ≈ 85 мл/кг |
| BV (преэрм) | ≈ 95 мл/кг |
| Целевой Hct | 50-55 % |

### Показания (АД РФ + AAP)

- **Симптомная полицитемия:** hyperviscosity (плохое питание, тахипноэ,
  цианоз, гипогликемия, тромбоцитопения, тромбоз) + Hct венозной крови ≥ 65 %
- **Бессимптомная:** Hct ≥ 70-75 % (controversial)

### Доступ

- UVC (vein) — предпочтительно
- Скорость: 5-10 мл/мин, объём 5-10 мл шагами

### Замещение

- **0.9 % NaCl** — стандарт
- Альбумин и плазма НЕ показаны: не превосходят NaCl, повышают риск NEC

### Источники

- Rawlings JS et al. 1982 — оригинал
- AAP CFN Polycythemia 2008
- Cochrane Partial Exchange Transfusion 2010
- MDCalc Partial Exchange
`,
};

export default runner;
