"""Add 5 new neonatal drugs (azithromycin, clonidine, vasopressin, iNO, budesonide)
to public/neonatal-monographs.json. These are not present in existing 128-drug DB.

Run: python scripts/add-neo-drugs.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-monographs.json"

NEW_DRUGS = [
    {
        "id": "neo_azithromycin",
        "name_en": "Azithromycin",
        "name_ru": "Азитромицин",
        "brand": "Zithromax, Sumamed",
        "indications": (
            "Pertussis (Bordetella pertussis); chlamydia neonatal "
            "(conjunctivitis, pneumonia); alternative к erythromycin с лучшим "
            "side-effect profile."
        ),
        "dose": (
            "Pertussis (treatment + prophylaxis): 10 мг/кг q24h PO × 5 дней. "
            "Chlamydia neonatal (CDC 2021): 20 мг/кг q24h PO × 3 дня. "
            "Other infections: 10 мг/кг q24h × 5 дней."
        ),
        "route": "PO (preferred); IV slow infusion 60 мин (если PO не tolerated)",
        "levels": (
            "Bioavailability PO ~38%; t½ 50-70 ч (tissue accumulation); "
            "concentration intracellular very high; hepatic excretion (most), "
            "renal (small)."
        ),
        "precautions": (
            "IHPS (infantile hypertrophic pyloric stenosis) — risk lower than "
            "erythromycin (~5× less), но possible у newborn < 6 нед. QT "
            "prolongation rare у н/р. Hepatic enzyme elevation rare. Drug "
            "interactions: amiodarone (additive QT), digoxin (↑ levels), "
            "warfarin (↑ INR)."
        ),
        "extemporaneous": "Standard suspension 40 мг/мл (200 мг/5 мл).",
        "references": (
            "CDC Pertussis 2017; CDC STD Treatment Guidelines 2021; AAP Red "
            "Book 2021-2024; NeoFax / Neonatal Formulary 9 ed (Ainsworth)."
        ),
        "fullText": (
            "Zithromax Sumamed Pertussis chlamydia neonatal alternative "
            "erythromycin macrolide 10 мг/кг q24h PO 5 дней 20 мг/кг q24h PO "
            "3 дня CDC 2021 Bioavailability 38% t½ 50-70 ч tissue accumulation "
            "IHPS pyloric stenosis QT amiodarone digoxin warfarin AAP Red Book "
            "NeoFax newborn antibiotic"
        ),
    },
    {
        "id": "neo_clonidine",
        "name_en": "Clonidine",
        "name_ru": "Клонидин",
        "brand": "Catapres, Клофелин",
        "indications": (
            "NAS adjunct (когда morphine alone insufficient — autonomic "
            "symptoms); sedation у механически вентилируемых (opioid-sparing); "
            "pre-medication для процедур; tapering от opioid infusion."
        ),
        "dose": (
            "NAS adjunct PO: 0.5-1 мкг/кг q3-4h (max 5 мкг/кг q3h). Combine с "
            "morphine 0.04-0.08 мг/кг q3-4h. IV continuous (sedation): 0.5-2 "
            "мкг/кг/ч continuous. IV bolus: 1-3 мкг/кг IV slow push 5 мин "
            "(procedural)."
        ),
        "route": "PO (NAS), IV continuous (sedation), IV bolus (procedure)",
        "levels": (
            "Onset PO 30-60 мин, IV 15-30 мин; peak 1-2 ч; t½ у н/р 6-12 ч. "
            "α2-adrenergic agonist — central sympatholytic effect."
        ),
        "precautions": (
            "Bradycardia (α2 → vagal effect) — особенно начинающее dose. "
            "Hypotension (sympatholysis) — caution у unstable. Withdrawal при "
            "abrupt discontinuation (rebound гипертензия) — taper. Sedation, "
            "respiratory depression (rare у н/р clinical doses). Antagonist: "
            "atipamezole 0.05 мг/кг IV (partial reversal)."
        ),
        "extemporaneous": (
            "PO suspension 100 мкг/мл; IV 5 мкг/мл (diluted from 100 мкг/мл "
            "vials)."
        ),
        "references": (
            "Hudak ML, Tan RC. AAP NAS Pediatrics 2012;129:e540. Agthe AG "
            "et al. Pediatrics 2009;123:e849. Cochrane α2-agonists for NAS "
            "2018. NeoFax / Neonatal Formulary 9 ed (Ainsworth)."
        ),
        "fullText": (
            "Catapres Клофелин NAS adjunct sedation opioid-sparing "
            "pre-medication withdrawal taper morphine 0.5-1 мкг/кг q3-4h "
            "0.5-2 мкг/кг/ч continuous α2-agonist Bradycardia Hypotension "
            "rebound гипертензия atipamezole AAP NAS Pediatrics 2012 Hudak "
            "Tan Agthe Cochrane NeoFax newborn"
        ),
    },
    {
        "id": "neo_vasopressin",
        "name_en": "Vasopressin",
        "name_ru": "Вазопрессин",
        "brand": "Pitressin",
        "indications": (
            "Refractory vasodilatory shock после high-dose catecholamines; "
            "septic warm shock (low SVR, normal/high CO); cardiac failure "
            "with low SVR (post-Fontan, post-CPB); catecholamine-resistant "
            "shock as adjunct."
        ),
        "dose": (
            "Start: 0.0001 ед/кг/мин (0.1 мЕД/кг/мин). Range: 0.0001-0.0007 "
            "ед/кг/мин (некоторые до 0.001). Max: 0.001 ед/кг/мин (beyond — "
            "risk ischemia). Titrate: ↑ 0.0001 ед/кг/мин q15-30 мин до "
            "response."
        ),
        "route": (
            "IV continuous infusion (central preferred — extravasation "
            "тяжёлая)"
        ),
        "levels": (
            "Antidiuretic hormone — V1 receptor → vasoconstriction; V2 "
            "receptor → antidiuretic effect. Onset rapid; non-catecholamine "
            "vasopressor."
        ),
        "precautions": (
            "Digital / cutaneous ischemia (V1 vasoconstriction в end-arteries). "
            "Mesenteric ischemia → NEC risk (особенно у preterm). Hyponatremia "
            "(V2 antidiuretic effect — SIADH-like). Hypokalemia, "
            "hyperbilirubinemia rare. Bradycardia (high dose). Use only after "
            "catecholamines (not first-line у н/р)."
        ),
        "extemporaneous": (
            "Standard 4 мкг/мл (4 мг + 250 мл D5W) — central line, или 8 "
            "мкг/мл (concentrated central). Stable 24 ч; D5W (НЕ Lactated "
            "Ringer); protect from light."
        ),
        "references": (
            "Choong K et al. NEJM 2009 — peds vasopressor-resistant shock. "
            "Surviving Sepsis Campaign Pediatric 2020. AHA 2019 PPHN "
            "Scientific Statement. NeoFax / Neonatal Formulary 9 ed."
        ),
        "fullText": (
            "Pitressin Refractory vasodilatory shock catecholamines septic "
            "warm shock low SVR cardiac failure post-Fontan post-CPB Start "
            "0.0001 ед/кг/мин Max 0.001 ед/кг/мин V1 vasoconstriction V2 "
            "antidiuretic Digital cutaneous ischemia Mesenteric NEC "
            "Hyponatremia SIADH Choong NEJM 2009 SSC Pediatric AHA PPHN "
            "NeoFax newborn ADH"
        ),
    },
    {
        "id": "neo_inhaled_nitric_oxide_ino",
        "name_en": "Inhaled Nitric Oxide (iNO)",
        "name_ru": "Ингаляционный оксид азота (iNO)",
        "brand": "INOmax",
        "indications": (
            "PPHN (persistent pulmonary hypertension of newborn) у term + "
            "late preterm (≥ 34 нед) с OI ≥ 15-25; severe PPHN secondary to "
            "MAS, sepsis, RDS, CDH (controversial); pre-ECMO trial."
        ),
        "dose": (
            "Initial: 20 ppm. Range: 5-20 ppm; reduce к 5-10 ppm после "
            "initial response. Wean: ↓ 5 ppm q4-12h до 5 ppm; затем ↓ 1 ppm "
            "q1-4h. Off: при FiO₂ < 50 % + stable PaO₂."
        ),
        "route": (
            "Inhalation через ventilator-integrated system (INOvent / INOmax "
            "DSir); dedicated NO line у inspiratory limb близко к ETT"
        ),
        "levels": (
            "Selective pulmonary vasodilator. Response definition: PaO₂ ↑ "
            "≥ 20 мм рт ст ИЛИ OI ↓ ≥ 15 % за 30 мин. Cylinder: 800 ppm "
            "INOmax."
        ),
        "precautions": (
            "Methemoglobinemia (NO oxidizes Hb) — мониторинг q12-24h; "
            "methylene blue 1-2 мг/кг IV antidote если methHb > 5 %. NO₂ "
            "formation (toxic) — continuous sampling в circuit, alarm "
            "< 5 ppm. Rebound pulmonary hypertension при abrupt стопе — "
            "gradual wean. Платformitelet inhibition (rare clinical "
            "bleeding). Worse outcomes у severe LV dysfunction (paradoxical "
            "RV unloading). FDA approved для term + late preterm; off-label "
            "у preterm < 34 нед (NEWNO + INNO-NEC negative)."
        ),
        "extemporaneous": "Не applicable — proprietary delivery system",
        "references": (
            "NINOS trial (Pediatrics 1997) — landmark. AAP COFN 2014 — "
            "Inhaled NO use в neonate. AHA 2019 PPHN scientific statement. "
            "Cochrane Inhaled NO for term/late preterm PPHN 2017. КР МЗ РФ "
            "ППН 2024."
        ),
        "fullText": (
            "INOmax PPHN persistent pulmonary hypertension newborn term late "
            "preterm OI 15-25 MAS sepsis RDS CDH ECMO 20 ppm Methemoglobinemia "
            "methylene blue NO₂ Rebound pulmonary hypertension Worse LV "
            "dysfunction NINOS 1997 AAP COFN 2014 AHA 2019 Cochrane "
            "methaemoglobin pulmonary vasodilator"
        ),
    },
    {
        "id": "neo_budesonide",
        "name_en": "Budesonide",
        "name_ru": "Будесонид",
        "brand": "Pulmicort, Pulmicort Respules",
        "indications": (
            "BPD prevention / treatment у preterm. Yeh's intratracheal "
            "budesonide trial (NEJM 2016) — mixed с surfactant — ↓ BPD. "
            "Inhaled chronic для established BPD (controversial — Bassler "
            "NEUROSIS 2015 mortality concern)."
        ),
        "dose": (
            "Intra-tracheal (Yeh protocol): 0.25 мг/кг intratracheal, mixed "
            "с 1-я доза surfactant; repeated с 2-я доза surfactant. Inhaled "
            "(nebulization): 500 мкг q12h via nebulizer × несколько недель. "
            "Range 200-500 мкг q12h chronic."
        ),
        "route": "Intra-tracheal (mixed с surfactant), inhalation nebulizer",
        "levels": (
            "Inhaled corticosteroid (ICS) — local anti-inflammatory effect. "
            "Less systemic absorption vs systemic dexamethasone — fewer "
            "adrenal suppression and neurodev concerns."
        ),
        "precautions": (
            "Yeh 2016 NEJM: ↓ BPD у extreme preterm; mixed-results на "
            "subsequent replication. Bassler NEUROSIS 2015: chronic inhaled "
            "budesonide у preterm — ↓ BPD но ↑ mortality (controversial). "
            "Local: oral candidiasis (rare у н/р не feeding orally), throat "
            "irritation. Subsequent meta-analyses: inhaled budesonide НЕ "
            "replaces systemic dexamethasone у severe BPD."
        ),
        "extemporaneous": (
            "Pulmicort respules: 0.5 мг/мл (preferred) или 0.25 мг/мл. For "
            "intratracheal: budesonide + surfactant mixed gently 30 sec "
            "before instilled через ETT."
        ),
        "references": (
            "Yeh TF et al. NEJM 2016;374:2229. Bassler D et al. NEUROSIS "
            "NEJM 2015;373:1497. Cochrane Inhaled corticosteroids для BPD "
            "2017. AAP CFN — BPD management. КР МЗ РФ БЛД 2024."
        ),
        "fullText": (
            "Pulmicort Respules BPD prevention treatment preterm Yeh "
            "intratracheal NEJM 2016 surfactant Bassler NEUROSIS 2015 "
            "mortality 0.25 мг/кг 500 мкг q12h nebulizer ICS inhaled "
            "corticosteroid candidiasis Cochrane 2017 dexamethasone"
        ),
    },
]


def main() -> int:
    """Add new drugs to monographs JSON, preserve existing data."""
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {d["id"] for d in data["drugs"]}
    added: list[str] = []
    for drug in NEW_DRUGS:
        if drug["id"] in existing_ids:
            print(f"Skip duplicate: {drug['name_en']} ({drug['id']})")
            continue
        data["drugs"].append(drug)
        added.append(drug["name_en"])

    # Sort by English name for stable ordering
    data["drugs"].sort(key=lambda d: d["name_en"].lower())

    # Bump version
    data["version"] = "2.3.0"
    data["lastUpdated"] = "2026-05-09"

    # Write back с минимальным diff (separators=' '/' ' для compactness like original)
    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Added {len(added)} drugs: {', '.join(added)}")
    print(f"Total drugs now: {len(data['drugs'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
