// @ts-nocheck
/** Runner: ktas — Korean Triage and Acuity Scale */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Южная Корея (национальный стандарт triage ED с 2016); также внедряется в Монголии, Вьетнаме, ряде стран Ближнего Востока',
  reference: 'Korean Triage and Acuity Scale (KTAS) — адаптация CTAS (Canadian Triage and Acuity Scale) к корейской популяции. Obligatory national standard от Korean Ministry of Health (MoHW) с 2016 для всех ED (emergency departments). KTAS взрослая (adult) + педиатрическая (pediatric, pKTAS) версии. https://www.ktas.org/',
  inputs: [
    {
      id: 'level',
      label: 'KTAS уровень',
      type: 'select',
      options: [
        { value: '1', label: 'Level 1 — Resuscitation (реанимация, immediate life threat)' },
        { value: '2', label: 'Level 2 — Emergent (жизнеугрожающее, требует быстрого вмешательства)' },
        { value: '3', label: 'Level 3 — Urgent (серьёзное, возможно прогрессирование)' },
        { value: '4', label: 'Level 4 — Less urgent (умеренное, может подождать)' },
        { value: '5', label: 'Level 5 — Non-urgent (несрочное)' },
      ],
    },
    {
      id: 'population',
      label: 'Популяция',
      type: 'select',
      options: [
        { value: 'adult', label: 'Adult KTAS (≥15 лет)' },
        { value: 'pediatric', label: 'Pediatric KTAS (pKTAS, <15 лет)' },
      ],
    },
  ],
  presets: [
    { label: 'Level 2 — инсульт, adult', values: { level: '2', population: 'adult' } },
    { label: 'Level 3 — педиатрия', values: { level: '3', population: 'pediatric' } },
    { label: 'Level 1 — STEMI/остановка', values: { level: '1', population: 'adult' } },
  ],
  compute: (v) => {
    const level = String(v.level || '3');
    const pop = String(v.population || 'adult');
    const map: Record<string, { label: string; color: string; target: string; examples: string; disposition: string }> = {
      '1': {
        label: 'Resuscitation — реанимация',
        color: '#3B82F6', // blue
        target: 'Немедленно (0 мин) — врач у постели при поступлении',
        examples: 'Остановка сердца/дыхания, тяжёлый шок, кома (GCS ≤8), активное massive bleeding, анафилаксия с шоком, STEMI с нестабильностью, инсульт с нарушением сознания, severe respiratory distress, epileptic status.',
        disposition: 'Resuscitation room; ≥1:1 nurse; немедленные intervention (airway, defibrillator, chest tube, vasopressors).',
      },
      '2': {
        label: 'Emergent — неотложное',
        color: '#DC2626', // red
        target: '≤10 минут до врачебного осмотра',
        examples: 'STEMI стабильный, острый инсульт в терапевтическом окне, сепсис без шока, умеренно-тяжёлый астматический приступ, severe trauma без shock, diabetic ketoacidosis, acute severe pain (9-10/10), подозрение на aortic dissection.',
        disposition: 'Monitored bed, ECG/labs/imaging в первые 10-30 мин.',
      },
      '3': {
        label: 'Urgent — срочное',
        color: '#FAAD14', // yellow
        target: '≤30 минут до врачебного осмотра',
        examples: 'Умеренная боль в животе, moderate head injury без неврологии, bronchopneumonia стабильная, умеренная травма, лихорадка 39°C без признаков сепсиса, умеренно-тяжёлая dehydration, moderate asthma.',
        disposition: 'Обычная ED койка; может ждать 30-60 мин без значительного риска.',
      },
      '4': {
        label: 'Less urgent — менее срочное',
        color: '#17E56C', // green
        target: '≤60 минут',
        examples: 'Minor trauma (ушибы, simple lacerations), mild URI, легкая рвота/диарея, urinary symptoms без лихорадки, hypertension без симптомов, минорные ожоги.',
        disposition: 'Ambulatory corner ED; fast-track зона.',
      },
      '5': {
        label: 'Non-urgent — несрочное',
        color: '#64748B', // gray
        target: '≤120 минут',
        examples: 'Выписка рецептов, chronic stable conditions, минорные жалобы без остроты (persistent но minor cough, chronic back pain без красных флагов).',
        disposition: 'Fast-track или перенаправление в амбулаторию; образовательный совет.',
      },
    };
    const e = map[level];
    return {
      value: `KTAS Level ${level}`,
      unit: pop === 'pediatric' ? 'pKTAS' : 'KTAS',
      color: e.color,
      interpretation: `${e.label} — target: ${e.target}`,
      details: `**Level:** ${level} (${e.label})\n\n**Популяция:** ${pop === 'pediatric' ? 'Педиатрия (pKTAS, <15 лет)' : 'Взрослые (adult, ≥15 лет)'}\n\n**Целевое время до врача:** ${e.target}\n\n**Типичные примеры:** ${e.examples}\n\n**Disposition / организация:** ${e.disposition}\n\n**KTAS workflow:** первичная сортировка медсестрой triage → presenting complaint (по одной из 168 жалоб у adult / 155 у pKTAS) → модификаторы (гемодинамика, респираторный дистресс, неврология, боль, кровопотеря, температура, comorbidities) → Level 1-5.`,
      actions: [
        level === '1' ? 'Сразу в resuscitation room, мультидисциплинарная команда' : level === '2' ? 'Monitored bed, ECG + labs + imaging в первые 10 мин' : level === '3' ? 'ED койка, плановое обследование' : 'Fast-track / ambulatory',
        'Документировать presenting complaint (CEDIS list — 168 взрослых / 155 педиатрических)',
        'Применить модификаторы (пять первичных + secondary)',
        'Переоценивать: Level 2 — каждые 15 мин, Level 3 — 30 мин, Level 4 — 60 мин',
        pop === 'pediatric' ? 'Учитывать возраст-зависимые vital signs (pediatric Early Warning)' : 'Взрослые VS: HR, BP, RR, SpO₂, GCS',
        'KTAS ресурсы: https://www.ktas.org/',
      ],
      caveats: [
        'KTAS ≠ CTAS: адаптирована к корейской популяции, но структурно близка',
        'Обязательна для всех ED Южной Кореи с 2016 (MoHW decree)',
        'Pediatric KTAS (pKTAS) — отдельная шкала для <15 лет',
        'Переоценка (reassessment) обязательна: время зависит от уровня',
        'KTAS не оценивает нужду в ресурсах (как ESI) — только остроту',
        'Трening и сертификация medсестёр triage обязательны',
      ],
      related: [
        { id: 'news2', title: 'NEWS2' },
        { id: 'qsofa', title: 'qSOFA' },
        { id: 'jcs', title: 'JCS (Japan)' },
      ],
      relatedCourses: [
        { id: '304.1', title: 'Неотложная помощь' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
**KTAS (Korean Triage and Acuity Scale)** — национальный стандарт сортировки в приёмных отделениях Южной Кореи с 2016 года. Адаптация канадской CTAS к корейской популяции. Обязательна для всех ED по декрету MoHW.

### Уровни
| Level | Описание | Время до врача | Цвет |
|-------|----------|----------------|------|
| **1** | Resuscitation | Немедленно | Синий |
| **2** | Emergent | ≤10 мин | Красный |
| **3** | Urgent | ≤30 мин | Жёлтый |
| **4** | Less urgent | ≤60 мин | Зелёный |
| **5** | Non-urgent | ≤120 мин | Серый |

### Две версии
- **Adult KTAS** (≥15 лет) — 168 presenting complaints
- **Pediatric KTAS (pKTAS)** (<15 лет) — 155 complaints + возраст-зависимые VS

### Методология
1. Выбор presenting complaint из списка (CEDIS)
2. Применение модификаторов (5 первичных: гемодинамика, респираторный, неврология, боль, кровопотеря; + secondary)
3. Определение уровня 1-5
4. Переоценка в сроки зависимые от уровня

### Источники
- https://www.ktas.org/
- Kwon H et al. Korean Triage and Acuity Scale. Clin Exp Emerg Med 2018
- CTAS (Canadian Triage and Acuity Scale) — https://ctas-phctas.ca/`,
};
export default runner;
