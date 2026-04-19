// @ts-nocheck
/** Runner: kts — Kampala Trauma Score (Kobusingye 2000) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 16,
  inputs: [
    {
      id: 'age',
      label: 'Возраст',
      type: 'select',
      options: [
        { value: '1', label: '< 5 или > 55 лет', points: 1 },
        { value: '2', label: '5–55 лет', points: 2 },
      ],
    },
    {
      id: 'injuries',
      label: 'Число серьёзных травм',
      type: 'select',
      options: [
        { value: '1', label: '≥ 3 серьёзных', points: 1 },
        { value: '2', label: '2', points: 2 },
        { value: '3', label: '1', points: 3 },
        { value: '4', label: '0', points: 4 },
      ],
    },
    {
      id: 'sbp',
      label: 'САД',
      type: 'select',
      options: [
        { value: '4', label: '> 89 мм рт.ст.', points: 4 },
        { value: '3', label: '50–89', points: 3 },
        { value: '2', label: '1–49', points: 2 },
        { value: '1', label: '0', points: 1 },
      ],
    },
    {
      id: 'rr',
      label: 'ЧДД',
      type: 'select',
      options: [
        { value: '3', label: '10–29', points: 3 },
        { value: '2', label: '> 29', points: 2 },
        { value: '1', label: '< 10', points: 1 },
      ],
    },
    {
      id: 'neuro',
      label: 'Неврологический статус (AVPU)',
      type: 'select',
      options: [
        { value: '3', label: 'A — Alert', points: 3 },
        { value: '2', label: 'V — отвечает на голос', points: 2 },
        { value: '1', label: 'P — реагирует на боль', points: 1 },
        { value: '0', label: 'U — без сознания', points: 0 },
      ],
    },
  ],
  bands: [
    {
      min: 14, max: 16,
      label: 'Низкий риск (KTS 14–16)',
      color: '#22C55E',
      description: 'Летальность < 5%. Стандартный трауматологический уход.',
      actions: ['Стандартная трауматологическая оценка', 'Повторить через 1 ч'],
    },
    {
      min: 11, max: 13,
      label: 'Умеренный риск (KTS 11–13)',
      color: '#FACC15',
      description: 'Летальность 5–25%. Госпитализация, мониторинг.',
      details: 'KTS < 14 — статистически значимое повышение смертности и длительности госпитализации.',
      actions: ['Госпитализация, мониторинг', 'Повторная ФАСТ, лабораторный мониторинг'],
    },
    {
      min: 6, max: 10,
      label: 'Высокий риск (KTS 6–10)',
      color: '#EF4444',
      description: 'Летальность 25–50%. Trauma team, ОРИТ.',
      actions: ['Trauma team activation', 'ОРИТ, ИВЛ, MTP при кровопотере'],
    },
    {
      min: 0, max: 5,
      label: 'Критический риск (KTS ≤ 5)',
      color: '#991B1B',
      description: 'Летальность > 50%. Damage control, реанимация.',
    },
  ],
  caveats: [
    'Разработан для ресурсно-ограниченных систем (LMIC); использует AVPU вместо GCS',
    'Проще и быстрее RTS, но менее точен в прогнозе smartности (AUROC ~0.83 vs 0.87 у RTS)',
    'Подтверждён в Уганде, Кении, Нигерии, Индии',
    '"Серьёзная травма" = перелом, ожог, открытая рана, проникающее, висцеральное',
  ],
  related: [
    { id: 'rts', title: 'RTS' },
    { id: 'iss', title: 'ISS' },
    { id: 'triss', title: 'TRISS' },
    { id: 'start-civ', title: 'START / SALT' },
  ],
  relatedCourses: [
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Kobusingye OC, Lett RR. Hospital-based trauma registries in Uganda. J Trauma 2000;48:498–502. Weeks SR et al. Kampala Trauma Score performance. World J Surg 2014;38:1550.',
  countries: 'LMIC (Уганда, Кения, LMIC-адаптация)',
  presets: [
    { label: 'Взрослый, САД 120, AVPU-A', values: { age: '2', injuries: '4', sbp: '4', rr: '3', neuro: '3' } },
    { label: 'Пожилой, шок, оглушён', values: { age: '1', injuries: '2', sbp: '3', rr: '2', neuro: '2' } },
    { label: 'Критический без сознания', values: { age: '2', injuries: '1', sbp: '2', rr: '1', neuro: '0' } },
  ],
  info: `### Для чего используется
**Kampala Trauma Score (Kobusingye, 2000)** — упрощённая физиологическая шкала тяжести травмы, разработанная для стран с ограниченными ресурсами (LMIC). Альтернатива RTS / TRISS там, где нет GCS или лабораторий.

### Параметры (5 компонентов, сумма 5–16)
| Параметр | Значения | Баллы |
|---|---|---|
| Возраст | 5–55 / иначе | 2 / 1 |
| Число серьёзных травм | 0 / 1 / 2 / ≥3 | 4 / 3 / 2 / 1 |
| САД | >89 / 50–89 / 1–49 / 0 | 4 / 3 / 2 / 1 |
| ЧДД | 10–29 / >29 / <10 | 3 / 2 / 1 |
| AVPU | A / V / P / U | 3 / 2 / 1 / 0 |

### Интерпретация
| KTS | Летальность | Тактика |
|---|---|---|
| 14–16 | < 5% | амбулаторно |
| 11–13 | 5–25% | госпитализация |
| 6–10 | 25–50% | ОРИТ |
| ≤ 5 | > 50% | damage control |

### Преимущества
- Не требует GCS, лабораторных данных
- Быстро оценивается не-врачом (парамедик, триажная медсестра)
- Валидирован в Африке, Азии, Центральной Америке

### Ограничения
- Менее точен, чем TRISS (AUROC 0.83 vs 0.87)
- "Серьёзная травма" — субъективный критерий
- Не учитывает механизм и анатомию

### Источник
Kobusingye OC, Lett RR. *Hospital-based trauma registries in Uganda.* J Trauma 2000;48:498
`,
};

export default runner;
