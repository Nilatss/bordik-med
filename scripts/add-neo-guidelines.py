"""Add neonatology protocols (управление гипотермией, TOF spell, thermal,
extubation, feeding readiness, screenings) to public/neonatal-guidelines.json.

Run: python scripts/add-neo-guidelines.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-guidelines.json"

NEW_GUIDELINES = [
    {
        "id": "guide_tof_tet_spell_management",
        "title_en": "TOF tet spell (cyanotic spell) — step-wise management",
        "title_ru": "TOF тет-spell (cyanotic spell) — пошаговое управление",
        "content": (
            "Hypoxic tet spell — emergency у Tetralogy of Fallot или other "
            "right-to-left shunt CHD.\n\n"
            "Pathophysiology: stress ↑ catecholamines → ↑ infundibular "
            "obstruction + ↓ SVR → ↑ R→L shunt → severe hypoxemia.\n\n"
            "Triggers: crying, feeding, defecation, bath, awakening, "
            "anesthesia induction, fever.\n\n"
            "STEP-WISE LADDER:\n"
            "1. Knee-to-chest position (↑ SVR mechanically → ↓ R→L shunt)\n"
            "2. 100 % O₂ через face mask\n"
            "3. Calm infant (decrease catecholamine surge)\n"
            "4. Morphine 0.1-0.2 мг/кг IV/IM (sedation + ↓ infundibular spasm)\n"
            "5. Volume bolus 10-20 мл/кг NS IV (↑ preload)\n"
            "6. NaHCO₃ 1-2 мэкв/кг IV (correction acidosis при pH < 7.25)\n"
            "7. Phenylephrine 5-20 мкг/кг IV bolus → infusion 0.1-0.5 мкг/кг/мин "
            "(pure α1 → ↑ SVR)\n"
            "8. Esmolol 100-500 мкг/кг IV bolus → infusion 50-200 мкг/кг/мин "
            "(short β1-blocker → ↓ infundibular contractility)\n"
            "9. ECMO + emergency surgery (Blalock-Taussig shunt или full repair)\n\n"
            "AVOID: vasodilators (ACE-i, ARB), β2-agonists (albuterol — "
            "pulmonary vasodilation ↓ BF), inotropes alone, norepinephrine.\n\n"
            "Prevention: avoid triggers, treat fever aggressively, iron "
            "supplementation (anemia exacerbates), β-blockers (propranolol) "
            "chronic prophylaxis, schedule full repair."
        ),
        "references": [
            "AHA / AAP — Pediatric Heart Disease guidelines",
            "Park MK — Park's Pediatric Cardiology textbook",
            "Allen HD et al. — Moss & Adams' Heart Disease",
            "КР МЗ РФ \"ВПС у детей\" (2024)",
        ],
    },
    {
        "id": "guide_thermal_management_golden_hour",
        "title_en": "Thermal management — Golden Hour QI bundle",
        "title_ru": "Thermal management — Golden Hour QI bundle",
        "content": (
            "Golden hour thermal management critical для preterm и newborn "
            "outcomes. Hypothermia (< 36 °C) at admission ↑ mortality + IVH "
            "+ RDS у preterm.\n\n"
            "QI BUNDLE (gold standard):\n"
            "1. Operating room temp ≥ 25 °C (≥ 26 °C для < 32 нед)\n"
            "2. Servo-controlled radiant warmer + servo-controlled incubator\n"
            "3. Polyethylene wrap (для < 32 нед — БЕЗ drying first; vernix + "
            "влага сохраняют warmth)\n"
            "4. Chemical mattress (Transwarmer 40 °C)\n"
            "5. Cap (woolen или quilted) — heat loss через scalp ≈ 25 % у "
            "newborn\n"
            "6. Тёплые полотенца (для term)\n"
            "7. Кенгуру (skin-to-skin) если стабилен\n\n"
            "GOAL: Admission temp 36.5-37.5 °C\n\n"
            "HEAT LOSS MECHANISMS:\n"
            "- Evaporation 25-30 % (prevent: polyethylene wrap; dry term)\n"
            "- Radiation 25-35 % (prevent: radiant warmer, warm OR, cap)\n"
            "- Convection 15-20 % (prevent: warm OR, closed incubator)\n"
            "- Conduction 5-10 % (prevent: pre-warmed surfaces, chemical "
            "mattress)\n\n"
            "VLBW < 1500 г: inadvertent hypothermia 30-50 % при стандартной "
            "помощи; QI bundle снижает к < 5 %.\n\n"
            "HYPOTHERMIA CONSEQUENCES:\n"
            "- Mild (36.0-36.4 °C): cold stress, hypoglycemia, ↑ O₂ demand\n"
            "- Moderate (32-35.9 °C): bradycardia, ↓ surfactant, RDS "
            "worsening, hypoglycemia\n"
            "- Severe (< 32 °C): multi-organ dysfunction, DIC, ↑ mortality "
            "50 % per °C drop"
        ),
        "references": [
            "WHO Recommendations on Newborn Health (2017)",
            "NRP 8 ed. 2021 — Chapter 7 Thermal Management",
            "Helping Babies Survive (HBS) — Essential Care for Every Baby",
            "Cochrane Plastic wrap для prevention hypothermia 2010",
            "КР МЗ РФ \"Транспортировка и согревание н/р\" (2024)",
        ],
    },
    {
        "id": "guide_hypothermia_transport_management",
        "title_en": "Neonatal hypothermia management for transport",
        "title_ru": "Управление гипотермией у новорождённого при транспорте",
        "content": (
            "Классификация WHO (2017):\n"
            "- Норма: 36.5-37.5 °C\n"
            "- Холодовой стресс (mild): 36.0-36.4 °C\n"
            "- Умеренная гипотермия: 32.0-35.9 °C\n"
            "- Тяжёлая гипотермия: < 32.0 °C\n\n"
            "Бортовая (rectal) температура. Аксиллярная — 0.3-0.5 °C ниже.\n\n"
            "MANAGEMENT BY SEVERITY:\n\n"
            "MILD (cold stress 36.0-36.4 °C):\n"
            "- Сухие тёплые полотенца; cap для головы\n"
            "- Кенгуру (кожа-к-коже) с матерью если стабилен\n"
            "- Servo-controlled инкубатор\n"
            "- Контроль температуры q15-30 мин\n"
            "- Гликемия — гипогликемия часто сочетается\n"
            "- Без активного rewarming если только mild\n\n"
            "MODERATE (32-35.9 °C — активное согревание):\n"
            "- Полиэтиленовая обёртка (wrap) + cap (для < 32 нед — без сушки "
            "сначала)\n"
            "- Servo-controlled инкубатор max temp; air mode 38-39 °C\n"
            "- Тёплый матрас (radiant warmer + chemical mattress 38-40 °C)\n"
            "- Согревание скоростью 0.5 °C/ч (не быстрее — риск шока)\n"
            "- Тёплые внутривенные жидкости; глюкоза при гипогликемии\n"
            "- Мониторинг: ЧСС, RR, SpO₂, гликемия q30 мин\n\n"
            "SEVERE (< 32 °C — экстренная интенсивная терапия):\n"
            "- НЕМЕДЛЕННО: warm room, polyethylene wrap, cap, chemical "
            "mattress\n"
            "- Servo-controlled инкубатор max + radiant warmer\n"
            "- Тёплые IV жидкости (37 °C) — болюс 10-20 мл/кг при шоке\n"
            "- Согревание 0.5 °C/ч (агрессивное rewarming → cold shock)\n"
            "- Кардиомониторинг — высокий риск bradycardia, аритмий\n"
            "- Газы крови, лактат, гликемия — метаболический ацидоз ожидаем\n"
            "- Антибиотики (ампициллин + гентамицин) — sepsis в дифф. диагнозе\n"
            "- Coag panel — DIC возможен\n"
            "- Connect ECMO-центр / выезд бригады если ухудшается\n\n"
            "TRANSPORT (WHO HBB protocol):\n"
            "- Pre-transport температура: 36.5-37.5 °C\n"
            "- Servo-controlled transport инкубатор\n"
            "- Polyethylene wrap + chemical mattress + cap\n"
            "- Документация temp каждые 15-30 мин\n\n"
            "REWARMING SHOCK CAVEAT: rewarming быстрее 0.5 °C/ч может "
            "вызвать vasodilatation + гипотензию."
        ),
        "references": [
            "WHO Recommendations on Newborn Health (2017)",
            "WHO Pocket Book of Hospital Care for Children (2013)",
            "NRP 8 ed. 2021 — Chapter 7 Thermal Management",
            "КР МЗ РФ \"Гипотермия / Транспортировка н/р\" (2024)",
            "Helping Babies Survive — Essential Care for Every Baby",
        ],
    },
    {
        "id": "guide_extubation_readiness_assessment",
        "title_en": "Extubation readiness assessment (preterm)",
        "title_ru": "Оценка готовности к экстубации (preterm)",
        "content": (
            "Multi-factorial assessment перед extubation от mechanical "
            "ventilation. Failure rate без protocol: 30-40 % preterm < 28 "
            "нед PMA. С proper assessment + caffeine: ↓ до 10-20 %.\n\n"
            "6 CRITERIA:\n"
            "1. Adequate spontaneous respiratory effort (regular pattern, "
            "не agonal; RR в pre-extubation range 40-60 у preterm)\n"
            "2. Hemodynamic stability (no significant hypotension, off "
            "significant inotropes)\n"
            "3. FiO₂ ≤ 30 % с adequate oxygenation (SpO₂ ≥ 90-95 %)\n"
            "4. Minimal ventilator support (PEEP ≤ 5-7, PIP ≤ 16-18, "
            "rate ≤ 30)\n"
            "5. Caffeine therapy started (если PMA < 32 нед) — therapeutic "
            "level (5-25 мкг/мл если monitored)\n"
            "6. Spontaneous Breathing Trial (SBT) или CPAP trial successful "
            "(30-60 мин on minimum settings)\n\n"
            "SBT METHOD:\n"
            "- Wean ventilator к minimum (PEEP 5, PIP 14-16 или endotracheal "
            "CPAP, backup rate 5-10 или off)\n"
            "- Monitor × 30-60 мин: SpO₂ ≥ 90-95 %, HR/BP stable, no "
            "significant retractions/grunting/nasal flaring, PaCO₂ "
            "acceptable (< 65, pH > 7.25)\n"
            "- Если stable: proceed к extubation. Если deterioration: "
            "continue ventilator\n\n"
            "PRE-EXTUBATION:\n"
            "- Caffeine 20 мг/кг IV если не loading dose уже\n"
            "- Pre-oxygenate FiO₂ + 10 % × 2 мин\n"
            "- Suction airway\n"
            "- Prepare CPAP / NIV at bedside\n\n"
            "EXTUBATION:\n"
            "- Brief positive pressure breath\n"
            "- Remove ETT during expiration\n"
            "- Immediate transition к CPAP 5-7 cmH₂O или NIV\n\n"
            "POST-EXTUBATION:\n"
            "- Continue caffeine\n"
            "- Watch для apnea/brady/desat × 24 ч closely\n"
            "- Reintubation criteria: respiratory failure, persistent severe "
            "apnea > 30 sec frequent, FiO₂ > 60 %, hemodynamic instability, "
            "severe acidosis (pH < 7.20)\n"
            "- Successful extubation: ≥ 24 ч без reintubation"
        ),
        "references": [
            "Sant'Anna GM et al. — neonatal extubation review",
            "Manley BJ et al. — extubation predictors trial",
            "Schmidt B et al. CAP trial NEJM 2007",
            "Polin RA et al. — preterm respiratory management",
            "КР МЗ РФ \"ИВЛ у новорождённых\" (2024)",
        ],
    },
    {
        "id": "guide_oral_feeding_readiness_preterm",
        "title_en": "Oral feeding readiness (preterm)",
        "title_ru": "Готовность к oral feeding у preterm",
        "content": (
            "Assessment готовности preterm newborn к oral feeding (breast / "
            "bottle). Important transition step для discharge planning.\n\n"
            "5-CRITERIA ASSESSMENT (PIOFRAS-style):\n\n"
            "1. PHYSIOLOGIC STABILITY\n"
            "   - HR stable (110-160 awake)\n"
            "   - RR < 60\n"
            "   - SpO₂ ≥ 92 % (или target range)\n"
            "   - Temperature stable\n"
            "   - ≥ 30 мин стабильности перед feeding\n\n"
            "2. BEHAVIORAL STATE\n"
            "   - Alert / quiet wakefulness\n"
            "   - Не lethargic, не very fussy\n"
            "   - Best state: quiet alert\n\n"
            "3. ORAL MOTOR CUES\n"
            "   - Rooting reflex (turn toward stimulus к щеке)\n"
            "   - Tongue protrusion\n"
            "   - Bringing hand к рту\n"
            "   - Lip closure / sucking on pacifier\n\n"
            "4. SUCKING PATTERN\n"
            "   - Rhythmic (1 sec on / 1 sec off)\n"
            "   - Sustained (≥ 30 sec without pause)\n"
            "   - Coordinated (synchronized с swallow)\n\n"
            "5. SAFE SWALLOW\n"
            "   - No apnea during feeds\n"
            "   - No bradycardia (HR drop > 20 % from baseline)\n"
            "   - No desaturation (SpO₂ drop > 5 %)\n"
            "   - Coordinated suck-swallow-breathe\n\n"
            "PMA-BASED PROGRESSION:\n"
            "- < 32 нед: minimal oral cues; gavage feeding\n"
            "- 32-34 нед: developing cues; non-nutritive sucking\n"
            "- 34-36 нед: increasing capacity; some oral feeds\n"
            "- 36-38 нед: full oral feeds achievable\n"
            "- ≥ 38 нед: coordinated breast/bottle feeds\n\n"
            "TRANSITION STRATEGY:\n"
            "Phase 1 (initial trials): 1-2 short oral attempts per day "
            "(5-10 мин) paired с gavage; pacing с pauses; head elevated "
            "position\n"
            "Phase 2 (gradual): increase frequency; target full oral by Day "
            "5-10\n"
            "Phase 3 (full oral): > 80 % volumes oral consistently; weight "
            "gain ≥ 15-30 г/сут\n\n"
            "ADJUNCTS: skin-to-skin (kangaroo), non-nutritive sucking "
            "(pacifier), specialized nipples (slow flow для preterm), speech/"
            "occupational therapy."
        ),
        "references": [
            "Lau C et al. — Oral feeding readiness in premature infants",
            "Howe TH et al. — PIOFRAS scale",
            "AAP COFN 2008 — Hospital Discharge High-Risk Neonate",
            "Engle WA AAP COFN 2007 — Late preterm",
            "КР МЗ РФ \"Питание / Вскармливание н/р\" (2024)",
        ],
    },
    {
        "id": "guide_newborn_metabolic_screening",
        "title_en": "Newborn metabolic screening (timing + protocol)",
        "title_ru": "Newborn metabolic screening (timing + protocol)",
        "content": (
            "Heel-prick blood spot screening для metabolic disorders, "
            "congenital hypothyroidism, hemoglobinopathies, infections.\n\n"
            "OPTIMAL TIMING:\n"
            "- < 24 ч: rано — false negatives PKU/galactosemia\n"
            "- 24-48 ч: acceptable\n"
            "- 48-72 ч: OPTIMAL (после ≥ 24 ч feeds)\n"
            "- > 72 ч: late — diagnosis delay\n"
            "- > 7 дней: critical delay для catastrophic conditions\n\n"
            "PRE-CONDITIONS:\n"
            "- Adequate feeding ≥ 24 ч (для PKU, galactosemia)\n"
            "- Преждевременно (< 32 нед): re-sample в 28 d жизни\n"
            "- Blood transfusion / TPN: re-sample 60-120 d after\n\n"
            "РФ РАСШИРЕННЫЙ SCREENING (с 2023, 36 заболеваний):\n"
            "5 original (с 2007): PKU, congenital hypothyroidism, CAH, "
            "galactosemia, cystic fibrosis.\n"
            "Extended (2023+): MSUD, MCAD, LCHAD/VLCAD, organic acidemias "
            "(PA, MMA, IVA), tyrosinemia I/II/III, citrullinemia, biotinidase "
            "deficiency, SCID, lysosomal disorders, и др.\n\n"
            "CRITICAL CONDITIONS:\n"
            "- PKU: severe CI без treatment; treatment by 3 нед — normal IQ\n"
            "- Galactosemia: liver failure, sepsis, death; STOP lactose "
            "immediately если suspected\n"
            "- CH: severe CI; start L-thyroxine by 2 нед\n"
            "- CAH: salt-wasting crisis; cortisol + fludrocortisone immediate\n"
            "- MCAD: sudden death; avoid fasting; emergency glucose\n"
            "- Biotinidase: skin/neuro/deafness; biotin 5-20 мг/сут\n"
            "- MSUD: toxic encephalopathy; BCAA-restricted diet, dialysis if "
            "acute\n\n"
            "SAMPLE TECHNIQUE:\n"
            "1. Pre-warm heel (warm towel × 3-5 мин или heel warmer)\n"
            "2. Position: infant supine, heel down\n"
            "3. Site: lateral or medial aspect of plantar heel (NOT center "
            "— bone)\n"
            "4. Sterile lancet (depth 1-2 мм maximum)\n"
            "5. First drop wiped, allow free flow\n"
            "6. 5 separate spots on filter paper (Guthrie card)\n"
            "7. Air dry 4 ч horizontal\n"
            "8. Documentation: demographic info, time of birth, time of "
            "sample, feeding status\n\n"
            "POSITIVE SCREEN: IMMEDIATE confirmatory testing + family "
            "contact + start treatment IF confirmed."
        ),
        "references": [
            "РФ Приказ МЗ РФ \"Расширенный неонатальный скрининг\" (2023, 2024)",
            "US Recommended Uniform Screening Panel (RUSP)",
            "UK NHS Newborn Blood Spot Screening",
            "WHO 2007 Newborn Screening principles",
            "AAP / ACMG Newborn Screening guidelines",
        ],
    },
    {
        "id": "guide_cchd_pulse_oximetry_screening",
        "title_en": "CCHD pulse oximetry screening (newborn)",
        "title_ru": "CCHD pulse oximetry screening (newborn)",
        "content": (
            "Newborn pulse oximetry screening — standard of care для critical "
            "congenital heart disease (CCHD).\n\n"
            "TIMING: 24-48 ч жизни (после first feed). Earlier = transition "
            "false positives.\n\n"
            "SITES:\n"
            "- Pre-ductal: right hand\n"
            "- Post-ductal: foot\n\n"
            "INTERPRETATION:\n"
            "- PASS: SpO₂ ≥ 95 % AND difference < 3 %\n"
            "- INDETERMINATE: SpO₂ 90-94 % both ИЛИ diff 3-5 % — repeat × 3 "
            "(15 мин interval)\n"
            "- FAIL: SpO₂ < 90 % ANY extremity ИЛИ persistent abnormalities "
            "× 3 attempts → echocardiography обязательно\n\n"
            "DETECTED CCHDs (most common):\n"
            "- HLHS (1:5,000)\n"
            "- TGA (1:5,000)\n"
            "- TOF severe (1:3,500)\n"
            "- TAPVR (1:15,000)\n"
            "- Tricuspid atresia (1:10,000)\n"
            "- Pulmonary atresia (1:10,000)\n"
            "- Truncus arteriosus (1:10,000)\n"
            "Total CCHD prevalence: 1.5-3 per 1,000 births.\n\n"
            "DETECTION PERFORMANCE:\n"
            "- Sensitivity: 75-90 % для CCHD\n"
            "- Specificity: 99 %\n"
            "- False positive rate: 0.5-1 %\n"
            "- Combined с physical exam + family history → ~ 8-10 cases per "
            "10,000\n\n"
            "FAILED SCREEN → ACTIONS:\n"
            "1. Echocardiography evaluation (anatomy, function, ductal "
            "status, coronary anatomy, branch PA, aortic arch)\n"
            "2. If confirmed duct-dependent: start PGE1 0.05 мкг/кг/мин IV "
            "continuous\n"
            "3. Pediatric cardiology consult\n"
            "4. Transport к cardiac surgical center\n"
            "5. NPO until decision о feeding strategy\n\n"
            "PITFALLS:\n"
            "- TGA: pre-ductal SpO₂ может быть higher than post-ductal "
            "(transposition physiology) — standard screen может miss\n"
            "- Coarctation: pre-ductal adequate via L→R ductal shunt; symptoms "
            "develop после ductal closure (1-2 нед)\n"
            "- Severe lung disease: false positive rate higher"
        ),
        "references": [
            "AAP/AHA 2018 (Pediatrics 142:e20183064)",
            "Mahle WT et al. 2011 endorsement",
            "Wright J et al. — clinical implementation studies",
            "КР МЗ РФ \"Скрининг ВПС у н/р\" (2024)",
        ],
    },
    {
        "id": "guide_rop_screening_timing",
        "title_en": "ROP screening — timing of first examination",
        "title_ru": "ROP скрининг — сроки первого осмотра",
        "content": (
            "Расчёт когда начинать ROP (retinopathy of prematurity) "
            "screening по AAP/AAO/AAPOS 2018 guidelines.\n\n"
            "CRITERIA FOR SCREENING:\n"
            "- GA ≤ 30+6 нед при рождении ИЛИ\n"
            "- Birth weight ≤ 1500 г ИЛИ\n"
            "- GA 31-32 нед или BW 1500-2000 г с unstable clinical course\n\n"
            "TIMING OF FIRST EXAMINATION:\n"
            "- GA ≤ 27 нед: 31 нед PMA\n"
            "- GA 28-31 нед: 4 нед chronologic age\n"
            "- GA 32 нед: 4 нед chronologic age\n"
            "Whichever comes LATER (PMA-based or chronologic-based).\n\n"
            "SUBSEQUENT EXAMINATIONS — frequency:\n"
            "- Zone 1, stage 1-2: q1 нед\n"
            "- Zone 1, stage 3 ± plus: TREATMENT в 72 ч\n"
            "- Zone 2, stage 1-2: q2 нед\n"
            "- Zone 2, stage 3 + plus: TREATMENT в 72 ч\n"
            "- Zone 3: q2-3 нед\n"
            "- Mature retina: discharge с eye exam follow-up\n"
            "- AROP (aggressive posterior): TREATMENT в 72 ч\n\n"
            "MYDRIATIC PROTOCOL (30 мин до exam):\n"
            "- Cyclopentolate 0.2 % — 1 капля в каждый глаз\n"
            "- Phenylephrine 1 % — 1 капля в каждый глаз\n"
            "- Не tropicamide alone (insufficient mydriasis у dark iris)\n"
            "- Caution: systemic effects (cyclopentolate apnea, phenylephrine "
            "HTN)\n\n"
            "TREATMENT THRESHOLDS (Type 1 ROP — ETROP):\n"
            "Treatment в 72 ч если:\n"
            "- Zone 1, any stage с plus disease\n"
            "- Zone 1 stage 3 без plus\n"
            "- Zone 2 stage 2-3 с plus disease\n"
            "- AROP\n\n"
            "TREATMENT OPTIONS:\n"
            "- Laser photocoagulation (gold standard)\n"
            "- Anti-VEGF (bevacizumab, ranibizumab) — Zone 1, AROP\n"
            "- Vitrectomy (Stage 4-5 retinal detachment)\n\n"
            "LONG-TERM CONSEQUENCES:\n"
            "- Myopia (most common)\n"
            "- Strabismus\n"
            "- Glaucoma (rare)\n"
            "- Retinal detachment (severe ROP даже treated)"
        ),
        "references": [
            "AAP/AAO/AAPOS 2018 (Pediatrics 142:e20183061)",
            "Chiang MF et al. ICROP3 Ophthalmology 2021",
            "ETROP study Group (treatment thresholds)",
            "BEAT-ROP trial (anti-VEGF)",
            "КР МЗ РФ \"Ретинопатия недоношенных\" (2024)",
        ],
    },
    {
        "id": "guide_nicu_discharge_criteria",
        "title_en": "NICU discharge criteria (AAP COFN 2008)",
        "title_ru": "Критерии выписки н/р из NICU (AAP COFN 2008)",
        "content": (
            "AAP COFN 2008 5-criteria approach для готовности discharge. "
            "Все critirium met для safe discharge home.\n\n"
            "5 КРИТЕРИЕВ (все обязательны):\n\n"
            "1. PHYSIOLOGIC STABILITY\n"
            "   - Apnea-free период ≥ 5-7 дней (без caffeine если applicable)\n"
            "   - Normoxia в room air ИЛИ stable home O₂ requirement\n"
            "   - Normothermia без external warming\n"
            "   - Stable vital signs\n\n"
            "2. ADEQUATE FEEDING\n"
            "   - > 80 % volumes oral (breast, bottle, или combination)\n"
            "   - Weight gain ≥ 15-30 г/сут sustained\n"
            "   - Remaining volumes через NG OK для graduation\n\n"
            "3. THERMOREGULATION\n"
            "   - Stable в open crib (NICU minimum 24-72 ч)\n"
            "   - Normothermia без incubator\n"
            "   - Typically @ ~ 1700-1800 г и PMA 35-36 нед\n\n"
            "4. ROUTINE CARE COMPLETE\n"
            "   - Vaccines: HepB by birth + age-appropriate\n"
            "   - Screenings: метаболика (TSH, PKU, MSUD и др.), hearing "
            "(ABR/OAE), critical CHD pulse oximetry\n"
            "   - ROP (если preterm < 32 нед / < 1500 г)\n"
            "   - Eye examination documented if BPD/preterm\n\n"
            "5. PARENTAL READINESS\n"
            "   - CPR training completed\n"
            "   - Feeding skills demonstrated\n"
            "   - Recognition of warning signs (sepsis, jaundice, poor "
            "feeding)\n"
            "   - Medication administration training\n"
            "   - Home equipment understanding\n\n"
            "DISCHARGE PROTOCOL:\n"
            "24-48 ч до discharge:\n"
            "- Physical exam\n"
            "- Weight check\n"
            "- Education completed\n"
            "- Screenings results reviewed\n"
            "- Follow-up appointments arranged\n\n"
            "DAY OF DISCHARGE:\n"
            "- CAR SEAT CHALLENGE (90-120 мин для preterm < 37 нед или LBW "
            "< 2500 г)\n"
            "- Final exam, weight, vital signs\n"
            "- Removal IV / NG access\n"
            "- Discharge medications dispensed\n"
            "- Written/verbal instructions\n\n"
            "AFTER DISCHARGE:\n"
            "- Pediatrician follow-up 24-72 ч после\n"
            "- Subspecialty: cardio, neuro, ophthal per condition\n"
            "- Hearing screening repeat at 1-3 мес\n"
            "- Developmental follow-up (high-risk)\n\n"
            "LATE PRETERM CAVEATS (34-36 нед):\n"
            "- Often \"appears\" mature\n"
            "- Hypoglycemia, hyperbilirubinemia, feeding difficulties risks\n"
            "- ↑ Readmission rate 1.5-2× term\n"
            "- 48-72 ч hospital stay minimum recommended"
        ),
        "references": [
            "AAP COFN 2008 Pediatrics 122:1119",
            "Engle WA AAP COFN 2007 — Late preterm infants",
            "Eichenwald EC AAP COFN 2018 — Apnea of prematurity",
            "КР МЗ РФ \"Выписка новорождённого\" (2024)",
        ],
    },
    {
        "id": "guide_pphn_screening_diagnosis",
        "title_en": "PPHN screening / diagnosis algorithm",
        "title_ru": "PPHN скрининг / диагноз алгоритм",
        "content": (
            "Persistent Pulmonary Hypertension of Newborn (PPHN) — failure "
            "normal postnatal decline в pulmonary vascular resistance.\n\n"
            "DIAGNOSTIC CRITERIA:\n\n"
            "CLINICAL:\n"
            "1. Hypoxemia disproportionate к degree of lung disease\n"
            "2. Differential cyanosis — pre-ductal SpO₂ > post-ductal by "
            "> 5-10 %\n"
            "3. Hyperoxia test — PaO₂ < expected на 100 % O₂\n\n"
            "ECHOCARDIOGRAPHY (gold standard):\n"
            "- Tricuspid regurgitation jet velocity > 2.5 м/с (RV pressure "
            "≥ 30 мм рт ст)\n"
            "- RV pressure ≥ 2/3 systemic\n"
            "- Septal flattening / paradoxical motion\n"
            "- Right-to-left shunting через PDA / PFO\n"
            "- PVR ↑ quantitatively\n\n"
            "DIFFERENTIAL SpO₂ INTERPRETATION:\n"
            "- < 3 %: Normal\n"
            "- 3-5 %: Possible mild PPHN\n"
            "- 5-10 %: PPHN likely\n"
            "- > 10 %: PPHN definite\n"
            "- Reverse differential (post > pre): TGA (transposition great "
            "arteries)\n\n"
            "UNDERLYING CAUSES:\n"
            "- MAS (meconium aspiration) — most common\n"
            "- Idiopathic PPHN\n"
            "- Sepsis-related\n"
            "- CDH (congenital diaphragmatic hernia)\n"
            "- RDS-associated\n"
            "- Asphyxia-related\n"
            "- Polycythemia\n"
            "- Drug-induced (maternal SSRI / NSAID antenatal)\n\n"
            "TREATMENT ALGORITHM:\n"
            "1. Optimize ventilation (PEEP, MAP, oxygenation)\n"
            "2. Correct underlying: acidosis, hypoCa, hypoglycemia\n"
            "3. iNO 20 ppm trial × 30-60 мин (если OI ≥ 15-25)\n"
            "4. Response: PaO₂ ↑ ≥ 20 ИЛИ OI ↓ ≥ 15 % за 30 мин\n"
            "5. Continue iNO, taper к 5-10 ppm если response\n"
            "6. If no response:\n"
            "   - HFOV если на conventional\n"
            "   - Sildenafil PO/IV (PDE5 inhibitor)\n"
            "   - Milrinone 0.33-1 мкг/кг/мин (PDE3 inhibitor — RV support)\n"
            "   - Vasopressors (dopamine ± epi) для perfusion\n"
            "7. Failure → ECMO consult (OI ≥ 40 sustained × 4 ч)\n\n"
            "SEVERITY (по OI):\n"
            "- < 15: Mild\n"
            "- 15-25: Moderate (iNO indication)\n"
            "- 25-40: Severe (escalation)\n"
            "- ≥ 40: Critical (ECMO criteria)\n\n"
            "PROGNOSIS:\n"
            "- Mortality severe PPHN: 10-30 %\n"
            "- Survivors с BPD / CLD common\n"
            "- Long-term pulmonary HTN rare если acute resolves"
        ),
        "references": [
            "AHA 2019 PPHN Scientific Statement",
            "AAP COFN — pediatric pulmonary hypertension",
            "Konduri GG et al. — management guidelines",
            "NINOS trial 1997",
            "КР МЗ РФ \"Персистирующая лёгочная гипертензия н/р\" (2024)",
        ],
    },
]


def main() -> int:
    """Append new guidelines to JSON, preserve existing data."""
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {g["id"] for g in data["guidelines"]}
    added: list[str] = []
    for guideline in NEW_GUIDELINES:
        if guideline["id"] in existing_ids:
            print(f"Skip duplicate: {guideline['title_en']}")
            continue
        data["guidelines"].append(guideline)
        added.append(guideline["title_ru"])

    # Bump version
    data["version"] = "1.1.0"
    data["lastUpdated"] = "2026-05-09"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Added {len(added)} guidelines:")
    for t in added:
        print(f"  - {t}")
    print(f"Total guidelines now: {len(data['guidelines'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
