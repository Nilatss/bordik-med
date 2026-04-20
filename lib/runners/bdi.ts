// @ts-nocheck
/** Runner: bdi — Beck Depression Inventory (BDI-II) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный',
  reference:
    'Beck AT, Steer RA, Brown GK. Manual for the Beck Depression Inventory-II. San Antonio: Psychological Corporation; 1996.',
  inputs: [
    {
      id: 'total',
      label: 'Суммарный балл BDI-II (21 пункт × 0-3, max 63)',
      type: 'number',
      min: 0,
      max: 63,
      step: 1,
      quickValues: [5, 15, 25, 40, 55],
      hint: 'Сумма всех 21 пункта опросника. Каждый пункт оценивается 0-3 балла.',
    },
    {
      id: 'suicide',
      label: 'Пункт 9: активные суицидальные мысли / намерение',
      type: 'checkbox',
      points: 0,
      hint: 'Любой ≥1 балл в пункте 9 требует отдельной оценки риска.',
    },
    {
      id: 'hopeless',
      label: 'Пункт 2: выраженная безнадёжность (≥2 балла)',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Норма (8)', values: { total: 8, suicide: false, hopeless: false } },
    { label: 'Умеренная (24)', values: { total: 24, suicide: false, hopeless: true } },
    { label: 'Тяжёлая + суицид (38)', values: { total: 38, suicide: true, hopeless: true } },
  ],
  compute: (v) => {
    const total = Math.max(0, Math.min(63, Number(v.total) || 0));
    const suicide = v.suicide === true;
    const hopeless = v.hopeless === true;

    let color = '#22C55E';
    let label = 'Минимальная депрессия';
    let details = 'Симптомы депрессии клинически незначимы.';
    const actions: string[] = [];

    if (total >= 29) {
      color = '#991B1B';
      label = 'Тяжёлая депрессия (29-63)';
      details = 'Тяжёлая депрессия. Высок риск суицида, психотических симптомов и стойкой функциональной нетрудоспособности.';
      actions.push(
        'Комбинация антидепрессант (СИОЗС/СИОЗСН) + психотерапия (КПТ/IPT)',
        'Оценка суицидальности (C-SSRS); при активных планах — срочная госпитализация',
        'Исключить биполярность (MDQ) до начала антидепрессанта',
        'При резистентности — аугментация литием/кветиапином, ЭСТ, кетамин',
      );
    } else if (total >= 20) {
      color = '#EF4444';
      label = 'Умеренная депрессия (20-28)';
      details = 'Умеренно выраженная депрессия с функциональным нарушением.';
      actions.push(
        'СИОЗС (сертралин, эсциталопрам) + КПТ',
        'Контроль PHQ-9 каждые 4 недели',
        'Скрининг тревоги (GAD-7) и алкоголя (AUDIT)',
      );
    } else if (total >= 14) {
      color = '#F59E0B';
      label = 'Лёгкая депрессия (14-19)';
      details = 'Лёгкие симптомы депрессии.';
      actions.push(
        'КПТ или межличностная терапия — первая линия',
        'Физическая активность 150 мин/нед, гигиена сна',
        'Повтор через 2-4 недели, при ухудшении — СИОЗС',
      );
    } else {
      actions.push('Наблюдение, психообразование; повтор при новых жалобах');
    }

    if (suicide) {
      color = '#991B1B';
      actions.unshift('⚠️ Пункт 9 положителен — немедленная оценка суицидального риска (C-SSRS), удаление средств');
    }
    if (hopeless) {
      actions.push('Безнадёжность — самый сильный предиктор суицида; отдельно мониторить');
    }

    return {
      value: String(total),
      unit: 'баллов',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'BDI-II — самоопросник; не заменяет клиническое интервью (DSM-5)',
        'Соматические пункты (аппетит, сон, усталость) могут искажать балл у пациентов с соматической патологией',
        'Не различает униполярную и биполярную депрессию',
        'У пожилых предпочтительнее GDS',
      ],
      scale: {
        segments: [
          { min: 0, max: 13, label: '0-13 минимальная', color: '#22C55E' },
          { min: 14, max: 19, label: '14-19 лёгкая', color: '#F59E0B' },
          { min: 20, max: 28, label: '20-28 умеренная', color: '#EF4444' },
          { min: 29, max: 63, label: '29-63 тяжёлая', color: '#991B1B' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'phq9', title: 'PHQ-9' },
        { id: 'ham-d', title: 'HAM-D' },
        { id: 'c-ssrs', title: 'C-SSRS' },
      ],
      relatedCourses: [{ id: '201.3', title: 'Нейрофизиология' }],
    };
  },
  info: `### Для чего используется
**Beck Depression Inventory-II (BDI-II, Beck 1996)** — один из самых распространённых самоопросников для оценки **тяжести депрессии** у пациентов ≥13 лет. 21 пункт, каждый 0-3 балла (max 63), привязаны к критериям DSM-IV/5.

### Интерпретация
| BDI-II | Тяжесть | Тактика |
|---|---|---|
| 0-13 | Минимальная / нет | Наблюдение |
| 14-19 | Лёгкая | КПТ, физическая активность |
| 20-28 | Умеренная | СИОЗС + психотерапия |
| 29-63 | Тяжёлая | Комбинированная терапия, оценка суицида, возможна госпитализация |

### Критические пункты
- **Пункт 2** (безнадёжность) — сильнейший предиктор суицида независимо от общего балла
- **Пункт 9** (суицидальные мысли) — любой балл ≥1 требует структурированной оценки риска (C-SSRS)

### Ограничения
- Самоопросник, возможна симуляция / диссимуляция
- Соматические пункты завышают балл при хронических соматических болезнях, беременности
- Не валидизирован для деменции, делирия
- У пожилых (≥65 лет) лучше **GDS-15**

### Источник
Beck AT, Steer RA, Brown GK. *Manual for the Beck Depression Inventory-II.* San Antonio: Psychological Corporation; 1996.`,
};

export default runner;
