/** Runner: iota - оценка придаточных образований (IOTA Simple Rules, ADNEX, RMI, ROMA) */
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
      id: 'tool',
      label: 'Инструмент',
      type: 'select',
      options: [
        { value: 'simple', label: 'IOTA Simple Rules (Timmerman 2008)' },
        { value: 'adnex', label: 'IOTA ADNEX (Van Calster 2014)' },
        { value: 'rmi', label: 'RMI (Jacobs 1990)' },
        { value: 'roma', label: 'ROMA (Moore 2009)' },
      ],
    },
    { id: 'bFeatures', label: 'Число B-признаков (доброкачественных, 0-5)', type: 'number', min: 0, max: 5, step: 1 },
    { id: 'mFeatures', label: 'Число M-признаков (злокачественных, 0-5)', type: 'number', min: 0, max: 5, step: 1 },
    { id: 'ca125', label: 'CA-125, Ед/мл', type: 'number', min: 0, max: 10000, step: 1 },
    { id: 'he4', label: 'HE4, пмоль/л', type: 'number', min: 0, max: 5000, step: 1 },
    {
      id: 'menopause',
      label: 'Менопауза',
      type: 'select',
      options: [
        { value: 'pre', label: 'Пременопауза' },
        { value: 'post', label: 'Постменопауза' },
      ],
    },
    {
      id: 'usScore',
      label: 'УЗ-балл для RMI (U): 0/1/3',
      type: 'select',
      options: [
        { value: '0', label: 'U=0 (нет признаков)' },
        { value: '1', label: 'U=1 (один признак)' },
        { value: '3', label: 'U=3 (≥ 2 признаков)' },
      ],
    },
  ],
  compute: (v) => {
    const tool = v.tool;
    let value = '';
    let interpretation = '';
    let color = '#22C55E';
    let details = '';
    const actions: string[] = [];
    if (tool === 'simple') {
      const b = Number(v.bFeatures) || 0;
      const m = Number(v.mFeatures) || 0;
      if (m > 0 && b === 0) {
        value = 'Злокачественное';
        color = '#DC2626';
        interpretation = 'IOTA Simple Rules: злокачественное образование';
      } else if (b > 0 && m === 0) {
        value = 'Доброкачественное';
        color = '#22C55E';
        interpretation = 'IOTA Simple Rules: доброкачественное образование';
      } else {
        value = 'Неопределённое';
        color = '#F59E0B';
        interpretation = 'Неопределённое (применение ADNEX или экспертное УЗИ)';
      }
      details =
        'B-признаки: унилокулярная киста; солидные < 7 мм; акустическая тень; гладкая многокамерная < 10 см; нет цветового потока. M-признаки: нерегулярная солидная опухоль; асцит; ≥ 4 папиллярных структур; мультилокулярно-солидная ≥ 10 см; выраженный кровоток.';
      actions.push('При злокачественных или неопределённых - направление к гинекологу-онкологу');
    } else if (tool === 'adnex') {
      value = 'Расчёт ADNEX';
      color = '#F59E0B';
      interpretation = 'ADNEX оценивает вероятность доброкачественное / borderline / I / II-IV / метастаз';
      details = 'ADNEX использует 9 переменных (возраст, CA-125, центр, 7 УЗ-параметров). Порог 10 % часто выбирают как клинически значимый.';
      actions.push('Использовать онлайн-калькулятор IOTA для точного расчёта');
      actions.push('Риск злокачественности > 10 % - направление в специализированный центр');
    } else if (tool === 'rmi') {
      const ca = Number(v.ca125) || 0;
      const u = Number(v.usScore) || 0;
      const M = v.menopause === 'post' ? 3 : 1;
      const rmi = u * M * ca;
      value = String(rmi);
      if (rmi > 200) {
        color = '#DC2626';
        interpretation = `RMI = ${rmi} - высокий риск`;
        details = 'RMI > 200 - направление в центр гинекологической онкологии (чувствительность ~ 85 %, специфичность ~ 97 %).';
        actions.push('Консультация онкогинеколога, МРТ / КТ по показаниям');
      } else {
        color = '#22C55E';
        interpretation = `RMI = ${rmi} - низкий риск`;
        details = 'Продолжить наблюдение; возможно плановое оперативное лечение в общей гинекологии.';
      }
    } else if (tool === 'roma') {
      const ca = Number(v.ca125) || 0;
      const he4 = Number(v.he4) || 0;
      const pre = v.menopause !== 'post';
      const PI = pre
        ? -12.0 + 2.38 * Math.log(he4 || 1) + 0.0626 * Math.log(ca || 1)
        : -8.09 + 1.04 * Math.log(he4 || 1) + 0.732 * Math.log(ca || 1);
      const roma = (Math.exp(PI) / (1 + Math.exp(PI))) * 100;
      value = roma.toFixed(1) + '%';
      const highCut = pre ? 11.4 : 29.9;
      if (roma >= highCut) {
        color = '#DC2626';
        interpretation = `ROMA ${value} - высокий риск эпителиального рака яичников`;
        actions.push('Направление к онкогинекологу');
      } else {
        color = '#22C55E';
        interpretation = `ROMA ${value} - низкий риск`;
      }
      details = `Порог: пременопауза ≥ 11.4 %, постменопауза ≥ 29.9 %.`;
    }
    return {
      value,
      unit: '',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'IOTA Simple Rules дают ответ в ~ 80 % случаев; остальные требуют экспертного УЗИ или ADNEX',
        'RMI проще, но уступает ADNEX по точности',
        'HE4 повышен при почечной недостаточности, курении',
        'CA-125 повышен при эндометриозе, ВЗОМТ, беременности',
      ],
      related: [
        { id: 'figo-staging', title: 'FIGO staging' },
        { id: 'bethesda-cyto', title: 'Bethesda' },
      ],
      relatedCourses: [
        { id: '201.7', title: 'Онкология' },
        { id: '203.9', title: 'Гинекология' },
      ],
    };
  },
  reference:
    'Timmerman D et al. IOTA Simple Rules. Ultrasound Obstet Gynecol 2008. Van Calster B et al. ADNEX model. BMJ 2014;349:g5920. Jacobs I et al. RMI. BJOG 1990. Moore RG et al. ROMA. Gynecol Oncol 2009;112:40-46.',
  countries: 'Международный (IOTA, ESGO)',
  presets: [
    { label: 'Simple Rules: доброкачественная', values: { tool: 'simple', bFeatures: 3, mFeatures: 0, menopause: 'pre', usScore: '0', ca125: 20, he4: 50 } },
    { label: 'Simple Rules: злокачественная', values: { tool: 'simple', bFeatures: 0, mFeatures: 3, menopause: 'post', usScore: '3', ca125: 250, he4: 200 } },
    { label: 'RMI высокий', values: { tool: 'rmi', bFeatures: 0, mFeatures: 0, menopause: 'post', usScore: '3', ca125: 100, he4: 0 } },
    { label: 'ROMA постменопауза', values: { tool: 'roma', bFeatures: 0, mFeatures: 0, menopause: 'post', usScore: '0', ca125: 80, he4: 150 } },
  ],
  caveats: ['Выбор шкалы определяется доступностью ресурсов', 'CA-125 не заменяет гистологию'],
  related: [
    { id: 'figo-staging', title: 'FIGO staging' },
    { id: 'bethesda-cyto', title: 'Bethesda' },
  ],
  relatedCourses: [
    { id: '201.7', title: 'Онкология' },
    { id: '203.9', title: 'Гинекология' },
  ],
  info: `### Оценка придаточных образований
IOTA-группа (International Ovarian Tumor Analysis) разработала серию инструментов для стратификации риска злокачественности придатков.

### IOTA Simple Rules (Timmerman 2008)
5 B-признаков (доброкачественных): унилокулярная киста; солидные компоненты < 7 мм; акустическая тень; гладкая многокамерная < 10 см; отсутствие кровотока.
5 M-признаков (злокачественных): нерегулярная солидная опухоль; асцит; ≥ 4 папиллярных структур; нерегулярная мультилокулярно-солидная ≥ 10 см; выраженный кровоток.

### ADNEX (Van Calster 2014)
Учитывает 9 переменных, даёт вероятности 4 подтипов злокачественности.

### RMI (Jacobs 1990)
RMI = U × M × CA-125. >200 - высокий риск.

### ROMA (Moore 2009)
Комбинирует HE4 и CA-125. Пороги: ≥ 11.4 % (пре), ≥ 29.9 % (пост).`,
};

export default runner;
