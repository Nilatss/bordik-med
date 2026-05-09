"""Add 10 comprehensive integrative protocols to guidelines.json.

Each protocol pulls together multiple Bordik runners + existing
knowledge into actionable bedside reference.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-guidelines.json"

NEW_GUIDELINES = [
    {
        "id": "guide_sepsis_management_algorithm_eos_los",
        "title_en": "Sepsis management algorithm (EOS / LOS)",
        "title_ru": "Алгоритм лечения сепсиса (EOS / LOS)",
        "content": (
            "EARLY-ONSET SEPSIS (EOS, < 72 ч):\n\n"
            "RISK STRATIFICATION:\n"
            "- Term/late preterm (≥ 34 нед): Kaiser EOS calculator (Bayesian "
            "probability) — см. калькулятор\n"
            "- Preterm (≤ 34 нед): Puopolo EOS tiered (AAP COFN 2018) — см. "
            "калькулятор\n\n"
            "EMPIRIC ANTIBIOTICS:\n"
            "- First-line: Ампициллин 50 мг/кг q12h-q8h + Гентамицин 4-5 "
            "мг/кг q24-48h\n"
            "- Meningitis suspected: Ампициллин 100 мг/кг + Цефотаксим (НЕ "
            "ceftriaxone у н/р) 50 мг/кг q12h-q6h\n"
            "- HAP / multi-drug resistant suspect: Меропенем 20-40 мг/кг "
            "q8-12h\n\n"
            "WORKUP:\n"
            "- Blood culture (1 мл minimum), CBC + diff, CRP + procalcitonin\n"
            "- LP если meningitis suspected (signs: lethargy, seizure, bulging "
            "fontanelle)\n"
            "- Urine culture (LOS только > 7 d age)\n"
            "- Skin / surface cultures если vesicles или maternal HSV\n"
            "- Maternal cultures + risk factors (GBS status, PROM, "
            "хориоамнионит)\n\n"
            "DURATION:\n"
            "- Sepsis (positive culture): 7-10 дней\n"
            "- Sepsis (negative + clinical improvement): 36-48 ч → discontinue\n"
            "- Meningitis: 14-21 день (Listeria 21+)\n"
            "- LP repeat 24-48 ч после initiation если CSF positive\n\n"
            "LATE-ONSET SEPSIS (LOS, > 72 ч):\n"
            "- Pathogens: CONS (~ 40 % preterm), MRSA, gram-negative\n"
            "- Empiric: Ванкомицин + Гентамицин (или меропенем если MDR risk)\n"
            "- Severity: nSOFA score (см. калькулятор)\n\n"
            "ADJUNCTS (controversial):\n"
            "- IVIG: NOT routine (INIS 2011 NEJM — no benefit)\n"
            "- Hydrocortisone 1 мг/кг q8h: refractory hypotension (relative "
            "adrenal insuff)\n"
            "- Vasopressors: dopamine → epi (cold shock); norepi (warm shock)\n\n"
            "MORTALITY:\n"
            "- EOS: 5-15 % term, 30-50 % VLBW\n"
            "- LOS: 10-30 % VLBW, lower у term\n"
            "- nSOFA ≥ 4: чувствительность 67 % для смерти от LOS"
        ),
        "references": [
            "Kaiser EOS update Pediatrics 2024;154(4):e2023065267",
            "Puopolo KM et al. Pediatrics 2017;139:e20162426",
            "AAP COFN 2018 — Management of Infants ≤ 34 weeks",
            "Wynn JL et al. JAMA Pediatr 2020;174:e202531 (nSOFA)",
            "Brocklehurst P et al. INIS trial NEJM 2011;365:1201",
            "AAP Red Book 2021-2024",
            "КР МЗ РФ \"Бактериальный сепсис н/р\" (2024)",
        ],
    },
    {
        "id": "guide_nec_medical_management",
        "title_en": "Necrotizing enterocolitis (NEC) — medical management",
        "title_ru": "Некротизирующий энтероколит (НЭК) — medical management",
        "content": (
            "STAGING (Bell modified Walsh-Kliegman 1986) — см. калькулятор:\n"
            "- IA/IB Suspected NEC, mild systemic\n"
            "- IIA Definite NEC mild (X-ray pneumatosis или dilatation)\n"
            "- IIB Definite moderate (+ acidosis, ↓Plt, RLQ mass)\n"
            "- IIIA Advanced без perforation (peritonitis, DIC)\n"
            "- IIIB Advanced с perforation (pneumoperitoneum)\n\n"
            "ALL STAGES — IMMEDIATE STEPS:\n"
            "1. NPO (no oral / enteral feeds)\n"
            "2. NG tube — gravity drainage (decompression)\n"
            "3. IV access — central preferred (UVC если ≤ 7 d жизни)\n"
            "4. CBC + diff, CRP, electrolytes, blood gas, lactate, INR/PT, "
            "fibrinogen, type+crossmatch\n"
            "5. Blood cultures × 1-2 sites\n"
            "6. Stool cultures + occult blood\n"
            "7. Abdominal X-ray supine + lateral decubitus (free air)\n"
            "8. Pain management (morphine 0.05 мг/кг q4h prn)\n\n"
            "ANTIBIOTICS:\n"
            "- Stage I-IIA: Ампициллин 50 мг/кг q8-12h + Гентамицин 4-5 мг/кг "
            "(48-72 ч если cultures negative)\n"
            "- Stage IIB+ (definite NEC): TRIPLE therapy:\n"
            "  · Ампициллин 50-100 мг/кг q8-12h\n"
            "  · Гентамицин 4-5 мг/кг q24-48h\n"
            "  · Метронидазол 7.5 мг/кг q8-24h (anaerobic coverage)\n"
            "- Stage IIIB (perforation) или MDR: Меропенем 30 мг/кг q8h ± "
            "Ванкомицин\n\n"
            "DURATION:\n"
            "- Stage IA/IB: 48-72 ч (если cultures negative + improvement)\n"
            "- Stage IIA: 7-10 дней\n"
            "- Stage IIB: 14 дней\n"
            "- Stage IIIA-IIIB: 14-21 день\n\n"
            "SURGICAL CONSULT:\n"
            "- Stage IIB: surgical eval (RLQ mass, ascites)\n"
            "- Stage IIIA: aggressive medical, surgery if progressive\n"
            "- Stage IIIB (perforation): EMERGENCY laparotomy + bowel resection "
            "± ostomy (ileostomy + mucous fistula most common)\n"
            "- Penrose drain — temporizing для unstable preterm < 1000 г\n\n"
            "SUPPORTIVE CARE:\n"
            "- TPN — start ASAP (см. neo-tpn calc)\n"
            "- Ventilator support if respiratory distress\n"
            "- Hemodynamic support: NS bolus 10-20 мл/кг, dopamine if hypotensive\n"
            "- DIC management: FFP, platelets, cryoprecipitate as needed\n"
            "- Pain control: morphine 0.05-0.1 мг/кг q4h prn\n\n"
            "ENTERAL RE-FEEDING:\n"
            "- Stage I: 48-72 ч после стабилизации\n"
            "- Stage II: 7-14 дней NPO\n"
            "- Stage III: 21+ дней\n"
            "- Restart slowly: 10-20 мл/кг/сут trophic, increase gradually "
            "(ESPGHAN 2022)\n\n"
            "LONG-TERM:\n"
            "- Short bowel syndrome у ~ 10 % survivors (особенно после resection "
            "> 50 % bowel)\n"
            "- Cholestasis ассоциирован с длительным TPN\n"
            "- Strictures в 10-25 %\n"
            "- Neurodevelopmental delay ↑ при NEC III + sepsis\n\n"
            "PREVENTION:\n"
            "- Breast milk preferred (vs formula)\n"
            "- Slow feeds advancement у VLBW (ESPGHAN 2022)\n"
            "- Probiotics — recommended при IIB+ для prevention recurrence "
            "(NICE 2024); снижают NEC incidence на ~ 40 % (Cochrane 2017)"
        ),
        "references": [
            "Bell MJ et al. Ann Surg 1978;187:1",
            "Walsh MC, Kliegman RM. Pediatr Clin North Am 1986;33:179",
            "AAP / ACS 2020 surgical guidelines",
            "Cochrane Antibiotics for NEC 2017",
            "ESPGHAN 2022 EN Position Paper",
            "КР МЗ РФ \"НЭК\" (2024)",
        ],
    },
    {
        "id": "guide_pda_management_protocol",
        "title_en": "Patent Ductus Arteriosus (PDA) management",
        "title_ru": "Открытый артериальный проток (ОАП) — management",
        "content": (
            "DIAGNOSIS:\n\n"
            "ECHO (gold standard):\n"
            "- PDA size > 1.5 мм (значимый)\n"
            "- LA/Ao ratio > 1.4\n"
            "- Descending aorta — diastolic flow reverse\n"
            "- Continuous murmur (machinery murmur left infra-clavicular)\n"
            "- Hemodynamic significance: respiratory deterioration, pulmonary "
            "edema, BP wide pulse pressure, bounding pulses\n\n"
            "CLASSIFICATION:\n"
            "- Asymptomatic small PDA: observation\n"
            "- Hemodynamically significant PDA (hsPDA) — see criteria above\n"
            "- Duct-dependent CHD (cyanotic / left obstructive) — KEEP open "
            "with PGE1 — см. neo-pge1 (отдельный calc)\n\n"
            "TREATMENT OPTIONS — choose based on contraindications:\n\n"
            "OPTION 1: IBUPROFEN (preferred — Mitra JAMA 2018)\n"
            "- Standard: 10/5/5 мг/кг q24h × 3 дня\n"
            "- High-dose Hirt 2008 (< 27 нед): 20/10/10 мг/кг\n"
            "- Closure rate ~ 70 %\n"
            "- Better GI/renal safety vs indomethacin\n"
            "- См. neo-ibuprofen-pda-dose calc\n\n"
            "OPTION 2: INDOMETHACIN (если ибупрофен недоступен)\n"
            "- Standard: 0.2 мг/кг IV × 1 → 0.1 мг/кг q12h × 2 (если < 48 ч)\n"
            "- IVH prophylaxis у ELBW: 0.1 мг/кг q24h × 3 (TIPP Schmidt 2001)\n"
            "- Closure rate ~ 70 %\n"
            "- Higher mesenteric/renal vasoconstriction → больше NEC, oliguria\n\n"
            "OPTION 3: PARACETAMOL (Allegaert 2014, 3-я линия)\n"
            "- 15 мг/кг q6h × 3-7 дней (PO/IV)\n"
            "- Closure rate ~ 60 % (Cochrane 2019)\n"
            "- Better safety profile vs NSAIDs\n"
            "- Showings: NSAID contraindications (renal failure, "
            "thrombocytopenia, NEC, GI bleed)\n\n"
            "OPTION 4: CONSERVATIVE (BeNeDuctus NEJM 2022)\n"
            "- Asymptomatic / non-significant PDA у GA > 30 нед\n"
            "- Most spontaneously close к 12 нед PMA\n"
            "- Pharm closure не улучшает long-term outcomes (TIPP 2001 + "
            "BeNeDuctus 2022)\n\n"
            "OPTION 5: SURGICAL LIGATION\n"
            "- Refractory hsPDA после 2 courses pharm therapy\n"
            "- Symptomatic при contraindications к pharm\n"
            "- Risk: recurrent laryngeal nerve injury, chylothorax, "
            "post-ligation cardiac syndrome\n\n"
            "CONTRAINDICATIONS к NSAID closure:\n"
            "- Active hemorrhage / тромбоцитопения < 50 × 10⁹/л\n"
            "- NEC active / suspected\n"
            "- Renal failure (Cr > 1.5 мг/дл, диурез < 1 мл/кг/ч × 8 ч)\n"
            "- Active sepsis\n"
            "- Right-to-left shunt (duct-dependent CHD)\n"
            "- Coagulopathy\n\n"
            "MONITORING:\n"
            "- Echo через 24-48 ч после course (PDA assessment)\n"
            "- Cr / urea / диурез q24h\n"
            "- CBC (тромбоцитопения)\n"
            "- Гликемия\n\n"
            "AFTER CLOSURE:\n"
            "- Confirm absence ductal flow (echo)\n"
            "- Wean ventilator support\n"
            "- Resume normal feeding"
        ),
        "references": [
            "Mitra S et al. JAMA 2018;319:1221 — comparative meta-analysis",
            "Ohlsson A et al. Cochrane Ibuprofen for PDA 2020",
            "Hundscheid T et al. NEJM 2022;387:683 (BeNeDuctus)",
            "Schmidt B et al. TIPP trial NEJM 2001;344:1966",
            "Allegaert K et al. Pediatrics 2014;134:e253 (paracetamol)",
            "КР МЗ РФ \"Открытый артериальный проток у н/р\" (2024)",
        ],
    },
    {
        "id": "guide_bpd_chronic_management",
        "title_en": "BPD (bronchopulmonary dysplasia) — chronic management",
        "title_ru": "БЛД (бронхолёгочная дисплазия) — хроническое ведение",
        "content": (
            "DIAGNOSIS (NIH consensus 2018):\n"
            "Severity assessment at 36 wk PMA — см. neo-bpd-nih calc:\n"
            "- No BPD: room air\n"
            "- Mild: ≥ 28 days O₂ requirement, off O₂ at 36 wk PMA\n"
            "- Moderate: < 30 % FiO₂ at 36 wk PMA\n"
            "- Severe: ≥ 30 % FiO₂ или PPV/CPAP at 36 wk PMA\n\n"
            "EVALUATION:\n"
            "- Echo: pulmonary HTN screen (TR jet velocity, RV pressure, "
            "septal flattening)\n"
            "- Chest X-ray: cystic-emphysematous changes, areas of consolidation\n"
            "- Blood gas: chronic respiratory acidosis (compensated)\n"
            "- Growth chart: feeding adequacy assessment\n\n"
            "PROPHYLAXIS / EARLY MANAGEMENT:\n"
            "- Antenatal corticosteroids (betamethasone 12 мг IM × 2)\n"
            "- Surfactant ASAP (LISA preferred у ≥ 26 нед на CPAP)\n"
            "- Caffeine 20 мг/кг loading + 5-10 мг/кг q24h (CAP trial — "
            "Schmidt 2007 NEJM)\n"
            "- Permissive hypercapnia (PaCO₂ 45-55, pH ≥ 7.25)\n"
            "- Avoid hyperoxia (target SpO₂ 90-95 %)\n"
            "- Volume restriction (if signs of fluid overload)\n\n"
            "ESTABLISHED BPD:\n\n"
            "1. RESPIRATORY:\n"
            "- Wean to lowest effective FiO₂\n"
            "- Гомеопатический подход: SpO₂ target 90-95 % (NeOProM 2018)\n"
            "- Bronchodilator (albuterol) ad-hoc для wheezing\n"
            "- Nebulized budesonide 200-500 мкг q12h (controversial — Bassler "
            "NEUROSIS 2015 mortality concern)\n\n"
            "2. SYSTEMIC STEROIDS (если ventilator-dependent ≥ 14 дней):\n"
            "- Dexamethasone DART regimen low-dose late (Doyle 2006):\n"
            "  · Day 1-3: 0.075 мг/кг q12h\n"
            "  · Day 4-6: 0.05 мг/кг q12h\n"
            "  · Day 7-9: 0.025 мг/кг q12h\n"
            "  · Day 10: 0.01 мг/кг q12h\n"
            "  · Cumulative 0.89 мг/кг\n"
            "- ⚠️ AVOID extreme preterm < 28 нед в первые 7 d (Yeh 1998 NEJM "
            "338:101 — cerebral palsy concerns)\n"
            "- Hydrocortisone 1 мг/кг q8h × 5 d — alternative (less concerning "
            "vs dexamethasone)\n\n"
            "3. DIURETICS:\n"
            "- Furosemide 1-4 мг/кг q12-24h (acute) или PO chronic\n"
            "- + Spironolactone 1-3 мг/кг q24h (potassium-sparing)\n"
            "- + KCl supplementation 1-3 мэкв/кг/сут\n"
            "- Cochrane 2017: short-term improvement только\n\n"
            "4. NUTRITION:\n"
            "- Caloric goals 130-150 ккал/кг/сут (BPD ↑ metabolic demand)\n"
            "- Protein 4.0-4.5 г/кг/сут до 1000 г\n"
            "- Fortified breastmilk или specialized preterm formula\n"
            "- Vit A 5000 ед/кг IM 3×/нед × 4 нед (Tyson 1999 NEJM — ↓ BPD)\n\n"
            "5. MONITORING:\n"
            "- Echo: pulmonary HTN screen q3 мес если established BPD\n"
            "- Sildenafil 0.5-3 мг/кг q6-8h если PHTN confirmed\n"
            "- Eye exams (ROP risk)\n"
            "- Hearing screen (Aminoglycoside ototoxicity)\n"
            "- Renal U/S (nephrocalcinosis у chronic furosemide)\n\n"
            "DISCHARGE:\n"
            "- Home O₂ if persistent O₂ requirement\n"
            "- Pulmonologist follow-up\n"
            "- RSV palivizumab (15 мг/кг IM monthly) — eligible per AAP COFN "
            "2014/2023\n"
            "- Influenza vaccine (annual ≥ 6 мес)\n"
            "- Avoid second-hand smoke, daycare exposure"
        ),
        "references": [
            "Jobe AH, Bancalari E. NIH BPD consensus 2001 + Higgins 2018",
            "Schmidt B et al. CAP trial NEJM 2007;357:1893",
            "Doyle LW DART trial Pediatrics 2006;117:75",
            "Yeh TF et al. NEJM 1998;338:101",
            "Tyson JE et al. NEJM 1999;340:1962 (vit A)",
            "Cochrane Diuretics for BPD 2017",
            "AAP CFN — BPD management",
            "КР МЗ РФ \"БЛД\" (2024)",
        ],
    },
    {
        "id": "guide_pphn_treatment_algorithm",
        "title_en": "PPHN treatment algorithm",
        "title_ru": "PPHN — алгоритм лечения",
        "content": (
            "DIAGNOSIS — см. neo-pphn-screen calc:\n"
            "- Differential cyanosis (pre-ductal SpO₂ > post-ductal by > 5-10 %)\n"
            "- Hypoxemia disproportionate к lung disease\n"
            "- Echo: TR jet > 2.5 м/с, RV pressure ≥ 2/3 systemic, R→L "
            "shunting через PDA/PFO\n"
            "- Hyperoxia test: PaO₂ < 100 мм рт ст на 100 % O₂ × 10 мин\n\n"
            "STEPWISE TREATMENT:\n\n"
            "STEP 1: OPTIMIZE VENTILATION\n"
            "- Adequate PEEP 5-8 cmH₂O\n"
            "- MAP optimization\n"
            "- Avoid extremes: target PaCO₂ 40-50, pH 7.30-7.40\n"
            "- Surfactant если RDS / MAS\n"
            "- HFOV consider если conventional не optimal\n\n"
            "STEP 2: CORRECT UNDERLYING\n"
            "- Acidosis: NaHCO₃ только если pH < 7.20 + adequate ventilation\n"
            "- Hypocalcemia: Ca gluconate 1-2 мл/кг 10 % IV slow\n"
            "- Hypoglycemia: D10W 2 мл/кг bolus + GIR 6-8 мг/кг/мин\n"
            "- Sepsis: empiric abx (см. sepsis algorithm)\n"
            "- Polycythemia (Hct > 65 %): partial exchange (см. neo-partial-"
            "exchange calc)\n\n"
            "STEP 3: SEDATION + MUSCLE RELAXATION\n"
            "- Morphine 10-30 мкг/кг/ч infusion\n"
            "- Fentanyl 1-3 мкг/кг/ч (alternative)\n"
            "- Vecuronium 0.1 мг/кг q1-4h prn (если sympathetic surge severe)\n\n"
            "STEP 4: iNO (см. neo-ino-dose)\n"
            "- Initial 20 ppm × 30-60 мин trial\n"
            "- Response: PaO₂ ↑ ≥ 20 мм рт ст или OI ↓ ≥ 15 % за 30 мин\n"
            "- If response: continue, taper к 5-10 ppm\n"
            "- Wean q4-12h до 1 ppm; off attempt при FiO₂ < 50 %\n"
            "- Methemoglobinemia monitoring q12-24h\n\n"
            "STEP 5: ADDITIONAL VASODILATORS (если iNO inadequate)\n"
            "- Sildenafil PO 0.5-3 мг/кг q6-8h (PDE5 inhibitor — см. neo-"
            "sildenafil)\n"
            "- Sildenafil IV LOAD-SUSTAIN: 0.4 мг/кг loading × 3 ч + 1.6 "
            "мг/кг/сут\n"
            "- Used для iNO weaning support (sustains effect)\n\n"
            "STEP 6: INODILATORS (если RV dysfunction)\n"
            "- Milrinone 0.25-0.75 мкг/кг/мин (PDE3 inhibitor — см. neo-milrinone)\n"
            "- Synergy с iNO (Khanna CHEST 2017)\n"
            "- ↑ Contractility + ↓ SVR/PVR одновременно\n\n"
            "STEP 7: VASOPRESSORS (если systemic hypotension)\n"
            "- Dopamine 5-15 мкг/кг/мин first-line\n"
            "- Norepinephrine 0.05-1 мкг/кг/мин (warm shock)\n"
            "- Vasopressin 0.0001-0.001 ед/кг/мин (refractory, catecholamine-"
            "resistant)\n"
            "- Hydrocortisone 1 мг/кг q8h (relative adrenal insufficiency)\n\n"
            "STEP 8: ECMO\n"
            "- ELSO 2017 criteria: OI ≥ 40 sustained × 4 ч\n"
            "- Or A-aDO₂ ≥ 600 мм рт ст × 8-12 ч у term/late preterm\n"
            "- Connect ECMO center early (preparation may take hours)\n\n"
            "ALTERNATIVE / ADJUNCT:\n"
            "- MgSO₄ 200 мг/кг IV bolus + 100-150 мг/кг/ч (last-line, rare у н/р)\n"
            "- Bosentan PO 1-2 мг/кг q12h (chronic PHTN, off-label у н/р)\n"
            "- ECMO bridge to recovery\n\n"
            "PROGNOSIS:\n"
            "- Mortality severe PPHN: 10-30 %\n"
            "- Survivors с BPD/CLD common\n"
            "- Long-term pulmonary HTN rare если acute resolves"
        ),
        "references": [
            "AHA 2019 PPHN Scientific Statement",
            "AAP COFN — pediatric pulmonary hypertension",
            "NINOS trial Pediatrics 1997",
            "Khanna A et al. CHEST 2017 (milrinone meta-analysis)",
            "Baquero H et al. Pediatrics 2006 (sildenafil)",
            "Konduri GG et al. — PPHN management guidelines",
            "ELSO ECMO Guidelines",
            "КР МЗ РФ \"Персистирующая лёгочная гипертензия н/р\" (2024)",
        ],
    },
    {
        "id": "guide_nas_management_protocol",
        "title_en": "Neonatal Abstinence Syndrome (NAS) management",
        "title_ru": "Неонатальный абстинентный синдром (NAS) — лечение",
        "content": (
            "ASSESSMENT — см. neo-finnegan calc (Modified Finnegan / mFNAS):\n"
            "- 22 признака × 0-5 баллов, max 47\n"
            "- Оценка q3-4h после кормления первые 96-120 ч жизни\n"
            "- Bands: ≤ 7 поддерживающие меры; 8-11 наблюдение + adjunct; "
            "≥ 12 фармакотерапия\n\n"
            "PHARMACOTHERAPY TRIGGERS (AAP 2012):\n"
            "- 3 последовательных оценок mFNAS ≥ 8\n"
            "- ИЛИ 2 последовательных оценок ≥ 12\n\n"
            "FIRST-LINE (опиоид-преобладающий withdrawal):\n\n"
            "MORPHINE PO (см. neo-morphine-dose):\n"
            "- Initial: 0.04-0.08 мг/кг q3-4h PO\n"
            "- Titration: ↑ 10-20 % q24h до mFNAS < 8 stable × 24 ч\n"
            "- Maximum: 0.16 мг/кг q3h (resistant)\n"
            "- Tapering: ↓ 10 % q24h после 48 ч stable\n"
            "- Прекращение: при дозе < 0.024 мг/кг q3h\n"
            "- Continued mFNAS до 24-48 ч после стопа\n\n"
            "SECOND-LINE / ADJUNCT (autonomic symptoms dominant):\n\n"
            "CLONIDINE PO (см. neo-clonidine):\n"
            "- 1 мкг/кг q3-4h PO (max 5 мкг/кг q3h)\n"
            "- Combine с morphine для autonomic effects\n"
            "- Particularly useful в polysubstance withdrawal\n"
            "- Agthe Pediatrics 2009: ↓ hospitalization length 27 %\n"
            "- Tapering: ↓ 10-20 % q24h после morphine wean\n\n"
            "PHENOBARBITAL PO (см. neo-phenobarbital):\n"
            "- 5 мг/кг q12h PO (polysubstance / non-opioid component)\n"
            "- Loading 15-20 мг/кг IV/PO once если severe\n"
            "- Less commonly used vs clonidine\n\n"
            "ALTERNATIVE: ESC (Eat-Sleep-Console) NEJM 2023\n"
            "- Function-based assessment (eat, sleep, console)\n"
            "- Снижает medication use + LOS vs Finnegan-driven\n"
            "- Family-centered approach\n\n"
            "NON-PHARMACOLOGICAL MEASURES (всем):\n"
            "- Кенгуру (skin-to-skin) с матерью (если consenting + safe)\n"
            "- Грудное вскармливание (если mother NOT actively using)\n"
            "- Тихая dark environment\n"
            "- Swaddling (пеленание)\n"
            "- Frequent small feedings\n"
            "- Sucking (pacifier)\n\n"
            "FAMILY/MATERNAL CARE:\n"
            "- Maternal medication-assisted treatment (MAT) — methadone or "
            "buprenorphine\n"
            "- НЕ stop maternal opioids cold-turkey\n"
            "- Social work evaluation\n"
            "- Discharge planning\n"
            "- Outpatient follow-up arranged\n\n"
            "MATERNAL OPIOIDS — ONSET OF NAS:\n"
            "- Heroin / short-acting opioids: 24-72 ч\n"
            "- Methadone: 72-96 ч (peak)\n"
            "- Buprenorphine: до 14 дней\n"
            "- SSRI / benzo: variable, often delayed\n\n"
            "DURATION OF HOSPITALIZATION:\n"
            "- Average 5-30 days depending on severity\n"
            "- Mother + infant joint hospitalization preferred\n"
            "- ESC may shorten LOS by 30-50 %\n\n"
            "NALOXONE — CONTRAINDICATED:\n"
            "- ⚠️ NEVER use naloxone у opioid-dependent newborns "
            "(precipitates withdrawal seizures)\n"
            "- Differs from acute opioid overdose management\n\n"
            "LONG-TERM:\n"
            "- Behavioral / cognitive concerns\n"
            "- Early intervention services\n"
            "- Family-centered support"
        ),
        "references": [
            "Hudak ML, Tan RC. AAP NAS Pediatrics 2012;129:e540",
            "Agthe AG et al. Pediatrics 2009;123:e849",
            "ESC trial NEJM 2023 — function-based assessment",
            "Finnegan LP. Addict Dis 1975;2:141",
            "MDCalc Modified Finnegan",
            "КР МЗ РФ \"Неонатальный абстинентный синдром\" (2024)",
        ],
    },
    {
        "id": "guide_apnea_of_prematurity_management",
        "title_en": "Apnea of prematurity (AOP) — management",
        "title_ru": "Апноэ недоношенных — management",
        "content": (
            "DEFINITIONS:\n"
            "- Apnea: pause in breathing > 20 seconds, ИЛИ shorter если "
            "associated with bradycardia (< 80 уд/мин), cyanosis, или "
            "desaturation (SpO₂ < 80 %)\n"
            "- Periodic breathing: 3+ pauses ≥ 3 sec separated by < 20 sec "
            "of regular breathing — normal у preterm\n\n"
            "TYPES:\n"
            "- Central apnea (40 %): no respiratory effort, no airflow\n"
            "- Obstructive apnea (10 %): respiratory effort but no airflow "
            "(airway obstruction)\n"
            "- Mixed apnea (50 %): central + obstructive components\n\n"
            "RISK FACTORS:\n"
            "- Prematurity (peak 28-34 нед PMA)\n"
            "- Sepsis\n"
            "- Hypoxia\n"
            "- Anemia (Hb < 8 г/дл)\n"
            "- Hypoglycemia\n"
            "- Electrolyte abnormalities (hypoCa, hypoNa)\n"
            "- Maternal medications (opioids, magnesium)\n"
            "- Seizures (subtle)\n"
            "- GERD\n"
            "- Neurologic injury (IVH, HIE)\n\n"
            "WORKUP:\n"
            "- CBC, electrolytes (Na, K, Ca, Mg, glucose)\n"
            "- Blood gas (acidosis может ↑ apnea)\n"
            "- Sepsis workup если new onset (CBC + diff, CRP, blood culture, "
            "LP по показаниям)\n"
            "- Echo (PDA, PHTN)\n"
            "- Head US (IVH)\n"
            "- EEG если seizure suspected\n"
            "- Polysomnography (rarely needed у н/р)\n\n"
            "TREATMENT — STEP 1: STIMULATION\n"
            "- Tactile stimulation (rubbing back, foot)\n"
            "- Position: prone or lateral (NOT supine для apnea)\n"
            "- Suctioning if airway obstruction\n\n"
            "STEP 2: METHYLXANTHINES (см. neo-caffeine-dose)\n"
            "- CAFFEINE CITRATE preferred:\n"
            "  · Loading: 20 мг/кг IV/PO\n"
            "  · Maintenance: 5-10 мг/кг q24h IV/PO\n"
            "  · Therapeutic: 5-25 мкг/мл; toxicity > 40 мкг/мл\n"
            "- Theophylline alternative (less preferred — narrower "
            "therapeutic window, more side effects)\n\n"
            "STEP 3: RESPIRATORY SUPPORT\n"
            "- Nasal CPAP 5-7 cmH₂O — first-line for moderate-severe AOP\n"
            "- HFNC (high-flow nasal cannula) — alternative\n"
            "- BiPAP — refractory cases\n"
            "- Mechanical ventilation — severe / persistent / multi-system\n\n"
            "STEP 4: ADJUNCTS\n"
            "- Doxapram 0.5-1.5 мг/кг/ч IV — refractory AOP (rare у newborn, "
            "limited evidence)\n"
            "- Transfusion если Hb < 8 г/дл (controversial)\n"
            "- Treat sepsis empirically\n"
            "- Anti-reflux measures если GERD suspected\n\n"
            "MONITORING:\n"
            "- Continuous cardiopulmonary monitor in NICU\n"
            "- SpO₂ continuous\n"
            "- Apnea events log: count, duration, severity\n"
            "- Daily review for trend\n\n"
            "CAFFEINE — CAP TRIAL (Schmidt 2007 NEJM 357:1893):\n"
            "- 2006 ELBW newborns randomized\n"
            "- ↓ BPD (RR 0.63)\n"
            "- ↓ PDA closure rate\n"
            "- ↓ Severe ROP\n"
            "- ↓ Cerebral palsy / cognitive delay 18-21 мес\n"
            "- 5-year follow-up: improved neurodevelopment\n\n"
            "DISCONTINUATION:\n"
            "- After PMA 33-36 нед\n"
            "- AND ≥ 5-7 days apnea-free WITHOUT caffeine\n"
            "- Tapering NOT needed (long t½ 60-100 ч у preterm)\n"
            "- Some centers continue if persistent events at expected age\n\n"
            "DISCHARGE:\n"
            "- Apnea-free ≥ 5-7 days\n"
            "- Off methylxanthines\n"
            "- Mature respiratory pattern\n"
            "- Home apnea monitor — controversial (NOT routinely recommended)"
        ),
        "references": [
            "Schmidt B et al. CAP trial NEJM 2007;357:1893",
            "Schmidt B et al. CAP follow-up NEJM 2012;366:1893",
            "AAP CFN — Apnea of prematurity (Eichenwald EC 2018)",
            "Cochrane Caffeine for AOP 2010",
            "КР МЗ РФ \"Апноэ недоношенных\" (2024)",
        ],
    },
    {
        "id": "guide_anemia_of_prematurity_management",
        "title_en": "Anemia of prematurity (AOP) — management",
        "title_ru": "Анемия недоношенных — management",
        "content": (
            "DEFINITION:\n"
            "Hb < 8.5 г/дл (term) или < 9-10 г/дл (preterm) — physiologic "
            "nadir к 8-12 нед age у term, к 4-6 нед у preterm.\n\n"
            "PATHOPHYSIOLOGY:\n"
            "- ↓ Erythropoietin response\n"
            "- Shortened RBC lifespan (60-90 d у preterm vs 120 d у term)\n"
            "- Iatrogenic blood loss (lab draws ~ 1 мл/кг/нед)\n"
            "- Hemodilution due to rapid growth\n\n"
            "ASSESSMENT:\n"
            "- Hb / Hct trend\n"
            "- Reticulocyte count (low у true AOP)\n"
            "- Iron studies: ferritin, transferrin saturation\n"
            "- Vit B12, folate (rarely deficient у н/р)\n"
            "- Bilirubin (rule out hemolysis)\n"
            "- Coombs test if hemolysis suspected\n"
            "- Symptoms: tachycardia, tachypnea, poor feeding, lethargy, "
            "growth failure\n\n"
            "CLASSIFICATION BY SEVERITY:\n"
            "- Mild: asymptomatic, Hb > 7-8 г/дл — observation + iron\n"
            "- Moderate: symptomatic Hb 7-9 г/дл — Epo + iron\n"
            "- Severe: Hb < 7 г/дл с symptoms — transfusion\n\n"
            "TREATMENT OPTIONS:\n\n"
            "OPTION 1: SUPPORTIVE\n"
            "- Iron supplementation 2-6 мг/кг/сут elemental PO (см. neo-iron-"
            "dose):\n"
            "  · Preterm 2-4 мг/кг/сут с 2-4 нед age\n"
            "  · AOP + Epo: 6 мг/кг/сут OBLIGATORY\n"
            "- Folic acid 50 мкг/кг/сут\n"
            "- Vit E 25 ед/сут\n"
            "- Adequate nutrition (protein 4 г/кг/сут VLBW)\n"
            "- Minimize blood draws (microsampling)\n\n"
            "OPTION 2: ERYTHROPOIETIN — см. neo-erythropoietin-dose\n"
            "- rhEpo 250-500 ед/кг 3×/нед SC (preterm AOP)\n"
            "- ИЛИ Darbepoetin alfa 10 мкг/кг 1×/нед SC (alternative)\n"
            "- ⚠️ Iron OBLIGATORY 4-6 мг/кг/сут — без iron Epo не работает\n"
            "- Cochrane 2014: ↓ transfusion need 12 %; no functional benefit\n"
            "- Длительность: до PMA 32-34 нед или discharge\n\n"
            "OPTION 3: PACKED RBC TRANSFUSION\n"
            "- Threshold (severe AOP):\n"
            "  · Symptomatic + Hb < 7 г/дл\n"
            "  · Asymptomatic + Hb < 6 г/дл\n"
            "  · Mechanical ventilation + Hb < 10 г/дл\n"
            "  · Cardiac disease + Hb < 12 г/дл\n"
            "- Volume: 10-15 мл/кг over 3-4 ч (slow infusion)\n"
            "- Aim Hct rise ~ 5 % per 10 мл/кг\n"
            "- Irradiated, leukocyte-depleted, CMV-safe для preterm\n"
            "- Restrictive vs liberal: ETTNO + PINT trials — liberal не "
            "improves outcomes\n\n"
            "PREVENTION (KEY):\n"
            "- Delayed cord clamping ≥ 60 sec at birth\n"
            "- Umbilical cord milking (UCM) — alternative if DCC not feasible\n"
            "- Microsampling lab draws (point-of-care testing)\n"
            "- Group orders to minimize draws\n"
            "- Conservative transfusion threshold\n\n"
            "MONITORING ON Epo:\n"
            "- CBC weekly\n"
            "- Reticulocyte count baseline + 2 нед\n"
            "- Iron studies (ferritin) q4 нед\n"
            "- Effect: Hb ↑ 4-6 нед, reticulocytes ↑ 1-2 нед\n\n"
            "PENUT TRIAL (Juul 2020 NEJM 382:233):\n"
            "- 941 extremely preterm\n"
            "- Epo 1000 ед/кг IV q48h × 6 doses for neuroprotection\n"
            "- ↓ Transfusions (modest)\n"
            "- NO neurodev benefit\n"
            "- → Не routine для preterm neuroprotection\n\n"
            "OLD ROP CONCERNS DISPROVED:\n"
            "- Cochrane 2014 + PENUT 2020: Epo НЕ повышает severe ROP risk"
        ),
        "references": [
            "Aher SM et al. Cochrane Erythropoietin для AOP 2014",
            "Juul SE et al. PENUT trial NEJM 2020;382:233",
            "ETTNO trial JAMA Pediatr 2020",
            "PINT trial Whyte R Pediatrics 2009",
            "AAP COFN 2010 Iron requirements",
            "ESPGHAN 2014 Iron supplementation в preterm",
            "КР МЗ РФ \"Анемия новорождённого\" (2024)",
        ],
    },
    {
        "id": "guide_hypoglycemia_management_neonatal",
        "title_en": "Neonatal hypoglycemia management",
        "title_ru": "Гипогликемия новорождённого — management",
        "content": (
            "DEFINITIONS (PES 2015 — Thornton):\n\n"
            "TERM (asymptomatic):\n"
            "- First 4 ч: < 1.8 ммоль/л (< 35 мг/дл) operational threshold\n"
            "- 4-24 ч: < 2.0 ммоль/л (< 40 мг/дл)\n"
            "- > 24 ч: < 2.6 ммоль/л (< 47 мг/дл)\n"
            "- > 48 ч (target): ≥ 4.0 ммоль/л (≥ 70 мг/дл)\n\n"
            "PRETERM / SYMPTOMATIC: < 2.6 ммоль/л — лечить ВСЕГДА\n\n"
            "SEVERE: < 1.4 ммоль/л (< 25 мг/дл) — emergency\n\n"
            "AT-RISK NEWBORNS (screen):\n"
            "- LGA (> 90-й перцентиль)\n"
            "- SGA (< 10-й перцентиль)\n"
            "- IDM (infant of diabetic mother)\n"
            "- Preterm < 37 нед\n"
            "- Sepsis\n"
            "- Hypothermia\n"
            "- Asphyxia\n"
            "- Polycythemia (Hct > 65 %)\n\n"
            "SCREENING SCHEDULE:\n"
            "- 30 мин после рождения (пуповинный или heel-prick)\n"
            "- Повтор q30-60 мин × first 4 ч\n"
            "- Затем q3-4h до stable × 24 ч\n"
            "- POC glucose acceptable; lab confirmation если < 1.4 ммоль/л\n\n"
            "TREATMENT — см. neo-glucose-bolus-dose calc:\n\n"
            "STEP 1: ENTERAL FEEDING (asymptomatic, mild)\n"
            "- Breast milk или formula 5-10 мл/кг within 30 мин\n"
            "- Re-check glucose 30 мин после feed\n"
            "- Если improvement → continue regular feeding q2-3h\n\n"
            "STEP 2: IV BOLUS (symptomatic ИЛИ severe ИЛИ failure feeding)\n"
            "- 2 мл/кг D10W IV slow push 1-2 мин (= 200 мг/кг = 0.2 г/кг)\n"
            "- Severe (< 1.4 ммоль/л + symptomatic): 5 мл/кг D10W IV\n"
            "- Re-check glucose 30 мин после bolus\n\n"
            "STEP 3: CONTINUOUS GIR (см. neo-gir calc)\n"
            "- Start 6-8 мг/кг/мин (≈ 80-110 мл/кг/сут D10W)\n"
            "- Titrate: ↑ 2 мг/кг/мин q15-30 мин если persistent\n"
            "- Max peripheral GIR: D12.5W (limited concentration)\n"
            "- Beyond: central доступ + D15-20W\n\n"
            "STEP 4: REFRACTORY HYPOGLYCEMIA (GIR ≥ 12-15 мг/кг/мин persistent)\n"
            "- Workup CHI: insulin/glucose ratio > 0.3 при гипогликемии\n"
            "- β-OH butyrate inappropriately низкий (< 1 ммоль/л)\n"
            "- Free fatty acids inappropriately низкие\n"
            "- Glucagon, cortisol, GH, lactate, ammonia\n"
            "- Genetic testing: KCNJ11, ABCC8 (KATP), GLUD1, GCK, HADH\n\n"
            "STEP 5: CHI EMERGENCY MANAGEMENT\n"
            "- Glucagon 0.1-0.3 мг/кг IM/IV (см. neo-glucagon)\n"
            "- Continuous infusion 0.005-0.02 мг/кг/ч (bridge to diazoxide)\n"
            "- Diazoxide 5-15 мг/кг/сут PO q8h (см. neo-diazoxide) + "
            "chlorothiazide 7-10 мг/кг q12h\n"
            "- Octreotide 5-25 мкг/кг/сут SC (если KATP-resistant)\n"
            "- Hydrocortisone 1-2 мг/кг q8h (adrenal insuff trial)\n\n"
            "STEP 6: SURGICAL\n"
            "- 18F-DOPA PET — focal vs diffuse CHI distinction\n"
            "- Focal CHI: partial pancreatectomy (curative)\n"
            "- Diffuse CHI: chronic medical management\n\n"
            "MONITORING:\n"
            "- Glucose q15-30 мин после bolus initially\n"
            "- Gradually space к q1h, q4h когда stable\n"
            "- Goal: glucose 4-8 ммоль/л (70-150 мг/дл)\n\n"
            "AVOID:\n"
            "- D50W (50 % glucose) — высокая osmolality, ↑ риск IVH у preterm\n"
            "- Rapid bolus > 5 мл/кг — rebound hyperglycemia, hyponatremia\n"
            "- Sudden cessation continuous infusion — может precipitate severe "
            "rebound hypoglycemia\n\n"
            "CAUSES SUSTAINED HYPOGLYCEMIA:\n"
            "- Hyperinsulinism (CHI, IDM, BWS)\n"
            "- Counter-regulatory hormone deficiency (cortisol, GH)\n"
            "- Glycogen storage disease\n"
            "- Fatty acid oxidation defects (MCAD)\n"
            "- Disorders gluconeogenesis (FBPase, G6Pase)\n"
            "- Galactosemia"
        ),
        "references": [
            "Thornton PS et al. PES 2015 — neonatal hypoglycemia",
            "AAP CFN 2011 — Hypoglycemia",
            "BAPM 2017 — Identification & Management of Neonatal Hypoglycaemia",
            "WHO Pocket Book of Hospital Care for Children (2013)",
            "Arnoux JB et al. — CHI management guidelines",
            "Stanley CA Pediatrics 122:1124 (CHI)",
            "КР МЗ РФ \"Гипогликемия новорождённого\" (2024)",
        ],
    },
    {
        "id": "guide_pain_management_neonatal_hierarchy",
        "title_en": "Neonatal pain management — assessment and treatment hierarchy",
        "title_ru": "Управление болью у новорождённого — assessment + treatment",
        "content": (
            "ASSESSMENT TOOLS — см. калькуляторы:\n\n"
            "ACUTE / PROCEDURAL PAIN:\n"
            "- NIPS (neo-nips): term ≥ 32 нед, max 7 (Lawrence 1993)\n"
            "- PIPP-R (neo-pipp-r): preterm, max 21 (Stevens 2014)\n"
            "- Bands NIPS: 0-2 нет / 3-4 умеренная / ≥ 5 сильная\n"
            "- Bands PIPP-R: ≤ 6 нет / 7-12 mild-moderate / ≥ 13 severe\n\n"
            "POSTOPERATIVE / PROLONGED:\n"
            "- COMFORT-neo (8 параметров)\n"
            "- N-PASS (neo-npass): bimodal pain + sedation -10 to +10 (Hummel "
            "2008)\n\n"
            "NAS (Neonatal Abstinence):\n"
            "- mFNAS (neo-finnegan): max 47 (см. NAS protocol)\n"
            "- ESC (Eat-Sleep-Console) — function-based alternative\n\n"
            "TREATMENT HIERARCHY:\n\n"
            "TIER 1: NON-PHARMACOLOGICAL (всем перед invasive)\n"
            "- Skin-to-skin (kangaroo) с матерью\n"
            "- Грудное вскармливание\n"
            "- Breast milk на pacifier\n"
            "- Sucrose 24 % 0.5-2 мл за 2 мин до procedure (oral, NOT swallowed) "
            "+ pacifier\n"
            "  · Onset 2 мин, duration 5-8 мин\n"
            "  · Maximum 5-10 doses/day\n"
            "  · Cochrane 2016: significant pain reduction\n"
            "- Containment / facilitated tucking\n"
            "- Swaddling\n"
            "- Calm environment, dim lighting\n\n"
            "TIER 2: TOPICAL ANESTHETICS\n"
            "- EMLA cream (2.5 % lidocaine + 2.5 % prilocaine):\n"
            "  · 1 g для 5-10 cm² area\n"
            "  · Apply 60 мин перед procedure\n"
            "  · Cover с occlusive dressing\n"
            "  · Avoid у preterm < 32 нед (methemoglobinemia risk)\n"
            "  · NOT для repeated use\n"
            "- Tetracaine (Ametop) 4 % gel — 30-45 мин onset\n"
            "- Lidocaine subcut 0.5-1 мл — venipuncture, lumbar puncture\n\n"
            "TIER 3: ANALGESICS — NON-OPIOID\n"
            "- Paracetamol (acetaminophen) — см. neo-paracetamol-dose:\n"
            "  · 10-15 мг/кг q6-8h PO/PR\n"
            "  · IV 10 мг/кг q6h (Perfalgan)\n"
            "  · Maximum: term 60 мг/кг/сут; preterm < 32 нед 50; ELBW 40\n"
            "  · Mild-moderate pain, post-procedure\n"
            "- NSAIDs (ибупрофен) — limited use у н/р для analgesia (PDA "
            "closure context different)\n\n"
            "TIER 4: ANALGESICS — OPIOIDS\n"
            "MORPHINE (см. neo-morphine):\n"
            "- IV bolus 0.05-0.1 мг/кг q4-6h (acute moderate-severe)\n"
            "- IV continuous infusion 10-30 мкг/кг/ч (sedation на ИВЛ, severe pain)\n"
            "- NEOPAIN trial (Anand 2003): routine у preterm не improves "
            "outcomes — selective use\n\n"
            "FENTANYL (см. neo-fentanyl):\n"
            "- IV bolus 0.5-2 мкг/кг slow push (procedure premedication)\n"
            "- IV continuous 0.5-4 мкг/кг/ч\n"
            "- 75-125× более potent чем morphine\n"
            "- Onset 1-2 мин IV (быстрее morphine)\n"
            "- Less hypotension (no histamine release) — preferred у unstable\n\n"
            "TIER 5: ADJUNCTS / SEDATIVES\n"
            "MIDAZOLAM (см. neo-midazolam):\n"
            "- IV bolus 0.05-0.15 мг/кг slow push (procedural sedation)\n"
            "- IV continuous 0.06-0.4 мг/кг/ч\n"
            "- ⚠️ Anand 2004: prophylactic у preterm — adverse neurodev outcomes\n"
            "- NOT first-line для analgesia (no analgesic effect)\n\n"
            "CLONIDINE (см. neo-clonidine):\n"
            "- Sedation infusion 0.5-2 мкг/кг/ч (opioid-sparing)\n"
            "- α2-agonist — autonomic stabilizer\n\n"
            "PROCEDURE-SPECIFIC RECOMMENDATIONS:\n\n"
            "HEEL PRICK:\n"
            "- Sucrose 24 % + pacifier\n"
            "- Skin-to-skin\n"
            "- Sterile lancet\n\n"
            "VENIPUNCTURE / IV INSERTION:\n"
            "- EMLA 60 мин (если planned)\n"
            "- Sucrose + sucking\n"
            "- Containment\n\n"
            "LUMBAR PUNCTURE:\n"
            "- EMLA + lidocaine subcut\n"
            "- Sucrose + sucking\n"
            "- Optional sedation (midazolam 0.1 мг/кг IN если significant)\n\n"
            "CHEST TUBE:\n"
            "- Morphine 0.1 мг/кг IV pre + lidocaine local\n"
            "- Continuous opioid post-procedure\n\n"
            "INTUBATION (PRE-MEDICATION):\n"
            "- Atropine 0.02 мг/кг IV (vagolytic)\n"
            "- Fentanyl 1-3 мкг/кг IV (analgesia)\n"
            "- Suxamethonium 1-2 мг/кг IV (paralytic, optional)\n"
            "- ИЛИ rocuronium 1 мг/кг (если sux contraindicated)\n\n"
            "MAJOR SURGERY:\n"
            "- Multimodal analgesia: opioid infusion + paracetamol + regional\n"
            "- Continuous EMR (electronic medical record) pain assessment\n\n"
            "TOLERANCE / WITHDRAWAL:\n"
            "- Tolerance после 3-7 дней опиоид infusion\n"
            "- Withdrawal при abrupt stop > 5 дней — taper 10-20 % q6-12h\n"
            "- Adjuvant: clonidine 1-2 мкг/кг q4-6h при autonomic withdrawal\n\n"
            "PRINCIPLES:\n"
            "1. Prevent pain when possible (cluster cares, minimize procedures)\n"
            "2. Assess routinely (q3-4h)\n"
            "3. Multi-modal approach (combine non-pharm + pharm)\n"
            "4. Document assessment + interventions + reassessment\n"
            "5. Family involvement (skin-to-skin, breastfeeding)"
        ),
        "references": [
            "AAP CFN 2016 — Pain Assessment & Management",
            "Lawrence J et al. NIPS 1993",
            "Stevens BJ et al. PIPP-R 2014",
            "Hummel P et al. N-PASS 2008",
            "Anand KJS NEOPAIN trial NEJM 2003",
            "Anand KJS et al. 2004 (preterm midazolam adverse outcomes)",
            "Cochrane Sucrose for procedural pain 2016",
            "ESC trial NEJM 2023",
            "КР МЗ РФ \"Боль у новорождённых\" (2024)",
        ],
    },
]


def main() -> int:
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {g["id"] for g in data["guidelines"]}
    added = 0
    for guideline in NEW_GUIDELINES:
        if guideline["id"] in existing_ids:
            print(f"Skip duplicate: {guideline['id']}")
            continue
        data["guidelines"].append(guideline)
        added += 1

    data["version"] = "1.3.0"
    data["lastUpdated"] = "2026-05-09"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Added {added} new comprehensive protocols")
    print(f"Total guidelines: {len(data['guidelines'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
