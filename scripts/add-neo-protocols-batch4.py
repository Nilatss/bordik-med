"""Add 5 new protocols to public/neonatal-guidelines.json.

40 -> 45 guidelines. Targets gaps в КР МЗ РФ + AAP/ESPGHAN.
"""
import json
import sys
from pathlib import Path

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-guidelines.json"

NEW_PROTOCOLS = [
    {
        "id": "guide_blood_transfusion_neonatal",
        "title_ru": "Трансфузия эритроцитарной массы — пороги (TOP/ETTNO 2020)",
        "title_en": "Neonatal RBC Transfusion — Thresholds",
        "category": "metabolic",
        "content": (
            "## Restrictive vs liberal — TOP / ETTNO 2020\n\n"
            "TOP (NEJM 2020) + ETTNO (JAMA 2020) — RCT сравнили restrictive vs liberal Hb transfusion thresholds у preterm < 1000 g. **Equivalent mortality + NDI; restrictive ↓ donor exposures.**\n\n"
            "## Hb thresholds (рестриктивный — preferred)\n\n"
            "| Состояние | Hb threshold (рестриктивный) |\n"
            "|---|---|\n"
            "| MV severe (FiO₂ > 35 %) | 110 g/l |\n"
            "| MV moderate / NIPPV | 100 g/l |\n"
            "| Stable + minimal support | 80 g/l |\n"
            "| Asymptomatic, off support | 70 g/l |\n\n"
            "## Volume + rate\n\n"
            "- 15-20 мл/кг PRBC over 2-4 ч\n"
            "- Cross-matched, irradiated (для CMV-negative у preterm), leukocyte-reduced\n"
            "- Slow rate в HCD/severe anemia (риск volume overload)\n\n"
            "## Symptoms regardless of Hb\n\n"
            "- Tachycardia persistent\n"
            "- Apneic episodes увеличиваются\n"
            "- Failure to thrive (acute drop)\n"
            "- Lactic acidosis\n\n"
            "## Источники\n\n"
            "- Kirpalani H et al. NEJM 2020;383:2639 — TOP\n"
            "- Franz AR et al. JAMA 2020;324:560 — ETTNO\n"
            "- Strauss RG. Transfusion 2008;48:626\n"
            "- КР МЗ РФ \"Анемия у новорождённых\" 2024"
        ),
        "references": [
            "Kirpalani H et al. NEJM 2020;383:2639 — TOP",
            "Franz AR et al. JAMA 2020;324:560 — ETTNO",
            "КР МЗ РФ Анемия 2024",
        ],
    },
    {
        "id": "guide_platelet_transfusion_planet2",
        "title_ru": "Трансфузия тромбоцитов — пороги (PlaNeT-2)",
        "title_en": "Platelet Transfusion — Thresholds",
        "category": "metabolic",
        "content": (
            "## PlaNeT-2 (NEJM 2019)\n\n"
            "Curley A et al — RCT сравнили restrictive (50,000) vs liberal (50,000) thresholds у preterm. **Restrictive (25,000) — equivalent или better outcomes.** Liberal threshold ↑ death/major bleeding.\n\n"
            "## Threshold rules (post-PlaNeT-2)\n\n"
            "| Ситуация | Threshold для transfusion |\n"
            "|---|---|\n"
            "| **Symptomatic bleeding** | Любой platelet count |\n"
            "| **Asymptomatic stable** | < 25 × 10⁹/л |\n"
            "| **Asymptomatic + risk факторы** (MV, sepsis, IVH, surgery в next 12-24 ч) | < 50 × 10⁹/л |\n"
            "| **Pre-procedure (LP, surgery)** | < 50 × 10⁹/л |\n\n"
            "## Volume + rate\n\n"
            "- 10-15 мл/кг platelet concentrate over 30-60 мин\n"
            "- 1 unit (60 мл) → ~50,000 ↑ для term newborn\n"
            "- ABO-compatible preferred; HLA-matched при NAIT\n\n"
            "## Special situations\n\n"
            "- **NAIT (Neonatal Alloimmune Thrombocytopenia):** Maternal или HPA-1a-negative platelets preferred; IVIG 1 г/кг daily × 2-5 d\n"
            "- **DIC:** treat underlying cause; transfuse при < 50 + bleeding\n"
            "- **ITP-like:** IVIG, steroids, не transfusion routinely\n\n"
            "## Источники\n\n"
            "- Curley A et al. NEJM 2019;380:242 — PlaNeT-2\n"
            "- Sola-Visner M. Hematology 2012\n"
            "- Roberts I. Br J Haematol 2008;141:312"
        ),
        "references": [
            "Curley A et al. NEJM 2019;380:242 — PlaNeT-2",
            "Sola-Visner M. Hematology 2012",
            "Roberts I. Br J Haematol 2008;141:312",
        ],
    },
    {
        "id": "guide_seizure_neonatal_management",
        "title_ru": "Неонатальные судороги — алгоритм управления",
        "title_en": "Neonatal Seizures — Management Algorithm",
        "category": "neuro",
        "content": (
            "## Подход\n\n"
            "1. **Recognize + confirm** — clinical observation + aEEG/EEG\n"
            "2. **Identify cause** — emergent Dx (HIE most common, IEM, sepsis, stroke, hypoglycemia, hypocalcemia, IVH, TORCH)\n"
            "3. **Stop seizure** — anticonvulsants algorithm\n"
            "4. **Treat underlying** — cooling если HIE; ABX если sepsis; IEM cocktail; etc.\n\n"
            "## Pharmacological algorithm (NeoLEV2 + Cochrane)\n\n"
            "### First-line: Phenobarbital\n"
            "- Loading: 20 мг/кг IV slow over 15-20 мин\n"
            "- Если seizures persist: repeat 10 мг/кг q15-30 мин до cumulative 40 мг/кг\n"
            "- Maintenance: 3-5 мг/кг q24h IV/PO (start 24 ч после loading)\n\n"
            "### Second-line: Levetiracetam (NeoLEV2 2020 — equivalent efficacy)\n"
            "- Loading: 40-60 мг/кг IV (max 100 мг/кг)\n"
            "- Maintenance: 20-40 мг/кг q12h IV/PO\n"
            "- Better safety profile vs phenobarbital (less sedation, no cognitive concerns)\n"
            "- Many centers now use as FIRST-line\n\n"
            "### Third-line: Phenytoin или Fosphenytoin\n"
            "- Phenytoin loading: 15-20 мг/кг IV slow over 20-30 мин\n"
            "- Fosphenytoin: 15-20 мг/кг PE IV (faster — over 5-10 мин)\n"
            "- Maintenance: 3-5 мг/кг q24h\n"
            "- Cardiac monitoring critical (arrhythmias, hypotension)\n\n"
            "### Refractory: Midazolam infusion или Lidocaine\n"
            "- Midazolam: bolus 0.05-0.15 мг/кг IV; infusion 0.06-0.4 мг/кг/h\n"
            "- Lidocaine: loading 2 мг/кг IV; infusion 6 мг/кг/h × 4 h, then 4 мг/кг/h × 12 h, then 2 мг/кг/h × 12 h\n"
            "- ⚠️ Lidocaine — НЕ при concurrent phenytoin (additive cardiac toxicity)\n\n"
            "### Pyridoxine (B6) trial\n"
            "- При refractory seizures (esp. neonatal-onset epilepsy): 100 мг IV trial\n"
            "- Pyridoxine-dependent epilepsy — rare, но treatable\n\n"
            "## Workup parallel\n\n"
            "- **Glucose** + electrolytes (Ca, Mg)\n"
            "- **CBC, CRP, blood culture** + LP (CSF cell count, glucose, protein, ПЦР HSV)\n"
            "- **Cranial УЗИ** + MRI brain\n"
            "- **EEG / aEEG** continuous\n"
            "- **TMS / plasma AA / urine OA** (IEM)\n"
            "- **Genetic testing** (если familial / refractory)\n\n"
            "## Cooling для HIE\n"
            "Если seizures + perinatal hypoxic event — cooling protocol активируется параллельно (см. art-cooling).\n\n"
            "## Источники\n\n"
            "- Sharpe C et al. Pediatrics 2020;145:e20193182 — NeoLEV2\n"
            "- Glass HC et al. J Pediatr 2017;184:200 — Seizure management\n"
            "- Painter MJ et al. NEJM 1999;341:485\n"
            "- ILAE Neonatal Seizures Classification 2021\n"
            "- КР МЗ РФ \"Неонатальные судороги\" 2024"
        ),
        "references": [
            "Sharpe C et al. Pediatrics 2020;145:e20193182 — NeoLEV2",
            "Glass HC et al. J Pediatr 2017;184:200",
            "Painter MJ et al. NEJM 1999;341:485",
            "ILAE 2021",
            "КР МЗ РФ Неонатальные судороги 2024",
        ],
    },
    {
        "id": "guide_neonatal_renal_replacement",
        "title_ru": "Заместительная почечная терапия (RRT) у новорождённых",
        "title_en": "Neonatal Renal Replacement Therapy",
        "category": "renal",
        "content": (
            "## Indications\n\n"
            "- Volume overload рефрактерный к diuretics + hyperkalemia рефрактерная\n"
            "- pH < 7.1 рефрактерный к bicarbonate\n"
            "- Uremia symptomatic (encephalopathy, pericarditis)\n"
            "- Ammonia > 500 µмоль/л + encephalopathy (IEM)\n"
            "- Drug overdose dialyzable (rare neonate)\n"
            "- Inborn errors metabolism (urea cycle, organic acidemias) с hyperammonemia\n\n"
            "## Modalities\n\n"
            "### Peritoneal Dialysis (PD) — preferred у newborn\n"
            "- Bedside placement Tenckhoff catheter (surgical)\n"
            "- Solution: 1.5-4.25 % dextrose (Dianeal)\n"
            "- Volume: 10-20 мл/кг fill (start low, titrate)\n"
            "- Cycles: 30-60 мин dwell, drain, repeat\n"
            "- Continuous (manual) или CAPD machine\n"
            "- **Advantages:** gentle, no anticoagulation, no central line, bedside\n"
            "- **Disadvantages:** slow clearance, peritonitis risk, abdominal access required\n\n"
            "### CRRT (Continuous Renal Replacement)\n"
            "- Newer pediatric machines: **CARPEDIEM** (Bellco), **NIDUS** (Quanta)\n"
            "- Designed для < 10 кг — small filters, low extracorporeal volume\n"
            "- Anticoagulation: heparin или citrate\n"
            "- Modes: CVVH, CVVHD, CVVHDF\n"
            "- **Advantages:** fast clearance, hemodynamic stability\n"
            "- **Disadvantages:** central line required, circuit clotting, higher technical complexity\n\n"
            "### Intermittent Hemodialysis (HD)\n"
            "- Rare у newborn (mostly older children)\n"
            "- High-flow vascular access required\n\n"
            "## CVVH/CVVHD у newborn\n\n"
            "- Blood flow: 4-8 мл/кг/мин\n"
            "- Replacement / dialysate fluid: 30-60 мл/кг/h\n"
            "- Anticoagulation regional citrate preferred (< heparin bleeding risk у newborn)\n"
            "- Strict input/output balance\n\n"
            "## Hyperammonemia rescue\n\n"
            "- Ammonia > 500 µмоль/л → emergent CRRT/HD (PD slower)\n"
            "- Concurrent: Ammonul (Na phenylacetate + benzoate), arginine HCl, carglumic acid\n"
            "- Goal NH3 < 200 within 24 ч\n\n"
            "## Источники\n\n"
            "- Selewski DT et al. Lancet 2018;391:e6 — RRT consensus\n"
            "- Ronco C et al. Pediatr Nephrol 2014 — CARPEDIEM\n"
            "- Coulthard MG et al. Lancet 2014 — NIDUS\n"
            "- Häberle J et al. J Inherit Metab Dis 2019;42:1 — UCD"
        ),
        "references": [
            "Selewski DT et al. Lancet 2018;391:e6",
            "Ronco C et al. Pediatr Nephrol 2014 — CARPEDIEM",
            "Coulthard MG et al. Lancet 2014 — NIDUS",
            "Häberle J et al. JIMD 2019;42:1",
        ],
    },
    {
        "id": "guide_extubation_failure_predictors",
        "title_ru": "Прогноз extubation success — predictors",
        "title_en": "Extubation Failure Predictors",
        "category": "respiratory",
        "content": (
            "## Definitions\n\n"
            "- **Successful extubation:** off MV ≥ 72 h без re-intubation\n"
            "- **Failed extubation:** re-intubation в первые 72 h post-extubation\n"
            "- Failure rate: 25-40 % preterm < 1500 g; 10-15 % term\n\n"
            "## Predictors of success\n\n"
            "### Clinical / vent settings\n"
            "- FiO₂ ≤ 0.30\n"
            "- PEEP ≤ 5 см H₂O\n"
            "- Set rate ≤ 15-20 / мин (if synchronized vent)\n"
            "- Spontaneous tidal volume ≥ 4 мл/кг\n"
            "- Peak inspiratory pressure ≤ 18-20\n"
            "- Adequate respiratory drive on minimum support\n"
            "- Stable hemodynamics (no inotropes ≥ 24 h)\n\n"
            "### Lab / imaging\n"
            "- pH > 7.25\n"
            "- PaCO₂ < 55-60\n"
            "- CXR — improving / stable lung disease\n"
            "- No active sepsis\n\n"
            "### Pre-extubation tests\n"
            "- **Spontaneous Breathing Trial (SBT):** put on minimum CPAP / endo-tracheal CPAP × 30-60 мин; observe для distress\n"
            "- **Cuff leak test:** post-extubation stridor risk если no leak\n"
            "- **Diaphragm function** (US — research)\n\n"
            "## Adjuncts post-extubation (boost success)\n\n"
            "### Caffeine\n"
            "- Loading 20 мг/кг IV → 5-10 мг/кг q24h\n"
            "- Started 24-48 h pre-extubation если not already on\n"
            "- ↓ Apnea, ↑ extubation success\n\n"
            "### Post-extubation NIPPV vs CPAP\n"
            "- **NIPPV** preferred over CPAP для < 1000 g (Cochrane 2017)\n"
            "- ↓ Re-intubation rate\n"
            "- ↓ BPD\n"
            "- Either acceptable для > 1000 g\n\n"
            "### Nasal high-flow (HFNC)\n"
            "- Alternative когда CPAP / NIPPV не tolerated\n"
            "- Less effective vs CPAP в severe RDS\n"
            "- Useful step-down\n\n"
            "## Failure markers (re-intubate)\n\n"
            "- Apnea > 4 / h despite caffeine\n"
            "- FiO₂ > 0.50 для maintain SpO₂\n"
            "- pH < 7.20 / PaCO₂ > 65\n"
            "- Severe distress\n"
            "- Hemodynamic instability\n\n"
            "## Calculator Bordik\n"
            "- neo-extubation-readiness (interactive checklist)\n"
            "- neo-resp-indices\n"
            "- neo-caffeine-dose\n\n"
            "## Источники\n\n"
            "- Lemyre B et al. Cochrane 2017:CD003212 — NIPPV post-extubation\n"
            "- Schmidt B et al. NEJM 2007;357:1893 — CAP\n"
            "- Goldsmith JP, Karotkin EH. Assisted Ventilation of Neonate 6th ed.\n"
            "- AAP COFN — Respiratory Support 2024"
        ),
        "references": [
            "Lemyre B et al. Cochrane 2017:CD003212",
            "Schmidt B et al. NEJM 2007;357:1893 — CAP",
            "Goldsmith JP, Karotkin EH. AVN 6th ed.",
            "AAP COFN 2024",
        ],
    },
]


def main() -> int:
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    existing = {g["id"] for g in data["guidelines"]}
    added = []
    for g in NEW_PROTOCOLS:
        if g["id"] in existing:
            continue
        # Add minimum required schema keys
        full = {
            "id": g["id"],
            "title_en": g["title_en"],
            "title_ru": g["title_ru"],
            "content": g["content"],
            "references": g["references"],
            "category": g["category"],
        }
        data["guidelines"].append(full)
        added.append(g["title_ru"])

    data["version"] = "1.5.0"
    data["lastUpdated"] = "2026-05-10"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Added {len(added)} protocols. Total: {len(data['guidelines'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
