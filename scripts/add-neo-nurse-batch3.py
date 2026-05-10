"""+5 nurse procedures (15 → 20)."""
import json, sys
from pathlib import Path
if sys.stdout.encoding != "utf-8": sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-nurse-procedures.json"


def proc(id_, ru, en, category, dur, audience, steps, warnings, refs):
    return {"id": id_, "title_ru": ru, "title_en": en, "category": category,
            "duration_min": dur, "audience": audience, "steps": steps,
            "warnings": warnings, "references": refs}


def step(title, items):
    return {"title": title, "items": items}


NEW = [
    proc("proc-cord-care",
         "Уход за пуповинной культёй",
         "Cord Care",
         "monitoring", 3, "nursing + parents",
         [
             step("Approach по WHO 2017", [
                 "Развитые страны: dry cord care — стандарт",
                 "Endemic / high-mortality settings: chlorhexidine 4 % gluconate (Imdad Cochrane 2013) — ↓ omphalitis + neonatal mortality",
                 "Никаких alcohol / antiseptic routinely в развитых странах",
                 "Никаких bandages — keep open + dry",
             ]),
             step("Daily care", [
                 "Сохранять stump dry",
                 "Fold diaper below stump (не cover)",
                 "Avoid getting stump wet (sponge bath only)",
                 "Examine ежедневно: redness, discharge, bleeding",
                 "Stump falls off 5-15 d (first month)",
             ]),
             step("Когда concerning — alert physician", [
                 "Erythema > 5 mm extending от cord (omphalitis)",
                 "Purulent discharge",
                 "Foul smell",
                 "Persistent bleeding > drops",
                 "Stump > 4 weeks без falling off (delayed separation)",
                 "Granuloma persisting > 4 weeks (silver nitrate cauterization)",
             ]),
             step("Parent education", [
                 "Wash hands перед contact",
                 "Keep clean + dry",
                 "Don't pull stump",
                 "Document any concerns",
                 "Когда seek attention",
             ]),
         ],
         [
             "Hexachlorophene (banned routine — neurotoxic)",
             "Iodine antiseptics — absorbed → hypothyroidism у newborn (avoid)",
             "Tying or pulling stump — bleeding risk + infection",
             "Omphalitis untreated → necrotizing fasciitis (rare — extremely high mortality)",
         ],
         [
             "WHO Postnatal Care 2022",
             "Imdad A et al. Cochrane 2013:CD009741",
             "AAP / AWHONN — Neonatal Skin Care 4th ed.",
         ]),

    proc("proc-developmental-positioning",
         "Developmental positioning",
         "Developmental Positioning",
         "monitoring", 5, "nursing",
         [
             step("Goals", [
                 "Promote midline orientation",
                 "Support flexed posture (fetal-like)",
                 "Prevent neuromusculoskeletal abnormalities",
                 "Encourage hand-to-mouth motor development",
                 "Comfort + reduce stress",
             ]),
             step("Position changes q3-4h", [
                 "Supine (back) — preferred sleep position post-discharge",
                 "Side-lying (left or right) — alternate",
                 "Prone — only with continuous monitoring (NICU only — НЕ для home sleep!)",
                 "30-45° HOB upright after feeds",
             ]),
             step("Side-lying technique", [
                 "Roll infant к side gently",
                 "Support back с rolled blanket",
                 "Bring hands к midline (chest level)",
                 "Knees flexed slightly",
                 "Head в neutral position",
             ]),
             step("Prone technique (NICU only)", [
                 "Continuous monitoring (SpO₂, HR, breathing)",
                 "Head turned к side (alternate)",
                 "Knees tucked under (frog position)",
                 "Hands к midline",
                 "Improves oxygenation (better V/Q matching)",
             ]),
             step("Containment / facilitated tucking", [
                 "Boundaries / nests (rolled blankets) — feeling of containment",
                 "Hand placement on infant's chest + bottom (gentle pressure)",
                 "During painful procedures",
                 "Calming + reduces stress",
             ]),
             step("AVOID", [
                 "Prolonged supine flat без turns (positional plagiocephaly)",
                 "Hyperextension neck (airway compromise)",
                 "Prolonged prone после discharge (SIDS risk)",
                 "Tight swaddling preventing extremity movement",
             ]),
         ],
         [
             "SIDS risk у prone sleep после discharge — supine ALWAYS for home",
             "Plagiocephaly (positional flat head) у prolonged single position",
             "Torticollis у consistent head-turned-к-one-side",
             "Hip dislocation risk у tight swaddling without natural hip flexion",
             "Aspiration у improper positioning post-feed",
         ],
         [
             "Symington A, Pinelli J. Cochrane 2020:CD001814 — NIDCAP",
             "AAP Task Force on SIDS. Pediatrics 2022;150:e2022057990",
             "AWHONN Perinatal Nursing 5th ed.",
         ]),

    proc("proc-blood-transfusion",
         "Переливание PRBC у новорождённого",
         "PRBC Transfusion",
         "procedures", 60, "nursing",
         [
             step("Pre-transfusion verification", [
                 "ID match: infant + blood product + medical record (independent двух RNs)",
                 "Group + Rh + crossmatch verified",
                 "Irradiated (для CMV-negative у preterm) + leukocyte-reduced",
                 "Volume calculated: 10-20 мл/кг (typically 15)",
                 "Indication documented (Hb threshold met)",
                 "Consent obtained",
             ]),
             step("Pre-transfusion baseline", [
                 "Vital signs (HR, RR, BP, T, SpO₂)",
                 "Pre-transfusion Hb + HCT",
                 "Document baseline assessment",
                 "Verify line patency",
             ]),
             step("Administration", [
                 "Use blood-specific infusion set (filter included)",
                 "Slow rate: 5 мл/кг/h initially × 15 мин — observe для acute reaction",
                 "Then increase к target rate (complete в 2-4 ч usually)",
                 "Total volume 10-20 мл/кг over 2-4 ч",
                 "Maintain warm: blood warmer if rate > 50 мл/h или у preterm < 1500 g",
                 "DON'T use IV pump для PRBC routine (can hemolyze) — use gravity или specialized blood pump",
             ]),
             step("Monitoring during", [
                 "Vital signs q15 мин first 30 мин, then q30 мин",
                 "SpO₂ continuous",
                 "Watch для:",
                 "  - Hemolytic reaction: fever, hypotension, hemoglobinuria",
                 "  - TRALI: respiratory distress, hypoxemia",
                 "  - TACO: dyspnea, hypertension, fluid overload",
                 "  - Fever, chills",
                 "  - Allergic: hives, hypotension",
                 "  - Hyperkalemia (massive transfusion)",
             ]),
             step("Post-transfusion", [
                 "Vital signs after completion + 1 ч later",
                 "Repeat Hb 4-6 ч post-transfusion (verify increase)",
                 "Document transfusion-related observations",
                 "Continue routine monitoring",
             ]),
             step("If reaction occurs", [
                 "STOP transfusion immediately",
                 "Maintain IV access с saline",
                 "Notify physician + blood bank",
                 "Send remaining blood + new sample for workup",
                 "Document signs + symptoms",
                 "Treatment per reaction type",
             ]),
         ],
         [
             "Hemolytic reaction — life-threatening, often visible within first 15 мин",
             "TACO у preterm — slow transfusion + diuretics may be needed",
             "Hypothermia у unwarmed cold blood transfusion",
             "Hyperkalemia от massive transfusion or stored blood",
             "Citrate toxicity у large volume — hypocalcemia symptoms",
         ],
         [
             "AABB Standards for Blood Banks 2024",
             "AAP COFN — Pediatric Transfusion 2024",
             "Kirpalani H et al. NEJM 2020;383:2639 — TOP",
         ]),

    proc("proc-skin-care-preterm",
         "Уход за кожей недоношенных",
         "Preterm Skin Care",
         "monitoring", 4, "nursing",
         [
             step("Stratum corneum maturation", [
                 "Term: mature stratum corneum at birth",
                 "Late preterm: matures 2-4 weeks postnatally",
                 "VLBW < 1500 g: matures 4-8 weeks postnatally",
                 "ELBW < 1000 g: highest TEWL + permeability",
             ]),
             step("Bathing / cleansing", [
                 "Sponge bath only first 2 weeks у ELBW",
                 "Avoid bathing с soap у preterm < 30 нед",
                 "Plain warm water acceptable",
                 "Daily routine NOT necessary (drying + irritation)",
                 "After cord falls + skin matures — gentle pH-neutral cleanser",
             ]),
             step("Adhesive use", [
                 "Use minimal adhesive у preterm",
                 "Hydrocolloid barriers under tape (Mepilex Lite, DuoDERM)",
                 "Gentle removal (warm water + cotton swab)",
                 "Avoid adhesive removers chemicals",
                 "Rotate sites q2-4h для probes / monitoring devices",
             ]),
             step("Topical agents", [
                 "Petrolatum — safe + protective (apply thin layer)",
                 "AVOID:",
                 "  - Hexachlorophene (neurotoxic — banned routine)",
                 "  - Iodine antiseptics (absorbed → hypothyroidism)",
                 "  - Boric acid (toxic — banned)",
                 "  - Phenol-based (methemoglobinemia)",
                 "Chlorhexidine 0.5-2 % preferred antiseptic для procedures (NOT alcohol-based < 32 нед — burning)",
             ]),
             step("Diaper care", [
                 "Frequent changes (q1-2h newborn)",
                 "Air-dry время после change (если possible)",
                 "Barrier cream (zinc oxide, petrolatum)",
                 "AVOID baby powder (talc — aspiration risk)",
                 "Gentle wipes (water + cotton); avoid alcohol/fragranced wipes",
             ]),
             step("Pressure injury prevention", [
                 "Probe rotation q2-4h",
                 "ETT secure but not too tight",
                 "Regular position changes (containment / facilitated tucking)",
                 "Soft surface (gel pads, foam underlay у ELBW)",
                 "Skin assessment q hour during initial NICU stay",
             ]),
             step("Cord care", [
                 "Dry cord care — standard",
                 "Chlorhexidine 4 % cord — endemic / high-mortality settings (Imdad Cochrane 2013)",
                 "Watch для omphalitis signs",
             ]),
         ],
         [
             "Skin breakdown у ELBW — high TEWL + permeability + adhesives",
             "Iodine absorption → transient hypothyroidism у preterm",
             "Topical absorption higher у preterm (chlorhexidine, alcohol)",
             "Pressure injuries from probes / tape — frequent rotation",
             "Diaper rash — fungal / irritant — early treatment",
         ],
         [
             "AAP / AWHONN. Neonatal Skin Care 4th ed.",
             "WHO Postnatal Care 2022",
             "Lund CH et al. JOGNN 2001;30:30 — RCT skin care",
         ]),

    proc("proc-discharge-preparation",
         "Подготовка к выписке",
         "Discharge Preparation",
         "feeding", 30, "nursing + family",
         [
             step("Physiologic stability checklist", [
                 "Stable temperature в открытой кроватке × 24-48 ч",
                 "Apnea-free ≥ 5-7 d (off caffeine 5-7 d if applicable)",
                 "Adequate feeding (≥ 100-150 мл/кг/d enteral fully)",
                 "Weight gain 15-30 г/d",
                 "Stable hemodynamics",
                 "No active illness",
             ]),
             step("Required screenings complete", [
                 "Hearing screen (ABR / OAE) passed или follow-up arranged",
                 "CCHD pulse oximetry (24-48 h)",
                 "Newborn metabolic screen (РФ 36 / RUSP 35)",
                 "ROP exam если screened (preterm < 32 нед / BW < 1500 g)",
                 "Cranial UZI documented если preterm < 32 нед",
                 "Cardiac echo if clinically indicated",
             ]),
             step("Vaccinations", [
                 "HBV vaccine birth dose given",
                 "BCG (РФ — term ≥ 2000 g)",
                 "RSV prophylaxis если applicable (palivizumab или nirsevimab)",
                 "Vaccine schedule documented + handed to parents",
             ]),
             step("Family education + demonstration", [
                 "Safe feeding (breast или bottle technique)",
                 "Bath, diaper, skin care",
                 "Symptoms recognition (lethargy, poor feeding, fever, jaundice)",
                 "Safe sleep (back position, firm mattress, no soft bedding)",
                 "CPR / basic life support training (recommended)",
                 "Medication administration if on home meds",
                 "Home equipment if applicable (O₂, monitors, NG tube)",
                 "Когда seek emergent attention",
                 "Routine follow-up appointments",
             ]),
             step("Equipment / supplies", [
                 "Car seat (test passed if preterm — chair test)",
                 "Bottle supplies / bottles",
                 "Thermometer",
                 "Diapers + wipes",
                 "Home oxygen + tank (if applicable)",
                 "Feeding tube supplies (if applicable)",
                 "Pulse oximeter (selected high-risk only)",
             ]),
             step("Follow-up plan", [
                 "Pediatrician visit within 48-72 h post-discharge",
                 "High-risk follow-up clinic для VLBW / ELBW (developmental, OT, PT, audiology, ophthalmology)",
                 "Specialist appointments (cardiology, pulmonology, GI, neuro если indicated)",
                 "Lactation follow-up if breastfeeding",
                 "Social services / community resources contact info",
                 "WIC / nutrition program enrollment",
             ]),
             step("Medication reconciliation", [
                 "List all home meds (dose, route, frequency)",
                 "Demonstration administration",
                 "Refill plan",
                 "Drug interactions / cautions",
             ]),
             step("Documentation packet", [
                 "Discharge summary",
                 "Vaccine record",
                 "Birth certificate filing",
                 "Insurance enrollment",
                 "All test results",
                 "Specialist contact info",
                 "Emergency contact info",
             ]),
         ],
         [
             "Premature discharge у unstable infant — readmission rate ↑",
             "Inadequate parent education → dangerous home situations",
             "Missing vaccinations / screenings — long-term consequences",
             "Failure to thrive если feeding не established before discharge",
             "Unrecognized cardiac defect (если CCHD missed) — life-threatening",
         ],
         [
             "AAP COFN. Pediatrics 2008;122:1119 — Discharge of high-risk neonate",
             "Engle WA AAP COFN. Pediatrics 2007;120:1390 — Late preterm discharge",
             "AWHONN Perinatal Nursing 5th ed.",
         ]),
]


def main():
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    existing = {p["id"] for p in data["procedures"]}
    added = 0
    for p in NEW:
        if p["id"] in existing: continue
        data["procedures"].append(p)
        added += 1
    data["version"] = "1.2.0"
    data["lastUpdated"] = "2026-05-10"
    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Added {added} procedures. Total: {len(data['procedures'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
