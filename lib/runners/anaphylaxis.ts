// @ts-nocheck
/** Runner: anaphylaxis — NIAID / WAO / EAACI 2020 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'weight',
      label: 'Масса тела',
      type: 'number',
      unit: 'кг',
      min: 3,
      max: 200,
      step: 0.5,
      quickValues: [5, 10, 20, 30, 50, 70, 80],
    },
    {
      id: 'grade',
      label: 'Тяжесть (Ring & Messmer)',
      type: 'select',
      options: [
        { value: '1', label: 'I — кожные симптомы (крапивница, зуд)' },
        { value: '2', label: 'II — мультисистемные без угрозы жизни' },
        { value: '3', label: 'III — выраженные (bronchospasm, hypotension, shock)' },
        { value: '4', label: 'IV — остановка кровообращения' },
      ],
    },
    {
      id: 'criterion',
      label: 'Критерий NIAID/WAO 2020',
      type: 'select',
      options: [
        { value: '1', label: 'Критерий 1: остро кожа/слизистые + дыхание/ССС/GI' },
        { value: '2', label: 'Критерий 2: после экспозиции 2+ системы' },
        { value: '3', label: 'Критерий 3: известный аллерген + гипотензия' },
      ],
    },
  ],
  compute: (v) => {
    const w = Number(v.weight) || 70;
    const grade = Number(v.grade) || 3;
    const criterion = String(v.criterion);

    // Epinephrine IM dose 0.01 mg/kg (1:1000 = 1 mg/mL), max 0.5 mg adult / 0.3 mg peds
    const isAdult = w >= 50;
    const epiMg = Math.min(0.01 * w, isAdult ? 0.5 : 0.3);
    const epiMl = epiMg; // 1:1000 = 1 mg/mL, so mg = mL
    const epiDoseText = `${epiMg.toFixed(2)} мг (${epiMl.toFixed(2)} мл 1:1000) в/м переднелатеральная поверхность бедра`;

    // Fluid bolus: 20 mL/kg crystalloid
    const fluidMl = 20 * w;

    // Diphenhydramine: 1 mg/kg IV, max 50 mg
    const dphMg = Math.min(1 * w, 50);
    // Methylprednisolone: 1-2 mg/kg IV, max 125 mg
    const mpMg = Math.min(1 * w, 125);

    let color = '#22C55E';
    let severity = 'Лёгкая';
    if (grade === 2) { color = '#F59E0B'; severity = 'Средняя'; }
    else if (grade === 3) { color = '#EF4444'; severity = 'Тяжёлая'; }
    else if (grade === 4) { color = '#7C2D12'; severity = 'Остановка кровообращения'; }

    const criterionText: Record<string, string> = {
      '1': 'Острое начало (минуты–часы) с вовлечением кожи/слизистых (крапивница, отёк) И как минимум одно из: (а) респираторный компромисс (диспноэ, wheeze, стридор, гипоксемия), (б) снижение АД / симптомы конечно-органной дисфункции.',
      '2': 'Два или более признаков после вероятного воздействия аллергена: (а) кожа/слизистые, (б) дыхание, (в) снижение АД, (г) персистирующие GI-симптомы (рвота, боль, диарея).',
      '3': 'Снижение АД после воздействия ИЗВЕСТНОГО аллергена (мин–часы): дети — возрастная гипотензия или снижение САД > 30%; взрослые — САД < 90 или снижение > 30% от базового.',
    };

    const actions = [
      `1. ЭПИНЕФРИН ${epiDoseText}`,
      'Повтор каждые 5–15 мин при сохранении / ухудшении симптомов (до 3 доз)',
      'Положение: лёжа, ноги приподняты (НЕ сидя, НЕ стоя — риск "empty ventricle")',
      'Беременные — на левом боку; одышка — полусидя; рвота — на бок',
      `Кислород высокопоточный: 6–10 л/мин через маску до SpO₂ ≥ 94%`,
      `Инфузия 0.9% NaCl ${fluidMl} мл (20 мл/кг) быстро, повторять до стабилизации АД`,
      'Мониторинг: ЭКГ, SpO₂, АД каждые 3–5 мин',
      `H1-блокатор (adjunct): дифенгидрамин ${dphMg} мг в/в (max 50 мг) — НЕ вместо эпинефрина`,
      'H2-блокатор (adjunct): ранитидин 50 мг в/в или фамотидин 20 мг в/в',
      `ГКС (adjunct): метилпреднизолон ${mpMg} мг в/в (max 125 мг) или гидрокортизон 200 мг в/в — профилактика бифазной реакции`,
      'Сальбутамол 2.5–5 мг небулайзер при сохраняющемся бронхоспазме',
      'Рефрактерная анафилаксия: эпинефрин в/в инфузия 0.1–1 мкг/кг/мин + глюкагон 1–5 мг в/в (особенно при β-блокаторах)',
      'Наблюдение 4–6 ч (лёгкая) / ≥ 6–8 ч (тяжёлая) в стационаре из-за риска бифазной реакции (до 20%)',
      'При выписке: EpiPen (0.15 мг < 25 кг; 0.3 мг ≥ 25 кг) × 2 шт., action plan, направление к аллергологу',
    ];

    return {
      value: `${severity} (степень ${grade})`,
      unit: '',
      interpretation: `Анафилаксия ${severity.toLowerCase()}. Критерий NIAID/WAO №${criterion}: ${criterionText[criterion] || ''} Доза эпинефрина в/м: ${epiDoseText}.`,
      color,
      details: `Масса ${w} кг → эпинефрин 0.01 мг/кг в/м = ${epiMg.toFixed(2)} мг (${epiMl.toFixed(2)} мл 1:1000). Максимум: ${isAdult ? '0.5 мг' : '0.3 мг'} (ребёнок). Внутримышечно (переднелатеральная поверхность бедра) — абсорбция быстрее, чем п/к.`,
      actions,
      caveats: [
        'Эпинефрин — ПЕРВАЯ линия, нет абсолютных противопоказаний при анафилаксии',
        'Антигистамины и ГКС — НЕ заменяют эпинефрин (действуют слишком поздно)',
        'НЕ использовать эпинефрин 1:10000 в/в при нормотензии (риск аритмии, гипертонии, ишемии)',
        'Бифазная реакция: 1–20% пациентов, в первые 1–72 ч после разрешения',
        'β-блокаторы могут ослабить ответ на эпинефрин → глюкагон 1–5 мг в/в',
        'Пищевая анафилаксия с астмой — высокий риск фатальной реакции',
        'Беременность: эпинефрин БЕЗОПАСЕН, категория C, но жизнесохраняющий',
      ],
      scale: {
        segments: [
          { label: 'I', min: 1, max: 1.99, color: '#22C55E', description: 'Кожа/слизистые' },
          { label: 'II', min: 2, max: 2.99, color: '#F59E0B', description: 'Мультисистемная' },
          { label: 'III', min: 3, max: 3.99, color: '#EF4444', description: 'Выраженная (shock/bronchospasm)' },
          { label: 'IV', min: 4, max: 4.99, color: '#7C2D12', description: 'Остановка кровообращения' },
        ],
        current: grade,
        unit: 'степень',
      },
      related: [
        { id: 'ahs-ecc', title: 'AHA / ERC dispatch' },
        { id: 'bls-acls', title: 'BLS / ACLS' },
        { id: 'erc', title: 'ERC Guidelines' },
        { id: 'ru-skoraya', title: 'СМП РФ' },
        { id: 'shock-index', title: 'Shock Index' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '303.4', title: 'Аллергология-иммунология' },
        { id: '301.1', title: 'Анестезиология-реаниматология' },
      ],
    };
  },
  reference: 'Cardona V et al. World Allergy Organization anaphylaxis guidance 2020. World Allergy Organ J 2020;13(10):100472. Muraro A et al. EAACI guidelines: Anaphylaxis (2021 update). Allergy 2022;77(2):357–377. Sampson HA et al. Second NIAID/FAAN symposium on anaphylaxis. J Allergy Clin Immunol 2006;117:391.',
  countries: 'WAO / EAACI / NIAID — международно',
  presets: [
    { label: 'Взрослый 70 кг, III ст.', values: { weight: 70, grade: '3', criterion: '1' } },
    { label: 'Ребёнок 20 кг, II ст.', values: { weight: 20, grade: '2', criterion: '2' } },
    { label: 'Ребёнок 10 кг, III ст.', values: { weight: 10, grade: '3', criterion: '1' } },
    { label: 'Взрослый 80 кг, IV (арест)', values: { weight: 80, grade: '4', criterion: '3' } },
    { label: 'Младенец 5 кг, II ст.', values: { weight: 5, grade: '2', criterion: '1' } },
  ],
  info: `### Для чего используется
Диагностика и догоспитальное/стационарное лечение **анафилаксии** по критериям **NIAID/FAAN 2006 + WAO 2020 + EAACI 2021**.

### Критерии NIAID/WAO 2020 (достаточно одного из трёх)
1. Остро кожа/слизистые + респираторный компромисс ИЛИ гипотензия
2. Два+ признаков после вероятной экспозиции: кожа / дыхание / АД / стойкие GI
3. Гипотензия после ИЗВЕСТНОГО аллергена

### Степени тяжести (Ring & Messmer)
| Степень | Проявления |
|---|---|
| I | Кожа/слизистые |
| II | Мультисистемные без угрозы жизни |
| III | Bronchospasm, hypotension, shock |
| IV | Остановка кровообращения |

### Эпинефрин в/м — первая линия
- Доза: **0.01 мг/кг** (1:1000 = 1 мг/мл)
- Max: **0.5 мг** взрослый, **0.3 мг** ребёнок
- Место: передне-латеральная поверхность бедра
- Повтор каждые **5–15 мин** × до 3 доз
- EpiPen: 0.15 мг (< 25 кг), 0.3 мг (≥ 25 кг)

### Позиция
- **Лёжа, ноги приподняты** (gold standard)
- Беременные — на левом боку
- Одышка — полусидя
- **НЕ стоя / НЕ сидя** — риск пустого желудочка → смерть

### Adjuncts (не замена эпинефрина)
- H1: дифенгидрамин 1 мг/кг (max 50 мг)
- H2: ранитидин 50 мг / фамотидин 20 мг
- ГКС: метилпреднизолон 1 мг/кг (max 125 мг)
- Бронходилататор при bronchospasm: сальбутамол небулайзер

### Рефрактерная анафилаксия
- Эпинефрин в/в инфузия 0.1–1 мкг/кг/мин
- Глюкагон 1–5 мг в/в (β-блокаторы)
- Вазопрессоры (норэпинефрин, вазопрессин)

### Наблюдение
- Лёгкая: 4–6 ч
- Тяжёлая: ≥ 6–8 ч
- Бифазная реакция: 1–20%, в первые 72 ч

### Источники
Cardona V et al. WAO anaphylaxis guidance 2020. *WAO J* 2020;13:100472.
Muraro A et al. EAACI anaphylaxis 2021. *Allergy* 2022;77:357.
Sampson HA et al. NIAID/FAAN 2006. *JACI* 2006;117:391.
`,
};

export default runner;
