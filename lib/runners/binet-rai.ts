// @ts-nocheck
/** Runner: binet-rai */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'areas',
      label: 'Число вовлечённых зон (шейные, подмышечные, паховые, печень, селезёнка)',
      type: 'number',
      min: 0,
      max: 5,
      step: 1,
    },
    {
      id: 'lymphocytosis',
      label: 'Лимфоцитоз > 5 × 10⁹/л (обязательный критерий CLL)',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'hepatosplenomegaly',
      label: 'Гепато- или спленомегалия',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'hb',
      hint: 'Гемоглобин. Норма: М 130-170, Ж 120-150 г/л',
      label: 'Гемоглобин (г/л)',
      type: 'number',
      min: 40,
      max: 180,
      step: 1,
      unit: 'г/л',
    },
    {
      id: 'plt',
      hint: 'Тромбоциты. Норма: 150-400 ×10⁹/л',
      label: 'Тромбоциты (×10⁹/л)',
      type: 'number',
      min: 5,
      max: 600,
      step: 1,
      unit: '×10⁹/л',
    },
  ],
  compute: (v) => {
    const areas = Number(v.areas);
    const hepsplen = v.hepatosplenomegaly === true || v.hepatosplenomegaly === 'true';
    const hb = Number(v.hb);
    const plt = Number(v.plt);

    // Binet
    let binet = '';
    if (hb < 100 || plt < 100) {
      binet = 'C';
    } else if (areas >= 3) {
      binet = 'B';
    } else {
      binet = 'A';
    }

    // Rai
    let rai = 0;
    if (plt < 100) rai = 4;
    else if (hb < 110) rai = 3;
    else if (hepsplen) rai = 2;
    else if (areas >= 1) rai = 1;
    else rai = 0;

    const binetNum = binet === 'A' ? 1 : binet === 'B' ? 2 : 3;

    const riskCategory = (binet === 'A' && rai <= 1) ? 'Низкий'
      : (binet === 'B' || rai === 2) ? 'Промежуточный'
      : 'Высокий';

    const color = riskCategory === 'Низкий' ? '#22C55E' : riskCategory === 'Промежуточный' ? '#F59E0B' : '#EF4444';

    const medianSurvival = riskCategory === 'Низкий' ? '> 10 лет' : riskCategory === 'Промежуточный' ? '5-7 лет' : '2-4 года';

    return {
      value: `Binet ${binet} / Rai ${rai}`,
      interpretation: `Binet ${binet}, Rai стадия ${rai} — ${riskCategory} риск`,
      color,
      details: `Медиана выживаемости при постановке диагноза — ${medianSurvival}. Современная таргетная терапия существенно улучшает прогноз.`,
      actions: [
        'iwCLL 2018 критерии активной болезни — показание к началу терапии',
        'FISH: del(17p), del(11q), trisomy 12, del(13q) — выбор таргетной терапии',
        'TP53 mutation (секвенирование) — del(17p)/TP53mut → BTK-ингибиторы или венетоклакс',
        'IGHV mutation status — unmutated = хуже прогноз',
        'Первая линия (fit): венетоклакс + обинутузумаб, или BTK (ибрутиниб, акалабрутиниб, занубрутиниб)',
        'Watch & wait при Binet A/Rai 0-I без прогрессии — терапия не улучшает выживаемость',
      ],
      caveats: [
        'Требуется подтверждение CLL: лимфоцитоз B-клеток > 5 × 10⁹/л + иммунофенотип (CD5+, CD19+, CD23+)',
        'MBL (< 5) не считается CLL',
        'Binet и Rai — клинические; CLL-IPI (2016) добавляет TP53, IGHV, β2-микроглобулин, возраст',
        'Richter-трансформация (в DLBCL) — подозрение при резком ухудшении, ЛДГ, B-симптомы',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'Binet A', color: '#22C55E' },
          { min: 2, max: 3, label: 'Binet B', color: '#F59E0B' },
          { min: 3, max: 4, label: 'Binet C', color: '#EF4444' },
        ],
        current: binetNum,
        unit: 'Binet',
      },
      related: [
        { id: 'ann-arbor', title: 'Ann Arbor' },
        { id: 'iss-mm', title: 'ISS / R-ISS' },
        { id: 'charlson', title: 'Charlson' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Binet JL et al. Cancer 1981;48:198-206. Rai KR et al. Blood 1975;46:219-234. iwCLL 2018 Hallek M et al. Blood 2018;131:2745-2760.',
  countries: 'Международный (iwCLL / Binet Европа / Rai США)',
  presets: [
    { label: 'Binet A / Rai 0', values: { areas: 0, lymphocytosis: true, hepatosplenomegaly: false, hb: 140, plt: 200 } },
    { label: 'Binet B / Rai 2', values: { areas: 3, lymphocytosis: true, hepatosplenomegaly: true, hb: 120, plt: 150 } },
    { label: 'Binet C / Rai 4', values: { areas: 4, lymphocytosis: true, hepatosplenomegaly: true, hb: 95, plt: 80 } },
  ],
  info: `### Для чего используется
**Binet (1981, Европа) + Rai (1975, США)** — клинические системы стадирования **хронического лимфоцитарного лейкоза (CLL / ХЛЛ)**. Обе основаны на анатомическом распространении и наличии цитопений.

### Binet (3 стадии)
| Стадия | Критерии | Медиана выживаемости |
|---|---|---|
| **A** | Hb ≥ 100 г/л, PLT ≥ 100, < 3 лимфатических зон | > 10 лет |
| **B** | Hb ≥ 100, PLT ≥ 100, ≥ 3 зон | 5-7 лет |
| **C** | Hb < 100 или PLT < 100 | 2-4 года |

> Лимфатические зоны: шейные, подмышечные, паховые ЛУ, печень, селезёнка (5 зон).

### Rai (5 стадий, упрощённый вариант — 3 группы)
| Rai | Критерии | Риск-группа |
|---|---|---|
| **0** | Только лимфоцитоз | Низкий |
| **I** | Лимфоцитоз + лимфаденопатия | Промежуточный |
| **II** | + гепато-/спленомегалия | Промежуточный |
| **III** | + анемия Hb < 110 г/л | Высокий |
| **IV** | + тромбоцитопения PLT < 100 | Высокий |

### CLL-IPI (2016) — современный прогностический индекс
| Фактор | Баллы |
|---|---|
| TP53 abnormalities (del17p, TP53mut) | 4 |
| IGHV unmutated | 2 |
| β2-микроглобулин > 3.5 мг/л | 2 |
| Возраст > 65 лет | 1 |
| Binet B-C / Rai I-IV | 1 |

Группы: низкий (0-1), промежуточный (2-3), высокий (4-6), очень высокий (7-10).

### Критерии активной CLL (iwCLL 2018) — показания к терапии
- Прогрессирующая недостаточность костного мозга (Hb < 100, PLT < 100)
- Массивная (≥ 6 см) или прогрессирующая спленомегалия
- Массивная (≥ 10 см) или прогрессирующая лимфаденопатия
- Удвоение лимфоцитов < 6 мес (если исходно > 30)
- Аутоиммунные осложнения, рефрактерные к стероидам
- Симптомы: потеря массы > 10% за 6 мес, лихорадка > 2 нед, ночной пот > 1 мес, утомляемость ECOG ≥ 2

### Современная терапия (2024)
| Ситуация | 1-я линия |
|---|---|
| Fit, без TP53 abnormality | Венетоклакс + обинутузумаб (12 мес) |
| Unfit | Венетоклакс + обинутузумаб или акалабрутиниб |
| TP53/del(17p) | BTK-ингибитор (акалабрутиниб, занубрутиниб) или венетоклакс + обинутузумаб непрерывно |

### Ограничения
- Не учитывают молекулярный профиль (TP53, IGHV)
- Не заменяются CLL-IPI, но используются вместе
- Richter-трансформация (в DLBCL / HL) не отражена`,
};
export default runner;
