"""
Build /public/neonatal-atlas.json — Таблица 3.Д4.

Curated linkouts to authoritative neonatal image atlases. Каждая запись:
- title (что атлас покрывает)
- description (краткое описание + клинические pearls)
- key_findings (что искать на изображениях)
- source + url (linkout)
- category (skin, x-ray, neuroimaging, ROP, dermatology, etc)
"""
from __future__ import annotations
import json
from pathlib import Path

PATH = Path(r"C:\Users\KDFX Modes\Desktop\bordik-med\public\neonatal-atlas.json")


def atlas(
    aid: str, title_ru: str, title_en: str, description: str,
    key_findings: list[str], source: str, source_type: str, url: str,
    category: str,
) -> dict:
    return {
        "id": aid,
        "title_ru": title_ru,
        "title_en": title_en,
        "description": description,
        "key_findings": key_findings,
        "source": source,
        "source_type": source_type,
        "url": url,
        "category": category,
    }


ATLASES = [
    atlas(
        "atlas-rds-cxr",
        "Рентген-картина РДС",
        "RDS — Chest X-ray patterns",
        "Stage I-IV RDS на рентгенограмме грудной клетки. Прогрессия от мelkозернистой ретикулогранулярности до 'белых лёгких' с air bronchograms.",
        [
            "Stage I — мелкозернистая ретикулогранулярная сетка",
            "Stage II — лёгкая отёчность лёгочной ткани",
            "Stage III — air bronchograms за пределы тени сердца",
            "Stage IV — 'белые лёгкие' (полное обеднение легочного рисунка)",
            "Постsurfactant — частичное прояснение, иногда asymmetric",
        ],
        "Radiopaedia.org / NEJM Image Library",
        "radiopaedia",
        "https://radiopaedia.org/articles/respiratory-distress-syndrome-of-the-newborn",
        "respiratory_imaging",
    ),
    atlas(
        "atlas-mas-cxr",
        "Рентген-картина мекониальной аспирации (MAS)",
        "MAS — Chest X-ray patterns",
        "Mecоnial aspiration syndrome — типичная картина: грубые двусторонние инфильтраты + гиперинфляция + нередко пневмоторакс.",
        [
            "Грубые двусторонние коарсные инфильтраты ('cottonwool')",
            "Гиперинфляция (плоская диафрагма, расширенные межреберья)",
            "Возможный пневмоторакс (одно- или двусторонний)",
            "Areas of atelectasis вместе с hyperinflation (mosaic pattern)",
        ],
        "Radiopaedia.org",
        "radiopaedia",
        "https://radiopaedia.org/articles/meconium-aspiration-syndrome",
        "respiratory_imaging",
    ),
    atlas(
        "atlas-pneumothorax-cxr",
        "Пневмоторакс новорождённого — рентген + transillumination",
        "Neonatal pneumothorax — X-ray + transillumination",
        "Признаки пневмоторакса: гиперлюцентность, отсутствие легочного рисунка, contralateral mediastinal shift. Bedside transillumination — quick diagnosis.",
        [
            "Гиперлюцентность affected side",
            "Отсутствие vascular markings",
            "Contralateral mediastinal shift (tension)",
            "Деформация диафрагмы (uplift при тension)",
            "Transillumination — bright glow на side пневмоторакса",
        ],
        "Radiopaedia / AAP COFN",
        "radiopaedia",
        "https://radiopaedia.org/articles/neonatal-pneumothorax",
        "respiratory_imaging",
    ),
    atlas(
        "atlas-nec-cxr",
        "НЭК — рентген-признаки (pneumatosis, портальный газ)",
        "NEC — X-ray findings (pneumatosis, portal venous gas)",
        "Bell stage IIA+ диагностируется по pneumatosis intestinalis. Stage IIIB — pneumoperitoneum (перфорация). Портальный газ — позднее тяжёлое.",
        [
            "Pneumatosis intestinalis — circular / linear lucencies в стенке кишки",
            "Dilated bowel loops (часто asymmetric, fixed loop)",
            "Pneumoperitoneum (perforation) — football sign, Rigler's sign, falciform ligament visible",
            "Портальный венозный газ — branching lucencies в печени",
            "Free fluid — ascites компонент",
        ],
        "Radiopaedia.org",
        "radiopaedia",
        "https://radiopaedia.org/articles/necrotising-enterocolitis-1",
        "abdominal_imaging",
    ),
    atlas(
        "atlas-bpd-cxr",
        "БЛД — рентген-эволюция",
        "BPD — Chest X-ray evolution",
        "Эволюция BPD от ранней (interstitial) до classical (cystic-bullous) и атипичной (homogeneous opacities).",
        [
            "Ранняя BPD — diffuse haziness, retained interstitial fluid",
            "Classic BPD — cystic-bullous + linear streaks ('lung scar')",
            "Atypical / new BPD — homogeneous haziness, less cystic",
            "Cardiomegaly если cor pulmonale",
            "Атмосферность местами + cтриктуры trachea/bronchus при tracheomalacia",
        ],
        "Radiopaedia / NEJM",
        "radiopaedia",
        "https://radiopaedia.org/articles/bronchopulmonary-dysplasia",
        "respiratory_imaging",
    ),
    atlas(
        "atlas-ivh-us",
        "ВЖК — нейросонография классификация Папиле",
        "IVH — neurosonography Papile classification",
        "Внутрижелудочковые кровоизлияния по Papile. УЗИ через большой родничок — gold standard у preterm <32 нед.",
        [
            "Grade I — субэпендимальное (germinal matrix), не выходит за желудочки",
            "Grade II — внутрижелудочковое без расширения",
            "Grade III — внутрижелудочковое с расширением (≥50% желудочка заполнен кровью)",
            "Grade IV — паренхиматозный геморрагический инфаркт (raceme — venous origin)",
            "Кистозная ПВЛ — последствие, развивается через 2-3 нед",
        ],
        "Radiopaedia.org",
        "radiopaedia",
        "https://radiopaedia.org/articles/germinal-matrix-haemorrhage-grading",
        "neuroimaging",
    ),
    atlas(
        "atlas-pvl-mri",
        "ПВЛ — МРТ-картина (de Vries classification)",
        "PVL — MRI patterns (de Vries classification)",
        "Перивентрикулярная лейкомаляция на MRI — четыре степени по de Vries. Ассоциирована с ДЦП у preterm.",
        [
            "Grade I — транзиторная perivenular hyperechogenicity ≥7 дней (обычно USG)",
            "Grade II — кистозная ПВЛ локальная (1-2 кисты)",
            "Grade III — многокистозная ПВЛ",
            "Grade IV — подкорковая лейкомаляция (тяжёлая, severe ДЦП risk)",
            "Поздняя картина: вентрикуломегалия + thinning corpus callosum + reduced white matter",
        ],
        "Radiopaedia / NEJM Imaging",
        "radiopaedia",
        "https://radiopaedia.org/articles/periventricular-leukomalacia",
        "neuroimaging",
    ),
    atlas(
        "atlas-hie-mri",
        "ХИЭ — МРТ-карта поражения",
        "HIE — MRI pattern (basal ganglia / watershed)",
        "Двa main pattern injury: (1) basal ganglia/thalamic — асфиксия терминальная, тяжёлая; (2) watershed — partial prolonged. DWI peak day 3-7.",
        [
            "Basal ganglia / thalamic injury — putamen, ventrolateral thalamus, posterior limb internal capsule (PLIC) — termal asphyxia",
            "Watershed injury — parasagittal cortex + subcortical WM — partial prolonged",
            "DWI peak day 3-7 (sensitive); T2 changes день 5-10",
            "Loss of normal high-signal в PLIC — strong predictor adverse outcome",
            "Severe HIE: combined basal ganglia + cortical injury",
        ],
        "Radiopaedia / NICHD",
        "radiopaedia",
        "https://radiopaedia.org/articles/hypoxic-ischaemic-encephalopathy-neonate",
        "neuroimaging",
    ),
    atlas(
        "atlas-jaundice-kramer",
        "Желтуха — шкала Крамера (визуальная оценка)",
        "Jaundice — Kramer scale (visual assessment)",
        "Визуальная progression of jaundice по зонам Крамера, корреляция с ориентировочной TSB. Не замена лабораторного TSB но useful для screening.",
        [
            "Zone 1 — голова, шея — TSB ~85 µmol/L (5 mg/dL)",
            "Zone 2 — до пупка — TSB ~170 µmol/L (10 mg/dL)",
            "Zone 3 — до коленей — TSB ~200-255 µmol/L (12-15 mg/dL)",
            "Zone 4 — до лодыжек — TSB ~255-340 µmol/L (15-20 mg/dL)",
            "Zone 5 — ладони, стопы — TSB >340 µmol/L (>20 mg/dL)",
        ],
        "WHO Pocket Book / NICE CG98",
        "who_official",
        "https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/newborn-health",
        "skin",
    ),
    atlas(
        "atlas-cyanosis-types",
        "Цианоз — типы (центральный vs периферический)",
        "Cyanosis types — central vs peripheral",
        "Различение central (cyanotic CHD, severe lung disease) vs peripheral cyanosis (acrocyanosis — physiologic у newborn в первые 24-48 ч). Tongue/oral mucosa — best для central cyanosis assessment.",
        [
            "Central cyanosis — губы, язык, oral mucosa, generalised — pathologic",
            "Peripheral cyanosis (acrocyanosis) — только конечности, лицо normal — обычно physiologic newborn",
            "Differential cyanosis — pre-ductal pink, post-ductal cyanotic = right-to-left PDA shunt (PPHN, coarctation)",
            "Reverse differential — foot pink, RH cyanotic = TGA + PPHN (pathognomonic)",
        ],
        "Stanford Medicine 25",
        "stanford",
        "https://stanfordmedicine25.stanford.edu/the25/cyanosis.html",
        "skin",
    ),
    atlas(
        "atlas-rop-stages",
        "ROP — стадии по ICROP3 (2021)",
        "ROP — ICROP3 staging (2021)",
        "Pictorial atlas of ROP stages: demarcation line, ridge, ridge с extraretinal proliferation, partial / total RD. Plus disease — ключевой treatment indicator.",
        [
            "Stage 1 — demarcation line (white avascular ↔ vascular border)",
            "Stage 2 — ridge (3D elevation)",
            "Stage 3 — extraretinal fibrovascular proliferation (most common requires treatment)",
            "Stage 4A — partial RD (extrafoveal); 4B — partial RD (foveal involvement)",
            "Stage 5 — total RD",
            "Plus disease — dilated tortuous posterior pole vessels — major treatment criterion",
            "A-ROP (former AP-ROP) — rapid posterior pole без classical demarcation, ELBW",
        ],
        "International Classification of ROP (ICROP3)",
        "icrop",
        "https://www.aao.org/eye-health/diseases/retinopathy-prematurity-rop-treatment",
        "ROP",
    ),
    atlas(
        "atlas-skin-conditions",
        "Кожные condition новорождённых",
        "Newborn skin conditions atlas",
        "Common newborn skin findings: erythema toxicum, transient neonatal pustular melanosis, milia, mongolian spots, vernix caseosa, lanugo. Differentiation от patologic conditions.",
        [
            "Erythema toxicum — yellow-white pustules с erythematous halo, 24-72 ч жизни, self-resolving",
            "Transient neonatal pustular melanosis — pustules → hyperpigmented macules, частоactin AA infants",
            "Milia — small white papules на nose/cheeks, retained sebaceous material, self-resolving",
            "Mongolian spots — blue-grey patches на back/buttocks, particularly Asian/AA",
            "Vernix caseosa — white waxy coating, decrease с GA",
            "Lanugo — fine hair, more prominent с lower GA",
        ],
        "Visual DX / NEJM",
        "nejm",
        "https://www.nejm.org/doi/full/10.1056/NEJMra1700351",
        "skin",
    ),
    atlas(
        "atlas-congenital-anomalies",
        "Очевидные врождённые аномалии при осмотре",
        "Visible congenital anomalies on examination",
        "Atlas of cardiologically-relevant анomalies + craniofacial + limb anomalies, identifiable на newborn examination.",
        [
            "Cleft lip ± palate — visible on examination",
            "Imperforate anus — careful perineal exam",
            "Polydactyly / syndactyly — extremity examination",
            "Talipes equinovarus (clubfoot)",
            "Hip dysplasia — Ortolani / Barlow тесты",
            "Spina bifida occulta — sacral pit, hair tuft, dimple",
            "Down syndrome facial features — flat nasal bridge, upslanting palpebral fissures, simian crease",
            "Diaphragmatic hernia — scaphoid abdomen + heart sounds shifted right (left CDH)",
        ],
        "Radiopaedia / Stanford",
        "stanford",
        "https://stanfordmedicine25.stanford.edu/the25/newbornExam.html",
        "examination",
    ),
    atlas(
        "atlas-umbilical-anomalies",
        "Пуповинные аномалии",
        "Umbilical cord anomalies",
        "Single umbilical artery (SUA), velamentous cord insertion, cord knots, omphalitis. SUA — flag для consider renal/cardiac evaluation.",
        [
            "Single umbilical artery (1 артерия + 1 вена вместо normal 2+1) — 0.5-1% pregnancies, ассоциирована с anomalies",
            "Velamentous cord insertion — vessels traverse membranes без protective Wharton's jelly — rupture risk",
            "True knot — обычно benign но monitor for compromise",
            "Omphalitis — periumbilical erythema, induration — STAT antibiotics + admission",
            "Patent urachus / omphalomesenteric duct remnant — persistent discharge",
        ],
        "Radiopaedia / AAP",
        "radiopaedia",
        "https://radiopaedia.org/articles/single-umbilical-artery",
        "examination",
    ),
    atlas(
        "atlas-resp-distress-signs",
        "Респираторный дистресс — клинические признаки",
        "Respiratory distress signs",
        "Visual + auscultation findings: tachypnea, retractions (suprasternal/intercostal/subcostal), grunting, nasal flaring, head bobbing.",
        [
            "Tachypnea — RR >60/min sustained",
            "Subcostal retractions — soft tissue indrawing under ribs",
            "Intercostal retractions — between ribs",
            "Suprasternal retractions — above sternum (severe)",
            "Sternal retractions — sternum sinks",
            "Grunting — expiratory closure glottis (creates auto-PEEP)",
            "Nasal flaring — alar dilation с inspiration",
            "Head bobbing — accessory muscle use в neck (severe)",
            "Silverman score — quantifies severity 0-10",
        ],
        "Stanford Medicine 25 / WHO",
        "stanford",
        "https://stanfordmedicine25.stanford.edu/the25/newbornExam.html",
        "examination",
    ),
    atlas(
        "atlas-x-ray-positioning",
        "Правильное positioning ETT и UVC/UAC на рентгене",
        "Proper ETT and UVC/UAC positioning on X-ray",
        "Standard positioning verification на post-procedure CXR. ETT tip Т1-Т3 (mid-trachea, выше carina). UVC tip T9-T10 (IVC выше диафрагмы). UAC высокая позиция T6-T9.",
        [
            "ETT — between T1 and T3, выше carina (carina на T4)",
            "Если ETT в right main bronchus → pull back 0.5-1 см",
            "UVC tip — T9-T10 (IVC выше диафрагмы)",
            "UVC слишком low (через ductus venosus в portal vein) — pull back",
            "UVC слишком high (right atrium) — pull back на 1-2 см",
            "UAC высокая позиция — T6-T9 (выше celiac, ниже левой подключичной)",
            "UAC низкая позиция — L3-L4 (между L1 renal artery и L4 inferior mesenteric)",
        ],
        "Radiopaedia / AAP COFN",
        "radiopaedia",
        "https://radiopaedia.org/articles/umbilical-line-positioning",
        "vascular_imaging",
    ),
]


def main() -> None:
    bank = {
        "version": "1.0.0",
        "lastUpdated": "2026-05-10",
        "source": "Bordik Med — curated image atlas linkouts (audit Table 3.Д4)",
        "license": "External linkouts to authoritative atlas sources (Radiopaedia CC BY, AAP, WHO, NEJM, Stanford). Не размещаем embedded изображения — только pointers.",
        "categories": [
            {"id": "respiratory_imaging", "title_ru": "Лёгкие — визуализация"},
            {"id": "abdominal_imaging",   "title_ru": "Живот — визуализация"},
            {"id": "neuroimaging",        "title_ru": "Нейровизуализация"},
            {"id": "vascular_imaging",    "title_ru": "Сосуды / catheters"},
            {"id": "skin",                "title_ru": "Кожа"},
            {"id": "ROP",                 "title_ru": "ROP"},
            {"id": "examination",         "title_ru": "Клинический осмотр"},
        ],
        "atlas": ATLASES,
    }
    PATH.write_text(json.dumps(bank, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(ATLASES)} atlas entries to {PATH.name}")


if __name__ == "__main__":
    main()
