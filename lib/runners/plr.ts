// @ts-nocheck
/** Runner: plr — Passive Leg Raise (Monnet 2016) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'coBase', label: 'Базовый CO (кардиовыброс)', type: 'number', unit: 'л/мин', min: 1, max: 15, step: 0.1, quickValues: [3, 4, 5, 6, 7] },
    { id: 'coPLR', label: 'CO во время PLR (через 1 мин)', type: 'number', unit: 'л/мин', min: 1, max: 15, step: 0.1, quickValues: [4, 5, 6, 7, 8] },
    {
      id: 'mode',
      label: 'Режим вентиляции',
      type: 'select',
      options: [
        { value: 'mv', label: 'Контролируемая ИВЛ (Vt 8–10 мл/кг)' },
        { value: 'spont', label: 'Спонтанное дыхание' },
      ],
    },
  ],
  compute: (v) => {
    const base = Number(v.coBase);
    const plr = Number(v.coPLR);
    const delta = ((plr - base) / base) * 100;
    const responder = delta >= 10;

    let interpretation = '', color = '', details = '';
    const actions: string[] = [];

    if (responder) {
      interpretation = 'Fluid responder (ΔCO ≥10%)';
      color = '#22C55E';
      details = `ΔCO = +${delta.toFixed(1)}% — пациент отвечает на преднагрузку. PLR имитирует болюс ~300 мл аутотрансфузии из нижних конечностей (Monnet 2016, чувствительность 86%, специфичность 92%).`;
      actions.push('Осторожный болюс кристаллоидов 250–500 мл за 15 мин', 'Повторить PLR / мини-болюс после', 'Оценить лактат, диурез, перфузию как клинические цели', 'При повторном положительном тесте — норэпинефрин как альтернатива объёму');
    } else {
      interpretation = 'Non-responder (ΔCO <10%)';
      color = '#F59E0B';
      details = `ΔCO = ${delta.toFixed(1)}% — пациент НЕ отвечает на преднагрузку. Дополнительный объём не улучшит СВ; риск перегрузки и ARDS.`;
      actions.push('НЕ давать дополнительный объём рутинно', 'Начать/усилить вазопрессор (норэпинефрин)', 'Оценить сократимость (эхо-КГ, инотропы)', 'Поиск других причин шока (сердечный, обструктивный, септический)');
    }

    return {
      value: `${delta.toFixed(1)}%`,
      unit: 'ΔCO',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'PLR: пациента из полу-сидячего (45°) переводят в горизонтальное + подъём ног 45° на 60–90 сек',
        'Измеряется пиковый ΔCO; SBP/пульс менее надёжны',
        'Альтернативы: end-expiratory occlusion (EEOT, +2–5% ΔCO), mini-fluid challenge 100 мл → ΔVTI ≥10%',
        'Не работает при ВБГ (intra-abdominal hypertension), сдавливающих чулках',
      ],
      related: [
        { id: 'svv', title: 'SVV / PPV' },
        { id: 'shock-index', title: 'Shock index' },
        { id: 'sofa', title: 'SOFA' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
      scale: {
        segments: [
          { min: -20, max: 10, label: 'Non-responder', color: '#F59E0B' },
          { min: 10, max: 50, label: 'Responder', color: '#22C55E' },
        ],
        current: Math.round(delta),
        unit: '%',
      },
    };
  },
  reference: 'Monnet X, Marik PE, Teboul JL. Intensive Care Med 2016.',
  countries: 'Международный',
  presets: [
    { label: 'Responder', values: { coBase: 4.5, coPLR: 5.5, mode: 'mv' } },
    { label: 'Non-responder', values: { coBase: 5.0, coPLR: 5.15, mode: 'mv' } },
    { label: 'Spont. resp.', values: { coBase: 4.0, coPLR: 4.8, mode: 'spont' } },
  ],
  caveats: [
    'Для оценки ΔCO нужен continuous CO monitor (PiCCO, LiDCO, Swan, VTI на ЭхоКГ, EV1000)',
    'Изменения SBP/HR малочувствительны — использовать CO/VTI',
  ],
  info: `### Для чего используется
**Passive Leg Raise (PLR)** — динамический тест оценки преднагрузки и фluid responsiveness. Валидирован у спонтанно дышащих, интубированных, при аритмиях (в отличие от SVV/PPV).

### Методика (Monnet 2016)
1. Полу-сидячее положение 45° — базовая оценка CO
2. Кровать в горизонтальное + ноги приподняты на 45° 60–90 сек
3. Пиковый CO/VTI в течение 1 мин
4. ΔCO ≥10% = fluid responder

### Чувствительность/специфичность
- ΔCO ≥10%: чувствит. 86%, специфичн. 92% (метаанализ Monnet 2016)
- ΔSBP/HR — плохо, не использовать
- ΔVTI на ЭхоКГ — хорошая альтернатива

### Альтернативы
| Метод | Порог | Применимость |
|---|---|---|
| **PLR ΔCO** | ≥10% | Универсально |
| **SVV** | ≥13% | MV Vt 8 мл/кг, синус |
| **PPV** | ≥13% | MV, синус, закрытая грудь |
| **IVC collapsibility** | >50% спонт / >18% MV | УЗИ |
| **Mini-fluid 100 мл** | ΔVTI ≥10% | Любые |
| **EEOT** | ΔCO ≥5% | MV, кооперация |

### Ограничения
- ВБГ (IAP >15): ложно-отрицательный
- Tight compression stockings: удалить перед тестом
- Большой ожог, травма ног: невозможно
- Измерение по SBP/HR — ненадёжно`,
};

export default runner;
