"""Add 25 new neonatal drugs (batch 3) to public/neonatal-monographs.json.

Target: 150 -> 175 drugs. Focus on rare/specialty NICU formulary completeness:
- More antibiotics (cefiderocol, ceftaroline, tigecycline, polymyxin, fosfomycin)
- More IEM/metabolic (sodium phenylbutyrate, sodium benzoate, biotin, riboflavin,
  thiamine, sapropterin, betaine, l-carnitine)
- Cardiac (terlipressin, levosimendan)
- Sedation (propofol, ketamine, thiopental — already partly)
- Rare: pyridoxine HCl IV (B6 status), hyaluronidase (already have), papaverine
- Hematology: eculizumab (PNH/aHUS), recombinant factor VII

Run: python scripts/add-neo-drugs-batch3.py
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
        "neo_cefiderocol",
        "Cefiderocol", "Цефидерокол",
        "Fetroja",
        "Multidrug-resistant Gram-negative infections (carbapenem-resistant Enterobacterales, Pseudomonas, Acinetobacter). Off-label у neonates — limited data, reserved для PICU/ID consultation.",
        "Adult: 2 g IV q8h. Pediatric off-label: 60 мг/кг q8h IV; neonates extrapolated 30-50 мг/кг q8h IV. Renal adjustment: CrCl < 60 — reduce.",
        "IV infusion over 3 ч",
        "Siderophore cephalosporin — uses iron-transport system to enter resistant Gram-negatives. Renal excretion 60 % unchanged.",
        "Hypersensitivity (cross-reactivity с другими cephalosporins). C. difficile colitis. Increased mortality в одном study (CREDIBLE-CR) — controversial. Limited neonatal data — use only при documented MDR + ID consultation.",
        "Lyophilized 1 g vial. Reconstitute с 10 мл NS or D5W; dilute в 100 мл for infusion.",
        "Bassetti M et al. Lancet Infect Dis 2021;21:226 — APEKS-NP. AAP Red Book 2024-2027. NeoFax / Neonatal Formulary 9 ed.",
        "Fetroja cefiderocol multidrug-resistant Gram-negative carbapenem-resistant Enterobacterales Pseudomonas Acinetobacter siderophore 60 мг/кг q8h Bassetti 2021 APEKS-NP",
    ),
    make_drug(
        "neo_ceftaroline",
        "Ceftaroline", "Цефтаролин",
        "Teflaro",
        "MRSA pneumonia / bacteremia когда vancomycin inadequate (rare у neonates). 5th generation cephalosporin с MRSA coverage.",
        "Pediatric (FDA approved): 8 мг/кг IV q8h. Neonatal off-label: 6-8 мг/кг q8h IV (under PICU consultation).",
        "IV infusion over 60 мин",
        "Anti-MRSA cephalosporin — binds PBP2a. Renal excretion 88 %. Adjust dose для CrCl < 50.",
        "Cross-allergic с другими β-lactams. Hemolytic anemia (Coombs+) reported — monitor. Eosinophilia. C. difficile.",
        "Lyophilized 600 mg vial. Reconstitute с 20 мл WFI; dilute в 50-250 мл NS.",
        "Korczowski B et al. Pediatr Infect Dis J 2016;35:e239 — pediatric SSTI. AAP Red Book 2024-2027.",
        "Teflaro ceftaroline MRSA pneumonia bacteremia 5th generation cephalosporin PBP2a 8 мг/кг q8h Korczowski 2016",
    ),
    make_drug(
        "neo_tigecycline",
        "Tigecycline", "Тигециклин",
        "Tygacil",
        "Multi-drug resistant Gram-positive + Gram-negative infections salvage. Limited neonatal use; FDA black box increased mortality.",
        "Pediatric off-label: 1.2 мг/кг q12h IV (max 50 мг q12h). Neonatal: extrapolated 1 мг/кг q12h IV (NICU rare use).",
        "IV infusion over 30-60 мин",
        "Glycylcycline — broad-spectrum. Hepatic excretion. Tissue penetration excellent.",
        "FDA black box: ↑ mortality в clinical trials. Pancreatitis. Hepatotoxicity. Tooth discoloration (tetracycline class — НЕ рекомендуется < 8 лет за исключением case-by-case). Limited neonatal data — last-resort.",
        "Lyophilized 50 мг vial. Reconstitute с 5 мл NS / D5W (10 мг/мл); dilute в 100 мл NS or LR.",
        "Purdy J et al. Pediatr Infect Dis J 2012;31:e208 — pediatric PK. AAP Red Book 2024-2027.",
        "Tygacil tigecycline multi-drug resistant Gram-positive Gram-negative salvage glycylcycline 1.2 мг/кг q12h FDA black box mortality Purdy 2012",
    ),
    make_drug(
        "neo_polymyxin_b",
        "Polymyxin B", "Полимиксин B",
        "Poly-Rx",
        "Multidrug-resistant Gram-negative infections (Pseudomonas, Acinetobacter, KPC-producing Klebsiella). Rescue when no other options.",
        "Loading: 25,000 ед/кг (2.5 мг/кг) IV. Maintenance: 25,000-30,000 ед/кг/d split q12h. Adjust для renal function.",
        "IV infusion over 60-120 мин",
        "Polypeptide antibiotic — disrupts Gram-negative cell membrane (binds LPS). Renal excretion. NeurotoxIcity + nephrotoxicity dose-limiting.",
        "Nephrotoxicity (60-70 % patients!). Neurotoxicity (paresthesias, peri-oral numbness, ataxia, neuromuscular blockade). NMS-like syndrome. Bronchospasm (inhaled).",
        "Lyophilized 500,000 ед vial. Reconstitute с 5 мл NS or WFI; dilute с D5W or NS для infusion.",
        "Falagas ME et al. Lancet Infect Dis 2006;6:589 — review. Tsuji BT et al. Pharmacotherapy 2019;39:10 — IDSA/SIDP guidelines. AAP Red Book.",
        "polymyxin B Pseudomonas Acinetobacter KPC Klebsiella 25000 ед/кг nephrotoxicity neurotoxicity Falagas 2006 IDSA SIDP",
    ),
    make_drug(
        "neo_colistin",
        "Colistin / Colistimethate", "Колистин / Колистиметат",
        "Coly-Mycin M",
        "Multidrug-resistant Gram-negative — same indications как polymyxin B. Inhaled formulation для pneumonia.",
        "Loading: 75,000 ед/кг (~6 мг/кг CBA — colistin base activity) IV. Maintenance: 75,000-150,000 ед/кг/d split q8h. Inhaled: 1-2 млн ед q12h via nebulizer.",
        "IV infusion over 30 мин; inhaled nebulizer",
        "Polymyxin E. Prodrug — colistimethate (CMS) → colistin. Renal excretion. Slow tissue penetration.",
        "Same as polymyxin B: nephrotoxicity, neurotoxicity. Inhaled — bronchospasm, paradoxical airway obstruction.",
        "Lyophilized 1 млн ед (~150 мг CBA). Reconstitute с 2 мл NS; dilute с D5W or NS.",
        "Tsuji BT et al. Pharmacotherapy 2019;39:10 — IDSA/SIDP. Falagas ME, Kasiakou SK. Clin Infect Dis 2005;40:1333. AAP Red Book.",
        "Coly-Mycin colistin colistimethate CMS multidrug-resistant Gram-negative inhaled nebulizer polymyxin E nephrotoxicity Tsuji 2019 Falagas 2005",
    ),
    make_drug(
        "neo_fosfomycin",
        "Fosfomycin IV", "Фосфомицин в/в",
        "Monurol IV (EU); Fosfomycin Trometamol",
        "MDR Gram-negative + Enterococcus combination therapy. Salvage. Neonatal experience growing в Europe.",
        "Neonates: 100 мг/кг IV q8-12h (loading 200 мг/кг). Older infants: 150-300 мг/кг/d split q6-8h IV.",
        "IV infusion over 60 мин (high Na load)",
        "Phosphonic acid antibiotic — inhibits MurA (peptidoglycan synthesis early step). Renal excretion. Synergistic с β-lactams.",
        "High Na content (high loading dose: 14 mmol/g) — risk hypernatremia, hypokalemia. Cardiac failure exacerbation. Phlebitis. Hypocalcemia.",
        "Lyophilized 4 g vial. Reconstitute с 20 мл WFI; dilute с D5W or NS (NOT с Lactated Ringer).",
        "Manchanda V et al. Indian J Med Res 2007;125:121. Goorhuis A et al. J Antimicrob Chemother 2018;73:1929 — pediatric review. AAP Red Book.",
        "Monurol fosfomycin trometamol MurA peptidoglycan IV 100 мг/кг q8-12h hypernatremia hypokalemia Manchanda 2007 Goorhuis 2018",
    ),
    make_drug(
        "neo_piperacillin_tazobactam",
        "Piperacillin-Tazobactam", "Пиперациллин-Тазобактам",
        "Tazocin, Zosyn",
        "Полимикробные инфекции (NEC, peritonitis, hospital-acquired pneumonia, complicated UTI). Broad-spectrum + β-lactamase inhibitor.",
        "<32 нед PMA: 50-100 мг/кг piperacillin q8h IV. ≥32 нед PMA: 80-100 мг/кг q6-8h IV. Older pediatric: 75-100 мг/кг q6h IV (max 4 g piperacillin q6h).",
        "IV infusion over 30 мин",
        "Extended-spectrum penicillin + tazobactam (β-lactamase inhibitor). Renal excretion (most). Tissue penetration good.",
        "Hypersensitivity. C. difficile. Hypokalemia. Eosinophilia. Renal adjustment при CrCl < 40. Synergy с aminoglycosides — physical incompatibility (separate lines).",
        "Lyophilized 4.5 g (4 g pip + 0.5 g tazo) — reconstitute с 20 мл NS or WFI; dilute в 50-100 мл NS.",
        "Cohen-Wolkowiez M et al. Antimicrob Agents Chemother 2014;58:3003 — neonatal PK. AAP Red Book. Cochrane Empiric ABX neonatal sepsis 2017:CD004495.",
        "Tazocin Zosyn piperacillin tazobactam NEC peritonitis pneumonia UTI 50-100 мг/кг q8h β-lactamase inhibitor Cohen-Wolkowiez 2014",
    ),
    make_drug(
        "neo_l_carnitine",
        "L-Carnitine", "L-Карнитин",
        "Carnitor, Levocarnil",
        "Carnitine deficiency (primary genetic, secondary к VPA, PN, prematurity). Treats hypoglycemia, hypotonia, cardiomyopathy.",
        "PN supplementation (preterm): 10-20 мг/кг/d IV. Treatment carnitine deficiency: 50-100 мг/кг/d IV или PO split q6h. Acute hyperammonemia rescue: 100-300 мг/кг IV bolus + maintenance.",
        "IV (preferred for acute) или PO syrup",
        "Required for fatty acid β-oxidation transport into mitochondria. Renal excretion. Increases free fatty acid utilization.",
        "Generally well-tolerated. Diarrhea (PO). Body odor (fishy — TMAU-like, dose-dependent). Seizure threshold lowering (rare).",
        "Solution 100 мг/мл IV ampoule; PO syrup 100 мг/мл.",
        "Stanley CA. Annu Rev Nutr 2004;24:301 — carnitine deficiency. UCDC protocols. NeoFax / Neonatal Formulary 9 ed.",
        "Carnitor Levocarnil L-carnitine deficiency VPA PN cardiomyopathy 10-20 мг/кг/d 50-100 мг/кг/d β-oxidation Stanley 2004 UCDC",
    ),
    make_drug(
        "neo_sodium_benzoate",
        "Sodium Benzoate", "Натрия бензоат",
        "Ammonul (с phenylacetate)",
        "Acute hyperammonemia (urea cycle disorders, organic acidemias). Alternative pathway nitrogen excretion via hippurate.",
        "Loading: 250-500 мг/кг IV over 90-120 мин (часто mixed с phenylacetate as Ammonul). Maintenance: 250-500 мг/кг/d split q6-8h IV. PO: similar dose.",
        "IV infusion (central preferred) over 90-120 мин; PO",
        "Conjugates с glycine → hippurate (water-soluble, renally excreted) — bypasses urea cycle. 1 mol sodium benzoate eliminates 1 mol nitrogen.",
        "High Na load. Acidosis if rapid push. Sedation, lethargy (high doses). Increased ammonia rebound при abrupt stop. Use only после metabolic team consultation.",
        "Powder для reconstitution. Solution 100 мг/мл IV или PO. Mix carefully — incompatible с calcium-containing solutions.",
        "Häberle J et al. J Inherit Metab Dis 2019;42:1 — UCD guidelines. Ammonul package insert. Batshaw ML. Pediatrics 2014.",
        "Ammonul sodium benzoate hyperammonemia urea cycle disorders organic acidemia hippurate glycine 250-500 мг/кг loading Haberle 2019 Batshaw",
    ),
    make_drug(
        "neo_sodium_phenylbutyrate",
        "Sodium Phenylbutyrate", "Натрия фенилбутират",
        "Buphenyl, Pheburane",
        "Chronic management urea cycle disorders (UCD). Prodrug — converts к phenylacetate в vivo.",
        "Maintenance (long-term UCD): 450-600 мг/кг/d split q4-6h PO/NG. Acute: phenylacetate (Ammonul) preferred IV.",
        "PO/NG (foul taste — capsules / Pheburane taste-masked granules)",
        "Phenylbutyrate → phenylacetate (active) → conjugates с glutamine → phenylacetylglutamine (PAGN, urinary).",
        "Foul taste / smell. Body odor. Amenorrhea (older girls). Acidosis. Hypokalemia. Edema (Na load).",
        "Tablet 500 мг (Buphenyl); granules 483 мг/г (Pheburane). PO: mix с food или drink.",
        "Häberle J et al. J Inherit Metab Dis 2019;42:1. UCDC protocols. Buphenyl package insert.",
        "Buphenyl Pheburane sodium phenylbutyrate urea cycle disorder UCD chronic 450-600 мг/кг/d phenylacetate glutamine PAGN Haberle 2019",
    ),
    make_drug(
        "neo_biotin",
        "Biotin", "Биотин",
        "Various",
        "Biotinidase deficiency (RUSP newborn screening). Multiple carboxylase deficiency. Holocarboxylase deficiency.",
        "Treatment biotinidase deficiency: 5-20 мг PO q24h life-long. Multiple carboxylase deficiency: 10-30 мг q24h. Empiric IEM workup: 10 мг IV trial.",
        "PO (preferred — life-long); IV (rare — workup)",
        "Cofactor 4 carboxylases (pyruvate, propionyl, methylcrotonyl, acetyl). Dietary requirement low. Most absorbed in proximal small intestine.",
        "Generally well-tolerated. False low TSH (interference с immunoassays — discontinue 2-3 days before lab draw).",
        "Tablet 10 мг (compounded). Solution 10 мг/мл compounded.",
        "Wolf B. J Pediatr 2017;185:21 — biotinidase deficiency. РФ Приказ МЗ 2023 (RUSP scheme).",
        "biotin biotinidase deficiency carboxylase 5-20 мг q24h pyruvate propionyl methylcrotonyl acetyl Wolf 2017",
    ),
    make_drug(
        "neo_thiamine_b1",
        "Thiamine (Vit B1)", "Тиамин (B1)",
        "Various",
        "MSUD (Maple Syrup Urine Disease) — thiamine-responsive subtype. Beriberi (rare in well-fed populations). Wernicke-Korsakoff prophylaxis (PN-related).",
        "MSUD thiamine-responsive: 100-300 мг q24h PO/IV. Empiric IEM workup: 100 мг IV. Standard PN: 1.2 мг q24h.",
        "PO / IV / IM",
        "Cofactor pyruvate dehydrogenase + α-ketoglutarate dehydrogenase + branched-chain α-keto acid dehydrogenase (BCKAD — relevant в MSUD).",
        "Anaphylaxis (rare, IV). Generally safe. Watch для thiamine-responsive MSUD trial — improvements в days.",
        "Solution 100 мг/мл IV; tablets 50/100 мг.",
        "Strauss KA et al. Mol Genet Metab 2010;99:333 — MSUD. ESPEN PN guidelines.",
        "thiamine B1 MSUD maple syrup urine disease Wernicke beriberi 100-300 мг pyruvate dehydrogenase BCKAD Strauss 2010",
    ),
    make_drug(
        "neo_riboflavin_b2",
        "Riboflavin (Vit B2)", "Рибофлавин (B2)",
        "Various",
        "Glutaric aciduria type II (multiple acyl-CoA dehydrogenase deficiency — MADD), riboflavin-responsive subtype. Empiric IEM workup.",
        "Treatment MADD: 100-300 мг q24h PO. Empiric IEM workup: 100-200 мг q24h × 7-10 d trial.",
        "PO (preferred); IV (rare)",
        "Precursor FAD/FMN — cofactors для multiple acyl-CoA dehydrogenases.",
        "Yellow-orange urine (harmless). Generally safe.",
        "Tablet 50 мг или 100 мг.",
        "Olsen RK et al. Brain 2007;130:2045 — riboflavin-responsive MADD. UCDC protocols.",
        "riboflavin B2 glutaric aciduria type II MADD multiple acyl-CoA dehydrogenase 100-300 мг FAD FMN Olsen 2007",
    ),
    make_drug(
        "neo_sapropterin",
        "Sapropterin (BH4)", "Сапроптерин (BH4)",
        "Kuvan, Phebloc",
        "Tetrahydrobiopterin (BH4) deficiency. PKU (BH4-responsive). DOPA-responsive dystonia.",
        "Treatment BH4 deficiency: 5-10 мг/кг/d PO single dose. Empiric IEM workup: 20 мг/кг q24h × 8 days trial. PKU response trial: 10-20 мг/кг q24h × 1-4 нед.",
        "PO once daily (with food)",
        "Synthetic BH4 — cofactor для phenylalanine hydroxylase, tyrosine hydroxylase, tryptophan hydroxylase. Stabilizes mutant PAH protein.",
        "Hypersensitivity (rare). Headache. URI symptoms. Blood phenylalanine drops rapidly — combine с dietary changes carefully (avoid hypophenylalaninemia).",
        "Tablet 100 мг (Kuvan); dispersible — dissolve в water или apple juice 4-5 мл.",
        "Burton BK et al. J Inherit Metab Dis 2007;30:700 — Kuvan PKU trial. Anjema K et al. Mol Genet Metab 2011;104:S60.",
        "Kuvan Phebloc sapropterin BH4 tetrahydrobiopterin deficiency PKU phenylalanine hydroxylase 5-10 мг/кг/d Burton 2007 Anjema 2011",
    ),
    make_drug(
        "neo_betaine",
        "Betaine", "Бетаин",
        "Cystadane",
        "Homocystinuria (CBS deficiency, MTHFR deficiency, cobalamin defects). Alternative pathway methionine remethylation.",
        "Loading: 100-200 мг/кг q12h PO (3 g q12h adult dose). Goal: methionine 10-100 µмоль/л; homocysteine < 50 µмоль/л.",
        "PO (powder mixed с food/water)",
        "Methyl donor — converts homocysteine to methionine via betaine-homocysteine methyltransferase (BHMT). Bypasses MTHFR pathway.",
        "Cerebral edema with rapid methionine elevation (rare). Body odor (fishy). Diarrhea. GI upset.",
        "Powder 1 g/scoop. Mix с food, water, or juice — drink within 12 ч.",
        "Walter JH et al. Pediatr Res 1998;43:756. Cystadane package insert. Mudd SH. Mol Genet Metab 2011.",
        "Cystadane betaine homocystinuria CBS MTHFR cobalamin methionine remethylation 100-200 мг/кг q12h BHMT Walter 1998",
    ),
    make_drug(
        "neo_terlipressin",
        "Terlipressin", "Терлипрессин",
        "Glypressin",
        "Refractory shock после high-dose catecholamines (alternative к vasopressin). Hepatorenal syndrome. PPHN refractory.",
        "Bolus: 7-20 мкг/кг IV slow (2-5 мин) q4-6h. Continuous: 5-10 мкг/кг/h infusion (case reports).",
        "IV bolus или continuous (central line preferred — ischemia risk)",
        "V1 receptor agonist (vasoconstrictor) — longer t½ than vasopressin (~6 ч). Hepatic + renal excretion.",
        "Digital + cutaneous ischemia, mesenteric ischemia (NEC risk у preterm), bradycardia, electrolyte shifts (hyponatremia from V2-like effect minor). Limited neonatal data.",
        "Lyophilized 1 мг vial. Reconstitute с 5 мл NS (200 мкг/мл); dilute с D5W for infusion.",
        "Yildizdas D et al. Acta Paediatr 2008;97:1308 — pediatric septic shock. SSC Pediatric 2020 guidelines.",
        "Glypressin terlipressin refractory shock catecholamines hepatorenal PPHN 7-20 мкг/кг V1 receptor vasopressor 6h Yildizdas 2008 SSC Pediatric 2020",
    ),
    make_drug(
        "neo_levosimendan",
        "Levosimendan", "Левосимендан",
        "Simdax",
        "Low cardiac output syndrome post-cardiac surgery. Refractory heart failure. Calcium sensitizer + K-ATP opener.",
        "Loading: 6-12 мкг/кг IV over 10 мин (often skipped — hypotension risk). Maintenance: 0.05-0.2 мкг/кг/мин continuous × 24 ч.",
        "IV continuous (no PO; central preferred)",
        "Calcium sensitizer (binds troponin C) — increases contractility без ↑ O₂ demand. K-ATP opener — vasodilation. Long-acting metabolite (OR-1896) effect 7-9 d.",
        "Hypotension (especially при loading dose). Headache, hypokalemia, tachyarrhythmias. Limited neonatal data — extrapolated mainly from pediatric cardiac surgery.",
        "Concentrate 2.5 мг/мл — dilute с D5W or NS to 0.025-0.05 мг/мл. Stable 24 ч.",
        "Pellicer A et al. Pediatr Cardiol 2012;33:1023. Ricci Z et al. Crit Care Med 2012;40:2469 — pediatric cardiac surgery.",
        "Simdax levosimendan low cardiac output post-cardiac surgery calcium sensitizer K-ATP opener 0.05-0.2 мкг/кг/мин 24h Pellicer 2012 Ricci 2012",
    ),
    make_drug(
        "neo_propofol",
        "Propofol", "Пропофол",
        "Diprivan",
        "Procedural sedation (intubation, MRI, line placement). Induction GA. Status epilepticus (refractory). NICU use limited — \"propofol infusion syndrome\" risk у пediatric.",
        "Procedural bolus: 2.5-3 мг/кг IV (slow push). Maintenance infusion: 4-9 мг/кг/h (avoid > 4 мг/кг/h in neonates — PRIS risk).",
        "IV bolus or continuous (large vein central preferred)",
        "GABA-A receptor agonist — fast onset 30 sec, short duration 5-10 мин. Hepatic + extra-hepatic metabolism.",
        "**Propofol infusion syndrome (PRIS)** — metabolic acidosis, rhabdomyolysis, cardiac failure (rare у high-dose / prolonged use; pediatric risk). Hypotension (vasodilation + cardiac depression). Hyperlipidemia. Bacterial growth in lipid emulsion — strict aseptic technique. ⚠️ NOT for prolonged ICU sedation < 1 yr (FDA warning).",
        "Emulsion 10 мг/мл (1 %); 20 мг/мл (2 %, less common). Discard within 12 ч of opening (bacterial growth risk).",
        "Veroli P et al. Br J Anaesth 1992;68:178 — pediatric PK. Bray RJ. Paediatr Anaesth 1998;8:491 — PRIS. AAP statement on procedural sedation.",
        "Diprivan propofol procedural sedation intubation MRI 2.5-3 мг/кг infusion 4-9 мг/кг/h GABA-A PRIS propofol infusion syndrome metabolic acidosis Veroli 1992 Bray 1998",
    ),
    make_drug(
        "neo_eculizumab",
        "Eculizumab", "Экулизумаб",
        "Soliris",
        "Atypical hemolytic uremic syndrome (aHUS) у neonates. PNH (rare у neonates). Monoclonal antibody against C5 complement.",
        "aHUS pediatric (per package insert): < 5 кг 300 мг/нед × 2 weeks; 5-10 кг 600 мг/нед × 2 weeks; then maintenance q2-3 нед. Pre-medicate с Meningococcal vaccination + ABX prophylaxis.",
        "IV infusion over 35 мин",
        "Humanized monoclonal Ab — binds C5 complement, prevents cleavage to C5a/C5b → blocks MAC formation. t½ ~270 ч (11 d).",
        "**Increased risk meningococcal infection** (Black box) — vaccinate ≥ 2 нед pre-treatment + penicillin prophylaxis chronically. Infusion reactions. Hypertension. Headache.",
        "Vial 30 мл of 10 мг/мл (300 мг). Dilute с NS to 5 мг/мл.",
        "Ardissino G et al. Pediatrics 2015;135:e549 — aHUS pediatric. Soliris package insert. AAP infectious disease prophylaxis 2024.",
        "Soliris eculizumab atypical hemolytic uremic syndrome aHUS PNH C5 complement monoclonal antibody meningococcal black box vaccination Ardissino 2015",
    ),
    make_drug(
        "neo_recombinant_factor_vii",
        "Recombinant Factor VIIa", "Рекомбинантный фактор VIIa",
        "NovoSeven",
        "Refractory life-threatening bleeding (post-cardiac surgery, ECMO bleeding, factor VII deficiency, hemophilia с inhibitors). Off-label у neonates — last-resort.",
        "Bleeding adult dose: 90 мкг/кг IV q2h until hemostasis. Pediatric / neonatal off-label: 90-100 мкг/кг IV q2-3h.",
        "IV bolus over 2-5 мин",
        "Recombinant activated factor VII — bypass agent activates factor X directly при tissue factor exposure. Short t½ ~2.5 ч.",
        "Thrombosis (DVT, PE, stroke, MI) — increased риск especially у newborns. Limited neonatal data — discuss с hematology. Reserved for refractory bleeding после standard interventions failed.",
        "Lyophilized 1 mg / 2 mg / 5 mg vials. Reconstitute с supplied diluent immediately before use.",
        "Levi M et al. NEJM 2010;363:1791 — bleeding management. Pychyńska-Pokorska M et al. Adv Med Sci 2008 — neonatal cardiac surgery.",
        "NovoSeven recombinant factor VIIa rFVIIa refractory bleeding ECMO cardiac surgery hemophilia inhibitor 90 мкг/кг q2h thrombosis DVT PE stroke MI Levi 2010",
    ),
    make_drug(
        "neo_alteplase_cvc",
        "Alteplase Catheter Clearance", "Альтеплаза для проходимости катетера",
        "Cathflo Activase",
        "Restoration patency occluded central venous catheter (clot in lumen). NOT for systemic thrombolysis (separate indication).",
        "Catheter clearance: 0.5-2 мг (lumen volume) instilled into catheter, dwell 30-120 min, attempt aspiration. Repeat once if needed.",
        "Intra-luminal instillation only (NOT systemic IV)",
        "Recombinant tissue plasminogen activator — converts plasminogen → plasmin → fibrin breakdown. Local effect only при intra-luminal use.",
        "Bleeding risk (low при intraluminal). Cathethrombotic embolism. Allergic reactions rare.",
        "Single-use vial 2 мг — reconstitute с 2.2 мл NS for 1 мг/мл solution. Use immediately.",
        "Blaney M et al. J Pediatr 2006;149:828. Choi M et al. Pediatr Blood Cancer 2007;48:660.",
        "Cathflo Activase alteplase catheter clearance 0.5-2 мг intra-luminal 30-120 min plasminogen plasmin fibrin Blaney 2006 Choi 2007",
    ),
    make_drug(
        "neo_dexmedetomidine",
        "Dexmedetomidine (alpha-2 agonist)", "Дексмедетомидин (α2-агонист)",
        "Precedex, Dexdor",
        "Procedural sedation, MV sedation, NAS adjunct когда morphine + clonidine insufficient. Selective α2 agonist (α2/α1 1620:1 vs clonidine 220:1).",
        "Loading (optional): 0.5-1 мкг/кг IV over 10 мин. Maintenance: 0.2-1.4 мкг/кг/h continuous. NAS adjunct: 0.1-0.3 мкг/кг/h.",
        "IV continuous infusion (preferred); IV bolus (procedural)",
        "Selective α2 adrenergic agonist — sympatholytic, sedative, analgesic-sparing. Hepatic metabolism (CYP2A6). t½ neonatal 2-3 ч; preterm up to 7-8 ч.",
        "Bradycardia (dose-dependent — esp loading). Hypotension. Withdrawal при abrupt stop > 48 h — taper. Limited US FDA approval < 18 yr (off-label но widely accepted).",
        "Standard 4 мкг/мл (200 мкг in 50 мл NS); central preferred for 8 мкг/мл concentrate.",
        "Chrysostomou C et al. J Pediatr 2014;164:276 — neonatal PK. PALICS Pediatric ICU Sedation Guidelines 2017. NeoFax.",
        "Precedex Dexdor dexmedetomidine α2-agonist sedation MV NAS adjunct 0.5-1 мкг/кг loading 0.2-1.4 мкг/кг/h selective bradycardia hypotension withdrawal taper Chrysostomou 2014 PALICS",
    ),
    make_drug(
        "neo_thiopental",
        "Thiopental Sodium", "Тиопентал натрия",
        "Pentothal",
        "Refractory status epilepticus после benzodiazepines + phenobarbital + levetiracetam fail. Induction anesthesia. ICP control в severe TBI / HIE.",
        "Status epilepticus: loading 4-5 мг/кг IV slow → infusion 2-5 мг/кг/h titrate to burst-suppression on EEG. Anesthesia induction: 3-5 мг/кг IV.",
        "IV slow push or continuous (central preferred for prolonged use)",
        "Ultra-short-acting barbiturate — GABA agonist. Hepatic metabolism (saturable kinetics — accumulation possible). Highly lipophilic — rapid CNS distribution.",
        "Cardiovascular depression (significant — hypotension common). Respiratory depression (intubation often required). Histamine release. Prolonged sedation на high doses (saturation kinetics). Avoid в porphyria.",
        "Lyophilized 500 мг vial. Reconstitute с 20 мл WFI (25 мг/мл); dilute с NS or D5W for infusion.",
        "Brevoord JC et al. Pediatr Crit Care Med 2005;6:14 — refractory status epilepticus. AAP COFN. Painter MJ et al. NEJM 1999;341:485 — neonatal seizures.",
        "Pentothal thiopental refractory status epilepticus induction anesthesia ICP control 4-5 мг/кг loading 2-5 мг/кг/h GABA barbiturate burst-suppression Brevoord 2005 Painter 1999",
    ),
    make_drug(
        "neo_papaverine",
        "Papaverine", "Папаверин",
        "Various",
        "Maintenance umbilical / peripheral arterial line patency (low-dose continuous in line saline). Vasospasm.",
        "UAC patency: 60 мг/л in 0.45 % NaCl line solution (0.06 мг/мл) — runs at line maintenance rate. Vasospasm bolus: 0.5-1 мг/кг IV slow.",
        "Continuous IV (line maintenance) или IV bolus (vasospasm)",
        "Phosphodiesterase inhibitor — relaxes vascular smooth muscle. Hepatic metabolism. Short t½ 1-2 ч.",
        "Bolus dosing — hypotension, AV block, ventricular arrhythmias rare. Histamine release. Use cautiously.",
        "Solution 30 мг/мл. Dilute appropriately for line maintenance.",
        "Heulitt MJ et al. J Pediatr 1993;122:837 — UAC patency. AAP COFN.",
        "papaverine UAC umbilical arterial catheter patency vasospasm 60 мг/л phosphodiesterase Heulitt 1993",
    ),
    make_drug(
        "neo_lipid_emulsion_rescue",
        "Intravenous Lipid Emulsion (Rescue)", "Жировая эмульсия в/в (rescue)",
        "Intralipid 20 %, Liposyn",
        "Local anesthetic systemic toxicity (LAST) — bupivacaine, ropivacaine overdose. Lipid-soluble drug overdose rescue (rare у neonates).",
        "LAST adult dose: 1.5 мл/кг IV bolus over 1 мин → 0.25 мл/кг/min infusion until hemodynamic stability + 10 мин. Pediatric / neonatal extrapolated.",
        "IV bolus + continuous infusion",
        "Lipid sink theory — extracts lipophilic drugs from receptor sites; also direct cardiotoxicity recovery via fatty acid energy substrate.",
        "Rare: pancreatitis, ARDS, fat overload syndrome (very high doses). Disrupt lab tests (turbid plasma).",
        "Standard 20 % emulsion (0.2 g/мл). Use existing PN lipid stocks.",
        "ASRA Practice Advisory 2017 — LAST. Weinberg G et al. Anesthesiology 2008;108:907 — original.",
        "Intralipid Liposyn lipid emulsion rescue LAST local anesthetic systemic toxicity bupivacaine ropivacaine 1.5 мл/кг bolus 0.25 мл/кг/min lipid sink ASRA 2017 Weinberg 2008",
    ),
]


def main() -> int:
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {d["id"] for d in data["drugs"]}
    added = []
    skipped = []
    for drug in NEW_DRUGS:
        if drug["id"] in existing_ids:
            skipped.append(drug["name_en"])
            continue
        data["drugs"].append(drug)
        added.append(drug["name_en"])

    data["drugs"].sort(key=lambda d: d["name_en"].lower())
    data["version"] = "2.6.0"
    data["lastUpdated"] = "2026-05-09"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Added {len(added)} drugs")
    if skipped:
        print(f"Skipped {len(skipped)}: {', '.join(skipped)}")
    print(f"Total drugs now: {len(data['drugs'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
