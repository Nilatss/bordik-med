/**
 * Runner: neo-bell-nec — Bell Staging для НЭК (Necrotizing Enterocolitis)
 *
 * NEONATOLOGY MODULE A27 (P1).
 *
 * Source attribution:
 *   PRIMARY:    Bell MJ, Ternberg JL, Feigin RD, et al. Neonatal
 *               necrotizing enterocolitis. Therapeutic decisions based
 *               upon clinical staging. Ann Surg. 1978;187(1):1-7.
 *               doi:10.1097/00000658-197801000-00001
 *   MODIFICATION: Walsh MC, Kliegman RM. Necrotizing enterocolitis:
 *               treatment based on staging criteria. Pediatr Clin North
 *               Am. 1986;33(1):179-201.
 *   GUIDELINE:  AAP / ACS 2020 — Bell modified остаётся золотым стандартом.
 *
 * Staging:
 *   IA — Suspected NEC, mild systemic signs (apnea, bradycardia, lethargy)
 *        + intestinal symptoms (bloody stool, abdominal distention),
 *        normal X-ray
 *   IB — Suspected NEC, как IA + more pronounced systemic signs,
 *        normal X-ray
 *   IIA — Definite NEC, mild illness (как I + intestinal dilatation OR
 *         pneumatosis on X-ray)
 *   IIB — Definite NEC, moderately ill (as IIA + metabolic acidosis,
 *         thrombocytopenia, abdominal cellulitis OR right lower quadrant
 *         mass)
 *   IIIA — Advanced NEC, severely ill, intestine intact (peritonitis,
 *          severe acidosis, DIC, neutropenia, hypotension; ascites on
 *          X-ray)
 *   IIIB — Advanced NEC, perforation (pneumoperitoneum on X-ray)
 *
 * Treatment:
 *   I    — NPO, nasogastric drainage, IV antibiotics 48-72 ч (до cultures)
 *   IIA  — NPO, NG, IV abx 7-10 дней, X-ray q6-12ч
 *   IIB  — NPO, NG, IV abx 14 дней, parenteral nutrition, surgical consult
 *   IIIA — Aggressive medical (vasopressors, ventilation), abx, surgery if
 *          deterioration
 *   IIIB — **Surgical emergency** — laparotomy + bowel resection ±
 *          ostomy (most common: ileostomy + mucous fistula)
 *
 * Mortality:
 *   I    — ~5%
 *   IIA  — 10-15%
 *   IIB  — 20-30%
 *   IIIA — 30-50%
 *   IIIB — 50-80%
 *
 * SOURCES (audit 1.15):
 *   [1] Bell 1978: pubmed.ncbi.nlm.nih.gov/413500
 *   [2] Walsh-Kliegman 1986: pubmed.ncbi.nlm.nih.gov/3081865
 */
import type { ScoreTool, Preset } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 6,
  countries: 'Международный (Bell 1978 / Walsh-Kliegman 1986)',
  reference:
    'Bell MJ et al. Ann Surg 1978;187:1. Walsh MC, Kliegman RM. Pediatr Clin North Am 1986;33:179.',
  inputs: [
    {
      id: 'stage',
      label: 'Стадия по Bell (modified Walsh-Kliegman)',
      type: 'select',
      options: [
        { value: '1', label: 'IA — Suspected NEC (mild systemic, normal X-ray)', points: 1 },
        { value: '2', label: 'IB — Suspected NEC (more systemic, normal X-ray)', points: 2 },
        { value: '3', label: 'IIA — Definite NEC, mild (X-ray: dilatation OR pneumatosis)', points: 3 },
        { value: '4', label: 'IIB — Definite NEC, moderate (+ acidosis, ↓Plt, RLQ mass)', points: 4 },
        { value: '5', label: 'IIIA — Advanced, severely ill, no perforation (peritonitis, DIC)', points: 5 },
        { value: '6', label: 'IIIB — Advanced, perforation (pneumoperitoneum)', points: 6 },
      ],
    },
  ],
  bands: [
    {
      min: 1,
      max: 2,
      label: 'I — Suspected NEC',
      color: '#84CC16',
      description: 'Подозрение на НЭК. Mortality ~5%.',
      details:
        'Clinical signs: apnea, bradycardia, lethargy, intestinal symptoms. X-ray normal или ileus. Trial of bowel rest и observation.',
      actions: [
        'NPO, назогастральный зонд для дренажа',
        'IV антибиотики 48-72 ч (ампициллин + гентамицин ± ванкомицин при подозрении CONS)',
        'X-ray q6-12 ч до stabilization',
        'CBC, CRP, газы крови q6-12 ч',
        'Восстановление кормления через 48-72 ч если стабилен',
      ],
    },
    {
      min: 3,
      max: 4,
      label: 'II — Definite NEC',
      color: '#F59E0B',
      description: 'Подтверждённый НЭК. Mortality 10-30%.',
      details:
        'X-ray показывает intestinal dilatation, pneumatosis intestinalis (gas в стенке кишки) или portal vein gas. IIB добавляет systemic compromise.',
      actions: [
        'NPO 7-14 дней (IIA — 7-10, IIB — 14)',
        'IV antibiotics broad-spectrum (ампициллин + гентамицин + клиндамицин/метронидазол при подозрении на анаэробы)',
        'Parenteral nutrition (TPN) — рост и repair',
        'Surgical consult (особенно IIB — RLQ mass, ascites)',
        'X-ray q6-8 ч; serial labs (CBC, CRP, lactate)',
        'Probiotics — recommended при IIB+ для prevention recurrence (NICE 2024)',
      ],
    },
    {
      min: 5,
      max: 6,
      label: 'III — Advanced NEC',
      color: '#7F1D1D',
      description: 'Тяжёлый НЭК. Mortality 30-80%.',
      details:
        'IIIA — intestine intact, severe systemic illness; IIIB — perforation (free air on X-ray) — surgical emergency.',
      actions: [
        '⚠️ IIIB — НЕМЕДЛЕННАЯ хирургическая консультация и laparotomy + bowel resection',
        'IIIA — aggressive medical (vasopressors, mechanical ventilation, abx escalation)',
        'Triple antibiotic therapy: ампициллин + гентамицин + метронидазол / клиндамицин',
        'Vasopressors (dopamine/epinephrine), volume resuscitation',
        'DIC management: FFP, cryoprecipitate, platelets',
        'Continuous monitoring в ОРИТ, многократный X-ray',
        'Hand-washing + isolation — outbreak prevention',
        'Survival heavily dependent on prompt surgery если IIIB',
      ],
    },
  ],
  caveats: [
    'Радиологические находки субъективны — pneumatosis vs ileus может быть challenging',
    'Pneumoperitoneum в неонатальном X-ray виден как "football sign" или free air над liver',
    'Surgical timing: IIIB ВСЕГДА requires surgery; IIIA — медицинская оптимизация + surgery если progressive',
    'Most common sites NEC: terminal ileum + ascending colon',
    'Risk factors: prematurity (<32 нед, <1500 г), formula feeding, hypoxic-ischemic events, PDA',
    'Probiotics — снижают NEC incidence на ~40% (Cochrane 2017) — discuss with team',
    'Long-term: short bowel syndrome у survivors (особенно после bowel resection >50%)',
    'Mortality higher для preterm <28 нед; полная resolution rate ~60% для медицинского lечения NEC II',
  ],
  related: [
    { id: 'apgar', title: 'Apgar' },
    { id: 'silverman', title: 'Silverman-Anderson' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы' },
    { id: 'thompson', title: 'Thompson / Sarnat' },
  ],
  relatedCourses: [
    { id: '301.4', title: 'Неонатология' },
    { id: '300.4', title: 'Хирургия новорождённых' },
  ],
  presets: [
    { label: 'IA Suspected (mild)', values: { stage: '1' } },
    { label: 'IIA Definite mild', values: { stage: '3' } },
    { label: 'IIB Definite moderate', values: { stage: '4' } },
    { label: 'IIIB Perforation', values: { stage: '6' } },
  ],
  info: `### Bell Staging (Modified Walsh-Kliegman)

| Stage | Описание | Mortality |
|---|---|---|
| **IA** | Suspected NEC, mild systemic, normal X-ray | ~5% |
| **IB** | Suspected NEC, more systemic, normal X-ray | ~5% |
| **IIA** | Definite NEC, mild (dilatation OR pneumatosis on X-ray) | 10-15% |
| **IIB** | Definite NEC, moderate (+ acidosis, ↓Plt, RLQ mass) | 20-30% |
| **IIIA** | Advanced, severely ill, intestine intact (DIC, peritonitis) | 30-50% |
| **IIIB** | Advanced, perforation (pneumoperitoneum) | 50-80% |

### Risk factors

- **Prematurity:** <32 нед, <1500 г (наиболее сильный)
- **Formula feeding:** vs breastmilk (RR ~2-3×)
- **Hypoxic-ischemic events:** asphyxia, sepsis, PDA
- **Polycythemia:** Hct >65%
- **Exchange transfusion** (rare modern)
- **Maternal cocaine/illicit drug use**

### Clinical signs

| Системные | Кишечные | Радиологические |
|---|---|---|
| Apnea | Bloody stool | Ileus, dilated loops |
| Bradycardia | Abdominal distention | Pneumatosis intestinalis |
| Lethargy | Bilious aspirate | Portal vein gas |
| Temperature instability | Visible bowel loops | Pneumoperitoneum (perforation) |

### Treatment by stage

**Stage I (Suspected):**
- NPO 48-72 ч
- NG drainage
- IV abx ampi + gent (± vanco)
- Restart feeding gradually if stable

**Stage II (Definite):**
- NPO 7-14 дней
- TPN
- Triple abx если IIB (+ metronidazole/clindamycin для anaerobes)
- Surgical consult IIB
- Probiotics (NICE 2024) для prevention recurrence

**Stage III (Advanced):**
- IIIA: aggressive medical + surgery if progressive
- IIIB: **emergency laparotomy** + bowel resection ± ostomy
- Triple abx, vasopressors, mechanical ventilation
- DIC management

### Common surgical procedures

- **Primary anastomosis** — small focal disease в stable infant
- **Stoma formation** — ileostomy + mucous fistula (most common для extensive)
- **Penrose drain** — temporizing для unstable preterm <1000 г
- Late: **stoma reversal** через 8-12 нед после resolution

### Long-term outcomes

- **Short bowel syndrome** у ~10% survivors (особенно после resection >50% bowel)
- **Cholestasis** ассоциирован с длительным TPN
- **Strictures** в 10-25% — colonic > terminal ileum
- **Neurodevelopmental delay** ↑ при NEC III + sepsis

### Источники

- Bell MJ et al. Ann Surg 1978;187:1
- Walsh MC, Kliegman RM. Pediatr Clin N Am 1986;33:179
- AAP / ACS 2020 surgical guidelines
- NICE NG194 Late presentation enterocolitis 2024 update
- Cochrane probiotic prevention review 2017

### Ограничения

- Radiological findings субъективны
- Bell не учитывает modern markers (intestinal fatty acid binding protein,
  bowel ultrasound)
- Late-onset NEC (>30 day) — другие risk factors (CONS sepsis, line use)
- Не replaces multidisciplinary team decision (neonatologist + surgeon
  + radiologist)
`,
};

export default runner;
