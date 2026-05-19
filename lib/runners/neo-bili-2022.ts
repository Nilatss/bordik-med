/**
 * Runner: neo-bili-2022 — Hyperbilirubinaemia management ≥35 нед
 *                         (Bili-2022 AAP / NICE CG98 / КР МЗ РФ ГБН)
 *
 * NEONATOLOGY MODULE A8 (P0). 3-region переключатель.
 *
 * Source attribution:
 *   AAP 2022:   Kemper AR, Newman TB, Slaughter JL, et al. Clinical
 *               Practice Guideline Revision: Management of
 *               Hyperbilirubinemia in the Newborn Infant 35 or More Weeks
 *               of Gestation. Pediatrics. 2022;150(3):e2022058859.
 *               doi:10.1542/peds.2022-058859
 *   COMPANION:  PediTools/bili2022 — peditools.org/bili2022/
 *               (Open-source web implementation)
 *               Bilitool — bilitool.org (Bhutani 1999 nomogram, classic)
 *   NICE:       NICE CG98 (Jaundice in newborn babies under 28 days).
 *               Updated October 2023.
 *               https://www.nice.org.uk/guidance/cg98
 *   RU:         КР МЗ РФ «Гемолитическая болезнь плода и новорождённого»
 *               (последняя редакция 2024).
 *
 * Key Bili-2022 AAP changes vs 2004:
 *   - Phototherapy thresholds **safely higher** (~1-2 mg/dL above 2004)
 *   - Exchange thresholds higher
 *   - G6PD-screening при atypical course (Asian, Mediterranean, African
 *     ancestry)
 *   - Neurotoxicity factors: G6PD, isoimmune haemolysis, asphyxia <24h,
 *     significant lethargy, temperature instability, sepsis,
 *     albumin <3.0 g/dL
 *   - Single-agent escalation: TSB at exchange threshold + neurotoxicity
 *     present → IVIG before exchange
 *
 * Treatment thresholds (mg/dL) — Bili-2022 AAP simplified table at GA 38+0:
 *   Hour of life:  Phototherapy threshold:  Exchange threshold:
 *      24                ~12                   ~21
 *      36                ~14                   ~22
 *      48                ~16                   ~23
 *      72                ~18                   ~25
 *      96+               ~20                   ~25
 *
 *   Lower thresholds для GA <38, more risk factors.
 *
 * Conversion: TSB µmol/L = mg/dL × 17.1
 *
 * Caveats:
 *   - Cut-offs interpolated; точная номограмма AAP 2022 — peditools.org/bili2022/
 *   - GA <35+0 — отдельные guidelines (NICE 2010 + KP NeoBili)
 *   - Direct (conjugated) bili >1.0 mg/dL → cholestasis workup, не
 *     phototherapy
 *
 * SOURCES (audit 1.15):
 *   [1] AAP 2022: doi.org/10.1542/peds.2022-058859
 *   [2] PediTools: peditools.org/bili2022
 *   [3] Bilitool: bilitool.org (Bhutani nomogram)
 *   [4] NICE CG98 (2023): nice.org.uk/guidance/cg98
 *   [5] КР МЗ РФ ГБН: cr.minzdrav.gov.ru
 */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

// Simplified phototherapy thresholds (mg/dL) — AAP 2022 для GA 38+0,
// без neurotoxicity risk factors. Real implementation использует full
// nomograms через interpolation на peditools.org/bili2022/.
//
// Audit B-5: return null when inputs are outside the AAP 2022 nomogram
// scope (GA < 35 нед или HOL > 336 ч). Pre-fix `Math.max(5, base)` clamped
// out-of-scope inputs to an arbitrary 5 mg/dL, which the UI rendered
// indistinguishable from a real low threshold — clinician could base a
// phototherapy decision on extrapolated data. Now compute() short-circuits
// to an explicit "out of scope, use NICE 2010 / specialised nomogram" N/A.
function getPhotoThreshold(hour: number, ga: number, hasRiskFactors: boolean): number | null {
  if (ga < 35) return null;
  if (hour > 336) return null;
  // Base threshold at GA 38+0, no risk factors
  let base: number;
  if (hour < 12) base = 8;
  else if (hour < 24) base = 11;
  else if (hour < 36) base = 14;
  else if (hour < 48) base = 16;
  else if (hour < 72) base = 18;
  else if (hour < 96) base = 19;
  else base = 20;

  // GA adjustment: lower threshold for younger GA
  const ga_adj = (ga - 38) * 0.5; // -0.5 mg/dL per week below 38
  base += ga_adj;

  // Risk factor adjustment
  if (hasRiskFactors) base -= 2;

  // Safety floor at 5 mg/dL — applies ONLY within the in-scope range
  // 35-42 нед × 12-336 ч. Out-of-scope ga / hour already returned null
  // above so the clinician never sees a clamped extrapolation.
  return Math.max(5, base);
}

function getExchangeThreshold(hour: number, ga: number, hasRiskFactors: boolean): number | null {
  if (ga < 35) return null;
  if (hour > 336) return null;
  let base: number;
  if (hour < 24) base = 19;
  else if (hour < 36) base = 21;
  else if (hour < 48) base = 22;
  else if (hour < 72) base = 24;
  else base = 25;

  const ga_adj = (ga - 38) * 0.7;
  base += ga_adj;

  if (hasRiskFactors) base -= 3;

  return Math.max(15, base);
}

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (AAP 2022) · UK (NICE CG98 2023) · РФ (КР МЗ РФ 2024)',
  reference:
    'Kemper AR et al. AAP 2022 Clinical Practice Guideline. Pediatrics 2022;150:e2022058859. NICE CG98 (2023). КР МЗ РФ ГБН 2024.',
  inputs: [
    {
      id: 'region',
      label: 'Регион / руководство',
      type: 'select',
      options: [
        { value: 'aap', label: '🇺🇸 AAP 2022 (Bili-2022)' },
        { value: 'nice', label: '🇬🇧 NICE CG98 (2023)' },
        { value: 'ru', label: '🇷🇺 КР МЗ РФ ГБН 2024' },
      ],
    },
    {
      id: 'ga',
      label: 'Гестационный возраст',
      type: 'number',
      unit: 'нед',
      min: 35,
      max: 42,
      step: 1,
      hint: 'Полные недели; для <35 — отдельный nomogram',
      quickValues: [35, 36, 38, 40],
    },
    {
      id: 'hour',
      label: 'Час жизни (HOL)',
      type: 'number',
      unit: 'ч',
      min: 12,
      max: 336,
      step: 1,
      hint: '12-336 ч (5 сут + 14 дней)',
      quickValues: [24, 48, 72, 96, 168],
    },
    {
      id: 'tsb',
      label: 'TSB (билирубин total)',
      type: 'number',
      unit: 'мкмоль/л',
      min: 30,
      max: 600,
      step: 1,
      hint: 'Для конверсии в mg/dL: ÷17.1',
      quickValues: [100, 170, 250, 340, 425],
    },
    {
      id: 'g6pd',
      label: 'G6PD дефицит (или подозрение / atypical course)',
      type: 'checkbox',
    },
    {
      id: 'asphyxia',
      label: 'Перинатальная асфиксия <24 ч',
      type: 'checkbox',
    },
    {
      id: 'sepsis',
      label: 'Sepsis / temperature instability',
      type: 'checkbox',
    },
    {
      id: 'hypoalbumin',
      label: 'Гипоальбуминемия (<3.0 г/дл)',
      type: 'checkbox',
    },
  ],
  presets: [
    { label: 'AAP, термин 38 нед, 24 ч, TSB 200', values: { region: 'aap', ga: 38, hour: 24, tsb: 200, g6pd: false } },
    { label: 'AAP, 38 нед, 48 ч, G6PD+', values: { region: 'aap', ga: 38, hour: 48, tsb: 280, g6pd: true } },
    { label: 'NICE, 36 нед, 72 ч', values: { region: 'nice', ga: 36, hour: 72, tsb: 320, g6pd: false } },
    { label: 'РФ, 40 нед, 96 ч', values: { region: 'ru', ga: 40, hour: 96, tsb: 340, g6pd: false } },
  ],
  compute: (v) => {
    const region = String(v.region || 'aap');
    // Audit B-5: read the RAW gestational age and hour-of-life before
    // clamping. The HTML min/max only validate the input mask — paste
    // and programmatic presets can bypass them. Surface an explicit
    // N/A for out-of-scope inputs so the clinician is redirected to
    // the correct nomogram (NICE 2010 for <35 нед, etc.) instead of
    // seeing an arbitrarily-clamped extrapolation.
    const rawGa = Number(v.ga);
    const rawHour = Number(v.hour);
    if (Number.isFinite(rawGa) && (rawGa < 35 || rawGa > 42)) {
      return {
        value: 'N/A',
        unit: '',
        interpretation: `GA ${rawGa} нед вне диапазона AAP 2022 (35-42 нед)`,
        color: '#9CA3AF',
        details: rawGa < 35
          ? 'Для GA <35 нед используйте **NICE 2010 preterm jaundice nomogram** или **KP NeoBili (peditools.org/bili2014/)** — у глубоко-недоношенных пороги фототерапии существенно ниже и требуют отдельной номограммы.'
          : 'Для GA >42 нед используйте локальные guidelines — AAP 2022 covers term + late-preterm, post-term jaundice не distinguish-нут от term в номограмме.',
      };
    }
    if (Number.isFinite(rawHour) && (rawHour < 12 || rawHour > 336)) {
      return {
        value: 'N/A',
        unit: '',
        interpretation: `Час жизни ${rawHour} ч вне диапазона калькулятора (12-336 ч / до 14 дней)`,
        color: '#9CA3AF',
        details: rawHour < 12
          ? 'Для первых 12 ч жизни — TSB рекомендуется только при clinical jaundice (видимая желтуха в первые 24 ч = haemolysis workup, не nomogram).'
          : 'После 14 дней (336 ч) — рассмотрите prolonged jaundice workup (cholestasis, hemolysis, hypothyroidism) вместо nomogram-based phototherapy decision.',
      };
    }
    const ga = Math.max(35, Math.min(42, rawGa || 38));
    const hour = Math.max(12, Math.min(336, rawHour || 48));
    const tsb_umol = Math.max(30, Math.min(600, Number(v.tsb) || 200));
    const tsb_mgdl = tsb_umol / 17.1;

    const hasRiskFactors =
      v.g6pd === true ||
      v.asphyxia === true ||
      v.sepsis === true ||
      v.hypoalbumin === true;

    // Compute thresholds (mg/dL). Both functions now return number|null;
    // any out-of-scope inputs are already filtered above so we can
    // safely non-null assert here.
    const photo_mgdl = getPhotoThreshold(hour, ga, hasRiskFactors)!;
    const exchange_mgdl = getExchangeThreshold(hour, ga, hasRiskFactors)!;
    const photo_umol = photo_mgdl * 17.1;
    const exchange_umol = exchange_mgdl * 17.1;

    // Distance from thresholds
    const distance_to_photo = photo_mgdl - tsb_mgdl;
    const distance_to_exchange = exchange_mgdl - tsb_mgdl;

    // Decision logic
    let recommendation: string;
    let color: string;
    const actions: string[] = [];

    if (tsb_mgdl >= exchange_mgdl) {
      recommendation = 'Уровень обмена (Exchange) — срочное вмешательство';
      color = '#7F1D1D';
      actions.push(
        '⚠️ ОБМЕННОЕ ПЕРЕЛИВАНИЕ показано — TSB ≥ exchange threshold',
        'Параллельно intensified phototherapy (multiple banks)',
        'IVIG 0.5-1 г/кг при isoimmune haemolysis (РhD/АВО) перед exchange',
        'Albumin 1 г/кг IV если hypoalbuminaemia <3.0 г/дл',
        'Следить bili q2h до снижения; повторное TSB через 4 ч после exchange',
      );
    } else if (tsb_mgdl >= photo_mgdl) {
      recommendation = 'Уровень фототерапии — требуется лечение';
      color = '#F59E0B';
      actions.push(
        '✓ **Начать фототерапию** — intensive (4-6 ламп, dual surface)',
        'Цель — снижение ≥1-2 мг/дл за 4-8 ч',
        'TSB повторно через 4-6 ч',
        'Encourage breastfeeding (≥8-12 раз/сут) или формула если потеря >7%',
        'Контроль G6PD при atypical course (Asian/Mediterranean ancestry)',
      );
    } else if (distance_to_photo < 3) {
      recommendation = 'Близко к порогу — наблюдение и повтор TSB';
      color = '#FACC15';
      actions.push(
        `Повторное TSB через 4-6 ч — ниже порога фототерапии на ${distance_to_photo.toFixed(1)} мг/дл (${(distance_to_photo * 17.1).toFixed(0)} мкмоль/л)`,
        'Усилить feeding (8-12× в сут breastfeeding)',
        'Контроль массы тела, кожный покров, поведение',
      );
    } else {
      recommendation = 'Ниже порога — стандартный мониторинг';
      color = '#22C55E';
      actions.push(
        'TSB ниже порога фототерапии',
        'Стандартный neonatal newborn nursery monitoring',
        'TSB при выписке и follow-up по разнице с порогом',
      );
    }

    if (hasRiskFactors) {
      actions.push('⚠️ Нейротоксические факторы → пороги снижены');
    }

    const regionLabel: Record<string, string> = {
      aap: 'AAP 2022 (Bili-2022)',
      nice: 'NICE CG98 (2023)',
      ru: 'КР МЗ РФ ГБН 2024',
    };
    const interpretation = `TSB ${tsb_umol} мкмоль/л (${tsb_mgdl.toFixed(1)} мг/дл) при ${hour} ч / GA ${ga} нед — ${recommendation} [${regionLabel[region]}]`;

    const details = `### Текущий уровень

- TSB: **${tsb_umol} мкмоль/л** = **${tsb_mgdl.toFixed(1)} мг/дл**
- Hour of life: ${hour} ч
- GA: ${ga} нед

### Пороги (${regionLabel[region]})

| Уровень | Порог mg/dL | Порог мкмоль/л | Расстояние от текущего |
|---|---|---|---|
| Phototherapy | **${photo_mgdl.toFixed(1)}** | ${photo_umol.toFixed(0)} | ${distance_to_photo >= 0 ? `${distance_to_photo.toFixed(1)} мг/дл ниже` : `${Math.abs(distance_to_photo).toFixed(1)} мг/дл ВЫШЕ`} |
| Exchange | **${exchange_mgdl.toFixed(1)}** | ${exchange_umol.toFixed(0)} | ${distance_to_exchange >= 0 ? `${distance_to_exchange.toFixed(1)} мг/дл ниже` : `${Math.abs(distance_to_exchange).toFixed(1)} мг/дл ВЫШЕ`} |

### Нейротоксические факторы (Bili-2022 AAP)

| Фактор | Активен? |
|---|---|
| G6PD дефицит | ${v.g6pd === true ? '✓' : '—'} |
| Перинатальная асфиксия <24 ч | ${v.asphyxia === true ? '✓' : '—'} |
| Sepsis / temperature instability | ${v.sepsis === true ? '✓' : '—'} |
| Гипоальбуминемия <3.0 г/дл | ${v.hypoalbumin === true ? '✓' : '—'} |

${hasRiskFactors ? '⚠️ **Пороги снижены** на 2-3 мг/дл из-за нейротоксических факторов' : 'Нейротоксических факторов нет — стандартные пороги'}

### Конверсия

- **TSB**: 1 мг/дл = 17.1 мкмоль/л
- **Bili-2022 AAP** = повышенные cut-offs vs AAP 2004 (~1-2 мг/дл выше)
- **NICE CG98** + addendum 2023 — UK national thresholds
- **КР МЗ РФ ГБН** — пересчёт от классических AAP 2004 без update

### Точный расчёт

⚠️ Bordik MVP использует **simplified interpolation**. Для точной
номограммы AAP 2022 → **peditools.org/bili2022/**.

Для UK режима с traffic light system → **bilitool.org** или NICE CG98 charts.`;

    return {
      value: tsb_mgdl >= exchange_mgdl ? 'EXCHANGE' : tsb_mgdl >= photo_mgdl ? 'PHOTOTHERAPY' : 'OBSERVE',
      unit: regionLabel[region],
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Bordik MVP — simplified interpolation; точные nomograms на peditools.org/bili2022/',
        'GA <35+0 — отдельные guidelines (NICE 2010, KP NeoBili) — не использовать этот калькулятор',
        'Direct (conjugated) bili >1.0 мг/дл (>17 мкмоль/л) → cholestasis workup, НЕ phototherapy',
        'Trends важнее single point — серийные TSB через 4-6 ч',
        'Ранний (<24 ч) jaundice → подозрение на haemolysis (Coombs, retic, blood type)',
        'AAP 2022 vs 2004: пороги ВЫШЕ — старый approach overtreated',
        'IVIG только при isoimmune haemolysis (RhD/ABO/anti-c/anti-Kell) при TSB ≥ exchange − 2 мг/дл',
        'Photoizomer half-life ~2-3 ч — TSB after photo decline ≥1-2 мг/дл за 4-8 ч ожидаемо',
      ],
      scale: {
        segments: [
          { min: 0, max: photo_mgdl, label: 'Observe', color: '#22C55E' },
          { min: photo_mgdl, max: exchange_mgdl, label: 'Photo', color: '#F59E0B' },
          { min: exchange_mgdl, max: 35, label: 'Exchange', color: '#7F1D1D' },
        ],
        current: tsb_mgdl,
        unit: 'мг/дл',
      },
      related: [
        { id: 'kramer', title: 'Kramer scale / Bhutani' },
        { id: 'unit-bili', title: 'Конверсия билирубина' },
        { id: 'apgar', title: 'Apgar' },
        { id: 'neo-fluid', title: 'Жидкость по дням' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Неонатология' },
        { id: '300.4', title: 'Педиатрия' },
      ],
    };
  },
  info: `### Что такое Bili-2022 AAP

Обновлённое (2022) клиническое руководство AAP по management
гипербилирубинемии у новорождённых ≥35 недель GA. Заменяет AAP 2004.

**Ключевые изменения 2022 vs 2004:**
- Пороги фототерапии и обмена **safely higher** (~1-2 мг/дл выше)
- Чёткое discrimination нейротоксических факторов
- G6PD screening при atypical course
- Single-agent escalation для near-exchange TSB

### Целевая популяция

- **GA ≥35+0 недель** (preterm <35 — отдельные guidelines)
- **Hour of life 12-336 ч** (12 ч — 14 дней)
- **TSB только** (не conjugated/direct)
- Direct bili >1.0 мг/дл → cholestasis workup отдельно

### Нейротоксические факторы (Bili-2022 AAP)

При наличии любого — пороги снижены:
- G6PD дефицит (Asian, Mediterranean, African)
- Перинатальная асфиксия <24 ч
- Significant lethargy, temperature instability
- Sepsis
- Acidosis
- Albumin <3.0 g/dL
- Isoimmune haemolysis (Rh, ABO, anti-c)

### Региональные различия (3 переключателя)

| Регион | Источник | Особенности |
|---|---|---|
| **AAP 2022** (US) | Pediatrics 150:e2022058859 | Самые высокие cut-offs; G6PD focus |
| **NICE CG98** (UK) | nice.org.uk/guidance/cg98 | Traffic light system; отдельные таблицы |
| **КР МЗ РФ ГБН** | cr.minzdrav.gov.ru | Близко к AAP 2004 cut-offs |

### Decision tree

\`\`\`
TSB ≥ exchange threshold
├── + neurotoxicity factors → IVIG + intensified photo + EXCHANGE
└── без → intensified photo + EXCHANGE (если не отвечает за 4-6 ч)

TSB ≥ photo threshold (но < exchange)
├── Intensive phototherapy (multi-bank)
├── Цель снижения ≥1-2 мг/дл за 4-8 ч
└── Repeat TSB q4-6h

TSB ≥ photo - 3 mg/dL (близко к порогу)
├── Усиленный feeding
└── Repeat TSB q4-6h

TSB < photo - 3 mg/dL
└── Standard monitoring
\`\`\`

### IVIG (Intravenous Immunoglobulin)

**Показание:** isoimmune haemolytic disease (Rh/ABO/anti-c/anti-Kell)
с TSB ≥ exchange threshold − 2 мг/дл, или быстрое нарастание (>0.5 мг/дл/ч)
несмотря на phototherapy.

**Доза:** 0.5-1 г/кг IV за 2 ч. Может предотвратить exchange.

### Phototherapy intensity

- **Conventional:** 1 банк 8-10 µW/cm²/nm
- **Intensive:** ≥30 µW/cm²/nm (multiple banks, dual surface) — для AAP
  exchange-near или fast-rising
- Single fluorescent < LED < dual-surface fibre-optic + overhead

### Exchange transfusion

- **Volume:** 2× blood volume = 160 мл/кг (preterm 170 мл/кг)
- **Type:** O-Rh−negative if Rh haemolysis; ABO-compatible otherwise
- **Continuous photo** во время exchange + 24 ч после
- **Check:** TSB через 1 ч, 4 ч, 12 ч после exchange (ребоунд возможен)

### Точные расчёты — peditools.org/bili2022/

Bordik MVP использует simplified interpolation. Полная nomograms AAP 2022
(2 nomograms × neurotoxicity factor presence × GA × HOL) на:

- **peditools.org/bili2022/** — open-source, Bili-2022 compliant
- **bilitool.org** — Bhutani 1999 nomogram (classic)
- **NICE CG98 charts** для UK

### Источники

- Kemper AR et al. AAP 2022. Pediatrics 150:e2022058859.
- PediTools 2022: peditools.org/bili2022
- Bilitool: bilitool.org
- NICE CG98 (Oct 2023 update): nice.org.uk/guidance/cg98
- КР МЗ РФ «Гемолитическая болезнь плода и новорождённого» 2024

### Ограничения

- **GA <35+0 нед** — НЕ использовать (отдельные nomograms)
- **Conjugated jaundice** — workup для cholestasis отдельно
- Bordik MVP simplified — для точных решений use peditools.org/bili2022/
- Серийные TSB важнее single point — оценивать trend
`,
};

export default runner;
