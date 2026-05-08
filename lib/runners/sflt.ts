/** Runner: sflt - sFlt-1/PlGF ratio (Verlohren 2010, PROGNOSIS 2016) */
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
      id: 'ga',
      label: 'Срок беременности',
      type: 'select',
      options: [
        { value: 'early', label: '< 34 нед (early-onset)' },
        { value: 'late', label: '≥ 34 нед (late-onset)' },
      ],
    },
    { id: 'ratio', label: 'Соотношение sFlt-1/PlGF', type: 'number', unit: '', min: 0, max: 1000, step: 1, quickValues: [10, 38, 85, 110, 200, 500] },
  ],
  compute: (v) => {
    const early = v.ga === 'early';
    const r = Number(v.ratio);
    let band = '';
    let color = '';
    let actions = [];
    const highCut = early ? 85 : 110;
    if (r < 38) {
      band = 'Низкий (< 38)';
      color = '#22C55E';
      actions = [
        'Преэклампсия в течение 1 нед исключена (NPV 99.3% - PROGNOSIS)',
        'Амбулаторное ведение; повторить при клинических изменениях',
      ];
    } else if (r <= (early ? 85 : 110)) {
      band = `Промежуточный (38-${early ? 85 : 110})`;
      color = '#F59E0B';
      actions = [
        'Повторить через 1-2 нед',
        'Усилить наблюдение: АД, анализы, КТГ',
        'При росте соотношения - госпитализация',
      ];
    } else {
      band = `Высокий (> ${highCut})`;
      color = '#DC2626';
      actions = [
        'Подтверждает преэклампсию / плацентарную дисфункцию с высокой вероятностью (PPV ~36-40% в 4 нед)',
        'Госпитализация, оценка по ACOG/ISSHP',
        'При early-onset > 655 - угроза родоразрешения в 48 ч',
      ];
    }
    return {
      value: String(r),
      unit: '',
      interpretation: `sFlt-1/PlGF ${r} → ${band}`,
      color,
      details:
        'PROGNOSIS (Zeisler 2016, NEJM 374:13): соотношение ≤ 38 исключает ПЭ на 1 неделю (NPV 99.3%). Пороги высокого риска: > 85 (< 34 нед) и > 110 (≥ 34 нед).',
      actions,
      caveats: [
        'Учитывать срок беременности при интерпретации порога',
        'Многоплодная беременность - пороги иные, данные ограничены',
        'При СД, ХБП базальные уровни могут быть изменены',
        'Не заменяет клинической оценки - используется совместно с АД, протеинурией, симптоматикой',
      ],
      related: [
        { id: 'acog-preeclampsia', title: 'Преэклампсия' },
        { id: 'pierce', title: 'fullPIERS' },
        { id: 'hellp', title: 'HELLP' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Акушерство' },
        { id: '203.9', title: 'Лабораторная диагностика' },
      ],
    };
  },
  reference:
    'Verlohren S et al. Am J Obstet Gynecol 2010;202:161. Zeisler H et al. PROGNOSIS - NEJM 2016;374:13.',
  countries: 'Международный (EMA одобрено)',
  presets: [
    { label: 'Исключение ПЭ', values: { ga: 'late', ratio: 20 } },
    { label: 'Промежуточный', values: { ga: 'late', ratio: 60 } },
    { label: 'Высокий early', values: { ga: 'early', ratio: 150 } },
  ],
  caveats: [
    'Порог 38 - универсальный для rule-out',
    'Комбинация с клиникой даёт наилучшую точность',
  ],
  related: [
    { id: 'acog-preeclampsia', title: 'Преэклампсия' },
    { id: 'pierce', title: 'fullPIERS' },
    { id: 'hellp', title: 'HELLP' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство' },
    { id: '203.9', title: 'Лабораторная диагностика' },
  ],
  info: `### sFlt-1/PlGF ratio
**sFlt-1** (soluble fms-like tyrosine kinase-1) - антиангиогенный фактор; **PlGF** (placental growth factor) - проангиогенный. Дисбаланс → плацентарная дисфункция → преэклампсия.

### Интерпретация (Verlohren / PROGNOSIS)
| Ratio | Значение |
|---|---|
| < 38 | ПЭ в течение 1 нед исключена (NPV 99.3%) |
| 38-85 (< 34 нед) / 38-110 (≥ 34 нед) | Повышенный риск; повтор через 1-2 нед |
| > 85 (< 34 нед) / > 110 (≥ 34 нед) | Высокая вероятность ПЭ / плацентарной дисфункции |
| > 655 (< 34 нед) / > 201 (≥ 34 нед) | Угроза родоразрешения в 48 ч |

### Клиническое применение
- Rule-out ПЭ у симптоматических пациенток
- Триаж между амбулаторным и стационарным ведением
- Мониторинг прогрессии

### Источники
Verlohren S 2010. Zeisler H, NEJM 2016 (PROGNOSIS).`,
};

export default runner;
