/**
 * Runner: neo-puopolo-eos — Puopolo EOS (Early-Onset Sepsis) for ≤ 34 нед
 *
 * NEONATOLOGY MODULE A23 (P2).
 *
 * Альтернатива Kaiser EOS calculator для недоношенных ≤ 34+6 нед.
 * Kaiser применим только ≥ 34 нед; для < 34 нед используется стратификация
 * по факторам риска матери (Puopolo 2017 модель).
 *
 * Бордик MVP — категориальная оценка по факторам риска.
 *
 * SOURCES:
 *   - Puopolo KM et al. Pediatrics 2017;139(5):e20162426 — risk factors model
 *   - AAP COFN 2018: Management of Infants ≤ 34 weeks GA at Risk for EOS
 *     (Pediatrics 142(6):e20182894)
 *   - Berardi A et al. JPGN 2018 — Italian consensus
 *   - КР МЗ РФ "Бактериальный сепсис новорождённого" (2024)
 *
 * 3-tiered подход (AAP 2018):
 *   - High-risk: PROM > 18 ч + клиника, или хориоамнионит, или
 *     intrapartum AB inadequate. Эмпирические abx + cultures.
 *   - Intermediate: 1 risk factor, ребёнок выглядит хорошо. Cultures +
 *     observation 36-48 ч.
 *   - Low-risk: PROM ≤ 18 ч, нет инфекционных признаков матери,
 *     intrapartum AB adequate. Observation only.
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 6,
  countries: 'Международный (Puopolo 2017 / AAP 2018) · РФ',
  reference: 'Puopolo KM et al. Pediatrics 2017;139:e20162426. AAP COFN 2018 (Pediatrics 142:e20182894).',
  inputs: [
    {
      id: 'ga_lt_34',
      label: 'GA ≤ 34+6 нед?',
      type: 'select',
      options: [
        { value: '0', label: 'Нет (для GA ≥ 34 нед — Kaiser EOS)' },
        { value: '1', label: 'Да' },
      ],
    },
    {
      id: 'chorio',
      label: 'Хориоамнионит / triple-I (clinical or pathologic)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет' },
        { value: '1', label: 'Подозрение / клиника' },
        { value: '2', label: 'Подтверждённый / suspected severe' },
      ],
    },
    {
      id: 'prom',
      label: 'PROM (преждевременное излитие вод)',
      type: 'select',
      options: [
        { value: '0', label: '< 18 ч' },
        { value: '1', label: '≥ 18 ч' },
      ],
    },
    {
      id: 'iap',
      label: 'Intrapartum AB при показаниях (GBS+, PROM > 18 ч)',
      type: 'select',
      options: [
        { value: '0', label: 'Adequate (≥ 4 ч до родов или N/A)' },
        { value: '1', label: 'Inadequate / нет' },
      ],
    },
    {
      id: 'maternal_fever',
      label: 'Материнская лихорадка ≥ 38 °C intrapartum',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'symptoms',
      label: 'Ребёнок симптоматичен (тахипноэ, цианоз, температурная нестабильность, плохое кормление)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет' },
        { value: '1', label: 'Да' },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'Low risk',
      color: '#22C55E',
      description: 'Низкий риск EOS — observation only.',
      actions: [
        'Observation 36-48 ч (q4h vital signs, feeding, clinical assessment)',
        'Cultures и эмпирические abx НЕ показаны',
        'Документировать риск-факторы и план observation',
      ],
    },
    {
      min: 2,
      max: 3,
      label: 'Intermediate',
      color: '#F59E0B',
      description: 'Промежуточный риск — cultures, рассмотреть abx.',
      actions: [
        'Cultures крови (минимум 1 мл, лучше 1+ мл)',
        'CBC + CRP @ 0/12/24 ч (hot 12-24 ч после рождения)',
        'Эмпирические abx (ампициллин + гентамицин) — если ≥ 2 риск-факторов',
        'Re-eval @ 36-48 ч; abx прекратить если cultures negative + ребёнок здоров',
      ],
    },
    {
      min: 4,
      max: 6,
      label: 'High risk',
      color: '#EF4444',
      description: 'Высокий риск EOS — empirical abx немедленно.',
      actions: [
        'Cultures немедленно: blood + LP (по показаниям, особенно если симптоматика)',
        'Эмпирические abx: ампициллин 50-100 мг/кг q12h + гентамицин 4-5 мг/кг q24-48h',
        'Респираторная поддержка / volume / vasopressors по показаниям',
        'Глюкоза, KOS, лактат, CBC, CRP мониторинг',
        'Длительность abx: 7-10 дней если cultures positive; 36-48 ч если negative',
        'Рассмотреть IVIG, exchange transfusion при тяжёлом sepsis (контроверсиально)',
      ],
    },
  ],
  caveats: [
    'Puopolo калькулятор — категориальная стратификация, не Bayesian вероятность как Kaiser',
    'Любая клиника симптомов = эмпирические abx + cultures, независимо от risk score',
    'GBS+ status матери: adequate AB = ≥ 4 ч intrapartum; otherwise inadequate',
    'Хориоамнионит / triple-I = automatic high-risk, abx + cultures',
    'AAP 2018: tiered approach снижает unnecessary abx exposure у недоношенных',
    'У ≤ 34 нед чаще ложноотрицательные cultures — клиника весомее',
  ],
  related: [
    { id: 'neo-kaiser-eos', title: 'Kaiser EOS (≥ 34 нед)' },
    { id: 'qsofa', title: 'qSOFA' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
  ],
  info: `### Puopolo EOS — Early-Onset Sepsis для ≤ 34 нед

Альтернатива Kaiser EOS calculator для недоношенных ≤ 34+6 нед. Kaiser
применим только для ≥ 34 нед; здесь — категориальная стратификация по
AAP COFN 2018 на основе модели Puopolo 2017.

### 3-tiered подход (AAP 2018)

| Tier | Критерии | Тактика |
|---|---|---|
| **Low** | < 2 risk factors, asymptomatic | Observation 36-48 ч |
| **Intermediate** | 1-2 RF | Cultures + CBC/CRP, ± abx |
| **High** | ≥ 2 RF, или хорио, или симптомы | Cultures + abx немедленно |

### Risk Factors

1. **GA ≤ 34 нед** — основной структурный (нельзя изменить)
2. **PROM ≥ 18 ч**
3. **Хориоамнионит / triple-I** (клинический или гистологический)
4. **Материнская лихорадка intrapartum ≥ 38 °C**
5. **GBS+ статус с inadequate IAP** (< 4 ч до родов)
6. **Симптомы у ребёнка** (тахипноэ, цианоз, температурная нестабильность)

### Эмпирические abx

| Препарат | Доза | Частота |
|---|---|---|
| Ампициллин | 50-100 мг/кг | q12h (q8h если ≥ 2000 г) |
| Гентамицин | 4-5 мг/кг | q24-48h (PMA-зависимо) |

### Длительность

- **Cultures positive:** 7-10 дней (sepsis), 14-21 (meningitis)
- **Cultures negative + clinical improvement:** прекратить через 36-48 ч
- **Cultures negative + clinical concern:** 5-7 дней по дискреции

### Сравнение с Kaiser EOS

| | Puopolo (≤34 нед) | Kaiser (≥34 нед) |
|---|---|---|
| Type | Категориальный | Bayesian вероятность |
| Output | Low / Med / High | Posterior probability |
| Применение | AAP 2018 алгоритм | Калькулятор + clinical category |

### Источники

- Puopolo KM et al. Pediatrics 2017;139:e20162426
- AAP COFN 2018 (Pediatrics 142:e20182894)
- Berardi A et al. JPGN 2018 — Italian consensus
- КР МЗ РФ "Бактериальный сепсис н/р" (2024)
`,
};

export default runner;
