// @ts-nocheck
/** Runner: ru-lab — Российские лабораторные стандарты */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

type RuTest = {
  label: string;
  unit: string;
  low: number; high: number;
  altUnit?: string;
  altFactor?: number;
  note: string;
};

const TESTS: Record<string, RuTest> = {
  hb_m:   { label: 'Гемоглобин (М)',     unit: 'г/л',     low: 130, high: 170, note: 'Invitro: 132–173' },
  hb_f:   { label: 'Гемоглобин (Ж)',     unit: 'г/л',     low: 120, high: 150, note: 'Invitro: 117–155' },
  wbc:    { label: 'Лейкоциты',          unit: '×10⁹/л',  low: 4.0, high: 9.0, note: 'Helix/Гемотест: 4,0–9,0' },
  plt:    { label: 'Тромбоциты',         unit: '×10⁹/л',  low: 180, high: 320, note: 'Invitro: 150–400' },
  glu:    { label: 'Глюкоза плазма',     unit: 'ммоль/л', low: 3.9, high: 6.1, altUnit: 'мг/дл', altFactor: 18.0182, note: 'ВОЗ/РАЭ' },
  cr_m:   { label: 'Креатинин (М)',      unit: 'мкмоль/л',low: 62,  high: 115, altUnit: 'мг/дл', altFactor: 1/88.4, note: 'Приказ 380н' },
  cr_f:   { label: 'Креатинин (Ж)',      unit: 'мкмоль/л',low: 53,  high: 97,  altUnit: 'мг/дл', altFactor: 1/88.4, note: 'Приказ 380н' },
  alt:    { label: 'АЛТ (Ж)',            unit: 'Ед/л',    low: 0,   high: 31,  note: 'М: до 41' },
  ast:    { label: 'АСТ (Ж)',            unit: 'Ед/л',    low: 0,   high: 31,  note: 'М: до 40' },
  tsh:    { label: 'ТТГ',                unit: 'мМЕ/л',   low: 0.4, high: 4.0, note: 'РАЭ 2020; беременные I: 0,1–2,5' },
  chol:   { label: 'Холестерин общий',   unit: 'ммоль/л', low: 3.2, high: 5.2, altUnit: 'мг/дл', altFactor: 38.67, note: 'РКО; цель <5,0' },
};

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'test', label: 'Тест', type: 'select', options: Object.entries(TESTS).map(([v, t]) => ({ value: v, label: t.label })) },
    { id: 'value', label: 'Значение', type: 'number', min: 0, max: 10000, step: 0.01 },
    { id: 'age_group', label: 'Возрастная группа', type: 'select', options: [
      { value: 'adult', label: 'Взрослый' },
      { value: 'child', label: 'Ребёнок 1–14' },
      { value: 'infant', label: 'Грудной (<1 года)' },
    ] },
  ],
  compute: (v) => {
    const t = TESTS[v.test] || TESTS.glu;
    const val = Number(v.value) || 0;
    let interpretation = 'В пределах нормы (РФ)';
    let color = '#22C55E';
    if (val < t.low) { interpretation = 'Ниже нормы'; color = '#F59E0B'; }
    else if (val > t.high) { interpretation = 'Выше нормы'; color = '#F59E0B'; }

    const altStr = t.altUnit && t.altFactor ? ` ≈ ${(val * t.altFactor).toFixed(2)} ${t.altUnit}` : '';

    return {
      value: `${val}${altStr}`,
      unit: t.unit,
      interpretation,
      color,
      details: `**${t.label}**: ${t.low}–${t.high} ${t.unit}. ${t.note}`,
      actions: [
        'Сравнить с референсом конкретной лаборатории (Invitro / Helix / ДНКом / Гемотест)',
        'Учесть возраст, пол, беременность, физическую нагрузку',
        color === '#F59E0B' ? 'Повторить через 1–2 недели при необходимости' : null,
      ].filter(Boolean),
      caveats: [
        'Референсы РФ основаны на Приказ МЗ РФ №380н (2000) и ГОСТ Р 53079 (2008)',
        'Разные сети (Invitro, Helix, ДНКом, Гемотест, KDL) используют разные платформы',
        'Тиреоидные референсы РАЭ 2020 строже международных (верхняя граница 4,0 vs 4,2–5,0)',
        'Для детей — справочник Н. П. Шабалова или Tietz Pediatric',
        'Единицы СИ (ммоль/л) — стандарт РФ; мг/дл — американская традиция',
      ],
      relatedCourses: [
        { id: '304.1', title: 'Лаб. диагностика' },
        { id: '303.1', title: 'Гематология' },
      ],
      related: [
        { id: 'clsi', title: 'CLSI' },
        { id: 'mayo-arup', title: 'Mayo/ARUP' },
      ],
    };
  },
  reference: 'Приказ МЗ РФ №380н от 25.12.1997 (с обновлениями). ГОСТ Р 53079-2008. Справочники Invitro, Helix, ДНКом, Гемотест, KDL. РАЭ 2020 (тиреоидология).',
  countries: 'Российская Федерация',
  presets: [
    { label: 'Норма глюкозы', values: { test: 'glu', value: 5.2, age_group: 'adult' } },
    { label: 'Анемия Ж', values: { test: 'hb_f', value: 95, age_group: 'adult' } },
    { label: 'Гиперхолестеринемия', values: { test: 'chol', value: 6.8, age_group: 'adult' } },
  ],
  info: `### Для чего используется
Справочник российских лабораторных референсных интервалов для клинической интерпретации анализов. Основан на нормативных документах и справочниках крупнейших лабораторных сетей РФ.

### Нормативная база
| Документ | Содержание |
|---|---|
| Приказ МЗ РФ №380н | Организация КДЛ, референсы |
| ГОСТ Р 53079-2008 | Обеспечение качества клинических лабораторных исследований |
| РАЭ 2020 | Тиреоидология (ТТГ, св. Т4) |
| РКО 2023 | Липиды, ССО-риск |

### Крупнейшие лабораторные сети РФ
| Сеть | Особенности |
|---|---|
| Invitro | Крупнейшая, ≈1800 офисов, Roche/Abbott |
| Helix | Санкт-Петербург, Siemens/Beckman |
| ДНКом | Фокус на генетике/иммунологии |
| Гемотест | ≈1000 офисов, массмаркет |
| KDL | Премиум-сегмент, широкий каталог |

### Единицы СИ vs традиционные
| Тест | СИ (РФ) | США | Коэфф. |
|---|---|---|---|
| Глюкоза | ммоль/л | мг/дл | × 18,0182 |
| Креатинин | мкмоль/л | мг/дл | × 0,0113 |
| Билирубин | мкмоль/л | мг/дл | × 0,0585 |
| Холестерин | ммоль/л | мг/дл | × 38,67 |
| Гемоглобин | г/л | г/дл | × 0,1 |

### Ограничения
- Референсы различаются между лабораторными сетями (разные анализаторы, популяции)
- РФ-референсы для детей — отдельные справочники (Шабалов, Детская медицина)
- Триместр-специфичные диапазоны (ТТГ, железо, D-димер) критичны в акушерстве
- Бариатрические и гериатрические нормы требуют отдельной трактовки`,
};

export default runner;
