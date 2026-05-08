/** Runner: frenchay - Frenchay Dysarthria Assessment (FDA-2) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const opts = [
  { value: 4, label: 'a — норма (4)' },
  { value: 3, label: 'b — лёгкое (3)' },
  { value: 2, label: 'c — умеренное (2)' },
  { value: 1, label: 'd — тяжёлое (1)' },
  { value: 0, label: 'e — крайне тяжёлое (0)' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'reflex', label: 'Рефлексы (кашель, глотание, слюнотечение)', type: 'select', options: opts },
    { id: 'respiration', label: 'Дыхание (в покое + при речи)', type: 'select', options: opts },
    { id: 'lips', label: 'Губы (смыкание, подвижность, в речи)', type: 'select', options: opts },
    { id: 'jaw', label: 'Челюсть (в покое и при речи)', type: 'select', options: opts },
    { id: 'palate', label: 'Мягкое нёбо (при еде, подъём, назализация)', type: 'select', options: opts },
    { id: 'laryngeal', label: 'Гортань (фонация, высота, громкость, МФТ)', type: 'select', options: opts },
    { id: 'tongue', label: 'Язык (в покое, подвижность, в речи)', type: 'select', options: opts },
    { id: 'intell', label: 'Разборчивость (слова, предложения, беседа)', type: 'select', options: opts },
  ],
  compute: (v) => {
    const keys = ['reflex', 'respiration', 'lips', 'jaw', 'palate', 'laryngeal', 'tongue', 'intell'] as const;
    const scores = keys.map((k) => Number(v[k]) || 0);
    const total = scores.reduce((a, b) => a + b, 0);
    const max = 32;
    const pct = Math.round((total / max) * 100);

    let band = '', color = '#22C55E', details = '';
    if (total >= 28) { band = 'Норма / лёгкая'; color = '#22C55E'; details = 'Минимальные или отсутствующие дизартрические нарушения.'; }
    else if (total >= 20) { band = 'Лёгкая дизартрия'; color = '#84CC16'; details = 'Разборчивость сохранена, небольшие отклонения.'; }
    else if (total >= 12) { band = 'Умеренная дизартрия'; color = '#F59E0B'; details = 'Заметные нарушения, влияющие на коммуникацию — показана логопедическая терапия.'; }
    else { band = 'Тяжёлая дизартрия'; color = '#EF4444'; details = 'Выраженные нарушения — потенциально нужны AAC (альтернативная коммуникация).'; }

    const weakest: string[] = [];
    keys.forEach((k, i) => { if (scores[i]! <= 1) weakest.push(k); });

    return {
      value: String(total),
      unit: `/${max} (${pct}%)`,
      interpretation: band,
      color,
      details: `${details} Интеллигибельность: ${scores[7] ?? 0}/4.${weakest.length ? ' Наиболее нарушены: ' + weakest.join(', ') + '.' : ''}`,
      actions: [
        'Выявить тип дизартрии по Mayo (спастическая / атактическая / гипокинетическая / гиперкинетическая / вялая / смешанная)',
        'Оценить глотание (dysphagia screen) — частая коморбидность',
        total < 20 ? 'Направить к логопеду; индивидуальная программа 10-20 сессий' : 'Мониторинг + домашние упражнения',
        (scores[5] ?? 0) <= 1 ? 'Голосовая терапия (LSVT LOUD при болезни Паркинсона)' : '',
        total < 12 ? 'Оценить необходимость AAC (речевые приложения, коммуникативные доски)' : '',
        'Связать с этиологией: инсульт, БАС, Паркинсон, ЧМТ, ДЦП, рассеянный склероз',
      ].filter(Boolean),
      caveats: [
        'FDA-2 (Enderby, 2008) — стандартизированная клиническая шкала из 8 доменов × 5 уровней',
        'Максимум 32 балла (каждый домен 0-4); некоторые версии используют a-e с процентилями',
        'Требует обучения оценщика и видеозаписи для межэкспертной согласованности',
        'Не дифференцирует дизартрию и апраксию речи (AOS) — нужен отдельный тест',
        'Дополнить интеллигибельностью по Yorkston (Sentence Intelligibility Test)',
      ],
      scale: {
        segments: [
          { min: 0, max: 11, label: 'Тяжёлая', color: '#EF4444' },
          { min: 12, max: 19, label: 'Умеренная', color: '#F59E0B' },
          { min: 20, max: 27, label: 'Лёгкая', color: '#84CC16' },
          { min: 28, max: 32, label: 'Норма', color: '#22C55E' },
        ],
        current: total,
        unit: 'FDA-2',
      },
      related: [
        { id: 'grbas', title: 'GRBAS' },
        { id: 'vhi', title: 'VHI-30' },
      ],
      relatedCourses: [
        { id: '303.1', title: 'Неврология' },
        { id: '314.3', title: 'Оториноларингология' },
      ],
    };
  },
  reference: 'Enderby P, Palmer R. Frenchay Dysarthria Assessment - 2nd edition (FDA-2). Pro-Ed, 2008.',
  countries: 'Международный (UK / US)',
  presets: [
    { label: 'Норма', values: { reflex: 4, respiration: 4, lips: 4, jaw: 4, palate: 4, laryngeal: 4, tongue: 4, intell: 4 } },
    { label: 'Инсульт — умеренная', values: { reflex: 3, respiration: 3, lips: 2, jaw: 3, palate: 2, laryngeal: 2, tongue: 2, intell: 2 } },
    { label: 'БАС — тяжёлая', values: { reflex: 1, respiration: 1, lips: 1, jaw: 2, palate: 1, laryngeal: 1, tongue: 0, intell: 1 } },
  ],
  info: `### Для чего используется
**Frenchay Dysarthria Assessment (FDA-2, Enderby 2008)** — стандартизированная оценка дизартрии для диагностики, мониторинга и планирования логопедической терапии.

### Структура
8 доменов × 5 уровней (a-e, от нормы до крайне тяжёлых нарушений):
1. Рефлексы (кашель, глотание, слюнотечение)
2. Дыхание (покой + речь)
3. Губы
4. Челюсть
5. Мягкое нёбо
6. Гортань (фонация)
7. Язык
8. Разборчивость (слова / предложения / беседа)

### Интерпретация (суммарная 0-32)
| Баллы | Степень |
|---|---|
| 28-32 | Норма/лёгкая |
| 20-27 | Лёгкая |
| 12-19 | Умеренная |
| 0-11 | Тяжёлая |

### Применение
- Дифференциация типа дизартрии (по Mayo Classification)
- Мониторинг прогрессирующих заболеваний (БАС, Паркинсон, РС)
- Оценка эффекта логопедической терапии
- Планирование AAC при тяжёлых формах

### Типы дизартрии (Mayo)
- **Спастическая** — псевдобульбарный паралич (двусторонние инсульты)
- **Вялая** — бульбарный (БАС, поражения черепных нервов)
- **Атактическая** — мозжечковая (РС, ишемия мозжечка)
- **Гипокинетическая** — Паркинсон
- **Гиперкинетическая** — хорея, дистония
- **Смешанная** — БАС, ЧМТ

### Источник
Enderby P, Palmer R. FDA-2. Pro-Ed, 2008.`,
};

export default runner;
