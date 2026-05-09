"""Add imaging modalities groups to public/neonatal-lab-norms.json.

Audit Г8 — closes imaging reference tables gap. Adds 4 imaging groups:
  - cranial_us: УЗИ ГМ normal measurements
  - chest_xray: R-ОГК normal findings
  - echocardiography: ЭХО неонатальное normals
  - abdominal_us: УЗИ брюшной полости normal
"""
import json
import sys
from pathlib import Path

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
JSON_PATH = ROOT / "public" / "neonatal-lab-norms.json"

NEW_GROUPS = [
    {
        "id": "cranial_us",
        "title_ru": "УЗИ головного мозга (cranial US)",
        "title_en": "Cranial Ultrasound",
        "values": [
            {
                "name_ru": "Передний рог бокового желудочка (anterior horn width)",
                "name_en": "Anterior horn width (AHW)",
                "term": "< 3 мм",
                "preterm": "< 4 мм",
                "unit": "мм",
                "notes": "AHW > 6 мм — risk PHVD (Brouwer 2010); ELVIS triggers > 6 мм + AVI > 97th"
            },
            {
                "name_ru": "Ventricular index (VI) (Levene)",
                "name_en": "Ventricular Index (Levene)",
                "term": "8-14 мм",
                "preterm": "8-14 мм",
                "unit": "мм",
                "notes": "Levene 1981; > 4 мм above 97th percentile = ventriculomegaly"
            },
            {
                "name_ru": "Толщина коры головного мозга",
                "name_en": "Cortical thickness",
                "term": "2-4 мм",
                "preterm": "1.5-3.5 мм",
                "unit": "мм",
                "notes": "Зависит от GA + PMA"
            },
            {
                "name_ru": "Большая цистерна (cisterna magna)",
                "name_en": "Cisterna magna",
                "term": "< 8 мм",
                "preterm": "< 8 мм",
                "unit": "мм",
                "notes": "> 10 мм — Dandy-Walker spectrum"
            },
            {
                "name_ru": "Pulsatility index ACA (Doppler)",
                "name_en": "ACA pulsatility index (Doppler)",
                "term": "0.6-0.8",
                "preterm": "0.55-0.85",
                "unit": "—",
                "notes": "↓ PI < 0.55 — vasodilation (HIE, sepsis); ↑ PI > 0.9 — high resistance / IVH risk"
            },
            {
                "name_ru": "Resistive index ACA",
                "name_en": "ACA resistive index",
                "term": "0.65-0.75",
                "preterm": "0.65-0.85",
                "unit": "—",
                "notes": "RI < 0.55 после asphyxia — predictive HIE poor outcome (Archer 1986)"
            },
            {
                "name_ru": "Subependymal cyst (если присутствуют)",
                "name_en": "Subependymal cyst",
                "term": "< 3 мм диаметр",
                "preterm": "Variable — обычно benign",
                "unit": "мм",
                "notes": "Обычно benign; > 3 мм или persistent — TORCH workup"
            }
        ]
    },
    {
        "id": "chest_xray",
        "title_ru": "Rentgen грудной клетки (CXR)",
        "title_en": "Chest X-ray",
        "values": [
            {
                "name_ru": "ETT кончик positioning",
                "name_en": "ETT tip position",
                "term": "T1-T2 (above carina ~ 1-2 cm)",
                "preterm": "T1-T2",
                "unit": "уровень позвонка",
                "notes": "Carina T3-T4. ETT внутрь R main bronchus → atelectasis; чрезмерно высоко → exta tubation risk"
            },
            {
                "name_ru": "UVC (umbilical venous catheter)",
                "name_en": "UVC tip position",
                "term": "T9-T10 (above diaphragm IVC/RA junction)",
                "preterm": "T9-T10",
                "unit": "уровень позвонка",
                "notes": "Above diaphragm preferred; в liver — risk hepatic necrosis при гиперосмолярных fluids"
            },
            {
                "name_ru": "UAC (umbilical arterial catheter)",
                "name_en": "UAC tip position",
                "term": "High: T6-T9 ИЛИ Low: L3-L4",
                "preterm": "High: T6-T9",
                "unit": "уровень позвонка",
                "notes": "High preferred (Cochrane 2010); avoid T11-L2 (renal/celiac arteries)"
            },
            {
                "name_ru": "Cardiothoracic ratio",
                "name_en": "Cardiothoracic ratio",
                "term": "0.55-0.60",
                "preterm": "0.55-0.65",
                "unit": "—",
                "notes": "Преtermin slightly higher; > 0.65 — cardiomegaly (PDA HSPDA, CHD)"
            },
            {
                "name_ru": "Lung volume (по T8 expansion)",
                "name_en": "Lung volume",
                "term": "9-10 ribs anterior",
                "preterm": "8-9 ribs",
                "unit": "ребра",
                "notes": "Hyperexpansion (> 10) — air trapping (MAS, PIE); hypoexpansion — RDS, atelectasis"
            },
            {
                "name_ru": "RDS findings",
                "name_en": "RDS X-ray findings",
                "term": "—",
                "preterm": "Reticulogranular pattern, air bronchograms, белая лёгкая",
                "unit": "качественно",
                "notes": "4 степени I-IV (см. neo-rds-class)"
            },
            {
                "name_ru": "MAS findings",
                "name_en": "MAS X-ray findings",
                "term": "Coarse irregular opacities + hyperinflation",
                "preterm": "—",
                "unit": "качественно",
                "notes": "MAS у post-term / late preterm; ball-valve effect → air leak"
            },
            {
                "name_ru": "Pneumothorax",
                "name_en": "Pneumothorax",
                "term": "Loss vascular markings; lung edge",
                "preterm": "Same",
                "unit": "качественно",
                "notes": "Tension PT — mediastinal shift contralateral; transillumination + → confirm"
            }
        ]
    },
    {
        "id": "echocardiography",
        "title_ru": "Эхокардиография (ECHO) — нормы neonatal",
        "title_en": "Echocardiography — Neonatal Norms",
        "values": [
            {
                "name_ru": "LV ejection fraction (LVEF)",
                "name_en": "LV ejection fraction",
                "term": "60-75 %",
                "preterm": "55-75 %",
                "unit": "%",
                "notes": "< 50 % — LV dysfunction (HIE, sepsis, septic cardiomyopathy)"
            },
            {
                "name_ru": "TAPSE (tricuspid annular plane systolic excursion)",
                "name_en": "TAPSE",
                "term": "8-12 мм (зависит от GA)",
                "preterm": "5-9 мм",
                "unit": "мм",
                "notes": "Маркер RV function; TAPSE < age-adjusted 5th percentile = RV dysfunction"
            },
            {
                "name_ru": "PA pressure (estimated по TR jet)",
                "name_en": "PA pressure (TR jet)",
                "term": "< 35 мм рт ст после 24 ч",
                "preterm": "< 35 мм рт ст",
                "unit": "мм рт ст",
                "notes": "PPHN: > 35 mmHg или > 2/3 systemic"
            },
            {
                "name_ru": "PDA diameter (день 1-3)",
                "name_en": "PDA diameter",
                "term": "< 1.5 мм",
                "preterm": "Variable; > 1.5 мм - HSPDA risk",
                "unit": "мм",
                "notes": "HSPDA: > 1.4 mm/kg + LA:Ao > 1.5 + reverse diastolic flow в descending aorta"
            },
            {
                "name_ru": "LA:Ao ratio",
                "name_en": "LA:Ao ratio",
                "term": "< 1.5",
                "preterm": "< 1.5",
                "unit": "—",
                "notes": "> 1.5 — significant L-to-R shunt (HSPDA, VSD)"
            },
            {
                "name_ru": "Foramen ovale flow",
                "name_en": "PFO flow",
                "term": "Left-to-right (normal первые недели)",
                "preterm": "Same",
                "unit": "качественно",
                "notes": "Bidirectional или R-to-L shunt — PPHN evidence"
            },
            {
                "name_ru": "Aortic root diameter",
                "name_en": "Aortic root diameter",
                "term": "8-12 мм (term)",
                "preterm": "5-10 мм",
                "unit": "мм",
                "notes": "Z-score < -2 — aortic stenosis или hypoplasia"
            },
            {
                "name_ru": "Mitral valve E:A ratio",
                "name_en": "Mitral E:A ratio",
                "term": "< 1.0 первые дни (reverses к 1+)",
                "preterm": "Similar pattern",
                "unit": "—",
                "notes": "Diastolic function maturation"
            }
        ]
    },
    {
        "id": "abdominal_us",
        "title_ru": "УЗИ брюшной полости",
        "title_en": "Abdominal Ultrasound",
        "values": [
            {
                "name_ru": "Печень — длина (правая доля)",
                "name_en": "Liver length (right lobe)",
                "term": "5.0-7.5 см",
                "preterm": "4.0-6.0 см",
                "unit": "см",
                "notes": "Hepatomegaly: > 8 см term; Etiology: TORCH, IEM, hemolysis, CHD, sepsis"
            },
            {
                "name_ru": "Селезёнка — длина",
                "name_en": "Spleen length",
                "term": "3.0-4.5 см",
                "preterm": "2.5-3.5 см",
                "unit": "см",
                "notes": "Splenomegaly: > 5 см term; TORCH, hemolysis, sepsis"
            },
            {
                "name_ru": "Почки — длина (right + left)",
                "name_en": "Kidney length",
                "term": "4.0-5.0 см",
                "preterm": "2.5-4.0 см (зависит от GA)",
                "unit": "см",
                "notes": "Cattaneo-D'Antonio nomograms по GA + PMA"
            },
            {
                "name_ru": "Pelvic dilation (anterior-posterior)",
                "name_en": "Renal pelvis AP diameter",
                "term": "< 4 мм (1-й day) / < 7 мм (постнатально)",
                "preterm": "Same",
                "unit": "мм",
                "notes": "> 7 мм после 48 ч — hydronephrosis SFU grading 1-4"
            },
            {
                "name_ru": "Bowel wall thickness",
                "name_en": "Bowel wall thickness",
                "term": "< 2.5 мм",
                "preterm": "< 2.5 мм",
                "unit": "мм",
                "notes": "> 3 мм — NEC; portal venous gas — severe NEC sign"
            },
            {
                "name_ru": "Гематокрит для partial exchange (polycythemia)",
                "name_en": "HCT polycythemia threshold",
                "term": "Symptomatic HCT > 65 % venous",
                "preterm": "Same",
                "unit": "%",
                "notes": "Capillary HCT > 70 % — confirm с venous; partial exchange при > 65 % + симптомах"
            }
        ]
    },
    {
        "id": "neuro_imaging_mri",
        "title_ru": "MRI головного мозга — postnatal nomograms",
        "title_en": "Brain MRI — Postnatal Norms",
        "values": [
            {
                "name_ru": "Brain weight (estimated)",
                "name_en": "Brain weight",
                "term": "350-400 г",
                "preterm": "200-300 г (по GA)",
                "unit": "г",
                "notes": "Birth: 25 % adult brain weight; achieved adult weight ~6 yr"
            },
            {
                "name_ru": "Cortical gyration / sulcation",
                "name_en": "Cortical gyration",
                "term": "Полностью развита tertiary gyrus",
                "preterm": "Variable — primary at 24-26 нед, secondary 28-32 нед, tertiary > 36 нед",
                "unit": "качественно",
                "notes": "Smoothness > expected GA — lissencephaly, pachygyria"
            },
            {
                "name_ru": "Myelination (T2 hypointensity)",
                "name_en": "Myelination (T2 dark)",
                "term": "PLIC + corona radiata visible",
                "preterm": "Очень limited preterm",
                "unit": "качественно",
                "notes": "PLIC absence — predictive of motor impairment in HIE (Rutherford 2010)"
            },
            {
                "name_ru": "Basal ganglia / thalami T1/T2",
                "name_en": "Basal ganglia/thalami signal",
                "term": "Symmetric isointense к gray matter",
                "preterm": "Same",
                "unit": "качественно",
                "notes": "Bilateral hyperintensity на DWI — severe HIE (cortical-deep gray matter pattern)"
            },
            {
                "name_ru": "Watershed zones T2",
                "name_en": "Watershed zones",
                "term": "No abnormality normally",
                "preterm": "Same",
                "unit": "качественно",
                "notes": "Watershed pattern на DWI — partial prolonged HIE"
            },
            {
                "name_ru": "Corpus callosum thickness (genu)",
                "name_en": "Corpus callosum (genu)",
                "term": "2-3 мм",
                "preterm": "1.5-2.5 мм",
                "unit": "мм",
                "notes": "Hypoplasia / agenesis — chromosomal anomaly, midline malformation"
            }
        ]
    }
]


def main() -> int:
    with JSON_PATH.open(encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {g["id"] for g in data["groups"]}
    added = 0
    for grp in NEW_GROUPS:
        if grp["id"] in existing_ids:
            continue
        data["groups"].append(grp)
        added += 1

    data["version"] = "1.1.0"
    data["lastUpdated"] = "2026-05-09"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    total_values = sum(len(g["values"]) for g in data["groups"])
    print(f"Added {added} groups. Total: {len(data['groups'])} groups, {total_values} values.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
