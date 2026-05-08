/** Runner: osce — OSCE station structure & rubrics */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (изначально UK/Canada; широко принят в мед образовании)',
  reference: 'Harden RM, Gleeson FA. Assessment of clinical competence using an objective structured clinical examination (OSCE). Med Educ. 1979;13(1):41-54. (оригинальная публикация OSCE)',
  inputs: [
    {
      id: 'station_type',
      label: 'Тип OSCE станции',
      type: 'select',
      options: [
        { value: 'history', label: 'History taking (сбор анамнеза)' },
        { value: 'exam', label: 'Physical examination (физикальное обследование)' },
        { value: 'procedure', label: 'Procedure / skill (процедурный навык)' },
        { value: 'communication', label: 'Communication / breaking bad news' },
        { value: 'interpret', label: 'Data interpretation (ЭКГ / лаб / изображение)' },
        { value: 'prescribing', label: 'Prescribing / safe medication' },
        { value: 'resus', label: 'Resuscitation (BLS/ACLS симуляция)' },
      ],
    },
  ],
  presets: [
    { label: 'Анамнез', values: { station_type: 'history' } },
    { label: 'Физикальное', values: { station_type: 'exam' } },
    { label: 'Коммуникация', values: { station_type: 'communication' } },
  ],
  compute: (v) => {
    const s = String(v.station_type || 'history');
    const map: Record<string, { title: string; rubric: string; time: string; pass: string }> = {
      history: { title: 'History taking', rubric: 'Introduction (identify self, role, consent, ICE = Ideas/Concerns/Expectations) · Presenting complaint (SOCRATES pain / HPI sequence) · Systems review · PMH/meds/allergies/FH/SH · Summarize + closing · Professional manner', time: '5-8 мин стандарт; 8-10 мин для сложных случаев', pass: 'Типично 70% из checklist + ≥ "Competent" на global rating. Обычно 20-30 checklist items.' },
      exam: { title: 'Physical examination', rubric: 'Introduction + consent + gel hands · Expose & position · Inspect → palpate → percuss → auscultate (IPPA) · Examine relevant systems · Thank patient + offer to cover · Present findings to examiner', time: '5-7 мин для single system; 10 мин для focused complaint (chest pain → cardio + resp)', pass: 'Sequence IPPA критично; missing вспомогательных манёвров (напр. Valsalva) — частая ошибка' },
      procedure: { title: 'Procedure / clinical skill', rubric: 'Introduction + consent + explain procedure · PPE / sterile technique · Equipment check · Perform procedure step-by-step · Post-procedure care + disposal sharps · Document', time: '5-8 мин (венепункция, в/в, injections); 10 мин (люмбальная пункция, катетеризация)', pass: 'Sharps safety и consent — often "critical fail" items (провал независимо от других пунктов)' },
      communication: { title: 'Communication / breaking bad news', rubric: 'SPIKES protocol: Setting · Perception · Invitation · Knowledge · Emotions · Strategy/Summary. Calgary-Cambridge model для общей консультации.', time: '8-10 мин (breaking bad news); 5-7 мин (explaining diagnosis)', pass: 'Empathy, silence use, avoiding jargon — key items. Global rating важнее checklist чем на других станциях.' },
      interpret: { title: 'Data interpretation', rubric: 'Systematic approach (ЭКГ: rate/rhythm/axis/intervals/morphology; CXR: ABCDEF; blood: normal ranges by system) · Identify abnormalities · Clinical correlation · Management plan', time: '5-8 мин', pass: 'Must identify critical finding (STEMI, tension PTX, hyperkalemia) для прохождения' },
      prescribing: { title: 'Prescribing / safe medication', rubric: 'Patient details · Drug name + dose + route + frequency · Duration · Allergies/interactions check · Signature + date · Patient counseling', time: '5-7 мин', pass: 'Один missing item (dose, route, allergy check) — часто critical fail. BNF use demonstration positive.' },
      resus: { title: 'Resuscitation (симуляция)', rubric: 'Safety + response check · Call for help + ABC · CPR 30:2 (or continuous with ETT) · Defib/AED если shockable · ALS algorithm (4H/4T) · Post-ROSC care', time: '5-8 мин (BLS scenario); 10-12 мин (ALS)', pass: 'CPR качество (rate 100-120/min, depth 5-6cm, full recoil) + правильные ACLS drugs + defib timing' },
    };
    const e = map[s]!;
    return {
      value: e.title,
      unit: 'OSCE',
      color: '#6B7280',
      interpretation: `OSCE station: ${e.title}`,
      details: `Тип станции: ${e.title}\n\nChecklist rubric: ${e.rubric}\n\nТипичная длительность: ${e.time}\n\nPass criteria: ${e.pass}\n\nСтандартная структура OSCE:\n- 10 станций × 5-10 минут (варьирует по стране)\n- UK MBBS finals: 16-20 станций × 7-10 мин\n- USMLE Step 2 CS (упразднён 2021) — 12 станций × 15 мин\n- РФ (аккредитация специалистов): 5 станций × 10 мин\n\nScoring methodology:\n1. Checklist score — yes/no или 0-2 за каждый пункт (15-30 items/station)\n2. Global rating — клиническая компетентность "Clear fail / Borderline / Pass / Clear pass" (used for standard setting, Borderline Group Method)\n3. Critical items — missing → automatic fail даже при высоком checklist (напр. sharps safety, MASSIVE bleeding не замечен)\n\nStandard setting:\n- Borderline Group Method (most common) — cut-score = mean checklist score учащихся с Borderline global rating\n- Angoff method — эксперты предсказывают % "minimally competent" студентов за каждый пункт\n\nCommon pitfalls:\n- Не представиться / не взять consent — частая потеря первых 2-3 points\n- Не закрыть встречу (summary + safety-netting + follow-up) — последние точки\n- Не использовать signposting ("Now I\'d like to...") — связность падает`,
      actions: [
        'Подготовиться по "OSCE Cases with Mark Schemes" (Elsevier) или "Geeky Medics" (бесплатно web)',
        'Geeky Medics: https://geekymedics.com/osces/ — бесплатные checklists по станциям',
        'DR CRANKS / DR CUPID — мнемоники для бывшего анамнеза',
        'SOCRATES — мнемоника боли (Site, Onset, Character, Radiation, Associations, Timing, Exacerbating, Severity)',
        'SPIKES — breaking bad news (Setting, Perception, Invitation, Knowledge, Emotions, Strategy)',
        'Calgary-Cambridge model — comprehensive consultation framework',
        'Timed practice: 5-8 мин сессии с peer feedback',
        'Video yourself + self-evaluate against checklist',
      ],
      caveats: [
        'OSCE checklist не всегда отражает real clinical competence — "teaching to the test" bias',
        'Simulated patients (SPs) vs real patients — разные уровни реализма',
        'Inter-station consistency проблема: разные examiners, разные SPs → variability в оценках',
        'Для РФ (аккредитация): станции стандартизированы МЗ, checklists публикуются',
        'Для UK MRCP PACES / MRCS OSCE / GP CSA — коммерческие prep courses',
        '"Critical fail" policy — знать критические пункты (sharps, consent, obvious emergency missed)',
      ],
      related: [
        { id: 'simman', title: 'SimMan симуляция' },
        { id: 'miller-pyramid', title: 'Miller\'s pyramid (учебная оценка)' },
        { id: 'dops', title: 'DOPS (Direct Observation)' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**OSCE** (Objective Structured Clinical Examination) — стандартизованная оценка клинических навыков, введена **Ronald Harden (Dundee, 1975)**. Публикация 1979 г. в *Medical Education*. Стандарт в UK, Canada, Australia, Ireland, рос. аккредитации специалистов (с 2016).

### Структура
- **Несколько станций** (обычно 10-20), каждая — специфический навык
- **Стандартная длительность станции: 5-10 минут** (5 мин — short; 8-10 мин — complex)
- **Ротация учащихся** через станции (everyone sees all stations) — звонок отмечает переход
- **Стандартизированные пациенты (SPs)** или симуляторы — не real patients (обычно)
- **Examiner с checklist** на каждой станции — consistency между кандидатами

### Типы станций (обычно смешаны в одном OSCE)
1. History taking
2. Physical examination (focused, не full)
3. Procedural skills (венепункция, в/в, sutures)
4. Communication (breaking bad news, informed consent)
5. Data interpretation (ЭКГ, CXR, blood results)
6. Prescribing
7. Resuscitation symulation (BLS/ACLS)
8. Ethics / professionalism vignettes

### Scoring
**Checklist (analytic)** + **Global rating (holistic)** + **Critical items** (automatic fail если missed).

### Стандартизация
- **Borderline Group Method** — cut-score от средних Borderline кандидатов
- **Angoff method** — эксперты предсказывают performance minimally competent
- **Cronbach α** ≥ 0.7 желательно для reliability

### Мнемоники для OSCE
- **SOCRATES** — pain history
- **DR CRANKS** — общий анамнез
- **SPIKES** — breaking bad news
- **ICE** — Ideas, Concerns, Expectations пациента
- **Calgary-Cambridge** — consultation framework
- **IPPA** — Inspect, Palpate, Percuss, Auscultate

### Применение в РФ
**Аккредитация специалистов** (Федеральный аккредитационный центр МЗ РФ) включает станции с 2016 г.:
- Сердечно-лёгочная реанимация
- Экстренная помощь (ACLS)
- Диспансерный прием
- Специальность-специфические станции (для специалистов)`,
};
export default runner;
