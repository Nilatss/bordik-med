// @ts-nocheck
/** Runner: cmps-sf */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'vocalisation',
      label: 'Вокализация (покой)',
      type: 'select',
      options: [
        { value: 0, label: 'Молчит / спит' },
        { value: 1, label: 'Поскуливает / хнычет' },
        { value: 2, label: 'Стонет' },
        { value: 3, label: 'Кричит / воет' },
      ],
    },
    {
      id: 'attention',
      label: 'Внимание к ране / животу',
      type: 'select',
      options: [
        { value: 0, label: 'Игнорирует' },
        { value: 1, label: 'Смотрит на рану' },
        { value: 2, label: 'Лижет / трёт рану' },
        { value: 3, label: 'Кусает / сильно растирает' },
      ],
    },
    {
      id: 'mobility',
      label: 'Подвижность (встать и пройти)',
      type: 'select',
      options: [
        { value: 0, label: 'Идёт нормально' },
        { value: 1, label: 'Хромает' },
        { value: 2, label: 'Идёт медленно, неохотно' },
        { value: 3, label: 'Отказывается идти' },
        { value: 4, label: 'Не может встать' },
      ],
    },
    {
      id: 'response',
      label: 'Реакция на пальпацию раны',
      type: 'select',
      options: [
        { value: 0, label: 'Без реакции' },
        { value: 1, label: 'Смотрит / оборачивается' },
        { value: 2, label: 'Отстраняется' },
        { value: 3, label: 'Рычит / защищает область' },
        { value: 4, label: 'Кусается / агрессия' },
        { value: 5, label: 'Плачет / вокализирует' },
      ],
    },
    {
      id: 'demeanour',
      label: 'Общий настрой / поведение',
      type: 'select',
      options: [
        { value: 0, label: 'Доволен, контактен' },
        { value: 1, label: 'Равнодушен / тих' },
        { value: 2, label: 'Угнетён / тревожен' },
        { value: 3, label: 'Подавлен, не реагирует' },
        { value: 4, label: 'Агрессивен / напуган' },
      ],
    },
    {
      id: 'posture',
      label: 'Поза / активность',
      type: 'select',
      options: [
        { value: 0, label: 'Норма, комфортно' },
        { value: 1, label: 'Беспокоен / меняет позу' },
        { value: 2, label: 'Сгорблен / напряжён' },
        { value: 3, label: 'Жёсткая / защитная поза' },
        { value: 4, label: 'Лежит без движения' },
      ],
    },
  ],
  compute: (v) => {
    const a = Number(v.vocalisation) || 0;
    const b = Number(v.attention) || 0;
    const c = Number(v.mobility) || 0;
    const d = Number(v.response) || 0;
    const e = Number(v.demeanour) || 0;
    const f = Number(v.posture) || 0;
    const total = a + b + c + d + e + f;

    let color = '#22C55E';
    let interp = 'Лёгкая / нет боли — наблюдение';
    if (total >= 6) { color = '#F59E0B'; interp = 'Требуется анальгезия'; }
    if (total >= 12) { color = '#EF4444'; interp = 'Сильная боль — мультимодальная терапия'; }
    if (total >= 18) { color = '#991B1B'; interp = 'Критическая боль — срочное вмешательство'; }

    return {
      value: `${total}`,
      unit: 'балл (0-24)',
      interpretation: `CMPS-SF ${total} / 24 — ${interp}`,
      color,
      details: `Glasgow Composite Measure Pain Scale — Short Form. Общая сумма ${total} / 24. Порог вмешательства — ≥ 6 баллов.`,
      actions: [
        total >= 6 ? 'Начать / усилить анальгезию (опиоид + НПВС, мультимодально)' : 'Переоценить через 2-4 ч',
        total >= 6 ? 'Рассмотреть метадон 0,1-0,5 мг/кг в/в или бупренорфин 0,01-0,03 мг/кг' : '',
        total >= 12 ? 'CRI кетамин 0,6 мг/кг/ч + лидокаин 25-50 мкг/кг/мин (собаки, НЕ коты)' : '',
        total >= 18 ? 'Консультация анестезиолога, пересмотр диагноза (осложнение?)' : '',
        'Повторная оценка через 30 мин после анальгезии',
      ].filter(Boolean),
      caveats: [
        'Валидирована только для собак после острой боли (пост-оп, травма)',
        'НЕ применять при невозможности двигательной оценки (парез, седация)',
        'Оценивается одним наблюдателем, идеально — тот же ветеринарный специалист',
        'Порог ≥ 6 из 24 (если подвижность не оценивалась — ≥ 5 из 20)',
      ],
      scale: {
        segments: [
          { min: 0, max: 6, label: 'Нет / лёгкая', color: '#22C55E' },
          { min: 6, max: 12, label: 'Умеренная', color: '#F59E0B' },
          { min: 12, max: 18, label: 'Сильная', color: '#EF4444' },
          { min: 18, max: 24, label: 'Критическая', color: '#991B1B' },
        ],
        current: total,
        unit: 'балл',
      },
      related: [
        { id: 'colorado-pain', title: 'Colorado Pain Scale' },
        { id: 'cbpi', title: 'CBPI (Brief Pain Inventory)' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'Reid J, Nolan AM, Hughes JM, et al. Development of the short-form CMPS (CMPS-SF). Anim Welf 2007;16:97-104.',
  countries: 'Международный (WSAVA · Glasgow)',
  presets: [
    { label: 'Без боли', values: { vocalisation: 0, attention: 0, mobility: 0, response: 0, demeanour: 0, posture: 0 } },
    { label: 'Умеренная', values: { vocalisation: 1, attention: 2, mobility: 2, response: 2, demeanour: 1, posture: 2 } },
    { label: 'Сильная пост-оп', values: { vocalisation: 2, attention: 3, mobility: 3, response: 4, demeanour: 3, posture: 3 } },
  ],
  info: `### Для чего используется
**Glasgow Composite Measure Pain Scale — Short Form (CMPS-SF)** — золотой стандарт оценки острой (послеоперационной) боли у собак. Разработан в Университете Глазго, валидирован международно.

### Структура (макс 24)
6 поведенческих доменов, каждый оценивается наблюдателем:
1. Вокализация (0-3)
2. Внимание к ране (0-3)
3. Подвижность (0-4) — опускается, если невозможно оценить → макс 20
4. Реакция на пальпацию (0-5)
5. Общее поведение (0-4)
6. Поза / активность (0-4)

### Порог вмешательства
| Сумма | Действие |
|---|---|
| 0-5 | Боль контролируется / отсутствует |
| **≥ 6 / 24** (или ≥ 5 / 20) | Анальгезия обязательна |

### Ограничения
- Только для **собак**
- Только **острая** боль (послеоперационная, травма)
- НЕ для хронической (ОА) — для этого CBPI / HCPI
- Седация и парез → недостоверная оценка

### Источник
Reid et al. 2007; обновление 2017 (валидация для клиник).`,
};
export default runner;
