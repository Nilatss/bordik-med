"""+15 neonatal drugs (200 → 215). Extended NICU formulary depth."""
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
    m("neo_caffeine_citrate_pretreat", "Caffeine citrate (pre-extubation)", "Кофеин цитрат (пре-экстубация)",
      "Cafcit",
      "Pre-extubation prophylaxis у preterm для уменьшения post-extubation apnea / re-intubation. Loading 24-48 ч до планируемой extubation.",
      "Loading 20 мг/кг IV/PO (если ещё not on caffeine). Maintenance 5-10 мг/кг q24h IV/PO. Continuous coverage до stable off support × 5-7 d.",
      "IV slow push (5 мин); PO once daily",
      "Adenosine receptor antagonist (A1, A2A). Hepatic CYP1A2 metabolism. t½ 50-100 ч у preterm — slow elimination.",
      "Tachycardia (rare у standard dose). Feeding intolerance. Diuresis (mild). Therapeutic level 8-25 мг/л. Caffeine syncerized с doxapram если refractory apnea.",
      "Standard 20 мг/мл IV (commercial); IV/PO same формула.",
      "Schmidt B et al. NEJM 2007;357:1893 — CAP. Lemyre B et al. Cochrane 2017:CD003212.",
      "Cafcit caffeine citrate pre-extubation prophylaxis adenosine receptor antagonist 20 мг/кг loading 5-10 мг/кг q24h CAP Schmidt 2007"),

    m("neo_dornase_alfa", "Dornase alfa (DNase)", "Дорназа альфа (DNase)",
      "Pulmozyme",
      "Cystic fibrosis у newborn (rare). Atelectasis viscous secretions у chronic vent patients. Off-label у severe BPD.",
      "Inhaled: 2.5 мг q12-24h via nebulizer. Pediatric standard dose. Off-label neonatal — limited data.",
      "Nebulization (inhaled только)",
      "Recombinant human DNase — cleaves extracellular DNA in viscous mucus → reduces viscosity. Onset 2-4 ч; duration 12-24 ч.",
      "Voice changes, pharyngitis. Bronchospasm rare (paradoxical). Bleeding rare. Limited neonatal safety data.",
      "Standard 1 мг/мл solution (single-use ampoules 2.5 мл).",
      "Wagener JS et al. Pediatr Pulmonol 1995;19:178. Cochrane CF DNase 2018.",
      "Pulmozyme dornase alfa DNase recombinant CF cystic fibrosis atelectasis viscous secretions 2.5 мг q12-24h nebulizer Wagener 1995"),

    m("neo_hypertonic_saline_inh", "Hypertonic saline (3 % nebulized)", "Гипертонический раствор 3 % ингал.",
      "Various",
      "Bronchiolitis (RSV) hospitalized infants. Severe BPD с mucus plugging. Атеlectasis у chronic vent patients.",
      "3 % NaCl 4 мл via nebulizer q4-8h × 24-48 ч (или per response). Pre-treat с salbutamol 0.1-0.3 мг/кг nebulizer.",
      "Nebulization (only)",
      "Hypertonic saline → osmotic mobilization mucus + ↑ mucociliary clearance + ↓ epithelial edema. Effective при viscous secretions.",
      "Bronchospasm (5-10 % — pre-treat с β-agonist). Cough. Hypernatremia rare. НЕ используется при severe bronchospasm acute.",
      "3 % NaCl prepared at pharmacy or via dilution (1:1 mixing 0.9 % + 5.85 % stock).",
      "Zhang L et al. Cochrane 2017:CD006458 — bronchiolitis. Hassan MK et al. Pediatr Pulmonol 2013;48:392.",
      "hypertonic saline 3 % nebulized bronchiolitis RSV BPD atelectasis 4 мл q4-8h pre-treat salbutamol Zhang 2017 Cochrane"),

    m("neo_acetazolamide", "Acetazolamide", "Ацетазоламид",
      "Diamox",
      "Post-haemorrhagic ventricular dilatation (PHVD) — adjunct (limited evidence). Hydrocephalus medical management. Idiopathic intracranial hypertension у older children.",
      "PHVD: 25 мг/кг/d split q8h PO (start 25, titrate to 100). Combined с furosemide controversial. Course 4-6 нед.",
      "PO (suspension compounded) или IV",
      "Carbonic anhydrase inhibitor — reduces CSF production. Onset 1-2 ч; renal excretion. Acid-base shifts (metabolic acidosis common).",
      "Metabolic acidosis (hyperchloremic). Hypokalemia, hyponatremia. Renal stones (long-term). Electrolyte monitoring weekly. PHANTOM trial 1998 — discontinued routine use after harm signal.",
      "Suspension 25 мг/мл compounded; IV 100 мг/мл.",
      "Whitelaw A et al. Pediatrics 1998;102:e85 — PHANTOM. Cochrane PHVD 2017.",
      "Diamox acetazolamide PHVD post-hemorrhagic ventricular dilatation hydrocephalus carbonic anhydrase inhibitor 25 мг/кг/d Whitelaw 1998 PHANTOM"),

    m("neo_glucagon_iv_continuous", "Glucagon IV continuous", "Глюкагон в/в продолжительная",
      "GlucaGen",
      "Refractory hypoglycemia у CHI или transient bridge до definitive Dx. β-blocker overdose rescue.",
      "Bolus: 0.03 мг/кг IM/IV (max 1 мг). Continuous infusion: 0.005-0.02 мг/кг/h IV (CHI bridge). Discontinue when GIR adequate.",
      "IM/IV bolus или IV continuous",
      "Pancreatic α-cell hormone — stimulates hepatic glycogenolysis + gluconeogenesis. Onset 5-10 мин; duration 1-2 ч. Useful only когда glycogen stores intact (не в IEM!).",
      "Vomiting, hypokalemia. Tachycardia. Rebound hypoglycemia common (followed by re-bound rise then fall). Hyponatremia (SIADH-like). Stop при no glycogen stores (IEM workup needed).",
      "Lyophilized 1 мг vial с 1 мл diluent. Stable 24 ч room temp once reconstituted.",
      "Stanley CA. Annu Rev Nutr 2004;24:301. AAP CFN. Pediatrics 2011;127:575.",
      "GlucaGen glucagon IV continuous CHI hyperinsulinism hypoglycemia bridge 0.03 мг/кг bolus 0.005-0.02 мг/кг/h glycogenolysis Stanley 2004"),

    m("neo_doxapram", "Doxapram", "Доксапрам",
      "Dopram",
      "Refractory apnea недоношенных, не отвечающее на caffeine. Last-resort respiratory stimulant. Limited use due to side effects.",
      "Loading: 1 мг/кг IV slow over 5 мин. Maintenance continuous: 0.5-2 мг/кг/h IV. Discontinue ASAP — adverse effect profile.",
      "IV continuous (slow loading)",
      "Non-specific respiratory stimulant — chemoreceptor + central. t½ neonates 7-9 ч. Hepatic metabolism.",
      "Hypertension (significant у preterm). Convulsions. GI distention. Tremor. Hyperglycemia. Can cause seizure-like activity на EEG. Avoid у HIE, IVH, seizure disorders. Reserve для refractory cases только.",
      "Standard 20 мг/мл IV.",
      "Henderson-Smart DJ, Steer P. Cochrane 2004:CD000074. AAP Section on Neonatal-Perinatal Medicine.",
      "Dopram doxapram refractory apnea last-resort respiratory stimulant 1 мг/кг loading 0.5-2 мг/кг/h hypertension seizures Henderson-Smart 2004 Cochrane"),

    m("neo_mannitol", "Mannitol", "Маннитол",
      "Osmitrol",
      "Increased ICP у severe HIE / IVH grade IV (rare у newborn — fontanelle compensates obvious). Acute renal failure (osmotic diuresis — rare у newborn). Severe oliguria.",
      "ICP: 0.25-1 г/кг IV over 30 мин (rare у newborn). ARF: 0.5 г/кг test dose — repeat если urine ↑.",
      "IV slow infusion (filter recommended)",
      "Osmotic diuretic + draws fluid из tissues. Renal excretion unchanged. Onset 15-30 мин; duration 6-8 ч.",
      "Hypovolemia / dehydration. Electrolyte shifts. Heart failure exacerbation у impaired LV. Crystallization possible — warm vial, use in-line filter. Not first-line у newborn (other options preferred).",
      "Standard 20 % (200 мг/мл) IV. Warm к dissolve crystals.",
      "AAP Pediatric ICU manuals. Limited neonatal experience.",
      "Osmitrol mannitol increased ICP HIE IVH ARF osmotic diuretic 0.25-1 г/кг 30 мин hypovolemia dehydration crystallization"),

    m("neo_hyperhep", "HBIG (Hepatitis B Immune Globulin)", "ИгG против HBV",
      "HepaGam B, HyperHEP B",
      "Hepatitis B post-exposure у newborn от HBsAg+ matери. Combined с HBV vaccine birth dose. Critical first 12 ч жизни.",
      "0.5 мл (= 200 ЕД) IM in vastus lateralis в первые 12 ч жизни. Combined с HBV vaccine (separate site).",
      "IM (preferred у newborn — vastus lateralis)",
      "Polyclonal IgG against HBsAg. Onset rapid (passive antibodies). Duration 3-6 мес.",
      "Pain at injection site. Hypersensitivity rare. NOT for already-infected (HBsAg+ infants — too late). Combined с HBV vaccine for combined protection.",
      "Standard 0.5 мл pre-filled syringe (200 ЕД). Refrigerated; bring к room temp before injection.",
      "AAP Red Book 2024-2027. CDC ACIP — Hepatitis B Pediatric Schedule. WHO Hepatitis B 2024.",
      "HepaGam HyperHEP HBIG hepatitis B immune globulin newborn HBsAg+ mother 0.5 мл 200 ЕД IM 12 ч passive antibodies AAP Red Book"),

    m("neo_rsv_palivizumab", "Palivizumab (RSV prophylaxis)", "Паливизумаб (RSV профилактика)",
      "Synagis",
      "RSV prophylaxis у high-risk preterm + BPD + cardiac defects. Monthly during RSV season (Oct-Mar).",
      "15 мг/кг IM monthly × 5 doses в RSV season. Maximum 5 doses per season.",
      "IM (vastus lateralis)",
      "Humanized monoclonal antibody anti-RSV F-protein. Passive immunization. t½ ~28 d (monthly dosing required).",
      "Local injection site reactions (minor). Anaphylaxis very rare (< 1/100000). Generally safe. Cost-effective only в high-risk groups (AAP 2014 restricted criteria).",
      "Lyophilized 50 / 100 мг vials. Reconstitute с supplied diluent. Use within 6 ч after reconstitution.",
      "AAP. Pediatrics 2014;134:e620 — Palivizumab criteria. RSV-Adminol Pediatric NICU consensus.",
      "Synagis palivizumab RSV prophylaxis monoclonal antibody 15 мг/кг IM monthly 5 doses BPD high-risk preterm AAP 2014"),

    m("neo_nirsevimab", "Nirsevimab (RSV — long-acting)", "Нирсевимаб (RSV — длительный)",
      "Beyfortus",
      "RSV prophylaxis ALL infants < 8 мес entering 1st RSV season (CDC ACIP 2023 broad). Newer alternative palivizumab — single dose covers entire season.",
      "< 5 кг: 50 мг IM single dose. ≥ 5 кг: 100 мг IM single dose. Once per RSV season.",
      "IM single dose (vastus lateralis у infants)",
      "Long-acting recombinant monoclonal antibody anti-RSV F-protein. t½ ~150 d (vs palivizumab 28 d). Single dose covers entire season.",
      "Local injection site reactions. Anaphylaxis very rare. MELODY trial 2022 — 75 % reduction medically-attended RSV LRTI. HARMONIE 2023 — 83 % real-world reduction hospitalization.",
      "Pre-filled syringe 50 мг и 100 мг. Refrigerated.",
      "Hammitt LL et al. NEJM 2022;386:837 — MELODY. CDC ACIP 2023.",
      "Beyfortus nirsevimab RSV long-acting monoclonal antibody single dose 50/100 мг 8 мес ACIP MELODY Hammitt 2022 HARMONIE"),

    m("neo_abrysvo_maternal", "Abrysvo (maternal RSV vaccine)", "Abrysvo (материнская RSV вакцина)",
      "Abrysvo (Pfizer)",
      "Maternal RSV vaccination 32-36 нед gestation для passive infant protection через transplacental antibody transfer. FDA approved 2023.",
      "Single 0.5 мл IM dose в 32-36 нед gestation pregnancy. Не для neonate directly — для protection через mother.",
      "IM mother (deltoid) 32-36 нед",
      "Bivalent prefusion F protein vaccine. Maternal IgG transfer 3rd trimester → infant protection. Effective против both RSV-A + RSV-B subtypes.",
      "Maternal: pain at site, fever (mild). Theoretical preterm birth risk — closely monitored (RSV-MAT protocol). Reduces severe RSV LRTI 70 % в infants (MATISSE NEJM 2023).",
      "Pre-filled syringe single dose. Refrigerated.",
      "Kampmann B et al. NEJM 2023;388:1451 — MATISSE. CDC ACIP 2023. ACOG Practice Advisory 2023.",
      "Abrysvo Pfizer maternal RSV vaccine 32-36 нед gestation transplacental passive infant protection MATISSE Kampmann 2023 ACOG"),

    m("neo_betamethasone_antenatal", "Betamethasone (antenatal — for record)", "Бетаметазон антенатальный (для record)",
      "Celestone",
      "FOR REFERENCE ONLY — antenatal corticosteroid для maternal use 24-34 нед threatened preterm. Not для neonate directly. Reduces neonatal RDS, IVH, NEC, mortality.",
      "Maternal: 12 мг IM × 2 doses q24h ИЛИ q12h. Goal: full course 48 ч до delivery для maximum effect.",
      "Maternal IM (deep, large muscle)",
      "Synthetic glucocorticoid — accelerates fetal lung maturation (surfactant production), brain maturation. Crosses placenta freely. Effect 48 ч after first dose; persists 7 d.",
      "Maternal: hyperglycemia, fluid retention. Fetal: ↓ RDS 44 %, ↓ IVH 46 %, ↓ NEC 50 %, ↓ mortality 30 % (Roberts Cochrane 2017). Late preterm (34-36+6) — ALPS 2016 ↑ neonatal hypoglycemia.",
      "Standard 6 мг/мл IM (3 мг betamethasone sodium phosphate + 3 мг betamethasone acetate suspension).",
      "Roberts D, Dalziel S. Cochrane 2017:CD004454. Klebanoff MA et al. NEJM 2016;374:1311 — ALPS. ACOG Practice Bulletin 234.",
      "Celestone betamethasone antenatal corticosteroid maternal preterm prevention RDS IVH NEC 12 мг IM × 2 q24h Roberts Cochrane 2017 ALPS"),

    m("neo_inh_iloprost", "Iloprost (inhaled)", "Илопрост ингаляционный",
      "Ventavis",
      "Pulmonary hypertension у newborn с persistent PPHN рефрактерная iNO + sildenafil + milrinone. Limited neonatal experience.",
      "Inhaled: 1-2.5 мкг/kg/dose nebulized q2-4h (start 1 мкг/кг — titrate). Adult dose 2.5 мкг 6-9× per day.",
      "Inhalation (special nebulizer required) — ProDose AAD",
      "Synthetic prostacyclin analog. Pulmonary-selective vasodilator. Onset 5 мин; duration 30-60 мин. Short-acting — frequent dosing required.",
      "Hypotension (systemic vasodilation possible). Cough, headache. Pre-medicate с β-agonist (bronchospasm rare). Limited neonatal data — usually rescue therapy.",
      "Standard 10 мкг/мл solution (Ventavis). Special nebulizer.",
      "Olschewski H et al. NEJM 2002;347:322. Limagne C et al. Pediatr Pulmonol 2011;46:716 — neonatal experience.",
      "Ventavis iloprost inhaled prostacyclin analog refractory PPHN pulmonary vasodilator 1-2.5 мкг/кг q2-4h Olschewski 2002 Limagne 2011"),

    m("neo_treprostinil", "Treprostinil", "Трепростинил",
      "Remodulin, Tyvaso",
      "Severe pulmonary hypertension рефрактерная другим агентам. Long-term BPD-PH у preterm. Specialty centers only.",
      "Continuous SC infusion: 1.25-2 нг/кг/мин (start), titrate up по response (up to 80 нг/кг/мин в некоторых cases). Inhaled (Tyvaso): 6-9 inhalations × 4 раза/d.",
      "SC continuous infusion (preferred у chronic); inhaled alternative",
      "Synthetic prostacyclin analog. Long t½ ~4 ч (vs iloprost 30 мин). Pulmonary + systemic vasodilator.",
      "Site pain (SC). Headache, jaw pain. Hypotension. Diarrhea. Bleeding rare. Limited neonatal data — specialty centers.",
      "Standard 1 / 2.5 / 5 / 10 мг/мл SC formulations. Refrigerated.",
      "Simonneau G et al. Am J Respir Crit Care Med 2002;165:800 — adult. Pulmonary HTN Pediatric guidelines 2024.",
      "Remodulin Tyvaso treprostinil severe pulmonary hypertension prostacyclin analog SC continuous BPD-PH 1.25-2 нг/кг/мин Simonneau 2002"),

    m("neo_idarucizumab", "Idarucizumab", "Идаруцизумаб",
      "Praxbind",
      "Dabigatran reversal в life-threatening bleed у adult/pediatric patients on dabigatran. RARE у newborn — but documented case reports (extracorporeal circuits).",
      "5 г IV в 2 doses (2.5 г each, 15 мин apart) для adult. Pediatric off-label: 5 г total. Effect immediate.",
      "IV bolus (over 5-10 мин)",
      "Humanized Fab fragment specifically binds dabigatran. Reverses anticoagulation immediately + duration 12-24 ч. Hepatic clearance.",
      "Hypersensitivity rare. NO direct procoagulant effect. Dabigatran rebound possible 12-24 ч later (re-anticoagulation if appropriate).",
      "Lyophilized 2.5 г vial. Reconstitute с supplied diluent.",
      "Pollack CV et al. NEJM 2017;377:431 — RE-VERSE AD. AHA Reversal Anticoagulants 2024.",
      "Praxbind idarucizumab dabigatran reversal Fab fragment 5 г IV anti-dabigatran extracorporeal Pollack 2017 RE-VERSE AD"),
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
    data["version"] = "2.9.0"
    data["lastUpdated"] = "2026-05-10"
    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Added {len(added)} drugs. Total: {len(data['drugs'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
