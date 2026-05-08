/** Runner: who-tb — WHO TB treatment regimens */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'type',
      label: 'Тип ТБ',
      type: 'select',
      options: [
        { value: 'ds', label: 'Лекарственно-чувствительный (DS-TB)' },
        { value: 'hr', label: 'Изониазид-резистентный (Hr-TB)' },
        { value: 'mdr', label: 'МЛУ-ТБ (MDR: R+H)' },
        { value: 'pre_xdr', label: 'Pre-XDR (MDR + FQ-R)' },
        { value: 'xdr', label: 'ШЛУ/XDR-TB' },
      ],
    },
    { id: 'weight',
hint: 'Вес в кг (без одежды)', label: 'Масса тела', type: 'number', unit: 'кг', min: 5, max: 150, quickValues: [15, 30, 50, 70, 90] },
    { id: 'hiv', label: 'ВИЧ-положителен', type: 'checkbox' },
    { id: 'extrapulm', label: 'Внелёгочный ТБ (кости, ЦНС)', type: 'checkbox' },
    { id: 'children', label: 'Ребёнок / подросток', type: 'checkbox' },
  ],
  compute: (v) => {
    const type = String(v.type || 'ds');
    const weight = Number(v.weight) || 70;
    const hiv = Boolean(v.hiv);
    const extrapulm = Boolean(v.extrapulm);
    const children = Boolean(v.children);

    let regimen = '';
    let duration = '';
    let color = '#22C55E';
    let headline = '';

    if (type === 'ds') {
      headline = 'Стандартная 6-мес. схема (DS-TB)';
      regimen = '2HRZE / 4HR — интенсивная фаза 2 мес (H+R+Z+E), продолжение 4 мес (H+R)';
      duration = '6 мес';
      color = '#22C55E';
      if (extrapulm) { duration = '9–12 мес (ТБ ЦНС/костей — до 12 мес)'; color = '#F59E0B'; }
    } else if (type === 'hr') {
      headline = 'Hr-TB (изониазид-резистентный, WHO 2020)';
      regimen = '6 мес (R) + Z + E + левофлоксацин — "6 REZ-Lfx"';
      duration = '6 мес';
      color = '#F59E0B';
    } else if (type === 'mdr') {
      headline = 'MDR/RR-TB — BPaLM (WHO 2022)';
      regimen = 'Бедаквилин + претоманид + линезолид + моксифлоксацин (6 мес)';
      duration = '6 мес (BPaLM) — замена длинных 18–20 мес режимов';
      color = '#F97316';
    } else if (type === 'pre_xdr') {
      headline = 'Pre-XDR — BPaL (WHO 2022)';
      regimen = 'Бедаквилин + претоманид + линезолид (6 мес)';
      duration = '6 мес';
      color = '#EF4444';
    } else if (type === 'xdr') {
      headline = 'XDR-TB — индивидуализированный режим';
      regimen = 'Бедаквилин + претоманид + линезолид ± моксифл/клофазимин; экспертиза';
      duration = '9–20 мес';
      color = '#7F1D1D';
    }

    // Weight-band dosing (DS-TB adults, FDC)
    let doseNote = '';
    if (type === 'ds' && !children) {
      if (weight < 30) doseNote = 'FDC детская форма — уточнить по весу';
      else if (weight <= 37) doseNote = 'H 150 R 300 (или 2 табл FDC 75/150/400/275)';
      else if (weight <= 54) doseNote = '3 табл FDC 75/150/400/275';
      else if (weight <= 70) doseNote = '4 табл FDC';
      else doseNote = '5 табл FDC';
    }

    const actions = [
      'DST (drug susceptibility testing): Xpert MTB/RIF Ultra, а затем фенотипическое DST',
      'Контроль мазка мокроты на 2, 5 и 6 мес лечения',
      hiv ? 'ART всем ВИЧ+ независимо от CD4: начать через 2 нед ТБ-терапии (CD4 < 50) или 8 нед (CD4 ≥ 50)' : null,
      hiv ? 'TMP-SMX профилактика PCP при CD4 < 200' : null,
      children ? 'Педиатрические FDC: H 50 + R 75 + Z 150; E 100 (по весу)' : null,
      extrapulm ? 'ТБ ЦНС: добавить дексаметазон 0,3–0,4 мг/кг/сут × 6–8 нед с постепенным снижением' : null,
      type === 'mdr' || type === 'pre_xdr' || type === 'xdr' ? 'Мониторинг ЭКГ (QTc) — бедаквилин, моксифлоксацин удлиняют' : null,
      type === 'mdr' || type === 'pre_xdr' || type === 'xdr' ? 'Линезолид — мониторинг общего анализа крови, периферической нейропатии, зрительных нервов' : null,
      'Bacillus Calmette-Guérin (BCG) — профилактика, не лечение',
      'Наблюдение контактных — изониазид-профилактика (3HR, 6H, 9H или 3HP у детей/ВИЧ+)',
    ].filter(Boolean);

    return {
      value: headline,
      unit: duration,
      interpretation: regimen + (doseNote ? ` · ${doseNote}` : ''),
      color,
      details: `WHO обновила рекомендации: для MDR/pre-XDR теперь 6-месячный BPaL/BPaLM режим вместо 18–20 мес. Для DS-TB остаётся 6 мес (2HRZE/4HR). Все схемы DOTS (direct-observed therapy).`,
      actions,
      caveats: [
        'Xpert MTB/RIF Ultra — диагностический тест первой линии (выявляет R-резистентность)',
        'BPaLM/BPaL требуют экспертизы и регулярного ЭКГ-мониторинга',
        'Линезолид >28 дн — мониторинг нейропатии, миелосупрессии',
        'Бедаквилин + моксифлоксацин → QTc может прогрессировать',
        'Взаимодействие с ART: рифампицин ↓ уровень долутегравира (удвоить дозу DTG при 1×/сут → 2×/сут)',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'DS', color: '#22C55E' },
          { min: 1, max: 2, label: 'Hr', color: '#F59E0B' },
          { min: 2, max: 3, label: 'MDR', color: '#F97316' },
          { min: 3, max: 4, label: 'Pre-XDR', color: '#EF4444' },
          { min: 4, max: 5, label: 'XDR', color: '#7F1D1D' },
        ],
        current: ({ ds: 0.5, hr: 1.5, mdr: 2.5, pre_xdr: 3.5, xdr: 4.5 } as any)[type] || 0.5,
        unit: '',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '307.2', title: 'Микробиология' },
      ],
      related: [
        { id: 'hiv-who', title: 'HIV WHO staging' },
        { id: 'thwaites', title: 'Thwaites TBM' },
      ],
    };
  },
  reference: 'WHO Consolidated Guidelines on Tuberculosis: Drug-Resistant TB Treatment (2022 update). WHO Operational Handbook 2022.',
  countries: 'Международный (WHO)',
  presets: [
    { label: 'DS-ТБ взрослый 65 кг', values: { type: 'ds', weight: 65, hiv: false, extrapulm: false, children: false } },
    { label: 'МЛУ-ТБ + ВИЧ', values: { type: 'mdr', weight: 60, hiv: true, extrapulm: false, children: false } },
    { label: 'ТБ ЦНС (ребёнок 18 кг)', values: { type: 'ds', weight: 18, hiv: false, extrapulm: true, children: true } },
  ],
  info: `### Для чего используется
**WHO TB Treatment Guidelines 2022** — выбор схемы и длительности терапии в зависимости от лекарственной чувствительности.

### DS-TB (чувствительный) — 6 мес
**2HRZE / 4HR:**
| Фаза | Длит. | Препараты |
|---|---|---|
| Интенсивная | 2 мес | H (изониазид) + R (рифампицин) + Z (пиразинамид) + E (этамбутол) |
| Продолжение | 4 мес | H + R |

ТБ ЦНС / кости — до 12 мес.

### Hr-TB (изониазид-R) — 6 мес
R + Z + E + Левофлоксацин × 6 мес.

### MDR/RR-TB (R+H) — BPaLM 6 мес (WHO 2022)
- **B** — Бедаквилин
- **Pa** — Претоманид
- **L** — Линезолид
- **M** — Моксифлоксацин

Заменяет старые 18–20 мес режимы. Критерии: ≥ 14 лет, без беременности, тяжёлая болезнь ЦНС, без FQ-R.

### Pre-XDR (MDR + FQ-R) — BPaL 6 мес
Бедаквилин + претоманид + линезолид.

### XDR-TB
Индивидуализированный режим с 4–5 эффективных препаратов, экспертиза.

### Весовые режимы (DS-TB, взрослые, FDC)
| Вес | Табл./сут (H75/R150/Z400/E275) |
|---|---|
| 30–37 | 2 |
| 38–54 | 3 |
| 55–70 | 4 |
| > 70 | 5 |

### ВИЧ + ТБ
- ART всем — начать в первые 2 нед (CD4 < 50) или 8 нед (CD4 ≥ 50)
- TMP-SMX (PCP-профилактика) при CD4 < 200
- DTG с рифампицином: удвоить дозу DTG (50 мг × 2)
- TAF + рифампицин несовместимы — использовать TDF

### Контроль эффективности
- Мазки мокроты на 2, 5, 6 мес
- Конверсия культуры к 2 мес = хороший ответ
- ЭКГ при бедаквилине, FQ, клофазимине (QTc)
- ОАК, АЛТ/АСТ, креатинин — ежемесячно

### Ограничения
- Требуется DST (Xpert MTB/RIF Ultra + фенотипическое)
- BPaL/BPaLM — доступность препаратов
- Мониторинг интенсивный
- Взаимодействия с ART, КОК, ВТЭ-профилактикой`,
};

export default runner;
