// @ts-nocheck
/** Runner: dic — ISTH DIC score (overt DIC) */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'plt', label: 'Тромбоциты × 10⁹/л', type: 'number', unit: '× 10⁹/л', min: 1, max: 500, step: 1, quickValues: [30, 60, 90, 120, 200] },
    { id: 'ddimer', label: 'D-димер / ФДП', type: 'select', options: [
      { value: '0', label: 'Нет повышения' },
      { value: '2', label: 'Умеренное повышение (2-5× ВГН)' },
      { value: '3', label: 'Значительное повышение (> 5× ВГН)' },
    ] },
    { id: 'pt', label: 'Удлинение ПВ (сек свыше нормы)', type: 'number', unit: 'сек', min: 0, max: 30, step: 0.5, quickValues: [0, 3, 6, 10] },
    { id: 'fib', label: 'Фибриноген', type: 'number', unit: 'г/л', min: 0.3, max: 10, step: 0.1, quickValues: [0.8, 1.5, 2.5, 4] },
  ],
  compute: (v) => {
    const plt = Number(v.plt) || 0;
    const pt = Number(v.pt) || 0;
    const fib = Number(v.fib) || 0;
    const dd = Number(v.ddimer) || 0;

    let pPlt = 0;
    if (plt < 50) pPlt = 2;
    else if (plt < 100) pPlt = 1;

    let pPt = 0;
    if (pt >= 6) pPt = 2;
    else if (pt >= 3) pPt = 1;

    const pFib = fib < 1.0 ? 1 : 0;

    const score = pPlt + dd + pPt + pFib;

    let interp = 'Нет overt DIC';
    let color = '#22C55E';
    if (score >= 5) { interp = 'Overt DIC (≥ 5)'; color = '#EF4444'; }
    else if (score >= 3) { interp = 'Подозрение на non-overt DIC'; color = '#F59E0B'; }

    const actions = [];
    if (score >= 5) {
      actions.push('Лечить основное заболевание (сепсис, онкология, акушерская патология)');
      actions.push('СЗП 15-30 мл/кг при активном кровотечении + ПВ/АЧТВ > 1,5× или фибриноген < 1,5');
      actions.push('Криопреципитат или концентрат фибриногена при фибриногене < 1,5 г/л');
      actions.push('Тромбоконцентрат при Plt < 20 (или < 50 + кровотечение)');
      actions.push('НМГ в профилактич. дозе при преобладании тромбоза без кровотечения');
      actions.push('Мониторинг каждые 6-12 ч до разрешения');
    } else if (score >= 3) {
      actions.push('Повторить панель коагуляции через 6-12 ч');
      actions.push('Активный поиск триггера (сепсис, травма, онкология)');
    } else {
      actions.push('DIC не подтверждён — искать иные причины коагулопатии');
    }

    return {
      value: `${score} балл${score === 1 ? '' : score < 5 ? 'а' : 'ов'}`,
      unit: 'ISTH DIC',
      interpretation: interp,
      color,
      details: `ISTH overt DIC score (Taylor 2001). Порог ≥ 5 → overt DIC (подтверждённый).
- Plt: < 50 = 2, 50-99 = 1, ≥ 100 = 0
- D-димер/ФДП: 0 / +2 / +3
- Удлинение ПВ: ≥ 6 сек = 2, 3-5,9 = 1, < 3 = 0
- Фибриноген: < 1,0 г/л = 1`,
      actions,
      caveats: [
        'Применим только при наличии основного заболевания, ассоциированного с DIC (сепсис, травма, онкология, акушерство)',
        'Повторять каждые 24 ч для динамики',
        'Острая промиелоцитарная ЛМЛ (APL) — специфический вариант DIC с гиперфибринолизом',
        'Не переливать тромбоциты/СЗП при отсутствии кровотечения и планируемых инвазий',
        'Для non-overt DIC существует отдельный расширенный скор',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Нет DIC', color: '#22C55E' },
          { min: 2, max: 5, label: 'Подозрение', color: '#F59E0B' },
          { min: 5, max: 8, label: 'Overt DIC', color: '#EF4444' },
        ],
        current: Math.min(score, 8),
        unit: 'балл',
      },
      relatedCourses: [
        { id: '303.2', title: 'Гематология' },
        { id: '304.1', title: 'Лаб. диагностика' },
      ],
      related: [
        { id: '4t', title: '4T (HIT)' },
        { id: 'plasmic', title: 'PLASMIC (ТТП)' },
      ],
    };
  },
  reference: 'Taylor FB Jr, Toh CH, Hoots WK et al. Thromb Haemost 2001;86:1327-30. ISTH 2013 Harmonization.',
  countries: 'Международный (ISTH 2001)',
  presets: [
    { label: 'Нет DIC', values: { plt: 200, ddimer: '0', pt: 1, fib: 4 } },
    { label: 'Подозрение', values: { plt: 80, ddimer: '2', pt: 2, fib: 2 } },
    { label: 'Overt DIC', values: { plt: 40, ddimer: '3', pt: 7, fib: 0.8 } },
  ],
  info: `### Для чего используется
**ISTH DIC score (Taylor 2001)** — стандартный инструмент диагностики **явного (overt) диссеминированного внутрисосудистого свёртывания**. Применяется только при наличии заболевания, ассоциированного с DIC.

### Компоненты
| Параметр | 0 | +1 | +2 | +3 |
|---|---|---|---|---|
| Тромбоциты (× 10⁹/л) | ≥ 100 | 50-99 | < 50 | — |
| D-димер / ФДП | Норма | — | Умеренно ↑ | Резко ↑ |
| Удлинение ПВ (сек) | < 3 | 3-5,9 | ≥ 6 | — |
| Фибриноген (г/л) | ≥ 1,0 | < 1,0 | — | — |

### Интерпретация
| Сумма | Трактовка |
|---|---|
| **≥ 5** | Overt DIC подтверждён, повторять ежедневно |
| < 5 | Подозрение на non-overt DIC; повторить через 24 ч |

### Триггеры DIC (обязательны для применения)
- Сепсис / тяжёлая инфекция
- Травма, ожоги, политравма
- Онкология (особенно аденокарциномы, APL)
- Акушерская патология (эмболия околоплодными водами, отслойка, HELLP)
- Сосудистые аномалии (аневризма, гемангиома)
- Иммунологические реакции (ABO-несовместимость)

### Лечение
1. **Этиотропная терапия** — главный принцип
2. **Компоненты крови** только при кровотечении/инвазии:
   - СЗП 15-30 мл/кг при ПВ/АЧТВ > 1,5× или фибриноген < 1,5
   - Криопреципитат / фибриногеновый концентрат при фибриногене < 1,5 г/л
   - Тромбоконцентрат при Plt < 20 (или < 50 + кровотечение)
3. **НМГ** профилактич. дозе при преобладании тромбоза без кровотечения
4. **Антитромбин, активированный протеин C** — не показаны рутинно (PROWESS-SHOCK)

### Ограничения
- Не применим без триггерной патологии
- Не для хрон. DIC (гигантская гемангиома, аневризма аорты)
- APL-DIC требует ATRA + агрессивная заместительная терапия`,
};

export default runner;
