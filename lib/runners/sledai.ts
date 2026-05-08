/** Runner: sledai — SLEDAI-2K Disease Activity Index */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const items: { id: string; label: string; pts: number }[] = [
  { id: 'seizure', label: 'Судорожные припадки (новые)', pts: 8 },
  { id: 'psychosis', label: 'Психоз', pts: 8 },
  { id: 'obs', label: 'Органический мозговой синдром', pts: 8 },
  { id: 'visual', label: 'Нарушение зрения (SLE)', pts: 8 },
  { id: 'cranial', label: 'Поражение черепных нервов', pts: 8 },
  { id: 'headache', label: 'Волчаночная головная боль', pts: 8 },
  { id: 'cva', label: 'Острое нарушение мозгового кровообращения', pts: 8 },
  { id: 'vasculitis', label: 'Васкулит', pts: 8 },
  { id: 'arthritis', label: 'Артрит (≥ 2 суставов)', pts: 4 },
  { id: 'myositis', label: 'Миозит', pts: 4 },
  { id: 'cylinders', label: 'Цилиндры в моче', pts: 4 },
  { id: 'hematuria', label: 'Гематурия (> 5 эр/п.зр)', pts: 4 },
  { id: 'proteinuria', label: 'Протеинурия (> 0,5 г/сут)', pts: 4 },
  { id: 'pyuria', label: 'Пиурия (> 5 лейк/п.зр без инфекции)', pts: 4 },
  { id: 'rash', label: 'Воспалительная сыпь', pts: 2 },
  { id: 'alopecia', label: 'Алопеция', pts: 2 },
  { id: 'ulcers', label: 'Язвы слизистых', pts: 2 },
  { id: 'pleurisy', label: 'Плеврит', pts: 2 },
  { id: 'pericarditis', label: 'Перикардит', pts: 2 },
  { id: 'lowc', label: 'Снижение комплемента (C3/C4)', pts: 2 },
  { id: 'dsdna', label: '↑ анти-дсДНК', pts: 2 },
  { id: 'fever', label: 'Лихорадка > 38° (SLE)', pts: 1 },
  { id: 'thrombo', label: 'Тромбоцитопения (< 100)', pts: 1 },
  { id: 'leuko', label: 'Лейкопения (< 3)', pts: 1 },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: items.map<ToolInput>((it) => ({
    id: it.id,
    label: `${it.label} (${it.pts} б.)`,
    type: 'checkbox',
    points: it.pts,
  })),
  compute: (v) => {
    let total = 0;
    const active: string[] = [];
    items.forEach((it) => {
      if (v[it.id]) { total += it.pts; active.push(`${it.label} (${it.pts})`); }
    });

    let band = '';
    let color = '#10B981';
    const actions: string[] = [];

    if (total === 0) {
      band = 'Неактивная СКВ';
      color = '#10B981';
      actions.push('Поддерживающая терапия (ГХК 5 мг/кг/сут)');
      actions.push('Контроль через 3-6 мес');
    } else if (total <= 4) {
      band = 'Минимальная активность';
      color = '#10B981';
      actions.push('ГХК ± низкие дозы ГКС (≤ 7,5 мг преднизолона)');
      actions.push('Контроль через 3 мес');
    } else if (total <= 10) {
      band = 'Умеренная активность';
      color = '#F59E0B';
      actions.push('ГКС 0,25-0,5 мг/кг/сут + ГХК + ММФ / АЗА / МТХ');
      actions.push('Оценка повреждения органов (SLICC/ACR)');
    } else if (total <= 19) {
      band = 'Высокая активность';
      color = '#F97316';
      actions.push('ГКС 0,5-1 мг/кг/сут ± пульс-терапия метилпреднизолоном');
      actions.push('Иммуносупрессор: ММФ 2-3 г/сут или ЦФ по протоколу EuroLupus');
      actions.push('Биология: белимумаб / анифролумаб');
    } else {
      band = 'Очень высокая активность (обострение)';
      color = '#EF4444';
      actions.push('Пульс-терапия МП 500-1000 мг × 3 дня + ГКС 1 мг/кг');
      actions.push('ЦФ внутривенно / ритуксимаб при резистентности');
      actions.push('Госпитализация для индукционной терапии');
      actions.push('Плазмаферез при катастроф. АФС / TTP-like');
    }

    return {
      value: `${total}`,
      unit: 'SLEDAI-2K',
      interpretation: `${band} · активных доменов: ${active.length}/24`,
      color,
      details: active.length
        ? `Активные проявления:\n${active.map((x) => `- ${x}`).join('\n')}`
        : 'Все 24 домена неактивны.',
      actions,
      caveats: [
        'SLEDAI-2K оценивает активность только за последние 10 дней',
        'Не отражает повреждение органов — для этого используйте SLICC/ACR DAI',
        'BILAG-2004 чувствительнее к изменениям в конкретных системах (A-E по органам)',
        '↑ анти-дсДНК + ↓ C3/C4 — предикторы обострения даже без клиники',
        'Инфекция может имитировать обострение — всегда искать инфекцию при лихорадке + ГКС',
      ],
      scale: {
        segments: [
          { min: 0, max: 5, label: 'Нет/мин.', color: '#10B981' },
          { min: 5, max: 11, label: 'Умеренная', color: '#F59E0B' },
          { min: 11, max: 20, label: 'Высокая', color: '#F97316' },
          { min: 20, max: 105, label: 'Оч. высокая', color: '#EF4444' },
        ],
        current: Math.min(total, 105),
        unit: 'баллов',
      },
      related: [
        { id: 'slicc', title: 'SLICC' },
        { id: 'bilag', title: 'BILAG' },
      ],
      relatedCourses: [
        { id: '301.8', title: 'Ревматология' },
      ],
    };
  },
  reference: 'Gladman DD, Ibañez D, Urowitz MB. SLEDAI-2K. J Rheumatol 2002;29:288-91.',
  countries: 'Международный',
  presets: [
    { label: 'Неактивная', values: Object.fromEntries(items.map((i) => [i.id, false])) },
    {
      label: 'Лёгкое обострение',
      values: { ...Object.fromEntries(items.map((i) => [i.id, false])), arthritis: true, rash: true, alopecia: true },
    },
    {
      label: 'Тяжёлое обострение',
      values: { ...Object.fromEntries(items.map((i) => [i.id, false])), proteinuria: true, hematuria: true, cylinders: true, lowc: true, dsdna: true, arthritis: true, rash: true },
    },
  ],
  info: `### Для чего используется
**SLEDAI-2K** — оценка активности СКВ за последние 10 дней. Сумма 0-105.

### Интерпретация
| Балл | Активность |
|---|---|
| 0 | Неактивная |
| 1-4 | Минимальная |
| 5-10 | Умеренная |
| 11-19 | Высокая |
| ≥ 20 | Обострение |

### Отличие от SLEDAI оригинал
SLEDAI-2K допускает учёт **персистирующих** проявлений сыпи, язв, алопеции (не только новых) — более чувствителен.

### Индукционная терапия СКВ-нефрита
- **Класс III/IV:** ММФ 2-3 г/сут × 6 мес ИЛИ ЦФ EuroLupus 500 мг в/в × 6 инф. + ГКС
- **Класс V (мембранозный):** ММФ или циклоспорин + ГКС
- Поддержка: ММФ 1-2 г/сут или АЗА 2 мг/кг

### Источник
Gladman DD et al. J Rheumatol 2002;29:288-91.`,
};

export default runner;
