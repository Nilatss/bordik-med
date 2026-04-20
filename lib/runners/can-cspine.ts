// @ts-nocheck
/** Runner: can-cspine - Canadian C-Spine Rule (Stiell 2001) + NEXUS (Hoffman 2000) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'rule',
      label: 'Правило',
      type: 'select',
      options: [
        { value: 'ccr', label: 'Canadian C-Spine Rule (CCR, Stiell 2001)' },
        { value: 'nexus', label: 'NEXUS Low-Risk Criteria (Hoffman 2000)' },
      ],
    },
    { id: 'highRisk_age65', label: 'CCR: возраст ≥ 65 лет', type: 'checkbox' },
    { id: 'highRisk_mech', label: 'CCR: опасный механизм (падение с > 1 м, вертикальная нагрузка > 3 м, ДТП на скорости > 100 км/ч, переворот, выброс, мотоцикл, велосипед)', type: 'checkbox' },
    { id: 'highRisk_paraest', label: 'CCR: парестезии в конечностях', type: 'checkbox' },
    { id: 'lowRisk_mva', label: 'CCR low-risk: простое ДТП «в зад» (не выброс, не переворот, не грузовик)', type: 'checkbox' },
    { id: 'lowRisk_sitting', label: 'CCR low-risk: сидит в ED', type: 'checkbox' },
    { id: 'lowRisk_ambul', label: 'CCR low-risk: ходил самостоятельно (в любое время)', type: 'checkbox' },
    { id: 'lowRisk_delayed', label: 'CCR low-risk: отсроченное появление боли в шее', type: 'checkbox' },
    { id: 'lowRisk_nomidline', label: 'CCR low-risk: нет болезненности по средней линии шеи', type: 'checkbox' },
    { id: 'rotate', label: 'CCR: пациент способен активно повернуть шею на 45° в обе стороны', type: 'checkbox' },
    { id: 'nexus_midline', label: 'NEXUS: болезненность по средней линии шеи', type: 'checkbox' },
    { id: 'nexus_focal', label: 'NEXUS: очаговый неврологический дефицит', type: 'checkbox' },
    { id: 'nexus_ams', label: 'NEXUS: изменённое сознание', type: 'checkbox' },
    { id: 'nexus_intox', label: 'NEXUS: интоксикация', type: 'checkbox' },
    { id: 'nexus_distract', label: 'NEXUS: отвлекающая травма', type: 'checkbox' },
  ],
  compute: (v) => {
    const rule = String(v.rule || 'ccr');
    if (rule === 'nexus') {
      const present = [v.nexus_midline, v.nexus_focal, v.nexus_ams, v.nexus_intox, v.nexus_distract].some((x) => x === true);
      if (!present) {
        return {
          value: 'Нет',
          interpretation: 'Визуализация не требуется (NEXUS criteria все отсутствуют)',
          color: '#22C55E',
          details: 'Все 5 NEXUS low-risk критериев отсутствуют → клинически c-spine очищен без рентгена/CT. NPV ≈ 99.8%.',
          actions: ['Снять иммобилизацию', 'Клиническое наблюдение', 'При появлении симптомов - повторная оценка'],
          caveats: ['Sensitivity ~99%, но ниже, чем у CCR (100% в валидации)', 'NEXUS менее специфичен - больше ложно-положительных'],
          related: [ { id: 'pecarn-cspine', title: 'PECARN C-Spine (дети)' }, { id: 'can-ct-head', title: 'Canadian CT Head' }, { id: 'nihss', title: 'NIHSS' } ],
          relatedCourses: [ { id: '300.4', title: 'Неотложная помощь' } ],
        };
      }
      return {
        value: 'Да',
        interpretation: 'Показана визуализация (есть ≥1 NEXUS критерий)',
        color: '#DC2626',
        details: 'Хотя бы один из 5 NEXUS критериев присутствует → показана CT шейного отдела.',
        actions: ['CT c-spine (по умолчанию) или рентген в 3 проекциях', 'Сохранить иммобилизацию', 'Консультация нейрохирурга при нестабильности'],
        caveats: ['Распивочная и пожилые - ложно-положительные', 'Distracting injury - субъективно'],
        related: [ { id: 'pecarn-cspine', title: 'PECARN C-Spine' }, { id: 'can-ct-head', title: 'Canadian CT Head' } ],
        relatedCourses: [ { id: '300.4', title: 'Неотложная помощь' } ],
      };
    }
    // CCR
    const hasHigh = v.highRisk_age65 === true || v.highRisk_mech === true || v.highRisk_paraest === true;
    if (hasHigh) {
      return {
        value: 'Да',
        interpretation: 'Показана визуализация (CCR: есть high-risk фактор)',
        color: '#DC2626',
        details: 'Возраст ≥ 65, опасный механизм или парестезии - абсолютное показание к CT c-spine.',
        actions: ['CT c-spine (золотой стандарт при политравме)', 'Сохранить жёсткий воротник', 'Консультация нейрохирурга при выявлении повреждения'],
        caveats: ['CCR не валидирован для < 16 лет, беременных, известной патологии позвоночника, ранее обращавшихся'],
        related: [ { id: 'pecarn-cspine', title: 'PECARN C-Spine (дети)' }, { id: 'can-ct-head', title: 'Canadian CT Head' }, { id: 'nihss', title: 'NIHSS' } ],
        relatedCourses: [ { id: '300.4', title: 'Неотложная помощь' } ],
      };
    }
    const lowRiskPresent = [v.lowRisk_mva, v.lowRisk_sitting, v.lowRisk_ambul, v.lowRisk_delayed, v.lowRisk_nomidline].some((x) => x === true);
    if (!lowRiskPresent) {
      return {
        value: 'Да',
        interpretation: 'Показана визуализация (нет low-risk фактора для безопасной оценки подвижности)',
        color: '#DC2626',
        details: 'Не выявлено ни одного из 5 low-risk факторов, допускающих оценку подвижности. По CCR → визуализация.',
        actions: ['CT c-spine', 'Сохранить воротник'],
        caveats: [],
        related: [ { id: 'pecarn-cspine', title: 'PECARN C-Spine' } ],
        relatedCourses: [ { id: '300.4', title: 'Неотложная помощь' } ],
      };
    }
    if (v.rotate === true) {
      return {
        value: 'Нет',
        interpretation: 'Визуализация не требуется (CCR: low-risk + ротация 45° сохранена)',
        color: '#22C55E',
        details: 'Нет high-risk, есть low-risk фактор + активная ротация 45° в обе стороны → c-spine клинически очищен. Sensitivity CCR = 100%, specificity ~42%.',
        actions: ['Снять воротник', 'Документация осмотра', 'При появлении боли/симптомов - переоценка'],
        caveats: ['CCR не валидирован для детей < 16 лет, беременных, ранее обращавшихся'],
        related: [ { id: 'pecarn-cspine', title: 'PECARN C-Spine' }, { id: 'nihss', title: 'NIHSS' } ],
        relatedCourses: [ { id: '300.4', title: 'Неотложная помощь' } ],
      };
    }
    return {
      value: 'Да',
      interpretation: 'Показана визуализация (не может активно повернуть шею 45°)',
      color: '#DC2626',
      details: 'Low-risk фактор есть, но ротация 45° невозможна → визуализация.',
      actions: ['CT c-spine', 'Сохранить воротник'],
      caveats: ['CCR не валидирован для детей < 16 лет, беременных'],
      related: [ { id: 'pecarn-cspine', title: 'PECARN C-Spine' } ],
      relatedCourses: [ { id: '300.4', title: 'Неотложная помощь' } ],
    };
  },
  reference: 'Stiell IG et al. The Canadian C-Spine Rule for radiography in alert and stable trauma patients. JAMA 2001;286:1841-1848. Hoffman JR et al. Validity of a set of clinical criteria to rule out injury to the cervical spine (NEXUS). N Engl J Med 2000;343:94-99.',
  countries: 'Международный',
  presets: [
    { label: 'CCR: молодой, ДТП сзади, ротирует', values: { rule: 'ccr', highRisk_age65: false, highRisk_mech: false, highRisk_paraest: false, lowRisk_mva: true, lowRisk_sitting: true, lowRisk_ambul: true, lowRisk_delayed: false, lowRisk_nomidline: true, rotate: true, nexus_midline: false, nexus_focal: false, nexus_ams: false, nexus_intox: false, nexus_distract: false } },
    { label: 'CCR: пожилой, падение', values: { rule: 'ccr', highRisk_age65: true, highRisk_mech: true, highRisk_paraest: false, lowRisk_mva: false, lowRisk_sitting: false, lowRisk_ambul: false, lowRisk_delayed: false, lowRisk_nomidline: false, rotate: false, nexus_midline: false, nexus_focal: false, nexus_ams: false, nexus_intox: false, nexus_distract: false } },
    { label: 'NEXUS: все 5 отсутствуют', values: { rule: 'nexus', highRisk_age65: false, highRisk_mech: false, highRisk_paraest: false, lowRisk_mva: false, lowRisk_sitting: false, lowRisk_ambul: false, lowRisk_delayed: false, lowRisk_nomidline: false, rotate: false, nexus_midline: false, nexus_focal: false, nexus_ams: false, nexus_intox: false, nexus_distract: false } },
  ],
  caveats: [
    'CCR: sensitivity 100%, NEXUS 99% (прямое сравнение Stiell 2003)',
    'Не применять к детям < 16 лет - см. PECARN C-Spine',
  ],
  info: `### Для чего используется
**Canadian C-Spine Rule (Stiell, 2001)** и **NEXUS (Hoffman, 2000)** - правила для исключения перелома шейного отдела у пациентов с тупой травмой без визуализации.

### Canadian C-Spine Rule (CCR)
**Шаг 1 - High-risk factor** (любой → визуализация):
- Возраст ≥ 65
- Опасный механизм (падение > 1 м, аксиальная нагрузка > 3 м, ДТП > 100 км/ч или с выбросом/переворотом, мотоцикл, велосипед)
- Парестезии в конечностях

**Шаг 2 - Low-risk factor** (любой → можно безопасно оценить ротацию):
- Простое ДТП «в зад»
- Сидит в ED
- Ходил самостоятельно в любое время
- Отсроченная боль в шее
- Нет болезненности по средней линии

**Шаг 3 - Ротация 45°** в обе стороны:
- Может → **нет визуализации**
- Не может → **визуализация**

### NEXUS Low-Risk Criteria
Все 5 критериев ДОЛЖНЫ отсутствовать → нет визуализации:
1. Болезненность по средней линии шеи
2. Очаговый неврологический дефицит
3. Изменённое сознание
4. Интоксикация
5. Отвлекающая травма

### Сравнение (Stiell 2003, N=8283)
| Критерий | Sens | Spec |
|---|---|---|
| CCR | 100% | 43% |
| NEXUS | 91% | 36% |

### Ограничения
- Оба не применимы к < 16 лет (→ PECARN C-Spine)
- NEXUS - "distracting injury" субъективен
- CCR не валидирован при беременности, известной патологии позвоночника

### Источники
- Stiell IG et al. *JAMA* 2001;286:1841
- Hoffman JR et al. *NEJM* 2000;343:94
- Stiell IG et al. *NEJM* 2003;349:2510 (прямое сравнение)
`,
};

export default runner;
