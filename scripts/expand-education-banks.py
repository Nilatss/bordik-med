"""
Phase 2 expansion of Table 3.Д banks — add 5 each:
- clinical-cases (12 → 17)
- common-mistakes (16 → 21)
- procedure-checklists (10 → 15)
- procedure-videos (16 → 21)
- atlas (16 → 21)

Total +25 educational items. Idempotent (skips by id).
"""
from __future__ import annotations
import json
from pathlib import Path

DIR = Path(r"C:\Users\KDFX Modes\Desktop\bordik-med\public")


# ============================================================================
# CLINICAL CASES (+5)
# ============================================================================
NEW_CASES = [
    {
        "id": "case-pneumothorax-tension",
        "title_ru": "Напряжённый пневмоторакс — экстренная декомпрессия",
        "title_en": "Tension pneumothorax — emergency decompression",
        "topic": "respiratory",
        "level": "intermediate",
        "vignette": "Мальчик GA 27 нед, BW 950 г, день 3 жизни на ИВЛ (PIP 24, PEEP 6, FiO₂ 0.55). Внезапное ухудшение: SpO₂ падает с 92 до 65%, тахикардия → брадикардия, MAP 22 мм рт. ст. Левая половина грудной клетки гиперэкспансирована, дыхание справа ослаблено. Transillumination: яркое свечение слева.",
        "presenting_features": [
            "Внезапное catastrophic ухудшение oxygenation/hemodynamics на ИВЛ",
            "Asymmetric chest expansion + ослабленное дыхание над affected стороной",
            "Tachycardia → bradycardia (terminal sign)",
            "Hypotension с tracheal deviation",
            "Transillumination: яркое свечение affected стороны (gold standard в emergency)",
        ],
        "differential": [
            "Tension pneumothorax (наиболее вероятно — classic presentation)",
            "Mainstem intubation (правый bronchus) — рентген обнаружит",
            "ETT obstruction / displacement",
            "Massive PDA c left-to-right shunt — менее вероятно при acute event",
            "Cardiac tamponade (UVC complication possible)",
        ],
        "management": [
            "STAT: 23G angiocath во 2-м межреберье midclavicular line affected стороны.",
            "Aspirate с шприцом — air return подтверждает диагноз.",
            "Замена angiocath на chest tube ASAP (пёстро 8-10 Fr через 5-е межреберье anterior axillary line).",
            "Underwater seal с suction -10 до -15 cm H₂O.",
            "Stat AP CXR — verify resolution + tube position.",
            "Optimize ventilation: lower PIP, accept permissive hypercapnia.",
            "Hemodynamic support PRN (volume bolus 10 мл/кг, если hypotensive).",
            "Removal criteria: no air leak × 24 ч + lung fully expanded.",
        ],
        "pearls": [
            "Tension pneumothorax — clinical diagnosis в emergency. Не ждать рентгена при decompensation.",
            "Transillumination — bedside tool, no radiation, instant.",
            "Avoid trocar при placement — blunt dissection safer (lung injury risk).",
        ],
        "references": [
            "AAP COFN Procedures 2024",
            "Wyman ML et al. J Perinatol 2007;27:481",
            "Aly H et al. Pediatrics 2004;113:1660",
        ],
    },
    {
        "id": "case-cooling-rewarming-seizure",
        "title_ru": "Судороги во время rewarming после TH",
        "title_en": "Seizures during rewarming after TH",
        "topic": "neuro",
        "level": "advanced",
        "vignette": "Девочка 39 нед, BW 3300 г, после TH (72 ч cooling). На 6-м часе rewarming (rate 0.4°C/час, core t° 35.8°C) — фокальные клонические судороги правой руки на aEEG, длительность 2 мин, повторяются каждые 10-15 мин. Phenobarbital 20 мг/кг IV получен. Нужно решить.",
        "presenting_features": [
            "Status epilepticus после рекомендованной TH",
            "Появление судорог во время rewarming phase",
            "Already received first-line phenobarbital",
            "Persistent electrographic activity на aEEG",
        ],
        "differential": [
            "Continuing HIE seizures (наиболее вероятно — peak активность 24-48 ч)",
            "Metabolic причина (hypoglycemia, hypocalcemia, hypomagnesemia) — проверить",
            "Stroke / новое кровоизлияние",
            "Sepsis/meningitis",
            "Drug toxicity",
        ],
        "management": [
            "Stat labs: glucose, ionized Ca²⁺, Mg²⁺, Na⁺, ABG, ammonia.",
            "Repeat phenobarbital 10 мг/кг IV (total до 40 мг/кг).",
            "Если persistent: levetiracetam 20-40 мг/кг IV loading, затем 20 мг/кг q12h.",
            "Если refractory: midazolam continuous 0.05-0.5 мг/кг/час IV.",
            "STOP rewarming — может усиливать seizures. Hold core t° на текущем 35.8°C × 6-12 ч пока seizures не контролируются.",
            "Continuous aEEG/EEG monitoring.",
            "MRI brain через 24-48 ч после control seizures.",
            "Multidisciplinary review: neurology consult, social work для family.",
        ],
        "pearls": [
            "Rewarming-phase seizures — common pitfall. Slow rate ≤0.5°C/час обязателен.",
            "Sub-clinical (electrographic) seizures у 30-50% HIE — значит continuous EEG обязателен.",
            "При refractory seizures — pause rewarming. Возобновить когда seizures под контролем.",
        ],
        "references": [
            "Sharpe C et al. Pediatrics 2020;145:e20193182 — NeoLEV2",
            "Glass HC et al. Neurology 2017;88:1845",
            "Shankaran S et al. NEJM 2005;353:1574 — NICHD",
        ],
    },
    {
        "id": "case-galactosemia-classical",
        "title_ru": "Классическая галактоземия — sepsis-like presentation",
        "title_en": "Classical galactosemia — sepsis-like presentation",
        "topic": "metabolic",
        "level": "advanced",
        "vignette": "Девочка 39 нед, BW 3450 г, грудное вскармливание. День 5 жизни — vomiting, jaundice (TSB 320 мкмоль/л conjugated 65 мкмоль/л), hepatomegaly, hypoglycemia 1.8 ммоль/л, lethargy. Cataracts на eye exam. Blood culture pending — клиника напоминает sepsis.",
        "presenting_features": [
            "Day 5 jaundice WITH conjugated bilirubin elevated (>20% direct)",
            "Cataracts (galactitol accumulation в lens)",
            "Hepatomegaly + hypoglycemia",
            "Sepsis-like picture (E. coli sepsis particularly common — galactose impairs immune)",
            "Vomiting after milk feeds",
        ],
        "differential": [
            "Classical galactosemia (GALT deficiency) — наиболее вероятно с этой триадой",
            "E. coli sepsis (parallel — common complication galactosemia)",
            "Other IEM (tyrosinemia I, hereditary fructose intolerance)",
            "Cholestasis (biliary atresia, neonatal hepatitis)",
            "Adrenal insufficiency",
        ],
        "management": [
            "STOP all lactose-containing feeds немедленно (lactose = galactose + glucose, breast milk + standard formula contraindicated).",
            "Switch на lactose-free formula (soy-based: Isomil, Prosobee) или elemental formula.",
            "Treat hypoglycemia: D10 IV bolus + continuous infusion.",
            "Treat suspected E. coli sepsis: ампициллин + гентамицин IV pending cultures.",
            "Confirmatory testing: GALT enzyme activity (RBC), urine reducing substances (positive — galactose), gene sequencing GALT.",
            "Genetics consult.",
            "Long-term: lifelong lactose-free diet, calcium/vitamin D supplementation, monitor cataracts, ovarian function (premature ovarian failure common у females).",
        ],
        "pearls": [
            "Classical galactosemia триада: jaundice/hepatomegaly + cataracts + sepsis-like.",
            "ВАЖНО: НЕ ждать NBS results — clinical picture требует немедленного действия.",
            "E. coli sepsis у galactosemic infant — высокий mortality risk без раннего ABX + diet change.",
        ],
        "references": [
            "Berry GT. Galactose-1-Phosphate Uridyltransferase Deficiency. GeneReviews 2021",
            "Welling L et al. JIMD Reports 2017;31:55",
            "ACMG Practice Guidelines 2017 — Classic Galactosemia",
        ],
    },
    {
        "id": "case-elbw-feeding-intolerance",
        "title_ru": "Feeding intolerance у ELBW — NEC vs benign",
        "title_en": "Feeding intolerance in ELBW — NEC vs benign",
        "topic": "gastro",
        "level": "intermediate",
        "vignette": "Мальчик GA 25 нед, BW 720 г, day 10 жизни на trophic feeds (15 мл/кг/сут MOM). Получает второй cycle ibuprofen для hsPDA. Сегодня: bilious gastric residual 4 мл, mild abdominal distention, без emesis. Stool guaiac negative. Vital signs stable. CBC, CRP normal.",
        "presenting_features": [
            "Bilious gastric residual у preterm на trophic feeds",
            "Mild abdominal distention без tenderness",
            "Recent NSAID exposure (ibuprofen) — risk factor",
            "VITAL signs stable — important",
            "Negative stool guaiac",
        ],
        "differential": [
            "Benign feeding intolerance / immature gut motility (наиболее вероятно — stable vitals, no inflammatory markers)",
            "Early NEC (IA-IB) — must rule out",
            "Spontaneous intestinal perforation (SIP) — NSAID exposure increases risk",
            "Volvulus — менее вероятно без bilious emesis",
            "Mechanical issue (mal-positioned NG tube)",
        ],
        "management": [
            "Hold next feed × 1 cycle (3-6 ч), reassess.",
            "AXR — exclude pneumatosis, free air, dilated loops.",
            "Repeat assessment q3-4h: abdominal exam, residuals, stool, vitals.",
            "If repeat exam stable + AXR clean: resume trophic feeds at slower advancement.",
            "Если any escalation (bloody stool, distention, hemodynamic change): NPO + ABX (амп + гент + метро) + escalate workup.",
            "Discontinue ibuprofen if not yet completed (NSAID + GI symptoms warning).",
            "Monitor lactate, CBC, CRP serially × 24 ч.",
        ],
        "pearls": [
            "Bilious residual у preterm не всегда NEC — но всегда требует careful exam + AXR.",
            "ESPGHAN 2022 — routine residual measurement НЕ recommended, но при concerning signs (bilious, blood) — investigate.",
            "Ibuprofen + ELBW = high SIP risk; mucle awareness pre-treatment.",
        ],
        "references": [
            "Embleton ND et al. JPGN 2022 — ESPGHAN 2022",
            "Bell MJ et al. Ann Surg 1978;187:1",
            "Mitra S et al. JAMA 2018;319:1221",
        ],
    },
    {
        "id": "case-hypothermia-elbw-admission",
        "title_ru": "Тяжёлая гипотермия ELBW при admission",
        "title_en": "Severe hypothermia ELBW at admission",
        "topic": "neonatal",
        "level": "intermediate",
        "vignette": "Девочка GA 24 5/7 нед, BW 590 г. Доставлена в NICU после cesarean. Apgar 4/6/7. После placement в incubator t° axillary 33.8°C. Hypoglycemia BG 1.4 ммоль/л. Tachypnea 70/мин на CPAP FiO₂ 0.40 SpO₂ 88%. UVC еще не placed.",
        "presenting_features": [
            "Severe hypothermia (<35°C) у ELBW при admission",
            "Concurrent hypoglycemia (anaerobic metabolism)",
            "Inadequate transition в delivery room",
            "Respiratory distress",
            "Critical в Golden Hour window",
        ],
        "differential": [
            "Failure of warm chain в delivery room (наиболее вероятно — preventable)",
            "Severe RDS contributing к ↑ insensible loss",
            "Sepsis / inflammatory response",
            "Major anomaly с ↑ heat loss",
        ],
        "management": [
            "Active rewarming: incubator air t° 1-1.5°C above patient (currently 35°C target, slow rise ≤0.5°C/час).",
            "DO NOT rewarm faster — risk apnea, hypotension, ICH.",
            "Treat hypoglycemia: D10 bolus 2 мл/кг IV, then continuous D10 GIR 6-8 мг/кг/мин.",
            "Stat UVC placement + start TPN с aminoacids early.",
            "Monitor q15 min: t°, HR, SpO₂, BP, glucose.",
            "ABG, electrolytes, lactate (acidosis от anaerobic metabolism).",
            "Coagulation panel — DIC risk при severe hypothermia.",
            "Investigate sepsis (blood culture + empiric ABX).",
            "Quality review: assess delivery room warm chain compliance — prevention >> treatment.",
        ],
        "pearls": [
            "Hypothermia при NICU admission — independent predictor mortality в VLBW (×1.28 per 1°C decline below 36.5°C).",
            "Plastic bag + hat в delivery room — most cost-effective prevention для ELBW.",
            "Rapid rewarming = bad outcomes. Slow + controlled = standard.",
        ],
        "references": [
            "Laptook AR et al. Pediatrics 2007;119:e643",
            "WHO Thermal Control of the Newborn 1997",
            "McCall EM et al. Cochrane 2018;CD004210",
        ],
    },
]


# ============================================================================
# COMMON MISTAKES (+5)
# ============================================================================
NEW_MISTAKES = [
    {
        "id": "mistake-rapid-rewarming-th",
        "title_ru": "Rapid rewarming после therapeutic hypothermia",
        "title_en": "Rapid rewarming after TH",
        "category": "neuro",
        "severity": "high",
        "mistake": "Reactive ускорение rewarming (>1°C/час) после 72-часовой TH потому что ребёнок выглядит стабильным или из-за impatience.",
        "why_it_happens": "Не понимание физиологии — slow rewarming critical для preventing rebound seizures, hypotension, hyperthermia.",
        "correct_approach": "Strict rate ≤0.5°C/час × 6-12 часов. Continuous monitoring t°, HR, BP, glucose, EEG. Pause rewarming если seizures, hypotension. Total rewarming time 6-12 часов до 36.5°C.",
        "consequence": "Rebound seizures (30-50% при rapid rewarming), hypotension, K⁺ shifts, hyperthermia rebound — все compromise neuroprotection benefits TH.",
        "references": [
            "Shankaran S et al. NEJM 2005;353:1574",
            "Battin MR et al. J Pediatr 2004;144:518",
        ],
    },
    {
        "id": "mistake-no-iv-after-pulse-fail",
        "title_ru": "Не provide IV после failed pulse oximetry screen",
        "title_en": "Discharge after failed pulse ox without echo",
        "category": "screening",
        "severity": "high",
        "mistake": "Discharge ребёнка home после single failed pulse ox screen без stat echo + cardiology consultation.",
        "why_it_happens": "False-positive rate ~1.6% общая, particularly если screen <24 hr. Misperception что repeat screen достаточно.",
        "correct_approach": "Failed CCHD pulse ox screen → STAT echocardiogram + cardiology consultation. NOT discharge until CHD ruled out OR managed. Sensitivity pulse ox ~76% — failed screen = high pre-test probability critical CHD.",
        "consequence": "Missed critical CHD (HLHS, TGA, TOF) → cardiovascular collapse при closing PDA, death или severe morbidity.",
        "references": [
            "Mahle WT et al. AAP-CCHD 2009",
            "Thangaratinam S et al. Lancet 2012;379:2459",
        ],
    },
    {
        "id": "mistake-prolonged-empiric-abx",
        "title_ru": "Продолжение empiric ABX после negative cultures + clinical improvement",
        "title_en": "Prolonged empiric ABX in negative culture sepsis",
        "category": "infection",
        "severity": "medium",
        "mistake": "Continuing empiric antibiotics 7+ дней у well-appearing newborn с negative blood culture после 48 часов.",
        "why_it_happens": "'Безопасность' decision-making — fear of missing infection. Не учитывают негативные effects prolonged ABX.",
        "correct_approach": "Stop empiric ABX 36-48 часов если cultures negative + clinical improvement (CRP normalising, vitals stable, feeding OK). EOS calculator + serial CRP guides decision.",
        "consequence": "Prolonged ABX (>5 дней): ↑ NEC (RR 1.84), candidemia, antibiotic resistance, dysbiosis affecting long-term microbiome / asthma / allergy.",
        "references": [
            "Cantey JB et al. JPIDS 2018;7:e7",
            "Cordero L, Ayers LW. Infect Control Hosp Epidemiol 2003;24:662",
        ],
    },
    {
        "id": "mistake-routine-bicarb-acidosis",
        "title_ru": "Bicarbonate bolus при метаболическом ацидозе у newborn",
        "title_en": "Routine bicarbonate bolus в metabolic acidosis",
        "category": "metabolic",
        "severity": "medium",
        "mistake": "Routine NaHCO₃ bolus 1-2 мэкв/кг IV для коррекции metabolic acidosis при HIE / sepsis / shock.",
        "why_it_happens": "Старая практика. Conceptual appeal — раз pH низкий, давайте bicarb.",
        "correct_approach": "Treat the cause: hypoxia → ventilation, hypovolemia → fluids, sepsis → ABX. Bicarbonate routinely NOT recommended (Cochrane). Reserved для severe pH<7.0 + adequate ventilation + persistent acidosis.",
        "consequence": "Paradoxical CSF acidosis → worse cerebral perfusion. Hyperosmolality → IVH risk. Hypernatremia. Без proven benefit на mortality / neurodevelopmental outcomes.",
        "references": [
            "Lokesh L et al. Cochrane 2004;CD004864",
            "AHA NRP 8 ed. — bicarbonate guidance",
        ],
    },
    {
        "id": "mistake-d50-vs-d10",
        "title_ru": "Использование D50 в лечении gипогликемии",
        "title_en": "Using D50 for hypoglycemia",
        "category": "medication",
        "severity": "high",
        "mistake": "Bolus D50 (50% dextrose) IV для коррекции neonatal hypoglycemia — copying adult ACLS practice.",
        "why_it_happens": "Из adult resus protocols. Неправильное понимание osmolality safety у newborn vessels.",
        "correct_approach": "Newborn hypoglycemia: D10W 2 мл/кг bolus (200 мг/кг), затем continuous D10W GIR 6-8 мг/кг/мин. NEVER D50 в peripheral vein.",
        "consequence": "Severe phlebitis, extravasation → tissue necrosis → permanent injury (loss of digit / limb). Hyperosmolar load.",
        "references": [
            "AAP CFN. Pediatrics 2011;127:575",
            "Adamkin DH. Pediatrics 2017;141:e20174112",
        ],
    },
]


# ============================================================================
# ATLAS (+5)
# ============================================================================
NEW_ATLAS = [
    {
        "id": "atlas-tetanus-gangrene-omphalitis",
        "title_ru": "Омфалит и тетанус новорождённого — клиническая картина",
        "title_en": "Omphalitis and neonatal tetanus — clinical findings",
        "description": "Visual atlas omphalitis (purulent discharge, periumbilical erythema, induration) + neonatal tetanus (trismus, opisthotonus, generalized rigidity). Both — life-threatening in low-resource settings. WHO targets elimination через clean delivery + maternal vaccination.",
        "key_findings": [
            "Omphalitis — purulent discharge, periumbilical erythema (>2 см), induration, fever",
            "Severe omphalitis: necrotizing fasciitis, sepsis, mortality up to 25%",
            "Neonatal tetanus — typically day 3-14, decreased feeding → trismus → spasms → opisthotonus",
            "Risk factors: home delivery без clean cord care, maternal не vaccinated против столбняка",
            "Prevention: clean delivery 6 принципов + chlorhexidine 4% pump на пуповину + maternal Td",
        ],
        "source": "WHO / Stanford Tropical Medicine Atlas",
        "source_type": "who_official",
        "url": "https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/newborn-health",
        "category": "skin",
    },
    {
        "id": "atlas-cleft-lip-palate",
        "title_ru": "Расщелины губы и нёба — спектр",
        "title_en": "Cleft lip and palate spectrum",
        "description": "Visual spectrum от incomplete unilateral cleft lip до complete bilateral cleft lip + palate. Importance multidisciplinary care (surgery, feeding specialist, speech, dental, audiology).",
        "key_findings": [
            "Incomplete vs complete cleft lip",
            "Unilateral vs bilateral",
            "Cleft palate: hard palate vs soft palate vs both",
            "Submucous cleft palate (subtle, easy to miss — bifid uvula clue)",
            "Pierre Robin sequence: micrognathia + glossoptosis + cleft palate (airway concern)",
            "Repair timeline: lip 3 мес, palate 9-12 мес (varies)",
        ],
        "source": "American Cleft Palate-Craniofacial Association / Stanford",
        "source_type": "stanford",
        "url": "https://acpa-cpf.org/parents-individuals/about-cleft-palate-craniofacial-conditions/",
        "category": "examination",
    },
    {
        "id": "atlas-hip-dysplasia-ortolani",
        "title_ru": "Дисплазия тазобедренных суставов — Ortolani / Barlow",
        "title_en": "Developmental dysplasia of hip — Ortolani / Barlow",
        "description": "Demonstration Ortolani test (relocation reduction) + Barlow test (provocative dislocation) для DDH screening. Risk factors: female, breech, family history. Early diagnosis critical для outcomes.",
        "key_findings": [
            "Ortolani: hip flexed 90°, gentle abduction, posterior pressure → palpable 'clunk' = reduction",
            "Barlow: hip flexed 90°, adduction, posterior pressure → palpable 'clunk' = dislocation",
            "Klisic test (older infants): hand on greater trochanter + ASIS — line should bisect umbilicus",
            "Galeazzi sign — uneven knee height в supine flexed position",
            "Ultrasound screen <6 нед age, X-ray after 4-6 мес",
            "Treatment: Pavlik harness <6 мес usually",
        ],
        "source": "AAP COFN / OrthoBullets",
        "source_type": "stanford",
        "url": "https://stanfordmedicine25.stanford.edu/the25/newbornExam.html",
        "category": "examination",
    },
    {
        "id": "atlas-cradle-cap-vs-eczema",
        "title_ru": "Себорея головы vs атопический дерматит — newborn rashes",
        "title_en": "Cradle cap vs atopic dermatitis — newborn rashes",
        "description": "Differentiation common newborn rashes: cradle cap (seborrheic dermatitis), atopic dermatitis, candidiasis (diaper area), miliaria. Most resolve spontaneously, some need treatment.",
        "key_findings": [
            "Cradle cap (seborrhea) — yellow greasy scales scalp, eyebrows, behind ears",
            "Atopic dermatitis — typically face/cheeks 1-3 мес, dry erythematous patches",
            "Candidiasis (diaper) — bright red beefy erythema + satellite pustules",
            "Miliaria rubra — pinpoint papules в hot moist areas",
            "Erythema toxicum (different — pustules with halo, day 1-3, self-resolving)",
            "Treatment: cradle cap — gentle wash + emollient; eczema — emollients + topical steroids low-strength",
        ],
        "source": "Visual DX / NEJM",
        "source_type": "nejm",
        "url": "https://www.nejm.org/doi/full/10.1056/NEJMra1700351",
        "category": "skin",
    },
    {
        "id": "atlas-myelomeningocele-spina-bifida",
        "title_ru": "Spina bifida + миеломенингоцеле — antenatal + postnatal",
        "title_en": "Spina bifida + myelomeningocele — antenatal + postnatal",
        "description": "Visual atlas spina bifida occulta (subtle: hairy tuft, dimple, lipoma) → meningocele (CSF-filled sac) → myelomeningocele (neural tissue exposed). Most severe форма requires immediate sterile dressing + surgical closure.",
        "key_findings": [
            "Spina bifida occulta — sacral dimple, tuft, lipoma, port-wine stain over spine",
            "Meningocele — CSF sac without neural tissue, skin-covered usually",
            "Myelomeningocele — open neural placode, immediate sterile saline-soaked gauze",
            "Closure surgery — first 24-48 ч жизни (preferred)",
            "Hydrocephalus 80% require VP shunt",
            "Antenatal MOMS trial — prenatal закрытие better motor outcomes",
            "Folic acid prevention 400 мкг daily preconception (reduces incidence by 50-70%)",
        ],
        "source": "Radiopaedia / NEJM Neonatal",
        "source_type": "radiopaedia",
        "url": "https://radiopaedia.org/articles/myelomeningocele",
        "category": "examination",
    },
]


# ============================================================================
# CHECKLISTS (+5)
# ============================================================================
NEW_CHECKLISTS = [
    {
        "id": "checklist-arterial-line-radial",
        "title_ru": "Постановка peripheral arterial line (radial)",
        "title_en": "Peripheral arterial line placement (radial)",
        "category": "vascular_access",
        "estimated_minutes": 20,
        "audience": "Врач-неонатолог",
        "indications": [
            "Continuous arterial BP monitoring у unstable neonate",
            "Frequent ABG sampling",
            "Когда UAC недоступен или contraindicated",
        ],
        "sections": [
            {"title": "Подготовка", "items": [
                "22-24 G arterial cath (Insyte 24 Fr most common term, Cathlon 24 Fr ≤1500 г)",
                "Стерильный набор: gloves, drape, антисептик",
                "T-piece + heparinized NaCl 0.9% (1 ЕД/мл)",
                "Pressure transducer + monitor",
                "Sterile occlusive dressing",
                "Готовность ultrasound (improves success ELBW)",
            ]},
            {"title": "Перед процедурой", "items": [
                "Modified Allen test — assess collateral ulnar flow",
                "Pulse palpation — radial artery typically lateral к flexor carpi radialis tendon",
                "Position wrist hyperextended over rolled towel",
                "Sterile prep + drape",
                "Sucrose 24% PO + non-nutritive sucking",
                "Local anesthesia: lidocaine 1% 0.1 мл (max 4 мг/кг without epi)",
            ]},
            {"title": "Insertion technique", "items": [
                "Identify maximum pulsation",
                "Insert needle 30° angle, slowly advance",
                "Watch for arterial flash (pulsatile bright red)",
                "Lower angle, advance catheter into vessel",
                "Withdraw needle, attach T-piece",
                "Connect transducer, observe waveform",
            ]},
            {"title": "После процедуры", "items": [
                "Anchor с suture или secure tape",
                "Sterile transparent dressing — visualization",
                "Set BP monitor + waveform alarm",
                "Toe/finger perfusion check q1h",
                "Document time, side, gauge, attempts",
                "Removal criteria: not needed OR signs ischemia OR ≥7 дней (CDC recommendation)",
            ]},
            {"title": "Осложнения", "items": [
                "Vasospasm — STAT removal если persistent ischemia >30 мин",
                "Thrombosis — anticoagulation considered",
                "Hematoma",
                "Infection (catheter-related bloodstream infection)",
                "Inadvertent venipuncture (arterial blood pulsates, venous doesn't)",
            ]},
        ],
        "references": [
            "AAP COFN Procedures 2024",
            "Schindler E et al. Anaesth Crit Care Pain Med 2017;36:419",
        ],
    },
    {
        "id": "checklist-blood-transfusion-prbc",
        "title_ru": "Трансфузия эритроцитарной массы (PRBC)",
        "title_en": "Packed RBC transfusion в neonate",
        "category": "vascular_access",
        "estimated_minutes": 30,
        "audience": "Врач-неонатолог + медсестра",
        "indications": [
            "Anemia с symptoms (apnea, bradycardia, поor feeding, lactic acidosis)",
            "TOP trial thresholds: Hb 70-110 г/л based on respiratory support + age (Kirpalani 2020)",
            "Acute hemorrhage с hemodynamic compromise",
        ],
        "sections": [
            {"title": "Подготовка", "items": [
                "Type + crossmatch verified ребёнок и мать",
                "PRBC: leukoreduced, irradiated, CMV-seronegative или -reduced (CDC)",
                "Volume calculation: 10-15 мл/кг (over 2-4 часа typically)",
                "Pre-warming preferred (avoid hypothermia из cold blood)",
                "IV access (peripheral OK, NOT через UVC если sterile concerns)",
                "Furosemide ready — если concerned для volume overload",
            ]},
            {"title": "Перед transfusion", "items": [
                "Two-person verification: patient name, blood unit ID, expiry, crossmatch",
                "Baseline vitals: t°, HR, BP, RR, SpO₂",
                "Pre-transfusion CBC + bilirubin",
                "Informed consent (parental — каждая transfusion)",
                "Document time of start",
            ]},
            {"title": "Во время transfusion", "items": [
                "Slow start 1-2 мл/кг/час × 15 мин — watch for reaction",
                "Reassess vitals at 15 мин, 30 мин, hourly",
                "Standard rate 10-15 мл/кг/час if stable",
                "Maximum infusion time 4 часа per unit (bacterial growth risk)",
                "Watch для transfusion reaction signs (fever, hypotension, hives, hemoglobinuria)",
            ]},
            {"title": "После transfusion", "items": [
                "Post-transfusion CBC 1-2 часа (verify rise; expected 1 мл/кг raises Hb 10 г/л)",
                "Recheck bilirubin 6 часа (TSB rise — common, monitor)",
                "Documentation: volume, rate, response, complications",
                "Consider iron supplementation после multiple transfusions",
            ]},
            {"title": "Осложнения", "items": [
                "Acute hemolytic reaction — STOP, supportive care, investigate",
                "Bacterial contamination (rare с modern screening, but high mortality)",
                "TACO (transfusion-associated circulatory overload) — slow rate, diuretic",
                "TRALI (transfusion-related acute lung injury)",
                "Hyperkalemia (older blood)",
                "NEC (controversial association — irradiated leukoreduced lower risk)",
            ]},
        ],
        "references": [
            "Kirpalani H et al. NEJM 2020;383:2639 — TOP trial",
            "Whyte RK, Jefferies AL. CPS 2014",
            "AABB Standards 2024",
        ],
    },
    {
        "id": "checklist-ng-tube-placement",
        "title_ru": "Постановка orogastric/nasogastric зонда",
        "title_en": "Orogastric/nasogastric tube placement",
        "category": "respiratory",
        "estimated_minutes": 5,
        "audience": "Медсестра / врач",
        "indications": [
            "Enteral nutrition delivery в preterm",
            "Gastric decompression (CPAP, NEC, ileus)",
            "Medication administration",
        ],
        "sections": [
            {"title": "Подготовка", "items": [
                "Tube: 5 Fr (preterm <2 кг), 8 Fr (term)",
                "Choice: orogastric preferred preterm <34 нед (preserves nasal breathing)",
                "Lubricant (sterile water-soluble)",
                "Шприц 5-10 мл для aspiration",
                "Tape для secure",
                "pH paper или verification system",
            ]},
            {"title": "Pre-measurement (NEMU technique preferred)", "items": [
                "NEMU = nose to ear to mid-umbilicus distance",
                "Mark measurement на tube (sterile marker)",
                "Alternative formula: weight-based 13 + (weight kg × 1.7) cm",
                "Не использовать NEX (nose-ear-xiphoid) — frequently malpositioned",
            ]},
            {"title": "Insertion", "items": [
                "Position infant supine, head в neutral position",
                "Lubricate tip of tube",
                "Pass tube smoothly through mouth/nose toward back of throat",
                "При 5-7 см от mouth — pass quickly past pharynx",
                "Continue к pre-measured depth",
                "При resistance — STOP, withdraw 1-2 см, re-attempt slowly",
            ]},
            {"title": "Verification (CRITICAL)", "items": [
                "Aspirate gastric contents — pH paper testing",
                "pH ≤5.0 = correctly в желудке (gastric acid)",
                "pH 5.5-7.0 = uncertain — verify дополнительно",
                "pH >7.0 = likely respiratory tract — REMOVE",
                "Auscultation alone NOT reliable (false-positive в lung)",
                "Ультразвук подтверждение если pH uncertain (ELBW часто achlorhydric)",
                "X-ray verification если concerns / large feeds planned",
            ]},
            {"title": "Secure + post-procedure", "items": [
                "Tape secure без tension на nose / lip",
                "Document depth at lip / naris",
                "Check residuals before each feed",
                "Re-verify position daily + при concerning signs",
                "Replace q3-7 days (или per institution policy)",
            ]},
            {"title": "Осложнения", "items": [
                "Misplacement в trachea (especially preterm) → respiratory compromise",
                "Tracheoesophageal injury",
                "Apnea / bradycardia при insertion (vagal)",
                "Skin breakdown около nose / lip",
                "Sinusitis (chronic NG)",
            ]},
        ],
        "references": [
            "ESPGHAN 2018 PN guidelines",
            "Quandt D et al. J Perinatol 2009;29:339 — NEMU vs NEX",
            "AAP Hospital Care Manual 2024",
        ],
    },
    {
        "id": "checklist-discharge-readiness-vlbw",
        "title_ru": "Готовность к выписке VLBW",
        "title_en": "Discharge readiness VLBW",
        "category": "resuscitation",
        "estimated_minutes": 15,
        "audience": "NICU team",
        "indications": [
            "VLBW preterm после prolonged NICU stay",
            "Discharge planning для multidisciplinary team",
        ],
        "sections": [
            {"title": "Cardio-respiratory stability", "items": [
                "No apnea / bradycardia × 5-7 дней (institution-specific)",
                "Off methylxanthines × 5-7 дней",
                "On stable respiratory support if any (or room air)",
                "SpO₂ stable in target range",
                "No supplemental O₂ OR home O₂ plan in place",
            ]},
            {"title": "Thermal regulation", "items": [
                "Maintain temperature в open crib без incubator",
                "≥1800-2000 г weight (institution variable)",
                "Demonstrated thermal stability × 24-48 часов",
            ]},
            {"title": "Nutrition + growth", "items": [
                "Adequate weight gain trajectory (15-30 г/сут)",
                "All feeds PO (бутылка / breastfeeding) OR home tube feeding plan",
                "Mother's breastfeeding established / formula plan",
                "Iron supplementation prescribed (preterm)",
                "Vitamin D supplementation prescribed",
                "HMF transition plan если applicable",
            ]},
            {"title": "Screenings completed", "items": [
                "Hearing screen (AABR/OAE) passed OR follow-up arranged",
                "ROP — to regression OR follow-up scheduled",
                "Cranial ultrasound — final exam",
                "CCHD pulse ox screen passed",
                "Newborn metabolic screen sent",
                "Hb / electrolytes acceptable",
                "Hip exam normal",
            ]},
            {"title": "Family education + support", "items": [
                "CPR training для primary caregivers",
                "Medication administration training",
                "Recognition signs of illness",
                "Equipment training (apnea monitor, O₂, tube feeds если applicable)",
                "Safe sleep education",
                "Car seat tolerance test passed (semi-recumbent angle observation 90 min)",
                "Social work assessment + community resources",
                "Mental health support (parental depression screen)",
            ]},
            {"title": "Follow-up arranged", "items": [
                "Pediatrician visit within 1-3 days of discharge",
                "NICU follow-up clinic at 1 month, 4 months, 6-9 months, 12-15 months",
                "Developmental follow-up до 18-24 months corrected age",
                "Specialty follow-up: ophthalmology, audiology, neurology, pulmonology PRN",
                "Early intervention referral если indicated",
                "Synagis (palivizumab) plan для RSV season если eligible",
            ]},
        ],
        "references": [
            "AAP COFN. Pediatrics 2008;122:1119 — Hospital Discharge of the High-Risk Neonate",
            "Bull MJ, Engle WA. AAP. Pediatrics 2009;123:1424",
        ],
    },
    {
        "id": "checklist-blood-glucose-monitoring",
        "title_ru": "Glucose мониторинг at-risk newborn в первые 48 часов",
        "title_en": "Glucose monitoring at-risk newborn first 48h",
        "category": "vascular_access",
        "estimated_minutes": 5,
        "audience": "Медсестра",
        "indications": [
            "IDM (мать с диабетом)",
            "LGA (>90-й перцентиль)",
            "SGA (<10-й перцентиль)",
            "Late preterm 34-36 нед",
            "Symptomatic newborn",
        ],
        "sections": [
            {"title": "Schedule", "items": [
                "First check 30-60 мин после first feed (within 2 ч жизни)",
                "Repeat pre-feed × 12-24 ч (q3-4h)",
                "Continue × 12-48 ч depending risk + glucose stability",
                "Stop after 2-3 stable pre-feed values ≥2.6 ммоль/л (47 мг/дл)",
            ]},
            {"title": "Action thresholds", "items": [
                "BG <1.0 ммоль/л — STAT IV D10 bolus regardless symptoms",
                "BG <2.0 ммоль/л + symptoms — IV D10 bolus + continuous infusion",
                "BG <2.0 ммоль/л asymptomatic — feed (formula 10-30 мл/кг или breastfeed)",
                "BG <2.6 ммоль/л + symptoms — IV D10 bolus",
                "BG ≥2.6 ммоль/л — continue routine schedule",
            ]},
            {"title": "Buccal dextrose gel option", "items": [
                "40% dextrose gel 0.2 г/кг (~0.5 мл/кг) PO buccal",
                "Apply в cheek mucosa, follow с feed",
                "Adjunct, NOT replacement for evaluation",
                "SHIN trial: equivalent или superior to IV для transient operational hypoglycemia",
            ]},
            {"title": "Documentation", "items": [
                "Time + value каждой glucose check",
                "Method: bedside glucometer vs lab plasma",
                "Confirmed lab value if bedside <2.5 ммоль/л",
                "Feed timing relative к check",
                "Symptoms если любые",
                "Action taken",
            ]},
            {"title": "Persistent hypoglycemia >48 hours", "items": [
                "Critical sample при event (BG <2.6):",
                "  Insulin, C-peptide, cortisol, GH",
                "  β-hydroxybutyrate, free fatty acids",
                "  Lactate, ammonia",
                "  Urine ketones, reducing substances, organic acids",
                "Glucagon stimulation test (rise ≥1.7 ммоль/л = preserved liver glycogen + HI)",
                "Consult endocrine + metabolic",
                "Diazoxide trial если HI confirmed",
            ]},
        ],
        "references": [
            "BAPM 2017 — Identification & Management Neonatal Hypoglycaemia",
            "Thornton PS et al. PES J Pediatr 2015;167:238",
            "Harris DL et al. Lancet 2013;382:2077 — SHIN trial",
        ],
    },
]


# ============================================================================
# VIDEOS (+5)
# ============================================================================
NEW_VIDEOS = [
    {
        "id": "video-newborn-hearing-screen",
        "title_ru": "Скрининг слуха новорождённого — AABR/OAE",
        "title_en": "Newborn hearing screen — AABR/OAE",
        "description": "Demonstration both AABR (Automated Auditory Brainstem Response) и OAE (Otoacoustic Emissions) techniques. AABR preferred для NICU babies (catches retrocochlear pathology).",
        "source": "American Academy of Audiology",
        "source_type": "youtube_official",
        "url": "https://www.audiology.org/practice-guidelines/childhood-hearing-screening-guidelines/",
        "category": "screening",
        "duration_min": 8,
        "tags": ["слух", "AABR", "OAE", "screening"],
    },
    {
        "id": "video-cpr-newborn-2-thumb",
        "title_ru": "Two-thumb encircling CPR техника",
        "title_en": "Two-thumb encircling CPR technique",
        "description": "Detailed demonstration two-thumb encircling chest compression technique для newborn CPR. Preferred over two-finger при ≥2 rescuers (less fatigue, better quality compressions).",
        "source": "American Heart Association",
        "source_type": "youtube_official",
        "url": "https://www.heart.org/en/cpr",
        "category": "resuscitation",
        "duration_min": 6,
        "tags": ["компрессии", "CPR", "AHA", "2-thumb"],
    },
    {
        "id": "video-eye-prophylaxis",
        "title_ru": "Глазная профилактика — техника применения",
        "title_en": "Eye prophylaxis administration technique",
        "description": "Application of erythromycin 0.5% ophthalmic ointment для prevention gonococcal/chlamydial conjunctivitis. CDC recommendation для ALL newborns в первые 24 ч.",
        "source": "CDC",
        "source_type": "who_official",
        "url": "https://www.cdc.gov/sti-treatment/hcp/clinical-guidance/neonates.html",
        "category": "examination",
        "duration_min": 4,
        "tags": ["глазная профилактика", "CDC", "гонорея"],
    },
    {
        "id": "video-bili-blanket-use",
        "title_ru": "Bilibed / Bili-blanket использование",
        "title_en": "Bili-blanket fiber-optic phototherapy use",
        "description": "Demonstration fiber-optic phototherapy (bili-blanket) — alternative to overhead phototherapy. Permits skin-to-skin contact with mother during treatment, more flexibility.",
        "source": "AAP Implementation Guide",
        "source_type": "youtube_official",
        "url": "https://www.aap.org/en/patient-care/newborn-and-infant-nutrition/",
        "category": "hepatic",
        "duration_min": 7,
        "tags": ["фототерапия", "bili-blanket", "AAP", "ГБН"],
    },
    {
        "id": "video-hbb-helping-babies-survive",
        "title_ru": "Helping Babies Breathe / Survive — global program",
        "title_en": "Helping Babies Survive — full program",
        "description": "Полный курс HBS (Helping Babies Survive) — реанимация в условиях ограниченных ресурсов, golden minute, basic resuscitation для midwives + medical staff в low-resource settings (LMIC focus).",
        "source": "AAP / Helping Babies Survive",
        "source_type": "youtube_official",
        "url": "https://www.youtube.com/@HelpingBabiesSurvive/videos",
        "category": "resuscitation",
        "duration_min": 50,
        "tags": ["HBB", "AAP", "global health", "LMIC"],
    },
]


def merge_into(path: Path, key: str, new_items: list[dict], version: str) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    existing_ids = {x["id"] for x in data[key]}
    added = 0
    for item in new_items:
        if item["id"] in existing_ids:
            continue
        data[key].append(item)
        existing_ids.add(item["id"])
        added += 1
    data["version"] = version
    data["lastUpdated"] = "2026-05-10"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  {path.name:45s} +{added} (total now {len(data[key])})")


def main() -> None:
    merge_into(DIR / "neonatal-clinical-cases.json", "cases", NEW_CASES, "1.1.0")
    merge_into(DIR / "neonatal-common-mistakes.json", "mistakes", NEW_MISTAKES, "1.1.0")
    merge_into(DIR / "neonatal-atlas.json", "atlas", NEW_ATLAS, "1.1.0")
    merge_into(DIR / "neonatal-procedure-checklists.json", "checklists", NEW_CHECKLISTS, "1.1.0")
    merge_into(DIR / "neonatal-procedure-videos.json", "videos", NEW_VIDEOS, "1.1.0")
    print("\nTotal added across 5 banks: 25 educational items")


if __name__ == "__main__":
    main()
