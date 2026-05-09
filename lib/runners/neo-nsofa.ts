/**
 * Runner: neo-nsofa — Neonatal SOFA (nSOFA) Score
 *
 * NEONATOLOGY MODULE A33 (P3).
 *
 * Шкала органной недостаточности у новорождённых при сепсисе.
 * Адаптация adult/pediatric SOFA для NICU контекста.
 *
 * SOURCES:
 *   - Wynn JL et al. JAMA Pediatr 2020;174(10):e202531
 *   - Fleiss N et al. JAMA Netw Open 2021;4(2):e2036518 (validation)
 *   - PALICC consensus 2017 (peds context)
 *
 * 3 системы (max 8):
 *   1. Респираторная (0-4): SpO₂/FiO₂ + поддержка
 *   2. Сердечно-сосудистая (0-2): инотропы, vasopressors, гидрокортизон
 *   3. Гематологическая (0-2): тромбоциты
 *
 * Bands:
 *   0       — нет органной дисфункции
 *   1-2     — лёгкая
 *   3-4     — умеренная
 *   ≥ 5     — тяжёлая (high mortality)
 *
 * Пороги:
 *   nSOFA ≥ 4: чувствительность 67 %, специфичность 79 % для смерти от
 *   late-onset sepsis (Wynn 2020)
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 8,
  countries: 'Международный (Wynn 2020 / JAMA Peds)',
  reference: 'Wynn JL et al. JAMA Pediatr 2020;174:e202531. Fleiss N JAMA Netw Open 2021;4:e2036518.',
  inputs: [
    {
      id: 'resp',
      label: 'Респираторная (SpO₂/FiO₂ + поддержка)',
      type: 'select',
      options: [
        { value: '0', label: 'Не вентилируется (no support)', points: 0 },
        { value: '1', label: 'Mechanical ventilation, SpO₂/FiO₂ ≥ 263', points: 2 },
        { value: '2', label: 'Mechanical ventilation, SpO₂/FiO₂ 165-263', points: 3 },
        { value: '3', label: 'Mechanical ventilation, SpO₂/FiO₂ < 165', points: 4 },
      ],
    },
    {
      id: 'cv',
      label: 'Сердечно-сосудистая',
      type: 'select',
      options: [
        { value: '0', label: 'Не получает inotropes/vasopressors', points: 0 },
        { value: '1', label: 'Любой inotrope/vasopressor (1 препарат)', points: 1 },
        { value: '2', label: 'Multiple inotropes/vasopressors ИЛИ + гидрокортизон', points: 2 },
      ],
    },
    {
      id: 'hema',
      label: 'Гематологическая (тромбоциты)',
      type: 'select',
      options: [
        { value: '0', label: 'Plt ≥ 150 × 10⁹/л', points: 0 },
        { value: '1', label: 'Plt 100-149', points: 1 },
        { value: '2', label: 'Plt < 100', points: 2 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 0,
      label: 'Нет органной дисфункции',
      color: '#22C55E',
      description: 'Нет признаков органной дисфункции.',
      actions: [
        'Поддерживающая терапия по протоколу',
        'Контроль клиники, vital signs q4h',
        'Cultures если подозрение на инфекцию',
      ],
    },
    {
      min: 1,
      max: 2,
      label: 'Лёгкая дисфункция',
      color: '#84CC16',
      description: 'Лёгкая органная дисфункция.',
      actions: [
        'Cultures и эмпирические abx если sepsis вероятен',
        'Volume status assessment; коррекция при гиповолемии',
        'Monitoring: ЧСС, АД, SpO₂, диурез q1-2h',
        'Контроль лактата, газов крови, CBC',
      ],
    },
    {
      min: 3,
      max: 4,
      label: 'Умеренная дисфункция',
      color: '#F59E0B',
      description: 'Умеренная органная дисфункция; усиление терапии.',
      actions: [
        'Эскалация antimicrobial therapy (broad-spectrum + cover для anaerobes/MRSA)',
        'Inotropes: dopamine/dobutamine/epinephrine по протоколу',
        'Volume resuscitation (NS 10-20 мл/кг × 2-3 если perfusion poor)',
        'IVIG обсудить (Cochrane controversial)',
        'Перевод в ОРИТН если нет; центральный доступ',
      ],
    },
    {
      min: 5,
      max: 8,
      label: 'Тяжёлая дисфункция (high mortality)',
      color: '#7F1D1D',
      description: 'Multi-organ failure — критическое состояние.',
      actions: [
        '⚠️ nSOFA ≥ 5 — высокий риск смерти от sepsis',
        'Maximum medical support: HFOV, multiple inotropes, ECMO consult',
        'Гидрокортизон 1-2 мг/кг q8h при refractory hypotension',
        'CRRT при ОПН с volume overload',
        'Exchange transfusion рассмотреть при ELBW + DIC + тяжёлый sepsis',
        'Семья: реалистичная коммуникация про prognosis',
      ],
    },
  ],
  caveats: [
    'nSOFA валидирован для late-onset sepsis у недоношенных (главным образом VLBW < 1500 г)',
    'nSOFA ≥ 4 — чувствительность 67 %, специфичность 79 % для смерти от LOS (Wynn 2020)',
    'Альтернатива: NEO-SOFA (Fleiss 2021) — добавляет неврологию, ЖКТ',
    'Шкала не diagnostic для sepsis — это severity tool',
    'У EOS (≤ 72 ч) валидация ограничена; использовать с осторожностью',
    'Динамический score (q24h) более информативен чем static',
  ],
  related: [
    { id: 'qsofa', title: 'qSOFA (взрослые)' },
    { id: 'sofa', title: 'SOFA (взрослые)' },
    { id: 'neo-kaiser-eos', title: 'Kaiser EOS' },
    { id: 'neo-puopolo-eos', title: 'Puopolo EOS' },
  ],
  info: `### Neonatal SOFA (nSOFA)

Шкала органной недостаточности при сепсисе у новорождённых, валидирована
Wynn JL et al. (JAMA Pediatr 2020) для late-onset sepsis у VLBW.

### Параметры (3 системы)

| Система | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| **Респ** | Нет support | — | MV + SpO₂/FiO₂ ≥ 263 | MV + 165-263 | MV + < 165 |
| **CV** | No inotropes | 1 inotrope | Multi inotropes ИЛИ + HC | — | — |
| **Hema** | Plt ≥ 150 | 100-149 | < 100 | — | — |

Max nSOFA = 8.

### Бэнды и mortality

| nSOFA | Severity | Mortality (LOS) |
|---|---|---|
| 0 | Норма | < 5 % |
| 1-2 | Mild | 5-15 % |
| 3-4 | Moderate | 25-40 % |
| ≥ 5 | Severe | > 50 % |

### Cutoff

- **nSOFA ≥ 4** — чувствительность 67 %, специфичность 79 % для смерти от LOS
  (Wynn 2020 cohort: 38 NICUs, 1019 VLBW infants)

### Дифференциация от Kaiser/Puopolo EOS

| | nSOFA | Kaiser EOS | Puopolo EOS |
|---|---|---|---|
| **Когда** | После diagnosis | До diagnosis | До diagnosis |
| **Цель** | Severity / prognosis | Probability / triage | Probability / triage |
| **Возраст** | Любой (LOS validated) | ≥ 34 нед, < 72 ч | ≤ 34 нед, < 72 ч |

### Динамический мониторинг

nSOFA q24h в течение sepsis-эпизода:
- Снижение ≥ 2 балла за 24 ч → favorable response
- Рост ≥ 2 балла за 24 ч → escalation needed

### Источники

- Wynn JL et al. JAMA Pediatr 2020;174:e202531
- Fleiss N et al. JAMA Netw Open 2021;4:e2036518
- PALICC consensus 2017 (peds context)
`,
};

export default runner;
