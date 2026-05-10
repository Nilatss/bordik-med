"""+14 neonatal drugs (186 → 200). Реальные NICU препараты — extended depth."""
import json, sys
from pathlib import Path
if sys.stdout.encoding != "utf-8": sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-monographs.json"


def m(id_, name_en, name_ru, brand, indications, dose, route, levels, precautions, extemp, refs, ft):
    return {
        "id": id_, "name_en": name_en, "name_ru": name_ru, "brand": brand,
        "indications": indications, "dose": dose, "route": route, "levels": levels,
        "precautions": precautions, "extemporaneous": extemp, "references": refs, "fullText": ft,
    }


NEW = [
    m("neo_dexrazoxane", "Dexrazoxane", "Дексразоксан", "Zinecard, Totect",
      "Cardioprotection при anthracycline chemotherapy у onco-неонатологии (rare, BMT context). Iron chelator. НЕ routine NICU.",
      "Pediatric oncology: 10-30× anthracycline dose IV before chemo. Neonatal use — лишь при congenital cardiomyopathy у onco-инфантов.",
      "IV slow infusion 15 мин",
      "Iron chelator + topoisomerase II protector. Renal excretion.",
      "Hematological toxicity (myelosuppression). Hepatotoxicity. Limited neonatal data.",
      "Lyophilized 250 / 500 мг vial. Reconstitute с lactated Ringer.",
      "Schwartz CL et al. NEJM 2010;363:1391. AAP Section on Hematology/Oncology.",
      "Zinecard Totect dexrazoxane cardioprotection anthracycline chemotherapy iron chelator topoisomerase II Schwartz 2010"),
    m("neo_pentobarbital", "Pentobarbital", "Пентобарбитал", "Nembutal",
      "Status epilepticus refractory to phenobarbital + levetiracetam + midazolam. Imaging sedation (MRI/CT) у NICU patients. ICP control в severe TBI.",
      "Status: 5-10 мг/кг IV slow loading; infusion 1-3 мг/кг/h titrate to burst-suppression EEG. Imaging: 2-3 мг/кг IV + 1-2 мг/кг q3-5 мин prn.",
      "IV slow (cardiac depression) или IM",
      "Barbiturate — GABA agonist. Hepatic metabolism. t½ 20-50 ч. Therapeutic for status: free 2-5 мг/л.",
      "Hypotension (significant — slow titration). Respiratory depression — usually intubated. Prolonged sedation. Avoid в porphyria.",
      "Standard 50 мг/мл IV. Discard at signs precipitate.",
      "Painter MJ et al. NEJM 1999;341:485. AAP COFN. Brevoord JC et al. PCCM 2005;6:14.",
      "Nembutal pentobarbital status epilepticus refractory MRI sedation ICP 5-10 мг/кг loading 1-3 мг/кг/h GABA barbiturate burst-suppression Painter 1999"),
    m("neo_remifentanil", "Remifentanil", "Ремифентанил", "Ultiva",
      "Procedural sedation analgesia (LISA, IV access, MRI). Ultra-short-acting opioid. Adjunct intubation premedication.",
      "Procedural: 0.5-1 мкг/кг IV bolus + 0.05-0.25 мкг/кг/мин infusion. Intubation: 1-3 мкг/кг slow.",
      "IV continuous (preferred) или slow bolus",
      "μ-opioid agonist. **Esterase metabolism** (RBC + tissue) — independent of organ function. Onset 30 sec; offset 5-10 мин (ultra-short).",
      "Apnea, chest wall rigidity при rapid push (slow over 1+ мин). Bradycardia. Hypotension. Tolerance development. Avoid prolonged infusion (> 4-6 ч) — withdrawal risk.",
      "Lyophilized 1/2/5 мг vials. Reconstitute с NS or D5W to 50 мкг/мл. Stable 24 ч.",
      "Welzing L et al. Pediatr Anesth 2010;20:605. ESPNIC consensus 2014.",
      "Ultiva remifentanil ultra-short-acting μ-opioid esterase metabolism 0.5-1 мкг/кг bolus 0.05-0.25 мкг/кг/мин LISA procedural Welzing 2010"),
    m("neo_anidulafungin", "Anidulafungin", "Анидулафунгин", "Eraxis",
      "Invasive candidiasis у neonates (alternative к caspofungin / micafungin). Limited neonatal data — preferred when other echinocandins не tolerated.",
      "Loading: 3 мг/кг IV. Maintenance: 1.5 мг/кг q24h IV. Adjustment: NO renal/hepatic adjust needed.",
      "IV infusion over 60 мин (NOT IM, NOT PO)",
      "Echinocandin — inhibits β-1,3-D-glucan synthase. Plasma degradation (chemical, не enzymatic). t½ 18-26 ч.",
      "Hepatic enzyme elevation. Histamine release reactions (rare). Phlebitis. Limited neonatal data — usually third-line.",
      "Lyophilized 50 / 100 мг vials. Reconstitute carefully (avoid foaming).",
      "Cohen-Wolkowiez M et al. PIDJ 2011;30:776 — pediatric PK. ESCMID Pediatric IFI 2024.",
      "Eraxis anidulafungin invasive candidiasis echinocandin β-1,3-glucan synthase 3 мг/кг loading 1.5 мг/кг q24h Cohen-Wolkowiez 2011 ESCMID"),
    m("neo_pegaspargase", "Pegaspargase", "Пегаспаргаза", "Oncaspar",
      "Acute lymphoblastic leukemia (ALL) у инфантов (rare BMT/oncology context). НЕ routine NICU.",
      "Pediatric oncology dose: 2500 ЕД/м² IM или IV q14d × multiple doses.",
      "IM (preferred) или IV over 1-2 ч",
      "Asparagine depletion → starves leukemic cells. PEG-conjugated form longer t½ (5-7 d) vs native asparaginase (1-2 d).",
      "Hypersensitivity (anaphylaxis 5-10 %). Pancreatitis (10-15 %). Coagulopathy (↓ fibrinogen, AT). Hyperglycemia. Liver dysfunction. Limited neonatal data — onco-неоnatology specialist.",
      "Standard 750 ЕД/мл solution. Cold storage; do NOT freeze.",
      "Avramis VI et al. Blood 2002;99:1986. AAP Section on Hematology/Oncology.",
      "Oncaspar pegaspargase ALL acute lymphoblastic leukemia asparagine depletion 2500 ЕД/м² hypersensitivity pancreatitis coagulopathy Avramis 2002"),
    m("neo_methadone", "Methadone", "Метадон", "Dolophine",
      "NAS treatment (alternative морфину при protracted withdrawal — long t½). Pain management chronic у opioid-tolerant infants.",
      "NAS: start 0.05-0.1 мг/кг q6-12h PO; titrate per Modified Finnegan. Maintenance: 0.05-0.2 мг/кг q6-12h. Wean: ↓ 10-20 % q24-48h.",
      "PO (preferred); IV/IM (rare)",
      "Long-acting μ-opioid agonist + NMDA receptor antagonist. Hepatic metabolism (CYP3A4, 2D6). t½ 12-30 ч у newborn — accumulation возможна.",
      "QT prolongation (dose-dependent — ECG baseline + monitor у chronic use). Sedation, respiratory depression — slower titration vs morphine. Constipation. Withdrawal при abrupt stop. Drug interactions: rifampin (induces, ↓ effect), erythromycin (↑ levels).",
      "Standard 1 мг/мл oral solution; tablets 5/10/40 мг.",
      "Hudak ML, Tan RC. Pediatrics 2012;129:e540 — AAP NAS. Patrick SW et al. Pediatrics 2018;141:e20173524.",
      "Dolophine methadone NAS protracted withdrawal long t½ NMDA antagonist 0.05-0.1 мг/кг q6-12h QT prolongation Hudak Tan 2012 Patrick 2018"),
    m("neo_buprenorphine", "Buprenorphine", "Бупренорфин", "Subutex, Suboxone",
      "NAS treatment alternative морфину (better safety profile — partial agonist). Maternal MAT (medication-assisted treatment) → reduces NAS severity.",
      "NAS: 4-5 мкг/кг q8h sublingual (start), titrate per Finnegan. Wean: ↓ 10 % q24-48h.",
      "Sublingual (preferred у neonate — higher bioavailability vs PO)",
      "Partial μ-opioid agonist + κ-antagonist. Hepatic metabolism (CYP3A4). Long t½ ~24 ч.",
      "Less respiratory depression vs morphine (ceiling effect). Less constipation. Sublingual administration challenge у newborn — may swallow. BBORN trial 2017 — equal efficacy, ↓ LOS vs morphine.",
      "Sublingual film 2/4/8/12 мг (Suboxone) — у infant уменьшить + custom compounding. Tablets 2/8 мг.",
      "Kraft WK et al. NEJM 2017;376:2341 — BBORN. AAP COFN. Pediatrics 2020;146:e20201926.",
      "Subutex Suboxone buprenorphine NAS partial μ-opioid 4-5 мкг/кг q8h sublingual ceiling effect BBORN Kraft 2017"),
    m("neo_diltiazem", "Diltiazem", "Дилтиазем", "Cardizem",
      "Refractory SVT after adenosine + propranolol fail (pediatric — 4th line). Hypertensive emergency у некоторых neonates с heart failure.",
      "Loading: 0.25 мг/кг IV slow over 2 мин. Maintenance: 0.05-0.25 мг/кг/h continuous IV. PO: 1-2 мг/кг q6-8h (rare у newborn).",
      "IV bolus + continuous; PO (chronic, rare у newborn)",
      "Calcium channel blocker — phase 4 SA/AV depolarization slower. Hepatic metabolism (CYP3A4). t½ 3-4 ч.",
      "Hypotension significant у newborn (dilatory + negative inotropic). Bradycardia / AV block. Heart failure exacerbation у impaired LV. Avoid с β-blockers, digoxin (additive bradycardia). Limited neonatal data — pediatric cardiology consult.",
      "Standard 5 мг/мл IV. Stable refrigerated.",
      "Vignati G et al. Pediatr Cardiol 2003;24:13. AAP/AHA — pediatric SVT. PACES 2024.",
      "Cardizem diltiazem refractory SVT 0.25 мг/кг IV loading 0.05-0.25 мг/кг/h calcium channel blocker hypotension bradycardia Vignati 2003 PACES"),
    m("neo_atenolol", "Atenolol", "Атенолол", "Tenormin",
      "Hypertension у newborn (chronic — coarctation post-repair, renal vascular). Rate control SVT. β1-selective.",
      "1-2 мг/кг q24h PO (start 1, titrate). Max 4 мг/кг/d split q12-24h. Renal adjustment если CrCl < 50.",
      "PO (oral suspension компаундируется)",
      "β1-selective adrenergic antagonist. Hydrophilic — no CNS penetration. Renal excretion 90 %. Long t½ у newborn (12-24 ч).",
      "Bradycardia, hypotension. Bronchospasm у asthma/BPD (less than nonselective β-blockers). Hypoglycemia (β-blockade masks symptoms). Heart failure exacerbation.",
      "Suspension 2 мг/мл compounded из tablets с Ora-Sweet/Ora-Plus.",
      "Flynn JT et al. Pediatrics 2017;140:e20171904 — Pediatric Hypertension. AAP Cardiology.",
      "Tenormin atenolol hypertension chronic SVT rate control β1-selective 1-2 мг/кг q24h hydrophilic renal Flynn 2017"),
    m("neo_methimazole", "Methimazole", "Мерказолил (тиамазол)", "Tapazole",
      "Neonatal hyperthyroidism (rare — maternal Graves disease с TRAb crossing placenta). Goiter с thyrotoxicosis.",
      "0.5-1 мг/кг q8-12h PO × 4-6 weeks (transient neonatal hyperthyroidism). Taper по T3/T4.",
      "PO (suspension compounded)",
      "Thioamide — inhibits thyroid peroxidase → ↓ T3/T4 synthesis. Hepatic metabolism. t½ 6-9 ч.",
      "Hepatotoxicity (rare but severe — monitor LFT). Agranulocytosis (rare — discontinue if WBC < 1500). Rash. Cholestatic jaundice. Discontinue when TRAb cleared (3-12 weeks usually).",
      "Suspension 1 мг/мл compounded. Tablets 5/10/15 мг.",
      "Skuza KA et al. Pediatrics 1996;97:147. AAP / Pediatric Endocrine Society 2024.",
      "Tapazole methimazole neonatal hyperthyroidism Graves TRAb 0.5-1 мг/кг q8-12h thyroid peroxidase Skuza 1996"),
    m("neo_propylthiouracil", "Propylthiouracil (PTU)", "Пропилтиоурацил", "PTU",
      "Neonatal hyperthyroidism — alternative methimazole (rare у newborn — но preferred при hepatic concerns).",
      "5-10 мг/кг q8h PO. Taper по labs.",
      "PO (suspension compounded)",
      "Thioamide — inhibits thyroid peroxidase + peripheral T4→T3 conversion (unique vs methimazole). Hepatic metabolism. Short t½ 1-2 ч.",
      "**Hepatotoxicity** higher risk vs methimazole (FDA black box 2010 — preferred only в 1st trimester pregnancy + thyroid storm). Agranulocytosis. Vasculitis (rare).",
      "Suspension 5 мг/мл compounded. Tablets 50 мг.",
      "AAP / Pediatric Endocrine Society — Thyrotoxicosis 2024. FDA Boxed Warning 2010.",
      "PTU propylthiouracil neonatal hyperthyroidism alternative methimazole 5-10 мг/кг q8h hepatotoxicity black box AAP 2024"),
    m("neo_riboflavin_b2_alt", "Riboflavin (B2) supplement", "Рибофлавин (B2) добавка",
      "Various",
      "PN supplement у preterm. MADD trial (multiple acyl-CoA dehydrogenase deficiency riboflavin-responsive subtype).",
      "PN: 0.36 мг/кг/d IV (within MVI Pediatric). MADD trial: 100-200 мг q24h PO trial × 7-10 дней. Maintenance 50-100 мг q24h.",
      "PO; IV (within MVI Pediatric in TPN)",
      "FAD/FMN precursor — cofactor multiple acyl-CoA dehydrogenases.",
      "Yellow-orange urine (harmless). Generally safe.",
      "Tablets 50/100 мг compounded; в TPN — within multivitamin.",
      "Olsen RK et al. Brain 2007;130:2045 — MADD. ESPGHAN PN 2018.",
      "riboflavin B2 PN supplement MADD multiple acyl-CoA dehydrogenase 0.36 мг/кг/d 100-200 мг trial Olsen 2007 ESPGHAN PN"),
    m("neo_phytomenadione_high", "Vitamin K1 (high-dose for VKDB)", "Витамин K1 — лечебная доза при VKDB",
      "AquaMEPHYTON",
      "Active VKDB (ICH, GI bleed, surgical bleed) — emergency treatment. К отличие от профилактики (1 мг IM при рождении), VKDB лечение требует higher dose.",
      "VKDB acute: 1-2 мг IV slow (NOT IM в active bleed — hematoma). Repeat q4-6h × 24-48 ч если bleeding persists.",
      "IV slow (NOT IM в active VKDB)",
      "Vitamin K — cofactor synthesis II/VII/IX/X (carboxylation). Onset hepatic 6-12 ч. Combined с FFP для immediate factor replacement.",
      "Anaphylaxis (rare с IV). Always slow IV push. Combine с FFP 10-15 мл/кг для immediate effect.",
      "Standard 2 / 10 мг/мл AquaMEPHYTON. Не разводить с calcium-containing solutions.",
      "AAP COFN. Pediatrics 2022 — Vit K. Sankar MJ et al. J Perinatol 2016.",
      "AquaMEPHYTON Vitamin K1 high-dose VKDB acute treatment 1-2 мг IV slow active bleeding factors II VII IX X carboxylation FFP AAP 2022"),
    m("neo_iron_iv", "Iron IV (sucrose / dextran)", "Железо в/в (сахарат / декстран)",
      "Venofer, Ferrlecit",
      "Iron-deficiency anemia рефрактерная PO у preterm. EPO-treated VLBW с poor PO absorption. PN-dependent infants long-term.",
      "Test dose: 0.05-0.1 мг/кг IV slow. Maintenance: 1-2 мг/кг q1-2 нед IV (Venofer iron sucrose). Total cumulative dose calculated по deficit + body weight.",
      "IV slow infusion (NEVER IM у newborn — staining + abscess risk)",
      "Iron-sucrose complex (Venofer) или sodium ferric gluconate (Ferrlecit). Bypasses GI absorption issues. RES uptake → release iron к RBC.",
      "Anaphylaxis (rare с modern formulations < 1:1000). Hypotension during infusion (slow rate). Iron overload long-term — monitor ferritin. Limited neonatal data — use cautiously.",
      "Iron sucrose 20 мг/мл (Venofer); dilute с NS to 1-5 мг/мл for slow infusion.",
      "Dohil R et al. J Pediatr 2008;153:712. Domellöf M et al. JPGN 2014;58:119.",
      "Venofer Ferrlecit iron sucrose dextran IV anemia EPO preterm 1-2 мг/кг q1-2 нед anaphylaxis iron overload Dohil 2008 Domellöf 2014"),
]


def main():
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    existing = {d["id"] for d in data["drugs"]}
    added = []
    for d in NEW:
        if d["id"] in existing: continue
        data["drugs"].append(d)
        added.append(d["name_en"])
    data["drugs"].sort(key=lambda d: d["name_en"].lower())
    data["version"] = "2.8.0"
    data["lastUpdated"] = "2026-05-10"
    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Added {len(added)} drugs. Total: {len(data['drugs'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
