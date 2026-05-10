"""+7 quizzes (8 → 15)."""
import json, sys
from pathlib import Path
if sys.stdout.encoding != "utf-8": sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-quizzes.json"

NEW = [
    {
        "id": "quiz-pphn",
        "title_ru": "PPHN — стойкая лёгочная гипертензия",
        "title_en": "PPHN — Persistent Pulmonary Hypertension",
        "topic": "cardiopulmonary",
        "level": "advanced",
        "questions": [
            {
                "q": "Какое начальное лечение PPHN после оптимизации gas exchange?",
                "options": ["Sildenafil PO 0.5-2 мг/кг q6h", "iNO 20 ppm", "Milrinone 0.25 мкг/кг/мин", "ECMO immediately"],
                "answer": 1,
                "explanation": "iNO 20 ppm — first-line при PPHN после оптимизации ventilation/oxygenation/sedation. Wean к 5 ppm, затем off при FiO₂ < 50 %. Sildenafil/milrinone — adjunct/escalation. ECMO — rescue при OI > 40."
            },
            {
                "q": "Critria для ECMO у PPHN-инфанта:",
                "options": ["OI > 15", "OI > 25 sustained", "OI > 40 sustained 4 ч despite optimal therapy", "OI > 60 always"],
                "answer": 2,
                "explanation": "OI > 40 sustained 4 ч despite iNO + medical therapy — стандартный ECMO threshold (ELSO 2023). GA ≥ 34 нед, BW ≥ 2 кг, reversible disease, без contraindications (severe IVH, lethal anomaly)."
            },
            {
                "q": "Какой preferred vasopressor для catecholamine-refractory warm shock у PPHN?",
                "options": ["Dopamine 5-10 мкг/кг/мин", "Vasopressin 0.0001-0.001 ед/кг/мин", "Phenylephrine 5-20 мкг/кг", "Hydrocortisone 1 мг/кг"],
                "answer": 1,
                "explanation": "Vasopressin 0.0001-0.001 ед/кг/мин — preferred при catecholamine-refractory warm shock (low SVR). Mechanism: V1 vasoconstriction. Choong NEJM 2009; SSC Pediatric 2020."
            },
            {
                "q": "PPHN screening: какая SpO₂ difference указывает на R-to-L shunt?",
                "options": ["Pre > Post by ≥ 5-10 %", "Pre < Post by ≥ 5 %", "Equal SpO₂ обоих сторон", "Любая difference < 95 %"],
                "answer": 0,
                "explanation": "Pre-ductal SpO₂ (right hand) > Post-ductal (foot) by ≥ 5-10 % = R-to-L shunt через PDA. Это hallmark PPHN или ductal-dependent CHD. Reverse differential (post > pre) специфично для TGA + restrictive PFO."
            }
        ]
    },
    {
        "id": "quiz-nec",
        "title_ru": "Некротизирующий энтероколит (NEC)",
        "title_en": "Necrotizing Enterocolitis (NEC)",
        "topic": "gastro",
        "level": "advanced",
        "questions": [
            {
                "q": "Какой R-graphic finding pathognomonic для NEC?",
                "options": ["Distended bowel loops", "Pneumatosis intestinalis", "Cardiomegaly", "Pleural effusion"],
                "answer": 1,
                "explanation": "Pneumatosis intestinalis (foamy gas в стенке кишки) — pathognomonic для NEC, видна в 50 % cases на R-graph. Portal venous gas — менее частый но severe sign. Free air (Rigler's sign) — surgical perforation."
            },
            {
                "q": "Empiric ABX для NEC IIB+:",
                "options": ["Только ампициллин", "Ампициллин + гентамицин + метронидазол (triple)", "Цефтриаксон monotherapy", "Ванкомицин + меропенем"],
                "answer": 1,
                "explanation": "NEC IIB+ — triple-therapy: ампициллин 50-100 мг/кг q8h + гентамицин 4-5 мг/кг q24h + метронидазол 7.5 мг/кг q8-24h (anaerobic coverage). При CONS/MRSA risk — vancomycin вместо ампициллина."
            },
            {
                "q": "При каком Bell stage показана хирургия?",
                "options": ["Bell I", "Bell IIA", "Bell IIIA с deteriorating", "Bell IIIB (perforation, free air)"],
                "answer": 3,
                "explanation": "Bell IIIB (perforation, free air, peritonitis) — absolute indication к laparotomy + resection + enterostomy. ELBW < 1000 g unstable — peritoneal drainage (Moss NEJM 2006) как stabilization."
            },
            {
                "q": "Какая мера снижает NEC у preterm < 1500 g?",
                "options": ["Cow's milk formula early", "Mother's own milk preferred", "Aggressive feed advancement", "Routine probiotics всем"],
                "answer": 1,
                "explanation": "Mother's own milk ↓ NEC ~50 % vs formula (Quigley Cochrane 2019; Patel JAMA 2016 dose-response). Donor milk — second-best. Probiotics — controversial (AAP 2021 не routine). Trophic feeds + slow advancement дополнительно protective."
            }
        ]
    },
    {
        "id": "quiz-pda",
        "title_ru": "PDA / открытый артериальный проток",
        "title_en": "PDA / Patent Ductus Arteriosus",
        "topic": "cardiopulmonary",
        "level": "intermediate",
        "questions": [
            {
                "q": "ECHO критерий hemodynamically-significant PDA (HSPDA):",
                "options": ["Diameter < 1 мм", "Diameter ≥ 1.5 мм + LA:Ao > 1.5 + reverse diastolic flow", "Любой PDA в первые 24 ч", "Только при шуме > grade 3"],
                "answer": 1,
                "explanation": "HSPDA criteria: diameter ≥ 1.5 мм (или > 1.4 мм/кг) + LA:Ao > 1.5 + reverse/absent diastolic flow в descending aorta + LV dilation. Шум — clinical sign, но ECHO definitive."
            },
            {
                "q": "Доза ibuprofen lysine для closure PDA:",
                "options": ["1 мг/кг q24h", "10 мг/кг loading, 5 мг/кг q24h × 2", "20 мг/кг loading, 10 мг/кг q24h", "100 мг/кг single dose"],
                "answer": 1,
                "explanation": "Ibuprofen lysine: 10 мг/кг loading IV → 5 мг/кг q24h × 2 doses. Closure rate 70-80 %. Indomethacin alternative — 0.2 мг/кг loading → 0.1-0.2 мг/кг q12h × 2 (но больше renal toxicity). Paracetamol 15 мг/кг q6h × 3-7 d — newer alternative."
            },
            {
                "q": "Какой препарат для PDA closure имеет наилучший renal/GI safety profile?",
                "options": ["Indomethacin", "Ibuprofen", "Paracetamol IV", "Aspirin"],
                "answer": 2,
                "explanation": "Paracetamol (acetaminophen) IV — лучший safety profile (Cochrane 2020 Ohlsson). Equivalent ibuprofen efficacy. Hammerman 2011 first reports. Reserve indomethacin для специальных indications (severe IVH prevention)."
            }
        ]
    },
    {
        "id": "quiz-cooling-protocol",
        "title_ru": "Therapeutic Hypothermia — практический протокол",
        "title_en": "TH Practical Protocol",
        "topic": "neuro",
        "level": "advanced",
        "questions": [
            {
                "q": "Скорость rewarming после 72 ч cooling:",
                "options": ["Fast — 2 °C/ч", "Medium — 1 °C/ч", "Slow — 0.5 °C/ч × 6-8 ч", "Не важно — natural"],
                "answer": 2,
                "explanation": "Slow rewarming 0.5 °C / ч × 6-8 ч — критично! Быстрое rewarming → seizures, intracranial bleeding, electrolyte shifts. Sedation continues during rewarming. После 80 ч — wean sedation gradually."
            },
            {
                "q": "Какой anticonvulsant начинают при HIE seizures?",
                "options": ["Diazepam 0.5 мг/кг IV", "Phenobarbital 20 мг/кг IV (или levetiracetam 40-60 мг/кг)", "Phenytoin 15-20 мг/кг", "Lorazepam 0.05 мг/кг"],
                "answer": 1,
                "explanation": "Phenobarbital 20 мг/кг IV slow loading — стандарт первой линии при HIE seizures. NeoLEV2 2020 — levetiracetam 40-60 мг/кг IV equivalent efficacy с лучшим safety profile (некоторые center now use as first-line)."
            },
            {
                "q": "Целевая Hb во время cooling у HIE-инфанта:",
                "options": ["50-60 g/L", "80-90 g/L", "120-150 g/L (нормоксия + perfusion)", "> 200 g/L"],
                "answer": 2,
                "explanation": "Hb 120-150 г/л оптимально для O₂ delivery в poor-perfusion settings + cooling. Transfuse при Hb < 100 g/l если symptomatic. Avoid extreme polycythemia (> 200) — viscosity ухудшает microcirculation."
            }
        ]
    },
    {
        "id": "quiz-eos-puopolo",
        "title_ru": "Risk stratification EOS — Kaiser & Puopolo",
        "title_en": "EOS Risk Stratification — Kaiser & Puopolo",
        "topic": "infection",
        "level": "advanced",
        "questions": [
            {
                "q": "Kaiser EOS calculator применим для:",
                "options": ["Все newborns", "GA ≥ 35 нед только", "Term newborns с CHD", "ELBW < 1000 g"],
                "answer": 1,
                "explanation": "Kaiser EOS Calculator (Pediatrics 2024;154:e2023065267) — для GA ≥ 35 нед. Учитывает clinical condition + maternal risk factors + GBS status. Для preterm < 35 нед — Puopolo Tiered approach (AAP 2018)."
            },
            {
                "q": "Risk factors EOS materinski:",
                "options": ["Только GBS+", "GBS culture+, fever ≥ 38 °C, ROM ≥ 18 ч, GA < 37 нед, chorio, inadequate IAP", "Только chorioamnionitis", "Гестoзы preeclampsia"],
                "answer": 1,
                "explanation": "Maternal EOS risk factors: GBS+ (или unknown), maternal fever ≥ 38 °C intrapartum, ROM ≥ 18 ч до родов (PROM), GA < 37 нед, chorioamnionitis, inadequate intrapartum antibiotic prophylaxis (IAP). Все учитываются в Kaiser calculator."
            },
            {
                "q": "Длительность ABX курса при EOS culture-positive bacteremia (без meningitis):",
                "options": ["48-72 часа", "5 дней", "7-10 дней", "21 день"],
                "answer": 2,
                "explanation": "Bacteremia EOS без meningitis — 7-10 дней. Stop ABX при negative cultures × 36-48 ч у low-risk. Meningitis — 14-21 day. GBS meningitis — 14 d; Gram-negative meningitis — 21 d. Switch к narrow-spectrum по sensitivity результатам."
            }
        ]
    },
    {
        "id": "quiz-feeding-vlbw",
        "title_ru": "Питание VLBW (advancement protocols)",
        "title_en": "VLBW Feeding Advancement",
        "topic": "gastro",
        "level": "intermediate",
        "questions": [
            {
                "q": "Когда начинать trophic feeds у VLBW < 1500 g?",
                "options": ["Сразу после рождения", "Через 24-48 ч стабильности", "После 7 дней жизни", "Только после полного перехода с TPN"],
                "answer": 1,
                "explanation": "Trophic feeds (10-20 мл/кг/d) — начинать после первой стабилизации (24-48 ч), даже на TPN. Цель: stimulation gut + ↓ cholestasis + ↓ NEC + ↑ adaptive bowel growth. ESPGHAN 2022 supports early trophic for VLBW."
            },
            {
                "q": "Темп advancement enteral feeds у VLBW после 5-7 days trophic:",
                "options": ["10 мл/кг/d", "15-20 мл/кг/d", "30 мл/кг/d (быстро)", "Полные 150 мл/кг сразу"],
                "answer": 1,
                "explanation": "Advancement 15-20 мл/кг/d — стандарт для VLBW (ESPGHAN 2022). Быстрее (≥ 30 мл/кг/d) — controversial, может ↑ NEC у некоторых studies; slower than 15 — задерживает full enteral nutrition. Stop при apnea, residuals, distension."
            },
            {
                "q": "Когда добавлять human milk fortifier (HMF)?",
                "options": ["Сразу при первом feeding", "При достижении 80-100 мл/кг/d enteral", "После 30 дней жизни", "Никогда — full milk достаточно"],
                "answer": 1,
                "explanation": "HMF добавляется при 80-100 мл/кг/d enteral — обеспечивает adequate protein/Ca/P для bone mineralization. Стандарт 22-24 ккал/oz fortification. Без HMF preterm milk не покрывает potential growth needs у VLBW."
            }
        ]
    },
    {
        "id": "quiz-rop-treatment",
        "title_ru": "ROP screening + treatment 2024",
        "title_en": "ROP Screening + Treatment 2024",
        "topic": "ophthalmology",
        "level": "advanced",
        "questions": [
            {
                "q": "Когда первый ROP screen у GA 28 нед?",
                "options": ["В 32 нед PMA", "В 31 нед PMA", "В 4 нед PNA или 31 нед PMA — позднее из двух", "В 36 нед PMA"],
                "answer": 2,
                "explanation": "GA 27-30 нед: первый exam в 4 нед PNA или 31 нед PMA — whichever later. У GA 28 нед = 4 нед PNA = 32 нед PMA → 32 PMA (больше). GA 22-26 нед: с 31 PMA. GA 31-32 нед: с 4 нед PNA."
            },
            {
                "q": "Type 1 ROP — preferred treatment 2024:",
                "options": ["Laser photocoagulation only", "Anti-VEGF intravitreal (especially Zone I)", "Cryotherapy", "Vitrectomy"],
                "answer": 1,
                "explanation": "Anti-VEGF preferred 2024 для Zone I ROP: ranibizumab 0.2 мг (Lucentis — RAINBOW Lancet 2019) или bevacizumab 0.625 мг (Avastin — BEAT-ROP NEJM 2011). Laser photocoagulation — alternative для Zone II posterior. Aflibercept (Eylea) — newer option."
            },
            {
                "q": "Type 1 ROP по ETROP — какие критерии?",
                "options": ["Только Zone I + plus", "Zone I, любая stage + plus; ИЛИ Zone I, stage 3 без plus; ИЛИ Zone II, stage 2-3 + plus", "Stage 5 only", "Любой stage 3"],
                "answer": 1,
                "explanation": "Type 1 ROP (treatment indicated, ETROP 2003): (1) Zone I, любая stage с plus disease; (2) Zone I, stage 3 без plus; (3) Zone II, stage 2 или 3 с plus. Treatment within 48-72 ч. Type 2 — close observation."
            }
        ]
    }
]


def main():
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    existing = {q["id"] for q in data["quizzes"]}
    added = 0
    for q in NEW:
        if q["id"] in existing: continue
        data["quizzes"].append(q)
        added += 1
    data["version"] = "1.1.0"
    data["lastUpdated"] = "2026-05-10"
    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Added {added} quizzes. Total: {len(data['quizzes'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
