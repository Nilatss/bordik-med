// @ts-nocheck
/** Runner: maddrey-lab — Maddrey DF laboratory panel for alcoholic hepatitis */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'pt',
hint: 'Протромбиновое время, сек', label: 'ПВ пациента', type: 'number', unit: 'сек', min: 8, max: 60, step: 0.1, quickValues: [12, 16, 20, 25] },
    { id: 'pt_ctrl', label: 'ПВ контроль', type: 'number', unit: 'сек', min: 9, max: 15, step: 0.1, quickValues: [11, 12, 13] },
    { id: 'bili',
hint: 'Билирубин общий. Норма: 5-21 мкмоль/л', label: 'Билирубин общий', type: 'number', unit: 'мкмоль/л', min: 5, max: 1000, step: 1, quickValues: [20, 80, 200, 400] },
    { id: 'ast',
hint: 'АСТ. Норма: М <40, Ж <32 Ед/л', label: 'АСТ', type: 'number', unit: 'Ед/л', min: 10, max: 2000, quickValues: [80, 200, 400] },
    { id: 'alt',
hint: 'АЛТ. Норма: М <40, Ж <32 Ед/л', label: 'АЛТ', type: 'number', unit: 'Ед/л', min: 10, max: 2000, quickValues: [40, 100, 200] },
  ],
  compute: (v) => {
    const pt = Number(v.pt) || 0;
    const ptCtrl = Number(v.pt_ctrl) || 12;
    const biliUmol = Number(v.bili) || 0;
    const biliMg = biliUmol / 17.1;
    const ast = Number(v.ast) || 0;
    const alt = Number(v.alt) || 1;
    const ratio = ast / alt;

    const df = 4.6 * (pt - ptCtrl) + biliMg;

    let interpretation = 'Лёгкий АГ';
    let color = '#22C55E';
    if (df >= 32) { interpretation = 'Тяжёлый АГ'; color = '#EF4444'; }
    else if (df >= 20) { interpretation = 'Умеренный АГ'; color = '#F59E0B'; }

    return {
      value: df.toFixed(1),
      unit: 'DF',
      interpretation: `${interpretation}. АСТ/АЛТ = ${ratio.toFixed(2)}`,
      color,
      details: `DF (Maddrey) = 4,6 × (ПВ − ПВ-контроль) + билирубин (мг/дл).
При DF ≥ 32 — показана терапия ГКС (преднизолон 40 мг/сут × 28 дней) при отсутствии противопоказаний.
АСТ/АЛТ > 2 — характерно для алкогольной этиологии (при этом АЛТ обычно < 400).`,
      actions: [
        df >= 32 ? 'ГКС (преднизолон 40 мг/сут × 28 дней) если нет инфекции/кровотечения/панкреатита/ОПН' : null,
        df >= 32 ? 'Оценить Lille Score на 7-й день для отмены ГКС при non-response' : null,
        df >= 32 ? 'MELD, ABIC, GAHS — альтернативные прогностические шкалы' : null,
        ratio > 2 && alt < 400 ? 'Паттерн соответствует алкогольному поражению' : null,
        'Абстиненция — абсолютное условие',
        'Нутритивная поддержка: белок 1,5 г/кг/сут, калории 35 ккал/кг/сут, тиамин, фолат',
        'Исключить HCV, HBV, аутоиммунный гепатит, гемохроматоз',
      ].filter(Boolean),
      caveats: [
        'Классический Maddrey использует ПВ в сек (не МНО); при использовании МНО — пересчитать',
        'Билирубин в mg/dL (делить мкмоль/л на 17,1)',
        'АСТ/АЛТ > 2 не специфично — встречается при циррозе любой этиологии',
        'При АЛТ > 500 — рассмотреть токсический/ишемический/вирусный гепатит',
        'DF имеет умеренную прогностическую точность; MELD и Lille Score предпочтительнее',
      ],
      scale: {
        segments: [
          { min: 0, max: 20, label: 'Лёгкий', color: '#22C55E' },
          { min: 20, max: 32, label: 'Умеренный', color: '#F59E0B' },
          { min: 32, max: 100, label: 'Тяжёлый', color: '#EF4444' },
        ],
        current: Math.min(df, 100),
        unit: 'DF',
      },
      relatedCourses: [
        { id: '301.3', title: 'Гепатология' },
        { id: '304.1', title: 'Лаб. диагностика' },
      ],
      related: [
        { id: 'meld', title: 'MELD' },
        { id: 'child-pugh', title: 'Child-Pugh' },
        { id: 'apri-hep', title: 'APRI/FIB-4' },
      ],
    };
  },
  reference: 'Maddrey WC et al. Gastroenterology 1978;75:193. AASLD 2020 Guidance on Alcohol-Associated Liver Disease.',
  countries: 'Международный (AASLD/EASL)',
  presets: [
    { label: 'Лёгкий АГ', values: { pt: 14, pt_ctrl: 12, bili: 50, ast: 120, alt: 50 } },
    { label: 'Тяжёлый АГ', values: { pt: 22, pt_ctrl: 12, bili: 350, ast: 280, alt: 90 } },
    { label: 'Крит. DF>50', values: { pt: 28, pt_ctrl: 12, bili: 450, ast: 200, alt: 60 } },
  ],
  info: `
### Для чего используется
**Maddrey Discriminant Function (DF)** — лабораторная оценка тяжести **острого алкогольного гепатита (АГ)** и показаний к терапии ГКС.

### Формула
\`DF = 4,6 × (ПВ − ПВ-контроль) + билирубин (мг/дл)\`
Конверсия: \`билирубин мг/дл = мкмоль/л ÷ 17,1\`

### Интерпретация
| DF | Тяжесть | Тактика |
|---|---|---|
| < 32 | Лёгкий/умеренный АГ | Поддерживающая терапия, абстиненция |
| ≥ 32 | Тяжёлый АГ | ГКС 40 мг × 28 дней + Lille на 7-й день |

### Паттерн алкогольного гепатита
| Маркер | Типично |
|---|---|
| АСТ/АЛТ | > 2 (обычно 2–3, редко > 6) |
| АЛТ | < 400 Ед/л (характерно) |
| ГГТ | Резко ↑ |
| MCV | Часто ↑ (макроцитоз) |
| ПВ/МНО | ↑ при тяжёлом |
| Билирубин | ↑ (критерий тяжести) |

### Противопоказания к ГКС
- Активная инфекция (SIRS / сепсис)
- ЖКТ-кровотечение (активное)
- Острый панкреатит
- Неконтролируемый диабет / психоз
- HBV-реактивация

### Lille Score (7-й день)
Рассчитывается после 7 дней ГКС; Lille ≥ 0,45 — non-responder → остановить ГКС (неэффективно, повышают инфекции).

### Альтернативные шкалы тяжести
- **MELD** ≥ 21 — эквивалент DF ≥ 32
- **ABIC** (возраст, билирубин, INR, креатинин)
- **GAHS** (Glasgow Alcoholic Hepatitis Score)

### Ограничения
- ПВ зависит от реактива; рекомендуют калибровать по МНО или использовать фиксированный контроль
- DF не учитывает почечную функцию (в отличие от MELD)
- При одновременной инфекции ГКС повышают смертность`,
};

export default runner;
