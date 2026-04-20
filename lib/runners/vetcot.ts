// @ts-nocheck
/** Runner: vetcot */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'perfusion',     label: 'Перфузия (0 норм — 3 декомпенс.)',       type: 'number', min: 0, max: 3, step: 1 },
    { id: 'cardiac',       label: 'Сердце / дых. (0 норм — 3 арест)',       type: 'number', min: 0, max: 3, step: 1 },
    { id: 'respiratory',   label: 'Дыхание (0 норм — 3 апноэ)',              type: 'number', min: 0, max: 3, step: 1 },
    { id: 'eye',           label: 'Глаза / мышцы / кожа (0-3)',              type: 'number', min: 0, max: 3, step: 1 },
    { id: 'skeletal',      label: 'Скелет (0-3)',                            type: 'number', min: 0, max: 3, step: 1 },
    { id: 'neuro',         label: 'Неврология (0-3)',                        type: 'number', min: 0, max: 3, step: 1 },
  ],
  compute: (v) => {
    const s = (['perfusion','cardiac','respiratory','eye','skeletal','neuro'] as const)
      .map((k) => Number(v[k]) || 0).reduce((a, b) => a + b, 0);

    let color = '#22C55E';
    let risk = 'Низкий риск — лёгкая травма';
    if (s >= 5) { color = '#F59E0B'; risk = 'Умеренная травма'; }
    if (s >= 9) { color = '#EF4444'; risk = 'Тяжёлая травма'; }
    if (s >= 14) { color = '#991B1B'; risk = 'Критическая (смертность > 50 %)'; }

    return {
      value: `${s}`,
      unit: 'ATT (0-18)',
      interpretation: `ATT ${s} / 18 — ${risk}`,
      color,
      details: `Animal Trauma Triage (ATT) score — VetCOT. Каждая категория 0-3. При ATT ≥ 5 необходимо экстренное вмешательство; ATT ≥ 9 коррелирует с высокой смертностью.`,
      actions: [
        s >= 5 ? 'Госпитализация в отделение интенсивной терапии' : 'Амбулаторное наблюдение',
        s >= 5 ? 'Сосудистый доступ × 2, кислород, анальгезия (метадон/фентанил)' : '',
        s >= 9 ? 'FAST / TFAST-УЗИ, рентген грудной клетки + таз/брюшная полость' : '',
        s >= 9 ? 'Инфузия кристаллоидов болюс 10-20 мл/кг (собака), 5-10 мл/кг (кот)' : '',
        s >= 14 ? 'Срочный хирург, трансфузия крови (PCV < 25 %, лактат > 4)' : '',
        'Мониторинг: АД, ЭКГ, SpO₂, диурез; повтор ATT через 1-2 ч',
      ].filter(Boolean),
      caveats: [
        'ATT валидирован на собаках (Rockar 1994) и позже на кошках (Ateca 2014)',
        'Первая оценка при поступлении; повторять каждые 2-4 ч для тренда',
        'Связан с VetCOT (Veterinary Committee on Trauma) регистром',
        'Не замещает клиническое суждение — быстро выявляет «red flag» пациентов',
        'MGCS (Modified Glasgow Coma Scale) для детализации неврологии',
      ],
      scale: {
        segments: [
          { min: 0, max: 5, label: 'Лёгкая', color: '#22C55E' },
          { min: 5, max: 9, label: 'Умеренная', color: '#F59E0B' },
          { min: 9, max: 14, label: 'Тяжёлая', color: '#EF4444' },
          { min: 14, max: 19, label: 'Критическая', color: '#991B1B' },
        ],
        current: s,
        unit: 'балл',
      },
      related: [
        { id: 'asa-vet', title: 'ASA (вет)' },
        { id: 'acvim', title: 'ACVIM staging' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'Rockar RA, Drobatz KS, Shofer FS. Development of a scoring system for the veterinary trauma patient. J Vet Emerg Crit Care 1994;4:77-83. · VetCOT 2013.',
  countries: 'США (VetCOT)',
  presets: [
    { label: 'Лёгкая травма', values: { perfusion: 0, cardiac: 0, respiratory: 1, eye: 1, skeletal: 1, neuro: 0 } },
    { label: 'ДТП собака', values: { perfusion: 2, cardiac: 1, respiratory: 2, eye: 2, skeletal: 2, neuro: 1 } },
    { label: 'Полиорганная', values: { perfusion: 3, cardiac: 3, respiratory: 3, eye: 3, skeletal: 2, neuro: 3 } },
  ],
  info: `### Для чего используется
**VetCOT Animal Trauma Triage (ATT) score** — быстрая оценка тяжести политравмы у собак и кошек в приёмном отделении. Связан с регистром VetCOT (Veterinary Committee on Trauma).

### Категории (каждая 0-3)
| # | Система | 0 — норма | 3 — критично |
|---|---|---|---|
| 1 | Перфузия | Норма | Декомпенсация / шок |
| 2 | Сердце / дых. | Норма | Арест |
| 3 | Дыхание | Спокойное | Апноэ |
| 4 | Глаза / мышцы / кожа | Целы | Обширные разрывы |
| 5 | Скелет | Целостен | Множественные открытые переломы |
| 6 | Неврология | Ясное | Кома |

### Интерпретация
| ATT | Тактика | Смертность |
|---|---|---|
| 0-4 | Амбулаторно / наблюдение | < 5 % |
| 5-8 | ICU | 10-25 % |
| 9-13 | Экстренная хирургия | 30-50 % |
| ≥ 14 | Критическая | > 50 % |

### Применение
- Triage при поступлении травмы
- Оценка каждые 2-4 ч — динамика
- Решение о госпитализации / ИТ

### Источник
Rockar 1994 (собаки), Ateca 2014 (кошки). VetCOT Registry (UW Madison).`,
};
export default runner;
