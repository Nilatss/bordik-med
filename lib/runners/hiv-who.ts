// @ts-nocheck
/** Runner: hiv-who — WHO HIV clinical staging 1-4 + CD4 */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'event',
      label: 'Клиническое событие',
      type: 'select',
      options: [
        { value: '1', label: 'Бессимптомная / ПГЛ' },
        { value: '2a', label: 'Потеря веса < 10 %' },
        { value: '2b', label: 'Рецидив респ. инфекций' },
        { value: '2c', label: 'Опоясывающий герпес' },
        { value: '2d', label: 'Ангулярный хейлит / себор. дерматит' },
        { value: '3a', label: 'Потеря веса > 10 %' },
        { value: '3b', label: 'Хроническая диарея > 1 мес' },
        { value: '3c', label: 'Лихорадка > 1 мес' },
        { value: '3d', label: 'Оральный кандидоз' },
        { value: '3e', label: 'Волосатая лейкоплакия' },
        { value: '3f', label: 'Туберкулёз лёгких' },
        { value: '3g', label: 'Тяжёлые бактериальные инфекции' },
        { value: '4a', label: 'ВИЧ-wasting синдром' },
        { value: '4b', label: 'Пневмоцистная пневмония (PCP)' },
        { value: '4c', label: 'Церебральный токсоплазмоз' },
        { value: '4d', label: 'Криптококковый менингит' },
        { value: '4e', label: 'ЦМВ-ретинит' },
        { value: '4f', label: 'Саркома Капоши' },
        { value: '4g', label: 'Лимфома (не-Ходжкина, ЦНС)' },
        { value: '4h', label: 'Внелёгочный ТБ' },
        { value: '4i', label: 'Прогрессивная мультифокальная лейкоэнцефалопатия' },
      ],
    },
    {
      id: 'cd4',
      label: 'CD4 (абсолютное число)',
      type: 'number',
      unit: 'кл/мкл',
      min: 0,
      max: 2000,
      quickValues: [50, 100, 200, 350, 500, 800],
    },
  ],
  compute: (v) => {
    const event = String(v.event || '1');
    const cd4 = Number(v.cd4) || 0;
    const stage = event.charAt(0);

    let who = 'I';
    let whoLabel = 'I — Бессимптомная';
    let color = '#22C55E';
    if (stage === '1') { who = 'I'; whoLabel = 'I — Бессимптомная / ПГЛ'; color = '#22C55E'; }
    else if (stage === '2') { who = 'II'; whoLabel = 'II — Лёгкая'; color = '#84CC16'; }
    else if (stage === '3') { who = 'III'; whoLabel = 'III — Прогрессирующая'; color = '#F59E0B'; }
    else if (stage === '4') { who = 'IV'; whoLabel = 'IV — Тяжёлая (AIDS)'; color = '#EF4444'; }

    let cd4Stage = 'Норма';
    if (cd4 < 200) cd4Stage = 'СПИД (< 200)';
    else if (cd4 < 350) cd4Stage = 'Иммуносупрессия (200–349)';
    else if (cd4 < 500) cd4Stage = 'Умеренная (350–499)';
    else cd4Stage = 'Норма (≥ 500)';

    const opp = [];
    if (cd4 < 200) opp.push('TMP-SMX профилактика PCP + токсоплазмоз');
    if (cd4 < 100) opp.push('Профилактика криптококка (flucytosine + амфотерицин при инфекции)');
    if (cd4 < 50) opp.push('Профилактика MAC (азитромицин 1200 мг/нед)');
    if (cd4 < 50) opp.push('Скрининг ЦМВ-ретинита у офтальмолога');

    return {
      value: `Стадия ${who}`,
      unit: `CD4 ${cd4}`,
      interpretation: `${whoLabel}. ${cd4Stage}.`,
      color,
      details: `ВСЕМ пациентам с ВИЧ — ART немедленно, независимо от CD4 и стадии (WHO 2015 «Treat All»). Первая линия: TDF + 3TC (или FTC) + DTG.`,
      actions: [
        'ART первой линии: TDF/FTC + DTG (долутегравир) — бустер не нужен',
        'Альтернатива: ABC/3TC + DTG (при ХБП или остеопорозе)',
        cd4 < 200 ? 'TMP-SMX 480 мг/сут для PCP/токсоплазмоз-профилактики (до CD4 > 200 × 3 мес)' : null,
        cd4 < 100 ? 'Исключить криптококковую антигенемию (CrAg-скрининг) до ART' : null,
        cd4 < 50 ? 'Азитромицин 1200 мг/нед для профилактики MAC (спорно при быстром ART)' : null,
        'Скрининг ТБ (Xpert MTB/RIF) — при положительном начать ТБ-терапию, ART через 2 нед (при CD4 < 50) или 8 нед (CD4 ≥ 50)',
        'Гепатит B/C, сифилис, туберкулёз, ЦМВ — рутинный скрининг',
        'Партнёрам — PrEP (TDF/FTC ежедневно)',
      ].filter(Boolean),
      caveats: [
        'WHO staging клиническая — не требует CD4, используется в ресурс-ограниченных условиях',
        'CD4 < 200 = СПИД (AIDS-defining), независимо от симптомов (CDC)',
        'При СЦА (синдром восстановления иммунитета) — продолжать ART + лечение ОИ + стероиды при тяжёлом',
        'DTG безопасен при беременности (после 2019 пересмотра)',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'I', color: '#22C55E' },
          { min: 2, max: 3, label: 'II', color: '#84CC16' },
          { min: 3, max: 4, label: 'III', color: '#F59E0B' },
          { min: 4, max: 5, label: 'IV (AIDS)', color: '#EF4444' },
        ],
        current: Math.min(Number(stage) || 1, 5),
        unit: 'стадия',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '307.2', title: 'Микробиология' },
      ],
      related: [
        { id: 'vacs', title: 'VACS Index' },
        { id: 'cd4-cd8', title: 'CD4/CD8 ratio' },
      ],
    };
  },
  reference: 'WHO Clinical Staging of HIV/AIDS (2007, updated 2015). WHO Consolidated ART Guidelines 2021.',
  countries: 'Международный (WHO)',
  presets: [
    { label: 'Бессимптомная, CD4 600', values: { event: '1', cd4: 600 } },
    { label: 'III (ТБ лёгких), CD4 250', values: { event: '3f', cd4: 250 } },
    { label: 'IV (PCP), CD4 80', values: { event: '4b', cd4: 80 } },
  ],
  info: `### Для чего используется
**WHO Clinical Staging HIV** — клиническая стадийность ВИЧ (I–IV) без необходимости CD4. Используется в ресурс-ограниченных условиях для решения об ART и ОИ-профилактике.

### Стадии
| Стадия | Клиника | Примеры |
|---|---|---|
| **I** | Бессимптомная | Асимптоматика, ПГЛ |
| **II** | Лёгкая | Потеря < 10 %, рецидив ОРИ, herpes zoster, себорея |
| **III** | Прогрессирующая | Потеря > 10 %, диарея > 1 мес, ТБ лёгких, оральный кандидоз |
| **IV** (AIDS) | Тяжёлая | PCP, токсоплазмоз ЦНС, криптококкоз, саркома Капоши, внелёгочный ТБ, лимфома |

### CD4-стадийность
| CD4 | Значение |
|---|---|
| ≥ 500 | Норма |
| 350–499 | Умеренная супрессия |
| 200–349 | Иммуносупрессия |
| < 200 | СПИД (AIDS), риск ОИ |
| < 100 | Криптококк, токсоплазмоз |
| < 50 | MAC, ЦМВ |

### ART — WHO 2021 Treat All
Всем, независимо от CD4 и стадии.

**Первая линия (взрослые):**
- **TDF + 3TC (или FTC) + DTG** (долутегравир)
- Альтернатива: ABC/3TC + DTG, TAF/FTC + DTG

**Первая линия (детям):**
- ABC + 3TC + DTG

### Профилактика ОИ
| CD4 | Профилактика |
|---|---|
| < 200 | TMP-SMX (PCP + токсоплазмоз) |
| < 100 | + Криптококк-скрининг CrAg |
| < 50 | + Азитромицин (MAC, в рег-зависимости) |

### ТБ + ВИЧ
- Скрининг Xpert MTB/RIF всем
- ART начать в первые 2 нед ТБ-терапии при CD4 < 50
- При CD4 ≥ 50 — через 8 нед (снизить риск IRIS / СВИ)

### Ограничения
- Клиническая стадия — не заменяет вирусную нагрузку
- СВИ (IRIS) может имитировать прогрессию после ART
- DTG в первой линии с 2019 и при беременности

### Источник
WHO. *Consolidated Guidelines on HIV Prevention, Testing, Treatment, Service Delivery and Monitoring.* 2021.`,
};

export default runner;
