// @ts-nocheck
/** Runner: who-malaria — WHO Severe Malaria criteria (2015) */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'coma', label: 'Нарушение сознания (GCS < 11 взрослые, BCS < 3 дети)', type: 'checkbox' },
    { id: 'prostration', label: 'Прострация / не может сидеть / пить', type: 'checkbox' },
    { id: 'multiple_seizures', label: 'Множественные судороги (> 2 за 24 ч)', type: 'checkbox' },
    { id: 'acidosis', label: 'Метабол. ацидоз (HCO₃⁻ < 15 или BE < −8)', type: 'checkbox' },
    { id: 'hypoglyc', label: 'Гипогликемия < 2,2 ммоль/л (< 40 мг/дл)', type: 'checkbox' },
    { id: 'anemia', label: 'Тяжёлая анемия Hb < 7 г/дл (взрослые) / < 5 г/дл (дети)', type: 'checkbox' },
    { id: 'aki', label: 'ОПП (креатинин > 265 мкмоль/л / 3 мг/дл)', type: 'checkbox' },
    { id: 'jaundice', label: 'Желтуха + паразитемия > 100 000/мкл', type: 'checkbox' },
    { id: 'pulm_edema', label: 'Отёк лёгких (рентген или SpO₂ < 92 % + ЧДД > 30)', type: 'checkbox' },
    { id: 'bleeding', label: 'Значимое кровотечение', type: 'checkbox' },
    { id: 'shock', label: 'Шок (САД < 80 взрослые / < 70 дети)', type: 'checkbox' },
    { id: 'hyperparasit', label: 'Гиперпаразитемия > 10 % эритроцитов (falciparum)', type: 'checkbox' },
    { id: 'lactate', label: 'Лактат > 5 ммоль/л', type: 'checkbox' },
  ],
  compute: (v) => {
    const criteria = [
      v.coma, v.prostration, v.multiple_seizures, v.acidosis, v.hypoglyc,
      v.anemia, v.aki, v.jaundice, v.pulm_edema, v.bleeding, v.shock,
      v.hyperparasit, v.lactate,
    ];
    const count = criteria.filter(Boolean).length;
    const severe = count >= 1;

    const color = severe ? '#EF4444' : '#22C55E';
    const value = severe ? 'Тяжёлая малярия' : 'Неосложнённая малярия';
    const disposition = severe ? 'ICU + артесунат в/в' : 'Амбулаторно / дневной стационар, артемезинин-комбинация перорально';

    return {
      value,
      unit: `(${count} критериев)`,
      interpretation: `${count > 0 ? count + ' критерий(ев) тяжёлой малярии' : 'Ни одного критерия тяжёлой малярии'}. → ${disposition}`,
      color,
      details: `WHO 2015: наличие ≥ 1 клинического или лабораторного критерия у пациента с P. falciparum (или P. knowlesi / P. vivax с осложнениями) = тяжёлая малярия. Смертность при задержке артесуната > 15 %.`,
      actions: [
        severe ? 'Артесунат в/в 2,4 мг/кг в 0, 12, 24 ч, затем 1 раз в сутки (первая линия WHO — snижает смертность на 35 % vs хинин)' : null,
        severe ? 'После ≥ 3 доз артесуната и стабилизации — перейти на пероральный АСТ × 3 дн полный курс' : null,
        severe ? 'Поддержка: инфузия осторожно (4 мл/кг/ч, избегать избытка — риск отёка лёгких и ARDS)' : null,
        severe ? 'Мониторинг глюкозы (гипогликемия), лактата, калия, пост-артесунатная задержанная гемолитическая анемия (14–28 дн)' : null,
        severe ? 'Переливание крови при Hb < 7 взрослым / < 5 детям' : null,
        severe ? 'Гемодиализ при ОПП (креатинин > 265)' : null,
        !severe ? 'Артеметер-люмефантрин × 3 дн (6 доз: 0, 8, 24, 36, 48, 60 ч)' : null,
        !severe ? 'Альтернативы: дигидроартемизинин-пиперахин, артесунат-амодиахин, артесунат-мефлохин' : null,
        'P. vivax / ovale: примахин 0,25 мг/кг × 14 дн после исключения G6PD-дефицита (эрадикация гипнозоитов)',
        'Повторная толстая капля ± экспресс-тест (HRP2) через 24, 48, 72 ч для контроля паразитемии',
        'Беременные (1-й тримест): хинин + клиндамицин; 2–3 тримест — АСТ безопасны',
      ].filter(Boolean),
      caveats: [
        'Артесунат в/в — первая линия (WHO), заменил хинин из-за меньшей смертности (SEAQUAMAT, AQUAMAT)',
        'Пост-артесунатная гемолитическая анемия — повторный ОАК на 7, 14, 21, 28 дн',
        'P. knowlesi может давать тяжёлую малярию при паразитемии > 1 %',
        'P. vivax осложнения: ОРДС, разрыв селезёнки, реже ОПП',
        'ЦНС-малярия: не откладывать люмбальную пункцию, если подозрение на менингит',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Неосложн.', color: '#22C55E' },
          { min: 1, max: 3, label: '1-2 крит.', color: '#F59E0B' },
          { min: 3, max: 13, label: 'Мультиорг.', color: '#EF4444' },
        ],
        current: Math.min(count, 13),
        unit: 'критерий',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '307.2', title: 'Микробиология / паразитология' },
      ],
      related: [
        { id: 'qsofa', title: 'qSOFA' },
        { id: 'ssc', title: 'SSC Hour-1' },
      ],
    };
  },
  reference: 'WHO. Severe Malaria. Trop Med Int Health 2014;19(Suppl 1):7-131. WHO Guidelines for Malaria 2023.',
  countries: 'Международный (WHO)',
  presets: [
    { label: 'Неосложнённая', values: { coma: false, prostration: false, multiple_seizures: false, acidosis: false, hypoglyc: false, anemia: false, aki: false, jaundice: false, pulm_edema: false, bleeding: false, shock: false, hyperparasit: false, lactate: false } },
    { label: 'Церебральная малярия', values: { coma: true, multiple_seizures: true, acidosis: true, lactate: true, hyperparasit: true } },
    { label: 'Полиорганная', values: { coma: true, acidosis: true, aki: true, jaundice: true, pulm_edema: true, shock: true, lactate: true } },
  ],
  info: `### Для чего используется
**WHO Severe Malaria Criteria (2015)** — диагностика тяжёлой малярии у пациентов с *P. falciparum* (или осложнённой *P. vivax* / *P. knowlesi*). Наличие **≥ 1 критерия** = тяжёлая малярия.

### Клинические критерии
| Критерий |
|---|
| Нарушение сознания (GCS < 11 / BCS < 3) |
| Прострация |
| Множественные судороги (> 2 / 24 ч) |
| Шок (САД < 80 / < 70) |
| Отёк лёгких / ОРДС |
| Значимое кровотечение |
| Желтуха + паразитемия > 100 000 |

### Лабораторные критерии
| Критерий |
|---|
| Метаб. ацидоз (HCO₃ < 15 или BE < −8) |
| Гипогликемия < 2,2 ммоль/л |
| Тяжёлая анемия Hb < 7 (взрослые) / < 5 (дети) |
| ОПП (Cr > 265 мкмоль/л) |
| Гиперпаразитемия > 10 % |
| Лактат > 5 ммоль/л |

### Терапия
| Форма | Препарат 1-й линии |
|---|---|
| **Тяжёлая (любая)** | Артесунат в/в 2,4 мг/кг в 0, 12, 24 ч, далее 1 раз/сут |
| **Неосложнённая falciparum** | Артеметер-люмефантрин × 3 дн (6 доз) |
| **vivax / ovale** | Хлорохин + примахин × 14 дн (после G6PD) |
| **Беременные 1-й триместр** | Хинин + клиндамицин |
| **2–3-й триместр** | АСТ (артемезинин-комбинация) |

### Артесунат IV — важно
- Первая линия с 2011 (заменил хинин)
- SEAQUAMAT / AQUAMAT: ↓ смертность на 35 %
- После ≥ 3 доз (24 ч) и стабилизации → перейти на пероральный АСТ × 3 дн полный курс
- **Пост-артесунатная гемолитическая анемия** — контроль Hb на 7, 14, 21, 28 дн (может быть тяжёлой)

### Ресусцитация
- Осторожная инфузия: ~ 4 мл/кг/ч
- Избегать избытка — риск ARDS, отёка лёгких
- Глюкоза (гипогликемия часто)
- Переливание: Hb < 7 взрослым, < 5 детям

### Профилактика у путешественников
| Регион | Схема |
|---|---|
| Chloroquine-sensitive | Хлорохин 500 мг/нед |
| Chloroquine-resistant | Атоваквон-прогуанил / доксициклин / мефлохин |
| Беременные | Мефлохин (2–3-й тримест) |

### Ограничения
- Требует подтверждения (толстая капля / HRP2 РДТ)
- Смешанные инфекции требуют охвата всех видов
- Lumefantrine, мефлохин — взаимодействия с CYP3A4

### Источник
WHO. *Guidelines for the treatment of malaria, 4th edition.* 2023.`,
};

export default runner;
