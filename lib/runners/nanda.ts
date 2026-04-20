// @ts-nocheck
/** Runner: nanda — NANDA-I nursing diagnoses */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NANDA International) · США, Европа, Япония, Бразилия',
  reference: 'Herdman TH, Kamitsuru S, Lopes CT (eds). NANDA International Nursing Diagnoses: Definitions & Classification, 2024–2026, 13th ed. New York: Thieme; 2024.',
  inputs: [
    {
      id: 'domain',
      label: 'Домен',
      type: 'select',
      options: [
        { value: '1', label: '1 Health Promotion' },
        { value: '2', label: '2 Nutrition' },
        { value: '3', label: '3 Elimination and Exchange' },
        { value: '4', label: '4 Activity/Rest' },
        { value: '5', label: '5 Perception/Cognition' },
        { value: '6', label: '6 Self-Perception' },
        { value: '7', label: '7 Role Relationships' },
        { value: '8', label: '8 Sexuality' },
        { value: '9', label: '9 Coping/Stress Tolerance' },
        { value: '10', label: '10 Life Principles' },
        { value: '11', label: '11 Safety/Protection' },
        { value: '12', label: '12 Comfort' },
        { value: '13', label: '13 Growth/Development' },
      ],
    },
  ],
  presets: [
    { label: 'Безопасность', values: { domain: '11' } },
    { label: 'Активность/отдых', values: { domain: '4' } },
    { label: 'Комфорт (боль)', values: { domain: '12' } },
  ],
  compute: (v) => {
    const d = String(v.domain || '11');
    const map: Record<string, { name: string; example: string; defining: string; related: string }> = {
      '1': { name: 'Health Promotion', example: '00168 Sedentary lifestyle', defining: 'Prefers inactivity, physical deconditioning, reports low activity', related: 'Lack of interest, lack of resources, lack of training' },
      '2': { name: 'Nutrition', example: '00002 Imbalanced nutrition: less than body requirements', defining: 'Body weight <20% under ideal, weakness, inadequate food intake, reports lack of food', related: 'Inability to ingest/digest/absorb nutrients, psychological factors, economic factors' },
      '3': { name: 'Elimination and Exchange', example: '00011 Constipation', defining: 'Hard/dry stool, <3 stools/week, straining, abdominal pain, reduced stool frequency', related: 'Low fiber/fluid intake, decreased motility, medications, dehydration' },
      '4': { name: 'Activity/Rest', example: '00085 Impaired physical mobility', defining: 'Limited ROM, slowed movement, postural instability, gait changes', related: 'Pain, muscle weakness, deconditioning, joint stiffness' },
      '5': { name: 'Perception/Cognition', example: '00128 Acute confusion', defining: 'Fluctuation in cognition, disturbed consciousness, misperception, agitation', related: 'Delirium, substance abuse, age >60, dementia' },
      '6': { name: 'Self-Perception', example: '00119 Chronic low self-esteem', defining: 'Rejects positive feedback, exaggerates negative feedback, self-negating verbalization', related: 'Cultural/spiritual factors, ineffective coping, repeated failures' },
      '7': { name: 'Role Relationships', example: '00061 Caregiver role strain', defining: 'Difficulty performing/completing caregiver activities, apprehension about care', related: 'Chronic condition of care recipient, inexperience, complex care needs' },
      '8': { name: 'Sexuality', example: '00059 Sexual dysfunction', defining: 'Perceived alteration in sexual function, reported limitations', related: 'Biopsychosocial alteration, disease process, medications' },
      '9': { name: 'Coping/Stress Tolerance', example: '00146 Anxiety', defining: 'Apprehension, restlessness, increased tension, irritability, autonomic arousal', related: 'Stress, unmet needs, interpersonal transmission, situational crises' },
      '10': { name: 'Life Principles', example: '00066 Spiritual distress', defining: 'Questions meaning, anger, expressions of suffering, feeling abandoned', related: 'Illness, loss, life changes, death anxiety' },
      '11': { name: 'Safety/Protection', example: '00155 Risk for falls', defining: 'Risk factors: age ≥65, history of falls, use of assistive device, unsafe environment, orthostatic hypotension', related: 'Impaired mobility, medications, sensory deficits, neurological conditions' },
      '12': { name: 'Comfort', example: '00132 Acute pain', defining: 'Verbal report, protective behavior, facial expression, diaphoresis, changes in vital signs', related: 'Injury agents (biological, chemical, physical, psychological)' },
      '13': { name: 'Growth/Development', example: '00112 Risk for delayed development', defining: 'Risk factors: prematurity, poverty, maternal age <15 or >35, lack of stimulation', related: 'Biological, individual, environmental caregiver factors' },
    };
    const e = map[d];
    const code = (e.example.match(/^(\d+)/) || [null, '—'])[1];
    return {
      value: code,
      unit: 'NANDA-I',
      color: '#6B7280',
      interpretation: `NANDA-I: ${e.example}`,
      details: `**Domain:** ${d} — ${e.name}\n\n**Пример сестринского диагноза:** ${e.example}\n\n**Defining characteristics (определяющие характеристики):** ${e.defining}\n\n**Related factors (связанные факторы):** ${e.related}\n\nNANDA-I использует **3-part PES statement**: Problem + Etiology + Signs/Symptoms. Формат: "[Diagnosis] related to [related factors] as evidenced by [defining characteristics]".`,
      actions: [
        'NANDA International: https://nanda.org/',
        'Текущее издание: NANDA-I 2024-2026 (13th) — 267 diagnoses',
        'Использовать вместе с NIC (Nursing Interventions Classification) и NOC (Nursing Outcomes)',
        'PES format в документации: Problem r/t Etiology AEB Signs/Symptoms',
        'Карта NNN (NANDA-NIC-NOC) — стандартный подход к сестринскому процессу',
      ],
      caveats: [
        'NANDA-I используется преимущественно в США, Бразилии, Японии, Южной Корее',
        'В РФ не является официальным стандартом — доминирует модель сестринского процесса на основе В.Хендерсон',
        'Обновление каждые 3 года (2024-2026 — 13-е издание)',
        'Уровень доказательности (LOE) 1.1-3.4 — указан для каждого diagnosis',
        'Перевод на русский доступен в специализированных руководствах',
        '13 доменов + 47 классов + 267 diagnoses (в 13-м издании)',
      ],
      related: [
        { id: 'icf', title: 'WHO ICF' },
        { id: 'icd11', title: 'ICD-11' },
        { id: 'snomed', title: 'SNOMED CT (nursing subset)' },
      ],
      relatedCourses: [
        { id: '310.1', title: 'Сестринское дело — основы' },
      ],
    };
  },
  info: `### Для чего используется
**NANDA-I** (North American Nursing Diagnosis Association International) — международная классификация сестринских диагнозов, основа сестринского процесса в США, Бразилии, Японии, странах Европы.

### Структура (13-е издание, 2024-2026)
- **13 доменов** (Functional Health Patterns)
- **47 классов**
- **267 diagnoses** (≈5-значный код)

### 3-компонентный формат (PES)
- **P**roblem — NANDA-I diagnosis label
- **E**tiology — related factors ("related to...")
- **S**igns/symptoms — defining characteristics ("as evidenced by...")

**Пример:** "00132 Acute pain r/t tissue injury AEB verbal report of 8/10 pain, guarding behavior, elevated BP"

### 13 доменов
1. Health Promotion · 2. Nutrition · 3. Elimination/Exchange · 4. Activity/Rest · 5. Perception/Cognition · 6. Self-Perception · 7. Role Relationships · 8. Sexuality · 9. Coping/Stress · 10. Life Principles · 11. Safety/Protection · 12. Comfort · 13. Growth/Development

### Типы сестринских диагнозов
- **Problem-focused** (\`00132 Acute pain\`) — текущая проблема
- **Risk** (\`00155 Risk for falls\`) — потенциальная проблема
- **Health-promotion** (\`00162 Readiness for enhanced breastfeeding\`) — стремление к улучшению
- **Syndrome** (\`00009 Autonomic dysreflexia\`) — кластер связанных диагнозов

### Связь с NIC/NOC
- **NANDA-I** — что происходит (диагноз)
- **NIC** — Nursing Interventions Classification (что делать)
- **NOC** — Nursing Outcomes Classification (что измерить)

### Источники
- NANDA International: https://nanda.org/
- Herdman TH et al. NANDA-I 2024-2026. Thieme Publishing.`,
};
export default runner;
