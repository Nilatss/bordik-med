"""Add 12 new neonatal drugs (batch 4) to public/neonatal-monographs.json.

Target: 174 -> 186 drugs. Focus on additional NICU clinical depth:
- Antiarrhythmics: procainamide, lidocaine cardiac
- Inhaled: albuterol/salbutamol nebulizer, ipratropium nebulizer
- Endocrine: hydroxocobalamin (B12 IM), calcitriol, growth hormone
- Hema: vitamin C, ascorbic acid for sulfhemoglobinemia
- Misc: glycerin (suppositories), simethicone, lactulose
"""
import json
import sys
from pathlib import Path

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-monographs.json"


def make_drug(id_, name_en, name_ru, brand, indications, dose, route, levels, precautions, extemporaneous, references, fullText):
    return {
        "id": id_,
        "name_en": name_en,
        "name_ru": name_ru,
        "brand": brand,
        "indications": indications,
        "dose": dose,
        "route": route,
        "levels": levels,
        "precautions": precautions,
        "extemporaneous": extemporaneous,
        "references": references,
        "fullText": fullText,
    }


NEW_DRUGS = [
    make_drug(
        "neo_procainamide",
        "Procainamide", "Прокаинамид",
        "Pronestyl, Procanbid",
        "Refractory SVT/atrial flutter после adenosine + propranolol fail. Wide QRS tachycardia. Rare у neonates — last-resort cardiac arrhythmia.",
        "Loading: 7-15 мг/кг IV slow (over 30-60 мин). Maintenance: 20-80 мкг/кг/мин continuous IV. PO: 15-50 мг/кг/d split q3-6h.",
        "IV slow loading + continuous infusion; PO (rare у newborn)",
        "Class IA antiarrhythmic — sodium-channel blocker. Hepatic metabolism к NAPA (active metabolite). Renal excretion both. Therapeutic: procainamide 4-10 мг/л, NAPA 15-25 мг/л.",
        "Hypotension during loading (slow infusion). QT/QRS prolongation — discontinue if QRS widens > 25 %. Lupus-like syndrome (long-term). Aggravation heart block. Limited neonatal data; PALS expert consultation.",
        "Standard 100 мг/мл IV (commercial). Diluted с D5W or NS for infusion 1-4 мг/мл.",
        "Perry JC et al. Pediatr Cardiol 1996;17:151. AHA 2019 PALS guidelines. NeoFax / Neonatal Formulary 9 ed.",
        "Pronestyl Procanbid procainamide refractory SVT atrial flutter wide QRS adenosine 7-15 мг/кг loading 20-80 мкг/кг/мин Class IA NAPA Lupus-like Perry 1996 AHA PALS"
    ),
    make_drug(
        "neo_lidocaine_cardiac",
        "Lidocaine (cardiac)", "Лидокаин (кардиологический)",
        "Xylocaine",
        "Ventricular arrhythmias (VT, VF post-defibrillation). Refractory rhythm после adenosine fail. Topical anesthetic NOT covered here (separate use).",
        "Loading: 1 мг/кг IV slow over 2 мин. Maintenance: 20-50 мкг/кг/мин continuous IV. Repeat bolus 0.5-1 мг/кг q5-10мин up to 3 мг/кг total.",
        "IV bolus + continuous infusion (NEVER IM)",
        "Class IB antiarrhythmic — sodium-channel blocker (specific to ischemic tissue). Hepatic metabolism (CYP3A4). Therapeutic: 1.5-5 мг/л.",
        "CNS toxicity (paresthesias, seizures, coma — esp. при overdose). Cardiac depression при high doses. Methemoglobinemia (rare у newborn). Avoid с propranolol (additive cardiac depression). Reduce dose у hepatic dysfunction.",
        "Standard 10 мг/мл (1 %) или 20 мг/мл (2 %). Cardiac use without preservative.",
        "Aziz K et al. Pediatrics 2021;147:e2020038505E — NRP 8 ed. AHA PALS 2019. NeoFax / Neonatal Formulary 9 ed.",
        "Xylocaine lidocaine cardiac VT VF refractory 1 мг/кг loading 20-50 мкг/кг/мин Class IB sodium-channel CNS toxicity seizures methemoglobinemia AHA PALS NeoFax"
    ),
    make_drug(
        "neo_albuterol_nebulizer",
        "Albuterol/Salbutamol (nebulized)", "Сальбутамол небулизированный",
        "Ventolin, ProAir",
        "Bronchospasm у BPD / chronic lung disease (rare у acute neonate). Hyperkalemia treatment (β2 shifts K intracellularly).",
        "Bronchodilation: 0.1-0.3 мг/кг nebulized q4-6h prn (max 2.5 мг/dose). Hyperkalemia: 0.4 мг/кг nebulized × 1 (с insulin/glucose).",
        "Nebulization (preferred у neonates); MDI с spacer возможен у term",
        "β2-adrenergic agonist (selective). Onset 5-15 мин. Duration 4-6 ч. Hepatic metabolism.",
        "Tachycardia, tremor, hyperglycemia. Hypokalemia (paradoxical effect — useful для hyperkalemia, но caution otherwise). Rare paradoxical bronchospasm. Monitor HR, glucose, K при serial doses.",
        "Standard 5 мг/мл solution; dilute с NS to 2.5 мл for nebulization.",
        "Vemgal P et al. Cochrane 2012:CD007664 — hyperkalemia. AAP COFN BPD chapter. NeoFax / Neonatal Formulary 9 ed.",
        "Ventolin ProAir albuterol salbutamol nebulized bronchospasm BPD hyperkalemia 0.1-0.3 мг/кг q4-6h β2-agonist tachycardia tremor hypokalemia Vemgal 2012"
    ),
    make_drug(
        "neo_ipratropium_nebulizer",
        "Ipratropium (nebulized)", "Ипратропий небулизированный",
        "Atrovent",
        "Bronchospasm BPD / chronic lung disease (adjunct к albuterol). Limited neonatal data — usually pediatric airway disease.",
        "0.025-0.075 мг (25-75 мкг) nebulized q6-8h. Combined часто с albuterol в одной nebulizer.",
        "Nebulization (preferred у neonates)",
        "Anticholinergic bronchodilator — quaternary ammonium (no CNS penetration). Onset 15-30 мин; duration 4-6 ч. Minimal systemic absorption.",
        "Dry mouth, urinary retention rare у neonates. Tachycardia rare. Mydriasis при contact с eyes — protect eyes during neb. НЕ для acute bronchospasm у newborn (slow onset).",
        "Standard 0.25 мг/мл (0.025 %). Mix с albuterol для combination therapy.",
        "AAP COFN — BPD management. Cochrane Bronchodilators 2012. NeoFax / Neonatal Formulary 9 ed.",
        "Atrovent ipratropium nebulized bronchospasm BPD anticholinergic 25-75 мкг q6-8h quaternary ammonium dry mouth tachycardia AAP BPD"
    ),
    make_drug(
        "neo_hydroxocobalamin",
        "Hydroxocobalamin (Vit B12)", "Гидроксокобаламин (B12)",
        "Cyanokit, Hydro-B12",
        "Vitamin B12 deficiency (vegan maternal diet, megaloblastic anemia, methylmalonic aciduria cobalamin-responsive). Cyanide poisoning antidote (rare у newborn).",
        "B12 deficiency: 1 мг IM weekly × 4-6 weeks, then monthly. Methylmalonic aciduria responsive: 1 мг IM daily × trial, then maintenance. Cyanide antidote: 70 мг/кг IV (Cyanokit dose).",
        "IM (preferred), IV (cyanide antidote)",
        "Coenzyme методylmalonyl-CoA mutase + methionine synthase. Storage liver years. Hydroxocobalamin form preferred over cyanocobalamin (longer t½).",
        "Hypertension (transient). Pink-red discoloration urine + skin (Cyanokit dose — harmless). Allergic reactions rare. Acne / pustular rash with chronic high doses. Monitor potassium during MMA treatment (cellular K shift).",
        "Standard 1 мг/мл IM (Hydro-B12); 5 г vial для Cyanokit (dilute с saline).",
        "Häberle J et al. J Inherit Metab Dis 2019;42:1 — UCD/MMA. Daniotti M et al. Front Pediatr 2020;8:565. NeoFax / Neonatal Formulary 9 ed.",
        "Cyanokit Hydro-B12 hydroxocobalamin B12 deficiency vegan methylmalonic aciduria MMA cyanide antidote 1 мг IM weekly 70 мг/кг pink-red discoloration Häberle 2019"
    ),
    make_drug(
        "neo_calcitriol",
        "Calcitriol (1,25-OH-Vit D)", "Кальцитриол (активный D3)",
        "Rocaltrol, Calcijex",
        "Hypocalcemia refractory к standard Ca + vit D2/D3 (chronic kidney disease, hypoparathyroidism, vit D dependent rickets type I). Active D form bypasses 1α-hydroxylation.",
        "Hypocalcemia: 0.05 мкг/кг q24h PO (start) — titrate до 0.1-0.5 мкг/кг/d. CKD-bone disease: 0.05-0.1 мкг/кг q24h.",
        "PO (preferred); IV available (Calcijex)",
        "1,25-dihydroxyvitamin D3 — active form. Bypasses kidney conversion. Onset 2-6 ч; peak 10-12 ч; duration 3-5 d. Rapid onset vs cholecalciferol/ergocalciferol.",
        "Hypercalcemia (most common — dose-related, monitor weekly). Hyperphosphatemia. Soft tissue calcification long-term. Constipation. Renal stones risk. Discontinue 1-2 d при hypercalcemia + recheck.",
        "Capsule 0.25 мкг и 0.5 мкг; oral solution 1 мкг/мл; IV 1 мкг/мл.",
        "Wagner CL et al. Pediatrics 2008;122:1142 — Vit D supplementation. AAP COFN. KDIGO CKD-MBD 2017. NeoFax.",
        "Rocaltrol Calcijex calcitriol 1,25-OH-D active vit D refractory hypocalcemia CKD hypoparathyroidism 0.05 мкг/кг q24h hypercalcemia hyperphosphatemia Wagner 2008 KDIGO"
    ),
    make_drug(
        "neo_vit_c",
        "Vitamin C (Ascorbic acid)", "Витамин C (аскорбиновая)",
        "Ascor, Cenolate",
        "Sulfhemoglobinemia (rare у newborn). Methemoglobinemia adjunct (с methylene blue). Vitamin C deficiency (rare у newborn — scurvy). PN supplement.",
        "Methemoglobinemia adjunct: 100-300 мг IV. Sulfhemoglobinemia: 200 мг/кг IV q6h × 24-48 h. Vit C deficiency: 25-50 мг q24h PO/IV. PN: 60-80 мг q24h IV.",
        "PO/IV; IM (rare)",
        "Antioxidant — reducing agent. Cofactor для collagen synthesis (hydroxyproline), neurotransmitter biosynthesis (norepinephrine), iron absorption. Renal excretion at high doses.",
        "Generally well-tolerated. High IV doses (> 1 г): risk hyperoxaluria, kidney stones (long-term), hemolysis в G6PD-deficient patients (rare). Diarrhea PO at high doses. Acidic IV — can cause phlebitis.",
        "Standard 250 мг/мл IV (Ascor); PO chewable / liquid 100 мг/мл.",
        "AAP CFN — Pediatric Nutrition 2024. ESPGHAN PN 2018. NeoFax.",
        "Ascor Cenolate vitamin C ascorbic acid sulfhemoglobinemia methemoglobinemia adjunct deficiency PN scurvy 200 мг/кг q6h hyperoxaluria G6PD ESPGHAN PN"
    ),
    make_drug(
        "neo_methylene_blue",
        "Methylene Blue", "Метиленовый синий",
        "ProvayBlue",
        "Methemoglobinemia treatment (acquired или congenital). Vasoplegic shock после cardiopulmonary bypass (rare у neonates). Antiseptic не используется в neonate.",
        "Methemoglobinemia: 1-2 мг/кг IV slow over 5 мин; repeat in 1 ч если methHb persists. Refractory: ascorbic acid 200 мг/кг IV adjunct.",
        "IV slow infusion ONLY (extravasation тяжёлая)",
        "Reduces methemoglobin к hemoglobin via NADPH-MetHb reductase pathway. Onset 30 мин; duration 4-6 ч. Renal excretion (blue/green urine).",
        "G6PD deficiency: contraindicated — paradoxical methemoglobinemia + hemolysis (assess G6PD status first if possible). Serotonin syndrome (rare с SSRI/SNRI/MAOI). Blue/green discoloration urine, sclera, skin (transient). Hyperbilirubinemia interference (false reading). НЕ для < 6 мес возраста routinely (FDA — limited safety data).",
        "Standard 5 мг/мл IV. Discard если turns dark blue (oxidized).",
        "Wright RO et al. Annals Emerg Med 1999;34:646. AAP / AAP Section on Hematology. ProvayBlue package insert.",
        "ProvayBlue methylene blue methemoglobinemia 1-2 мг/кг IV slow G6PD contraindicated NADPH-MetHb reductase blue green urine Wright 1999 hemolysis"
    ),
    make_drug(
        "neo_simethicone",
        "Simethicone", "Симетикон",
        "Mylicon, Sub Simplex",
        "Symptomatic gas / colic у term newborn (functional dyspepsia, не organic). НЕ для preterm (limited evidence). НЕ заменяет workup при abdominal distension.",
        "Term: 20 мг q6h PO (1-2 капли q6h drops). Up to 240 мг/d total. Course 1-2 недели.",
        "PO drops (1-2 капли q6h)",
        "Antifoaming agent — surface-active silicone. Не absorbed systemically. Coats GI gas bubbles, facilitating expulsion.",
        "Generally безопасен — не absorbed. Возможный hypersensitivity rare. НЕТ clinical evidence для efficacy в colic (Cochrane 2018) — but parent reassurance role significant. AAP не recommends routine у preterm.",
        "Standard 40 мг/мл drops (Mylicon); 60 мг/мл concentrate.",
        "Cochrane Simethicone for colic 2018:CD009999 — equivocal benefit. AAP COFN — Pediatric Nutrition 2024.",
        "Mylicon Sub Simplex simethicone gas colic functional 20 мг q6h drops antifoaming silicone parent reassurance Cochrane 2018"
    ),
    make_drug(
        "neo_lactulose",
        "Lactulose", "Лактулоза",
        "Duphalac, Generlac",
        "Constipation chronic у term/late preterm (rare у newborn — workup needed). Hyperammonemia adjunct (lowers gut ammonia absorption — rare neonatal use).",
        "Constipation: 0.5-1 мл/кг q12-24h PO. Titrate к 1-3 soft stools/day. Hyperammonemia: 1-3 мл/кг q4-6h (titrate к 2-3 soft stools/day).",
        "PO (oral solution или enema)",
        "Synthetic disaccharide (galactose + fructose). Не absorbed; metabolized colonic bacteria → short-chain fatty acids → osmotic effect + acidification (NH3 → NH4+).",
        "Diarrhea при overuse — titrate к 1-3 stools/d. Cramping, flatulence (transient). Hypernatremia при excessive use (osmotic dehydration). НЕ для acute abdominal distension без workup. Galactosemia: contraindicated (contains galactose).",
        "Standard 670 мг/мл oral solution.",
        "Häberle J et al. J Inherit Metab Dis 2019;42:1 — hyperammonemia adjunct. AAP CFN — Pediatric Nutrition 2024.",
        "Duphalac Generlac lactulose constipation chronic hyperammonemia adjunct 0.5-1 мл/кг q12-24h galactose fructose osmotic short-chain fatty acids Häberle 2019"
    ),
    make_drug(
        "neo_glycerin_supp",
        "Glycerin Suppository", "Глицериновые свечи",
        "Pedia-Lax, Babylax",
        "Acute constipation у term newborn (occasional use). Stimulation первого мекония при delayed passage. НЕ chronic у preterm (rectal mucosa delicate).",
        "Term: ½ neonatal suppository (около 0.6 г) PR. Repeat в 12-24 ч prn. НЕ > 2 раз / день.",
        "Per rectum (PR) — neonatal-sized suppositories (Pedia-Lax)",
        "Hyperosmolar — draws water в bowel lumen + stimulates rectum. Onset 15-60 мин. Не systemically absorbed.",
        "Mucosal irritation (preterm — avoid). НЕ для intestinal obstruction (workup first). Anal fissure aggravation. Frequent use → tolerance / habituation.",
        "Pediatric suppository ~1.2 g (cut в half для neonate). Liquid glycerin enema 4 мл (Babylax).",
        "AAP COFN — pediatric constipation. NeoFax.",
        "Pedia-Lax Babylax glycerin suppository acute constipation neonatal hyperosmolar rectum 0.6 г PR mucosal irritation preterm avoid"
    ),
    make_drug(
        "neo_polyethylene_glycol",
        "Polyethylene Glycol 3350 (PEG)", "Полиэтиленгликоль 3350 (PEG)",
        "MiraLAX, Movicol",
        "Functional constipation у late preterm/term старше 1 month (rare у acute newborn). Bowel preparation (specialized).",
        "Maintenance: 0.5-1 г/кг q24h PO mixed in milk/formula или juice. Acute fecal disimpaction: 1-1.5 г/кг q24h × 3 дня.",
        "PO (mixed with feeds или fluids — tasteless)",
        "Osmotic laxative. Не absorbed. Pulls water into bowel. Onset 24-72 ч (slow); duration days. AAP-COFN Pediatric Constipation Position 2014.",
        "Generally well-tolerated. Diarrhea при overuse (titrate). Hypernatremia rare. AAP COFN: safe у > 1 month; limited data < 1 month — caution.",
        "Standard 17 г packets (powder) — measure 0.5-1 г/кг (0.03-0.06 packets/kg).",
        "AAP COFN. Pediatrics 2014;134:1077 — Pediatric Constipation Position. Pashankar DS et al. J Pediatr 2003;143:213.",
        "MiraLAX Movicol polyethylene glycol PEG 3350 functional constipation 0.5-1 г/кг q24h osmotic laxative AAP COFN 2014 Pashankar 2003"
    ),
]


def main() -> int:
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    existing = {d["id"] for d in data["drugs"]}
    added = []
    for drug in NEW_DRUGS:
        if drug["id"] in existing:
            continue
        data["drugs"].append(drug)
        added.append(drug["name_en"])

    data["drugs"].sort(key=lambda d: d["name_en"].lower())
    data["version"] = "2.7.0"
    data["lastUpdated"] = "2026-05-10"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Added {len(added)} drugs. Total: {len(data['drugs'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
