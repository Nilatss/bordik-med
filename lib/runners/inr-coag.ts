// @ts-nocheck
/** Runner: inr-coag - INR interpretation (warfarin / DOAC / liver / DIC) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'inr', label: 'INR', type: 'number', unit: '', min: 0.8, max: 10, step: 0.1, quickValues: [1.0, 2.0, 2.5, 3.0, 4.0, 6.0] },
    { id: 'context', label: 'Клинический контекст', type: 'select', options: [
      { value: 'warfarin-afib', label: 'Варфарин при ФП (цель 2-3)' },
      { value: 'warfarin-valve', label: 'Варфарин при мех. клапане (цель 2.5-3.5)' },
      { value: 'warfarin-vte', label: 'Варфарин при ВТЭ (цель 2-3)' },
      { value: 'doac', label: 'DOAC (апиксабан / ривароксабан / дабигатран)' },
      { value: 'liver', label: 'Печёночная недостаточность / цирроз' },
      { value: 'dic', label: 'ДВС-синдром / сепсис' },
      { value: 'vitk', label: 'Дефицит витамина K / мальабсорбция' },
    ] },
    { id: 'bleeding', label: 'Активное кровотечение', type: 'checkbox' },
  ],
  compute: (v) => {
    const inr = Number(v.inr);
    const ctx = String(v.context);
    const bleed = !!v.bleeding;

    let targetRange = '2.0-3.0';
    let inRange = inr >= 2 && inr <= 3;
    if (ctx === 'warfarin-valve') { targetRange = '2.5-3.5'; inRange = inr >= 2.5 && inr <= 3.5; }

    let band = '', color = '#22C55E', details = '', actions = [];

    if (ctx.startsWith('warfarin')) {
      if (inr < (ctx === 'warfarin-valve' ? 2.5 : 2)) {
        band = 'Субтерапевт.'; color = '#F59E0B';
        details = `INR ${inr} ниже целевого ${targetRange}. Риск тромбоэмболии.`;
        actions = ['Увеличить дозу варфарина на 5-15 %', 'Контроль INR через 4-7 дней', 'Исключить пропущенные дозы, взаимодействия (витамин K, рифампицин)'];
      } else if (inRange) {
        band = 'В цели'; color = '#22C55E';
        details = `INR ${inr} в целевом диапазоне ${targetRange}.`;
        actions = ['Продолжить текущую дозу', 'Повторить INR через 4 нед (если стабильно) или 1-2 нед (после изменений)'];
      } else if (inr <= 4.5) {
        band = 'Слегка выше'; color = '#F59E0B';
        details = `INR ${inr} выше ${targetRange}. Повышенный риск кровотечения.`;
        actions = ['Снизить дозу на 5-15 % или пропустить 1 дозу', 'Повторить INR через 3-7 дней', 'Исключить новые лекарства (амиодарон, фторхинолоны)'];
      } else if (inr <= 10 && !bleed) {
        band = 'Критически высокий'; color = '#EF4444';
        details = `INR ${inr} - высокий риск кровотечения без активного кровотечения.`;
        actions = ['Отменить варфарин 1-2 дозы', 'Витамин K 1-2.5 мг перорально', 'Контроль INR через 24 ч', 'При INR > 10 - 5 мг витамина K перорально'];
      } else {
        band = 'Жизнеугрожающий'; color = '#991B1B';
        details = `INR ${inr}${bleed ? ' + активное кровотечение' : ''}. Требуется экстренная реверсия.`;
        actions = ['Отменить варфарин', 'Витамин K 5-10 мг в/в медленно', 'ПКК (Protromplex) 25-50 МЕ/кг или СЗП 10-15 мл/кг', 'Гемостаз механический + консультация гематолога'];
      }
    } else if (ctx === 'doac') {
      band = 'INR ненадёжен'; color = '#9CA3AF';
      details = `INR не отражает эффект DOAC. Для оценки - анти-Xa (апиксабан, ривароксабан) или dTT/ecarin (дабигатран).`;
      actions = ['Определить анти-Xa (Xa-DOAC test) или TT/dTT', 'При кровотечении - идаруцизумаб (дабигатран) / андексанет альфа (Xa-ингибиторы)'];
    } else if (ctx === 'liver') {
      band = inr > 1.5 ? 'Коагулопатия' : 'Норма для печени'; color = inr > 2 ? '#EF4444' : '#F59E0B';
      details = `INR ${inr} при печёночной недостаточности отражает снижение синтеза факторов II, VII, IX, X. Не всегда коррелирует с кровоточивостью (дисбаланс про-/антикоагулянтов).`;
      actions = ['MELD = 3.78×ln[билирубин] + 11.2×ln[INR] + 9.57×ln[Cr] + 6.43', 'Витамин K 10 мг в/в × 3 дня при подозрении на дефицит', 'При активном кровотечении - СЗП 10-15 мл/кг ± ПКК', 'Профилактика ВТЭ у большинства пациентов (INR не защищает)'];
    } else if (ctx === 'dic') {
      band = 'ДВС-синдром'; color = inr > 1.5 ? '#EF4444' : '#F59E0B';
      details = `INR ${inr} при ДВС - часть диагностических критериев ISTH. Параллельно - тромбоциты, D-димер, фибриноген.`;
      actions = ['Лечить причину: сепсис, травма, акушерство, онкология', 'СЗП 10-15 мл/кг при кровотечении и INR > 1.5', 'Тромбоциты < 50 × 10⁹/л + кровотечение → тромбоцитарная масса', 'Фибриноген < 1.5 г/л → криопреципитат 10 Ед или концентрат фибриногена'];
    } else {
      band = 'Дефицит витамина K'; color = inr > 1.5 ? '#F59E0B' : '#22C55E';
      details = `INR ${inr} при дефиците витамина K (мальабсорбция, антибиотики, голодание, обструкция желчных путей).`;
      actions = ['Витамин K 5-10 мг перорально или медленно в/в', 'Устранить причину (лечение холестаза, смена антибиотика)', 'Повторить INR через 12-24 ч'];
    }

    return {
      value: inr.toFixed(1), unit: 'INR',
      interpretation: band, color,
      details, actions,
      caveats: [
        'INR стандартизирован ТОЛЬКО для варфарина - при прочих состояниях интерпретация условна',
        'Целевой INR зависит от показания: ФП/ВТЭ 2-3, мех. клапан 2.5-3.5',
        'Реверсия варфарина: витамин K 5-10 мг + ПКК быстрее СЗП, меньше объёма',
        'DOAC: INR НЕ отражает антикоагуляцию, использовать анти-Xa / dTT',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Низкий', color: '#22C55E' },
          { min: 2, max: 3, label: 'Цель ФП/ВТЭ', color: '#059669' },
          { min: 3, max: 4.5, label: 'Повышен', color: '#F59E0B' },
          { min: 4.5, max: 10, label: 'Крит.', color: '#EF4444' },
          { min: 10, max: 15, label: 'Жизнеугр.', color: '#991B1B' },
        ],
        current: inr,
        unit: 'INR',
      },
      related: [
        { id: 'warfarin', title: 'Подбор варфарина' },
        { id: 'doac', title: 'Дозы DOAC' },
        { id: 'has-bled', title: 'HAS-BLED' },
      ],
      relatedCourses: [
        { id: '303.2', title: 'Гемостаз' },
        { id: '308.4', title: 'Антикоагулянтная терапия' },
      ],
    };
  },
  reference: 'ACCP CHEST 2022 Antithrombotic Therapy. Witt DM et al. Blood Adv 2018;2:3257.',
  countries: 'Международный (ACCP · ISTH · EHRA)',
  presets: [
    { label: 'Варфарин ФП, INR 2.5 (в цели)', values: { inr: 2.5, context: 'warfarin-afib', bleeding: false } },
    { label: 'Варфарин, INR 6.0 (без кровот.)', values: { inr: 6.0, context: 'warfarin-afib', bleeding: false } },
    { label: 'Цирроз, INR 1.8', values: { inr: 1.8, context: 'liver', bleeding: false } },
  ],
  info: `### Для чего используется
Интерпретация МНО (INR) в зависимости от клинического контекста: варфарин (целевые диапазоны), DOAC (INR неинформативен), печёночная недостаточность, ДВС, дефицит витамина K.

### Целевые INR по показанию
| Показание | Целевой INR |
|---|---|
| ФП, ВТЭ (стандарт) | 2.0-3.0 |
| Механический аортальный клапан | 2.0-3.0 |
| Механический митральный клапан | 2.5-3.5 |
| Рецидив ВТЭ на варфарине | 2.5-3.5 |
| Антифосфолипидный синдром | 2.5-3.5 (high-risk) |

### Реверсия варфарина
| INR / ситуация | Действие |
|---|---|
| INR 4.5-10, нет кровотечения | Пропустить 1-2 дозы ± витамин K 1-2.5 мг per os |
| INR > 10, нет кровотечения | Витамин K 5 мг per os |
| Кровотечение, любой INR | Витамин K 5-10 мг в/в + ПКК 25-50 МЕ/кг |

### DOAC vs INR
DOAC (апиксабан, ривароксабан, дабигатран) - INR НЕ отражает антикоагулянтный эффект. Использовать:
- Апиксабан/ривароксабан/эдоксабан → анти-Xa (калиброванный для DOAC)
- Дабигатран → dTT (разведённый тромбиновый тест) или ecarin clotting time

### Источник
ACCP CHEST 2022;162:e207. Witt DM et al. Blood Adv 2018;2:3257 (AC guidelines).`,
};

export default runner;
