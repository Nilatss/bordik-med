/** Runner: iadpsg - диагностика ГСД (IADPSG / WHO 2013 / Carpenter-Coustan / NICE / РОАГ) */
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
      id: 'test',
      label: 'Протокол',
      type: 'select',
      options: [
        { value: 'iadpsg', label: 'IADPSG / WHO 2013 / РОАГ (75 г, 1-step, ммоль/л)' },
        { value: 'cc', label: 'Carpenter-Coustan (100 г, 2-step, мг/дл)' },
        { value: 'nice', label: 'NICE NG3 (75 г, ммоль/л)' },
      ],
    },
    { id: 'fasting', label: 'Натощак', type: 'number', unit: 'ммоль/л или мг/дл', min: 2, max: 20, step: 0.1, quickValues: [4.5, 5.1, 5.6, 95] },
    { id: 'h1', label: '1 час', type: 'number', unit: '', min: 3, max: 25, step: 0.1, quickValues: [8.0, 10.0, 180] },
    { id: 'h2', label: '2 часа', type: 'number', unit: '', min: 3, max: 25, step: 0.1, quickValues: [7.0, 7.8, 8.5, 155] },
    { id: 'h3', label: '3 часа (только C-C)', type: 'number', unit: '', min: 0, max: 25, step: 0.1, quickValues: [0, 140] },
  ],
  compute: (v) => {
    const t = v.test;
    const f = Number(v.fasting);
    const h1 = Number(v.h1);
    const h2 = Number(v.h2);
    const h3 = Number(v.h3);
    let dx = '';
    let color = '';
    let details = '';
    if (t === 'iadpsg') {
      const pos = [];
      if (f >= 5.1) pos.push(`Натощак ${f} ≥ 5.1`);
      if (h1 >= 10.0) pos.push(`1 ч ${h1} ≥ 10.0`);
      if (h2 >= 8.5) pos.push(`2 ч ${h2} ≥ 8.5`);
      if (f >= 7.0 || h2 >= 11.1) {
        dx = 'Манифестный СД (overt diabetes in pregnancy)';
        color = '#7F1D1D';
        details = 'Диагностические пороги СД вне беременности достигнуты - требуется вторичная верификация (HbA1c ≥ 6.5% или повторный тест).';
      } else if (pos.length >= 1) {
        dx = 'ГСД (IADPSG/WHO 2013/РОАГ)';
        color = '#DC2626';
        details = pos.join('; ');
      } else {
        dx = 'ГСД не подтверждён';
        color = '#22C55E';
        details = 'Все показатели ниже пороговых.';
      }
    } else if (t === 'cc') {
      // Carpenter-Coustan (mg/dL): fasting≥95, 1h≥180, 2h≥155, 3h≥140. ≥2 positive = GDM
      const pos = [];
      if (f >= 95) pos.push(`Натощак ${f} ≥ 95`);
      if (h1 >= 180) pos.push(`1 ч ${h1} ≥ 180`);
      if (h2 >= 155) pos.push(`2 ч ${h2} ≥ 155`);
      if (h3 >= 140) pos.push(`3 ч ${h3} ≥ 140`);
      if (pos.length >= 2) {
        dx = 'ГСД (Carpenter-Coustan)';
        color = '#DC2626';
        details = `Положительных значений: ${pos.length}. ${pos.join('; ')}`;
      } else if (pos.length === 1) {
        dx = '1 положительное значение - повторить / наблюдение';
        color = '#F59E0B';
        details = pos.join('; ');
      } else {
        dx = 'ГСД не подтверждён';
        color = '#22C55E';
      }
    } else {
      // NICE: fasting ≥ 5.6 OR 2h ≥ 7.8
      if (f >= 5.6 || h2 >= 7.8) {
        dx = 'ГСД (NICE NG3)';
        color = '#DC2626';
        details = `Пороги NICE: натощак ≥ 5.6 или 2 ч ≥ 7.8`;
      } else {
        dx = 'ГСД не подтверждён';
        color = '#22C55E';
      }
    }
    return {
      value: dx,
      unit: '',
      interpretation: dx,
      color,
      details,
      actions: [
        'Диетотерапия, самоконтроль глюкозы 4-7 р/сут',
        'Физическая активность 30 мин/сут (при отсутствии противопоказаний)',
        'Инсулинотерапия при недостижении целей за 1-2 нед (целевая гликемия: натощак < 5.1, 1 ч < 7.0, 2 ч < 6.7 ммоль/л - РОАГ/IADPSG)',
        'Метформин - альтернатива инсулину (обсуждать с пациенткой; класс B)',
        'УЗИ плода каждые 4 нед, оценка макросомии с 28 нед',
        'OGTT 75 г повторить через 6-12 нед постпартум',
      ],
      caveats: [
        'IADPSG/WHO 2013: ≥ 1 порогового значения достаточно для диагноза',
        'Carpenter-Coustan: требуется ≥ 2 положительных',
        'Скрининг обычно в 24-28 нед; ранний скрининг при факторах риска',
        '1 ммоль/л глюкозы ≈ 18 мг/дл',
      ],
      related: [
        { id: 'hba1c', title: 'HbA1c' },
        { id: 'homa-ir', title: 'HOMA-IR' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Акушерство' },
        { id: '301.4', title: 'Эндокринология' },
      ],
    };
  },
  reference:
    'IADPSG 2010 (Diabetes Care 33:676). WHO 2013. Carpenter & Coustan, 1982 (Am J Obstet Gynecol 144:768). NICE NG3, 2015. РОАГ «ГСД» 2020.',
  countries: 'Международный (IADPSG/WHO), США (C-C), UK (NICE), РФ (РОАГ)',
  presets: [
    { label: 'IADPSG положительный', values: { test: 'iadpsg', fasting: 5.3, h1: 9.0, h2: 7.8, h3: 0 } },
    { label: 'C-C положительный', values: { test: 'cc', fasting: 100, h1: 185, h2: 160, h3: 135 } },
    { label: 'Норма (IADPSG)', values: { test: 'iadpsg', fasting: 4.6, h1: 8.5, h2: 7.0, h3: 0 } },
  ],
  caveats: [
    'Единицы: IADPSG/NICE - ммоль/л; Carpenter-Coustan - мг/дл',
    'OGTT выполняется после 8-14 ч голодания',
  ],
  related: [
    { id: 'hba1c', title: 'HbA1c' },
    { id: 'homa-ir', title: 'HOMA-IR' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство' },
    { id: '301.4', title: 'Эндокринология' },
  ],
  info: `### Протоколы диагностики ГСД

| Протокол | Нагрузка | Пороги | Критерий |
|---|---|---|---|
| IADPSG / WHO 2013 / РОАГ | 75 г (1-step) | FPG ≥ 5.1 · 1 ч ≥ 10.0 · 2 ч ≥ 8.5 ммоль/л | ≥ 1 значение |
| Carpenter-Coustan | 100 г (2-step) | FPG ≥ 95 · 1 ч ≥ 180 · 2 ч ≥ 155 · 3 ч ≥ 140 мг/дл | ≥ 2 значения |
| NICE NG3 | 75 г | FPG ≥ 5.6 · 2 ч ≥ 7.8 ммоль/л | ≥ 1 значение |

### Манифестный СД в беременности
- FPG ≥ 7.0 ммоль/л (126 мг/дл) ИЛИ
- Случайная глюкоза ≥ 11.1 ммоль/л (200 мг/дл) ИЛИ
- HbA1c ≥ 6.5% ИЛИ
- 2 ч OGTT ≥ 11.1 ммоль/л

### Целевые значения самоконтроля (РОАГ/IADPSG)
- Натощак < 5.1 ммоль/л
- 1 ч после еды < 7.0 ммоль/л
- 2 ч после еды < 6.7 ммоль/л

### Источники
IADPSG 2010. WHO 2013. NICE NG3 2015. РОАГ 2020.`,
};

export default runner;
