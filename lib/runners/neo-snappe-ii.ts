/**
 * Runner: neo-snappe-ii — SNAPPE-II (Score for Neonatal Acute Physiology Perinatal Extension v2)
 *
 * NEONATOLOGY MODULE A32 (P2).
 *
 * Прогностическая шкала летальности у новорождённых в ОРИТН.
 *   SNAPPE-II = SNAP-II (6 физиологических параметров за первые 12 ч)
 *               + 3 перинатальных параметра (BW, Apgar 5 min, SGA)
 *
 * Total 9 параметров, диапазон 0-162 балла.
 *
 * Преимущества перед CRIB-II:
 *   - Применим к ВСЕМ NICU admits (не только preterm < 32 нед)
 *   - Включает физиологию первых 12 ч (динамика, не only baseline)
 *   - SNAPPE = + 3 perinatal факторы (BW, Apgar, SGA) → лучшая дискриминация
 *
 * Интерпретация (Richardson 2001):
 *   - 0-20 балл → low mortality risk (~1-3 %)
 *   - 21-40 → moderate (~5-15 %)
 *   - 41-60 → high (~15-35 %)
 *   - > 60 → critical (~40-80 %)
 *
 * Использование:
 *   - Сравнение outcomes между NICU центрами (case-mix adjustment)
 *   - Audit качества помощи
 *   - Стратификация для clinical trials
 *
 * SOURCES:
 *   - Richardson DK, Corcoran JD, Escobar GJ, Lee SK.
 *     SNAP-II and SNAPPE-II: Simplified newborn illness severity and
 *     mortality risk scores. J Pediatr 2001;138(1):92-100.
 *   - Сравнение с CRIB-II: Parry G et al. Lancet 2003;361:1789
 *   - Зональная адаптация: Sullivan KM et al. Pediatrics 2018;141:e20171871
 */
import type { ScoreTool, ScoreBand } from '../tools-runners';

const bands: ScoreBand[] = [
  {
    min: 0,
    max: 20,
    label: '0-20 (низкий риск)',
    color: '#22C55E',
    description: 'Прогнозируемая госпитальная летальность ~1-3 %.',
    details: 'Стабильный пациент. Стандартный мониторинг + grade-A care bundle.',
    actions: [
      'Стандартный мониторинг ОРИТН',
      'Раннее энтеральное питание (грудное молоко по возможности)',
      'Минимизировать manipulation у preterm < 32 нед',
      'Routine sceening: УЗИ ГМ, ROP по timing',
    ],
  },
  {
    min: 21,
    max: 40,
    label: '21-40 (умеренный)',
    color: '#F59E0B',
    description: 'Прогнозируемая летальность ~5-15 %.',
    details: 'Умеренный риск. Часто сопутствуют РДС, ВЖК I-II, ОАП.',
    actions: [
      'Сурфактант при РДС (LISA при стабильном спонтанном дыхании)',
      'Echo: ОАП оценка на 24-48 ч',
      'УЗИ ГМ 3 + 7 + 14 день',
      'Caffeine у preterm < 32 нед',
      'Мониторинг электролитов, глюкозы q6-12h первые 48 ч',
    ],
  },
  {
    min: 41,
    max: 60,
    label: '41-60 (высокий)',
    color: '#EF4444',
    description: 'Прогнозируемая летальность ~15-35 %.',
    details: 'Высокий риск. Часто HIE, sepsis, RDS с PPHN, ВЖК III-IV.',
    actions: [
      'Мультидисциплинарный консилиум',
      'Консультация семьи о прогнозе + целях лечения',
      'Полная поддержка: HFOV / iNO при показаниях, инотропы',
      'Therapeutic hypothermia при HIE (если eligible)',
      'Aggressive nutritional support, prevention sepsis',
    ],
  },
  {
    min: 61,
    max: 162,
    label: '> 60 (критический)',
    color: '#991B1B',
    description: 'Прогнозируемая летальность 40-80 %.',
    details: 'Критическое состояние. Многосистемная dysfunction.',
    actions: [
      'Консилиум с семьёй — обсудить goals of care',
      'Palliative care option рассмотреть параллельно с life-sustaining',
      'Maximal medical: HFOV, iNO, инотропы, при показаниях ECMO',
      'Тщательный мониторинг: ABG q2-4h, lactate, BP, UO, lab panel q12h',
      'Документация согласия с семьёй на каждый этап эскалации',
    ],
  },
];

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 162,
  countries: 'Международный',
  reference:
    'Richardson DK et al. J Pediatr 2001;138:92-100 — SNAP-II and SNAPPE-II',
  inputs: [
    {
      id: 'map',
      label: 'Mean BP (mmHg) — lowest за 12 ч',
      type: 'select',
      options: [
        { value: '0',  label: '≥ 30 mmHg',         points: 0  },
        { value: '9',  label: '20-29 mmHg',        points: 9  },
        { value: '19', label: '< 20 mmHg',         points: 19 },
      ],
    },
    {
      id: 'temp',
      label: 'Lowest temperature (°C) — за 12 ч',
      type: 'select',
      options: [
        { value: '0',  label: '≥ 35,6 °C',         points: 0  },
        { value: '8',  label: '35,0-35,5 °C',      points: 8  },
        { value: '15', label: '< 35,0 °C',         points: 15 },
      ],
    },
    {
      id: 'pf_ratio',
      label: 'pO₂/FiO₂ — lowest за 12 ч',
      type: 'select',
      options: [
        { value: '0',  label: '≥ 2,49',            points: 0  },
        { value: '5',  label: '1,00-2,49',         points: 5  },
        { value: '16', label: '0,30-0,99',         points: 16 },
        { value: '28', label: '< 0,30',            points: 28 },
      ],
    },
    {
      id: 'ph',
      label: 'Lowest serum pH за 12 ч',
      type: 'select',
      options: [
        { value: '0',  label: '≥ 7,20',            points: 0  },
        { value: '7',  label: '7,10-7,19',         points: 7  },
        { value: '16', label: '< 7,10',            points: 16 },
      ],
    },
    {
      id: 'seizures',
      label: 'Multiple seizures (≥ 2 эпизода за 12 ч)',
      type: 'select',
      options: [
        { value: '0',  label: 'Нет',               points: 0  },
        { value: '19', label: 'Да',                points: 19 },
      ],
    },
    {
      id: 'urine',
      label: 'Urine output (мл/кг/ч) — lowest за 12 ч',
      type: 'select',
      options: [
        { value: '0',  label: '≥ 1,0 мл/кг/ч',     points: 0  },
        { value: '5',  label: '0,1-0,9 мл/кг/ч',   points: 5  },
        { value: '18', label: '< 0,1 мл/кг/ч',     points: 18 },
      ],
    },
    {
      id: 'bw',
      label: 'Birth weight (perinatal extension)',
      type: 'select',
      options: [
        { value: '0',  label: '≥ 1000 г',          points: 0  },
        { value: '10', label: '750-999 г',         points: 10 },
        { value: '17', label: '< 750 г',           points: 17 },
      ],
    },
    {
      id: 'apgar5',
      label: 'Apgar at 5 min (perinatal extension)',
      type: 'select',
      options: [
        { value: '0',  label: '≥ 7',               points: 0  },
        { value: '18', label: '< 7',               points: 18 },
      ],
    },
    {
      id: 'sga',
      label: 'SGA (BW < 10 percentile) (perinatal ext)',
      type: 'select',
      options: [
        { value: '0',  label: 'Нет',               points: 0  },
        { value: '12', label: 'Да',                points: 12 },
      ],
    },
  ],
  bands,
  info: `
### Для чего используется
**SNAPPE-II (Score for Neonatal Acute Physiology Perinatal Extension v2, Richardson 2001)** — прогностическая шкала госпитальной летальности у новорождённых в ОРИТН за первые 12 ч.

### Параметры (9 шт, 0-162 балла)

| Параметр | Диапазон |
|---|---|
| Mean BP (lowest) | ≥ 30 → 0, 20-29 → 9, < 20 → 19 |
| Lowest temp | ≥ 35,6 → 0, 35,0-35,5 → 8, < 35,0 → 15 |
| pO₂/FiO₂ (lowest) | ≥ 2,49 → 0, 1,00-2,49 → 5, 0,30-0,99 → 16, < 0,30 → 28 |
| Lowest serum pH | ≥ 7,20 → 0, 7,10-7,19 → 7, < 7,10 → 16 |
| Multiple seizures | Нет → 0, Да → 19 |
| Urine output | ≥ 1,0 → 0, 0,1-0,9 → 5, < 0,1 → 18 |
| Birth weight | ≥ 1000 → 0, 750-999 → 10, < 750 → 17 |
| Apgar 5 min | ≥ 7 → 0, < 7 → 18 |
| SGA | Нет → 0, Да → 12 |

### Интерпретация
| Баллы | Прогноз госпитальной смертности |
|---|---|
| 0-20 | ~1-3 % |
| 21-40 | ~5-15 % |
| 41-60 | ~15-35 % |
| > 60 | 40-80 % |

### Преимущества vs CRIB-II
| Параметр | SNAPPE-II | CRIB-II |
|---|---|---|
| Применим к | ВСЕМ NICU admits | Только preterm < 32 нед / < 1500 г |
| Временной интервал | 12 ч после admission | 1 ч после admission |
| Физиология | 6 параметров за 12 ч | 5 параметров baseline |
| Perinatal | BW, Apgar 5 min, SGA | BW, GA, sex, temp |
| Дискриминация (AUROC) | 0,85-0,90 | 0,80-0,87 |
| Лучше для | severity-adjusted comparisons | preterm-specific mortality |

### Когда использовать
- Сравнение outcomes между NICU центрами (case-mix adjustment)
- Audit качества помощи
- Стратификация для clinical trials
- Communication с семьёй о risk

### Ограничения
- Зависит от данных первых 12 ч (требует accurate documentation)
- Multiple seizures — clinical definition variability
- pO₂/FiO₂ — не валиден если на iNO / HFOV без adjustments
- Не учитывает hospital-acquired complications

### Альтернативы
| Шкала | Особенность |
|---|---|
| **SNAP-II** | Только физиология (6 параметров), без perinatal extension. 0-115 |
| **CRIB-II** | Preterm < 32 нед, 1 ч после admission. 0-27 |
| **NTISS** | Therapy-based, не severity. Интенсивность лечения |
| **nSOFA** | Sepsis-specific (Wynn JAMA Pediatr 2020). 0-15 |

### Источники
- Richardson DK, Corcoran JD, Escobar GJ, Lee SK. **J Pediatr 2001;138:92-100** — оригинальная валидация SNAP-II + SNAPPE-II
- Parry G, Tucker J, Tarnow-Mordi W. **Lancet 2003;361:1789** — UK Neonatal Staffing Study (сравнение с CRIB-II)
- Sullivan KM et al. **Pediatrics 2018;141:e20171871** — SNAPPE-II у very preterm в современной когорте
- Avery's Diseases of the Newborn 11th ed. (severity scoring chapter)
`,
};

export default runner;
