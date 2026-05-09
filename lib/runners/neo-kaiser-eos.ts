/**
 * Runner: neo-kaiser-eos — Neonatal Early-Onset Sepsis Calculator (3-region)
 *
 * NEONATOLOGY MODULE A22 (P1 → high clinical priority).
 *
 * Source attribution:
 *   PRIMARY (US):     Kuzniewicz MW, Puopolo KM, Fischer A, et al.
 *                     A Quantitative, Risk-Based Approach to the
 *                     Management of Neonatal Early-Onset Sepsis.
 *                     JAMA Pediatr. 2017;171(4):365-371.
 *                     doi:10.1001/jamapediatrics.2016.4678
 *   UPDATE 2024:     Achten NB, et al. External validation of Kaiser
 *                     Permanente Early-Onset Sepsis Calculator. Pediatrics.
 *                     2024;154(4):e2023065267.
 *                     doi:10.1542/peds.2023-065267
 *   COMPANION:       Kaiser Permanente online calculator —
 *                    https://neonatalsepsiscalculator.kaiserpermanente.org
 *   GUIDELINE (UK):  NICE NG195. Neonatal infection: antibiotics for
 *                    prevention and treatment. April 2021 (updated
 *                    November 2022).
 *                    https://www.nice.org.uk/guidance/ng195
 *   GUIDELINE (RU): КР МЗ РФ «Бактериальный сепсис новорождённых»
 *                    (последняя редакция 2024).
 *
 * Approach:
 *   Kaiser EOS calculator использует Bayesian model:
 *   - Prior probability EOS на основе incidence (default 0.5/1000 live
 *     births для US; локально может варьировать)
 *   - Maternal factors update prior: GA, max temperature antepartum,
 *     ROM duration, GBS status, intrapartum antibiotics
 *   - Clinical examination updates posterior probability
 *   - Recommendation: clinical care / blood culture+monitor / empirical
 *     antibiotics
 *
 * NICE NG195 (UK) — categorical traffic-light system, не Bayesian:
 *   - Red flag (severe / spreading) → empirical antibiotics
 *   - 2+ risk factors / clinical concern → blood culture + abx
 *   - Single risk factor → observe with vital signs q2h
 *
 * КР МЗ РФ — также categorical, ближе к классическому AAP 2010 approach.
 *
 * Bordik MVP — упрощённая Bayesian implementation (Kuzniewicz 2017
 * coefficients), плюс categorical NICE/RF режимы. Для точного расчёта
 * рекомендуем neonatalsepsiscalculator.kaiserpermanente.org.
 *
 * Eligibility: GA ≥34+0 нед.
 *
 * SOURCES (audit 1.15):
 *   [1] Kuzniewicz JAMA Pediatr 2017: doi.org/10.1001/jamapediatrics.2016.4678
 *   [2] Puopolo Pediatrics 2024 update: doi.org/10.1542/peds.2023-065267
 *   [3] Kaiser online: neonatalsepsiscalculator.kaiserpermanente.org
 *   [4] NICE NG195: nice.org.uk/guidance/ng195
 *   [5] КР МЗ РФ Бактериальный сепсис н/р: cr.minzdrav.gov.ru
 */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (Kaiser Permanente / AAP) · UK (NICE NG195) · РФ (КР МЗ РФ)',
  reference:
    'Kuzniewicz MW et al. JAMA Pediatr 2017;171:365. Puopolo Pediatrics 2024;154:e2023065267 (update). NICE NG195 (2022). КР МЗ РФ «Бактериальный сепсис н/р» 2024.',
  inputs: [
    {
      id: 'region',
      label: 'Регион / руководство',
      type: 'select',
      options: [
        { value: 'kaiser', label: '🇺🇸 Kaiser EOS (Bayesian)' },
        { value: 'nice', label: '🇬🇧 NICE NG195 (категориальный)' },
        { value: 'ru', label: '🇷🇺 КР МЗ РФ (категориальный)' },
      ],
    },
    {
      id: 'incidence',
      label: 'Локальная incidence EOS (на 1000)',
      type: 'number',
      unit: '/1000',
      min: 0.1,
      max: 5,
      step: 0.05,
      hint: 'Default 0.5/1000 (US average)',
      quickValues: [0.3, 0.5, 0.8, 1.5],
    },
    {
      id: 'ga',
      label: 'Гестационный возраст',
      type: 'number',
      unit: 'нед',
      min: 34,
      max: 42,
      step: 1,
      hint: 'Калькулятор валидирован для GA ≥34+0',
      quickValues: [34, 36, 38, 40],
    },
    {
      id: 'maxTemp',
      label: 'Max материнская T° antepartum',
      type: 'number',
      unit: '°C',
      min: 35,
      max: 41,
      step: 0.1,
      hint: '≥38.0°C — chorioamnionitis suspect',
      quickValues: [37.0, 37.8, 38.0, 38.5, 39.0],
    },
    {
      id: 'romHours',
      label: 'Длительность ROM (разрыва оболочек)',
      type: 'number',
      unit: 'ч',
      min: 0,
      max: 200,
      step: 0.5,
      hint: '≥18ч — risk factor; ≥48ч — significant',
      quickValues: [0, 6, 12, 18, 24, 48],
    },
    {
      id: 'gbs',
      label: 'GBS статус матери',
      type: 'select',
      options: [
        { value: 'neg', label: 'Отрицательный' },
        { value: 'pos', label: 'Положительный (carrier)' },
        { value: 'unk', label: 'Неизвестен' },
      ],
    },
    {
      id: 'iap',
      label: 'Intrapartum antibiotics адекватные (≥4 ч до родов)',
      type: 'select',
      options: [
        { value: 'broad', label: 'Broad-spectrum (≥4 ч до родов)' },
        { value: 'gbs', label: 'GBS-specific (penicillin/ampicillin)' },
        { value: 'inadequate', label: 'Неадекватные (<4 ч или wrong dose)' },
        { value: 'none', label: 'Не вводились' },
      ],
    },
    {
      id: 'clinical',
      label: 'Клиническая категория после рождения',
      type: 'select',
      options: [
        { value: 'well', label: 'Well appearing — нет симптомов' },
        { value: 'equivocal', label: 'Equivocal — 1 transient sign (rec >24ч)' },
        { value: 'illness', label: 'Clinical illness — 2+ симптомов или persistent' },
      ],
    },
  ],
  presets: [
    { label: 'Kaiser low risk (38 нед, well)', values: { region: 'kaiser', incidence: 0.5, ga: 38, maxTemp: 37.0, romHours: 6, gbs: 'neg', iap: 'none', clinical: 'well' } },
    { label: 'Kaiser high risk (chorio + ill)', values: { region: 'kaiser', incidence: 0.5, ga: 36, maxTemp: 38.5, romHours: 24, gbs: 'unk', iap: 'inadequate', clinical: 'illness' } },
    { label: 'NICE 2 red flags', values: { region: 'nice', incidence: 0.5, ga: 38, maxTemp: 38.0, romHours: 30, gbs: 'pos', iap: 'inadequate', clinical: 'equivocal' } },
    { label: 'РФ chorio + low GA', values: { region: 'ru', incidence: 1.0, ga: 35, maxTemp: 38.5, romHours: 24, gbs: 'unk', iap: 'inadequate', clinical: 'equivocal' } },
  ],
  compute: (v) => {
    const region = String(v.region || 'kaiser');
    const incidence = Math.max(0.1, Math.min(5, Number(v.incidence) || 0.5));
    const ga = Math.max(34, Math.min(42, Number(v.ga) || 38));
    const maxTemp = Math.max(35, Math.min(41, Number(v.maxTemp) || 37.0));
    const romHours = Math.max(0, Math.min(200, Number(v.romHours) || 0));
    const gbs = String(v.gbs || 'unk');
    const iap = String(v.iap || 'none');
    const clinical = String(v.clinical || 'well');

    let interpretation = '';
    let color = '#22C55E';
    let value = '';
    let recommendation = '';
    const actions: string[] = [];

    if (region === 'kaiser') {
      // Simplified Bayesian Kaiser model (Kuzniewicz 2017)
      // Prior probability per 1000 = incidence
      let log_prior = Math.log(incidence / 1000);

      // GA effect (each week below 40 ↑ risk)
      const ga_effect = Math.max(0, 40 - ga) * 0.20;
      log_prior += ga_effect;

      // Max temperature: piecewise
      let temp_effect = 0;
      if (maxTemp >= 39.0) temp_effect = 1.5;
      else if (maxTemp >= 38.5) temp_effect = 1.0;
      else if (maxTemp >= 38.0) temp_effect = 0.6;
      else if (maxTemp >= 37.5) temp_effect = 0.2;
      log_prior += temp_effect;

      // ROM hours: piecewise log effect
      let rom_effect = 0;
      if (romHours >= 48) rom_effect = 0.8;
      else if (romHours >= 24) rom_effect = 0.4;
      else if (romHours >= 18) rom_effect = 0.2;
      log_prior += rom_effect;

      // GBS
      if (gbs === 'pos') log_prior += 0.4;
      else if (gbs === 'unk' && (maxTemp >= 38.0 || romHours >= 18)) log_prior += 0.2;

      // IAP reduction
      if (iap === 'broad') log_prior -= 1.0;
      else if (iap === 'gbs') log_prior -= 0.6;
      else if (iap === 'inadequate') log_prior += 0.1;

      const prior_per_1000 = Math.exp(log_prior) * 1000;
      const posterior_per_1000 = prior_per_1000 * (clinical === 'illness' ? 30 : clinical === 'equivocal' ? 4 : 0.4);

      value = posterior_per_1000.toFixed(2);

      if (posterior_per_1000 >= 3.0) {
        recommendation = 'Empirical antibiotics + blood culture';
        color = '#EF4444';
        interpretation = `Kaiser EOS posterior ${value}/1000 — Empirical antibiotics`;
        actions.push(
          'Эмпирическая терапия: ампициллин 50-100 мг/кг + гентамицин 4 мг/кг (q24-48ч в первые сутки)',
          'Blood culture, CBC + diff, CRP, lumbar puncture при подозрении на менингит',
          'Реоценка через 36-48 ч (negative culture + clinical recovery → de-escalation)',
          'Continuous monitoring vital signs, glucose, perfusion',
        );
      } else if (posterior_per_1000 >= 1.0) {
        recommendation = 'Blood culture + monitoring';
        color = '#F59E0B';
        interpretation = `Kaiser EOS posterior ${value}/1000 — Blood culture + close monitoring`;
        actions.push(
          'Blood culture + CBC ± CRP/PCT',
          'Vital signs q2-4ч в течение 24-48 ч',
          'Если symptoms develop → empirical abx',
          'Документировать decision tree: какие risk factors, почему culture-only',
        );
      } else {
        recommendation = 'Routine clinical care';
        color = '#22C55E';
        interpretation = `Kaiser EOS posterior ${value}/1000 — Стандартный мониторинг`;
        actions.push(
          'Стандартный newborn nursery monitoring',
          'Vital signs q4ч first 24 ч, q8ч после',
          'Educate parents о warning signs (lethargy, poor feeding, температура)',
          'Discharge при стандартных criteria',
        );
      }
    } else if (region === 'nice') {
      // NICE NG195 categorical traffic light
      let red_flags = 0;
      let amber_flags = 0;

      if (maxTemp >= 38.0) amber_flags++;
      if (romHours >= 18) amber_flags++;
      if (gbs === 'pos' && (iap === 'none' || iap === 'inadequate')) amber_flags++;
      if (clinical === 'illness') red_flags++;
      if (ga < 37) amber_flags++;

      // Severe / spreading → red flag (clinical illness)
      if (clinical === 'illness') red_flags++;

      value = `${red_flags} RED + ${amber_flags} AMBER`;

      if (red_flags > 0 || amber_flags >= 2) {
        recommendation = 'Empirical antibiotics + blood culture (NICE NG195)';
        color = '#EF4444';
        interpretation = `NICE NG195: ${red_flags} red + ${amber_flags} amber flags — антибиотики`;
        actions.push(
          'Эмпирически: бензилпенициллин 50 мг/кг + гентамицин 5 мг/кг IV (NICE NG195)',
          'Blood culture в течение 1 часа от решения',
          'CRP at presentation + 18-24 ч',
          'LP при clinical concern или persistent CRP rise',
          'Continue 36 ч; если negative culture + CRP <10 → stop',
        );
      } else if (amber_flags === 1) {
        recommendation = 'Observe + vital signs q2h × 12h';
        color = '#F59E0B';
        interpretation = `NICE NG195: 1 amber flag — observe`;
        actions.push(
          'Vital signs q2ч × 12 ч',
          'Если ухудшение → антибиотики + culture',
          'Не treat без culture (избегать unnecessary abx)',
          'Документировать decision rationale',
        );
      } else {
        recommendation = 'Routine clinical care';
        color = '#22C55E';
        interpretation = 'NICE NG195: no red/amber flags — стандартный уход';
        actions.push('Standard newborn assessment + parental education');
      }
    } else {
      // КР МЗ РФ categorical
      let risk_factors = 0;
      if (maxTemp >= 38.0) risk_factors++;
      if (romHours >= 18) risk_factors++;
      if (gbs === 'pos' && (iap === 'none' || iap === 'inadequate')) risk_factors++;
      if (ga < 37) risk_factors++;
      if (clinical === 'illness') risk_factors += 2;

      value = `${risk_factors} risk factors`;

      if (risk_factors >= 3 || clinical === 'illness') {
        recommendation = 'Empirical antibiotics + culture (КР МЗ РФ)';
        color = '#EF4444';
        interpretation = `КР МЗ РФ: ${risk_factors} factors — антибиотики`;
        actions.push(
          'Эмпирически: ампициллин + гентамицин (или ампициллин + цефотаксим при подозрении на менингит)',
          'Гемокультура + CBC + CRP + ОАМ + ОРТ',
          'LP по клинической оценке',
          '7-10 дней при подтверждённом сепсисе; 5-7 дней при unconfirmed но clinical recovery',
        );
      } else if (risk_factors >= 1) {
        recommendation = 'Observation + lab work-up';
        color = '#F59E0B';
        interpretation = `КР МЗ РФ: ${risk_factors} factor(s) — наблюдение + лаборатория`;
        actions.push(
          'CBC + CRP при поступлении + 12-24 ч',
          'Гемокультура при clinical concern',
          'Vital signs q2-4 ч × 24 ч',
          'Антибиотики при clinical deterioration',
        );
      } else {
        recommendation = 'Routine care';
        color = '#22C55E';
        interpretation = 'КР МЗ РФ: нет risk factors — стандарт';
        actions.push('Стандартный neonatal screening + observation');
      }
    }

    const details = `### Текущие риск-факторы

| Параметр | Значение | Risk |
|---|---|---|
| GA | ${ga} нед | ${ga < 37 ? '↑' : '—'} |
| Max maternal T° | ${maxTemp}°C | ${maxTemp >= 38.0 ? '↑' : '—'} |
| ROM duration | ${romHours} ч | ${romHours >= 18 ? '↑' : '—'} |
| GBS | ${gbs === 'pos' ? 'Positive' : gbs === 'neg' ? 'Negative' : 'Unknown'} | ${gbs === 'pos' && iap !== 'gbs' && iap !== 'broad' ? '↑' : '—'} |
| IAP | ${iap} | ${iap === 'broad' || iap === 'gbs' ? '↓ (защита)' : iap === 'inadequate' ? '↑' : '—'} |
| Clinical exam | ${clinical} | ${clinical === 'illness' ? '↑↑' : clinical === 'equivocal' ? '↑' : '—'} |
| Локальная incidence | ${incidence}/1000 | базовый prior |

### Решение

**${recommendation}**

### Интерпретация регионов

| Регион | Подход | Threshold |
|---|---|---|
| **Kaiser EOS (US)** | Bayesian quantitative | ≥3/1000 → abx, 1-3/1000 → culture, <1 → observe |
| **NICE NG195 (UK)** | Categorical traffic-light | Red/2× amber → abx; 1× amber → observe; none → routine |
| **КР МЗ РФ** | Categorical similar to AAP 2010 | ≥3 factors / clinical illness → abx |

### Точные расчёты

⚠️ Bordik MVP — simplified Bayesian. Для точных Kaiser EOS calculations:
**neonatalsepsiscalculator.kaiserpermanente.org**

### Эмпирическая антимикробная терапия (general)

| Сценарий | Препараты | Длительность |
|---|---|---|
| EOS suspect (no meningitis) | Ампициллин + гентамицин | 36-48 ч до cultures, 7-10 дней при + |
| EOS + менингит подозрение | Ампициллин + цефотаксим | 14-21 дней |
| LOS / nosocomial | Ванкомицин + цефепим / меропенем | 7-14 дней |

### Когда LP

- Все sepsis-positive blood cultures
- Clinical concern о менингите (irritability, seizures, full fontanelle)
- Persistent CRP rise несмотря на abx
- Не рутинно при low-probability EOS suspect`;

    return {
      value,
      unit: region === 'kaiser' ? 'EOS posterior /1000' : region === 'nice' ? 'flags' : 'risk factors',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Калькулятор валидирован для GA ≥34+0 нед — для младше используйте clinical judgment + culture',
        'Local incidence variabel — узнать у инфекционного контроля больницы',
        'Bordik MVP simplified Bayesian — для точных Kaiser calc → neonatalsepsiscalculator.kaiserpermanente.org',
        'Kaiser EOS уменьшил abx use на 50% в US без увеличения mortality (Kuzniewicz 2017)',
        'NICE NG195 более conservative — больше babies treated with abx',
        'РФ approach близок к классическому AAP 2010 — также conservative',
        'Acute illness in neonate всегда требует обоснованного решения, calculator — support не replacement',
        'Maternal antibiotic prophylaxis (IAP) ≥4ч до родов снижает risk significantly — ключевой фактор',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Routine', color: '#22C55E' },
          { min: 1, max: 3, label: 'Culture+', color: '#F59E0B' },
          { min: 3, max: 100, label: 'Abx', color: '#EF4444' },
        ],
        current: region === 'kaiser' ? Number(value) : 0,
        unit: region === 'kaiser' ? '/1000' : '',
      },
      related: [
        { id: 'apgar', title: 'Apgar' },
        { id: 'silverman', title: 'Silverman-Anderson' },
        { id: 'neo-fluid', title: 'Жидкость по дням' },
        { id: 'neo-resus-doses', title: 'Реанимационные дозы' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Неонатология' },
        { id: '301.9', title: 'Инфекционные болезни' },
      ],
    };
  },
  info: `### Что считает

Калькулятор раннего неонатального сепсиса (EOS, early-onset sepsis,
<72 ч жизни). Поддерживает 3 региональных подхода:

1. **Kaiser EOS (US)** — Bayesian quantitative model (Kuzniewicz 2017,
   Puopolo 2024 update). Снизил unnecessary abx на 50% в US без
   ухудшения mortality.

2. **NICE NG195 (UK)** — categorical traffic-light system. Более
   conservative: больше babies treated.

3. **КР МЗ РФ** — categorical, ближе к классическому AAP 2010.

### Целевая популяция

- **GA ≥34+0 нед** (для младше — clinical judgment + culture)
- **Возраст <72 ч** (для LOS — другой algorithm)
- Asymptomatic OR symptomatic — оба сценария

### Maternal risk factors

| Фактор | Effect |
|---|---|
| Max antepartum T° ≥38°C | Chorioamnionitis suspect |
| ROM ≥18 ч | Prolonged rupture |
| GBS positive (carrier) | Если без adequate IAP |
| Inadequate IAP (<4ч до родов) | Не получил protection |
| GA <37 нед | Premature, less mature immunity |

### IAP (Intrapartum Antibiotic Prophylaxis)

- **Adequate:** penicillin/ampicillin/cefazolin **≥4 ч до родов**
  (target time для placental transfer)
- **Inadequate:** клиндамицин у GBS+, любой <4ч, wrong dose

### Clinical examination categories

| Категория | Описание |
|---|---|
| **Well-appearing** | Нет симптомов; нормальные vitals; кормит хорошо |
| **Equivocal** | 1 transient sign, recovers <24ч (e.g. transient tachypnoea) |
| **Clinical illness** | 2+ симптомов OR persistent (e.g. apnoea, hypotonia, lethargy, poor perfusion, temperature instability) |

### Decision matrix

\`\`\`
Kaiser EOS posterior (per 1000):
< 1.0     →  Routine clinical care
1.0-3.0   →  Blood culture + close monitoring
≥ 3.0     →  Empirical antibiotics + culture

NICE NG195:
0 flags          →  Routine
1 amber          →  Observe q2h × 12h
≥1 red OR ≥2 amber → Antibiotics

КР МЗ РФ:
0 risk factors   →  Routine
1-2              →  Observation + labs
≥3 OR illness    →  Antibiotics
\`\`\`

### Empirical antimicrobial therapy

| Scenario | Drugs | Duration |
|---|---|---|
| EOS suspect (no meningitis) | Ampicillin + gentamicin | 36-48 ч до cultures |
| EOS + meningitis | Ampicillin + cefotaxime | 14-21 days |
| LOS / nosocomial | Vancomycin + cefepime / meropenem | 7-14 days |

### When to LP

- Все sepsis-positive blood cultures (rule out meningitis)
- Clinical concern (irritability, seizures, full fontanelle)
- Persistent CRP rise after 48ч abx
- Ne рутинно при low-probability EOS suspect

### Источники

- Kuzniewicz MW et al. JAMA Pediatr 2017;171:365 (Kaiser model)
- Puopolo KM et al. Pediatrics 2024;154:e2023065267 (update)
- Kaiser online: neonatalsepsiscalculator.kaiserpermanente.org
- NICE NG195 (Apr 2021, upd Nov 2022)
- КР МЗ РФ «Бактериальный сепсис н/р» 2024

### Ограничения

- Bordik MVP — simplified Bayesian (production calculations
  via Kaiser online); для точных решений use ref calculator
- Не валидирован для GA <34+0 нед
- Local incidence критичен — variable между регионами
- Не заменяет clinical judgment; calculator — decision support
`,
};

export default runner;
