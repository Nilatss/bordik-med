"""+7 quizzes (15 → 22)."""
import json, sys
from pathlib import Path
if sys.stdout.encoding != "utf-8": sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-quizzes.json"

NEW = [
    {
        "id": "quiz-bpd-management",
        "title_ru": "БЛД — диагноз и management",
        "title_en": "BPD — Dx & Management",
        "topic": "respiratory", "level": "advanced",
        "questions": [
            {
                "q": "По NIH 2018 классификации, BPD grade 2 (moderate) определяется как:",
                "options": ["Любой O₂ supplement", "FiO₂ 0.21-0.30 на 36 нед PMA", "FiO₂ ≥ 0.30 ИЛИ ≥ 1 L/min ИЛИ NIPPV на 36 нед PMA", "Invasive MV"],
                "answer": 2, "explanation": "BPD grade 2 (moderate) per NIH 2018 (Higgins, Pediatrics 2018): NC FiO₂ ≥ 0.30 ИЛИ ≥ 1 L/min ИЛИ NIPPV на 36 нед PMA. Grade 1 (mild) = FiO₂ 0.21-0.30. Grade 3 (severe) = invasive MV."
            },
            {
                "q": "Какая мера снижает BPD risk у preterm?",
                "options": ["Routine high-FiO₂", "Caffeine citrate early start (≤ 3 d)", "Avoid antenatal corticosteroids", "Routine inhaled budesonide"],
                "answer": 1, "explanation": "CAP trial (Schmidt 2007) — caffeine citrate early start (≤ 3 d) ↓ BPD 36 % vs 47 % control. Также: ↓ MV duration, ↓ ROP. Permissive O₂ (90-95 %) + gentle MV дополнительно."
            },
            {
                "q": "DART postnatal dexamethasone — preferred у:",
                "options": ["Все preterm", "Preterm < 28 нед на MV ≥ 7-14 d с estimated BPD risk ≥ 50 %", "Preterm > 32 нед", "Term newborn"],
                "answer": 1, "explanation": "AAP COFN 2010 framework — postnatal dexamethasone (DART scheme — Doyle 2006 NEJM) reasonable у: < 28 нед, на MV ≥ 7-14 d, estimated BPD risk ≥ 50 % (using prediction tools). Дискуss benefits/risks с family. DART low-dose 0.89 мг/кг over 10 дней."
            }
        ]
    },
    {
        "id": "quiz-glucose-thresholds",
        "title_ru": "Glucose thresholds — PES 2015",
        "title_en": "Glucose Thresholds — PES 2015",
        "topic": "metabolic", "level": "intermediate",
        "questions": [
            {
                "q": "Treatment threshold у symptomatic newborn в первые 4 ч жизни (PES 2015):",
                "options": ["< 1.0 ммоль/л", "< 1.4 ммоль/л asymptomatic / < 1.7 symptomatic", "< 2.5 ммоль/л всем", "< 3.5 ммоль/л всем"],
                "answer": 1, "explanation": "PES 2015 thresholds (Thornton J Pediatr 2015): первые 4 ч жизни → < 1.7 ммоль/л symptomatic ИЛИ < 1.4 asymptomatic. 4-24 ч → < 2.2. > 24 ч → < 2.5. > 48 ч persistent → < 3.3 (workup IEM/CHI)."
            },
            {
                "q": "Workup persistent hypoglycemia > 48 ч жизни — какие критические samples?",
                "options": ["Только glucose", "Insulin, c-peptide, β-OH-butyrate, FFA, GH, cortisol, ammonia (during hypoglycemia)", "Только сахар + кетоны", "Только TSH"],
                "answer": 1, "explanation": "Critical sample (during low glucose < 2.5): insulin > 2 µE/мл (CHI), c-peptide, β-OH-butyrate (low в CHI vs high IEM), FFA (suppressed CHI), GH, cortisol (rule out adrenal insufficiency), ammonia (high в GLUD1 hyperinsulinism+hyperammonemia syndrome)."
            },
            {
                "q": "Glucagon stimulation test — какой response указывает на CHI?",
                "options": ["Glucose ↓ за 30 мин", "Glucose ↑ > 1.6 ммоль/л за 30 мин (positive)", "Не меняется", "Только sleep"],
                "answer": 1, "explanation": "Glucagon stimulation test: 0.03 мг/кг IM/IV during hypoglycemia. Glucose ↑ > 1.6 ммоль/л в 30 мин = positive (CHI characteristic — adequate glycogen stores + insulin-driven). IEM other (glycogen storage disease, fatty acid oxidation defects) → no response."
            }
        ]
    },
    {
        "id": "quiz-coag-thrombocytopenia",
        "title_ru": "Coagulopathy + thrombocytopenia",
        "topic": "hematology", "level": "advanced",
        "title_en": "Coagulopathy + Thrombocytopenia",
        "questions": [
            {
                "q": "Profilaktika VKDB — какая dose preferred?",
                "options": ["0.1 мг IV", "1 мг IM в первые 6 ч", "2 мг PO single dose", "5 мг IM"],
                "answer": 1, "explanation": "AAP 2022 + WHO: 1 мг IM Vit K в первые 6 ч жизни — стандарт всем. < 1500 г preterm: 0.5 мг IM. PO alternative (2 мг at birth + 2 мг 1 нед + 2 мг 4 нед) — менее эффективна, особенно для late VKDB."
            },
            {
                "q": "PlaNeT-2 (NEJM 2019) — рекомендуемый platelet transfusion threshold у asymptomatic stable preterm:",
                "options": ["< 100 × 10⁹/л", "< 75 × 10⁹/л", "< 50 × 10⁹/л", "< 25 × 10⁹/л"],
                "answer": 3, "explanation": "PlaNeT-2 — restrictive 25 × 10⁹/л preferred over liberal 50 × 10⁹/л. Liberal threshold ↑ death/major bleeding (Curley NEJM 2019). Asymptomatic + risk факторы (MV, sepsis, IVH, surgery в next 12-24 ч) → < 50. Symptomatic bleeding → транфузия при ANY count."
            },
            {
                "q": "NAIT (Neonatal Alloimmune Thrombocytopenia) — preferred первая линия?",
                "options": ["Random donor platelets only", "Maternal или HPA-matched platelets + IVIG 1 г/кг", "Только steroids", "Splenectomy"],
                "answer": 1, "explanation": "NAIT — antibodies destroy fetal platelets. Maternal или HPA-matched platelets preferred (won't be destroyed). IVIG 1 г/кг daily × 2-5 d blocks Fc receptors. Random donor platelets — bridge until matched available. ICH risk до 20 % untreated severe NAIT."
            }
        ]
    },
    {
        "id": "quiz-cyanosis-shock",
        "title_ru": "Cyanosis + shock differential",
        "title_en": "Cyanosis + Shock Differential",
        "topic": "cardiopulmonary", "level": "advanced",
        "questions": [
            {
                "q": "Hyperoxia test: PaO₂ < 100 на 100 % FiO₂ × 10 мин — какая диф diагноз?",
                "options": ["Sepsis only", "Cardiac cause (cyanotic CHD, ductal-dependent)", "Lung disease only", "Метheмoglobinemia only"],
                "answer": 1, "explanation": "Hyperoxia test: 100 % O₂ × 10 мин → ABG. Pulmonary cause: PaO₂ ≥ 150 (significant rise). Cardiac cause: PaO₂ < 100 (no rise — fixed shunting). Equivocal 100-150 → echo. PGE1 0.05-0.1 мкг/кг/мин при подозрении ductal-dependent CHD."
            },
            {
                "q": "Cold shock у newborn — preferred первый-line vasoactive agent:",
                "options": ["Dopamine 5 мкг/кг/мин", "Epinephrine 0.05-0.3 мкг/кг/мин", "Norepinephrine 0.05-1 мкг/кг/мин", "Vasopressin"],
                "answer": 1, "explanation": "Cold shock (low CO + high SVR): epinephrine 0.05-0.3 мкг/кг/мин — first-line (β1 inotropic dose). Warm shock (high CO + low SVR): noradrenaline first-line. Vasopressin для catecholamine-resistant warm shock. SSC Pediatric 2020."
            },
            {
                "q": "Pre-ductal SpO₂ значительно ниже post-ductal (reverse differential) — какой Dx?",
                "options": ["PPHN", "Coarctation aortae", "TGA с restrictive PFO", "RDS"],
                "answer": 2, "explanation": "Reverse differential (post-ductal SpO₂ > pre-ductal) — characteristic для TGA с restrictive PFO + critical PDA. Aorta receives deoxygenated blood (от RV-aorta), pulmonary artery receives oxygenated (от LV-PA). PDA crucial — PGE1 immediate."
            }
        ]
    },
    {
        "id": "quiz-extubation",
        "title_ru": "Extubation success — predictors",
        "title_en": "Extubation Success Predictors",
        "topic": "respiratory", "level": "advanced",
        "questions": [
            {
                "q": "Adequate respiratory drive marker для extubation у preterm на synchronized vent:",
                "options": ["FiO₂ ≤ 0.30, PEEP ≤ 5, set rate ≤ 15-20/мин, spontaneous TV ≥ 4 мл/кг", "Только FiO₂ < 0.50", "Только PEEP < 6", "Любые vent settings"],
                "answer": 0, "explanation": "Extubation readiness criteria: FiO₂ ≤ 0.30, PEEP ≤ 5, set rate ≤ 15-20/мин (если synchronized), spontaneous tidal volume ≥ 4 мл/кг, PIP ≤ 18-20, pH > 7.25, PaCO₂ < 55-60, no inotropes ≥ 24 ч. SBT helpful."
            },
            {
                "q": "Какая post-extubation поддержка preferred у preterm < 1000 г для уменьшения re-intubation?",
                "options": ["Room air sufficient", "HFNC", "NIPPV (Cochrane 2017 ↓ re-intubation)", "Spontaneous breathing only"],
                "answer": 2, "explanation": "Lemyre Cochrane 2017:CD003212 — NIPPV preferred over CPAP для < 1000 g post-extubation. ↓ Re-intubation rate, ↓ BPD. Either acceptable для > 1000 g. Caffeine citrate critical — start 24-48 ч pre-extubation если not already on."
            }
        ]
    },
    {
        "id": "quiz-cardiac-defects-screening",
        "title_ru": "Cyanotic CHD screening",
        "title_en": "Cyanotic CHD Screening",
        "topic": "cardiopulmonary", "level": "intermediate",
        "questions": [
            {
                "q": "CCHD pulse oximetry screen — критерии 'fail':",
                "options": ["SpO₂ < 90 % ИЛИ persistent < 95 % после 3 measurements + 1 ч ИЛИ ≥ 3 % difference", "Только SpO₂ < 95 %", "Только разница > 5 %", "Любая SpO₂ < 100 %"],
                "answer": 0, "explanation": "AAP/AHA Pediatrics 2011:e1259 — fail criteria: SpO₂ < 90 % (любая измерение); ИЛИ persistent < 95 % после 3 measurements + 1 ч; ИЛИ ≥ 3 % difference между pre + post-ductal. Fail → ECHO obligatory. Pass: ≥ 95 % обеих сторон AND difference < 3 %."
            },
            {
                "q": "Preferred timing CCHD screen:",
                "options": ["Сразу при рождении", "В 24-48 ч жизни (после adaptation)", "Только перед выпиской", "В 1 мес возраста"],
                "answer": 1, "explanation": "CCHD screen 24-48 ч жизни — после transitional circulation completed. Слишком ранний (< 24 ч) → false positives (PFO, PDA still patent). Для term + late preterm ≥ 35 нед. Sensitivity ~75 % для critical CHD missed prenatally."
            }
        ]
    },
    {
        "id": "quiz-nas-ess",
        "title_ru": "NAS — Modified Finnegan vs ESC",
        "title_en": "NAS — Modified Finnegan vs ESC",
        "topic": "pain_nas_sedation", "level": "intermediate",
        "questions": [
            {
                "q": "Modified Finnegan score ≥ какое значение × consecutive starts pharmacotherapy?",
                "options": ["≥ 5 × 1 раз", "≥ 8 × 3 consecutive", "≥ 10 × 1 раз", "≥ 15 × 1 раз"],
                "answer": 1, "explanation": "Modified Finnegan: 21 параметр, q3-4h scoring. Score ≥ 8 × 3 consecutive triggers pharmacotherapy. Score 8-12 → start morphine 0.04-0.08 мг/кг q3-4h. Score > 12 → higher initial dose. ESC alternative — functional approach (Eat, Sleep, Console)."
            },
            {
                "q": "BBORN trial 2017 (Kraft NEJM): buprenorphine vs morphine у NAS — primary result:",
                "options": ["Bupr хуже morphine", "Bupr equivalent + ↓ length of treatment + ↓ LOS", "Morphine лучше", "No difference"],
                "answer": 1, "explanation": "BBORN trial (Kraft NEJM 2017): buprenorphine sublingual 4-5 мкг/кг q8h vs morphine. Length of treatment 15 d (bupr) vs 28 d (morphine) — 47 % reduction. LOS 21 d vs 33 d. Equivalent safety. Bupr partial μ-agonist = ceiling effect, less respiratory depression."
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
    data["version"] = "1.2.0"
    data["lastUpdated"] = "2026-05-10"
    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Added {added} quizzes. Total: {len(data['quizzes'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
