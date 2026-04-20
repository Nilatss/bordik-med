// @ts-nocheck
/** Runner: colorado-pain */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'species',
      label: 'Вид',
      type: 'select',
      options: [
        { value: 'canine', label: 'Собака' },
        { value: 'feline', label: 'Кошка' },
      ],
    },
    {
      id: 'score',
      label: 'Оценка боли (0-4)',
      type: 'select',
      options: [
        { value: 0, label: '0 — Нет боли, спокоен, расслаблен' },
        { value: 1, label: '1 — Лёгкий дискомфорт, легко отвлекается' },
        { value: 2, label: '2 — Умеренная боль, напряжение мышц' },
        { value: 3, label: '3 — Сильная боль, защитная поза, плачет' },
        { value: 4, label: '4 — Очень сильная, агрессия / прострация' },
      ],
    },
    {
      id: 'tension',
      label: 'Напряжение тела при пальпации',
      type: 'select',
      options: [
        { value: 'min', label: 'Минимальное' },
        { value: 'mild', label: 'Лёгкое' },
        { value: 'mod', label: 'Умеренное' },
        { value: 'severe', label: 'Выраженное' },
      ],
    },
  ],
  compute: (v) => {
    const sp = String(v.species);
    const s = Number(v.score) || 0;
    const t = String(v.tension);

    let color = '#22C55E';
    let interp = 'Без боли — наблюдение';
    if (s >= 2) { color = '#F59E0B'; interp = 'Боль — показана анальгезия'; }
    if (s >= 3) { color = '#EF4444'; interp = 'Сильная боль — мультимодальная терапия'; }
    if (s >= 4) { color = '#991B1B'; interp = 'Критическая боль'; }

    const feline = sp === 'feline';

    return {
      value: `${s}`,
      unit: 'балл (0-4)',
      interpretation: `Colorado Pain ${s} / 4 — ${interp}`,
      color,
      details: `Colorado State University Acute Pain Scale для ${feline ? 'кошек' : 'собак'}. Тонус тела: ${t}. Порог вмешательства — ≥ 2.`,
      actions: [
        s >= 2 ? (feline ? 'Бупренорфин 0,02 мг/кг в/в/в/м/буккально каждые 6-8 ч' : 'Метадон 0,2 мг/кг в/в каждые 4 ч + карпрофен 4 мг/кг/сут') : 'Переоценка через 2-4 ч',
        s >= 3 ? (feline ? 'Добавить габапентин 10 мг/кг × 2-3/сут PO' : 'CRI кетамин 0,6 мг/кг/ч + лидокаин 25-50 мкг/кг/мин') : '',
        s >= 4 ? 'Срочная анестезиологическая консультация, пересмотр диагноза' : '',
        feline ? 'НЕ применять лидокаин CRI у кошек (токсичность)' : '',
        'Повторная оценка через 30-60 мин после введения анальгетика',
      ].filter(Boolean),
      caveats: [
        'Шкала визуально-поведенческая — требует тренированного наблюдателя',
        'Коты маскируют боль — оценка должна включать body tension пальпацию',
        'НЕ применять у седированных / анестезированных животных',
        'Различные версии для собак и кошек — не взаимозаменяемы',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Нет / лёгкая', color: '#22C55E' },
          { min: 2, max: 3, label: 'Умеренная', color: '#F59E0B' },
          { min: 3, max: 4, label: 'Сильная', color: '#EF4444' },
          { min: 4, max: 5, label: 'Критическая', color: '#991B1B' },
        ],
        current: s,
        unit: 'балл',
      },
      related: [
        { id: 'cmps-sf', title: 'CMPS-SF (Glasgow)' },
        { id: 'cbpi', title: 'CBPI (Brief Pain Inventory)' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'Hellyer PW, Uhrig SR, Robinson NG. Colorado State University Acute Pain Scale (canine/feline). 2006.',
  countries: 'США (CSU) · международный',
  presets: [
    { label: 'Собака — норма', values: { species: 'canine', score: 0, tension: 'min' } },
    { label: 'Кот — пост-оп', values: { species: 'feline', score: 3, tension: 'mod' } },
    { label: 'Собака — сильная', values: { species: 'canine', score: 4, tension: 'severe' } },
  ],
  info: `### Для чего используется
**Colorado State University Acute Pain Scale** — визуальная пиктографическая шкала оценки острой боли у **собак и кошек** в послеоперационном периоде и при травме.

### Шкала (0-4)
| Балл | Поведение | Тонус тела |
|---|---|---|
| 0 | Спокоен, контактен | Минимальный |
| 1 | Лёгкий дискомфорт, отвлекается | Лёгкий |
| 2 | **Умеренная боль**, напряжение | Умеренный |
| 3 | Сильная боль, защитная поза | Выраженный |
| 4 | Критическая, агрессия / прострация | Жёсткий |

### Порог вмешательства
**≥ 2 / 4** — анальгезия обязательна.

### Видоспецифичные особенности
**Кошки:**
- Маскируют боль — чаще молчат
- Бупренорфин буккально — препарат выбора
- Габапентин при хронической / невропатической
- НЕ лидокаин CRI (токсичность)

**Собаки:**
- Более выраженная мимика / вокализация
- Метадон / фентанил CRI / карпрофен
- Мультимодальная терапия при ≥ 3`,
};
export default runner;
