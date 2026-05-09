/**
 * Runner: neo-rds-class — Классификация RDS (синдром дыхательных
 *                          расстройств) по тяжести
 *
 * NEONATOLOGY MODULE — Б4 (классификации, audit issue 3.B).
 *
 * Радиологическая + клиническая классификация RDS в 4 степени тяжести
 * (КР МЗ РФ + AAP).
 *
 * SOURCES:
 *   - КР МЗ РФ "Респираторный дистресс синдром у новорождённого" (2024)
 *   - Sweet DG et al. European Consensus 2022 (Neonatology 2023;120:3)
 *   - Avery's Diseases of the Newborn 11th ed.
 *   - Yost CC, Soll RF — surfactant guidelines
 *
 * Радиологические степени (КР РФ / Avery):
 *   I (mild):    Mild reticulogranular pattern, slight ↓ aeration
 *   II (mod):    Diffuse reticulogranular + air bronchograms
 *   III (sev):   Confluent opacification, prominent air bronchograms
 *   IV (very sev): "White lung" — total opacification, heart silhouette не видна
 *
 * Клиническая корреляция:
 *   I    — спонтанное дыхание + ↑ FiO₂ (CPAP по показаниям)
 *   II   — CPAP / pNCPAP, surfactant if FiO₂ ≥ 30 % persistent
 *   III  — Surfactant + MV (или LISA), early FiO₂ ↑↑
 *   IV   — Mechanical ventilation мandatory + multiple surfactant doses; HFOV если refractory
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  countries: 'РФ КР · European Consensus 2022',
  reference: 'КР МЗ РФ "РДС н/р" 2024. Sweet DG European Consensus Neonatology 2023;120:3.',
  inputs: [
    {
      id: 'xray_grade',
      label: 'Рентгенологическая степень',
      type: 'select',
      options: [
        { value: '0', label: 'Норма (нет признаков RDS)', points: 0 },
        { value: '1', label: 'I — слабый ретикулогранулярный паттерн', points: 1 },
        { value: '2', label: 'II — diffuse reticulogranular + air bronchograms', points: 2 },
        { value: '3', label: 'III — confluent opacification + prominent air bronchograms', points: 3 },
        { value: '4', label: 'IV — "white lung" total opacification', points: 4 },
      ],
    },
    {
      id: 'fio2',
      label: 'Текущий FiO₂',
      type: 'select',
      options: [
        { value: '0', label: 'Воздух (21 %)', points: 0 },
        { value: '1', label: '22-30 %', points: 1 },
        { value: '2', label: '31-50 %', points: 2 },
        { value: '3', label: '51-80 %', points: 3 },
        { value: '4', label: '> 80 %', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'I степень — Лёгкая',
      color: '#22C55E',
      description: 'Лёгкая RDS / норма.',
      actions: [
        'Spontaneous breathing + ↑ FiO₂ при необходимости',
        'CPAP / pNCPAP при появлении симптоматики',
        'Кислород в incubator или canula 0.5-1 л/мин',
        'Контроль SpO₂ (target 90-95 % для preterm; > 95 % для term)',
        'Газы крови q4-6h при сомнениях',
      ],
    },
    {
      min: 2,
      max: 3,
      label: 'II степень — Умеренная',
      color: '#F59E0B',
      description: 'Умеренная RDS — CPAP first-line.',
      actions: [
        'CPAP / pNCPAP начать ASAP (PEEP 5-7 см H₂O)',
        'Surfactant при FiO₂ ≥ 30 % persistent (LISA / INSURE preferred)',
        'X-ray q12-24h pour документировать progress',
        'Газы крови q4-6h',
        'Caffeine 20 мг/кг loading (для < 32 нед)',
        'NPO + parenteral nutrition; trophic feeding ASAP',
      ],
    },
    {
      min: 4,
      max: 6,
      label: 'III степень — Тяжёлая',
      color: '#EF4444',
      description: 'Тяжёлая RDS — surfactant + MV.',
      actions: [
        'Mechanical ventilation (или MV → LISA если возможно)',
        'Surfactant 100-200 мг/кг ASAP (Curosurf high-dose preferred)',
        'Repeat surfactant если FiO₂ ≥ 30 % через 6-12 ч',
        'PEEP 5-8 см H₂O; PIP titrate до chest rise',
        'Газы крови q2-4h; целевой pH ≥ 7.25 (permissive hypercapnia OK)',
        'Caffeine; antibiotics empiric до исключения sepsis',
        'Echocardiography q24h (PDA, PPHN screening)',
      ],
    },
    {
      min: 7,
      max: 8,
      label: 'IV степень — Очень тяжёлая',
      color: '#7F1D1D',
      description: 'Очень тяжёлая ("white lung") — multiple интervенции.',
      actions: [
        '⚠️ "White lung" — multiple surfactant doses + advanced ventilation',
        'Mechanical ventilation immediately; consider HFOV если refractory к conventional',
        'Surfactant: до 3 доз total per protocol',
        'Inhaled nitric oxide (iNO) если PPHN component',
        'Газы крови continuous (arterial line); pH ≥ 7.20 minimum',
        'Hydrocortisone 1 мг/кг q8h рассмотреть для refractory hypotension',
        'Inotropes: dopamine ± epinephrine для hypotension support',
        'ECMO consult если OI ≥ 40 sustained × 4 ч',
        'Family communication: реалистичная prognosis (mortality 10-30 % для очень тяжёлой)',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const xrayPts = Number(values.xray_grade ?? 0);
    const fio2Pts = Number(values.fio2 ?? 0);
    const total = xrayPts + fio2Pts;

    const band = findBand(runner.bands, total);

    // Determine clinical RDS grade from X-ray alone
    let clinicalGrade = 'Норма';
    if (xrayPts === 1) clinicalGrade = 'I';
    else if (xrayPts === 2) clinicalGrade = 'II';
    else if (xrayPts === 3) clinicalGrade = 'III';
    else if (xrayPts === 4) clinicalGrade = 'IV';

    return {
      value: clinicalGrade,
      unit: 'РДС степень',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. X-ray степень: ${clinicalGrade}; combined severity score ${total}/8.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'X-ray + FiO₂ — наиболее объективные параметры; клиника (Silverman/Downes) дополняет',
    'European Consensus 2022 (Sweet): early surfactant у preterm < 30 нед — реже MV need',
    'Поздняя surfactant administration (после 6 ч) менее эффективна',
    'Repeat surfactant через 6-12 ч если persistent FiO₂ ≥ 30 % — до 3 доз total',
    'Antenatal corticosteroids (betamethasone × 2 за 24-48 ч до родов) — снижают RDS на 30-50 %',
    '"White lung" appearance ≠ всегда RDS: дифф. — congenital pneumonia, MAS, congenital diaphragmatic hernia',
    'У ELBW < 28 нед: surfactant immediately после стабилизации (даже без подтверждения степени)',
    'CPAP failure: FiO₂ ≥ 40 % + signs of work of breathing → MV intubation',
    'Permissive hypercapnia (PaCO₂ 45-55 mm Hg, pH ≥ 7.25) — стратегия снижения VILI',
    'Late preterm RDS — обычно более mild, но late-presentation возможна (4-6 ч после рождения)',
  ],
  related: [
    { id: 'silverman', title: 'Silverman-Anderson' },
    { id: 'neo-downes', title: 'Downes Score' },
    { id: 'neo-surfactant-dose', title: 'Сурфактант' },
    { id: 'neo-resp-indices', title: 'OI / OSI' },
    { id: 'neo-ett', title: 'Размер ЭТТ' },
  ],
  info: `### Классификация RDS у новорождённых

Радиологическая + клиническая классификация respiratory distress
syndrome (РДС) в 4 степени тяжести.

### Радиологические степени (КР РФ + Avery)

| Стадия | X-ray feature | Клиника |
|---|---|---|
| **I** (mild) | Слабый ретикулогранулярный pattern, slight ↓ aeration | FiO₂ 22-30 % |
| **II** (mod) | Diffuse reticulogranular + air bronchograms | FiO₂ 31-50 %, CPAP |
| **III** (sev) | Confluent opacification + prominent air bronchograms | FiO₂ 51-80 %, MV/surfactant |
| **IV** (very sev) | "White lung" — total opacification, heart silhouette не видна | FiO₂ > 80 %, multiple surfactant doses |

### Combined severity score (Bordik MVP)

| Сумма (X-ray + FiO₂ pts) | Severity | Tactic |
|---|---|---|
| 0-1 | Lёгкая (I) | CPAP if needed |
| 2-3 | Умеренная (II) | CPAP + surfactant если FiO₂ ≥ 30% |
| 4-6 | Тяжёлая (III) | Surfactant + MV |
| 7-8 | Очень тяжёлая (IV) | Multiple surfactant + advanced vent |

### European Consensus 2022 (Sweet et al.)

#### Key principles
1. **Antenatal corticosteroids** — betamethasone × 2 за 24-48 ч до родов
2. **Magnesium sulfate** antepartum < 32 нед — neuroprotection
3. **Delayed cord clamping** ≥ 60 sec
4. **CPAP first** при стабильности (≥ 26 нед)
5. **LISA preferred** (с CPAP) для surfactant если возможно
6. **Surfactant timing:** ASAP после diagnosis (early > late)
7. **Permissive hypercapnia** — PaCO₂ 45-55, pH ≥ 7.25

### Surfactant (Sweet 2022)

| Indication | Дозa |
|---|---|
| **Significant RDS** | Curosurf 200 мг/кг high-dose initial |
| **Standard RDS** | 100 мг/кг |
| **Repeat** | 100 мг/кг q6-12h до 3 doses total |
| **Method** | LISA preferred ≥ 26 нед on CPAP |

### Дифф диагноз "white lung"

| Причина | Distinguishing |
|---|---|
| **RDS** | Onset 1-4 ч; preterm; surfactant deficiency |
| **TTN** | Term/late preterm; resolves 24-72 ч |
| **Congenital pneumonia** | Early onset, sepsis markers, X-ray patchy |
| **MAS** | Term, meconium-stained, post-term often |
| **CDH** | Polyhydramnios history, scaphoid abdomen |
| **PDA flooding** | Late presentation, murmur, echo |
| **Air leak (PIE)** | Cystic appearance, MV history |

### Combined risk prediction

| Risk factor | OR for severe RDS |
|---|---|
| GA < 28 нед | 5-10× |
| C-section без labor | 1.5-2× |
| Maternal diabetes (GDM) | 1.5-2× |
| Family history | 1.3-1.5× |
| Male sex | 1.3-1.5× |

### Anticipatory care

#### Antenatal:
- **Betamethasone 12 мг IM × 2** за 24-48 ч (если < 34 нед)
- **Mg sulfate** для neuroprotection если < 32 нед
- **Tocolysis** для buying time для steroids

#### Postnatal:
- **Delayed cord clamping** ≥ 60 sec
- **Polyethylene wrap** для < 32 нед
- **CPAP** в первые секунды если возможно
- **Surfactant** ASAP при подтверждённой RDS
- **Caffeine** loading у < 32 нед

### Источники

- КР МЗ РФ "Респираторный дистресс синдром у новорождённого" (2024)
- Sweet DG et al. European Consensus 2022 (Neonatology 2023;120:3)
- Avery's Diseases of the Newborn 11th ed.
- Polin RA, AAP COFN 2014 — Surfactant administration
- Cochrane Surfactant Reviews 2018-2020
`,
};

export default runner;
