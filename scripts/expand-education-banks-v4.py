"""
Phase 4 expansion of Table 3.Д banks — round 4:
- clinical-cases (22 → 30) +8
- common-mistakes (26 → 34) +8
- atlas (26 → 32) +6
- articles (95 → 103) +8

Total +30 educational items. Idempotent (skips by id).
"""
from __future__ import annotations
import json
from pathlib import Path

DIR = Path(r"C:\Users\KDFX Modes\Desktop\bordik-med\public")


# ============================================================================
# CASES (+8)
# ============================================================================
NEW_CASES = [
    {
        "id": "case-pphn-warm-shock",
        "title_ru": "Warm shock у септического newborn",
        "title_en": "Warm shock в septic newborn",
        "topic": "cardiopulmonary",
        "level": "advanced",
        "vignette": "Девочка 38 нед, BW 3300 г, day 5 жизни. Начала отказываться от еды, t° 36.0°C. Через 6 ч: tachycardia 200, hypotension MAP 28, теплые конечности, bounding pulses, прыгающее давление, олигурия. Лактат 5.2.",
        "presenting_features": [
            "Late-onset sepsis presentation (day 3-7)",
            "Vasodilated shock: warm extremities, bounding pulses",
            "Wide pulse pressure (low SVR)",
            "Oliguria + lactate elevation",
            "Hypothermia переменная с tachycardia",
        ],
        "differential": [
            "Septic shock с warm vasodilatory phase (наиболее вероятно — late onset)",
            "Adrenal insufficiency (relative)",
            "Hypothyroidism (rare)",
            "Anaphylaxis",
        ],
        "management": [
            "Stat blood culture + CBC + CRP/PCT + lactate + ABG.",
            "Empiric ABX: ванкомицин + цефепим (LOS coverage CoNS, MRSA, gram-negative) в первый час.",
            "Volume resuscitation: 10-20 мл/кг NaCl 0.9% bolus, repeat ×1 PRN. Avoid >60 мл/кг (overload risk).",
            "Vasopressor: norepinephrine 0.05-0.5 мкг/кг/мин — selective vasoconstrictor. Raises SVR.",
            "Adjunct vasopressin 0.0003-0.002 U/кг/мин если refractory к norepinephrine.",
            "Hydrocortisone 1 мг/кг IV q6-8h (catecholamine-resistant — relative adrenal).",
            "Echo: assess cardiac function, PPHN, septic cardiomyopathy.",
            "Lactate trend (<2 ммоль/л — improving, persistent >4 — concerning).",
            "Consider IVIG (Pentaglobin) при severe sepsis preterm DIC.",
        ],
        "pearls": [
            "Cold vs warm shock recognition critical — different vasopressor choice.",
            "Norepinephrine 1st-line warm shock у newborn (vs dopamine для cold).",
            "Hydrocortisone reserved для catecholamine-resistant — relative adrenal insufficiency 30-50% septic preterm.",
        ],
        "references": [
            "Davis AL et al. Crit Care Med 2017;45:1061",
            "PALS Guidelines 2020",
            "AAP CFN — Hemodynamic Support",
        ],
    },
    {
        "id": "case-poly-vlbw",
        "title_ru": "Полицитемия у LGA-новорождённого",
        "title_en": "Polycythemia в LGA newborn",
        "topic": "metabolic",
        "level": "intermediate",
        "vignette": "Мальчик 41 нед, BW 4350 г (LGA), мать с GDM на инсулине. Лицо багрово-плеthorical. На 4 часе жизни — hypoglycemia BG 1.6, tachypnea 80/мин, jitteriness. Hct (heel) = 73%, venous Hct 71%.",
        "presenting_features": [
            "LGA infant of diabetic mother",
            "Plethoric facial appearance",
            "Symptoms hyperviscosity: tachypnea, jitteriness, hypoglycemia",
            "Hct >65% venous (true polycythemia, NOT capillary artifact)",
            "Risks: NEC, stroke, renal vein thrombosis",
        ],
        "differential": [
            "Polycythemia neonatorum (наиболее вероятно — IDM + LGA)",
            "Dehydration (Hct artifact) — exclude through repeat venous sample",
            "Twin-twin transfusion syndrome (recipient)",
            "Maternal-fetal transfusion",
        ],
        "management": [
            "Confirm Hct via venous sample (NOT capillary — overestimates).",
            "Asymptomatic Hct 65-70% — observe, hydrate.",
            "Symptomatic OR Hct >70% — partial exchange transfusion (PET).",
            "PET volume: blood volume × (current Hct - target Hct) / current Hct, target 55-60%.",
            "Replace via UVC с NaCl 0.9% (NOT albumin — может cause NEC).",
            "Treat hypoglycemia: D10 IV bolus + continuous GIR 6-8 мг/кг/мин.",
            "Monitor для NEC × 48-72 часа после PET.",
            "Long-term: most do well. Severe cases (Hct >75%, neurological symptoms) — consider neurodev follow-up.",
        ],
        "pearls": [
            "Capillary Hct overestimates by 5-15% — always confirm venous before treatment decisions.",
            "Partial exchange с NaCl preferred over albumin (NEC risk lower).",
            "Symptomatic + Hct 65-70% needs treatment; asymptomatic + Hct >70% controversial.",
        ],
        "references": [
            "Werner EJ. Clin Perinatol 1995;22:693",
            "AAP COFN — Polycythemia",
            "Ozek E et al. Cochrane 2010 — Partial exchange",
        ],
    },
    {
        "id": "case-hsv-disseminated",
        "title_ru": "Диссеминированный HSV у newborn",
        "title_en": "Disseminated HSV в newborn",
        "topic": "infection",
        "level": "advanced",
        "vignette": "Мальчик 39 нед, BW 3100 г. Day 7 жизни — irritability, poor feeding, hepatomegaly, ALT 850, тромбоцитопения 45 000. Vesicular rash на mouth + scalp. Maternal hx: 'cold sores' active при родах, vaginal delivery.",
        "presenting_features": [
            "Day 5-12 жизни presentation (HSV typical)",
            "Multi-system involvement: liver, CNS, skin",
            "Hepatitis (very high ALT)",
            "Thrombocytopenia",
            "Vesicular rash (50% disseminated HSV)",
            "Maternal hx active oral lesions (HSV-1 transmissible perinatally)",
        ],
        "differential": [
            "Disseminated HSV (наиболее вероятно — classic triad rash + hepatitis + thrombocytopenia)",
            "Bacterial sepsis с DIC",
            "Enterovirus disseminated (similar presentation)",
            "Other TORCH (CMV, syphilis)",
        ],
        "management": [
            "STAT acyclovir 60 мг/кг/сут (20 мг/кг q8h) IV — empirically pending PCR.",
            "Continue × 14-21 дней (21 для CNS / disseminated).",
            "Stat workup: HSV PCR (blood, CSF, eye, mouth swabs), LFTs, coags, CBC, blood culture.",
            "LP — every disseminated HSV needs CNS exclusion.",
            "Monitor renal function (acyclovir nephrotoxicity, hydrate well).",
            "Treat DIC: FFP, platelets, cryoprecipitate PRN.",
            "Ophthalmology consult — HSV keratitis screen.",
            "Long-term outcome guarded: CNS HSV mortality 4%, but 70%+ neurodevelopmental sequelae у survivors.",
            "Maternal counseling — risks future pregnancies (recurrent vs primary HSV).",
        ],
        "pearls": [
            "HSV mortality without treatment: 60-85%. With prompt acyclovir: <30%.",
            "Vesicles в half of disseminated HSV — absence не excludes.",
            "Empiric acyclovir при ANY suspect HSV — wait для PCR делает worse outcomes.",
        ],
        "references": [
            "Kimberlin DW et al. NEJM 2011;365:1284",
            "AAP Red Book 2024",
            "Pinninti SG, Kimberlin DW. Curr Opin Pediatr 2018;30:159",
        ],
    },
    {
        "id": "case-spontaneous-perforation",
        "title_ru": "Spontaneous intestinal perforation (SIP) у ELBW",
        "title_en": "Spontaneous intestinal perforation в ELBW",
        "topic": "gastro",
        "level": "advanced",
        "vignette": "Девочка GA 25 нед, BW 720 г, day 4 жизни. На indomethacin для PDA + dexamethasone DART. Внезапно: blue abdomen, distention, hypotension. AXR: massive pneumoperitoneum. Hb stable 145.",
        "presenting_features": [
            "ELBW <26 нед within first 7-10 days",
            "NSAID + steroid combination (high risk)",
            "Sudden 'blue abdomen' (visible bowel loops через thin abdominal wall)",
            "Massive pneumoperitoneum (often more than NEC perforation)",
            "Hb stable (less hemorrhagic than NEC)",
        ],
        "differential": [
            "SIP (наиболее вероятно — early, NSAID/steroid, no antecedent NEC)",
            "Severe NEC IIIB с perforation",
            "Volvulus (rare ELBW)",
        ],
        "management": [
            "STAT: NPO, decompression NG, fluid resuscitation 10-20 мл/кг NaCl.",
            "Surgical consultation immediately.",
            "Triple ABX: ампициллин + гентамицин + метронидазол.",
            "Choice: Primary peritoneal drainage (PPD) vs laparotomy.",
            "  - NECSTEPS trial: similar mortality, less initial morbidity с PPD у ELBW",
            "  - Many centers PPD first, escalate к laparotomy если no improvement.",
            "Continue ABX 7-14 дней (longer if abscess).",
            "STOP indomethacin/ibuprofen + steroid (causative).",
            "Long-term: ileostomy may need закрытие 2-3 мес.",
            "Follow growth + nutrition (TPN dependence weeks).",
        ],
        "pearls": [
            "SIP vs NEC: SIP earlier (<7 days), no antecedent NEC, NSAID/steroid risk factor, less hemorrhagic.",
            "PPD первая интервенция ELBW — similar outcomes к laparotomy, less initial morbidity (NECSTEPS).",
            "NSAID + steroid combination в ELBW = especially high SIP risk.",
        ],
        "references": [
            "Moss RL et al. NEJM 2006;354:2225 — NECSTEPS",
            "Holman RC et al. Pediatrics 2006;117:e188 — SIP epidemiology",
            "Stark AR et al. Pediatrics 2001;108:1086 — dexamethasone",
        ],
    },
    {
        "id": "case-aki-elbw",
        "title_ru": "Острая почечная недостаточность ELBW",
        "title_en": "Acute kidney injury в ELBW",
        "topic": "metabolic",
        "level": "advanced",
        "vignette": "Мальчик GA 24 нед, BW 580 г, day 3 жизни. Получил 2 cycle ibuprofen для PDA. Креатинин поднялся 0.6 → 1.4 мг/дл. Olиguria <0.5 мл/кг/час × 8 ч. K+ 6.2.",
        "presenting_features": [
            "Acute creatinine rise >0.3 мг/дл OR >50% from baseline (KDIGO criteria)",
            "Oliguria <0.5 мл/кг/час × 6 ч (Stage 1)",
            "Hyperkalemia 6.0+",
            "NSAID exposure (ibuprofen for PDA)",
            "Common у ELBW (30-50% incidence)",
        ],
        "differential": [
            "NSAID-induced AKI (наиболее вероятно)",
            "Pre-renal: dehydration, hypovolemia, hsPDA с decreased renal perfusion",
            "Post-renal: bladder outlet obstruction (rare)",
            "Intrinsic: ATN от ischemia / sepsis",
        ],
        "management": [
            "STOP NSAID immediately + любые nephrotoxic drugs.",
            "Volume status assessment: bedside echo, IVC, weight trends.",
            "If hypovolemic — careful fluid bolus 10 мл/кг NaCl × 1.",
            "If euvolemic / hypervolemic — restrict fluids к 60-70% maintenance.",
            "Diuretic trial: furosemide 1 мг/кг IV; if response — continue PRN.",
            "Treat hyperkalemia (K+ >7): Ca gluconate, glucose+insulin, NaHCO₃.",
            "Phosphate binders if PO₄ ↑.",
            "Avoid contrast, vancomycin nephrotoxic, gentamicin trough monitoring.",
            "Adjust drug doses: vancomycin extended interval, no aminoglycoside if possible.",
            "Renal consultation; CRRT criteria: severe oliguria + uremia OR refractory hyperkalemia.",
            "Most preterm AKI recovers — long-term CKD risk slightly elevated.",
        ],
        "pearls": [
            "Neonatal AKI underrecognized — KDIGO Neonatal modified criteria 2018.",
            "ELBW AKI common с NSAID PDA treatment — alternatives (paracetamol) preferred when high risk.",
            "Long-term: AKI в neonatal period associated с CKD adult — follow up creatinine, BP, urine albumin annually.",
        ],
        "references": [
            "Jetton JG et al. Lancet Child Adolesc Health 2017;1:184 — AKI in neonates",
            "Selewski DT et al. Pediatrics 2015;136:e463",
        ],
    },
    {
        "id": "case-cmv-congenital",
        "title_ru": "Врождённая ЦМВ-инфекция",
        "title_en": "Congenital CMV infection",
        "topic": "infection",
        "level": "advanced",
        "vignette": "Девочка 38 нед, BW 2300 г (SGA <3-й перцентиль). Microcephaly OFC 28 см (-3 SD). Hepatosplenomegaly + jaundice (TSB direct elevated). Petechiae. Hearing screen failed. Urine CMV PCR positive 1.5 × 10⁶ копий/мл.",
        "presenting_features": [
            "SGA + microcephaly (TORCH triad including CMV)",
            "Hepatosplenomegaly + cholestasis (direct hyperbili)",
            "Thrombocytopenia + petechiae",
            "Failed hearing screen (most common cCMV manifestation)",
            "Urine PCR confirms congenital (если <3 нед после рождения)",
        ],
        "differential": [
            "Congenital CMV (наиболее вероятно — symptomatic forms 10-15%, asymptomatic 85-90%)",
            "Toxoplasmosis (TORCH — characteristic chorioretinitis, hydrocephalus)",
            "Rubella (cataracts, cardiac, deafness)",
            "Zika (microcephaly + brain calcifications)",
            "Syphilis (snuffles, bone changes, hepatosplenomegaly)",
        ],
        "management": [
            "Antiviral: valganciclovir 16 мг/кг q12h PO × 6 мес для symptomatic.",
            "Indication: symptomatic cCMV с CNS involvement (hearing loss, microcephaly, intracranial calcifications).",
            "Asymptomatic cCMV — treatment controversial (potential benefit hearing).",
            "Monitor: weekly CBC (neutropenia), liver, urine CMV PCR.",
            "Multidisciplinary follow-up:",
            "  - Audiology q3-6 мес × 6 лет (progressive SNHL common)",
            "  - Neurology + developmental",
            "  - Ophthalmology (chorioretinitis screen)",
            "Long-term outcomes:",
            "  - Symptomatic: 40-58% sequelae (hearing loss, CP, cognitive impairment)",
            "  - Asymptomatic: 10-15% develop late hearing loss",
            "Maternal counseling: future pregnancies — primary CMV worse outcomes than reactivation. Preconception advice.",
        ],
        "pearls": [
            "cCMV — leading cause non-genetic SNHL (sensorineural hearing loss).",
            "Universal newborn CMV screening не yet standard, но hearing-failed → CMV PCR cheap and high-yield.",
            "Valganciclovir 6 мес (Kimberlin 2015): improved hearing + neurodevelopment vs 6 нед.",
        ],
        "references": [
            "Kimberlin DW et al. NEJM 2015;372:933",
            "Rawlinson WD et al. Lancet Infect Dis 2017;17:e177",
            "AAP Red Book 2024",
        ],
    },
    {
        "id": "case-feeding-aspiration",
        "title_ru": "Аспирация при кормлении у preterm",
        "title_en": "Feeding aspiration в preterm",
        "topic": "respiratory",
        "level": "intermediate",
        "vignette": "Мальчик GA 33 нед PMA, на full feeds через NG. Сегодня утром во время bolus feed: внезапно desaturated 92→78%, цианоз, кашель. CXR: правосторонний нижнедолевой инфильтрат.",
        "presenting_features": [
            "Acute deterioration during/after feed",
            "Desaturation + cough + cyanosis (witnessed event)",
            "New infiltrate на CXR (often right lower lobe — gravity)",
            "May indicate immature feeding skills OR misplaced NG tube",
        ],
        "differential": [
            "Aspiration (наиболее вероятно — temporal с feed)",
            "Sepsis с pneumonia",
            "Pneumothorax",
            "Atelectasis",
            "Apnea of prematurity",
        ],
        "management": [
            "Immediate: stop feed, suction airway, increase O₂ если desaturated.",
            "Verify NG tube position (pH ≤5.0 OR confirmed по landmarks).",
            "If NG misplaced — remove + reposition.",
            "Antibiotic empirically: ампициллин + гентамицин 7-10 дней (suspected aspiration pneumonia).",
            "Consider swallow study если recurrent — VFSS (video fluoroscopic swallow) by SLP.",
            "Feeding strategy adjustment:",
            "  - Slow advancement",
            "  - Continuous feed vs bolus",
            "  - Smaller volume more frequent",
            "  - Position upright during/after feed",
            "  - Side-lying on right after feed (limit aspiration)",
            "Pacing during oral feeds (cue-based feeding).",
            "Lactation consultant if breastfeeding.",
            "If recurrent aspiration: consider G-tube vs surgical option (rare).",
        ],
        "pearls": [
            "Witnessed aspiration event ≠ aspiration pneumonia (most resolve без infection).",
            "Recurrent aspiration в preterm — concerning for neuromuscular incoordination, tracheoesophageal fistula, GERD.",
            "Cue-based feeding (responsive к infant signals) vs schedule-driven — better outcomes preterm.",
        ],
        "references": [
            "Lau C, Smith EO. Acta Paediatr 2011;100:64",
            "AAP COFN Feeding Premature Infants",
        ],
    },
    {
        "id": "case-tof-spell",
        "title_ru": "Тет-spell у tetralogy of Fallot",
        "title_en": "Tet spell в tetralogy of Fallot",
        "topic": "cardiopulmonary",
        "level": "advanced",
        "vignette": "Мальчик 4 нед age с известным TOF (ожидающий surgery). Внезапно во время плача: severe cyanosis, decreased murmur, irritability → letargy. SpO₂ 60% на room air. Bag-mask ventilation +O₂ → 85%.",
        "presenting_features": [
            "Known TOF (or undiagnosed cyanotic CHD)",
            "Acute cyanosis precipitated by crying / feed / agitation",
            "Decreased intensity of murmur (RVOT obstruction worsens)",
            "Tachypnea, lethargy, possible LOC",
            "Mortality if not treated promptly",
        ],
        "differential": [
            "Tet spell (RVOT spasm) — наиболее вероятно known TOF",
            "Other cyanotic CHD acute event",
            "Sepsis с decompensation",
            "Pulmonary cause (pneumothorax)",
        ],
        "management": [
            "Step 1: Knee-chest position (compression IVC raises SVR, reduces R-to-L shunt).",
            "Step 2: 100% O₂ (limited efficacy в cyanotic CHD но useful).",
            "Step 3: Calm environment — reduce anxiety/crying что worsens spell.",
            "Step 4: Morphine 0.1 мг/кг IV/IM/SC — sedation + reduces hyperpnea.",
            "Step 5: Volume bolus 10 мл/кг NaCl 0.9% (improves preload).",
            "Step 6: NaHCO₃ 1 мэкв/кг IV если significant acidosis.",
            "Step 7: Phenylephrine 0.5-5 мкг/кг/мин IV — α-agonist, raises SVR, decreases R-to-L shunt.",
            "Step 8: Esmolol 0.5 мг/кг IV bolus then 50 мкг/кг/мин — relaxes RVOT spasm.",
            "Step 9: Refractory: ECMO consideration, urgent surgical intervention.",
            "Long-term: surgical repair TOF planned — likely accelerated по этому event.",
        ],
        "pearls": [
            "Knee-chest position = simplest, fastest intervention. Can be done by parent при home spell.",
            "Avoid drugs that lower SVR (NTG, β-agonists) — worsen spell.",
            "Spell escalation often signals need для earlier surgical repair.",
        ],
        "references": [
            "AHA Pediatric Cardiac Guidelines",
            "Apitz C et al. Lancet 2009;374:1462",
        ],
    },
]


# ============================================================================
# COMMON MISTAKES (+8)
# ============================================================================
NEW_MISTAKES = [
    {
        "id": "mistake-routine-cradle-cap-treatment",
        "title_ru": "Рутинное лечение cradle cap у term newborn",
        "title_en": "Routine treatment cradle cap",
        "category": "neonatal",
        "severity": "low",
        "mistake": "Назначение топических стероидов / противогрибковых для seborrheic dermatitis (cradle cap) у asymptomatic newborn.",
        "why_it_happens": "Concerned parent + желание 'что-то делать'. Misperception что нужно treatment.",
        "correct_approach": "Reassurance + gentle baby shampoo + soft brush. Mineral oil overnight + gentle wash. Self-resolving 2-3 мес. Topical hydrocortisone 1% only если severe inflammation.",
        "consequence": "Unnecessary medication exposure, cost, parental anxiety.",
        "references": [
            "Naldi L. BMJ Clin Evid 2010;2010:1713",
            "AAP Section on Dermatology",
        ],
    },
    {
        "id": "mistake-mistakenly-stopping-caffeine",
        "title_ru": "Раннее прекращение кофеина у preterm",
        "title_en": "Early caffeine discontinuation в preterm",
        "category": "respiratory",
        "severity": "medium",
        "mistake": "Discontinuing caffeine после 1-2 weeks без apnea events, до 33-34 нед PMA.",
        "why_it_happens": "Misperception что 'apnea решена'. Не учитывают BPD prevention effect persist.",
        "correct_approach": "Continue caffeine до 33-34 нед PMA OR successful 7-day apnea-free period off respiratory support. CAP trial benefit persists в 11 yr cognitive outcomes.",
        "consequence": "Recurrent apnea, ↓ extubation success, missed BPD prevention benefit.",
        "references": [
            "Schmidt B et al. NEJM 2007;357:1893",
            "Schmidt B et al. NEJM 2017 11-yr follow-up",
        ],
    },
    {
        "id": "mistake-no-vit-d",
        "title_ru": "Не назначать витамин D у breastfed newborn",
        "title_en": "Failing to prescribe vit D в breastfed newborn",
        "category": "metabolic",
        "severity": "low",
        "mistake": "Не назначать vitamin D supplementation у breastfed newborn.",
        "why_it_happens": "Misperception что breast milk обеспечивает все нужные nutrients.",
        "correct_approach": "Exclusively breastfed: 400 IU vit D daily от рождения до introduction fortified foods. Formula-fed receiving <1 L/day formula: also need 400 IU.",
        "consequence": "Vitamin D deficiency rickets — radiological + biochemical changes 6-12 мес. Preventable disease.",
        "references": [
            "AAP CFN. Pediatrics 2008;122:1142",
            "Wagner CL et al. Pediatrics 2008;122:1142",
        ],
    },
    {
        "id": "mistake-no-iron-preterm",
        "title_ru": "Не начать iron у preterm в 4-8 нед",
        "title_en": "Delaying iron supplementation в preterm",
        "category": "metabolic",
        "severity": "medium",
        "mistake": "Откладывание iron supplementation в preterm до introduction solids OR при concern для transfusion.",
        "why_it_happens": "Старая практика. Concern о возможном GI side effects.",
        "correct_approach": "Iron supplementation 2-4 мг/кг/сут elemental от 4-8 нед age у preterm + LBW. Continue до 12 мес OR adequate dietary iron. Start earlier (2 нед) у ELBW при рapid growth.",
        "consequence": "Iron deficiency anemia — neurodevelopmental impairment даже после correction. Preterm высокий риск.",
        "references": [
            "AAP CFN. Pediatrics 2010;126:1040 — Iron Deficiency",
            "Cochrane 2014 — Iron supplementation preterm",
        ],
    },
    {
        "id": "mistake-late-cooling-decision",
        "title_ru": "Затяжное решение о TH eligibility",
        "title_en": "Delayed TH eligibility decision",
        "category": "neuro",
        "severity": "high",
        "mistake": "Spending >2-3 часа на determining TH eligibility — passive deterioration в 6-час окне.",
        "why_it_happens": "Hesitation, multiple consultants, missing clear criteria.",
        "correct_approach": "TH eligibility decision в первые 2 ч жизни. Use NICHD criteria checklist:",
        "consequence": "Delayed cooling = lost neuroprotection. After 6 ч — нет proven benefit.",
        "references": [
            "Shankaran S et al. NEJM 2005;353:1574",
            "Azzopardi DV et al. NEJM 2009;361:1349",
        ],
    },
    {
        "id": "mistake-aggressive-resp-support-MAS",
        "title_ru": "Aggressive ventilation в MAS-PPHN",
        "title_en": "Aggressive ventilation в MAS-PPHN",
        "category": "respiratory",
        "severity": "high",
        "mistake": "Escalating PIP / PEEP в MAS-PPHN до 35+ cmH₂O для maintaining oxygenation.",
        "why_it_happens": "Reactive escalation для desperate hypoxemia.",
        "correct_approach": "Gentle ventilation: VT 4-6 мл/кг, PEEP 5-7 cmH₂O, permissive hypercapnia (PaCO₂ 45-55), permissive hypoxemia (SpO₂ 90-95%). Switch к HFOV early if conventional fails. iNO + sildenafil + milrinone для PPHN.",
        "consequence": "Pneumothorax, pulmonary hemorrhage, worsening PPHN от barotrauma.",
        "references": [
            "Steurer MA et al. Pediatrics 2017;139:e20161165",
            "Konduri GG. Pediatrics 2004;113:559",
        ],
    },
    {
        "id": "mistake-homeopathy-jaundice",
        "title_ru": "Народные средства при желтухе",
        "title_en": "Folk remedies для jaundice",
        "category": "hepatic",
        "severity": "high",
        "mistake": "Direct sunlight exposure, glucose water, herbal teas вместо phototherapy при значимой hyperbilirubinemia.",
        "why_it_happens": "Cultural / family pressure, misinformation, unfamiliarity с modern PT.",
        "correct_approach": "Modern intensive LED phototherapy (irradiance ≥30 мкВт/см²/нм). Не direct sunlight (UV burns + поверхностный). Continued breastfeeding (NOT glucose water которое снижает milk transfer).",
        "consequence": "Kernicterus — irreversible brain injury, athetoid CP, hearing loss, sensory deficits.",
        "references": [
            "Kemper AR et al. Pediatrics 2022;150:e2022058859",
            "AAP — bilirubin patient education",
        ],
    },
    {
        "id": "mistake-bacterial-meningitis-no-lp",
        "title_ru": "Не делать LP при positive blood culture у newborn",
        "title_en": "Skipping LP в positive blood culture",
        "category": "infection",
        "severity": "high",
        "mistake": "Лечение sepsis ABX без LP при positive blood culture у newborn (особенно GBS, E. coli).",
        "why_it_happens": "Concern о hemodynamic instability. Time pressure. Lab access barriers.",
        "correct_approach": "Stable infant: LP within 24 hours of positive blood culture (or earlier если clinical signs meningitis). Up to 23-32% positive blood culture have concurrent meningitis. Different ABX duration / dosing if meningitis: 14-21 days vs 10 для bacteremia.",
        "consequence": "Missed meningitis → inadequate ABX duration → relapse, neurodevelopmental sequelae, preventable mortality.",
        "references": [
            "Stoll BJ et al. Pediatrics 2002;109:E27",
            "AAP COFN Sepsis Management",
        ],
    },
]


# ============================================================================
# ATLAS (+6)
# ============================================================================
NEW_ATLAS = [
    {
        "id": "atlas-pa-vsd",
        "title_ru": "Pulmonary atresia + VSD",
        "title_en": "Pulmonary atresia + VSD",
        "description": "Severe cyanotic CHD requiring duct-dependent pulmonary blood flow. Echo identifies absent pulmonary valve + RV outflow obstruction. PGE1 infusion until surgical repair (BT shunt → complete repair).",
        "key_findings": [
            "Severe cyanosis at birth or в часы",
            "Single S2 (no pulmonary component)",
            "Continuous murmur может heard если PDA large",
            "CXR: small lung markings, possibly boot-shaped heart",
            "Echo: absent pulmonary valve, RV outflow obstructed, VSD",
            "Treatment: PGE1 (start 0.05 мкг/кг/мин), maintain ductal patency until surgery",
        ],
        "source": "Radiopaedia / AHA",
        "source_type": "radiopaedia",
        "url": "https://radiopaedia.org/articles/pulmonary-atresia-with-vsd",
        "category": "vascular_imaging",
    },
    {
        "id": "atlas-tof-imaging",
        "title_ru": "Tetralogy of Fallot — imaging",
        "title_en": "Tetralogy of Fallot — imaging",
        "description": "Classic four-component: VSD, overriding aorta, RV outflow obstruction, RV hypertrophy. Boot-shaped heart на CXR. Cyanotic spells (tet spells) — life-threatening.",
        "key_findings": [
            "CXR: boot-shaped heart (coeur en sabot) — RV hypertrophy + concave left heart border (PA hypoplasia)",
            "Decreased pulmonary vascular markings",
            "Right aortic arch в 25%",
            "ECG: RV hypertrophy, right axis deviation",
            "Echo: VSD, overriding aorta, RV outflow obstruction (subvalvar, valvar, pulmonary artery)",
            "Surgical repair preferred 3-6 мес если symptomatic",
        ],
        "source": "Radiopaedia",
        "source_type": "radiopaedia",
        "url": "https://radiopaedia.org/articles/tetralogy-of-fallot",
        "category": "vascular_imaging",
    },
    {
        "id": "atlas-bilirubin-encephalopathy",
        "title_ru": "Bilirubin encephalopathy / kernicterus — клиника",
        "title_en": "Bilirubin encephalopathy / kernicterus",
        "description": "Acute bilirubin encephalopathy progresses через 3 phases: lethargy → hypertonia/seizures → opisthotonus/coma. Permanent kernicterus — irreversible.",
        "key_findings": [
            "Phase 1 (early): poor feeding, lethargy, slight hypotonia",
            "Phase 2 (intermediate): high-pitched cry, hypertonia, opisthotonus, fever, seizures",
            "Phase 3 (advanced): deep stupor / coma, marked opisthotonus, apnea",
            "Permanent kernicterus: athetoid CP, hearing loss (auditory neuropathy), gaze palsy, dental enamel dysplasia",
            "MRI: bilateral globus pallidus + subthalamic nuclei hyperintensity (T2)",
            "Prevention: timely PT + DVET. Treatment: emergent DVET when ABE detected.",
        ],
        "source": "Visual DX / NEJM",
        "source_type": "nejm",
        "url": "https://www.nejm.org/doi/full/10.1056/NEJMra1308124",
        "category": "neuroimaging",
    },
    {
        "id": "atlas-port-wine-stain",
        "title_ru": "Port-wine stain + Sturge-Weber syndrome",
        "title_en": "Port-wine stain + Sturge-Weber",
        "description": "Capillary malformation на лице V1 distribution. Sturge-Weber: + leptomeningeal angiomatosis + glaucoma. Treatment: pulsed dye laser early для cosmetic + Sturge-Weber screening.",
        "key_findings": [
            "Pink-red flat patch present at birth (vs hemangioma which is small at birth + grows)",
            "V1 distribution (forehead, upper eyelid) — Sturge-Weber risk",
            "Bilateral/extensive — even higher risk",
            "Sturge-Weber triad: facial port-wine + leptomeningeal angiomatosis + glaucoma",
            "MRI brain: leptomeningeal enhancement, calcifications (later), atrophy",
            "Ophthalmology screen: glaucoma (IOP), choroidal involvement",
            "Treatment: pulsed dye laser в детском возрасте (early — better outcomes)",
        ],
        "source": "Visual DX",
        "source_type": "stanford",
        "url": "https://stanfordmedicine25.stanford.edu/the25/newbornExam.html",
        "category": "skin",
    },
    {
        "id": "atlas-imperforate-anus",
        "title_ru": "Imperforate anus и спектр anorectal malformations",
        "title_en": "Imperforate anus + anorectal malformations",
        "description": "Spectrum от low (rectum near skin, fistula к perineum) to high (rectum в bladder/urethra). Critical perineal exam at birth. Distal X-ray determines level. Surgical repair 24-72 ч.",
        "key_findings": [
            "Visible imperforate anus при careful perineal exam",
            "Boys: fistula к urethra, bladder, или perineum common",
            "Girls: vestibular fistula, persistent cloaca",
            "Cross-table prone X-ray determines pouch level (high vs low)",
            "Associated anomalies (VACTERL): vertebral, anal, cardiac, tracheo-esophageal fistula, renal, limb",
            "Echo + renal ultrasound + spinal evaluation routine",
            "Repair timing: high — colostomy 24-48 ч, definitive repair 6 мес. Low — primary perineal repair.",
        ],
        "source": "Radiopaedia",
        "source_type": "radiopaedia",
        "url": "https://radiopaedia.org/articles/anorectal-malformation",
        "category": "examination",
    },
    {
        "id": "atlas-neuroimaging-stroke",
        "title_ru": "Перинатальный артериальный stroke",
        "title_en": "Perinatal arterial ischemic stroke",
        "description": "Most common in left MCA territory. Presentation seizures (focal) day 1-7. MRI gold standard. Treatment supportive — anticoagulation controversial. Long-term motor deficits common.",
        "key_findings": [
            "Focal seizures within first week life (most common presentation)",
            "Asymmetric tone / movement",
            "MRI brain (DWI peak day 3-7): wedge-shaped infarct, often left MCA",
            "Acute ischemia: hyperintense на DWI, hypointense на ADC",
            "Causes: thrombosis (genetic prothrombotic, infection, trauma, polycythemia)",
            "Workup: hypercoagulable panel (selective), echo, head + neck vessels MRA",
            "Treatment: supportive, seizure management. Anticoagulation case-by-case.",
            "Outcome: 50% hemiparesis, 20% epilepsy long-term",
        ],
        "source": "Radiopaedia",
        "source_type": "radiopaedia",
        "url": "https://radiopaedia.org/articles/neonatal-stroke",
        "category": "neuroimaging",
    },
]


# ============================================================================
# ARTICLES (+8)
# ============================================================================
NEW_ARTICLES = [
    {
        "id": "art-resus-room-org",
        "title_ru": "Организация resuscitation room для newborn",
        "title_en": "Newborn resuscitation room organization",
        "topic": "neonatal", "audience": "neonatologist", "level": "basic",
        "summary": "Layout, equipment checks, team roles, communication protocols. Pre-delivery briefing reduces resus errors substantially.",
        "content": """## Equipment layout

### Standard zones
- Warmer table center
- Equipment cart с airway, vascular access, medications
- Suction wall connection
- O₂/air blender
- Monitor с pulse ox + ECG
- Documentation area

## Equipment checklist

### Per warmer (verified daily)
- T-piece resuscitator (preferred) tested
- Bag-mask + multiple mask sizes (preterm/term)
- Stethoscope
- Suction catheters 5/8/10 Fr
- ETT 2.5/3.0/3.5/4.0 mm
- Laryngoscope blades 0/1, working batteries
- Pulse oximeter, sensor working
- Plastic bag/wrap для preterm
- Hat, blankets pre-warmed

### Per cart
- IV/IO supplies
- UVC kit
- Medications в pre-calculated weight ranges
- Naloxone (rare use)
- D10W

## Pre-delivery briefing

- GA, weight estimate, any known anomalies
- Maternal risk factors
- Antenatal steroid status
- Mode of delivery
- Need for specialized care

## Team roles (NRP framework)

- Team leader (decides + directs)
- Airway (PPV)
- Compressions (если needed)
- Vascular access
- Documentation/timing
- Supplies

## Communication

- Closed-loop ("Adrenaline 0.5 мл" — "Adrenaline 0.5 мл given at 14:32")
- Standard NRP language
- Avoid jargon

## Quality metrics

- Admission temperature ≥36.5°C
- Time to first feed
- Successful intubation на first attempt
- Documentation completeness

## Российская практика

КР МЗ РФ — стандарты оснащения родзала Приказ № 119н 2020.""",
        "references": [
            "Aziz K et al. Pediatrics 2021;147 — NRP 8 ed.",
            "Liley HG et al. Pediatrics 2024",
        ],
        "related_calculators": [],
    },
    {
        "id": "art-late-preterm-care",
        "title_ru": "Late preterm (34-36 нед) — особенности",
        "title_en": "Late preterm (34-36 wk) — care",
        "topic": "neonatal", "audience": "neonatologist", "level": "intermediate",
        "summary": "Late preterm survival ≥99%, но higher morbidity vs term. Vulnerable к respiratory issues, hypoglycemia, hyperbili, feeding difficulties. Discharge readiness criteria stricter.",
        "content": """## Background

Late preterm (LPT, 34 0/7 — 36 6/7 нед) — largest preterm subgroup (75% всех preterm). Often assumed similar к term, но higher morbidity:
- Respiratory difficulties 4-7×
- Hypoglycemia 3×
- Hyperbilirubinemia 2-4× requiring PT
- Feeding difficulties 2-3×
- Neurodevelopmental delays 1.5×

## Common issues

### Respiratory
- TTN (transient tachypnea), surfactant deficiency mild
- Apnea
- Treatment: O₂ as needed, CPAP if escalating, surfactant rare

### Hypoglycemia
- Higher risk даже if AGA + healthy mother
- Routine glucose monitoring 2-3-6-12-24 ч
- Treatment per BAPM/PES protocols

### Hyperbilirubinemia
- Lower thresholds для phototherapy (по AAP 2022 chart)
- Higher risk progression к kernicterus

### Feeding difficulties
- Immature suck-swallow-breathe coordination
- Poor weight gain initially
- Lactation support critical

### Discharge readiness
- Stricter criteria than term
- Adequate feeding 24 ч
- Hyperbili threshold check
- Pediatrician follow-up 24-48 ч после discharge

## Long-term outcomes

### Educational
- Late preterm — slightly higher rates of:
  - ADHD (1.5-2×)
  - Learning disabilities
  - Special educational needs
  - Lower test scores

### Health
- Asthma (1.5×)
- Higher pediatric ER visits первый год

## Counseling

- Reassure mostly normal outcomes
- Watch для feeding, jaundice, breathing
- Pediatrician follow-up critical
- Developmental screening at usual milestones

## Российская практика

Late preterm в РФ classified отдельно. Перинатальные центры имеют специальные late-preterm protocols.""",
        "references": [
            "Engle WA et al. AAP. Pediatrics 2007;120:1390",
            "Loftin RW et al. J Perinatol 2010;30:S33",
            "Boyle EM et al. BMJ 2012;344:e896",
        ],
        "related_calculators": [],
    },
    {
        "id": "art-thrombocytopenia-eval",
        "title_ru": "Тромбоцитопения новорождённого — diff",
        "title_en": "Neonatal thrombocytopenia evaluation",
        "topic": "metabolic", "audience": "neonatologist", "level": "intermediate",
        "summary": "Common in NICU (20-35%). Differential: NAIT (severe, ICH risk), maternal ITP, sepsis, DIC, congenital, drug-induced. PlaNeT-2 thresholds для transfusion.",
        "content": """## Definition

Platelets <150 × 10⁹/L. Severity:
- Mild: 100-149
- Moderate: 50-99
- Severe: <50

## Differential по timing

### Early (<72 hr)
- Maternal causes: ITP, preeclampsia, GBS sepsis
- NAIT (alloimmune)
- Congenital infection (TORCH)
- Genetic syndromes (TAR, CAMT, Wiskott-Aldrich)
- DIC
- Asphyxia / hypoxia

### Late (>72 hr)
- LOS sepsis (most common)
- NEC
- Drug-induced (heparin, vancomycin)
- DIC
- Liver dysfunction

## Workup

### Initial
- Repeat platelet count (verify, exclude clumping)
- Maternal platelet count
- Maternal hx (ITP, drugs, infections)
- Hb, WBC, smear (schistocytes — DIC?)
- CRP, blood culture
- Coagulation panel
- Ultrasound for ICH if severe

### Specialized (selective)
- HPA typing если NAIT suspected (delivery-time samples)
- TORCH titers
- Genetic panel (if congenital syndrome features)

## Management

### PlaNeT-2 thresholds (Curley NEJM 2019)
- Stable infant: transfuse <25 × 10⁹/L (vs old <50)
- Active bleeding: keep >50
- Surgery: keep >100
- Lower threshold reduces death/major bleeding в preterm

### NAIT specifically
- HPA-compatible platelets (HPA-1a-negative typical)
- IVIG 1 г/кг IV q24h × 1-2 doses
- Severe: methylpred 1 мг/кг q12h
- ICH risk 10-20% — high vigilance

### DIC
- Treat underlying (sepsis primarily)
- FFP 10-15 мл/кг
- Cryo если fibrinogen <100
- Platelets per PlaNeT-2 thresholds

## Outcomes

- Sepsis-related: usually recovers с treatment
- NAIT: 5-7% mortality, 10-20% ICH
- Genetic / congenital: long-term risks vary

## Российская практика

КР МЗ РФ — Тромбоцитопения новорождённого 2024 предполагает PlaNeT-2 thresholds.""",
        "references": [
            "Curley A et al. NEJM 2019;380:242 — PlaNeT-2",
            "Sola-Visner M, Sallmon H. Semin Perinatol 2018;42:11",
            "Roberts I, Murray NA. Arch Dis Child Fetal Neonatal Ed 2003;88:F359",
        ],
        "related_calculators": [],
    },
    {
        "id": "art-nec-prevention-bundle",
        "title_ru": "NEC prevention bundle",
        "topic": "gastro", "audience": "neonatologist", "level": "intermediate",
        "title_en": "NEC prevention bundle",
        "summary": "Multifactorial approach: mother's milk preferred, probiotics, standardized feeding protocols, judicious ABX, hsPDA management. Reduces NEC by 30-50%.",
        "content": """## Background

NEC remains leading cause death + morbidity preterm. 5-10% VLBW develop NEC. Multifactorial bundle approach reduces incidence substantially.

## Bundle components

### 1. Mother's own milk (MOM) ≥ donor milk >> formula
- Reduces NEC 6-10x vs formula в VLBW
- Lactation support от Day 1
- Donor breast milk if MOM unavailable

### 2. Standardized feeding protocols
- Early initiation trophic feeds (10-20 мл/кг/сут)
- Standardized advancement rate (20-30 мл/кг/сут стабильный VLBW)
- SIFT trial: faster (30) vs slower (18) — no NEC difference
- Cautious с REDF / IUGR

### 3. Probiotics (combo Lactobacillus + Bifidobacterium)
- ProPrems trial + Cochrane meta-analysis
- Reduces NEC, mortality, sepsis
- Manufacturing variability remains concern

### 4. Judicious antibiotic use
- Stop empiric ABX 36-48 ч если cultures negative
- Prolonged ABX (>5 days) increases NEC ~1.84×

### 5. hsPDA management
- Early closure when symptomatic
- Reduces splanchnic hypoperfusion → NEC risk

### 6. Avoid hyperosmolar agents
- TPN осмолярность <800 mOsm/L
- Concentrated medications через CVL only

### 7. Adequate enteric feeding monitoring
- НЕ routine residual measurement (ESPGHAN 2022)
- Monitor concerning signs (bilious, blood, distention, hemodynamic change)

### 8. Probiotics + prebiotics + lactoferrin
- Synergistic effect possibly
- Lactoferrin emerging adjuvant

## Other interventions

### Antenatal
- Antenatal steroids
- Magnesium sulfate <32 нед

### Postnatal
- Avoid ranitidine / H2 blockers (↑ NEC risk)
- Limit transfusions (TANEC controversy — likely false)

## Quality metrics

- NEC incidence per 1000 VLBW patient-days
- MOM rate at full feeds
- Probiotic adherence
- ABX days per VLBW

## Российская практика

КР МЗ РФ + ESPGHAN рекомендации — probiotics + MOM + standardized protocols стандарт в современных перинатальных центрах.""",
        "references": [
            "Embleton ND et al. JPGN 2022 — ESPGHAN 2022",
            "Cochrane 2017 — Probiotics NEC",
            "Bertino E et al. JPGN 2009 — Donor milk",
        ],
        "related_calculators": ["neo-bell-nec"],
    },
    {
        "id": "art-rop-management",
        "title_ru": "ROP — обновлённые подходы 2024",
        "title_en": "ROP — updated approach 2024",
        "topic": "ophthalmology", "audience": "neonatologist", "level": "intermediate",
        "summary": "Anti-VEGF (BEAT-ROP, RAINBOW) для Zone I + A-ROP, laser для Zone II. Extended monitoring after anti-VEGF до full vascularization. New: faricimab being trialed.",
        "content": """## Screening guidelines (AAP/AAO 2018)

### Indications
- GA <30 нед, OR
- BW ≤1500 г, OR
- Selected babies с unstable course

### Timing first exam
- GA <27 нед: 31 нед PMA
- GA 27-30 нед: 31 нед PMA или 4 нед chronologic (later)
- BW ≤1500 г, GA ≥31: 4-6 нед chronologic age

### Frequency
- Active disease: q1-2 нед
- Plus disease: q1 нед
- Stop: full vascularization Zone III × 2 exams OR post-treatment regression

## ICROP3 (2021) classification

### Zones
- Zone I: posterior pole (high risk)
- Zone II: mid-periphery
- Zone III: anterior periphery (low risk)

### Stages
1: Demarcation line
2: Ridge
3: Extraretinal proliferation
4A: Partial RD (extrafoveal)
4B: Partial RD (foveal)
5: Total RD

### Plus disease
Dilated/tortuous vessels — major treatment criterion

### Aggressive ROP (A-ROP)
Replaces former AP-ROP. Rapid posterior pole disease — anti-VEGF first-line.

## Treatment indications

### Type 1 ROP (TREAT)
- Zone I, любая stage с plus
- Zone I, stage 3 без plus
- Zone II, stage 2 или 3 с plus

Treat в 48-72 ч.

## Treatment options

### Anti-VEGF (BEAT-ROP, RAINBOW)
- **Bevacizumab (Avastin)**: 0.625 мг intravitreal
- **Ranibizumab (Lucentis)**: 0.2 мг intravitreal
- Preferred Zone I, A-ROP
- Bedside в NICU (sterile prep, lid retractor, topical anesthetic)
- Recurrence до 19% — extended monitoring до 50-60 нед PMA

### Laser photocoagulation
- Diode laser 810 нм
- Ablation avascular retina anterior to ridge
- Preferred Zone II
- 1500-3000 spots typical
- В OR под GA или conscious sedation

### Surgery (Stage 4-5)
- Vitrectomy для retinal detachment
- Stage 4A — lens-sparing, decent outcomes
- Stage 4B-5 — complex, often poor visual

## Long-term

- Refractive errors (myopia common)
- Strabismus
- Visual field defects (post-laser)
- Retinal detachment risk

## Российская практика

КР МЗ РФ ROP 2024 + AAP/AAO 2018. Anti-VEGF widely available в перинатальных центрах. Telemedicine ROP screening developing.""",
        "references": [
            "Mintz-Hittner HA et al. NEJM 2011;364:603 — BEAT-ROP",
            "Stahl A et al. Lancet 2019;394:1551 — RAINBOW",
            "Chiang MF et al. Ophthalmology 2021;128:e51 — ICROP3",
            "AAP/AAO 2018",
        ],
        "related_calculators": ["neo-icrop3", "neo-rop-screen-timing"],
    },
    {
        "id": "art-gerd-newborn",
        "title_ru": "GERD у newborn — current approach",
        "title_en": "GERD newborn — current approach",
        "topic": "gastro", "audience": "neonatologist", "level": "basic",
        "summary": "Reflux normal newborn — most don't need treatment. Pathologic GERD: vomiting + failure to thrive / aspiration / apnea. Lifestyle first; PPI selectively (overprescribed, side effects).",
        "content": """## Background

Reflux эпизоды normal в newborns:
- 40-65% spit up daily у term newborn
- Resolves 80-90% к 12 мес
- Pathologic ('GERD') = causes pain, FTT, aspiration, apnea

## Diagnosis

### Functional reflux (no treatment needed)
- Effortless spitting up
- Thriving (adequate weight gain)
- Happy / unfussy
- 'Happy spitter'

### GERD requiring intervention
- Vomiting + failure to thrive
- Apparent pain (Sandifer sign — arching, dystonia)
- Aspiration / recurrent pneumonia
- Apnea / ALTE
- Persistent feeding refusal

## Diagnostics (selective)

- pH/impedance monitoring (gold standard pathologic GERD)
- Upper GI series (excludes anatomic causes — malrotation)
- Endoscopy (rarely в newborn)

## Management

### Step 1: Lifestyle
- Smaller more frequent feeds
- Burping during/after feed
- Upright position 30 мин after feed
- Avoid overfeeding
- Thicker formula trial (rice cereal, anti-reflux formula)
- Side-lying / left-side sleep — careful (Back to Sleep)

### Step 2: Medications (selective, NOT routine)

#### H2 blockers (ranitidine — withdrawn, famotidine alternative)
- 0.5 мг/кг/доза q12h IV/PO
- Less effective than PPI

#### PPI (omeprazole)
- 1-2 мг/кг/сут
- Most effective acid suppression
- Increasing concerns: ↑ NEC, ↑ pneumonia, ↑ C. difficile, ↓ vit B12, fracture risk

### Step 3: Specialty referral
- Persistent symptoms despite optimization
- Pediatric GI consultation
- Surgery (Nissen) reserved для severe + failed medical

## When NOT to treat

- 'Happy spitter' — reassurance
- Functional reflux в well-thriving infant
- Mild fussiness без other concerning features

## Российская практика

КР МЗ РФ ГЭРБ у детей — similar approach. PPI overuse попугающая проблема в РФ как и в остальном мире.""",
        "references": [
            "AAP-Section on Gastroenterology. Pediatrics 2018;131",
            "Vandenplas Y et al. JPGN 2018;66:516",
        ],
        "related_calculators": [],
    },
    {
        "id": "art-osteopenia-prematurity",
        "title_ru": "Остеопения / metabolic bone disease у preterm",
        "title_en": "Osteopenia / metabolic bone disease preterm",
        "topic": "metabolic", "audience": "neonatologist", "level": "intermediate",
        "summary": "Common у VLBW (<1500 г). Risk factors: prematurity, poor mineral intake, prolonged TPN, diuretics. Diagnosis: ALP elevated + serum P low. Prevention: adequate Ca/P/vit D + early enteral nutrition.",
        "content": """## Background

Metabolic bone disease (MBD) of prematurity:
- 30% VLBW (<1500 г)
- 50% ELBW (<1000 г)
- Result of insufficient calcium + phosphate transfer (occurs primarily 3rd trimester)
- Plus postnatal factors: prolonged TPN, diuretics, steroids

## Risk factors

- GA <32 нед
- BW <1500 г
- Prolonged TPN (>4 нед)
- Inadequate Ca/P/vit D supplementation
- Furosemide (urinary Ca losses)
- Postnatal steroids (DART)
- Cholestasis (vit D malabsorption)
- Severe BPD (immobility)

## Diagnosis

### Biochemical (most reliable)
- Serum alkaline phosphatase (ALP) >900 U/L (≥5× adult upper limit)
- Serum phosphorus <1.8 ммоль/л (<5.6 мг/дл)
- ALP × P low ratio — best predictor MBD
- Calcium often normal (regulated tightly)
- 25-OH vit D <20 нг/мл deficiency

### Imaging (if severe)
- Wrist X-ray: rachitic changes (cupping, fraying, widening)
- Long bone X-ray: subperiosteal resorption, fractures
- DEXA: gold standard в research, less practical clinically

## Prevention

### Adequate enteral nutrition
- Early initiation (Day 1-2 trophic)
- Mother's milk + HMF when tolerated
- Targeted fortification preferred over standard

### Mineral supplementation
- Ca: 100-220 мг/кг/сут
- P: 60-140 мг/кг/сут
- Vit D: 800-1000 IU/сут (ESPGHAN)

### TPN composition
- Ca:P ratio 1.7:1 (mass ratio 1.3:1)
- Adequate energy + protein

### Avoid contributing factors
- Limit furosemide (use thiazide alternative if possible)
- Minimize TPN duration
- Treat cholestasis aggressively

## Treatment

### Biochemical MBD (no fractures)
- Optimize Ca/P intake
- Vit D supplementation
- Recheck biochemistry q2-4 нед

### Established disease (fractures)
- Bisphosphonates rarely used (reserved for severe)
- Mechanical loading (passive PT)
- Long-term follow-up

## Long-term outcomes

- Most resolves постнатальный with adequate nutrition
- Possible reduced peak bone mass adulthood (research)
- Fracture risk normalizes by 1-2 года

## Monitoring schedule

- ALP, P weekly от 4 нед age у VLBW
- 25-OH vit D monthly если concern
- Wrist X-ray if ALP >1200 OR clinical concern

## Российская практика

КР МЗ РФ — preterm metabolic bone disease prevention align с ESPGHAN. Calcium glycerophosphate / phosphate buffers commonly used.""",
        "references": [
            "Abrams SA. AAP CFN. Pediatrics 2013;131:e1676",
            "Mihatsch WA et al. Clin Nutr 2018 — ESPGHAN PN 2018",
            "Faienza MF et al. World J Pediatr 2018;14:432",
        ],
        "related_calculators": [],
    },
    {
        "id": "art-tof-management",
        "title_ru": "Tetralogy of Fallot — neonatal management",
        "title_en": "Tetralogy of Fallot — neonatal management",
        "topic": "cardiopulmonary", "audience": "neonatologist", "level": "intermediate",
        "summary": "Most common cyanotic CHD (10% of CHD). Spectrum от mild ('pink TOF') до severe (duct-dependent). Tet spells emergency. Surgical repair 3-6 мес typically.",
        "content": """## Anatomy (4 components)

1. **VSD** — large, malalignment type
2. **Overriding aorta** — straddles VSD
3. **RV outflow obstruction** — может be subvalvar (infundibular), valvar, supravalvar
4. **RV hypertrophy** — secondary к obstruction

## Spectrum

### 'Pink' TOF
- Mild RV outflow obstruction
- Acyanotic at birth
- Progresses к cyanosis as obstruction worsens

### 'Blue' TOF
- Severe RV outflow obstruction
- Cyanosis at birth
- Duct-dependent если pulmonary atresia

### TOF + pulmonary atresia
- Most severe variant
- Duct-dependent obligately
- Complete repair often complex

## Presentation

### At birth
- Cyanosis severity varies
- Single S2 (no pulmonary component)
- Systolic ejection murmur (RV outflow)

### Progressive cyanosis
- RV outflow infundibular hypertrophy progresses
- Tet spells приобретают prominence

### Tet spells
- Acute increase в R-to-L shunting
- Triggered by crying, feeding, agitation
- SpO₂ drops dramatically
- Murmur DECREASES (more obstruction → less flow through RVOT)
- See dedicated tet spell management article

## Management

### Acute neonatal
- PGE1 if duct-dependent (TOF + PA)
- Echo confirmation diagnosis
- Stabilization для surgical planning
- Cardiology + cardiac surgery consultation

### Pre-surgical
- Avoid hypoxia (high-flow O₂ available)
- Treat anemia (limits O₂ delivery)
- Iron supplementation (combat polycythemia compensation)
- Beta-blocker prophylaxis tet spells (propranolol 2 мг/кг q6h PO)

### Surgical repair

#### Complete repair (preferred современный подход)
- Usually 3-6 мес age
- Closed VSD + relieve RV outflow + augment PA
- Mortality <5% в experienced centers

#### Palliative shunt (BT shunt)
- Reserved для very young / unstable
- Modified Blalock-Taussig (PTFE graft субclavian → PA)
- Allows growth before complete repair

#### TOF + PA + MAPCAs
- Complex, multiple surgeries usually
- Unifocalization MAPCAs

## Long-term outcomes

- Survival 90%+ к adulthood с modern repair
- Late issues: pulmonary regurgitation (most common), arrhythmia, RV dysfunction
- Pulmonary valve replacement often needed adult life
- Lifelong cardiology follow-up

## Российская практика

Federal cardiac surgery centers (Bakulev, Almazov) выполняют ~1000 TOF surgeries/year. Outcome data align с международными. KOMS REGION centers — additional capacity.""",
        "references": [
            "Apitz C et al. Lancet 2009;374:1462 — TOF review",
            "AHA Pediatric Cardiac Guidelines",
            "Bacha EA et al. Pediatr Cardiol 2014;35:1146",
        ],
        "related_calculators": [],
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
    merge_into(DIR / "neonatal-clinical-cases.json", "cases", NEW_CASES, "1.3.0")
    merge_into(DIR / "neonatal-common-mistakes.json", "mistakes", NEW_MISTAKES, "1.3.0")
    merge_into(DIR / "neonatal-atlas.json", "atlas", NEW_ATLAS, "1.3.0")
    merge_into(DIR / "neonatal-articles.json", "articles", NEW_ARTICLES, "2.1.0")
    print(f"\nTotal added across 4 banks: {8+8+6+8} = 30 educational items")


if __name__ == "__main__":
    main()
