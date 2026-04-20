// @ts-nocheck
/** Runner: dsm5tr — DSM-5-TR (Text Revision, APA 2022) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (APA) · международно в исследованиях',
  reference: 'American Psychiatric Association. Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition, Text Revision (DSM-5-TR). Washington, DC: APA Publishing; 2022.',
  inputs: [
    {
      id: 'disorder',
      label: 'Категория расстройства',
      type: 'select',
      options: [
        { value: 'mdd', label: 'Major Depressive Disorder' },
        { value: 'gad', label: 'Generalized Anxiety Disorder' },
        { value: 'panic', label: 'Panic Disorder' },
        { value: 'ptsd', label: 'PTSD' },
        { value: 'bipolar1', label: 'Bipolar I' },
        { value: 'schizophrenia', label: 'Schizophrenia' },
        { value: 'adhd', label: 'ADHD' },
        { value: 'asd', label: 'Autism Spectrum Disorder' },
        { value: 'aud', label: 'Alcohol Use Disorder' },
        { value: 'bpd', label: 'Borderline Personality Disorder' },
        { value: 'pgd', label: 'Prolonged Grief Disorder (новое в TR)' },
      ],
    },
  ],
  presets: [
    { label: 'Депрессия MDD', values: { disorder: 'mdd' } },
    { label: 'ПТСР', values: { disorder: 'ptsd' } },
    { label: 'СДВГ', values: { disorder: 'adhd' } },
  ],
  compute: (v) => {
    const d = String(v.disorder || 'mdd');
    const map: Record<string, { name: string; dsm: string; icd10cm: string; criteria: string; diff: string }> = {
      mdd: { name: 'Major Depressive Disorder', dsm: 'F32.x (single), F33.x (recurrent)', icd10cm: 'F32.9, F33.9', criteria: 'A: ≥5 симптомов ≥2 нед, вкл. депресс. настроение ИЛИ ангедонию. B: страдание/дисфункция. C: не от в-в/сост. D-E: не другим расстройством. Specifiers: mild/moderate/severe, with anxious distress, with melancholic / atypical / psychotic / peripartum / seasonal', diff: 'Persistent depressive (F34.1), Bipolar, Adjustment w/ depressed mood (F43.21), PGD, bereavement' },
      gad: { name: 'Generalized Anxiety Disorder', dsm: 'F41.1', icd10cm: 'F41.1', criteria: 'A: чрезмерная тревога/беспокойство ≥6 мес. B: трудно контролировать. C: ≥3 из 6 симптомов (беспокойство, утомляемость, концентр., раздраж., напряж., сон). D: дистресс/дисфункция. E-F: не от в-в / не другим расстройством', diff: 'Panic, Social anxiety, OCD, PTSD, Illness anxiety' },
      panic: { name: 'Panic Disorder', dsm: 'F41.0', icd10cm: 'F41.0', criteria: 'A: рекуррентные неожиданные панич. атаки (≥4 из 13 симптомов). B: ≥1 мес тревоги/избегания после атаки. C-D: не от в-в / не др. расстройством', diff: 'GAD, Specific phobia, Agoraphobia (F40.00 отдельно), Medical (thyroid, cardiac)' },
      ptsd: { name: 'PTSD', dsm: 'F43.10', icd10cm: 'F43.10', criteria: 'A: воздействие травмы. B: повторные симптомы (≥1). C: избегание (≥1). D: негатив. изменения когниций/настроения (≥2). E: возбуждение/реактивность (≥2). F: длит. >1 мес. G: дистресс. H: не от в-в. Specifiers: with dissociative symptoms; with delayed expression', diff: 'Acute stress (F43.0), Adjustment, Complex PTSD (в ICD-11 6B41), Dissociative disorders' },
      bipolar1: { name: 'Bipolar I Disorder', dsm: 'F31.xx', icd10cm: 'F31.9', criteria: '≥1 маниакальный эпизод (≥1 нед, ≥3 симптомов + повышенное/раздраж. настроение). Гипомания / депрессия — необязательны. Specifiers: with mixed features, rapid cycling, psychotic, peripartum', diff: 'Bipolar II (F31.81), Cyclothymic (F34.0), MDD, Substance-induced, Schizoaffective' },
      schizophrenia: { name: 'Schizophrenia', dsm: 'F20.9', icd10cm: 'F20.9', criteria: 'A: ≥2 симптомов ≥1 мес (бред, галлюцинации, дезорг. речь, дезорг./кататония, негативные) — ≥1 должен быть из первых 3-х. B: социальная/профессион. дисфункция. C: длит. ≥6 мес (вкл. продром). D: искл. шизоаффект./настроения. E: не от в-в. F: при РАС — ≥1 мес ярких бреда/галлюцинаций', diff: 'Schizoaffective (F25), Schizophreniform (1-6 мес, F20.81), Brief psychotic (F23), Delusional (F22), Bipolar/MDD w/ psychosis' },
      adhd: { name: 'ADHD', dsm: 'F90.x', icd10cm: 'F90.0/F90.1/F90.2', criteria: 'A: ≥6 симптомов невнимания И/ИЛИ гиперактивности-импульсивности (≥5 у взрослых ≥17 лет) ≥6 мес. B: до 12 лет. C: в ≥2 контекстах. D: дисфункция. E: не объясняется шизофренией/др. расстройством. Presentations: combined / predominantly inattentive / predominantly hyperactive-impulsive', diff: 'ODD (F91.3), Learning disorders, ASD (F84.0), Anxiety, Bipolar' },
      asd: { name: 'Autism Spectrum Disorder', dsm: 'F84.0', icd10cm: 'F84.0', criteria: 'A: персист. дефицит соц. коммуникации/взаимодействия (≥3 характеристики). B: ограниченные повторяющ. паттерны поведения (≥2 из 4). C: симптомы в раннем периоде развития. D: дисфункция. E: не ИН/глобальная задержка. Severity levels 1/2/3 (requiring support / substantial / very substantial)', diff: 'Intellectual disability, Social communication disorder (F80.89), ADHD, Rett, Tourette' },
      aud: { name: 'Alcohol Use Disorder', dsm: 'F10.1x (mild), F10.2x (mod/severe)', icd10cm: 'F10.10/F10.20', criteria: '≥2 из 11 критериев за 12 мес: больше/дольше, отказ не удаётся, много времени, крейвинг, невыполнение роли, соц/межл. последствия, отказ от деятельности, риск, физический/психол. вред, толерантность, отмена. Severity: 2-3 mild, 4-5 moderate, ≥6 severe', diff: 'Other SUD, Mood disorder w/ alcohol, Adjustment' },
      bpd: { name: 'Borderline Personality Disorder', dsm: 'F60.3', icd10cm: 'F60.3', criteria: 'Pervasive pattern нестабильности межл. отношений, самоидентичности, аффекта + импульсивность (≥5 из 9): fear of abandonment, unstable relationships, identity disturbance, impulsivity, self-harm, affective instability, emptiness, anger, dissociative/paranoid', diff: 'Mood disorders, Other PDs (histrionic F60.4, narcissistic F60.81), PTSD, Bipolar' },
      pgd: { name: 'Prolonged Grief Disorder (NEW в DSM-5-TR 2022)', dsm: 'F43.81', icd10cm: 'F43.81', criteria: 'A: смерть близкого ≥12 мес назад (6 мес у детей). B: ≥1 симптомов горя (ежеднев. ≥1 мес): intense yearning ИЛИ preoccupation. C: ≥3 из 8 доп. симптомов. D: клинически значимый дистресс / дисфункция. E: превышает культурные/социальные нормы. F: не объясняется другим расстройством', diff: 'MDD w/ bereavement, PTSD, Adjustment disorder, Normal grief' },
    };
    const e = map[d];
    return {
      value: e.dsm,
      unit: 'DSM-5-TR',
      color: '#6B7280',
      interpretation: `${e.name} — код ${e.dsm} (ICD-10-CM ${e.icd10cm})`,
      details: `**Расстройство:** ${e.name}\n**DSM-5-TR код:** ${e.dsm}\n**ICD-10-CM parallel:** ${e.icd10cm}\n\n**Критерии:** ${e.criteria}\n\n**Дифференциал:** ${e.diff}`,
      actions: [
        'APA DSM-5-TR доступен в печати и через PsychiatryOnline (подписка)',
        'Использовать SCID-5 (structured interview) для формального diagnosis',
        'DSM-5-TR использует ICD-10-CM коды для биллинга в США (с 2015)',
        'Severity specifiers — обязательны, где указано (mild/moderate/severe)',
        'Для crosswalk ICD-11 ↔ DSM-5-TR см. tool dsm-icd',
      ],
      caveats: [
        'DSM-5-TR (2022) — Text Revision, минимальные изменения критериев vs DSM-5 (2013)',
        'Ключевое новшество TR: Prolonged Grief Disorder (F43.81)',
        'В РФ официально используется ICD-10 (F-глава) — DSM только в исследованиях',
        'DSM-5-TR: cultural formulation interview (CFI) — для мультикультурной оценки',
        'Коды в DSM-5-TR идентичны ICD-10-CM (нет отдельной "DSM нумерации")',
        'Ряд диагнозов в Section III (emerging) — attenuated psychosis, internet gaming disorder',
      ],
      related: [
        { id: 'dsm-icd', title: 'DSM ↔ ICD crosswalk' },
        { id: 'icd10cm', title: 'ICD-10-CM' },
        { id: 'icd11', title: 'ICD-11' },
        { id: 'phq9', title: 'PHQ-9' },
        { id: 'gad7', title: 'GAD-7' },
      ],
      relatedCourses: [
        { id: '306.1', title: 'Психиатрия — классификация' },
        { id: '304.1', title: 'Диагностика и кодирование' },
      ],
    };
  },
  info: `### Для чего используется
**DSM-5-TR** (Diagnostic and Statistical Manual of Mental Disorders, 5th ed., Text Revision, 2022) — стандарт диагностики психических расстройств в США и в международных исследованиях.

### Ключевые изменения TR (2022) vs DSM-5 (2013)
- **Новый диагноз:** Prolonged Grief Disorder (F43.81)
- Обновлённый текст в 70+ главах (prevalence, suicide risk, development, culture, gender)
- Уточнения в критериях: autism spectrum, stimulant use disorder, persistent complex bereavement
- ICD-10-CM коды обновлены до FY2022

### Структура diagnosis
1. **Principal diagnosis** (primary)
2. **Specifiers** — severity, course, features (with anxious distress, mixed, psychotic)
3. **Subtypes** — presentations (ADHD combined/inattentive)
4. **Z-коды** — psychosocial factors (Z63.0 семейный стресс)

### 22 главы DSM-5-TR
1. Neurodevelopmental · 2. Schizophrenia spectrum · 3. Bipolar · 4. Depressive · 5. Anxiety · 6. OCRD · 7. Trauma/stressor · 8. Dissociative · 9. Somatic symptom · 10. Feeding/eating · 11. Elimination · 12. Sleep-wake · 13. Sexual dysfunction · 14. Gender dysphoria · 15. Disruptive · 16. Substance-related · 17. Neurocognitive · 18. Personality · 19. Paraphilic · 20. Other · 21. Medication-induced · 22. Other conditions`,
};
export default runner;
