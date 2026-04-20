// @ts-nocheck
/** Runner: uas7 - Urticaria Activity Score over 7 days */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'd1w', label: 'День 1 — волдыри (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd1i', label: 'День 1 — зуд (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd2w', label: 'День 2 — волдыри', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd2i', label: 'День 2 — зуд', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd3w', label: 'День 3 — волдыри', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd3i', label: 'День 3 — зуд', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd4w', label: 'День 4 — волдыри', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd4i', label: 'День 4 — зуд', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd5w', label: 'День 5 — волдыри', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd5i', label: 'День 5 — зуд', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd6w', label: 'День 6 — волдыри', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd6i', label: 'День 6 — зуд', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd7w', label: 'День 7 — волдыри', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'd7i', label: 'День 7 — зуд', type: 'number', min: 0, max: 3, step: 1 },
  ],
  compute: (v) => {
    const ids = ['d1','d2','d3','d4','d5','d6','d7'];
    let score = 0;
    for (const d of ids) {
      score += Number(v[d + 'w'] || 0) + Number(v[d + 'i'] || 0);
    }

    let color = '#22C55E', band = 'Хорошо контролируемая';
    if (score >= 28) { color = '#7F1D1D'; band = 'Очень тяжёлая'; }
    else if (score >= 16) { color = '#EF4444'; band = 'Тяжёлая'; }
    else if (score >= 7) { color = '#F59E0B'; band = 'Умеренная'; }
    else if (score >= 1) { color = '#84CC16'; band = 'Лёгкая'; }

    return {
      value: String(score),
      unit: '/42',
      interpretation: band,
      color,
      details: `Сумма за 7 дней: волдыри + зуд по 0-3 × 7 = максимум 42. UAS7 = 0 = полная ремиссия.`,
      actions: [
        'Step 1: антигистаминные 2-го поколения в стандартной дозе (лоратадин, цетиризин, фексофенадин, биластин)',
        score >= 7 ? 'Step 2: удвоение / учетверение дозы Н1-АГ 2-го поколения (off-label, EAACI/GA²LEN)' : '',
        score >= 16 ? 'Step 3: омализумаб 300 мг п/к 1 раз в 4 нед (при CSU ≥ 12 лет, рефрактерной к Н1-АГ)' : '',
        score >= 16 ? 'Step 4: циклоспорин (при неответе на омализумаб); лигелизумаб (исследовательский)' : '',
        'Исключить триггеры: НПВП, ИАПФ, стресс, физический фактор (холод, давление)',
        'Оценка щитовидной железы (ATG, TPO-ат) — CSU ассоциирована с аутоиммунностью',
        'Не назначать рутинный биопсия кожи, CBC, СОЭ — только при подозрении на уртикарный васкулит',
      ].filter(Boolean),
      caveats: [
        'UAS7 — patient-reported, точен при ежедневном заполнении дневника',
        'Порог клинически значимого изменения (MCID) ≈ 10-11 баллов',
        'Дополнительно: UCT (Urticaria Control Test, 0-16) и AAS7 для ангиоотёка',
        'UAS7 < 7 — well-controlled; UAS7 = 0 — ремиссия',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Ремиссия', color: '#22C55E' },
          { min: 1, max: 7, label: 'Well-ctrl', color: '#84CC16' },
          { min: 7, max: 16, label: 'Умеренная', color: '#F59E0B' },
          { min: 16, max: 28, label: 'Тяжёлая', color: '#EF4444' },
          { min: 28, max: 42, label: 'Очень тяж.', color: '#7F1D1D' },
        ],
        current: score,
        unit: 'UAS7',
      },
      related: [{ id: 'scorad', title: 'SCORAD' }, { id: 'pasi', title: 'PASI' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Zuberbier T, Aberer W, Asero R, et al. EAACI/GA²LEN/EDF/WAO guideline for the definition, classification, diagnosis and management of urticaria. Allergy 2022;77:734-766.',
  countries: 'Международный (EAACI / GA²LEN / WAO)',
  presets: [
    { label: 'Ремиссия', values: { d1w:0,d1i:0,d2w:0,d2i:0,d3w:0,d3i:0,d4w:0,d4i:0,d5w:0,d5i:0,d6w:0,d6i:0,d7w:0,d7i:0 } },
    { label: 'Умеренная', values: { d1w:1,d1i:1,d2w:1,d2i:1,d3w:1,d3i:1,d4w:1,d4i:1,d5w:1,d5i:1,d6w:1,d6i:1,d7w:1,d7i:1 } },
    { label: 'Очень тяжёлая', values: { d1w:3,d1i:3,d2w:3,d2i:3,d3w:3,d3i:3,d4w:3,d4i:3,d5w:3,d5i:3,d6w:3,d6i:3,d7w:3,d7i:3 } },
  ],
  info: `### Для чего используется
**UAS7** — оценка активности хронической **спонтанной крапивницы (CSU)** по ежедневному дневнику за 7 дней.

### Шкала
Каждый день: волдыри (wheals) 0-3 + зуд (itch) 0-3. Сумма за 7 дней = 0-42.

**Волдыри 0-3:**
- 0 — нет
- 1 — < 20 за 24 ч
- 2 — 20-50
- 3 — > 50 / большие сливные

**Зуд 0-3:**
- 0 — нет
- 1 — лёгкий, не беспокоит
- 2 — умеренный, беспокоит, но не мешает сну/активности
- 3 — тяжёлый, мешает сну/активности

### Интерпретация
| UAS7 | Активность |
|---|---|
| 0 | Ремиссия |
| 1-6 | Well-controlled (лёгкая) |
| 7-15 | Умеренная |
| 16-27 | Тяжёлая |
| 28-42 | Очень тяжёлая |

### Ступенчатая терапия (EAACI 2022)
1. Н1-АГ 2-го поколения в стандартной дозе
2. Удвоение / учетверение дозы Н1-АГ (до 4×)
3. **Омализумаб 300 мг п/к 1×/4 нед**
4. Циклоспорин

### Ключ
- MCID ≈ 10-11 баллов
- Избегать Н1-АГ 1-го поколения, кроме краткосрочно ночью
- Системные ГКС — только короткий курс (≤ 10 дней)

### Источник
Zuberbier T et al. Allergy 2022.`,
};

export default runner;
