"""Add 15 new clinical articles to public/neonatal-articles.json.

Total: 10 -> 25 articles. Each follows existing schema:
  { id, title_ru, title_en, topic, audience, level, summary,
    content (markdown), references[], related_calculators[] }
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
        "id": "art-pda",
        "title_ru": "Открытый артериальный проток (PDA)",
        "title_en": "Patent Ductus Arteriosus (PDA)",
        "topic": "cardiopulmonary",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "PDA у недоношенных. ECHO-driven диагностика. Ibuprofen / paracetamol / indomethacin для closure. Surgical ligation при failure.",
        "content": "## Определение\n\nPDA — persistent ductus arteriosus после рождения с left-to-right shunting (через клиническое значение).\n\n## Эпидемиология\n\n- 30-40 % VLBW < 1500 г\n- 60 % ELBW < 1000 г\n- 10 % term (часто self-resolves)\n\n## Hemodynamically-significant PDA (HSPDA)\n\n**ECHO критерии:**\n- Diameter ≥ 1.5 мм (или > 1.4 мм/кг)\n- LA:Ao ratio > 1.5\n- Reverse / absent diastolic flow в descending aorta\n- LV dilatation\n\n**Клинические:**\n- Murmur (систолический шум по ЛВГК)\n- Bounding peripheral pulses\n- Wide pulse pressure\n- Tachycardia\n- Increased respiratory support\n- Failure to wean from MV\n- Pulmonary edema, oliguria\n\n## Лечение\n\n### Conservative (watchful waiting)\nMost spontaneously close к 3-7 d у term, к 1-2 нед у preterm. Restrictive fluids (130-140 мл/кг/d), permissive hypoxemia, мониторинг.\n\n### Pharmacological closure (HSPDA + symptomatic)\n\n**Ibuprofen lysine** (preferred за renal safety):\n- 10 мг/кг loading IV → 5 мг/кг q24h × 2 дозы\n- Closure rate 70-80 %\n\n**Indomethacin** (старший standard):\n- 0.2 мг/кг loading IV → 0.1-0.2 мг/кг q12h × 2 дозы\n- Renal toxicity higher than ibuprofen\n- ↓ IVH (PIVH trial 1994)\n\n**Paracetamol** (новейший):\n- 15 мг/кг q6h IV/PO × 3-7 дней\n- Closure rate 70 %\n- Лучшая renal/GI safety profile\n- Hammerman 2011 first reports; Cochrane 2020 — equivalent ibuprofen\n\n### Surgical ligation\n- При failure ≥ 2 courses pharmacotherapy\n- HSPDA + persistent vent dependence > 14 d\n- Open procedure через left thoracotomy\n- Trans-catheter closure (PIC — percutaneous implantable closure) — newer alternative\n\n## Осложнения PDA (untreated)\n\n- BPD (chronic lung disease)\n- IVH grade III-IV\n- NEC\n- Pulmonary hemorrhage\n- Failure to thrive\n\n## Калькуляторы Bordik\n- neo-ibuprofen-pda-dose\n- neo-indomethacin-dose\n- neo-paracetamol-dose\n- neo-pphn-screen\n\n## Источники\n\n- Hammerman C et al. **Pediatrics 2011;128:e1618** — paracetamol PDA\n- Ohlsson A et al. **Cochrane 2020:CD003481** — Ibuprofen vs indomethacin\n- Ohlsson A et al. **Cochrane 2020:CD010061** — Paracetamol PDA\n- Sankar MN et al. **Pediatrics 2023;151:e2022060501** — PDA management consensus\n- КР МЗ РФ \"Открытый артериальный проток у новорождённого\" 2024",
        "references": [
            "Hammerman C et al. Pediatrics 2011;128:e1618",
            "Ohlsson A et al. Cochrane 2020:CD003481",
            "Ohlsson A et al. Cochrane 2020:CD010061",
            "Sankar MN et al. Pediatrics 2023;151:e2022060501",
            "КР МЗ РФ ОАП 2024",
        ],
        "related_calculators": ["neo-ibuprofen-pda-dose", "neo-indomethacin-dose", "neo-paracetamol-dose", "neo-pphn-screen"],
    },
    {
        "id": "art-aop",
        "title_ru": "Апноэ недоношенных (Apnea of Prematurity)",
        "title_en": "Apnea of Prematurity (AOP)",
        "topic": "respiratory",
        "audience": "neonatologist",
        "level": "intermediate",
        "summary": "AOP < 32 нед — caffeine citrate first line. Наблюдение до 36 нед PMA минимум. CPAP/HFNC при frequent episodes.",
        "content": "## Определение\n\nApnea — пауза в дыхании > 20 сек ИЛИ короче с bradycardia (< 100 bpm) ИЛИ desaturation (SpO₂ < 80 %).\n\n## Этиология\n\n### Apnea of Prematurity (AOP) — most common < 32 нед\n- Незрелость respiratory центра\n- Hypoxic ventilatory response — biphasic\n- Reduced peripheral chemoreceptor sensitivity\n\n### Secondary causes (всегда исключать!)\n- Sepsis (EOS / LOS)\n- IVH grade III-IV\n- Anemia\n- Hypoglycemia\n- Electrolyte disturbances\n- GERD\n- NEC early\n- Drugs (opioids, sedatives)\n- Thermoregulation issues\n\n## Типы\n\n| Тип | Описание | Mechanism |\n|---|---|---|\n| **Central** | Нет dыхательного усилия | Незрелость центра |\n| **Obstructive** | Усилие есть, поток нет | Обструкция dыхательных путей |\n| **Mixed** | Сочетание (most common) | Combined |\n\n## Лечение\n\n### Caffeine citrate (CAP trial — landmark)\n- **Loading:** 20 мг/кг IV/PO\n- **Maintenance:** 5-10 мг/кг q24h\n- **Старт:** ≤ 3 d жизни\n- **Стоп:** обычно к 34 нед PMA когда apnea-free × 5-7 d\n\n**Эффекты CAP trial 2007 (Schmidt B NEJM 357:1893):**\n- ↓ BPD (36 vs 47 %)\n- ↓ MV duration\n- ↓ ROP requiring treatment\n- ↓ Cerebral palsy + cognitive delay у follow-up до 11 лет\n\n### Aminophylline (alternative — мало используется в эру caffeine)\n\n### Doxapram (refractory cases)\n- Last-resort respiratory stimulant\n- Adverse effects significant\n\n### Non-pharmacologic\n- **Prone positioning** (под наблюдением)\n- **Tactile stimulation** при episode\n- **CPAP / HFNC** — если frequent (≥ 6 episodes/day требующих stimulation)\n\n### Discharge readiness\n- Apnea-free ≥ 5-7 days\n- Off caffeine ≥ 5-7 days\n- Maturity ≥ 36 нед PMA (часто > 40 нед у extreme preterm)\n\n## Калькуляторы Bordik\n- neo-resp-indices\n- neo-extubation-readiness\n- neo-discharge-criteria\n\n## Источники\n\n- Schmidt B et al. **NEJM 2007;357:1893** — CAP trial\n- Schmidt B et al. **JAMA 2012;307:275** — CAP 5-yr follow-up\n- Eichenwald EC AAP COFN. **Pediatrics 2016;137:e20153757** — AAP statement\n- КР МЗ РФ \"Апноэ недоношенных\" 2024",
        "references": [
            "Schmidt B et al. NEJM 2007;357:1893 — CAP trial",
            "Schmidt B et al. JAMA 2012;307:275 — CAP 5-yr",
            "Eichenwald EC. Pediatrics 2016;137:e20153757",
            "КР МЗ РФ Апноэ недоношенных 2024",
        ],
        "related_calculators": ["neo-resp-indices", "neo-extubation-readiness", "neo-discharge-criteria"],
    },
    {
        "id": "art-anaemia-prematurity",
        "title_ru": "Анемия недоношенных",
        "title_en": "Anemia of Prematurity",
        "topic": "hematology",
        "audience": "neonatologist",
        "level": "intermediate",
        "summary": "Multifactorial: ↓ EPO + iatrogenic phlebotomy + RBC short lifespan. EPO + iron supplementation. Транфузия по weight + symptoms.",
        "content": "## Определение\n\nАнемия недоношенных — снижение Hb у preterm, обычно с надиром на 4-10 нед жизни (значительно глубже physiological nadir term).\n\n## Этиология\n\n1. **Сниженный EPO** — печень главный продуцент у preterm vs почки у term (печень имеет lower O₂ sensor sensitivity)\n2. **Iatrogenic phlebotomy** — у ELBW средний забор крови ~10-20 мл/кг/нед\n3. **Короткий RBC lifespan** — fetal Hb-F (40-90 d vs adult 120 d)\n4. **Rapid growth** — dilutional эффект\n5. **Reduced iron stores** — большая часть materинского iron transfer происходит в третьем триместре\n\n## Патофизиология надира\n\n- **Term:** Hb nadir 8-12 нед жизни до 100-110 г/л\n- **Late preterm (32-36 нед):** nadir ~9 нед, Hb 90-100 г/л\n- **Preterm (28-32 нед):** nadir 4-8 нед, Hb 80-90 г/л\n- **ELBW (< 28 нед):** nadir 4-6 нед, Hb 70-80 г/л\n\n## Транфузионные criterii (рестриктивный подход — TOP / ETTNO trials)\n\n**Transfusion Hb thresholds (preterm < 32 нед):**\n\n| Состояние | Hb threshold (рестриктивный) |\n|---|---|\n| MV severe (FiO₂ > 35 %) | 110 g/l |\n| MV moderate / NIPPV | 100 g/l |\n| Stable + minimal support | 80 g/l |\n| Asymptomatic, off support | 70 g/l |\n\n**Transfusion volume:** 15-20 мл/кг PRBC over 2-4 ч.\n\n**TOP / ETTNO 2020 trials:** restrictive ≈ liberal по mortality, но ↓ donor exposures.\n\n## Профилактика\n\n### Delayed cord clamping ≥ 60 sec\n- ↑ Hb на 24 нед, ↓ transfusion need 30-50 %\n- АAP 2017 recommend для всех уеaltrly preterm\n\n### Cord milking\n- Alternative когда DCC contraindicated\n- Возможно risk IVH у extreme preterm — caution per ELOVATE 2020\n\n### EPO (recombinant erythropoietin)\n- 250 ЕД/кг 3×/нед SC × 6 нед\n- ↓ transfusions ~10-15 % у VLBW\n- PENUT trial 2020 (NEJM): high-dose EPO для neuroprotection — equivocal\n\n### Iron supplementation\n- 2-4 мг/кг/d PO ferrous sulfate\n- Старт с 2-4 нед жизни (когда enteral feeds established)\n- Больше у EPO-treated infants (4-6 мг/кг/d)\n\n### Minimize phlebotomy\n- Point-of-care testing\n- Microsampling\n- Cluster blood draws\n\n## Калькуляторы Bordik\n- neo-erythropoietin-dose\n- neo-iron-dose\n\n## Источники\n\n- Kirpalani H et al. **NEJM 2020;383:2639** — TOP trial\n- Franz AR et al. **JAMA 2020;324:560** — ETTNO trial\n- Juul SE et al. **NEJM 2020;382:233** — PENUT EPO neuroprotection\n- Strauss RG. **Transfusion 2008;48:626** — RBC transfusion preterm\n- AAP COFN. **Pediatrics 2017;139:e20162888** — DCC\n- КР МЗ РФ \"Анемия у новорождённых\" 2024",
        "references": [
            "Kirpalani H et al. NEJM 2020;383:2639 — TOP",
            "Franz AR et al. JAMA 2020;324:560 — ETTNO",
            "Juul SE et al. NEJM 2020;382:233 — PENUT",
            "Strauss RG. Transfusion 2008;48:626",
            "AAP COFN. Pediatrics 2017;139:e20162888",
            "КР МЗ РФ Анемия 2024",
        ],
        "related_calculators": ["neo-erythropoietin-dose", "neo-iron-dose"],
    },
    {
        "id": "art-hypoglycemia",
        "title_ru": "Гипогликемия новорождённых",
        "title_en": "Neonatal Hypoglycemia",
        "topic": "metabolic",
        "audience": "neonatologist + педиатр",
        "level": "advanced",
        "summary": "PES 2015 / AAP / BAPM thresholds по часам жизни. Глюкоза bolus 2 мл/кг D10W → GIR 6-8 мг/кг/мин. Diazoxide для CHI.",
        "content": "## Определение и пороги (PES 2015)\n\n**Persistent Endocrine Society 2015 thresholds:**\n\n| Возраст | Threshold treat |\n|---|---|\n| Первые 4 ч | < 1.7 ммоль/л (30 мг/дл) — symptomatic; < 1.4 (25) — asymptomatic |\n| 4-24 ч | < 2.2 ммоль/л (40 мг/дл) |\n| > 24 ч | < 2.5 ммоль/л (45 мг/дл) — neuroprotection target |\n| > 48 ч (persistent) | < 3.3 ммоль/л (60 мг/дл) — workup IEM/CHI |\n\n## Группы риска\n\n- **SGA / IUGR** (поздние недели)\n- **LGA / mother diabetes** (первые 24-48 ч)\n- **Preterm** < 37 нед\n- **Asphyxia / sepsis**\n- **Stress** (cold, hypoxia)\n- **Maternal medications** (β-blockers, hypoglycemics, sulfonylureas)\n\n## Этиология\n\n### Transient (большинство — first 72 ч)\n- Substrate deficiency (preterm, SGA, IUGR)\n- Hyperinsulinism (LGA / IDM)\n- Increased utilization (asphyxia, sepsis)\n\n### Persistent (> 72 ч — workup!)\n- **Congenital hyperinsulinism (CHI)** — ABCC8/KCNJ11 mutations\n- **Beckwith-Wiedemann syndrome**\n- **IEMs** (galactosemia, fatty acid oxidation defects)\n- **Endocrine** (panhypopituitarism, adrenal insufficiency)\n- **Glycogen storage disease**\n\n## Лечение\n\n### Mild asymptomatic\n- Усиленное кормление (грудное молоко / formula 10-15 мл/кг q1-2h)\n- Buccal dextrose gel 200 мг/кг (40% gel × 0.5 мл/кг) — Sugar Babies trial 2013\n- Recheck glucose 30 мин\n\n### Symptomatic ИЛИ glucose < 2.2 ммоль/л\n- **Bolus:** 2 мл/кг D10W IV slow (200 мг/кг = 1 mEq/мл glucose)\n- **Start GIR:** 6-8 мг/кг/мин continuous (см. neo-gir)\n- **Recheck:** через 30 мин\n\n### Failure response → escalate\n1. ↑ GIR до 12-15 мг/кг/мин\n2. Если требуется > 8 мг/кг/мин persistently → CHI workup:\n   - Critical sample: insulin, c-peptide, β-OH-butyrate, FFA, growth hormone, cortisol, ammonia\n   - **Glucagon stimulation test** (0.03 мг/кг IM/IV — increases glucose в hyperinsulinism, NOT в IEM)\n3. **Diazoxide** 5-15 мг/кг/d split q8h PO (ABCC8 / KCNJ11 mutations)\n4. **Octreotide** 5-25 мкг/кг/d split q6-8h (diazoxide-resistant)\n\n### CHI surgical (refractory)\n- Pancreatectomy 95-98 % (после genetics + 18F-DOPA PET imaging для focal vs diffuse)\n\n## Калькуляторы Bordik\n- neo-glucose-bolus-dose\n- neo-gir\n- neo-diazoxide-dose\n- neo-octreotide-dose\n- neo-glucagon-dose\n\n## Источники\n\n- Thornton PS et al. **J Pediatr 2015;167:238** — PES 2015\n- BAPM Hypoglycemia Framework 2017\n- AAP CFN. **Pediatrics 2011;127:575** — Hypoglycemia approach\n- Harris DL et al. **Lancet 2013;382:2077** — Sugar Babies (dextrose gel)\n- McKinlay CJ et al. **NEJM 2015;373:1507** — CHYLD outcome study\n- КР МЗ РФ \"Гипогликемия у новорождённых\" 2023",
        "references": [
            "Thornton PS et al. J Pediatr 2015;167:238 — PES 2015",
            "BAPM Hypoglycemia Framework 2017",
            "AAP CFN. Pediatrics 2011;127:575",
            "Harris DL et al. Lancet 2013;382:2077",
            "McKinlay CJ et al. NEJM 2015;373:1507",
            "КР МЗ РФ Гипогликемия 2023",
        ],
        "related_calculators": ["neo-glucose-bolus-dose", "neo-gir", "neo-diazoxide-dose", "neo-octreotide-dose", "neo-glucagon-dose"],
    },
    {
        "id": "art-mas",
        "title_ru": "Аспирация мекония (MAS)",
        "title_en": "Meconium Aspiration Syndrome (MAS)",
        "topic": "respiratory",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "Tracheal suctioning только при non-vigorous; surfactant lavage; iNO для PPHN; ECMO rescue.",
        "content": "## Определение\n\nMAS — респираторный distress у новорождённого с meconium-stained amniotic fluid (MSAF) + R-graphic findings + других этиологий exclusion.\n\n## Эпидемиология\n\n- MSAF: 10-15 % всех родов\n- MAS: 2-5 % из MSAF (~0.5 % всех родов)\n- Mortality MAS severe: 5-10 %\n\n## Патофизиология\n\n1. **Mechanical obstruction** — meconium plugs airways\n2. **Surfactant inactivation** — meconium binds + inhibits SP-A, SP-B\n3. **Inflammatory response** — cytokines, neutrophilic infiltration\n4. **PPHN** — secondary к hypoxic vasoconstriction\n5. **Air leak** (ball-valve effect — pneumothorax 10-30 % MAS)\n\n## NRP 8 ed. (2021) — изменения в подходе\n\n### Vigorous infant (good cry/tone, HR > 100)\n- **НЕТ tracheal suctioning** routinely\n- Routine resuscitation: dry, stimulate, position\n\n### Non-vigorous infant (apnea/poor tone/HR < 100)\n- **Не routine intubation** (изменено с 2015 NRP 7 ed.)\n- НО — если standard PPV не эффективна (no chest rise) → **intubation + tracheal suctioning** через мекониум-aspirator\n- Затем initiation PPV / resuscitation\n\n## Лечение\n\n### Mild MAS (FiO₂ < 40 %, RDS minimal)\n- O₂ via NC/CPAP\n- Symptomatic\n- Обычно self-limiting 3-5 d\n\n### Moderate MAS (FiO₂ 40-60 %, MV indications)\n- MV (volume-targeted preferred)\n- Permissive hypercapnia (PaCO₂ 50-60 if pH > 7.25)\n- Sedation + analgesia\n- ABX (ампициллин + гентамицин) — pneumonia не excluded\n\n### Severe MAS (OI > 15-25)\n- **Surfactant** 100-200 мг/кг intratracheal q6h × 2-4 doses (Cochrane 2014 — Wiswell 2002)\n- **Surfactant lavage** (5 мл/кг diluted surfactant — controversial)\n- **HFOV** при air leak ИЛИ persistent hypoxemia\n- **iNO** 20 ppm если PPHN (OI > 25)\n- **ECMO** rescue OI > 40 (criteria see neo-resp-indices)\n\n## Осложнения\n\n- PPHN (~30 % severe MAS)\n- Pneumothorax / pneumomediastinum (10-30 %)\n- Pneumonia (secondary)\n- BPD (если survived MV > 28 d)\n- Long-term: asthma-like wheeze, RAD\n\n## Калькуляторы Bordik\n- neo-resus-doses\n- neo-resp-indices\n- neo-surfactant-dose\n- neo-ino-dose\n\n## Источники\n\n- Aziz K et al. **Pediatrics 2021;147:e2020038505E** — NRP 8 ed.\n- Wiswell TE et al. **Pediatrics 2002;109:1081** — surfactant\n- Choi HJ et al. **Cochrane 2014:CD003486** — surfactant for MAS\n- Vain NE et al. **Lancet 2004;364:597** — non-vigorous (intrapartum)\n- Wiswell TE et al. **Pediatrics 2000;105:1** — meta-analysis suctioning\n- КР МЗ РФ \"Аспирационный синдром мекония\" 2024",
        "references": [
            "Aziz K et al. Pediatrics 2021;147:e2020038505E",
            "Wiswell TE et al. Pediatrics 2002;109:1081",
            "Choi HJ et al. Cochrane 2014:CD003486",
            "Vain NE et al. Lancet 2004;364:597",
            "КР МЗ РФ MAS 2024",
        ],
        "related_calculators": ["neo-resus-doses", "neo-resp-indices", "neo-surfactant-dose", "neo-ino-dose"],
    },
    {
        "id": "art-cooling",
        "title_ru": "Therapeutic Hypothermia (TH) — практика",
        "title_en": "Therapeutic Hypothermia — Practice",
        "topic": "neuro",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "Cooling 33-34°C × 72 ч. Старт ≤ 6 ч. Whole-body или selective head. NICHD/TOBY criteria. Slow rewarming.",
        "content": "## История\n\nПервые клинические trials cooling в neonates — late 1990s. NICHD whole-body trial (Shankaran 2005 NEJM) и TOBY UK selective head trial (Azzopardi 2009 NEJM) — landmarks. Cochrane 2013 meta-analysis: ↓ death + NDI 25 %.\n\n## Cooling — как это работает\n\nNeuroprotection через множество mechanisms:\n1. ↓ cerebral metabolic rate (~5 %/°C)\n2. ↓ glutamate release\n3. ↓ NMDA receptor activation\n4. ↓ free radical production\n5. ↓ apoptosis (caspase-mediated)\n6. ↓ inflammation\n\n## Critria для cooling (NICHD)\n\nA criteria + B criteria + C criteria — все 3 должны быть.\n\n**A: Включающие**\n- GA ≥ 36 нед, BW ≥ 1800 г\n- Возраст ≤ 6 ч\n\n**B: Acidosis или perinatal event**\n- pH < 7.0 или BE ≥ -16\n- ИЛИ Apgar 0-5 на 10 мин\n- ИЛИ continued resuscitation > 10 мин\n- ИЛИ sentinel event\n\n**C: Neurological exam ИЛИ aEEG**\n- Sarnat moderate/severe (II-III)\n- ИЛИ aEEG abnormal background (burst-suppression, low-voltage, flat)\n\n## Контраиндикации\n\n- GA < 36 нед\n- BW < 1800 г\n- Возраст > 6 ч (window закрыт)\n- Major chromosomal anomaly\n- Lethal congenital malformations\n- Active uncontrolled bleeding\n- Persistent severe acidosis pH < 6.7\n\n## Протокол\n\n### Cooling phase (target 33.5 ± 0.5 °C × 72 ч)\n1. **Servo-controlled mattress** (whole-body, preferred)\n2. **Selective head cooling** (cap) — alternative; ниже body T core\n3. Continuous esophageal или rectal probe\n4. Sedation: morphine 0.1 мг/кг IV bolus + 0.01-0.02 мг/кг/h infusion\n5. Paralysis при shivering (rocuronium / cisatracurium)\n\n### Rewarming phase (медленно — критично)\n- 0.5 °C / ч × 6-8 ч\n- НЕ rapid — risk seizures, intracranial bleeding, electrolyte shifts\n- Sedation continues during rewarming\n\n### Post-rewarming (after 80 ч)\n- Wean sedation gradually\n- MRI brain @ 5-14 d post-cooling\n- aEEG continues для seizure detection\n- Anticonvulsants prn (phenobarbital 20 мг/кг loading)\n\n## Adverse effects\n\n- Sinus bradycardia (HR 80-100 — обычно benign)\n- Mild hypotension\n- Subcutaneous fat necrosis (1-3 %)\n- Coagulopathy / mild thrombocytopenia\n- Skin discoloration\n- Increased incidence persistent pulmonary hypertension\n\n## Outcomes\n\n**NICHD whole-body 2005 (Shankaran):**\n- Death + moderate/severe disability: 44 vs 62 % (P = 0.01)\n- NNT = 6 to prevent death/severe disability\n\n**TOBY (Azzopardi 2009):**\n- ↑ Survival without neurologic abnormality (44 vs 28 %, P < 0.001)\n\n**Long-term Shankaran 2012 (6-7 yr):**\n- Death + IQ < 70: 47 vs 62 %\n- Cerebral palsy: 19 vs 36 %\n\n## TH в LMICs\n\n- HELIX trial 2021 (Thayyil S, Lancet Glob Health) — TH в Индии, Шри-Ланка не показал benefit ↑ mortality\n- Resource-limited settings — TH currently NOT recommended outside high-resource centers\n\n## Калькуляторы Bordik\n- neo-asphyxia-criteria\n- thompson\n- neo-hie-cooling\n- neo-phenobarbital-dose\n\n## Источники\n\n- Shankaran S et al. **NEJM 2005;353:1574** — NICHD\n- Azzopardi DV et al. **NEJM 2009;361:1349** — TOBY\n- Edwards AD et al. **Cochrane 2013:CD003311**\n- Shankaran S et al. **NEJM 2012;366:2085** — 6-7 yr follow-up\n- Thayyil S et al. **Lancet Glob Health 2021;9:e1273** — HELIX\n- AAP COFN, ACOG. **Pediatrics 2014;133:e1482**\n- КР МЗ РФ ХИЭ 2024",
        "references": [
            "Shankaran S et al. NEJM 2005;353:1574 — NICHD",
            "Azzopardi DV et al. NEJM 2009;361:1349 — TOBY",
            "Edwards AD et al. Cochrane 2013:CD003311",
            "Shankaran S et al. NEJM 2012;366:2085",
            "Thayyil S et al. Lancet Glob Health 2021;9:e1273 — HELIX",
            "AAP/ACOG. Pediatrics 2014;133:e1482",
            "КР МЗ РФ ХИЭ 2024",
        ],
        "related_calculators": ["neo-asphyxia-criteria", "thompson", "neo-hie-cooling", "neo-phenobarbital-dose"],
    },
    {
        "id": "art-discharge",
        "title_ru": "Критерии выписки из NICU",
        "title_en": "NICU Discharge Criteria",
        "topic": "discharge",
        "audience": "neonatologist + педиатр",
        "level": "intermediate",
        "summary": "AAP COFN 2008 — physiologic stability, established feeding, parent education, follow-up plan, hearing/CCHD/ROP screen complete.",
        "content": "## Базовые критерии выписки (AAP COFN 2008)\n\n### Physiologic stability\n- Стабильная температура в открытой кроватке\n- Set apnea-free ≥ 5-7 dней (при необходимости off caffeine 5-7 d)\n- Adequate respiratory function (off support или on home O₂ stable)\n- Hemodynamics stable (no inotropes, normal HR/BP)\n- Glucose stable (без supplementation)\n\n### Feeding established\n- ≥ 100-120 мл/кг/d enteral fully (или mixed PN/EN если планируется home PN)\n- Adequate weight gain (15-20 г/d)\n- Coordinated suck-swallow-breathe (term-equivalent age)\n- Without aspiration\n\n### Maturity\n- Term-equivalent maturity (~36-37 нед PMA для most preterms)\n- Some VLBW могут потребовать > 40 нед\n\n## Required screenings (complete до выписки)\n\n- **Hearing screen** (ABR / OAE) — mandatory всем\n- **CCHD pulse oximetry screen** (24-48 ч жизни) — mandatory term + late preterm\n- **Newborn metabolic screen** (РФ: 36 заболеваний; US RUSP: 35) — first sample 24-72 ч\n- **ROP exam** (если screened — preterm < 32 нед или BW < 1500 g)\n- **Retinal exam follow-up** plan если ROP detected\n- **Cranial УЗИ** документирована (preterm < 32 нед)\n- **ЭХО** сердца (как clinically indicated)\n\n## Иммунизация (по календарю)\n\n- **HBV** vaccine birth dose (term + most preterms)\n- **BCG** (РФ обязательно для term ≥ 2000 g)\n- **RSV prophylaxis** (palivizumab) — для high-risk preterm < 32 нед в RSV сезон\n- **DTaP/IPV/Hib/PCV/RV** schedule starts на 2 мес жизни (для preterm — chronological age, not corrected)\n\n## Образование родителей\n\nДолжны быть demonstrated:\n- Безопасное feeding (breastfeeding или bottle-feeding)\n- Bath, diaper, скin care\n- Symptoms recognition (lethargy, poor feeding, fever, jaundice)\n- Safe sleep (SIDS prevention — back position, firm mattress, no soft bedding)\n- CPR / basic life support training (recommended)\n- Medication administration (если on home meds)\n- Home equipment (если applicable: O₂, monitors, NG tube)\n\n## Follow-up plan\n\n- **Pediatrician visit** within 48-72 h после discharge\n- **High-risk follow-up clinic** (для VLBW/ELBW) — multi-disciplinary (developmental specialist, OT, PT, audiology, ophthalmology)\n- **Cardiology** (если CHD)\n- **Neurology** (если HIE / IVH / seizures)\n- **Pulmonology** (если BPD on home O₂)\n- **GI / nutrition** (если SBS / TPN dependent)\n\n## Special situations\n\n### Home oxygen\n- BPD требующий O₂ — discharge possible с education + equipment\n- Pulse oximeter rental\n- Plan для weaning (target SpO₂ > 93 %)\n\n### Home PN\n- SBS / NEC после resection\n- Specialized центры\n- Central line care education критична\n\n### Tracheostomy / home ventilation\n- Для ELBW с severe BPD требующих long-term MV\n- Specialized programs (rare в РФ — usually transferred к детская паллиативная)\n\n## Калькуляторы Bordik\n- neo-discharge-criteria (AAP COFN 2008 interactive checklist)\n- neo-feeding-readiness\n- neo-vaccination-calendar\n- neo-newborn-screening\n\n## Источники\n\n- AAP COFN. **Pediatrics 2008;122:1119** — Hospital discharge of high-risk neonate\n- Engle WA AAP COFN. **Pediatrics 2007;120:1390** — Late preterm discharge\n- AAP. **Pediatrics 2017;140:e20171870** — Hearing screening\n- AAP. **Pediatrics 2018;142:e20183061** — ROP screening\n- КР МЗ РФ \"Профилактика РСВ-инфекции\" 2023 (palivizumab)",
        "references": [
            "AAP COFN. Pediatrics 2008;122:1119",
            "Engle WA AAP COFN. Pediatrics 2007;120:1390",
            "AAP. Pediatrics 2017;140:e20171870",
            "AAP. Pediatrics 2018;142:e20183061",
            "КР МЗ РФ Палivizумаб 2023",
        ],
        "related_calculators": ["neo-discharge-criteria", "neo-feeding-readiness", "neo-vaccination-calendar", "neo-newborn-screening"],
    },
    {
        "id": "art-screening",
        "title_ru": "Скрининги новорождённых (РФ + международные)",
        "title_en": "Newborn Screening (Russia + International)",
        "topic": "screening",
        "audience": "neonatologist + педиатр",
        "level": "intermediate",
        "summary": "РФ 36 заболеваний (Приказ МЗ РФ 2023). Hearing 24-72 ч. CCHD pulse ox 24-48 ч. Sample timing критичен.",
        "content": "## РФ — Расширенный скрининг 36 заболеваний (Приказ МЗ РФ 2023)\n\n**Заболевания (36):**\n\n### Эндокринные (3)\n- Гипотиреоз (TSH)\n- Адреногенитальный синдром (17-OH-P)\n- Гипофосфатазия\n\n### Аминоацидопатии + органические (15)\n- Фенилкетонурия (PKU)\n- Гомоцистинурия\n- Tyrosinemia I/II/III\n- Maple Syrup Urine Disease (MSUD)\n- Пропионовая ацидемия\n- Метилмалоновая ацидемия\n- Изовалериановая ацидемия\n- 3-MCC (3-methylcrotonyl-CoA carboxylase)\n- Глутаровая ацидемия I\n- HMG-CoA lyase\n- ...\n\n### Нарушения β-окисления (10)\n- MCAD\n- VLCAD\n- LCHAD\n- Carnitine cycle defects\n- ...\n\n### Cystic fibrosis (1)\n- IRT (immunoreactive trypsinogen) → DNA на CFTR\n\n### Другие (7)\n- Galactosemia\n- Biotinidase deficiency\n- Severe combined immunodeficiency (SCID — TREC)\n- Spinal muscular atrophy (SMA — SMN1 gene)\n- Адреноноэнцефалопатия\n- ...\n\n## Sample timing (КРИТИЧНО)\n\n- **Сухой кровяной образец из пятки**\n- **Term:** 24-72 ч жизни (after first feed для PKU sensitivity)\n- **Preterm:** Initial — 24-72 ч; **повторный** — 36 нед PMA или discharge\n- **NICU patients with PN:** обоюдно при первом entries и repeat если на TPN long-term\n- **Transfusion:** sample BEFORE transfusion (RBC может маскировать abnormalities)\n\n## Hearing screening\n\n### Methods\n- **OAE** (otoacoustic emissions) — quick, screening only, false-positive у NICU\n- **AABR** (automated auditory brainstem response) — preferred у NICU (≥ 5 d, MV history, hyperbilirubinemia, sepsis, асфиксия)\n\n### Timing\n- **First screen:** ≤ 1 мес жизни\n- **Term:** до выписки из роддома\n- **NICU:** до выписки или в 36 нед PMA\n- **Refer:** если fail — diagnostic audiology до 3 мес\n- **Intervention:** если loss confirmed — до 6 мес\n\n## CCHD (Critical Congenital Heart Disease) pulse oximetry\n\n### Timing\n- 24-48 ч жизни (после adaptation)\n- Term + late preterm (≥ 35 нед)\n\n### Method\n- Right hand (preductal) + foot (postductal) одновременно\n- Pass: SpO₂ ≥ 95 % на обеих сторонах И difference < 3 %\n- Fail: SpO₂ < 90 %; ИЛИ persistent < 95 % после 3 measurements + 1 ч\n- Borderline: 90-94 % ИЛИ ≥ 3 % difference — repeat\n- **Fail → ЭХО** обязательно\n\n### Yield\n- Detects ~75 % critical CHD missed prenatally\n- 7 \"target\" lesions: HLHS, TGA, TAPVR, Tetralogy of Fallot, Pulmonary atresia, Truncus arteriosus, Tricuspid atresia\n\n## ROP screening (preterm)\n\n### Кого\n- GA ≤ 32 нед\n- BW ≤ 1500 г\n- Late preterm с unstable course (clinical judgment)\n\n### Timing first exam\n- GA 22-26 нед: 31 нед PMA\n- GA 27-30 нед: 4 нед PNA или 31 нед PMA\n- GA 31-32 нед: 4 нед PNA\n\n### Метод\n- Indirect ophthalmoscopy с 28D lens после mydriasis\n- Cyclopentolate 0.5% + phenylephrine 2.5% — 1 drop каждый × 2 за 30 мин до exam\n\n### Recall\n- Normal → q1-2 нед\n- Stage 1-2 в Zone II → q1 нед\n- Type 1 ROP → treatment (anti-VEGF / laser) within 48-72 ч\n\n## Калькуляторы Bordik\n- neo-newborn-screening (timing checklist)\n- neo-cchd-pulse-oximetry\n- neo-rop-screen-timing\n- neo-prematurity-class\n\n## Источники\n\n- РФ Приказ Минздрава России 2023 (Расширенный неонатальный скрининг 36)\n- US RUSP (Recommended Uniform Screening Panel) — 35 conditions (HRSA)\n- AAP. **Pediatrics 2017;140:e20171870** — Hearing\n- AAP. **Pediatrics 2018;142:e20183061** — ROP\n- AAP / AHA. **Pediatrics 2011;128:e1259** — CCHD pulse oximetry",
        "references": [
            "РФ Приказ МЗ 2023 — Расширенный скрининг 36",
            "US RUSP HRSA",
            "AAP. Pediatrics 2017;140:e20171870 — Hearing",
            "AAP. Pediatrics 2018;142:e20183061 — ROP",
            "AAP/AHA. Pediatrics 2011;128:e1259 — CCHD",
        ],
        "related_calculators": ["neo-newborn-screening", "neo-cchd-pulse-oximetry", "neo-rop-screen-timing", "neo-prematurity-class"],
    },
    {
        "id": "art-fenton",
        "title_ru": "Графики роста Fenton 2025 + Intergrowth-21st",
        "title_en": "Fenton 2025 + Intergrowth-21st Growth Charts",
        "topic": "growth",
        "audience": "neonatologist + педиатр",
        "level": "intermediate",
        "summary": "Fenton 2025 — preterm 22-50 нед PMA. Intergrowth-21st — international standards. Регулярная плот weight/length/HC.",
        "content": "## Зачем графики роста\n\n- Оценка З.В.У.Р. (SGA / IUGR) — risk stratification\n- Мониторинг postnatal growth — feeding adequacy\n- Detection failure to thrive\n- Catch-up growth assessment\n\n## Fenton 2025 (revised from Fenton 2013)\n\n### Применение\n- Preterm 22-50 нед PMA\n- Plotted weight, length, head circumference\n- LMS-based (3rd, 10th, 50th, 90th, 97th percentiles)\n- Updated 2025 с new data — slight differences vs 2013\n\n### Интерпретация percentiles\n- < 3rd: severe SGA\n- 3rd-10th: SGA / mild IUGR\n- 10th-90th: AGA (appropriate for GA)\n- > 90th: LGA\n- > 97th: significant macrosomia\n\n## Intergrowth-21st (Villar 2014 Lancet)\n\n### Преимущества\n- **International standard** (WHO-style — \"how children should grow\")\n- 8 countries cohort, > 4500 women с low-risk pregnancy\n- Multi-ethnic (Brazil, China, India, Italy, Kenya, Oman, UK, USA)\n- Postnatal growth standards для term + preterm\n\n### Применение\n- Antenatal growth (от 14 нед gestation)\n- Birth weight by GA\n- Postnatal growth (preterm follow-up)\n\n### Сравнение с Fenton\n- Intergrowth obtained на selected low-risk pregnancies — \"оптимальные\" curves\n- Fenton — \"reference\" (descriptive, не prescriptive)\n- Преimущество Intergrowth: smoother (~1 σ shift) — easier для inter-population comparison\n\n## WHO standards (term + post-term)\n\n- WHO-MGRS (Multicentre Growth Reference Study)\n- Term только\n- 0-24 мес\n- 6 stage standards (weight-for-age, height-for-age, weight-for-height, BMI-for-age, head circ, MUAC)\n\n## Postnatal growth у preterm (\"extrauterine growth restriction\" — EUGR)\n\n### Definition EUGR\n- Weight < 10th percentile @ discharge ИЛИ @ 36 нед PMA\n\n### Risk факторы\n- ELBW < 1000 g (90 % EUGR)\n- Severe BPD\n- NEC\n- Sepsis\n- TPN-dependent > 21 d\n\n### Ассоциации\n- ↑ NDI risk (Ehrenkranz 2006)\n- Длительная hospitalization\n- ↑ later metabolic syndrome\n\n## Catch-up growth\n\n- Most VLBW achieve catch-up к 2-3 годам corrected age\n- 10-20 % continue с persistent growth restriction\n- Длительный follow-up (≥ 5 лет) важен у все ELBW\n\n## Калькуляторы Bordik\n- neo-fenton (Fenton 2025 nomogram)\n- intergrowth (Intergrowth-21st)\n- neo-who-growth (WHO 0-24 мес)\n- neo-newt (NEWT — postnatal weight curve term)\n- neo-zvur-class\n\n## Источники\n\n- Fenton TR, Kim JH. **BMC Pediatrics 2013;13:59** — Fenton 2013\n- Fenton TR et al. **2025 update** (preprint Sept 2025)\n- Villar J et al. **Lancet 2014;384:857** — Intergrowth-21st\n- Villar J et al. **Lancet 2015;386:857** — Postnatal Intergrowth\n- WHO Multicentre Growth Reference Study (MGRS) 2006\n- Ehrenkranz RA et al. **Pediatrics 2006;117:1253** — EUGR + outcomes\n- Flaherman VJ et al. **Pediatrics 2015;135:e16** — NEWT (term breastfeeding)",
        "references": [
            "Fenton TR. BMC Pediatrics 2013;13:59",
            "Villar J et al. Lancet 2014;384:857 — Intergrowth-21st",
            "WHO MGRS 2006",
            "Ehrenkranz RA et al. Pediatrics 2006;117:1253",
            "Flaherman VJ et al. Pediatrics 2015;135:e16",
        ],
        "related_calculators": ["neo-fenton", "intergrowth", "neo-who-growth", "neo-newt", "neo-zvur-class"],
    },
    {
        "id": "art-pain",
        "title_ru": "Анальгезия и седация в NICU",
        "title_en": "Analgesia & Sedation in NICU",
        "topic": "pain_nas_sedation",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "Tiered approach: non-pharm → sucrose → топические → opioids. Avoid midazolam (Anand 2004). NIPS/PIPP/N-PASS scoring.",
        "content": "## Pain в NICU — реальность\n\nNICU patients подвергаются 12-16 painful procedures в день (среднее) у preterm. Острый и chronic pain имеют long-term consequences:\n- Altered pain processing\n- ↑ Anxiety, behavioural issues\n- Altered cortical development (white matter changes на MRI)\n- ↑ NDI у extreme preterm\n\n## Pain assessment\n\n### NIPS (Neonatal Infant Pain Scale)\n- Term newborns\n- 6 параметров (facial expression, cry, breathing, arms, legs, arousal)\n- 0-7 баллов; ≥ 4 — significant pain\n- См. neo-nips\n\n### PIPP-R (Premature Infant Pain Profile — Revised 2014)\n- Premature newborns\n- 6 параметров + correction для GA + behavioural state\n- 0-21 баллов\n- См. neo-pipp-r\n\n### N-PASS (Neonatal Pain, Agitation, Sedation Scale)\n- Также assess sedation depth (отрицательные значения)\n- 5 параметров pain + 5 sedation\n- См. neo-npass\n\n## Hierarchy treatment (escalating)\n\n### 1. Non-pharmacological (FIRST — всегда)\n- **Skin-to-skin (kangaroo)** — proven analgesic\n- **Breastfeeding / breast milk** на щёках\n- **Swaddling** firm\n- **Pacifier (NNS)** — non-nutritive sucking\n- **Containment** (\"facilitated tucking\")\n- **Quiet, dim environment**\n\n### 2. Topical (для simple procedures)\n- **Sucrose 24 % oral** 0.1-0.5 мл (term), 0.05-0.1 мл (preterm) 2 мин до procedure\n  - Effective для heel sticks, IV puncture, etc.\n  - Maximum 6 doses/d у term, 4 doses/d у preterm\n- **EMLA cream** (lidocaine 2.5 % + prilocaine 2.5 %)\n  - 1 г apply 60-90 мин до procedure (≥ 12 нед GA)\n  - НЕ < 32 нед GA (methemoglobinemia risk)\n- **Tetracaine gel** 4 % — alternative для venepuncture\n\n### 3. Mild-moderate pain (procedural)\n- **Paracetamol 7.5-15 мг/кг IV** q6h prn\n  - Onset 60 мин\n  - Less hepatotoxicity у neonates (slower CYP2E1)\n- **Fentanyl 1-2 мкг/кг IV** slow push (procedural sedation)\n  - Onset 1-2 мин; duration 30-60 мин\n  - Less histamine release vs morphine\n  - Chest wall rigidity при rapid push — slow infusion 5+ мин\n\n### 4. Moderate-severe pain (continuous)\n- **Morphine** 10-20 мкг/кг/h continuous\n  - Bolus 50-100 мкг/кг IV slow\n  - Effective для surgery / chronic discomfort\n  - Caution у preterm — длительный t½, accumulation\n\n### 5. Sedation (mechanical ventilation)\n- **Dexmedetomidine** 0.2-1.4 мкг/кг/h\n  - α2-selective (modern preferred)\n  - Less respiratory depression vs opioids\n  - PALICS 2017\n- **Clonidine** 0.5-2 мкг/кг/h — alternative; cheaper\n- **Midazolam** — **AVOID** routine у preterm (Anand 2004 — adverse neurodev outcomes)\n  - Reserve для refractory seizures, procedural\n  - Bolus 50-150 мкг/кг IV slow\n\n### 6. Severe / refractory\n- **Ketamine** 0.5-2 мг/кг IV\n  - Procedural — analgesic + dissociative\n  - НЕТ rebound apnea\n- **Pentobarbital, propofol** — rare, specialized indications\n\n## Avoidance в neonates\n\n- **Codeine, tramadol** — FDA black box CYP2D6 ultra-rapid metabolizers (death cases)\n- **Aspirin** — Reye syndrome\n- **NSAIDs IV** chronically — renal toxicity\n\n## Withdrawal protocols\n\n- **Opioids > 5 d use** — taper 10-20 % q24h\n- **Benzodiazepines > 5 d** — taper 10 % q24h\n- **Iatrogenic NAS** — Modified Finnegan / N-PASS scoring\n\n## Калькуляторы Bordik\n- neo-nips, neo-pipp-r, neo-npass (pain assessment)\n- neo-finnegan (NAS)\n- neo-paracetamol-dose, neo-morphine-dose, neo-fentanyl-dose\n- neo-midazolam-dose, neo-clonidine-dose\n\n## Источники\n\n- Anand KJ et al. **Lancet 2004;363:1673** — midazolam\n- AAP. **Pediatrics 2016;137:e20154271** — Pain management in newborn\n- Hall RW, Anand KJ. **Pediatr Rev 2014;35:373** — Sedation\n- Stevens B et al. **Cochrane 2016:CD001069** — Sucrose for procedural pain\n- Foster JP et al. **Cochrane 2017:CD011248** — NNS analgesia\n- O'Mara K et al. **J Pediatr Pharmacol Ther 2018;23:215** — Dexmedetomidine\n- КР МЗ РФ \"Боль и седация у новорождённых\" 2024",
        "references": [
            "Anand KJ et al. Lancet 2004;363:1673",
            "AAP. Pediatrics 2016;137:e20154271",
            "Stevens B et al. Cochrane 2016:CD001069",
            "Foster JP et al. Cochrane 2017:CD011248",
            "O'Mara K et al. J Pediatr Pharmacol Ther 2018;23:215",
            "КР МЗ РФ Боль и седация 2024",
        ],
        "related_calculators": ["neo-nips", "neo-pipp-r", "neo-npass", "neo-finnegan", "neo-paracetamol-dose", "neo-morphine-dose", "neo-fentanyl-dose", "neo-midazolam-dose", "neo-clonidine-dose"],
    },
    {
        "id": "art-tpn",
        "title_ru": "Парентеральное питание у недоношенных",
        "title_en": "Parenteral Nutrition in Preterm Infants",
        "topic": "gastro",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "ESPGHAN 2018: aggressive начало <2 ч после рождения. AA 2-3 → 3.5-4 г/кг/d. Lipid 1-2 → 3-4 г/кг/d.",
        "content": "## Цели\n\n- **Maintain growth** — extra-uterine growth restriction (EUGR) prevention\n- **Тurnaround on negative nitrogen balance** — раннее начало AA crucial\n- **Energy** — целевая 90-120 ккал/кг/d полное метаболическое supply\n\n## ESPGHAN 2018 (Clin Nutr 37:2306) — recommendations\n\n### Жидкость (см. neo-fluid)\n- Day 1: 60-80 мл/кг/d (term), 80-90 (preterm)\n- Goal day 5-7: 140-160 мл/кг/d полная maintenance\n\n### Aminoacids (старт <2 ч после рождения!)\n- Start: 1.5-2 г/кг/d (если parenteral — start immediately)\n- Goal: 3-4 г/кг/d (extreme preterm 4-4.5 г/кг/d)\n- Pediatric AA solutions (e.g., Aminoven Infant 10 %, Trophamine 10 %)\n- НЕ adult formulations (incorrect AA profile)\n\n### Glucose (см. neo-gir)\n- Start GIR: 4-6 мг/кг/мин\n- Advance: 1-2 мг/кг/мин q24h до 10-12 мг/кг/мин\n- Tolerance limit: 12-13 мг/кг/мин (above — risk hyperglycemia, lipogenesis)\n\n### Lipids\n- Start: 1-2 г/кг/d на день 1\n- Goal: 3-4 г/кг/d (max 4)\n- **SMOFlipid** (preferred — 4-component: soybean + medium chain + olive + fish oil)\n- НЕ pure soybean (pro-inflammatory, intralipid)\n- **Phytosterol-free** или low — minimize PNALD risk\n\n### Electrolytes (per kg per day)\n\n| Электролит | Day 1-3 | Day 4+ |\n|---|---|---|\n| **Na** | 0-2 mmol | 2-3 mmol |\n| **K** | 1-2 mmol | 2-3 mmol |\n| **Cl** | 1-2 mmol | 2-3 mmol |\n| **Ca** | 1-2 mmol | 2-3 mmol |\n| **P** | 0.7-1.0 mmol | 1.5-2 mmol |\n| **Mg** | 0.1-0.2 mmol | 0.2-0.4 mmol |\n\n## Vitamins (ESPGHAN)\n\n- **MVI Pediatric** (multivitamin with E, A, B, C, K) — daily\n- **Vit K** 1 мг IM день 1\n- **Vit D** 400-1000 ЕД/d (PO once enteral)\n\n## Trace elements\n\n- **Zn** 250 мкг/кг/d\n- **Cu** 20 мкг/кг/d (NOT in cholestasis)\n- **Se** 2 мкг/кг/d\n- **Mn, Cr, Fe** — usually omitted в неoнатологии (toxicity risk)\n\n## Cholestasis prevention (PNALD — PN-associated liver disease)\n\n### Risk факторы\n- Prolonged TPN > 14 d\n- Sepsis (особенно CoNS)\n- NEC / SBS\n- Prematurity\n- ELBW\n\n### Стратегии\n- **Trophic feeds** (10-20 мл/кг/d minimal enteral) — early enteral start\n- **SMOFlipid** vs pure intralipid (RCT evidence ↓ PNALD)\n- **Cycling lipids** — break 8-12 ч/d\n- **Avoid sepsis** — bundle care central line\n- **Ursodeoxycholic acid** 10 мг/кг q12h при cholestasis (DB > 2 мг/дл)\n- **Fish oil rescue** (Omegaven) — refractory PNALD\n\n## Monitoring\n\n### Daily\n- Weight, intake/output, glucose, electrolytes\n- Serum BUN, creatinine\n\n### Weekly\n- LFT (AST, ALT, GGT, bilirubin direct + total)\n- Triglycerides (lipid tolerance)\n- Albumin, prealbumin\n- CBC, INR\n\n## Калькуляторы Bordik\n- neo-tpn (ESPGHAN 2018 macronutrient calculator)\n- neo-fluid (жидкость по дням)\n- neo-gir (glucose infusion rate)\n- neo-enteral (advancement protocol)\n- neo-cholestasis-criteria\n\n## Источники\n\n- ESPGHAN/ESPEN/ESPR/CSPEN. **Clin Nutr 2018;37:2306** — PN guidelines\n- ESPGHAN. **JPGN 2022;75:e102** — Updated EN guidelines\n- AAP COFN. **Pediatrics 2024;153:e2023065218** — TPN consensus statement\n- Cochrane: Lipid initiation timing 2020:CD012806\n- Lapillonne A et al. **JPGN 2018;67:419** — SMOFlipid evidence\n- КР МЗ РФ \"Парентеральное питание у новорождённых\" 2024",
        "references": [
            "ESPGHAN. Clin Nutr 2018;37:2306",
            "ESPGHAN. JPGN 2022;75:e102",
            "AAP COFN. Pediatrics 2024;153:e2023065218",
            "Lapillonne A et al. JPGN 2018;67:419",
            "КР МЗ РФ ПП 2024",
        ],
        "related_calculators": ["neo-tpn", "neo-fluid", "neo-gir", "neo-enteral", "neo-cholestasis-criteria"],
    },
    {
        "id": "art-vaccination",
        "title_ru": "Вакцинация недоношенных",
        "title_en": "Vaccination of Preterm Infants",
        "topic": "vaccination",
        "audience": "neonatologist + педиатр",
        "level": "intermediate",
        "summary": "Chronological age (NOT corrected) для большинства. HBV at birth. Палivizumab для high-risk RSV. BCG в РФ для term ≥ 2000 g.",
        "content": "## Базовый принцип\n\nВакцинация недоношенных по **хронологическому возрасту** (от даты рождения), НЕ corrected age. Т.е. preterm рождённый в 28 нед получает первые дозы в 2 мес жизни как и term, в полной dose.\n\n## РФ Национальный календарь (Приказ МЗ РФ № 1122н)\n\n### При рождении (24 ч)\n- **HBV vaccine** — все newborns ≥ 2 кг (preterm — wait until ≥ 2 kg or 30 d)\n- **HepBIG** + HBV vaccine у инфантов matери HBsAg+ (within 12 ч рождения)\n\n### День 3-7\n- **BCG** (или BCG-M for low-weight)\n  - Term ≥ 2000 g — BCG\n  - Preterm с BW 1500-1999 g — BCG-M (reduced dose)\n  - BW < 1500 g или unstable — defer до stable + ≥ 2 kg\n\n### 1 мес\n- **HBV** dose 2 (3 мес от рождения у HBsAg+ matери)\n\n### 2 мес\n- **PCV13** (Превенар)\n- **DTaP** dose 1\n- **Hib** dose 1\n- **IPV** dose 1\n- **Rotavirus (RV)** dose 1 — start ≤ 14 нед 6 d (strict window)\n\n### 4 мес\n- DTaP/Hib/IPV/PCV13/RV dose 2\n\n### 6 мес\n- DTaP/Hib/IPV/PCV13 dose 3\n- HBV dose 3\n- **Influenza** annually starting 6 мес\n\n## US ACIP / CDC differences\n\n- **HBV** birth dose все\n- **PCV13 → PCV15 / PCV20** updates 2023-2024\n- **MMR** at 12-15 мес (NOT in РФ schedule until 1 yr)\n- **Varicella** at 12-15 мес\n\n## Live vaccines у preterm\n\n### Допустимы\n- **BCG** (РФ — yes; US — no, unless TB exposure risk)\n- **MMR / varicella** at 12-15 мес — same chronological age\n- **Rotavirus** (live oral) — start ≤ 14 нед 6 d\n  - Preterm может starty in NICU после ≥ 6 нед\n  - WHO 2017 — safety data adequate для NICU vaccination\n\n### Противопоказаны / defer\n- **Live vaccines** при immunodeficiency (SCID positive)\n- **Yellow fever** — usually defer until ≥ 9 мес\n\n## RSV prophylaxis\n\n### Palivizumab (Synagis) — passive immunization\n- 15 мг/кг IM monthly × 5 doses в RSV season (Oct-Apr в Northern hemisphere)\n- AAP 2014 (Pediatrics 134:e620) — restricted к highest-risk:\n  - Preterm < 29 нед GA + < 1 yr старого\n  - Preterm 29-32 нед GA + < 6 мес старого\n  - BPD на supplemental O₂ ≥ 28 d\n  - Hemodynamically significant CHD\n  - Severe immunodeficiency\n- В РФ — палivizумab включён в Приказ МЗ РФ для тех же категорий\n\n### Nirsevimab (newer — 2023 approval)\n- Single IM dose for all infants\n- Long-acting monoclonal antibody (~150 d half-life)\n- Replacing palivizumab in many countries\n- РФ — pending approval (2024)\n\n## Maternal immunization\n\n### Tdap pertussis booster\n- Каждая беременность 27-36 нед\n- Antibodies к плоду — protect preterm infant до 2 мес дозы\n\n### Influenza (любой триместр)\n- IIV (inactivated only) — safe + recommended\n\n### COVID-19\n- mRNA vaccines — recommended во всех триместрах\n- Maternal antibodies → infant protection\n\n## Калькуляторы Bordik\n- neo-vaccination-calendar (РФ + UZ + Intl 3-region selector)\n- neo-palivizumab-dose\n\n## Источники\n\n- Приказ Минздрава России № 1122н (НКПП 2024)\n- US CDC ACIP Schedule 2024\n- AAP. **Pediatrics 2014;134:e620** — Palivizumab criteria\n- Hammitt LL et al. **NEJM 2022;386:837** — Nirsevimab MELODY trial\n- WHO Position Paper. **Wkly Epidemiol Rec 2017;92:17** — Rotavirus\n- AAP. **Pediatrics 2024;154:e2024066746** — Vaccinе schedule\n- КР МЗ РФ \"Иммунопрофилактика РСВ\" 2023",
        "references": [
            "Приказ МЗ РФ № 1122н",
            "US CDC ACIP 2024",
            "AAP. Pediatrics 2014;134:e620 — Palivizumab",
            "Hammitt LL et al. NEJM 2022;386:837 — MELODY",
            "AAP. Pediatrics 2024;154:e2024066746",
            "КР МЗ РФ РСВ 2023",
        ],
        "related_calculators": ["neo-vaccination-calendar", "neo-palivizumab-dose"],
    },
    {
        "id": "art-bpd-steroids",
        "title_ru": "Постнатальные стероиды для BPD",
        "title_en": "Postnatal Steroids for BPD",
        "topic": "respiratory",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "DART low-dose dexamethasone — для high-BPD-risk preterm vent-dependent > 7-10 d. AAP COFN 2010 framework: ≥ 50 % BPD chance.",
        "content": "## История controversial\n\n1990s-2000s: routine high-dose dexamethasone — dramatic ↓ BPD, но ↑ cerebral palsy + cognitive impairment (Yeh 1998 NEJM, Doyle 2014 review). Practice swung к conservative.\n\n2010+ era: **AAP COFN framework 2010** — selective targeted use в highest-risk infants. **DART trial 2006** — low-dose, short-duration safer alternative.\n\n## AAP COFN 2010 framework\n\nDexamethasone reasonable если:\n- Preterm < 28 нед\n- На MV ≥ 7-14 d\n- Estimated BPD chance ≥ 50 % (используя prediction tools)\n- Discuss benefits/risks с family\n\n## Schemes\n\n### DART (Doyle 2006 NEJM, Pediatrics 2014)\n**Low-dose schedule (preferred):**\n- Day 1-3: 0.075 мг/кг q12h IV (0.15 мг/кг/d)\n- Day 4-6: 0.05 мг/кг q12h (0.10 мг/кг/d)\n- Day 7-8: 0.025 мг/кг q12h (0.05 мг/кг/d)\n- Day 9-10: 0.025 мг/кг q24h (0.025 мг/кг/d)\n- **Total dose:** 0.89 мг/кг over 10 days\n\n### High-dose (HISTORICAL — НЕ recommended)\n- Hydrocortisone 1 мг/кг q6h × 12 d, then taper\n- DEX 0.25 мг/кг q12h × 3 d, then taper × 21 d (старый Yeh protocol)\n\n## Hydrocortisone (alternative — controversial)\n\n### PREMILOC 2016 (Baud O, Lancet 387:1827)\n- 0.5 мг/кг q12h × 7 d → 0.25 мг/кг q12h × 3 d (low-dose)\n- Started early (24-48 h life)\n- ↓ BPD modest (6 % difference)\n- ↑ Late-onset sepsis у some\n\n### Watterberg 2007 (Pediatrics 120:40)\n- Hydrocortisone 1 мг/кг q12h\n- Не показал survival benefit\n\n## Inhaled steroids — separate evidence\n\n### Budesonide (Bassler NEUROSIS 2015 NEJM)\n- 400 мкг inhaled q12h × first month + repeat q6 нед\n- ↓ BPD (relative reduction ~10 %)\n- НО ↑ mortality (concerning) — controversial\n\n### Yeh 2016 (NEJM 374:2229) — intratracheal\n- 0.25 мг/кг intra-tracheal mixed с surfactant\n- Effective ↓ BPD у extreme preterm\n\n## Adverse effects\n\n### Acute (during treatment)\n- Hyperglycemia\n- Hypertension\n- GI bleeding (rare у low-dose)\n- Adrenal suppression — taper required\n- Growth failure\n- Hypertrophic cardiomyopathy (rare у low-dose)\n\n### Late (long-term concerns)\n- Cerebral palsy (high-dose era — ↑ 60 % увеличение risk)\n- Cognitive impairment (high-dose)\n- ↓ Brain growth (head circumference)\n- ↓ Linear growth\n\n**DART low-dose evidence:** acceptable safety profile при targeted use.\n\n## Decision tools\n\nUse BPD prediction calculators (NICHD calculator) — estimate individual risk.\n\nIf BPD risk:\n- < 35 %: avoid steroids (risks > benefits)\n- 35-50 %: individualize\n- ≥ 50 %: discuss with family\n- ≥ 65 %: steroids likely beneficial\n\n## Calculator Bordik\n\n- neo-bpd-nih (BPD severity)\n- neo-dexamethasone-dose (DART scheme)\n- neo-budesonide-dose (Yeh / NEUROSIS)\n- neo-hydrocortisone-dose (PREMILOC)\n\n## Источники\n\n- Doyle LW et al. **NEJM 2006;355:1304** — DART trial\n- Doyle LW et al. **Pediatrics 2014;134:e1567** — DART follow-up\n- Yeh TF et al. **NEJM 1998;338:1006** — high-dose harms\n- Yeh TF et al. **NEJM 2016;374:2229** — intratracheal budesonide\n- Bassler D et al. **NEJM 2015;373:1497** — NEUROSIS budesonide\n- Baud O et al. **Lancet 2016;387:1827** — PREMILOC\n- AAP COFN. **Pediatrics 2010;126:800** — Postnatal steroids framework\n- Cochrane Inhaled corticosteroids 2017:CD002311\n- КР МЗ РФ \"Бронхолёгочная дисплазия\" 2024",
        "references": [
            "Doyle LW et al. NEJM 2006;355:1304 — DART",
            "Doyle LW et al. Pediatrics 2014;134:e1567",
            "Yeh TF et al. NEJM 2016;374:2229",
            "Bassler D et al. NEJM 2015;373:1497 — NEUROSIS",
            "Baud O et al. Lancet 2016;387:1827 — PREMILOC",
            "AAP COFN. Pediatrics 2010;126:800",
            "КР МЗ РФ БЛД 2024",
        ],
        "related_calculators": ["neo-bpd-nih", "neo-dexamethasone-dose", "neo-budesonide-dose", "neo-hydrocortisone-dose"],
    },
    {
        "id": "art-ecmo",
        "title_ru": "ECMO у новорождённых — критерии и practice",
        "title_en": "Neonatal ECMO — Criteria & Practice",
        "topic": "respiratory",
        "audience": "neonatologist",
        "level": "advanced",
        "summary": "OI > 40 + потенциально reversible disease. GA ≥ 34 нед, BW ≥ 2 кг. VA ECMO для PPHN/CDH. VV для primary respiratory failure без cardiac.",
        "content": "## Показания (ELSO 2023 guidelines)\n\n### Включающие\n- **OI > 40** для 4 ч (сохраняется despite optimal therapy + iNO)\n- **OI > 25** для 8 ч в severe MAS / CDH\n- **PaO₂ < 40 мм рт ст** > 2 ч\n- **pH < 7.15** + lactate > 5 ммоль/л > 2 ч (cardiogenic shock)\n- **Failure of pharmacologic therapy** (iNO, sildenafil, milrinone)\n\n### Включающие критерии: gestational + size\n- GA ≥ 34 нед\n- BW ≥ 2 кг\n- Возраст ≤ 14 d (relative — некоторые центры до 28 d)\n\n### Исключающие\n- Lethal congenital anomaly\n- Severe IVH grade III-IV\n- Coagulopathy uncontrollable\n- Trisomy 13/18\n- Severe brain injury\n- > 14 d MV (irreversible lung disease likely)\n- Active uncontrolled bleeding\n\n## Типы ECMO\n\n### VA (veno-arterial)\n- Both circulatory + respiratory support\n- Cannulation: внутренняя ярёмная вена → правое предсердие (drain); правая common carotid artery (return)\n- **Preferred для:** PPHN, MAS severe, CDH, sepsis с cardiogenic shock\n\n### VV (veno-venous)\n- Только respiratory support (cardiac function preserved)\n- Cannulation: dual-lumen IJ catheter (Avalon)\n- **Preferred для:** primary respiratory failure без cardiac dysfunction\n- Преimущества: preserve carotid (no ligation); higher long-term neuro outcomes\n\n## Cannulation практика\n\n- Под general anesthesia\n- Cardiac surgeon involvement preferred\n- Heparin loading 100 ед/кг IV pre-cannulation\n- ACT goal 180-220 sec на ECMO (некоторые centers 160-180)\n\n## Management на ECMO\n\n### Anticoagulation\n- Heparin continuous infusion 20-50 ед/кг/h\n- Monitoring: ACT q4h, PTT q12h, anti-Xa weekly\n- Bivalirudin alternative при HIT (rare у н/р)\n\n### Ventilation \"rest\" settings\n- PEEP 8-10 см H₂O\n- PIP < 25 см H₂O\n- Rate 10-20/min\n- FiO₂ 0.21-0.30 (lung rest)\n- Gentle ventilation prevents barotrauma — recovery\n\n### Sedation + paralysis\n- Continuous fentanyl + midazolam\n- Paralysis (vecuronium / cisatracurium) для extreme labile\n\n### Monitoring\n- Daily heads UZI (IVH detection)\n- Continuous SaO₂ pre/post-oxygenator\n- Лабораторно q4-6h: ABG, electrolytes, ACT, lactate\n- Daily echo (cardiac function recovery)\n\n## Complications\n\n### Bleeding (most common)\n- Intracranial 10-20 %\n- Cannula site\n- GI\n\n### Cannula-related\n- Vascular injury (аорта, IJ vein)\n- Airway compression (rare, large cannulas)\n\n### Stroke / IVH\n- 15-20 % survivors\n- Higher у VA (carotid ligation)\n\n### Сепсис\n- Cannula-related bloodstream infection\n- Antifungal prophylaxis (fluconazole) some centers\n\n## Outcomes (ELSO Registry)\n\n| Cause | Survival к discharge |\n|---|---|\n| **MAS** | 95 % |\n| **PPHN (idiopathic)** | 85 % |\n| **Sepsis** | 75 % |\n| **CDH** | 50-60 % |\n| **Cardiac post-op** | 40-50 % |\n\n**Long-term ND outcomes:** 25-50 % survivors имеют neurodevelopmental impairment (cognitive, motor, hearing).\n\n## ELSO 2023 updates\n\n- Routine cardiac MRI before decannulation\n- Anti-Xa target 0.3-0.7 (instead of just ACT)\n- Bivalirudin для HIT/heparin sensitivity\n- VV preferred when cardiac function permits (long-term carotid preservation)\n\n## Калькуляторы Bordik\n- neo-resp-indices (OI/OSI calculation — gateway к ECMO criteria)\n- neo-ino-dose (pre-ECMO trial)\n- neo-sildenafil-dose\n\n## Источники\n\n- ELSO Guidelines for Neonatal Respiratory Failure 2023\n- Brogan TV (ed.). **ELSO Red Book 6th ed. 2022**\n- UK Collaborative ECMO Trial Group. **Lancet 1996;348:75** — landmark RCT\n- Mahmood B et al. **J Pediatr 2018;199:62** — CDH ECMO outcomes\n- Cochrane Neonatal ECMO 2008:CD001340 — meta-analysis\n- Smartt LF et al. **Pediatr Crit Care Med 2024;25:e218** — VV vs VA neonatal",
        "references": [
            "ELSO Neonatal Respiratory Guidelines 2023",
            "Brogan TV. ELSO Red Book 6th ed. 2022",
            "UK ECMO Trial. Lancet 1996;348:75",
            "Mahmood B et al. J Pediatr 2018;199:62 — CDH",
            "Cochrane Neonatal ECMO 2008:CD001340",
        ],
        "related_calculators": ["neo-resp-indices", "neo-ino-dose", "neo-sildenafil-dose"],
    },
    {
        "id": "art-cdh",
        "title_ru": "Врождённая диафрагмальная грыжа (CDH)",
        "title_en": "Congenital Diaphragmatic Hernia (CDH)",
        "topic": "surgical",
        "audience": "neonatologist + детский хирург",
        "level": "advanced",
        "summary": "Antenatal Dx → стабилизация перед surgery. Gentle ventilation, permissive hypercapnia. iNO + ECMO при PPHN. Repair после стабилизации.",
        "content": "## Определение\n\nCDH — porок развития диафрагмы с migration abdominal organs в thoracic cavity, ведущим к pulmonary hypoplasia + persistent pulmonary hypertension of newborn (PPHN).\n\n## Epidemiology\n\n- 1 / 2500-3000 livebirths\n- Left-sided 80-85 % (Bochdalek hernia)\n- Right-sided 10-15 %\n- Bilateral 1-2 % (lethal)\n\n## Pathophysiology\n\n1. Failure pleuroperitoneal canal закрытия (8-12 нед gestation)\n2. Abdominal viscera (intestines, stomach, spleen, sometimes liver) → thorax\n3. Compression developing lungs → pulmonary hypoplasia (BOTH sides — contralateral эффект)\n4. Aberrant pulmonary vascular development → PPHN\n5. Cardiac displacement (mediastinum shift)\n\n## Antenatal management\n\n### Diagnosis\n- Routine 18-20 нед anatomy УЗИ\n- Visualization stomach в chest, mediastinal shift\n- Confirmation: fetal MRI\n- LHR (Lung-to-Head Ratio) — predictor severity\n  - LHR < 1.0: severe (mortality > 70 %)\n  - LHR 1.0-1.4: moderate\n  - LHR > 1.4: mild\n- O/E LHR (observed/expected) — refined predictor\n\n### Antenatal interventions\n- **FETO (Fetal Endoscopic Tracheal Occlusion)** — TOTAL trial 2021 NEJM\n  - Severe CDH: ↑ survival (40 % vs 15 %)\n  - Risk preterm birth\n- **Counseling** — multidisciplinary (perinatology, neonatology, surgery)\n- **Delivery в специализированном center** с ECMO availability\n\n## Postnatal management — \"gentle approach\"\n\n### Резonimация в родзале\n1. **Avoid bag-mask ventilation** — gas в stomach worsens compression\n2. **Immediate intubation** — orotracheal\n3. **OG decompression** large bore (10-12 Fr)\n4. **Pre-ductal SpO₂** monitoring\n5. **Avoid manual hyperventilation**\n\n### NICU stabilization (gentle ventilation)\n- **Permissive hypercapnia** PaCO₂ 50-60 (pH > 7.25)\n- **Permissive hypoxemia** SpO₂ 85-95 % pre-ductal\n- **PIP < 25** (high baromtrauma risk у hypoplastic lungs)\n- **HFOV** при failure conventional\n- Sedation + paralysis if necessary\n- Surfactant — controversial, limited benefit (NOT routine)\n\n### PPHN management\n- iNO 20 ppm (controversial — NEONIH 2019 показал no benefit у CDH specifically)\n- Sildenafil PO 0.5-2 мг/кг q6h\n- Milrinone 0.25-0.75 мкг/кг/мин\n- ECMO criteria — OI > 40 sustained\n\n### Stabilization criteria до surgery\n- pH > 7.25\n- PaO₂ pre-ductal > 60 мм рт ст\n- Lactate < 4 ммоль/л\n- MAP > 50\n- iNO weaning или off\n- Stable vasopressor support\n- Off ECMO ideally (some centers operate on ECMO)\n\n## Surgical repair\n\n### Timing\n- **Delayed repair** (после стабилизации, 24-72 ч typically) — preferred\n- **Old practice (immediate repair)** — abandoned: high mortality\n\n### Approach\n- **Open thoracotomy** — standard\n- **Open laparotomy** — alternative\n- **Thoracoscopic / minimally invasive** — emerging (selected stable patients, CO₂ insufflation tolerance)\n\n### Repair technique\n- **Primary repair** (small defects ~30 %)\n- **Patch repair** (large defects ~70 %): Gore-Tex / Surgisis / autologous muscle flap\n- Closure stomach ± spleen / left lobe liver reduced into abdomen\n\n## Outcomes (CDH Study Group registry)\n\n| Severity | Survival к discharge |\n|---|---|\n| **Mild** | 90 % |\n| **Moderate** | 70-80 % |\n| **Severe** | 30-50 % |\n| **Severe + ECMO** | 50-65 % |\n\n### Long-term morbidity\n- BPD (chronic O₂ dependence) 20-50 %\n- Pulmonary hypertension persistent 5-15 %\n- GERD 50 % (fundoplication 30 %)\n- Recurrent hernia 5-15 %\n- Neurodevelopmental impairment 15-40 %\n- Failure to thrive 30 %\n- Skeletal anomalies (chest wall, scoliosis)\n\n## Calculator Bordik\n- neo-resp-indices (OI/OSI — ECMO criteria)\n- neo-ino-dose, neo-sildenafil-dose\n\n## Источники\n\n- Deprest JA et al. **NEJM 2021;385:107** — TOTAL FETO trial\n- Snoek KG et al. **Neonatology 2016;110:66** — CDH EURO Consensus\n- Lally KP et al. **J Pediatr Surg 2017;52:734** — CDH Study Group outcomes\n- Hedrick HL. **NeoReviews 2014;15:e480** — CDH review\n- AAP COFN, AAP Surgery Section. **Pediatrics 2008** — CDH guidelines\n- Tracy ET et al. **Ann Thorac Surg 2010;90:1326** — Patch repair outcomes",
        "references": [
            "Deprest JA et al. NEJM 2021;385:107 — TOTAL",
            "Snoek KG et al. Neonatology 2016;110:66 — Euro Consensus",
            "Lally KP et al. J Pediatr Surg 2017;52:734",
            "Hedrick HL. NeoReviews 2014;15:e480",
            "AAP COFN. Pediatrics 2008 — CDH",
        ],
        "related_calculators": ["neo-resp-indices", "neo-ino-dose", "neo-sildenafil-dose"],
    },
    {
        "id": "art-mch",
        "title_ru": "Врождённый гипотиреоз — скрининг и лечение",
        "title_en": "Congenital Hypothyroidism — Screening & Treatment",
        "topic": "endocrine",
        "audience": "neonatologist + педиатр-эндокринолог",
        "level": "intermediate",
        "summary": "TSH screen 24-72 h. Levothyroxine 10-15 мкг/кг/d ASAP при confirmed. Без treatment — irreversible cognitive impairment.",
        "content": "## Эпидемиология\n\n- 1 / 2000-4000 livebirths (range varies — higher в эндемичных йод-deficiency areas)\n- 2:1 female:male\n- Без лечения: severe cognitive impairment, growth failure (cretinism — historical term)\n\n## Этиология\n\n### Permanent (most common)\n- **Thyroid dysgenesis** 75-85 %:\n  - Aplasia / agenesis 33 %\n  - Ectopic (sublingual) 33 %\n  - Hypoplasia 33 %\n- **Dyshormonogenesis** 15-25 %:\n  - TPO defect (most common)\n  - TG defect\n  - Pendred syndrome (PDS gene + sensorineural hearing loss)\n  - DUOX2 / DUOXA2 defects\n\n### Transient (6-15 % cases)\n- Iodine deficiency / excess (maternal)\n- Maternal antithyroid drugs (PTU, methimazole)\n- Maternal blocking antibodies (TBAb)\n- Hereditary TBG abnormalities\n\n### Central (rare, 1-2 %)\n- TSH deficiency (pituitary)\n- TRH deficiency (hypothalamic)\n- Часть panhypopituitarism\n\n## Скрининг\n\n### TSH-based (most common, including РФ + Europe)\n- Sample 24-72 ч жизни (sensitive)\n- TSH > 20 mU/L: presumptive positive\n- Confirm с serum TSH + Free T4\n- Treatment ASAP (до day 14)\n\n### T4-based + reflex TSH (US — partly historical)\n- T4 < 10th percentile → reflex TSH\n- Detects central hypothyroidism\n\n### Cut-offs РФ\n- TSH > 9 mU/L на скрининг → recall\n- > 18 mU/L → urgent confirmation + treatment start\n\n## Confirmation\n\n- Serum TSH + Free T4 + Total T4\n- TSH > 20 mU/L + Free T4 < 12 пмоль/л → CONFIRMED CH\n- Borderline cases — repeat at 1-2 нед или treat empirically\n\n### Аdditional workup\n- Thyroid УЗИ (presence + size + position)\n- Tc-99m / I-123 scan (etiology — if available)\n- TBAb если materinal autoimmune disease\n- Genetic testing (familial cases, dyshormonogenesis suspected)\n\n## Treatment\n\n### Levothyroxine (T4)\n- **Start dose:** 10-15 мкг/кг/d PO once daily\n- **Severe (TSH > 50, Free T4 undetectable):** 15 мкг/кг/d\n- **Moderate (TSH 20-50):** 12 мкг/кг/d\n- **Goal:** **Free T4 в upper-normal range; TSH normalized**\n  - Free T4: 17-23 пмоль/л (1.4-2.3 нг/дл)\n  - TSH < 5 mU/L\n\n### Administration\n- Tablet crushed + small water или breast milk\n- Empty stomach (avoid soy, calcium, iron — interfere absorption)\n- Same time каждый day\n\n### Monitoring\n- TSH + Free T4 в 2 нед after start\n- Every 2 нед × 6 нед\n- Every 1-2 мес × 6 мес\n- Every 3 мес × 1 год\n- Every 6 мес × следующие 1-2 года\n- Every 12 мес thereafter\n\n## Outcomes\n\n### С early treatment (≤ 14 d жизни)\n- IQ normal (compared to siblings)\n- Growth normal\n- Reduced learning disabilities — но subtle deficits в processing speed, math\n\n### Late treatment (> 4 нед)\n- IQ ↓ 5-10 points\n- Learning disabilities\n- Speech / motor delays\n\n### Без treatment\n- Severe cretinism (irreversible cognitive impairment)\n- Growth failure\n- Goiter (только при dyshormonogenesis)\n\n## Re-evaluation после 3 yr\n\n- Если transient suspected (mild, иод-related, materinal antibodies):\n  - Trial of treatment cessation × 4-6 нед\n  - Re-test TSH + Free T4\n  - If normal — confirm transient\n\n## Calculator Bordik\n- neo-levothyroxine-dose\n- neo-newborn-screening (timing)\n\n## Источники\n\n- LaFranchi SH. **J Clin Endocrinol Metab 2011;96:2959** — review\n- AAP / Pediatric Endocrine Society. **Pediatrics 2023;151:e2022060418** — Updated CH guidelines\n- Léger J et al. **J Clin Endocrinol Metab 2014;99:363** — European Society guidelines\n- Selva KA et al. **J Pediatr 2002;141:786** — Initial dose RCT\n- РФ Приказ Минздрава России 2023 — Расширенный неонатальный скрининг (TSH в 36 заболеваниях)\n- van der Sluijs Veer L et al. **Pediatrics 2008;122:e635** — Long-term cognitive outcomes",
        "references": [
            "AAP/Pediatric Endo Soc. Pediatrics 2023;151:e2022060418",
            "LaFranchi SH. J Clin Endocrinol Metab 2011;96:2959",
            "Léger J et al. JCEM 2014;99:363",
            "Selva KA et al. J Pediatr 2002;141:786",
            "Приказ МЗ РФ 2023",
        ],
        "related_calculators": ["neo-levothyroxine-dose", "neo-newborn-screening"],
    },
]


def main() -> int:
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {a["id"] for a in data["articles"]}
    added = []
    for art in NEW_ARTICLES:
        if art["id"] in existing_ids:
            continue
        data["articles"].append(art)
        added.append(art["title_ru"])

    data["version"] = "1.1.0"
    data["lastUpdated"] = "2026-05-09"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Added {len(added)} articles")
    print(f"Total articles now: {len(data['articles'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
