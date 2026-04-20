// @ts-nocheck
/** Runner: ctg - интерпретация КТГ (FIGO 2015 / NICHD 2008) */
import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'baseline',
      label: 'Базальная ЧСС плода',
      type: 'select',
      options: [
        { value: 'normal', label: '110-160 уд/мин (норма)' },
        { value: 'brady', label: '< 110 (брадикардия)' },
        { value: 'tachy', label: '> 160 (тахикардия)' },
      ],
    },
    {
      id: 'variability',
      label: 'Вариабельность',
      type: 'select',
      options: [
        { value: 'normal', label: '5-25 уд/мин (норма)' },
        { value: 'reduced', label: '< 5 уд/мин > 50 мин (сниженная)' },
        { value: 'marked', label: '> 25 уд/мин (повышенная)' },
        { value: 'sinusoidal', label: 'Синусоидальная' },
      ],
    },
    {
      id: 'decels',
      label: 'Децелерации',
      type: 'select',
      options: [
        { value: 'none', label: 'Нет / ранние' },
        { value: 'variable', label: 'Вариабельные < 60 сек' },
        { value: 'severe_var', label: 'Тяжёлые вариабельные ≥ 60 сек' },
        { value: 'late', label: 'Поздние повторяющиеся' },
        { value: 'prolonged', label: 'Пролонгированные > 3 мин' },
      ],
    },
    {
      id: 'accels',
      label: 'Акцелерации',
      type: 'select',
      options: [
        { value: 'present', label: 'Присутствуют' },
        { value: 'absent', label: 'Отсутствуют' },
      ],
    },
  ],
  compute: (v) => {
    const bl = v.baseline;
    const vr = v.variability;
    const dc = v.decels;
    const ac = v.accels;
    let abn = 0;
    const flags = [];
    if (bl !== 'normal') {
      abn++;
      flags.push(`Базальная ЧСС: ${bl === 'brady' ? 'брадикардия' : 'тахикардия'}`);
    }
    if (vr === 'reduced' || vr === 'marked') {
      abn++;
      flags.push('Патологическая вариабельность');
    }
    if (dc === 'variable') {
      abn++;
      flags.push('Вариабельные децелерации');
    }
    if (dc === 'severe_var' || dc === 'late' || dc === 'prolonged') {
      abn += 2;
      flags.push('Тяжёлые децелерации');
    }
    const sinus = vr === 'sinusoidal';
    let cat = '';
    let color = '';
    let nichd = '';
    let actions = [];
    if (sinus || dc === 'prolonged' || (dc === 'late' && vr === 'reduced')) {
      cat = 'Патологическая (FIGO)';
      color = '#DC2626';
      nichd = 'NICHD III (abnormal)';
      actions = [
        'Немедленная коррекция обратимых причин (положение, гидратация, оксигенация, токолиз при гиперстимуляции)',
        'Вызов старшего акушера и неонатолога',
        'Готовность к оперативному родоразрешению (экстренное КС / вакуум / щипцы)',
        'При синусоидальном ритме - подозрение на тяжёлую анемию/кровотечение плода',
      ];
    } else if (abn >= 2) {
      cat = 'Патологическая (FIGO)';
      color = '#DC2626';
      nichd = 'NICHD III';
      actions = ['Реанимация плода in utero', 'Подготовка к родоразрешению'];
    } else if (abn === 1) {
      cat = 'Подозрительная (FIGO)';
      color = '#F59E0B';
      nichd = 'NICHD II (indeterminate)';
      actions = [
        'Коррекция обратимых причин: положение на боку, инфузия, O₂ при необходимости, прекращение окситоцина',
        'Повторная оценка через 20-30 мин',
        'Рассмотреть STAN / fetal scalp blood sampling при возможности',
      ];
    } else {
      cat = 'Нормальная (FIGO)';
      color = '#22C55E';
      nichd = 'NICHD I (normal)';
      actions = ['Наблюдение', 'Продолжить плановое ведение родов'];
    }
    return {
      value: cat,
      unit: '',
      interpretation: `${cat} · ${nichd}`,
      color,
      details:
        flags.length > 0 ? `Отклонения: ${flags.join('; ')}.` : 'Паттерн в пределах нормы.',
      actions,
      caveats: [
        'КТГ интерпретируется только в клиническом контексте (ГВ, стимуляция, ЛС, анестезия)',
        'Синусоидальный ритм > 10 мин - всегда патология (анемия/кровотечение плода)',
        'FIGO 2015 исключил категорию «подозрительная» в пользу бинарной шкалы в части документов',
        'NICHD категория II - гетерогенная; требует клинической оценки',
      ],
      related: [
        { id: 'apgar', title: 'Apgar' },
        { id: 'bishop', title: 'Bishop' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Акушерство' },
        { id: '301.7', title: 'Интранатальная медицина' },
      ],
    };
  },
  reference:
    'FIGO consensus guidelines on intrapartum fetal monitoring, 2015 (Ayres-de-Campos). NICHD 2008 (Macones GA et al., Obstet Gynecol 2008;112:661).',
  countries: 'Международный (FIGO, ACOG, NICHD)',
  presets: [
    {
      label: 'Норма (I)',
      values: {
        baseline: 'normal',
        variability: 'normal',
        decels: 'none',
        accels: 'present',
      },
    },
    {
      label: 'Подозрительная (II)',
      values: {
        baseline: 'tachy',
        variability: 'normal',
        decels: 'variable',
        accels: 'present',
      },
    },
    {
      label: 'Патологическая (III)',
      values: {
        baseline: 'normal',
        variability: 'reduced',
        decels: 'late',
        accels: 'absent',
      },
    },
  ],
  caveats: [
    'Прикроватная интерпретация обязательна для персонала родблока',
    'При сохранении патологического паттерна > 30 мин - показано родоразрешение',
  ],
  related: [
    { id: 'apgar', title: 'Apgar' },
    { id: 'bishop', title: 'Bishop' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство' },
    { id: '301.7', title: 'Интранатальная медицина' },
  ],
  info: `### Для чего используется
**Кардиотокография (КТГ)** - мониторинг ЧСС плода и сократительной активности матки в антенатальном и интранатальном периодах. Интерпретируется по FIGO 2015 или NICHD 2008.

### FIGO 2015 - параметры
| Параметр | Норма | Подозрительно | Патологически |
|---|---|---|---|
| Базальная ЧСС | 110-160 | - | < 100 или стойкая > 160 |
| Вариабельность | 5-25 | > 50 мин < 5 или > 25 | Синусоидальная, < 5 > 50 мин |
| Децелерации | Нет / ранние | Вариабельные повторяющиеся | Поздние / тяжёлые вариабельные / пролонгированные > 3 мин |

**Классификация:** Нормальная (все норма) / Подозрительная (1 отклонение) / Патологическая (≥ 2 отклонений или синусоидальная).

### NICHD 2008 - три категории
- **Category I (normal):** базальная 110-160, вариабельность умеренная, акцелерации присутствуют/отсутствуют, ранние децелерации ± - наблюдение.
- **Category II (indeterminate):** всё, что не I и не III - требует клинической оценки и реанимации in utero.
- **Category III (abnormal):** отсутствие вариабельности + рецидивирующие поздние/вариабельные, или брадикардия; синусоидальный ритм - родоразрешение.

### Источники
FIGO 2015 (Ayres-de-Campos). NICHD 2008 (Macones GA).`,
};

export default runner;
