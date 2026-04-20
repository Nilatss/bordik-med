// @ts-nocheck
/** Runner: tsh - TSH reflex panel interpretation */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'tsh', label: 'ТТГ (TSH)', type: 'number', unit: 'мкМЕ/мл', min: 0, max: 200, step: 0.01, quickValues: [0.5, 2.5, 5.0, 10, 50] },
    { id: 'ft4', label: 'свободный Т4 (fT4)', type: 'number', unit: 'пмоль/л', min: 0, max: 80, step: 0.1, quickValues: [7, 12, 18, 25] },
    { id: 'ft3', label: 'свободный Т3 (fT3, опционально)', type: 'number', unit: 'пмоль/л', min: 0, max: 40, step: 0.1, quickValues: [0, 3.5, 5.5, 9] },
    { id: 'pregnant', label: 'Беременность', type: 'checkbox' },
  ],
  compute: (v) => {
    const tsh = Number(v.tsh);
    const ft4 = Number(v.ft4);
    const ft3 = Number(v.ft3);
    const preg = !!v.pregnant;

    // Reference ranges (most labs):
    //   TSH 0.4-4.0 μIU/mL (pregnant: 0.1-2.5 trim 1, 0.2-3.0 trim 2-3)
    //   fT4 12-22 pmol/L
    //   fT3 3.5-6.5 pmol/L
    const tshHi = preg ? 2.5 : 4.0;
    const tshLo = preg ? 0.1 : 0.4;
    const ft4Normal = ft4 >= 12 && ft4 <= 22;
    const ft4High = ft4 > 22;
    const ft4Low = ft4 < 12;

    let band = '', color = '#22C55E', details = '', actions = [];

    if (tsh >= tshLo && tsh <= tshHi) {
      if (ft4Normal) {
        band = 'Эутиреоз'; color = '#22C55E';
        details = `TSH ${tsh}, fT4 ${ft4} в норме${preg ? ' (беременность)' : ''}.`;
        actions = ['Тиреоидная функция нормальна', 'Повторять при клинических показаниях'];
      } else if (ft4Low) {
        band = 'Центр. гипотиреоз'; color = '#F59E0B';
        details = `Нормальный TSH ${tsh} + низкий fT4 ${ft4} → подозрение на ЦЕНТРАЛЬНЫЙ гипотиреоз (гипофизарный/гипоталамический).`;
        actions = ['МРТ гипофиза', 'Оценить другие оси: кортизол, ЛГ/ФСГ, пролактин, ГР', 'Консультация эндокринолога'];
      } else {
        band = 'Рассмотреть Т3-токс.'; color = '#F59E0B';
        details = `TSH нормальный, fT4 повышен ${ft4}. Возможна лаб. помеха или T3-токсикоз (проверить fT3).`;
        actions = ['Повторить через 2-4 нед', 'Антитела к TPO, TRAb', 'При стойких изменениях - сцинтиграфия'];
      }
    } else if (tsh > tshHi) {
      if (ft4Normal || ft4 >= 12) {
        band = 'Субклин. гипотиреоз'; color = '#F59E0B';
        details = `TSH ${tsh} повышен при нормальном fT4 ${ft4}. Субклинический гипотиреоз.`;
        actions = preg
          ? ['Беременность - начать L-тироксин 25-50 мкг/сут', 'Цель TSH: 1 триместр < 2.5, 2-3 триместр < 3.0', 'Контроль TSH каждые 4 нед']
          : tsh > 10
            ? ['TSH > 10 - начать L-тироксин 1.6 мкг/кг/сут (если возраст < 60)', 'Пожилым - 25-50 мкг со ступенчатым увеличением']
            : ['TSH 4-10: начать L-тироксин при симптомах, антителах TPO+, ИМТ повышен, сердечно-сосуд. риск', 'Иначе - наблюдение + TSH через 3-6 мес', 'Анти-ТПО для оценки риска прогрессии'];
      } else {
        band = 'Явный гипотиреоз'; color = '#EF4444';
        details = `TSH ${tsh} повышен + fT4 ${ft4} низкий. Явный первичный гипотиреоз (наиболее частая причина - АИТ Хашимото).`;
        actions = ['Начать L-тироксин 1.6 мкг/кг/сут (взрослые <60)', 'Пожилым / ИБС - 12.5-25 мкг, ↑ на 12.5 каждые 2-4 нед', 'TSH через 6-8 нед, цель 0.4-2.5 мкМЕ/мл', 'Анти-ТПО для подтверждения АИТ Хашимото'];
      }
    } else {
      // TSH < lo → hyperthyroidism spectrum
      if (ft4Normal && (!ft3 || ft3 <= 6.5)) {
        band = 'Субклин. тиреотоксикоз'; color = '#F59E0B';
        details = `TSH ${tsh} снижен при нормальных fT4/fT3. Субклинический тиреотоксикоз.`;
        actions = ['Повторить через 2-4 нед (исключить преходящие причины)', 'TRAb, анти-ТПО', 'Сцинтиграфия Tc-99m при повышенном поглощении', 'При TSH < 0.1 + возраст > 65 или ССЗ/остеопороз - лечить (тиамазол 5-10 мг/сут)'];
      } else if (ft4High || (ft3 > 6.5)) {
        band = 'Явный тиреотоксикоз'; color = '#EF4444';
        details = `TSH ${tsh} подавлен + fT4 ${ft4}${ft3 > 0 ? ', fT3 ' + ft3 : ''} повышены. Явный тиреотоксикоз.`;
        actions = ['TRAb (болезнь Грейвса), сцинтиграфия (аденома vs диффузный токсический зоб)', 'Тиамазол 20-40 мг/сут + β-блокатор (пропранолол 40 мг/сут)', 'При тяжёлой офтальмопатии - ГКС', 'Рассмотреть RAI или тиреоидэктомию'];
      } else if (ft4Low && tsh < 0.1) {
        band = 'Центр. тиреотокс.'; color = '#F59E0B';
        details = `TSH подавлен + fT4 низкий/нормальный. Подозрение на центральный тиреотоксикоз или нетиреоидное заболевание.`;
        actions = ['Исключить нетиреоидное заболевание ("sick euthyroid")', 'Повторить после стабилизации состояния', 'МРТ гипофиза при стойких изменениях'];
      }
    }

    return {
      value: tsh.toFixed(2), unit: 'мкМЕ/мл',
      interpretation: band || 'Норма', color,
      details, actions,
      caveats: [
        'Референс TSH: небеременные 0.4-4.0, I триместр беременности 0.1-2.5, II-III 0.2-3.0',
        'Суточные колебания TSH - забор утром, натощак',
        'Эстрогены / биотин / гепарин - могут искажать тест',
        'Нетиреоидное заболевание ("sick euthyroid") имитирует центральный гипотиреоз',
        'Рефлекс-алгоритм: TSH первым → fT4 если TSH выходит из нормы',
      ],
      scale: {
        // Visible range 0-20 mIU/L. Typical clinical values: <0.4 suppressed,
        // 0.4-4 normal, 4-10 subclinical, >10 overt hypothyroidism. Showing
        // up to 100 stretched the normal band into a tiny invisible sliver.
        segments: [
          { min: 0, max: tshLo, label: 'Супресс.', color: '#EF4444' },
          { min: tshLo, max: tshHi, label: 'Норма', color: '#22C55E' },
          { min: tshHi, max: 10, label: 'Субклин.', color: '#F59E0B' },
          { min: 10, max: 20, label: 'Гипотиреоз', color: '#EF4444' },
        ],
        current: Math.min(tsh, 20),
        unit: 'мкМЕ/мл',
      },
      related: [
        { id: 'cortisol', title: 'Cortisol screen' },
        { id: 'arr', title: 'ARR (альдостерон)' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Эндокринология' },
        { id: '308.3', title: 'Щитовидная железа' },
      ],
    };
  },
  reference: 'Jonklaas J et al. ATA Guidelines Hypothyroidism. Thyroid 2014;24:1670. Ross DS et al. ATA Hyperthyroidism. Thyroid 2016;26:1343.',
  countries: 'Международный (ATA · ETA · РАЭ)',
  presets: [
    { label: 'Норма (TSH 2.0, fT4 15)', values: { tsh: 2.0, ft4: 15, ft3: 0, pregnant: false } },
    { label: 'Явный гипотиреоз', values: { tsh: 25, ft4: 8, ft3: 0, pregnant: false } },
    { label: 'Явный тиреотоксикоз', values: { tsh: 0.01, ft4: 40, ft3: 15, pregnant: false } },
  ],
  info: `### Для чего используется
Интерпретация ТТГ + fT4 (± fT3) для диагностики нарушений функции щитовидной железы.

### Референсные интервалы
| Параметр | Норма | Беременность (I / II-III) |
|---|---|---|
| TSH | 0.4-4.0 мкМЕ/мл | 0.1-2.5 / 0.2-3.0 |
| fT4 | 12-22 пмоль/л | 12-22 |
| fT3 | 3.5-6.5 пмоль/л | 3.5-6.5 |

### Паттерны
| TSH | fT4 | Диагноз |
|---|---|---|
| N | N | Эутиреоз |
| ↑ | ↓ | Явный гипотиреоз (первичный) |
| ↑ | N | Субклин. гипотиреоз |
| N | ↓ | Центр. гипотиреоз (редко) |
| ↓ | ↑ | Явный тиреотоксикоз |
| ↓ | N | Субклин. тиреотоксикоз |
| ↓ | ↓ | Центр. тиреотокс. / "sick euthyroid" |

### Тактика
- TSH > 10 - почти всегда лечить L-тироксином
- TSH 4-10 + норма fT4 + нет симптомов - наблюдение
- TSH < 0.1 + явный тиреотоксикоз - тиамазол + β-блокатор + TRAb/сцинтиграфия
- Беременность - цель TSH < 2.5-3.0, контроль каждые 4 нед`,
};

export default runner;
