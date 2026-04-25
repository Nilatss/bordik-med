// @ts-nocheck
/** Runner: recist */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'baseline',
      hint: 'Размер в миллиметрах',
      label: 'Сумма диаметров целевых очагов на baseline (мм)',
      type: 'number',
      min: 1,
      max: 500,
      step: 1,
      unit: 'мм',
    },
    {
      id: 'current',
      hint: 'Размер в миллиметрах',
      label: 'Сумма диаметров на текущем обследовании (мм)',
      type: 'number',
      min: 0,
      max: 500,
      step: 1,
      unit: 'мм',
    },
    {
      id: 'nadir',
      hint: 'Размер в миллиметрах',
      label: 'Минимальная сумма за всё время наблюдения (nadir, мм)',
      type: 'number',
      min: 0,
      max: 500,
      step: 1,
      unit: 'мм',
    },
    {
      id: 'new_lesion',
      label: 'Появление нового очага',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'non_target_progression',
      label: 'Однозначная прогрессия нецелевых очагов',
      type: 'checkbox',
      points: 0,
    },
  ],
  compute: (v) => {
    const baseline = Number(v.baseline);
    const current = Number(v.current);
    const nadir = Number(v.nadir) || baseline;
    const newLesion = v.new_lesion === true || v.new_lesion === 'true';
    const ntProgression = v.non_target_progression === true || v.non_target_progression === 'true';

    const changeVsBaseline = baseline > 0 ? ((current - baseline) / baseline) * 100 : 0;
    const changeVsNadir = nadir > 0 ? ((current - nadir) / nadir) * 100 : 0;
    const absIncrease = current - nadir;

    let response = '';
    let responseNum = 0;
    let color = '';
    let details = '';

    if (newLesion || ntProgression) {
      response = 'PD';
      responseNum = 4;
      color = '#991B1B';
      details = 'Прогрессия болезни: появление нового очага или однозначная прогрессия нецелевых поражений.';
    } else if (changeVsNadir >= 20 && absIncrease >= 5) {
      response = 'PD';
      responseNum = 4;
      color = '#991B1B';
      details = `Увеличение суммы диаметров на ${changeVsNadir.toFixed(1)}% от nadir (≥ 20% и ≥ 5 мм абсолютно).`;
    } else if (current === 0) {
      response = 'CR';
      responseNum = 1;
      color = '#22C55E';
      details = 'Полный ответ: исчезновение всех целевых очагов; короткая ось ЛУ < 10 мм.';
    } else if (changeVsBaseline <= -30) {
      response = 'PR';
      responseNum = 2;
      color = '#84CC16';
      details = `Частичный ответ: уменьшение суммы диаметров на ${Math.abs(changeVsBaseline).toFixed(1)}% (≥ 30%) от baseline.`;
    } else {
      response = 'SD';
      responseNum = 3;
      color = '#F59E0B';
      details = `Стабилизация: изменение ${changeVsBaseline >= 0 ? '+' : ''}${changeVsBaseline.toFixed(1)}% от baseline — не соответствует критериям PR или PD.`;
    }

    return {
      value: response,
      unit: `Δ ${changeVsBaseline >= 0 ? '+' : ''}${changeVsBaseline.toFixed(1)}%`,
      interpretation: `RECIST 1.1: ${response}`,
      color,
      details,
      actions: [
        'Повторная визуализация через 6-8 недель для подтверждения CR / PR (confirmation scan)',
        'При PD — смена линии терапии или переход к следующему этапу',
        'При SD > 6 мес — часто считается клинически значимым эффектом',
        'Учитывать токсичность и качество жизни, не только рентгенологический ответ',
        'Для иммунотерапии — iRECIST (возможен псевдопрогресс); подтверждение PD через 4-8 нед',
      ],
      caveats: [
        'RECIST 1.1 (Eisenhauer 2009): целевые ≤ 5 очагов (≤ 2 на орган), по диаметру; ЛУ — по короткой оси (≥ 15 мм целевые)',
        'Минимальный размер целевого: 10 мм (КТ), 20 мм (рентген), ЛУ — 15 мм по короткой оси',
        'Для PD: ≥ 20% от nadir И абсолютное ≥ 5 мм',
        'iRECIST (Seymour 2017) — для иммунотерапии: iUPD → iCPD требует подтверждения',
        'Не применяется для глиом (RANO), ГЦК (mRECIST), лимфом (Lugano), миеломы (IMWG)',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'CR', color: '#22C55E' },
          { min: 2, max: 3, label: 'PR', color: '#84CC16' },
          { min: 3, max: 4, label: 'SD', color: '#F59E0B' },
          { min: 4, max: 5, label: 'PD', color: '#991B1B' },
        ],
        current: responseNum,
        unit: 'response',
      },
      related: [
        { id: 'cheson', title: 'Lugano' },
        { id: 'percist', title: 'PERCIST' },
        { id: 'ctcae', title: 'CTCAE' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Eisenhauer EA et al. New response evaluation criteria in solid tumours: revised RECIST guideline (version 1.1). Eur J Cancer 2009;45:228-247.',
  countries: 'Международный (EORTC / NCI)',
  presets: [
    { label: 'PR (-40%)', values: { baseline: 100, current: 60, nadir: 60, new_lesion: false, non_target_progression: false } },
    { label: 'SD (-10%)', values: { baseline: 100, current: 90, nadir: 90, new_lesion: false, non_target_progression: false } },
    { label: 'PD (+25% от nadir)', values: { baseline: 100, current: 95, nadir: 70, new_lesion: false, non_target_progression: false } },
  ],
  info: `### Для чего используется
**RECIST 1.1 (Response Evaluation Criteria in Solid Tumours, 2009)** — международный стандарт оценки **ответа солидных опухолей на терапию** по данным визуализации.

### Выбор целевых очагов (baseline)
- **≤ 5 целевых очагов всего** (≤ 2 на орган)
- Минимальный размер: **10 мм (КТ)**, 20 мм (рентген)
- **Лимфоузлы**: короткая ось ≥ 15 мм — целевые; 10-15 мм — нецелевые; < 10 мм — норма
- Сумма наибольших диаметров (для ЛУ — короткая ось) = **baseline sum**

### Критерии ответа
| Ответ | Критерий |
|---|---|
| **CR** (complete response) | Исчезновение всех целевых; ЛУ < 10 мм по короткой оси |
| **PR** (partial response) | ↓ ≥ 30% суммы диаметров vs baseline |
| **PD** (progressive disease) | ↑ ≥ 20% от nadir И абсолютное ≥ 5 мм, или новый очаг, или однозначная прогрессия нецелевых |
| **SD** (stable disease) | Ни PR, ни PD |

### Подтверждение (confirmation)
- CR / PR должны быть подтверждены повторной визуализацией через ≥ 4 недели
- Для SD — интервал ≥ 6-8 нед от baseline

### iRECIST (Seymour 2017, для иммунотерапии)
- **iUPD** (unconfirmed PD) — первый признак PD
- **iCPD** (confirmed PD) — подтверждение через 4-8 нед
- Псевдопрогресс (до 10% случаев при ICI) — рост опухоли с последующим ответом

### Альтернативные критерии по нозологиям
| Опухоль | Критерии |
|---|---|
| ГЦК / HCC | **mRECIST** (учёт артериальной гиперваскуляризации) |
| Лимфома | **Lugano / Cheson** (ПЭТ-ответ по Deauville) |
| Глиома | **RANO** (МРТ + стероиды + клиника) |
| Миелома | **IMWG** (М-протеин, FLC, плазмоклеточность) |
| PET | **PERCIST 1.0** (SULpeak) |

### Практические детали
- Интервал между сканами обычно 6-8 недель или 2 цикла
- КТ с контрастом — метод выбора; МРТ допустима
- Кистозные и некротические очаги измеряются так же, как солидные
- Лизисные костные очаги с мягкотканным компонентом — могут быть целевыми

### Ограничения
- Только анатомический ответ (не метаболический)
- Плохо работает для иммунотерапии (нужен iRECIST)
- Не учитывает биомаркеры (CEA, CA125, PSA отдельно)
- Вариабельность межрадиологическая ± 10-20%`,
};
export default runner;
