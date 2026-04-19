// @ts-nocheck
/** Runner: svv — SVV / PPV / IVC for fluid responsiveness (Marik 2009) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'method',
      label: 'Метод',
      type: 'select',
      options: [
        { value: 'svv', label: 'SVV (Stroke Volume Variation, %)' },
        { value: 'ppv', label: 'PPV (Pulse Pressure Variation, %)' },
        { value: 'ivcColl', label: 'IVC collapsibility (спонтанное, %)' },
        { value: 'ivcDist', label: 'IVC distensibility (MV, %)' },
        { value: 'mini', label: 'Mini-fluid ΔSV/VTI (100 мл, %)' },
      ],
    },
    { id: 'value', label: 'Измеренное значение', type: 'number', unit: '%', min: 0, max: 60, step: 1, quickValues: [5, 10, 13, 15, 20, 30, 50] },
  ],
  compute: (v) => {
    const method = String(v.method || 'svv');
    const val = Number(v.value);

    const thresholds: Record<string, number> = { svv: 13, ppv: 13, ivcColl: 50, ivcDist: 18, mini: 10 };
    const labels: Record<string, string> = {
      svv: 'SVV',
      ppv: 'PPV',
      ivcColl: 'IVC collapsibility (спонт.)',
      ivcDist: 'IVC distensibility (MV)',
      mini: 'ΔSV mini-fluid',
    };
    const threshold = thresholds[method];
    const responder = val >= threshold;

    let interpretation = '', color = '', details = '';
    const actions: string[] = [];

    if (responder) {
      interpretation = `${labels[method]} ≥${threshold}% — fluid responder`;
      color = '#22C55E';
      details = `Значение ≥${threshold}% указывает на положительный ответ на объёмную нагрузку. Ожидаемый прирост СВ ≥10–15% после болюса 250–500 мл.`;
      actions.push('Кристаллоиды 250–500 мл за 15 мин', 'Клинические цели: лактат, диурез, капиллярное наполнение', 'Повторить тест после болюса');
    } else {
      interpretation = `${labels[method]} <${threshold}% — non-responder`;
      color = '#F59E0B';
      details = `Объёмная нагрузка маловероятно улучшит СВ. Избегать волемической перегрузки (риск ARDS, пролонгированной ИВЛ).`;
      actions.push('Норэпинефрин как препарат выбора', 'Оценить сократимость (эхо-КГ, добутамин)', 'Рассмотреть PLR/EEOT для подтверждения');
    }

    const caveats = [
      'SVV/PPV ≥13% валидны только при: контролируемой ИВЛ Vt ≥8 мл/кг, синусовый ритм, закрытая грудь, без ↑давл.абдомин.',
      'Marik 2009 метаанализ: PPV AUC 0.94; Michard 2000 — первый описал PPV',
      'IVC collapsibility у спонтанно дышащего >50% — responder; у ИВЛ — distensibility >18%',
      'Mini-fluid 100 мл за 1 мин: ΔVTI ≥10% — самый универсальный',
      'Аритмии (ФП) — SVV/PPV недостоверны',
    ];

    return {
      value: `${val}%`,
      unit: labels[method],
      interpretation,
      color,
      details,
      actions,
      caveats,
      related: [
        { id: 'plr', title: 'PLR' },
        { id: 'shock-index', title: 'Shock index' },
        { id: 'sofa', title: 'SOFA' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
      scale: {
        segments: [
          { min: 0, max: threshold, label: 'Non-resp.', color: '#F59E0B' },
          { min: threshold, max: 60, label: 'Responder', color: '#22C55E' },
        ],
        current: val,
        unit: '%',
      },
    };
  },
  reference: 'Marik PE et al. Crit Care Med 2009 (PPV meta); Michard F, Teboul JL 2000; Barbier C et al. Intensive Care Med 2004 (IVC).',
  countries: 'Международный',
  presets: [
    { label: 'SVV 15% (resp.)', values: { method: 'svv', value: 15 } },
    { label: 'PPV 8% (non-resp.)', values: { method: 'ppv', value: 8 } },
    { label: 'IVC 60% спонт.', values: { method: 'ivcColl', value: 60 } },
    { label: 'IVC dist. 10% MV', values: { method: 'ivcDist', value: 10 } },
  ],
  caveats: [
    'ARDSnet Vt 6 мл/кг делает SVV/PPV ненадёжным — увеличить tidal-challenge test',
    'Открытая грудь / торакотомия — SVV/PPV недействительны',
  ],
  info: `### Для чего используется
Статические и динамические показатели оценки **fluid responsiveness** — ключевого вопроса ICU: "будет ли пациент отвечать на объём".

### Пороги (порог ≥ = responder)
| Метод | Порог | Условия |
|---|---|---|
| **SVV** | ≥13% | MV Vt ≥8 мл/кг, синус, закрытая грудь |
| **PPV** | ≥13% | Те же + арт.линия |
| **IVC collapsibility (спонт.)** | >50% | Спокойное дыхание, USG |
| **IVC distensibility (MV)** | >18% | Контролируемая ИВЛ |
| **Mini-fluid** (100 мл, 1 мин) | ΔSV/VTI ≥10% | Универсально |
| **PLR** | ΔCO ≥10% | Универсально (см. отд. калькулятор) |
| **EEOT** (end-exp occlusion 15 с) | ΔCO ≥5% | MV, кооперация |

### Ограничения SVV/PPV (gray zone Cannesson 2011)
- Vt <8 мл/кг — ложно-отрицательный
- Аритмии — недостоверно
- Спонтанное дыхание, TRIGGER moduls — недостоверно
- Открытая грудь, ↑IAP (ВБГ), торакотомия — недостоверно
- Низкий комплаенс лёгких — уменьшает SVV

### Tidal volume challenge test
При Vt 6 мл/кг: кратковременно увеличить до 8 мл/кг на 1 мин. ΔPPV ≥3.5% = responder (Myatra 2017).

### Практика
1. Если пациент удовлетворяет условиям SVV/PPV — использовать, порог 13%
2. Иначе — PLR или mini-fluid challenge
3. IVC USG — прикроватная альтернатива
4. Клинические цели (лактат, диурез, ScvO₂) > любого одного теста`,
};

export default runner;
