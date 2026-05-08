/** Runner: birads */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'category',
      label: 'BI-RADS категория',
      type: 'select',
      options: [
        { value: '0', label: '0 — неполное исследование (нужна доп. визуализация)' },
        { value: '1', label: '1 — негативное' },
        { value: '2', label: '2 — доброкачественное находка' },
        { value: '3', label: '3 — вероятно доброкачественное (< 2% риск)' },
        { value: '4a', label: '4A — низкое подозрение (> 2-10%)' },
        { value: '4b', label: '4B — умеренное подозрение (> 10-50%)' },
        { value: '4c', label: '4C — высокое подозрение (> 50-95%)' },
        { value: '5', label: '5 — высокая вероятность злокачественности (≥ 95%)' },
        { value: '6', label: '6 — биопсийно подтверждённая малигнизация' },
      ],
    },
    {
      id: 'modality',
      label: 'Модальность',
      type: 'select',
      options: [
        { value: 'mg', label: 'Маммография' },
        { value: 'us', label: 'УЗИ' },
        { value: 'mri', label: 'МРТ' },
      ],
    },
  ],
  compute: (v) => {
    const cat = String(v.category);
    const mod = String(v.modality);

    const map: Record<string, { color: string; risk: string; action: string; num: number }> = {
      '0': { color: '#94A3B8', risk: 'Неполное', action: 'Дополнительная визуализация (компрессия, УЗИ, МРТ), сравнение с предыдущими', num: 0 },
      '1': { color: '#22C55E', risk: '0% (норма)', action: 'Рутинный скрининг (обычно каждые 1-2 года по возрасту)', num: 1 },
      '2': { color: '#22C55E', risk: '0% (доброкачественное)', action: 'Рутинный скрининг — кальцинаты, кисты, фиброаденомы и т.п.', num: 2 },
      '3': { color: '#84CC16', risk: '< 2%', action: 'Краткосрочный контроль через 6 мес (далее каждые 6-12 мес × 2 года)', num: 3 },
      '4a': { color: '#F59E0B', risk: '> 2-10%', action: 'Биопсия (core-biopsy под УЗИ / стереотаксическая)', num: 4 },
      '4b': { color: '#EF4444', risk: '> 10-50%', action: 'Биопсия обязательна', num: 5 },
      '4c': { color: '#DC2626', risk: '> 50-95%', action: 'Биопсия обязательна, высокая подозрительность', num: 6 },
      '5': { color: '#7F1D1D', risk: '≥ 95%', action: 'Биопсия + одновременное планирование лечения (консультация онколога)', num: 7 },
      '6': { color: '#450A0A', risk: 'Подтверждённая малигнизация', action: 'Стадирование (МРТ, УЗИ лимфоузлов, КТ), мультидисциплинарный консилиум', num: 8 },
    };

    const entry = (map[cat] || map['0'])!;

    return {
      value: `BI-RADS ${cat.toUpperCase()}`,
      unit: mod,
      interpretation: `BI-RADS ${cat.toUpperCase()} — риск малигнизации: ${entry.risk}`,
      color: entry.color,
      details: `Категория ${cat.toUpperCase()}. Рекомендация: ${entry.action}.`,
      actions: [
        entry.action,
        cat === '3' ? 'При невозможности 6-мес контроля — биопсия' : '',
        cat.startsWith('4') || cat === '5' ? 'Обсудить с пациенткой / мультидисциплинарный консилиум' : '',
        cat === '0' ? 'Сравнение со старыми снимками снижает необходимость дополнительного обследования' : '',
        'Документировать плотность груди (ACR a-d) при маммографии',
      ].filter(Boolean),
      caveats: [
        'ACR BI-RADS 5th edition (2013) — стандарт для маммографии, УЗИ, МРТ',
        'Категория 3 допустима только после ПОЛНОГО обследования, не как default при неопределённости',
        'PPV3 (positive predictive value for biopsy) — валидация категорий 4-5',
        'Плотность молочной железы ACR a-d (a=жировая, d=крайне плотная)',
        'BI-RADS не отменяет клиническую оценку — при подозрительной пальпируемой опухоли биопсия обязательна',
      ],
      scale: {
        segments: [
          { min: 0, max: 3, label: '0-2 норма', color: '#22C55E' },
          { min: 3, max: 4, label: '3', color: '#84CC16' },
          { min: 4, max: 5, label: '4A', color: '#F59E0B' },
          { min: 5, max: 7, label: '4B-4C', color: '#EF4444' },
          { min: 7, max: 9, label: '5-6', color: '#7F1D1D' },
        ],
        current: entry.num,
        unit: 'BI-RADS',
      },
      related: [
        { id: 'tirads', title: 'TI-RADS' },
        { id: 'lirads', title: 'LI-RADS' },
        { id: 'pirads', title: 'PI-RADS' },
      ],
      relatedCourses: [
        { id: '311.1', title: 'Лучевая диагностика' },
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'American College of Radiology. ACR BI-RADS Atlas, 5th Edition. Reston, VA: ACR; 2013.',
  countries: 'Международный (ACR)',
  presets: [
    { label: 'BI-RADS 2 (MG)', values: { category: '2', modality: 'mg' } },
    { label: 'BI-RADS 3 (US)', values: { category: '3', modality: 'us' } },
    { label: 'BI-RADS 5 (MG)', values: { category: '5', modality: 'mg' } },
  ],
  info: `### Для чего используется
**ACR BI-RADS (Breast Imaging Reporting and Data System), 5th edition (2013)** — стандартизированная система отчётности и категоризации находок в маммографии, УЗИ и МРТ молочной железы.

### Категории
| Кат. | Риск малигнизации | Тактика |
|---|---|---|
| **0** | Неполное | Доп. визуализация |
| **1** | 0% (норма) | Рутинный скрининг |
| **2** | 0% (доброкачественное) | Рутинный скрининг |
| **3** | < 2% | Контроль через 6 мес × 2 года |
| **4A** | > 2-10% | Биопсия |
| **4B** | > 10-50% | Биопсия |
| **4C** | > 50-95% | Биопсия |
| **5** | ≥ 95% | Биопсия + планирование лечения |
| **6** | Подтверждённая | Стадирование и лечение |

### Дескрипторы (маммография)
- **Масса**: форма (oval/round/irregular), границы (circumscribed/obscured/microlobulated/indistinct/spiculated), плотность
- **Кальцинаты**: типичные доброкачественные, подозрительные (аморфные, грубые гетерогенные, тонкие плеоморфные, тонкие линейные ветвящиеся), распределение
- **Асимметрия**: простая / фокальная / global / developing
- **Архитектурное искажение** (spiculations без очевидной массы)

### Плотность груди (ACR a-d)
| Класс | Описание |
|---|---|
| **a** | Практически полностью жировая |
| **b** | Рассеянные фиброгландулярные элементы |
| **c** | Гетерогенно плотная (может скрывать опухоли) |
| **d** | Крайне плотная (снижает чувствительность MG) |

### BI-RADS для УЗИ
- Дополнительно: echo pattern (анэхогенный/гипо/изо/гипер), задние акустические эффекты, васкуляризация
- Для подозрительных находок — обязательная корреляция с MG

### BI-RADS для МРТ
- Усиление: foci / mass / non-mass enhancement (NME)
- Кинетические кривые: I (persistent), II (plateau), III (washout)
- Особенно важна для скрининга high-risk (BRCA1/2), оценки распространения

### Применение
- Стандартизация языка радиологов
- Основа для решения о наблюдении vs. биопсии
- Аудит: PPV1, PPV2, PPV3 — performance benchmarks

### Ограничения
- Категория 3 часто переиспользуется (допустима только после полной оценки)
- Субъективность в 4A vs 4B
- Не учитывает клинические факторы (возраст, BRCA)`,
};
export default runner;
