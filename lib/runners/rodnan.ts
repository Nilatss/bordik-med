// @ts-nocheck
/** Runner: rodnan — Modified Rodnan Skin Score (systemic sclerosis) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const areas: { id: string; label: string }[] = [
  { id: 'face', label: 'Лицо' },
  { id: 'chest', label: 'Грудь' },
  { id: 'abdomen', label: 'Живот' },
  { id: 'rua', label: 'Плечо (правое)' },
  { id: 'lua', label: 'Плечо (левое)' },
  { id: 'rfa', label: 'Предплечье (правое)' },
  { id: 'lfa', label: 'Предплечье (левое)' },
  { id: 'rhand', label: 'Кисть (правая)' },
  { id: 'lhand', label: 'Кисть (левая)' },
  { id: 'rfinger', label: 'Пальцы кисти (правые)' },
  { id: 'lfinger', label: 'Пальцы кисти (левые)' },
  { id: 'rthigh', label: 'Бедро (правое)' },
  { id: 'lthigh', label: 'Бедро (левое)' },
  { id: 'rleg', label: 'Голень (правая)' },
  { id: 'lleg', label: 'Голень (левая)' },
  { id: 'rfoot', label: 'Стопа (правая)' },
  { id: 'lfoot', label: 'Стопа (левая)' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: areas.map<ToolInput>((a) => ({
    id: a.id,
    label: a.label,
    type: 'select',
    options: [
      { value: 0, label: '0 — норма', points: 0 },
      { value: 1, label: '1 — лёгкое утолщение', points: 1 },
      { value: 2, label: '2 — умеренное утолщение', points: 2 },
      { value: 3, label: '3 — выраж. (кожа не собирается в складку)', points: 3 },
    ],
  })),
  compute: (v) => {
    const total = areas.reduce((acc, a) => acc + (Number(v[a.id]) || 0), 0);

    let band = '';
    let color = '#10B981';
    const actions: string[] = [];

    if (total <= 14) {
      band = 'Лёгкая/ограниченная форма';
      color = '#10B981';
      actions.push('Наблюдение, симптоматическая терапия (Raynaud, ГЭРБ, артралгии)');
      actions.push('Блокаторы Са-каналов (нифедипин 30-60 мг) при Raynaud');
      actions.push('ИПП постоянно (пантопразол 40 мг) при эзофагите');
    } else if (total <= 29) {
      band = 'Умеренная диффузная';
      color = '#F59E0B';
      actions.push('Метотрексат 15-25 мг/нед ИЛИ ММФ 2-3 г/сут');
      actions.push('ЭхоКГ + ДЛ + HRCT лёгких 1 р/6 мес (ILD скрининг)');
      actions.push('Капилляроскопия ногтевого ложа в динамике');
    } else if (total <= 40) {
      band = 'Тяжёлая диффузная';
      color = '#F97316';
      actions.push('ММФ 2-3 г/сут или циклофосфамид в/в 750 мг/м² × 6 мес');
      actions.push('Тоцилизумаб 162 мг п/к/нед (FDA 2021 для SSc-ILD)');
      actions.push('Ритуксимаб при прогрессии на ЦФ/ММФ');
      actions.push('Аутологичная ТГСК при rapidly-progressive + органной недост.');
    } else {
      band = 'Очень тяжёлая (mRSS > 40)';
      color = '#EF4444';
      actions.push('Консилиум в экспертном центре SSc');
      actions.push('Рассмотреть аутологичную трансплантацию гемопоэт. стволовых клеток');
      actions.push('Скрининг SRC (склеродермический почечный криз) — АД, креатинин еженедельно');
    }

    return {
      value: `${total}/51`,
      unit: 'mRSS',
      interpretation: `${band} · поражено зон: ${areas.filter((a) => Number(v[a.id]) > 0).length}/17`,
      color,
      details: `17 кожных зон × 0-3 балла = макс. 51.\n\nmRSS = ${total}.\n\nСвязь с прогнозом:\n- mRSS > 20 — рецидив. риск SRC\n- mRSS > 30 — сниж. 5-летней выживаемости (60-70 %)\n- Пик mRSS обычно через 2-4 года от начала; затем плато или ↓`,
      actions,
      caveats: [
        'mRSS субъективен — рекомендуется один и тот же оценщик в динамике',
        'Не отражает висцерального поражения (ILD, SRC, лёгочная гипертензия) — оценивать отдельно',
        'Ложно ↑ при сопутствующем ожирении, отёках',
        'Ложно ↓ при длит. течении болезни (атрофия кожи)',
        'Для диффузной формы mRSS — ключевой исход в РКИ',
      ],
      scale: {
        segments: [
          { min: 0, max: 15, label: 'Лёгкая', color: '#10B981' },
          { min: 15, max: 30, label: 'Умеренная', color: '#F59E0B' },
          { min: 30, max: 41, label: 'Тяжёлая', color: '#F97316' },
          { min: 41, max: 51, label: 'Оч. тяжёлая', color: '#EF4444' },
        ],
        current: total,
        unit: 'mRSS баллов',
      },
      related: [
        { id: 'acr-eular-ssc', title: 'ACR/EULAR SSc 2013' },
      ],
      relatedCourses: [
        { id: '301.8', title: 'Ревматология' },
      ],
    };
  },
  reference: 'Clements P et al. Modified Rodnan skin score. J Rheumatol 1995;22:1281-5.',
  countries: 'Международный',
  presets: [
    { label: 'Ограниченная форма', values: Object.fromEntries(areas.map((a) => [a.id, a.id.includes('finger') ? 1 : 0])) },
    {
      label: 'Умеренная диффузная',
      values: Object.fromEntries(areas.map((a) => [a.id, ['finger', 'hand', 'fa'].some((k) => a.id.includes(k)) ? 2 : 1])),
    },
    {
      label: 'Тяжёлая диффузная',
      values: Object.fromEntries(areas.map((a) => [a.id, 2])),
    },
  ],
  info: `### Для чего используется
**Modified Rodnan Skin Score (mRSS)** — количественная оценка плотности кожи при системной склеродермии. Первичный исход в РКИ по SSc.

### 17 зон × 0-3 балла (макс. 51)
- Лицо
- Грудь, живот
- Плечи, предплечья (L+R)
- Кисти, пальцы (L+R)
- Бедра, голени (L+R)
- Стопы (L+R)

### Шкала 0-3
| Балл | Описание |
|---|---|
| 0 | Норма |
| 1 | Лёгкое утолщение (пальпируется) |
| 2 | Умеренное (тяжело собрать в складку) |
| 3 | Выраженное (складка невозможна) |

### Связь с формой
| Форма SSc | mRSS |
|---|---|
| Лимитированная (кожа только лицо + дистальнее локтей/колен) | < 14 |
| Диффузная (проксим. конечности + туловище) | ≥ 15 |

### Прогноз
- mRSS > 20 — высокий риск склеродермического почечного криза (SRC)
- mRSS > 30 — сниженная 5-летняя выживаемость

### Источник
Clements P et al. J Rheumatol 1995;22:1281-5.`,
};

export default runner;
