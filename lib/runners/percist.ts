/** Runner: percist */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'baseline_sul',
      label: 'SULpeak на baseline (г/мл)',
      type: 'number',
      min: 0.1,
      max: 50,
      step: 0.1,
      unit: 'г/мл',
    },
    {
      id: 'current_sul',
      label: 'SULpeak текущий (г/мл)',
      type: 'number',
      min: 0,
      max: 50,
      step: 0.1,
      unit: 'г/мл',
    },
    {
      id: 'new_lesion',
      label: 'Появление нового FDG-авидного очага',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'resolved',
      label: 'Полная резолюция всех метаболически активных очагов',
      type: 'checkbox',
      points: 0,
    },
  ],
  compute: (v) => {
    const baseline = Number(v.baseline_sul);
    const current = Number(v.current_sul);
    const newLesion = v.new_lesion === true || v.new_lesion === 'true';
    const resolved = v.resolved === true || v.resolved === 'true';

    const changePct = baseline > 0 ? ((current - baseline) / baseline) * 100 : 0;
    const absChange = current - baseline;

    let response = '';
    let responseNum = 0;
    let color = '';
    let details = '';

    if (newLesion || (changePct >= 30 && absChange >= 0.8)) {
      response = 'PMD';
      responseNum = 4;
      color = '#991B1B';
      details = `Progressive Metabolic Disease: ↑ SULpeak на ${changePct.toFixed(1)}% (≥ 30% и ≥ 0.8 абсолютно) или новые очаги.`;
    } else if (resolved) {
      response = 'CMR';
      responseNum = 1;
      color = '#22C55E';
      details = 'Complete Metabolic Response: полное исчезновение FDG-накопления во всех очагах (до уровня фона).';
    } else if (changePct <= -30 && absChange <= -0.8) {
      response = 'PMR';
      responseNum = 2;
      color = '#84CC16';
      details = `Partial Metabolic Response: ↓ SULpeak на ${Math.abs(changePct).toFixed(1)}% (≥ 30% и ≥ 0.8 абсолютно) от baseline.`;
    } else {
      response = 'SMD';
      responseNum = 3;
      color = '#F59E0B';
      details = `Stable Metabolic Disease: изменение ${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}% SULpeak — не соответствует критериям PMR или PMD.`;
    }

    return {
      value: response,
      unit: `Δ SUL ${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%`,
      interpretation: `PERCIST 1.0: ${response}`,
      color,
      details,
      actions: [
        'SULpeak измеряется в 1 см³ сферическом ROI с максимальным накоплением',
        'Оценка выполняется на том же сканере, с теми же параметрами (время после инъекции, доза FDG)',
        'Обычно оценивается до 5 очагов (max 2 на орган)',
        'Подтверждение PMR/CMR — повторный ПЭТ через 4-8 нед',
        'Для иммунотерапии рассмотреть imPERCIST5 (модификация для ICI)',
      ],
      caveats: [
        'PERCIST 1.0 (Wahl 2009) — стандартизация метаболической оценки ответа солидных опухолей',
        'SUL (SUV lean body mass) предпочтительнее SUV для стандартизации по массе тела',
        'Пациент должен быть натощак ≥ 4-6 ч, глюкоза < 11 ммоль/л',
        'Минимальный измеримый очаг: SULpeak > 1.5 × liver SUV mean + 2 SD',
        'Для лимфом используется Lugano (Deauville), не PERCIST',
        'EORTC 1999 — более ранние критерии с SUVmax; PERCIST точнее и воспроизводимее',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'CMR', color: '#22C55E' },
          { min: 2, max: 3, label: 'PMR', color: '#84CC16' },
          { min: 3, max: 4, label: 'SMD', color: '#F59E0B' },
          { min: 4, max: 5, label: 'PMD', color: '#991B1B' },
        ],
        current: responseNum,
        unit: 'response',
      },
      related: [
        { id: 'recist', title: 'RECIST 1.1' },
        { id: 'cheson', title: 'Lugano' },
        { id: 'ecog-kps', title: 'ECOG / KPS' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Wahl RL, Jacene H, Kasamon Y, Lodge MA. From RECIST to PERCIST: Evolving Considerations for PET Response Criteria in Solid Tumors. J Nucl Med 2009;50 Suppl 1:122S-150S.',
  countries: 'Международный (SNM / EANM)',
  presets: [
    { label: 'PMR (-50%)', values: { baseline_sul: 8.0, current_sul: 4.0, new_lesion: false, resolved: false } },
    { label: 'SMD (-15%)', values: { baseline_sul: 8.0, current_sul: 6.8, new_lesion: false, resolved: false } },
    { label: 'PMD (+40%)', values: { baseline_sul: 5.0, current_sul: 7.0, new_lesion: false, resolved: false } },
  ],
  info: `### Для чего используется
**PERCIST 1.0 (Wahl 2009)** — международные критерии оценки **метаболического ответа солидных опухолей по ПЭТ с FDG**. Используют параметр **SULpeak** (Standardized Uptake Lean, peak в 1 см³).

### Почему SULpeak, а не SUVmax
- **SUV** зависит от массы тела; **SUL** нормализуется на обезжиренную массу — воспроизводимее у пациентов с ожирением
- **Peak** (среднее в 1 см³ вокруг максимума) стабильнее **max** (одна точка, шум)

### Категории ответа
| Ответ | Критерий |
|---|---|
| **CMR** (Complete Metabolic Response) | Полное исчезновение FDG-накопления до уровня фона |
| **PMR** (Partial Metabolic Response) | ↓ SULpeak ≥ 30% И абсолютное ≥ 0.8 |
| **SMD** (Stable Metabolic Disease) | Не PMR и не PMD |
| **PMD** (Progressive Metabolic Disease) | ↑ SULpeak ≥ 30% И ≥ 0.8, или новые очаги, или явное увеличение размера |

### Подготовка
- Натощак ≥ 4-6 ч
- Глюкоза крови < 11 ммоль/л (в идеале < 8)
- Тихий покой 10-15 мин до инъекции
- Доза FDG: ~ 3.5-5 МБк/кг
- Сканирование через 60 ± 10 мин после инъекции
- **Тот же сканер, те же параметры, то же время** — критично для валидного сравнения

### Выбор очагов
- До 5 hottest lesions (≤ 2 на орган)
- Минимальный измеримый: SULpeak > 1.5 × liver SUV mean + 2 SD
- Печень как референс — стандарт

### imPERCIST5 (иммунотерапия)
Модификация для ICI — учёт псевдопрогресса:
- Суммирование SULpeak до 5 очагов (в PERCIST классическом — 1 целевой)
- Подтверждение PMD через 4-8 нед

### PERCIST vs RECIST
| Параметр | RECIST 1.1 | PERCIST 1.0 |
|---|---|---|
| Основа | Анатомия (размер) | Метаболизм (SUL) |
| Модальность | КТ/МРТ | ПЭТ-КТ |
| Ранний ответ | Часто пропускается | Чувствительнее (недели) |
| Псевдопрогресс | Проблема | Тоже проблема → imPERCIST |
| Стандарт для лимфом | Нет | Нет (там Lugano/Deauville) |

### Клиническое применение
- ГИСО (GIST) после иматиниба — метаболический ответ на 1-2 нед раньше анатомического
- НМРЛ, рак молочной железы, рак желудка, пищевода — неоадъювант
- Меланома — оценка ответа на ICI

### Ограничения
- ПЭТ требует стандартизации (часто нарушается в клинической практике)
- Дорого, не всегда доступно
- Не валидировано для всех опухолей (например, простата, ГЦК — предпочтительны другие трейсеры: PSMA, FAPI)
- Воспаление и после-лучевые изменения — false-positive`,
};
export default runner;
