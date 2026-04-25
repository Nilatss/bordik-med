// @ts-nocheck
/** Runner: d-amico */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'psa',
      hint: 'Концентрация в нг/мл',
      label: 'PSA (нг/мл)',
      type: 'number',
      min: 0,
      max: 200,
      step: 0.1,
      unit: 'нг/мл',
    },
    {
      id: 'gleason',
      label: 'Gleason score / ISUP Grade Group',
      type: 'select',
      options: [
        { value: '6', label: 'Gleason ≤ 6 (GG1)' },
        { value: '7a', label: 'Gleason 3+4=7 (GG2)' },
        { value: '7b', label: 'Gleason 4+3=7 (GG3)' },
        { value: '8', label: 'Gleason 8 (GG4)' },
        { value: '9', label: 'Gleason 9-10 (GG5)' },
      ],
    },
    {
      id: 't_stage',
      label: 'Клиническая стадия (T)',
      type: 'select',
      options: [
        { value: 'T1', label: 'cT1 (не пальпируется)' },
        { value: 'T2a', label: 'cT2a (< ½ одной доли)' },
        { value: 'T2b', label: 'cT2b (> ½ одной доли)' },
        { value: 'T2c', label: 'cT2c (обе доли)' },
        { value: 'T3', label: 'cT3 (экстракапсулярная инвазия)' },
        { value: 'T4', label: 'cT4 (инвазия смежных органов)' },
      ],
    },
  ],
  compute: (v) => {
    const psa = Number(v.psa);
    const gleason = String(v.gleason);
    const t = String(v.t_stage);

    const highGleason = gleason === '8' || gleason === '9' || gleason === '7b';
    const intGleason = gleason === '7a';
    const lowGleason = gleason === '6';

    const highT = t === 'T2c' || t === 'T3' || t === 'T4';
    const intT = t === 'T2b';
    const lowT = t === 'T1' || t === 'T2a';

    let risk = '';
    let riskNum = 0;
    let color = '';
    let details = '';
    let actions: string[] = [];

    if (psa > 20 || gleason === '8' || gleason === '9' || highT) {
      risk = 'Высокий';
      riskNum = 3;
      color = '#7F1D1D';
      details = 'Высокий риск биохимического рецидива (~ 50% за 5 лет) и канцер-специфической смертности. Риск клинически значимого прогрессирования высокий.';
      actions = [
        'Радикальная простатэктомия с расширенной тазовой лимфодиссекцией',
        'Или дистанционная ЛТ + длительная ADT (2-3 года)',
        'Брахитерапия HDR-boost по показаниям',
        'Стадирование: PSMA-PET / КТ ОГК-ОБП + сцинтиграфия скелета',
        'Мультидисциплинарный консилиум',
      ];
    } else if (psa >= 10 || intGleason || gleason === '7b' || intT) {
      risk = 'Промежуточный';
      riskNum = 2;
      color = '#F59E0B';
      details = 'Промежуточный риск. 5-летняя биохимическая БРВ ~ 70-85%. Подразделяется на благоприятный (GG2 + PSA 10-20) и неблагоприятный (GG3 или 2+ факторов).';
      actions = [
        'Радикальная простатэктомия (RP) ± лимфодиссекция',
        'Или дистанционная ЛТ ± короткий ADT (4-6 мес)',
        'Или брахитерапия (LDR/HDR) при подходящем объёме простаты',
        'МРТ малого таза для оценки экстракапсулярной инвазии',
      ];
    } else {
      risk = 'Низкий';
      riskNum = 1;
      color = '#22C55E';
      details = 'Низкий риск. 5-летняя биохимическая БРВ > 90%. Минимальный риск клинически значимой прогрессии.';
      actions = [
        'Активное наблюдение (active surveillance) — предпочтительно',
        'PSA каждые 3-6 мес, ПРИ каждые 12 мес, повторная биопсия через 12-18 мес',
        'Альтернатива: радикальная простатэктомия или ЛТ (у молодых пациентов)',
        'Обсудить потенциальный вред лечения vs. онкологический риск',
      ];
    }

    return {
      value: risk,
      unit: 'риск',
      interpretation: `D’Amico: ${risk} риск рецидива`,
      color,
      details,
      actions,
      caveats: [
        'D’Amico (1998) — для клинически локализованного рака простаты (cT1-T2)',
        'NCCN расширяет: очень низкий, низкий, благоприятный промежуточный, неблагоприятный промежуточный, высокий, очень высокий',
        'EAU использует аналогичную стратификацию с дополнением ISUP Grade Group',
        'PSMA-PET повышает точность стадирования в высоком риске (замещает КТ + сцинтиграфию)',
        'Не применим при метастатическом раке (сразу M1) или cN1',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'Низкий', color: '#22C55E' },
          { min: 2, max: 3, label: 'Средний', color: '#F59E0B' },
          { min: 3, max: 4, label: 'Высокий', color: '#7F1D1D' },
        ],
        current: riskNum,
        unit: 'risk',
      },
      related: [
        { id: 'gleason', title: 'Gleason' },
        { id: 'pirads', title: 'PI-RADS' },
        { id: 'tnm', title: 'TNM' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'D’Amico AV et al. Biochemical outcome after radical prostatectomy, external beam radiation therapy, or interstitial radiation therapy for clinically localized prostate cancer. JAMA 1998;280:969-974.',
  countries: 'Международный (AUA / EAU / NCCN)',
  presets: [
    { label: 'Низкий риск', values: { psa: 6, gleason: '6', t_stage: 'T1' } },
    { label: 'Промежуточный', values: { psa: 12, gleason: '7a', t_stage: 'T2b' } },
    { label: 'Высокий риск', values: { psa: 25, gleason: '8', t_stage: 'T3' } },
  ],
  info: `### Для чего используется
**D’Amico risk classification (1998)** — стратификация **клинически локализованного рака простаты (cT1-T2)** по риску биохимического рецидива и выбора тактики.

### Категории риска
| Риск | PSA | Gleason | Стадия |
|---|---|---|---|
| **Низкий** | < 10 | ≤ 6 | T1-T2a |
| **Промежуточный** | 10-20 | 7 | T2b |
| **Высокий** | > 20 | 8-10 | ≥ T2c |

> Достаточно **одного** критерия из высокого — чтобы считать пациента высокого риска.

### Прогноз (5-летняя биохимическая БРВ)
| Риск | БРВ |
|---|---|
| Низкий | > 90% |
| Промежуточный | 70-85% |
| Высокий | 50% |

### NCCN расширение (6 групп)
1. **Очень низкий** — cT1c, PSA < 10, PSA-D < 0.15, ≤ 3 позитивных столбиков, ≤ 50% в каждом, GG1
2. **Низкий** — PSA < 10, GG1, cT1-T2a
3. **Благоприятный промежуточный** — 1 фактор промежуточного риска + GG1 или GG2
4. **Неблагоприятный промежуточный** — GG3 или ≥ 2 факторов
5. **Высокий** — GG4-5 или PSA > 20 или ≥ T3a
6. **Очень высокий** — T3b-T4 или первичный паттерн 5 или ≥ 4 биопсий с GG4-5

### Тактика
| Риск | Первая линия |
|---|---|
| **Очень низкий / низкий** | Активное наблюдение |
| **Промежуточный благоприятный** | RP, ЛТ, брахитерапия |
| **Промежуточный неблагоприятный** | RP или ЛТ ± короткий ADT |
| **Высокий** | RP + диссекция, или ЛТ + длительный ADT (2-3 года) |
| **Очень высокий** | Мультимодальная: ЛТ + ADT ± доцетаксел / абиратерон |

### Ограничения
- Только для **локализованного** рака (cT1-T2)
- Не учитывает молекулярные маркёры (Decipher, Prolaris, Oncotype GPS)
- Не учитывает MRI-данные (PI-RADS)
- PSMA-PET повышает точность в высоком риске`,
};
export default runner;
