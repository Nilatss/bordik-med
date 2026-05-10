"""
Phase 3 expansion of Table 3.Д banks — additional content depth:
- clinical-cases (17 → 22) +5
- common-mistakes (21 → 26) +5
- atlas (21 → 26) +5
- checklists (15 → 18) +3
- videos (21 → 24) +3
- articles (90 → 95) +5

Total +26 educational items. Idempotent (skips by id).
"""
from __future__ import annotations
import json
from pathlib import Path

DIR = Path(r"C:\Users\KDFX Modes\Desktop\bordik-med\public")


# ============================================================================
# CASES (+5 — covers HFOV, ICH, EOS-puopolo borderline, NAS-buprenorphine, surfactant-failure
# ============================================================================
NEW_CASES = [
    {
        "id": "case-hfov-rescue",
        "title_ru": "HFOV-rescue при refractory MAS + PPHN",
        "title_en": "HFOV rescue в refractory MAS + PPHN",
        "topic": "respiratory",
        "level": "advanced",
        "vignette": "Мальчик 41 нед, BW 3500 г. После meconial aspiration на conventional ИВЛ PIP 32 PEEP 7 FiO₂ 1.0 — OI 28 после 2 ч. Echo: severe PPHN, RV dysfunction. Pneumothorax исключён.",
        "presenting_features": [
            "Refractory hypoxemia на conventional ventilation (OI >25)",
            "Severe PPHN с RV dysfunction",
            "Maximal conventional settings без response",
            "Risk barotrauma при continued escalation",
        ],
        "differential": [
            "Refractory MAS + PPHN (наиболее вероятно)",
            "Surfactant deficiency secondary к meconium",
            "Persistent pulmonary hypertension изолированная",
            "Air leak / pneumothorax (исключить)",
        ],
        "management": [
            "Switch на HFOV: MAP 1-2 cmH₂O выше CMV MAP, frequency 8-12 Hz, amplitude — start 2× MAP до visible chest wiggle.",
            "iNO 20 ppm continuous — потенциирует HFOV для PPHN.",
            "Surfactant via ETT (rescue 4 мл/кг bovine OR poractant 200 мг/кг).",
            "Sedation + paralysis: morphine 30-50 мкг/кг/час + vecuronium 0.1 мг/кг q1-2h PRN.",
            "Sildenafil 0.5-2 мг/кг q6h NG (adjuvant если refractory).",
            "Echo monitoring: PA pressure, RV/LV function.",
            "If OI >40 на full medical → ECMO criteria, pediatric cardiac surgery transfer.",
        ],
        "pearls": [
            "HFOV rescue criteria: OI >15 на conventional, escalating support, refractory hypoxemia.",
            "iNO + HFOV synergy в PPHN — HFOV expands lung → improves V/Q matching → iNO works better.",
            "ECMO criteria: OI >25-40 (institution-specific), GA ≥34 нед, BW ≥2 кг.",
        ],
        "references": [
            "Cools F et al. Cochrane 2015;CD000104 — HFOV elective vs rescue",
            "Steurer MA et al. Pediatrics 2017;139:e20161165",
            "Konduri GG. Pediatrics 2004;113:559",
        ],
    },
    {
        "id": "case-grade-3-ivh",
        "title_ru": "ВЖК III степени — острая декомпенсация",
        "title_en": "Grade III IVH — acute deterioration",
        "topic": "neuro",
        "level": "advanced",
        "vignette": "Мальчик GA 24 5/7 нед, BW 680 г, day 3 жизни. Внезапно: bulging fontanelle, apnea, hypotension. Hb упал с 165 до 105 г/л. УЗИ ГМ: bilateral grade III IVH с ventricular dilation, blood в IV ventricle.",
        "presenting_features": [
            "Sudden cardiovascular instability у preterm 24-26 нед",
            "Bulging anterior fontanelle",
            "Acute drop в Hb",
            "Apnea / bradycardia / desaturation",
            "Sentinel signs возможны 24 ч до event (decreased activity)",
        ],
        "differential": [
            "Acute IVH (наиболее вероятно при GA 24-25 нед — peak risk window)",
            "Sepsis-related decompensation",
            "Pneumothorax",
            "Volume overload (hsPDA, fluid bolus)",
        ],
        "management": [
            "Stabilize: ventilation support, FiO₂ 100%, fluid bolus 10 мл/кг для hypotension.",
            "PRBC transfusion если Hb <100 г/л (target ≥130 при HIE-like presentation).",
            "Stat cranial ultrasound — confirm + grade.",
            "Avoid volume swings: tight blood pressure control (avoid hyper/hypotension).",
            "Stop NSAID immediately (если на ibuprofen для PDA).",
            "Magnesium sulfate continuation если уже started antenatally.",
            "Coagulopathy correction: FFP 10-15 мл/кг если active bleeding + INR >1.5.",
            "Sedation: low-dose morphine для minimize stress (5-10 мкг/кг/час).",
            "Cluster care strict × 72 ч.",
            "Daily HUS first week, then weekly до stable.",
            "Monitor для post-hemorrhagic hydrocephalus (vent index, anterior horn width).",
        ],
        "pearls": [
            "Peak IVH risk: first 72 ч жизни у GA 24-26 нед.",
            "Sentinel signs (decreased activity, mild apnea) часто precede catastrophic IVH on 12-24h.",
            "Kangaroo Mother Care в acute phase IVH — emerging evidence cardiopulmonary stability + neuroprotection.",
        ],
        "references": [
            "Papile LA et al. J Pediatr 1978;92:529",
            "Volpe JJ. Neurology of the Newborn 6th ed.",
            "Soraisham AS et al. Cochrane 2018 — Magnesium IVH prevention",
        ],
    },
    {
        "id": "case-eos-puopolo-borderline",
        "title_ru": "EOS borderline у preterm 32 нед — Puopolo Tiered",
        "title_en": "EOS borderline preterm 32 wk — Puopolo Tiered",
        "topic": "infection",
        "level": "intermediate",
        "vignette": "Мальчик GA 32 1/7 нед, BW 1700 г. Мать GBS-positive, PROM 22 ч, intrapartum t° 37.9°C × 1, IAP penicillin 6 ч до родов (adequate). Newborn: well-appearing, RR 60-65, no retractions, feeds well. CBC normal, CRP 12 мг/л.",
        "presenting_features": [
            "GA <34 нед + multiple maternal risk factors",
            "Adequate IAP completed",
            "Well-appearing neonate",
            "Borderline RR (60-65 — physiologic transition vs concerning)",
            "Mildly elevated CRP (12 мг/л — borderline normal у newborn)",
        ],
        "differential": [
            "Transient tachypnea of newborn (TTN — typical preterm late)",
            "Early-onset GBS sepsis (lower risk при adequate IAP)",
            "Subclinical sepsis (E. coli, Listeria) — less likely",
            "Mild RDS (preterm — possible)",
        ],
        "management": [
            "Use Puopolo Tiered approach <34 нед:",
            "  - Maternal high risk + adequate IAP + well-appearing = Tier 2",
            "  - Recommendation: enhanced observation × 36-48 ч",
            "Не starting empiric ABX immediately (Puopolo Tiered Tier 2 logic).",
            "Monitor vitals q1h × 4 ч, then q3-4h × 36-48 ч.",
            "Repeat CRP at 24 ч (if rising trend → escalate).",
            "Если any clinical deterioration: full work-up (BC + CBC + LP if signs) + start amp + gent.",
            "Если clinical course favorable + CRP normalising: continue observation.",
            "Document Puopolo Tier reasoning + decision.",
        ],
        "pearls": [
            "Puopolo Tiered (Pediatrics 2017) для preterm <34 нед — superior к категорическому подходу.",
            "Adequate IAP сoзначает penicillin/амп/cefazolin ≥4 ч до родов.",
            "Avoid unnecessary ABX exposure → reduces NEC, LOS, candidiasis risk.",
        ],
        "references": [
            "Puopolo KM et al. Pediatrics 2018;142:e20182894",
            "Puopolo KM et al. Pediatrics 2019;144:e20191881",
        ],
    },
    {
        "id": "case-nas-buprenorphine",
        "title_ru": "NAS у opioid-exposed: переход на buprenorphine",
        "title_en": "NAS opioid-exposed: morphine → buprenorphine transition",
        "topic": "neuro",
        "level": "intermediate",
        "vignette": "Мальчик 39 нед, BW 2950 г. Мать на methadone 80 мг/сут. Day 4 жизни — Modified Finnegan 13 stable, на morphine 0.1 мг/кг q3h × 12 доз. Trying to wean. Mother insists на breastfeeding (no contraindication).",
        "presenting_features": [
            "Methadone-exposed neonate с established NAS",
            "Stable но prolonged morphine treatment",
            "Family-friendly approach (KMC, breastfeeding) — supported",
            "Considering medication switch для shorter LOS",
        ],
        "differential": [
            "Continuing NAS (наиболее вероятно)",
            "Subclinical infection",
            "Underlying brain injury (HIE-related) — rare with methadone",
        ],
        "management": [
            "Continue non-pharm: rooming-in 24/7, breastfeeding (methadone OK при maternal stable dose), low-stim environment, swaddling, KMC.",
            "Convert от morphine → buprenorphine SL (BBORN trial protocol):",
            "  - Calculate equivalent buprenorphine: 4-5 мкг/кг q8h SL (под язык)",
            "  - Wean by 10% q1-2 days as tolerated",
            "  - Monitor ESC criteria (Eat-Sleep-Console) instead of Finnegan",
            "Adjunct clonidine 1 мкг/кг q3-4h PO если monotherapy недостаточно.",
            "Re-assess Finnegan / ESC q3-4h initially, then less frequently.",
            "Discharge criteria: off pharm 24-48 ч + adequate feeding + social work clearance.",
            "Comprehensive follow-up: pediatric, developmental clinic, social work.",
        ],
        "pearls": [
            "BBORN trial (Kraft NEJM 2017): SL buprenorphine — median treatment 15 vs 28 days morphine.",
            "ESC approach (Grossman 2017): function-based vs symptom-tally → shorter LOS, less pharm.",
            "Methadone breastfeeding compatible at maternal stable dose; benefits outweigh risks.",
        ],
        "references": [
            "Kraft WK et al. NEJM 2017;376:2341 — BBORN",
            "Grossman MR et al. Pediatrics 2017;139:e20163360 — ESC",
            "Patrick SW et al. Pediatrics 2020;146:e2020029074 — AAP NAS",
        ],
    },
    {
        "id": "case-surfactant-failure",
        "title_ru": "Surfactant non-response — congenital surfactant deficiency",
        "title_en": "Surfactant non-response — congenital deficiency",
        "topic": "respiratory",
        "level": "advanced",
        "vignette": "Девочка 38 нед, BW 3300 г, term-born. Severe respiratory failure от рождения, intubated, PIP 30 PEEP 8 FiO₂ 1.0. Получила 3 dose surfactant без улучшения. Family hx: sibling died на day 5 жизни от 'lung disease'.",
        "presenting_features": [
            "Severe respiratory failure у term newborn (atypical для idiopathic RDS)",
            "Surfactant non-response despite multiple doses",
            "Family history sibling neonatal death respiratory cause",
            "OI rising despite all standard therapy",
        ],
        "differential": [
            "Genetic surfactant deficiency: SP-B, SP-C, ABCA3, NKX2.1 (наиболее вероятно given family hx + non-response)",
            "Alveolar capillary dysplasia (ACD/MPV) — rare, similar presentation",
            "Pulmonary lymphangiectasia",
            "Persistent fetal circulation severe",
            "Cardiac shunt (исключить echo)",
        ],
        "management": [
            "STAT echocardiogram — exclude cardiac etiology.",
            "Genetic consultation + send blood для surfactant gene panel (SP-B, SP-C, ABCA3, NKX2.1).",
            "ECMO consideration (criteria: OI >40, GA ≥34, BW ≥2 кг).",
            "Lung biopsy через open thoracotomy если ECMO available + uncertain genetics — provides definitive diagnosis (PAS-positive material, abnormal lamellar bodies).",
            "Family counseling: SP-B is autosomal recessive, lethal. SP-C variable. ABCA3 variable severity.",
            "Lung transplantation evaluation если survives initial period — only definitive treatment SP-B.",
            "Palliative care discussion — all SP-B 100% fatal без transplant; ABCA3 partial response sometimes.",
        ],
        "pearls": [
            "Surfactant non-response в term + family hx → genetic surfactant disorders.",
            "SP-B deficiency 100% lethal без lung transplant. ABCA3 variable.",
            "Genetic panel results 1-3 weeks — don't wait, parallel pursue ECMO/transplant eval.",
        ],
        "references": [
            "Whitsett JA et al. NEJM 2002;347:2141",
            "Hamvas A et al. Semin Perinatol 2006;30:316",
            "Doan ML et al. Thorax 2008;63:366",
        ],
    },
]


# ============================================================================
# COMMON MISTAKES (+5)
# ============================================================================
NEW_MISTAKES = [
    {
        "id": "mistake-routine-suction-vigorous",
        "title_ru": "Routine endotracheal suction у vigorous newborn",
        "title_en": "Routine ETT suction в vigorous newborn",
        "category": "resuscitation",
        "severity": "low",
        "mistake": "Рутинная глубокая отсасывание трахеи через ЭТТ у newborn без obvious obstruction.",
        "why_it_happens": "Старая практика. Mistaken belief 'sucking helps clear airway'. NRP guidelines updated 2015+ but slow adoption.",
        "correct_approach": "Suction TOLKKO when obvious obstruction (visible meconium, blood). Routine deep ETT suction НЕ рекомендуется. Brief mouth/nose suction если visible debris OK.",
        "consequence": "Bradycardia (vagal), hypoxia, mucosal trauma. Не improves outcomes. Fishing exam quality care.",
        "references": [
            "Aziz K et al. Pediatrics 2021;147:e2020038505E",
            "Wiswell TE et al. Pediatrics 2000;105:1",
        ],
    },
    {
        "id": "mistake-late-pda-treatment",
        "title_ru": "Поздняя tactика hsPDA — wait too long",
        "title_en": "Delayed hsPDA treatment in ELBW",
        "category": "cardiopulmonary",
        "severity": "medium",
        "mistake": "Затягивание medication closure hsPDA у ELBW до 3-4 недель надеясь на spontaneous closure.",
        "why_it_happens": "60-90% PDAs close spontaneously у GA >28 нед, но ELBW (<28) significantly slower. Conservative bias.",
        "correct_approach": "Early echo screen at 48-72 ч у ELBW. If hsPDA + clinical signs (failure to wean, oxygenation worsening) — early closure (1-2 cycles ibuprofen). Не wait until weeks 3-4.",
        "consequence": "Prolonged ИВЛ → BPD, IVH, NEC, mortality. Delayed PDA closure ассоциирована с worse outcomes ELBW.",
        "references": [
            "Mitra S et al. JAMA 2018;319:1221",
            "Sehgal A et al. Eur J Pediatr 2014;173:925",
        ],
    },
    {
        "id": "mistake-infant-pos-tummy-time-asleep",
        "title_ru": "Тummy time во время sleep",
        "title_en": "Tummy time during sleep — SIDS risk",
        "category": "neonatal",
        "severity": "high",
        "mistake": "Allowing infant to sleep in prone (tummy down) position OR transferring к sleep после feeding в prone.",
        "why_it_happens": "Confusion между awake supervised tummy time (good) и sleep prone (dangerous). Parental fatigue.",
        "correct_approach": "ALWAYS Back to Sleep — supine для ALL sleep × first year. Tummy time только supervised + awake. AAP Safe Sleep 2022 strict policy.",
        "consequence": "SIDS risk increased 5-7x. Sudden infant death.",
        "references": [
            "Moon RY et al. Pediatrics 2022;150:e2022057990",
            "AAP Safe Sleep Policy 2022",
        ],
    },
    {
        "id": "mistake-iron-supplement-iv",
        "title_ru": "IV iron у newborn",
        "title_en": "IV iron supplementation в newborn",
        "category": "metabolic",
        "severity": "high",
        "mistake": "Administering IV iron (sucrose / dextran) для anemia of prematurity.",
        "why_it_happens": "Adult / older child practice extrapolation. Misunderstanding iron metabolism в newborn.",
        "correct_approach": "Oral iron drops (2-4 мг/кг/сут elemental) от 4-8 недель age. Erythropoietin рассматривать у ELBW. Transfusion при threshold reached. NEVER IV iron у newborn — risk circulating free iron toxicity, oxidative stress, sepsis enhancement.",
        "consequence": "Free iron в circulation → oxidative damage. Increased sepsis risk (bacteria use iron). Anaphylaxis-like reactions.",
        "references": [
            "AAP COFN 2010 — Diagnosis and Prevention of Iron Deficiency",
            "Aher SM et al. Cochrane 2014 — Erythropoietin AOP",
        ],
    },
    {
        "id": "mistake-dna-skin-prep-iodine",
        "title_ru": "Povidone-iodine skin prep у preterm <2 мес",
        "title_en": "Povidone-iodine prep в preterm <2 months",
        "category": "infection",
        "severity": "medium",
        "mistake": "Использование povidone-iodine для skin antisepsis перед procedures у preterm <2 мес жизни.",
        "why_it_happens": "Standard practice in older patients. Not aware of preterm thyroid sensitivity к iodine absorption.",
        "correct_approach": "Chlorhexidine 0.5% или 2% (не alcohol-based в neonate) preferred. Если povidone-iodine необходим — wash off after procedure (avoid prolonged contact). Monitor TFTs если repeated exposure.",
        "consequence": "Transient hypothyroidism у preterm — affects neurodevelopment. Rare but documented с repeated exposure.",
        "references": [
            "CDC Guidelines for the Prevention of Intravascular Catheter-Related Infections 2017",
            "AAP COFN 2017",
        ],
    },
]


# ============================================================================
# ATLAS (+5)
# ============================================================================
NEW_ATLAS = [
    {
        "id": "atlas-microcephaly-features",
        "title_ru": "Микроцефалия — обследование и причины",
        "title_en": "Microcephaly — examination + causes",
        "description": "OFC < -2 SD для GA + sex. Symmetric vs asymmetric. Causes: genetic, infectious (TORCH, Zika), metabolic, hypoxic-ischemic. Workup includes neuroimaging, TORCH titres, genetic panel.",
        "key_findings": [
            "OFC measurement technique: largest occipitofrontal circumference, 3 measurements average",
            "Plot на Fenton (preterm) или WHO/Intergrowth (term) curve",
            "Microcephaly criteria: OFC < -2 SD for GA + sex",
            "Severe: < -3 SD",
            "Workup: HUS or MRI brain, TORCH (CMV most common), Zika serology, genetic chromosomal microarray",
            "Causes: TORCH (CMV>>others), Zika, genetic syndromes (Down, trisomies), HIE, alcohol exposure",
        ],
        "source": "WHO / CDC / Stanford",
        "source_type": "stanford",
        "url": "https://stanfordmedicine25.stanford.edu/the25/newbornExam.html",
        "category": "examination",
    },
    {
        "id": "atlas-pulmonary-hypoplasia",
        "title_ru": "Гипоплазия лёгких — рентгенологическая картина",
        "title_en": "Pulmonary hypoplasia — radiographic picture",
        "description": "Small bell-shaped chest, reduced lung volume, restrictive pattern. Causes: oligohydramnios sequence (renal anomalies), CDH, thoracic deformity. Severe форма often lethal в первые часы.",
        "key_findings": [
            "Bell-shaped narrow chest configuration",
            "Reduced number of ribs visible",
            "Small lung volumes на CXR",
            "Often associated с CDH, oligohydramnios, renal anomalies (Potter sequence)",
            "Mortality high if severe — depends on viable lung tissue",
            "ECMO criteria for survival depend on lung development",
        ],
        "source": "Radiopaedia",
        "source_type": "radiopaedia",
        "url": "https://radiopaedia.org/articles/pulmonary-hypoplasia",
        "category": "respiratory_imaging",
    },
    {
        "id": "atlas-cdh-presentation",
        "title_ru": "Врождённая диафрагмальная грыжа (CDH)",
        "title_en": "Congenital diaphragmatic hernia (CDH)",
        "description": "Bowel loops в thoracic cavity, mediastinal shift, scaphoid abdomen. 80% left-sided. Antenatal diagnosis ключевой для planning. Postnatal: immediate intubation, OG decompression.",
        "key_findings": [
            "Scaphoid abdomen (sunken, 'flat')",
            "Decreased breath sounds affected side, heart sounds shifted contralateral",
            "CXR: bowel loops в thoracic cavity, mediastinum shifted contralateral",
            "Left-sided 80%, right-sided 20%",
            "Pulmonary hypoplasia + PPHN — major morbidity",
            "Immediate management: intubation (NO bag-mask — would distend bowel), OG decompression, transfer к pediatric surgical center",
        ],
        "source": "Radiopaedia / CDH International",
        "source_type": "radiopaedia",
        "url": "https://radiopaedia.org/articles/congenital-diaphragmatic-hernia",
        "category": "respiratory_imaging",
    },
    {
        "id": "atlas-erythema-toxicum",
        "title_ru": "Erythema toxicum neonatorum",
        "title_en": "Erythema toxicum neonatorum",
        "description": "Most common newborn rash — 30-70% term newborns. Yellow-white pustules с erythematous halo. Self-resolving 3-5 days. Often mistaken for infection.",
        "key_findings": [
            "Yellow-white pustules surrounded by red halo",
            "Often clustered, transient, multiple sites",
            "Sparing palms/soles (helps differentiate from skin infection)",
            "Onset 24-72 ч жизни typically",
            "Resolution 3-5 дней без treatment",
            "Wright stain пустулы — eosinophils predominant (vs neutrophils в bacterial)",
        ],
        "source": "Visual DX / NEJM",
        "source_type": "nejm",
        "url": "https://www.nejm.org/doi/full/10.1056/NEJMra1700351",
        "category": "skin",
    },
    {
        "id": "atlas-strawberry-hemangioma",
        "title_ru": "Strawberry haemangiomas — infantile haemangiomas",
        "title_en": "Strawberry hemangiomas — infantile hemangiomas",
        "description": "Most common infant tumor. Small at birth, rapid growth первые 3-9 мес, then involution. Most не require treatment. Beta-blockers (propranolol) treatment of choice when intervention indicated.",
        "key_findings": [
            "Bright red, raised, well-demarcated lesions",
            "Small at birth, rapid growth phase 0-9 мес",
            "Involution phase from ~12 мес, complete by 5-9 лет",
            "Treatment indications: airway / vision / functional impairment, ulceration, complicated location",
            "Treatment: oral propranolol 1-3 мг/кг/сут — gold standard",
            "Topical timolol для small superficial lesions",
            "PHACE syndrome — large facial hemangioma + cardiac/cerebrovascular anomalies",
        ],
        "source": "Visual DX / AAP",
        "source_type": "stanford",
        "url": "https://stanfordmedicine25.stanford.edu/the25/newbornExam.html",
        "category": "skin",
    },
]


# ============================================================================
# CHECKLISTS (+3)
# ============================================================================
NEW_CHECKLISTS = [
    {
        "id": "checklist-extubation-readiness",
        "title_ru": "Оценка готовности к экстубации (preterm)",
        "title_en": "Extubation readiness assessment preterm",
        "category": "respiratory",
        "estimated_minutes": 15,
        "audience": "Врач + респираторный терапевт",
        "indications": [
            "ELBW preterm на ИВЛ ≥48 ч",
            "Improving lung function",
            "Considering switching to non-invasive support",
        ],
        "sections": [
            {"title": "Минимальные требования (necessary)", "items": [
                "MAP ≤7-8 cmH₂O",
                "FiO₂ ≤0.30",
                "RR <60 spontaneous",
                "Hemodynamic stable (без active inotropes)",
                "On caffeine (loading + maintenance) для preterm <32 нед",
                "Glucose stable",
                "Temperature normal",
            ]},
            {"title": "Дополнительные predictors", "items": [
                "Adequate weight gain trajectory",
                "Receiving feeds (any volume) — gut perfusion intact",
                "Hb ≥100 г/л (avoid anemia → apnea)",
                "Electrolytes: K+ 3.5-5.0, Na+ 135-145",
                "ABG: pH 7.25-7.45, PaCO₂ <55, base excess >-10",
                "No active sepsis",
            ]},
            {"title": "Pre-extubation prep", "items": [
                "Caffeine loading 20 мг/кг IV (если ещё не on caffeine)",
                "Pre-treat dexamethasone DART scheme если BPD risk + ventilator >7 days",
                "Suction airway clean",
                "NIPPV / NCPAP equipment ready (PEEP 5-6, RR 20-30, PIP 16-18)",
                "Hand bag-mask + appropriate mask size ready",
                "Re-intubation kit ready",
            ]},
            {"title": "Spontaneous breathing trial (optional)", "items": [
                "ETT-CPAP 5-6 cmH₂O × 30-60 минут",
                "Watch для apnea, desaturation, increased WoB",
                "Tolerated SBT predicts successful extubation",
                "If failed SBT — return к prior settings",
            ]},
            {"title": "Extubation procedure", "items": [
                "Suction OG/NG tube + airway",
                "Extubate at end of inspiration",
                "Immediately apply NIPPV или NCPAP (preset to anticipated needs)",
                "Monitor SpO₂, HR, RR, WoB closely",
                "First 30-60 минут critical — most extubation failures occur",
            ]},
            {"title": "Post-extubation monitoring", "items": [
                "Continuous SpO₂ + ETCO₂ (если capnography available)",
                "Watch for stridor (subglottic edema): racemic epinephrine PRN + dexamethasone",
                "ABG at 1 hr, 4 hr, 8 hr",
                "RR, retractions, O₂ requirement trends",
                "Failure criteria: pH <7.20, PaCO₂ >65, FiO₂ >0.50, recurrent apnea",
            ]},
        ],
        "references": [
            "Lemyre B et al. Cochrane 2017;CD003212",
            "Sant'Anna GM, Keszler M. Clin Perinatol 2012;39:543",
        ],
    },
    {
        "id": "checklist-iv-fluid-mgmt-day1",
        "title_ru": "IV fluid management — Day 1 ELBW",
        "title_en": "Day 1 IV fluid management ELBW",
        "category": "vascular_access",
        "estimated_minutes": 10,
        "audience": "Врач-неонатолог",
        "indications": [
            "ELBW preterm на стартовом TPN",
            "Acute illness требующий IV fluids",
        ],
        "sections": [
            {"title": "Стартовый объём", "items": [
                "ELBW (<1000 г): 100-120 мл/кг/сут Day 1",
                "VLBW (1000-1500 г): 80-100 мл/кг/сут",
                "Term: 60-80 мл/кг/сут",
                "Insensible loss particularly high у ELBW (radiant warmer 50-100 мл/кг/сут)",
            ]},
            {"title": "Composition", "items": [
                "D10W base (provides GIR 4-6 мг/кг/мин)",
                "AA 1.5-3 г/кг/сут (early — start Day 1)",
                "Lipids 1-2 г/кг/сут (start Day 1)",
                "Без Na/K Day 1 (await physiologic diuresis)",
                "Ca 1.5-2.5 ммоль/кг/сут (60-100 мг/кг)",
            ]},
            {"title": "Advancement Day 2-7", "items": [
                "Increase fluids 20 мл/кг/сут",
                "Add Na 2-3 ммоль/кг/сут после physiologic weight loss / diuresis",
                "Add K 1-3 ммоль/кг/сут после confirmed urination + normal renal function",
                "Advance AA до 3.5-4.5 г/кг/сут by Day 2-3",
                "Advance lipids до 3-4 г/кг/сут",
            ]},
            {"title": "Monitoring", "items": [
                "Daily weight (target 1-2% loss Day 1-3, then gain 15-30 г/сут)",
                "Strict input/output (target UO 1-3 мл/кг/час)",
                "Electrolytes q12-24h Day 1-3",
                "Glucose q4-6h initially",
                "Bilirubin daily при PT",
                "PRN: BUN/Cr (renal function), albumin, phosphorus",
            ]},
            {"title": "Common adjustments", "items": [
                "Hyperglycemia (BG >10 ммоль/л): decrease GIR (not below 4), insulin if persistent",
                "Hypoglycemia (BG <2.6): bolus D10 2 мл/кг + increase GIR",
                "Hypernatremia (>150): increase free water (decrease Na) — common Day 1-3 у ELBW",
                "Hyponatremia (<130): assess volume status; usually water excess in late preterm",
                "Hyperkalemia: decrease K, treat per algorithm если symptomatic",
            ]},
            {"title": "Transition к full feeds", "items": [
                "When EN ≥120-140 мл/кг/сут — wean TPN",
                "Wean lipids first → AA → glucose",
                "Maintain CVL × 24-48 ч после TPN cessation",
                "Reassess electrolytes, weight at full feeds",
            ]},
        ],
        "references": [
            "Mihatsch WA et al. Clin Nutr 2018;37:2306 — ESPGHAN PN 2018",
            "Embleton ND et al. JPGN 2022 — ESPGHAN EN 2022",
        ],
    },
    {
        "id": "checklist-pacifier-positioning",
        "title_ru": "Позиционирование preterm + non-pharm comfort",
        "title_en": "Preterm positioning + non-pharm comfort",
        "category": "resuscitation",
        "estimated_minutes": 5,
        "audience": "Медсестра",
        "indications": [
            "Стабильный preterm ELBW/VLBW",
            "Routine NICU positioning",
            "Preventing positional plagiocephaly",
        ],
        "sections": [
            {"title": "Containment / boundaries", "items": [
                "Nesting blanket boundary (rolled blankets formed nest)",
                "Maintains flexion (mimics womb)",
                "Reduces motor stress, conserves energy",
                "Promotes self-regulation",
            ]},
            {"title": "Position rotation", "items": [
                "Side-lying preferred preterm <34 нед",
                "Alternate sides q3h (left ↔ right)",
                "Prone supervised для quiet alert / awake",
                "Supine for SLEEP (Back to Sleep) once stable, room air",
                "Avoid prolonged head turn one direction (plagiocephaly)",
            ]},
            {"title": "Limb positioning", "items": [
                "Hands flexed mid-line, near face (self-touch comforting)",
                "Hips flexed",
                "Knees flexed",
                "Avoid extreme abduction/extension (joint stress)",
            ]},
            {"title": "Comfort measures", "items": [
                "Pacifier offered before/during procedures",
                "Sucrose 24% 0.1-0.5 мл PO 2 минут до procedure",
                "Skin-to-skin contact (KMC) ≥4-8 ч/сут target",
                "Swaddling (тщательный — avoid hyperflexion)",
                "Soft music / parental voice",
                "Dim lighting + low sound levels",
            ]},
            {"title": "Documentation", "items": [
                "Position changes q3h documented",
                "Comfort measures provided",
                "Pain assessment (PIPP-R / N-PASS) q4h",
                "Family involvement (KMC time)",
            ]},
        ],
        "references": [
            "Symington A, Pinelli J. Cochrane 2006;CD001814",
            "Als H et al. Pediatrics 2004;113:846 — NIDCAP",
        ],
    },
]


# ============================================================================
# VIDEOS (+3)
# ============================================================================
NEW_VIDEOS = [
    {
        "id": "video-pacifier-feeding-readiness",
        "title_ru": "Pacifier + feeding readiness assessment",
        "title_en": "Pacifier + oral feeding readiness assessment",
        "description": "Demonstration assessing oral feeding readiness в preterm — non-nutritive sucking pattern, pacifier use, transition к bottle/breastfeeding.",
        "source": "Stanford / Stanford Children's Health",
        "source_type": "youtube_official",
        "url": "https://www.stanfordchildrens.org/en/topic/default?id=premature-and-low-birth-weight-feeding-90-P02272",
        "category": "feeding",
        "duration_min": 9,
        "tags": ["feeding readiness", "pacifier", "preterm"],
    },
    {
        "id": "video-newborn-eye-exam-rop",
        "title_ru": "ROP exam с RetCam + indirect ophthalmoscopy",
        "title_en": "ROP exam with RetCam + indirect ophthalmoscopy",
        "description": "Demonstration ROP screening exam: pupil dilation, scleral depression, indirect ophthalmoscopy, RetCam imaging. Stage classification ICROP3 demonstrated.",
        "source": "American Academy of Ophthalmology",
        "source_type": "youtube_official",
        "url": "https://www.aao.org/eye-health/diseases/retinopathy-prematurity-rop-treatment",
        "category": "screening",
        "duration_min": 12,
        "tags": ["ROP", "RetCam", "AAO", "ICROP3"],
    },
    {
        "id": "video-vap-prevention-bundle",
        "title_ru": "VAP prevention bundle в NICU",
        "title_en": "VAP prevention bundle в NICU",
        "description": "Comprehensive VAP prevention bundle: hand hygiene, head-of-bed elevation, oral care, OG/NG suction, peptic ulcer prophylaxis, daily extubation readiness assessment.",
        "source": "CDC / IHI",
        "source_type": "who_official",
        "url": "https://www.cdc.gov/infection-control/hcp/sepsis/index.html",
        "category": "respiratory",
        "duration_min": 11,
        "tags": ["VAP", "infection control", "CDC"],
    },
]


# ============================================================================
# ARTICLES (+5)
# ============================================================================
NEW_ARTICLES = [
    {
        "id": "art-preterm-survival-statistics",
        "title_ru": "Выживаемость недоношенных по GA — современная статистика",
        "title_en": "Preterm survival by GA — current statistics",
        "topic": "neonatal", "audience": "neonatologist", "level": "intermediate",
        "summary": "Survival data preterm by GA в high-resource settings (NICHD) и LMIC. Critical для prenatal counseling, decision-making at threshold of viability.",
        "content": """## Background

Outcome counseling parents at threshold of viability (22-25 нед) — one of most challenging decisions in perinatal medicine. Data evolves rapidly.

## NICHD Network Data (USA, high-resource)

### Survival without major morbidity (2018-2020)

| GA нед | Survival (%) | Survival без major morbidity |
|---|---|---|
| 22 | 30-50% (active intervention) | 5-10% |
| 23 | 50-65% | 15-25% |
| 24 | 70-80% | 35-50% |
| 25 | 80-90% | 50-65% |
| 26 | 85-92% | 65-75% |
| 27 | 90-95% | 75-85% |
| 28 | 93-96% | 80-88% |

### Major morbidity (composite)
- Severe IVH (grade III/IV)
- Severe ROP requiring treatment
- Cystic PVL
- Severe BPD (grade III)
- NEC requiring surgery

## LMIC Data

В LMIC settings (limited NICU resources):
- 22-23 нед: 0-15% survival
- 24-25 нед: 30-50% survival
- 26-28 нед: 60-80% survival
- 29+ нед: similar to high-resource

Improvements: WHO ENC, KMC programs, low-cost CPAP availability.

## Long-term outcomes (NICHD follow-up к 18-24 мес)

### 22-25 нед survivors
- Major neurodevelopmental impairment 30-50%
- Borderline NDI 25-40%
- Normal development 15-30%

### 26-28 нед survivors
- Major NDI 10-20%
- Borderline 20-30%
- Normal 50-60%

### 29-32 нед survivors
- Major NDI 5-10%
- Normal 75-85%

## Counseling considerations

### Joint decision-making
- Parental values + autonomy
- Best estimate of outcomes (not certainties)
- Quality vs quantity of life discussion
- Family/cultural/spiritual values

### Documentation
- Detailed prenatal counseling note
- Birth plan options discussed
- Active vs comfort care
- Re-discussion possible after birth

## Российская практика

В РФ современные перинатальные центры выхаживают newborns от 22 нед с активным management. Регулярные статистики из national registry МЗ РФ.""",
        "references": [
            "Bell EF et al. JAMA 2022;327:248 — NICHD survival",
            "Stoll BJ et al. JAMA 2015;314:1039",
            "WHO Born Too Soon: Decade of Action 2023",
        ],
        "related_calculators": [],
    },
    {
        "id": "art-blood-pressure-newborn",
        "title_ru": "Артериальное давление у newborn — норма + management",
        "title_en": "Blood pressure в newborn — norms + management",
        "topic": "cardiopulmonary", "audience": "neonatologist", "level": "intermediate",
        "summary": "BP norms by GA + age. Hypotension definitions controversial. Treatment indication based on PERFUSION not just numbers. Vasopressors selectively.",
        "content": """## Background

Newborn BP targets remain controversial:
- Numeric thresholds vary
- 'Treat the patient, not the number'
- Perfusion >> absolute BP

## Reference ranges (mean BP)

### Term newborn
- Day 1: 50-65 мм рт. ст.
- Day 3+: 60-75 мм рт. ст.

### Preterm by GA
- 22-26 нед, Day 1: ~25-35 мм рт. ст.
- 27-32 нед, Day 1: ~30-45 мм рт. ст.
- 33-37 нед, Day 1: ~40-55 мм рт. ст.

### Rule of thumb
- Mean BP ≥ GA in nedeli (e.g., 28 нед = МАР ≥28 мм рт. ст.) — rough lower threshold

## Hypotension assessment

### Don't treat numbers alone
- Capillary refill <3 seconds
- Adequate urine output (≥1 мл/кг/ч)
- Normal lactate (<2.0 ммоль/л)
- Stable HR
- Pink mucous membranes

### Concerning signs
- Capillary refill >3-4 sec
- Cool extremities (cold shock)
- OR warm extremities + flash refill (warm shock — sepsis)
- Lactate rising
- Decreased urine output
- Altered mental status

## Treatment escalation

### Volume bolus first (если evidence гиповолемии)
- 10 мл/кг NaCl 0.9% over 5-10 мин
- Repeat × 1 PRN
- Не volume routinely (risk volume overload, IVH)

### Inotrope/vasopressor (selectively)

#### Cold shock (vasoconstricted, low CO)
- Dopamine 5-10 мкг/кг/мин first-line
- Add dobutamine 5-10 мкг/кг/мин если LV dysfunction
- Epinephrine 0.05-0.5 мкг/кг/мин если refractory

#### Warm shock (vasodilated, high CO, low SVR)
- Norepinephrine 0.05-0.5 мкг/кг/мин — first-line
- Vasopressin 0.0003-0.002 U/кг/мин (selective vasoconstrictor)

### Hydrocortisone (catecholamine-resistant)
- 1 мг/кг IV q6-8h
- Relative adrenal insufficiency у septic preterm
- Tapered over 5-7 дней

## Special situations

### HIE с TH
- Target MAP ≥40 мм рт. ст. (despite cooling)
- Dopamine first-line if hypotension

### PPHN
- Target BP normal-to-high (avoid systemic hypotension)
- Norepinephrine + vasopressin для cardiac support

### Sepsis
- Aggressive fluid resus
- Multiple inotropes if refractory
- Hydrocortisone

## Российская практика

КР МЗ РФ — вышеупомянутые принципы соответствуют международным. Centers активно используют point-of-care echocardiography для tailoring inotropes к hemodynamic profile.""",
        "references": [
            "Dempsey EM et al. Pediatrics 2014;133:1080",
            "Stranak Z et al. Eur J Pediatr 2014;173:793",
            "AAP CFN — Hemodynamic Support",
        ],
        "related_calculators": [],
    },
    {
        "id": "art-electrolyte-mgmt-elbw",
        "title_ru": "Управление электролитами ELBW",
        "title_en": "Electrolyte management ELBW",
        "topic": "metabolic", "audience": "neonatologist", "level": "advanced",
        "summary": "ELBW electrolyte abnormalities common: hypernatremia (insensible loss), hyperkalemia (NOHK), hypocalcemia. Avoid both extremes through careful titration.",
        "content": """## Sodium

### Day 1-3 (transitional)
- Physiologic diuresis + 5-10% body water loss
- Hold Na initially (concentration rises naturally)
- Watch для hypernatremia (>150 ммоль/л) у ELBW

### After diuresis
- 2-5 ммоль/кг/сут maintenance
- Higher если ↑ losses (drainage, polyuria)

### Hypernatremia management
- Increase free water (decrease Na concentration)
- Slow correction (not >0.5 ммоль/л/час) — risk cerebral edema
- Goal: normalize over 48-72 ч

### Hyponatremia
- Late onset usually water excess (SIADH, IVF dilution)
- Restrict free water
- Add Na PRN

## Potassium

### Non-Oliguric Hyperkalemia (NOHK) — ELBW phenomenon
- K+ shifts from intracellular → extracellular в ELBW (immature Na/K ATPase)
- Day 1-3 peak, K+ может reach 7-9 ммоль/л despite normal renal function
- Self-resolving по Day 4-7 если supportive

### Treatment severe hyperkalemia (K+ >7 ммоль/л)
- Calcium gluconate 1-2 мл/кг 10% slow IV (cardioprotective)
- Glucose + insulin: D10 2 мл/кг + insulin 0.05-0.1 ед/кг IV
- NaHCO₃ 1-2 ммоль/кг IV (если acidosis)
- Furosemide 1 мг/кг IV (if urine output adequate)
- Potassium-binding resin (kayexalate) — not routinely used neonates
- Continuous ECG monitoring

### Hypokalemia
- К+ 1-3 ммоль/кг/сут maintenance (after confirmed urination)
- Increase для diuretic users (furosemide)
- Recheck q12-24 h initially

## Calcium

### Early hypocalcemia (<24 ч)
- Common у preterm, IDM, asphyxia
- Often asymptomatic
- Treatment if Ca²⁺ <0.9 ионизированный OR symptomatic
- Calcium gluconate 1-2 мл/кг 10% slow IV (q6-8h)

### Late hypocalcemia (>72 ч)
- Phosphate-rich formula, vitamin D deficiency
- Workup: PTH, Vitamin D, magnesium

### Maintenance
- 60-100 мг/кг/сут IV elemental Ca
- Increase для bone disease prevention в preterm

## Phosphorus

### Bone health
- Phosphorus 1-2 ммоль/кг/сут TPN
- Calcium-phosphorus ratio 1.0-1.5:1 mass

### Hypophosphatemia
- Common in preterm с rapid growth
- Treatment: oral or IV phosphate

## Magnesium

### Hypomagnesemia
- Mg <1.5 мг/дл (<0.6 ммоль/л)
- Refractory hypocalcemia clue
- Treatment: MgSO₄ 25-50 мг/кг IV slow

### Hypermagnesemia
- Maternal MgSO₄ pre-delivery — transient в newborn
- Hypotonia, respiratory depression
- Self-resolving

## Acid-base

### Permissive hypercapnia (RDS)
- pH 7.20-7.30 acceptable
- Avoid bicarbonate routinely
- Treat underlying cause

### Metabolic acidosis
- Investigate: hypoperfusion, sepsis, IEM, renal tubular acidosis
- Bicarbonate reserved для severe (pH <7.0) + adequate ventilation""",
        "references": [
            "ESPGHAN/ESPEN/ESPR/CSPEN PN Guidelines 2018",
            "Vemgal P, Ohlsson A. Cochrane 2012 — Hyperkalemia",
            "AAP CFN — Electrolyte Management",
        ],
        "related_calculators": [],
    },
    {
        "id": "art-iem-screening-management",
        "title_ru": "Inborn Errors of Metabolism — screening + emergency",
        "title_en": "IEM — screening + emergency management",
        "topic": "metabolic", "audience": "neonatologist", "level": "advanced",
        "summary": "Suspected IEM: high index suspicion + prompt action. STOP protein, start glucose, ammonia + critical sample. Time-to-treatment correlates с outcome.",
        "content": """## When to suspect IEM

### Clinical patterns
- Sudden deterioration в previously well newborn (Day 2-7 типично)
- Hypotonia / encephalopathy
- Vomiting / poor feeding (особенно после feeds initiated)
- Seizures
- Acidosis с ↑ anion gap
- Hypoglycemia (recurrent / severe)
- Hyperammonemia
- Unusual odor (maple syrup, sweaty feet, fishy)
- Family history previous neonatal death без cause

## Initial workup

### Stat labs
- Blood glucose
- ABG
- Lactate
- Ammonia (urgent — N-fold increase)
- Electrolytes
- Liver function
- Coagulation
- Urine ketones, reducing substances, organic acids
- Plasma amino acids
- Acylcarnitines
- Save sample для metabolic screen

### Critical sample при event
Если BG <2.6 OR symptomatic:
- Insulin
- C-peptide
- Cortisol
- Growth hormone
- β-hydroxybutyrate
- Free fatty acids
- Lactate
- Ammonia
- Urine ketones
- Urine reducing substances

## Emergency management

### STOP protein
- Hold protein-containing nutrition (TPN amino acids, formula, breast milk)
- Most important first step

### START glucose
- D10W IV at GIR 8-10 мг/кг/мин (anabolic switch)
- Provides glucose for energy без protein breakdown
- Reduces endogenous protein catabolism

### Manage hyperammonemia
- Sodium benzoate + sodium phenylacetate (Ammonul) IV bolus + infusion
- L-arginine 200-600 мг/кг (urea cycle)
- Carnitine 100 мг/кг/сут (adjuvant)
- Dialysis criteria: NH3 >500 ммоль/л OR не снижается за 4-6 ч

### Specific treatments

#### Methylmalonic acidemia (MMA), B12-responsive
- OH-cobalamin 1 мг IM × 3-5 дней trial
- 50% B12-responsive (CblA, CblB, CblC)

#### Maple Syrup Urine Disease (MSUD)
- BCAA-restricted formula
- Dialysis при leucine >1500 µmol/L

#### Galactosemia
- STOP lactose immediately (formula change to soy/elemental)
- Start ABX (E. coli sepsis common)

#### Tyrosinemia type I
- NTBC (nitisinone) — life-saving
- Liver transplant ultimate

## Long-term

### Genetic counseling
- Most IEM autosomal recessive
- 25% recurrence risk
- Prenatal testing options

### Multidisciplinary follow-up
- Metabolic specialist
- Genetic counselor
- Dietitian (specialized formulas)
- Pediatric subspecialists per system involved

## Российская практика

С 2023 расширенный neonatal screening на 36 заболеваний — early detection многих IEM. Centers metabolic с резервом emergency management.""",
        "references": [
            "Häberle J et al. JIMD 2019;42:1",
            "Saudubray JM et al. Inborn Metabolic Diseases 6th ed.",
            "MZ RF Приказ № 274н 2022",
        ],
        "related_calculators": [],
    },
    {
        "id": "art-bpd-prevention-bundle",
        "title_ru": "BPD prevention bundle 2024",
        "title_en": "BPD prevention bundle 2024",
        "topic": "respiratory", "audience": "neonatologist", "level": "intermediate",
        "summary": "Multimodal BPD prevention: antenatal стероиды, gentle ventilation, early CPAP, surfactant LISA, caffeine universal, vit A, optimal nutrition, targeted SpO₂.",
        "content": """## Background

BPD остаётся most common chronic disease preterm survivors. Multimodal bundle approach снижает incidence + severity.

## Bundle components

### 1. Antenatal preparation
- Antenatal corticosteroids 24-34 нед
- Magnesium sulfate <32 нед (neuroprotection but may benefit lung)
- Optimize gestational age at delivery

### 2. Delivery room
- Plastic bag/wrap для preterm <32 нед
- DCC ≥60 секунд если stable
- Initial FiO₂ 21-30%
- Sustained inflation NOT recommended (after SAIL)
- Avoid intubation if possible — early CPAP

### 3. Surfactant — LISA preferred
- Indication: FiO₂ >0.30 на CPAP
- Curosurf 200 мг/кг (preferred — Cochrane outcomes)
- LISA technique avoids volutrauma від IPPV

### 4. Ventilation strategy
- Volume-targeted ventilation (VTV)
- VT 4-6 мл/кг
- PEEP 5-7 cmH₂O
- Permissive hypercapnia (PaCO₂ 45-55)
- Wean aggressively

### 5. Caffeine universal preterm <32 нед
- Loading 20 мг/кг + maintenance 5-10 мг/кг q24h
- Снижает BPD by 36% (CAP trial)
- IQ improvement at 11 yr

### 6. Targeted SpO₂
- 90-95% optimal (BOOST/SUPPORT)
- Avoid <88% (mortality, NEC)
- Avoid >97% (BPD, ROP)

### 7. Vitamin A 5000 IU IM 3×/нед × 4 нед
- Cochrane: reduces BPD у ELBW
- Underutilized in many NICUs

### 8. Optimal nutrition
- Early aggressive AA + lipids
- 110-130 ккал/кг/сут стабильный VLBW
- Mom's own milk preferred

### 9. PDA management timely
- hsPDA prolongs ventilation, edema
- Early treatment (медикаментозный) при clinical signs

### 10. Infection prevention
- VAP bundle, CLABSI bundle
- Reduce ABX duration when negative cultures

## Established BPD treatment

### Low-dose dexamethasone (DART scheme)
- 0.075 мг/кг/сут × 3 days, taper 0.05 → 0.025 → 0.01, total 10 days
- After Day 7-14 в ventilator-dependent
- Снижает extubation failure без significant ↑ ДЦП

### Diuretics PRN
- Furosemide chronically — limited evidence
- Reserved для severe BPD с edema

### Inhaled corticosteroids
- Budesonide 0.5-1 мг q12h (если on ventilator)
- May benefit some but не universal

### BPD-PHTN
- Echo screen at 36 нед PMA
- Sildenafil chronically
- Bosentan для severe

## Long-term care

### Respiratory follow-up
- Pulmonology specialist
- Home O₂ if needed
- Palivizumab eligibility (RSV season)

### Growth + development
- Specialized nutrition (extra calories)
- Developmental clinic monitoring
- Early intervention referral""",
        "references": [
            "Jensen EA et al. JAMA Pediatr 2019;173:e190988",
            "Schmidt B et al. NEJM 2007;357:1893 — CAP",
            "Doyle LW et al. NEJM 2006;355:1304 — DART",
            "Sweet DG et al. Neonatology 2023;120:3",
        ],
        "related_calculators": ["neo-bpd-nih"],
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
    merge_into(DIR / "neonatal-clinical-cases.json", "cases", NEW_CASES, "1.2.0")
    merge_into(DIR / "neonatal-common-mistakes.json", "mistakes", NEW_MISTAKES, "1.2.0")
    merge_into(DIR / "neonatal-atlas.json", "atlas", NEW_ATLAS, "1.2.0")
    merge_into(DIR / "neonatal-procedure-checklists.json", "checklists", NEW_CHECKLISTS, "1.2.0")
    merge_into(DIR / "neonatal-procedure-videos.json", "videos", NEW_VIDEOS, "1.2.0")
    merge_into(DIR / "neonatal-articles.json", "articles", NEW_ARTICLES, "2.0.0")
    print(f"\nTotal added across 6 banks: {5+5+5+3+3+5} = 26 educational items")


if __name__ == "__main__":
    main()
