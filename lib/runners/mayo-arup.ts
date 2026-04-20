// @ts-nocheck
/** Runner: mayo-arup — Mayo Clinic / ARUP reference intervals */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

type TestRef = {
  label: string;
  unit: string;
  low: number; high: number;
  specimen: string;
  note: string;
  category: string;
};

const TESTS: Record<string, TestRef> = {
  ca:      { label: 'Кальций общий',        unit: 'мг/дл',   low: 8.6, high: 10.2, specimen: 'Сыворотка, SST', note: 'Коррекция по альбумину', category: 'chem' },
  mg:      { label: 'Магний',               unit: 'мг/дл',   low: 1.7, high: 2.3,  specimen: 'Сыворотка', note: 'Гемолиз завышает', category: 'chem' },
  phos:    { label: 'Фосфат',               unit: 'мг/дл',   low: 2.5, high: 4.5,  specimen: 'Сыворотка натощак', note: 'Циркадный ритм', category: 'chem' },
  crp:     { label: 'СРБ',                  unit: 'мг/л',    low: 0,   high: 8,    specimen: 'Сыворотка', note: 'hsCRP для ССО-риска', category: 'chem' },
  tsh:     { label: 'ТТГ (Mayo)',           unit: 'мМЕ/л',   low: 0.3, high: 4.2,  specimen: 'Сыворотка', note: 'Триместр-специфичные у беременных', category: 'endo' },
  ft4:     { label: 'Свободный T4',         unit: 'нг/дл',   low: 0.8, high: 1.8,  specimen: 'Сыворотка', note: '-', category: 'endo' },
  cortisol_am: { label: 'Кортизол AM',      unit: 'мкг/дл',  low: 5,   high: 25,   specimen: 'Сыворотка 08:00', note: 'Тест подавления дексаметазоном', category: 'endo' },
  inr:     { label: 'МНО',                  unit: '',        low: 0.9, high: 1.1,  specimen: 'Цитратная плазма 3,2 %', category: 'hem', note: 'Терапия варфарином: цель 2,0–3,0' },
  ana:     { label: 'АНА титр',             unit: 'титр',    low: 0,   high: 80,   specimen: 'Сыворотка', note: '≥1:160 — высокий', category: 'imm' },
};

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'category', label: 'Категория', type: 'select', options: [
      { value: 'chem', label: 'Биохимия' },
      { value: 'hem', label: 'Гематология/коагулология' },
      { value: 'endo', label: 'Эндокринология' },
      { value: 'imm', label: 'Иммунология' },
    ] },
    { id: 'test', label: 'Тест', type: 'select', options: Object.entries(TESTS).map(([v, t]) => ({ value: v, label: t.label })) },
    { id: 'value', label: 'Значение', type: 'number', min: 0, max: 10000, step: 0.01 },
  ],
  compute: (v) => {
    const t = TESTS[v.test] || TESTS.ca;
    const val = Number(v.value) || 0;
    let interpretation = 'В пределах референса';
    let color = '#22C55E';
    if (val < t.low) { interpretation = 'Ниже референса'; color = '#F59E0B'; }
    else if (val > t.high) { interpretation = 'Выше референса'; color = '#F59E0B'; }

    return {
      value: `${val}`,
      unit: t.unit,
      interpretation,
      color,
      details: `**${t.label}**: ${t.low}–${t.high} ${t.unit}. Образец: ${t.specimen}. ${t.note}`,
      actions: [
        'Сравнить с клиникой и предыдущими результатами',
        'Оценить преаналитику: гемолиз, время забора, центрифугирование',
        color === '#F59E0B' ? 'Повторить при подозрительном отклонении' : null,
      ].filter(Boolean),
      caveats: [
        'Mayo и ARUP — крупнейшие американские референс-лаборатории; их интервалы базируются на конкретных платформах (Roche, Beckman, Siemens)',
        'При использовании другой платформы — верифицировать локально',
        'Референсы могут отличаться по возрасту, полу, беременности, этносу',
        'hsCRP точнее стандартного СРБ для ССО-риска',
      ],
      relatedCourses: [
        { id: '304.1', title: 'Лаб. диагностика' },
        { id: '304.3', title: 'Клиническая химия' },
      ],
      related: [
        { id: 'clsi', title: 'CLSI интервалы' },
        { id: 'ru-lab', title: 'РФ референсы' },
      ],
    };
  },
  reference: 'Mayo Clinic Laboratories Test Catalog (mayocliniclabs.com). ARUP Consult (arupconsult.com). Roberts/Rifai Tietz Textbook of Clinical Chemistry 6th ed.',
  countries: 'США (Mayo Clinic, ARUP)',
  presets: [
    { label: 'Кальций норма', values: { category: 'chem', test: 'ca', value: 9.5 } },
    { label: 'Высокий СРБ', values: { category: 'chem', test: 'crp', value: 35 } },
    { label: 'Гипотиреоз ТТГ', values: { category: 'endo', test: 'tsh', value: 8.5 } },
  ],
  info: `### Для чего используется
**Mayo Clinic Laboratories** и **ARUP Laboratories** — крупнейшие референс-лаборатории США, выпускающие онлайн-каталоги тестов с референсными интервалами, клинической интерпретацией и требованиями к образцам.

### Источники
- mayocliniclabs.com — Mayo Clinic Test Catalog
- arupconsult.com — ARUP Consult (клиницистский справочник)
- arup-labs.com — ARUP Test Directory

### Особенности
| Характеристика | Mayo | ARUP |
|---|---|---|
| Основная платформа | Roche, Beckman | Beckman, Siemens |
| Педиатрия | Педиатрические интервалы | CALIPER-партнёр |
| Доступность онлайн | Бесплатно | Бесплатно |

### Популярные тесты
| Тест | Mayo диапазон | Специмен |
|---|---|---|
| ТТГ | 0,3–4,2 мМЕ/л | Сыворотка, SST |
| Витамин D (25-OH) | 20–50 нг/мл | Сыворотка |
| HbA1c | 4,0–5,6 % | EDTA-кровь |
| Ферритин М | 24–336 нг/мл | Сыворотка |
| Ферритин Ж | 11–307 нг/мл | Сыворотка |

### Преаналитика (ключевое)
- Время стояния: кальций, калий, глюкоза — чувствительны
- Гемолиз: ↑K, ↑ЛДГ, ↑АСТ, ↓гаптоглобин
- Липемия: искажает оптические методы (билирубин, креатинин Jaffe)
- Терапия биотином: интерференция в иммунохимических платформах

### Ограничения
- Референсы валидны для конкретной платформы
- Необходимо учитывать возраст, пол, беременность
- Педиатрические и гериатрические диапазоны часто расширены`,
};

export default runner;
