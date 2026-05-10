"""
Add ~10 P0-topic articles to /public/neonatal-articles.json.

Existing bank: 80 articles. New target: 90+, covering high-priority gaps:
- Golden hour management
- Family-integrated care в NICU
- Бережная вентиляция
- Antenatal стероиды (полный обзор)
- Гипотермия — профилактика и тактика
- Молочное вскармливание — старт + фортификация
- Ранняя CPAP стратегия
- Инфекционный контроль в NICU
- Болевая шкала + аналгезия
- Communicating с родителями
"""
from __future__ import annotations
import json
from pathlib import Path

PATH = Path(r"C:\Users\KDFX Modes\Desktop\bordik-med\public\neonatal-articles.json")


def art(
    aid: str, title_ru: str, title_en: str, topic: str, audience: str,
    level: str, summary: str, content: str,
    related_calculators: list[str], references: list[str],
) -> dict:
    return {
        "id": aid,
        "title_ru": title_ru,
        "title_en": title_en,
        "topic": topic,
        "audience": audience,
        "level": level,
        "summary": summary,
        "content": content,
        "references": references,
        "related_calculators": related_calculators,
    }


NEW_ARTICLES = [
    art(
        "art-golden-hour",
        "Golden Hour management у preterm",
        "Golden Hour management в preterm",
        "neonatal", "neonatologist", "intermediate",
        "Концепция Golden Hour — первые 60 минут жизни критичны для outcome у глубоко недоношенных. Bundle включает antenatal планирование, термозащиту, ранний CPAP, своевременный surfactant, vascular access, питание.",
        """## Концепция

Первые 60 минут жизни ELBW / VLBW-ребёнка критически определяют долгосрочные outcome. Golden Hour — структурированный bundle действий, выполняемых командой в первый час, который доказательно снижает mortality, BPD, IVH, hypothermia.

## Команда

- Неонатолог (team leader)
- 2-я медсестра NICU
- Респираторный терапевт
- Ассистент для документирования
- Roles распределены ДО рождения (call-out checklist)

## Pre-delivery (за 30 минут)

- Antenatal стероиды verified
- Magnesium sulfate (для GA <32 нед — neuroprotection)
- DCC plan ≥60 секунд если состояние plus
- Equipment ready: T-piece, pulse ox, plastic bag, hat, transport-incubator pre-warmed
- Pre-medications labelled и calculated по estimated BW
- Family update + consent

## Минута 0-5: Birth + initial stabilization

- DCC ≥60 секунд если condition allows
- Place в plastic bag/wrap БЕЗ обтирания (preterm <32 нед)
- Шапочка
- Pulse oximeter (pre-ductal — RH)
- Initial assessment: tone / breathing / HR
- If apneic: PPV via T-piece (PIP 20-25, PEEP 5, FiO₂ 0.30)
- If breathing: CPAP PEEP 5-6 cmH₂O

## Минута 5-15: Respiratory support

- Target SpO₂: 5 мин 80-85%, 10 мин 85-95%
- Titrate FiO₂
- Если FiO₂ >0.30 на CPAP: surfactant LISA (Curosurf 200 мг/кг)
- Atropine 0.02 мг/кг IV pre-LISA (анти-vagal)
- Continuous CPAP

## Минута 15-30: Vascular access + stabilisation

- UVC placement (см. чек-лист)
- Stat blood: glucose, ABG, electrolytes, CBC, blood culture
- Start D10W GIR 6 мг/кг/мин
- Aminoacids 1.5-2 г/кг/сут IV (early protein)
- Caffeine loading 20 мг/кг IV (универсально для preterm <32 нед)
- Aim для thermoneutral environment (axillary 36.5-37.5°C)

## Минута 30-60: Transfer + monitoring

- Stable transport в NICU в pre-warmed transport-incubator
- Continuous monitoring during transport
- Stat AP CXR + abdomen (verify UVC + lung pathology)
- Family update
- Documentation: timing all interventions, outcomes

## Outcomes Golden Hour-bundles

Implementation studies показывают:
- Снижение admission hypothermia 20% → 5%
- Снижение late-onset sepsis ~30%
- Снижение severe IVH ~25%
- Increased survival to discharge у ELBW

## Quality metrics

- Time to NICU admission
- Admission temperature
- Time to first surfactant (если показан)
- Time to UVC placement
- Time to first feeds""",
        ["apgar", "neo-resus-doses"],
        [
            "Stranak Z et al. Resuscitation 2020 — Golden hour neonatal outcomes",
            "Lapcharoensap W et al. J Perinatol 2017;37:778 — Golden hour bundles",
            "Sweet DG et al. Neonatology 2023;120:3 — European Consensus 2022",
        ],
    ),

    art(
        "art-antenatal-steroids",
        "Антенатальные кортикостероиды — полный обзор",
        "Antenatal corticosteroids — comprehensive review",
        "neonatal", "neonatologist", "intermediate",
        "Антенатальные стероиды — самая эффективная intervention для preterm outcomes. Снижают RDS, IVH, NEC, mortality. ACOG/RCOG/КР МЗ РФ — единый подход 24-34 нед, evolving evidence для 22-23 + 34-37 нед.",
        """## Препараты и схемы

### Бетаметазон (preferred)
- 12 мг IM × 2 дозы каждые 24 часа
- Полный курс — 48 часов

### Дексаметазон (альтернатива)
- 6 мг IM × 4 дозы каждые 12 часов
- Полный курс — 48 часов

Cochrane meta-analysis: эффективность betamethasone vs dexamethasone — schiwlywie. Betamethasone preferred в большинстве guidelines.

## Показания

### Strong evidence (24-34 нед)
- Угроза преждевременных родов 24 0/7 — 33 6/7 нед
- Однократный курс при риске родов в течение 7 дней

### Evolving evidence

#### 22-23 нед
- Resuscitation-active management — courses considered
- Less evidence, но некоторые centers offer

#### 34-37 нед (LATE preterm)
- ALPS trial (Gyamfi-Bannerman 2016) — снижает respiratory morbidity у LPT
- Caution: ↑ neonatal hypoglycemia
- ACOG 2017 endorses для отдельных high-risk

### Rescue / repeat
- Если ≥14 дней с момента последнего курса И persistent risk + GA <32-34 нед → rescue course
- ACOG/MFM 2020 supports

## Эффективность

### RDS
- Снижение на 34% (Cochrane 2017 — RR 0.66)

### IVH
- Снижение severe IVH на 45%

### NEC
- Снижение на 50%

### Neonatal mortality
- Снижение на 28% (Cochrane)

## Mechanism

- Альвеолярная maturation (surfactant synthesis stimulation)
- Reduce alveolar interstitial fluid
- Stabilize vascular endothelium → reduce IVH
- Improve gut barrier function

## Side effects (мать)

- Transient hyperglycemia (особенно у диабетиков)
- Transient leukocytosis
- Insomnia, mood changes (rare)

## Side effects (ребёнок при репетируемых курсах)

- Possible reduced birth weight, head circumference
- Conflicting data на neurodevelopment
- Avoid >4 courses

## Implementation

- Verify GA accurately
- Counsel мать о risks/benefits
- Document timing dose 1
- If birth occurs <24 ч от dose 1 — некоторые benefit (50%)
- Optimal benefit при 1-7 дней от complete course

## Российские рекомендации

КР МЗ РФ (2024): антенатальные стероиды при угрозе преждевременных родов 24-34 нед. Бетаметазон 12 мг IM × 2 (q24h) ИЛИ dexamethasone 6 мг IM × 4 (q12h).""",
        ["neo-rds-class"],
        [
            "Roberts D et al. Cochrane 2017;CD004454",
            "Gyamfi-Bannerman C et al. NEJM 2016;374:1311 — ALPS trial",
            "ACOG Committee Opinion 713. 2017",
            "RCOG Green-top Guideline 7. 2010",
            "Клинические рекомендации МЗ РФ 2024",
        ],
    ),

    art(
        "art-gentle-ventilation",
        "Бережная (gentle) вентиляция новорождённого",
        "Gentle ventilation в neonate",
        "respiratory", "neonatologist", "advanced",
        "Принципы lung-protective vent у newborn: low VT, optimal PEEP, permissive hypercapnia, avoid volutrauma/atelectotrauma. Volume-targeted ventilation preferred over pressure-controlled.",
        """## Концепция

Volutrauma (excessive VT) и atelectotrauma (cyclic collapse-recruitment) — main drivers of BPD у preterm. Gentle ventilation минимизирует mechanical injury через:
- Low VT (4-6 мл/кг)
- Optimal PEEP (избегать collapse)
- Permissive hypercapnia (PaCO₂ 45-55 мм рт. ст.)
- Avoid hyperoxia (SpO₂ 90-95%)

## Volume-Targeted Ventilation (VTV)

### Преимущества vs pressure-controlled
- Снижение pneumothorax (Cochrane: NNT ~17)
- Снижение duration ИВЛ (~1 день)
- Снижение IVH severe / PVL
- Снижение BPD/death composite

### Settings
- VT 4-6 мл/кг (target)
- PEEP 5-7 cmH₂O (titrate)
- Rate 30-60/мин
- I:E 1:2 (initial)
- FiO₂ to target SpO₂ 90-95%

## High-Frequency Oscillatory Ventilation (HFOV)

### Indications
- Refractory respiratory failure (failed conventional)
- Severe PPHN
- Pneumothorax / persistent air leak

### Settings
- MAP 1-2 cmH₂O выше CMV MAP
- Frequency 8-12 Hz (lower in larger babies)
- Amplitude — start 2× MAP, adjust для visible chest wiggle
- I:E 1:2

## Permissive Hypercapnia

- Target PaCO₂ 45-55 мм рт. ст. (некоторые центры accept до 65)
- Снижает barotrauma / volutrauma
- Watch для acidosis (pH ≥7.25)
- Avoid у HIE (cooling phase) — hypocarbia → cerebral hypoperfusion

## Permissive Hypoxemia

- SpO₂ 90-95% — sweet spot (BOOST/SUPPORT)
- Avoid <88% (mortality, NEC)
- Avoid >97% (BPD, ROP)

## Synchronized Ventilation

- Patient-triggered (assist-control, SIMV)
- Reduce work of breathing
- Faster wean

## Wean Strategy

### Wean settings as tolerated
- Decrease FiO₂ first (target SpO₂ 90-95%)
- Decrease PIP/VT (maintain VT 4-6)
- Decrease rate gradually
- Caffeine loading important for extubation

### Extubation criteria
- MAP ≤7-8 cmH₂O
- FiO₂ ≤0.30
- RR <60 spontaneous
- pH/PCO₂ acceptable
- Hemodynamic stable
- On caffeine

## Post-Extubation Support

- ELBW: NIPPV preferred over NCPAP (Cochrane)
- Larger preterm/term: NCPAP or HFNC

## NIV Modalities

- NCPAP — classic
- NIPPV (sync or non-sync) — adds inflations
- BiPAP — two-level pressure
- HFNC — heated humidified high-flow nasal cannula

## Российская практика

КР МЗ РФ 2024 — VTV preferred. Permissive hypercapnia (45-55) standard. Caffeine universal у preterm <32 нед.""",
        ["neo-resp-indices"],
        [
            "Klingenberg C et al. Cochrane 2017;CD003666 — VTV vs PCV",
            "Cools F et al. Cochrane 2015;CD000104 — HFOV elective",
            "Lemyre B et al. Cochrane 2017;CD003212 — NIPPV vs CPAP post-extubation",
            "Sweet DG et al. Neonatology 2023;120:3",
        ],
    ),

    art(
        "art-developmental-care",
        "Developmental care в NICU — основные принципы",
        "Developmental care в NICU",
        "neuro", "nicu_team", "intermediate",
        "Cluster care, low-stim environment, family-integrated care улучшают neurodevelopmental outcomes у preterm. NIDCAP-подход — system of care на базе observation infant cues.",
        """## Концепция

Preterm-newborn nervous system extremely sensitive к environment. Excessive stimulation (яркий свет, звуки, частые манипуляции) — детrimental к brain development. Developmental care — system-level approach to minimize negative environmental impact + maximize family integration.

## Ключевые принципы

### 1. Cluster care
- Группировать процедуры (vital signs + assessment + diaper change) в один контакт
- Минимизация total handling time
- Quiet periods между clusters (≥1 час)

### 2. Low-stim environment
- Низкая освещённость (<60 lux в quiet times)
- Cycled lighting (day/night)
- Sound levels <45 dB (NICU often >70 dB!)
- Soft alarm sounds, no overhead pages

### 3. Position support
- Containment (boundaries, swaddling)
- Flexion (boundary blanket, nesting)
- Midline alignment
- Side-lying preferred over supine для preterm
- Tummy time when supervised + awake

### 4. Pain management
- Sucrose 24% для discrete procedures
- Skin-to-skin contact during procedures
- Non-pharm bundle (containment, swaddling, pacifier)
- Pharm если PIPP-R or NIPS thresholds reached

### 5. Family-integrated care
- Open visiting (24/7) parents
- Active participation в care (feeding, bathing, vital signs)
- Skin-to-skin (KMC) ≥8 hours/day target
- Educational support
- Mental health screening для родителей

## NIDCAP (Newborn Individualized Developmental Care and Assessment Program)

- Trained observer-based assessment infant cues
- Individualized care plan
- Improvement in neurodevelopmental outcomes
- Reduced length of stay

## Evidence

### Sleep
- Quiet periods improve sleep quality → brain growth
- Sleep deprivation → ↓ cortical development

### Pain
- Repeated unrelieved pain → altered pain pathway development
- ↑ stress hormones → ↑ ICH risk

### Stress
- Chronic NICU stress → ↑ cortisol, ↓ growth, altered HPA axis

## Quality Metrics

- Average noise level (dB)
- Average lighting (lux)
- Daily KMC hours
- Parent presence (hours/day)
- Pain assessment frequency

## Specific Interventions

### Light cycling
- Day: 100-200 lux
- Night: <60 lux
- Improves circadian rhythm → growth

### Sound reduction
- Quiet design materials
- Soft-sounding alarms
- Awareness training staff

### Music / parental voice
- Recorded parent voice / live music — soothing, growth benefits

### Massage therapy
- Supports growth, weight gain, neurodevelopment

## Российская практика

В РФ KMC и family-integrated care постепенно внедряются. Современные перинатальные центры open для семьи 24/7.""",
        [],
        [
            "Symington A, Pinelli J. Cochrane 2006;CD001814 — Developmental care",
            "Als H et al. Pediatrics 2004;113:846 — NIDCAP outcomes",
            "Pineda RG et al. J Pediatr 2014;164:52",
        ],
    ),

    art(
        "art-early-cpap",
        "Ранняя CPAP-стратегия у preterm",
        "Early CPAP strategy в preterm",
        "respiratory", "neonatologist", "intermediate",
        "Early CPAP с PEEP 6-8 cmH₂O начиная с родзала + selective surfactant via LISA — reduce intubation, BPD у preterm. SUPPORT/COIN trials — основа.",
        """## Background

До 2010-х — стандартом был routine intubation + surfactant + IPPV у preterm. После трёх trials (COIN, SUPPORT, VON) — paradigm shift к early CPAP + selective surfactant.

## Evidence

### COIN trial (2008)
- 25-28 нед randomized к CPAP vs intubation в родзале
- Similar BPD/death composite, но реже intubation

### SUPPORT trial (2010)
- 24-27 нед — CPAP vs surfactant (intubation) в родзале
- No difference в primary outcome
- CPAP reduced exposure to ventilation

### Network meta-analysis (Schmölzer 2013)
- Early CPAP ± selective surfactant — снижение BPD/death на 14% (NNT ~25)

## Standard Approach (2025)

### В родзале
- Spontaneous breathing OK на CPAP
- PEEP 6-8 cmH₂O
- FiO₂ 21-30% (preterm)
- Watch для adequate oxygenation, work of breathing

### В NICU
- Continue CPAP если stable
- Surfactant via LISA при FiO₂ >0.30 на CPAP с adequate PEEP
- Caffeine loading 20 мг/кг (universal preterm <32 нед)

### Failure indications для intubation
- Apnea / inadequate breathing
- FiO₂ >0.40-0.60 несмотря на CPAP + surfactant
- Severe acidosis (pH <7.20)
- Hemodynamic instability

## Equipment

### T-piece resuscitator (preferred)
- Controlled PIP/PEEP
- Reliable VT delivery
- Less variability vs self-inflating bag

### Bubble CPAP
- Variable pressure
- Resource-effective
- Stable PEEP delivery

### Heated/humidified flow
- Critical для preterm comfort + skin integrity

## Common Failures

### Inadequate PEEP
- <5 cmH₂O — insufficient FRC support
- Lung collapse → ↑ FiO₂ requirement

### Too much PEEP
- >10 cmH₂O — risk pneumothorax + venous return ↓

### Inadequate seal
- Mask leak → no PEEP delivered
- Verify chest rise

### Apnea / inadequate drive
- Caffeine helps
- Если persistent → escalate

## Российская практика

Early CPAP — стандарт в РФ современных перинатальных центрах. Bubble CPAP широко используется как ресурс-эффективный.

## Bottom Line

Early CPAP + selective surfactant via LISA = current standard care у preterm <32 нед. Снижает BPD, intubation, ventilation duration без увеличения mortality.""",
        ["neo-resp-indices"],
        [
            "Morley CJ et al. NEJM 2008;358:700 — COIN trial",
            "SUPPORT Study Group. NEJM 2010;362:1970",
            "Schmölzer GM et al. BMJ 2013;347:f5980 — meta-analysis",
            "Sweet DG et al. Neonatology 2023;120:3",
        ],
    ),

    art(
        "art-infection-control",
        "Инфекционный контроль в NICU",
        "Infection control в NICU",
        "infection", "nicu_team", "intermediate",
        "Hand hygiene + CLABSI prevention bundle + skin antisepsis + selective decontamination — main pillars. CDC/AAP-driven approach снижает LOS rate by 50%+ в high-performance NICUs.",
        """## CLABSI Prevention Bundle (CDC)

### Insertion bundle
- Hand hygiene before insertion
- Maximal sterile barrier (cap, mask, gown, gloves, large drape)
- Chlorhexidine 2% skin antisepsis (>2 мес life — CDC 2017 update)
- Optimal site selection (avoid femoral when possible)
- Daily review of necessity

### Maintenance bundle
- Daily review — remove ASAP if not needed
- Hub disinfection ("scrub the hub" 15 секунд chlorhexidine)
- Closed system infusion
- Secure dressing change protocols
- Routine line care training staff

## Hand Hygiene

### WHO 5 moments
1. Before patient contact
2. Before clean / aseptic procedure
3. After body fluid exposure risk
4. After patient contact
5. After contact with patient surroundings

### Compliance
- NICU compliance often only 30-50% baseline
- Multimodal interventions — посменный feedback, signage, modeling — boost к 80%+

## Skin Antisepsis

### Chlorhexidine 2% (preferred >2 мес life)
- Superior к povidone-iodine для adult/pediatric ICU studies
- Newborn skin sensitivity — gentler formulations available

### Povidone-iodine
- Acceptable для preterm <2 мес life
- Risk thyroid suppression — wash off after procedure

## Surface Disinfection

- Daily routine clean всех patient surfaces
- Special attention к high-touch (incubator handles, keyboards, monitors)
- UV-C / hydrogen peroxide vapor для terminal cleaning между patients

## Antimicrobial Stewardship

- Empiric ABX duration <48-72 ч если cultures negative + clinical improvement
- De-escalation после culture-directed therapy
- Avoid prolonged broad-spectrum (NEC, candidiasis risks)
- Pharmacy review high-cost / high-resistance ABX

## Surveillance

### Definitions (NHSN/CDC)
- CLABSI — laboratory-confirmed bloodstream infection >48h after CVL placement
- VAP — pneumonia >48h after intubation
- CAUTI — urinary tract infection >48h after catheter

### Reporting
- Monthly device-associated infection rates per 1000 device-days
- Public reporting в US (NHSN)

## NICU Specifically

### Prevention nosocomial spread
- Cohort positive newborns
- Single rooms preferred over open-bay
- Visitor screening + restriction during outbreaks
- Vaccination personnel (influenza, COVID)

### Probiotics
- Conflicting evidence для CLABSI prevention
- May reduce NEC (combo Lacto + Bifido per ProPrems)

### Breast milk
- Reduces NEC, sepsis у preterm
- Mom's own > donor > formula

## Outcomes

### High-performance NICUs
- CLABSI rate <0.5 per 1000 line-days
- 50%+ reduction from baseline в bundle programs

### Cost
- Each CLABSI ≈ $25,000-50,000 USD additional cost
- Mortality risk ↑ при hospital-acquired infection

## Российская практика

КР МЗ РФ + Роспотребнадзор guidelines align с CDC. Центры implement CLABSI bundles все шире.""",
        [],
        [
            "CDC Guidelines for the Prevention of Intravascular Catheter-Related Infections. 2011 (updated 2017)",
            "WHO Hand Hygiene Guidelines 2009",
            "Pronovost P et al. NEJM 2006;355:2725 — Michigan Keystone study",
            "AAP COFN 2018 — Infection Control",
        ],
    ),

    art(
        "art-pain-assessment",
        "Оценка боли + аналгезия у новорождённого",
        "Pain assessment + analgesia в neonate",
        "pain_nas_sedation", "nicu_team", "intermediate",
        "Newborns experience pain (myth busted decades ago). Repeated unrelieved pain — long-term neurodevelopmental harm. PIPP-R / NIPS / N-PASS — validated scales. Multimodal approach: non-pharm + pharm.",
        """## Background

Until 1980s — common belief что newborns don't feel pain. Decades of research showed:
- Functional pain pathways from 24 weeks gestation
- Long-term effects unrelieved pain (altered pain processing, neurodevelopmental delays)
- Repeated procedures increase morbidity

## Validated Scales

### NIPS (Neonatal Infant Pain Scale)
- Term newborn — 6 indicators (facial expression, cry, breathing, arms, legs, arousal)
- Score 0-7 — >3 = pain
- Quick assessment

### PIPP-R (Premature Infant Pain Profile-Revised)
- 7 indicators including HR / SpO₂ change
- Validated preterm
- Score 0-21 — >7 = significant pain

### N-PASS (Neonatal Pain Agitation Sedation Scale)
- Captures both pain AND sedation
- Useful для ventilated newborns
- Range -10 (over-sedated) to +10 (severe pain)

### CRIES (Crying, Requires O₂, Increased VS, Expression, Sleeplessness)
- Post-operative neonate
- Score 0-10 — >5 = pain

## Common Painful Procedures

| Procedure | Frequency | Pain level |
|-----------|-----------|------------|
| Heel stick | Daily multiple | Moderate |
| Venepuncture | Daily | Moderate |
| Suctioning | Frequent | Moderate |
| Intubation | As needed | Severe |
| LP | As needed | Severe |
| Chest tube placement | Rare | Severe |
| Surgery | Rare | Severe |

## Non-Pharmacological Interventions

### Sucrose 24%
- 0.1-0.5 мл PO 2 минут до procedure
- Best evidence — reduces behavioral & physiological pain markers
- Sucrose + pacifier (synergistic)

### Skin-to-skin (KMC)
- Effective как sucrose для some procedures
- Continue during procedure if feasible

### Containment / facilitated tucking
- Hand-on chest + boundary support
- Reduces motor stress response

### Non-nutritive sucking (pacifier)
- Synergistic с sucrose

### Breastfeeding
- During procedure if feasible
- Effective comfort measure

### Music / lullabies
- Reduces stress
- Some evidence для pain modulation

## Pharmacological Analgesia

### Morphine
- 50-100 мкг/кг IV slow push (acute)
- 5-30 мкг/кг/час continuous (severe pain)
- Watch для апноэ + hypotension

### Fentanyl
- 0.5-2 мкг/кг IV slow (acute)
- 0.5-2 мкг/кг/час continuous
- Less hypotension vs morphine
- Risk chest wall rigidity (slow push)

### Acetaminophen
- 10-15 мг/кг q6h PO/IV/PR
- Mild-moderate pain
- Hepatic safety good

### Local / regional
- Lidocaine 1% local infiltration (max 4 мг/кг without epinephrine)
- EMLA cream (lidocaine-prilocaine) — limited у preterm (methemoglobinemia)
- Dorsal penile nerve block — circumcision

## NOT Recommended

### Codeine
- ↑ risk respiratory depression в CYP2D6 ultra-rapid metabolizers
- FDA contraindicated <12 лет

### Tramadol
- Same mechanism как codeine — avoid

### Routine sedation
- Long-term consequence (neurodevelopmental)

## Procedure-Specific Recommendations

### Heel stick / blood draw
- Sucrose + pacifier + containment + breastfeeding если возможно

### Intubation
- Premedication: atropine + opioid + muscle relaxant (RSI)
- Reduces hypoxia, bradycardia, ICP rises

### Surgery
- Multimodal: regional + opioid + acetaminophen
- Avoid ketamine (preterm — concerns)

## Российская практика

КР МЗ РФ — non-pharm bundle (sucrose, containment, breastfeeding) standard для discrete procedures. Pharmacological analgesia при необходимости.""",
        ["neo-nips", "neo-pipp-r", "neo-npass"],
        [
            "AAP CFN. Pediatrics 2016;137:e20154271 — Pain Assessment & Management",
            "Anand KJS, International Evidence-Based Group. Arch Pediatr Adolesc Med 2001;155:173",
            "Stevens B et al. Cochrane 2016;CD001069 — Sucrose for procedural pain",
            "Pillai Riddell RR et al. Cochrane 2015;CD006275 — Non-pharm interventions",
        ],
    ),

    art(
        "art-family-integrated-care",
        "Family-Integrated Care (FICare) в NICU",
        "Family-Integrated Care в NICU",
        "neonatal", "nicu_team", "basic",
        "FICare — модель, где родители — primary caregivers в NICU, а персонал — coaches. Снижает LOS, улучшает breastfeeding, growth, neurodevelopmental outcomes, parental mental health.",
        """## Background

Traditional NICU paradigm — родители = visitors. FICare paradigm shift — родители = primary caregivers с medical staff coaching.

## Pillars FICare (Bliss UK)

1. **24/7 access**: parents в NICU без restrictions
2. **Active participation**: родители do bathing, feeding, vital signs, KMC
3. **Education**: nurses train родителей
4. **Mental health support**: peer support, social worker, psychologist
5. **Family-centered rounds**: родители участвуют в medical rounds
6. **Sibling visitation**: brothers/sisters visit regularly

## Evidence

### Outcomes (FICare RCT 2018, Lancet)
- Increased weight gain at 3 weeks
- Higher exclusive breastfeeding rate
- Reduced parental stress + anxiety
- No increase в infection (myth busted)

### Long-term
- Better neurodevelopmental outcomes at 18 мес
- Stronger parent-infant attachment
- Reduced re-admission rates

## Implementation

### NICU design
- Single-family rooms preferred over open-bay
- Sleep area для родителей (сон в same room)
- Lounge / kitchen access
- Lactation rooms

### Staff training
- Cultural shift — staff embraces parents as partners
- Communication skills training
- Coaching не "doing for"

### Family resources
- Information pamphlets в local language
- Online portal access medical record
- Peer mentor (другой NICU graduate)
- Mental health screening + referral

## Common Misconceptions

### "Parents will get в way"
- Multiple studies show NO increase в delays/errors
- Better outcomes overall

### "Families won't show up"
- Open visiting → families come more, not less
- Especially fathers (often excluded в restrictive policies)

### "Privacy / infection risk"
- Hand hygiene compliance same или better
- Infection rates same или lower
- Privacy через single rooms

## Quality Metrics

- Hours parent presence per day
- KMC hours per day
- Exclusive breastfeeding rate at discharge
- Parent satisfaction scores
- Parental depression screening compliance

## Special Populations

### Adolescent parents
- Extra educational support
- Social work referral
- Peer mentorship

### Single parents
- Connect к family / friends
- Hospital volunteer programs
- Extended access

### Bereaved families (after loss)
- Compassionate support
- Memory-making (photos, footprints)
- Bereavement specialist

## Cultural Adaptation

- Religious accommodations (prayer, dietary)
- Language interpretation services
- Cultural coаches

## Российская практика

В современных перинатальных центрах РФ FICare принципы внедряются — open visiting hours, KMC programs, parent-as-caregiver involvement growing.""",
        [],
        [
            "O'Brien K et al. Lancet Child Adolesc Health 2018;2:245 — FICare RCT",
            "Bliss / FICare — UK national framework",
            "AAP COFN 2024 — Family-Centered Care",
            "Charpak N et al. Pediatrics 2017;139 — KMC long-term",
        ],
    ),

    art(
        "art-thermal-protection",
        "Тепловая защита новорождённого — практическое руководство",
        "Thermal protection of the newborn — practical guide",
        "neonatal", "nicu_team", "basic",
        "Hypothermia при поступлении в NICU — independent risk for mortality (1.28× per 1°C decline below 36.5°C). WHO Warm Chain — структурированный 10-step подход для prevention.",
        """## Цель

Поддержание термонейтральной среды для newborn:
- Аксиллярная t° 36.5-37.5°C
- Ректальная t° 36.7-37.3°C (на 0.3-0.5°C выше axillary)

## Hypothermia (axillary t°)

| Severity | Range |
|----------|-------|
| Mild | 36.0-36.4°C |
| Moderate | 32.0-35.9°C |
| Severe | <32.0°C |

## Risks Hypothermia

- Apnea (→ bradycardia)
- Hypoglycemia (depleted glycogen for thermogenesis)
- Metabolic acidosis (anaerobic metabolism)
- Coagulopathy / DIC (severe)
- Persistent fetal circulation (PPHN)
- Increased mortality (significant в VLBW)

## WHO Warm Chain (10 шагов)

1. Тёплая комната родов (≥25°C)
2. Тёплая пелёнка немедленно
3. Skin-to-skin с матерью
4. Раннее кормление (1-й час)
5. Отсроченное купание (≥24 часа)
6. Тёплая одежда + шапочка
7. Mother-infant rooming-in
8. Тёплая транспортировка
9. Тёплая реанимация (преднагретый стол)
10. Обучение персонала + матери

## Preterm-Specific (<32 нед / ELBW)

### В родзале
- t° помещения ≥26-28°C
- Plastic bag/wrap для тела БЕЗ обтирания
- Шапочка обязательно
- Транспорт-инкубатор pre-warmed

### Equipment
- Warmer pre-heated 10-15 мин до родов
- Sterile pre-warmed sheets
- Polyethylene bag/wrap

## Active Re-Warming (для hypothermia)

### Mild (36.0-36.4)
- Skin-to-skin контакт (если стабилен)
- Дополнительные пелёнки + шапочка
- Тёплая комната
- Re-check t° q30 min

### Moderate (32.0-35.9)
- Incubator или warmer with air t° 1-1.5°C above infant t°
- Активный мониторинг q15-30 min
- Glucose check (risk hypoglycemia)
- ABG если concerning

### Severe (<32.0)
- Активное согревание в инкубаторе
- НЕ более 0.5°C/час подъёма (risk apnea, шок)
- IV fluids тёплые (37°C)
- ABG / electrolytes / coags
- Treatment осложнений (DIC, AKI)

## Device Considerations

### Incubator (closed)
- Air t° controlled
- Reduces insensible water loss
- Best для preterm long-term

### Radiant warmer (open)
- Easier access for procedures
- Higher insensible loss (плёнка-cover может уменьшить)
- Used в стартовый период

### Servo-controlled mode
- Skin probe маркирует target t°
- Avoid skin probe artifact (e.g., positioned под heated mattress)

## Transport

- Pre-warmed transport incubator (35-37°C air t°)
- 3-4 layers blankets
- Шапочка
- t° check q15 min during transport
- Document at delivery + arrival NICU

## Quality Metrics

### Admission temperature
- Target ≥36.5°C при NICU admission
- World benchmark <10% admission hypothermia в high-performance NICUs

### Documentation
- Birth t°, transport t°, admission t°
- Time spent below 36.5

## Российская практика

КР МЗ РФ "Уход за недоношенными" — Warm Chain principles standard. Plastic bag для preterm <32 нед в большинстве перинатальных центров.""",
        [],
        [
            "WHO Thermal Control of the Newborn: A Practical Guide. 1997",
            "WHO Recommendations on Newborn Health 2017",
            "Laptook AR et al. Pediatrics 2007;119:e643",
            "McCall EM et al. Cochrane 2018;CD004210",
        ],
    ),

    art(
        "art-communicating-with-parents",
        "Communication с родителями в NICU",
        "Communication with parents в NICU",
        "neonatal", "nicu_team", "basic",
        "Effective communication с NICU-родителями reduces stress, improves shared decision-making, enhances parental mental health. Structured frameworks (SPIKES, NURSE) +empathic delivery.",
        """## Background

NICU experience — emotionally devastating для большинства семей:
- Anxiety / depression → 30-50% mothers
- PTSD-like symptoms → 15-25% parents
- Long-term mental health consequences

Effective communication can mitigate these effects + improve outcomes.

## Communication Frameworks

### SPIKES (для difficult news)
- **S**etting — private, quiet, sufficient time
- **P**erception — what does family understand?
- **I**nvitation — how much detail want they?
- **K**nowledge — give information clearly, в chunks
- **E**motions — recognize, name, validate emotions
- **S**trategy — collaborative plan + summary

### NURSE (emotion-focused)
- **N**ame the emotion ("This must be very hard for you")
- **U**nderstand
- **R**espect
- **S**upport
- **E**xplore

## Daily Rounds Communication

### Family-centered rounds
- Family present (if desired)
- Speak directly to family
- Brief medical jargon, then explain
- Invite questions
- Confirm understanding

### Daily summary
- Use whiteboard / printed daily plan
- Goals для today
- Concerns / changes
- Family input incorporated

## Difficult Conversations

### Bad news
- Honest + compassionate
- Don't soften medically inaccurate
- Allow silence
- Validate emotions
- Plan next steps together

### Conflict / disagreement
- Listen first, fully
- Acknowledge perspective
- Find common ground (well-being of baby)
- Explain medical reasoning
- Involve ethics consult если needed

### End-of-life decisions
- Multidisciplinary meeting (neonatology, palliative, social work)
- Family-led pace
- Allow time для discussion + processing
- Memory-making (photos, footprints, blanket)

## Cultural Sensitivity

### Language barriers
- Use professional interpreters (NOT family members for medical info)
- Verify understanding
- Written materials в local language

### Religious / spiritual
- Ask about religious practices
- Accommodate prayer, rituals (within safety)
- Respect dietary restrictions for breastfeeding mom

### Health literacy
- Check understanding ("Can you tell me what we discussed?")
- Visual aids
- Avoid medical jargon

## Specific Scenarios

### Diagnosis of major anomaly
- SPIKES framework
- Multidisciplinary team
- Genetic counseling referral
- Support resources / parent groups

### Preterm birth
- Acknowledge "premature" doesn't mean inability
- Outcomes data (sensitive — depends GA)
- KMC encouragement
- Long-term support

### Delivery room consultation
- Time-limited (often 5-15 минут)
- Use SPIKES briefly
- Provide resources (handouts, websites)
- Plan follow-up

## Provider Communication

### Team huddles
- Daily брифинг
- Shared mental model
- Highlight communication needs

### Handoffs
- SBAR (Situation-Background-Assessment-Recommendation)
- Include family communication status

### Conflict resolution
- Address conflicts directly
- Involve charge nurse / leadership
- Avoid talking about colleagues to family

## Mental Health Support

### Screening
- Edinburgh Postnatal Depression Scale (EPDS)
- Routine при ≥4 нед NICU stay

### Resources
- Social work consultation
- Peer mentor (NICU graduate parents)
- Mental health referral
- Bereavement specialist (when applicable)

## Российская практика

В современных перинатальных центрах РФ family communication становится приоритетом. Multidisciplinary teams включают перинатального психолога.""",
        [],
        [
            "Baile WF et al. Oncologist 2000;5:302 — SPIKES",
            "Robinson MR et al. Pediatrics 2006;117:e683 — NICU communication",
            "AAP COFN 2024 — Family-Centered Care",
        ],
    ),

    art(
        "art-breast-milk-feeding-initiation",
        "Старт грудного вскармливания у preterm — practical guide",
        "Breastmilk feeding initiation в preterm",
        "gastro", "nicu_team", "intermediate",
        "Mom's own milk (MOM) > donor breast milk (DHM) > preterm formula. Trophic feeds 10-20 мл/кг/сут с Day 1-2. Lactation support критичен — preterm mothers face challenges.",
        """## Background

Mom's own milk у preterm — single most impactful nutrition intervention:
- Reduce NEC by 6-10x vs formula
- Reduce LOS rate
- Improve neurodevelopmental outcomes
- Lower cost
- Bioactive factors (immunoglobulins, growth factors, microbiome)

## Hierarchy of Feeding

1. **Mom's own milk** (preferred — fresh > frozen > pasteurized)
2. **Donor breast milk** (if MOM unavailable, especially для preterm <1500 г)
3. **Preterm formula** (last resort)

## Lactation Support — Practical Steps

### Initial (first 6 hours postpartum)
- Hand expression — colostrum
- Goal: any drop is valuable (1-3 мл typical day 1)
- Apply к baby's lips / oral care

### Day 1-3
- Hand expression q2-3h
- Hospital-grade pump if available
- Frequent — establishes supply

### Day 3-7
- Continue q2-3h pumping
- Goal: ≥500 мл/day by Day 7-10
- Skin-to-skin contact key (oxytocin release)

### Sustaining
- Pump q3-4h around clock
- Avoid >5h overnight gap
- Hydration, nutrition, sleep — supply factors

## Trophic Feeds

### Stable VLBW (1000-1500 g)
- Start within 24-48 ч
- 10-20 мл/кг/сут × 2-3 дня
- Then advance 20-30 мл/кг/сут

### ELBW (<1000 g)
- Start within 24-48 ч если стабилен
- 10-15 мл/кг/сут × 5-7 дней
- Slower advancement 10-20 мл/кг/сут

### IUGR / REDF
- Cautious: trophic 10 мл/кг/сут × 5-7 дней
- Then careful advance

## Fortification

### When
- Volume ≥80-100 мл/кг/сут
- BW <1800 г
- GA <33 нед

### Standard
- HMF (human milk fortifier) 4 г/100 мл
- Achieves 24 ккал/унц

### Targeted/adjustable
- Individualized по urea, growth, phosphate
- Better outcomes — preferred при возможности

## Common Challenges

### Low supply
- Galactagogues (domperidone, metoclopramide — где разрешено)
- Pumping frequency
- Skin-to-skin
- Address stress / sleep deprivation

### NICU separation
- Pumping difficult emotionally
- Provide pump room close к NICU
- Photos / videos baby
- Skin-to-skin asap

### Latching difficulties
- Lactation consultant
- Nipple shields if appropriate
- Patience — preterm baby develops skill gradually

### Maternal медикаменты
- Most ABX, blood pressure meds OK
- Check LactMed (NIH) для specific drugs
- Smoking — avoid; alcohol — limit

## Discharge Preparation

### Breastfeeding readiness
- Latching effectively
- Adequate transfer (test weights)
- Mother confidence

### Combination feeding
- Если supplements needed — bottle, syringe, или supplemental nursing system

### Long-term resources
- Lactation consultant follow-up
- Support groups
- Pump rental information

## Special Situations

### Multiple birth
- More demanding lactation
- Tandem feeding possible
- Realistic expectations

### Maternal HIV
- Formula feeding в high-resource (no breastfeeding)
- WHO recommends exclusive breastfeeding в low-resource if maternal ART (lower risk)

### Adoptive / surrogate
- Induced lactation possible (medications + pumping)
- Donor milk option

## Российская практика

WHO BFHI принципы внедряются. Lactation consultants растут в перинатальных центрах. Donor milk banks limited пока, но developing.""",
        ["neo-newt", "neo-enteral"],
        [
            "Embleton ND et al. JPGN 2022 — ESPGHAN 2022 enteral nutrition preterm",
            "Lawrence RA, Lawrence RM. Breastfeeding 8th ed.",
            "WHO/UNICEF Baby-Friendly Hospital Initiative",
            "Meier PP. Pediatrics 2019;143:e20183416",
        ],
    ),
]


def main() -> None:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    existing_ids = {a["id"] for a in data["articles"]}
    added = 0
    skipped = 0
    for new_a in NEW_ARTICLES:
        if new_a["id"] in existing_ids:
            skipped += 1
            continue
        data["articles"].append(new_a)
        added += 1
    data["version"] = "1.9.0"
    data["lastUpdated"] = "2026-05-10"
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Added: {added}, skipped: {skipped}")
    print(f"Total articles now: {len(data['articles'])}")


if __name__ == "__main__":
    main()
