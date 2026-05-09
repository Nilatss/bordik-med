/**
 * Runner: neo-hypothermia-transport — Управление гипотермией при транспорте
 *
 * NEONATOLOGY MODULE A41 (P2).
 *
 * Классификация и тактика при гипотермии у новорождённого (особенно
 * в условиях транспорта или реанимации в родзале).
 *
 * SOURCES:
 *   - WHO Recommendations on Newborn Health (2017) — Thermal protection
 *   - WHO Pocket Book of Hospital Care for Children (2013)
 *   - NRP 8 ed. 2021 — Chapter 7 Thermal Management
 *   - КР МЗ РФ "Гипотермия новорождённого" / "Транспортировка н/р"
 *   - Helping Babies Survive — Essential Care for Every Baby
 *
 * Классификация WHO:
 *   - Норма:           36.5-37.5 °C
 *   - Холодовой стресс (mild): 36.0-36.4 °C
 *   - Умеренная гипотермия:    32.0-35.9 °C
 *   - Тяжёлая гипотермия:      < 32.0 °C
 *
 * Бортовая (rectal) температура. Аксиллярная — 0.3-0.5 °C ниже.
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  countries: 'Международный (WHO 2017 / NRP 8 ed.) · РФ',
  reference: 'WHO Newborn Health 2017; NRP 8 ed. Ch. 7; КР МЗ РФ "Гипотермия / Транспортировка н/р".',
  inputs: [
    {
      id: 'temp_class',
      label: 'Температура тела (rectal/core)',
      type: 'select',
      options: [
        { value: '0', label: '36.5-37.5 °C — норма', points: 0 },
        { value: '1', label: '36.0-36.4 °C — холодовой стресс (mild)', points: 1 },
        { value: '2', label: '32.0-35.9 °C — умеренная гипотермия', points: 2 },
        { value: '3', label: '< 32.0 °C — тяжёлая гипотермия', points: 3 },
      ],
    },
    {
      id: 'preterm',
      label: 'Преждевременно рождённый (< 32 нед)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'transport',
      label: 'В процессе транспорта / межгоспитального переноса',
      type: 'checkbox',
      points: 0,
    },
  ],
  bands: [
    {
      min: 0,
      max: 0,
      label: 'Норма',
      color: '#22C55E',
      description: 'Температура в пределах нормы (36.5-37.5 °C).',
      actions: [
        'Поддержание golden hour: cap, polyethylene wrap, кожа-к-коже',
        'Контроль температуры q15 мин в первые 1-2 ч',
        'Целевой servo-controlled инкубатор @ 36.8 °C ± 0.3',
      ],
    },
    {
      min: 1,
      max: 1,
      label: 'Холодовой стресс',
      color: '#84CC16',
      description: 'Mild hypothermia — раннее вмешательство.',
      actions: [
        'Сухие тёплые полотенца; cap для головы',
        'Кенгуру (кожа-к-коже) с матерью если стабилен',
        'Servo-controlled инкубатор; setpoint 0.5-1 °C выше body temp',
        'Контроль температуры q15-30 мин',
        'Гликемия — гипогликемия часто сочетается',
        'Без активного rewarming если только mild',
      ],
    },
    {
      min: 2,
      max: 3,
      label: 'Умеренная гипотермия',
      color: '#F59E0B',
      description: '32-35.9 °C — активное согревание.',
      actions: [
        'Полиэтиленовая обёртка (wrap) + cap (для < 32 нед — без сушки сначала)',
        'Servo-controlled инкубатор max temp; air mode 38-39 °C',
        'Тёплый матрас (radiant warmer + chemical mattress 38-40 °C)',
        'Согревание скоростью 0.5 °C/ч (не быстрее — риск шока)',
        'Тёплые внутривенные жидкости; глюкоза при гипогликемии',
        'Мониторинг: ЧСС, RR, SpO₂, гликемия q30 мин',
        'Документировать причину: cold trauma, sepsis, asphyxia',
      ],
    },
    {
      min: 4,
      max: 4,
      label: 'Тяжёлая гипотермия',
      color: '#7F1D1D',
      description: '< 32 °C — экстренная интенсивная терапия.',
      actions: [
        'НЕМЕДЛЕННО: warm room, polyethylene wrap, cap, chemical mattress',
        'Servo-controlled инкубатор max + radiant warmer',
        'Тёплые IV жидкости (37 °C) — болюс 10-20 мл/кг при шоке',
        'Согревание 0.5 °C/ч (агрессивное rewarming → cold shock)',
        'Кардиомониторинг — высокий риск bradycardia, аритмий',
        'Газы крови, лактат, гликемия — метаболический ацидоз ожидаем',
        'Антибиотики (ампициллин + гентамицин) — sepsis в дифф. диагнозе',
        'Coag panel — DIC возможен',
        'Connect ECMO-центр / выезд бригады если ухудшается',
      ],
    },
  ],
  caveats: [
    'Гипогликемия часто сопровождает гипотермию — контроль гликемии q30-60 мин до нормы',
    'У ELBW (< 1000 г) — radiant warmer + servo control + polyethylene wrap критичны (потеря 1 °C/мин без них)',
    'Rewarming быстрее 0.5 °C/ч может вызвать "rewarming shock" (vasodilatation, гипотензия)',
    'Hypothermic infants — высокий риск sepsis (особенно coag-negative staph) — пульс-оксиметр + cultures',
    'У преждевременно рождённых < 32 нед — НЕ сушить перед polyethylene wrap (сохраняет vernix + влагу)',
    'WHO рекомендует transport температуру 36.5-37.5 °C cb измерения (rectal или skin axillary)',
    'Inadvertent hypothermia — VLBW < 1500 г, частота 30-50 % при стандартной помощи; снижается до < 5 % при QI bundle',
  ],
  related: [
    { id: 'apgar', title: 'Apgar' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
    { id: 'neo-hie-cooling', title: 'TH eligibility' },
    { id: 'neo-fluid', title: 'Жидкость по дням жизни' },
  ],
  info: `### Hypothermia management у новорождённого

Классификация (WHO 2017) и тактика согревания, особенно в условиях
родзала и межгоспитального транспорта.

### Классификация WHO

| Категория | Температура | Тактика |
|---|---|---|
| **Норма** | 36.5-37.5 °C | Поддержание |
| **Холодовой стресс (mild)** | 36.0-36.4 | Раннее вмешательство |
| **Умеренная** | 32.0-35.9 | Активное согревание |
| **Тяжёлая** | < 32.0 | Экстренная ИТ |

### Меры профилактики (golden hour)

1. **Operating room temp** ≥ 25 °C (≥ 26 °C для < 32 нед)
2. **Радиант-warmer + servo-controlled** инкубатор
3. **Polyethylene wrap** (для < 32 нед — без сушки сначала)
4. **Chemical mattress** (Transwarmer 40 °C)
5. **Cap** на голову (потеря через scalp ≈ 25 % всей body heat у новорождённого)
6. **Тёплые полотенца** для термин
7. **Кенгуру** с матерью если стабилен

### Пороги rewarming

- **Скорость:** 0.5 °C/ч (не быстрее — rewarming shock)
- **Цель:** 36.8 °C ± 0.3
- **Мониторинг:** ЧСС, RR, SpO₂, гликемия q30 мин
- **IV жидкости:** тёплые (37 °C)

### Транспорт (WHO HBB protocol)

- Pre-transport температура: 36.5-37.5 °C
- Servo-controlled transport инкубатор
- Polyethylene wrap + chemical mattress + cap
- Документация temp каждые 15-30 мин

### Холодовой стресс — ассоциированные осложнения

| Осложнение | Механизм |
|---|---|
| Гипогликемия | Anaerobic glycolysis, ↑ glucose use |
| Метаболический ацидоз | Lactate accumulation |
| Респираторный distress | ↑ surfactant inactivation |
| ВЖК | Vasoconstriction, ↑ ICP |
| NEC | Mesenteric vasoconstriction |
| Sepsis ↑ риск | Compromised immunity |
| DIC (тяжёлая) | Activation coagulation cascade |

### Специально для VLBW < 1500 г

Inadvertent hypothermia 30-50 % при стандартной помощи. QI bundle
(checklists, polyethylene wrap, prewarmed ОР, immediate kangaroo) →
< 5 %.

### Источники

- WHO Recommendations on Newborn Health (2017)
- WHO Pocket Book of Hospital Care for Children (2013)
- NRP 8 ed. 2021 — Chapter 7 Thermal Management
- КР МЗ РФ "Гипотермия / Транспортировка н/р" (2024)
- Helping Babies Survive — Essential Care for Every Baby
`,
};

export default runner;
