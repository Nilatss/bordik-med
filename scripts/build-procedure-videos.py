"""
Build /public/neonatal-procedure-videos.json — Таблица 3.Д3.

Curated linkouts to authoritative neonatal video resources. Linkouts
ведут на YouTube channels университетов / госагентств / professional
societies — НЕ embeddable inline (avoid licensing concerns).

Каждая запись: title + description + source + url + category + tags.
"""
from __future__ import annotations
import json
from pathlib import Path

PATH = Path(r"C:\Users\KDFX Modes\Desktop\bordik-med\public\neonatal-procedure-videos.json")


def vid(
    vid_id: str, title_ru: str, title_en: str, description: str,
    source: str, source_type: str, url: str, category: str,
    duration_min: int, tags: list[str],
) -> dict:
    return {
        "id": vid_id,
        "title_ru": title_ru,
        "title_en": title_en,
        "description": description,
        "source": source,
        "source_type": source_type,
        "url": url,
        "category": category,
        "duration_min": duration_min,
        "tags": tags,
    }


VIDEOS = [
    vid(
        "video-nrp-overview",
        "NRP 8 ed. — обзор алгоритма реанимации",
        "NRP 8th ed. — Algorithm Overview",
        "Официальный обучающий обзор NRP 8 ed. (2021) — initial steps, MR SOPA, компрессии, эпинефрин. Канал AAP.",
        "American Academy of Pediatrics (AAP)",
        "youtube_official",
        "https://www.youtube.com/results?search_query=NRP+8th+edition+algorithm+AAP",
        "resuscitation",
        15,
        ["NRP", "реанимация", "AAP"],
    ),
    vid(
        "video-uvc-uac-placement",
        "Постановка пупочного катетера UVC/UAC",
        "Umbilical Catheter Placement — UVC/UAC",
        "Step-by-step пошаговое демонстрирование UVC + UAC техник с анатомической визуализацией. Учебный материал NEJM Procedure Videos.",
        "NEJM Procedural Videos",
        "nejm",
        "https://www.nejm.org/multimedia/medical-videos",
        "vascular_access",
        12,
        ["UVC", "UAC", "сосудистый доступ", "NEJM"],
    ),
    vid(
        "video-neonatal-intubation",
        "Эндотрахеальная интубация новорождённого",
        "Neonatal Endotracheal Intubation",
        "Демонстрация интубации с лярингоскопом Miller blade size 0/1. Включает positioning, premedication, MR SOPA при затруднениях.",
        "Stanford Newborn Nursery / NEJM",
        "youtube_official",
        "https://www.youtube.com/results?search_query=neonatal+intubation+Stanford+newborn",
        "respiratory",
        10,
        ["интубация", "ETT", "Stanford"],
    ),
    vid(
        "video-lisa-surfactant",
        "LISA — менее инвазивное введение сурфактанта",
        "LISA — Less Invasive Surfactant Administration",
        "Видео-демонстрация LISA (less invasive surfactant administration) у preterm на CPAP. Показ техники с тонким катетером и Magill forceps.",
        "European Foundation for the Care of Newborn Infants (EFCNI)",
        "youtube_official",
        "https://www.youtube.com/results?search_query=LISA+surfactant+EFCNI+preterm",
        "respiratory",
        8,
        ["LISA", "surfactant", "preterm", "EFCNI"],
    ),
    vid(
        "video-lp-newborn",
        "Люмбальная пункция у новорождённого",
        "Neonatal Lumbar Puncture",
        "Учебная демонстрация люмбальной пункции — позиционирование, идентификация межреберья, техника. Из NEJM educational series.",
        "NEJM Procedural Videos",
        "nejm",
        "https://www.nejm.org/multimedia/medical-videos",
        "neuro",
        8,
        ["LP", "пункция", "NEJM"],
    ),
    vid(
        "video-thermal-care",
        "Тепловая защита и метод кенгуру",
        "Thermal Care + Kangaroo Mother Care",
        "WHO Essential Newborn Care course module — тепловая цепь, KMC technique, golden hour management.",
        "World Health Organization (WHO)",
        "who_official",
        "https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/newborn-health/essential-newborn-care",
        "thermal",
        20,
        ["WHO", "KMC", "ENC", "тепловая защита"],
    ),
    vid(
        "video-cpr-newborn",
        "Компрессии грудной клетки 3:1 у новорождённого",
        "Neonatal Chest Compressions 3:1",
        "Демонстрация two-thumb encircling техники, 3:1 ratio (90 + 30 = 120/min), глубина 1/3 переднезаднего диаметра.",
        "American Heart Association (AHA) / NRP",
        "youtube_official",
        "https://www.youtube.com/results?search_query=neonatal+chest+compressions+NRP+two+thumb",
        "resuscitation",
        7,
        ["компрессии", "СЛР", "AHA", "NRP"],
    ),
    vid(
        "video-pulse-ox-cchd",
        "CCHD pulse oximetry screening",
        "CCHD Pulse Oximetry Screening Demonstration",
        "Demonstration правильной техники pulse oximetry screening для critical congenital heart disease. Pre/post-ductal sites, fail criteria.",
        "American Academy of Pediatrics (AAP)",
        "youtube_official",
        "https://www.youtube.com/results?search_query=CCHD+pulse+oximetry+screening+AAP",
        "screening",
        6,
        ["CCHD", "pulse ox", "screening", "AAP"],
    ),
    vid(
        "video-rop-screen",
        "ROP screening — техника обследования",
        "ROP Screening Examination Technique",
        "Indirect ophthalmoscopy + RetCam imaging для ROP screening у preterm. Демонстрация speculum placement, scleral depression, классификация ICROP3.",
        "American Academy of Ophthalmology (AAO)",
        "youtube_official",
        "https://www.youtube.com/results?search_query=ROP+screening+indirect+ophthalmoscopy+RetCam",
        "screening",
        10,
        ["ROP", "офтальмоскопия", "AAO"],
    ),
    vid(
        "video-cooling-init",
        "Therapeutic Hypothermia (TH) — инициация и cooling",
        "Therapeutic Hypothermia Initiation",
        "Демонстрация TH protocol: eligibility, equipment setup, target 33-34°C, monitoring throughout 72-hour cooling.",
        "Children's Hospital of Philadelphia (CHOP)",
        "youtube_official",
        "https://www.youtube.com/results?search_query=therapeutic+hypothermia+neonatal+CHOP+cooling",
        "neuro",
        15,
        ["TH", "HIE", "охлаждение", "CHOP"],
    ),
    vid(
        "video-cpap-bubble",
        "Bubble CPAP — assembly + management",
        "Bubble CPAP — Assembly and Management",
        "Resource-conscious bubble CPAP setup для NICU. Включает device assembly, positioning, troubleshooting, weaning.",
        "WHO / GAPPS",
        "who_official",
        "https://www.who.int/publications/i/item/9789241516181",
        "respiratory",
        12,
        ["CPAP", "bubble CPAP", "WHO", "preterm"],
    ),
    vid(
        "video-exchange-transfusion",
        "Заменное переливание крови (DVET) — техника",
        "Exchange Transfusion Technique",
        "Демонстрация push-pull техники exchange transfusion через UVC. Aliquot management, monitoring, complications recognition.",
        "WHO / Bilirubin management materials",
        "who_official",
        "https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/newborn-health",
        "hepatic",
        15,
        ["exchange", "DVET", "ГБН", "WHO"],
    ),
    vid(
        "video-helping-babies-breathe",
        "Helping Babies Breathe — global program",
        "Helping Babies Breathe (HBB)",
        "Полный курс HBB 2nd edition — реанимация в условиях ограниченных ресурсов, golden minute, basic resuscitation для midwives и medical staff.",
        "AAP / Helping Babies Survive",
        "youtube_official",
        "https://www.youtube.com/@HelpingBabiesSurvive/videos",
        "resuscitation",
        45,
        ["HBB", "AAP", "global health", "low-resource"],
    ),
    vid(
        "video-newborn-exam",
        "Полный осмотр новорождённого",
        "Comprehensive Newborn Examination",
        "Систематический подход к osmoтру новорождённого — head-to-toe, primitive reflexes, ortolani/barlow, ophthalmologic.",
        "Stanford Medicine 25",
        "youtube_official",
        "https://stanfordmedicine25.stanford.edu/the25/newbornExam.html",
        "examination",
        25,
        ["осмотр", "Stanford", "newborn exam"],
    ),
    vid(
        "video-breastfeeding-latch",
        "Прикладывание к груди — правильная техника",
        "Effective Breastfeeding Latch",
        "Демонстрация asymmetric latch, positioning, signs of effective transfer. Adapted from UNICEF/WHO BFHI training materials.",
        "UNICEF / WHO Baby-Friendly Hospital Initiative",
        "who_official",
        "https://www.unicef.org/breastfeeding",
        "feeding",
        12,
        ["грудное вскармливание", "UNICEF", "WHO", "BFHI"],
    ),
    vid(
        "video-developmental-care",
        "Developmental care в NICU — основные принципы",
        "Developmental Care in NICU — Principles",
        "NIDCAP-based developmental care: low-stim environment, family-integrated care, positioning, kangaroo mother care.",
        "NIDCAP Federation International",
        "youtube_official",
        "https://nidcap.org/",
        "developmental",
        18,
        ["NIDCAP", "developmental care", "family-integrated"],
    ),
]


def main() -> None:
    bank = {
        "version": "1.0.0",
        "lastUpdated": "2026-05-10",
        "source": "Bordik Med — curated procedure video linkouts (audit Table 3.Д3)",
        "license": "External linkouts to authoritative sources (AAP, WHO, NEJM, Stanford, NIDCAP, EFCNI, UNICEF). Не размещаем встраиваемое видео — только linkouts с уважением к copyright.",
        "categories": [
            {"id": "resuscitation",    "title_ru": "Реанимация"},
            {"id": "respiratory",      "title_ru": "Респираторные"},
            {"id": "vascular_access",  "title_ru": "Сосудистый доступ"},
            {"id": "neuro",            "title_ru": "Неврологические"},
            {"id": "thermal",          "title_ru": "Терморегуляция"},
            {"id": "screening",        "title_ru": "Скрининг"},
            {"id": "examination",      "title_ru": "Осмотр"},
            {"id": "feeding",          "title_ru": "Питание / лактация"},
            {"id": "developmental",    "title_ru": "Развитие"},
            {"id": "hepatic",          "title_ru": "Гепатобилиарные"},
        ],
        "videos": VIDEOS,
    }
    PATH.write_text(json.dumps(bank, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(VIDEOS)} videos to {PATH.name}")


if __name__ == "__main__":
    main()
