// @ts-nocheck
/** Runner: ann-arbor */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'stage',
      label: 'Анатомическое распространение',
      type: 'select',
      options: [
        { value: 'I', label: 'I — одна лимфатическая зона' },
        { value: 'II', label: 'II — две и более зон по одну сторону диафрагмы' },
        { value: 'III', label: 'III — зоны по обе стороны диафрагмы' },
        { value: 'IV', label: 'IV — диффузное поражение экстранодальных органов' },
      ],
    },
    {
      id: 'symptoms',
      label: 'B-симптомы (лихорадка > 38°C, ночной пот, потеря > 10% массы за 6 мес)',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'extranodal',
      label: 'E — локализованное экстранодальное поражение (по смежности)',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'spleen',
      label: 'S — поражение селезёнки',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'bulky',
      label: 'X — Bulky disease (≥ 10 см или ≥ ⅓ диаметра грудной клетки)',
      type: 'checkbox',
      points: 0,
    },
  ],
  compute: (v) => {
    const stage = String(v.stage);
    const b = v.symptoms === true || v.symptoms === 'true';
    const e = v.extranodal === true || v.extranodal === 'true';
    const s = v.spleen === true || v.spleen === 'true';
    const x = v.bulky === true || v.bulky === 'true';

    const stageNum = stage === 'I' ? 1 : stage === 'II' ? 2 : stage === 'III' ? 3 : 4;
    const suffix = b ? 'B' : 'A';
    let modifiers = '';
    if (e) modifiers += 'E';
    if (s) modifiers += 'S';
    if (x) modifiers += 'X';

    const fullStage = `${stage}${suffix}${modifiers}`;

    const color = stageNum === 1 ? '#22C55E' : stageNum === 2 ? '#84CC16' : stageNum === 3 ? '#F59E0B' : '#EF4444';

    const riskDesc = stageNum <= 2 && !b && !x
      ? 'Ранняя благоприятная стадия. ABVD × 2-4 + involved-field ЛТ 20 Gy.'
      : stageNum <= 2
      ? 'Ранняя неблагоприятная стадия. ABVD × 4 ± ISRT 30 Gy.'
      : 'Продвинутая стадия. ABVD или BEACOPPesc × 6 (по IPS), PET-адаптированная терапия.';

    return {
      value: fullStage,
      interpretation: `Ann Arbor ${fullStage}`,
      color,
      details: `${riskDesc}${b ? ' Наличие B-симптомов ухудшает прогноз.' : ''}${x ? ' Bulky disease требует консолидации ЛТ.' : ''}`,
      actions: [
        'ПЭТ-КТ всего тела (включение в Lugano 2014 — заменило КТ для стадирования)',
        'Биопсия костного мозга — не требуется при ПЭТ-КТ для классического ходжкина',
        'Оценка IPS (International Prognostic Score) для продвинутых стадий',
        'Фертильность: криоконсервация спермы/яйцеклеток до начала ХТ',
        'Эхокардиография (доксорубицин) и ФВД (блеомицин) до старта',
        'PET-адаптированная терапия: интерим-ПЭТ после 2 циклов (Deauville 1-3 → деэскалация)',
      ],
      caveats: [
        'Cotswolds 1989 и Lugano 2014 обновили исходную Ann Arbor (1971)',
        'В Lugano 2014: ПЭТ-КТ заменила КТ для стадирования FDG-авидных лимфом',
        'X (bulky) в Lugano не классифицируется по старым порогам — используется >10 см',
        'Применима для ходжкинских и неходжкинских лимфом (при DLBCL добавляется IPI)',
        'Для CLL используются Binet/Rai, для MM — ISS/R-ISS',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'I', color: '#22C55E' },
          { min: 2, max: 3, label: 'II', color: '#84CC16' },
          { min: 3, max: 4, label: 'III', color: '#F59E0B' },
          { min: 4, max: 5, label: 'IV', color: '#EF4444' },
        ],
        current: stageNum,
        unit: 'stage',
      },
      related: [
        { id: 'tnm', title: 'TNM' },
        { id: 'cheson', title: 'Lugano' },
        { id: 'binet-rai', title: 'Binet / Rai' },
        { id: 'iss-mm', title: 'ISS / R-ISS' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Lister TA et al. Report of a committee convened to discuss the evaluation and staging of patients with Hodgkin disease: Cotswolds meeting. J Clin Oncol 1989;7:1630-1636. Cheson BD et al. Lugano classification. J Clin Oncol 2014;32:3059-3068.',
  countries: 'Международный (Cotswolds / Lugano)',
  presets: [
    { label: 'IIA, без B', values: { stage: 'II', symptoms: false, extranodal: false, spleen: false, bulky: false } },
    { label: 'IIIB + S', values: { stage: 'III', symptoms: true, extranodal: false, spleen: true, bulky: false } },
    { label: 'IVB + bulky', values: { stage: 'IV', symptoms: true, extranodal: true, spleen: false, bulky: true } },
  ],
  info: `### Для чего используется
**Ann Arbor (1971) → Cotswolds (1989) → Lugano (2014)** — международная классификация **ходжкинской и неходжкинской лимфомы** по анатомическому распространению и системным симптомам.

### Стадии
| Стадия | Определение |
|---|---|
| **I** | Одна лимфатическая зона или один экстралимфатический орган (IE) |
| **II** | ≥ 2 зоны по одну сторону диафрагмы |
| **III** | Зоны по обе стороны диафрагмы |
| **IV** | Диффузное / диссеминированное поражение экстранодальных органов (печень, костный мозг, лёгкие) |

### Модификаторы
| Буква | Значение |
|---|---|
| **A** | Без системных симптомов |
| **B** | Лихорадка > 38 °C, ночной профузный пот, потеря массы > 10% за 6 мес |
| **E** | Локализованное экстранодальное поражение (по смежности) |
| **S** | Поражение селезёнки |
| **X** | Bulky disease (≥ 10 см или ≥ ⅓ диаметра грудной клетки) |

### IPS для продвинутой ходжкинской лимфомы (Hasenclever 1998)
По 1 баллу за каждый критерий:
- Альбумин < 40 г/л
- Гемоглобин < 105 г/л
- Мужской пол
- Возраст ≥ 45 лет
- Стадия IV
- Лейкоциты ≥ 15 × 10⁹/л
- Лимфоциты < 0,6 × 10⁹/л или < 8%

### Прогноз по IPS
| IPS | 5-летняя PFS |
|---|---|
| 0 | 84% |
| 1 | 77% |
| 2 | 67% |
| 3 | 60% |
| 4 | 51% |
| ≥ 5 | 42% |

### Lugano 2014 — ключевые изменения
- ПЭТ-КТ — стандарт стадирования FDG-авидных лимфом
- Отмена рутинной биопсии КМ для классической HL при чистом ПЭТ
- Оценка ответа по шкале Deauville (5-point scale)
- Интерим-ПЭТ после 2 циклов — ключ к PET-адаптированной терапии

### Терапия (упрощённо)
| Стадия / группа | Схема |
|---|---|
| I-II ранняя благоприятная | ABVD × 2 + ISRT 20 Gy |
| I-II ранняя неблагоприятная | ABVD × 4 + ISRT 30 Gy |
| III-IV продвинутая | ABVD × 6 или BEACOPPesc × 4-6 |
| Рецидив/рефр. | ASCT / брентуксимаб / пембролизумаб-ниволумаб |

### Ограничения
- Для DLBCL прогноз лучше предсказывает IPI (а не только Ann Arbor)
- Для CLL, ММ и острых лейкозов — собственные системы
- Bulky disease порог дискутируется (≥ 7.5 vs ≥ 10 см)`,
};
export default runner;
