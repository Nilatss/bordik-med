// @ts-nocheck
/** Runner: oct-normative - OCT RNFL normative database interpretation */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age',
hint: 'Возраст в годах', label: 'Возраст (лет)', type: 'number', min: 10, max: 95, step: 1, quickValues: [30, 50, 65, 80] },
    { id: 'rnfl', label: 'Global RNFL (среднее, мкм)', type: 'number', min: 30, max: 150, step: 1, quickValues: [110, 95, 80, 60] },
    { id: 'macularGCC', label: 'Macular GCC / GCIPL (мкм, опц.)', type: 'number', min: 30, max: 150, step: 1, quickValues: [95, 80, 70, 55] },
    { id: 'signalStrength', label: 'Signal strength (0-10)', type: 'number', min: 0, max: 10, step: 1, quickValues: [6, 7, 8, 9] },
  ],
  compute: (v) => {
    const age = Math.max(10, Number(v.age) || 50);
    const rnfl = Math.max(0, Number(v.rnfl) || 0);
    const gcc = Number(v.macularGCC) || 0;
    const signal = Math.max(0, Number(v.signalStrength) || 0);

    // Approximate normative (Cirrus HD-OCT): mean ~97 μm, SD ~9, age decline ~0.14 μm/year after 30
    const expected = 100 - Math.max(0, age - 30) * 0.15;
    const sd = 9;
    // percentiles: <1% ~ expected − 2.33·SD, <5% ~ expected − 1.64·SD, >95% ~ expected + 1.64·SD
    const p1 = expected - 2.33 * sd;
    const p5 = expected - 1.64 * sd;
    const p95 = expected + 1.64 * sd;

    let band = '', color = '#22C55E', details = '';
    if (signal < 6) {
      band = 'Низкое качество скана';
      color = '#6B7280';
      details = `Signal strength ${signal}/10 < 6 — скан недостоверен. Повторить с адекватной фиксацией и прозрачностью сред.`;
    } else if (rnfl < p1) {
      band = 'Outside normal (red)';
      color = '#EF4444';
      details = `RNFL ${rnfl} мкм < p1 (${p1.toFixed(0)}) — «красная» зона на OCT, высокая вероятность глаукомной потери ганглиозных клеток.`;
    } else if (rnfl < p5) {
      band = 'Borderline (yellow)';
      color = '#F59E0B';
      details = `RNFL ${rnfl} мкм между p1 и p5 (${p1.toFixed(0)}-${p5.toFixed(0)}) — borderline, требуется наблюдение.`;
    } else if (rnfl <= p95) {
      band = 'Within normal (green)';
      color = '#22C55E';
      details = `RNFL ${rnfl} мкм в нормативных пределах (p5-p95 = ${p5.toFixed(0)}-${p95.toFixed(0)}).`;
    } else {
      band = 'Supranormal (white)';
      color = '#60A5FA';
      details = `RNFL ${rnfl} мкм > p95 — супра-нормальная толщина. Возможен отёк ДЗН, нагрузка по оси, врождённые варианты; не обязательно патология.`;
    }

    return {
      value: rnfl.toFixed(0),
      unit: 'мкм (global RNFL)',
      interpretation: band,
      color,
      details: `${details} Ожидаемое для ${age} лет: ${expected.toFixed(0)} мкм.`,
      actions: [
        signal < 6 ? 'Повторить OCT с лучшим качеством (SS ≥ 7)' : '',
        rnfl < p1 ? 'Корреляция со стандартной периметрией (SAP), ДЗН фото' : '',
        rnfl < p5 ? 'Оценка секторов (темпоральный/нижний/назальный/верхний) — TSNIT' : '',
        gcc > 0 && gcc < 70 ? 'GCIPL < 70 мкм — макулярная потеря, нейродегенеративная корреляция' : '',
        'Повторная OCT через 6-12 мес для Guided Progression Analysis (GPA)',
        'Помнить про «floor effect» — при продвинутой глаукоме RNFL «упирается» в ~50 мкм',
      ].filter(Boolean),
      caveats: [
        'Нормативные базы разных приборов (Cirrus, Spectralis, RTVue) НЕ взаимозаменяемы',
        'Возрастная потеря ~0.14-0.5 мкм/год после 30',
        'Этнические различия: афроамериканцы на ~7 мкм толще; азиаты на ~5-8 мкм тоньше',
        'Нагрузка по оси (миопия) занижает RNFL — «ложная красная» зона',
        'Перипапиллярная атрофия, наклонный ДЗН → артефакты сегментации',
        'Signal strength < 6 (Cirrus) или < 15 (Spectralis Q-score) — скан ненадёжен',
        'GCIPL (ganglion cell-IPL) более чувствителен в ранней глаукоме',
        'Floor effect: при продвинутой глаукоме RNFL не информативен < 50 мкм',
      ],
      scale: {
        segments: [
          { min: 30, max: Math.max(31, Math.round(p1)), label: 'Red <1%', color: '#EF4444' },
          { min: Math.max(32, Math.round(p1) + 1), max: Math.round(p5), label: 'Yellow', color: '#F59E0B' },
          { min: Math.round(p5) + 1, max: Math.round(p95), label: 'Green', color: '#22C55E' },
          { min: Math.round(p95) + 1, max: 150, label: 'White', color: '#60A5FA' },
        ],
        current: Math.round(rnfl),
        unit: 'мкм',
      },
      related: [{ id: 'hodapp', title: 'Hodapp VF' }, { id: 'iop', title: 'IOP' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }],
    };
  },
  reference: 'Budenz DL et al. Determinants of normal RNFL thickness measured by Stratus OCT. Ophthalmology 2007;114:1046. Cirrus HD-OCT Normative Database (Carl Zeiss Meditec).',
  countries: 'Международный (AAO)',
  presets: [
    { label: 'Норма 50 лет', values: { age: 50, rnfl: 95, macularGCC: 85, signalStrength: 9 } },
    { label: 'Borderline', values: { age: 65, rnfl: 80, macularGCC: 75, signalStrength: 8 } },
    { label: 'Outside (red)', values: { age: 70, rnfl: 65, macularGCC: 60, signalStrength: 8 } },
    { label: 'Low quality', values: { age: 75, rnfl: 90, macularGCC: 80, signalStrength: 4 } },
  ],
  info: `### Для чего используется
Интерпретация толщины **RNFL (Retinal Nerve Fiber Layer)** и **GCIPL** на OCT по нормативной базе с цветовой кодировкой (green / yellow / red).

### Цветовая кодировка (по перцентилям нормативной базы)
| Цвет | Перцентиль | Значение |
|---|---|---|
| Красный | < 1% | Outside normal — высокая вероятность патологии |
| Жёлтый | 1-5% | Borderline |
| Зелёный | 5-95% | Within normal |
| Белый | > 95% | Supranormal |

### Нормативные значения (Cirrus HD-OCT)
- Среднее global RNFL ≈ 97 мкм (SD ~9)
- Возрастная потеря ~0.14-0.2 мкм/год после 30
- TSNIT-профиль: двугорбый (верх/низ толще)

### GCIPL (макулярные ганглиозные клетки)
- Среднее 80-85 мкм
- Более чувствителен на ранней стадии глаукомы
- Минимальное значение («minimum» в 6 секторах)

### Артефакты
- Нагрузка по оси (миопия −6 D и более)
- Перипапиллярная атрофия
- Наклонный / тильтованный ДЗН
- Signal strength < 6 (Cirrus) / Q-score < 15 (Spectralis)

### Floor effect
При продвинутой глаукоме RNFL упирается в ~50-55 мкм (глиальный остов) — OCT теряет чувствительность, переходить на SAP 10-2 и GCIPL.

### Источник
Budenz 2007. Cirrus HD-OCT, Spectralis, RTVue normative databases.`,
};

export default runner;
