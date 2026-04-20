// @ts-nocheck
/** Runner: hbb - AAP-WHO Helping Babies Breathe 2010/2016 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'step',
      label: 'Шаг HBB',
      type: 'select',
      options: [
        { value: 'prep', label: 'Preparation (подготовка до рождения)' },
        { value: 'gm', label: 'The Golden Minute (первая минута)' },
        { value: 'vent', label: 'Ventilate with bag-mask' },
        { value: 'improve', label: 'Improve ventilation (если плохо)' },
        { value: 'suite', label: 'HBS Suite (Helping Babies Survive)' },
      ],
    },
  ],
  compute: (v) => {
    const s = String(v.step);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      prep: {
        title: 'Preparation',
        c: '#22C55E',
        details: 'Подготовка к каждым родам - 99% новорождённых стабилизируются простыми шагами. Ключ: тёплое место, чистое полотенце, мешок-маска, аспиратор.',
        actions: [
          'Чистая тёплая рабочая зона (≥25 °C)',
          '2 сухих чистых полотенца (одно для просушивания, одно для укрывания)',
          'Шапочка',
          'Bag-mask (Ambu 240-500 мл) + маски 0 и 1 размера',
          'Penguin-sucker (аспиратор)',
          'Часы / таймер (The Golden Minute)',
          '1 помощник, план делёжа ролей',
        ],
      },
      gm: {
        title: 'The Golden Minute',
        c: '#F59E0B',
        details: 'Первые 60 с жизни критичны. Если к 1 мин ребёнок не дышит эффективно - начать вентиляцию мешком-маской.',
        actions: [
          'Immediately after birth: сухое полотенце, тщательно просушить (≥30 с)',
          'Положение "sniffing"',
          'Очистить дыхательные пути (рот → нос) при необходимости',
          'Оценить дыхание: плач / регулярное дыхание = хорошо; gasping / apnoea = плохо',
          'Если не дышит к 60 с (1 мин) → НАЧАТЬ ВЕНТИЛЯЦИЮ мешком-маской',
          'Keep warm: skin-to-skin с матерью при хорошем дыхании',
        ],
      },
      vent: {
        title: 'Ventilate with bag-mask',
        c: '#EF4444',
        details: 'Ключевое вмешательство HBB - эффективная bag-mask вентиляция комнатным воздухом (21% O₂).',
        actions: [
          'Позиция головы: нейтральная / лёгкое разгибание',
          'Маска: плотно на нос и рот (не на глаза)',
          'Частота 40 вдохов/мин ("один-два-три, один-два-три")',
          'Видимый подъём грудной клетки',
          'Переоценка каждые 30 с - ЧСС пальпаторно на пуповине',
          'ЧСС ≥100 и дыхание эффективное → прекратить вентиляцию',
          'ЧСС 60-99 → продолжать, искать причины',
          'ЧСС <60 → вызов помощи, продолжать вентиляцию (CC - вне простого HBB)',
        ],
      },
      improve: {
        title: 'Improve ventilation',
        c: '#DC2626',
        details: 'Если мешок-маска не работает (нет подъёма груди / ЧСС не растёт) - исправить технику. Мнемоник HBB: check the seal, reposition the head, suction, open the mouth.',
        actions: [
          'Проверить прилегание маски (seal)',
          'Переустановить голову в "sniffing"',
          'Очистить рот и нос (suction)',
          'Слегка открыть рот ребёнка',
          'Сжимать мешок сильнее (адекватный объём)',
          'Если всё ещё нет улучшения → позвать на помощь / advanced care',
        ],
      },
      suite: {
        title: 'HBS Suite',
        c: '#4B8DF5',
        details: 'HBB - часть Helping Babies Survive suite (AAP-WHO-USAID). Модули для 1-го часа, 1-го дня, 1-й недели.',
        actions: [
          'Helping Babies Breathe (HBB) - реанимация при рождении',
          'Essential Care for Every Baby (ECEB) - первый час/день/неделя',
          'Essential Care for Small Babies (ECSB) - преждевременные / малый вес',
          'Helping Mothers Survive - акушерские экстренные',
          'Обучение: simulation с NeoNatalie, chain of peer-to-peer training',
        ],
      },
    };
    const r = map[s] || map.gm;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'HBB разработан для low-resource settings (no oxygen, no electricity)',
        'Ventilate with room air (21% O₂) - не требует кислорода',
        '99% новорождённых → стабилизируются initial steps ± PPV',
        'HBB 2nd ed 2016 - обновлён, упрощён алгоритм',
      ],
      related: [
        { id: 'nrp', title: 'AAP NRP 8th ed' },
        { id: 'eceb', title: 'ECEB / ECSB' },
        { id: 'apgar', title: 'Apgar' },
        { id: 'ilcor', title: 'ILCOR Neonatal' },
        { id: 'ballard', title: 'Ballard' },
      ],
      relatedCourses: [
        { id: '203.9', title: 'Неонатология' },
        { id: '302.2', title: 'Педиатрия' },
      ],
    };
  },
  reference: 'American Academy of Pediatrics. Helping Babies Breathe (HBB) 2nd edition 2016. Niermeyer S et al. Helping Babies Breathe: a neonatal resuscitation program for low-resource settings. Ann NY Acad Sci 2015;1347:40-52.',
  countries: 'АAP / ВОЗ / USAID - low-resource settings глобально',
  presets: [
    { label: 'Preparation', values: { step: 'prep' } },
    { label: 'Golden Minute', values: { step: 'gm' } },
    { label: 'Ventilate bag-mask', values: { step: 'vent' } },
    { label: 'Improve ventilation', values: { step: 'improve' } },
    { label: 'HBS Suite', values: { step: 'suite' } },
  ],
  info: `### Для чего используется
**Helping Babies Breathe (HBB)** - AAP-WHO-USAID программа реанимации новорождённых для low-resource settings. Упрощённый алгоритм на базе NRP, направлен на снижение неонатальной смертности в развивающихся странах.

### Ключевая концепция - The Golden Minute
Если к 60 с жизни ребёнок не дышит эффективно → начать вентиляцию bag-mask комнатным воздухом.

### Алгоритм
1. **Birth** - просушить тщательно
2. **Breathing?** - да → skin-to-skin + routine care
3. **Not breathing** → очистить airway + стимулировать
4. Still not breathing by 60 s → **Ventilate** bag-mask, 40/мин
5. Reassess ЧСС каждые 30 с

### Оборудование (low-cost)
- Bag-mask (Ambu / NeoNatalie)
- Penguin-sucker
- 2 полотенца
- Шапочка
- Часы

### HBS Suite (Helping Babies Survive)
1. **HBB** - at birth
2. **ECEB** - Essential Care for Every Baby (first hour/day/week)
3. **ECSB** - Essential Care for Small Babies (preterm/SGA)
4. **Helping Mothers Survive**

### Источники
AAP. HBB 2nd ed Provider Guide 2016.
Niermeyer S et al. *Ann NY Acad Sci* 2015;1347:40-52.
`,
};

export default runner;
