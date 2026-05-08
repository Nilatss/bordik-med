/** Runner: uceis - Ulcerative Colitis Endoscopic Index of Severity */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'vascular',
      label: 'Сосудистый рисунок',
      type: 'select',
      options: [
        { value: 0, label: '0 — нормальный' },
        { value: 1, label: '1 — частично стёрт' },
        { value: 2, label: '2 — полностью отсутствует' },
      ],
    },
    {
      id: 'bleeding',
      label: 'Кровоточивость',
      type: 'select',
      options: [
        { value: 0, label: '0 — нет' },
        { value: 1, label: '1 — слизистая (пятна/следы на стенке)' },
        { value: 2, label: '2 — спонтанная люминальная (немного крови в просвете)' },
        { value: 3, label: '3 — спонтанная люминальная обильная (свежая кровь)' },
      ],
    },
    {
      id: 'erosions',
      label: 'Эрозии и язвы',
      type: 'select',
      options: [
        { value: 0, label: '0 — нет' },
        { value: 1, label: '1 — эрозии (<5 мм, поверхностные)' },
        { value: 2, label: '2 — поверхностные язвы (>5 мм, с фибрином)' },
        { value: 3, label: '3 — глубокие язвы (проникают в подслизистую)' },
      ],
    },
  ],
  compute: (v) => {
    const vasc = Number(v.vascular) || 0;
    const bleed = Number(v.bleeding) || 0;
    const eros = Number(v.erosions) || 0;
    const total = vasc + bleed + eros;

    let band = '', color = '#22C55E', details = '';
    if (total <= 1) { band = 'Ремиссия'; color = '#22C55E'; details = 'Эндоскопическая ремиссия (UCEIS 0-1).'; }
    else if (total <= 4) { band = 'Лёгкая активность'; color = '#84CC16'; details = 'Лёгкая эндоскопическая активность.'; }
    else if (total <= 6) { band = 'Умеренная активность'; color = '#F59E0B'; details = 'Умеренная активность — усиление терапии.'; }
    else { band = 'Тяжёлая активность'; color = '#EF4444'; details = 'Тяжёлая активность (UCEIS 7-8) — рассмотреть биологики / госпитализацию / колэктомию при токсическом мегаколоне.'; }

    return {
      value: String(total),
      unit: '/8',
      interpretation: band,
      color,
      details: `${details} Сосуды: ${vasc}/2, Кровоточивость: ${bleed}/3, Эрозии/язвы: ${eros}/3.`,
      actions: [
        total >= 7 ? 'Госпитализация; IV кортикостероиды (метилпреднизолон 60 мг/сут); исключить токсический мегаколон (КТ/обзорная)' : '',
        total >= 5 ? 'Эскалация: биологики (анти-TNF, ведолизумаб, устекинумаб) или малые молекулы (тофацитиниб, озанимод)' : '',
        total <= 4 ? 'Оптимизировать 5-ASA (мезалазин 4 г/сут PO + топ. 1 г) ± локальные кортикостероиды' : '',
        'Исключить CMV и C. difficile при рефрактерности (биопсия, PCR)',
        'Мониторинг: фекальный кальпротектин, CRP, гемоглобин, альбумин',
        'Цель терапии — mucosal healing (UCEIS ≤1 + гистологическая ремиссия)',
        'Скрининг колоректального рака: через 8 лет от дебюта, далее каждые 1-3 года',
      ].filter(Boolean),
      caveats: [
        'UCEIS (Travis 2012) — валидизированный индекс эндоскопической активности ЯК',
        'Оценивается наиболее поражённый сегмент',
        'Сумма 0-8 баллов; более воспроизводим, чем Mayo endoscopic subscore',
        'Ремиссия: UCEIS ≤1 или Mayo endoscopic ≤1',
        'Не отражает распространённость (E1/E2/E3 по Montreal) — документировать отдельно',
        'Не заменяет гистологию (Riley, Nancy, Geboes) — для глубокой ремиссии нужна и гистологическая оценка',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Ремиссия', color: '#22C55E' },
          { min: 2, max: 4, label: 'Лёгкая', color: '#84CC16' },
          { min: 5, max: 6, label: 'Умер.', color: '#F59E0B' },
          { min: 7, max: 8, label: 'Тяжёлая', color: '#EF4444' },
        ],
        current: total,
        unit: 'UCEIS',
      },
      related: [
        { id: 'mayo-uc', title: 'Mayo Score UC' },
        { id: 'ses-cd', title: 'SES-CD' },
      ],
      relatedCourses: [
        { id: '301.3', title: 'Гастроэнтерология' },
      ],
    };
  },
  reference: 'Travis SP, Schnell D, Krzeski P, et al. Developing an instrument to assess the endoscopic severity of ulcerative colitis: the UCEIS. Gut. 2012;61(4):535-542.',
  countries: 'Международный (ECCO)',
  presets: [
    { label: 'Ремиссия', values: { vascular: 0, bleeding: 0, erosions: 0 } },
    { label: 'Умеренная активность', values: { vascular: 2, bleeding: 2, erosions: 2 } },
    { label: 'Тяжёлый ЯК', values: { vascular: 2, bleeding: 3, erosions: 3 } },
  ],
  info: `### Для чего используется
**UCEIS (Ulcerative Colitis Endoscopic Index of Severity, Travis 2012)** — валидизированная эндоскопическая шкала активности язвенного колита.

### Структура (3 дескриптора)
| Дескриптор | Диапазон |
|---|---|
| Сосудистый рисунок | 0-2 |
| Кровоточивость | 0-3 |
| Эрозии и язвы | 0-3 |

**Итог: 0-8 баллов.**

### Интерпретация
| UCEIS | Активность |
|---|---|
| 0-1 | Ремиссия |
| 2-4 | Лёгкая |
| 5-6 | Умеренная |
| 7-8 | Тяжёлая |

### Оценка
- Смотрится **наиболее поражённый сегмент**
- Оценка согласована с клинической тяжестью и исходами
- Межэкспертная κ ~ 0.9 (выше, чем Mayo)

### Mucosal healing
Цель современной терапии:
- UCEIS ≤1 или Mayo endoscopic ≤1
- + гистологическая ремиссия (Nancy ≤1, Geboes ≤3)

### Применение
- Оценка активности при ЭГДС/колоноскопии
- Мониторинг ответа на терапию
- Клинические испытания (EMA/FDA endpoint)
- Решение об эскалации / колэктомии

### Важно документировать отдельно
- **Распространённость (Montreal):** E1 (проктит) / E2 (левосторонний) / E3 (распространённый)
- **Гистология:** Riley / Nancy / Geboes

### Ступени терапии (ECCO 2022)
1. 5-ASA PO+топ (лёгкая)
2. Кортикостероиды системные (умеренная/тяжёлая)
3. Биологики / JAK-i / S1P-модуляторы (рефрактерная)
4. Колэктомия (токсический мегаколон, рефрактерность)

### Источник
Travis SP et al. Gut 2012;61:535.`,
};

export default runner;
