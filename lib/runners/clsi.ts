// @ts-nocheck
/** Runner: clsi — CLSI reference intervals + critical values */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

type TestDef = {
  label: string;
  unit: string;
  low: number; high: number;
  critLow: number; critHigh: number;
  note?: string;
};

const TESTS: Record<string, TestDef> = {
  na:      { label: 'Натрий (Na)',          unit: 'ммоль/л', low: 136, high: 145, critLow: 120, critHigh: 160 },
  k:       { label: 'Калий (K)',            unit: 'ммоль/л', low: 3.5, high: 5.0, critLow: 2.8, critHigh: 6.2 },
  hb_m:    { label: 'Гемоглобин (М)',       unit: 'г/л',     low: 137, high: 175, critLow: 70,  critHigh: 200 },
  hb_f:    { label: 'Гемоглобин (Ж)',       unit: 'г/л',     low: 120, high: 155, critLow: 70,  critHigh: 200 },
  wbc:     { label: 'Лейкоциты',            unit: '×10⁹/л',  low: 4.0, high: 10.0, critLow: 2.0, critHigh: 30 },
  plt:     { label: 'Тромбоциты',           unit: '×10⁹/л',  low: 150, high: 400, critLow: 50,  critHigh: 1000 },
  glu:     { label: 'Глюкоза натощак',      unit: 'ммоль/л', low: 3.9, high: 5.6, critLow: 2.5, critHigh: 22 },
  cr_m:    { label: 'Креатинин (М)',        unit: 'мкмоль/л',low: 62,  high: 106, critLow: 0,   critHigh: 500 },
  cr_f:    { label: 'Креатинин (Ж)',        unit: 'мкмоль/л',low: 44,  high: 80,  critLow: 0,   critHigh: 500 },
  alt:     { label: 'АЛТ',                  unit: 'Ед/л',    low: 7,   high: 45,  critLow: 0,   critHigh: 1000 },
  tsh:     { label: 'ТТГ',                  unit: 'мМЕ/л',   low: 0.4, high: 4.0, critLow: 0.01,critHigh: 100 },
};

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'test', label: 'Тест', type: 'select', options: Object.entries(TESTS).map(([v, t]) => ({ value: v, label: t.label })) },
    { id: 'value', label: 'Значение', type: 'number', min: 0, max: 10000, step: 0.01, quickValues: [1, 10, 100] },
    { id: 'age_group', label: 'Возраст', type: 'select', options: [
      { value: 'adult', label: 'Взрослый (18–65)' },
      { value: 'elderly', label: 'Пожилой (>65)' },
      { value: 'ped', label: 'Ребёнок (5–17)' },
    ] },
  ],
  compute: (v) => {
    const t = TESTS[v.test] || TESTS.na;
    const val = Number(v.value) || 0;
    let interpretation = 'В норме';
    let color = '#22C55E';
    if (val < t.critLow) { interpretation = 'Критически низкое'; color = '#EF4444'; }
    else if (val > t.critHigh) { interpretation = 'Критически высокое'; color = '#EF4444'; }
    else if (val < t.low) { interpretation = 'Ниже нормы'; color = '#F59E0B'; }
    else if (val > t.high) { interpretation = 'Выше нормы'; color = '#F59E0B'; }

    return {
      value: `${val}`,
      unit: t.unit,
      interpretation,
      color,
      details: `${t.label}: норма ${t.low}–${t.high} ${t.unit}. Критические: <${t.critLow} или >${t.critHigh}.`,
      actions: [
        color === '#EF4444' ? 'Критическое значение — немедленно уведомить лечащего врача (CLSI GP47-A)' : null,
        color === '#F59E0B' ? 'Повторить измерение, оценить клиническую картину' : null,
        'Проверить преаналитику: гемолиз, липемия, время стояния пробы',
        'Сравнить с предыдущими значениями (delta-check CLSI EP33)',
      ].filter(Boolean),
      caveats: [
        'Референсные интервалы CLSI EP28-A3c — базируются на референсной популяции; лаборатория должна верифицировать свои',
        'Критические значения (CLSI GP47) — уведомление в пределах заданного времени',
        'Возраст, пол, беременность, этнос могут смещать диапазоны',
        'Гемолиз повышает K, ЛДГ, АСТ; липемия искажает оптические методы',
      ],
      relatedCourses: [
        { id: '304.1', title: 'Лаб. диагностика' },
        { id: '303.1', title: 'Гематология' },
      ],
      related: [
        { id: 'mayo-arup', title: 'Mayo/ARUP' },
        { id: 'ru-lab', title: 'РФ лабораторные' },
      ],
    };
  },
  reference: 'CLSI EP28-A3c (Defining, Establishing, and Verifying Reference Intervals). CLSI GP47-A (Management of Critical- and Significant-Risk Results).',
  countries: 'Международный (CLSI, США)',
  presets: [
    { label: 'Норма Na', values: { test: 'na', value: 140, age_group: 'adult' } },
    { label: 'Гипергликемия', values: { test: 'glu', value: 12, age_group: 'adult' } },
    { label: 'Крит. K', values: { test: 'k', value: 6.8, age_group: 'adult' } },
  ],
  info: `### Для чего используется
**CLSI** (Clinical and Laboratory Standards Institute) — международный стандарт определения референсных интервалов и критических значений в клинической лаборатории.

### Ключевые документы
| Документ | Тема |
|---|---|
| EP28-A3c | Reference intervals (установление, верификация) |
| GP47-A | Management of critical results (уведомление клинициста) |
| EP33 | Delta-check (контроль преемственности) |
| C28-A3 | Определение референтных значений |

### Общие взрослые референсы (пример)
| Тест | Норма | Критич. |
|---|---|---|
| Na | 136–145 ммоль/л | <120, >160 |
| K | 3,5–5,0 ммоль/л | <2,8, >6,2 |
| Hb М | 137–175 г/л | <70, >200 |
| Hb Ж | 120–155 г/л | <70, >200 |
| Глюкоза | 3,9–5,6 ммоль/л | <2,5, >22 |
| ТТГ | 0,4–4,0 мМЕ/л | <0,01, >100 |

### Правила CLSI для критических значений
1. Лаборатория ведёт список «critical values»
2. Устный + письменный call к врачу
3. Документирование времени уведомления
4. Delta-check на наличие значимых изменений

### Ограничения
- Референсы зависят от метода; каждая лаборатория верифицирует свой диапазон (CLSI EP28-A3c допускает 20 здоровых лиц для верификации)
- Педиатрические, беременные, гериатрические интервалы могут значительно отличаться`,
};

export default runner;
