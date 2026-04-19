// @ts-nocheck
/**
 * Runner: parkland-brooke
 * Parkland vs Modified Brooke vs Galveston pediatric burn fluid resuscitation.
 */

import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'weight', label: 'Вес', type: 'number', unit: 'кг', min: 1, max: 250, step: 0.1, quickValues: [10, 20, 40, 60, 70, 80, 100] },
    { id: 'tbsa',   label: '% TBSA ожогов (II-III ст.)', type: 'number', unit: '%', min: 0, max: 100, step: 0.5, quickValues: [10, 20, 30, 40, 50, 60] },
    { id: 'age',    label: 'Возраст', type: 'select', options: [
      { value: 'adult', label: 'Взрослый (≥ 14 лет)' },
      { value: 'peds',  label: 'Ребёнок < 14 лет' },
    ] },
  ],
  compute: (v) => {
    const weight = Number(v.weight);
    const tbsa = Number(v.tbsa);
    const isPeds = String(v.age) === 'peds';

    // Parkland (ATLS): 4 мл × кг × %TBSA → Ringer за 24 ч, половина в первые 8 ч
    const parkland24 = 4 * weight * tbsa;
    const parkland8  = parkland24 / 2;
    const parklandRate8 = parkland8 / 8; // мл/ч в первые 8 ч

    // Modified Brooke: 2 мл × кг × %TBSA
    const brooke24 = 2 * weight * tbsa;
    const brooke8  = brooke24 / 2;

    // Galveston pediatric: 5000 мл × %TBSA × BSA(м²) + 2000 мл × BSA(м²) maintenance
    // BSA приблизительно по Mosteller: √(вес × рост / 3600). Используем Du Bois без роста:
    // BSA ≈ 0.024265 × weight^0.5378 × 160^0.3964 (взрослый 160 см для грубой оценки).
    // Для простоты: peds BSA по Haycock приближённо weight^0.5378 × 100^0.3964 × 0.024265
    const bsa = isPeds
      ? 0.024265 * Math.pow(weight, 0.5378) * Math.pow(110, 0.3964) // дет. средний рост ~110
      : 1.73; // стандартный взрослый
    const galvestonResusc = 5000 * (tbsa / 100) * bsa;
    const galvestonMaint  = 2000 * bsa;
    const galveston24 = galvestonResusc + galvestonMaint;

    let details = '', actions: string[] = [];
    let color = '#F59E0B';
    if (tbsa < 10) {
      color = '#22C55E';
      details = `%TBSA ${tbsa}% — формальная инфузионная терапия обычно не требуется. Пероральная регидратация при сохранном глотании.`;
      actions = ['Амбулаторное ведение при поверхностных ожогах', 'Контроль гидратации перорально', 'Обезболивание + уход за раной'];
    } else if (tbsa < 20) {
      color = '#F59E0B';
      details = `Средний ожог. Инфузия по Parkland или Modified Brooke, цель диуреза 0,5 мл/кг/ч (взрослый) / 1 мл/кг/ч (ребёнок).`;
      actions = [
        `Parkland 24 ч: ${parkland24.toFixed(0)} мл Ringer (половина за 8 ч)`,
        `Первые 8 ч: ${parkland8.toFixed(0)} мл, скорость ${parklandRate8.toFixed(0)} мл/ч`,
        'Modified Brooke = половина дозы (при HF, возрастных коморбидностях)',
        'Катетеризация мочевого пузыря, цель диуреза ≥ 0,5 мл/кг/ч',
      ];
    } else if (tbsa < 40) {
      color = '#EF4444';
      details = `Тяжёлый ожог. Агрессивная инфузия, перевод в ожоговый центр по ABA.`;
      actions = [
        `Parkland: ${parkland24.toFixed(0)} мл / 24 ч, из них ${parkland8.toFixed(0)} мл за 8 ч`,
        `В начале — ${parklandRate8.toFixed(0)} мл/ч Ringer`,
        'Титровать по диурезу: 0,5 мл/кг/ч у взрослых, 1 мл/кг/ч у детей',
        'Предупреждать over-resuscitation ("fluid creep"): при целевом диурезе — не увеличивать',
        'Ранняя интубация при подозрении на ингаляционную травму',
      ];
    } else {
      color = '#991B1B';
      details = `Критический ожог. ICU + ИВЛ + интенсивная инфузия. Мониторинг за признаками ABI (abdominal compartment syndrome).`;
      actions = [
        `Parkland: ${parkland24.toFixed(0)} мл / 24 ч (огромный объём — следите за отёками)`,
        'Ограничить первые 8 ч до избежания fluid creep — titrate down если диурез ≥ 1 мл/кг/ч',
        'ICU-уровень: инвазивный мониторинг, NIRS, IAP, ранняя энтеральная поддержка',
        'Консультация ожогового центра экстренно',
        'Рассмотреть ЗПТ при ОПП',
      ];
    }

    // Галвестон — показываем для детей
    if (isPeds) {
      actions.push(`Galveston (дети): ${galveston24.toFixed(0)} мл / 24 ч = ${galvestonResusc.toFixed(0)} ресусц. + ${galvestonMaint.toFixed(0)} maintenance (BSA ≈ ${bsa.toFixed(2)} м²)`);
    }

    return {
      value: parkland24.toFixed(0), unit: 'мл Ringer / 24 ч (Parkland)',
      interpretation: `Parkland ${parkland24.toFixed(0)} мл · Brooke ${brooke24.toFixed(0)} мл${isPeds ? ` · Galveston ${galveston24.toFixed(0)} мл` : ''}`,
      color,
      details, actions,
      caveats: [
        'Формулы — стартовая точка. Реальный объём титруется по диурезу и гемодинамике, не по формуле',
        'Избыточная инфузия ("fluid creep") → компартмент-синдромы, ARDS, задержка выздоровления',
        'При ингаляционной травме объёмы часто больше на 30–50 %',
        'Galveston — преимущественно для детей; у детей НЕ использовать взрослый Parkland без поправки на maintenance',
        'Электроожоги → миоглобинурия → увеличить цель диуреза до 1–2 мл/кг/ч + alkalinization',
      ],
      scale: {
        segments: [
          { min: 0,     max: 5000,  label: '< 5 л',    color: '#22C55E' },
          { min: 5000,  max: 10000, label: '5–10 л',   color: '#F59E0B' },
          { min: 10000, max: 20000, label: '10–20 л',  color: '#EF4444' },
          { min: 20000, max: 50000, label: '> 20 л',   color: '#991B1B' },
        ],
        current: parkland24,
        unit: 'мл / 24 ч',
      },
      related: [
        { id: 'parkland', title: 'Parkland (базовая)' },
        { id: 'modified-brooke', title: 'Modified Brooke' },
        { id: 'rule-9', title: 'Rule of Nines' },
        { id: 'absi', title: 'ABSI / Baux' },
      ],
      relatedCourses: [
        { id: '308.2', title: 'Хирургия ожогов' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Baxter CR, Shires GT *Ann NY Acad Sci* 1968 (Parkland). Pruitt BA ABLS 2000 (Modified Brooke). Carvajal HF *J Trauma* 1994 (Galveston).',
  countries: 'Международный (ABA, ATLS, ABLS)',
  presets: [
    { label: 'Взрослый 70 кг, 30 % TBSA', values: { weight: 70, tbsa: 30, age: 'adult' } },
    { label: 'Ребёнок 20 кг, 20 % TBSA',   values: { weight: 20, tbsa: 20, age: 'peds' } },
    { label: 'Крит. взрослый 80 кг, 60 %', values: { weight: 80, tbsa: 60, age: 'adult' } },
  ],
  info: `### Для чего используется
**Стартовая инфузионная терапия ожоговой болезни** в первые 24 часа. Сравнивает три формулы: Parkland, Modified Brooke и Galveston (педиатрия).

### Формулы
- **Parkland** (Baxter 1968): **V = 4 мл × вес (кг) × %TBSA** Ringer-lactate за 24 часа. Половина за первые 8 ч от момента ожога, остальная — за 16 ч.
- **Modified Brooke** (ABLS): **V = 2 мл × вес × %TBSA**. Используют когда нужен меньший объём (пожилые, HF).
- **Galveston (Carvajal)** для детей: **V = 5000 мл × %TBSA × BSA(м²) + 2000 мл × BSA(м²)** maintenance.

### Интерпретация
- **Цель диуреза**: взрослые 0,5 мл/кг/ч, дети 1 мл/кг/ч, электроожоги 1–2 мл/кг/ч с alkalinization.
- **Fluid creep** — перегрузка → компартмент-синдромы, ARDS, затяжное заживление. Титровать ВНИЗ если диурез превышает цель.

### Ограничения
- Формула — только старт; дальнейшая инфузия **титруется по диурезу и гемодинамике**, не по формуле.
- При ингаляционной травме объёмы могут быть на 30–50 % больше.
- Электрические ожоги: мало видимого %TBSA, но большие глубокие потери → требуют индивидуального подхода.
- У детей взрослый Parkland без maintenance ведёт к гипогликемии.

### Тактика
- 2 широких в/в доступа (18G), лучше periferic burn-free site или IO.
- Ringer-lactate — препарат выбора (физраствор NaCl 0,9 % → гиперхлоремический ацидоз при больших объёмах).
- Раннее добавление альбумина 5 % начиная с 8–12 ч при тяжёлых ожогах (ISBI 2016) — опционально.
- Перевод в ожоговый центр при ≥ 10 % TBSA, ожогах лица / кистей / стоп / промежности, ингаляции, электротравме.

### Источник
Baxter CR. *Ann NY Acad Sci* 1968;150:874. Pruitt BA. *Advanced Burn Life Support* 2000. Carvajal HF. *J Trauma* 1994;36:555. ABA Burn Center Referral Criteria 2024. ISBI Fluid Resuscitation Practice Guidelines 2016.
`,
};

export default runner;
