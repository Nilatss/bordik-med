// @ts-nocheck
/** Runner: eat26 — Eating Attitudes Test (EAT-26) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный',
  reference:
    'Garner DM, Olmsted MP, Bohr Y, Garfinkel PE. The Eating Attitudes Test: psychometric features and clinical correlates. Psychol Med. 1982;12(4):871-878.',
  inputs: [
    {
      id: 'total',
      label: 'Суммарный балл EAT-26 (26 пунктов, max 78)',
      type: 'number',
      min: 0,
      max: 78,
      step: 1,
      quickValues: [5, 15, 20, 30, 45],
      hint: 'Каждый пункт: always=3, usually=2, often=1, остальные=0 (пункт 26 обратный).',
    },
    {
      id: 'bmi',
      hint: 'ИМТ = вес (кг) / рост² (м²)',
      label: 'ИМТ (кг/м²)',
      type: 'number',
      min: 10,
      max: 50,
      step: 0.1,
      quickValues: [15, 17, 19, 23, 30],
    },
    {
      id: 'binge',
      label: 'Эпизоды переедания / компенсации ≥1/нед за 3 мес',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'weightLoss',
      label: 'Потеря веса ≥9 кг за 6 мес',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Норма (8)', values: { total: 8, bmi: 22, binge: false, weightLoss: false } },
    { label: 'Риск (22)', values: { total: 22, bmi: 18, binge: true, weightLoss: false } },
    { label: 'Вероятно AN (45)', values: { total: 45, bmi: 16, binge: false, weightLoss: true } },
  ],
  compute: (v) => {
    const total = Math.max(0, Math.min(78, Number(v.total) || 0));
    const bmi = Number(v.bmi) || 0;
    const binge = v.binge === true;
    const weightLoss = v.weightLoss === true;

    let color = '#22C55E';
    let label = 'Отрицательный (<20)';
    let details = 'Балл ниже порога риска пищевого расстройства.';
    const actions: string[] = [];

    if (total >= 20) {
      color = '#EF4444';
      label = 'Положительный (≥20)';
      details = 'Повышенный риск расстройства пищевого поведения (AN, BN, BED, OSFED). Требуется клиническая оценка.';
      actions.push(
        'Направление к психиатру / специалисту по РПП',
        'Клиническое интервью (SCID-5, EDE)',
        'Соматическая оценка: ИМТ, ЭКГ, K, Mg, PO4, альбумин, амилаза, глюкоза',
        'При ИМТ <15, брадикардии <40, гипокалиемии — госпитализация',
        'Междисциплинарная команда: психиатр, терапевт, диетолог, семейный терапевт (FBT для подростков)',
      );
    } else {
      actions.push(
        'Повторный скрининг при ухудшении',
        'Психообразование о нормальном питании',
      );
    }

    if (bmi > 0 && bmi < 17.5) {
      color = '#991B1B';
      actions.unshift('⚠️ ИМТ <17.5 — подозрение на Anorexia Nervosa (DSM-5). Оценка витальных функций, электролитов, ЭКГ');
    }
    if (bmi > 0 && bmi < 15) {
      actions.unshift('⚠️ ИМТ <15 — экстремальный риск. Срочная госпитализация (refeeding syndrome, кардиальные осложнения)');
    }
    if (binge) {
      actions.push('Эпизоды binge eating → оценить BN/BED');
    }
    if (weightLoss) {
      actions.push('Потеря ≥9 кг — красный флаг, исключить соматические причины (онкология, гипертиреоз, ВЗК)');
    }

    return {
      value: String(total),
      unit: 'баллов',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'EAT-26 — скрининг, не диагноз. Положительный → клиническое интервью',
        'Cut-off ≥20: чувствительность 77-90%, специфичность 70-95%',
        'Пункт 26 обратный (never=3, rarely=2, sometimes=1)',
        'Не подходит для мужчин с мускульной дисморфией (используйте MDDI)',
        'У подростков с AN/BN балл может быть низким из-за отрицания (egodystonic vs egosyntonic)',
        'Дополнительно — behavioral questions A-D (binge, vomiting, laxatives, exercise)',
      ],
      scale: {
        segments: [
          { min: 0, max: 19, label: '<20 отрицат.', color: '#22C55E' },
          { min: 20, max: 78, label: '≥20 положит.', color: '#EF4444' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'bmi', title: 'ИМТ' },
        { id: 'phq9', title: 'PHQ-9 (коморб.)' },
      ],
      relatedCourses: [{ id: '306.4', title: 'Психиатрия — РПП' }],
    };
  },
  info: `### Для чего используется
**EAT-26 (Eating Attitudes Test; Garner 1982)** — 26-пунктовый самоопросник для скрининга расстройств пищевого поведения (AN, BN, BED). Сокращённая версия EAT-40. Самый цитируемый инструмент скрининга РПП.

### 3 субшкалы
1. **Dieting** (13 пунктов) — ограничительное поведение
2. **Bulimia and Food Preoccupation** (6 пунктов)
3. **Oral Control** (7 пунктов)

### Оценка
| Ответ | Пункты 1-25 | Пункт 26 (обратный) |
|---|---|---|
| Always | 3 | 0 |
| Usually | 2 | 0 |
| Often | 1 | 0 |
| Sometimes | 0 | 1 |
| Rarely | 0 | 2 |
| Never | 0 | 3 |

### Интерпретация
**Cut-off ≥20** — риск РПП, требуется клиническая оценка.

### Дополнительно (Behavioral Questions A-D)
- A. Binge eating (частота?)
- B. Vomiting / laxatives (частота?)
- C. Exercise >60 мин/день для контроля веса
- D. Изменение веса за 6 мес

### DSM-5 расстройства пищевого поведения
| Расстройство | Ключевой признак |
|---|---|
| **Anorexia Nervosa** | ИМТ значительно ниже нормы, страх набора, искажение образа тела |
| **Bulimia Nervosa** | Binge + purging ≥1/нед × 3 мес, нормальный ИМТ |
| **Binge Eating Disorder** | Binge без компенсации ≥1/нед × 3 мес |
| **ARFID** | Избегающее/ограничительное без страха веса |

### Лечение
- **AN**: восстановление веса + психотерапия (FBT подростки, CBT-E взрослые)
- **BN**: CBT-E 1-я линия; флуоксетин 60 мг (FDA)
- **BED**: CBT-E, IPT; лисдексамфетамин (FDA), топирамат

### Красные флаги (госпитализация)
- ИМТ <15
- ЧСС <40 в покое
- K <3.0 мэкв/л
- Гипотензия / ортостаз
- Аритмии, удлинение QT

### Ограничения
- Не диагностический
- Возможна диссимуляция (особенно при AN)
- Не для мужчин с мускульной дисморфией`,
};

export default runner;
