/** Runner: ucla-shoulder - UCLA / ASES / Constant-Murley / DASH / QuickDASH */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'scale',
      label: 'Шкала',
      type: 'select',
      options: [
        { value: 'ucla', label: 'UCLA Shoulder Score (0-35, выше = лучше)' },
        { value: 'ases', label: 'ASES (0-100, выше = лучше)' },
        { value: 'constant', label: 'Constant-Murley (0-100, выше = лучше)' },
        { value: 'dash', label: 'DASH (0-100, НИЖЕ = лучше)' },
        { value: 'quickdash', label: 'QuickDASH (0-100, НИЖЕ = лучше)' },
      ],
    },
    {
      id: 'score',
      label: 'Суммарный балл',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      quickValues: [0, 20, 40, 60, 80, 100],
    },
  ],
  compute: (v) => {
    const scale = String(v.scale);
    const score = Number(v.score);
    let interpretation = '', color = '#22C55E', details = '', unit = 'баллов';
    let actions: string[] = [];

    if (scale === 'ucla') {
      if (score >= 34) { interpretation = 'Отличный (UCLA ≥ 34)'; color = '#22C55E'; }
      else if (score >= 29) { interpretation = 'Хороший'; color = '#84CC16'; }
      else if (score >= 21) { interpretation = 'Удовлетворительный'; color = '#F59E0B'; }
      else { interpretation = 'Плохой'; color = '#EF4444'; }
      details = 'UCLA Shoulder Score (Amstutz et al., 1981) - 5 доменов: pain (10), function (10), active forward flexion (5), strength flexion (5), satisfaction (5). Всего 0-35. Широко используется для оценки RTC repair и TSA.';
      actions = [
        'UCLA прост, но не валидирован так строго как ASES',
        'Подходит для исследований replacement arthroplasty',
      ];
    } else if (scale === 'ases') {
      if (score >= 80) { interpretation = 'Хороший/отличный (ASES)'; color = '#22C55E'; }
      else if (score >= 60) { interpretation = 'Умеренный'; color = '#84CC16'; }
      else if (score >= 40) { interpretation = 'Плохой'; color = '#F59E0B'; }
      else { interpretation = 'Очень плохой'; color = '#EF4444'; }
      details = 'ASES (Richards et al., 1994) - Pain (VAS 0-10 × 5 = 50) + Function (10 ADL × 0-3 × 5/3 = 50). Сумма 0-100. MCID ≈ 13,6; PASS ≈ 67 (RTC repair).';
      actions = [
        'Наиболее валидирован для шечных заболеваний (RTC, TSA, instability)',
        'Самозаполняемая форма - удобна для dashboards',
      ];
    } else if (scale === 'constant') {
      if (score >= 85) { interpretation = 'Отличный (Constant ≥ 85)'; color = '#22C55E'; }
      else if (score >= 70) { interpretation = 'Хороший'; color = '#84CC16'; }
      else if (score >= 55) { interpretation = 'Удовлетворительный'; color = '#F59E0B'; }
      else { interpretation = 'Плохой'; color = '#EF4444'; }
      details = 'Constant-Murley (1987) - Subjective 35 (pain 15 + ADL 20) + Objective 65 (ROM 40 + strength 25). Сумма 0-100. Нормализация по возрасту/полу рекомендована. MCID ≈ 10,4.';
      actions = [
        'Включает объективную оценку силы - требует динамометра (isobex)',
        'Рекомендован EFORT/SECEC как стандарт для европейских исследований',
      ];
    } else if (scale === 'dash') {
      if (score <= 15) { interpretation = 'Минимальная дисфункция (DASH)'; color = '#22C55E'; }
      else if (score <= 30) { interpretation = 'Лёгкая'; color = '#84CC16'; }
      else if (score <= 50) { interpretation = 'Умеренная'; color = '#F59E0B'; }
      else { interpretation = 'Тяжёлая'; color = '#EF4444'; }
      details = 'DASH (Hudak et al., 1996) - 30 пунктов + optional Work/Sports модули. 0-100, НИЖЕ = лучше. Универсален для всей верхней конечности. MCID ≈ 10,2; PASS ≈ 32.';
      actions = [
        'Подходит, если патология охватывает и плечо, и локоть/кисть',
        'Для быстрой оценки - QuickDASH (11 items)',
      ];
    } else if (scale === 'quickdash') {
      if (score <= 15) { interpretation = 'Минимальная (QuickDASH)'; color = '#22C55E'; }
      else if (score <= 30) { interpretation = 'Лёгкая'; color = '#84CC16'; }
      else if (score <= 50) { interpretation = 'Умеренная'; color = '#F59E0B'; }
      else { interpretation = 'Тяжёлая'; color = '#EF4444'; }
      details = 'QuickDASH (2005) - 11 пунктов из DASH. 0-100, НИЖЕ = лучше. Валидирован как эквивалент полного DASH. MCID ≈ 8; PASS ≈ 25.';
      actions = [
        'Оптимален для регистров и рутинной оценки',
        'При сомнениях переходить на полный DASH',
      ];
    }

    return {
      value: String(score),
      unit,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'ASES и Constant - наиболее используемые в исследовательской литературе для плеча',
        'UCLA - историческая шкала, чаще для TSA',
        'DASH / QuickDASH - универсальны, охватывают всю верхнюю конечность',
        'Constant зависит от силы → в острых состояниях (боль, слабость) необъективен',
        'Все PROMs субъективны; дополнить объективными: ROM (AFE, ER, IR), lift-off test, belly-press, Hawkins, Neer, Speed',
      ],
      related: [
        { id: 'ikdc', title: 'IKDC / KOOS (колено)' },
        { id: 'harris-hip', title: 'Harris Hip / Oxford' },
        { id: 'neer', title: 'Neer classification (proximal humerus)' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Травматология' },
        { id: '201.3', title: 'Ревматология' },
      ],
    };
  },
  reference: 'Amstutz HC et al. UCLA anatomic total shoulder arthroplasty. Clin Orthop 1981;155:7-20. Richards RR et al. A standardized method for the assessment of shoulder function (ASES). J Shoulder Elbow Surg 1994;3:347-52. Constant CR, Murley AH. A clinical method of functional assessment of the shoulder. Clin Orthop 1987;214:160-4. Hudak PL et al. DASH. Am J Ind Med 1996;29:602-8. Beaton DE et al. QuickDASH. J Bone Joint Surg Am 2005;87:1038-46.',
  countries: 'Международный',
  presets: [
    { label: 'UCLA post-RTC отличный', values: { scale: 'ucla', score: 33 } },
    { label: 'ASES хронический RTC tear', values: { scale: 'ases', score: 55 } },
    { label: 'Constant после TSA', values: { scale: 'constant', score: 80 } },
    { label: 'DASH 6 мес после фиксации предплечья', values: { scale: 'dash', score: 25 } },
    { label: 'QuickDASH минимальный', values: { scale: 'quickdash', score: 8 } },
  ],
  info: `### Для чего используется
PROMs для **плечевого сустава и верхней конечности**. Используются для оценки RTC repair, TSA/rTSA, нестабильности, impingement, исходов реабилитации.

### UCLA Shoulder Score (1981)
- **5 доменов**: pain (10), function (10), AFE (5), strength flexion (5), satisfaction (5)
- 0-35, ≥34 отлично, 29-33 хорошо, 21-28 удовл., <21 плохо
- Historically для TSA (Amstutz)

### ASES (1994)
- **Pain VAS × 5 = 50 + Function 10 ADL × 0-3 × 5/3 = 50**
- 0-100, выше = лучше
- MCID ≈ 13,6; PASS ≈ 67 (RTC repair)
- Наиболее широко используемый в RCT

### Constant-Murley (1987)
- **Subjective 35** (pain 15 + ADL 20) + **Objective 65** (ROM 40 + strength 25)
- 0-100, выше = лучше
- Требует объективного тестирования силы
- **Возраст/пол-скорректированный** вариант - для сравнений

### DASH (1996) / QuickDASH (2005)
- **DASH**: 30 пунктов + Work/Sports модули; 0-100, **НИЖЕ = лучше**
- **QuickDASH**: 11 пунктов; эквивалент полного DASH
- Универсальные для всей верхней конечности (плечо + локоть + кисть)
- MCID DASH ≈ 10,2; QuickDASH ≈ 8

### Выбор шкалы
| Ситуация | Предпочтительно |
|---|---|
| RTC repair / impingement | ASES ± Constant |
| Instability | ASES + WOSI |
| TSA / rTSA / hemi | ASES + Constant ± UCLA |
| Универсально (вся верхняя конечность) | QuickDASH |
| Исследования (Европа) | Constant |

### Источники
Amstutz HC et al. *Clin Orthop* 1981. Richards RR et al. *JSES* 1994. Constant CR, Murley AH. *Clin Orthop* 1987. Hudak PL et al. *Am J Ind Med* 1996. Beaton DE et al. *JBJS Am* 2005.
`,
};

export default runner;
