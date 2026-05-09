/**
 * Runner: neo-tcb-conversion — Transcutaneous Bilirubin (TcB) → TSB
 *
 * NEONATOLOGY MODULE A42 (P2).
 *
 * Конверсия и интерпретация показаний транскутанного билирубинометра
 * (TcB) для скрининга гипербилирубинемии у новорождённых ≥ 35 нед.
 *
 * Применение TcB:
 *   - Скрининг доношенных и поздних недоношенных (≥ 35 нед)
 *   - НЕ valid post-phototherapy (TcB underestimates 4-6 ч после)
 *   - НЕ valid у тёмнокожих младенцев со значительными расхождениями
 *   - НЕ valid при TSB > 13-15 мг/дл — confirm with serum
 *
 * Conversion units:
 *   1 мг/дл = 17.1 мкмоль/л
 *   1 мкмоль/л = 0.0585 мг/дл
 *
 * SOURCES:
 *   - Maisels MJ, Kring E. Pediatrics 2006;117(5):1657
 *   - NICE CG98 Jaundice in newborn babies (2010, addendum 2023)
 *   - AAP CPG 2022 Hyperbilirubinemia (Pediatrics 150(3):e2022058859)
 *   - КР МЗ РФ "Гемолитическая болезнь новорождённого" (2024)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Maisels 2006 / NICE CG98 / AAP 2022)',
  reference: 'Maisels MJ. Pediatrics 2006;117:1657. NICE CG98 (2010, 2023). AAP CPG 2022.',
  inputs: [
    {
      id: 'tcb_value',
      label: 'Показание TcB',
      type: 'number',
      min: 0,
      max: 600,
      step: 0.1,
    },
    {
      id: 'unit',
      label: 'Единицы',
      type: 'select',
      options: [
        { value: '0', label: 'мг/дл' },
        { value: '1', label: 'мкмоль/л' },
      ],
    },
    {
      id: 'age_hours',
      label: 'Возраст (ч)',
      type: 'number',
      min: 0,
      max: 720,
      step: 1,
    },
    {
      id: 'gestational_age',
      label: 'GA (нед)',
      type: 'number',
      min: 22,
      max: 42,
      step: 1,
    },
    {
      id: 'phototherapy',
      label: 'Получает фототерапию?',
      type: 'select',
      options: [
        { value: '0', label: 'Нет' },
        { value: '1', label: 'Да (TcB не валиден после ФТ)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const value = Number(values.tcb_value ?? 0);
    const unitFlag = String(values.unit ?? '0');
    const age = Number(values.age_hours ?? 0);
    const ga = Number(values.gestational_age ?? 38);
    const photo = String(values.phototherapy ?? '0') === '1';

    if (value <= 0) {
      return {
        value: '—',
        interpretation: 'Введите положительное значение TcB',
        color: '#9CA3AF',
        details: 'TcB должен быть > 0.',
      };
    }
    if (ga < 35) {
      return {
        value: '—',
        interpretation: 'TcB не валиден при GA < 35 нед',
        color: '#9CA3AF',
        details: 'NICE и AAP не рекомендуют TcB у глубоко недоношенных. Используйте TSB.',
        actions: ['У GA < 35 нед использовать только сывороточный билирубин (TSB)'],
      };
    }

    // Convert to both
    const tcb_mgdl = unitFlag === '0' ? value : value / 17.1;
    const tcb_umol = unitFlag === '1' ? value : value * 17.1;

    let band = '';
    let color = '#22C55E';
    const actions: string[] = [];

    if (photo) {
      band = 'TcB не валиден на фототерапии';
      color = '#9CA3AF';
      actions.push('TcB занижает TSB на 4-6 ч после старта фототерапии');
      actions.push('Использовать только сывороточный билирубин для мониторинга');
      actions.push('Возобновить TcB не раньше 24 ч после прекращения ФТ');
    } else if (tcb_mgdl >= 15) {
      band = 'Высокий риск';
      color = '#EF4444';
      actions.push(`TcB ${tcb_mgdl.toFixed(1)} мг/дл (${tcb_umol.toFixed(0)} мкмоль/л) → подтвердить TSB`);
      actions.push('TcB занижает значения > 13-15 мг/дл — обязательная серология');
      actions.push('Оценить порог фототерапии по AAP 2022 / NICE CG98 / КР РФ');
      actions.push('При риск-факторах (GBV, isoimmunization, sepsis) — снизить порог');
    } else if (tcb_mgdl >= 12 && age < 72) {
      band = 'Умеренный — наблюдение';
      color = '#F59E0B';
      actions.push(`TcB ${tcb_mgdl.toFixed(1)} мг/дл (${tcb_umol.toFixed(0)} мкмоль/л) — повтор через 12-24 ч`);
      actions.push('Если близко к порогу фототерапии (~ −50 мкмоль/л) — confirm TSB');
      actions.push('Адекватное вскармливание; контроль массы и диуреза');
    } else if (tcb_mgdl >= 10) {
      band = 'Лёгкий';
      color = '#84CC16';
      actions.push(`TcB ${tcb_mgdl.toFixed(1)} мг/дл (${tcb_umol.toFixed(0)} мкмоль/л) — мониторинг`);
      actions.push('Повтор через 24 ч если визуальная желтуха прогрессирует');
      actions.push('Адекватное кормление (≥ 8-12 раз/сут грудное молоко)');
    } else {
      band = 'Низкий';
      color = '#22C55E';
      actions.push(`TcB ${tcb_mgdl.toFixed(1)} мг/дл (${tcb_umol.toFixed(0)} мкмоль/л) — низкий риск`);
      actions.push('Стандартный осмотр, поддерживать кормление');
      actions.push('Повтор только при клинических показаниях');
    }

    return {
      value: tcb_mgdl.toFixed(1),
      unit: 'мг/дл',
      interpretation: band,
      color,
      details: `TcB ${tcb_mgdl.toFixed(1)} мг/дл = ${tcb_umol.toFixed(0)} мкмоль/л @ ${age} ч жизни (GA ${ga} нед).`,
      actions,
    };
  },
  caveats: [
    'TcB не валиден: GA < 35 нед, на фототерапии (или < 24 ч после), тёмная пигментация (Fitzpatrick V-VI), TSB > 13-15 мг/дл',
    'Точки измерения: лоб ИЛИ грудина (NICE предпочитает грудину). Среднее из 2-3',
    '1 мг/дл = 17.1 мкмоль/л. РФ использует мкмоль/л, США/UK — мг/дл',
  ],
  related: [
    { id: 'neo-bili-2022', title: 'Bili-2022 пороги' },
    { id: 'kramer', title: 'Kramer / Bhutani' },
  ],
  info: `### TcB → TSB конверсия + скрининг

Транскутанный билирубинометр (TcB) — неинвазивный скрининг
гипербилирубинемии у GA ≥ 35 нед. Эквивалент TSB для значений
< 13-15 мг/дл; высокие значения требуют подтверждения серологически.

### Когда TcB НЕ использовать

- **GA < 35 нед** — недоказательно
- **На фототерапии** или < 24 ч после неё (TcB занижает)
- **Тёмная пигментация** (Fitzpatrick V-VI) — частичная underestimation
- **TSB > 13-15 мг/дл** — confirm with serum

### Конверсия единиц

| Шкала | мг/дл | мкмоль/л |
|---|---|---|
| Конверсия | × 17.1 | ÷ 17.1 |
| Норма | < 5 | < 85 |
| Скрининг | ≥ 12 | ≥ 205 |
| Confirm TSB | ≥ 14.6 | ≥ 250 |

### Точки измерения

- **Лоб vs грудина:** NICE предпочитает грудину
- **2-3 измерения** среднее
- **JM-103/105** калиброваны для грудины
- **BiliCheck** — для лба

### Алгоритм скрининга

1. TcB ≥ 14.6 мг/дл (250 мкмоль/л) → подтвердить TSB
2. TcB ≥ phototherapy threshold − 50 мкмоль/л → confirm TSB
3. Все остальные → повтор по клинической ситуации

### Источники

- Maisels MJ Pediatrics 2006
- NICE CG98 (2010, 2023)
- AAP CPG 2022
- КР МЗ РФ "ГБН" (2024)
`,
};

export default runner;
