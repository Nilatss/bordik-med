# Все инструменты Bordik Med

Всего: **732** инструментов в **22** разделах. Сгенерировано из `public/tools-data/*.json` 2026-05-04.

Поля:
- **ID** — slug, используется в URL `/tools/<id>`
- **Название** — отображаемое имя на странице инструмента
- **Подраздел** — узкая группа в рамках категории
- **Тип** — `calculator` (формула) или `score` (балльная шкала)
- **Страны** — клинический гайдлайн / регион применения
- **Runner** — есть ли интерактивная реализация (`yes`/`no`)

## Содержание

- [1. Клинические калькуляторы](#1-клинические-калькуляторы) — 49
- [10. Онкология](#10-онкология) — 31
- [11. Инфекционные болезни](#11-инфекционные-болезни) — 17
- [12. Нефрология и урология](#12-нефрология-и-урология) — 13
- [13. Пульмонология](#13-пульмонология) — 11
- [14. Фармакология и лекарства](#14-фармакология-и-лекарства) — 16
- [15. Лабораторная медицина](#15-лабораторная-медицина) — 32
- [16. Справочники и классификаторы](#16-справочники-и-классификаторы) — 16
- [17. Протоколы экстренной помощи](#17-протоколы-экстренной-помощи) — 26
- [18. Учебные инструменты](#18-учебные-инструменты) — 15
- [19. Региональные стандарты](#19-региональные-стандарты) — 29
- [2. Диагностические шкалы](#2-диагностические-шкалы) — 59
- [20. Ветеринарная медицина](#20-ветеринарная-медицина) — 16
- [21. Стоматология](#21-стоматология) — 25
- [22. Прочие специальности](#22-прочие-специальности) — 72
- [3. Педиатрические инструменты](#3-педиатрические-инструменты) — 39
- [4. Кардиология и сосуды](#4-кардиология-и-сосуды) — 46
- [5. Неврология и нейрохирургия](#5-неврология-и-нейрохирургия) — 58
- [6. Анестезиология и ICU](#6-анестезиология-и-icu) — 41
- [7. Травматология и военная медицина](#7-травматология-и-военная-медицина) — 65
- [8. Акушерство и гинекология](#8-акушерство-и-гинекология) — 26
- [9. Психиатрия и психология](#9-психиатрия-и-психология) — 30

## 1. Клинические калькуляторы

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `bodyfat` | % Body Fat (Jackson-Pollock, Navy) | Антропометрия | calculator | США (U.S. Navy) · Международный | yes |
| `unit-bili` | Билирубин | Конверсии единиц | calculator | Международный | yes |
| `unit-hb` | Гемоглобин | Конверсии единиц | calculator | Международный | yes |
| `unit-glucose` | Глюкоза | Конверсии единиц | calculator | Международный (США используют mg/dL; СИ - ммоль/л) | yes |
| `unit-creatinine` | Креатинин | Конверсии единиц | calculator | Международный (США - mg/dL; СИ - мкмоль/л) | yes |
| `unit-chol` | Холестерин / триглицериды | Конверсии единиц | calculator | Международный | yes |
| `cystatin` | Цистатин C (CKD-EPI cys) | Функция почек | calculator | Международный (KDIGO) | yes |
| `aa-gradient` | A-a gradient / SF / OI | Электролиты / КЩС | calculator |  | yes |
| `abw` | Adjusted Body Weight | Антропометрия | calculator | Международный | yes |
| `adrogue-madias` | Adrogué-Madias | Электролиты / КЩС | calculator | Международный | yes |
| `aminoglycoside` | Aminoglycoside dosing (Hartford nomogram) | Дозирование | calculator | США · Международный | yes |
| `anion-gap` | Anion gap | Электролиты / КЩС | calculator |  | yes |
| `bmi` | BMI / Индекс массы тела (Quetelet) | Антропометрия | calculator | Международный (ВОЗ) | yes |
| `bsa-dubois` | BSA - Du Bois & Du Bois (1916) | Антропометрия | calculator | Международный | yes |
| `bsa-haycock` | BSA - Haycock / Gehan-George / Boyd | Антропометрия | calculator | Международный (особ. педиатрия и онкология) | yes |
| `bsa-mosteller` | BSA - Mosteller | Антропометрия | calculator | США · Международный | yes |
| `bsa-dose` | BSA-based dosing (mg/m²) | Дозирование | calculator | США · ЕС · Международный | yes |
| `calvert` | Chemotherapy dose by AUC (Calvert) | Дозирование | calculator | Международный (ASCO, ESMO) | yes |
| `ckd-epi` | CKD-EPI 2009 / 2021 (race-free) | Функция почек | calculator | Международный (KDIGO) | yes |
| `cockcroft` | Cockcroft-Gault (CrCl) | Функция почек | calculator | США (FDA) · ЕС (EMA) · Международный | yes |
| `ca-corrected` | Corrected Ca²⁺ (Payne) | Электролиты / КЩС | calculator |  | yes |
| `na-corrected` | Corrected Na⁺ для гипергликемии | Электролиты / КЩС | calculator |  | yes |
| `dka` | DKA fluid/insulin protocols (JBDS, ISPAD, ADA) | Дозирование | calculator | Великобритания (JBDS) · США (ADA) · Международный (ISPAD) | yes |
| `doac` | DOAC dose adjustment | Дозирование | calculator | Международный (EHRA / ESC) · США (FDA) · ЕС (EMA) | yes |
| `drip-rate` | Drip rate (gtt/min) | Дозирование | calculator | Международный | yes |
| `fena` | FENa / FEUrea | Функция почек | calculator |  | yes |
| `water-deficit` | Free water deficit, Na deficit | Электролиты / КЩС | calculator | Международный | yes |
| `henderson` | Henderson-Hasselbalch / Stewart | Электролиты / КЩС | calculator | Международный | yes |
| `holliday-segar` | Holliday-Segar (4-2-1 rule) | Дозирование | calculator |  | yes |
| `ibw-devine` | IBW - Devine | Антропометрия | calculator |  | yes |
| `ibw-robinson` | IBW - Robinson / Miller / Hamwi | Антропометрия | calculator | Международный (США - клиническая практика) | yes |
| `insulin-correction` | Insulin correction factor (1700/1800) + I:C ratio | Дозирование | calculator | США (ADA) · Международный (ISPAD) | yes |
| `iv-dilution` | IV concentration / dilution calculators | Дозирование | calculator | Международный | yes |
| `lbw` | Lean Body Weight (Janmahasatian) | Антропометрия | calculator | Международный | yes |
| `mdrd` | MDRD (4-var) | Функция почек | calculator |  | yes |
| `mg-kg` | mg/kg dosing | Дозирование | calculator | Международный | yes |
| `modified-brooke` | Modified Brooke / Galveston (Shriners) / ABLS | Дозирование | calculator | США (ABA / ABLS) · Международный | yes |
| `osm-gap` | Osmolar gap | Электролиты / КЩС | calculator | Международный | yes |
| `pf-ratio` | PaO₂/FiO₂ ratio | Электролиты / КЩС | calculator |  | yes |
| `parkland` | Parkland formula | Дозирование | calculator | Международный (ATLS, ABA) | yes |
| `plasma-osm` | Plasma osmolality | Электролиты / КЩС | calculator |  | yes |
| `raschke` | Raschke (heparin) nomogram | Дозирование | calculator | США · Международный (ACCP 2012) | yes |
| `lund-malmo` | Revised Lund-Malmö / BIS1 / BIS2 | Функция почек | calculator | Европа (Швеция, Скандинавия) · Международный | yes |
| `rule-nines` | Rule of Nines / Lund-Browder | Дозирование | calculator | Международный (ATLS, ABA) | yes |
| `schwartz` | Schwartz (bedside, 2009) | Функция почек | calculator |  | yes |
| `vanco-auc` | Vancomycin AUC/MIC calculator | Дозирование | calculator | США (IDSA/ASHP) · Международный | yes |
| `whr` | Waist-to-hip ratio (ВОЗ) | Антропометрия | calculator | Международный (ВОЗ) | yes |
| `warfarin` | Warfarin dosing (IWPC, Gage) | Дозирование | calculator | Международный (ACCP) · США · ЕС | yes |
| `winter` | Winter formula | Электролиты / КЩС | calculator |  | yes |

## 10. Онкология

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `aor-ru` | КР АОР / Минздрав РФ | Российские стандарты | calculator | Российская Федерация (МЗ РФ) | yes |
| `ann-arbor` | Ann Arbor / Lugano | Стадирование | calculator | Международный (Cotswolds / Lugano) | yes |
| `birads` | BI-RADS (ACR) | Специфические | calculator | Международный (ACR) | yes |
| `binet-rai` | Binet / Rai | Стадирование | calculator | Международный (iwCLL / Binet Европа / Rai США) | yes |
| `brca-models` | BRCA1/2 risk models / Manchester / Myriad | Скрининг рисков | calculator | Международный (NCCN, NICE, ESMO) | yes |
| `cheson` | Cheson / Lugano / IWG / IMWG | Ответ на лечение | calculator | Международный (Lugano 2014) | yes |
| `ctcae` | CTCAE v5.0 (NCI) | Токсичность | calculator | Международный (NCI CTCAE v5.0) | yes |
| `d-amico` | D'Amico / NCCN risk groups | Специфические | calculator | Международный (AUA / EAU / NCCN) | yes |
| `ecog-kps` | ECOG PS / KPS / Lansky | Общий статус | calculator | Международный (ECOG / Karnofsky) | yes |
| `enneking` | Enneking | Стадирование | calculator | Международный (MSTS / Enneking) | yes |
| `figo-onco` | FIGO | Стадирование | calculator | Международный (WHO / FIGO) | yes |
| `gail` | Gail / Tyrer-Cuzick (IBIS) / BOADICEA / CanRisk | Скрининг рисков | calculator | Международный (NCI, USPSTF, NCCN) | yes |
| `gleason` | Gleason / ISUP Grade | Специфические | calculator | Международный (ISUP 2014 / WHO 2016) | yes |
| `iss-mm` | ISS / R-ISS / R2-ISS / Durie-Salmon | Стадирование | calculator | Международный (IMWG) | yes |
| `khorana-onco` | Khorana / ONKOTEV | Профилактика | calculator | Международный (ASCO 2020, ESMO 2022, NCCN, ITAC 2022) | yes |
| `lirads` | LI-RADS | Специфические | calculator | Международный (ACR / AASLD) | yes |
| `lungrads` | Lung-RADS | Специфические | calculator | Международный (ACR, USPSTF) | yes |
| `mascc` | MASCC / CINV / Hesketh | Профилактика | calculator | Международный (MASCC, IDSA 2010, ESMO 2016, NCCN) | yes |
| `febrile-neutro` | MASCC / CISNE | Профилактика | calculator | Международный (IDSA 2010, ESMO 2016, NCCN 2024) | yes |
| `nottingham` | Nottingham / HER2 ASCO/CAP / Ki-67 / IHC4 | Специфические | calculator | Международный (WHO / CAP) | yes |
| `npi-breast` | Nottingham Prognostic Index (NPI) | Специфические | calculator | Международный (UK / ESMO) | yes |
| `orads` | O-RADS | Специфические | calculator | Международный (ACR) | yes |
| `oncotype` | Oncotype DX / MammaPrint / BCI | Специфические | calculator | Международный (ASCO / NCCN / ESMO) | yes |
| `percist` | PERCIST | Ответ на лечение | calculator | Международный (SNM / EANM) | yes |
| `pirads` | PI-RADS v2.1 | Специфические | calculator | Международный (ACR / ESUR / AUA) | yes |
| `pps` | PPS / PPI / ESAS / FACIT-F / EORTC QLQ-C30 / PaP | Паллиатив | calculator | Международный (IAHPC, WHO, Medicare hospice) | yes |
| `recist` | RECIST 1.1 / iRECIST / irRC / mRECIST | Ответ на лечение | calculator | Международный (EORTC / NCI) | yes |
| `rtog-eortc` | RTOG/EORTC late effects | Токсичность | calculator | Международный (RTOG / EORTC) | yes |
| `tirads` | TI-RADS (ACR/EU/K) | Специфические | calculator | Международный (ACR) | yes |
| `tnm` | TNM / AJCC 8th Ed. / UICC | Стадирование | calculator | Международный (AJCC / UICC) | yes |
| `who-ladder` | WHO Analgesic Ladder | Паллиатив | calculator | Международный (ВОЗ, ESMO, NCCN, IASP) | yes |

## 11. Инфекционные болезни

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `covid` | 4C Mortality / COVID-GRAM / NEWS2 COVID / CO-RADS | COVID-19 | calculator | Международный (ISARIC/WHO) | yes |
| `aasld` | AASLD / EASL / РНОГ protocols | Гепатиты | calculator | США / Международный (AASLD, EASL аналог) | yes |
| `apri-hep` | APRI / FIB-4 / NAFLD FS | Гепатиты | calculator | Международный (WHO / AASLD / EASL) | yes |
| `nigrovic` | Bacterial Meningitis Score (Nigrovic) | Менингит | calculator | Международный (США / IDSA) | yes |
| `bristol` | Bristol Stool Scale | Контроль инфекций | calculator | Международный | yes |
| `centor` | Centor / McIsaac | Бактериальные | score |  | yes |
| `cap-scores` | CURB-65 / CRB-65 / PSI / PORT / SMART-COP / A-DROP | Пневмония | calculator | Международный (IDSA/ATS) | yes |
| `feverpain` | FeverPAIN | Бактериальные | score | Великобритания (NICE) | yes |
| `gmsps` | Glasgow Meningococcal Septicaemia (GMSPS) | Менингит | calculator | Великобритания / Международный | yes |
| `mccabe` | McCabe-Jackson | Контроль инфекций | calculator | Международный (США, эпидемиология) | yes |
| `senic` | SENIC / CDC NHSN | Контроль инфекций | calculator | США (CDC / APIC) | yes |
| `ssc` | Surviving Sepsis Campaign bundles | Сепсис | calculator | Международный (SSC / SCCM / ESICM) | yes |
| `thwaites` | Thwaites' score | Менингит | calculator | Международный (оригинал — Вьетнам, Thwaites) | yes |
| `vacs` | VACS Index / D:A:D | ВИЧ | calculator | Международный (VA Cohort) | yes |
| `hiv-who` | WHO clinical staging / CDC A/B/C + CD4 | ВИЧ | calculator | Международный (WHO) | yes |
| `who-tb` | WHO IMCI + TB scoring / Bandim / Wejse | ТБ | calculator | Международный (WHO) | yes |
| `who-malaria` | WHO severe malaria / COMA scores | Малярия | calculator | Международный (WHO) | yes |

## 12. Нефрология и урология

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `capra` | D'Amico / CAPRA / Partin tables | Урология | calculator | Международный (AUA/EAU) | yes |
| `nmibc` | EAU NMIBC risk (EORTC, CUETO) | Урология | calculator | Международный (EAU) | yes |
| `pvr` | EAU post-void residual / Prostate Volume | Урология | calculator | Международный (AUA/EAU) | yes |
| `iciq` | ICIQ / MESA / BFLUTS / OABSS | Урология | calculator | Международный (ICS) | yes |
| `iief` | IIEF-5 (SHIM) | Урология | calculator | Международный | yes |
| `ipss` | IPSS (AUA Symptom Score) | Урология | score |  | yes |
| `kdigo-ckd` | KDIGO категории G1-G5 + A1-A3 | ХБП | calculator | Международный (KDIGO) | yes |
| `kfre` | Kidney Failure Risk Equation (Tangri) | ХБП | calculator | Международный | yes |
| `ktv` | Kt/V / URR | Диализ | calculator | Международный (KDIGO/ISPD) | yes |
| `psa` | PSA velocity / density / free PSA ratio | Урология | calculator | Международный (AUA/EAU) | yes |
| `renal` | RENAL / PADUA / ESA / STONE | Урология | calculator | Международный (AUA) | yes |
| `kdigo` | RIFLE / AKIN / KDIGO 2012 | ОПП | calculator | Международный (KDIGO) | yes |
| `stone` | S.T.O.N.E. / Guy's / RIRS | Урология | calculator | Международный (EAU/AUA) | yes |

## 13. Пульмонология

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `act` | Asthma Control Test (ACT) | Астма | score |  | yes |
| `bode` | BODE index / ADO / DOSE | ХОБЛ | score |  | yes |
| `faced` | FACED / BSI | Бронхоэктазы | calculator | Международный (ERS) | yes |
| `gli` | FEV₁/FVC / GLI reference | ХОБЛ | calculator | Международный (ATS/ERS) | yes |
| `gap-ild` | GAP index / ILD-GAP | ИЛФ / ILD | calculator | Международный (ATS/ERS/JRS/ALAT) | yes |
| `gina` | GINA 2024 control / ACT / ACQ-7 / PAQLQ | Астма | calculator | Международный (GINA) | yes |
| `gold` | GOLD 2024 ABE / ABCD | ХОБЛ | calculator |  | yes |
| `mmrc` | mMRC / CAT | ХОБЛ | score |  | yes |
| `ahi` | STOP-BANG / Berlin / ESS / NoSAS / AHI | СОАС | calculator | Международный (AASM) | yes |
| `reveal` | WHO FC / REVEAL 2.0 / Lite2 / COMPERA / SPAHR | Лёгочная гипертензия | calculator | Международный (ESC/ERS, ATS) | yes |
| `ralph` | X-ray (Ralph, Timika) / Simplified TB / Wejse / Bandim | ТБ | calculator | Международный (ATS/ESICM) | yes |

## 14. Фармакология и лекарства

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `rls-ru` | РЛС / Видаль РФ / Машковский | Справочники | calculator | Российская Федерация | yes |
| `rote-liste` | ABDATA / Rote Liste | Справочники | calculator | Германия | yes |
| `beers` | Beers / STOPP/START / FORTA / PRISCUS | Гериатрия | calculator | США (AGS) · используется глобально | yes |
| `bnf` | BNF / BNFc | Справочники | calculator | Великобритания (NHS) | yes |
| `cpic` | CPIC / DPWG / CPNDS / PharmGKB | Фармакогеномика | calculator | Международный (CPIC, США) | yes |
| `credmeds` | CredibleMeds (Arizona CERT) / Tisdale | QT-prolongation | calculator | Международный (AZCERT, США) | yes |
| `pllr` | FDA PLLR / ADEC / Hale's Lactation / LactMed | Беременность / Лактация | calculator | США (FDA) | yes |
| `harriet-lane` | Frank Shann / Harriet Lane / Nelson Pediatric Antimicrobial | Детские дозы | calculator | США (Johns Hopkins) · международный стандарт педиатрии | yes |
| `asia-drug` | JADD / KIMS / China Pharmacopoeia / ChemoMeds | Справочники | calculator | Япония · Корея · Китай · Тайвань | yes |
| `lexicomp` | Lexicomp / Micromedex / UpToDate / Epocrates | Справочники | calculator | США / Международный | yes |
| `martindale` | Martindale / Medscape / Davis's Drug Guide | Справочники | calculator | Международный (40+ стран) | yes |
| `mims` | MIMS | Справочники | calculator | Великобритания · Азия (Сингапур, Малайзия, Гонконг, Филиппины, Индия) · Австралия | yes |
| `sanford` | Sanford Guide / Johns Hopkins ABX / eTG / AMH | Антибиотики | calculator | США (IDSA) · Международный | yes |
| `stockley` | Stockley's Drug Interactions | Справочники | calculator | Великобритания / ЕС | yes |
| `vidal` | Vidal | Справочники | calculator | Франция · Россия | yes |
| `who-eml` | WHO Model List of Essential Medicines | Поддержка | calculator | Международный (WHO) · используется в 155+ странах | yes |

## 15. Лабораторная медицина

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `hit-lab` | 4T / HEP score | Гематология | calculator | Международный (ASH 2018) | yes |
| `ru-lab` | РФ: МР 3.3.1.4-04, приказы МЗ | Референсы | calculator | Российская Федерация | yes |
| `wintrobe` | Эритроцитарные индексы (MCV / MCH / MCHC / RDW) | Гематология | calculator | Международный | yes |
| `aa-grad` | A-a gradient | Газы крови | calculator | Международный | yes |
| `cortisol` | ACTH stim / LDST / HDST / Midnight salivary | Эндокринология | calculator | Международный (Endocrine Society · РАЭ) | yes |
| `agapss` | Adjusted Global APS Score (aGAPSS) | Гематология | calculator | Международный | yes |
| `age-ddimer` | Age-adjusted D-dimer | Коагуляция | calculator | Международный (ESC · ACCP) | yes |
| `arr` | Aldosterone/Renin Ratio (ARR) | Эндокринология | calculator | Международный (Endocrine Society · РАЭ) | yes |
| `calcium-pth` | Calcium correction / PTH / vitamin D | Эндокринология | calculator | Международный (Endocrine Society · IOF) | yes |
| `tumor-markers` | CEA / CA 19-9 / CA 125 / AFP / hCG / PSA и др. | Опухолевые маркеры | calculator | Международный (NACB · ESMO · ASCO) | yes |
| `clsi` | CLSI C28-A3 / IFCC / Common Reference / CALIPER (peds) | Референсы | calculator | Международный (CLSI, США) | yes |
| `fib4-lab` | FIB-4 / APRI | Печень | calculator | Международный (AASLD / EASL) | yes |
| `fibrotest` | FibroTest / FibroSure / ELF test / FibroScan | Печень | calculator | Международный (лицензирован BioPredictive, Франция) | yes |
| `friedewald` | Friedewald LDL | Липиды | calculator |  | yes |
| `hba1c` | HbA1c ↔ eAG | Эндокринология | calculator |  | yes |
| `henderson-lab` | Henderson-Hasselbalch / Winter / Albert / delta-delta | Газы крови | calculator | Международный | yes |
| `homa-ir` | HOMA-IR / QUICKI / Matsuda / HOMA-β | Эндокринология | calculator |  | yes |
| `hs-ctn` | hs-cTn cutoffs | Сердечные маркеры | calculator | Международный (ESC · ACC) | yes |
| `inr-coag` | INR / aPTT / TT / Anti-Xa / TEG / ROTEM | Коагуляция | calculator | Международный (ACCP · ISTH · EHRA) | yes |
| `dic` | ISTH DIC / JMHW DIC / JAAM DIC | Гематология | calculator | Международный (ISTH 2001) | yes |
| `maddrey-lab` | Maddrey DF / Lille / Glasgow AH | Печень | calculator | Международный (AASLD/EASL) | yes |
| `martin-hopkins` | Martin-Hopkins / Sampson | Липиды | calculator | Международный (AACC · ESC) | yes |
| `mayo-arup` | Mayo Clinic / ARUP / Quest / LabCorp | Референсы | calculator | США (Mayo Clinic, ARUP) | yes |
| `meld` | MELD / MELD-Na / MELD 3.0 / PELD / UKELD | Печень | calculator | США (UNOS) · Международный | yes |
| `nafld-fs` | NAFLD FS / BARD / HAIR / NAFL-PT | Печень | calculator | Международный (AASLD / EASL) | yes |
| `non-hdl` | Non-HDL / ApoB / Lp(a) | Липиды | calculator | Международный (ESC/EAS · AHA/ACC) | yes |
| `nt-probnp` | NT-proBNP / BNP cutoffs | Сердечные маркеры | calculator |  | yes |
| `plasmic` | PLASMIC / French score | Гематология | calculator | Международный (ISTH 2020) | yes |
| `rpi` | RPI / Absolute reticulocyte / CHr | Гематология | calculator | Международный | yes |
| `spot-urine` | Spot UPCR / UACR / FENa / FEUrea / Urine osm gap / TTKG | Моча | calculator | Международный (KDIGO) | yes |
| `tibc` | TIBC / transferrin saturation / ferritin | Гематология | calculator | Международный | yes |
| `tsh` | TSH reflex / FT4 / FT3 / antiTPO | Эндокринология | calculator | Международный (ATA · ETA · РАЭ) | yes |

## 16. Справочники и классификаторы

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `ru-kr` | Клинические рекомендации Минздрава РФ | Российские | calculator | Российская Федерация (Минздрав РФ) | yes |
| `dsm5tr` | DSM-5-TR (APA) | Диагнозы | calculator | США (APA) · международно в исследованиях | yes |
| `fdi` | FDI / Universal Numbering (ADA) / Palmer | Стоматология | calculator | Международный (FDI World Dental Federation) · ISO 3950 | yes |
| `icd10` | ICD-10 / МКБ-10 (WHO) | Диагнозы | calculator | Международный (WHO) · официально в РФ до перехода на ICD-11 | yes |
| `icd10cm` | ICD-10-CM | Диагнозы | calculator | США (CDC/NCHS + CMS) | yes |
| `icd10-da` | ICD-10-DA / SNODENT | Стоматология | calculator | Международный (WHO) · стоматологические регистры и EHR | yes |
| `icd10-pcs` | ICD-10-PCS / CPT / HCPCS / OPCS-4 / Номенклатура 804н | Процедуры | calculator | США (CMS) · стационарное кодирование процедур | yes |
| `icd11` | ICD-11 (WHO) | Диагнозы | calculator | Международный (WHO) · в силе с 01.01.2022 | yes |
| `icd-o` | ICD-O-3.2 / TNM AJCC / WHO Classification of Tumours | Онкология | calculator | Международный (WHO/IARC) · онкологические регистры | yes |
| `icf` | ICF / ICF-CY (WHO) | Функционирование | calculator | Международный (WHO) · реабилитация, МСЭ | yes |
| `icpc` | ICPC-2 / ICPC-3 (WONCA) | Диагнозы | calculator | Международный (WONCA) · широко в Европе, Австралии, Азии | yes |
| `loinc` | LOINC | Терминологии | calculator | Международный (Regenstrief Institute, США) · 180+ стран | yes |
| `nanda` | NANDA-I / NIC / NOC / ICNP / Omaha System | Сестринство | calculator | Международный (NANDA International) · США, Европа, Япония, Бразилия | yes |
| `rxnorm` | RxNorm / NDC / ATC/DDD / DM+D / ЕСКЛП | Терминологии | calculator | США (NLM/NIH) · международно для интероперабельности | yes |
| `snomed` | SNOMED CT | Терминологии | calculator | Международный (SNOMED International) · США, UK, Канада, Австралия, Нидерланды (40+ стран) | yes |
| `umls` | UMLS Metathesaurus / MeSH | Терминологии | calculator | Международный (NLM/NIH) · мета-тезаурус 200+ словарей | yes |

## 17. Протоколы экстренной помощи

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `far-ru` | Клинические рекомендации ФАР по СЛР | Реанимация | calculator | Россия (ФАР) | yes |
| `ru-skoraya` | Приказ МЗ РФ 388н / ННПОСМП / Багненко | Догоспитальные алгоритмы | calculator | Россия, СНГ (адаптация) | yes |
| `ahs-ecc` | AHA ECC / ERC / Resuscitation Council UK / HEMS / SAMU | Догоспитальные алгоритмы | calculator | AHA (США), ERC (Европа), IAED/MPDS (60+ стран), SAMU (Франция) | yes |
| `ahls` | AHLS (Advanced HazMat Life Support) | CBRN / Токсикология | calculator | США (AACT/Univ Arizona), международные сертификаты AHLS | yes |
| `antidote` | Antidote stocking (ACEP/AACT) / CHEMM / REMM | CBRN / Токсикология | calculator | Международные референсы (USA, ЕС) | yes |
| `anzcor` | ANZCOR | Реанимация | calculator | Австралия, Новая Зеландия | yes |
| `atls` | ATLS (ACS-COT) | Догоспитальная травма | calculator | ACS-COT (США), 86 стран (курсы ATLS проводятся официально) | yes |
| `bls-acls` | BLS / ACLS / PALS (AHA) | Реанимация | calculator | AHA (США, Канада, международно) | yes |
| `code-stemi` | Code STEMI / Code Stroke / Sepsis Bundle | Госпитальные pathways | calculator | США (AHA/ACC), ЕС (ESC), РФ | yes |
| `door-to` | Door-to-needle / Door-to-balloon | Госпитальные pathways | calculator | США (AHA/ACC), ЕС, международно | yes |
| `epals` | EPALS / APLS / EPLS / EHAC | Реанимация | calculator | Европа (ERC), Великобритания (APLS), международно | yes |
| `erc` | ERC Guidelines | Реанимация | calculator | Европа (ERC member councils) | yes |
| `eceb` | Essential Care for Every Baby (ECEB) / ECSB | Реанимация | calculator | AAP / ВОЗ / USAID - global low-resource settings | yes |
| `etc` | ETC (European Trauma Course) | Догоспитальная травма | calculator | ERC / ESTES (Европа, ≥ 30 стран) | yes |
| `gwtg` | Get With The Guidelines (AHA) | Госпитальные pathways | calculator | США (AHA), применяется в 2600+ госпиталях | yes |
| `hbb` | Helping Babies Breathe / Helping Babies Survive | Реанимация | calculator | АAP / ВОЗ / USAID - low-resource settings глобально | yes |
| `hics` | HICS / HEICS / NATO CIMIC / NHS major incident / МЧС «Защита» | Массовые потери | calculator | США (CalEMSA + FEMA), адаптирован в ЕС, РФ, Азии | yes |
| `ilcor` | ILCOR CoSTR | Реанимация | calculator | Международный (AHA, ERC, ANZCOR, HSFC, RCSA, IAHF, InterAmerican HF) | yes |
| `anaphylaxis` | NIAID/FAAN / WAO / Ring-Messmer / Sampson / EAACI | Анафилаксия | calculator | WAO / EAACI / NIAID - международно | yes |
| `nrp` | NRP (AAP) | Реанимация | calculator | AAP (США), международно адаптируется | yes |
| `ems-assess` | OPQRST / SAMPLE / DCAP-BTLS / AVPU | Догоспитальная травма | calculator | NAEMT / NREMT (США), стандарт EMS обучения международно | yes |
| `pears` | PEARS | Реанимация | calculator | AHA (США, международно) | yes |
| `phtls-nm` | PHTLS / ITLS (NAEMT) | Догоспитальная травма | calculator | NAEMT (США), международно - 80+ стран | yes |
| `poisindex` | POISINDEX / TOXBASE / IPCS INTOX / Toxbase РФ | CBRN / Токсикология | calculator | США (Micromedex), международная референсная БД | yes |
| `tccc-17` | TCCC (CoTCCC, JTS) | Догоспитальная травма | calculator | DoD / JTS (США), NATO STANAG, международно (combat medic programs) | yes |
| `tecc-17` | TECC (C-TECC) | Догоспитальная травма | calculator | C-TECC (США), международная адаптация EMS систем | yes |

## 18. Учебные инструменты

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `consmed` | Рубрикатор КР Минздрава РФ / ConsMed / Consilium Medicum | Базы знаний | calculator | Российская Федерация · СНГ | yes |
| `awmf` | AWMF Leitlinien | Базы знаний | calculator | Германия (Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften) | yes |
| `cochrane` | Cochrane Library / BMJ Evidence / JAMA / NEJM | Базы знаний | calculator | Международный (Cochrane Collaboration) | yes |
| `complete-anatomy` | Complete Anatomy / Visible Body / BioDigital / Anatomy.app | Визуализация / Анатомия | calculator | Ирландия / Международный (3D4Medical, часть Elsevier) | yes |
| `evidencepoint` | EvidencePoint / Omni Calculator Medical | Калькуляторы | calculator | США / Международный | yes |
| `mdcalc` | MDCalc | Калькуляторы | calculator | США / Международный (MD Aware LLC, сейчас часть Google Health) | yes |
| `netter` | Netter / Gray's / Sobotta / Prometheus | Визуализация / Анатомия | calculator | США / Международный (Elsevier) | yes |
| `nice-cks` | NICE CKS / NHS Clinical Guidance | Базы знаний | calculator | Великобритания (NHS England, NICE) | yes |
| `osce` | OSCE / Mini-CEX / DOPS / CBD / Milestones / EPAs | Оценка компетенций | calculator | Международный (изначально UK/Canada; широко принят в мед образовании) | yes |
| `osmosis` | Osmosis / AMBOSS / UWorld / Kaplan / Lecturio / Sketchy | Образование | calculator | США / Международный (Osmosis by Elsevier) | yes |
| `prescrire` | Prescrire / HAS | Базы знаний | calculator | Франция (Association Mieux Prescrire) · независимый бюллетень | yes |
| `pubmed` | PubMed / MEDLINE / Embase / Scopus / Web of Science | Базы знаний | calculator | США (NLM/NIH) · Международный бесплатный доступ | yes |
| `qxmd` | QxMD Calculate / Medscape Calculators / MedCalX / PediStat | Калькуляторы | calculator | Канада / Международный (QxMD by Elsevier) | yes |
| `simman` | SimMan / Laerdal / Gaumard / CAE Healthcare | Образование | calculator | Норвегия / Международный (Laerdal Medical) | yes |
| `uptodate` | UpToDate / DynaMed / BMJ Best Practice / ClinicalKey / Medscape | Базы знаний | calculator | США / Международный (Wolters Kluwer) | yes |

## 19. Региональные стандарты

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `ketle` | Индекс Кетле / Эрисмана | Россия | calculator | Республика Казахстан | yes |
| `mz-ru` | Клинические рекомендации Минздрава РФ | Россия | calculator | Российская Федерация | yes |
| `geotar` | Национальные руководства «ГЭОТАР-Медиа» | Россия | calculator | Российская Федерация | yes |
| `mz-standards` | Стандарты и порядки оказания медпомощи | Россия | calculator | Российская Федерация | yes |
| `cis` | Украина / Беларусь / Казахстан: локальные КР МЗ | СНГ | calculator | СНГ / ЕАЭС (РФ, Беларусь, Казахстан, Кыргызстан, Армения) | yes |
| `ru-societies` | ФАР / РОАГ / РКО / ОНИ / АОР / РОДВК / РСА | Россия | calculator | Российская Федерация | yes |
| `formular-ru` | Формулярный комитет РАН / РЛС / Видаль РФ / Машковский | Россия | calculator | Российская Федерация | yes |
| `ru-scales` | Шкала Ваганова / Сидоренко / Харитонова / Светухина | Россия | calculator | Российская Федерация | yes |
| `aifa-simg` | AIFA / SIMG / SEMES | Европа | calculator | Италия | yes |
| `sap-sac` | Argentina SAP / SAC / Colombia MSPS | Латинская Америка | calculator | Аргентина | yes |
| `asean` | ASEAN Clinical Guidelines | Австралия / ЮВА | calculator | Юго-Восточная Азия (ASEAN): Сингапур, Малайзия, Таиланд, Индонезия, Филиппины, Вьетнам, Мьянма, Камбоджа, Лаос, Бруней | yes |
| `awmf-de` | AWMF / Rote Liste / Arzneimittelkursbuch | Европа | calculator | Германия (также Австрия, Швейцария — частично) | yes |
| `china` | Chinese Medical Association / Chinese Pharmacopoeia / NRDL | Китай | calculator | Китай (КНР) | yes |
| `esc-eu` | ESC / ESMO / ESICM / ESA / ESPEN / ESGE / EAU / ERS / ESO | Европа | calculator | ЕС / Европа (референс для всех стран Европейского кардиологического общества) | yes |
| `etg` | eTG Australia / AMH / RACGP / ANZICS | Австралия / ЮВА | calculator | Австралия (также Новая Зеландия — частично; референс в Фиджи, PNG, Pacific) | yes |
| `nordic` | Felleskatalogen / FASS / Pro.medicin.dk | Европа | calculator | Скандинавия: Дания / Норвегия / Швеция / Финляндия / Исландия | yes |
| `has-fr` | HAS / Vidal | Европа | calculator | France (also followed in Belgium, Luxembourg, Monaco; reference for Francophone Africa) | yes |
| `iap` | IAP growth / Indian National Formulary / NICE ICMR / MCI / NMC | Индия | calculator | Индия (также референс в ряде стран Южной Азии) | yes |
| `imci-africa` | IMCI / IMPAC / IMAI / IMCA / ETAT (WHO) | Ближний Восток / Африка | calculator | Африка (Sub-Saharan Africa, WHO AFRO); также используется в Юго-Восточной Азии и LAC под разными именами (AIEPI, IMNCI) | yes |
| `imss` | IMSS Guías de Práctica Clínica | Латинская Америка | calculator | Мексика | yes |
| `jcs` | Japanese Circulation Society / JSH / JSGE / JGCA / JAAM DIC | Япония | calculator | Япония | yes |
| `ktas` | KIMS / KAMJE / KoreaMed / Korean Guidelines / KTAS | Корея | calculator | Южная Корея (национальный стандарт triage ED с 2016); также внедряется в Монголии, Вьетнаме, ряде стран Ближнего Востока | yes |
| `pcdt-br` | Ministerio da Saúde Brazil PCDT / AMB / SBC / SBP | Латинская Америка | calculator | Бразилия | yes |
| `nhg` | NHG-standards / NVVC / Farmacotherapeutisch Kompas | Европа | calculator | Нидерланды (также используется во Фландрии) | yes |
| `nice-uk` | NICE / SIGN / BNF / BNFc | Европа | calculator | Великобритания (England, Wales; Scotland — частично, есть отдельный SIGN) | yes |
| `saudi` | Saudi MOH / Iran MOHME / Egyptian MOH / Africa CDC / MSF | Ближний Восток / Африка | calculator | Саудовская Аравия (также референс в ряде стран GCC — ОАЭ, Кувейт, Бахрейн, Оман, Катар) | yes |
| `smb-ch` | Swiss Medical Board / SMI / FOPH | Европа | calculator | Швейцария (немецкий / французский / итальянский) | yes |
| `tokyo-19` | Tokyo Guidelines | Япония | calculator | Япония (международно принятый стандарт; J Hepatobiliary Pancreat Sci, 2018) | yes |
| `paho` | WHO/PAHO IMCI / AIEPI / Manchester SUS | Латинская Америка | calculator | Латинская Америка и Карибский бассейн (PAHO / WHO AMRO — 35 стран-членов) | yes |

## 2. Диагностические шкалы

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `4at` | 4AT / DOS / ICDSC / Nu-DESC / DRS-R-98 | Делирий | score | США | yes |
| `4t` | 4T score | ВТЭ / Кровотечение | score | Международный (ASH 2018) | yes |
| `nsqip` | ACS NSQIP Risk Calculator | Периоперационная | score |  | yes |
| `asa-ps` | ASA Physical Status (I-VI) | Периоперационная | score |  | yes |
| `ats` | ATS (Australasian Triage Scale) | Триаж | score | Австралия | yes |
| `barthel` | Barthel Index / Modified Barthel | Функциональный статус | score | Международный | yes |
| `braden` | Braden / Norton / Waterlow | Функциональный статус | score | Международный (NPUAP / EPUAP / PPPIA) | yes |
| `bpi` | Brief Pain Inventory | Боль | calculator | Международный (MD Anderson) | yes |
| `cam` | CAM (Inouye) / CAM-ICU / 3D-CAM / b-CAM | Делирий | score | США | yes |
| `caprini` | Caprini | ВТЭ / Кровотечение | score | Международный (ACCP 2012, AAOS, ASCO) | yes |
| `charlson` | Charlson Comorbidity Index / Elixhauser / Van Walraven | Периоперационная | score |  | yes |
| `clavien` | Clavien-Dindo + CCI | Периоперационная | score |  | yes |
| `cfs` | Clinical Frailty Scale (Rockwood, 1-9) | Функциональный статус | score | Международный (NICE, ESICM) | yes |
| `cpot` | CPOT / BPS | Боль | score | Международный (SCCM PADIS 2018) | yes |
| `ctas` | CTAS (Canadian Triage and Acuity Scale) | Триаж | score | Канада | yes |
| `dn4` | DN4 / LANSS / painDETECT | Боль | score | Международный (IASP NeuPSIG) | yes |
| `ecog` | ECOG / WHO / Zubrod (0-5) | Функциональный статус | score | Международный (ECOG/WHO) | yes |
| `edmonton-frail` | Edmonton Frail / FRAIL / Fried / PRISMA-7 / Tilburg | Функциональный статус | score | Канада · Международный | yes |
| `esi` | ESI v.5 (Emergency Severity Index) | Триаж | score | США | yes |
| `flacc` | FLACC (2 мес-7 лет) | Боль | score | Международный | yes |
| `fps-r` | FPS-R (Faces Pain Scale Revised) | Боль | score | Международный (IASP) | yes |
| `geneva` | Geneva revised / simplified | ВТЭ / Кровотечение | score | Международный (ESC 2019) | yes |
| `glim` | GLIM criteria (2019) | Питание | score | Международный (ESPEN · ASPEN · FELANPE · PENSA) | yes |
| `has-bled` | HAS-BLED / ORBIT / ATRIA / HEMORR2HAGES | ВТЭ / Кровотечение | score |  | yes |
| `improve-bleed` | IMPROVE bleeding | ВТЭ / Кровотечение | score | Международный (ACCP 2012, ASH 2018) | yes |
| `kps` | Karnofsky Performance Status (0-100) | Функциональный статус | score | Международный | yes |
| `katz-adl` | Katz ADL / Lawton IADL / FIM | Функциональный статус | score | Международный | yes |
| `khorana` | Khorana | ВТЭ / Кровотечение | score | Международный (ASCO 2020, ESMO 2022, NCCN) | yes |
| `mts` | Manchester Triage System (MTS) | Триаж | score | Великобритания/Европа | yes |
| `mcgill` | McGill Pain Questionnaire | Боль | score | Международный (IMMPACT) | yes |
| `meows` | MEOWS | Раннее распознавание | score | Великобритания/Европа | yes |
| `mews` | MEWS | Раннее распознавание | score | Великобритания/Европа | yes |
| `mna` | MNA / MNA-SF | Питание | score | Международный · Гериатрия | yes |
| `mrs` | Modified Rankin Scale (0-6) | Функциональный статус | calculator |  | yes |
| `morse` | Morse Fall Scale / Hendrich II / STRATIFY | Функциональный статус | score | Международный | yes |
| `must` | MUST | Питание | score | Великобритания · ЕС · Международный | yes |
| `news2` | NEWS2 | Раннее распознавание | score | Великобритания (NHS, RCP) · EU | yes |
| `nips` | NIPS / CRIES / N-PASS / PIPP-R | Боль | score | Международный | yes |
| `nrs2002` | NRS-2002 | Питание | score | Европа (ESPEN) · Международный | yes |
| `nutric` | NUTRIC | Питание | score | Международный · ОРИТ (ASPEN/SCCM) | yes |
| `padua` | Padua (IMPROVE) | ВТЭ / Кровотечение | score | Международный (ACCP 2012, ASH 2018) | yes |
| `painad` | PAINAD | Боль | score | Международный | yes |
| `perc` | PERC rule | ВТЭ / Кровотечение | score |  | yes |
| `pesi` | PESI / sPESI | ВТЭ / Кровотечение | score | Международный (ESC 2019, AHA 2011) | yes |
| `pews` | PEWS / Bedside PEWS / RCPCH PEWS | Раннее распознавание | score | Международный | yes |
| `possum` | POSSUM / P-POSSUM / CR-POSSUM | Периоперационная | score |  | yes |
| `qsofa` | qSOFA | Раннее распознавание | score | Международный (SSC, Sepsis-3) | yes |
| `rcog-vte` | RCOG VTE в беременности | ВТЭ / Кровотечение | score | UK (RCOG) · международно принята | yes |
| `rcri` | Revised Cardiac Risk Index (Lee) / Gupta MICA | Периоперационная | score |  | yes |
| `sga` | SGA (Subjective Global Assessment) | Питание | score | Международный · Хирургия · Нефрология · Онкология | yes |
| `sofa` | SOFA (0-24) | Раннее распознавание | score |  | yes |
| `start` | START / JumpSTART / SALT / SIEVE / SORT | Триаж | score | Международный | yes |
| `strongkids` | STRONGkids / STAMP | Питание | score | Нидерланды · ЕС · Международный (педиатрия) | yes |
| `tinetti` | Tinetti POMA / Berg Balance / TUG / DGI | Функциональный статус | score | Международный | yes |
| `vas` | VAS (0-100 мм) / NRS (0-10) | Боль | calculator | Международный (IASP · ВОЗ) | yes |
| `wells-dvt` | Wells DVT | ВТЭ / Кровотечение | score |  | yes |
| `wells-pe` | Wells PE | ВТЭ / Кровотечение | score |  | yes |
| `wong-baker` | Wong-Baker FACES | Боль | score | Международный | yes |
| `years` | YEARS | ВТЭ / Кровотечение | calculator | Международный (ESC 2019) | yes |

## 20. Ветеринарная медицина

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `acvim` | ACVIM / ISACHC | Кардиология | calculator | США (ACVIM) · международный (IRIS) | yes |
| `asa-vet` | ASA для ветеринарии / APPLE / SPI | Анестезия / Критикал | calculator | США (ACVAA · AAHA) · международный | yes |
| `vetcot` | ATLS Veterinary / VetCOT / VETS / Kirby's Rule of 20 | Триаж | calculator | США (VetCOT) | yes |
| `bcs` | BCS (WSAVA) / Muscle Condition Score | Общее | calculator | Международный (WSAVA) | yes |
| `cbpi` | CBPI / LOAD / HCPI | Ортопедия | calculator | США (Purdue University) | yes |
| `colorado-pain` | Colorado State Pain / UNESP-Botucatu Feline / Grimace Scale | Боль | calculator | США (CSU) · международный | yes |
| `cri-vet` | Drip rates / CRI / Allometric dosing | Формулы | calculator | Международный (ACVAA · BSAVA) | yes |
| `cite` | FIV/FeLV CITE / FIP AGP/ALB / Tick-borne IDEXX 4Dx | Инфекционные | calculator | США (Cornell / AAEP) · международный | yes |
| `merck-vet` | Merck Veterinary Manual / AAHA / AAFP / WSAVA | Справочники | calculator | США / международный (MSD) | yes |
| `cmps-sf` | Modified Glasgow Composite Pain (CMPS-SF) | Боль | calculator | Международный (WSAVA · Glasgow) | yes |
| `ofa` | OFA / PennHIP / FCI hip scores | Ортопедия | calculator | США (OFA) | yes |
| `plumbs` | Plumb's Veterinary Drug Handbook / BSAVA Formulary / CVP | Формулы | calculator | США · международный | yes |
| `purina-fediaf` | Purina Life Plan / FEDIAF / AAFCO | Общее | calculator | ЕС (FEDIAF · Purina) | yes |
| `rer` | RER / MER / BMR | Формулы | calculator | Международный (NRC · WSAVA) | yes |
| `vcog` | VCOG-CTCAE / WHO TNM for animals | Онкология | calculator | Великобритания · США (VCOG) | yes |
| `vhs` | VHS / VLAS | Кардиология | calculator | Международный (ACVIM · EVDI) | yes |

## 21. Стоматология

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `aap-efp` | AAP/EFP 2017 Staging and Grading | Периодонтология | calculator | США/ЕС (AAP/EFP 2017 World Workshop · J Periodontol/J Clin Periodontol 2018) | yes |
| `abo-ce` | ABO Cast-Radiograph Evaluation | Ортодонтия | calculator | США (American Board of Orthodontics) · Am J Orthod Dentofacial Orthop | yes |
| `ada-cdt` | ADA CDT / SNODENT / ICD-10-DA / NICE CKS dental / РСА КР | Справочники | calculator | США (ADA) | yes |
| `anb` | ANB / WITS / Steiner cephalometric | Ортодонтия | calculator | Международный (Steiner CC, Am J Orthod, 1953) | yes |
| `andreasen` | Andreasen classification / IADT Dental Trauma | Травма зубов | calculator | Международный (IADT) | yes |
| `angle` | Angle's / IOTN / PAR / ICON | Ортодонтия | calculator | Международный (Edward Angle, 1899) | yes |
| `asa-dental` | ASA modifications / Misch bone D1-D4 | Протезирование | calculator | Международный (ASA 2014/2020) · ADA adaptation | yes |
| `blacks` | Black's classification | Классификации | calculator | Международный · классика (G.V. Black, 1908) | yes |
| `bolton` | Bolton / Little's irregularity index | Ортодонтия | calculator | Международный (Bolton WA, Am J Orthod, 1958/1962) | yes |
| `bop` | BOP% / PPD | Периодонтология | calculator | Международный (AAP/EFP, Ainamo & Bay 1975) | yes |
| `cast-icdas` | CAST / ICDAS II | Классификации | calculator | Международный (ICDAS Foundation · CAST Frencken et al.) | yes |
| `cpi` | CPI / CPITN / PSR | Периодонтология | calculator | Международный (WHO Oral Health Surveys 5th ed., 2013) | yes |
| `dmft` | DMFT / DMFS / dmft / deft (WHO) | Классификации | calculator | Международный (WHO Oral Health Surveys, 5th ed. 2013) | yes |
| `fdi-dent` | FDI / Universal Numbering (ADA) / Palmer | Классификации | calculator | Международный (FDI World Dental Federation) · ISO 3950 | yes |
| `frankl` | Frankl / Venham's / Cuthbert-Melamed | Детская стоматология | calculator | Международный | yes |
| `gingival` | Gingival Index / Plaque Index / OHI-S | Периодонтология | calculator | Международный (Loe & Silness, 1963) | yes |
| `lefort` | Lefort I/II/III | Хирургия полости рта | calculator | Международный (Le Fort 1901) | yes |
| `ao-cmf` | Mandibular fractures AO CMF | Хирургия полости рта | calculator | Международный (AO Foundation · AO CMF) | yes |
| `nolla` | Nolla / Demirjian | Детская стоматология | calculator | Международный | yes |
| `pai` | PAI (Periapical Index) | Эндодонтия | calculator | Международный (Orstavik 1986) | yes |
| `pell-gregory` | Pell-Gregory / Winter | Хирургия полости рта | calculator | Международный (Pell GJ, Gregory GT, 1933/1942) | yes |
| `sac-iti` | SAC classification (ITI) | Протезирование | calculator | Международный (ITI) | yes |
| `tnm-hn` | TNM AJCC head & neck | Оральный рак | calculator | Международный (AJCC · UICC) | yes |
| `velscope` | VELscope / OralCDx / WHO OPMD | Оральный рак | calculator | США (ADA) · Международный | yes |
| `vertucci` | Vertucci canal / Weine | Эндодонтия | calculator | Международный (Vertucci 1984) | yes |

## 22. Прочие специальности

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `6mwt` | 6-Minute Walk Test / Incremental Shuttle Walk | Реабилитация | calculator | Международный (ATS/ERS 2014) | yes |
| `abcde` | ABCDE / 7-point Glasgow / Menzies / pattern analysis | Дерматология | calculator | США (AAD / ACS) | yes |
| `fms-wpi` | ACR Fibromyalgia / FMS WPI + SS | Ревматология | calculator | Международный (ACR 2016) | yes |
| `acr-eular` | ACR/EULAR classification criteria | Ревматология | calculator | Международный (ACR/EULAR) | yes |
| `ada-easd` | ADA/EASD diabetes algorithm | Эндокринология | calculator | Международный (ADA/EASD) | yes |
| `amsler` | Amsler grid | Офтальмология | calculator | Международный (AAO) | yes |
| `aphab` | APHAB / SADL / IOI-HA / GHABP / COSI | ЛОР | calculator | Международный (AAA / ASHA) | yes |
| `areds` | AREDS / AREDS2 simplified | Офтальмология | calculator | США (NEI / AREDS) | yes |
| `ata` | ATA risk / Bethesda TBSRTC | Эндокринология | calculator | Международный (ATA 2015) | yes |
| `basdai` | BASDAI / BASFI / ASDAS | Ревматология | calculator |  | yes |
| `berg-balance` | Berg Balance / TUG / DGI / Tinetti | Реабилитация | calculator | Международный | yes |
| `bipss` | BIPSS / TUBA / TEOA / DPOAE | ЛОР | calculator | Международный (Endocrine Society) | yes |
| `borg` | Borg CR-10 / 6-20 RPE | Реабилитация | calculator | Международный | yes |
| `breslow` | Breslow thickness / Clark / AJCC | Дерматология | calculator | Международный (AJCC 8 / NCCN) | yes |
| `casi` | CASI / CCCA staging | Дерматология | calculator | Международный | yes |
| `ses-cd` | CDAI / HBI / SES-CD | Гастроэнтерология | calculator | Международный (ECCO) | yes |
| `das28` | DAS28 / CDAI / SDAI / RAPID3 | Ревматология | calculator |  | yes |
| `dhi` | DHI / Vertigo Symptom Scale | ЛОР | calculator | Международный (AAO-HNS) | yes |
| `dix-hallpike` | Dix-Hallpike / HINTS / HINTS plus | ЛОР | calculator | Международный (AAO-HNS / Barany) | yes |
| `dlqi` | DLQI / Skindex-16/29 | Дерматология | calculator | Международный | yes |
| `etdrs-dr` | ETDRS DR / ICO International DR/DME | Офтальмология | calculator | Международный (AAO / ETDRS) | yes |
| `medwatch` | FDA MedWatch / EudraVigilance / Yellow Card / Росздравнадзор | Фармация | calculator | США (FDA) | yes |
| `ferriman` | Ferriman-Gallwey | Эндокринология | calculator | Международный | yes |
| `fim-rehab` | FIM / Barthel / mRS / GOS-E | Реабилитация | calculator | Международный | yes |
| `fitzpatrick` | Fitzpatrick Skin Type (I-VI) | Дерматология | calculator | Международный (AAD / Fitzpatrick) | yes |
| `foto` | FOTO outcomes / PROMIS CATs | Реабилитация | calculator | США (FOTO Inc.) | yes |
| `frax-e` | FRAX | Эндокринология | calculator | Международный (WHO/FRAX) | yes |
| `frenchay` | Frenchay Dysarthria / BDAE / WAB-R / AAT / MTDDA | Аудиология / Речь | calculator | Международный (UK / US) | yes |
| `friedman` | Friedman staging | ЛОР | calculator | Международный (AAO-HNS) | yes |
| `acne` | GAGS / Cook / Leeds / IGA | Дерматология | calculator | Международный | yes |
| `gell-coombs` | Gell-Coombs / EAACI / Ring-Messmer / WAO | Аллергология | calculator | Международный | yes |
| `grbas` | GRBAS / CAPE-V | Аудиология / Речь | calculator | Международный (ELS / JSLP) | yes |
| `hodapp` | Hodapp-Parrish-Anderson / GSS2 | Офтальмология | calculator | Международный (AAO) | yes |
| `hurley` | Hurley / IHS4 / HiSCR | Дерматология | calculator | Международный (AAD / EHSF) | yes |
| `idf-ms` | IDF Metabolic Syndrome | Эндокринология | calculator | Международный (IDF 2006 / JIS 2009) | yes |
| `iop` | IOP (Goldmann, iCare, Tonopen) | Офтальмология | calculator | Международный (AAO) | yes |
| `la-grade` | LA grade A-D / Savary-Miller | Гастроэнтерология | calculator | Международный (ASGE / ESGE) | yes |
| `lund-mackay` | Lund-Mackay CT | ЛОР | calculator | Международный (EPOS / ERS) | yes |
| `masi` | MASI / VASI | Дерматология | calculator | Международный (AAD) | yes |
| `mathews` | Mathews / Mackaness (angioedema) | Аллергология | calculator | Международный (AAO-HNS 2019) | yes |
| `uceis` | Mayo / partial Mayo / UCEIS | Гастроэнтерология | calculator | Международный (ECCO) | yes |
| `pas` | MBSImP / FEES / Rosenbek PAS | Аудиология / Речь | score |  | yes |
| `mai` | Medication Appropriateness Index (MAI) | Фармация | calculator | Международный (US / EU) | yes |
| `meniere` | Ménière AAO-HNS staging | ЛОР | calculator | Международный (Barany Society / AAO-HNS) | yes |
| `naranjo` | Naranjo / WHO-UMC causality | Фармация | calculator | Международный (WHO / FDA) | yes |
| `niaid` | NIAID food allergy criteria | Аллергология | calculator | Международный (NIAID 2006 / WAO 2020) | yes |
| `oakland` | Oakland score | Гастроэнтерология | calculator | Международный (BSG / ACG) | yes |
| `ots` | Ocular Trauma Score (Kuhn) | Офтальмология | calculator | Международный (BETT / AAO) | yes |
| `odi` | ODI (Oswestry) / RMDQ / NDI | Реабилитация | calculator | Международный | yes |
| `pasi` | PASI / BSA / PGA / DLQI / CDLQI | Дерматология | calculator |  | yes |
| `pcne` | PCNE classification | Фармация | calculator | Европа (PCNE) | yes |
| `posas` | POSAS / Vancouver / Manchester | Дерматология | calculator | Международный (ISBI / EBA) | yes |
| `pta` | Pure Tone Average / Fletcher / ASHA / BSA grading | ЛОР | calculator | Международный (WHO / ISO 7029) | yes |
| `rsi-rfs` | Reflux Symptom Index (RSI) / Reflux Finding Score (RFS) | ЛОР | calculator | Международный (AAO-HNS) | yes |
| `oct-normative` | RNFL / Macular OCT normative | Офтальмология | calculator | Международный (AAO) | yes |
| `rodnan` | Rodnan skin score | Ревматология | calculator | Международный | yes |
| `rome-iv` | Rome IV criteria | Гастроэнтерология | calculator | Международный (Rome Foundation) | yes |
| `rop` | ROP International Classification / Plus disease | Офтальмология | calculator | Международный (ICROP 3 / AAO) | yes |
| `rosacea` | Rosacea IGA / GFSS | Дерматология | calculator | Международный (ROSCO) | yes |
| `salt` | SALT | Дерматология | calculator | Международный (NAAF / AAD) | yes |
| `sbar` | SBAR | Медсестринство | calculator | Международный (IHI / Joint Commission) | yes |
| `schirmer` | Schirmer / TBUT / OSDI | Офтальмология | calculator | Международный (TFOS DEWS II) | yes |
| `scorad` | SCORAD / EASI / oSCORAD / PO-SCORAD / IGA | Дерматология | calculator | Европа (ETFAD / EAACI) | yes |
| `scorten` | SCORTEN | Дерматология | calculator | Международный | yes |
| `seidel` | Seidel test | Офтальмология | calculator | Международный (AAO) | yes |
| `sledai` | SLEDAI-2K / BILAG-2004 | Ревматология | calculator | Международный | yes |
| `snellen` | Snellen / logMAR / ETDRS / Decimal | Офтальмология | calculator | Международный (WHO / ICD-11) | yes |
| `snot22` | SNOT-22 | ЛОР | calculator | Международный (EPOS / ERS) | yes |
| `sun` | SUN Uveitis criteria | Офтальмология | calculator | Международный (SUN / IUSG) | yes |
| `uas7` | UAS7 / CU-Q2oL | Дерматология | calculator | Международный (EAACI / GA²LEN / WAO) | yes |
| `vhi` | Voice Handicap Index (VHI-10) | ЛОР | calculator | Международный (ASHA / ELS) | yes |
| `womac-rehab` | WOMAC / KOOS / HOOS / DASH / QuickDASH / Oxford | Реабилитация | calculator | Международный | yes |

## 3. Педиатрические инструменты

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `intergrowth` | Интергроуз-21 / Fenton chart | Рост и развитие | calculator | Международный | yes |
| `ru-growth` | Национальные таблицы РФ (Мазурин, Воронцов) | Рост и развитие | calculator | Российская Федерация · СНГ | yes |
| `ru-vaccine` | Национальный календарь прививок РФ | Иммунизация | calculator | Российская Федерация | yes |
| `head-growth` | Рост головы / МПК / Z-score / BMI-for-age | Рост и развитие | calculator | Международный (ВОЗ) | yes |
| `alvarado-pas` | Alvarado / PAS (Samuel) / AIR | Экстренная педиатрия | score | Международный | yes |
| `apgar` | Apgar score (1 и 5 мин) | Новорождённые | score | Международный | yes |
| `ballard` | Ballard / New Ballard Score | Новорождённые | score | Международный | yes |
| `broselow` | Broselow-Luten Tape | Экстренная педиатрия | calculator | Международный (AHA/PALS) | yes |
| `cdc-growth` | CDC Growth Charts (2-20 лет) | Рост и развитие | calculator | США · международный 2-20 лет | yes |
| `cdc-acip` | CDC/ACIP (США) | Иммунизация | calculator | США | yes |
| `crib` | CRIB-II / SNAP-II / SNAPPE-II | Новорождённые | score | Международный (NICU) | yes |
| `denver` | Denver II / ASQ-3 / Bayley-III/4 / Griffiths / PARS (РФ) | Психомоторное развитие | calculator | США · международный | yes |
| `downes` | Downes score | Новорождённые | score | Международный | yes |
| `dubowitz` | Dubowitz | Новорождённые | score | Международный (исторический) | yes |
| `epi-who` | EPI WHO / STIKO (Германия) / HAS (Франция) | Иммунизация | calculator | Международный · Германия · Франция | yes |
| `finnegan` | Finnegan NAS/FNAS | Новорождённые | score | Международный | yes |
| `imci` | IMCI (WHO) | Лихорадка | calculator | WHO / страны с ограниченными ресурсами | yes |
| `kocher` | Kocher criteria | Экстренная педиатрия | score |  | yes |
| `kramer` | Kramer scale / Bhutani nomogram | Новорождённые | score | Международный | yes |
| `mchat` | M-CHAT-R/F | Психомоторное развитие | score | Международный | yes |
| `pals` | PALS algorithms | Экстренная педиатрия | calculator | Международный (AHA) | yes |
| `pecarn-cspine` | PECARN C-spine / PECARN abdominal | Экстренная педиатрия | score | Международный (PECARN) | yes |
| `pecarn-head` | PECARN head injury algorithm (<2 и ≥2 лет) | Экстренная педиатрия | calculator | Международный (PECARN) | yes |
| `pat` | Pediatric Assessment Triangle (PAT) | Экстренная педиатрия | calculator | Международный (AAP/AHA PALS) | yes |
| `pgcs` | Pediatric GCS (pGCS) / AVPU | Экстренная педиатрия | score | Международный | yes |
| `pts` | Pediatric Trauma Score (PTS) / TRISS pediatric | Шок / Травма | score | Международный (США ACS) | yes |
| `pram` | PRAM / PASS / PRESS / Wood-Downes | Респираторные | score | Международный | yes |
| `rochester` | Rochester / Philadelphia / Boston / Step-by-Step / PECARN febrile | Лихорадка | calculator | США · Европа (с адаптациями) | yes |
| `silverman` | Silverman-Anderson | Новорождённые | score | РФ · СНГ · Латинская Америка | yes |
| `sipa` | SIPA (Shock Index Pediatric Age-adjusted) | Шок / Травма | calculator | Международный (США ATLS/PALS) | yes |
| `tal` | Tal / Wang score | Респираторные | score | Международный | yes |
| `tanner` | Tanner stages (SMR I-V) | Рост и развитие | score | Международный | yes |
| `thompson` | Thompson Score / Sarnat staging | Новорождённые | score | Международный | yes |
| `uk-green` | UK Green Book | Иммунизация | calculator | Великобритания (NHS) | yes |
| `uk-who` | UK-WHO charts (RCPCH) | Рост и развитие | calculator | Великобритания · Ирландия | yes |
| `vanderbilt` | Vanderbilt / Conners / SNAP-IV | Психомоторное развитие | score | США · международный | yes |
| `westley` | Westley croup score | Респираторные | score |  | yes |
| `who-dehydr` | WHO (severe/some/no) / CDC / Gorelick / CDS | Дегидратация | score | Международный (ВОЗ / IMCI) | yes |
| `who-growth` | WHO Growth Standards (0-5 лет) | Рост и развитие | calculator | Международный (ВОЗ) | yes |

## 4. Кардиология и сосуды

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `4s-af` | 4S-AF characterization (ESC) | Фибрилляция предсердий | calculator | Международный (ESC 2020) | yes |
| `htn-tod` | Поражение органов-мишеней (LVH, UACR) | Гипертензия | score | Международный (ESC/ESH · ACC/AHA · РКО) | yes |
| `lqts` | Синдромы удлинённого QT (Romano-Ward, Jervell-Lange-Nielsen) | ЭКГ / Ритм | score | Международный (HRS · ESC · AHA) | yes |
| `bp-guidelines` | Целевые уровни АД (ACC/AHA, ESC, NICE, РКО) | Гипертензия | calculator | США (ACC/AHA) · ЕС (ESC/ESH) · Великобритания (NICE) · РФ (РКО) | yes |
| `aaa` | AAA - аневризма брюшной аорты | Сосуды / Аорта | calculator | Международный (SVS · ESVS · USPSTF) | yes |
| `abi` | ABI / TBI / WIfI classification | Сосуды / Аорта | calculator | Международный (AHA · ESC · SVS) | yes |
| `acc-aha-hf` | ACC/AHA stages A-D | Сердечная недостаточность | score | США · ЕС · РФ | yes |
| `abpm` | Ambulatory BP / HBPM критерии | Гипертензия | calculator | Международный (ESC/ESH · ACC/AHA · NICE · РКО) | yes |
| `ascvd` | ASCVD Pooled Cohort Equations (ACC/AHA) | ССС-риск | calculator | США (ACC/AHA) | yes |
| `bova` | Bova / FAST score | ТЭЛА | score | Международный | yes |
| `brugada` | Brugada criteria | ЭКГ / Ритм | score | Международный (ESC · AHA · HRS) | yes |
| `ccs` | CCS (Canadian Cardiovascular Society) I-IV | Стенокардия | score | Международный (CCS · ESC · ACC/AHA) | yes |
| `ceap` | CEAP | Сосуды / Аорта | score | Международный (AVF · ESVS · SVS) | yes |
| `chads-vasc` | CHA₂DS₂-VASc | Фибрилляция предсердий | score | Международный (ESC, AHA, РКО) | yes |
| `crawford` | Crawford | Сосуды / Аорта | score | Международный (ESVS · SVS · ESC 2024) | yes |
| `diamond-forrester` | Diamond-Forrester / CAD Consortium / ESC 2019 | Стенокардия | calculator | ЕС · Международный | yes |
| `duke-treadmill` | Duke Treadmill Score | Стенокардия | calculator | США · международный | yes |
| `edacs` | EDACS-ADP | ОКС / ИМ | score | Австралия · Н.Зеландия · международная | yes |
| `ehra` | EHRA symptom class (I-IV) | Фибрилляция предсердий | score | Международный (ESC / EHRA) | yes |
| `esc-nste` | ESC 0/1-h и 0/2-h hs-cTn | ОКС / ИМ | calculator | ЕС · международный | yes |
| `esc-pe` | ESC PE 2019/2024 | ТЭЛА | calculator | ЕС · международный | yes |
| `euroscore` | EuroSCORE II / STS Risk Score | Эндокардит / Клапаны | calculator | ЕС · международный | yes |
| `forrester` | Forrester / Nohria-Stevenson | Сердечная недостаточность | calculator |  | yes |
| `framingham-hf` | Framingham HF criteria (Boston) | Сердечная недостаточность | score | Международный | yes |
| `framingham` | Framingham Risk Score (FRS) | ССС-риск | calculator | США · Международный | yes |
| `grace` | GRACE 2.0 | ОКС / ИМ | calculator | Международный (ESC, AHA) | yes |
| `h2fpef` | H2FPEF / HFA-PEFF | Сердечная недостаточность | score | Международный | yes |
| `heart` | HEART score / HEART Pathway | ОКС / ИМ | score |  | yes |
| `killip` | Killip class (I-IV) | ОКС / ИМ | score |  | yes |
| `maggic` | MAGGIC / Seattle HF / OPTIMIZE-HF / GWTG-HF | Сердечная недостаточность | calculator | Международный | yes |
| `duke` | Modified Duke Criteria (2023 ISCVID) | Эндокардит / Клапаны | score | Международный (ISCVID · ESC 2023 · AHA) | yes |
| `nyha` | NYHA I-IV | Сердечная недостаточность | score |  | yes |
| `prevent` | PREVENT (AHA 2023) | ССС-риск | calculator | США (AHA 2023) | yes |
| `qrisk3` | QRISK3 | ССС-риск | calculator | Великобритания (NICE CG181) | yes |
| `qtc` | QTc: Bazett / Fridericia / Framingham / Hodges | ЭКГ / Ритм | calculator |  | yes |
| `reynolds` | Reynolds Risk Score | ССС-риск | calculator | США | yes |
| `rutherford` | Rutherford (0-6) / Fontaine (I-IV) | Сосуды / Аорта | score | Международный (SVS · ESVS · ACC/AHA) | yes |
| `score2` | SCORE2 / SCORE2-OP (ESC 2021) | ССС-риск | calculator | Европа (ESC) | yes |
| `score2-ru` | SCORE2 + GLOBORISK (РФ) | ССС-риск | calculator | РФ · СНГ (high-risk region) | yes |
| `sgarbossa` | Sgarbossa / Smith modified | ОКС / ИМ | score | Международный | yes |
| `stanford` | Stanford (A/B) / DeBakey | Сосуды / Аорта | score | Международный (ESC 2024 · AHA/ACC · STS) | yes |
| `timi` | TIMI (UA/NSTEMI, STEMI) | ОКС / ИМ | score |  | yes |
| `tisdale` | Tisdale score | ЭКГ / Ритм | score | Международный (AHA · HRS · CredibleMeds) | yes |
| `villalta` | Villalta | Сосуды / Аорта | score | Международный (ISTH · ESVS) | yes |
| `who-ish` | WHO/ISH risk charts | ССС-риск | calculator | Всемирный (14 субрегионов WHO) | yes |
| `wilkins` | Wilkins / Cormier | Эндокардит / Клапаны | score | Международный (ESC · AHA · ACC) | yes |

## 5. Неврология и нейрохирургия

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `abcd2` | ABCD2 / ABCD3-I | Инсульт | score |  | yes |
| `acdu` | ACDU / Grady / Jouvet / Glasgow-Liege | Сознание | score | США · Международный | yes |
| `ace3` | ACE-III / Addenbrooke's | Деменция | calculator | Международный (Cambridge) | yes |
| `alsfrs` | ALSFRS-R (0-48) / King's / MiToS | Миастения / ALS / GBS | calculator | Международный (WFN) | yes |
| `asia` | ASIA / Frankel / ISNCSCI | Спинальная травма | score | Международный (ASIA / ISCoS) | yes |
| `aspects` | ASPECTS / pc-ASPECTS | Инсульт | calculator |  | yes |
| `avpu` | AVPU | Сознание | score | Международный (ATLS / APLS / NEWS2) | yes |
| `can-ct-head` | Canadian CT Head Rule / New Orleans / NICE | ЧМТ | score | Канада · Международный | yes |
| `cdr` | CDR / FAST / GDS-Reisberg | Деменция | calculator |  | yes |
| `ctcae-neuro` | CTCAE neuropathy grading | Нейропатическая боль | score | Международный (NCI / FDA / EMA) | yes |
| `drs` | Disability Rating Scale (DRS) | ЧМТ | score |  | yes |
| `npsi` | DN4 / LANSS / painDETECT / NPSI | Нейропатическая боль | calculator | Международный | yes |
| `dragon` | DRAGON / MRS-DRAGON / THRIVE / iScore / SPAN-100 | Инсульт | score | Международный (Helsinki Stroke) | yes |
| `edss` | EDSS Kurtzke (0-10) | Рассеянный склероз | calculator |  | yes |
| `engel` | Engel / ILAE outcome | Эпилепсия | score |  | yes |
| `epworth` | Epworth Sleepiness Scale (ESS) | Сон | score | Международный | yes |
| `evans` | Evans index | Нейрохирургия | calculator | Международный | yes |
| `fast` | FAST / BE-FAST / CPSS / LAPSS / RACE / LAMS / VAN | Инсульт | score | Международный (AHA/ASA, ESO) | yes |
| `four` | FOUR Score (0-16) | Сознание | score | Международный (Mayo Clinic / AAN) | yes |
| `gcs` | Glasgow Coma Scale (GCS) + педиатрическая | Сознание | score | Международный | yes |
| `hachinski` | Hachinski Ischemic Score | Деменция | score |  | yes |
| `hoehn` | Hoehn and Yahr (1-5) | Паркинсон | calculator |  | yes |
| `house-brackmann` | House-Brackmann (I-VI) / Sunnybrook | Нейропатическая боль | score | Международный | yes |
| `hughes-gbs` | Hughes GBS (0-6) / EGOS / mEGOS | Миастения / ALS / GBS | score | Международный | yes |
| `hunt-hess` | Hunt-Hess / Fisher / modified Fisher / PAASH | Инсульт | score |  | yes |
| `ich` | ICH Score / FUNC / MICH | Инсульт | score |  | yes |
| `ichd3` | ICHD-3 | Головная боль | score |  | yes |
| `ilae` | ILAE 2017 classification | Эпилепсия | score |  | yes |
| `impact` | IMPACT / CRASH | ЧМТ | calculator | Международный (IMPACT + CRASH консорциумы) | yes |
| `mace2` | MACE 2 | ЧМТ | score |  | yes |
| `marshall-ct` | Marshall CT / Rotterdam / Stockholm / Helsinki | ЧМТ | score | Международный | yes |
| `mcdonald` | McDonald criteria 2017 | Рассеянный склероз | calculator |  | yes |
| `mgfa` | MGFA (I-V) / MG-ADL / QMG / MG-QOL15 | Миастения / ALS / GBS | score | Международный (MGFA) | yes |
| `midas` | MIDAS / HIT-6 / MSQ | Головная боль | calculator | Международный | yes |
| `mini-cog` | Mini-Cog / GPCOG / AD8 / IQCODE | Деменция | score |  | yes |
| `mmse` | MMSE (Folstein, 0-30) | Деменция | score |  | yes |
| `moca` | MoCA (0-30) | Деменция | score |  | yes |
| `mrs-stroke` | mRS (0-6) | Инсульт | calculator |  | yes |
| `msfc` | MSFC / MSSS / ARMSS | Рассеянный склероз | calculator | Международный | yes |
| `nihss` | NIHSS (0-42) | Инсульт | score |  | yes |
| `npi` | NPI | Деменция | calculator |  | yes |
| `pdq39` | PDQ-39 | Паркинсон | calculator |  | yes |
| `pecarn-chalice` | PECARN / CHALICE / CATCH | ЧМТ | calculator | США (PECARN) · Великобритания (CHALICE) · Канада (CATCH) | yes |
| `snoop` | POUND / SNOOP(10) red flags | Головная боль | score |  | yes |
| `psqi` | PSQI / ISI / SATED | Сон | calculator | Международный | yes |
| `rancho` | Rancho Los Amigos (I-X) | ЧМТ | score | США · Международный (нейрореабилитация) | yes |
| `scat` | SCAT5 / SCAT6 / Child-SCAT | ЧМТ | calculator | Международный (CISG / FIFA / IOC) | yes |
| `schwab` | Schwab and England ADL | Паркинсон | calculator |  | yes |
| `simpson` | Simpson Grade (I-V) | Нейрохирургия | score | Международный | yes |
| `slic` | SLIC / TLICS | Спинальная травма | score | Международный (Spine Trauma Study Group) | yes |
| `slums` | SLUMS | Деменция | score |  | yes |
| `spetzler` | Spetzler-Martin / Spetzler-Ponce | Нейрохирургия | score | Международный | yes |
| `stess` | STESS / EMSE / END-IT | Эпилепсия | score |  | yes |
| `stop-bang` | STOP-BANG / Berlin | Сон | score |  | yes |
| `tcns` | TCNS / MNSI / NDS | Нейропатическая боль | score | Международный | yes |
| `toast` | TOAST classification | Инсульт | score | Международный (AHA/ASA, ESO) | yes |
| `updrs` | UPDRS / MDS-UPDRS (I-IV) | Паркинсон | calculator |  | yes |
| `wfns` | WFNS SAH grading | Инсульт | score |  | yes |

## 6. Анестезиология и ICU

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `mtp` | Массивная трансфузия 1:1:1 (PROPPR) / TIC | Трансфузия | calculator | Международный | yes |
| `asa-e` | Предоперационные шкалы риска (ASA, RCRI, ACS NSQIP, METS, DASI) | Предоперационная | calculator | Международный | yes |
| `cpp` | Церебральное перфузионное давление (CPP) | Нейроинтенсив | calculator | Международный | yes |
| `abc-tash` | ABC / TASH / McLaughlin / RABT | Трансфузия | score |  | yes |
| `absi` | ABSI / Baux / Revised Baux / BOBI | Ожоги | calculator | Международный (ABA, ISBI) | yes |
| `aldrete` | Aldrete / Modified Aldrete / PADSS / White-Song | Предоперационная | score |  | yes |
| `apache` | APACHE II / III / IV | Тяжесть в ICU | calculator | Международный (оригинал США) | yes |
| `apfel` | Apfel PONV (0-4) | Предоперационная | score |  | yes |
| `berlin-ards` | Berlin 2012 + Global 2023 | ARDS | calculator | Международный (ESICM/ATS/SCCM) | yes |
| `bis` | BIS / SSEP / NSE | Остановка сердца | calculator | Международный (ERC/ESICM) | yes |
| `bps-icu` | BPS / CPOT / NVPS / ESCID | Седация / Делирий | score | Международный (SCCM PADIS 2018) | yes |
| `bromage` | Bromage scale | Предоперационная | score |  | yes |
| `cam-icu` | CAM-ICU / ICDSC / Nu-DESC / 4AT | Седация / Делирий | calculator | Международный (SCCM PADIS 2018) | yes |
| `curb65` | CURB-65 / PSI / SMART-COP / A-DROP | ARDS | score |  | yes |
| `fst` | Furosemide stress test (FST) | AKI | calculator | Международный | yes |
| `hacor` | HACOR | ARDS | score | Международный | yes |
| `kigali` | Kigali modification | ARDS | calculator | Низкоресурсные страны (валидировано в Руанде) | yes |
| `lund-rosner` | Lund / Rosner concepts | Нейроинтенсив | calculator | Международный | yes |
| `mallampati` | Mallampati / Cormack-Lehane / LEMON / MACOCHA | Предоперационная | calculator | Международный | yes |
| `mehta` | Mehta / Cleveland Clinic | AKI | score |  | yes |
| `mpm` | MPM II-0 / 24 | Тяжесть в ICU | calculator | Международный | yes |
| `murray` | Murray Lung Injury Score | ARDS | calculator | Международный | yes |
| `murray-ecmo` | Murray score | ECMO | calculator | Международный (ELSO) | yes |
| `sirs` | NEWS2 / MEDS / SIRS / PIRO / SIS / Shapiro | Сепсис | score | Международный (исторический) | yes |
| `ohca` | OHCA / GO-FAR / CAHP / TTM / NULL-PLEASE | Остановка сердца | calculator | Международный | yes |
| `parkland-brooke` | Parkland / Modified Brooke / Galveston | Ожоги | calculator | Международный (ABA, ATLS, ABLS) | yes |
| `plr` | Passive leg raise / PLR + CO | Водно-электролитный | calculator | Международный | yes |
| `preserve` | PRESERVE / ECMOnet / ENCOURAGE | ECMO | score |  | yes |
| `rap-prx` | RAP / PRx | Нейроинтенсив | calculator | Международный (Cambridge) | yes |
| `rass` | RASS / SAS Riker / Ramsay / MAAS | Седация / Делирий | score | Международный (SCCM PADIS 2018) | yes |
| `resp` | RESP / SAVE | ECMO | calculator | Международный (ELSO) | yes |
| `rifle` | RIFLE / AKIN / KDIGO 2012 | AKI | calculator | Международный (KDIGO) | yes |
| `rox` | ROX index | ARDS | calculator | Международный | yes |
| `rsbi` | RSBI (Tobin) | ARDS | calculator | Международный | yes |
| `rule-9` | Rule of Nines / Lund-Browder / Wallace | Ожоги | calculator | Международный (ABA, EMSB, ERC) | yes |
| `saps` | SAPS II / 3 | Тяжесть в ICU | calculator | Международный (European standard) | yes |
| `sepsis3` | Sepsis-3 (SOFA ≥ 2) / qSOFA | Сепсис | calculator | Международный (SCCM/ESICM Task Force 2016, SSC 2021) | yes |
| `mods-lods` | SOFA / MODS / LODS / TISS-28 / NEMS | Тяжесть в ICU | calculator | Международный | yes |
| `svv` | SVV / PPV / IVC collapsibility / Mini-fluid challenge | Водно-электролитный | calculator | Международный | yes |
| `trali` | TRALI / TACO criteria (ISBT 2019) | Трансфузия | calculator | Международный (ISBT) | yes |
| `wilson-arne` | Wilson / Arné / Naguib | Предоперационная | score |  | yes |

## 7. Травматология и военная медицина

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `ru-military` | «Защита» / Гуманенко ВПХ / Указания МО РФ | Военная медицина | calculator | Российская Федерация (ВС РФ, МО РФ, ВМА им. Кирова) | yes |
| `9-line` | 9-Line MEDEVAC / MIST / SBAR / AT-MIST | Военная медицина | calculator | NATO / US DoD / WHO / IHI | yes |
| `mchs-russia` | МЧС РФ (I-IV цветовая) | Триаж MASCAL | calculator | Российская Федерация | yes |
| `aast` | AAST OIS | Абдоминальная травма | calculator | Международный (AAST, США) | yes |
| `aims65` | AIMS65 | Неотложная хирургия | score |  | yes |
| `alvarado` | Alvarado (MANTRELS) / AIR / RIPASA / PAS | Неотложная хирургия | score |  | yes |
| `ao-ota` | AO/OTA 2018 | Ортопедия | calculator | Международный (AO Foundation + Orthopaedic Trauma Association) | yes |
| `big` | BIG score | Абдоминальная травма | calculator | Международный (derived US military + civilian) | yes |
| `bisap` | BISAP | Неотложная хирургия | score |  | yes |
| `boey` | Boey / ASA + Boey | Неотложная хирургия | score | Международный (WSES guidelines 2020) | yes |
| `can-cspine` | Canadian C-Spine Rule / NEXUS C-spine | Голова / Позвоночник | calculator | Международный | yes |
| `child-meld` | Child-Pugh / MELD / MELD-Na / MELD 3.0 | Неотложная хирургия | score |  | yes |
| `red-blood` | Combat Pulse Check / R.E.D. whole blood | Военная медицина | calculator | US DoD / NATO / постепенная civilian adoption | yes |
| `denis` | Denis three-column | Ортопедия | score | Международный | yes |
| `fast-us` | FAST / eFAST | Абдоминальная травма | calculator | Международный (ATLS) | yes |
| `fib4` | FIB-4 / APRI / NAFLD FS / FibroTest / FibroScan | Неотложная хирургия | calculator | Международный (AASLD 2023, EASL 2021, WHO) | yes |
| `forrest` | Forrest classification | Неотложная хирургия | calculator |  | yes |
| `frykman` | Frykman | Ортопедия | score | Международный (исторический) | yes |
| `garden` | Garden (I-IV) / Pauwels | Ортопедия | score | Международный | yes |
| `gbs` | Glasgow-Blatchford score | Неотложная хирургия | score |  | yes |
| `gustilo` | Gustilo-Anderson (I-IIIC) | Ортопедия | score | Международный | yes |
| `harris-hip` | Harris Hip / Oxford Hip/Knee | Суставы / Хрящ | calculator | Международный (Oxford - UK NJR стандарт) | yes |
| `cdai` | Harvey-Bradshaw / CDAI | Неотложная хирургия | calculator | Международный (ECCO 2020, ACG 2018, STRIDE-II 2021) | yes |
| `hawkins` | Hawkins | Ортопедия | score | Международный | yes |
| `hinchey` | Hinchey (I-IV) | Неотложная хирургия | calculator |  | yes |
| `ikdc` | IKDC / Lysholm / Tegner / KOOS / WOMAC | Суставы / Хрящ | calculator | Международный | yes |
| `iss` | Injury Severity Score (ISS) | Тяжесть травмы | calculator | Международный | yes |
| `insall-salvati` | Insall-Salvati / Caton-Deschamps | Суставы / Хрящ | calculator | Международный | yes |
| `kts` | Kampala Trauma Score | Тяжесть травмы | score | LMIC (Уганда, Кения, LMIC-адаптация) | yes |
| `kellgren` | Kellgren-Lawrence (0-4) | Суставы / Хрящ | score | Международный | yes |
| `lille` | Lille model | Неотложная хирургия | calculator |  | yes |
| `maddrey` | Maddrey DF / ABIC / GAHS | Неотложная хирургия | calculator |  | yes |
| `mpi` | Mannheim Peritonitis Index | Неотложная хирургия | score | Международный (Германия, Европа, РФ) | yes |
| `march-paws` | MARCH-PAWS | Военная медицина | calculator | Стандарт TCCC / NATO / US DoD | yes |
| `mason-mayo` | Mason / Mayo | Ортопедия | score | Международный | yes |
| `mayo-uc` | Mayo / Truelove-Witts | Неотложная хирургия | calculator | Международный (ACG 2019, ECCO 2022) | yes |
| `stanag` | NATO STANAG 2879 | Триаж MASCAL | score | NATO (альянс) | yes |
| `neer` | Neer / Codman | Ортопедия | score | Международный | yes |
| `niss` | New ISS / AIS 2015 / ICISS / TMPM | Тяжесть травмы | calculator | Международный | yes |
| `ottawa-ankle` | Ottawa Ankle/Foot Rules | Ортопедия | score |  | yes |
| `outerbridge` | Outerbridge / ICRS | Суставы / Хрящ | score | Международный | yes |
| `phtls` | PHTLS / ITLS (NAEMT) | Военная медицина | calculator | США, международный (NAEMT, ITLS International) | yes |
| `pipkin` | Pipkin | Ортопедия | score | Международный | yes |
| `ranson` | Ranson / Glasgow-Imrie / APACHE II / HAPS | Неотложная хирургия | calculator | Международный | yes |
| `atlanta` | Revised Atlanta 2012 / Balthazar CTSI | Неотложная хирургия | calculator | Международный (IAP/APA, ACG guidelines) | yes |
| `rts` | Revised Trauma Score / Triage RTS | Тяжесть травмы | calculator | Международный | yes |
| `rockall` | Rockall | Неотложная хирургия | score |  | yes |
| `rockwood` | Rockwood | Ортопедия | score | Международный | yes |
| `russe` | Russe | Ортопедия | score | Международный | yes |
| `salter-harris` | Salter-Harris (I-V) | Ортопедия | score | Международный | yes |
| `sanders` | Sanders / Essex-Lopresti | Ортопедия | score | Международный | yes |
| `schatzker` | Schatzker (I-VI) | Ортопедия | score | Международный | yes |
| `shock-index` | Shock Index / Modified SI / Age-SI | Тяжесть травмы | calculator |  | yes |
| `sieve-sort` | SIEVE + SORT / MPTT-24 | Триаж MASCAL | calculator | Великобритания · NHS England | yes |
| `start-civ` | START / JumpSTART / SALT | Триаж MASCAL | calculator | США · Международный | yes |
| `tccc` | TCCC (Tactical Combat Casualty Care) | Военная медицина | calculator | Стандарт NATO / US DoD / СНГ (адаптации) | yes |
| `tecc` | TECC | Военная медицина | calculator | США, Канада, EU, civilian EMS/SWAT | yes |
| `ao-spine` | TLICS / SLIC / AO Spine classification | Голова / Позвоночник | calculator | Международный | yes |
| `tokyo` | Tokyo Guidelines TG18/TG24 | Неотложная хирургия | calculator | Международный (Tokyo Guidelines) | yes |
| `tonnis` | Tönnis | Суставы / Хрящ | score | Международный | yes |
| `triss` | TRISS / ASCOT | Тяжесть травмы | calculator | Международный (MTOS) | yes |
| `tscherne` | Tscherne | Ортопедия | score | Европа (Германия, Австрия, Швейцария - стандарт) | yes |
| `ucla-shoulder` | UCLA / ASES / Constant-Murley / DASH / QuickDASH | Суставы / Хрящ | calculator | Международный | yes |
| `weber` | Weber (A/B/C) / Lauge-Hansen | Ортопедия | score | Международный | yes |
| `young-burgess` | Young-Burgess / Tile | Ортопедия | score | Международный | yes |

## 8. Акушерство и гинекология

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `4t-pph` | «4 T»: Tone, Trauma, Tissue, Thrombin | ПРК | calculator | Международный | yes |
| `acog-preeclampsia` | ACOG 2020 / ISSHP 2018/2021 | Преэклампсия | calculator | Международный (ACOG, ISSHP, РОАГ) | yes |
| `afs-enzian` | AFS / rASRM / ENZIAN / #Enzian 2021 | Гинекология | score | Международный (ASRM, ESHRE, #Enzian) | yes |
| `asccp` | ASCCP 2019 risk-based | Гинекология | calculator | США (ASCCP); адаптация ESGO/IFCPC | yes |
| `bethesda-cyto` | Bethesda System 2014 | Гинекология | calculator | Международный (Bethesda) | yes |
| `bishop` | Bishop score (0-13) / modified / simplified | Беременность | score |  | yes |
| `cmqcc` | CMQCC / AWHONN / RCOG 52 | ПРК | calculator | США (CMQCC/AWHONN), UK (RCOG 52), международно | yes |
| `us-dates` | CRL (Hadlock) / BPD / AC / FL | Беременность | calculator | Международный (ACOG, ISUOG) | yes |
| `epds` | EPDS | Депрессия | score |  | yes |
| `ctg` | FIGO / NICHD CTG (I/II/III) | Беременность | calculator | Международный (FIGO, ACOG, NICHD) | yes |
| `figo-staging` | FIGO 2018 staging | Гинекология | calculator | Международный (FIGO) | yes |
| `frax-men` | FRAX | Менопауза | calculator | Международный (FRAX, NOF, AACE) | yes |
| `pierce` | fullPIERS / miniPIERS | Преэклампсия | calculator | Международный | yes |
| `greene` | Greene / Kupperman / MRS | Менопауза | calculator | Международный | yes |
| `hellp` | HELLP Mississippi / Tennessee | Преэклампсия | calculator | Международный | yes |
| `iadpsg` | IADPSG / WHO / Carpenter-Coustan / NICE / РОАГ | Диабет беременных | calculator | Международный (IADPSG/WHO), США (C-C), UK (NICE), РФ (РОАГ) | yes |
| `iota` | IOTA Simple Rules / ADNEX / RMI / ROMA | Гинекология | calculator | Международный (IOTA, ESGO) | yes |
| `naegele` | Naegele's rule | Беременность | calculator |  | yes |
| `popq` | POP-Q | Гинекология | score | Международный (ICS, IUGA) | yes |
| `rcog-37a` | RCOG Green-top 37a | ВТЭ и беременность | score | Великобритания (RCOG); адаптация в ЕС | yes |
| `palm-coein` | RCOG HMB / PALM-COEIN (FIGO) | Гинекология | calculator | Международный (FIGO, RCOG, NICE) | yes |
| `rotterdam` | Rotterdam 2003 / AE-PCOS Society | Гинекология | score | Международный (ESHRE/ASRM, AE-PCOS, Teede 2023) | yes |
| `sflt` | sFlt-1/PlGF ratio | Преэклампсия | calculator | Международный (EMA одобрено) | yes |
| `stan` | STAN ST-analysis | Беременность | calculator | Европа (Neoventa STAN; Швеция, Нидерланды, UK) | yes |
| `straw10` | STRAW+10 | Менопауза | score | Международный (STRAW+10) | yes |
| `who-mec` | WHO MEC / CDC U.S. MEC 2024 / SPR | Контрацепция | calculator | Международный (WHO); США (CDC US MEC 2024) | yes |

## 9. Психиатрия и психология

| ID | Название | Подраздел | Тип | Страны | Runner |
|---|---|---|---|---|---|
| `asrs` | ASRS v1.1 (WHO) | СДВГ | calculator | Международный (WHO) | yes |
| `cage-audit` | AUDIT / MAST / T-ACE | Зависимости | score | Международный (ВОЗ) | yes |
| `audit-c` | AUDIT-C | Зависимости | score |  | yes |
| `bdi` | BDI-II / BDI-Fast | Депрессия | calculator | Международный | yes |
| `beck-ssi` | Beck SSI / SAD PERSONS / P4 / NGASR / Sheehan-STS | Суицид | calculator | Международный | yes |
| `c-ssrs` | C-SSRS (Columbia) | Суицид | calculator | США · ЕС · РФ · FDA стандарт | yes |
| `cage` | CAGE | Зависимости | score |  | yes |
| `cbcl` | CBCL / YSR / TRF (Achenbach) / SDQ / PSC-17/35 | Дети и подростки | calculator | Международный (ASEBA, >100 стран) | yes |
| `ciwa` | CIWA-Ar | Зависимости | calculator | Международный | yes |
| `conners` | Conners-3 / Vanderbilt / SNAP-IV / ADHD-RS-5 | СДВГ | calculator | США / Международный | yes |
| `cows` | COWS / SOWS / ClinOWS | Зависимости | calculator | Международный | yes |
| `crafft` | CRAFFT | Зависимости | calculator | США (AAP, NIAAA) | yes |
| `dast` | DAST-10/20 / ASSIST (WHO) | Зависимости | calculator | Международный | yes |
| `dsm-icd` | DSM-5-TR / МКБ-10 F / МКБ-11 / РБК | Общий скрининг | calculator | США (APA DSM) / Международный (WHO ICD) | yes |
| `eat26` | EAT-26 / SCOFF / EDE-Q / ChEAT / ANSOCQ | Пищевое поведение | calculator | Международный | yes |
| `gds` | EPDS / GDS (гериатрия) / CDI (дети) / Kutcher | Депрессия | score | Международный · рекомендовано у ≥65 лет | yes |
| `fagerstrom` | Fagerström (FTND/FTCD) | Зависимости | score |  | yes |
| `gad7` | GAD-7 | Тревога | score |  | yes |
| `whodas` | GAF / WHODAS 2.0 / SOFAS / GAS | Функционирование | calculator | Международный (WHO) | yes |
| `ham-a` | HAM-A / BAI / STAI / PSWQ | Тревога | calculator | Международный | yes |
| `ham-d` | HAM-D / MADRS / QIDS / Zung / CES-D | Депрессия | calculator | Международный | yes |
| `hcr20` | HCR-20 V3 / VRAG / START / Brøset | Риск насилия | calculator | Международный (судебная психиатрия) | yes |
| `mchat-autism` | M-CHAT-R/F / ADOS-2 / ADI-R / CARS-2 / AQ / SRS-2 | Аутизм | calculator | Международный (AAP) | yes |
| `mmpi` | MMPI / PAI / MCMI / SCID-5-PD / PID-5 / Rorschach / TAT / 16PF / NEO-PI-R | Личность | calculator | США / Международный | yes |
| `panss` | PANSS / BPRS / SAPS / SANS / CGI / GAF | Психоз | calculator | Международный | yes |
| `pcl5` | PCL-5 / CAPS-5 / PC-PTSD-5 / IES-R / DTS / ACE | ПТСР | calculator | Международный (US VA) | yes |
| `phq9` | PHQ-9 / PHQ-2 | Депрессия | score |  | yes |
| `scid` | SCID-5 / MINI / CIDI / K-SADS-PL | Общий скрининг | calculator | США (APA DSM-5) / Международный | yes |
| `spin` | SPIN / LSAS / Y-BOCS / OCI-R / PDSS / HARS | Тревога | calculator | Международный | yes |
| `ymrs` | YMRS / MDQ / HCL-32 / ASRM | Биполярное | calculator | Международный | yes |
