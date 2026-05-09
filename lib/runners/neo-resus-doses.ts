/**
 * Runner: neo-resus-doses — Neonatal Resuscitation Doses (3 regions)
 *
 * NEONATOLOGY MODULE A17 (P0). Source attribution:
 *   PRIMARY (US):     Weiner GM, Zaichkin J, eds. Textbook of Neonatal
 *                     Resuscitation (NRP), 8th ed. AAP & AHA; 2021.
 *   PRIMARY (EU):     Madar J, Roehr CC, Ainsworth S, et al. ERC 2021
 *                     Newborn resuscitation guidelines. Resuscitation.
 *                     2021;161:291-326.
 *                     doi:10.1016/j.resuscitation.2021.02.014
 *                     ERC 2025 update — cut-off prematurity 32 нед.
 *   PRIMARY (RU):     Методическое письмо МЗ РФ от 04.03.2020 (под ред.
 *                     Е.Н. Байбариной) «Первичная и реанимационная
 *                     помощь новорождённым детям».
 *
 * Региональные различия эпинефрина и других препаратов:
 *
 *   ── Эпинефрин (Adrenalin) ─────────────────────────────────
 *   Препарат первой линии при HR <60 после 30 сек качественной PPV +
 *   60 сек CC + PPV. Концентрация 1:10 000 = 0.1 мг/мл.
 *
 *   NRP 8 ed. (US):
 *     IV/IO:  0.02 мг/кг (range 0.01-0.03), 0.2 мл/кг of 1:10 000
 *             + 3 мл NaCl flush after IV bolus
 *     ETT:   0.1 мг/кг (range 0.05-0.1), 1 мл/кг of 1:10 000
 *             (only if IV/IO not available; less reliable)
 *     Repeat q3-5 мин до HR ≥100
 *
 *   ERC 2021 (EU):
 *     IV/IO:  0.01-0.03 мг/кг
 *     ETT:   0.05-0.1 мг/кг (рекомендация ниже NRP)
 *     ERC 2025: акцент на минимизацию ETT route, IV/IO предпочтительнее
 *
 *   МЗ РФ 04.03.2020:
 *     IV:    0.01-0.03 мг/кг
 *     ЭТТ:  0.05-0.1 мг/кг
 *     Растворить ампулу 0.1% (1 мг/мл) в 9 мл NaCl → 1:10 000
 *     Повторять каждые 3-5 мин
 *
 *   ── NaHCO3 (бикарбонат натрия) ────────────────────────────
 *   NRP 8 ed.: НЕ рекомендован рутинно (была cardiac arrest > 10 мин и
 *               документированная metabolic acidosis на ABG). 1-2 мЭкв/кг
 *               4.2% (0.5 мЭкв/мл) медленно за >2 мин.
 *   ERC 2021:  Same — only после reasonable circulation restored.
 *   МЗ РФ:    1-2 мЭкв/кг 4% (полразведения 8.4% на воду 1:1).
 *
 *   ── Глюкоза 10% ──────────────────────────────────────────
 *   При гипогликемии (<30 мг/дл / <1.7 ммоль/л в первые 4ч):
 *   2 мл/кг D10 за 1-2 мин, затем непрерывная инфузия GIR 6-8 мг/кг/мин.
 *
 *   ── Налоксон ─────────────────────────────────────────────
 *   NRP 8 ed.: НЕ рекомендован при birth resuscitation (риск
 *              opioid withdrawal у matarnal opioid-exposed). Используется
 *              только при подтверждённой материнской анальгезии.
 *   Доза: 0.1 мг/кг IV/IO или ETT.
 *
 *   ── Volume expander ──────────────────────────────────────
 *   При гиповолемическом шоке (≥10 мл/кг крови потеряно или подозрение):
 *   NS / O- кровь 10 мл/кг за 5-10 мин (повторно при необходимости).
 *
 * SOURCES (audit 1.15):
 *   [1] NRP 8 ed. AAP/AHA 2021
 *   [2] ERC 2021/2025: doi.org/10.1016/j.resuscitation.2021.02.014
 *   [3] МЗ РФ 04.03.2020: minzdrav.gov.ru/documents/8025
 *   [4] ILCOR Consensus 2020/2025: ilcor.org
 */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (NRP 8 ed. 2021) · Европа (ERC 2021/2025) · РФ (МЗ 04.03.2020)',
  reference:
    'NRP 8 ed. AAP/AHA 2021. ERC 2021 — Madar J et al. Resuscitation 161:291. ERC 2025 update. Методическое письмо МЗ РФ 04.03.2020 (Байбарина).',
  inputs: [
    {
      id: 'weight',
      label: 'Масса',
      type: 'number',
      unit: 'г',
      min: 400,
      max: 6000,
      step: 10,
      hint: 'Текущий вес или вес при рождении',
      quickValues: [600, 1000, 1500, 2500, 3500],
    },
    {
      id: 'region',
      label: 'Регион / руководство',
      type: 'select',
      options: [
        { value: 'us', label: '🇺🇸 NRP 8 ed. (AAP/AHA 2021)' },
        { value: 'eu', label: '🇪🇺 ERC 2021/2025' },
        { value: 'ru', label: '🇷🇺 МЗ РФ 04.03.2020 (Байбарина)' },
      ],
    },
    {
      id: 'route',
      label: 'Путь введения',
      type: 'select',
      options: [
        { value: 'iv', label: 'IV / IO (внутривенно / внутрикостно)' },
        { value: 'ett', label: 'ЭТТ (только если IV/IO недоступны)' },
      ],
    },
  ],
  presets: [
    { label: 'Термин 3500 г · NRP · IV', values: { weight: 3500, region: 'us', route: 'iv' } },
    { label: 'Преэрм 1500 г · ERC · IV', values: { weight: 1500, region: 'eu', route: 'iv' } },
    { label: 'ELBW 800 г · МЗ РФ · IV', values: { weight: 800, region: 'ru', route: 'iv' } },
    { label: 'Термин · NRP · ETT', values: { weight: 3000, region: 'us', route: 'ett' } },
  ],
  compute: (v) => {
    const weight_g = Math.max(400, Math.min(6000, Number(v.weight) || 3000));
    const weight_kg = weight_g / 1000;
    const region = String(v.region || 'us');
    const route = String(v.route || 'iv');

    // Epinephrine doses (mg/kg) by region
    interface EpiDose {
      iv_mid: number; // mg/kg midpoint
      iv_min: number;
      iv_max: number;
      ett_mid: number;
      ett_min: number;
      ett_max: number;
      label: string;
    }
    const epiDoses: Record<string, EpiDose> = {
      us: { iv_mid: 0.02, iv_min: 0.01, iv_max: 0.03, ett_mid: 0.1, ett_min: 0.05, ett_max: 0.1, label: 'NRP 8 ed.' },
      eu: { iv_mid: 0.02, iv_min: 0.01, iv_max: 0.03, ett_mid: 0.075, ett_min: 0.05, ett_max: 0.1, label: 'ERC 2021/2025' },
      ru: { iv_mid: 0.02, iv_min: 0.01, iv_max: 0.03, ett_mid: 0.075, ett_min: 0.05, ett_max: 0.1, label: 'МЗ РФ 04.03.2020' },
    };
    const epi = epiDoses[region]!;

    // Compute mg + mL (1:10 000 = 0.1 mg/mL)
    const epi_mg = (route === 'iv' ? epi.iv_mid : epi.ett_mid) * weight_kg;
    const epi_ml_1to10000 = epi_mg / 0.1; // 1:10 000 = 0.1 mg/mL
    const epi_min_mg = (route === 'iv' ? epi.iv_min : epi.ett_min) * weight_kg;
    const epi_max_mg = (route === 'iv' ? epi.iv_max : epi.ett_max) * weight_kg;

    // Other doses (mostly region-agnostic with NRP fallback values)
    const naloxone_mg = 0.1 * weight_kg;
    const naloxone_ml = naloxone_mg; // 1 mg/mL = clinical convention
    const dextrose10_ml = 2 * weight_kg; // bolus 200 mg/kg
    const nahco3_meq = 1.5 * weight_kg; // 1-2 mEq/kg, midpoint
    const nahco3_ml_42 = nahco3_meq * 2; // 4.2% = 0.5 mEq/mL → 2 mL/mEq
    const volume_ml = 10 * weight_kg; // NS bolus 10 mL/kg

    const interpretation = `Дозы реанимации (${epi.label}, ${weight_g} г, ${route === 'iv' ? 'IV/IO' : 'ЭТТ'})`;
    const color = '#3B82F6';

    const details = `### Эпинефрин 1:10 000 (0.1 мг/мл) — препарат первой линии

**${route === 'iv' ? 'IV / IO' : 'ЭТТ (только при недоступном IV/IO)'}:**
- Доза: **${epi.label === 'NRP 8 ed.' && route === 'ett' ? '0.1' : route === 'iv' ? '0.02' : '0.05-0.1'} мг/кг** (range ${route === 'iv' ? `${epi.iv_min}-${epi.iv_max}` : `${epi.ett_min}-${epi.ett_max}`} мг/кг)
- Для ${weight_kg.toFixed(2)} кг: **${epi_mg.toFixed(3)} мг = ${epi_ml_1to10000.toFixed(1)} мл** раствора 1:10 000
- Range: ${epi_min_mg.toFixed(3)}-${epi_max_mg.toFixed(3)} мг (${(epi_min_mg / 0.1).toFixed(1)}-${(epi_max_mg / 0.1).toFixed(1)} мл)
- ${route === 'iv' ? 'Промывка: **3 мл NaCl 0.9%** после IV bolus (NRP)' : 'ETT route менее надёжен; IV/IO предпочтительнее'}
- Повторять q3-5 мин до HR ≥100

**Подготовка раствора 1:10 000 из ампулы 0.1% (1 мг/мл):**
1 мл (1 мг) + 9 мл NaCl 0.9% = 10 мл раствора 1:10 000

### Глюкоза 10% (D10) при гипогликемии

- Bolus: **${dextrose10_ml.toFixed(1)} мл** (= 2 мл/кг = 200 мг/кг)
- Введение за 1-2 мин IV
- Затем continuous infusion GIR 6-8 мг/кг/мин

### NaHCO3 (только после ≥10 мин CPR + документированный метаболический ацидоз)

- 1-2 мЭкв/кг (раствор 4.2% / 0.5 мЭкв/мл)
- Для ${weight_kg.toFixed(2)} кг: **${nahco3_meq.toFixed(1)} мЭкв = ${nahco3_ml_42.toFixed(1)} мл** 4.2% NaHCO3
- Вводить медленно >2 мин
- ⚠️ NRP 8 ed.: **НЕ рутинно** в neonatal resuscitation

### Налоксон (только при подтверждённой материнской опиоидной анальгезии)

- 0.1 мг/кг IV/IO/ETT
- Для ${weight_kg.toFixed(2)} кг: **${naloxone_mg.toFixed(2)} мг (~${naloxone_ml.toFixed(2)} мл)** раствора 1 мг/мл
- ⚠️ НЕ давать если мать на metadon / heroin (risk withdrawal у новорождённого)

### Volume expander (при гиповолемическом шоке)

- NS / O-Rh-отрицательная кровь
- 10 мл/кг за 5-10 мин IV
- Для ${weight_kg.toFixed(2)} кг: **${volume_ml.toFixed(0)} мл**
- Повторно при необходимости (до 20-30 мл/кг)

### Региональные различия (важно для выбора)

| Препарат | NRP | ERC | МЗ РФ |
|---|---|---|---|
| Эпи IV/IO | 0.02 (0.01-0.03) | 0.01-0.03 | 0.01-0.03 |
| Эпи ETT | 0.1 (0.05-0.1) | 0.05-0.1 | 0.05-0.1 |
| Концентрация | 1:10 000 | 1:10 000 | 1:10 000 (4% разводят) |
| NaHCO3 | НЕ рутинно | НЕ рутинно | По показаниям |
| Прекращение CPR | 20 мин (NRP) | 20 мин (ERC); ERC 2025 cut-off prematurity 32 нед | По мин. протокола |`;

    const actions = [
      `**Эпинефрин 1:10 000:** ${epi_ml_1to10000.toFixed(1)} мл (${epi_mg.toFixed(3)} мг) ${route === 'iv' ? 'IV/IO + 3 мл NaCl flush' : 'ЭТТ'}`,
      `**Повтор:** каждые 3-5 мин до HR ≥100`,
      `**Глюкоза D10:** ${dextrose10_ml.toFixed(1)} мл bolus при гипогликемии (<1.7 ммоль/л в первые 4ч)`,
      `**Volume:** ${volume_ml.toFixed(0)} мл NS / O-Rh−крови при гиповолемическом шоке`,
      `**Готовить заранее:** разведённый эпинефрин 1:10 000 в шприце 1-3 мл (зависит от веса) — экономит ~30 сек в emergency`,
      route === 'ett'
        ? '⚠️ ETT route менее надёжен (variable absorption) — стремиться к IV/IO как можно скорее'
        : 'IV/IO — предпочтительный путь; UVC устанавливается за 30-60 сек опытным оператором',
    ];

    return {
      value: `${epi_mg.toFixed(3)} мг`,
      unit: `эпи (${route === 'iv' ? 'IV' : 'ЭТТ'}) · ${epi.label}`,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'NRP 8 ed.: эпи ETT 0.1 мг/кг — ВЫШЕ европейских доз (ERC 0.05-0.1)',
        'NaHCO3 НЕ рутинно по NRP 8 ed. / ERC 2021 — только после ≥10 мин CPR + документированный ацидоз',
        'Налоксон НЕ давать при подозрении на метадон/героин у матери (withdrawal)',
        'ETT route variable absorption — IV/IO ВСЕГДА предпочтительнее',
        'Микропреэрм (<25 нед) — отдельные cut-offs ERC 2025 (cessation if no HR in 20 мин)',
        'Cardiac arrest neonatal: 90% — респираторного происхождения; PPV первая линия, не эпи',
        'Расчётные дозы — округлить до удобных шприцу значений (0.5 / 1 / 2 / 3 мл)',
      ],
      scale: {
        segments: [
          { min: 0, max: 0.5, label: 'ELBW', color: '#7F1D1D' },
          { min: 0.5, max: 1.5, label: 'VLBW', color: '#EF4444' },
          { min: 1.5, max: 2.5, label: 'Преэрм', color: '#F59E0B' },
          { min: 2.5, max: 5, label: 'Термин', color: '#22C55E' },
        ],
        current: weight_kg,
        unit: 'кг',
      },
      related: [
        { id: 'apgar', title: 'Apgar' },
        { id: 'nrp', title: 'NRP алгоритм' },
        { id: 'hbb', title: 'Helping Babies Breathe' },
        { id: 'neo-ett', title: 'Размер ЭТТ' },
        { id: 'neo-fluid', title: 'Жидкость по дням' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Неонатология' },
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Анестезиология' },
      ],
    };
  },
  info: `### Что считает

Стартовые дозы реанимационных препаратов для новорождённого с
переключателем региональной guideline (NRP / ERC / МЗ РФ). Все три
протокола в основе дают близкие IV-дозы, но различаются по ETT, NaHCO3
и логике cessation.

### Препарат первой линии — Эпинефрин 1:10 000

| Регион | IV/IO мг/кг | ETT мг/кг | Промывка |
|---|---|---|---|
| **NRP 8 ed.** | 0.02 (0.01-0.03) | **0.1** (0.05-0.1) | 3 мл NaCl после IV |
| **ERC 2021** | 0.01-0.03 | 0.05-0.1 | По локальному протоколу |
| **МЗ РФ 04.03.2020** | 0.01-0.03 | 0.05-0.1 | Стандартный flush |

**Препарат:** ампула 0.1% (1 мг/мл).
**Развести:** 1 мл + 9 мл NaCl = **1:10 000 (0.1 мг/мл)**.

**Объём для введения** (1:10 000):
- 0.02 мг/кг IV → 0.2 мл/кг
- 0.1 мг/кг ETT → 1 мл/кг

**Повтор:** каждые 3-5 мин до HR ≥100/мин.

### Когда давать эпинефрин

После последовательного протокола PPV → CC + PPV, если HR <60/мин:
1. Adequate PPV ≥30 сек, движения грудной клетки видны
2. + chest compressions 3:1 ratio с PPV ≥60 сек на 100% O₂
3. **И HR всё ещё <60** → first dose эпинефрина

### Глюкоза D10 при гипогликемии

Cut-offs (см. neo-gir):
- 0-4 ч: симптомы или <30 мг/дл (1.7 ммоль/л)
- 4-72 ч: <40 мг/дл (2.2 ммоль/л)
- >72 ч: <50 мг/дл (2.8 ммоль/л)

**Bolus:** 2 мл/кг D10 за 1-2 мин = 200 мг/кг.
**Затем:** continuous infusion GIR 6-8 мг/кг/мин.
**Контроль:** глюкоза через 30 мин, повтор bolus при необходимости.

### NaHCO3 — крайне ограниченное применение

NRP 8 ed. и ERC 2021 **НЕ рекомендуют рутинно** в neonatal resuscitation.

**Показания (только все три):**
1. ≥10 мин CPR без восстановления
2. Документированный metabolic acidosis на ABG (pH <7.10, BE <-12)
3. Adequate ventilation восстановлена (иначе ↑ CO2 → парадоксальный
   intracellular acidosis)

**Доза:** 1-2 мЭкв/кг 4.2% раствора (= 2-4 мл/кг) за >2 мин IV.

### Налоксон — только при материнской опиоидной анальгезии

**Доза:** 0.1 мг/кг IV/IO/ETT.

⚠️ **НЕ давать если:**
- Мать на metadon / heroin / chronic opioids → может вызвать seizures
  у новорождённого через withdrawal
- Mother опиоид-наивна, но depression от других причин

### Volume expander при гиповолемическом шоке

**Показания:**
- Подозрение на массивную кровопотерю (placental abruption, vasa previa,
  cord laceration)
- Pallor, weak pulses, persistent tachycardia после вентиляции

**Раствор:** 0.9% NaCl или O-Rh-отрицательная кровь (если crossmatch не
готова).

**Доза:** 10 мл/кг за 5-10 мин IV/IO; повторно при необходимости до
20-30 мл/кг.

### Прекращение CPR (NRP / ERC / МЗ РФ)

| Регион | Cessation criteria |
|---|---|
| NRP 8 ed. | Apgar 0 на 10 мин при адекватной resuscitation → discontinue |
| ERC 2021 | 20 мин без HR при адекватной resuscitation |
| ERC 2025 | + cut-off для prematurity 32 нед (раньше 23 нед — индивидуально) |
| МЗ РФ | По локальному протоколу + клиническая оценка |

### Источники

- NRP 8 ed. AAP/AHA 2021 (Textbook of Neonatal Resuscitation)
- ERC 2021 Newborn — Madar et al. Resuscitation 161:291
- ERC 2025 update — Resuscitation 2025 in press
- МЗ РФ 04.03.2020 — методическое письмо (Байбарина)
- ILCOR 2020 / 2025 Consensus

### Ограничения

- Калькулятор стартовый — реальная клиника требует команду + тренировку
- Дозы должны быть округлены под удобство шприца (0.5 / 1 / 2 / 3 мл)
- Подготовка эпи-шприца ЗАРАНЕЕ при ожидаемой высокого-риска родах
  экономит критичные 30 сек
- При neonatal cardiac arrest 90% — респираторного происхождения; PPV
  первая линия, не эпинефрин
`,
};

export default runner;
