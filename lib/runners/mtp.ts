// @ts-nocheck
/** Runner: mtp — Massive Transfusion Protocol 1:1:1 (PROPPR 2015) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'weight', label: 'Масса тела', type: 'number', unit: 'кг', min: 20, max: 200, step: 1, quickValues: [50, 60, 70, 80, 90, 100] },
    { id: 'ongoing', label: 'Продолжающееся массивное кровотечение', type: 'checkbox' },
    { id: 'hgb', label: 'Гемоглобин', type: 'number', unit: 'г/л', min: 20, max: 180, step: 1, quickValues: [50, 70, 80, 90, 100] },
    { id: 'coag', label: 'Лабораторная коагулопатия (INR>1.5, fib<1.5 г/л, тромб<50)', type: 'checkbox' },
  ],
  compute: (v) => {
    const w = Number(v.weight) || 70;
    const ongoing = Boolean(v.ongoing);
    const hgb = Number(v.hgb) || 0;
    const coag = Boolean(v.coag);

    const activate = ongoing || hgb < 70 || coag;
    const color = activate ? '#DC2626' : '#22C55E';
    const interpretation = activate ? 'Активировать MTP 1:1:1' : 'MTP не требуется';

    const packRBC = 6;
    const packFFP = 6;
    const packPlt = 1;

    const details = activate
      ? `Активировать протокол массивной трансфузии (PROPPR 2015): эритроциты : СЗП : тромбоциты = 1:1:1. Стандартный пакет: ${packRBC} доз эр.массы + ${packFFP} доз СЗП + ${packPlt} афереза тромбоцитов.`
      : 'Трансфузия по классическим порогам. Активация MTP не показана.';

    const actions = activate
      ? [
          `Пакет 1: ${packRBC} эр.массы + ${packFFP} СЗП + ${packPlt} тромбоциты`,
          'TXA 1 г болюс за 10 мин + 1 г инфузия 8 ч (если ≤3 ч от травмы, CRASH-2)',
          'Фибриноген/криопреципитат: цель fib ≥1.5 г/л (акушерство ≥2)',
          'Кальций: 1 г CaCl₂ на каждые 4 дозы цитратной крови, цель iCa ≥1.1 ммоль/л',
          'Температура ≥35 °C (активное согревание)',
          'pH >7.2, лактат ↓, MAP ≥65',
          'Контроль: TEG/ROTEM, фибриноген, лактат, газы каждые 30–60 мин',
          'Хирургический/эндоваскулярный гемостаз — приоритет',
        ]
      : ['Переоценка Hb/лактат/коагулограммы', 'Индивидуальные пороги трансфузии'];

    return {
      value: interpretation,
      unit: '',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'PROPPR 2015: соотношение 1:1:1 снизило смертность от кровотечения за 24 ч vs 1:1:2',
        'TXA только в пределах 3 ч от начала кровотечения',
        'iCa <1.1 ммоль/л = тяжёлая гипокальциемия (цитратная интоксикация)',
        'Соотношение 1:1:1 = 1 доза эр.массы : 1 доза СЗП : 1/6 афереза тромбоцитов',
      ],
      related: [
        { id: 'abc-tash', title: 'ABC / TASH для активации MTP' },
        { id: 'trali', title: 'TRALI / TACO' },
        { id: 'shock-index', title: 'Shock index' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
        { id: '301.2', title: 'Травма' },
      ],
    };
  },
  reference: 'Holcomb JB et al. JAMA 2015 (PROPPR); CRASH-2 Lancet 2010 (TXA).',
  countries: 'Международный',
  presets: [
    { label: 'Политравма с шоком', values: { weight: 80, ongoing: true, hgb: 60, coag: true } },
    { label: 'ЖКК с Hb 65', values: { weight: 70, ongoing: true, hgb: 65, coag: false } },
    { label: 'Стабильный — не MTP', values: { weight: 70, ongoing: false, hgb: 95, coag: false } },
  ],
  caveats: [
    'Активируется в 2 минуты — не ждать лаб.результатов',
    'Деактивировать при контроле кровотечения',
  ],
  info: `### Для чего используется
**Massive Transfusion Protocol (MTP)** — стандартизированный пакет компонентов крови при массивном кровотечении. Основан на RCT **PROPPR (Holcomb 2015, JAMA)**, показавшем преимущество соотношения **1:1:1 vs 1:1:2** по смертности от кровотечения за 24 ч.

### Триггеры активации
- Продолжающееся массивное кровотечение (>150 мл/мин или ожидаемая потеря >1500 мл)
- Shock index ≥1.0, SBP <90, FAST+, пенетрирующая травма (ABC ≥2)
- Hb <70 с продолжающейся потерей
- TASH ≥15, RABT ≥2

### Пакет 1:1:1 (на каждый раунд)
| Компонент | Доза |
|---|---|
| Эритроцитарная масса | 6 доз |
| СЗП | 6 доз |
| Тромбоциты | 1 аферез (= 6 донорских) |
| Фибриноген/криопреципитат | при fib <1.5 |
| TXA | 1 г + 1 г (CRASH-2, ≤3 ч) |

### Целевые параметры
| Параметр | Цель |
|---|---|
| MAP | ≥65 (permissive hypotension при не-ЧМТ) |
| pH | >7.2 |
| Температура | ≥35 °C |
| iCa | ≥1.1 ммоль/л |
| Фибриноген | ≥1.5 г/л (акушерство ≥2) |
| Тромбоциты | ≥50 (ЧМТ ≥100) |
| INR | <1.5 |

### Ключевые элементы
1. **Damage control resuscitation** — малые объёмы кристаллоидов, раннее применение компонентов
2. **Permissive hypotension** — не применимо при ЧМТ
3. **TEG/ROTEM-ориентированная коррекция** — если доступно`,
};

export default runner;
