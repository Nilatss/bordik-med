// @ts-nocheck
/** Runner: eceb - Essential Care for Every Baby + ECSB (small babies) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'step',
      label: 'Шаг ECEB/ECSB',
      type: 'select',
      options: [
        { value: 'delivery', label: 'Delivery room care' },
        { value: 'skin', label: 'Skin-to-skin + cord clamping' },
        { value: 'apgar', label: 'Apgar 1 и 5 мин' },
        { value: 'feed', label: 'Early breastfeeding' },
        { value: 'thermo', label: 'Thermoregulation (KMC)' },
        { value: 'prev', label: 'Vitamin K + eye prophylaxis + screening' },
        { value: 'ecsb', label: 'ECSB - для недоношенных/SGA' },
      ],
    },
  ],
  compute: (v) => {
    const s = String(v.step);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      delivery: {
        title: 'Delivery room care',
        c: '#22C55E',
        details: 'Rутинная помощь новорождённому в родзале после успешного HBB (дышит самостоятельно).',
        actions: [
          'Тёплая чистая среда, тёплые полотенца',
          'Тщательно просушить тело, убрать влажное полотенце',
          'Шапочка',
          'Оценка Apgar 1 и 5 мин',
          'Пальпация пуповины для ЧСС (~14 с → ×10)',
        ],
      },
      skin: {
        title: 'Skin-to-skin + cord clamping',
        c: '#F59E0B',
        details: 'Немедленный skin-to-skin контакт - тепло, bonding, раннее грудное вскармливание. Отложенное пережатие пуповины улучшает запасы железа.',
        actions: [
          'Skin-to-skin с матерью ≥60 мин после рождения',
          'Отложенное пережатие пуповины ≥1 мин (до прекращения пульсации) при стабильности',
          'Покрыть ребёнка одеялом, шапочка',
          'Оценка дыхания / цвет / ЧСС во время контакта',
        ],
      },
      apgar: {
        title: 'Apgar 1 и 5 мин',
        c: '#4B8DF5',
        details: 'Apgar оценивает состояние новорождённого на 1-й и 5-й мин (при низком - 10-й, 15-й). 5 компонентов × 0-2 = макс 10.',
        actions: [
          'A - Appearance (цвет): 0 bleu/pale · 1 acrocyanosis · 2 pink',
          'P - Pulse: 0 none · 1 <100 · 2 ≥100',
          'G - Grimace (рефлекс): 0 none · 1 grimace · 2 cry/cough',
          'A - Activity (тонус): 0 flaccid · 1 some flexion · 2 active',
          'R - Respiration: 0 none · 1 irregular/слабый плач · 2 strong cry',
          '0-3 severe, 4-6 moderate, 7-10 reassuring',
        ],
      },
      feed: {
        title: 'Early breastfeeding',
        c: '#84CC16',
        details: 'Первое прикладывание в 1-й час жизни - улучшает выживаемость, колонизацию микробиомом, bonding.',
        actions: [
          'Initiate breastfeeding в первые 60 мин',
          'Exclusive breastfeeding 6 мес (ВОЗ)',
          'Оценить прилаживание (latch) и позицию',
          'Не давать prelacteal feeds (вода, гл. раствор) - WHO против',
        ],
      },
      thermo: {
        title: 'Thermoregulation / KMC',
        c: '#FB923C',
        details: 'Гипотермия = причина смерти и осложнений. Цель: подмышечная t 36.5-37.5 °C. Kangaroo Mother Care - для стабильных недоношенных/LBW.',
        actions: [
          'Измерить t каждые 30 мин первый час, затем 1 × 6 ч',
          'Warm chain: тёплая родзала (≥25°), тёплая реанимация, одеяло, шапка, ЗЗД',
          'Skin-to-skin contact (best for LBW)',
          'Kangaroo Mother Care ≥18 ч/сут для LBW/preterm',
          'Hypothermia: согрев skin-to-skin, одеяла, т radiant warmer',
        ],
      },
      prev: {
        title: 'Prevention: Vit K, eye, screening',
        c: '#3B82F6',
        details: 'Стандартная профилактика: витамин K, глазные капли, скрининги.',
        actions: [
          'Витамин K 1 мг IM (термин) / 0.5 мг (<1 кг) - профилактика HDN',
          'Эритромицин 0.5% или повидон-йод глаз (профилактика гонорейной офтальмии)',
          'BCG + HepB в первые 24 ч (где показано)',
          'Newborn screening: СГС, гипотиреоз, фенилкетонурия, кислотно-щелочной, слух',
          'Pulse oximetry screening (CCHD) ≥24 ч',
        ],
      },
      ecsb: {
        title: 'ECSB - small babies',
        c: '#7C2D12',
        details: 'Essential Care for Small Babies - для недоношенных <37 нед и/или <2500 г. KMC - основа.',
        actions: [
          'Kangaroo Mother Care (KMC) непрерывно, ≥18 ч/сут',
          'Exclusive breastfeeding (или сцеженное молоко по чашечке/ложке при трудностях)',
          'Частые кормления каждые 2-3 ч (меньше объём)',
          'Мониторинг: вес ежедневно, t, дыхание',
          'Prevention infection: чистые руки, чистый пуповинный остаток (хлоргексидин 4%)',
          'Follow-up через 1 нед, 1 мес, 2 мес и т.д.',
        ],
      },
    };
    const r = map[s] || map.delivery;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'ECEB/ECSB - часть HBS Suite (AAP-WHO-USAID)',
        'Для low-resource settings - нацелено на снижение неонатальной смертности',
        'KMC снижает смертность у LBW на ~40% (Cochrane review)',
      ],
      related: [
        { id: 'hbb', title: 'Helping Babies Breathe' },
        { id: 'nrp', title: 'NRP' },
        { id: 'apgar', title: 'Apgar' },
        { id: 'ballard', title: 'Ballard' },
        { id: 'ilcor', title: 'ILCOR Neonatal' },
      ],
      relatedCourses: [
        { id: '203.9', title: 'Неонатология' },
        { id: '302.2', title: 'Педиатрия' },
      ],
    };
  },
  reference: 'American Academy of Pediatrics / WHO / USAID. Essential Care for Every Baby (ECEB) 2014; Essential Care for Small Babies (ECSB) 2015. https://www.aap.org/helpingbabiessurvive',
  countries: 'AAP / ВОЗ / USAID - global low-resource settings',
  presets: [
    { label: 'Delivery room', values: { step: 'delivery' } },
    { label: 'Skin-to-skin', values: { step: 'skin' } },
    { label: 'Apgar', values: { step: 'apgar' } },
    { label: 'Breastfeeding', values: { step: 'feed' } },
    { label: 'KMC / thermo', values: { step: 'thermo' } },
    { label: 'ECSB', values: { step: 'ecsb' } },
  ],
  info: `### Для чего используется
**ECEB (Essential Care for Every Baby)** + **ECSB (Essential Care for Small Babies)** - AAP-WHO-USAID программы ежедневной помощи новорождённым в low-resource settings. Следующий шаг после HBB.

### ECEB (термин / здоровый)
1. Delivery room care
2. Skin-to-skin + delayed cord clamping
3. Apgar 1/5 min
4. Early breastfeeding (first hour)
5. Thermoregulation
6. Vitamin K + eye prophylaxis
7. Newborn screening

### ECSB (преждевременные / SGA)
- **KMC** (Kangaroo Mother Care) - непрерывный skin-to-skin ≥18 ч/сут
- Частые малообъёмные кормления
- Профилактика инфекции (хлоргексидин 4% на пуповину)
- Follow-up плана

### Ключевые WHO рекомендации
- Немедленный skin-to-skin ≥60 мин
- Отложенное пережатие пуповины ≥1 мин (≥30 с у preterm)
- Exclusive breastfeeding 6 мес
- Vit K 1 мг IM
- Нет prelacteal feeds

### Эффективность KMC
KMC снижает смертность LBW на **40%** (Cochrane 2016).

### Источники
AAP. ECEB 2014, ECSB 2015. WHO newborn care recommendations 2022.
`,
};

export default runner;
