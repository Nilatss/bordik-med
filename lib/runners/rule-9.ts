// @ts-nocheck
/**
 * Runner: rule-9
 * Rule of Nines / Wallace + Lund-Browder pediatric TBSA calculator.
 */

import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age', label: 'Возраст', type: 'select', options: [
      { value: 'adult', label: 'Взрослый (≥10 лет) — Правило девяток' },
      { value: 'child', label: 'Ребёнок 1–9 лет (Lund-Browder)' },
      { value: 'infant', label: 'Младенец <1 года (Lund-Browder)' },
    ] },
    { id: 'head',    label: 'Голова + шея', type: 'checkbox' },
    { id: 'armR',    label: 'Правая рука (целиком)', type: 'checkbox' },
    { id: 'armL',    label: 'Левая рука (целиком)', type: 'checkbox' },
    { id: 'chest',   label: 'Грудь (передняя поверхность туловища)', type: 'checkbox' },
    { id: 'abd',     label: 'Живот (передняя нижняя половина туловища)', type: 'checkbox' },
    { id: 'backU',   label: 'Спина верхняя', type: 'checkbox' },
    { id: 'backL',   label: 'Спина нижняя + ягодицы', type: 'checkbox' },
    { id: 'legR',    label: 'Правая нога (целиком)', type: 'checkbox' },
    { id: 'legL',    label: 'Левая нога (целиком)', type: 'checkbox' },
    { id: 'gen',     label: 'Промежность / гениталии', type: 'checkbox' },
  ],
  compute: (v) => {
    const age = String(v.age);
    // Адекватные значения по правилу девяток / Lund-Browder
    const pct = {
      adult:  { head:  9, arm: 9, chest: 9, abd: 9, backU: 9, backL: 9, leg: 18, gen: 1 },
      child:  { head: 13, arm: 9, chest: 9, abd: 9, backU: 9, backL: 9, leg: 16, gen: 1 },
      infant: { head: 19, arm: 9, chest: 9, abd: 9, backU: 9, backL: 9, leg: 13, gen: 1 },
    }[age] || { head: 9, arm: 9, chest: 9, abd: 9, backU: 9, backL: 9, leg: 18, gen: 1 };

    let total = 0;
    if (v.head)  total += pct.head;
    if (v.armR)  total += pct.arm;
    if (v.armL)  total += pct.arm;
    if (v.chest) total += pct.chest;
    if (v.abd)   total += pct.abd;
    if (v.backU) total += pct.backU;
    if (v.backL) total += pct.backL;
    if (v.legR)  total += pct.leg;
    if (v.legL)  total += pct.leg;
    if (v.gen)   total += pct.gen;

    let band = '', color = '', details = '', actions: string[] = [];
    if (total < 10) {
      band = 'Лёгкий ожог'; color = '#22C55E';
      details = '%TBSA < 10 %. Амбулаторное ведение при поверхностных/дермальных ожогах, достаточно пероральной регидратации.';
      actions = ['Туалет ран, мазевые повязки', 'Анальгетики', 'Профилактика столбняка', 'Контроль через 24–48 ч'];
    } else if (total < 20) {
      band = 'Средний ожог'; color = '#F59E0B';
      details = '%TBSA 10–19 %. Показана госпитализация, инфузионная терапия по Parkland/Brooke.';
      actions = [
        'Госпитализация в ожоговое отделение / хирургию',
        'Инфузия кристаллоидов по Parkland (4 мл × кг × %TBSA) / Modified Brooke',
        'Катетеризация мочевого пузыря, цель диурез 0,5 мл/кг/ч',
        'Анальгезия (морфин / кетамин титровано)',
      ];
    } else if (total < 40) {
      band = 'Тяжёлый ожог'; color = '#EF4444';
      details = '%TBSA 20–39 %. Массивная потеря жидкости, SIRS, риск синдрома ожогового шока и ОПП.';
      actions = [
        'Перевод в ожоговый центр по критериям ABA',
        'Агрессивная инфузия (Parkland) под контролем диуреза и лактата',
        'Ранняя энтеральная поддержка ≥25 ккал/кг, белок 1,5–2 г/кг',
        'Интубация при ингаляционной травме / ожогах лица',
        'Escharotomy при циркулярных ожогах',
      ];
    } else {
      band = 'Критический ожог'; color = '#991B1B';
      details = '%TBSA ≥ 40 %. Крайне высокий риск смертности и ПОН. Требуется ICU, ИВЛ, ЗПТ.';
      actions = [
        'Экстренный перевод в специализированный ожоговый центр',
        'ИВЛ при ингаляционной травме / FiO₂ 100 % при подозрении на CO',
        'Крупно-калиберный доступ ×2, инвазивный мониторинг',
        'ICU-уровень терапии, при ОПП — ЗПТ',
        'Обсуждение ранней некрэктомии в первые 24–48 ч',
      ];
    }

    return {
      value: total.toFixed(1), unit: '% TBSA',
      interpretation: band, color,
      details, actions,
      caveats: [
        'Учитываются только дермальные (II ст.) и глубокие (III–IV ст.) ожоги — поверхностные (I ст., эритема) в %TBSA не включаются',
        'У детей <10 лет голова относительно больше, ноги меньше — используется Lund-Browder, а не взрослые 9',
        'Ладонь пациента (с пальцами) ≈ 1 % TBSA — удобно для пятнистых ожогов',
        'Ожоги дыхательных путей / химические / электрические не измеряются %TBSA и требуют отдельной оценки',
      ],
      scale: {
        segments: [
          { min: 0,  max: 10, label: 'Лёгкий',     color: '#22C55E' },
          { min: 10, max: 20, label: 'Средний',    color: '#F59E0B' },
          { min: 20, max: 40, label: 'Тяжёлый',    color: '#EF4444' },
          { min: 40, max: 100, label: 'Критический', color: '#991B1B' },
        ],
        current: total,
        unit: '% TBSA',
      },
      related: [
        { id: 'parkland', title: 'Parkland' },
        { id: 'parkland-brooke', title: 'Parkland / Brooke / Galveston' },
        { id: 'absi', title: 'ABSI / Baux' },
      ],
      relatedCourses: [
        { id: '308.2', title: 'Хирургия ожогов' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Wallace Rule of Nines 1951. Lund & Browder *Surg Gynecol Obstet* 1944;79:352. ABA Burn Triage 2024.',
  countries: 'Международный (ABA, EMSB, ERC)',
  presets: [
    { label: 'Взрослый — лицо + кисть',    values: { age: 'adult', head: true, armR: false, armL: false, chest: false, abd: false, backU: false, backL: false, legR: false, legL: false, gen: false } },
    { label: 'Ребёнок — обе ноги',          values: { age: 'child', head: false, armR: false, armL: false, chest: false, abd: false, backU: false, backL: false, legR: true, legL: true, gen: false } },
    { label: 'Взрослый — передн. туловище + руки', values: { age: 'adult', head: false, armR: true, armL: true, chest: true, abd: true, backU: false, backL: false, legR: false, legL: false, gen: false } },
  ],
  info: `### Для чего используется
**Оценка площади ожоговой поверхности (% TBSA)** для принятия решений о госпитализации, инфузионной терапии (Parkland/Brooke), переводе в ожоговый центр, прогнозе (Baux, ABSI).

### Критерии
**Правило девяток (Wallace, взрослые ≥ 10 лет):** голова 9 %, каждая рука 9 %, передняя часть туловища 18 % (грудь 9 + живот 9), спина 18 %, каждая нога 18 %, промежность 1 %.

**Lund-Browder (дети, точнее):** с возрастом голова относительно уменьшается, ноги увеличиваются.
| Область | Взрослый | 1–4 г | <1 г |
|---|---|---|---|
| Голова | 9 % | 13 % | 19 % |
| Каждая нога | 18 % | 16 % | 13 % |

### Интерпретация
- < 10 % TBSA — лёгкий ожог, амбулаторно
- 10–19 % — средний, госпитализация + инфузия
- 20–39 % — тяжёлый, ожоговый центр + агрессивная инфузия
- ≥ 40 % — критический, ICU + ИВЛ + ЗПТ

### Ограничения
- Учитываются ТОЛЬКО II степень и глубже (дермальные и полнослойные). Поверхностная I ст. (эритема) НЕ включается.
- Правило ладони (1 % на ладонь с пальцами) — удобно для пятнистых ожогов.
- Ингаляционная травма, химические и электрические ожоги требуют отдельной оценки.

### Тактика
- Инфузия по Parkland (4 мл × кг × %TBSA) или Modified Brooke (2 мл × кг × %TBSA) на первые 24 ч, половина за 8 ч.
- Цель диуреза: взрослые 0,5 мл/кг/ч, дети 1 мл/кг/ч.
- Критерии перевода в ожоговый центр (ABA): ожоги II–III ст. > 10 %, любой ожог лица/кистей/стоп/промежности, ингаляционная травма, электрические/химические ожоги, коморбидности.

### Источник
Wallace AB. *Lancet* 1951;1:501. Lund CC, Browder NC. *Surg Gynecol Obstet* 1944;79:352. American Burn Association Burn Center Referral Criteria 2024.
`,
};

export default runner;
