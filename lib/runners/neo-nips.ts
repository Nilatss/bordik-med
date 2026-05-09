/**
 * Runner: neo-nips — Neonatal Infant Pain Scale (NIPS)
 *
 * NEONATOLOGY MODULE A34 (P1).
 *
 * SOURCES:
 *   - Lawrence J et al. Neonatal Netw. 1993;12(6):59-66
 *   - AAP 2016 Committee on Fetus and Newborn — Pain assessment & management
 *   - КР МЗ РФ "Боль у новорождённых" (2024)
 *
 * Bands (NIPS 0-7):
 *   0-2 — Нет / минимальная
 *   3-4 — Умеренная — нефармакологические меры
 *   ≥ 5 — Сильная — анальгезия + локальные анестетики
 *
 * Применима у доношенных и поздних недоношенных (≥ 32 нед).
 * Для глубоко недоношенных предпочтительно PIPP-R.
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 7,
  countries: 'Международный (Lawrence 1993)',
  reference: 'Lawrence J et al. Neonatal Netw 1993;12:59-66.',
  inputs: [
    {
      id: 'face',
      label: 'Выражение лица',
      type: 'select',
      options: [
        { value: '0', label: 'Спокойное', points: 0 },
        { value: '1', label: 'Гримаса', points: 1 },
      ],
    },
    {
      id: 'cry',
      label: 'Плач',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Хныканье', points: 1 },
        { value: '2', label: 'Громкий крик', points: 2 },
      ],
    },
    {
      id: 'breathing',
      label: 'Дыхание',
      type: 'select',
      options: [
        { value: '0', label: 'Спокойное', points: 0 },
        { value: '1', label: 'Изменено: тахипноэ, втяжения', points: 1 },
      ],
    },
    {
      id: 'arms',
      label: 'Руки',
      type: 'select',
      options: [
        { value: '0', label: 'Расслаблены', points: 0 },
        { value: '1', label: 'Согнуты / разогнуты', points: 1 },
      ],
    },
    {
      id: 'legs',
      label: 'Ноги',
      type: 'select',
      options: [
        { value: '0', label: 'Расслаблены', points: 0 },
        { value: '1', label: 'Согнуты / разогнуты', points: 1 },
      ],
    },
    {
      id: 'state',
      label: 'Состояние возбуждения',
      type: 'select',
      options: [
        { value: '0', label: 'Сон / тихое бодрствование', points: 0 },
        { value: '1', label: 'Беспокойство', points: 1 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 2,
      label: 'Нет / минимальная',
      color: '#22C55E',
      description: 'Боль отсутствует или минимальна.',
      actions: [
        'Продолжить нефармакологический комфорт: пеленание, контакт кожа-к-коже',
        'Реоценка после процедуры',
      ],
    },
    {
      min: 3,
      max: 4,
      label: 'Умеренная',
      color: '#F59E0B',
      description: 'Умеренная боль — нефармакологические меры.',
      actions: [
        'Оральная сахароза 24 % (0.5-2 мл за 2 мин до процедуры — pacifier)',
        'Грудное вскармливание / молоко матери; контакт кожа-к-коже',
        'Пеленание (swaddling); facilitated tucking',
        'Реоценка через 5-10 мин после вмешательства',
      ],
    },
    {
      min: 5,
      max: 7,
      label: 'Сильная',
      color: '#EF4444',
      description: 'Сильная боль — пересмотр анальгезии.',
      actions: [
        'Локальные анестетики (EMLA — 60 мин до процедуры; lidocaine для венепункции)',
        'Парацетамол 10 мг/кг PO/PR (max 4-6 раз/сут)',
        'При повторной/процедурной боли: морфин 0.05-0.1 мг/кг IV (мониторинг ОРИТН)',
        'Реоценка q15-30 мин до уменьшения NIPS ≤ 2',
      ],
    },
  ],
  caveats: [
    'NIPS — поведенческая шкала (no physiologic), валидна для острой процедурной боли',
    'Для длительной/послеоперационной боли — CRIES, COMFORT-neo',
    'Глубоко недоношенные < 32 нед — использовать PIPP-R',
  ],
  related: [
    { id: 'neo-pipp-r', title: 'PIPP-R' },
    { id: 'neo-npass', title: 'N-PASS' },
    { id: 'neo-finnegan', title: 'Modified Finnegan' },
  ],
  info: `### NIPS — Neonatal Infant Pain Scale

Поведенческая шкала боли у доношенных новорождённых при процедурной
боли (венепункция, инъекция, забор крови). 6 индикаторов, max 7.

| Сумма | Тяжесть | Тактика |
|---|---|---|
| 0-2 | Нет | Нефармакологический комфорт |
| 3-4 | Умеренная | Сахароза, кенгуру, грудь |
| ≥ 5 | Сильная | EMLA + парацетамол, ± опиоиды |

### Когда использовать

- **Острая процедурная боль:** венепункция, инъекция, забор пяточной крови
- **Не для:** длительной/послеоперационной боли (CRIES, COMFORT)

### Сравнение со шкалами

| Шкала | Возраст | Тип боли | Параметры |
|---|---|---|---|
| **NIPS** | ≥ 32 нед | Процедурная | 6 поведенческих |
| **PIPP-R** | < 32 нед | Процедурная | 7 (включая физио) |
| **N-PASS** | Любой | Боль + седация | 5 биполярных |
| **CRIES** | После операции | Послеоперационная | 5 параметров |

### Терапия — иерархия

1. **First line — нефармакологические меры:** сахароза 24 % + sucking, контакт кожа-к-коже, грудь, пеленание
2. **Локальные анестетики:** EMLA за 60 мин до planned procedure
3. **Парацетамол:** при умеренной/сильной боли
4. **Опиоиды:** только при тяжёлой боли под мониторингом NICU

### Источники

- Lawrence J et al. 1993
- AAP 2016 Pain Assessment & Management
- COCHRANE Sucrose for procedural pain
- КР МЗ РФ "Боль у новорождённых" (2024)
`,
};

export default runner;
