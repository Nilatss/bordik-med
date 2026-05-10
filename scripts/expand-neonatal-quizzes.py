"""
Expand each neonatology quiz to >=12 questions so we have enough variety
for randomised non-repeating retries (display 10 per attempt, with
3-7 fresh on second attempt).

Source: standard neonatology references (NRP 8 ed. 2021, AAP 2022,
ESPGHAN 2018/2022, ERC 2021/2025, Sweet European Consensus 2022,
PES 2015, BAPM 2017, ICROP3 2021, NIH 2018 BPD, Modified Finnegan,
Jensen JAMA Pediatr 2019, Kaiser EOS 2017, Puopolo Pediatrics 2017).

This script is idempotent: it merges new questions into the existing
bank by question text (skips duplicates).
"""
from __future__ import annotations
import json
from pathlib import Path

PATH = Path(r"C:\Users\KDFX Modes\Desktop\bordik-med\public\neonatal-quizzes.json")

# Each entry: quiz_id -> list of new questions (q, options, answer, explanation)
NEW_QUESTIONS: dict[str, list[dict]] = {
    "quiz-resus-1": [
        {
            "q": "Какая целевая SpO₂ предуктально через 5 минут после рождения у термин-новорождённого по NRP?",
            "options": ["60-65%", "70-75%", "80-85%", "92-95%"],
            "answer": 2,
            "explanation": "По NRP 8 ed. целевая SpO₂ предуктально: 1 мин 60-65%, 5 мин 80-85%, 10 мин 85-95%. Не делай гипероксии у термин-ребёнка."
        },
        {
            "q": "Какой стартовый FiO₂ для реанимации термин-новорождённого (≥35 нед)?",
            "options": ["21% (room air)", "30%", "40-50%", "100%"],
            "answer": 0,
            "explanation": "У ≥35 нед стартуют с 21% (room air). Для <35 нед — 21-30%. 100% O₂ — только при компрессиях или persistent брадикардии."
        },
        {
            "q": "При длительности pre-ductal SpO₂ < 90% несмотря на effective ИВЛ, что добавляют?",
            "options": ["100% O₂", "Эпинефрин IV", "Сурфактант", "Бикарбонат"],
            "answer": 0,
            "explanation": "Если SpO₂ не достигает целевой при adequate ИВЛ — увеличивай FiO₂ до 100%. NRP advises titrate FiO₂ to maintain target saturations."
        },
        {
            "q": "Какова максимальная глубина введения ЭТТ для term-новорождённого 3 кг по правилу 6 + вес?",
            "options": ["6 см", "9 см", "11 см", "13 см"],
            "answer": 1,
            "explanation": "NRP правило: глубина ЭТТ от губ = 6 + вес(кг). Для 3 кг = 9 см. Альтернатива: nasotragus length (NTL) + 1."
        },
        {
            "q": "Какой объёмный болюс для гиповолемии у новорождённого при СЛР?",
            "options": ["5 мл/кг NaCl 0.9%", "10 мл/кг NaCl 0.9% или эритромасса", "20 мл/кг NaCl 0.9%", "Альбумин 5%"],
            "answer": 1,
            "explanation": "NRP 8 ed.: 10 мл/кг NaCl 0.9% или эритромасса O Rh- за 5-10 мин IV/IO. Повторить при необходимости. Не использовать альбумин рутинно."
        },
        {
            "q": "Через сколько секунд adequate ИВЛ оценивают эффективность по ЧСС перед эскалацией?",
            "options": ["15 сек", "30 сек", "60 сек", "90 сек"],
            "answer": 1,
            "explanation": "NRP: оценка ЧСС каждые 30 сек ИВЛ. ЧСС <100 после 30 сек effective ИВЛ → MR SOPA коррекция. ЧСС <60 после 30 сек effective ИВЛ через ЭТТ → компрессии."
        },
        {
            "q": "Что такое MR SOPA в NRP алгоритме?",
            "options": ["Mask/Reposition Suction Open mouth Pressure increase Airway alternative", "Maximize Resuscitation Standard Oxygen Pressure Algorithm", "Monitor Rate SpO₂ PaO₂ Apgar", "Maternal-Risk Sepsis-Onset Postnatal-Adjustment"],
            "answer": 0,
            "explanation": "MR SOPA = Mask adjustment, Reposition airway, Suction, Open mouth, Pressure increase, Airway alternative (LMA/ETT). Корректирующие шаги при не эффективной ИВЛ."
        },
        {
            "q": "У термин-ребёнка с meconium staining без depression — какой первый шаг?",
            "options": ["Немедленная intubation + аспирация", "Routine care: тёплый, dry, position, suction PRN", "Прямое аспирирование через ЭТТ", "Не трогать"],
            "answer": 1,
            "explanation": "С 2015 NRP routine intubation для meconium НЕ рекомендуется у vigorous baby. Только supportive care. Intubation/aspiration только если non-vigorous + obstructive airway."
        }
    ],
    "quiz-rds": [
        {
            "q": "Какая оптимальная антенатальная стероидная терапия для матери при риске преждевременных родов 24-34 нед?",
            "options": ["Преднизолон 50 мг ежедневно 7 дней", "Бетаметазон 12 мг IM × 2 дозы каждые 24 ч", "Дексаметазон 8 мг IV × 1", "Гидрокортизон 100 мг IV × 4"],
            "answer": 1,
            "explanation": "ACOG/NICE: бетаметазон 12 мг IM × 2 дозы каждые 24 ч (или дексаметазон 6 мг IM × 4 каждые 12 ч). Снижает RDS, IVH, NEC, смертность."
        },
        {
            "q": "Какая доза poractant alfa (Curosurf) для стартовой surfactant therapy?",
            "options": ["100 мг/кг (1.25 мл/кг)", "200 мг/кг (2.5 мл/кг)", "50 мг/кг", "400 мг/кг"],
            "answer": 1,
            "explanation": "Curosurf стартовая доза 200 мг/кг (2.5 мл/кг). Повторные — 100 мг/кг каждые 12 ч (до 3 доз). Beractant (Survanta) — 100 мг/кг."
        },
        {
            "q": "Главное преимущество LISA (Less Invasive Surfactant Administration) над INSURE?",
            "options": ["Быстрее", "Избегает IPPV/intubation, снижает BPD", "Дешевле", "Снижает дозу surfactant"],
            "answer": 1,
            "explanation": "LISA доставляет surfactant через тонкий катетер в спонтанно дышащего на CPAP ребёнка — НЕ требует positive-pressure ventilation. Снижает BPD по European Consensus 2022."
        },
        {
            "q": "При каком FiO₂ на CPAP рассматривать surfactant у preterm <32 нед?",
            "options": ["FiO₂ ≥ 0.21", "FiO₂ ≥ 0.30", "FiO₂ ≥ 0.50", "FiO₂ ≥ 0.80"],
            "answer": 1,
            "explanation": "Sweet European Consensus 2022: surfactant при FiO₂ >0.30 на CPAP у GA <26 нед, >0.30 на CPAP у GA ≥ 26 нед — раннее (LISA preferred)."
        },
        {
            "q": "Какая classical стадия RDS на рентгенограмме III степени?",
            "options": ["Лёгкая ретикулогранулярная сетка", "Air bronchograms за пределы тени сердца", "Полное обеднение лёгочного рисунка \"белые лёгкие\" с air bronchograms", "Пневмоторакс"],
            "answer": 2,
            "explanation": "RDS R-stage III — diffuse opacification (\"ground glass\"), air bronchograms за пределы сердца, обеднение лёгочного рисунка, нечёткие границы сердца. IV — \"белые лёгкие\"."
        },
        {
            "q": "Каков оптимальный PEEP стартовый при invasive ИВЛ для preterm с RDS?",
            "options": ["2 cm H₂O", "5-8 cm H₂O", "10-12 cm H₂O", "15 cm H₂O"],
            "answer": 1,
            "explanation": "PEEP 5-8 cm H₂O стартово (Sweet 2022). Повышай при persistent гипоксии. PEEP <5 → atelectasis, >10 → risk пневмоторакса/обструкции venous return."
        },
        {
            "q": "У ребёнка GA 30 нед с RDS на CPAP FiO₂ 0.40 — что предпочтительнее: bovine vs porcine surfactant?",
            "options": ["Bovine (Beractant) — preferred", "Porcine (Poractant) — superior survival/BPD-free outcomes", "Identical", "Synthetic — preferred"],
            "answer": 1,
            "explanation": "Cochrane meta-analysis (Singh 2015): Poractant alfa (Curosurf) 200 мг/кг → reduced mortality vs Beractant 100 мг/кг. Higher dose porcine — superior."
        }
    ],
    "quiz-bili": [
        {
            "q": "Какая частота ABO-несовместимости как причина ГБН в России?",
            "options": ["~5%", "~15-20%", "~30-40%", "~70-80%"],
            "answer": 2,
            "explanation": "ABO-несовместимость — 30-40% всех случаев ГБН в РФ. Rh — около 10-15%. Прочие antigens (Kell, Duffy и т.д.) — редко."
        },
        {
            "q": "При TSB на пороге фототерапии по AAP 2022 — в течение какого времени должна быть начата интенсивная PT?",
            "options": ["В течение 1 ч", "В течение 6 ч", "В течение 24 ч", "В следующее утро"],
            "answer": 0,
            "explanation": "AAP 2022: при TSB на/около порога DVET начинай интенсивную PT немедленно (within 1 hour) и готовь exchange transfusion если TSB не снижается."
        },
        {
            "q": "Какая доза IVIG при ГБН (Rh или ABO) для предотвращения exchange transfusion?",
            "options": ["0.1 г/кг", "0.5-1 г/кг IV за 2 ч", "5 г/кг", "10 г/кг"],
            "answer": 1,
            "explanation": "IVIG 0.5-1 г/кг IV за 2 ч (повторить через 12 ч PRN). Снижает potreba в DVET у Rh/ABO ГБН с активным гемолизом и подъёмом TSB несмотря на PT."
        },
        {
            "q": "При какой концентрации билирубина рассматривают exchange transfusion у термин-ребёнка по AAP 2022 (escalation tier 1)?",
            "options": ["TSB ≥ 200 мкмоль/л в первые 24 ч", "TSB ≥ narrow zone от DVET threshold", "TSB ≥ 350 мкмоль/л", "TSB ≥ 600 мкмоль/л"],
            "answer": 1,
            "explanation": "AAP 2022: escalation tier когда TSB в narrow zone (около DVET threshold). Сначала intensive PT + IVIG. Exchange — если TSB не снижается за 6 ч или подъём ≥0.5 мг/дл/ч."
        },
        {
            "q": "Какая частота kernicterus у термин-новорождённого с TSB > 25 мг/дл (425 мкмоль/л)?",
            "options": ["0.01%", "<5%", "30-40%", "90%"],
            "answer": 1,
            "explanation": "По данным Pilot Kernicterus Registry — kernicterus риск при TSB >25 мг/дл редок (<5%) у healthy term, но резко возрастает при naglu hemolysis, sepsis, GA<38 нед, prematurity, hypoalbuminemia."
        },
        {
            "q": "Какой volume для DVET у term-newborn (double volume exchange)?",
            "options": ["80 мл/кг", "160 мл/кг", "240 мл/кг", "320 мл/кг"],
            "answer": 1,
            "explanation": "Double volume exchange = 2 × blood volume. У term — blood volume 80 мл/кг → DVET 160 мл/кг. У preterm 90 мл/кг → DVET 180 мл/кг. Заменяет ~85% RBCs."
        },
        {
            "q": "При фототерапии — какая optimal длина волны?",
            "options": ["320-380 нм (UV)", "460-490 нм (синий)", "550-600 нм (жёлтый)", "700-750 нм (красный)"],
            "answer": 1,
            "explanation": "Билирубин максимально абсорбирует в синем спектре 460-490 нм. LED-PT с irradiance ≥30 мкВт/см²/нм — стандарт intensive PT."
        },
        {
            "q": "Какая main causa ГБН после Rh-D и ABO?",
            "options": ["G6PD дефицит", "Anti-Kell антитела", "Spherocytosis", "Sepsis"],
            "answer": 1,
            "explanation": "Anti-Kell — третья по частоте причина ГБН (после Rh-D и ABO). Vyrazhennoe гемолиз + suppression эритропоэза — может требовать intrauterine transfusions."
        }
    ],
    "quiz-sepsis": [
        {
            "q": "Какая стандартная empiric ABX для подозрения early-onset sepsis (<72 ч)?",
            "options": ["Ванкомицин + цефепим", "Ампициллин + гентамицин", "Меропенем", "Цефтриаксон + клиндамицин"],
            "answer": 1,
            "explanation": "EOS empiric: ампициллин (50 мг/кг q8-12h) + гентамицин (4-5 мг/кг q24-48h по GA/age). Покрывает GBS, E. coli, Listeria — главные EOS pathogens."
        },
        {
            "q": "Какая duration ABX therapy для culture-negative но clinical sepsis?",
            "options": ["24 ч", "5 дней", "10 дней", "21 день"],
            "answer": 1,
            "explanation": "Culture-negative clinical sepsis (\"presumed sepsis\") — 5-7 дней. AAP CFN рекомендует прекращение через 36-48 ч если cultures negative и ребёнок clinically well."
        },
        {
            "q": "Какие main pathogens late-onset sepsis (>72 ч)?",
            "options": ["GBS, E. coli, Listeria", "Coagulase-negative staphylococci, S. aureus, Candida, gram-negative", "MRSA только", "Anaerobes"],
            "answer": 1,
            "explanation": "LOS = nosocomial: CoNS (40-50%), S. aureus, gram-negative (E.coli, Klebsiella, Pseudomonas), Candida (<5% but high mortality). Empiric: vanco + cefepime/gentamicin."
        },
        {
            "q": "При мать-positive GBS screening, intrapartum prophylaxis adekvatna при какой длительности?",
            "options": ["<2 ч до родов", "≥4 ч до родов с пеницилином/ампицилином", "1 доза независимо от времени", "≥2 ч с цефазолином"],
            "answer": 1,
            "explanation": "AAP: adekvatna IAP = пенициллин/ампициллин/цефазолин дан ≥4 ч до родов. Иначе well-appearing infant: observation 36-48 ч; ill-appearing: full work-up + ABX."
        },
        {
            "q": "Какой биомаркер sepsis у новорождённых superior к CRP в первые 6 ч?",
            "options": ["Прокальцитонин (PCT)", "Лейкоциты", "ESR", "Тропонин"],
            "answer": 0,
            "explanation": "PCT поднимается за 4-6 ч (vs CRP за 12-24 ч). Reference в первые 24 ч жизни — physiologic peak. PCT >2 нг/мл после 24 ч — highly suggestive of bacterial sepsis."
        },
        {
            "q": "Какова reference frequency early-onset GBS sepsis в США в эру universal screening?",
            "options": ["~0.025/1000 живорождённых", "~0.25/1000", "~2.5/1000", "~25/1000"],
            "answer": 1,
            "explanation": "После Universal screening + IAP частота снизилась с 1.7/1000 до ~0.2-0.25/1000 (CDC 2017). Но GBS остаётся #1 EOS pathogen с летальностью 5-10%."
        },
        {
            "q": "При culture-positive bacteremia — duration ABX?",
            "options": ["7 дней", "10-14 дней", "21 день", "42 дня"],
            "answer": 1,
            "explanation": "Bacteremia без meningitis: 10-14 дней. Meningitis: 14-21 день для GBS, 21 день для gram-negative. Endocarditis/osteomyelitis: 4-6 недель."
        },
        {
            "q": "Что такое blood culture \"adequate volume\" для diagnostic sensitivity у новорождённого?",
            "options": ["0.1 мл", "≥1 мл", "5 мл", "10 мл"],
            "answer": 1,
            "explanation": "≥1 мл blood culture — необходимо для adequate sensitivity (Schelonka 1996). <0.5 мл → false-negative до 60%. Использовать pediatric isolator/aerobic bottle."
        }
    ],
    "quiz-hie": [
        {
            "q": "Какое окно для начала therapeutic hypothermia (TH)?",
            "options": ["В первые 1 ч", "В первые 6 ч от рождения", "В первые 12 ч", "В первые 24 ч"],
            "answer": 1,
            "explanation": "TH должна начинаться в первые 6 ч от рождения (NICHD/TOBY). Эффективность снижается с задержкой. Раньше — лучше. После 6 ч — пользы доказательно нет."
        },
        {
            "q": "Какова target core temperature для cooling?",
            "options": ["32-32.5°C", "33-34°C (whole body) или 34.5°C (selective head)", "35-36°C", "36.5-37°C"],
            "answer": 1,
            "explanation": "Whole-body cooling (NICHD): 33-34°C × 72 ч. Selective head cooling: rectal 34-35°C × 72 ч. После 72 ч rewarming ≤0.5°C/ч."
        },
        {
            "q": "Какой первичный inclusion criterion для TH (NICHD)?",
            "options": ["GA ≥ 36 нед, BW ≥ 1800 г, evidence of perinatal HIE, moderate/severe encephalopathy by Sarnat", "Только perinatal asphyxia", "Apgar < 5 на 5 мин", "pH < 7.0 only"],
            "answer": 0,
            "explanation": "NICHD: GA ≥36 нед + BW ≥1800 г + perinatal HIE evidence (Apgar ≤5 на 10 мин ИЛИ ИВЛ ≥10 мин ИЛИ pH<7.0 ИЛИ BD≥16) + moderate/severe HIE по Sarnat."
        },
        {
            "q": "Какой anticonvulsant first-line при HIE seizures во время cooling?",
            "options": ["Диазепам IV", "Фенобарбитал 20 мг/кг IV", "Леветирацетам", "Мидазолам continuous"],
            "answer": 1,
            "explanation": "Фенобарбитал 20 мг/кг IV — first-line. При persistent seizures: повторить 10 мг/кг (до 40 мг/кг total). Затем леветирацетам или мидазолам."
        },
        {
            "q": "Какова target heart rate во время cooling?",
            "options": ["<60 уд/мин", "70-100 уд/мин (норма для cooled)", "120-160 уд/мин", "Не контролируется"],
            "answer": 1,
            "explanation": "При cooling ЧСС обычно 70-100 уд/мин (sinus брадикардия из-за прохлаждения). Не лечить. Хорошо переносится. Hypotension и arrhythmia — redirect."
        },
        {
            "q": "Какой Hb target во время cooling?",
            "options": ["≥7 г/дл", "≥10 г/дл", "≥13 г/дл (улучшает O₂-delivery)", "≥17 г/дл"],
            "answer": 2,
            "explanation": "TH Hb target ≥13 г/дл (Hct ≥40%). Транзфузия PRBC при Hb<13 — улучшает cerebral O₂-delivery в условиях reduced metabolism + impaired autoregulation."
        },
        {
            "q": "Какой aEEG pattern у HIE highly predicts poor neurological outcome?",
            "options": ["Continuous normal voltage", "Discontinuous normal voltage", "Burst suppression / flat trace в первые 24-36 ч despite TH", "Sleep-wake cycles"],
            "answer": 2,
            "explanation": "Burst suppression / flat trace persistent через 36 ч TH — poor predictor (>80% adverse outcome). Sleep-wake cycles return до 36 ч — good prognostic sign."
        },
        {
            "q": "Какой metabolic abnormality характерна для HIE rewarming phase?",
            "options": ["Hyperglycemia", "Hypoglycemia + electrolyte shifts (K+ shifts)", "Hypernatremia", "Metabolic alkalosis"],
            "answer": 1,
            "explanation": "Rewarming: K+ shifts (re-equilibration), hypoglycemia (anaerobic glycolysis после), hypotension (vasodilation). Поддерживай glucose, monitor K+, slow rewarming ≤0.5°C/ч."
        }
    ],
    "quiz-nutrition": [
        {
            "q": "Стартовая доза aminoacids в TPN у preterm в день 1 жизни?",
            "options": ["0.5 г/кг/сут", "1.5-3.0 г/кг/сут", "5 г/кг/сут", "Не давать в day 1"],
            "answer": 1,
            "explanation": "ESPGHAN 2018: aminoacids 1.5-3.0 г/кг/сут с day 1 (early aggressive). Цель 3.5-4 г/кг/сут к day 2-3. \"Metabolic preconditioning\" подход."
        },
        {
            "q": "Lipid emulsion of choice for preterm TPN?",
            "options": ["Soybean-based 100% (Intralipid)", "SMOFlipid (mixed: soy, MCT, olive, fish oil)", "Pure fish oil", "Egg yolk emulsion"],
            "answer": 1,
            "explanation": "SMOFlipid (mixed) — ESPGHAN 2018 preferred. Snizhayet IFALD risk vs pure soy. Старт 1-2 г/кг/сут, целевая 3-4 г/кг/сут. У preterm c IFALD — rybnyi жир."
        },
        {
            "q": "Какова target GIR для term-newborn в первые сутки?",
            "options": ["2-4 мг/кг/мин", "5-8 мг/кг/мин", "10-12 мг/кг/мин", "15+ мг/кг/мин"],
            "answer": 1,
            "explanation": "Target GIR 5-8 мг/кг/мин у term для maintenance euglycemia. Preterm — 4-12 мг/кг/мин (выше при гипогликемии). Max GIR 12-14 — риск hyperglycemia."
        },
        {
            "q": "Какой trophic feed volume у VLBW для maturation gut?",
            "options": ["2-5 мл/кг/сут", "10-25 мл/кг/сут", "60 мл/кг/сут", "150 мл/кг/сут"],
            "answer": 1,
            "explanation": "Trophic feeds 10-25 мл/кг/сут × 3-5 дней — \"gut priming\" без caloric intent. Снижает NEC, accelerates full feeds, improves gut motility (ESPGHAN 2022 EN)."
        },
        {
            "q": "При weight loss > какого % от birth weight у term breastfed newborn red flag?",
            "options": ["3%", "7-10%", "15%", "20%"],
            "answer": 1,
            "explanation": "AAP: weight loss >7% — evaluate breastfeeding effectiveness. >10% — lactation consultant + supplement. >12% — medical evaluation (dehydration, hypernatremia)."
        },
        {
            "q": "Какой Vitamin K dose для prevention VKDB?",
            "options": ["0.1 мг IM", "1 мг IM (BW>1000 г), 0.5 мг IM (BW<1000 г)", "5 мг IM", "0.5 мг PO × 1"],
            "answer": 1,
            "explanation": "AAP/Cochrane: 1 мг IM × 1 dose (term/preterm BW>1000 г), 0.5 мг IM (BW<1000 г). Sole IM — prevent late VKDB. PO — повторные дозы required, less effective."
        },
        {
            "q": "Когда начинать HMF (Human Milk Fortifier) у VLBW?",
            "options": ["В первые сутки", "При EN ≥ 80-100 мл/кг/сут", "После выписки", "Никогда у VLBW"],
            "answer": 1,
            "explanation": "ESPGHAN 2022: HMF при достижении EN 80-100 мл/кг/сут. Preterm milk не покрывает потребности GA<32 нед / BW<1800 г. Стандартное обогащение 4 г/100 мл."
        },
        {
            "q": "Какова daily fluid requirement для term-newborn day 1 vs day 7?",
            "options": ["60 → 60 мл/кг", "60-80 → 150-160 мл/кг", "150 → 150 мл/кг (без изменений)", "30 → 30 мл/кг"],
            "answer": 1,
            "explanation": "Term day 1: 60-80 мл/кг (insensible loss limited). Прогрессирует +20 мл/кг/сут. Day 7: 150-160 мл/кг maintenance. ELBW начинают выше из-за ↑insensible loss."
        }
    ],
    "quiz-iem": [
        {
            "q": "Какая первая мера при подозрении на IEM с hyperammonemia (NH3 > 200 ммоль/л)?",
            "options": ["Aminoacids 4 г/кг/сут продолжать", "STOP protein, start D10 IV (GIR 8-10), call metabolic team, dialysis prep при NH3>500", "Phenobarbital", "Диета grudnym молоком"],
            "answer": 1,
            "explanation": "Hyperammonemia rescue: ⚫️ stop protein (transient catabolism!) ⚫️ D10 GIR 8-10 mg/kg/min (anabolic switch) ⚫️ sodium benzoate/phenylacetate ⚫️ L-arginine (UCD) ⚫️ dialysis при NH3>500 ммоль/л."
        },
        {
            "q": "При urea cycle defect (UCD), какой ammonium scavenger first-line?",
            "options": ["Phenytoin", "Sodium benzoate + sodium phenylacetate (Ammonul) IV bolus + infusion", "Lactulose", "Insulin"],
            "answer": 1,
            "explanation": "Ammonul = Na-benzoate (250 мг/кг) + Na-phenylacetate (250 мг/кг) — alternative ammonia removal. Также L-arginine 200-600 мг/кг. Glycerol phenylbutyrate — chronic."
        },
        {
            "q": "Какой IEM B12-responsive (cyanocobalamin) presents с hyperammonemia + acidemia?",
            "options": ["PKU", "Methylmalonic acidemia (MMA), cobalamin-responsive subtype (CblA, CblB)", "Galactosemia", "Tyrosinemia type I"],
            "answer": 1,
            "explanation": "CblA/CblB MMA — B12-responsive forms. Trial OH-cobalamin 1 мг IM 3-5 дней. CblC — also B12-responsive (MMA + homocystinuria)."
        },
        {
            "q": "При galactosemia первая мера?",
            "options": ["Соевая смесь lactose-free", "Только грудное молоко", "TPN", "Гидрокортизон"],
            "answer": 0,
            "explanation": "Classical galactosemia (GALT-deficiency) — immediately switch to soy/elemental lactose-free formula. Грудное молоко содержит lactose=galactose — contraindicated."
        },
        {
            "q": "Какой biomarker подозрения на organic acidemia?",
            "options": ["Только NH3", "Anion gap metabolic acidosis + ketosis + hyperammonemia + lactic acidosis", "Только лактат", "Cholesterol"],
            "answer": 1,
            "explanation": "OA classic triad: HAGMA + ketosis + hyperammonemia (но может быть mild). Plus lactic acidosis, hypoglycemia. Workup: urine organic acids, plasma acylcarnitines, ammonia."
        },
        {
            "q": "Какой IEM screened by NBS as elevated C5-DC acylcarnitine?",
            "options": ["MCAD", "Glutaric acidemia type 1 (GA-1)", "PKU", "VLCAD"],
            "answer": 1,
            "explanation": "GA-1 — elevated glutarylcarnitine (C5-DC) на NBS. Не лечить → macrocephaly + striatal injury → dystonic CP. Lysine/tryptophan-restricted diet + carnitine."
        },
        {
            "q": "При MCAD (medium-chain acyl-CoA dehydrogenase deficiency) — main risk?",
            "options": ["Hypoglycemia + Reye-like syndrome при fasting/illness", "Cataracts", "Cardiomyopathy", "Renal failure"],
            "answer": 0,
            "explanation": "MCAD: impaired fatty acid oxidation → hypoketotic hypoglycemia при fasting/illness. Sudden death possible. Treatment: avoid fasting >6-8 ч, IV glucose при illness, carnitine PRN."
        },
        {
            "q": "Какой IEM с burnt-sugar / maple syrup smell мочи?",
            "options": ["PKU", "Maple Syrup Urine Disease (MSUD)", "Galactosemia", "Tyrosinemia"],
            "answer": 1,
            "explanation": "MSUD — BCAA (leucine, isoleucine, valine) accumulate. Ketotic breath/urine → maple syrup. Severe encephalopathy при leucine>1500 µmol/L. Treatment: BCAA-restricted diet, dialysis severe."
        },
        {
            "q": "При phenylketonuria (PKU) screening cut-off?",
            "options": ["Phe > 60 µmol/L (1 мг/дл)", "Phe > 120 µmol/L (2 мг/дл)", "Phe > 360 µmol/L (6 мг/дл) treatment threshold", "Phe > 1000 µmol/L"],
            "answer": 2,
            "explanation": "PKU treatment threshold Phe ≥1000 µmol/L (классический PKU). Mild HPA 360-600 — monitoring; classical >1200 — strict diet. NBS positive screen ≥2-3 SD above population mean."
        }
    ],
    "quiz-screening": [
        {
            "q": "Optimal sample timing для NBS dried blood spot?",
            "options": ["В первый час", "24-48 ч жизни (после кормления, до transfusion)", "При выписке (любое время)", "1 месяц"],
            "answer": 1,
            "explanation": "Optimal NBS — 24-48 ч жизни. <24 ч — многие IEM screens не обнаружат. До PRBC transfusion (false-negative). Repeat если <24 ч или transfused."
        },
        {
            "q": "При CCHD pulse oximetry screening — failed criteria?",
            "options": ["SpO₂ <95% × 1", "SpO₂ <90% любой site OR ≥3% разница right-hand vs foot × 3 measurements 1 hr apart OR <95% обе site", "SpO₂ <88%", "Только cyanosis"],
            "answer": 1,
            "explanation": "AAP-CCHD: pulse ox 24-48 h. Fail: SpO₂<90% любой site, OR <95% obe site × 3 × 1 hr, OR ≥3% разница RH vs foot × 3. Sensitivity ~76% для critical CHD."
        },
        {
            "q": "Когда проводить CCHD screening?",
            "options": ["В первый час", "После 24 ч жизни (24-48 h optimal)", "При выписке только", "1 неделя"],
            "answer": 1,
            "explanation": "CCHD pulse ox screening после 24 ч жизни (24-48 ч optimal). До 24 ч — transitional circulation → false-positives (1.6% vs 0.4% после 24 ч)."
        },
        {
            "q": "Когда первый ROP screen у preterm GA ≤ 30 нед?",
            "options": ["В day 1", "31-34 нед PMA OR 4-6 недель chronologic age (whichever later)", "При выписке", "В 1 месяц независимо от срока"],
            "answer": 1,
            "explanation": "AAP/AAO 2018: GA<27 нед — 31 нед PMA. GA 27-30 нед — 31-32 нед PMA OR 4 недель chronologic. Examined каждые 1-3 нед до зрелости retina."
        },
        {
            "q": "Какой first-tier hearing screen у newborn?",
            "options": ["Behavioral audiometry", "AABR (Automated Auditory Brainstem Response) или OAE (OtoAcoustic Emissions)", "Tympanometry", "Audiogram"],
            "answer": 1,
            "explanation": "AABR > OAE для NICU babies (catches retrocochlear). AABR fail → follow-up до 3 мес. Diagnostic ABR + intervention до 6 мес. AAP \"1-3-6 rule\"."
        },
        {
            "q": "При positive NBS на CF (cystic fibrosis) confirmed by?",
            "options": ["X-ray", "Sweat chloride test (>60 ммоль/л diagnostic)", "ABG", "Spirometry в newborn"],
            "answer": 1,
            "explanation": "CF NBS: IRT (immunoreactive trypsinogen) elevated → CFTR genotyping. Confirmed: sweat chloride >60 ммоль/л OR 2 disease-causing CFTR mutations. >40 ммоль/л — borderline, repeat."
        },
        {
            "q": "Когда проводить screening для CHD при семейной истории?",
            "options": ["Пренатально (fetal echo) при семейном CHD у first-degree relative", "Только постнатально", "После 1 года", "Не проводить"],
            "answer": 0,
            "explanation": "Fetal echo 18-22 нед при семейном CHD у first-degree relative (риск 3-7%), maternal diabetes pre-gestational, maternal CHD, abnormal NT, IVF, abnormal screening."
        },
        {
            "q": "Какие 36 заболеваний включены в NBS РФ с 01.01.2023?",
            "options": ["Только PKU + врожденный гипотиреоз", "5 наследственных + СМА + первичные иммунодефициты + 29 IEM", "100 disorders", "Только IEM"],
            "answer": 1,
            "explanation": "NBS РФ с 2023 — expanded: 5 классических (PKU, ВГ, ВДКН, MCAD, AGT), плюс СМА, первичные иммунодефициты, и tandem MS — 29 IEM. Total 36."
        },
        {
            "q": "При congenital hypothyroidism (CH) NBS positive — confirmation?",
            "options": ["TSH + free T4 в сыворотке", "Только TSH", "Thyroid scan", "Только symptoms"],
            "answer": 0,
            "explanation": "CH confirm: serum TSH + free T4. Если TSH>40 mIU/L OR fT4 low — start L-thyroxine 10-15 mcg/kg/d immediately. Goal TSH<5 mIU/L by 2 нед, fT4 normal по 1 мес."
        }
    ],
    "quiz-pphn": [
        {
            "q": "Какая стартовая доза iNO для PPHN?",
            "options": ["5 ppm", "20 ppm", "40 ppm", "80 ppm"],
            "answer": 1,
            "explanation": "iNO стартовая 20 ppm. Если responder (↑SpO₂, ↑PaO₂, ↓OI), wean over 24-48 ч. Не превышать 40 ppm (risk metHb). Wean by 5 ppm каждые 4 ч до 5 ppm, then taper to 1 ppm."
        },
        {
            "q": "Когда рассматривать ECMO при PPHN?",
            "options": ["OI > 15", "OI > 25-40 несмотря на full medical (iNO, sildenafil, milrinone, optimized vent)", "При любой PPHN", "Только если weight <2 kg"],
            "answer": 1,
            "explanation": "ECMO criteria PPHN: OI ≥25-40 (varies by center) AFTER optimized therapy (iNO, sildenafil, milrinone, surfactant если RDS, optimal MAP). GA ≥34 нед, BW ≥2 кг typically."
        },
        {
            "q": "Какова доза sildenafil для PPHN (oral/NG)?",
            "options": ["0.05 мг/кг q12h", "0.5-2 мг/кг q6h PO/NG", "10 мг/кг q4h", "Однократно 5 мг"],
            "answer": 1,
            "explanation": "Sildenafil 0.5-2 мг/кг q6h PO/NG. IV рекомендуется в emergency (но reserved). Adjuvant к iNO. Cochrane: improves oxygenation в LMICs где iNO unavailable."
        },
        {
            "q": "При warm shock у newborn (vasodilated, low SVR) — vasopressor of choice?",
            "options": ["Adrenaline", "Vasopressin (0.0003-0.002 U/kg/min) — selective vasoconstrictor", "Dobutamine", "Milrinone"],
            "answer": 1,
            "explanation": "Warm shock = vasodilated, high CO, low SVR. Vasopressin selective V1-receptor — raises SVR без ↑PVR (ideal в PPHN). Стартовая 0.0003-0.0005 U/kg/min."
        },
        {
            "q": "Какая SpO₂ differential confirms RIGHT-to-LEFT shunting через PFO/PDA?",
            "options": ["No difference", ">5% разница RH (preductal) > foot (postductal)", "Reverse — foot SpO₂ > RH", "10% RH < foot"],
            "answer": 1,
            "explanation": "PPHN: pre-ductal (RH) > post-ductal (foot). Differential >5-10% → R-to-L shunting через PDA. “Reverse differential” (foot>RH) → transposition (TGA) с PPHN."
        },
        {
            "q": "При hyperoxia test (100% O₂ × 10 мин) failed (PaO₂<150) предполагает?",
            "options": ["Lung disease", "Cyanotic congenital heart disease (CHD)", "Met-Hb", "Sepsis"],
            "answer": 1,
            "explanation": "Failed hyperoxia (PaO₂<150 на 100%FiO₂) suggests R-to-L shunting от cyanotic CHD (TGA, TOF, etc) или severe PPHN. Confirms via echo + cardiac eval."
        },
        {
            "q": "Milrinone в PPHN — как inotrope/inodilator работает?",
            "options": ["Альфа-агонист", "PDE-3 ингибитор: inotrope + systemic + PVR vasodilation", "Bета-блокатор", "Calcium channel blocker"],
            "answer": 1,
            "explanation": "Milrinone PDE-3 inhibitor → ↑cAMP → inotropy + vasodilation (systemic + pulmonary). Доза 0.25-0.75 мкг/кг/мин (no loading в neonates). Adjuvant в PPHN с RV dysfunction."
        },
        {
            "q": "Какая main side effect iNO?",
            "options": ["Только tachycardia", "Methemoglobinemia (>5%) + NO₂ toxicity, rebound PHTN при abrupt withdrawal", "Hypoglycemia", "Renal failure"],
            "answer": 1,
            "explanation": "iNO toxicity: metHb (monitor q12h, особенно >40 ppm), NO₂ (irritant, monitor in ventilator circuit). Rebound PHTN — wean slowly! Не abrupt discontinuation."
        }
    ],
    "quiz-nec": [
        {
            "q": "Какая Bell stage III диагностические критерии?",
            "options": ["Only feeding intolerance", "Pneumatosis intestinalis", "Стадия IIIA: severe NEC + perforation pending; IIIB: confirmed pneumoperitoneum/perforation", "Hematochezia"],
            "answer": 2,
            "explanation": "Bell IIIA: severe NEC, hypotension, DIC, persistent acidosis, but no perforation; IIIB: confirmed pneumoperitoneum on AXR → surgical NEC. Mortality 30-50%."
        },
        {
            "q": "Triple-ABX для медицинского NEC management?",
            "options": ["Vancomycin + ceftriaxone", "Ampicillin + gentamicin + metronidazole/clindamycin (или meropenem alone)", "Cefotaxime alone", "Vancomycin alone"],
            "answer": 1,
            "explanation": "Suspected NEC: Amp + gent + metro (anaerobe coverage) × 7-14 дней. Severe/perforated: meropenem ± vanco. Adjust based on culture. Source control — surgical если perforated."
        },
        {
            "q": "Какова first-line surgical option при NEC IIIB у preterm <1000 г?",
            "options": ["Primary peritoneal drainage (PPD) — controversial", "Laparotomy + resection", "Conservative", "ECMO"],
            "answer": 0,
            "explanation": "NECSTEPS trial: PPD vs laparotomy у ELBW — no mortality difference. PPD сначала, laparotomy если no improvement. У larger preterm — laparotomy preferred."
        },
        {
            "q": "Главный risk factor для NEC у preterm?",
            "options": ["Preterm birth + formula feeding + intestinal dysbiosis", "Только prematurity", "Только formula", "Maternal diabetes"],
            "answer": 0,
            "explanation": "NEC pathogenesis: prematurity (immature gut barrier) + formula (vs breastmilk → no bifidobacteria) + dysbiosis + ischemia. Breastmilk reduces NEC by 6-10x в VLBW."
        },
        {
            "q": "Pneumatosis intestinalis на AXR — патогномоничная для NEC?",
            "options": ["Да, 100% specific", "Highly suggestive (Bell IIA+) но также at hyperinflation, post-cardiac surgery, infection", "No specificity", "Only for medical NEC"],
            "answer": 1,
            "explanation": "Pneumatosis intestinalis — highly suggestive of NEC (Bell IIA+). Но возможна post-cardiac surgery, severe enteritis. Combined с clinical context (feeding intolerance, abdominal distension, hematochezia)."
        },
        {
            "q": "При NEC — typical timing?",
            "options": ["Day 1 жизни", "10-14 дней postnatal у preterm после full-volume feeds", "Только при выписке", "Только у term"],
            "answer": 1,
            "explanation": "NEC peak incidence — 2-3 неделя postnatal у preterm после establishment full-volume feeds. У term unusual — ассоциирован c congenital heart disease, polycythemia, perinatal asphyxia."
        },
        {
            "q": "Какой biomarker emerging для NEC diagnosis?",
            "options": ["I-FABP (intestinal fatty acid-binding protein)", "Только CRP", "Procalcitonin only", "Lactate"],
            "answer": 0,
            "explanation": "I-FABP — sensitive marker enterocyte injury. Combined с urinary I-FABP, claudin-3, fecal calprotectin — emerging diagnostic panel. Не replaces clinical suspicion."
        },
        {
            "q": "После medical NEC — когда возобновлять кормление?",
            "options": ["Сразу после signs стабильности", "После 7-10 дней NPO + bowel rest, slow advance", "Через 1 мес", "Никогда"],
            "answer": 1,
            "explanation": "После medical NEC: NPO + ABX 7-14 дней. Resume trophic feeds после bowel rest, normal AXR, clinical stability. Slow advance 10-20 мл/кг/сут. Breastmilk preferred."
        }
    ],
    "quiz-pda": [
        {
            "q": "Какие ECHO criteria для hemodynamically significant PDA (hsPDA)?",
            "options": ["Только PDA size", "PDA ≥1.5 мм + LA:Ao ≥1.4 + LV diastolic dysfunction OR retrograde diastolic flow в descending aorta", "Только клиника", "Apgar score"],
            "answer": 1,
            "explanation": "hsPDA criteria: ductal size ≥1.5 мм, LA:Ao ratio ≥1.4, LV волемический overload, retrograde diastolic flow в descending aorta или mesenteric/cerebral arteries."
        },
        {
            "q": "Какая stardartnaya doza ibuprofen для PDA closure?",
            "options": ["1 мг/кг × 1", "10 мг/кг → 5 → 5 IV или PO (1 cycle)", "20 мг/кг q6h", "100 мг/кг"],
            "answer": 1,
            "explanation": "Ibuprofen IV: 10 мг/кг → 5 мг/кг через 24 ч → 5 мг/кг через 24 ч (1 cycle). Closure rate ~70-80%. Препарат выбора preterm (vs indomethacin — less side effects)."
        },
        {
            "q": "Paracetamol (acetaminophen) для PDA closure — доза?",
            "options": ["10 мг/кг q6h × 3 дня (PO/IV/rectal)", "15 мг/кг q6h × 3 дня (PO/IV/rectal)", "50 мг/кг q12h", "100 мг/кг × 1"],
            "answer": 1,
            "explanation": "Paracetamol (Hammerman 2011) 15 мг/кг q6h × 3 дня. Closure rate ~70%. Alternative когда NSAIDs contraindicated (renal impairment, thrombocytopenia, NEC, IVH)."
        },
        {
            "q": "Indomethacin доза для PDA?",
            "options": ["0.1 мг/кг × 1", "0.2 → 0.1 → 0.1 мг/кг IV q12-24h × 3 doses", "1 мг/кг q6h", "5 мг/кг"],
            "answer": 1,
            "explanation": "Indomethacin: первая доза 0.2 мг/кг IV → затем 0.1 мг/кг q12-24h (по age) × 2. Closure ~70%. More renal / GI side effects vs ibuprofen."
        },
        {
            "q": "При неэффективности 2 cycles medical closure — surgical ligation у каких preterm?",
            "options": ["Никогда", "Persistent hsPDA с failure to wean ventilator/CPAP, weight gain failure, или volume overload", "У всех premature", "Только after 3 года"],
            "answer": 1,
            "explanation": "Surgical PDA ligation reserved для: failed 2 medical cycles, persistent hsPDA с inability to wean respiratory support, congestive heart failure. Trial conservative management впервые."
        },
        {
            "q": "При conservative PDA management — fluid restriction цель?",
            "options": ["150-200 мл/кг/сут", "120-130 мл/кг/сут (fluid restrict)", "60 мл/кг/сут", "200+ мл/кг/сут"],
            "answer": 1,
            "explanation": "Fluid restriction 120-130 мл/кг/сут (vs unrestricted 150-160) при hsPDA — снижает LV preload + risk pulmonary edema. Diuretics (furosemide 1 мг/кг q12-24h) PRN."
        },
        {
            "q": "Какова probability of spontaneous PDA closure у preterm к 1 неделе life?",
            "options": ["10%", "30-50% у всех preterm — zavisит от GA, BW", "90%", "0%"],
            "answer": 1,
            "explanation": "У preterm spontaneous closure rate: GA<28 нед — ~30-40% к 1 неделе; GA 28-32 нед — 50-70%; GA>32 нед — 80-90%. Selective treatment vs prophylactic — current trend."
        },
        {
            "q": "Indomethacin contraindications у preterm?",
            "options": ["Никогда", "Active bleeding, severe thrombocytopenia (<50k), oliguria/AKI, NEC, IVH grade III-IV", "Только sepsis", "Только prematurity"],
            "answer": 1,
            "explanation": "NSAIDs (indomethacin/ibuprofen) contraindications: active bleeding, plt<50k, oliguria <0.6 мл/кг/ч, Cr>1.6, suspected/confirmed NEC, IVH III-IV. Paracetamol — alternative."
        },
        {
            "q": "Когда первый ECHO assessment PDA у preterm <30 нед?",
            "options": ["В первый час жизни", "День 3-7 (после initial transition) если clinical concern", "Только при выписке", "Никогда у preterm"],
            "answer": 1,
            "explanation": "Functional ECHO для hsPDA assessment after transition (day 3-7), если signs (murmur, bounding pulses, widened pulse pressure, failure to wean). Не routine у asymptomatic."
        }
    ],
    "quiz-cooling-protocol": [
        {
            "q": "Rewarming rate после 72 ч cooling?",
            "options": ["1-2°C/ч", "0.2-0.5°C/ч (slow rewarming)", "10°C/ч", "Active rewarming с heater"],
            "answer": 1,
            "explanation": "Rewarming ≤0.5°C/ч (passive). Rapid rewarming → ↑cerebral metabolism + risk seizures, hypotension, hyperthermia rebound. Целевая 36.5°C reached over 8-12 ч."
        },
        {
            "q": "Какие main contraindications TH?",
            "options": ["Минимальная depression", "Major chromosomal/lethal anomalies, intractable bleeding, head trauma, weight <1.8 kg, GA<36 нед", "Tachycardia", "Все NICU babies"],
            "answer": 1,
            "explanation": "TH absolute contraindications: lethal anomalies/major congenital, intractable bleeding, severe head trauma, weight <1800 g, GA<36 нед. Relative: severe IVH, sepsis (controversial)."
        },
        {
            "q": "Какие seizures markers во время cooling — EEG monitoring?",
            "options": ["Не нужен", "Continuous aEEG/EEG — monitoring 72 ч во время cooling + during rewarming", "Только symptomatic", "Только при apnea"],
            "answer": 1,
            "explanation": "TH protocol: continuous aEEG/EEG × 72 ч (electrographic seizures у 30-50% HIE). Subclinical seizures common. Treat persistent seizures → phenobarbital."
        },
        {
            "q": "Какова mortality reduction TH в moderate/severe HIE (NICHD/TOBY meta-analysis)?",
            "options": ["No reduction", "NNT 9 для death/severe disability prevention", "100% prevented", "Only 1% improvement"],
            "answer": 1,
            "explanation": "Cochrane meta-analysis: TH снижает death/major neurodevelopmental disability на 18 мес. NNT ≈ 9 (один \"saved\" на каждые 9 cooled). NNT 8 для death only."
        },
        {
            "q": "При BG (blood glucose) во время cooling — target?",
            "options": ["50-100 мг/дл", "Avoid hypo (<50) AND hyperglycemia (>150) — glucose 4-7 ммоль/л optimal", "<70 мг/дл", "200+ мг/дл"],
            "answer": 1,
            "explanation": "TH glucose: avoid hypoglycemia (<2.6 ммоль/л) AND hyperglycemia (>8 ммоль/л). Both worsen outcomes. Target 4-7 ммоль/л. Insulin при persistent >10 ммоль/л."
        },
        {
            "q": "При HIE с persistent acidosis после TH start — first action?",
            "options": ["Bicarbonate bolus", "Optimize ventilation/perfusion (correct hypoxia, hypotension, sepsis), avoid bicarb routinely", "Add adrenaline", "Lasix"],
            "answer": 1,
            "explanation": "Acidosis в HIE — metabolic + respiratory. Treat root cause: ventilation, perfusion, sepsis. Bicarbonate routinely NOT recommended (paradoxical CSF acidosis). Reserved для severe pH<7.0 + adequate ventilation."
        },
        {
            "q": "Какая optimal MAP у HIE-cooled newborn?",
            "options": ["<35 мм рт. ст.", "MAP 40-50 (40 minimum) для adequate cerebral perfusion", "MAP 70+", "Не контролируется"],
            "answer": 1,
            "explanation": "TH MAP target ≥40 мм рт. ст. для adequate cerebral perfusion в setting impaired autoregulation. Hypotension → dopamine 5-10 мкг/кг/мин ИЛИ dobutamine if cardiac dysfunction."
        },
        {
            "q": "Какие investigations после TH для outcome prediction?",
            "options": ["Только Apgar", "MRI brain @ day 4-7, EEG, neuro exam (Sarnat), aEEG patterns", "X-ray", "ABG only"],
            "answer": 1,
            "explanation": "Post-cooling assessment: MRI day 4-7 (DWI for ischemic injury), continuous aEEG, formal neurological exam (Sarnat). MRI scoring — PVL, BG/thalamic injury — strong predictors."
        },
        {
            "q": "Какие adjunctive therapies добавляют к TH в HIE?",
            "options": ["Только TH", "Erythropoietin (EPO), melatonin, allopurinol, xenon — research/limited clinical use", "All standard", "Только steroids"],
            "answer": 1,
            "explanation": "Adjunctive therapies в research/trial: EPO 1000 U/kg q48h (НЕОНАЛ trial — mixed results), melatonin (antioxidant), allopurinol, xenon (NDA). Not yet standard care."
        }
    ],
    "quiz-eos-puopolo": [
        {
            "q": "Kaiser EOS calculator inputs?",
            "options": ["Только Apgar", "GA, max maternal temp, ROM duration, GBS status, intrapartum ABX", "Birth weight only", "Apgar + GA only"],
            "answer": 1,
            "explanation": "Kaiser EOS calc inputs: gestational age, highest maternal temp intrapartum, duration ROM, GBS colonisation status, intrapartum ABX (type + duration). Output: EOS risk + management recommendation."
        },
        {
            "q": "Puopolo Tiered approach используется для?",
            "options": ["Term только", "Preterm GA<34 нед — категоризирует maternal risk + neonatal status", "Все newborns", "Только postnatal"],
            "answer": 1,
            "explanation": "Puopolo (Pediatrics 2017) Tiered approach у preterm <34 нед: high vs lower risk categories по maternal infectious risk factors (chorioamnionitis, GBS, fever) + neonatal clinical condition."
        },
        {
            "q": "При Kaiser EOS calc — risk ≥3/1000 что recommends?",
            "options": ["Discharge home", "Empiric ABX + cultures", "Только observation", "Vaccinate"],
            "answer": 1,
            "explanation": "Kaiser EOS recommendation: <1/1000 routine care; 1-3/1000 enhanced observation/blood culture; ≥3/1000 empiric ABX + blood culture. Cumulative neonatal status (well/equivocal/clinical illness) modifies."
        },
        {
            "q": "При adequate intrapartum prophylaxis (IAP) у GBS-pos матери — что для well-appearing newborn?",
            "options": ["Always treat", "Routine care + observation (no labs/ABX necessary)", "Cultures + 48 h ABX", "Discharge immediately"],
            "answer": 1,
            "explanation": "Adequate IAP (PCN/амп/цефазолин ≥4 ч до родов) + well-appearing infant — routine care, no labs/ABX. Vital sign monitoring per protocol. Adequate IAP снижает EOS GBS на 80%."
        },
        {
            "q": "Какой duration empiric ABX при negative cultures + clinical sepsis-like presentation?",
            "options": ["24 ч", "36-48 ч и stop если cultures negative + clinical improvement", "10 days", "21 day"],
            "answer": 1,
            "explanation": "If cultures negative + clinical improvement — stop empiric ABX 36-48 ч. Continued ABX exposure increases candidiasis, antibiotic resistance, dysbiosis (NEC risk у preterm)."
        },
        {
            "q": "При chorioamnionitis maternal — newborn management?",
            "options": ["No special action", "Increase EOS suspicion: full work-up + empiric ABX в зависимости от newborn presentation + Kaiser/Puopolo", "Only fever screen", "Only watch 24h"],
            "answer": 1,
            "explanation": "Maternal chorioamnionitis — EOS risk fact. Newborn approach: clinical status + Kaiser EOS calc. Если clinical signs — full work-up + empiric ABX. Otherwise enhanced observation — 36-48 ч."
        },
        {
            "q": "Какой empiric ABX у preterm <34 нед при подозрении EOS?",
            "options": ["Vanco + ceftriaxone", "Ampicillin + gentamicin (covers GBS, E.coli, Listeria)", "Meropenem", "Macrolide"],
            "answer": 1,
            "explanation": "Standard EOS у preterm: ампициллин + гентамицин (covers GBS, E.coli, Listeria — main EOS pathogens). Cefotaxime substitute если concern для CSF (ампи+гент vs amp+cefotaxime у meningitis)."
        },
        {
            "q": "Какова mortality early-onset sepsis у preterm <34 нед?",
            "options": ["<1%", "10-20%", "30-50%", ">90%"],
            "answer": 1,
            "explanation": "EOS preterm mortality 10-20% (vs term ~3%). Higher у GA<28 нед. GBS specifically — 5-10% term, 15-25% preterm. Meningitis worse outcome."
        },
        {
            "q": "При GBS-positive screening + ROM>18 ч + maternal fever + inadequate IAP — management?",
            "options": ["Routine care", "Full work-up: blood culture + CBC + CRP + empiric amp+gent (cover meningitis if signs)", "Only observation", "Discharge"],
            "answer": 1,
            "explanation": "Multi-factorial high risk EOS: full lab work-up + empiric ABX (amp+gent or amp+cefotaxime if meningitis concern). LP if symptomatic OR positive blood culture. Cover ≥48 ч pending cultures."
        }
    ],
    "quiz-feeding-vlbw": [
        {
            "q": "Optimal first feed для VLBW preterm?",
            "options": ["Formula", "Mom's own milk (preferred) > donor breast milk > preterm formula — trophic 10-20 мл/кг/сут", "TPN only", "Cow's milk"],
            "answer": 1,
            "explanation": "VLBW first feed: own mother's milk preferred (immunologic, NEC reduction, neurodevelopmental). Donor milk если MOM unavailable. Formula — last resort. Start trophic 10-20 мл/кг/сут from day 1-2."
        },
        {
            "q": "Advancement rate у stable VLBW (BW 1000-1500 г)?",
            "options": ["10 мл/кг/сут", "20-30 мл/кг/сут (medium pace)", "60 мл/кг/сут", "5 мл/кг/сут"],
            "answer": 1,
            "explanation": "VLBW stable: advance 20-30 мл/кг/сут после trophic phase. ELBW (<1000 г): 10-20 мл/кг/сут (slower). Reach full feeds 150-180 мл/кг/сут к day 7-14."
        },
        {
            "q": "Когда добавить HMF (Human Milk Fortifier) в milk?",
            "options": ["Day 1", "При volume ≥80-100 мл/кг/сут (typically week 1-2)", "После выписки", "Только при low BW"],
            "answer": 1,
            "explanation": "HMF при volume ≥80-100 мл/кг/сут. Standard fortification 4 г/100 мл (24 ккал/унц.). Targeted/adjustable fortification (по urea, growth) — individualized."
        },
        {
            "q": "Какова caloric target для VLBW growing preterm?",
            "options": ["80 ккал/кг/сут", "110-130 ккал/кг/сут (по ESPGHAN 2022)", "60 ккал/кг/сут", "200 ккал/кг/сут"],
            "answer": 1,
            "explanation": "ESPGHAN 2022: 110-130 ккал/кг/сут для adequate growth. Protein 3.5-4.5 г/кг/сут. Mix MOM + HMF — standard. Monitor weight, length, head circumference."
        },
        {
            "q": "Какова IUGR/SGA preterm advancement strategy?",
            "options": ["Faster than AGA", "Slow advancement (cautious): risk NEC + feeding intolerance higher", "Same as AGA", "TPN only"],
            "answer": 1,
            "explanation": "SGA с absent/reversed end-diastolic flow — higher NEC risk. Cautious advancement 15-20 мл/кг/сут. SIFT trial: faster advancement (30 мл/кг/сут) — no ↑ NEC у stable preterm."
        },
        {
            "q": "При gastric residuals у preterm — when concern?",
            "options": ["Любой residual = stop", "Bilious, blood-stained, OR >50% of prior feed in clinical context — investigate. Routine measurement не recommended.", "Only volume", "All residuals"],
            "answer": 1,
            "explanation": "Routine gastric residual measurement NOT recommended (Cochrane). “Concerning” residuals: bilious, hemorrhagic, OR very large in setting other signs (distention, lethargy, hemodynamic instability)."
        },
        {
            "q": "При full feeds attained — when stop TPN?",
            "options": ["Immediately at any volume", "When EN ≥ 120-140 мл/кг/сут с adequate caloric/protein delivery", "Day 1", "Only after discharge"],
            "answer": 1,
            "explanation": "Stop TPN at full EN ≥ 120-140 мл/кг/сут с adequate caloric (>110 ккал/кг/сут) + protein (>3 г/кг/сут) intake. Wean lipids first, then aminoacids, then glucose. Maintain CVL до 48 ч после wean."
        },
        {
            "q": "При formula intolerance у preterm — first-line alternative?",
            "options": ["Cow milk", "Hydrolysed protein formula (semi-elemental) ИЛИ donor milk", "Soy", "Goat milk"],
            "answer": 1,
            "explanation": "Formula intolerance: try (1) donor breast milk если available; (2) extensively hydrolysed (Pregestimil, Nutramigen) или amino acid-based (Neocate); (3) avoid soy/goat у preterm."
        },
        {
            "q": "Какой optimal time для starting probiotic у VLBW (для NEC prevention)?",
            "options": ["Никогда", "Trial показывают benefit при start с trophic feeds (Lactobacillus + Bifidobacterium combo)", "Day 30+", "After full feeds"],
            "answer": 1,
            "explanation": "ProPrems trial + Cochrane meta-analysis: probiotics (combo Lactobacillus + Bifidobacterium) с start trophic feeds снижает NEC, mortality, sepsis у VLBW. Не universally adopted (manufacturing variability)."
        }
    ],
    "quiz-rop-treatment": [
        {
            "q": "First ROP screen у preterm GA <30 нед?",
            "options": ["Day 1", "31 нед PMA OR 4 нед chronologic age (whichever later)", "При выписке", "1 month"],
            "answer": 1,
            "explanation": "AAP/AAO 2018: GA <27 нед — 31 нед PMA. GA 27-30 нед — 31 нед PMA OR 4 weeks chronologic. Re-examine каждые 1-3 нед до зрелости retina (zone III + no plus)."
        },
        {
            "q": "Type 1 ETROP criteria для treatment?",
            "options": ["Only stage 5", "Zone I any stage с plus, OR Zone I stage 3 без plus, OR Zone II stage 2/3 с plus", "Stage 1 only", "All ROP"],
            "answer": 1,
            "explanation": "Type 1 ROP (требует treatment): Zone I любая stage + plus disease, OR Zone I stage 3 без plus, OR Zone II stage 2/3 с plus. Treat в течение 48-72 ч."
        },
        {
            "q": "Какой treatment first-line для Type 1 ROP?",
            "options": ["Только cryotherapy", "Anti-VEGF intravitreal injection (bevacizumab/ranibizumab) для Zone I disease, laser для Zone II", "Steroids", "Surgery only"],
            "answer": 1,
            "explanation": "BEAT-ROP/RAINBOW trials: anti-VEGF (bevacizumab 0.625 мг IVT, ranibizumab 0.2 мг) — superior к laser для Zone I. Laser standard для Zone II. Cryotherapy historical."
        },
        {
            "q": "Какие risk factors для severe ROP?",
            "options": ["Only GA", "GA<28 нед + BW<1500 г + supplemental O₂ + sepsis + transfusions + IVH", "Only formula feeding", "Maternal age"],
            "answer": 1,
            "explanation": "ROP risk factors: prematurity (GA<28 нед = main), BW<1500 г, supplemental O₂ (high SpO₂ targets), sepsis, blood transfusions, IVH, BPD, slow growth. Multifactorial."
        },
        {
            "q": "При aggressive ROP (formerly AP-ROP) — что характерно?",
            "options": ["Slow progression", "Rapid progression в zone I-II posterior, severe plus disease, ill-defined demarcation, поражает ELBW", "Only term", "Always self-resolves"],
            "answer": 1,
            "explanation": "Aggressive ROP (A-ROP, ICROP3 2021): rapid posterior pole disease с severe plus, ill-defined demarcation между vascular/avascular retina. ELBW (<750 г) particularly at risk. Anti-VEGF preferred."
        },
        {
            "q": "Какой stop criteria для ROP screening?",
            "options": ["Никогда", "Zone III vascularization OR full mature retina × 2 visits OR post-treatment regression", "Только при выписке", "12 weeks"],
            "answer": 1,
            "explanation": "Stop ROP screening: full vascularization (zone III, no ROP), 2 consecutive exams. Post-treatment — regression of plus + neovascularization. Re-examine после treatment 1-2 нед."
        },
        {
            "q": "Каков outcome anti-VEGF treated ROP?",
            "options": ["Always cures", "Effective regression в zone I, но recurrence до 19% — extended follow-up до full vascularization (50+ нед PMA)", "100% blind", "No follow-up needed"],
            "answer": 1,
            "explanation": "Anti-VEGF: successful regression в Zone I 80-90%. Recurrence до 19% (BEAT-ROP). Continued screening required until full retinal vascularization — may take 50-60 нед PMA. Long-term safety still studied."
        },
        {
            "q": "При Stage 4-5 (retinal detachment) — treatment?",
            "options": ["Anti-VEGF only", "Vitrectomy (Stage 4A: lens-sparing; 4B/5: complex; outcomes guarded)", "Observation", "Glasses"],
            "answer": 1,
            "explanation": "Stage 4A (extrafoveal detachment) — lens-sparing vitrectomy, decent outcomes. Stage 4B-5 (subtotal/total RD) — complex vitrectomy, often poor visual outcomes. Prevention via timely treatment essential."
        },
        {
            "q": "Какова target SpO₂ у preterm для balancing ROP vs mortality (BOOST/SUPPORT trials)?",
            "options": ["80-85%", "91-95% (higher target reduces mortality, accepts modest ROP increase)", "100%", "<88%"],
            "answer": 1,
            "explanation": "BOOST/SUPPORT pooled: SpO₂ 91-95% target снижает mortality vs 85-89% (lower target had ↑ NEC + mortality). “High” target slightly ↑ ROP/treatment-required ROP. AAP recommends 90-95%."
        }
    ],
    "quiz-bpd-management": [
        {
            "q": "NIH 2018 BPD definition?",
            "options": ["Только X-ray", "FiO₂/respiratory support requirement at 36 нед PMA — graded I-III по supplement", "Apgar score", "Birth weight"],
            "answer": 1,
            "explanation": "NIH 2018: BPD evaluate at 36 нед PMA (или discharge whichever first). Grade I: nasal cannula <2 LPM или hood ≤0.30 FiO₂; II: ≥2 LPM или ≥0.30 FiO₂; III: invasive PPV или ≥0.30 + nCPAP/NIPPV."
        },
        {
            "q": "Caffeine prophylaxis (CAP trial) — outcome?",
            "options": ["No effect", "Снижает BPD, IQ improvement, severe disability у preterm", "Only short-term", "Increases mortality"],
            "answer": 1,
            "explanation": "CAP trial (Schmidt 2007, follow-up 2017): caffeine 20 мг/кг loading + 5-10 мг/кг maintenance → BPD reduction 36% → 11 yo improved cognitive/motor. Standard of care у GA<32 нед."
        },
        {
            "q": "DART (low-dose dexamethasone) scheme для severe BPD?",
            "options": ["Не используется", "0.075 мг/кг/сут × 3 дня, then taper, total 10 days, started after 7-14 дней postnatal у ventilated с BPD risk", "0.5 мг/кг q6h × 21 day", "Topical only"],
            "answer": 1,
            "explanation": "DART (Doyle 2006): низкодозовый dex 0.075 мг/кг/сут разделить q12h × 3 дня, taper to 0.05 → 0.025 → 0.01, total 10 дней. Reduces ventilator support без увеличения CP. Initiated после day 7."
        },
        {
            "q": "Какие main risk factors BPD?",
            "options": ["Только GA", "Prematurity (<32 нед) + birth weight <1500 g + prolonged O₂/PPV + chorioamnionitis + sepsis + PDA", "Maternal age", "Maternal diet"],
            "answer": 1,
            "explanation": "BPD risk: GA<32 нед (>50% у GA<28), BW<1500 г, prolonged O₂/PPV, chorioamnionitis (early lung injury), sepsis (postnatal inflammation), hsPDA (volume overload + edema), нутрициальный дефицит."
        },
        {
            "q": "BPD prevention strategies?",
            "options": ["Только surfactant", "Antenatal steroids + early CPAP/avoid intubation + caffeine + targeted O₂ (90-95%) + Vitamin A + adequate nutrition", "Only intubation", "PEEP only"],
            "answer": 1,
            "explanation": "BPD prevention bundle: antenatal steroids × mat, gentle ventilation (CPAP ± LISA → avoid intubation), caffeine для GA<32 нед, SpO₂ 90-95%, Vitamin A 5000 IU IM 3×/нед, optimal nutrition (protein, calories)."
        },
        {
            "q": "При BPD III (требует invasive ventilation на 36 нед) — long-term outcome?",
            "options": ["Always normal", "Higher risk respiratory morbidity (asthma-like, viral hospitalizations), neurodevelopmental impairment, mortality, growth failure", "Resolves spontaneously", "No impact"],
            "answer": 1,
            "explanation": "BPD III: ↑ risk severe respiratory morbidity (asthma), recurrent viral hospitalizations, NDD (CP, cognitive impairment), growth failure (additional caloric needs), pulmonary HTN. Mortality elevated."
        },
        {
            "q": "При BPD-PHTN — diagnostic test?",
            "options": ["X-ray only", "Echocardiogram (RV hypertrophy, septal flattening, TR jet, pulmonary artery pressure)", "ABG", "ESR"],
            "answer": 1,
            "explanation": "BPD-PHTN: echo screen at 36 нед PMA OR earlier при clinical suspicion (hypoxia despite O₂, RV strain). Findings: RVH, IVS flattening, TR jet, RV dilation. Catheterization gold standard если significant."
        },
        {
            "q": "Какой diuretic adjunct в severe BPD (not first-line)?",
            "options": ["Furosemide chronic", "Chronic diuretic (furosemide, hydrochlorothiazide+spironolactone) — limited evidence, used selectively с CHF/edema", "Mannitol", "Acetazolamide"],
            "answer": 1,
            "explanation": "Chronic diuretics в BPD — controversial: improve oxygenation short-term, no long-term benefit established. Reserved для severe BPD с edema/CHF/pulmonary congestion. Furosemide nephrocalcinosis risk."
        },
        {
            "q": "Какова mortality severe BPD discharged on home O₂?",
            "options": ["<1%", "5-15% к 2 годам (resp morbidity, infection, PHTN)", "50%", "100%"],
            "answer": 1,
            "explanation": "BPD severe (home O₂) post-discharge mortality 5-15% к 2 yo. Causes: viral infections (RSV preventable via palivizumab), pulmonary HTN crises, sudden death. Multidisciplinary follow-up essential."
        }
    ],
    "quiz-glucose-thresholds": [
        {
            "q": "PES 2015 hypoglycemia threshold для symptomatic newborn (term, <24 ч)?",
            "options": ["<2.0 ммоль/л (35 мг/дл)", "<2.6 ммоль/л (47 мг/дл) — symptomatic OR <2.0 asymptomatic первые 4 ч", "<3.5 ммоль/л", "<5 ммоль/л"],
            "answer": 1,
            "explanation": "PES 2015: при symptoms BG <2.6 ммоль/л (47 мг/дл) — treat. Asymptomatic first 4 ч <2.0 — feed/D10. После 24 ч target ≥2.8-3.3 ммоль/л."
        },
        {
            "q": "BAPM 2017 threshold (UK)?",
            "options": ["<1.0", "<2.0 ммоль/л — at risk infant", ">5.0", "<10.0"],
            "answer": 1,
            "explanation": "BAPM 2017: at-risk infants (preterm, IDM, SGA, LGA) BG <2.0 ммоль/л — management trigger. ≥2.0 acceptable. Different thresholds vs PES (2.6) for symptomatic."
        },
        {
            "q": "При persistent hypoglycemia после 48 ч — критическое sample?",
            "options": ["Только BG", "BG + insulin + C-peptide + cortisol + GH + ketones + free fatty acids + lactate + ammonia при event hypoglycemia", "Только cortisol", "Only urine"],
            "answer": 1,
            "explanation": "Critical sample при BG<2.6 ммоль/л: insulin, C-peptide, cortisol, GH, beta-hydroxybutyrate, FFA, lactate, ammonia, urine ketones, urine reducing substances. Helps differentiate causes (HI vs cortisol/GH deficiency vs FAOD)."
        },
        {
            "q": "Glucagon stimulation test — when и интерпретация?",
            "options": ["Никогда у newborn", "При persistent hypoglycemia: glucagon 0.03 mg/kg IV/IM — BG rise ≥2 ммоль/л = preserved liver glycogen + insulin excess (HI)", "Only adults", "Daily"],
            "answer": 1,
            "explanation": "Glucagon stim test: BG rise ≥30 мг/дл (1.7 ммоль/л) после glucagon = inappropriate insulin secretion (HI). HI confirmed: detectable insulin (>2 µIU/mL) при hypoglycemia + low FFA/ketones."
        },
        {
            "q": "Hyperinsulinism (HI) treatment first-line?",
            "options": ["Только feeds", "Diazoxide 5-15 мг/кг/сут разделить q8h", "Insulin", "Никогда не лечить"],
            "answer": 1,
            "explanation": "Diazoxide — first-line congenital HI: opens K-ATP channel → inhibits insulin release. Doses 5-15 мг/кг/сут q8h. Side effects: fluid retention, hypertrichosis. Failure response → octreotide."
        },
        {
            "q": "Glucose bolus при symptomatic hypoglycemia (BG<2.6)?",
            "options": ["1 мл/кг D50", "2 мл/кг D10 IV bolus, then GIR 6-8 мг/кг/мин continuous", "10 мл/кг D5", "Никогда не давать"],
            "answer": 1,
            "explanation": "Mini-dextrose 2 мл/кг D10 IV → 200 мг/кг → BG rise. Затем continuous GIR 6-8 мг/кг/мин. NEVER D50 (peripheral vein → phlebitis). Recheck BG через 30 мин."
        },
        {
            "q": "Какие риски HIE при severe hypoglycemia?",
            "options": ["Только seizures", "Long-term neurodevelopmental impairment + occipital lobe injury (MRI)", "No long-term risk", "Only short-term"],
            "answer": 1,
            "explanation": "Severe/recurrent hypoglycemia (<1.0 ммоль/л + symptoms): occipital lobe injury (MRI hyperintensity), neurodevelopmental impairment, learning disability. Tight glycemic control critical у at-risk."
        },
        {
            "q": "Hyperglycemia threshold у preterm?",
            "options": ["BG >7", "BG >10 ммоль/л (180 мг/дл)", "BG >5", "BG >25"],
            "answer": 1,
            "explanation": "Hyperglycemia preterm: BG >10 ммоль/л (180 мг/дл). Causes: stress, sepsis, excessive GIR, immature insulin response. Management: lower GIR (но not <4), insulin reserved для persistent BG>14 ммоль/л."
        },
        {
            "q": "Какова частота transient neonatal hypoglycemia у at-risk newborn (IDM, LGA, SGA, preterm)?",
            "options": ["1%", "10-20%", "60-80% IDM, 30-50% other at-risk", "100%"],
            "answer": 2,
            "explanation": "IDM hypoglycemia 60-80% (transient HI). LGA 30-50%, SGA 30%, preterm 10-15%. Most resolve в первые 24-48 ч с feeds. Persistent (>48 ч) → workup для congenital HI."
        }
    ],
    "quiz-coag-thrombocytopenia": [
        {
            "q": "Vitamin K1 prophylaxis для VKDB — dose?",
            "options": ["0.1 мг IM", "1 мг IM × 1 (BW>1000 г), 0.5 мг (BW<1000 г)", "5 мг", "PO only"],
            "answer": 1,
            "explanation": "VKDB prevention: 1 мг IM × 1 в первый час (BW>1000 г), 0.5 мг IM (<1000 г). PO regimens — less effective, multiple doses needed. IM single dose protects all 3 forms VKDB (early/classic/late)."
        },
        {
            "q": "Late VKDB — when и presentation?",
            "options": ["Day 1", "2-12 нед, exclusively breastfed без vitamin K, intracranial hemorrhage common", "1 year", "Only term"],
            "answer": 1,
            "explanation": "Late VKDB (2-12 нед): exclusively breastfed (BM low в vit K) без prophylaxis, often с liver disease/malabsorption. Intracranial hemorrhage 50-80% → mortality 15-25%, neuro sequelae у survivors."
        },
        {
            "q": "PlaNeT-2 trial threshold для платочкной transfusion у preterm?",
            "options": ["Plt < 50,000", "Plt < 25,000 для prophylactic transfusion (lower threshold reduces death/major bleed)", "Plt < 100,000", "Никогда"],
            "answer": 1,
            "explanation": "PlaNeT-2 (Curley NEJM 2019): prophylactic platelet transfusion при Plt<25k (vs <50k) → less death + major bleeding в preterm. Active bleeding: keep Plt >50k. Surgery: >100k."
        },
        {
            "q": "NAIT (neonatal alloimmune thrombocytopenia) — pathogenesis?",
            "options": ["Mat T cells", "Maternal antibodies против paternal-derived platelet antigens (HPA-1a most common 80%)", "Autoimmune", "Random"],
            "answer": 1,
            "explanation": "NAIT: maternal IgG antibodies против paternal platelet antigens. HPA-1a (PlA1) — 80% case Caucasians. Severe thrombocytopenia (<50k common, often <20k). ICH 10-20%, may be antenatal (in utero)."
        },
        {
            "q": "При NAIT с severe thrombocytopenia + bleeding — treatment?",
            "options": ["Любые platelets OK", "HPA-compatible platelets (PLA1-negative), IVIG 1 г/кг × 1-2 doses, methylpred PRN", "Vit K only", "Steroids only"],
            "answer": 1,
            "explanation": "NAIT severe (Plt<30k или bleeding): HPA-1a-negative (or maternal washed) platelets — preferred. IVIG 1 г/кг q24h 1-2 doses + methylpred. Random platelets — if HPA-typed not immediately available, transient response."
        },
        {
            "q": "Disseminated intravascular coagulation (DIC) у newborn — labs?",
            "options": ["Только PT", "PT/aPTT prolonged + fibrinogen low + D-dimer elevated + thrombocytopenia + schistocytes", "Только plt", "Normal labs"],
            "answer": 1,
            "explanation": "DIC labs: ↑PT/aPTT, ↓fibrinogen (<150 мг/дл), ↑D-dimer, thrombocytopenia, schistocytes на blood smear. Score-based diagnosis (ISTH). Treat underlying (sepsis, asphyxia) + replace (FFP, cryo, plt)."
        },
        {
            "q": "Стартовая doza FFP для coagulopathy?",
            "options": ["5 мл/кг", "10-15 мл/кг IV", "30 мл/кг", "100 мл/кг"],
            "answer": 1,
            "explanation": "FFP 10-15 мл/кг IV — corrects mild-moderate coagulopathy. Repeat q8-12h PRN. Cryoprecipitate 10 мл/кг для fibrinogen <100 мг/дл. PCC reserved для severe bleeding с known factor deficits."
        },
        {
            "q": "При hemophilia A confirmed у newborn boy с family history — ICH risk?",
            "options": ["No risk", "1-4% ICH risk — avoid IM injections, vaginal delivery if possible, factor VIII при bleeding", "100%", "Only after 1 year"],
            "answer": 1,
            "explanation": "Severe hemophilia A: ICH risk 1-4% perinatal. Recommend C-section при positive family history (controversial). NO IM injections (use SC or oral для vit K). Factor VIII если bleeding (50 IU/кг IV → 100% activity)."
        },
        {
            "q": "Heparin-induced thrombocytopenia (HIT) у newborn?",
            "options": ["Common", "Rare in newborn (<1%) — different antigen presentation; heparin alternative agents argatroban", "Always", "Only term"],
            "answer": 1,
            "explanation": "HIT редко в neonates (<1%). Если suspect: discontinue heparin, switch на argatroban (direct thrombin inhibitor) или bivalirudin. Не давать LMWH/fondaparinux при HIT (cross-reactivity)."
        }
    ],
    "quiz-cyanosis-shock": [
        {
            "q": "Hyperoxia test при подозрении cyanotic CHD?",
            "options": ["100% O₂ × 5 мин, ABG — PaO₂ <100 → cyanotic CHD vs >150 → lung disease", "100% O₂ × 10-15 мин, ABG — PaO₂ <150 → cyanotic CHD; >150 → lung disease", "Oxymetry only", "Никогда"],
            "answer": 1,
            "explanation": "Hyperoxia test: 100% FiO₂ × 10-15 мин, ABG. PaO₂ (right radial) <150 (часто <100) → cyanotic CHD (R-to-L shunting). >150 → lung pathology. <50 — PPHN или severe lung disease."
        },
        {
            "q": "Reverse differential SpO₂ (foot > right hand) — суgering?",
            "options": ["Normal", "Transposition of great arteries (TGA) с PPHN — R-to-L PDA shunt directing oxygenated blood к lower extremities", "Sepsis", "PDA without other CHD"],
            "answer": 1,
            "explanation": "Reverse differential SpO₂ (foot > RH) — pathognomonic для TGA с PPHN: through PDA blood from systemic R-to-L shunt directs oxygenated to lower body (descending aorta). Stat echo + start PGE1."
        },
        {
            "q": "Cold (vasoconstricted) shock — типичные signs?",
            "options": ["Bounding pulses", "Cold extremities, prolonged CR (>3-4 sec), narrow pulse pressure, hypotension late", "Warm flushed skin", "High urine output"],
            "answer": 1,
            "explanation": "Cold shock: vasoconstricted, peripheral hypoperfusion (cool extremities, mottled), prolonged capillary refill, narrow pulse pressure. Common in newborns. Treatment: fluids ± inotropes (dopamine → epinephrine)."
        },
        {
            "q": "Warm shock — signs + treatment?",
            "options": ["Cold extremities", "Vasodilated, bounding pulses, wide pulse pressure, warm extremities — vasopressin/norepinephrine", "Same as cold", "Только fluids"],
            "answer": 1,
            "explanation": "Warm shock: vasodilated (warm extremities), bounding pulses, wide pulse pressure, low SVR. Common late sepsis. Vasopressors: norepinephrine first OR vasopressin (selective vasoconstrictor) если refractory."
        },
        {
            "q": "Stat treatment cyanotic CHD newborn?",
            "options": ["Discharge", "PGE1 0.05-0.1 мкг/кг/мин IV (maintains PDA patency) + cardiology consult + transfer", "Only oxygen", "Surgery in 1 hour"],
            "answer": 1,
            "explanation": "Cyanotic CHD presumed (failed hyperoxia, decompensation): PGE1 (Prostin) 0.05-0.1 мкг/кг/мин IV continuous. Maintains DA patency. Side effects: apnea (be ready to intubate), fever, jitteriness."
        },
        {
            "q": "При duct-dependent congenital heart lesion — closing PDA produces?",
            "options": ["No effect", "Cardiovascular collapse, profound cyanosis, metabolic acidosis, hypotension, death", "Improvement", "Only mild change"],
            "answer": 1,
            "explanation": "Duct-dependent lesions (HLHS, IAA, critical AS, TGA without VSD, pulmonary atresia): PDA closure → obstruction systemic/pulmonary blood flow → cardiovascular collapse, severe acidosis, death без PGE1."
        },
        {
            "q": "Какова empiric ABX для presumed septic shock в newborn?",
            "options": ["Только гентамицин", "Ампициллин + гентамицин (early-onset) OR vanco + cefepime (late-onset) — широкий спектр + early administration <1 hr", "Только meropenem", "Cycloserine"],
            "answer": 1,
            "explanation": "Septic shock newborn: empiric ABX в течение 1 ч (every 1-h delay ↑ mortality). EOS: amp + gent. LOS: vanco + cefepime/gent. Tailor culture-driven. Adjunct: fluids 10-20 мл/кг bolus, inotropes, hydrocortisone refractory."
        },
        {
            "q": "Какие метаболические abnormalities у septic shock newborn?",
            "options": ["Нет", "Lactic acidosis + hypoglycemia + electrolyte derangements + DIC", "Только hyperglycemia", "Normal labs"],
            "answer": 1,
            "explanation": "Septic shock metabolic: lactic acidosis (hypoperfusion), hypoglycemia (depleted glycogen), Na/K disturbance, hypocalcemia, DIC. Monitor glucose, lactate, ABG, electrolytes, coags q4-6h initially."
        },
        {
            "q": "Refractory hypotension despite fluids + 2 inotropes — next step?",
            "options": ["Higher inotropes only", "Hydrocortisone 1 мг/кг IV q6-8h (relative adrenal insufficiency) + workup для obstructive shock (PE, tamponade), CHD", "Only fluids", "Steroids contraindicated"],
            "answer": 1,
            "explanation": "Catecholamine-resistant shock: hydrocortisone 1 мг/кг q6-8h IV (relative adrenal insufficiency у septic preterm). Workup: echo для tamponade/PE/CHD, lactate trend, perfusion. Add vasopressin для warm shock."
        }
    ],
    "quiz-extubation": [
        {
            "q": "Extubation readiness criteria для preterm <1000 г?",
            "options": ["Только PIP", "MAP ≤7-8, FiO₂ ≤0.30, RR<60, no significant apnea, hemodynamic stability, weight gain", "Только weight", "Apgar"],
            "answer": 1,
            "explanation": "Extubation readiness: MAP ≤7-8 cm H₂O, FiO₂ ≤0.30, RR <60 spontaneous, normal pH/PCO₂, hemodynamic stable, weight gain, on caffeine. Spontaneous breathing trial (SBT) optional."
        },
        {
            "q": "Optimal post-extubation support у ELBW (<1000 г)?",
            "options": ["Room air", "NIPPV (non-invasive PPV) reduces re-intubation vs NCPAP в ELBW", "Only nasal cannula", "Re-intubate"],
            "answer": 1,
            "explanation": "Cochrane meta-analysis: NIPPV (synchronized или non-syn) > NCPAP в ELBW для preventing re-intubation. Settings: PIP 16-18, PEEP 5-6, RR 10-30. Каффеин с loading доза 20 мг/кг до extubation."
        },
        {
            "q": "Caffeine loading dose до extubation?",
            "options": ["1 мг/кг", "20 мг/кг IV/PO (then maintenance 5-10 мг/кг q24h)", "100 мг/кг", "0.1 мг/кг"],
            "answer": 1,
            "explanation": "Caffeine loading 20 мг/кг IV/PO в течение 30-60 мин до planned extubation, далее maintenance 5-10 мг/кг q24h. Snizhayet apnea of prematurity, BPD, improves extubation success."
        },
        {
            "q": "При chest X-ray до extubation — что искать?",
            "options": ["Опухоли", "Atelectasis, BPD pattern, ETT position, residual RDS, pneumothorax — assess parenchymal status", "Только heart size", "Ничего"],
            "answer": 1,
            "explanation": "Pre-extubation CXR (если recent): atelectasis (recruit?), BPD pattern, ETT position. Не routine. Failed extubation common причины: atelectasis, persistent BPD, neurological apnea, sepsis, hsPDA."
        },
        {
            "q": "Spontaneous breathing trial (SBT) — settings + duration?",
            "options": ["10 минут endotracheal CPAP 4 cm", "ETT-CPAP 5 cm H₂O × 30-60 мин (sometimes T-piece)", "Никогда у preterm", "60 мин на full vent"],
            "answer": 1,
            "explanation": "SBT preterm: ETT-CPAP 5-6 cm H₂O 30 мин (or T-piece). Tolerated SBT predicts extubation success. Не universally adopted в preterm — protocols vary; weight-based protocol common."
        },
        {
            "q": "Failed extubation rates у preterm ELBW?",
            "options": ["<1%", "30-40% — commonly require re-intubation", "100%", "10%"],
            "answer": 1,
            "explanation": "ELBW failed extubation 30-40%. Causes: atelectasis, BPD progression, apnea, hsPDA, sepsis, exhaustion. Recent failure не contra повторных extubations — try optimization (caffeine loading, post-extubation NIPPV)."
        },
        {
            "q": "Post-extubation stridor / upper airway obstruction — management?",
            "options": ["Re-intubate immediately", "Racemic epinephrine nebulizer 0.5 мл of 2.25% в 3 мл NaCl + dexamethasone 0.5 мг/кг IV; reintubate если no response", "Just observe", "Steroids only"],
            "answer": 1,
            "explanation": "Subglottic edema (stridor): racemic epi nebulizer + dexamethasone IV 0.5 мг/кг. Если persistent stridor + respiratory distress → reintubation, ENT consult, possible bronchoscopy."
        },
        {
            "q": "Когда extubate на high-flow nasal cannula vs NCPAP/NIPPV?",
            "options": ["HFNC always", "HFNC может быть substitute для NCPAP в late preterm/term, но в ELBW NIPPV/NCPAP — preferred", "Only HFNC у ELBW", "Никогда"],
            "answer": 1,
            "explanation": "HFNC у preterm: comparable к NCPAP в late preterm/moderate preterm для prevent reintubation. ELBW: NIPPV first-line. HFNC easier нос-care, less septal trauma. Choose by individual response."
        },
        {
            "q": "При prolonged intubation (>14 day) у preterm — what risk?",
            "options": ["Никаких", "BPD progression, subglottic stenosis, infection (VAP), nutritional impact, neurological", "Only short-term", "Only weight loss"],
            "answer": 1,
            "explanation": "Prolonged intubation risks: BPD progression (volutrauma/biotrauma), VAP, subglottic stenosis (5-10% post extubation у preterm), feeding intolerance (sedation), neurological impact. Aggressive de-escalation важен."
        },
        {
            "q": "При re-intubation — какие optimal sedation/analgesia?",
            "options": ["Никаких медикаментов", "Морфин 0.05-0.1 мг/кг + atropine 0.02 мг/кг + suxamethonium ИЛИ rocuronium для RSI — минимизирует bradycardia/desat", "Только атракурий", "Awake intubation always"],
            "answer": 1,
            "explanation": "Premedicated intubation: opioid (fentanyl 1-2 мкг/кг или morphine 0.05-0.1 мг/кг) + atropine 0.02 мг/кг (анти-vagal) + paralytic (rocuronium 0.6 мг/кг или suxamethonium 1-2 мг/кг). Reduces bradycardia, desats, ICP rises."
        }
    ],
    "quiz-cardiac-defects-screening": [
        {
            "q": "CCHD pulse oximetry screening — когда?",
            "options": ["В первые 6 ч", "После 24 ч жизни (24-48 ч optimal)", "При выписке только", "1 неделя"],
            "answer": 1,
            "explanation": "AAP-CCHD: pulse oxим screen 24-48 ч жизни. До 24 ч — transitional circulation → false-positives 1.6%. После 24 ч — 0.4%. Универсальный screening since 2011 в США."
        },
        {
            "q": "Pulse ox sites?",
            "options": ["Только одна нога", "Pre-ductal (right hand) AND post-ductal (any foot)", "Только правая рука", "Foot only"],
            "answer": 1,
            "explanation": "CCHD screen: pre-ductal (RH) + post-ductal (foot). Differential >3% suggests R-to-L PDA shunt (cyanotic CHD with low post-ductal SpO₂) or reverse differential (TGA + PPHN)."
        },
        {
            "q": "Failed CCHD screen criteria?",
            "options": ["<95% one site once", "SpO₂<90% любой site, OR <95% оба site × 3 measurements 1 hr apart, OR ≥3% разница RH vs foot × 3", "Only <85%", "<99% always"],
            "answer": 1,
            "explanation": "Failed: SpO₂<90% любой site immediately, OR <95% оба site × 3 1-hr-apart measurements, OR ≥3% разница RH vs foot × 3. Failed → stat echo + cardiology."
        },
        {
            "q": "Какие CHDs caught by pulse ox screening?",
            "options": ["Все CHD", "Cyanotic CHDs primarily: HLHS, TGA, TOF, total anomalous venous return, tricuspid atresia, truncus, pulmonary atresia (~7 critical lesions)", "Только VSD", "Только PDA"],
            "answer": 1,
            "explanation": "Pulse ox screening targets 7 critical CHDs causing hypoxia: HLHS, TGA, TOF, total anomalous pulmonary venous return, tricuspid atresia, truncus arteriosus, pulmonary atresia. Coarctation — не reliably detected."
        },
        {
            "q": "Sensitivity pulse ox screening для critical CHD?",
            "options": ["20%", "~76% (combined с antenatal echo + clinical exam — overall ~85-90%)", "100%", "10%"],
            "answer": 1,
            "explanation": "Pulse ox alone sensitivity ~76% (Thangaratinam 2012 Cochrane). Combined screening (fetal echo + postnatal exam + pulse ox) — 85-90%. Coarctation, AS — missed by pulse ox."
        },
        {
            "q": "При positive screen — workup?",
            "options": ["Discharge", "Stat echocardiogram (best ASAP) + cardiology eval; CXR + ECG могут add", "X-ray only", "Только observation 24 ч"],
            "answer": 1,
            "explanation": "Failed pulse ox → stat echo (gold standard для CHD diagnosis), cardiology consult. CXR/ECG complementary. Если echo normal — evaluate for sepsis, lung disease, methemoglobinemia."
        },
        {
            "q": "False-positive причины pulse ox screen?",
            "options": ["Только CHD", "Sepsis, lung disease (RDS, MAS, pneumothorax), persistent fetal circulation/PPHN, met-Hb, screen <24 ч (transition)", "Никаких", "Только artifact"],
            "answer": 1,
            "explanation": "False-positive причины: sepsis, RDS/MAS/pneumothorax, PPHN, met-Hb, motion artifact, screening <24 ч (transitional circulation). Каждый failed — echocardiogram + comprehensive eval."
        },
        {
            "q": "Antenatal CHD detection rate в эру routine 2D + Doppler echocardiography?",
            "options": ["10%", "30-50% общих CHD; 60-70% major/critical CHD при experienced operator", "100%", "0%"],
            "answer": 1,
            "explanation": "Antenatal echo CHD detection: 30-50% all CHD, 60-70% critical/major (HLHS, complete AVSD). Quality dependent on operator/equipment. Improving с time. Не replace postnatal screen."
        },
        {
            "q": "При CCHD diagnosed prenatally — delivery management?",
            "options": ["Routine community hospital", "Plan delivery в tertiary center с cardiac surgical capability + neonatology + cardiology", "Только home", "Без plan"],
            "answer": 1,
            "explanation": "Prenatal CHD: deliver в quaternary center с cardiac surgery (PCICU), pediatric cardiology, NICU. Avoid transport critical newborn. Plan PGE1 на стол если duct-dependent. Multidisciplinary planning."
        },
        {
            "q": "Какова mortality untreated critical CHD без screening?",
            "options": ["10%", "30-40% в первые недели жизни", "1%", "100%"],
            "answer": 1,
            "explanation": "Critical CHD untreated mortality 30-40% в первые недели/месяцы (sudden death post-discharge при closing PDA). Pulse ox screen early detection + treatment → mortality reduction by 60% за screened CHDs."
        }
    ],
    "quiz-nas-ess": [
        {
            "q": "Modified Finnegan score (MOTHER NAS) — pharmacological treatment threshold?",
            "options": ["Score ≥3", "Score ≥8 × 3 consecutive scores OR ≥12 × 2 consecutive", "Score ≥1", "Score ≥20"],
            "answer": 1,
            "explanation": "Modified Finnegan/MOTHER NAS: pharm treatment если score ≥8 × 3 consecutive (q3-4h) OR ≥12 × 2 consecutive. Non-pharm bundling first (skin-to-skin, breastfeeding, swaddling, low-stim environment)."
        },
        {
            "q": "Eat-Sleep-Console (ESC) approach — что оценивает?",
            "options": ["Только weight", "Functional assessment: ребёнок eats ≥1 oz, sleeps ≥1 hour, consoles ≤10 min — три критерия", "Score numerical", "Только sleep"],
            "answer": 1,
            "explanation": "ESC: function-based vs symptom-tally. Treat если не достигает: eat ≥1 oz formula или 10 мин breastfeeding, sleep ≥1 ч undisturbed, console ≤10 мин. Reduced LOS, opioid use vs Finnegan-driven по several studies."
        },
        {
            "q": "First-line pharmacotherapy NAS?",
            "options": ["Methadone IV", "Morphine PO 0.04-0.1 мг/кг q3-4h (titrate); methadone alternative; buprenorphine emerging", "Phenobarbital first", "Clonidine alone"],
            "answer": 1,
            "explanation": "AAP first-line NAS: morphine PO 0.04-0.1 мг/кг q3-4h, titrate. Methadone — alternative (longer half-life, q6-12h). Buprenorphine SL — emerging (BBORN trial: shorter LOS vs morphine). Clonidine adjunct (α2-agonist)."
        },
        {
            "q": "BBORN trial (buprenorphine vs morphine) outcome?",
            "options": ["Morphine лучше", "Sublingual buprenorphine — shorter treatment duration + LOS vs morphine у NAS opioid-exposed", "No difference", "Buprenorphine — more side effects"],
            "answer": 1,
            "explanation": "BBORN (Kraft NEJM 2017): SL buprenorphine — median treatment duration 15 дней vs 28 (morphine), LOS 21 vs 33 дней. Shorter duration + less drug exposure. Becoming standard в NAS centers."
        },
        {
            "q": "Maternal opioid use disorder — NAS rate?",
            "options": ["1%", "55-94% всех opioid-exposed neonates develop NAS, varies by drug + dose", "100%", "10%"],
            "answer": 1,
            "explanation": "NAS rate: methadone-exposed 60-80%, buprenorphine 50-60%, heroin 50-80%, prescription opioids variable. Time onset varies (heroin 24-48 ч, methadone 3-7 дней, buprenorphine 1-4 дня)."
        },
        {
            "q": "Non-pharmacological care bundles?",
            "options": ["Только swaddling", "Skin-to-skin, breastfeeding, low-stim environment (dim, quiet), swaddling, rooming-in, parent involvement, gentle care", "Hospital crib only", "Pacifier only"],
            "answer": 1,
            "explanation": "Non-pharm NAS bundle: maternal rooming-in, skin-to-skin, breastfeeding (exclusive если no contraindication, e.g., HIV or polysubstance), swaddling, low-stim environment, pacifier. Snizhayet need pharm treatment 30-50%."
        },
        {
            "q": "Какое co-substance использование maternal worsens NAS?",
            "options": ["No effect", "Tobacco, benzodiazepines, SSRIs, polysubstance — ↑ severity, atypical presentation", "Только cannabis", "Только alcohol"],
            "answer": 1,
            "explanation": "Co-substance: tobacco — worsens (lower BW + neurotoxicity), benzodiazepines + opioids — prolonged + atypical (sedation alternating с irritability), SSRIs — hyperactivity, jitteriness. Polypharm common."
        },
        {
            "q": "Discharge criteria NAS-treated newborn?",
            "options": ["Только weight gain", "Stable off pharm × 24-48 ч, adequate feeding/weight gain, follow-up arranged (developmental, social, peds)", "Pharm therapy continued", "Day 1"],
            "answer": 1,
            "explanation": "NAS discharge: pharm treatment off × 24-48 ч without rescue, adequate feeding (not too sleepy), weight gain trajectory, social work eval, pediatric follow-up + developmental clinic, наркорегистр if applicable."
        },
        {
            "q": "Какие long-term outcomes NAS-exposed children?",
            "options": ["Normal", "↑ risk neurodevelopmental delay, ADHD, learning difficulties, behavioral disorders — multifactorial (drug ± social environment)", "100% disability", "Identical к peers"],
            "answer": 1,
            "explanation": "NAS long-term: ↑ risk delays language, motor, ADHD, learning. Multifactorial — prenatal drug exposure + post-natal social stressors + parental relationship. Wraparound services (PT/OT, behavioral health, social work) improve outcomes."
        },
        {
            "q": "Какие заболевания screen у NAS у matери с opioid use?",
            "options": ["Только HIV", "HIV + Hepatitis B/C + STI screen + tobacco + co-substances + social work + psych eval", "Cardiac echo", "Only X-ray"],
            "answer": 1,
            "explanation": "Maternal/neonatal screening при OUD: HIV + HepB + HepC + RPR/syphilis + chlamydia/gonorrhea, urine toxicology, tobacco, depression screen, social work, custody planning. Постдоставкa: HepB vaccine + immunoglobulin if HBsAg+, HIV treatment guidelines if maternal+."
        }
    ]
}

def main() -> None:
    data = json.loads(PATH.read_text(encoding='utf-8'))
    added_total = 0
    skipped_total = 0
    for quiz in data['quizzes']:
        new_qs = NEW_QUESTIONS.get(quiz['id'])
        if not new_qs:
            continue
        existing_q_texts = {q['q'].strip().lower() for q in quiz['questions']}
        before = len(quiz['questions'])
        for nq in new_qs:
            if nq['q'].strip().lower() in existing_q_texts:
                skipped_total += 1
                continue
            quiz['questions'].append(nq)
            existing_q_texts.add(nq['q'].strip().lower())
            added_total += 1
        after = len(quiz['questions'])
        print(f"  {quiz['id']:35s} {before:2d} -> {after:2d}")
    data['version'] = '1.3.0'
    data['lastUpdated'] = '2026-05-10'
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"\nTotal added: {added_total}, skipped (duplicate): {skipped_total}")

if __name__ == '__main__':
    main()
