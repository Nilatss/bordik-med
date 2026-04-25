// @ts-nocheck
/** Runner: purina-fediaf */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'species',
      label: 'Вид',
      type: 'select',
      options: [
        { value: 'dog', label: 'Собака' },
        { value: 'cat', label: 'Кошка' },
      ],
    },
    {
      id: 'weight',
      hint: 'Вес в кг (без одежды)',
      label: 'Масса тела (кг)',
      type: 'number',
      unit: 'кг',
      min: 0.5,
      max: 100,
    },
    {
      id: 'stage',
      label: 'Физиологический статус',
      type: 'select',
      options: [
        { value: 'neutered', label: 'Кастрирован, взрослый' },
        { value: 'intact', label: 'Интактный, взрослый' },
        { value: 'weightloss', label: 'Снижение веса' },
        { value: 'puppy4', label: 'Щенок / котёнок < 4 мес' },
        { value: 'puppy12', label: 'Щенок / котёнок 4-12 мес' },
        { value: 'gestation', label: 'Беременность (последняя треть)' },
        { value: 'lactation', label: 'Лактация' },
        { value: 'senior', label: 'Старший (> 7 лет)' },
      ],
    },
  ],
  compute: (v) => {
    const sp = String(v.species);
    const w = Number(v.weight) || 0;
    const st = String(v.stage);

    const rer = w > 0 ? (w < 2 || w > 30 ? 30 * w + 70 : 70 * Math.pow(w, 0.75)) : 0;

    const factorMap: Record<string, { dog: number; cat: number; label: string }> = {
      neutered:   { dog: 1.6, cat: 1.2, label: 'Кастрированный взрослый' },
      intact:     { dog: 1.8, cat: 1.4, label: 'Интактный взрослый' },
      weightloss: { dog: 1.0, cat: 0.8, label: 'Снижение веса' },
      puppy4:     { dog: 3.0, cat: 2.5, label: 'Щенок / котёнок < 4 мес' },
      puppy12:    { dog: 2.0, cat: 2.0, label: 'Щенок / котёнок 4-12 мес' },
      gestation:  { dog: 3.0, cat: 2.0, label: 'Беременность' },
      lactation:  { dog: 4.0, cat: 3.5, label: 'Лактация' },
      senior:     { dog: 1.4, cat: 1.1, label: 'Старший' },
    };
    const f = factorMap[st] || factorMap.neutered;
    const factor = sp === 'cat' ? f.cat : f.dog;
    const der = Math.round(rer * factor);
    const rerR = Math.round(rer);

    return {
      value: `RER ${rerR} · DER ${der}`,
      unit: 'ккал/сут',
      interpretation: `RER ${rerR} ккал · DER ${der} ккал (фактор ×${factor})`,
      color: '#4B8DF5',
      details: `Вид: ${sp === 'cat' ? 'кошка' : 'собака'} · масса ${w} кг · статус: ${f.label}\n\nRER (Resting Energy Requirement) = ${w < 2 || w > 30 ? '30 × BW + 70' : '70 × BW^0,75'} = ${rerR} ккал/сут\n\nDER (Daily Energy Requirement) = RER × ${factor} = ${der} ккал/сут\n\n*FEDIAF Nutritional Guidelines 2021 · Purina BCS*`,
      actions: [
        `Рассчитать объём корма: ${der} ккал ÷ калорийность корма (ккал/г)`,
        'Разделить на 2 приёма (собаки) / 3-4 приёма (кошки, щенки)',
        'Взвешивать еженедельно первые 2 недели после изменения рациона',
        w > 0 && st === 'weightloss' ? 'Целевая масса × фактор 1,0 (собаки) / 0,8 (коты)' : '',
        'При несоответствии BCS корректировать DER ±10 % каждые 2 нед',
      ].filter(Boolean),
      caveats: [
        'FEDIAF — европейский стандарт (аналог AAFCO в США)',
        'Формула RER 70 × BW^0,75 — для 2-30 кг; вне диапазона: 30 × BW + 70',
        'Факторы DER — ориентировочные, индивидуальная вариабельность ± 20 %',
        'Беременность/лактация — постепенно увеличивать с 5-й нед',
        'Ожирение — считать DER на целевую массу, не текущую',
      ],
      scale: {
        segments: [
          { min: 0, max: 300, label: 'Малый', color: '#60A5FA' },
          { min: 300, max: 800, label: 'Средний', color: '#22C55E' },
          { min: 800, max: 1500, label: 'Крупный', color: '#F59E0B' },
          { min: 1500, max: 5000, label: 'Гигант', color: '#EF4444' },
        ],
        current: der,
        unit: 'ккал',
      },
      related: [
        { id: 'rer', title: 'RER (формула)' },
        { id: 'bcs', title: 'BCS (9-point)' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'FEDIAF Nutritional Guidelines for Complete and Complementary Pet Food for Cats and Dogs. Brussels 2021. · Purina BCS Chart.',
  countries: 'ЕС (FEDIAF · Purina)',
  presets: [
    { label: 'Кот 4 кг кастрат', values: { species: 'cat', weight: 4, stage: 'neutered' } },
    { label: 'Собака 20 кг интакт', values: { species: 'dog', weight: 20, stage: 'intact' } },
    { label: 'Щенок 5 кг < 4 мес', values: { species: 'dog', weight: 5, stage: 'puppy4' } },
  ],
  info: `### Для чего используется
**Purina + FEDIAF** — европейский стандарт расчёта энергетических потребностей собак и кошек. Сочетает BCS (Purina 9-point) с FEDIAF Nutritional Guidelines (ЕС).

### Формулы
**RER** (resting energy requirement):
- 2-30 кг: \`RER = 70 × BW^0,75 ккал/сут\`
- < 2 или > 30 кг: \`RER = 30 × BW + 70\`

**DER** = RER × фактор активности

### Факторы DER (FEDIAF 2021)
| Статус | Собака | Кошка |
|---|---|---|
| Кастр. взрослый | 1,6 | 1,2 |
| Интактный взрослый | 1,8 | 1,4 |
| Снижение веса | 1,0 | 0,8 |
| Щенок < 4 мес | 3,0 | 2,5 |
| Щенок 4-12 мес | 2,0 | 2,0 |
| Беременность | 3,0 | 2,0 |
| Лактация | 4,0 | 3,5 |
| Старший | 1,4 | 1,1 |

### Применение
- Подбор порции промышленного / натурального рациона
- Контроль веса при BCS 6+ / 3-
- План питания беременных / лактирующих
- Планирование роста щенков (rolling weight curve)

### Источник
FEDIAF 2021 (European Pet Food Industry Federation) · Nestlé Purina BCS Chart.`,
};
export default runner;
