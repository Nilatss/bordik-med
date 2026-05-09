"""Add 17 new neonatal drugs (batch 2) to public/neonatal-monographs.json.

Target: 133 -> 150+ drugs, completing audit Г1 minimum (>=150 NICU formulary).

Run: python scripts/add-neo-drugs-batch2.py
"""
import json
import sys
from pathlib import Path

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-monographs.json"

NEW_DRUGS = [
    {
        "id": "neo_dexmedetomidine",
        "name_en": "Dexmedetomidine",
        "name_ru": "Дексмедетомидин",
        "brand": "Precedex, Dexdor",
        "indications": (
            "Sedation у механически вентилируемых новорождённых "
            "(opioid-sparing); procedural sedation; NAS adjunct (когда "
            "morphine + clonidine insufficient). Selective α2 agonist — "
            "более селективный чем clonidine."
        ),
        "dose": (
            "Loading (optional, увеличивает риск bradycardia): 0.5-1 мкг/кг "
            "IV over 10 мин. Maintenance infusion: 0.2-1.4 мкг/кг/ч "
            "(typical 0.4-0.6). Procedural: 0.5-1 мкг/кг IV bolus + "
            "infusion 0.5 мкг/кг/ч. NAS adjunct: 0.1-0.3 мкг/кг/ч."
        ),
        "route": "IV continuous infusion (preferred), IV bolus (procedural)",
        "levels": (
            "α2/α1 selectivity 1620:1 (vs clonidine 220:1) — менее cardiac "
            "side effects. Onset 5-10 мин IV; t½ 2-3 ч (новорождённые до "
            "7-8 ч у preterm). Hepatic metabolism (CYP2A6, glucuronidation)."
        ),
        "precautions": (
            "Bradycardia (dose-dependent — особенно loading dose); rare "
            "asystole у young infants (caution). Hypotension (sympatholysis). "
            "Withdrawal при abrupt discontinuation > 48 ч use — taper. "
            "Hyperthermia rare. NOT FDA approved для < 18 лет (off-label "
            "neonatal use widely accepted, но не EU). PALICS 2017 dosing "
            "recommendations: maintain MAP per gestation — discontinue if "
            "HR < 80 bpm у term."
        ),
        "extemporaneous": (
            "Standard 4 мкг/мл (200 мкг in 50 мл NS); centrally preferred "
            "для concentrated 8 мкг/мл."
        ),
        "references": (
            "Chrysostomou C et al. J Pediatr 2014;164:276 — neonatal PK. "
            "O'Mara K et al. J Pediatr Pharmacol Ther 2018;23:215. PALICS "
            "Pediatric ICU Sedation Guidelines 2017. NeoFax / Neonatal "
            "Formulary 9 ed (Ainsworth). Surviving Sepsis Campaign "
            "Pediatric 2020."
        ),
        "fullText": (
            "Precedex Dexdor sedation mechanically ventilated newborn "
            "opioid-sparing procedural NAS adjunct alpha2 agonist selective "
            "0.5-1 мкг/кг loading 0.2-1.4 мкг/кг/ч maintenance 0.4-0.6 "
            "Bradycardia hypotension withdrawal taper Chrysostomou 2014 "
            "O'Mara PALICS 2017 NeoFax Surviving Sepsis Pediatric"
        ),
    },
    {
        "id": "neo_daptomycin",
        "name_en": "Daptomycin",
        "name_ru": "Даптомицин",
        "brand": "Cubicin",
        "indications": (
            "MRSA / VRE bacteremia или endocarditis (когда vancomycin не "
            "tolerated, MIC >= 2 mg/L, или treatment failure). Skin/soft "
            "tissue MRSA. Off-label у neonates — limited data; reserve "
            "для resistant Gram-positive."
        ),
        "dose": (
            "Bacteremia: 6 мг/кг IV q24h. Endocarditis right-sided: 8-10 "
            "мг/кг q24h. Severe persistent: 10-12 мг/кг q24h. Renal "
            "adjustment: q48h при CrCl < 30. Не для PNA (inactivated "
            "surfactant)."
        ),
        "route": "IV infusion over 30 мин (NOT IM, NOT for pneumonia)",
        "levels": (
            "Lipopeptide; bactericidal — depolarizes Gram+ membrane. "
            "Renal excretion (78 % unchanged). CSF penetration low. "
            "CK monitoring weekly."
        ),
        "precautions": (
            "Myopathy / rhabdomyolysis — discontinue if CK > 1000 + "
            "symptoms ИЛИ CK > 2000 asymptomatic. Eosinophilic pneumonia "
            "(rare). Hold statins (additive myopathy). PNA: surfactant "
            "binds and inactivates daptomycin — НЕ для pulmonary "
            "infection. Limited neonatal data — usually reserved для PICU "
            "consultation."
        ),
        "extemporaneous": (
            "Reconstitute 350 mg или 500 mg vial с NS; final 50 mg/мл; "
            "dilute в 50-100 мл NS for infusion; stable 12 ч room temp / "
            "48 ч refrigerator."
        ),
        "references": (
            "Antachopoulos C et al. Pediatr Infect Dis J 2012;31:1306 — "
            "neonatal PK study. AAP Red Book 2024-2027. NeoFax / Neonatal "
            "Formulary 9 ed."
        ),
        "fullText": (
            "Cubicin daptomycin MRSA VRE bacteremia endocarditis "
            "vancomycin failure 6 мг/кг q24h 8-10 мг/кг lipopeptide "
            "bactericidal Gram+ membrane depolarization myopathy "
            "rhabdomyolysis CK eosinophilic pneumonia surfactant "
            "Antachopoulos 2012 Red Book NeoFax newborn"
        ),
    },
    {
        "id": "neo_linezolid",
        "name_en": "Linezolid",
        "name_ru": "Линезолид",
        "brand": "Zyvox",
        "indications": (
            "MRSA / MRSE / VRE infections (когда vancomycin не tolerated "
            "или resistance). Pneumonia (good lung penetration). "
            "Complicated skin/soft tissue. Bacteremia. Off-label у "
            "neonates — больше данных чем daptomycin."
        ),
        "dose": (
            "< 7 дней: 10 мг/кг q12h IV или PO. >= 7 дней: 10 мг/кг q8h "
            "IV или PO. >= 12 лет: 600 мг q12h. Длительность 10-14 дней "
            "(до 28 для bacteremia/endocarditis). Bioavailability PO "
            "100 % — switch IV->PO когда clinically stable."
        ),
        "route": "IV infusion over 30-120 мин; PO suspension (100 % bioavail)",
        "levels": (
            "Oxazolidinone — inhibits 50S ribosomal subunit; bacteriostatic "
            "(some bactericidal effect against streptococci). Excellent "
            "tissue penetration including CSF (60-70 % serum). Hepatic "
            "metabolism (oxidation), renal clearance 30-40 %."
        ),
        "precautions": (
            "Thrombocytopenia (15-25 %, dose-dependent, > 10-14 дней use) "
            "— monitor platelets weekly. Anemia / neutropenia rare. "
            "Lactic acidosis (rare, mitochondrial toxicity). Peripheral "
            "neuropathy (long-term > 28 дней). Serotonin syndrome (MAOI "
            "activity — caution с SSRI/tramadol). Hypoglycemia rare."
        ),
        "extemporaneous": (
            "Standard 2 мг/мл IV (commercial premix). Suspension 100 "
            "мг/5 мл commercially available."
        ),
        "references": (
            "Deville JG et al. Pediatr Infect Dis J 2003;22:S158 — pediatric "
            "PK. Saiman L et al. Antimicrob Agents Chemother 2003;47:343 — "
            "neonatal use. AAP Red Book 2024-2027. NeoFax / Neonatal "
            "Formulary 9 ed."
        ),
        "fullText": (
            "Zyvox linezolid MRSA MRSE VRE pneumonia oxazolidinone 50S "
            "ribosomal 10 мг/кг q12h q8h bioavailability 100 PO IV "
            "thrombocytopenia anemia lactic acidosis peripheral neuropathy "
            "serotonin syndrome MAOI Deville 2003 Saiman 2003 Red Book "
            "NeoFax"
        ),
    },
    {
        "id": "neo_caspofungin",
        "name_en": "Caspofungin",
        "name_ru": "Каспофунгин",
        "brand": "Cancidas",
        "indications": (
            "Invasive candidiasis (candidemia, disseminated) у neonates "
            "когда fluconazole resistance или amphotericin не tolerated. "
            "Empiric у persistent fever neutropenia. Aspergillus salvage "
            "(не первая линия)."
        ),
        "dose": (
            "Loading: 25 мг/м² IV day 1, then 25 мг/м² IV q24h. "
            "Alternative weight-based: 2 мг/кг loading, then 2 мг/кг "
            "q24h (preterm + term). Hepatic dysfunction (Child-Pugh B): "
            "уменьшить 70 %."
        ),
        "route": "IV infusion over 60 мин (no PO, no IM)",
        "levels": (
            "Echinocandin — inhibits beta-1,3-D-glucan synthase (fungal "
            "cell wall). Fungicidal vs Candida; fungistatic vs "
            "Aspergillus. Hepatic metabolism (no CYP450); minimal renal. "
            "CSF penetration poor — НЕ для CNS candidiasis (use "
            "amphotericin B or fluconazole)."
        ),
        "precautions": (
            "Hepatotoxicity — monitor LFTs. Histamine release reactions "
            "(rare). Hypokalemia. Phlebitis. Drug interactions: "
            "rifampin, dexamethasone, phenytoin, carbamazepine снижают "
            "caspofungin levels — increase dose к 35 мг/м² или 3 мг/кг."
        ),
        "extemporaneous": (
            "Reconstitute 50 мг или 70 мг vial с 10.5 мл NS (5 мг/мл); "
            "dilute в 100-250 мл NS (NOT D5W — incompatible). Stable "
            "24 ч refrigerator."
        ),
        "references": (
            "Saez-Llorens X et al. Antimicrob Agents Chemother 2009;53:869 "
            "— neonatal PK. Walsh TJ et al. Pediatr Infect Dis J 2005;24:153. "
            "ESCMID Pediatric IFI Guideline 2024. AAP Red Book 2024-2027."
        ),
        "fullText": (
            "Cancidas caspofungin invasive candidiasis candidemia "
            "neonatal echinocandin beta-1,3-glucan synthase 25 мг/м² 2 "
            "мг/кг loading hepatic CSF poor histamine phlebitis rifampin "
            "dexamethasone Saez-Llorens 2009 Walsh 2005 ESCMID Red Book"
        ),
    },
    {
        "id": "neo_micafungin",
        "name_en": "Micafungin",
        "name_ru": "Микафунгин",
        "brand": "Mycamine",
        "indications": (
            "Invasive candidiasis у neonates — preferred echinocandin "
            "(больше neonatal data чем caspofungin). Candida prophylaxis "
            "у high-risk preterm < 1000 г в endemic units. Esophageal "
            "candidiasis."
        ),
        "dose": (
            "Invasive candidiasis: 7-10 мг/кг q24h IV (preterm + term) — "
            "higher dose чем у adults из-за higher Vd и clearance. "
            "Prophylaxis: 1-2 мг/кг q24h. CNS / disseminated: 10-15 "
            "мг/кг q24h."
        ),
        "route": "IV infusion over 60 мин (no PO, no IM)",
        "levels": (
            "Echinocandin — inhibits beta-1,3-D-glucan synthase. CSF "
            "penetration low в standard doses (10-25 % serum), но "
            "fungicidal в brain tissue при HIGH-DOSE (10-15 мг/кг). "
            "Hepatic metabolism. NO renal adjustment needed."
        ),
        "precautions": (
            "Hepatotoxicity — monitor LFTs weekly. Hemolysis reported "
            "(rare neonatal cases). Histamine release (slow infusion). "
            "Rash. Phlebitis. Limited data for CNS candidiasis при "
            "doses < 10 мг/кг — favor amphotericin B at this site."
        ),
        "extemporaneous": (
            "Reconstitute 50 мг или 100 мг vial с 5 мл NS or D5W (10 "
            "or 20 мг/мл); dilute в 100 мл NS or D5W; stable 24 ч "
            "refrigerator. Avoid shaking — foaming."
        ),
        "references": (
            "Hope WW et al. Antimicrob Agents Chemother 2010;54:5306 — "
            "neonatal CNS dosing. Benjamin DK et al. Pediatrics "
            "2010;125:e1042. AAP Red Book 2024-2027. ESCMID Pediatric "
            "IFI Guideline 2024."
        ),
        "fullText": (
            "Mycamine micafungin invasive candidiasis preferred neonatal "
            "echinocandin beta-1,3-glucan 7-10 мг/кг q24h prophylaxis 1-2 "
            "мг/кг CNS 10-15 мг/кг hepatic Hope 2010 Benjamin Pediatrics "
            "Red Book ESCMID"
        ),
    },
    {
        "id": "neo_voriconazole",
        "name_en": "Voriconazole",
        "name_ru": "Вориконазол",
        "brand": "Vfend",
        "indications": (
            "Invasive aspergillosis (preferred over amphotericin per "
            "IDSA 2016). Fluconazole-resistant Candida (e.g., C. krusei, "
            "some C. glabrata). Scedosporium / Fusarium infections. "
            "Limited neonatal use — consult PICU/ID."
        ),
        "dose": (
            "Loading: 9 мг/кг IV q12h x 2 doses, then 8 мг/кг IV q12h "
            "(< 12 лет). Switch к PO: 9 мг/кг q12h (max 350 мг). "
            "Therapeutic monitoring trough 2-5 мг/л (peak 1-6) — "
            "highly variable PK у neonates."
        ),
        "route": (
            "IV infusion over 1-2 ч (not bolus); PO suspension "
            "(40 мг/мл) or tablets"
        ),
        "levels": (
            "Triazole — inhibits ergosterol synthesis. CYP2C19 (major), "
            "2C9, 3A4 metabolism — extensive interactions. CYP2C19 "
            "polymorphism causes 4x variation in levels у poor "
            "metabolizers. Penetration: CSF, brain, urine."
        ),
        "precautions": (
            "Visual disturbances (30 % — transient). Hepatotoxicity — "
            "monitor LFTs. QT prolongation. Photosensitivity (long-term "
            "use). Periostitis (chronic). Drug interactions: "
            "contraindicated с rifampin, ritonavir, sirolimus, ergot. "
            "Снизить dose с phenytoin, omeprazole. IV vehicle "
            "(sulfobutylether-cyclodextrin) accumulates в renal failure "
            "-> use PO if CrCl < 50."
        ),
        "extemporaneous": (
            "Reconstitute 200 мг vial с 19 мл WFI (10 мг/мл); dilute "
            "к 0.5-5 мг/мл с NS, D5W, LR. Stable 24 ч refrigerator."
        ),
        "references": (
            "Walsh TJ et al. NEJM 2002;346:225 — landmark voriconazole "
            "vs amphotericin. IDSA Aspergillosis Guidelines 2016. "
            "Friberg LE et al. Clin Pharmacol Ther 2012;91:472 — "
            "pediatric PK. AAP Red Book 2024-2027."
        ),
        "fullText": (
            "Vfend voriconazole invasive aspergillosis fluconazole-"
            "resistant Candida Scedosporium Fusarium 9 мг/кг loading 8 "
            "мг/кг q12h triazole ergosterol CYP2C19 visual disturbances "
            "hepatotoxicity QT photosensitivity periostitis cyclodextrin "
            "renal Walsh NEJM 2002 IDSA 2016 Friberg Red Book"
        ),
    },
    {
        "id": "neo_rocuronium",
        "name_en": "Rocuronium",
        "name_ru": "Рокуроний",
        "brand": "Zemuron, Esmeron",
        "indications": (
            "Rapid sequence intubation (RSI); paralysis для механической "
            "вентиляции; surgical neuromuscular blockade. Modern "
            "alternative к succinylcholine для RSI у neonates без "
            "side-effects (hyperkalemia, MH risk)."
        ),
        "dose": (
            "RSI: 1 мг/кг IV bolus (>= 0.6 мг/кг adequate). Maintenance "
            "bolus: 0.3-0.6 мг/кг q30-60min. Continuous infusion: 7-10 "
            "мкг/кг/мин (start) — titrate train-of-four. Sugammadex "
            "reversal: 4 мг/кг IV (deep block) или 16 мг/кг (immediate)."
        ),
        "route": "IV bolus или continuous infusion (no PO)",
        "levels": (
            "Aminosteroid non-depolarizing NMBA. Onset 60-90 sec; "
            "duration 30-45 мин. Hepatic metabolism (most), renal "
            "(small). NO histamine release (vs atracurium)."
        ),
        "precautions": (
            "Anaphylaxis (rare but reported у neonates). Prolonged "
            "paralysis в hepatic dysfunction. Bradycardia (vagal "
            "stimulation rare). Hyperkalemia не characteristic (vs "
            "succinylcholine). NMBA + sedation/analgesia required — "
            "patient awake and paralyzed otherwise. Sugammadex preferred "
            "reversal (specific cyclodextrin-based) — neostigmine "
            "alternative."
        ),
        "extemporaneous": (
            "Standard 10 мг/мл (commercial). Continuous infusion: "
            "1-2 мг/мл с NS or D5W; stable 24 ч room temp."
        ),
        "references": (
            "Driessen JJ et al. Paediatr Anaesth 2000;10:7 — neonatal PK. "
            "RAEMS Guideline (Royal College Anaesthetists) 2019. "
            "Difficult Airway Society Pediatric Guidelines 2024. "
            "NeoFax / Neonatal Formulary 9 ed."
        ),
        "fullText": (
            "Zemuron Esmeron rocuronium RSI rapid sequence intubation "
            "paralysis ventilation neuromuscular blockade aminosteroid "
            "non-depolarizing NMBA 1 мг/кг 0.6 мг/кг 7-10 мкг/кг/мин "
            "sugammadex 4 мг/кг hepatic anaphylaxis Driessen RAEMS "
            "Difficult Airway"
        ),
    },
    {
        "id": "neo_cisatracurium",
        "name_en": "Cisatracurium",
        "name_ru": "Цисатракурий",
        "brand": "Nimbex",
        "indications": (
            "Neuromuscular blockade у механически вентилируемых; "
            "surgical paralysis. Preferred у hepatic + renal dysfunction "
            "(Hofmann elimination — organ-independent). Less "
            "histamine-release vs atracurium."
        ),
        "dose": (
            "Bolus: 0.15-0.2 мг/кг IV. Maintenance bolus: 0.03 мг/кг "
            "q40-60 мин. Continuous infusion: 1-3 мкг/кг/мин (start), "
            "titrate train-of-four. Reversal: neostigmine 0.07 мг/кг + "
            "atropine 0.02 мг/кг при >= 2 twitches."
        ),
        "route": "IV bolus или continuous infusion (no PO)",
        "levels": (
            "Benzylisoquinolinium non-depolarizing NMBA. Hofmann "
            "elimination (spontaneous degradation in plasma) -> "
            "predictable у hepatic / renal failure. Onset 2-3 мин; "
            "duration 30-50 мин."
        ),
        "precautions": (
            "Less histamine release vs atracurium — но possible. "
            "Laudanosine accumulation (Hofmann breakdown product) у "
            "prolonged infusion -> seizure threshold lowering (rare). "
            "NMBA + sedation/analgesia required. Train-of-four monitoring "
            "essential. Limited neonatal data — use cautiously."
        ),
        "extemporaneous": (
            "Standard 2 мг/мл (commercial). Stable refrigerated; protect "
            "from light. Continuous infusion: dilute с NS or D5W."
        ),
        "references": (
            "Reich DL et al. Anesth Analg 2004;98:1005 — pediatric PK. "
            "Imbeault K et al. Anesth Analg 2007;104:798 — neonatal use. "
            "PALICS Guidelines 2017. NeoFax / Neonatal Formulary 9 ed."
        ),
        "fullText": (
            "Nimbex cisatracurium neuromuscular blockade hepatic renal "
            "Hofmann elimination 0.15-0.2 мг/кг bolus 1-3 мкг/кг/мин "
            "infusion benzylisoquinolinium less histamine laudanosine "
            "Reich Imbeault PALICS neonatal"
        ),
    },
    {
        "id": "neo_ganciclovir",
        "name_en": "Ganciclovir",
        "name_ru": "Ганцикловир",
        "brand": "Cytovene",
        "indications": (
            "Symptomatic congenital CMV (cCMV) disease (CNS involvement, "
            "hepatitis, sepsis-like, hearing loss). Per AAP Red Book + "
            "CASG protocol — improves hearing, neurodevelopment outcomes "
            "если started в первые 30 дней. Severe CMV у "
            "immunocompromised."
        ),
        "dose": (
            "Treatment cCMV: 6 мг/кг IV q12h x 6 weeks (CASG 218 trial). "
            "Switch к valganciclovir PO 16 мг/кг q12h x остальное "
            "(до 6 мес). CMV prophylaxis (transplant): 5 мг/кг q12h x "
            "7-14 дней, then 5 мг/кг q24h."
        ),
        "route": "IV infusion over 60 мин (NOT IV push — extravasation тяжёлая)",
        "levels": (
            "Synthetic guanosine analog — phosphorylated by viral kinase "
            "(UL97) -> inhibits viral DNA polymerase. Renal excretion "
            "unchanged 90 %. Adjust для renal dysfunction (CrCl < 70)."
        ),
        "precautions": (
            "Neutropenia (40 %, dose-limiting) — discontinue если "
            "ANC < 500. Thrombocytopenia. Hepatotoxicity. "
            "Carcinogenic / mutagenic in animals — handle with PPE. "
            "Renal dysfunction — adjust dose. Extravasation тяжёлая "
            "(vesicant) — central line preferred. CSF penetration "
            "30-70 % serum."
        ),
        "extemporaneous": (
            "Reconstitute 500 мг vial с 10 мл WFI (50 мг/мл); dilute "
            "в 100 мл NS or D5W (<= 10 мг/мл). Stable 24 ч refrigerator. "
            "Hazardous drug — handle с chemo PPE."
        ),
        "references": (
            "Kimberlin DW et al. NEJM 2015;372:933 — CASG 218 (6 mo "
            "valganciclovir). Kimberlin DW et al. J Pediatr 2003;143:16 "
            "— ganciclovir trial. AAP Red Book 2024-2027 (CMV chapter). "
            "Italian Consensus on cCMV 2024."
        ),
        "fullText": (
            "Cytovene ganciclovir symptomatic congenital CMV cCMV CNS "
            "hearing loss CASG 6 мг/кг q12h 6 weeks valganciclovir "
            "guanosine analog UL97 viral kinase neutropenia "
            "thrombocytopenia hepatotoxicity vesicant Kimberlin NEJM "
            "2015 CASG 218 Red Book"
        ),
    },
    {
        "id": "neo_valganciclovir",
        "name_en": "Valganciclovir",
        "name_ru": "Валганцикловир",
        "brand": "Valcyte",
        "indications": (
            "Oral prodrug ganciclovir для cCMV treatment (PO step-down "
            "после IV ganciclovir loading или ab initio при mild-"
            "moderate disease). Long-course therapy (6 мес per Kimberlin "
            "CASG 218)."
        ),
        "dose": (
            "cCMV treatment: 16 мг/кг q12h PO x 6 мес. Loading IV "
            "ganciclovir x 2-6 нед optional при severe disease, then "
            "switch valganciclovir."
        ),
        "route": "PO suspension 50 мг/мл (preferred у neonates)",
        "levels": (
            "Prodrug — hydrolyzed к ganciclovir в gut wall (esterases). "
            "Bioavailability ~60 % (vs ganciclovir 5-10 %). "
            "Predominantly renal excretion as ganciclovir."
        ),
        "precautions": (
            "Same как ganciclovir: neutropenia (most concerning у "
            "neonates), thrombocytopenia, anemia, hepatotoxicity. "
            "Monitor CBC weekly первые 6 нед, then q2-4 нед. ANC "
            "< 500 — discontinue. Renal adjustment: CrCl < 60. "
            "Bitter taste — disguise с food/milk. Hazardous drug — "
            "compounding precautions."
        ),
        "extemporaneous": (
            "Suspension 50 мг/мл — supplied как 5.5 g powder, "
            "reconstituted с 91 мл water к 100 мл of 50 мг/мл. Stable "
            "49 days refrigerator."
        ),
        "references": (
            "Kimberlin DW et al. NEJM 2015;372:933 — CASG 218 (6 vs 6 "
            "weeks; 6 мес better outcomes). AAP Red Book 2024-2027 "
            "(CMV chapter, recommends 6 мес therapy). Italian Consensus "
            "on cCMV 2024."
        ),
        "fullText": (
            "Valcyte valganciclovir prodrug ganciclovir oral cCMV "
            "congenital CMV 16 мг/кг q12h 6 мес suspension 50 мг/мл "
            "neutropenia hepatotoxicity Kimberlin NEJM 2015 CASG 218 "
            "Red Book"
        ),
    },
    {
        "id": "neo_foscarnet",
        "name_en": "Foscarnet",
        "name_ru": "Фоскарнет",
        "brand": "Foscavir",
        "indications": (
            "Ganciclovir-resistant CMV (UL97 mutation). HSV resistant "
            "к acyclovir. Salvage therapy после treatment failure. "
            "Limited neonatal use — consult PICU/ID."
        ),
        "dose": (
            "CMV treatment: 60 мг/кг IV q8h x 14-21 дней induction, "
            "then 90-120 мг/кг IV q24h maintenance. Adjust для renal: "
            "CrCl < 50 — significant reduction."
        ),
        "route": (
            "IV infusion over >= 1 ч (>= 2 ч при > 60 мг/кг — minimize "
            "renal toxicity)"
        ),
        "levels": (
            "Pyrophosphate analog — direct inhibition of viral DNA "
            "polymerase (НЕ требует phosphorylation, в отличие от "
            "ganciclovir/acyclovir). Renal excretion 80-90 % unchanged."
        ),
        "precautions": (
            "Nephrotoxicity (dose-limiting — keep hydrated, monitor "
            "creatinine q2-3d). Electrolyte abnormalities: hypocalcemia "
            "(symptomatic — paresthesias, seizures), hypomagnesemia, "
            "hypokalemia, hyperphosphatemia. Anemia. Genital ulcerations "
            "(local toxic effect, less в diapered neonates). Seizures "
            "(low Ca / Mg). Hepatic enzyme elevation. Vesicant — central "
            "line."
        ),
        "extemporaneous": (
            "Standard 24 мг/мл (commercial); dilute к 12 мг/мл с D5W "
            "for peripheral line. Central line preferred undiluted "
            "(24 мг/мл). Stable 24 ч room temp."
        ),
        "references": (
            "Whitley RJ et al. Pediatr Infect Dis J 1999;18:S35 — "
            "neonatal HSV/CMV. AAP Red Book 2024-2027. Italian Consensus "
            "on cCMV 2024 (resistance). NeoFax / Neonatal Formulary 9 ed."
        ),
        "fullText": (
            "Foscavir foscarnet ganciclovir-resistant CMV HSV "
            "acyclovir-resistant 60 мг/кг q8h 90-120 мг/кг maintenance "
            "pyrophosphate analog DNA polymerase nephrotoxicity "
            "hypocalcemia hypomagnesemia genital ulcerations vesicant "
            "Whitley 1999 Red Book"
        ),
    },
    {
        "id": "neo_esmolol",
        "name_en": "Esmolol",
        "name_ru": "Эсмолол",
        "brand": "Brevibloc",
        "indications": (
            "Acute SVT (alternative к adenosine после adenosine fail). "
            "Hypertensive emergency neonatal (less common чем у adults). "
            "Postoperative hypertension cardiac surgery. beta1-selective "
            "ультра-short-acting -> titratable."
        ),
        "dose": (
            "Loading: 100-500 мкг/кг IV over 1 мин (cautious — may "
            "skip loading у neonates). Maintenance: 50-1000 мкг/кг/мин "
            "continuous infusion (start 50, titrate q4-5 мин). Maximum "
            "1000 мкг/кг/мин."
        ),
        "route": "IV continuous infusion (no PO, half-life 9 мин — short-acting)",
        "levels": (
            "Cardioselective beta1-blocker. Esterase metabolism (RBC + "
            "hepatic) — independent of organ function. Onset 2 мин; "
            "duration 10-20 мин после стопе."
        ),
        "precautions": (
            "Hypotension (most common — titrate slowly). Bradycardia. "
            "Bronchoconstriction (less чем nonselective beta-blockers, но "
            "possible у asthma/BPD — caution). Hyperglycemia / "
            "hypoglycemia (beta-blockade masks symptoms). Heart failure "
            "exacerbation у impaired LV. NOT для cocaine-induced "
            "tachycardia (unopposed alpha). Limited neonatal data — use "
            "with monitoring."
        ),
        "extemporaneous": (
            "Standard 10 мг/мл (commercial premix); concentrated 250 "
            "мг/мл for central line. Dilute к 10 мг/мл with NS or D5W. "
            "Stable 24 ч room temp."
        ),
        "references": (
            "Wiest DB et al. Clin Pharmacokinet 1998;35:323 — pediatric "
            "PK. Tabbutt S et al. Crit Care Med 2008;36:2294 — postop "
            "hypertension. AHA 2019 PALS guidelines. NeoFax / Neonatal "
            "Formulary 9 ed."
        ),
        "fullText": (
            "Brevibloc esmolol SVT hypertensive emergency postoperative "
            "cardiac surgery beta1-selective ultra-short-acting 50-1000 "
            "мкг/кг/мин 100-500 мкг/кг loading hypotension bradycardia "
            "bronchoconstriction Wiest 1998 Tabbutt 2008 AHA PALS"
        ),
    },
    {
        "id": "neo_flecainide",
        "name_en": "Flecainide",
        "name_ru": "Флекаинид",
        "brand": "Tambocor",
        "indications": (
            "Refractory SVT после adenosine + propranolol fail. "
            "Atrioventricular reentrant tachycardia (AVRT) including "
            "Wolff-Parkinson-White. Atrial flutter / fibrillation у "
            "neonates (rare). Class IC antiarrhythmic — fetal SVT через "
            "maternal therapy (alternative к sotalol/digoxin)."
        ),
        "dose": (
            "PO: 1-3 мг/кг q8h (start 1, titrate). Max 8 мг/кг/day "
            "split q8h. Therapeutic level 0.2-1.0 мг/л. IV: НЕ "
            "recommended у neonates (proarrhythmia)."
        ),
        "route": "PO (preferred у neonates) — IV not used",
        "levels": (
            "Class IC sodium-channel blocker — slows phase 0 "
            "depolarization. Hepatic metabolism (CYP2D6) + renal "
            "excretion 30 %. t½ neonates ~30 ч."
        ),
        "precautions": (
            "Proarrhythmia (CAST trial — adult MI patients увеличили "
            "mortality). В neonates без structural heart disease "
            "relatively safe; ECHO required перед initiation. QRS "
            "widening (> 25 % — снизить dose). Bradycardia, AV block. "
            "Negative inotropy — caution у LV dysfunction. Drug "
            "interactions: amiodarone (additive)."
        ),
        "extemporaneous": (
            "Suspension 5 мг/мл compounded из tablets с 1:1 Ora-Sweet/"
            "Ora-Plus (stable 60 days refrigerated)."
        ),
        "references": (
            "Perry JC et al. J Am Coll Cardiol 1989;14:185 — pediatric "
            "use. Vignati G et al. Pediatr Cardiol 2003;24:13 — neonatal "
            "SVT. PACES Pediatric Antiarrhythmic 2024 Statement. NeoFax "
            "/ Neonatal Formulary 9 ed."
        ),
        "fullText": (
            "Tambocor flecainide refractory SVT AVRT Wolff-Parkinson-"
            "White WPW atrial flutter fibrillation Class IC sodium-"
            "channel blocker 1-3 мг/кг q8h proarrhythmia CAST QRS "
            "widening AV block Perry 1989 Vignati 2003 PACES NeoFax"
        ),
    },
    {
        "id": "neo_ondansetron",
        "name_en": "Ondansetron",
        "name_ru": "Ондансетрон",
        "brand": "Zofran",
        "indications": (
            "Nausea/vomiting post-anesthesia (PONV); chemotherapy-"
            "induced N/V. Limited neonatal data. AAP не recommends "
            "routine use у н/р для viral gastroenteritis (вне scope). "
            "Useful peri-operative."
        ),
        "dose": (
            "IV: 0.1 мг/кг IV q8h (max 4 мг single dose). PO: 0.15 "
            "мг/кг q8h. PONV: 0.1 мг/кг IV at induction; can repeat "
            "q4h x 24 ч."
        ),
        "route": "IV bolus over 2-5 мин или PO (suspension 4 мг/5 мл)",
        "levels": (
            "Selective 5-HT3 (serotonin) receptor antagonist. Hepatic "
            "metabolism (CYP3A4, 2D6). t½ pediatric ~3 ч. Onset IV "
            "5-15 мин."
        ),
        "precautions": (
            "QT prolongation — caution у congenital LQTS, "
            "hypomagnesemia, electrolyte imbalance. Avoid с amiodarone, "
            "macrolides, methadone. Headache, constipation (older "
            "children). Serotonin syndrome (rare с SSRI). Hypersensitivity "
            "rare. FDA black box: dose > 16 мг single — QT prolongation "
            "(adults)."
        ),
        "extemporaneous": (
            "Standard 2 мг/мл IV (commercial premix). Suspension 4 мг/5 "
            "мл commercially available."
        ),
        "references": (
            "Spahr-Schopfer IA et al. Anesth Analg 1995;81:75 — "
            "neonatal PONV. Sutherland A et al. Cochrane Database "
            "2020 — pediatric N/V. AAP COFN — perioperative care. "
            "NeoFax / Neonatal Formulary 9 ed."
        ),
        "fullText": (
            "Zofran ondansetron nausea vomiting post-anesthesia PONV "
            "chemotherapy 0.1 мг/кг IV q8h 0.15 мг/кг PO 5-HT3 "
            "antagonist QT prolongation LQTS hypomagnesemia Spahr-"
            "Schopfer 1995 Cochrane NeoFax"
        ),
    },
    {
        "id": "neo_diphenhydramine",
        "name_en": "Diphenhydramine",
        "name_ru": "Дифенгидрамин",
        "brand": "Benadryl, Димедрол",
        "indications": (
            "Allergic reactions (анафилактоид mild, urticaria, drug-"
            "induced rash). Pre-medication для blood transfusion (у "
            "infants с history reactions). Dystonic reactions от "
            "metoclopramide/promethazine. Sedation (last resort у "
            "н/р — limited use)."
        ),
        "dose": (
            "Allergic reaction: 1.25 мг/кг IV/IM/PO q6h (max 50 мг). "
            "Pre-medication transfusion: 1 мг/кг IV before. Anaphylaxis "
            "adjunct: 1.25 мг/кг IV (after epinephrine — H1 blocker is "
            "secondary)."
        ),
        "route": "IV/IM (slow push), PO (suspension 12.5 мг/5 мл)",
        "levels": (
            "First-generation H1-receptor antagonist — крестит BBB -> "
            "sedation. Anticholinergic (mild). Hepatic metabolism "
            "(CYP2D6); t½ neonatal 14 ч."
        ),
        "precautions": (
            "Paradoxical excitation у infants/young children (rare у "
            "neonates но documented). Sedation, prolonged у preterm. "
            "Anticholinergic effects: dry mouth, urinary retention, "
            "tachycardia, ileus. AAP statement (2007): avoid OTC cough/"
            "cold с antihistamines у < 2 лет (overdose deaths). NOT "
            "first-line для anaphylaxis (epinephrine first). Not for "
            "routine sedation у neonates."
        ),
        "extemporaneous": (
            "Standard 50 мг/мл IV (commercial). Suspension 12.5 мг/5 "
            "мл commercially available."
        ),
        "references": (
            "Simons FE et al. World Allergy Organ J 2011;4:13 — "
            "pediatric anaphylaxis. AAP COFN 2007 — OTC cough/cold "
            "warning. AAP Red Book 2024-2027. NeoFax / Neonatal "
            "Formulary 9 ed."
        ),
        "fullText": (
            "Benadryl Димедрол diphenhydramine allergic reaction "
            "urticaria pre-medication transfusion dystonic reaction "
            "1.25 мг/кг q6h H1-receptor anticholinergic paradoxical "
            "excitation infants OTC cough cold AAP 2007 anaphylaxis "
            "epinephrine"
        ),
    },
    {
        "id": "neo_glycopyrrolate",
        "name_en": "Glycopyrrolate",
        "name_ru": "Гликопирролат",
        "brand": "Robinul",
        "indications": (
            "Pre-anesthetic для уменьшения secretions (intubation, surgery). "
            "Bradycardia treatment (alternative к atropine — менее "
            "central effects). Reverse neuromuscular blockade (с "
            "neostigmine — prevent muscarinic effects). Excess oral "
            "secretions у chronic vent patients."
        ),
        "dose": (
            "Pre-anesthesia: 4-10 мкг/кг IV/IM 30-60 мин до induction. "
            "Bradycardia: 4-10 мкг/кг IV q3-4h prn. Reversal NMBA: "
            "10-15 мкг/кг IV с neostigmine. Chronic secretions PO: "
            "40-100 мкг/кг q8h (titrate)."
        ),
        "route": "IV bolus, IM, PO (oral solution 0.5 мг/5 мл)",
        "levels": (
            "Quaternary ammonium -> does NOT cross BBB (vs atropine "
            "tertiary amine — minimal central effects). Antimuscarinic. "
            "Renal excretion. Onset 1-3 мин IV; duration 2-7 ч."
        ),
        "precautions": (
            "Tachycardia (less than atropine но possible). "
            "Anticholinergic effects: dry mouth, urinary retention, "
            "constipation. Hyperthermia (anhidrosis) — особенно у "
            "preterm с poor thermoregulation. Mydriasis. Bronchodilation "
            "(usually not problematic). Withdrawn (chronic use) — taper. "
            "Less central side effects vs atropine — preferred у "
            "neonates."
        ),
        "extemporaneous": (
            "Standard 0.2 мг/мл IV (commercial). Suspension 0.5 мг/5 "
            "мл commercially available."
        ),
        "references": (
            "Mirakhur RK et al. Br J Anaesth 1979;51:155 — "
            "anticholinergic use in pediatric anesthesia. AAP COFN. "
            "Neonatal Anesthesia 2nd ed (Lerman). NeoFax / Neonatal "
            "Formulary 9 ed."
        ),
        "fullText": (
            "Robinul glycopyrrolate pre-anesthetic secretions "
            "bradycardia neuromuscular blockade reversal neostigmine "
            "excess oral secretions 4-10 мкг/кг IV quaternary ammonium "
            "BBB anticholinergic dry mouth hyperthermia anhidrosis "
            "Mirakhur Lerman"
        ),
    },
    {
        "id": "neo_carglumic_acid",
        "name_en": "Carglumic Acid",
        "name_ru": "Карглумовая кислота",
        "brand": "Carbaglu",
        "indications": (
            "N-acetylglutamate synthase (NAGS) deficiency (urea cycle "
            "disorder). Hyperammonemia из organic acidemias "
            "(propionic, methylmalonic, isovaleric — off-label но "
            "FDA-approved 2018). Congenital hyperammonemia rescue "
            "alongside dialysis."
        ),
        "dose": (
            "Loading: 100-250 мг/кг q24h PO/NG (split q6-8h). "
            "Maintenance: 10-100 мг/кг q24h (titrate к ammonia). "
            "Acute hyperammonemia rescue: 250 мг/кг load, then 250 "
            "мг/кг q24h x 3 дня."
        ),
        "route": (
            "PO/NG (NOT IV); dispersible tablet 200 мг (mix с water 5 "
            "мл — disperse, не chew)"
        ),
        "levels": (
            "N-carbamylglutamate analog — activates carbamoyl phosphate "
            "synthetase 1 (CPS1) -> restores urea cycle. Onset 1-2 ч "
            "(ammonia снижение); peak effect 12-24 ч. Renal excretion."
        ),
        "precautions": (
            "Generally well-tolerated. GI symptoms (vomiting, diarrhea). "
            "Anemia, asthenia rare. Long-term safety data limited у "
            "neonates. Continue concurrent ammonia scavengers (sodium "
            "phenylacetate / benzoate) per metabolic team. Genetic "
            "counseling — NAGS autosomal recessive."
        ),
        "extemporaneous": (
            "Tablet 200 мг dispersible — disperse in 5 мл water или "
            "saline immediately before administration. Stable in solution "
            "30 мин. NG tube: flush после."
        ),
        "references": (
            "Daniotti M et al. Front Pediatr 2020;8:565 — long-term "
            "outcomes. Haberle J et al. J Inherit Metab Dis 2019;42:1 "
            "— urea cycle guidelines. EMA/FDA approval 2018. UCDC "
            "(Urea Cycle Disorders Consortium) protocols."
        ),
        "fullText": (
            "Carbaglu carglumic acid N-acetylglutamate synthase NAGS "
            "deficiency urea cycle hyperammonemia organic acidemia "
            "propionic methylmalonic isovaleric 100-250 мг/кг q24h "
            "carbamoyl phosphate synthetase CPS1 dispersible tablet "
            "Daniotti Haberle UCDC"
        ),
    },
]


def main() -> int:
    """Add new drugs to monographs JSON, preserve existing data."""
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {d["id"] for d in data["drugs"]}
    added: list[str] = []
    skipped: list[str] = []
    for drug in NEW_DRUGS:
        if drug["id"] in existing_ids:
            skipped.append(drug["name_en"])
            continue
        data["drugs"].append(drug)
        added.append(drug["name_en"])

    # Sort by English name for stable ordering
    data["drugs"].sort(key=lambda d: d["name_en"].lower())

    # Bump version
    data["version"] = "2.5.0"
    data["lastUpdated"] = "2026-05-09"

    # Write back compact JSON (matches existing style)
    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Added {len(added)} drugs")
    if skipped:
        print(f"Skipped duplicates: {len(skipped)}: {', '.join(skipped)}")
    print(f"Total drugs now: {len(data['drugs'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
