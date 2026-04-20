// @ts-nocheck
/** Runner: abcde - ABCDE melanoma screening criteria */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'a', label: 'A — Asymmetry (асимметрия половин)', type: 'checkbox' },
    { id: 'b', label: 'B — Border (неровный / зазубренный край)', type: 'checkbox' },
    { id: 'c', label: 'C — Color (≥ 2 цвета в одном очаге)', type: 'checkbox' },
    { id: 'd', label: 'D — Diameter (> 6 мм)', type: 'checkbox' },
    { id: 'e', label: 'E — Evolution (изменение формы/цвета/размера за недели-месяцы)', type: 'checkbox' },
    { id: 'uglyDuckling', label: '"Гадкий утёнок" (не похож на другие невусы пациента)', type: 'checkbox' },
  ],
  compute: (v) => {
    let score = 0;
    if (v.a) score++;
    if (v.b) score++;
    if (v.c) score++;
    if (v.d) score++;
    if (v.e) score++;
    const uglyDuckling = !!v.uglyDuckling;

    let color = '#22C55E', band = 'Низкий риск', recommendation = '';
    if (score >= 3 || (score >= 1 && uglyDuckling) || v.e) {
      color = '#EF4444'; band = 'Высокий риск — биопсия';
      recommendation = 'Эксцизионная биопсия с краем 1-3 мм. Срочно (≤ 2 нед).';
    } else if (score >= 2) {
      color = '#F59E0B'; band = 'Подозрительный';
      recommendation = 'Дерматоскопия + повторная оценка ч/з 3 мес или эксцизионная биопсия.';
    } else if (score === 1) {
      color = '#84CC16'; band = 'Минимальное беспокойство';
      recommendation = 'Мониторинг 3-6 мес, дерматоскопия, фото-документация.';
    } else {
      recommendation = 'Рутинный осмотр 1×/год, обучение самообследованию.';
    }

    return {
      value: `${score}/5`,
      unit: uglyDuckling ? '+ ugly duckling' : '',
      interpretation: band,
      color,
      details: recommendation,
      actions: [
        score >= 2 || v.e ? 'Дерматоскопия опытным специалистом (7-point, Menzies, ABCD-dermatoscopy)' : '',
        score >= 3 || v.e || uglyDuckling ? 'Эксцизионная биопсия с краем 1-3 мм до подкожного жира' : '',
        score >= 3 ? 'НЕ делать shave/incisional биопсию подозрительных — может занизить Breslow' : '',
        'Осмотр всего тела + лимфоузлов + слизистых (включая ногти, ладони, подошвы)',
        'Фото-документация множественных невусов для мониторинга',
        'Фотопротекция SPF 50+, избегать соляриев',
        'Семейный анамнез (CDKN2A), > 50 невусов — консультация генетика',
      ].filter(Boolean),
      caveats: [
        'ABCDE — скрининг, НЕ диагностический: чувствительность ~ 60-90%, специфичность варьирует',
        'Меланома может быть < 6 мм (особенно nodular, amelanotic)',
        'Nodular меланома не подходит под ABCDE — используйте EFG (Elevated, Firm, Growing > 1 мес)',
        'Акральная / subungual / слизистая меланома требует отдельной настороженности (S-тип, ABCDEF для ногтей)',
        '"Ugly duckling" sign имеет независимую диагностическую ценность',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Низкий', color: '#22C55E' },
          { min: 1, max: 2, label: 'Мин.', color: '#84CC16' },
          { min: 2, max: 3, label: 'Подозр.', color: '#F59E0B' },
          { min: 3, max: 6, label: 'Биопсия', color: '#EF4444' },
        ],
        current: score,
        unit: 'ABCDE',
      },
      related: [{ id: 'breslow', title: 'Breslow' }, { id: 'fitzpatrick', title: 'Fitzpatrick' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Friedman RJ, Rigel DS, Kopf AW. Early detection of malignant melanoma: the role of physician examination and self-examination of the skin. CA Cancer J Clin 1985;35:130-151. Abbasi NR et al. JAMA 2004 (added E).',
  countries: 'США (AAD / ACS)',
  presets: [
    { label: 'Доброкачественный невус', values: { a: false, b: false, c: false, d: false, e: false, uglyDuckling: false } },
    { label: 'Подозрительный (3/5)', values: { a: true, b: true, c: true, d: false, e: false, uglyDuckling: false } },
    { label: 'Классическая меланома', values: { a: true, b: true, c: true, d: true, e: true, uglyDuckling: true } },
  ],
  info: `### Для чего используется
**ABCDE** — мнемоника для раннего выявления **меланомы** при клиническом осмотре и самообследовании.

### Критерии
| Буква | Признак | Пояснение |
|---|---|---|
| A | Asymmetry | Половины не совпадают |
| B | Border | Зазубренный, размытый край |
| C | Color | ≥ 2 цвета (коричневый, чёрный, красный, белый, голубой) |
| D | Diameter | > 6 мм (диаметр ластика карандаша) |
| E | Evolution | Изменение размера/формы/цвета/симптомов за недели-месяцы |

### Интерпретация
| Положительно | Тактика |
|---|---|
| 0-1 | Рутинный осмотр, самообследование |
| 2 | Дерматоскопия + мониторинг 3 мес |
| ≥ 3 или E | Эксцизионная биопсия (!) |

### Ugly Duckling sign
Невус, отличающийся от остальных у пациента — независимый предиктор меланомы.

### Когда ABCDE не работает
- **Nodular меланома** → используйте **EFG** (Elevated, Firm, Growing > 1 мес)
- **Amelanotic** — без пигмента
- **Акральная** (ладони/подошвы/ногти) → **ABCDEF** для ногтей
- Меланома < 6 мм существует

### Что делать при подозрении
- **Эксцизионная** биопсия с краем 1-3 мм до подкожного жира
- **Не делать** shave/punch подозрительных — могут занизить Breslow thickness

### Источник
Friedman RJ. CA Cancer J Clin 1985. Abbasi NR. JAMA 2004 (E).`,
};

export default runner;
