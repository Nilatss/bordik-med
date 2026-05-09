"""Augment existing neonatal monographs with Bordik runner content.

For each existing drug monograph that overlaps with our neo-*-dose runners,
APPEND multi-region dosing, recent trial citations, and modern caveats
without overwriting existing content.

Run: python scripts/augment-neo-monographs.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-monographs.json"


def aug(dose="", levels="", precautions="", references=""):
    """Augmentation snippet (all optional)."""
    return {
        "dose": dose,
        "levels": levels,
        "precautions": precautions,
        "references": references,
    }


# Mapping: existing monograph ID → Bordik runner augmentation
AUGMENTATIONS = {
    "neo_ampicillin": aug(
        dose=("Bordik runner: Sepsis 50 мг/кг q12h-q8h по PMA+PNA matrix; "
              "Meningitis 100 мг/кг (×2 sepsis dose); Listeria meningitis "
              "100 мг/кг q6-8h × 21+ дней (treatment of choice). PMA ≤ 29 "
              "нед PNA 0-28 d: q12h. PMA 30-36 нед PNA > 14 d: q8h. PMA "
              "≥ 37 нед PNA > 7 d: q8h."),
        precautions=("First-line с гентамицином для EOS empiric (covers "
                     "GBS, Listeria, E. coli > 90 % EOS pathogens). "
                     "Cross-react с penicillin allergy 1-3 % к "
                     "cephalosporins. НЕ in-line с aminoglycosides "
                     "(separate lumens / flush)."),
        references=("Bradley JS et al. Pediatr Infect Dis J 2014 — "
                    "neonatal pharmacokinetics. AAP Red Book 2021-2024. "
                    "КР МЗ РФ 'Бактериальный сепсис н/р' (2024)."),
    ),
    "neo_gentamicin": aug(
        dose=("Bordik runner extended-interval dosing (Cochrane EID 2011): "
              "PMA ≤ 29 нед PNA 0-7 d: 5 мг/кг q48h; PNA 8-28 d: 4 мг/кг "
              "q36h; PNA > 28 d: 4 мг/кг q24h. PMA 30-34 нед PNA 0-7 d: "
              "4.5 мг/кг q36h; PNA > 7 d: 4 мг/кг q24h. PMA ≥ 35 нед "
              "PNA 0-7 d: 4 мг/кг q24h; PNA > 7 d: 5 мг/кг q24h."),
        levels=("TDM AAP 2014: Trough < 1.0 мг/л (через 30 мин до next "
                "dose); Peak 5-12 мг/л (через 30 мин после end of "
                "infusion); target ratio Peak/MIC 8-10."),
        precautions=("Ototoxicity irreversible — мониторинг ABR при > 7 "
                     "дней терапии. НЕ in-line с β-lactams (inactivation "
                     "in vitro). Synergy с ампициллином против Listeria, "
                     "GBS — стандарт пары для EOS."),
        references=("Cochrane One vs Multiple aminoglycoside dosing 2011. "
                    "AAP Red Book 2021-2024. КР МЗ РФ 'Бактериальный "
                    "сепсис н/р' (2024)."),
    ),
    "neo_vancomycin": aug(
        dose=("Bordik runner per AAP/ASHP-IDSA 2020: AUC-based monitoring "
              "preferred. PMA ≤ 29 нед PNA 0-14 d: 10-15 мг/кг q18-24h; "
              "> 14 d: 15 мг/кг q12h. PMA 30-36 нед: q12-18h → q8h. PMA "
              "≥ 37 нед: q12h → q6-8h. Loading 20 мг/кг при meningitis."),
        levels=("AUC₂₄/MIC target 400-600 для S. aureus с MIC ≤ 1 (ASHP/IDSA "
                "2020). Trough surrogate если AUC недоступен: 10-20 мг/л. "
                "AUC > 600 → nephrotoxicity risk."),
        precautions=("Red man syndrome (histamine release при rapid "
                     "infusion) — slow infusion ≥ 60 мин. Concomitant "
                     "aminoglycosides потенцирует nephrotoxicity. "
                     "CONS — частая причина LOS у недоношенных (~ 40 %)."),
        references=("Rybak MJ ASHP/IDSA Vancomycin Therapeutic Monitoring "
                    "2020 (Pharmacotherapy 40:363). Frymoyer A — pediatric "
                    "PK models. AAP Red Book 2021-2024."),
    ),
    "neo_cefotaxime": aug(
        dose=("Bordik runner per AAP Red Book: 50 мг/кг IV q12h-q6h по "
              "PMA+PNA. Meningitis: q6h у term ≥ 7 d. Better CSF "
              "penetration than aminoglycosides."),
        precautions=("⚠️ PREFERRED OVER CEFTRIAXONE у н/р: ceftriaxone "
                     "displaces bilirubin от albumin → kernicterus risk; "
                     "precipitates с Ca-containing IV (lactated Ringer, "
                     "Ca gluc) → cardiac arrest. Avoid у < 41 нед PMA. "
                     "Combination с ампициллином — broad EOS + meningitis "
                     "coverage."),
        references=("AAP Red Book 2021-2024. Bradley JS et al. — neonatal "
                    "pharmacokinetics. КР МЗ РФ 'Менингит н/р' (2024)."),
    ),
    "neo_meropenem": aug(
        dose=("Bordik runner: Sepsis 20 мг/кг q12h-q8h по PMA+PNA. "
              "Meningitis 40 мг/кг q8h. NEC perforation 30 мг/кг q8h. "
              "Reserve antibiotic — antibiotic stewardship review."),
        precautions=("Spectrum: ESBL-producing E. coli/Klebsiella, "
                     "AmpC β-lactamase producers, Pseudomonas, Acinetobacter, "
                     "anaerobes. РЕЗИСТЕНТНЫ: MRSA/MRSE, VRE, Stenotrophomonas. "
                     "Valproic acid interaction: ↓ valproic levels (loss "
                     "seizure control). Seizures у high-dose / renal failure."),
        references=("Cohen-Wolkowiez M et al. — neonatal meropenem PK. "
                    "AAP Red Book 2021-2024."),
    ),
    "neo_metronidazole": aug(
        dose=("Bordik runner: 7.5 мг/кг IV q24h-q8h по PMA+PNA. Loading "
              "15 мг/кг (serious infection). NEC IIB+ triple-therapy "
              "(ampi + gent + metro)."),
        precautions=("Spectrum: anaerobes (Bacteroides fragilis, "
                     "Clostridium, Fusobacterium, Prevotella). НЕ покрывает "
                     "aerobic gram-positive или Pseudomonas. Disulfiram-like "
                     "reaction с alcohol (NB у matери если breastfeeding)."),
        references=("Cochrane Antibiotics for NEC 2017. AAP Red Book "
                    "2021-2024. КР МЗ РФ 'НЭК' (2024)."),
    ),
    "neo_erythromycin": aug(
        dose=("Bordik runner prokinetic Cochrane 2014 (Ng): high-dose "
              "12.5 мг/кг q6h PO значимо ↓ time to full feeds у preterm. "
              "Low-dose (1-3 мг/кг q8h) — debatable benefit. Pertussis: "
              "12.5 мг/кг q6h PO × 14 дней. Chlamydia: same × 14 дней."),
        precautions=("⚠️ IHPS (infantile hypertrophic pyloric stenosis) "
                     "association в neonates < 2 нед, особенно ELBW и > 14 "
                     "дней courses. Drug interactions CYP3A4 inhibitor: "
                     "↑ theophylline, fluconazole, simvastatin, carbamazepine."),
        references=("Ng E et al. Cochrane Erythromycin для feeding "
                    "intolerance 2014. AAP Red Book 2021-2024."),
    ),
    "neo_acyclovir": aug(
        dose=("Bordik runner: 20 мг/кг IV q8h × 14-21 дней. SEM 14 d, "
              "CNS/disseminated 21 d. PO suppression 300 мг/м² q8h × 6 "
              "мес после CNS/disseminated treatment (CASG-103)."),
        precautions=("⚠️ EMERGENCY — start empirically если HSV suspected; "
                     "delays of hours ↑ mortality в disseminated HSV. "
                     "Adequate hydration CRITICAL (acyclovir crystallizes "
                     "в renal tubules). Mortality SEM ~ 0%, CNS 30-40%, "
                     "disseminated 80-90% без treatment."),
        references=("Kimberlin DW et al. CASG-103 NEJM 2011;365:1284 — "
                    "high-dose acyclovir + suppression. ACOG/AAP Joint "
                    "Guidelines on Neonatal HSV."),
    ),
    "neo_fluconazole": aug(
        dose=("Bordik runner per Kaufman 2001 / Manzoni 2007: Prophylaxis "
              "ELBW < 1000 г: 3 мг/кг 2×/нед IV/PO × 4-6 нед. Treatment: "
              "12 мг/кг q24h по PMA. Loading 25 мг/кг IV (severe). "
              "PMA-based: ≤ 29 нед q72h первые 2 нед → q48h."),
        precautions=("Kaufman 2001 + Manzoni 2007: ↓ invasive Candida ~ 80 % "
                     "у ELBW. PO bioavailability ~ 100 % у н/р. CSF "
                     "penetration хорошая. Resistant: C. krusei (intrinsic), "
                     "C. glabrata (variable)."),
        references=("Kaufman D NEJM 2001;345:1660. Manzoni P NEJM "
                    "2007;356:2483. Cochrane Antifungal prophylaxis 2014."),
    ),
    "neo_morphine_sulfate": aug(
        dose=("Bordik runner: IV bolus 0.05-0.1 мг/кг q4-6h; IV continuous "
              "infusion 10-30 мкг/кг/ч (sedation на ИВЛ). NAS PO "
              "0.04-0.16 мг/кг q3-4h (mFNAS-driven, AAP 2012). NAS taper "
              "10 % q24h после 48 ч stable mFNAS < 8."),
        precautions=("NEOPAIN trial (Anand 2003 NEJM): routine morphine "
                     "у preterm NOT improve outcomes (IVH/death rates "
                     "similar). ESC (Eat-Sleep-Console) NEJM 2023 — "
                     "функциональная альтернатива для NAS, ↓ medication "
                     "use + LOS."),
        references=("Anand KJS NEOPAIN trial NEJM 2003. Hudak ML, Tan RC "
                    "AAP NAS Pediatrics 2012;129:e540. ESC trial NEJM 2023."),
    ),
    "neo_fentanyl": aug(
        dose=("Bordik runner: Bolus 0.5-2 мкг/кг IV slow push 1-2 мин. "
              "Infusion 0.5-4 мкг/кг/ч (с tolerance до 5). 75-125× более "
              "potent чем morphine. Onset 1-2 мин IV (быстрее morphine)."),
        precautions=("Chest wall rigidity при rapid push (> 5 мкг/кг IV) — "
                     "может потребовать suxamethonium / naloxone. Tolerance "
                     "после 3-5 дней инфузии. Withdrawal при abrupt stop "
                     "> 5 дней — taper 10-20 % q6-12h. Меньше histamine "
                     "release vs morphine — preferred у hemodynamically "
                     "unstable."),
        references=("AAP CFN 2016 — Pain Assessment & Management. Hall RW "
                    "Cochrane opioids in NICU 2017."),
    ),
    "neo_midazolam": aug(
        dose=("Bordik runner: Bolus 0.05-0.15 мг/кг IV slow push q1-4h prn. "
              "Infusion 0.06-0.4 мкг/кг/ч (refractory seizures up to 1 "
              "мг/кг/ч). Intranasal 0.2 мг/кг (procedural sedation)."),
        precautions=("⚠️ Anand 2004 trial: prophylactic midazolam в preterm "
                     "→ adverse neurodev outcomes. Cautious use. Tolerance "
                     "5-7 d. Withdrawal при abrupt stop > 5 d (taper 10-20 "
                     "% q24h). Antagonist: flumazenil 0.005-0.02 мг/кг IV "
                     "(short t½ — repeat dosing may be needed)."),
        references=("AAP CFN 2016 — Pain Management. Anand KJS et al. 2004 "
                    "trial (preterm midazolam adverse outcomes)."),
    ),
    "neo_acetaminophen": aug(
        dose=("Bordik runner per Allegaert 2014: PDA closure protocol "
              "15 мг/кг q6h × 3-7 дней (PO/IV) — alternative ибупрофену/"
              "indomethacin при NSAID contraindications. Analgesia: 10-15 "
              "мг/кг q6-8h PO/PR; IV 10 мг/кг q6h slow infusion 15 мин. "
              "Maximum: term 60 мг/кг/сут; preterm < 32 нед 50 мг/кг/сут; "
              "ELBW 40 мг/кг/сут."),
        precautions=("PDA closure mechanism: peroxidase inhibition (different "
                     "from COX). Closure rate ~ 60 % (vs ибупрофен ~ 70 %). "
                     "Better GI/renal safety profile vs NSAIDs. Showings "
                     "PDA: NSAID contraindications (renal failure, "
                     "thrombocytopenia, NEC, GI bleed)."),
        references=("Allegaert K et al. Pediatrics 2014;134:e253 — PDA "
                    "closure. Cochrane Paracetamol для PDA 2019. AAP CFN "
                    "2016 Pain Management."),
    ),
    "neo_phenobarbital": aug(
        dose=("Bordik runner per WHO 2011: First-line anticonvulsant. "
              "Loading 20 мг/кг IV slow 15-20 мин; if seizures persist + "
              "10 мг/кг q15-20 мин до total 40 мг/кг. Maintenance 3-5 "
              "мг/кг q24h. NAS adjunct 5 мг/кг q12h PO (polysubstance)."),
        levels=("Therapeutic plasma 15-40 мг/л; toxicity > 60 мг/л. Long "
                "t½ у н/р 90-100 ч (term) до 200 ч (ELBW). Steady state "
                "14-21 d."),
        precautions=("Hepatic enzyme inducer: ↑ метаболизм theophylline, "
                     "vit K (повышенный риск кровотечения), digoxin. "
                     "NeoLEV2 trial (Sharpe 2020 Pediatrics): lev НЕ "
                     "inferior phenobarb для seizure cessation, но ниже "
                     "side-effect profile — consider lev first-line у "
                     "selected cases."),
        references=("WHO Guidelines on Treatment of Neonatal Seizures 2011. "
                    "Sharpe C NeoLEV2 trial Pediatrics 2020;145:e20193182. "
                    "Glass HC JAMA Neurol 2017."),
    ),
    "neo_levetiracetam": aug(
        dose=("Bordik runner: Loading 40-60 мг/кг IV slow 15-30 мин (high "
              "100 мг/кг refractory). Maintenance 20-30 мг/кг q12h IV/PO. "
              "IV-PO interchangeable 1:1 (bioavailability ~ 100 %)."),
        levels=("Therapeutic 12-46 мг/л (target 30 мг/л); rare toxicity. "
                "Renal-dependent excretion — adjust в renal failure. "
                "t½ у н/р 5-10 ч."),
        precautions=("NeoLEV2 trial (Sharpe 2020 Pediatrics 145:e20193182): "
                     "lev efficacy 28-50 % vs phenobarb 80 %, но lev лучше "
                     "side-effect profile (нет sedation, hypotension, "
                     "hyperbili). Consider у hemodynamic instability / "
                     "hyperbilirubinemia близкой к exchange."),
        references=("Sharpe C NeoLEV2 trial Pediatrics 2020. Glass HC JAMA "
                    "Neurol 2017. WHO Neonatal Seizures 2011."),
    ),
    "neo_pyridoxine": aug(
        dose=("Bordik runner: Acute trial 50-100 мг IV slow push под EEG "
              "monitoring (refractory neonatal seizures). Maintenance "
              "(confirmed PDE): 15-30 мг/кг/сут PO q12h lifelong. PLP "
              "trial 30-50 мг/кг/сут PO q6h × 3-5 дней (PNPO mutation)."),
        precautions=("⚠️ Apnea risk acute IV — anesthesia / cardiopulmonary "
                     "team standby. Diagnosis PDE: α-AASA urinary + ALDH7A1 "
                     "gene mutation (most common). PLP-dependent epilepsy: "
                     "PNPO gene mutation. Late diagnosis → residual "
                     "cognitive deficits."),
        references=("Stockler S — PDE clinical guidelines. Pearl PL — "
                    "neonatal seizures B6 review. Mills PB — PDE biochemistry."),
    ),
    "neo_naloxone": aug(
        dose=("Bordik runner: 0.1 мг/кг IV/IM/IO/ETT q2-3 мин (max 5 "
              "повторов). Continuous infusion 0.005-0.16 мг/кг/ч (recurrent "
              "depression от long-acting opioids)."),
        precautions=("⚠️ NRP 8 ed. (2021) REMOVED from routine algorithm. "
                     "Use ONLY на indication. ⚠️ CONTRAINDICATED у "
                     "newborns of opioid-DEPENDENT matери (precipitates "
                     "withdrawal seizures). Adequate ventilation (PPV) — "
                     "first; naloxone не replaces respiratory support."),
        references=("NRP 8 ed. 2021 — Naloxone removal rationale. AAP CFN "
                    "2014 — Naloxone use in neonates. Hudak ML, Tan RC "
                    "AAP NAS Pediatrics 2012."),
    ),
    "neo_ibuprofen_lysine": aug(
        dose=("Bordik runner: PDA closure standard (Mitra JAMA 2018) — "
              "10 мг/кг IV q24h Day 1, 5 мг/кг q24h Day 2 + Day 3. "
              "High-dose Hirt 2008 (< 27 нед): 20/10/10 мг/кг q24h × 3 "
              "дня. PO bioavailability ~ 80 %."),
        precautions=("Mitra JAMA 2018 meta-analysis: ибупрофен предпочтительнее "
                     "indomethacin для PDA — similar closure, fewer side "
                     "effects (less mesenteric/renal vasoconstriction). "
                     "Conservative management alternative для < 32 нед "
                     "asymptomatic PDA (BeNeDuctus 2022 NEJM)."),
        references=("Mitra S et al. JAMA 2018;319:1221 — meta-analysis. "
                    "Ohlsson A et al. Cochrane Ibuprofen для PDA 2020. "
                    "Hundscheid T et al. NEJM 2022;387:683 (BeNeDuctus)."),
    ),
    "neo_indomethacin": aug(
        dose=("Bordik runner: PDA closure age-adjusted (Heymann): 1-я "
              "доза 0.2 мг/кг IV slow 30 мин; затем по age — < 48 ч 0.1 "
              "мг/кг q12h × 2; 2-7 d 0.2 мг/кг q12h × 2; > 7 d 0.25 мг/кг "
              "q12h × 2. IVH prophy: 0.1 мг/кг q24h × 3 (TIPP Schmidt 2001)."),
        precautions=("Mitra JAMA 2018: ибупрофен PREFERRED over indomethacin "
                     "(less mesenteric/renal vasoconstriction, less NEC, "
                     "neutral cerebral BF vs ↓). Concomitant с steroids "
                     "↑ GI perforation × 5-10. TIPP trial (Schmidt 2001): "
                     "↓ severe IVH у ELBW но НЕ улучшает long-term neurodev."),
        references=("Schmidt B et al. TIPP trial NEJM 2001;344:1966. "
                    "Mitra S et al. JAMA 2018;319:1221. Ohlsson A et al. "
                    "Cochrane Indomethacin для PDA 2020."),
    ),
    "neo_calcium_gluconate_10": aug(
        dose=("Bordik runner: Acute (symptomatic hypoCa): 1-2 мл/кг 10 % "
              "Ca gluconate IV slow push 5-10 мин (= 9-18 мг/кг elemental). "
              "Maintenance в TPN: 200-800 мг/кг/сут Ca gluc (= 18-72 мг/кг "
              "elemental). 1 мл 10 % = 100 мг Ca gluc = 9 мг elemental Ca."),
        precautions=("⚠️ Rapid push → bradycardia, asystole (особенно "
                     "digitalis-treated). Extravasation → tissue necrosis. "
                     "Concomitant NaHCO₃ → CaCO₃ precipitate (separate "
                     "lumens). Hypomagnesemia часто сопутствует — также "
                     "treat. Continuous ECG monitoring."),
        references=("AAP CFN — Hypocalcemia. Demarini S et al. — neonatal "
                    "calcium homeostasis review. NeoFax."),
    ),
    "neo_magnesium_sulfate": aug(
        dose=("Bordik runner: Hypomagnesemia 25-50 мг/кг IV slow 30 мин "
              "(repeat q6-12h × 2-3). HIE neuroprotection (controversial) "
              "250 мг/кг IV. Maternal antenatal (MOTHER, Doyle Cochrane "
              "2009): 4 г + 1 г/ч × 24 ч → ↓ CP 30 %. PPHN (last-line) "
              "100-200 мг/кг + infusion."),
        precautions=("Toxicity > 2 ммоль/л: гипотония, hypotonia. > 3 "
                     "ммоль/л: respiratory paralysis, cardiac arrest. "
                     "Antidote: Ca gluconate 1-2 мл/кг 10 % IV slow. "
                     "Renal-dependent excretion."),
        references=("Doyle LW Cochrane Magnesium для neuroprotection 2009. "
                    "Crowther CA ACTOMgSO₄ NEJM 2003."),
    ),
    "neo_furosemide": aug(
        dose=("Bordik runner: IV bolus 1 мг/кг q12-24h (acute pulm edema); "
              "IV continuous 0.05-0.4 мг/кг/ч (refractory edema); PO 1-4 "
              "мг/кг q12-24h (BPD chronic). Combine с spironolactone "
              "1-3 мг/кг q24h + KCl supplementation."),
        precautions=("Cochrane Diuretics for BPD 2017: short-term improvement "
                     "в lung function, но НЕ улучшает long-term outcomes. "
                     "Concomitant aminoglycosides — ototoxicity ↑↑ "
                     "(irreversible). Chronic use → nephrocalcinosis у "
                     "30-50 % (renal U/S q3-6 мес). Не использовать с "
                     "ибупрофеном (NSAID blunts diuresis)."),
        references=("Stewart A et al. Cochrane Diuretics for BPD 2017. "
                    "Brion LP et al. Cochrane Loop diuretics 2020."),
    ),
    "neo_hydrocortisone": aug(
        dose=("Bordik runner: Refractory hypotension 1 мг/кг q8h × 5 d "
              "(затем taper). Adrenal insufficiency 1-2 мг/кг q8h. CAH "
              "replacement 15 мг/м²/сут q8h + fludrocortisone. BPD "
              "prevention 1 мг/кг/сут q12h × 7 d → 0.5 мг/кг/сут × 3 d "
              "(controversial — PRINCETON-2 vs NICHD 2022)."),
        precautions=("PRINCETON-2 (Watterberg 2007): ↓ BPD у ELBW, но ↑ GI "
                     "perforation. NICHD 2022 trial (Watterberg NEJM "
                     "386:1099): hydrocortisone не улучшает death/BPD у "
                     "ELBW. Concomitant с indomethacin/ibuprofen — "
                     "повышает GI perforation × 5-10."),
        references=("Watterberg KL et al. PRINCETON-2 Pediatrics 2007. "
                    "Watterberg KL et al. NICHD trial NEJM 2022;386:1099. "
                    "Cochrane Postnatal corticosteroids 2017."),
    ),
    "neo_dopamine": aug(
        dose=("Bordik runner dose-dependent receptor activation: 1-3 "
              "мкг/кг/мин dopaminergic (renal); 4-10 β1 (inotropy + "
              "chronotropy); > 10 α1 (vasoconstriction). Start 5 мкг/кг/мин; "
              "↑ 2.5 мкг/кг/мин q5-10 мин. Max 20 мкг/кг/мин (beyond → "
              "epi/norepi)."),
        precautions=("Saugstad 2018 (Acta Paediatr): routine treatment "
                     "hypotension у preterm в первые 24 ч — controversial. "
                     "PPHN: dopamine ↑ PVR — alternative dobutamine + iNO. "
                     "Extravasation → tissue necrosis: phentolamine 0.5 "
                     "мл s.c.; central access preferred при > 5 мкг/кг/мин."),
        references=("Saugstad OD et al. Acta Paediatr 2018. AAP CFN 2018 "
                    "— Hemodynamic management. Surviving Sepsis Campaign "
                    "Pediatric 2020."),
    ),
    "neo_norepinephrine": aug(
        dose=("Bordik runner: 0.05-1 мкг/кг/мин IV continuous. α1 + β1 "
              "dominant. Preferred для warm shock (low SVR). Max common "
              "0.5-1 мкг/кг/мин — beyond → vasopressin adjunct."),
        precautions=("Pediatric SSC 2020: norepi или epi first-line у "
                     "warm shock. Less тахикардия чем dopamine/epinephrine "
                     "(α1 dominant, β1 minor). Combination с vasopressin "
                     "для catecholamine-sparing."),
        references=("Surviving Sepsis Campaign Pediatric 2020. NeoFax / "
                    "Neonatal Formulary 9 ed."),
    ),
    "neo_milrinone": aug(
        dose=("Bordik runner: Loading 50 мкг/кг IV за 30-60 мин "
              "(controversial у н/р — hypotension risk). Maintenance "
              "0.25-0.75 мкг/кг/мин continuous (max 1). PPHN combination "
              "iNO + milrinone — synergy (Khanna 2017)."),
        precautions=("PDE3 inhibitor — inodilator (↑ contractility + ↓ "
                     "SVR/PVR). Loading у н/р controversial: hypotension "
                     "risk значительная; many neonatologists omit loading. "
                     "Volume bolus pre-loading снижает risk. Renal-"
                     "dependent clearance — adjust в ↓ Cr."),
        references=("McNamara PJ et al. — milrinone в PPHN. Khanna A et "
                    "al. CHEST 2017 — meta-analysis. AHA 2019 PPHN "
                    "scientific statement."),
    ),
    "neo_epinephrine": aug(
        dose=("Bordik runner CONTINUOUS INFUSION (НЕ CPR-bolus): "
              "0.05-1 мкг/кг/мин IV continuous. Receptor по дозе: 0.05-0.1 "
              "β1; 0.1-0.3 β1+β2; 0.3-0.5 β1+α1; > 0.5 α1 dominant. Start "
              "0.05 мкг/кг/мин. CPR-dose: 0.01-0.03 мг/кг IV/IO bolus "
              "(NRP 8 ed.) — отдельный protocol."),
        precautions=("Hyperglycemia (β2 effect — glycogenolysis + insulin "
                     "resistance). Lactic acidosis (β2 на skeletal muscle) "
                     "— caveat для perfusion marker. Light-protected: "
                     "oxidation → pink color = degradation, заменить. "
                     "Adrenal supplement: hydrocortisone 1 мг/кг q8h при "
                     "refractory."),
        references=("AAP CFN 2018 — Hemodynamic management. Surviving "
                    "Sepsis Campaign Pediatric 2020. ELSO ECMO Guidelines."),
    ),
    "neo_alprostadil_prostaglandin_e1_pge1": aug(
        dose=("Bordik runner: 0.01-0.1 мкг/кг/мин IV continuous infusion "
              "для duct-dependent CHD. Initial 0.05 мкг/кг/мин; response "
              "10-30 мин (PaO₂ ↑ для cyanotic; pulses ↑ для obstructive). "
              "После response: ↓ до 0.025 → 0.01 maintenance."),
        precautions=("Apnea 10-30 % при ≥ 0.05 — готовность к ИВЛ. Showings: "
                     "cyanotic CHD (TGA, PA, TA, severe TOF) + left-sided "
                     "obstructive (HLHS, AS, coarctation, IAA). 4-extremity "
                     "SpO₂ обязательна. Hyperoxia test diagnostic. "
                     "Concentration: 5/10/20 мкг/мл."),
        references=("AAP / AHA Statement on CHD management 2018. Akkinapally "
                    "S et al. Cochrane PGE1 для ductal-dependent CHD 2018. "
                    "Lim DS et al. Pediatr Cardiol 2003."),
    ),
    "neo_sildenafil": aug(
        dose=("Bordik runner per Baquero 2006: PO 0.5-3 мг/кг q6-8h. IV "
              "LOAD-SUSTAIN: 0.4 мг/кг loading × 3 ч + 1.6 мг/кг/сут "
              "(0.067 мг/кг/ч continuous). Alternative/adjunct iNO для "
              "PPHN; iNO weaning support."),
        precautions=("STARTS-1 (Barst 2012): caution у chronic high-dose у "
                     "детей; FDA black box у adolescents. У н/р short-term "
                     "use generally safe (limited evidence). CYP3A4 "
                     "inhibitors (fluconazole, erythromycin) — increase "
                     "sildenafil levels. Avoid concomitant nitroglycerin."),
        references=("Baquero H et al. Pediatrics 2006 — sildenafil PPHN "
                    "trial. Khorana AA et al. LOAD-SUSTAIN trial. AHA 2019 "
                    "PPHN. NeoFax."),
    ),
    "neo_caffeine_citrate": aug(
        dose=("Bordik runner per Schmidt CAP trial NEJM 2007: Loading 20 "
              "мг/кг IV (high-dose 40 мг/кг при ELBW). Maintenance 5-10 "
              "мг/кг q24h IV/PO. 1 мг кофеин цитрата = 0.5 мг кофеина "
              "base."),
        levels=("Therapeutic 5-25 мкг/мл; toxicity > 40 мкг/мл (тахикардия, "
                "тремор, гипергликемия)."),
        precautions=("CAP trial (Schmidt 2007 NEJM 357:1893): caffeine vs "
                     "placebo у 2006 ELBW — ↓ BPD (RR 0.63), ↓ severe ROP, "
                     "↓ PDA, ↓ CP/cognitive delay в 18-21 мес. Continued "
                     "до PMA 33-36 нед. Совместимость: glucose, NaCl, "
                     "lipid emulsion (НЕ амикацин, NaHCO₃)."),
        references=("Schmidt B et al. CAP trial NEJM 2007;357:1893. "
                    "Schmidt B CAP follow-up NEJM 2012;366:1893. AAP CFN "
                    "Caffeine for AOP 2016."),
    ),
    "neo_beractant": aug(
        dose=("Bordik runner SURFACTANT (Beractant/Curosurf/Infasurf — все "
              "3 в одном calc): Beractant (Survanta) 100 мг/кг (4 мл/кг). "
              "Poractant alfa (Curosurf) 100-200 мг/кг (high-dose initial "
              "predпочтительно — European Consensus 2022 Sweet). "
              "Calfactant (Infasurf) 105 мг/кг (3 мл/кг). Methods: LISA "
              "preferred GA ≥ 26 нед on CPAP; INSURE; bolus через ETT."),
        precautions=("European Consensus 2022 (Sweet et al. Neonatology "
                     "2023;120:3): Curosurf 200 мг/кг high-dose initial "
                     "preferred для significant RDS. Cochrane 2018: "
                     "Curosurf vs Survanta — small mortality benefit "
                     "Curosurf. Repeat dose criteria: persistent FiO₂ "
                     "≥ 30 % через 6-12 ч; max 3 doses total."),
        references=("Sweet DG et al. European Consensus 2022 (Neonatology "
                    "2023;120:3). Polin RA AAP COFN 2014 — Surfactant "
                    "administration. Cochrane Curosurf vs Survanta 2018."),
    ),
    "neo_glucagon": aug(
        dose=("Bordik runner: Emergency 0.1-0.3 мг/кг IM/IV/SC. Continuous "
              "infusion 0.005-0.02 мг/кг/ч (5-20 мкг/кг/ч bridge to "
              "diazoxide в CHI)."),
        precautions=("Showings narrow: refractory hypoglycemia с GIR ≥ 12 "
                     "мг/кг/мин + suspected CHI (insulin/glucose ratio > "
                     "0.3). Limited effectiveness у preterm и post-asphyxia "
                     "(low hepatic glycogen stores). Onset 5-15 мин IV; "
                     "duration 30-90 мин — bridge только."),
        references=("Thornton PS PES 2015 — neonatal hypoglycemia. AAP CFN "
                    "— hypoglycemia management."),
    ),
    "neo_diazoxide": aug(
        dose=("Bordik runner: Initial 5 мг/кг/сут PO q8h (max 15-25 "
              "мг/кг/сут). Concomitant chlorothiazide 7-10 мг/кг q12h "
              "(counteracts fluid retention)."),
        precautions=("KATP channel opener — first-line maintenance CHI. "
                     "~ 50 % CHI cases KATP-resistant — diazoxide failure → "
                     "switch к octreotide. Trial × 5-7 days перед declaring "
                     "failure. Side effects: fluid retention (combine "
                     "chlorothiazide), hypertrichosis (reversible), pulm "
                     "edema у preterm + PDA, pulmonary HTN (rare у н/р)."),
        references=("Arnoux JB et al. — CHI management guidelines. Stanley "
                    "CA et al. Pediatrics 122:1124 (2008). Hussain K et "
                    "al. — diazoxide therapy CHI."),
    ),
    "neo_octreotide": aug(
        dose=("Bordik runner per Arnoux CHI guidelines: 5-25 мкг/кг/сут SC "
              "разделить q6-8h (initial 5 → 25). Max 40 мкг/кг/сут. "
              "Continuous IV 0.5 мкг/кг/ч (acute). Long-acting (LAR) 10-30 "
              "мг IM monthly (chronic stable CHI)."),
        precautions=("CHI после diazoxide failure (~ 50 % cases KATP-"
                     "resistant). Bridge к surgery (focal CHI partial "
                     "pancreatectomy) или chronic medical (diffuse). "
                     "Tachyphylaxis 2-3 нед — increase dose 25-50 %. "
                     "NEC reported у preterm — caution. GI side effects "
                     "common (50 %)."),
        references=("Arnoux JB et al. — CHI management. Stanley CA "
                    "Pediatrics 122:1124."),
    ),
    "neo_insulin_regular": aug(
        dose=("Bordik runner: 0.01-0.2 ед/кг/ч continuous (start 0.05). НЕ "
              "bolus у н/р (sudden hypoglycemia risk). First-line strategy "
              "hyperglycemia: ↓ GIR (decrease glucose в TPN) ПЕРЕД insulin."),
        precautions=("⚠️ NIRTURE trial (Beardsall 2008 NEJM 359:1873): "
                     "routine early insulin у preterm НЕ улучшает "
                     "outcomes; ↑ hypoglycemia rate. ⚠️ PRE-PRIME tubing "
                     "с 50 мл первой объёма (insulin adsorbs к plastic, "
                     "до 30 % loss). Stable в D5W; bond к glass/plastic "
                     "в NaCl alone. Hypoglycemia tight monitoring q30 мин "
                     "first 2 ч."),
        references=("Beardsall K et al. NIRTURE trial NEJM 2008;359:1873. "
                    "AAP CFN — neonatal hyperglycemia."),
    ),
    "neo_omeprazole": aug(
        dose=("Bordik runner: 0.5-1.5 мг/кг q24h PO/IV (split q12h если "
              "higher dose). Onset 1-3 days steady state."),
        precautions=("Use SELECTIVELY — большинство GERD у preterm "
                     "physiologic + self-resolving к 12-18 мес. Conservative "
                     "FIRST: positioning, thickened feeds, kangaroo. "
                     "⚠️ NEC + pneumonia signal у preterm (observational). "
                     "Long-term: hypomagnesemia, vit B12 deficiency, iron "
                     "deficiency, fracture risk (years). Cochrane 2014: "
                     "limited evidence benefit."),
        references=("Rosen R et al. NASPGHAN/ESPGHAN 2018 (JPGN). Cochrane "
                    "PPI для GERD в infants 2014. AAP CFN — neonatal GERD."),
    ),
    "neo_ferrous_sulfate": aug(
        dose=("Bordik runner: Preterm supplementation 2-4 мг/кг/сут "
              "elemental PO с 2-4 нед age (continue до 6-12 мес corrected). "
              "AOP + Epo 6 мг/кг/сут OBLIGATORY. IDA treatment 6 мг/кг/сут "
              "разделить q12h × 3 мес после Hb normalization. Term "
              "breastfed 1 мг/кг/сут с 4-6 мес (AAP 2010)."),
        precautions=("Cochrane 2014 (Aher): iron supplementation у preterm "
                     "↓ iron deficiency, no significant adverse effects. "
                     "Calcium impairs absorption — НЕ с молоком; preferred "
                     "empty stomach. Vit C ↑ absorption на 30 %. Concomitant "
                     "Epo: iron mandatory — без iron Epo не работает. "
                     "Toxic dose: > 60 мг/кг elemental — emergency."),
        references=("AAP COFN 2010 Iron requirements. ESPGHAN 2014 Iron "
                    "supplementation в preterm. Cochrane Iron в preterm 2014."),
    ),
    "neo_folic_acid": aug(
        dose=("Bordik runner: Preterm supplementation 50 мкг/кг/сут PO. "
              "AOP + Epo adjunct 50 мкг/кг/сут (always co-administer). "
              "Megaloblastic anemia 100-300 мкг/сут × 1-3 мес."),
        precautions=("⚠️ Always check B12 first (masking risk). Anticonvulsants "
                     "(phenytoin, phenobarbital) ↓ folate levels — supplement "
                     "обязательно. Folate antagonists: methotrexate, "
                     "sulfasalazine, trimethoprim. Hypersegmented neutrophils "
                     "— sign deficiency."),
        references=("AAP COFN — folic acid в preterm. ESPGHAN 2010 — folate "
                    "supplementation."),
    ),
    "neo_cholecalciferol_vitamin_d": aug(
        dose=("Bordik runner: Profilaxis term 400 ед/сут (AAP 2008 — всем "
              "breastfed с 1-го дня жизни). Profilaxis preterm 800-1000 "
              "ед/сут (ESPGHAN 2013). Deficiency treatment 2000-10000 "
              "ед/сут × 4-12 нед. Severe rickets: 5000-10000 ед/сут × "
              "6-12 нед + Ca/PO₄."),
        levels=("25-OH-Vit D: > 30 нг/мл sufficient; 20-30 insufficient; "
                "< 20 deficient; < 10 severe deficient. 1 мкг = 40 ед."),
        precautions=("Risk factors deficiency: maternal deficiency (most "
                     "common), high latitude, dark skin, exclusive "
                     "breastfeeding без supp, prematurity, malabsorption "
                     "(celiac, CF), anticonvulsants. Toxicity: > 10000 "
                     "ед/сут long-term или single > 50000 ед "
                     "(hypercalcemia, nephrocalcinosis)."),
        references=("AAP COFN 2008 (Pediatrics 122:1142). ESPGHAN 2013 — "
                    "Vit D в preterm. Endocrine Society 2011 (Holick MF "
                    "JCEM)."),
    ),
    "neo_vitamin_k1_phytonadione": aug(
        dose=("Bordik runner per AAP COFN 2022: Term ≥ 1500 г: 1 мг IM "
              "single (vastus lateralis). Preterm < 1500 г: 0.5 мг IM. "
              "PO option (NICE) 3-dose regimen: 1 мг PO День 1, День 7, "
              "День 28-42. Treatment VKDB: 1-2 мг IV slow + FFP/PCC если "
              "major bleeding."),
        precautions=("AAP/NICE/WHO/RCPCH: IM первое предпочтение. Late "
                     "VKDB (8 d - 6 мес) — main concern, mortality 20-50 "
                     "% (CNS bleed). Breastfed exclusive: ↑ risk late VKDB → "
                     "IM настоятельно. Old cancer myth (Golding 1992) — "
                     "DISPROVED multiple subsequent studies."),
        references=("AAP COFN 2022 (Pediatrics 149:e2021055584). NICE NG194 "
                    "(2021). RCPCH 2018 — VKDB Prevention. WHO 2017. "
                    "Sankar MJ Cochrane Vit K 2016."),
    ),
    "neo_erythropoietin_epoetin_alfa": aug(
        dose=("Bordik runner: AOP rhEpo 250-500 ед/кг 3×/нед SC ИЛИ "
              "darbepoetin alfa 10 мкг/кг 1×/нед SC. Neuroprotection PENUT "
              "(Juul 2020 NEJM 382:233): 1000 ед/кг IV q48h × 6 doses. "
              "1 мкг darbepoetin = 60 ед Epo (1:60 ratio)."),
        precautions=("⚠️ Iron OBLIGATORY с Epo: 4-6 мг/кг/сут elemental "
                     "PO — иначе iron-deficient erythropoiesis. PENUT trial: "
                     "preterm Epo для neuroprotection NO benefit (не "
                     "routine). NEAT trial (HIE term/late): pending. Old "
                     "ROP concerns DISPROVED (Cochrane 2014 + PENUT 2020). "
                     "Folic acid 50 мкг/кг/сут + vit E 25 ед/сут."),
        references=("Juul SE et al. PENUT trial NEJM 2020;382:233. Aher SM "
                    "et al. Cochrane Erythropoietin для AOP 2014."),
    ),
    "neo_intravenous_immune_globulin_ivig": aug(
        dose=("Bordik runner: HDN (Rh/ABO) 0.5-1 г/кг IV slow 2-4 ч "
              "(Maisels AAP CFN 2009 — ↓ exchange transfusion). NAIT 1 "
              "г/кг q24h × 1-3 doses + compatible (HPA-1a-negative) "
              "platelets. PID replacement 400-600 мг/кг q3-4 нед IV "
              "(lifelong). Sepsis adjunct NOT recommended (INIS 2011)."),
        precautions=("⚠️ INIS trial (Brocklehurst 2011 NEJM 365:1201): "
                     "IVIG в neonatal sepsis — NO benefit. NAIT: HPA-1a "
                     "antibodies most common; recover 4-12 нед after birth. "
                     "Severe IgA deficiency: anaphylaxis risk. Slow infusion "
                     "critical: start 0.5-1 мл/кг/ч × 30 мин, titrate up к "
                     "2-3 мл/кг/ч."),
        references=("Brocklehurst P et al. INIS trial NEJM 2011;365:1201. "
                    "Maisels MJ AAP CFN 2009 (Pediatrics 124:1193). Cochrane "
                    "IVIG для NAIT 2017."),
    ),
    "neo_palivizumab": aug(
        dose=("Bordik runner per AAP COFN 2014/2023: 15 мг/кг IM monthly "
              "during RSV season (max 5 doses). Site: anterolateral thigh "
              "(vastus lateralis) для < 12 мес."),
        precautions=("AAP COFN 2014/2023 eligibility (restricted): preterm "
                     "< 29 нед без CHD/CLD < 12 мес; CLD/BPD требующий "
                     "O₂/steroids/diuretics; hemodynamically significant "
                     "CHD; special populations. ⚠️ NEW 2023: Nirsevimab "
                     "(Beyfortus) FDA approved — single dose все infants "
                     "entering 1st RSV season; replacing palivizumab. "
                     "IMpact RSV Trial 1998: ↓ RSV hospitalization 55 %."),
        references=("AAP COFN 2014 (Pediatrics 134:415). AAP COFN Update "
                    "2023. IMpact RSV Trial NEJM 1998. MELODY/HARMONIE "
                    "trials NEJM 2023 (nirsevimab)."),
    ),
    "neo_levothyroxine_t4": aug(
        dose=("Bordik runner per AAP/ESPGHAN 2014: Initial term 10-15 "
              "мкг/кг/сут PO once daily; preterm 8-10 мкг/кг/сут; severe "
              "CH (TSB > 100) 12-17 мкг/кг/сут. Adjusted by age: 0-3 мес "
              "10-15; 3-6 мес 8-10; 6-12 мес 6-8 мкг/кг/сут."),
        precautions=("⚠️ START в первые 2 нед жизни — IQ outcomes critical. "
                     "Each week delay = ~ 1 IQ point loss (Hanukoglu 2003). "
                     "Goal TSH < 5, free T4 upper half normal. Empty "
                     "stomach (30 мин до feeds или 1 ч после). Crushed "
                     "tablet в water/breast milk. NOT в formula directly "
                     "(iron, soy, calcium ↓ absorption 30-50 %)."),
        references=("AAP/ESPGHAN 2014 (Pediatrics 134:e1135). Léger J ESPE/"
                    "PES 2014 JCEM 99:363. Hanukoglu A 2003 — IQ outcomes."),
    ),
    "neo_dexamethasone": aug(
        dose=("Bordik runner per Doyle DART 2006 + Cochrane 2014 — DART "
              "regimen low-dose late: Day 1-3 0.075 мг/кг q12h; Day 4-6 "
              "0.05; Day 7-9 0.025; Day 10 0.01. Cumulative 0.89 мг/кг "
              "over 10 days (vs old high-dose 7-9 мг/кг)."),
        precautions=("⚠️ Yeh 1998 NEJM 338:101: early high-dose у preterm "
                     "↑ cerebral palsy 200 % (12% vs 6%). AVOID: extreme "
                     "preterm < 28 нед PMA в первые 7 дней. Use ONLY: "
                     "severe BPD ventilator-dependent ≥ 14 days с failure "
                     "conservative measures. Concomitant с indomethacin/"
                     "ibuprofen — ↑ GI perforation × 5-10."),
        references=("Yeh TF et al. NEJM 1998;338:101 — cerebral palsy "
                    "concerns. Doyle LW et al. DART trial Pediatrics "
                    "2006;117:75. Halliday HL et al. Cochrane Postnatal "
                    "corticosteroids 2017. AAP CFN 2002 + 2010 Statement."),
    ),
}


def main() -> int:
    """Augment existing monographs by appending Bordik runner content."""
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    augmented_count = 0
    for drug in data["drugs"]:
        drug_id = drug["id"]
        if drug_id not in AUGMENTATIONS:
            continue
        a = AUGMENTATIONS[drug_id]

        # Append augmentations с separator (preserve existing content)
        if a["dose"]:
            drug["dose"] = drug["dose"].rstrip(". ") + ". \n\n" + a["dose"]
        if a["levels"]:
            existing_levels = drug.get("levels", "")
            if existing_levels:
                drug["levels"] = existing_levels.rstrip(". ") + ". \n\n" + a["levels"]
            else:
                drug["levels"] = a["levels"]
        if a["precautions"]:
            drug["precautions"] = (
                drug["precautions"].rstrip(". ") + ". \n\n" + a["precautions"]
            )
        if a["references"]:
            existing_refs = drug.get("references", "")
            if existing_refs:
                drug["references"] = existing_refs.rstrip(". ") + ". " + a["references"]
            else:
                drug["references"] = a["references"]

        # Update fullText for search (concatenate all)
        drug["fullText"] = " ".join([
            drug.get("brand", ""),
            drug.get("indications", ""),
            drug.get("dose", ""),
            drug.get("route", ""),
            drug.get("levels", ""),
            drug.get("precautions", ""),
            drug.get("extemporaneous", ""),
            drug.get("references", ""),
        ])

        augmented_count += 1

    data["version"] = "2.4.0"
    data["lastUpdated"] = "2026-05-09"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Augmented {augmented_count} existing monographs with Bordik runner content")
    print(f"Total drugs: {len(data['drugs'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
