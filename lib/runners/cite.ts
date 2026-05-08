/** Runner: cite */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'species',
      label: 'Вид животного',
      type: 'select',
      options: [
        { value: 'horse', label: 'Лошадь' },
        { value: 'ruminant', label: 'Жвачные (КРС, овцы, козы)' },
        { value: 'small', label: 'Мелкие животные (собака/кот)' },
      ],
    },
    { id: 'epg', label: 'EPG (яиц на грамм)', type: 'number', min: 0, max: 5000, step: 10, hint: 'McMaster / mini-FLOTAC метод' },
    {
      id: 'class',
      label: 'Класс животного (возраст)',
      type: 'select',
      options: [
        { value: 'adult', label: 'Взрослое' },
        { value: 'young', label: 'Молодняк (< 3 лет — активный выделитель)' },
      ],
    },
  ],
  compute: (v) => {
    const sp = String(v.species);
    const epg = Number(v.epg) || 0;
    const cls = String(v.class);

    const thresholds: Record<string, { low: number; mod: number; high: number }> = {
      horse:    { low: 200,  mod: 500,  high: 1000 },
      ruminant: { low: 150,  mod: 500,  high: 1000 },
      small:    { low: 50,   mod: 200,  high: 500 },
    };
    const t = (thresholds[sp] || thresholds.horse)!;

    let color = '#22C55E';
    let cat = 'Низкий выделитель';
    let action = 'Не дегельминтизировать (лошади: только при EPG > порога)';

    if (epg > t.low)  { color = '#F59E0B'; cat = 'Умеренный выделитель'; action = 'Селективная дегельминтизация рекомендуется'; }
    if (epg > t.mod)  { color = '#EF4444'; cat = 'Высокий выделитель';  action = 'Немедленная дегельминтизация'; }
    if (epg > t.high) { color = '#991B1B'; cat = 'Очень высокий';       action = 'Срочная дегельминтизация + повтор через 14 дней'; }

    const dewormer =
      sp === 'horse'    ? 'Ивермектин 0,2 мг/кг PO или моксидектин 0,4 мг/кг (при цятостомах)' :
      sp === 'ruminant' ? 'Альбендазол 10 мг/кг PO, моксидектин 0,2 мг/кг п/к, левамизол 7,5 мг/кг' :
                          'Празиквантел + пирантел (Дронтал), селамектин, мильбемицин';

    return {
      value: `${epg} EPG`,
      unit: cat,
      interpretation: `EPG ${epg} — ${cat}`,
      color,
      details: `Вид: ${sp} · возраст: ${cls === 'young' ? 'молодняк' : 'взрослый'}\nПороги ${sp}: низкий ${t.low} · умеренный ${t.mod} · высокий ${t.high} EPG\n\nРекомендация: ${action}\n\nАнтигельминтик: ${dewormer}`,
      actions: [
        epg > t.low ? `Дегельминтизация: ${dewormer}` : 'Без лечения — повтор копрологии через 8-12 нед',
        epg > t.mod ? 'FECRT (fecal egg count reduction test) через 14 дней для контроля резистентности' : '',
        cls === 'young' ? 'Молодняк — приоритет (выделяют > 80 % популяции яиц)' : '',
        'Ротация пастбищ, уборка навоза 2×/нед',
        'НЕ применять «календарную» дегельминтизацию — селективная стратегия',
      ].filter(Boolean),
      caveats: [
        'CITE / McMaster — чувствительность 50 EPG (стандарт), mini-FLOTAC — 5 EPG',
        'EPG не всегда коррелирует с нагрузкой (ингибированные личинки Ostertagia)',
        'У лошадей: 80 % животных выделяют 20 % яиц — таргетная стратегия',
        'Резистентность паразитов к бензимидазолам и макроциклическим лактонам растёт — FECRT обязателен',
        'Ленточные черви (Anoplocephala) и аскариды (Parascaris) не всегда видны McMaster — нужен центрифугирование',
      ],
      scale: {
        segments: [
          { min: 0, max: t.low,  label: 'Низкий',     color: '#22C55E' },
          { min: t.low, max: t.mod,  label: 'Умеренный',  color: '#F59E0B' },
          { min: t.mod, max: t.high, label: 'Высокий',    color: '#EF4444' },
          { min: t.high, max: 5001,  label: 'Оч. высокий', color: '#991B1B' },
        ],
        current: epg,
        unit: 'EPG',
      },
      related: [
        { id: 'plumbs', title: 'Plumb\'s drug handbook' },
        { id: 'merck-vet', title: 'Merck Vet Manual' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'Cornell University College of Veterinary Medicine. CITE — Fecal Egg Count. · AAEP Parasite Control Guidelines 2019.',
  countries: 'США (Cornell / AAEP) · международный',
  presets: [
    { label: 'Лошадь 150 EPG', values: { species: 'horse', epg: 150, class: 'adult' } },
    { label: 'КРС 600 EPG', values: { species: 'ruminant', epg: 600, class: 'young' } },
    { label: 'Кот 250 EPG', values: { species: 'small', epg: 250, class: 'young' } },
  ],
  info: `### Для чего используется
**CITE (Cornell / McMaster) Fecal Egg Count** — стандартная копроскопическая методика количественной оценки паразитарной нагрузки у лошадей, жвачных и мелких животных. EPG (eggs per gram) — основа селективной дегельминтизации.

### Пороги EPG
| Вид | Низкий | Умеренный | Высокий |
|---|---|---|---|
| Лошадь | < 200 | 200-500 | > 500 |
| КРС / овцы | < 150 | 150-500 | > 500 |
| Собака / кот | < 50 | 50-200 | > 200 |

### Таргетная стратегия (AAEP 2019)
- 80 % яиц выделяют 20 % животных
- Дегельминтизация только high shedders
- Снижает скорость развития резистентности

### Антигельминтики
| Вид | Препараты 1-й линии |
|---|---|
| Лошадь | Ивермектин, моксидектин, празиквантел |
| КРС | Моксидектин, левамизол, альбендазол |
| Собака/кот | Пирантел, празиквантел, мильбемицин |

### FECRT (контроль резистентности)
- Повтор EPG через 14 дней
- Редукция < 90-95 % → резистентность
- Меняйте класс антигельминтика

### Ограничения
- Не видит ингибированные личинки
- Не все паразиты выделяют яйца постоянно (копроскопия × 3 при подозрении)
- Ленточные — нужен специальный метод

### Источник
Cornell CITE · AAEP Parasite Control Guidelines 2019 · WAAVP Methods.`,
};
export default runner;
