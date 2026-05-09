"""Add 7 remaining protocols to guidelines.json:
- Asphyxia criteria
- Prematurity classification
- ZVUR/IUGR classification
- RDS classification
- Cholestasis criteria
- HIE cooling eligibility (TH)
- Vaccination calendar reference
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-guidelines.json"

EXTRA_GUIDELINES = [
    {
        "id": "guide_birth_asphyxia_criteria_p21",
        "title_en": "Birth asphyxia diagnostic criteria (P21 ICD-10)",
        "title_ru": "Критерии асфиксии новорождённого (P21 МКБ-10)",
        "content": (
            "AAP/ACOG 2014 Joint Statement — критерии диагноза \"birth "
            "asphyxia\" требуют наличия ВСЕХ 4 критериев.\n\n"
            "4 КРИТЕРИЯ:\n"
            "1. Метаболический ацидоз пуповинной артерии: pH < 7.0 ИЛИ "
            "BE ≥ -12 ммоль/л\n"
            "2. Apgar 0-3 на 5-й или 10-й минуте\n"
            "3. Клинические признаки neonatal encephalopathy "
            "(Sarnat I-III: tone abnormalities, judorги, lethargy)\n"
            "4. Multi-organ dysfunction:\n"
            "   - Renal: ОПН, ↑ Cr, oliguria\n"
            "   - Кардио: ↑ troponin, hypotension, ↓ contractility\n"
            "   - Liver: ↑ AST / ALT\n"
            "   - Hematologic: thrombocytopenia, DIC\n"
            "   - GI: NEC\n\n"
            "МКБ-10 КОДЫ:\n"
            "- P21.0 Severe birth asphyxia: pH < 7.0 + Apgar 0-3 + clinical "
            "encephalopathy (≥ 3 critirium)\n"
            "- P21.1 Mild/moderate birth asphyxia (1-2 critirium)\n"
            "- P21.9 Unspecified\n\n"
            "P21.0 (severe) — критерий для therapeutic hypothermia (TH).\n\n"
            "DIFFERENTIAL DIAGNOSIS encephalopathy:\n"
            "- HIE: cord acidosis + Apgar low + multi-organ\n"
            "- Stroke: focal seizures, MRI focal lesion\n"
            "- Infection: fever, sepsis markers, CSF\n"
            "- IEM: familial history, specific labs\n"
            "- Congenital malformation: imaging, dysmorphic features\n"
            "- Maternal drugs: history (anesthesia, opioids)\n\n"
            "APGAR PITFALLS:\n"
            "- Не для preterm (часто low independently of asphyxia)\n"
            "- Maternal anesthesia / opioids → low Apgar без asphyxia\n"
            "- Congenital malformations → low Apgar\n"
            "- Используется как retrospective marker, не triage tool"
        ),
        "references": [
            "AAP/ACOG 2014 Joint Statement: Neonatal Encephalopathy and Neurologic Outcome",
            "ACOG Committee Opinion 348 (2006, reaff 2017): Definition of Term Asphyxia",
            "WHO ICD-10 P21: Birth asphyxia",
            "КР МЗ РФ \"Гипоксически-ишемическая энцефалопатия\" (2024)",
            "NICHD / TOBY UK / SIBEN cooling criteria",
        ],
    },
    {
        "id": "guide_prematurity_classification",
        "title_en": "Prematurity classification (GA + birth weight)",
        "title_ru": "Классификация недоношенности (GA + birth weight)",
        "content": (
            "Унифицированная классификация недоношенности по WHO + AAP + "
            "КР МЗ РФ, объединяющая GA и birth weight.\n\n"
            "GA-BASED CLASSIFICATION:\n"
            "- Extremely preterm: < 28+0 нед\n"
            "- Very preterm: 28-31+6 нед\n"
            "- Moderate preterm: 32-33+6 нед\n"
            "- Late preterm: 34-36+6 нед\n"
            "- Term: 37-41+6 нед\n"
            "- Post-term: ≥ 42+0 нед\n\n"
            "WEIGHT-BASED CLASSIFICATION:\n"
            "- ELBW (extremely low): < 1000 г\n"
            "- VLBW (very low): 1000-1499 г\n"
            "- LBW (low): 1500-2499 г\n"
            "- Normal: 2500-3999 г\n"
            "- Macrosomia: ≥ 4000 г\n\n"
            "MORTALITY / OUTCOMES BY GA:\n"
            "- < 24 нед: Mortality 50-90 %, CP/cognitive 30-50 % survivors\n"
            "- 24-25 нед: Mortality 30-50 %, CP 25-40 %\n"
            "- 26-27 нед: Mortality 10-20 %, CP 15-25 %\n"
            "- 28-32 нед: Mortality 5-10 %, CP 5-15 %\n"
            "- 33-36 нед: Mortality 1-3 %, CP 1.5-2× term\n"
            "- 37-41 нед: Mortality < 1 %, CP baseline\n\n"
            "ANTICIPATORY CARE:\n\n"
            "< 28 нед / ELBW: NICU level III, neonatologist immediate; "
            "surfactant + LISA early; UVC + UAC; thermal management; "
            "caffeine universal; TPN ASAP; imaging screening (head US, "
            "echo, ROP).\n\n"
            "28-33 нед / VLBW: NICU; surfactant if RDS; caffeine if < 32 "
            "нед; vit K 0.5 мг IM; empiric abx if EOS suspected.\n\n"
            "34-36 нед / LBW: палата интенсивной терапии or step-down; "
            "late preterm pitfalls (гипогликемия, гипотермия, hyperbili, "
            "RDS); 48-72 ч observation в роддоме.\n\n"
            "Term + normal: routine ward, kangaroo, breastfeeding, vit K "
            "1 мг IM.\n\n"
            "ANTENATAL INTERVENTIONS:\n"
            "- Betamethasone 12 мг × 2 IM: ↓ RDS, IVH, NEC, mortality 30-50 %\n"
            "- Magnesium sulfate: neuroprotection (snijaeт CP riski)\n"
            "- Tocolytics: buy 24-48 ч for steroids\n"
            "- Antibiotics (PROM): ↓ neonatal sepsis"
        ),
        "references": [
            "WHO ICD-11 P07 (preterm + LBW)",
            "AAP / Engle WA 2009 — Late preterm definition",
            "КР МЗ РФ \"Преждевременные роды\" / \"Недоношенность\" (2024)",
            "Cochrane antenatal corticosteroids",
            "NICE NG201 — Preterm labour and birth",
        ],
    },
    {
        "id": "guide_iugr_sga_aga_lga_classification",
        "title_en": "IUGR / SGA / AGA / LGA classification",
        "title_ru": "ЗВУР / SGA / AGA / LGA классификация",
        "content": (
            "Классификация intrauterine growth restriction (ЗВУР, IUGR) и "
            "перцентилей массы для GA по Fenton 2025 (preterm) или Olsen "
            "2010 / Intergrowth-21st (term).\n\n"
            "КАТЕГОРИИ:\n"
            "- LGA (large for GA): > 90-й перцентиль — гипогликемия, birth "
            "trauma, IDM cardiomyopathy\n"
            "- AGA (appropriate for GA): 10-90-й перцентиль — норма\n"
            "- SGA mild (small for GA): 3-9-й перцентиль — placental insuff, "
            "asymmetric IUGR\n"
            "- SGA severe: < 3-й перцентиль — chromosomal/infect, symmetric "
            "IUGR\n\n"
            "SYMMETRIC vs ASYMMETRIC IUGR:\n\n"
            "SYMMETRIC (early onset, 1-2 trimester):\n"
            "- ↓ Height + weight + head circumference (proportional)\n"
            "- Causes: chromosomal (trisomy 13, 18, 21, Turner), TORCH "
            "(CMV, toxoplasma, rubella, syphilis), maternal severe "
            "malnutrition, alcohol/smoking/drugs, genetic syndromes\n"
            "- Prognosis: worse\n\n"
            "ASYMMETRIC (late onset, 3 trimester):\n"
            "- Head sparing; ↓ weight + abdominal circumference\n"
            "- Causes: placental insufficiency (preeclampsia, hypertension), "
            "maternal vascular disease, multifetal pregnancy, late maternal "
            "nutrition issues\n"
            "- Prognosis: better, often catches up\n\n"
            "DIAGNOSTIC WORKUP (SGA severe < 3-й перцентиль):\n"
            "- Chromosomal: microarray (replaces karyotype если negative U/S)\n"
            "- TORCH: CMV PCR (urine), syphilis serology, toxoplasma IgM, "
            "HIV, hepatitis\n"
            "- Imaging: head U/S (CMV calcifications), echo (CHD)\n"
            "- Metabolic: thyroid, IGF-1 levels\n"
            "- Family: parental measurements (constitutional vs IUGR)\n\n"
            "CLINICAL MANAGEMENT:\n\n"
            "LGA: glucose monitoring (q30-60 мин × 4-12 ч), birth trauma "
            "assessment (ключица, brachial plexus, hum head), maternal "
            "diabetes evaluation, echo если IDM или sympotomatic.\n\n"
            "SGA mild (asymmetric): glucose monitoring q30 мин × 4 ч then "
            "q4h × 24-48 ч; polyethylene wrap, cap (thermal); polycythemia "
            "screen (Hct ≥ 65 % → partial exchange); adequate feeding for "
            "catch-up.\n\n"
            "SGA severe: all above PLUS workup chromosomal + infection, "
            "brain imaging, cardio assessment, TPN if energy intake "
            "inadequate, multidisciplinary team, family counselling.\n\n"
            "LONG-TERM OUTCOMES:\n"
            "- LGA: ↑ risk type 2 DM\n"
            "- SGA mild: + 2-3 % neurodev impairment, mostly catches up\n"
            "- SGA severe: + 10-25 % NDI, incomplete catch-up, ↑ adult "
            "metabolic risk (DM, HTN)"
        ),
        "references": [
            "ACOG Committee Opinion 800 (2020) — Fetal Growth Restriction",
            "WHO ICD-11 P05 (Slow fetal growth)",
            "Fenton 2025 (Pediatrics 155:e2024069896)",
            "Olsen 2010",
            "Intergrowth-21st (intergrowth21.com)",
            "КР МЗ РФ \"Задержка роста плода / новорождённого\" (2024)",
        ],
    },
    {
        "id": "guide_rds_classification_severity",
        "title_en": "RDS classification (X-ray + FiO₂)",
        "title_ru": "Классификация RDS по тяжести (X-ray + FiO₂)",
        "content": (
            "Радиологическая + клиническая классификация respiratory "
            "distress syndrome в 4 степени тяжести (КР МЗ РФ + Avery + "
            "European Consensus 2022).\n\n"
            "РАДИОЛОГИЧЕСКИЕ СТЕПЕНИ:\n\n"
            "I (mild):\n"
            "- X-ray: слабый ретикулогранулярный pattern, slight ↓ "
            "aeration\n"
            "- Клиника: FiO₂ 22-30 %\n"
            "- Тактика: spontaneous breathing + ↑ FiO₂; CPAP if needed\n\n"
            "II (moderate):\n"
            "- X-ray: diffuse reticulogranular + air bronchograms\n"
            "- Клиника: FiO₂ 31-50 %, CPAP\n"
            "- Тактика: CPAP/pNCPAP (PEEP 5-7); surfactant если FiO₂ ≥ 30 "
            "% persistent (LISA/INSURE preferred)\n\n"
            "III (severe):\n"
            "- X-ray: confluent opacification + prominent air bronchograms\n"
            "- Клиника: FiO₂ 51-80 %, MV/surfactant\n"
            "- Тактика: MV + surfactant 100-200 мг/кг ASAP; repeat if FiO₂ "
            "≥ 30 % через 6-12 ч; antibiotics empiric до исключения sepsis\n\n"
            "IV (very severe):\n"
            "- X-ray: \"white lung\" — total opacification, heart silhouette "
            "не видна\n"
            "- Клиника: FiO₂ > 80 %\n"
            "- Тактика: MV + multiple surfactant doses + advanced vent; HFOV "
            "если refractory; iNO если PPHN; hydrocortisone 1 мг/кг q8h "
            "рассмотреть; inotropes; ECMO consult (OI ≥ 40)\n\n"
            "EUROPEAN CONSENSUS 2022 (Sweet et al.):\n"
            "1. Antenatal corticosteroids — betamethasone × 2 за 24-48 ч до "
            "родов\n"
            "2. Magnesium sulfate antepartum < 32 нед — neuroprotection\n"
            "3. Delayed cord clamping ≥ 60 sec\n"
            "4. CPAP first при стабильности (≥ 26 нед)\n"
            "5. LISA preferred для GA ≥ 26 нед on CPAP\n"
            "6. Surfactant timing: ASAP после diagnosis (early > late)\n"
            "7. Permissive hypercapnia — PaCO₂ 45-55, pH ≥ 7.25\n\n"
            "DIFFERENTIAL ДИАГНОЗ \"white lung\":\n"
            "- RDS: onset 1-4 ч, preterm, surfactant deficiency\n"
            "- TTN: term/late preterm, resolves 24-72 ч\n"
            "- Congenital pneumonia: early onset, sepsis markers\n"
            "- MAS: term, meconium-stained, post-term\n"
            "- CDH: polyhydramnios, scaphoid abdomen\n"
            "- PDA flooding: late presentation, murmur\n"
            "- Air leak (PIE): cystic appearance, MV history\n\n"
            "RISK FACTORS for severe RDS (OR):\n"
            "- GA < 28 нед: 5-10×\n"
            "- C-section без labor: 1.5-2×\n"
            "- Maternal diabetes (GDM): 1.5-2×\n"
            "- Family history: 1.3-1.5×\n"
            "- Male sex: 1.3-1.5×"
        ),
        "references": [
            "КР МЗ РФ \"Респираторный дистресс синдром у новорождённого\" (2024)",
            "Sweet DG et al. European Consensus 2022 (Neonatology 2023;120:3)",
            "Avery's Diseases of the Newborn 11th ed.",
            "Polin RA, AAP COFN 2014 — Surfactant administration",
            "Cochrane Surfactant Reviews 2018-2020",
        ],
    },
    {
        "id": "guide_neonatal_cholestasis_workup",
        "title_en": "Neonatal cholestasis — diagnostic criteria and workup",
        "title_ru": "Холестаз у новорождённого — критерии и workup",
        "content": (
            "Cholestasis (conjugated hyperbilirubinemia) у н/р — pathologic, "
            "требует workup. Biliary atresia — most urgent diagnosis "
            "(Kasai surgery в 30-60 d критично).\n\n"
            "DEFINITION:\n"
            "- Total bilirubin ≤ 5 мг/дл: conjugated > 1.0 мг/дл (17 "
            "мкмоль/л)\n"
            "- Total bilirubin > 5 мг/дл: conjugated > 20 % total\n\n"
            "SEVERITY BANDS (мг/дл conjugated):\n"
            "- < 1.0: No cholestasis\n"
            "- 1.0-2.0: Mild\n"
            "- 2.0-5.0: Moderate\n"
            "- > 5.0: Severe\n\n"
            "CAUSES (по frequency):\n"
            "1. Biliary Atresia (most urgent — Kasai в 30-60 d)\n"
            "2. Idiopathic neonatal hepatitis\n"
            "3. TPN-associated cholestasis\n"
            "4. Cytomegalovirus (CMV) — most common congenital infection\n"
            "5. α-1 antitrypsin deficiency\n"
            "6. Galactosemia (NEONATAL EMERGENCY — STOP lactose immediately)\n"
            "7. Hypothyroidism / hypopituitarism\n"
            "8. Bile acid synthesis defects (PFIC)\n"
            "9. Cystic fibrosis\n"
            "10. Sepsis (endotoxin-mediated)\n\n"
            "WORKUP при cholestasis:\n\n"
            "INITIAL LABS:\n"
            "- LFTs: AST, ALT, GGT, alkaline phosphatase, total + conjugated "
            "bilirubin\n"
            "- INR/PT (vit K-dependent factors)\n"
            "- Albumin, total protein\n"
            "- Glucose, ammonia\n"
            "- TSH, free T4\n"
            "- α-1 antitrypsin level + phenotype\n"
            "- Galactose-1-phosphate (urine reducing substances)\n"
            "- Bile acids (urine + serum)\n"
            "- CMV PCR (urine + blood)\n"
            "- Newborn screening review\n\n"
            "IMAGING:\n"
            "- Abdominal U/S (liver, gallbladder, biliary tree)\n"
            "- HIDA scan (cholescintigraphy — hepatic excretion assessment)\n"
            "- MR cholangiography (если equivocal)\n"
            "- Liver biopsy (если diagnosis unclear)\n\n"
            "BILIARY ATRESIA — special considerations:\n"
            "- Kasai portoenterostomy в 30-60 d жизни\n"
            "- 10-yr native liver survival:\n"
            "  - Kasai 30-60 d: 30-50 %\n"
            "  - Kasai > 90 d: 5-10 %\n"
            "- Eventually liver transplant у many\n\n"
            "Clinical features BA:\n"
            "- Jaundice persistent > 2 нед\n"
            "- Acholic / pale stools (VERY suspicious)\n"
            "- Dark urine (bilirubinuria)\n"
            "- Hepatomegaly\n"
            "- Failure to thrive\n\n"
            "TPN-ASSOCIATED CHOLESTASIS:\n"
            "Risk factors: long-term TPN (> 14-30 d), preterm < 32 нед, "
            "sepsis, lack enteral feeding.\n"
            "Management:\n"
            "- Cycle PN if possible (12-16 ч infusion)\n"
            "- Lipid reduction to 1-2 г/кг/сут\n"
            "- Fish oil emulsion (Omegaven, SMOFlipid)\n"
            "- Trophic feeding ASAP\n"
            "- Ursodeoxycholic acid 10-15 мг/кг q12h PO\n\n"
            "GALACTOSEMIA — emergency:\n"
            "- Urinary reducing substances positive\n"
            "- ↑ Direct bilirubin\n"
            "- Hypoglycemia\n"
            "- Vomiting / failure to thrive\n"
            "- Treatment: STOP lactose / breast milk immediately; galactose-"
            "free formula (soy or hydrolyzed); lifelong dietary restriction\n\n"
            "VIT K administration в cholestasis:\n"
            "- Fat-soluble vitamin malabsorption ↑\n"
            "- Vit K 1 мг IM/IV q24h × 3 days (correction coagulopathy)\n"
            "- Vit ADE supplementation chronic"
        ),
        "references": [
            "Fawaz R et al. NASPGHAN/ESPGHAN 2017 Guideline (JPGN 64:154)",
            "AAP CFN — Cholestasis in newborns",
            "КР МЗ РФ \"Холестаз новорождённого / Билиарная атрезия\" (2024)",
        ],
    },
    {
        "id": "guide_therapeutic_hypothermia_hie_eligibility",
        "title_en": "Therapeutic hypothermia (TH) eligibility for HIE",
        "title_ru": "Therapeutic hypothermia (TH) — критерии охлаждения при HIE",
        "content": (
            "NICHD/TOBY/SIBEN criteria для therapeutic hypothermia (TH) у "
            "term/late preterm с HIE. Окно ≤ 6 ч от рождения.\n\n"
            "ELIGIBILITY — все 3 критерия должны быть met:\n\n"
            "CRITERION A (Physiologic):\n"
            "Любое из:\n"
            "- Cord pH ≤ 7.00 (артериальная или венозная)\n"
            "- Cord BE ≥ -12 ммоль/л\n"
            "- Apgar ≤ 5 на 10-й минуте\n"
            "- Continued resuscitation > 10 мин (PPV/intubation)\n\n"
            "CRITERION B (Perinatal event):\n"
            "Acute perinatal event консistent с asphyxia:\n"
            "- Sentinel event (ruptura uteri, abruption, cord prolapse, fetal "
            "exsanguination)\n"
            "- Severe heart rate abnormality during labor\n"
            "- Severe maternal/fetal compromise\n\n"
            "CRITERION C (Clinical):\n"
            "Moderate-severe encephalopathy (Sarnat II-III):\n"
            "- Altered consciousness (lethargy, stupor, coma)\n"
            "- Abnormal tone (hypotonia, hypertonia)\n"
            "- Abnormal reflexes (Moro, sucking, grasp diminished/absent)\n"
            "- Autonomic dysfunction (pupils, HR variability)\n"
            "- Seizures (если present)\n"
            "ИЛИ aEEG / EEG abnormalities (moderate-severe encephalopathy "
            "pattern)\n\n"
            "TIMING:\n"
            "- ≤ 6 ч от рождения — start cooling\n"
            "- Beyond 6 ч — efficacy questionable; consider если still mild "
            "encephalopathy\n\n"
            "CONTRAINDICATIONS (absolute):\n"
            "- GA < 36 нед (TOBY) или < 35 нед (NICHD)\n"
            "- Birth weight < 1800 г\n"
            "- Major chromosomal anomaly или genetic syndrome\n"
            "- Major congenital anomaly incompatible с life\n"
            "- Active major bleeding\n"
            "- Severe head trauma (intra-cranial hemorrhage)\n\n"
            "PROTOCOL:\n"
            "- Target: rectal/esophageal temperature 33.0-34.0 °C\n"
            "- Duration: 72 ч cooling\n"
            "- Rewarming: gradual 0.5 °C/ч до 36.5-37.5 °C\n"
            "- Continuous monitoring: HR, BP, SpO₂, temperature, EEG\n"
            "- Sedation: morphine 10-30 мкг/кг/ч (anti-shivering)\n"
            "- Anti-seizure: phenobarbital prn\n\n"
            "OUTCOMES (NICHD trial Shankaran 2005):\n"
            "- ↓ Death + disability composite outcome\n"
            "- NNT ~ 8 для prevention major adverse outcome\n"
            "- Best outcomes у moderate HIE (Sarnat II)\n"
            "- Severe HIE (Sarnat III): mortality 30-50 % даже с TH; major "
            "neurodev disability в survivors\n\n"
            "ADJUNCTS (under investigation):\n"
            "- Erythropoietin (NEAT trial pending)\n"
            "- Magnesium sulfate (limited evidence postnatal)\n"
            "- Allopurinol (xanthine oxidase inhibitor)\n"
            "- Melatonin (anti-oxidant)"
        ),
        "references": [
            "Shankaran S et al. NICHD trial NEJM 2005;353:1574",
            "Azzopardi DV et al. TOBY trial NEJM 2009;361:1349",
            "ILCOR / SIBEN consensus on neonatal HIE",
            "AAP COFN 2014 — Hypothermia and neonatal encephalopathy",
            "КР МЗ РФ \"Гипоксически-ишемическая энцефалопатия\" (2024)",
        ],
    },
    {
        "id": "guide_vaccination_calendar_neonatal",
        "title_en": "Vaccination calendar — newborn (RU/UZ/Intl)",
        "title_ru": "Календарь вакцинации (РФ / UZ / International)",
        "content": (
            "Календарь вакцинации новорождённого с разбивкой по регионам.\n\n"
            "ПЕРВЫЕ 24 ЧАСА ЖИЗНИ:\n"
            "- РФ (Приказ № 1122н): HepB-1 (рекомбинантная)\n"
            "- UZ (нацкалендарь): HepB-1\n"
            "- WHO: HepB birth dose всем newborns\n"
            "- US/CDC: HepB при рождении\n\n"
            "БЦЖ (3-7 ДНЕЙ ЖИЗНИ):\n"
            "- РФ: БЦЖ-М (или БЦЖ для контактов)\n"
            "- UZ: БЦЖ в роддоме перед выпиской\n"
            "- WHO: BCG единичная dose в endemic regions\n"
            "Противопоказания: ELBW < 2000 г, активные ID, мать с TB\n\n"
            "СХЕМА РФ (Приказ МЗ РФ № 1122н от 06.12.2021):\n"
            "- 24 ч: HepB-1\n"
            "- 3-7 d: БЦЖ-М\n"
            "- 1 мес: HepB-2\n"
            "- 2 мес: HepB-3 (риск-группа); ПКВ-1\n"
            "- 3 мес: DTP-1, IPV-1, ХИБ-1 (риск), ПКВ-1\n"
            "- 4.5 мес: DTP-2, IPV-2, ХИБ-2, ПКВ-2\n"
            "- 6 мес: DTP-3, IPV-3, HepB-4, OPV-1\n"
            "- 12 мес: MMR (КПК)\n"
            "- 15 мес: ПКВ revaccination\n"
            "- 18 мес: DTP-4, OPV-2, ХИБ revaccination\n"
            "- 20 мес: OPV-3\n\n"
            "СХЕМА UZ (нацкалендарь):\n"
            "- 24 ч: HepB-1\n"
            "- роддом: БЦЖ\n"
            "- 2 мес: Pentavalent (DTP-HepB-Hib) -1, OPV-1, PCV-1\n"
            "- 4 мес: Pentavalent-2, OPV-2, PCV-2\n"
            "- 6 мес: Pentavalent-3, OPV-3, PCV-3\n"
            "- 9-12 мес: MMR-1\n"
            "- 15 мес: MMR-2\n"
            "- 18 мес: DTP-4, OPV-4\n\n"
            "СХЕМА WHO/CDC:\n"
            "- Birth: HepB-1, BCG (endemic)\n"
            "- 2 мес: DTaP-1, IPV-1, HepB-2, Hib-1, PCV-1, Rotavirus-1\n"
            "- 4 мес: DTaP-2, IPV-2, Hib-2, PCV-2, Rotavirus-2\n"
            "- 6 мес: DTaP-3, HepB-3, Hib-3 (some), PCV-3, Rotavirus-3, "
            "Influenza (annual)\n"
            "- 12-15 мес: MMR-1, Varicella-1, Hib booster, PCV-4\n"
            "- 12-23 мес: HepA-1\n"
            "- 15-18 мес: DTaP-4\n\n"
            "SPECIAL CONSIDERATIONS:\n"
            "- Preterm: vaccinate по chronologic age (НЕ corrected)\n"
            "- ELBW < 2000 г: HepB 4-dose schedule (0, 1, 2, 6 мес) для "
            "better seroconversion\n"
            "- Immunocompromised: live vaccines contraindicated (MMR, "
            "varicella, BCG, oral polio)\n"
            "- IPV preferred over OPV first 3 doses\n"
            "- DTP: pertussis component — DTaP preferred современно\n"
            "- Influenza: annual ≥ 6 мес\n"
            "- RSV palivizumab (passive): preterm < 32 нед, BPD, CHD\n\n"
            "PERTUSSIS у newborn:\n"
            "- Severe disease (apnea, brady, mortality 1-3 % у < 3 мес)\n"
            "- Maternal Tdap pregnancy (27-36 нед) — passive protection × "
            "2-3 мес"
        ),
        "references": [
            "Приказ МЗ РФ № 1122н от 06.12.2021 (НКПП)",
            "UZ Min Health — gov.uz/ru/ssv",
            "WHO Immunization Schedule 2024",
            "CDC ACIP 2024",
            "AAP / WHO catch-up schedules",
            "КР МЗ РФ \"Иммунопрофилактика\" (2024)",
        ],
    },
]


def main() -> int:
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {g["id"] for g in data["guidelines"]}
    added: list[str] = []
    for guideline in EXTRA_GUIDELINES:
        if guideline["id"] in existing_ids:
            print(f"Skip duplicate: {guideline['title_en']}")
            continue
        data["guidelines"].append(guideline)
        added.append(guideline["title_ru"])

    data["version"] = "1.2.0"
    data["lastUpdated"] = "2026-05-09"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Added {len(added)} extra guidelines:")
    for t in added:
        print(f"  - {t}")
    print(f"Total guidelines: {len(data['guidelines'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
