// @ts-nocheck
/** Runner: calcium-pth - Calcium + PTH + Vit D differential */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'ca',
hint: 'Кальций общий. Норма: 2.15-2.55 ммоль/л', label: 'Общий Ca', type: 'number', unit: 'ммоль/л', min: 1.5, max: 4, step: 0.01, quickValues: [2.1, 2.5, 2.8, 3.2] },
    { id: 'alb',
hint: 'Альбумин. Норма: 35-50 г/л', label: 'Альбумин', type: 'number', unit: 'г/л', min: 15, max: 55, step: 1, quickValues: [25, 35, 40, 45] },
    { id: 'pth',
hint: 'Концентрация в пг/мл', label: 'ПТГ', type: 'number', unit: 'пг/мл', min: 0, max: 2000, step: 1, quickValues: [10, 40, 80, 200, 600] },
    { id: 'vitd',
hint: 'Витамин D (25-OH). Норма: 30-100 нг/мл', label: '25-OH витамин D', type: 'number', unit: 'нг/мл', min: 0, max: 150, step: 1, quickValues: [10, 20, 30, 50, 80] },
    { id: 'urCa', label: '24 ч Ca мочи (опц.)', type: 'number', unit: 'ммоль/сут', min: 0, max: 20, step: 0.1, quickValues: [0, 3, 6, 10] },
  ],
  compute: (v) => {
    const ca = Number(v.ca);
    const alb = Number(v.alb);
    const pth = Number(v.pth);
    const vitd = Number(v.vitd);
    const urCa = Number(v.urCa);

    // Corrected Ca (Payne): Ca + 0.02 × (40 - albumin g/L)
    const caCorr = ca + 0.02 * (40 - alb);
    const caCorrRounded = Number(caCorr.toFixed(2));

    // Reference ranges
    const caNormal = caCorrRounded >= 2.1 && caCorrRounded <= 2.6;
    const caHigh = caCorrRounded > 2.6;
    const caLow = caCorrRounded < 2.1;
    const pthNormal = pth >= 15 && pth <= 65;
    const pthHigh = pth > 65;
    const pthLow = pth < 15;

    let band = '', color = '#22C55E', details = '', actions = [];

    // Fractional excretion of Ca for FHH
    const feCa = urCa > 0 ? (urCa / (caCorrRounded * 24 / 1000)) : 0; // simplified

    if (caHigh) {
      if (pthHigh || pth >= 35) {
        band = 'Первичн. ГПТ'; color = '#EF4444';
        details = `Корр.Са ${caCorrRounded} ммоль/л (>2.6) + ПТГ ${pth} (повышен или неадекватно в норме). Первичный гиперпаратиреоз наиболее вероятен.`;
        actions = [
          'УЗИ шеи + сестамиби-сцинтиграфия для локализации аденомы',
          '24 ч Ca мочи для исключения FHH (если UCa/креатинин < 0.01 → подозрение на FHH)',
          'DXA для оценки плотности костей (ПМП критерий)',
          'Консультация эндокринного хирурга (паратиреоидэктомия при показаниях)',
        ];
      } else if (pthLow) {
        band = 'ГиперCa не-ПТГ'; color = '#EF4444';
        details = `Корр.Са ${caCorrRounded} + ПТГ ${pth} подавлен. ПТГ-независимая гиперкальциемия: злокачественность, саркоидоз, гипервитаминоз D, тиреотоксикоз.`;
        actions = [
          'PTHrP (паранеопластический), 1,25-(OH)₂ витамин D (саркоидоз, лимфома)',
          'Поиск первичной опухоли (КТ, маркёры)',
          'Лечение: гидратация 0.9 % NaCl 200-300 мл/ч, кальцитонин, бисфосфонаты (золедронат 4 мг)',
          'Денозумаб при рефрактерности или противопоказаниях к бисфосфонатам',
        ];
      } else {
        band = 'ГиперCa с норм ПТГ'; color = '#F59E0B';
        details = `Корр.Са ${caCorrRounded} + ПТГ в норме (неадекватно). Возможно: FHH, тиазидные, литий, ранняя ПГП.`;
        actions = ['24 ч Ca мочи (FHH: ↓ 24 ч Ca, UCa/Cr ratio < 0.01)', 'Отменить тиазиды, литий на 2-4 нед', 'Повторить Ca + ПТГ'];
      }
    } else if (caLow) {
      if (pthHigh) {
        band = 'Вторичн. ГПТ'; color = '#F59E0B';
        details = `Корр.Са ${caCorrRounded} < 2.1 + ПТГ ${pth} повышен. Вторичный гиперпаратиреоз на фоне гипокальциемии / ХБП / дефицита витамина D.`;
        actions = vitd < 30
          ? ['Дефицит витамина D (25-ОН < 30) - холекальциферол 50 000 МЕ/нед × 8 нед, затем 1000-2000 МЕ/сут', 'Препараты Са (1000-1500 мг/сут)', 'Повторить Са, ПТГ через 8 нед']
          : ['Оценить функцию почек (eGFR), при ХБП - кальцитриол', 'Исключить мальабсорбцию (целиакия, бариатрия)', 'При бессимптомной - контроль через 3 мес'];
      } else if (pthLow) {
        band = 'Гипопаратиреоз'; color = '#EF4444';
        details = `Корр.Са ${caCorrRounded} + ПТГ ${pth} низкий. Гипопаратиреоз (послеоперационный, аутоиммунный, DiGeorge, гипомагниемия).`;
        actions = [
          'Магний сыворотки (гипомагниемия блокирует секрецию ПТГ)',
          'Корр. гипокальциемии: Ca глюконат 10-20 мл 10 % в/в медленно при симптомной',
          'Поддерживающая: кальцитриол 0.25-0.5 мкг × 2/сут + кальций 1000 мг/сут',
          'Генетика (DiGeorge, аутоиммунный полисиндром)',
        ];
      } else {
        band = 'Гипокальц. неясная'; color = '#F59E0B';
        details = `Корр.Са ${caCorrRounded} < 2.1, ПТГ в норме. Требуется уточнение этиологии.`;
        actions = ['Магний', 'Оценить альбумин / тотальный белок', 'Повторить Са ионизированный', 'Исключить ХБП, панкреатит, переливание крови'];
      }
    } else {
      // Corrected Ca normal
      if (pthHigh && vitd < 30) {
        band = 'Втор. ГПТ на виt D'; color = '#F59E0B';
        details = `Са нормальный, ПТГ повышен ${pth}, витамин D ${vitd} < 30 - вторичный ГПТ на фоне дефицита D.`;
        actions = ['Восполнение витамина D 50 000 МЕ/нед × 8 нед', 'Контроль ПТГ через 3 мес'];
      } else if (pthHigh) {
        band = 'Норм Ca + ↑ ПТГ'; color = '#F59E0B';
        details = `Нормокальциемический гиперпаратиреоз или ранняя стадия ПГП. ПТГ ${pth}.`;
        actions = ['Повторить Са ионизированный (может быть граничная гиперкальциемия)', '24 ч Ca мочи', 'DXA - плотность костей'];
      } else {
        band = 'Норма'; color = '#22C55E';
        details = `Ca и ПТГ в норме. Витамин D ${vitd} ${vitd < 30 ? 'снижен - дефицит, рекомендована добавка' : 'в норме'}.`;
        actions = vitd < 20
          ? ['Выраженный дефицит D - холекальциферол 50 000 МЕ/нед × 8 нед']
          : vitd < 30
            ? ['Недостаточность D - 1000-2000 МЕ/сут холекальциферола']
            : ['Продолжить базовое потребление Ca/D с пищей'];
      }
    }

    return {
      value: caCorrRounded.toFixed(2), unit: 'ммоль/л (корр.)',
      interpretation: band, color,
      details, actions,
      caveats: [
        'Формула Пейна: Са корр = Са + 0.02 × (40 - альбумин г/л), валидна при pH нормальном',
        'При ацидозе/алкалозе использовать ионизированный Са',
        'Референс ПТГ: 15-65 пг/мл (intact PTH)',
        '25-OH витамин D: < 20 нг/мл дефицит, 20-30 недостаточность, > 30 достаточность',
        'FHH (семейная гипокальциурическая гиперкальциемия): UCa/Cr < 0.01 - не оперировать',
      ],
      scale: {
        segments: [
          { min: 1.5, max: 2.1, label: 'Гипо', color: '#EF4444' },
          { min: 2.1, max: 2.6, label: 'Норма', color: '#22C55E' },
          { min: 2.6, max: 3.0, label: 'Лёгкая гипер', color: '#F59E0B' },
          { min: 3.0, max: 4.0, label: 'Крит. гипер', color: '#991B1B' },
        ],
        current: caCorrRounded,
        unit: 'ммоль/л Ca корр.',
      },
      related: [
        { id: 'ca-corrected', title: 'Коррекция Ca' },
        { id: 'tsh', title: 'TSH панель' },
        { id: 'cortisol', title: 'Cortisol screen' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Эндокринология' },
        { id: '308.6', title: 'Метаболизм Ca и костей' },
      ],
    };
  },
  reference: 'Bilezikian JP et al. Guidelines for the Management of Asymptomatic Primary Hyperparathyroidism. J Clin Endocrinol Metab 2014;99:3561.',
  countries: 'Международный (Endocrine Society · IOF)',
  presets: [
    { label: 'Первичн. ГПТ (Ca 2.9, PTH 120)', values: { ca: 2.9, alb: 40, pth: 120, vitd: 28, urCa: 8 } },
    { label: 'Норма', values: { ca: 2.4, alb: 40, pth: 40, vitd: 35, urCa: 5 } },
    { label: 'Дефицит D + вторичн.', values: { ca: 2.35, alb: 40, pth: 90, vitd: 15, urCa: 3 } },
  ],
  info: `### Для чего используется
Дифференциальная диагностика нарушений кальций-фосфорного обмена: ПГП / вторичный ГПТ / гипопаратиреоз / не-ПТГ гиперкальциемия / FHH.

### Коррекция Ca (формула Пейна)
Ca корр (ммоль/л) = Ca измеренный + 0.02 × (40 - альбумин г/л)

### Интерпретация матрицы Ca-ПТГ
| Ca | ПТГ | Диагноз |
|---|---|---|
| ↑ | ↑ или norm (неадекватно) | Первичный ГПТ |
| ↑ | ↓ | ПТГ-независимая (малигн. / витD / саркоид / тиазиды) |
| ↓ | ↑ | Вторичный ГПТ (витD, ХБП, мальабсорбция) |
| ↓ | ↓ | Гипопаратиреоз (послеоп. / аутоим. / гипоMg) |
| N | ↑ | Нормокальц. ПГП / ранний ПГП / витD дефицит |

### FHH vs ПГП
- FHH: UCa/Cr < 0.01, семейный анамнез, молодой возраст, моноклональные → НЕ ОПЕРИРОВАТЬ
- ПГП: UCa/Cr > 0.02, обычно > 50 лет, клиника

### Показания к паратиреоидэктомии (ПГП)
1. Ca > 2.75 ммоль/л (0.25 выше ВГН)
2. Возраст < 50
3. T-score < -2.5 (любой локализации)
4. Позвоночный перелом
5. eGFR < 60
6. Гиперкальциурия > 10 ммоль/сут + камни
7. Нефролитиаз`,
};

export default runner;
