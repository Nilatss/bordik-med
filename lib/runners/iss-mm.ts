/** Runner: iss-mm */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'b2m',
      hint: 'Концентрация в мг/л',
      label: 'β2-микроглобулин (мг/л)',
      type: 'number',
      min: 0,
      max: 30,
      step: 0.1,
      unit: 'мг/л',
    },
    {
      id: 'albumin',
      hint: 'Альбумин. Норма: 35-50 г/л',
      label: 'Альбумин (г/л)',
      type: 'number',
      min: 10,
      max: 60,
      step: 1,
      unit: 'г/л',
    },
    {
      id: 'ldh_high',
      label: 'ЛДГ выше верхней границы нормы',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'high_risk_cyto',
      label: 'Высокий цитогенетический риск — del(17p), t(4;14), t(14;16)',
      type: 'checkbox',
      points: 0,
    },
  ],
  compute: (v) => {
    const b2m = Number(v.b2m);
    const alb = Number(v.albumin);
    const ldh = v.ldh_high === true || v.ldh_high === 'true';
    const hrCyto = v.high_risk_cyto === true || v.high_risk_cyto === 'true';

    // ISS
    let iss = 0;
    if (b2m >= 5.5) iss = 3;
    else if (b2m < 3.5 && alb >= 35) iss = 1;
    else iss = 2;

    // R-ISS (Palumbo 2015)
    let rIss = 0;
    if (iss === 3 && (hrCyto || ldh)) rIss = 3;
    else if (iss === 1 && !hrCyto && !ldh) rIss = 1;
    else rIss = 2;

    const color = rIss === 1 ? '#22C55E' : rIss === 2 ? '#F59E0B' : '#EF4444';

    const survival = rIss === 1 ? '5-летняя OS ~ 82%, PFS ~ 55%'
      : rIss === 2 ? '5-летняя OS ~ 62%, PFS ~ 36%'
      : '5-летняя OS ~ 40%, PFS ~ 24%';

    return {
      value: `ISS ${iss} / R-ISS ${rIss}`,
      interpretation: `ISS стадия ${iss}, R-ISS стадия ${rIss}`,
      color,
      details: `${survival}. Цитогенетика и ЛДГ существенно уточняют прогноз.`,
      actions: [
        'FISH на плазматических клетках: del(17p), t(4;14), t(14;16), +1q, del(1p)',
        'Иммунофиксация сыворотки/мочи + свободные лёгкие цепи (FLC)',
        'Биопсия КМ с иммуногистохимией и проточной цитометрией (CD138+, кappa/lambda restriction)',
        'Whole-body MRI / PET-CT / low-dose CT — для оценки костных очагов',
        'CRAB и SLiM-CRAB критерии (IMWG 2014) для подтверждения требующей лечения ММ',
        '1-я линия (fit): VRd (бортезомиб + леналидомид + дексаметазон) → ASCT → леналидомид поддержка',
        '1-я линия (unfit): Dara-Rd или VRd lite',
      ],
      caveats: [
        'ISS — Greipp 2005; R-ISS — Palumbo 2015; R2-ISS — D\'Agostino 2022 (добавил +1q)',
        'β2-микроглобулин повышается при ХБП — учитывать',
        'High-risk cytogenetics: del(17p), t(4;14), t(14;16); t(11;14) — нейтральная',
        'MGUS и smoldering MM не требуют терапии, но smoldering high-risk → раннее начало',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'R-ISS I', color: '#22C55E' },
          { min: 2, max: 3, label: 'R-ISS II', color: '#F59E0B' },
          { min: 3, max: 4, label: 'R-ISS III', color: '#EF4444' },
        ],
        current: rIss,
        unit: 'R-ISS',
      },
      related: [
        { id: 'ann-arbor', title: 'Ann Arbor' },
        { id: 'binet-rai', title: 'Binet / Rai' },
        { id: 'charlson', title: 'Charlson' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Greipp PR et al. J Clin Oncol 2005;23:3412-3420 (ISS). Palumbo A et al. J Clin Oncol 2015;33:2863-2869 (R-ISS). D\'Agostino M et al. J Clin Oncol 2022;40:3406-3418 (R2-ISS).',
  countries: 'Международный (IMWG)',
  presets: [
    { label: 'R-ISS I', values: { b2m: 2.5, albumin: 40, ldh_high: false, high_risk_cyto: false } },
    { label: 'R-ISS II', values: { b2m: 4.0, albumin: 32, ldh_high: false, high_risk_cyto: false } },
    { label: 'R-ISS III', values: { b2m: 6.5, albumin: 28, ldh_high: true, high_risk_cyto: true } },
  ],
  info: `### Для чего используется
**ISS / R-ISS** — международная система стадирования **множественной миеломы (ММ)**. ISS (2005) использует два простых биомаркера; R-ISS (2015) добавляет ЛДГ и цитогенетику — существенно улучшает стратификацию.

### ISS (Greipp 2005)
| Стадия | Критерии | Медиана OS |
|---|---|---|
| **I** | β2-MG < 3.5 мг/л И альбумин ≥ 35 г/л | 62 мес |
| **II** | Не I и не III | 44 мес |
| **III** | β2-MG ≥ 5.5 мг/л | 29 мес |

### R-ISS (Palumbo 2015)
| Стадия | Критерии | 5-летняя OS | 5-летняя PFS |
|---|---|---|---|
| **I** | ISS I + стандартный риск + норма ЛДГ | 82% | 55% |
| **II** | Не I и не III | 62% | 36% |
| **III** | ISS III + (ЛДГ↑ или high-risk FISH) | 40% | 24% |

### High-risk cytogenetics
- **del(17p)** — потеря TP53
- **t(4;14)** — FGFR3/MMSET
- **t(14;16)** — MAF
- **+1q (gain/amp)** — добавлено в R2-ISS (2022)

### R2-ISS (D'Agostino 2022)
4-балльная система с +1q:
- β2-MG ≥ 3.5 → 1 балл
- Альбумин < 35 → 1 балл
- ЛДГ > ВГН → 1 балл
- t(4;14) → 1 балл
- del(17p) → 1 балл
- +1q → 0.5 балла

Группы: низкий (0), промежуточный-низкий (0.5-1), промежуточный-высокий (1.5-2.5), высокий (3-5).

### Критерии ММ (IMWG 2014) — CRAB + SLiM
Требующая лечения ММ = плазмоклеточность КМ ≥ 10% + хотя бы один критерий:
- **C** — Calcium > 2.75 ммоль/л
- **R** — Renal: CrCl < 40 или креатинин > 177 мкмоль/л
- **A** — Anaemia: Hb < 100 г/л
- **B** — Bone lesions ≥ 1 очаг
- **S** — плазмоклеточность КМ ≥ 60%
- **Li** — FLC ratio ≥ 100
- **M** — > 1 очага на МРТ

### Терапия (упрощённо, 2024)
| Группа | Первая линия |
|---|---|
| Fit, кандидат на ASCT | Dara-VRd × 4 → ASCT → Dara-R поддержка |
| Unfit | Dara-Rd непрерывно |
| High-risk | Dara-VRd + ASCT → двойная поддержка VRd |
| Рецидив | CAR-T (ide-cel, cilta-cel), биспецифики (teclistamab), Pd, IsaPd |

### Ограничения
- β2-MG зависит от почечной функции
- Не учитывает MRD-статус (минимальную остаточную болезнь)
- R2-ISS (2022) предположительно точнее, но пока не заменил R-ISS`,
};
export default runner;
