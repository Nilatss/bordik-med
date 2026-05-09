/**
 * Runner: neo-downes — Downes Score (Respiratory Distress Severity)
 *
 * NEONATOLOGY MODULE A3 (P1).
 *
 * SOURCES:
 *   - Downes JJ, et al. Clin Pediatr (Phila). 1970;9(6):325-332
 *   - КР МЗ РФ "Дыхательные расстройства у новорождённого" (2024)
 *   - Adapted in NeoReviews / Avery's Diseases of the Newborn 11th ed.
 *
 * 5 параметров (ЧД, цианоз, втяжения, grunting, аускультация) × 0-2 балла. max 10.
 *
 * Bands:
 *   ≤ 3   — Лёгкая RDS, наблюдение
 *   4-6   — Умеренная — CPAP / pNCPAP
 *   ≥ 7   — Тяжёлая — интубация и сурфактант
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 10,
  countries: 'Международный (Downes 1970) · РФ КР',
  reference: 'Downes JJ et al. Clin Pediatr 1970;9:325-332. КР МЗ РФ "Дыхательные расстройства у н/р" (2024).',
  inputs: [
    {
      id: 'rr',
      label: 'Частота дыхания (в мин)',
      type: 'select',
      options: [
        { value: '0', label: '< 60', points: 0 },
        { value: '1', label: '60-80', points: 1 },
        { value: '2', label: '> 80 или апноэ', points: 2 },
      ],
    },
    {
      id: 'cyanosis',
      label: 'Цианоз',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'При FiO₂ 21 %', points: 1 },
        { value: '2', label: 'При FiO₂ ≥ 40 %', points: 2 },
      ],
    },
    {
      id: 'retractions',
      label: 'Втяжения грудной клетки',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Лёгкие', points: 1 },
        { value: '2', label: 'Выраженные', points: 2 },
      ],
    },
    {
      id: 'grunting',
      label: 'Стонущее дыхание (grunting)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Аускультативно', points: 1 },
        { value: '2', label: 'Слышен на расстоянии', points: 2 },
      ],
    },
    {
      id: 'air',
      label: 'Аускультация',
      type: 'select',
      options: [
        { value: '0', label: 'Хорошо проводится', points: 0 },
        { value: '1', label: 'Умеренно ослаблено', points: 1 },
        { value: '2', label: 'Не проводится', points: 2 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 3,
      label: 'Лёгкая RDS',
      color: '#22C55E',
      description: 'Дыхательные расстройства лёгкой степени.',
      actions: [
        'Наблюдение в палате интенсивной терапии',
        'SpO₂ target 90-95 %; назальные канюли при цианозе',
        'Газы крови при прогрессировании',
      ],
    },
    {
      min: 4,
      max: 6,
      label: 'Умеренная RDS',
      color: '#F59E0B',
      description: 'Умеренная RDS — CPAP, мониторинг.',
      actions: [
        'CPAP / pNCPAP (PEEP 5-7 см H₂O)',
        'Рентген ОГК; КОС / газы крови',
        'NPO + парентеральное питание; антибиотики при подозрении на сепсис',
        'Готовность к интубации при ухудшении',
      ],
    },
    {
      min: 7,
      max: 10,
      label: 'Тяжёлая RDS',
      color: '#EF4444',
      description: 'Тяжёлая RDS — интубация и сурфактант.',
      actions: [
        'Интубация и ИВЛ; сурфактант (LISA / INSURE / болюс)',
        'Перевод в ОРИТН; центральный доступ (UVC)',
        'Антибиотики (ампициллин + гентамицин) до исключения сепсиса',
        'Рассмотреть HFOV при failure conventional',
      ],
    },
  ],
  caveats: [
    'Шкала Downes — клинический инструмент, не заменяет КОС/X-ray',
    'Сильверман-Андерсен — альтернатива, акцент на механике дыхания',
    'У глубоко недоношенных < 32 нед оценка дополняется PMA-специфическими порогами',
  ],
  related: [
    { id: 'silverman', title: 'Silverman-Anderson' },
    { id: 'apgar', title: 'Apgar' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
  ],
  info: `### Downes Score (RDS severity)

Клиническая шкала оценки тяжести синдрома дыхательных расстройств у
новорождённого. Дополняет шкалу Сильверман-Андерсен (механика дыхания)
включением цианоза и аускультации — более интегральный.

| Сумма | Тяжесть | Тактика |
|---|---|---|
| 0-3 | Лёгкая | Наблюдение, ± O₂ |
| 4-6 | Умеренная | CPAP, X-ray, газы крови |
| ≥ 7 | Тяжёлая | Интубация, сурфактант, ОРИТН |

### Параметры (каждый 0-2)

1. **Частота дыхания** — < 60 / 60-80 / > 80 или апноэ
2. **Цианоз** — нет / при FiO₂ 21 % / при FiO₂ ≥ 40 %
3. **Втяжения грудной клетки** — нет / лёгкие / выраженные
4. **Grunting** — нет / аускультативно / слышен на расстоянии
5. **Аускультация** — хорошо / умеренно ослаблено / не проводится

### Когда применять

- Скрининг при рождении и динамическое мониторирование (q1h первые часы)
- Решение об эскалации респираторной терапии
- Дополняет КОС, X-ray, эхокардиографию

### Источники

- Downes JJ et al. Clin Pediatr 1970;9:325-332
- КР МЗ РФ "Дыхательные расстройства у новорождённого" (2024)
- Avery's Diseases of the Newborn 11th ed.
`,
};

export default runner;
