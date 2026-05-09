"""Add 8 new clinical articles (batch 3a) — first chunk of 24 to reach 50.

Audit Д1: 26 → 34 articles after this batch.
"""
import json
import sys
from pathlib import Path

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-articles.json"

NEW_ARTICLES = [
    {
        "id": "art-pphn-treatment",
        "title_ru": "PPHN — современная терапия 2024",
        "title_en": "PPHN — Current Therapy 2024",
        "topic": "cardiopulmonary",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "iNO 20 ppm first line. Sildenafil PO/IV adjunct. Milrinone при LV dysfunction. ECMO rescue OI > 40.",
        "content": "## Definition\n\nPPHN — failure normal pulmonary vascular relaxation после рождения с right-to-left shunting через PDA / PFO.\n\n## Этиология\n\n- **Idiopathic** (essential PPHN — most common)\n- **Maladaptation** — sepsis, asphyxia, hypothermia\n- **Maldevelopment** — MAS, pneumonia, RDS\n- **Pulmonary hypoplasia** — CDH, oligohydramnios\n\n## Targeted therapy hierarchy\n\n### 1. Optimize gas exchange + sedation\n- Surfactant если RDS / MAS\n- Permissive hypercapnia 45-55 если pH > 7.25\n- Sedation + paralysis при labile\n- HFOV или HFJV при air leak / persistent hypoxemia\n\n### 2. iNO (Inhaled Nitric Oxide)\n- Initial 20 ppm; range 5-20\n- Response criteria: PaO₂ ↑ ≥ 20 ИЛИ OI ↓ ≥ 15 % за 30 мин\n- Wean 5 ppm q4-12h до 5 ppm; then 1 ppm q1-4h\n- Off при FiO₂ < 50 % + stable PaO₂\n\n### 3. Sildenafil (PDE5i)\n- IV: 0.4 мг/кг over 3 ч loading, then 1.6 мг/кг/d\n- PO: 0.5-2 мг/кг q6h\n- Adjunct iNO; rescue в ECMO-bridge\n\n### 4. Milrinone (PDE3i)\n- 0.25-0.75 мкг/кг/мин continuous\n- Когда LV dysfunction + low CO\n- Watch для hypotension — pre-load с volume 10 мл/кг\n\n### 5. Vasopressors maintain SVR > PVR\n- Norepinephrine 0.05-1 мкг/кг/мин (preferred)\n- Vasopressin 0.0001-0.001 ед/кг/мин (catecholamine-resistant)\n\n### 6. ECMO rescue\n- OI > 40 sustained 4 ч\n- GA ≥ 34 нед, BW ≥ 2 кг\n- Reversible disease\n- Без contraindications (severe IVH, lethal anomaly)\n\n## Calculator Bordik\n- neo-resp-indices, neo-ino-dose, neo-sildenafil-dose, neo-milrinone-dose\n\n## Источники\n\n- Cochrane iNO term/late preterm 2017:CD000509\n- Steinhorn RH. Pediatrics 2003;112:S29\n- AHA 2019 PPHN Scientific Statement\n- КР МЗ РФ ППН 2024",
        "references": [
            "Cochrane iNO 2017:CD000509",
            "Steinhorn RH. Pediatrics 2003;112:S29",
            "AHA 2019 PPHN Statement",
            "КР МЗ РФ ППН 2024"
        ],
        "related_calculators": ["neo-resp-indices", "neo-ino-dose", "neo-sildenafil-dose", "neo-milrinone-dose", "neo-norepinephrine-dose", "neo-vasopressin-dose"]
    },
    {
        "id": "art-cyanosis",
        "title_ru": "Cyanosis у новорождённого — диф диагноз",
        "title_en": "Newborn Cyanosis — Differential Diagnosis",
        "topic": "cardiopulmonary",
        "audience": "neonatologist + педиатр",
        "level": "intermediate",
        "summary": "Cardiac vs pulmonary vs metabolic. Hyperoxia test (PaO₂ < 100 на FiO₂ 100% → ductal-dependent CHD).",
        "content": "## Patofiziologia\n\nCyanosis — клиническая desaturation > 5 g/dL deoxygenated Hb. Видна на лице, губах, conjunctiva.\n\n## Главные категории\n\n### 1. Pulmonary\n- RDS, TTN, MAS, pneumonia, pneumothorax\n- PPHN\n- Diaphragmatic hernia\n\n### 2. Cardiac (cyanotic CHD)\n- TGA (transposition great arteries)\n- TOF (Tetralogy of Fallot)\n- TAPVR (total anomalous pulmonary venous return)\n- Truncus arteriosus\n- HLHS (hypoplastic left heart)\n- Tricuspid atresia\n- Pulmonary atresia\n\n### 3. Metabolic / hematological\n- Methemoglobinemia (congenital или drugs)\n- Polycythemia (HCT > 65 %)\n- Severe anemia с poor oxygenation\n\n### 4. CNS / sepsis\n- Apnea episodes\n- Severe sepsis с poor perfusion\n- HIE\n\n## Hyperoxia test\n\n- 100 % O₂ × 10 мин via hood / mask\n- ABG before + after на right radial artery (preductal)\n- **Pulmonary cause:** PaO₂ ≥ 150 мм рт ст (rises significantly)\n- **Cardiac cause:** PaO₂ < 100 (no rise — fixed shunting)\n- **Equivocal:** PaO₂ 100-150 — repeat or echocardiogram\n\n## Pre/post-ductal SpO₂\n\n- **Pre-ductal** right hand\n- **Post-ductal** foot\n- **Difference > 5-10 %:** PDA right-to-left shunt → PPHN или ductal-dependent CHD\n- **Equal but low:** parallel circulation (TGA, HLHS)\n- **Reverse differential** (post > pre):  TGA + critical PDA\n\n## Workup\n\n1. **CCHD pulse oximetry** (24-48 ч)\n2. **CXR** — heart size, pulmonary vascularity\n3. **ABG** ± lactate\n4. **ECG**\n5. **Echocardiogram** (gold standard)\n6. **Methemoglobin** при подозрении (co-oximetry)\n7. **CBC, blood culture**\n\n## Initial management\n\n- Pulse oximetry continuous + ABG\n- Bag-mask ventilation если apneic\n- O₂ supplementation pending workup\n- **PGE1 0.05-0.1 мкг/кг/мин IV** при подозрении ductal-dependent CHD (TGA, HLHS, etc.) — pending echo confirmation\n- Empiric antibiotics при sepsis suspected\n\n## Calculator Bordik\n- neo-cchd-pulse-oximetry\n- neo-pphn-screen\n- neo-resp-indices\n- neo-pge1-dose\n\n## Источники\n\n- AAP/AHA. Pediatrics 2011;128:e1259 — CCHD\n- Sasidharan P. Clin Perinatol 2004;31:999\n- Wernovsky G. Pediatr Cardiol 2017;38:1003",
        "references": [
            "AAP/AHA. Pediatrics 2011;128:e1259",
            "Sasidharan P. Clin Perinatol 2004;31:999",
            "Wernovsky G. Pediatr Cardiol 2017;38:1003"
        ],
        "related_calculators": ["neo-cchd-pulse-oximetry", "neo-pphn-screen", "neo-resp-indices", "neo-alprostadil-dose"]
    },
    {
        "id": "art-shock",
        "title_ru": "Шок у новорождённого",
        "title_en": "Neonatal Shock",
        "topic": "cardiopulmonary",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "Cold (low CO + high SVR) — adrenaline. Warm (high CO + low SVR) — noradrenaline + vasopressin. Stress-dose hydrocortisone при адreнал insufficiency.",
        "content": "## Definition\n\nShock = неадекватное delivery O₂ к тканям → cellular hypoxia + lactic acidosis.\n\n## Категории\n\n### 1. Hypovolemic\n- Acute blood loss (placental abruption, ruptured cord, NEC)\n- Capillary leak (sepsis early)\n- Dehydration (rare у newborn, обычно iatrogenic)\n\n### 2. Cardiogenic\n- HIE с myocardial injury\n- Asphyxial cardiomyopathy\n- Critical CHD (HLHS, severe coarctation)\n- Arrhythmias (SVT, AV block)\n- Myocarditis\n\n### 3. Distributive (sepsis-related)\n- Bacterial sepsis (EOS / LOS)\n- Anaphylaxis (rare у newborn)\n- Vasoplegia post-cardiac surgery\n\n### 4. Obstructive\n- Pneumothorax tension\n- Cardiac tamponade\n- Massive pulmonary embolism (rare)\n\n## Клиника\n\n- Capillary refill > 3 сек\n- Mottled skin\n- Cold extremities\n- Tachycardia → bradycardia (terminal)\n- Hypotension (LATE — after compensation fails)\n- Oliguria < 1 мл/кг/ч\n- Altered mental status (lethargy)\n- Lactate > 2-4 ммоль/л\n\n## Cold vs Warm shock (sepsis-related)\n\n| Параметр | Cold shock | Warm shock |\n|---|---|---|\n| **Cardiac output** | Low | High |\n| **SVR** | High | Low |\n| **Mean BP** | Low | Low |\n| **Skin** | Cold, mottled, capillary refill > 3 сек | Warm, flushed, bounding pulses |\n| **Echo finding** | Poor LV contractility | High CO, normal contractility |\n| **First-line vasoactive** | **Adrenaline** 0.05-0.3 мкг/кг/мин | **Noradrenaline** 0.05-1 мкг/кг/мин |\n\n## Surviving Sepsis Campaign Pediatric 2020\n\n### First hour bundle\n1. **Fluid resuscitation:** 10-20 мл/кг NS bolus, repeat × 3 prn (max 60 мл/кг first hour) — но cautious в neonate (overload risk)\n2. **Empiric ABX** within 1 hour (ампициллин + гентамицин для EOS; vancomycin + cefepime для LOS)\n3. **Lactate** + serial monitoring\n4. **Vasoactive** if fluid-refractory shock\n5. **Hydrocortisone** при absolute adrenal insufficiency\n\n### Vasoactive escalation\n1. Cold shock fluid-refractory: **Adrenaline** 0.05-0.3 мкг/кг/мин (start)\n2. Warm shock fluid-refractory: **Noradrenaline** 0.05-1 мкг/кг/мин\n3. Catecholamine-resistant warm shock: **Vasopressin** 0.0001-0.001 ед/кг/мин\n4. LV dysfunction (cardiogenic component): **Dobutamine** или **Milrinone**\n5. Refractory: **Hydrocortisone** 1 мг/кг q8-12h IV\n\n### Goals\n- MAP > 50 (term), > GA-equivalent (preterm)\n- Lactate clearance ≥ 10 % per hour\n- Capillary refill < 3 сек\n- Urine output > 1 мл/кг/ч\n- Mental status improvement\n\n## Adrenal insufficiency\n\nCriteria:\n- Persistent hypotension fluid-refractory + escalating vasopressors\n- Cortisol < 18 мкг/дл (500 нмоль/л) при stress\n\n**Treatment:** Hydrocortisone 1 мг/кг q8-12h IV (stress dose).\n\n## ECMO rescue\n\nVA-ECMO criteria для cardiogenic / refractory septic shock:\n- Persistent shock на high-dose vasopressors\n- pH < 7.0 + lactate > 5\n- Reversible cause\n\n## Calculator Bordik\n- neo-epinephrine-infusion, neo-norepinephrine-dose, neo-vasopressin-dose, neo-dopamine-dose, neo-dobutamine-dose, neo-milrinone-dose, neo-hydrocortisone-dose, nsofa\n\n## Источники\n\n- Weiss SL et al. Crit Care Med 2020;48:2 — SSC Pediatric\n- Davis AL et al. Crit Care Med 2017;45:1061 — pediatric critical care\n- Wynn JL et al. JAMA Pediatr 2020;174:e202531 — nSOFA",
        "references": [
            "Weiss SL et al. Crit Care Med 2020;48:2",
            "Davis AL et al. Crit Care Med 2017;45:1061",
            "Wynn JL et al. JAMA Pediatr 2020;174:e202531"
        ],
        "related_calculators": ["neo-epinephrine-infusion", "neo-norepinephrine-dose", "neo-vasopressin-dose", "neo-dopamine-dose", "neo-dobutamine-dose", "neo-milrinone-dose", "neo-hydrocortisone-dose", "neo-nsofa"]
    },
    {
        "id": "art-thermoregulation",
        "title_ru": "Терморегуляция и Golden Hour",
        "title_en": "Thermoregulation & Golden Hour",
        "topic": "neonatal",
        "audience": "neonatologist + педиатр",
        "level": "intermediate",
        "summary": "Hypothermia VLBW < 36°C — значимый mortality risk. Golden Hour bundle: pre-warmed room, polyethylene wrap, hat, transport incubator.",
        "content": "## Patofiziologia hypothermii\n\nNewborn — особенно preterm — vulnerable к heat loss из-за:\n- High surface area-to-mass ratio\n- Thin skin / minimal subcutaneous fat\n- ↓ Brown adipose tissue (especially preterm)\n- Limited shivering thermogenesis\n- Heat loss механизмы: conduction (cold surfaces), convection (air drafts), evaporation (wet skin), radiation (cold surfaces)\n\n## Hypothermia categories (WHO)\n\n| Severity | T core |\n|---|---|\n| **Cold stress** | 36.0-36.4 °C |\n| **Moderate** | 32.0-35.9 °C |\n| **Severe** | < 32.0 °C |\n\n**Normothermia target:** 36.5-37.5 °C axillary.\n\n## Outcomes hypothermii\n\n- **VLBW < 36 °C при admission:** ↑ mortality 5x (Laptook 2007 Pediatrics)\n- ↑ IVH, NEC, late-onset sepsis\n- ↑ Hypoglycemia\n- ↑ Pulmonary hemorrhage\n- ↑ MV duration\n\n## Golden Hour bundle (first hour after birth)\n\n### Antenatal preparation\n- Warm room (≥ 26 °C для VLBW)\n- Pre-heated radiant warmer\n- Pre-warmed blankets\n- Polyethylene wrap / bag (для < 32 нед)\n- Transport incubator pre-heated\n\n### Immediate post-delivery\n1. **Polyethylene wrap** (без drying) для < 32 нед — covers head + body, leaving face exposed\n2. **Hat** (knit или polyethylene)\n3. **Skin-to-skin** для term + late preterm — most effective\n4. **Pre-warmed bassinet** для transport\n5. **Avoid bathing** в первые 6-24 ч (term) или вообще (preterm)\n\n### Resuscitation positioning\n- Pre-heated radiant warmer\n- Plastic wrap до first stabilization complete\n- Heated/humidified gas (если ≥ 6 L/min)\n- Continuous T monitoring (skin или axillary probe)\n\n### NICU admission\n- Servo-controlled incubator с humidity (60-80 % first 7 d у ELBW)\n- Pre-warmed kangaroo mother care когда stable\n- T monitoring q1-4h первый day\n\n## Hyperthermia caution\n\n- T > 37.5 °C — sepsis risk + neurological injury\n- НЕ рекомендуется prophylactic warming > target\n- ⚠️ HIE с inadvertent hyperthermia — worsens outcome\n\n## Therapeutic hypothermia (separate)\n\nSee art-cooling — TH 33-34 °C × 72 ч для moderate-severe HIE.\n\n## Calculator Bordik\n- neo-thermal-management\n- neo-hypothermia-transport\n\n## Источники\n\n- WHO. Thermal Protection of Newborn 1997 + updates\n- Laptook AR et al. Pediatrics 2007;119:e643\n- McCall EM et al. Cochrane 2018:CD004210 — interventions to prevent hypothermia\n- AAP COFN/Educational Programs 2024",
        "references": [
            "WHO Thermal Protection of Newborn 1997",
            "Laptook AR et al. Pediatrics 2007;119:e643",
            "McCall EM et al. Cochrane 2018:CD004210"
        ],
        "related_calculators": ["neo-thermal-management", "neo-hypothermia-transport"]
    },
    {
        "id": "art-glucose-monitoring",
        "title_ru": "Glucose monitoring и CGM в NICU",
        "title_en": "Glucose Monitoring & CGM in NICU",
        "topic": "metabolic",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "POC glucose капiллярный — стандарт. CGM (Dexcom, Medtronic) появляется в research. Frequency по риску: q30 мин при IDM, q4-6h preterm.",
        "content": "## Modalities\n\n### 1. POC capillary glucose (стандарт)\n- Heel stick + glucometer (Accu-Chek, OneTouch, и др.)\n- Чувствительность: меньше точности vs venous lab — overestimate низких glucose у hyperHCT\n- **При значениях 2.5-3.0 ммоль/л — confirm с lab serum**\n\n### 2. Lab serum glucose (gold standard)\n- Slower (15-30 мин)\n- Точно: hexokinase method\n- 10-15 % lower vs whole blood (plasma higher)\n\n### 3. Continuous glucose monitoring (CGM)\n- Subcutaneous sensor\n- Examples: Dexcom G6/G7, Medtronic Guardian, Abbott Libre 3\n- **Research stage у neonates** — accuracy у preterm < 28 нед questionable\n- Useful у CHI babies для hourly trends без trauma\n- Beardsall study (Lancet 2013) — CGM у VLBW reduced exposure to abnormal levels\n\n## Frequency monitoring (per группы риска)\n\n### High risk — q30 мин first 2 ч, then q1-2h\n- IDM (infant of diabetic mother)\n- LGA > 90th percentile\n- SGA < 10th percentile\n- Stress (asphyxia, sepsis, hypothermia)\n- Maternal hypoglycemic agents\n\n### Moderate risk — q1-2h первые 12 ч, then q3-4h\n- Late preterm 34-36 нед\n- Term без feeding established\n\n### Low risk — q4-6h первые 24-48 ч\n- Term breast-fed without risk factors\n\n## Action thresholds (PES 2015)\n\n| Час жизни | Threshold treat |\n|---|---|\n| **0-4 ч** | < 1.7 ммоль/л symptomatic; < 1.4 asymptomatic |\n| **4-24 ч** | < 2.2 ммоль/л |\n| **> 24 ч** | < 2.5 ммоль/л |\n| **> 48 ч persistent** | < 3.3 ммоль/л — workup IEM/CHI |\n\n## Sources hyperglycemia (отдельный issue)\n\n### Causes\n- Iatrogenic (high GIR > 12 мг/кг/мин у extreme preterm)\n- Stress (sepsis, surgery, asphyxia)\n- Drugs (steroids, vasopressors)\n- Transient neonatal diabetes (rare — KCNJ11 mutations)\n- Permanent neonatal diabetes (PND — neonatal-onset)\n\n### Treatment hyperglycemia\n- ↓ GIR if > 12 мг/кг/мин\n- Insulin 0.01-0.1 ед/кг/h continuous (с tight monitoring)\n- Goal: 4-8 ммоль/л (loose target — avoid hypoglycemia)\n\n## Calculator Bordik\n- neo-glucose-bolus-dose\n- neo-gir\n- neo-insulin-dose\n\n## Источники\n\n- Thornton PS et al. J Pediatr 2015;167:238 — PES 2015\n- Beardsall K et al. Lancet 2013;382:1077 — REACT CGM\n- AAP CFN. Pediatrics 2011;127:575\n- BAPM Hypoglycemia Framework 2017",
        "references": [
            "Thornton PS et al. J Pediatr 2015;167:238",
            "Beardsall K et al. Lancet 2013;382:1077 — REACT",
            "AAP CFN. Pediatrics 2011;127:575",
            "BAPM 2017"
        ],
        "related_calculators": ["neo-glucose-bolus-dose", "neo-gir", "neo-insulin-dose"]
    },
    {
        "id": "art-electrolytes",
        "title_ru": "Электролиты у новорождённых: Na, K, Ca",
        "title_en": "Neonatal Electrolytes: Na, K, Ca",
        "topic": "metabolic",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "Hyponatremia preterm — late-onset SIADH-like. Hyperkalemia ELBW first 48 h NOHK. Hypocalcemia early (<72h, IDM, asphyxia) vs late (>72h, vit D / Mg deficiency).",
        "content": "## Sodium (Na)\n\n### Normal range\n- Term: 135-145 ммоль/л\n- Preterm early (< 7 d): 133-145 (slightly broader)\n- Preterm late (> 7 d on TPN): 135-145\n\n### Hyponatremia (Na < 135)\n\n#### Early-onset (< 7 d): обычно dilutional\n- Excess fluid administration\n- Maternal hyponatremia / IV oxytocin during labor\n- SIADH-like (PGE1 use, brain injury)\n\n**Treatment:**\n- ↓ Free water intake\n- НЕ rapid correction (risk osmotic demyelination)\n- Aim: increase Na by ≤ 8-10 ммоль/л per 24 h\n- Severe symptomatic (Na < 120, seizures): 3 % NaCl 2-4 мл/кг bolus IV\n\n#### Late-onset (> 7 d): натrium deficit + sodium wasting\n- Excessive renal loss (preterm tubular immaturity)\n- Diuretic therapy\n- BPD with chronic diuretics\n- Cerebral salt wasting (rare)\n\n**Treatment:**\n- Na supplementation 4-6 ммоль/кг/d (some need 8+)\n- ↑ TPN Na content\n- НЕ диуретики если возможно\n\n### Hypernatremia (Na > 145)\n- Dehydration (transepidermal water loss in ELBW)\n- Inadequate free water (concentrated TPN)\n- Excessive Na intake (rare)\n\n**Treatment:**\n- ↑ Free water (НЕ Hypotonic IVF rapid — gradual correction)\n- Fix underlying (humidify incubator, etc.)\n\n## Potassium (K)\n\n### Normal range\n- Term: 3.5-5.0 ммоль/л\n- Preterm early (< 24 h): up to 6.0\n- Preterm > 7 d: 3.5-5.5\n\n### Hyperkalemia\n\n#### Non-oliguric hyperkalemia (NOHK) of ELBW\n- Common in ELBW < 1000 g first 48-72 h\n- ↑ K despite normal urine output + normal renal function\n- Mechanism: K shift из cells (immature Na/K ATPase)\n- Treat при K > 6.5 ИЛИ ECG changes\n\n**Treatment по severity:**\n- **Mild (K 6-6.5):** ↓ K intake; recheck q4-6h\n- **Moderate (K 6.5-7.5):** Insulin + glucose: insulin 0.1 ед/кг IV + dextrose 0.5 г/кг; albuterol nebulizer 0.4 мг/кг q1-2h prn\n- **Severe (K > 7.5 или ECG changes):**\n  - Calcium gluconate 10 % 1-2 мл/кг IV slow (cardiac stabilization)\n  - Insulin + glucose как выше\n  - Sodium bicarbonate 1-2 ммоль/кг IV (если acidosis)\n  - Furosemide 1 мг/кг IV\n  - Kayexalate enema 1 г/кг (rare у preterm)\n\n### Hypokalemia (K < 3.5)\n- Diuretic loss (chronic furosemide)\n- GI losses (NG suction, NEC, watery stools)\n- Alkalosis\n- Inadequate K replacement в TPN\n\n**Treatment:**\n- ↑ K replacement: 2-4 ммоль/кг/d enteral\n- IV correction: 0.5-1 ммоль/кг over 1 h (max 0.5 ммоль/кг/h)\n- НЕ rapid IV bolus — risk arrhythmia\n\n## Calcium (Ca)\n\n### Normal range\n- **Total:** 2.0-2.5 ммоль/л (8-10 мг/дл)\n- **Ionized:** 1.10-1.40 ммоль/л (4.4-5.6 мг/дл)\n\n### Early hypocalcemia (< 72 h)\n\n#### Causes\n- Prematurity (parathyroid immaturity)\n- IDM (transient hypoparathyroidism)\n- Asphyxia (reduced PTH response)\n- Maternal hyperparathyroidism\n\n#### Treatment\n- Asymptomatic + Ca > 1.75 ммоль/л: oral or supplemented IV TPN\n- Symptomatic (jitters, seizures, apnea):\n  - **Calcium gluconate 10 % 0.5-1 мл/кг IV slow over 5-10 мин**\n  - Continue infusion 50-200 мг/кг/d Ca gluconate в TPN\n  - НЕ peripheral IV рекомендуется (extravasation тяжёлая)\n\n### Late hypocalcemia (> 72 h)\n\n#### Causes\n- Vitamin D deficiency (maternal или infant)\n- Hyperphosphatemia (cow's milk formula — high P)\n- Mg deficiency (часто)\n- DiGeorge syndrome (22q11 deletion — congenital hypoparathyroidism)\n- Renal disease\n\n#### Workup\n- Phosphate, Mg, vit D 25-OH\n- PTH if hypoparathyroidism suspected\n- 22q11 FISH if dysmorphic features\n\n## Calculator Bordik\n- neo-cagluconate-dose\n- neo-furosemide-dose\n- neo-insulin-dose\n\n## Источники\n\n- Vemgal P et al. Cochrane 2012:CD007664 — hyperkalemia preterm\n- Kerr SK. Pediatr Endocrinol Rev 2010 — hypocalcemia review\n- AAP CFN — Pediatric Nutrition Handbook 2024\n- ESPGHAN PN 2018",
        "references": [
            "Vemgal P et al. Cochrane 2012:CD007664",
            "Kerr SK. Pediatr Endocrinol Rev 2010",
            "AAP CFN Pediatric Nutrition 2024",
            "ESPGHAN PN 2018"
        ],
        "related_calculators": ["neo-cagluconate-dose", "neo-furosemide-dose", "neo-insulin-dose", "neo-tpn"]
    },
    {
        "id": "art-procedures",
        "title_ru": "Common NICU procedures — UVC, UAC, intubation",
        "title_en": "Common NICU Procedures",
        "topic": "procedures",
        "audience": "neonatologist + педиатр",
        "level": "intermediate",
        "summary": "UVC depth (2 × Birth weight) + 0.5 cm. UAC depth — Shukla equation. Intubation depth = 6 + weight. Pre-medication: atropine + fentanyl + paralytic.",
        "content": "## Umbilical Venous Catheter (UVC)\n\n### Indications\n- Emergency vascular access (resuscitation)\n- Central access первые 7 d жизни\n- TPN administration (high osmolarity > 900 мосм/л)\n- Exchange transfusion\n\n### Insertion\n- **Sterile technique** — gown, gloves, drape\n- **Depth formula:** \n  - Term: (2 × birth weight in kg) + 0.5 cm\n  - Or: Shukla calculation (3 × BW kg) + 9 / 2 cm\n- **Tip position:** above diaphragm at IVC/RA junction (preferred) ИЛИ below liver if non-emergency\n- **Confirm position** на CXR — should overlie T9-T10 (above diaphragm)\n\n### Wrong position\n- **Too high** (in heart): arrhythmias risk — pull back\n- **In liver**: risk hepatic necrosis with hyperosmolar fluids\n\n### Complications\n- Portal vein thrombosis\n- Hepatic abscess\n- Cardiac perforation / tamponade\n- Pleural effusion\n- Catheter-related bloodstream infection (CRBSI)\n\n### Removal\n- ≤ 7-14 d (avoid CRBSI)\n- Replace с PICC if longer access needed\n\n## Umbilical Arterial Catheter (UAC)\n\n### Indications\n- Continuous BP monitoring\n- Frequent blood gas + lab sampling (RDS, MV)\n- ABG sampling без peripheral arterial puncture\n\n### Position\n- **High position (preferred):** T6-T9 (above diaphragm, between celiac and renal arteries)\n- **Low position:** L3-L4 (below renal arteries)\n- High position has lower complication rate (Cochrane 2010)\n\n### Depth (Shukla equation)\n- High position: (3 × BW kg) + 9 cm\n- Low position: BW kg + 7 cm\n\n### Maintenance\n- Heparin 0.5-1 ед/мл in line saline\n- Or papaverine 60 мг/л NaCl 0.45 % for vasospasm prevention\n- Continuous flush 0.5-1 мл/ч\n\n### Complications\n- Vasospasm (white toe / leg) — discontinue immediately\n- Thrombosis (femoral / aortic)\n- NEC association (controversial)\n- Bleeding (если accidentally disconnected)\n\n## Endotracheal Intubation\n\n### Pre-medication (NRP recommended unless emergent)\n- **Atropine** 20 мкг/кг IV (anti-vagal — prevents bradycardia)\n- **Fentanyl** 1-3 мкг/кг IV slow over 5 мин (anti-pain)\n- **Paralytic (optional):** rocuronium 1 мг/кг ИЛИ vecuronium 0.1 мг/кг\n\n### ETT size\n- < 1000 g: 2.5 mm ID\n- 1000-2000 g: 3.0 mm ID\n- 2000-3000 g: 3.5 mm ID\n- > 3000 g: 3.5-4.0 mm ID\n\n### Depth (oral intubation)\n- **Formula:** 6 + weight in kg = depth from upper lip\n- E.g., 1.5 kg → 7.5 cm at upper lip\n\n### Confirm position\n- Chest rise bilateral\n- Breath sounds bilateral + equal\n- Mist in tube\n- ETCO₂ detector (yellow → confirms tracheal placement)\n- HR rise > 100\n- CXR within 1 ч (tip at T1-T3 ideal, midway between thoracic inlet and carina)\n\n### Wrong position\n- **Right main bronchus** (most common error) — pull back 1-2 cm\n- **Esophagus** — clear chest no rise, no ETCO₂ → re-intubate\n- **Too high** — extubation risk → push deeper\n\n## PICC line\n\n### Indications\n- Long-term TPN (> 7-14 d)\n- IV antibiotics > 7 d\n- Replacement of UVC after 7-14 d\n\n### Insertion\n- 1.9 Fr или 2 Fr catheter\n- Insertion site: cubital, basilic, или scalp veins\n- Confirm tip position на CXR — superior vena cava (SVC) preferred\n\n## Lumbar Puncture (LP)\n\n### Indications\n- Suspected meningitis (sepsis workup)\n- HSV ПЦР (CSF)\n- Therapeutic — hydrocephalus тaps\n\n### Position\n- Sitting infant: knee-to-chest\n- Lateral: knee-chest position\n\n### Site\n- L3-L4 or L4-L5 interspace\n- Mark с line drawn between iliac crests = L4 spinous process\n\n### Stylet + needle\n- 22G × 1.5 inch styletted spinal needle preferred\n- Avoid bevel-up technique to prevent CSF leak\n\n### Complications\n- Traumatic tap (RBC > 1000) — falsely elevate WBC\n- Post-LP headache (rare у newborn)\n- Spinal hematoma (very rare у newborn)\n\n## Calculator Bordik\n- neo-uvc-uac (depth + size + position calc)\n- neo-ett (size + depth)\n- neo-fentanyl-dose (pre-intubation)\n- neo-rocuronium-dose (paralytic)\n- neo-atropine-dose (anti-vagal)\n\n## Источники\n\n- AAP / Educational Programs 2024 — procedures handbook\n- Aziz K et al. Pediatrics 2021;147:e2020038505E — NRP 8 ed.\n- Cochrane UAC position 2010:CD000505",
        "references": [
            "AAP / Educational 2024 procedures",
            "Aziz K et al. Pediatrics 2021;147:e2020038505E",
            "Cochrane UAC 2010:CD000505"
        ],
        "related_calculators": ["neo-uvc-uac", "neo-ett", "neo-fentanyl-dose", "neo-rocuronium-dose", "neo-atropine-dose"]
    },
    {
        "id": "art-surfactant",
        "title_ru": "Surfactant therapy 2024 — LISA preferred",
        "title_en": "Surfactant Therapy 2024 — LISA Preferred",
        "topic": "respiratory",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "LISA через тонкий катетер на CPAP. Poractant alfa 200 mg/kg first dose preferred over beractant. Threshold FiO2 > 0.30 при < 28 нед.",
        "content": "## Что такое сурфактант\n\nЭкзогенный surfactant — фосфолипидно-белковый комплекс (SP-A, SP-B, SP-C, SP-D) → reduces alveolar surface tension, prevents atelectasis.\n\n## Препараты\n\n### Poractant alfa (Curosurf — preferred)\n- Porcine origin\n- 80 мг/мл phospholipid\n- **First dose: 200 мг/кг** (2.5 мл/кг)\n- Subsequent doses: 100 мг/кг\n- Cochrane 2015 — superior к beractant в mortality (11 % vs 16 %)\n\n### Beractant (Survanta)\n- Bovine origin\n- 25 мг/мл phospholipid\n- **First dose: 100 мг/кг** (4 мл/кг)\n- Subsequent doses: 100 мг/кг\n\n### Calfactant (Infasurf)\n- Bovine origin (whole lung)\n- 35 мг/мл phospholipid\n- 105 мг/кг (3 мл/кг)\n\n### Synthetic\n- Lucinactant (Surfaxin) — discontinued\n- CHF5633 — clinical trials (synthetic recombinant)\n\n## Indications\n\n### Prophylactic (НЕ рекомендуется в эру antenatal steroids + CPAP)\n- Cochrane 2012 — NO benefit prophylactic vs early rescue\n- Reserved для < 26 нед без antenatal steroids\n\n### Early rescue (preferred)\n- < 28 нед PMA + FiO₂ > 0.30 на CPAP\n- 28-32 нед PMA + FiO₂ > 0.40\n- ≥ 32 нед PMA + FiO₂ > 0.50 (RDS confirmed)\n\n### Re-dosing\n- Persistent O₂ requirement FiO₂ > 0.30 после 4-6 ч\n- ≤ 4 doses total\n\n## Administration techniques\n\n### LISA (Less Invasive Surfactant Administration) — preferred 2024\n- Thin catheter (Cathkit / NeoVation) inserted через vocal cords\n- Patient remains on CPAP\n- Surfactant slow push 30 sec — 1 min\n- Catheter removed, CPAP continued\n- **Advantages:** ↓ BPD, ↓ MV duration, ↓ pneumothorax (Aldana-Aguirre Cochrane 2021)\n\n### MIST (Minimally Invasive Surfactant Therapy) — same concept as LISA\n- Australian terminology\n- Same outcome literature\n\n### INSURE (INtubate-SURfactant-Extubate)\n- Brief intubation, surfactant via ETT, immediate extubation back to CPAP\n- Older standard, now superseded by LISA\n- Some RCTs show LISA superior\n\n### Standard (intubate + maintain MV)\n- Surfactant via ETT, continue MV\n- Reserved для unstable infants requiring prolonged MV\n\n### Aerosolized surfactant (research)\n- Nebulized via vibrating mesh\n- Less invasive\n- AERO-02 trial 2018 negative; ongoing CHF5633 nebulized trials\n\n## Procedure (LISA)\n\n1. **Pre-medication:** atropine 20 мкг/кг IV; sucrose 0.5 мл oral; consider fentanyl 1 мкг/кг (controversial — depresses respiratory drive)\n2. **Position:** infant supine, slightly head-down\n3. **CPAP** maintained throughout 5-7 cm H₂O\n4. **Visualize cords** с laryngoscope (Miller 0 size)\n5. **Insert thin catheter** to depth 1-2 cm below cords\n6. **Push surfactant** slowly 30-60 sec (NOT bolus)\n7. **Remove catheter** — CPAP continues immediately\n8. **Monitor SpO₂, HR** — transient desaturation expected\n\n## Complications\n\n- Transient hypoxemia / bradycardia (most common — recovers с CPAP)\n- Pulmonary hemorrhage (rare — 1-3 %)\n- Coughing / gagging (if high level cord stimulation)\n- Backflow (if pushed too fast)\n\n## Outcomes\n\nMeta-analysis (LISA vs INSURE):\n- ↓ Need MV first 72 h\n- ↓ BPD (NNT ~10)\n- ↓ Mortality (modest)\n- No increase in IVH\n\n## Calculator Bordik\n- neo-surfactant-dose\n- neo-rds-class\n- neo-resp-indices\n\n## Источники\n\n- Sweet DG et al. Neonatology 2023;120:3 — European Consensus RDS\n- Aldana-Aguirre JC et al. Cochrane 2021:CD012878 — LISA vs INSURE\n- Bahadue FL, Soll R. Cochrane 2012:CD001456 — Early surfactant\n- Pfister RH, Soll RF. Cochrane 2015:CD007836 — Poractant vs beractant",
        "references": [
            "Sweet DG et al. Neonatology 2023;120:3",
            "Aldana-Aguirre JC et al. Cochrane 2021:CD012878",
            "Bahadue FL, Soll R. Cochrane 2012:CD001456",
            "Pfister RH, Soll RF. Cochrane 2015:CD007836"
        ],
        "related_calculators": ["neo-surfactant-dose", "neo-rds-class", "neo-resp-indices"]
    }
]


def main() -> int:
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    existing = {a["id"] for a in data["articles"]}
    added = 0
    for art in NEW_ARTICLES:
        if art["id"] in existing:
            continue
        data["articles"].append(art)
        added += 1
    data["version"] = "1.2.0"
    data["lastUpdated"] = "2026-05-09"
    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Added {added} articles. Total: {len(data['articles'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
