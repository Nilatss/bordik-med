"""
Build /public/neonatal-common-mistakes.json — Таблица 3.Д6.

15+ типичных pitfalls в неонатологии. Каждая запись:
- mistake (что часто делают неправильно)
- why_it_happens (почему ошибка типична — context, cognitive bias)
- correct_approach (как должно быть)
- consequence (что бывает при ошибке)
- references
"""
from __future__ import annotations
import json
from pathlib import Path

PATH = Path(r"C:\Users\KDFX Modes\Desktop\bordik-med\public\neonatal-common-mistakes.json")


def m(
    mid: str, title_ru: str, title_en: str, category: str, severity: str,
    mistake: str, why: str, correct: str, consequence: str,
    references: list[str],
) -> dict:
    return {
        "id": mid,
        "title_ru": title_ru,
        "title_en": title_en,
        "category": category,
        "severity": severity,
        "mistake": mistake,
        "why_it_happens": why,
        "correct_approach": correct,
        "consequence": consequence,
        "references": references,
    }


MISTAKES = [
    m(
        "mistake-no-vitamin-k",
        "Пропустить витамин K при рождении",
        "Skipping Vitamin K at birth",
        "medication", "high",
        "Не ввести 1 мг витамина K1 IM в первый час жизни (термин) или 0.5 мг (BW <1000 г).",
        "Родители отказываются «от инъекций», или забывают, или думают что грудное молоко содержит достаточно витамина K. Грудное молоко на самом деле содержит МАЛО витамина K.",
        "Vit K1 1 мг IM в первый час (термин), 0.5 мг IM при BW <1000 г. Profilaktika early/classic/late VKDB. PO regimens — менее эффективны (несколько доз требуются).",
        "VKDB late form (2-12 нед): 50-80% случаев — внутричерепное кровоизлияние, mortality 15-25%, тяжёлые neuro sequelae у выживших.",
        [
            "AAP CFN 2003 (reaffirmed 2018) — Controversies concerning vitamin K and the newborn",
            "Cochrane Database Syst Rev 2000;CD002776",
        ],
    ),
    m(
        "mistake-routine-meconium-suction",
        "Routine аспирация при мекониальных водах у vigorous baby",
        "Routine intubation/suction для meconium у vigorous newborn",
        "resuscitation", "medium",
        "Рутинно интубировать и аспирировать через ЭТТ vigorous newborn с мекониальными водами.",
        "До 2015 это было стандартом NRP. Многие клиницисты не обновили practice. Существует ложное ощущение что 'нужно чистить'.",
        "С 2015 NRP: НЕ рутинно интубировать/аспирировать vigorous baby (good tone, breathing/crying). Только если non-vigorous + obstructive airway. Routine care с матерью при vigorous.",
        "Лишняя интубация у здорового baby — травма дыхательных путей, дестабилизация, потеря времени для skin-to-skin и first feed. Doesn't reduce MAS.",
        [
            "Aziz K et al. Pediatrics 2021;147:e2020038505E — NRP 8 ed.",
            "Vain NE et al. Lancet 2004;364:597 — original meconium suctioning trial",
        ],
    ),
    m(
        "mistake-100-percent-oxygen-term",
        "Реанимировать термин-новорождённого со 100% O₂",
        "Resuscitating term newborn with 100% O₂",
        "resuscitation", "high",
        "Стартовать реанимацию термин-newborn с FiO₂ 1.0 (100%) вместо room air.",
        "Историческая практика. Cтрах гипоксии. Не понимание токсичности гипероксии у doношенных.",
        "Термин ≥35 нед: стартовая FiO₂ 21% (room air). Preterm <35 нед: 21-30%. Titrate до целевой pre-ductal SpO₂ (60-65% на 1 мин, 80-85% на 5 мин, 85-95% на 10 мин). 100% только при компрессиях или persistent брадикардии.",
        "Гипероксия → oxidative stress → ↑ smertности и неврологических исходов у термин (Saugstad meta-analyses). Также ↑ retinopathy у preterm.",
        [
            "Saugstad OD et al. Neonatology 2008;94:176",
            "Aziz K et al. Pediatrics 2021;147:e2020038505E",
        ],
    ),
    m(
        "mistake-hypothermia-resus",
        "Не предотвратить гипотермию у preterm в родзале",
        "Failing to prevent hypothermia in delivery room для preterm",
        "thermoregulation", "medium",
        "Обтирать preterm <32 нед / VLBW при рождении и не использовать пластиковый пакет.",
        "Привычная практика «сушить ребёнка». Нет полиэтиленовых пакетов в родзале. Холодное помещение.",
        "Preterm <32 нед: пластиковый пакет/плёнка для тела БЕЗ обтирания, шапочка, t° помещения ≥25°C, предварительно нагретый стол + транспорт-инкубатор.",
        "Гипотермия при поступлении в NICU → ↑ mortality у VLBW (1.28× per 1°C decline below 36.5°C). Ассоциируется с RDS, hypoglycemia, IVH, sepsis.",
        [
            "WHO Recommendations on Newborn Health 2017",
            "McCall EM et al. Cochrane 2018;CD004210 — Interventions to prevent hypothermia",
        ],
    ),
    m(
        "mistake-no-protein-day1",
        "Не давать белок в Day 1 TPN",
        "Withholding amino acids on Day 1 of TPN",
        "nutrition", "medium",
        "Стартовать TPN без аминокислот в первый день и медленно вводить через несколько дней.",
        "Старая практика. Ложный страх «протеиновой нагрузки» у незрелого ребёнка. Не обновлены TPN протоколы.",
        "ESPGHAN 2018: aminoacids 1.5-3.0 г/кг/сут с Day 1 (early aggressive). Цель 3.5-4.5 г/кг/сут к Day 2-3. Glucose с Day 1 (GIR 4-6 мг/кг/мин).",
        "Negative nitrogen balance в первые дни, потеря lean body mass, замедление postnatal growth, нейроразвитийные последствия у preterm.",
        [
            "Mihatsch WA et al. Clin Nutr 2018;37:2306 — ESPGHAN/ESPEN/ESPR/CSPEN 2018 PN",
            "Te Braake FW et al. J Pediatr 2005;147:457",
        ],
    ),
    m(
        "mistake-late-surfactant",
        "Поздняя дача сурфактанта (после прогрессии RDS)",
        "Delayed surfactant в RDS",
        "respiratory", "medium",
        "Ждать пока ребёнок ухудшится / FiO₂ достигнет 0.50 на CPAP перед surfactant.",
        "Try CPAP only first attitude. Не уверенность в LISA технике. Желание избежать интубации.",
        "Sweet European Consensus 2022: surfactant при FiO₂ >0.30 на CPAP (любой GA). LISA preferred у спонтанно дышащего. Поздний surfactant менее эффективен — ателектаз и lung injury уже прогрессируют.",
        "Прогрессирующий RDS, потеря выгоды surfactant (peak benefit при early administration), ↑ pneumothorax, BPD, ИВЛ-зависимости.",
        [
            "Sweet DG et al. Neonatology 2023;120:3 — European Consensus 2022",
            "Aldana-Aguirre JC. Arch Dis Child Fetal Neonatal Ed 2017;102:F17",
        ],
    ),
    m(
        "mistake-no-caffeine-preterm",
        "Не назначить кофеин у preterm <32 нед",
        "Not starting caffeine in preterm <32 weeks",
        "respiratory", "medium",
        "Назначать кофеин только при появлении apnea, или вообще не назначать.",
        "Воспринимают кофеин только как анти-apnea агент. Не учитывают BPD prevention effect.",
        "Universal caffeine у preterm GA <32 нед: loading 20 мг/кг IV + maintenance 5-10 мг/кг q24h. Стартовать в первые 24-72 ч. Continue до 33-34 нед PMA или successful extubation.",
        "Нет уменьшения BPD на 36% (CAP trial), нет улучшения нейроразвитийных исходов в 11 лет, более длительная ИВЛ.",
        [
            "Schmidt B et al. NEJM 2007;357:1893 — CAP trial",
            "Schmidt B et al. NEJM 2017 follow-up — improved IQ at 11 yrs",
        ],
    ),
    m(
        "mistake-no-anti-d",
        "Не дать Anti-D Rh-отрицательной матери",
        "Failing to give Anti-D к Rh-negative mother",
        "hepatic", "high",
        "Не дать anti-D иммуноглобулин (RhoGAM) Rh-отрицательной матери в 28 нед беременности и в 72 ч после родов.",
        "Забывают check Rh status. Полагают что одной дозы при отслойке плаценты или amnio достаточно.",
        "Anti-D 300 мкг IM Rh-отрицательной матери: (1) routinely в 28 нед; (2) в 72 ч после родов Rh+ ребёнка; (3) при ANY potentially sensitising event (бл. травма, abortion, amnio, abruption).",
        "Сенсибилизация матери (development anti-D antibodies) → severe hemolytic disease в next pregnancy: anemia, hydrops fetalis, kernicterus, IUFD.",
        [
            "ACOG Practice Bulletin 75. 2008 — Prevention of Rh D Alloimmunization",
            "RCOG Green-top Guideline 22. 2014",
        ],
    ),
    m(
        "mistake-routine-residuals",
        "Рутинная проверка gastric residuals у preterm",
        "Routine gastric residual measurement в preterm",
        "nutrition", "low",
        "Аспирировать and measure желудочный residual перед каждым feed у preterm.",
        "Old practice. Believed to detect feeding intolerance / NEC early. Confused mucus / saliva swallow с pathology.",
        "ESPGHAN 2022 + Cochrane evidence — НЕ рутинно measure residuals. Только если concerning (bilious, blood-stained, hemodynamic instability, distention). Routine measurements delay full feeds на 1-2 нед без benefit.",
        "Задержка attainment full feeds, увеличение TPN exposure (cholestasis, sepsis risk), interruption breast milk delivery.",
        [
            "Embleton ND et al. JPGN 2022 — ESPGHAN Position Paper Enteral Nutrition Preterm",
            "Riskin A et al. J Pediatr 2017;185:62",
        ],
    ),
    m(
        "mistake-restrict-feeds-iugr",
        "Чрезмерное ограничение feeds у IUGR с REDF",
        "Over-restricting feeds в IUGR with REDF",
        "nutrition", "low",
        "Не начинать enteral feeds 7-10 дней у IUGR с reverse end-diastolic flow.",
        "Страх NEC у high-risk группы. Old data on REDF ассоциация с NEC.",
        "Trophic feeds 10 мл/кг/сут × 5-7 дней допустимо даже у REDF (recent ABC trial и сlimical observation). Затем slow advance 15-20 мл/кг/сут с close monitoring.",
        "Длительная TPN-зависимость, IFALD, sepsis risk через CVL, замедление gut maturation.",
        [
            "Leaf A et al. Pediatrics 2012;129:e1260 — ADEPT trial",
            "Embleton ND et al. JPGN 2022 — ESPGHAN 2022",
        ],
    ),
    m(
        "mistake-no-glucose-monitoring-idm",
        "Не мониторить гликемию у IDM/LGA в первые 12 ч",
        "Not monitoring glucose в IDM/LGA в первые 12 ч",
        "metabolic", "medium",
        "Не проверять BG у IDM/LGA если ребёнок выглядит well.",
        "Cиmptomatic hypoglycemia не всегда manifests early. Ложная уверенность что well-appearing baby = euglycemia.",
        "BAPM/AAP/PES: pre-feed BG check 2-3 ч жизни → q3-4h × 24-48 ч у at-risk (IDM, LGA, SGA, preterm). Treatment threshold <2.0-2.6 ммоль/л в зависимости от protocol.",
        "Symptomatic / severe hypoglycemia может вызвать occipital lobe injury, judgments деформации развития, learning disability long-term.",
        [
            "BAPM 2017 — Identification & Management of Neonatal Hypoglycaemia",
            "Thornton PS et al. PES J Pediatr 2015;167:238",
        ],
    ),
    m(
        "mistake-iv-d50-newborn",
        "Использование D50 у новорождённого",
        "Using D50 dextrose в newborn",
        "medication", "high",
        "Дать D50 (50% раствор глюкозы) IV для коррекции гипогликемии у newborn.",
        "Из adult resus protocols. Не учитывают osmolality и venous safety у newborn.",
        "Newborn hypoglycemia — D10W 2 мл/кг bolus (200 мг/кг), затем continuous D10W GIR 6-8 мг/кг/мин. NEVER D50 — peripheral phlebitis, extravasation, tissue necrosis. CVL для concentrated dextrose >12.5%.",
        "Severe тромбофлебит, экстравазация → tissue necrosis → плёночная инвалидизация (loss of digit / limb).",
        [
            "AAP CFN. Pediatrics 2011;127:575",
            "AAP NRP 8 ed. textbook",
        ],
    ),
    m(
        "mistake-empiric-vanco-eos",
        "Эмпирический ванкомицин при подозрении на EOS",
        "Empiric vancomycin для EOS",
        "infection", "low",
        "Стартовать ванкомицин + цефепим как empiric для EOS у термин-новорождённого.",
        "Используется LOS protocol для всех. Misunderstanding patogen spectrum.",
        "EOS empiric: ампициллин + гентамицин (covers GBS, E. coli, Listeria — main EOS pathogens). LOS empiric: vancomycin + cefepime/gentamicin (covers CoNS, S. aureus, gram-negative). Differ по timing (≤72 vs >72 hours).",
        "Ванкомицин unnecessarily — nephrotoxicity, отбор vancomycin-resistant организмов, замаскированный listeriosis (vanco не покрывает).",
        [
            "Polin RA. AAP. Pediatrics 2012;129:1006",
            "Puopolo KM et al. Pediatrics 2019;144:e20191881",
        ],
    ),
    m(
        "mistake-late-cooling-hie",
        "Позднее начало TH (>6 ч) или невыполнение",
        "Late initiation of TH (>6 hours) or non-implementation",
        "neuro", "high",
        "Откладывать therapeutic hypothermia за пределы 6-часового окна или не проводить вовсе у moderate-severe HIE.",
        "Trying to ‘stabilize’ ребёнка first. Под-trained team. Equipment unavailable.",
        "TH должна начаться в первые 6 ч от рождения. Target core 33-34°C × 72 ч. Includes neutrals хладо стимулы или active cooling. Активная transport если delivery facility не имеет equipment.",
        "Loss of neuroprotective benefit. После 6 ч — clinical evidence нет benefit. Permanent brain injury, severe disability, death.",
        [
            "Shankaran S et al. NEJM 2005;353:1574 — NICHD trial",
            "Azzopardi DV et al. NEJM 2009;361:1349 — TOBY trial",
            "Cochrane 2013;CD003311 — Cooling for HIE",
        ],
    ),
    m(
        "mistake-no-rop-screen",
        "Пропустить ROP screening или delay first exam",
        "Missing ROP screening или delaying first exam",
        "screening", "high",
        "Не направить ребёнка GA <30 нед или BW <1500 г на ROP screen в timely fashion.",
        "Coordination failure между NICU и ophthalmologist. Discharge до first screen. Misunderstanding screening criteria.",
        "AAP/AAO 2018: GA <27 нед — first exam в 31 нед PMA. GA 27-30 нед — 31 нед PMA OR 4 нед chronologic age (whichever later). Continue q1-2 нед до full vascularization OR treatment indication.",
        "Severe ROP (Stage 4/5 retinal detachment) выявляется too late для laser/anti-VEGF intervention → blindness.",
        [
            "Fierson WM et al. Pediatrics 2018;142:e20183061 — AAP/AAO 2018",
            "Mintz-Hittner HA et al. NEJM 2011;364:603 — BEAT-ROP",
        ],
    ),
    m(
        "mistake-tachypnea-feed",
        "Кормить ребёнка с tachypnea (RR >70/мин)",
        "Feeding infant с tachypnea",
        "respiratory", "medium",
        "Продолжать enteral feeds у newborn с RR >70-80/мин или active respiratory distress.",
        "Не want to disrupt feeding schedule. Underestimation aspiration risk.",
        "Feeding hold или NG tube при RR >70-80/мин или active distress. Aspiration risk высокий. Resume PO feeds после стабилизации (RR <60-70, SpO₂ stable, no work of breathing).",
        "Aspiration pneumonia, ухудшение respiratory status, NEC у preterm.",
        [
            "AAP COFN — feeding practices",
            "Embleton ND et al. JPGN 2022",
        ],
    ),
]


def main() -> None:
    bank = {
        "version": "1.0.0",
        "lastUpdated": "2026-05-10",
        "source": "Bordik Med — Neonatology common pitfalls (audit Table 3.Д6)",
        "license": "Educational content adapted from public guidelines (AAP, NRP, NICE, ESPGHAN, BAPM, Cochrane).",
        "categories": [
            {"id": "resuscitation", "title_ru": "Реанимация"},
            {"id": "respiratory",   "title_ru": "Респираторная"},
            {"id": "thermoregulation","title_ru": "Терморегуляция"},
            {"id": "nutrition",     "title_ru": "Питание"},
            {"id": "medication",    "title_ru": "Медикаменты"},
            {"id": "metabolic",     "title_ru": "Метаболизм"},
            {"id": "infection",     "title_ru": "Инфекции"},
            {"id": "neuro",         "title_ru": "Неврология"},
            {"id": "hepatic",       "title_ru": "Гепатобилиарная"},
            {"id": "screening",     "title_ru": "Скрининг"},
        ],
        "severities": [
            {"id": "low",    "title_ru": "Низкая"},
            {"id": "medium", "title_ru": "Средняя"},
            {"id": "high",   "title_ru": "Высокая"},
        ],
        "mistakes": MISTAKES,
    }
    PATH.write_text(json.dumps(bank, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(MISTAKES)} mistakes to {PATH.name}")


if __name__ == "__main__":
    main()
