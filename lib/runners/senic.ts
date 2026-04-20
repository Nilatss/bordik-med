// @ts-nocheck
/** Runner: senic — Study on Efficacy of Nosocomial Infection Control index */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'abdo_surgery', label: 'Абдоминальная хирургия', type: 'checkbox', points: 1 },
    { id: 'long_surgery', label: 'Операция > 2 часов', type: 'checkbox', points: 1 },
    { id: 'contaminated', label: 'Контаминированная или грязная операция', type: 'checkbox', points: 1 },
    { id: 'three_dx', label: '> 3 сопутствующих диагнозов при выписке', type: 'checkbox', points: 1 },
  ],
  compute: (v) => {
    const pts =
      (v.abdo_surgery ? 1 : 0) +
      (v.long_surgery ? 1 : 0) +
      (v.contaminated ? 1 : 0) +
      (v.three_dx ? 1 : 0);

    const risks: Record<number, { rate: string; risk: string; color: string }> = {
      0: { rate: '~ 1 %', risk: 'Низкий', color: '#22C55E' },
      1: { rate: '~ 4 %', risk: 'Низко-умеренный', color: '#84CC16' },
      2: { rate: '~ 9 %', risk: 'Умеренный', color: '#F59E0B' },
      3: { rate: '~ 17 %', risk: 'Высокий', color: '#F97316' },
      4: { rate: '~ 27 %', risk: 'Очень высокий', color: '#EF4444' },
    };
    const r = risks[pts];

    return {
      value: `${pts} / 4`,
      unit: 'SENIC',
      interpretation: `Риск нозокомиальной инфекции: ${r.risk} (~ ${r.rate}).`,
      color: r.color,
      details: `SENIC (Haley 1985) — простая шкала риска нозокомиальных инфекций (ИСМП) у хирургических пациентов. 4 критерия, каждый = 1 балл. Современные альтернативы: NNIS (CDC), APIC-HARM.`,
      actions: [
        'Периоперационная АБ-профилактика: цефазолин 2 г в/в за 60 мин до разреза (повтор каждые 4 ч операции)',
        'При колоректальных — + метронидазол или цефокситин',
        'При МРЗС-риске — ванкомицин + цефазолин',
        pts >= 2 ? 'Усиленные меры ИК: строгая стерильность, SCIP bundle, бдительное наблюдение SSI' : null,
        pts >= 3 ? 'Ежедневная хлоргексидиновая обработка кожи у ICU-пациентов' : null,
        'Ранняя мобилизация, раннее удаление катетеров (мочевой, центральный венозный)',
        'Руки: гигиена по WHO «My 5 Moments»',
        'Мониторинг SSI (surgical site infection) 30 дн (или 90 дн при имплантатах)',
        'Изоляция при C. difficile, MRSA, VRE, CRE',
      ].filter(Boolean),
      caveats: [
        'Разработан в 1985 — современная эпидемиология изменилась (резистентность, лапароскопия)',
        'NNIS index (CDC) — современная альтернатива: ASA, длительность, рана-класс',
        'Не учитывает индивидуальные ФР (ожирение, диабет, курение, ИМТ)',
        'Валидирован в США; международная применимость ограничена',
        'Для ЦВК-инфекций и ИВЛ-пневмонии — отдельные bundles (CLABSI, VAP)',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: '0 низкий', color: '#22C55E' },
          { min: 1, max: 2, label: '1', color: '#84CC16' },
          { min: 2, max: 3, label: '2', color: '#F59E0B' },
          { min: 3, max: 4, label: '3', color: '#F97316' },
          { min: 4, max: 5, label: '4 оч. выс.', color: '#EF4444' },
        ],
        current: pts,
        unit: 'балл',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '305.2', title: 'Госп. эпидемиология' },
      ],
      related: [
        { id: 'mccabe', title: 'McCabe-Jackson' },
        { id: 'charlson', title: 'Charlson CCI' },
        { id: 'apache-ii', title: 'APACHE II' },
      ],
    };
  },
  reference: 'Haley RW et al. Am J Epidemiol 1985;121:206 (SENIC Project).',
  countries: 'США (CDC / APIC)',
  presets: [
    { label: 'Плановая аппендэктомия', values: { abdo_surgery: true, long_surgery: false, contaminated: false, three_dx: false } },
    { label: 'Колоректальная, 3 ч', values: { abdo_surgery: true, long_surgery: true, contaminated: true, three_dx: false } },
    { label: 'Пожилой, множ. ФР', values: { abdo_surgery: true, long_surgery: true, contaminated: true, three_dx: true } },
  ],
  info: `### Для чего используется
**SENIC Index (Haley 1985)** — простая шкала риска послеоперационных нозокомиальных инфекций (ИСМП, HAI). Разработана в Study on Efficacy of Nosocomial Infection Control Project (CDC).

### 4 критерия (по 1 баллу)
| Критерий |
|---|
| Абдоминальная хирургия |
| Операция > 2 ч |
| Контаминированная или грязная операция (CDC wound class 3–4) |
| > 3 сопутствующих диагнозов при выписке |

### Интерпретация
| SENIC | Риск SSI |
|---|---|
| 0 | ~ 1 % |
| 1 | ~ 4 % |
| 2 | ~ 9 % |
| 3 | ~ 17 % |
| 4 | ~ 27 % |

### Классы ран (CDC)
| Класс | Описание | Риск SSI |
|---|---|---|
| Чистая | Плановая, не инфицирована, без полых органов | 1–5 % |
| Чисто-контаминированная | Дыхательный, ЖКТ, генитальный тракт вскрыт | 3–11 % |
| Контаминированная | Свежая травма, большая нарушение стерильности | 10–17 % |
| Грязная | Старая травма с некрозом, перфорация | 27 %+ |

### Периоперационная АБ-профилактика
| Операция | Препарат |
|---|---|
| Чистая (ортопедия, герниопластика) | Цефазолин 2 г |
| Колоректальная | Цефокситин / цефазолин + метронидазол |
| Билиарная | Цефазолин |
| Гинекология | Цефазолин ± метронидазол |
| MRSA-риск | + Ванкомицин |

**Правила:**
- Ввести за 60 мин до разреза (120 мин для ванкомицина/фторхинолонов)
- Повторить при операции > 4 ч или кровопотере > 1,5 л
- Длительность < 24 ч (максимум)

### SCIP bundle (Surgical Care Improvement Project)
1. АБ-профилактика своевременная (за 60 мин)
2. Правильный препарат
3. Отмена в 24 ч (48 ч для кардиохирургии)
4. Гликемический контроль < 10 ммоль/л
5. Нормотермия
6. Удаление волос clippers (не бритвой)

### Альтернативы SENIC
- **NNIS Index (CDC)**: ASA ≥ 3, длительность > 75-й перцентили, контаминация 3–4
- **APIC-HARM**
- Индивидуальные модели: NSQIP, ACS-NSQIP calculator

### Ограничения
- Разработан в 1985 — современная эпидемиология изменилась
- Лапароскопия, fast-track surgery снижают риски
- Резистентность — MRSA, VRE, ESBL — SENIC не учитывает
- Не учитывает BMI, диабет, курение, hypoalbuminemia`,
};

export default runner;
