// @ts-nocheck
/** Runner: straw10 — стадирование репродуктивного старения (STRAW+10, Harlow 2012) */
import type {
  ScoreTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 7,
  inputs: [
    {
      id: 'stage',
      label: 'Стадия',
      type: 'select',
      options: [
        { value: 'rep', label: '−5 ... −3: Репродуктивный период (регулярные циклы)', points: 0 },
        { value: 'lateRep', label: '−2: Поздний репродуктивный (изменение длительности/обильности)', points: 1 },
        { value: 'earlyMT', label: '−1: Ранняя менопаузальная переходная (вариация ≥ 7 сут ≥ 2 циклов)', points: 2 },
        { value: 'lateMT', label: '+1a: Поздняя MT (аменорея ≥ 60 сут; FMP близка)', points: 3 },
        { value: 'earlyPM1', label: '+1b: Ранняя постменопауза 1–2 года после FMP', points: 4 },
        { value: 'earlyPM2', label: '+1c: Ранняя постменопауза 3–6 лет после FMP', points: 5 },
        { value: 'latePM', label: '+2: Поздняя постменопауза (> 6 лет от FMP)', points: 6 },
      ],
    },
  ],
  bands: [
    { min: 0, max: 0, label: 'Репродуктивный период', color: '#22C55E', interpretation: 'FSH, АМГ — нормальные; регулярная овуляция.', actions: ['Рутинная гинекологическая помощь'] },
    { min: 1, max: 1, label: '−2 Поздний репродуктивный', color: '#86EFAC', interpretation: 'Лёгкое сокращение фолликулярной фазы, снижение АМГ, рост FSH.', actions: ['При планировании беременности — обсудить криоконсервацию'] },
    { min: 2, max: 2, label: '−1 Ранняя MT', color: '#F59E0B', interpretation: 'Вариация длины цикла ≥ 7 дней ≥ 2 раз в 10 циклах. FSH вариабельно повышен.', actions: ['Обсудить контрацепцию', 'Оценить вазомоторные симптомы'] },
    { min: 3, max: 3, label: '+1a Поздняя MT', color: '#F59E0B', interpretation: 'Аменорея ≥ 60 дней; до FMP < 1–3 лет.', actions: ['Симптоматическое лечение', 'МГТ при выраженных симптомах'] },
    { min: 4, max: 4, label: '+1b Ранняя постменопауза (1–2 г)', color: '#EF4444', interpretation: 'FSH стабильно > 30 МЕ/л; пик симптомов.', actions: ['МГТ — терапевтическое окно', 'Скрининг остеопороза (DXA)'] },
    { min: 5, max: 5, label: '+1c Ранняя постменопауза (3–6 г)', color: '#EF4444', interpretation: 'Сохраняется высокая активность симптомов.', actions: ['Продолжить МГТ по показаниям', 'Оценка кардиоваскулярного риска'] },
    { min: 6, max: 6, label: '+2 Поздняя постменопауза', color: '#DC2626', interpretation: '> 6 лет после FMP; атрофические процессы.', actions: ['Локальные эстрогены при GSM', 'FRAX / DXA; кардиоваскулярный скрининг'] },
  ],
  reference:
    'Harlow SD, Gass M, Hall JE et al. Executive Summary of the Stages of Reproductive Aging Workshop + 10. J Clin Endocrinol Metab 2012;97:1159-1168.',
  countries: 'Международный (STRAW+10)',
  presets: [
    { label: 'Регулярные циклы', values: { stage: 'rep' } },
    { label: 'Ранняя MT', values: { stage: 'earlyMT' } },
    { label: 'Ранняя постменопауза', values: { stage: 'earlyPM1' } },
    { label: 'Поздняя постменопауза', values: { stage: 'latePM' } },
  ],
  caveats: [
    'FMP (final menstrual period) устанавливается ретроспективно после 12 месяцев аменореи',
    'АМГ, FSH, ингибин B — дополнительные биомаркёры',
    'STRAW+10 применима при интактной матке; после гистерэктомии — по биомаркёрам',
  ],
  related: [
    { id: 'greene', title: 'Greene / MRS' },
    { id: 'frax-men', title: 'FRAX' },
  ],
  relatedCourses: [
    { id: '301.4', title: 'Эндокринология' },
    { id: '203.9', title: 'Гинекология' },
  ],
  info: `### STRAW+10 (Harlow 2012)
Стандартизованное стадирование репродуктивного старения.

### Стадии
- **−5 до −3** Репродуктивный период
- **−2** Поздний репродуктивный
- **−1** Ранняя менопаузальная переходная (MT)
- **+1a** Поздняя MT (> 60 дней аменорея)
- **+1b** Ранняя постменопауза (1–2 г)
- **+1c** Ранняя постменопауза (3–6 л)
- **+2** Поздняя постменопауза (> 6 л)

### Биомаркёры
FSH нарастает; АМГ снижается; фолликулов < 5 на UZ; ингибин B падает.

### Источник
Harlow SD. J Clin Endocrinol Metab 2012.`,
};

export default runner;
