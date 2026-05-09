"""Add category field to each guideline + add top-level `categories` map.

Categories used in NeonatalHandbook Протоколы tab grouping:
  - resuscitation: реанимация, медикации в родзале
  - respiratory: RDS, BPD, surfactant, ventilation, apnea, extubation
  - cardiovascular: PDA, PPHN, hypotension, TOF/TET spell
  - sepsis_infection: EOS/LOS, infections, ABX
  - neuro: HIE, seizures, IVH, cooling
  - gastro: NEC, feeding, PN, EN
  - metabolic: hypoglycemia, hyperkalemia, MSUD, IEM, BSA
  - bili: cholestasis, hyperbilirubinemia (currently in calc tab)
  - pain_nas_sedation: NAS, pain, sedation, analgesia
  - screening_discharge: newborn screening, ROP, CCHD, discharge, transport
  - prematurity_classification: ZVUR, classification, vaccination

Run: python scripts/categorize-neo-guidelines.py
"""
import json
import sys
from pathlib import Path

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-guidelines.json"

# Map id keyword -> category
ID_TO_CATEGORY: dict[str, str] = {
    "medications_for_neonatal_resuscitation": "resuscitation",
    "management_of_hypotension_in_preterm_infants": "cardiovascular",
    "non_emergency_intubation_protocol_medication": "resuscitation",
    "sucrose_analgesia_for_simple_neonatal_procedures": "pain_nas_sedation",
    "non_oliguric_hyperkalemia_nohk_in_extremely_low_birth_weight": "metabolic",
    "protocol_for_caffeine_citrate_use": "respiratory",
    "neonatal_parenteral_nutrition_pn_worksheet": "gastro",
    "basic_neonatal_parenteral_nutrition_pn_calculations": "gastro",
    "maple_syrup_urine_disease_msud_acute_decompensation_guidelin": "metabolic",
    "neonatal_resuscitation_medications": "resuscitation",
    "standard_concentrations_that_maybe_options_for_common_drips_": "resuscitation",
    "calculating_body_surface_area_bsa": "metabolic",
    "comparison_of_currently_marketed_surfactant_products": "respiratory",
    "tof_tet_spell_management": "cardiovascular",
    "thermal_management_golden_hour": "resuscitation",
    "hypothermia_transport_management": "screening_discharge",
    "extubation_readiness_assessment": "respiratory",
    "oral_feeding_readiness_preterm": "gastro",
    "newborn_metabolic_screening": "screening_discharge",
    "cchd_pulse_oximetry_screening": "screening_discharge",
    "rop_screening_timing": "screening_discharge",
    "nicu_discharge_criteria": "screening_discharge",
    "pphn_screening_diagnosis": "cardiovascular",
    "birth_asphyxia_criteria_p21": "neuro",
    "prematurity_classification": "prematurity_classification",
    "iugr_sga_aga_lga_classification": "prematurity_classification",
    "rds_classification_severity": "respiratory",
    "neonatal_cholestasis_workup": "bili",
    "therapeutic_hypothermia_hie_eligibility": "neuro",
    "vaccination_calendar_neonatal": "prematurity_classification",
    "sepsis_management_algorithm_eos_los": "sepsis_infection",
    "nec_medical_management": "gastro",
    "pda_management_protocol": "cardiovascular",
    "bpd_chronic_management": "respiratory",
    "pphn_treatment_algorithm": "cardiovascular",
    "nas_management_protocol": "pain_nas_sedation",
    "apnea_of_prematurity_management": "respiratory",
    "anemia_of_prematurity_management": "metabolic",
    "hypoglycemia_management_neonatal": "metabolic",
    "pain_management_neonatal_hierarchy": "pain_nas_sedation",
}

CATEGORIES_META = [
    {
        "id": "resuscitation",
        "title_ru": "Реанимация и стабилизация",
        "title_en": "Resuscitation & Stabilization",
        "order": 1,
    },
    {
        "id": "respiratory",
        "title_ru": "Респираторная поддержка",
        "title_en": "Respiratory Support",
        "order": 2,
    },
    {
        "id": "cardiovascular",
        "title_ru": "Сердечно-сосудистая система",
        "title_en": "Cardiovascular",
        "order": 3,
    },
    {
        "id": "sepsis_infection",
        "title_ru": "Сепсис и инфекции",
        "title_en": "Sepsis & Infections",
        "order": 4,
    },
    {
        "id": "neuro",
        "title_ru": "Неврология (ХИЭ, ВЖК, судороги)",
        "title_en": "Neurology (HIE, IVH, Seizures)",
        "order": 5,
    },
    {
        "id": "gastro",
        "title_ru": "ЖКТ и питание (NEC, PN, EN)",
        "title_en": "GI & Nutrition",
        "order": 6,
    },
    {
        "id": "metabolic",
        "title_ru": "Метаболизм и электролиты",
        "title_en": "Metabolic & Electrolytes",
        "order": 7,
    },
    {
        "id": "bili",
        "title_ru": "Гипербилирубинемия и холестаз",
        "title_en": "Hyperbilirubinemia & Cholestasis",
        "order": 8,
    },
    {
        "id": "pain_nas_sedation",
        "title_ru": "Боль, NAS, седация",
        "title_en": "Pain, NAS, Sedation",
        "order": 9,
    },
    {
        "id": "screening_discharge",
        "title_ru": "Скрининги, транспорт, выписка",
        "title_en": "Screening, Transport, Discharge",
        "order": 10,
    },
    {
        "id": "prematurity_classification",
        "title_ru": "Классификации и вакцинация",
        "title_en": "Classifications & Vaccination",
        "order": 11,
    },
]


def main() -> int:
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    not_categorized: list[str] = []
    for g in data["guidelines"]:
        # Strip "guide_" prefix to match keys
        key = g["id"].removeprefix("guide_")
        category = ID_TO_CATEGORY.get(key)
        if category is None:
            not_categorized.append(g["id"])
            category = "other"
        g["category"] = category

    if not_categorized:
        print(f"WARNING: {len(not_categorized)} guidelines not categorized:")
        for gid in not_categorized:
            print(f"  - {gid}")

    # Add categories meta at top level
    data["categories"] = CATEGORIES_META

    # Bump version
    data["version"] = "1.4.0"
    data["lastUpdated"] = "2026-05-09"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    # Count per category
    counts: dict[str, int] = {}
    for g in data["guidelines"]:
        cat = g.get("category", "other")
        counts[cat] = counts.get(cat, 0) + 1
    print("\nCategory distribution:")
    for cat in sorted(counts.keys()):
        print(f"  {cat}: {counts[cat]}")
    print(f"\nTotal: {len(data['guidelines'])} guidelines, {len(CATEGORIES_META)} categories")
    return 0


if __name__ == "__main__":
    sys.exit(main())
