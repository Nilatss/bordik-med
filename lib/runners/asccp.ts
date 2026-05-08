/** Runner: asccp - риск-ориентированное ведение (ASCCP 2019, Perkins) */
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
      id: 'hpv',
      label: 'HPV-тест',
      type: 'select',
      options: [
        { value: 'neg', label: 'Отрицательный' },
        { value: 'other', label: 'Положительный (не 16/18)' },
        { value: '16', label: 'Положительный HPV 16' },
        { value: '18', label: 'Положительный HPV 18' },
      ],
    },
    {
      id: 'cyto',
      label: 'Цитология',
      type: 'select',
      options: [
        { value: 'nilm', label: 'NILM' },
        { value: 'ascus', label: 'ASC-US' },
        { value: 'lsil', label: 'LSIL' },
        { value: 'asch', label: 'ASC-H' },
        { value: 'hsil', label: 'HSIL+' },
      ],
    },
    {
      id: 'history',
      label: 'Анамнез',
      type: 'select',
      options: [
        { value: 'none', label: 'Без CIN в анамнезе' },
        { value: 'cin1', label: 'CIN 1 в анамнезе' },
        { value: 'cin2plus', label: 'CIN 2+ лечение в анамнезе' },
      ],
    },
  ],
  compute: (v) => {
    const hpv = v.hpv;
    const cy = v.cyto;
    const h = v.history;
    // approximate CIN3+ immediate risk (%)
    let risk = 0;
    const hpvPos = hpv !== 'neg';
    const hpv1618 = hpv === '16' || hpv === '18';
    if (!hpvPos && cy === 'nilm') risk = 0.05;
    else if (!hpvPos && cy === 'ascus') risk = 0.4;
    else if (hpvPos && cy === 'nilm') risk = hpv1618 ? 3.5 : 1.5;
    else if (hpvPos && cy === 'ascus') risk = hpv1618 ? 8 : 4;
    else if (hpvPos && cy === 'lsil') risk = hpv1618 ? 9 : 3.8;
    else if (cy === 'asch') risk = 26;
    else if (cy === 'hsil') risk = hpvPos ? 49 : 25;
    if (h === 'cin2plus') risk = Math.max(risk, 5);
    let action = '';
    let color = '#22C55E';
    if (risk >= 60) {
      action = 'Экспедированное лечение (excisional) допустимо';
      color = '#7F1D1D';
    } else if (risk >= 4) {
      action = 'Немедленная кольпоскопия';
      color = '#DC2626';
    } else if (risk >= 1) {
      action = 'Наблюдение с повторным тестированием через 1 год';
      color = '#F59E0B';
    } else {
      action = 'Рутинный скрининг (3/5 лет)';
      color = '#22C55E';
    }
    return {
      value: risk.toFixed(1) + '%',
      unit: '',
      interpretation: `Риск CIN 3+ ≈ ${risk.toFixed(1)} %. ${action}`,
      color,
      details:
        'ASCCP 2019 основана на 5-летнем риске CIN 3+; использует «правило 4 %»: ≥ 4 % - немедленная кольпоскопия; 1-4 % - наблюдение; < 1 % - рутина.',
      actions: [
        '≥ 60 % - допустимо экспедированное лечение без кольпоскопии (shared decision)',
        '≥ 4 % - кольпоскопия в течение нескольких недель',
        '1-4 % - повторное тестирование через 1 год',
        '< 1 % - возврат к рутинному скринингу',
      ],
      caveats: [
        'Расчёт приблизительный - полная таблица в ASCCP navigator',
        'История CIN 2/3 модифицирует риск',
        'Беременность - приоритет консервативного ведения',
        'Возраст 21-24 - отдельные рекомендации',
      ],
      related: [
        { id: 'bethesda-cyto', title: 'Bethesda' },
        { id: 'figo-staging', title: 'FIGO staging' },
      ],
      relatedCourses: [
        { id: '203.9', title: 'Гинекология' },
        { id: '201.7', title: 'Онкология' },
      ],
    };
  },
  reference:
    'Perkins RB et al. 2019 ASCCP Risk-Based Management Consensus Guidelines for Abnormal Cervical Cancer Screening Tests and Cancer Precursors. J Low Genit Tract Dis 2020;24:102-131.',
  countries: 'США (ASCCP); адаптация ESGO/IFCPC',
  presets: [
    { label: 'HPV-neg NILM', values: { hpv: 'neg', cyto: 'nilm', history: 'none' } },
    { label: 'HPV 16 NILM', values: { hpv: '16', cyto: 'nilm', history: 'none' } },
    { label: 'HPV+ ASC-US', values: { hpv: 'other', cyto: 'ascus', history: 'none' } },
    { label: 'HSIL', values: { hpv: '16', cyto: 'hsil', history: 'none' } },
  ],
  caveats: ['Расчёт упрощённый - клинически использовать ASCCP Navigator', 'Учитывать возраст, беременность, иммуносупрессию'],
  related: [
    { id: 'bethesda-cyto', title: 'Bethesda' },
    { id: 'figo-staging', title: 'FIGO staging' },
  ],
  relatedCourses: [
    { id: '203.9', title: 'Гинекология' },
    { id: '201.7', title: 'Онкология' },
  ],
  info: `### ASCCP 2019 - risk-based management
Ведение аномальных результатов скрининга шейки матки основано на 5-летнем риске CIN 3+.

### Ключевые пороги
- ≥ 4 % - немедленная кольпоскопия
- 1-4 % - повторное тестирование через 1 год
- < 1 % - рутинный скрининг
- ≥ 60 % - экспедированное лечение без биопсии

### Источник
Perkins RB et al. J Low Genit Tract Dis 2020.`,
};

export default runner;
