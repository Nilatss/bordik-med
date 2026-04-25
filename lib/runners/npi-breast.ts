// @ts-nocheck
/** Runner: npi-breast */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'size',
      label: 'Размер опухоли (см)',
      type: 'number',
      min: 0.1,
      max: 20,
      step: 0.1,
      unit: 'см',
    },
    {
      id: 'stage',
      label: 'Стадия поражения ЛУ',
      type: 'select',
      options: [
        { value: '1', label: '1 — ЛУ не поражены (N0)' },
        { value: '2', label: '2 — 1-3 подмышечных ЛУ' },
        { value: '3', label: '3 — ≥ 4 ЛУ или внутренние маммарные' },
      ],
    },
    {
      id: 'grade',
      label: 'Гистологическая градация (Nottingham)',
      type: 'select',
      options: [
        { value: '1', label: 'G1 — хорошо дифференцированная' },
        { value: '2', label: 'G2 — умеренно' },
        { value: '3', label: 'G3 — низкодифференцированная' },
      ],
    },
  ],
  compute: (v) => {
    const size = Number(v.size);
    const stage = Number(v.stage);
    const grade = Number(v.grade);
    const npi = 0.2 * size + stage + grade;

    let group = '';
    let groupNum = 0;
    let color = '';
    let details = '';
    let survival = '';

    if (npi < 2.4) {
      group = 'Excellent';
      groupNum = 1;
      color = '#22C55E';
      survival = '10-летняя выживаемость ~ 96%';
      details = `NPI ${npi.toFixed(2)} — excellent prognostic group (EPG). Отличный прогноз.`;
    } else if (npi < 3.4) {
      group = 'Good';
      groupNum = 2;
      color = '#84CC16';
      survival = '10-летняя выживаемость ~ 93%';
      details = `NPI ${npi.toFixed(2)} — good prognostic group (GPG). Хороший прогноз.`;
    } else if (npi < 5.4) {
      group = 'Moderate';
      groupNum = 3;
      color = '#F59E0B';
      survival = '10-летняя выживаемость ~ 70-80%';
      details = `NPI ${npi.toFixed(2)} — moderate prognostic group (MPG). Промежуточный прогноз.`;
    } else if (npi < 6.4) {
      group = 'Poor';
      groupNum = 4;
      color = '#EF4444';
      survival = '10-летняя выживаемость ~ 50%';
      details = `NPI ${npi.toFixed(2)} — poor prognostic group (PPG). Плохой прогноз.`;
    } else {
      group = 'Very Poor';
      groupNum = 5;
      color = '#7F1D1D';
      survival = '10-летняя выживаемость < 40%';
      details = `NPI ${npi.toFixed(2)} — very poor prognostic group. Крайне плохой прогноз.`;
    }

    return {
      value: npi.toFixed(2),
      unit: group,
      interpretation: `NPI ${npi.toFixed(2)} — ${group} (${survival})`,
      color,
      details,
      actions: [
        'ИГХ-панель: ER, PR, HER2, Ki-67 (обязательно)',
        'Стадирование по TNM (8th edition)',
        groupNum >= 3 ? 'Рассмотреть адъювантную химиотерапию' : 'При ER+ — эндокринотерапия; CT обсудить по Oncotype / MammaPrint',
        groupNum >= 2 ? 'Молекулярный тест (Oncotype DX / MammaPrint) для ER+ HER2−' : 'Только эндокринотерапия (при ER+)',
        'Лучевая терапия при BCS; при мастэктомии — по показаниям (≥ 4 ЛУ, T3-T4)',
      ],
      caveats: [
        'NPI = 0.2 × размер(см) + стадия ЛУ(1-3) + grade(1-3)',
        'Haybittle 1982, валидирован Galea 1992 (Nottingham cohort)',
        'Не учитывает: ER/PR/HER2 статус, Ki-67, молекулярные тесты',
        'Изначальная классификация: GPG (<3.4), MPG (3.4-5.4), PPG (>5.4). Современная — 5-6 групп',
        'Для современного решения о CT — NPI + Oncotype DX / PREDICT tool / Adjuvant!',
      ],
      scale: {
        segments: [
          { min: 0, max: 2.4, label: 'Excellent', color: '#22C55E' },
          { min: 2.4, max: 3.4, label: 'Good', color: '#84CC16' },
          { min: 3.4, max: 5.4, label: 'Moderate', color: '#F59E0B' },
          { min: 5.4, max: 6.4, label: 'Poor', color: '#EF4444' },
          { min: 6.4, max: 10, label: 'Very Poor', color: '#7F1D1D' },
        ],
        current: npi,
        unit: 'NPI',
      },
      related: [
        { id: 'nottingham', title: 'Nottingham grade' },
        { id: 'oncotype', title: 'Oncotype DX' },
        { id: 'tnm', title: 'TNM' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Galea MH, Blamey RW, Elston CE, Ellis IO. The Nottingham Prognostic Index in primary breast cancer. Breast Cancer Res Treat 1992;22:207-219.',
  countries: 'Международный (UK / ESMO)',
  presets: [
    { label: 'T1 N0 G1', values: { size: 1.5, stage: '1', grade: '1' } },
    { label: 'T2 N1 G2', values: { size: 3.0, stage: '2', grade: '2' } },
    { label: 'T3 N2 G3', values: { size: 6.0, stage: '3', grade: '3' } },
  ],
  info: `
### Для чего используется
**Nottingham Prognostic Index (NPI)** — простой клинический индекс прогноза при **инвазивном раке молочной железы** по размеру опухоли, поражению ЛУ и гистологическому grade. Валидирован на большой когорте Nottingham (Galea 1992).

### Формула
\`NPI = 0.2 × размер (см) + стадия ЛУ (1-3) + grade (1-3)\`

### Компоненты
| Компонент | Балл |
|---|---|
| **Стадия ЛУ** | 1 (N0) / 2 (1-3 ЛУ) / 3 (≥ 4 ЛУ или внутр. маммарные) |
| **Grade** | 1 (G1) / 2 (G2) / 3 (G3 по Nottingham) |
| **Размер** | диаметр (см) × 0.2 |

### Прогностические группы
| NPI | Группа | 10-летняя выживаемость |
|---|---|---|
| **< 2.4** | Excellent (EPG) | ~ 96% |
| **2.4-3.4** | Good (GPG) | ~ 93% |
| **3.4-5.4** | Moderate (MPG) | ~ 70-80% |
| **5.4-6.4** | Poor (PPG) | ~ 50% |
| **> 6.4** | Very Poor | < 40% |

### Альтернативные / дополняющие инструменты
- **Adjuvant! Online** — прогноз и польза от CT/ET
- **PREDICT** (NHS) — включает ER, HER2, Ki-67
- **Oncotype DX / MammaPrint** — молекулярные тесты для решения о CT
- **CTS5** — поздний рецидив ER+

### Ограничения
- Не учитывает **ER / PR / HER2 / Ki-67**
- Не учитывает возраст, менопаузальный статус
- Не учитывает молекулярные подтипы
- Для современных решений — комбинация NPI + IHC4 + Oncotype / PREDICT

### Применение
- Простой скрининговый инструмент прогноза
- Хорошо коррелирует с выживаемостью даже без молекулярных данных
- Часто используется в UK и Европе`,
};
export default runner;
