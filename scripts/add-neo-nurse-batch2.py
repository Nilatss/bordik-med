"""+7 nurse procedures (8 → 15)."""
import json, sys
from pathlib import Path
if sys.stdout.encoding != "utf-8": sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-nurse-procedures.json"


def proc(id_, ru, en, category, dur, audience, steps, warnings, refs):
    return {
        "id": id_, "title_ru": ru, "title_en": en, "category": category,
        "duration_min": dur, "audience": audience, "steps": steps,
        "warnings": warnings, "references": refs,
    }


def step(title, items):
    return {"title": title, "items": items}


NEW = [
    proc("proc-blood-draw-heel",
         "Capillary blood draw (heel stick)",
         "Capillary Blood Draw (Heel Stick)",
         "monitoring", 5, "nursing + feldsher",
         [
             step("Indications", [
                 "POC glucose monitoring",
                 "Bilirubin (TcB не replace serum в high-risk)",
                 "CBC, CRP, electrolytes (small volumes)",
                 "Blood gas (capillary — only stable infants)",
                 "Newborn screening (NEMS Guthrie card)",
             ]),
             step("Equipment", [
                 "Sterile lancet (depth 1 mm preterm; 2 mm term)",
                 "Alcohol swab (avoid <32 нед — burning)",
                 "Capillary tube или Microtainer",
                 "Sucrose 24 % 0.5 мл (analgesia)",
                 "Gauze + plaster",
             ]),
             step("Site selection", [
                 "Lateral or medial PLANTAR aspect heel (avoid posterior — calcaneus)",
                 "Alternate sides q3-4h",
                 "Warm heel × 3-5 мин (warm cloth) — vasodilation",
                 "AVOID: bruised, infected, edematous areas",
             ]),
             step("Procedure", [
                 "Sucrose 0.5 мл oral 2 мин до stick",
                 "Pacifier + containment",
                 "Clean site с alcohol; let dry",
                 "Brief, single, decisive stick at 90° к skin",
                 "Wipe first drop (tissue fluid)",
                 "Allow large second drop без squeezing (squeeze contaminates)",
                 "Collect в Microtainer / capillary tube",
                 "Direct pressure × 30 sec post-stick",
                 "Observe для bleeding × 1-2 мин",
             ]),
             step("Documentation", [
                 "Site, attempt #",
                 "Volume drawn",
                 "Date + time",
                 "Adverse events (bruising, prolonged bleeding)",
             ]),
         ],
         [
             "Squeeze foot — falsely low values (tissue fluid contamination)",
             "Repeated sticks same site — bruising, calcaneal injury",
             "Vagal stimulation → bradycardia rare",
             "Pain — use analgesia всегда (sucrose ± skin-to-skin)",
             "Calcaneal osteomyelitis (rare) при deep stick через bone",
         ],
         [
             "AAP Pediatric Heel Stick Best Practices 2024",
             "WHO Guidelines on Drawing Blood 2010",
         ]),

    proc("proc-temp-monitoring",
         "Temperature monitoring (axillary, rectal, skin)",
         "Temperature Monitoring",
         "monitoring", 2, "nursing + feldsher",
         [
             step("Methods", [
                 "Axillary (preferred — safest у newborn): thermometer × 3-5 min",
                 "Rectal (more accurate когда needed) — DO NOT routine у preterm",
                 "Skin probe (servo-control в incubator) — continuous",
                 "Tympanic — НЕ для newborn (small ear canal)",
             ]),
             step("Frequency", [
                 "Stable term: q4h × first 24h, then q8h",
                 "NICU: q1-4h по acuity",
                 "Critical / cooling: continuous skin/rectal probe",
                 "Pre/post-procedure: extra check",
             ]),
             step("Normal ranges", [
                 "Axillary normal: 36.5-37.5 °C",
                 "Rectal normal: 36.6-37.6 °C (slightly higher)",
                 "Skin (servo): 36.0-36.5 °C target",
                 "Cooling target: 33.0-34.5 °C (whole-body) или 34.5-35.0 °C (head)",
             ]),
             step("Hypothermia management", [
                 "T < 36.5 → assess + warm (skin-to-skin, plastic wrap, incubator T ↑)",
                 "T < 36.0 → moderate hypothermia — incubator + warming protocol",
                 "T < 35.5 → severe — pre-warmed transport, sepsis workup",
                 "Recheck q15-30 мин during warming",
             ]),
             step("Hyperthermia management", [
                 "T > 37.5 → assess (sepsis? environment too warm?)",
                 "Reduce incubator T",
                 "Sepsis workup if persistent > 38.0",
                 "Acetaminophen 7.5-10 мг/кг q6h prn",
                 "AVOID: cold sponging, alcohol baths",
             ]),
             step("Documentation", [
                 "Temperature value + time",
                 "Method used (axillary/rectal/skin)",
                 "Trend over time",
                 "Interventions if abnormal",
             ]),
         ],
         [
             "Rectal probes у preterm — perforation risk; use carefully",
             "Mercury thermometers obsolete — environmental risk",
             "Crying / agitation → falsely elevated",
             "Cold extremity (peripheral) → poor SpO₂ probe signal — reposition",
         ],
         [
             "WHO Thermal Protection of Newborn 2017",
             "AAP COFN — Newborn Care 2024",
             "AWHONN Perinatal Nursing 5th ed.",
         ]),

    proc("proc-medication-admin",
         "Безопасная administration лекарств",
         "Safe Medication Administration",
         "procedures", 5, "nursing + feldsher",
         [
             step("5 rights (always check)", [
                 "RIGHT patient (band, name, DOB, MRN)",
                 "RIGHT drug (label match order)",
                 "RIGHT dose (mg/kg or mg total — recalculate weight)",
                 "RIGHT route (IV/IM/PO/sublingual/PR)",
                 "RIGHT time (frequency + administration time)",
             ]),
             step("Dose calculation neonate", [
                 "Always по weight — re-confirm latest weight",
                 "Most NICU drugs: mg/kg/dose × frequency = total daily",
                 "Round to nearest 0.05 мл (50 µл precision needed)",
                 "Use 1 мл insulin syringe для precise small volumes",
                 "Double-check высокого риска drugs (insulin, heparin, morphine, vasopressors) — independent двух RNs",
             ]),
             step("IV preparation", [
                 "Sterile technique (laminar flow hood ideal)",
                 "Single-use vials когда возможно (preservative-free)",
                 "Verify concentration after preparation",
                 "Label с: drug, dose, concentration, time prepared, expiry",
             ]),
             step("IV administration", [
                 "Verify line patency (gentle flush с saline)",
                 "Check compatibility если multi-drugs same line",
                 "Slow IV push (over 5+ мин) для most drugs у newborn",
                 "Continuous infusion: programmable pump (NEVER drip-set without pump у newborn)",
                 "Volume tracking — small volumes (< 1 мл) require special technique (T-piece, syringe pump)",
             ]),
             step("PO/NG administration", [
                 "Oral syringe (NOT IV syringe — accidental IV risk)",
                 "Position infant slightly upright",
                 "Slow administration cheek (avoid choking)",
                 "Flush NG с 1-2 мл воды after",
                 "Verify NG placement pH ≤ 5.5 BEFORE every dose",
             ]),
             step("IM injection", [
                 "Vastus lateralis (anterior thigh — preferred у newborn)",
                 "Avoid gluteal до age 18+ мес",
                 "23-25G needle, length ⅝ inch",
                 "Pre-medication sucrose 0.5 мл oral 2 мин до",
                 "Quick stick — minimize pain",
             ]),
             step("Documentation", [
                 "Time + route + dose given",
                 "Adverse reactions if any",
                 "Vital signs pre/post (для high-risk drugs)",
                 "Independent verification of high-alert drugs",
             ]),
         ],
         [
             "10x dose errors common у newborn — always verify decimals (0.5 vs 5.0)",
             "Heparin / insulin / morphine / vasopressors — high-alert drugs (independent double-check)",
             "Tubing dead space — small dose errors могут быть significant",
             "PO syringe не IV — wrong syringe = wrong route fatal",
             "Look-alike/sound-alike drugs (morphine vs midazolam, dopamine vs dobutamine)",
         ],
         [
             "ISMP — Institute for Safe Medication Practices guidelines",
             "AAP / NANN Pediatric Medication Safety 2024",
             "AWHONN Standards for Professional Nursing Practice",
         ]),

    proc("proc-skin-to-skin",
         "Kangaroo mother care (skin-to-skin)",
         "Kangaroo Mother Care",
         "monitoring", 60, "nursing + family",
         [
             step("Indications", [
                 "Stable term — routine все feedings",
                 "Late preterm + stable — daily 1+ hour sessions",
                 "Stable preterm < 32 нед — daily 30-60 min sessions",
                 "iKMC (immediate KMC) — даже unstable preterm в первые часы (WHO 2021)",
                 "Pre/post-procedure pain management",
                 "Bonding moments (любой gestation)",
             ]),
             step("Preparation", [
                 "Mother в comfortable chair с armrests",
                 "Warm room (≥ 26-28 °C)",
                 "Privacy curtain (modesty)",
                 "Mother's chest exposed (button-front shirt easier)",
                 "Infant в diaper только (or naked with hat)",
                 "Pre-warmed blanket для cover infant's back",
                 "Pacifier + breastpump available",
             ]),
             step("Positioning", [
                 "Infant prone, head turned к side",
                 "Skin-to-skin — direct contact (никакой clothing между)",
                 "Knees flexed (frog position)",
                 "Cover infant's back с blanket",
                 "Mother's hands support infant's bottom + back",
                 "Father / partner может также perform skin-to-skin",
             ]),
             step("Monitoring during", [
                 "SpO₂ continuous (preferred у preterm)",
                 "T core every 15-30 мин (axillary)",
                 "Heart rate, breathing pattern",
                 "Color (face visible)",
                 "Comfort signs (relaxed, sleeping)",
             ]),
             step("Duration", [
                 "Minimum 60 мин per session (transitions stress baby)",
                 "Multiple sessions / day ideal",
                 "Long sessions (> 4 ч) — best для stable preterm",
                 "Father/partner sessions — equal benefits as mother (bonding + bonding hormones)",
             ]),
             step("End of session", [
                 "Slow transition (avoid temperature drop)",
                 "Return к incubator с pre-warmed environment",
                 "Re-check vital signs",
                 "Document session time",
             ]),
         ],
         [
             "Hypothermia если room cold or session ends abruptly",
             "Apnea / bradycardia — terminate session if persistent",
             "Mother / partner with fever / infection — defer until well",
             "Excessive sweating mother — может change temperature",
             "Mother's posture — back support critical (long sessions)",
         ],
         [
             "WHO Kangaroo Mother Care Guidelines 2022",
             "WHO Immediate KMC Study Group. NEJM 2021;384:2028 (iKMC)",
             "Conde-Agudelo A, Diaz-Rossello JL. Cochrane 2016:CD002771",
             "AAP COFN — Family-centered care 2024",
         ]),

    proc("proc-feeding-bm",
         "Подготовка и подача грудного молока",
         "Breast Milk Preparation",
         "feeding", 5, "nursing + lactation",
         [
             step("Pumping support", [
                 "Hospital-grade electric pump",
                 "Personal flange size — NOT one-size-fits-all (proper fit critical)",
                 "Pump 8-12× per day mother's preterm milk supply",
                 "Sessions 15-20 мин per side OR until empty",
                 "Hands-on pumping (massage during) — increased volume",
                 "Skin-to-skin sessions correlated with better milk supply",
             ]),
             step("Storage", [
                 "Fresh — room temperature 4 ч (20-25 °C)",
                 "Refrigerator 4 d (4 °C)",
                 "Freezer −20 °C: 6 мес",
                 "Deep freezer −80 °C: 12 мес",
                 "Once thawed — must use within 24 h refrigerator (no re-freeze)",
                 "Microwave НЕ recommended (uneven heating + nutrient loss)",
             ]),
             step("Thawing", [
                 "Refrigerator overnight (preferred)",
                 "Warm water bath (not hot)",
                 "Bottle warmer на low setting",
                 "Use within 24 h once thawed",
                 "Discard если sour smell или curdled",
             ]),
             step("Fortification (preterm < 1500 g)", [
                 "Add HMF (Human Milk Fortifier) при 80-100 мл/кг/d enteral",
                 "Standard 22-24 ккал/oz fortification",
                 "Mix HMF carefully (proper concentration)",
                 "Use within 24 h refrigerator after fortification",
                 "Aliquot для each feed if pre-fortified",
             ]),
             step("Bottle feeding", [
                 "Pre-warm к body T (30-37 °C)",
                 "Verify temperature на inner wrist (НЕ baby's mouth)",
                 "Slow-flow nipple для preterm",
                 "Paced feeding technique",
                 "Burp every 30-50 мл",
             ]),
             step("Tube feeding (NG/OG)", [
                 "Verify tube placement pH ≤ 5.5 BEFORE feeding",
                 "Aspirate gastric residual (если q3-4h check)",
                 "Bolus over 15-30 мин (gravity preferred over syringe push)",
                 "Continuous infusion для small / unstable",
                 "Flush с 1-2 мл воды post-feed",
                 "Position infant slightly upright × 30 мин post-feed",
             ]),
         ],
         [
             "Preterm + CMV — donor milk pasteurized или freeze-thaw (Holder pasteurization eliminates)",
             "Wrong identification — verify infant ID match milk label always",
             "Bacterial contamination — sterile collection technique",
             "Inadequate fortification — slow weight gain у VLBW",
             "Excessive fortification — hypernatremia, dehydration risk",
         ],
         [
             "AAP Section on Breastfeeding. Pediatrics 2022;150:e2022057988",
             "ESPGHAN Enteral Nutrition Position 2022 (JPGN 75:e102)",
             "WHO/UNICEF Breastfeeding Guidelines 2024",
         ]),

    proc("proc-pulse-oximeter",
         "Pulse oximetry — установка и monitoring",
         "Pulse Oximetry Setup",
         "monitoring", 3, "nursing + feldsher",
         [
             step("Probe selection", [
                 "Newborn-specific probe (smaller sensor)",
                 "Disposable Y-style preferred (better у unstable infants)",
                 "Avoid reusable hard plastic у preterm — pressure injury",
             ]),
             step("Placement", [
                 "Pre-ductal: RIGHT hand or wrist (right radial artery — pre-PDA)",
                 "Post-ductal: foot (descending aorta — post-PDA)",
                 "Avoid edematous, cold, или dark-pigmented sites",
                 "Light + photodiode aligned (90° через tissue)",
                 "Gentle wrap — no tension",
             ]),
             step("Routine SpO₂ targets", [
                 "Term: 95-100 %",
                 "Preterm < 32 нед: 90-95 % (NeOProM 2018)",
                 "BPD with chronic O₂: ≥ 92-95 %",
                 "PPHN: pre-ductal ≥ 95 %",
                 "Post-resuscitation: gradual increase per NRP minute-of-life curve",
             ]),
             step("Site rotation", [
                 "q4-6h — pressure injury prevention",
                 "Avoid same site > 4-6 hours",
                 "Inspect skin under probe at rotation",
                 "Document rotation",
             ]),
             step("CCHD screening", [
                 "Routine 24-48h life (term + late preterm ≥ 35 нед)",
                 "Right hand + либо foot одновременно",
                 "Pass: ≥ 95 % обеих сторон AND difference < 3 %",
                 "Fail: < 90 %; persistent < 95 % после 3 measurements + 1 ч; ≥ 3 % difference",
                 "Fail → ECHO obligatory",
             ]),
             step("Troubleshooting low signal", [
                 "Cold extremity → warm",
                 "Crying / motion artifact → wait still period",
                 "Probe loose or wrong site → re-position",
                 "Edema → alternative site",
                 "Bright ambient light → cover probe",
                 "Methemoglobinemia → falsely high SpO₂ (use co-oximetry)",
             ]),
         ],
         [
             "Pressure injuries / burns у preterm если probe slips или too tight",
             "Methemoglobinemia / carboxyhemoglobinemia → falsely elevated SpO₂",
             "Chronic intermittent hypoxemia (despite normal SpO₂) — adverse outcomes",
             "Skin sloughing under probe — rare but documented у ELBW",
         ],
         [
             "AAP / AHA. Pediatrics 2011;128:e1259 — CCHD",
             "AARC Pulse Oximetry Practice Guidelines 2013",
             "NeOProM. Cochrane 2018 — SpO₂ targets",
         ]),

    proc("proc-incubator-care",
         "Уход в incubator (servo + humidity)",
         "Incubator Care (Servo + Humidity)",
         "monitoring", 3, "nursing",
         [
             step("Initial setup", [
                 "Pre-warm к target T 30-60 мин before infant arrival",
                 "Servo-control mode preferred (NOT manual / air mode)",
                 "Skin probe placement — abdomen, midline, away from bony prominences",
                 "Adhesive thin foam under probe (skin protection)",
                 "Humidity 60-80 % для ELBW первые 7 d (reduce TEWL)",
             ]),
             step("Servo settings", [
                 "Target T core 36.5-37.5 °C (skin probe target ~36.5 °C)",
                 "Air T fluctuates как needed для maintain skin T",
                 "AVOID manual mode у preterm (no auto-adjustment)",
                 "Alarm parameters: skin T ± 0.5 °C, air T 30-37 °C",
             ]),
             step("Humidity (ELBW first 7-14 d)", [
                 "Initial 80 % если < 26 нед, < 1000 g",
                 "70 % если 26-28 нед",
                 "60 % если 28-30 нед",
                 "Wean by 5 %/d toward 30-40 %",
                 "Distilled water только в reservoir (regular tap = scale)",
                 "Change water q24h",
             ]),
             step("Hand hygiene + entry", [
                 "Hand wash + use side-port doors (НЕ open lid frequently)",
                 "Cluster care — minimize entries",
                 "Quick procedures через side ports",
                 "Document each entry в bedside log",
             ]),
             step("Skin probe maintenance", [
                 "Reposition q2-4h (skin breakdown prevention)",
                 "Inspect site at reposition",
                 "Foam protector replace q24h",
                 "If displaces — replace immediately (servo failure → temperature drop)",
             ]),
             step("Wean to open crib", [
                 "Stable T в air mode at 28-30 °C × 24-48 ч",
                 "Weight ≥ 1700-1800 g typical",
                 "PMA ≥ 32-34 нед",
                 "Spend 1 day in incubator with door open",
                 "Then transition к open crib с swaddling",
                 "Continue T monitoring × 24-48 ч post-transition",
             ]),
         ],
         [
             "Skin probe displacement = servo failure → infant can overheat or chill",
             "Manual mode у preterm — temperature instability",
             "Inadequate humidity у ELBW → TEWL > 100 мл/кг/d → dehydration + electrolyte chaos",
             "Excessive humidity > 90 % → bacterial growth, skin maceration",
             "Frequent door opening → temperature drops (5-10 °C in seconds)",
         ],
         [
             "AAP / NANN — Thermoregulation 2024",
             "Sinclair JC. Cochrane 2002:CD001074 — Servo vs manual",
             "WHO Thermal Protection 2017",
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
    data["version"] = "1.1.0"
    data["lastUpdated"] = "2026-05-10"
    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Added {added} procedures. Total: {len(data['procedures'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
