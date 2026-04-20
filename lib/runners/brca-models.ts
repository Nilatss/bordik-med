// @ts-nocheck
/** Runner: brca-models */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'personal_bc',
      label: 'Личный РМЖ',
      type: 'select',
      options: [
        { value: '0', label: 'Нет' },
        { value: '1', label: 'РМЖ в возрасте ≥ 50 лет' },
        { value: '2', label: 'РМЖ в возрасте < 50 лет' },
        { value: '3', label: 'Билатеральный РМЖ / TNBC < 60 лет' },
      ],
    },
    {
      id: 'personal_oc',
      label: 'Личный рак яичников / фаллопиевых труб / брюшины',
      type: 'checkbox',
    },
    {
      id: 'family_bc_under50',
      label: 'Родственник 1-2 ст. с РМЖ < 50 лет',
      type: 'select',
      options: [
        { value: '0', label: '0' },
        { value: '1', label: '1' },
        { value: '2', label: '≥ 2' },
      ],
    },
    {
      id: 'family_oc',
      label: 'Родственник с раком яичников',
      type: 'checkbox',
    },
    {
      id: 'male_bc',
      label: 'РМЖ у мужчины в семье',
      type: 'checkbox',
    },
    {
      id: 'ashkenazi',
      label: 'Ашкеназское еврейское происхождение',
      type: 'checkbox',
    },
  ],
  compute: (v) => {
    const pbc = Number(v.personal_bc);
    const poc = !!v.personal_oc;
    const fbc = Number(v.family_bc_under50);
    const foc = !!v.family_oc;
    const mbc = !!v.male_bc;
    const ash = !!v.ashkenazi;

    // Manchester-like score (упрощённый)
    let score = 0;
    score += [0, 4, 6, 8][pbc] || 0;
    if (poc) score += 10;
    score += [0, 4, 8][fbc] || 0;
    if (foc) score += 8;
    if (mbc) score += 5;
    if (ash) score += 3;

    // вероятность BRCA1/2 (аппроксимация Myriad / Manchester)
    let prob = 2 + score * 0.8;
    if (score >= 15) prob = 10 + (score - 15) * 2;
    prob = Math.min(prob, 95);

    let color = '#22C55E';
    let cat = 'Низкая';
    let action = 'Генетическое тестирование не показано (если нет других критериев)';

    if (prob >= 10 || score >= 15) {
      color = '#F59E0B';
      cat = 'Умеренная';
      action = 'Показано генетическое консультирование + BRCA1/2 тест (NCCN критерии выполнены)';
    }
    if (prob >= 25) {
      color = '#EF4444';
      cat = 'Высокая';
      action = 'Тест BRCA1/2 + мультиген панель (PALB2, TP53, CHEK2, ATM)';
    }
    if (prob >= 50) {
      color = '#7F1D1D';
      cat = 'Очень высокая';
      action = 'Немедленный генетический тест; при BRCA+ — усиленный скрининг / профилактика';
    }

    return {
      value: `~ ${prob.toFixed(0)}%`,
      unit: 'вероятность BRCA',
      interpretation: `Вероятность BRCA1/2 мутации: ~ ${prob.toFixed(0)}%. Категория: ${cat}.`,
      color,
      details: `Manchester-like score: ${score}. Оценочная вероятность BRCA1/2 мутации: ${prob.toFixed(0)}%. ${action}.`,
      actions: [
        action,
        prob >= 10 ? 'Направить к медицинскому генетику для подробного анамнеза (включая отцовскую линию)' : '',
        prob >= 10 ? 'Рассмотреть полное секвенирование BRCA1/2 + delete/duplicate анализ' : '',
        ash && prob >= 5 ? 'Ашкенази: founder mutations (185delAG, 5382insC в BRCA1; 6174delT в BRCA2)' : '',
        prob >= 25 ? 'При BRCA+: МРТ ежегодно с 25 лет, профилактическая мастэктомия / сальпингоофорэктомия ~ 40 лет' : '',
      ].filter(Boolean),
      caveats: [
        'Рассчитано упрощённой Manchester-подобной моделью — для точной оценки используйте BOADICEA/CanRisk или Tyrer-Cuzick',
        'NCCN критерии тестирования: РМЖ < 45, ТНРМЖ < 60, РЯ, билатеральный РМЖ, муж. РМЖ, ≥ 2 родственника с РМЖ < 50',
        'Ашкенази: порог тестирования снижен (любой случай РМЖ/РЯ в семье)',
        'При BRCA1+ пожизненный риск РМЖ 55-72%, РЯ 39-44%',
        'При BRCA2+ пожизненный риск РМЖ 45-69%, РЯ 11-17%',
        'Negative тест не исключает семейную предрасположенность — рассмотреть PALB2, ATM, CHEK2, TP53',
      ],
      scale: {
        segments: [
          { min: 0, max: 10, label: '< 10%', color: '#22C55E' },
          { min: 10, max: 25, label: '10-25%', color: '#F59E0B' },
          { min: 25, max: 50, label: '25-50%', color: '#EF4444' },
          { min: 50, max: 100, label: '≥ 50%', color: '#7F1D1D' },
        ],
        current: prob,
        unit: '%',
      },
      related: [
        { id: 'gail', title: 'Gail' },
        { id: 'nottingham', title: 'Nottingham' },
        { id: 'oncotype', title: 'Oncotype' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
        { id: '309.2', title: 'Клиническая онкология' },
      ],
    };
  },
  reference: 'Evans DG et al. A new scoring system for the chances of identifying a BRCA1/2 mutation outperforms existing models. J Med Genet 2004;41:474-80. + Tyrer J et al. IBIS. Stat Med 2004;23:1111-30.',
  countries: 'Международный (NCCN, NICE, ESMO)',
  presets: [
    { label: 'Низкая вер.', values: { personal_bc: '0', personal_oc: false, family_bc_under50: '0', family_oc: false, male_bc: false, ashkenazi: false } },
    { label: 'Умеренная', values: { personal_bc: '2', personal_oc: false, family_bc_under50: '1', family_oc: false, male_bc: false, ashkenazi: false } },
    { label: 'Высокая', values: { personal_bc: '3', personal_oc: false, family_bc_under50: '2', family_oc: true, male_bc: false, ashkenazi: true } },
  ],
  info: `### Для чего используется
Оценка вероятности наследственной мутации **BRCA1/2** (и родственных генов) для отбора кандидатов на генетическое тестирование.

### Основные модели
| Модель | Особенность |
|---|---|
| **Manchester** | Простая балльная, минимум данных |
| **Myriad (BRCAPRO)** | Байесовская, подробный семейный анамнез |
| **Tyrer-Cuzick (IBIS)** | Комбинирует риск РМЖ + BRCA |
| **BOADICEA / CanRisk** | + полигенные риск-факторы (PRS), плотность MG |

### NCCN критерии тестирования (2023)
- РМЖ в любом возрасте + семейная история
- РМЖ **< 45 лет**
- **ТНРМЖ < 60 лет**
- **Билатеральный РМЖ**
- Рак яичников / фаллопиевых труб / первичный перитонеальный
- **Мужской РМЖ**
- Ашкеназское происхождение + РМЖ/РЯ в семье
- Рак простаты metastatic / high-risk

### Пожизненный риск (при мутации)
| Ген | РМЖ | Рак яичников |
|---|---|---|
| **BRCA1** | 55-72% | 39-44% |
| **BRCA2** | 45-69% | 11-17% |
| **PALB2** | 35% | — |
| **TP53 (Li-Fraumeni)** | > 50% к 50 г. | — |

### Тактика при BRCA+
- **Скрининг РМЖ**: МРТ ежегодно с 25 лет + MG с 30 лет
- **Профилактическая мастэктомия** — снижает риск на ~ 90-95%
- **Сальпингоофорэктомия** к 35-40 лет (BRCA1) / 40-45 (BRCA2) — снижает риск РЯ на 80%
- **Тамоксифен / ралоксифен** — снижает риск ER+ РМЖ

### PARP-ингибиторы при BRCA+ опухолях
- **Olaparib** — овариальный, РМЖ, предстательной, поджелудочной
- **Talazoparib** — РМЖ
- **Rucaparib, Niraparib** — РЯ

### Ограничения
- Упрощённые модели занижают риск при нестандартных паттернах
- Не оценивают новые гены (RAD51C/D, BARD1)
- Denovo мутации не выявляются по семейной истории`,
};
export default runner;
