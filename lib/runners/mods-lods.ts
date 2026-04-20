// @ts-nocheck
/**
 * Runner: mods-lods
 * MODS - Multiple Organ Dysfunction Score (Marshall 1995).
 */

import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'resp',
      label: 'Дыхание: PaO₂/FiO₂',
      type: 'select',
      options: [
        { value: '0', label: '> 300', points: 0 },
        { value: '1', label: '226-300', points: 1 },
        { value: '2', label: '151-225', points: 2 },
        { value: '3', label: '76-150', points: 3 },
        { value: '4', label: '≤ 75', points: 4 },
      ],
    },
    {
      id: 'renal',
      label: 'Почки: креатинин (мкмоль/л)',
      type: 'select',
      options: [
        { value: '0', label: '≤ 100', points: 0 },
        { value: '1', label: '101-200', points: 1 },
        { value: '2', label: '201-350', points: 2 },
        { value: '3', label: '351-500', points: 3 },
        { value: '4', label: '> 500', points: 4 },
      ],
    },
    {
      id: 'hepatic',
      label: 'Печень: билирубин (мкмоль/л)',
      type: 'select',
      options: [
        { value: '0', label: '≤ 20', points: 0 },
        { value: '1', label: '21-60', points: 1 },
        { value: '2', label: '61-120', points: 2 },
        { value: '3', label: '121-240', points: 3 },
        { value: '4', label: '> 240', points: 4 },
      ],
    },
    {
      id: 'cv',
      label: 'Сердечно-сосудистая: PAR = HR × CVP / MAP',
      type: 'select',
      options: [
        { value: '0', label: '≤ 10,0', points: 0 },
        { value: '1', label: '10,1-15,0', points: 1 },
        { value: '2', label: '15,1-20,0', points: 2 },
        { value: '3', label: '20,1-30,0', points: 3 },
        { value: '4', label: '> 30,0', points: 4 },
      ],
      hint: 'Pressure-Adjusted Heart Rate. Если CVP недоступен, оценить клинически',
    },
    {
      id: 'heme',
      label: 'Гематология: тромбоциты (×10⁹/л)',
      type: 'select',
      options: [
        { value: '0', label: '> 120', points: 0 },
        { value: '1', label: '81-120', points: 1 },
        { value: '2', label: '51-80', points: 2 },
        { value: '3', label: '21-50', points: 3 },
        { value: '4', label: '≤ 20', points: 4 },
      ],
    },
    {
      id: 'neuro',
      label: 'ЦНС: GCS',
      type: 'select',
      options: [
        { value: '0', label: '15', points: 0 },
        { value: '1', label: '13-14', points: 1 },
        { value: '2', label: '10-12', points: 2 },
        { value: '3', label: '7-9', points: 3 },
        { value: '4', label: '≤ 6', points: 4 },
      ],
    },
  ],
  compute: (v) => {
    const total = Number(v.resp || 0) + Number(v.renal || 0) + Number(v.hepatic || 0)
      + Number(v.cv || 0) + Number(v.heme || 0) + Number(v.neuro || 0);

    let mortality = '', color = '#22C55E', details = '', actions: string[] = [];
    if (total === 0) {
      mortality = '≈ 0%';
      color = '#22C55E';
      details = 'Нет органной дисфункции. Стандартное ведение.';
      actions = ['Routine monitoring'];
    } else if (total <= 4) {
      mortality = '≈ 1-7%';
      color = '#84CC16';
      details = 'Минимальная органная дисфункция. Низкая ICU-смертность.';
      actions = ['Стандартный ICU-протокол', 'Мониторинг ежедневного MODS'];
    } else if (total <= 8) {
      mortality = '≈ 16%';
      color = '#F59E0B';
      details = 'Умеренная полиорганная дисфункция. Активная поддержка.';
      actions = ['Целенаправленная органная поддержка', 'Sepsis bundle при инфекции', 'Нутритивная поддержка'];
    } else if (total <= 12) {
      mortality = '≈ 50%';
      color = '#F97316';
      details = 'Выраженная полиорганная недостаточность. Половина пациентов не выживет.';
      actions = ['Полная органная поддержка', 'Family meeting', 'Palliative consult'];
    } else if (total <= 16) {
      mortality = '≈ 70%';
      color = '#EF4444';
      details = 'Тяжёлая MOF. Высокая смертность.';
      actions = ['Агрессивная терапия обратимых причин', 'Daily family meetings', 'Goals of care'];
    } else if (total <= 20) {
      mortality = '≈ 85%';
      color = '#991B1B';
      details = 'Критическая MOF. Подавляющее большинство пациентов не выживут.';
      actions = ['Consider transition to comfort care', 'Advance directives'];
    } else {
      mortality = '≈ 100%';
      color = '#7F1D1D';
      details = 'Терминальная полиорганная недостаточность.';
      actions = ['Comfort care', 'End-of-life discussions'];
    }

    return {
      value: String(total),
      unit: 'баллов',
      interpretation: `MODS ${total}/24 - ICU-смертность ${mortality}`,
      color,
      details,
      actions,
      caveats: [
        'MODS (Marshall 1995) валидизирован для общей ICU-популяции',
        'PAR требует CVP - в современной практике часто заменяется клинической оценкой вазопрессорной поддержки',
        'LODS (Le Gall 1996) - альтернативная 6-органная шкала с PaO₂/FiO₂, WBC, bilirubin, creatinine, GCS, САД',
        'Для динамики используют дельту MODS (прирост ≥ 2 балла)',
        'Не валидизирован у детей (pMODS) и ожоговых',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: '0', color: '#22C55E' },
          { min: 1, max: 5, label: '1-4', color: '#84CC16' },
          { min: 5, max: 9, label: '5-8', color: '#F59E0B' },
          { min: 9, max: 13, label: '9-12', color: '#F97316' },
          { min: 13, max: 17, label: '13-16', color: '#EF4444' },
          { min: 17, max: 21, label: '17-20', color: '#991B1B' },
          { min: 21, max: 24, label: '21-24', color: '#7F1D1D' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'sofa', title: 'SOFA' },
        { id: 'apache', title: 'APACHE II' },
        { id: 'saps', title: 'SAPS II' },
        { id: 'mpm', title: 'MPM II' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.9', title: 'Инфекционные болезни' },
      ],
    };
  },
  reference: 'Marshall JC et al. Multiple organ dysfunction score: a reliable descriptor. Crit Care Med 1995;23:1638-52.',
  countries: 'Международный',
  presets: [
    { label: 'Нет дисфункции', values: { resp: '0', renal: '0', hepatic: '0', cv: '0', heme: '0', neuro: '0' } },
    { label: 'Сепсис умеренный', values: { resp: '2', renal: '1', hepatic: '1', cv: '2', heme: '1', neuro: '1' } },
    { label: 'Септический шок', values: { resp: '3', renal: '3', hepatic: '2', cv: '3', heme: '3', neuro: '2' } },
  ],
  info: `### Для чего используется
**MODS (Multiple Organ Dysfunction Score, Marshall 1995)** - дескриптор **полиорганной дисфункции в ICU**. Альтернатива и предшественник SOFA. Используется для:
- Характеристики тяжести пациентов в RCT
- Benchmarking
- Динамической оценки (daily MODS)

### 6 органных систем × 0-4 балла (итого 0-24)
| Система | Параметр | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|---|
| **Дыхание** | P/F | > 300 | 226-300 | 151-225 | 76-150 | ≤ 75 |
| **Почки** | Креатинин (мкмоль/л) | ≤ 100 | 101-200 | 201-350 | 351-500 | > 500 |
| **Печень** | Билирубин (мкмоль/л) | ≤ 20 | 21-60 | 61-120 | 121-240 | > 240 |
| **ССС** | PAR | ≤ 10 | 10,1-15 | 15,1-20 | 20,1-30 | > 30 |
| **Гемат.** | Тромбоциты | > 120 | 81-120 | 51-80 | 21-50 | ≤ 20 |
| **ЦНС** | GCS | 15 | 13-14 | 10-12 | 7-9 | ≤ 6 |

### PAR (Pressure-Adjusted HR)
\`PAR = HR × CVP / MAP\`
Увеличивается при падении сократимости/нагрузке сосудистого сопротивления. Требует инвазивного CVP.

### Прогноз ICU-смертности
| MODS | Смертность |
|---|---|
| 0 | 0% |
| 1-4 | 1-7% |
| 5-8 | 16% |
| 9-12 | 50% |
| 13-16 | 70% |
| 17-20 | 85% |
| 21-24 | ≈ 100% |

### MODS vs SOFA
| Параметр | MODS (1995) | SOFA (1996) |
|---|---|---|
| Число систем | 6 | 6 |
| Шкала каждой | 0-4 | 0-4 |
| ССС | PAR (HR×CVP/MAP) | Гипотензия/вазопрессоры |
| Почки | Креатинин | Креатинин + диурез |
| Предпочтителен | Исследования | Sepsis-3, клиника |

### LODS (Le Gall 1996)
Logistic Organ Dysfunction Score - альтернативная 6-органная шкала с другими пороговыми значениями (0-22).

### Ограничения
- PAR в современной практике редко используется (реже ставят CVP-катетеры)
- Не учитывает динамику вазопрессорной поддержки (в отличие от SOFA)
- Устаревает по сравнению с SOFA для sepsis-3 диагностики`,
};

export default runner;
