// @ts-nocheck
/**
 * Runner: asa-e
 * ASA extended preoperative risk (ASA-PS + RCRI + METs + age + emergency).
 */

import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'asa',
      label: 'Класс ASA-PS',
      type: 'select',
      options: [
        { value: '1', label: 'ASA I - здоров', points: 0 },
        { value: '2', label: 'ASA II - лёгкое системное', points: 1 },
        { value: '3', label: 'ASA III - тяжёлое системное', points: 3 },
        { value: '4', label: 'ASA IV - угроза жизни', points: 5 },
        { value: '5', label: 'ASA V - умирающий', points: 8 },
      ],
    },
    {
      id: 'rcri',
      label: 'RCRI баллы (Lee 1999)',
      type: 'number',
      min: 0,
      max: 6,
      step: 1,
      quickValues: [0, 1, 2, 3, 4],
    },
    {
      id: 'mets',
      label: 'Функциональная ёмкость (METs)',
      type: 'select',
      options: [
        { value: 'high', label: '> 4 METs (подъём на этаж без одышки)', points: 0 },
        { value: 'low', label: '≤ 4 METs (плохо переносит нагрузку)', points: 2 },
      ],
    },
    {
      id: 'age',
      label: 'Возраст',
      type: 'number',
      unit: 'лет',
      min: 0,
      max: 120,
      step: 1,
      quickValues: [40, 60, 70, 80],
    },
    {
      id: 'emerg',
      label: 'Экстренная операция (≥ 15 мин отсрочки → угроза)',
      type: 'checkbox',
      points: 2,
    },
  ],
  compute: (v) => {
    const asaPts = Number(v.asa === '1' ? 0 : v.asa === '2' ? 1 : v.asa === '3' ? 3 : v.asa === '4' ? 5 : v.asa === '5' ? 8 : 0);
    const rcri = Number(v.rcri || 0);
    const metsPts = v.mets === 'low' ? 2 : 0;
    const age = Number(v.age || 0);
    const agePts = age >= 80 ? 3 : age >= 70 ? 2 : age >= 60 ? 1 : 0;
    const emergPts = v.emerg ? 2 : 0;
    const total = asaPts + Math.min(rcri, 6) + metsPts + agePts + emergPts;

    let interpretation = '', color = '#22C55E', details = '', actions: string[] = [];
    if (total <= 3) {
      interpretation = 'Низкий периоперационный риск';
      color = '#22C55E';
      details = 'Суммарный композитный риск низкий. 30-дневная смертность ориентировочно < 1%. Стандартная предоперационная подготовка.';
      actions = [
        'Плановая операция без дополнительного тестирования',
        'Продолжить статины и β-блокаторы при наличии',
        'Стандартный периоперационный мониторинг',
      ];
    } else if (total <= 7) {
      interpretation = 'Промежуточный риск';
      color = '#F59E0B';
      details = 'Умеренный композитный риск. Требуется внимательная оптимизация сопутствующей патологии, оценка функциональной ёмкости.';
      actions = [
        'Консультация профильных специалистов (кардиолог при RCRI ≥ 2)',
        'Оптимизировать АГ, СД, анемию до операции',
        'При METs < 4 - стресс-тест если изменит тактику (ACC/AHA 2014)',
      ];
    } else if (total <= 12) {
      interpretation = 'Высокий риск';
      color = '#EF4444';
      details = 'Высокий композитный риск периоперационных осложнений. 30-дневная смертность 5-15%. Обсудить соотношение риск/польза с пациентом и семьёй.';
      actions = [
        'Мультидисциплинарный консилиум (анестезиолог + хирург + кардиолог)',
        'Инвазивный мониторинг (арт. линия, CVP по показаниям)',
        'Послеоперационно - ICU/HDU',
        'Документирование информированного согласия с обсуждением рисков',
      ];
    } else {
      interpretation = 'Критический риск';
      color = '#991B1B';
      details = 'Критически высокий риск. Операция только по жизненным показаниям. Обсудить паллиативные альтернативы, DNR-статус, goals of care.';
      actions = [
        'Только жизненные показания к операции',
        'ICU послеоперационно обязательно',
        'Семейный консилиум, paliative care consult',
      ];
    }

    return {
      value: String(total),
      unit: 'баллов',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Композитный индекс - не валидизированная единая шкала, а сумма валидных компонентов (ASA-PS, RCRI, METs, возраст, экстренность)',
        'Для формальной оценки используйте ACS NSQIP онлайн-калькулятор',
        'Субъективность ASA-PS сохраняется (межрейтерская вариабельность ≈ 20%)',
        'Экстренные операции увеличивают смертность в 3-10 раз vs плановых при том же ASA',
      ],
      scale: {
        segments: [
          { min: 0, max: 3, label: 'Низкий', color: '#22C55E' },
          { min: 3, max: 7, label: 'Умеренный', color: '#F59E0B' },
          { min: 7, max: 12, label: 'Высокий', color: '#EF4444' },
          { min: 12, max: 20, label: 'Критический', color: '#991B1B' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'asa-ps', title: 'ASA-PS' },
        { id: 'rcri', title: 'RCRI' },
        { id: 'nsqip', title: 'ACS NSQIP' },
        { id: 'possum', title: 'POSSUM' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Кардиология' },
      ],
    };
  },
  reference: 'ACC/AHA 2014 Perioperative Guideline; ASA-PS 2020; Lee 1999 RCRI.',
  countries: 'Международный',
  presets: [
    { label: 'Молодой здоровый, плановая', values: { asa: '1', rcri: 0, mets: 'high', age: 30, emerg: false } },
    { label: 'Пожилой с ИБС, плановая', values: { asa: '3', rcri: 2, mets: 'low', age: 75, emerg: false } },
    { label: 'Экстренная у тяжёлого', values: { asa: '4', rcri: 3, mets: 'low', age: 80, emerg: true } },
  ],
  info: `### Для чего используется
**Расширенная предоперационная оценка риска** - композитный подход, суммирующий валидированные компоненты: ASA-PS, RCRI, функциональную ёмкость (METs), возраст и фактор экстренности.

### Компоненты
| Компонент | Источник | Вклад |
|---|---|---|
| ASA-PS | ASA 2020 | 0-8 баллов по классу |
| RCRI | Lee 1999 | 0-6 баллов |
| METs | Duke Activity Status Index | 0 или 2 балла |
| Возраст | ACS NSQIP | 0-3 балла |
| Экстренность | ACC/AHA 2014 | 0 или 2 балла |

### Интерпретация
| Сумма | Риск | Тактика |
|---|---|---|
| ≤ 3 | Низкий | Плановая без доп. тестов |
| 4-7 | Умеренный | Оптимизация, возможен стресс-тест |
| 8-12 | Высокий | Мультидисциплинарно, ICU |
| > 12 | Критический | Только жизненные показания |

### Ограничения
- Не является отдельно валидизированной шкалой - использовать как структурированный чек-лист
- Для страхования/аудита - отдельно указывать ASA-PS и RCRI`,
};

export default runner;
