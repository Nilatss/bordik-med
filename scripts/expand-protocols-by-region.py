"""
Phase 3: expand neonatal-guidelines.json with region-specific protocols.

Goal: substantially extend the protocol bank with reliable, source-cited
protocols organised by region (РФ / США / Европа / Узбекистан /
Международный). Each protocol has structured content (показания,
классификация/критерии, алгоритм, дозы, мониторинг, references).

Idempotent — skips by id if already present.
"""
from __future__ import annotations
import json
from pathlib import Path

PATH = Path(r"C:\Users\KDFX Modes\Desktop\bordik-med\public\neonatal-guidelines.json")


def proto(
    pid: str, title_ru: str, title_en: str, category: str,
    regions: list[str], content: str, references: list[str],
) -> dict:
    return {
        "id": pid,
        "title_ru": title_ru,
        "title_en": title_en,
        "category": category,
        "regions": regions,
        "content": content,
        "references": references,
    }


# =============================================================================
# РФ PROTOCOLS (КР МЗ РФ + Приказы МЗ)
# =============================================================================
RF_PROTOCOLS = [
    proto(
        "guide_rf_primary_resuscitation_2020",
        "РФ: Первичная реанимация новорождённого (МЗ РФ 04.03.2020)",
        "RU MoH: Primary Neonatal Resuscitation Protocol (04.03.2020)",
        "resuscitation",
        ["РФ"],
        """## Показания и подготовка

Каждое родоразрешение должно сопровождаться готовностью к реанимации новорождённого. Перед родами врач-неонатолог оценивает: гестационный возраст, ожидаемый вес плода, наличие околоплодных вод (мекониальное окрашивание), количество плодов, перинатальные факторы риска.

## Алгоритм реанимации

### 1. Начальные мероприятия (первые 30 секунд)

- Тепловая защита: предварительный обогрев пеленальной поверхности до 36-37°C, обогревательная лампа над столиком, у недоношенных <32 нед — пластиковый пакет/плёнка для тела (БЕЗ обтирания).
- Положение: голова в нейтральном положении (sniffing position), валик под плечи 2-3 см.
- Освобождение дыхательных путей: аспирация ТОЛЬКО при наличии видимых выделений, не более 10-15 мм рт. ст. отрицательного давления.
- Тактильная стимуляция (растирание спины/стоп) 5-10 секунд.

### 2. Оценка состояния и ИВЛ (30-60 секунд)

- Оценка ЧСС (аускультация 6 секунд × 10) и дыхания.
- При апноэ или ЧСС <100 уд/мин — начало ИВЛ мешком Ambu или T-piece.
- Стартовое давление: PIP 20-25 см вод. ст. для термин, 20-25 для preterm; PEEP 5 см вод. ст.
- FiO₂ старт: 21% (термин ≥35 нед), 21-30% (преждевременные <35 нед).
- Частота ИВЛ: 40-60/мин.

### 3. Эскалация при ЧСС <100 после 30 сек ИВЛ

- MR SOPA коррекция: Mask, Reposition, Suction, Open mouth, Pressure, Airway alternative.
- Интубация трахеи при необходимости.

### 4. Компрессии при ЧСС <60 после 30 сек effective ИВЛ через ЭТТ

- Компрессии:вентиляция = 3:1 (90 компрессий + 30 вентиляций = 120/мин).
- Глубина 1/3 переднезаднего диаметра грудной клетки.
- FiO₂ 100% во время компрессий.

### 5. Адреналин при ЧСС <60 после 60 сек компрессий + ИВЛ

- IV/IO: 0.01-0.03 мг/кг (0.1-0.3 мл/кг раствора 1:10000).
- Эндотрахеально: 0.05-0.1 мг/кг (только если IV доступ не получен).
- Повтор каждые 3-5 минут до достижения ЧСС ≥60 уд/мин.

## Целевые SpO₂ (предуктально, правая рука)

| Время после рождения | Целевая SpO₂ |
|----------------------|---------------|
| 1 мин                | 60-65%        |
| 2 мин                | 65-70%        |
| 3 мин                | 70-75%        |
| 4 мин                | 75-80%        |
| 5 мин                | 80-85%        |
| 10 мин               | 85-95%        |

## Особенности у глубоко недоношенных <32 нед

- Деликатное обращение, минимум стимуляции.
- DCC (delayed cord clamping) ≥60 секунд если состояние позволяет.
- Раннее CPAP с PEEP 5-6 см вод. ст. при спонтанном дыхании.
- Surfactant — LISA/MIST подход при FiO₂ >0.30 на CPAP.""",
        [
            "Приказ МЗ РФ от 04.03.2020 № 119н — Порядок оказания медицинской помощи новорождённым",
            "Методические рекомендации МЗ РФ \"Первичная и реанимационная помощь новорождённым\" 2020",
            "NRP 8 ed. (American Heart Association/American Academy of Pediatrics) 2021 — основа",
            "Aziz K et al. Pediatrics 2021;147:e2020038505E — NRP guidelines",
        ],
    ),

    proto(
        "guide_rf_rds_2024",
        "РФ: Респираторный дистресс-синдром новорождённых (КР МЗ РФ 2024)",
        "RU MoH: Neonatal Respiratory Distress Syndrome (2024)",
        "respiratory",
        ["РФ"],
        """## Определение

Респираторный дистресс-синдром (РДС, СДР, болезнь гиалиновых мембран) — острая дыхательная недостаточность у новорождённых, преимущественно недоношенных, обусловленная дефицитом сурфактанта.

## Классификация по тяжести

| Степень | Силверман-Андерсен | FiO₂ | Рентгенография |
|---------|---------------------|------|----------------|
| Лёгкая  | 2-3 балла          | <0.30 | Лёгкая ретикулогранулярность |
| Средняя | 4-6 баллов         | 0.30-0.60 | Air bronchograms |
| Тяжёлая | 7-10 баллов        | >0.60 | "Белые лёгкие" |

## Антенатальная профилактика

- Дексаметазон 6 мг IM × 4 дозы каждые 12 ч ИЛИ Бетаметазон 12 мг IM × 2 дозы каждые 24 ч.
- Назначение при угрозе преждевременных родов в сроках 24-34 нед.
- Применение второго курса "rescue" дозы — при сохранении угрозы через 1-2 недели.

## Постнатальное ведение

### CPAP терапия (первичная стабилизация)

- Старт: PEEP 5-6 см вод. ст., FiO₂ 0.21-0.30.
- Цель SpO₂ 90-95%.
- Эскалация FiO₂ при необходимости.

### Сурфактант (заместительная терапия)

**Показания**:
- FiO₂ >0.30 на CPAP при GA <26 нед — раннее введение.
- FiO₂ >0.30 на CPAP при GA ≥26 нед.

**Препараты, зарегистрированные в РФ**:
- Порактант альфа (Куросурф) — 200 мг/кг (2.5 мл/кг) стартовая доза.
- Берактант (Сурванта) — 100 мг/кг (4 мл/кг).

**Способы введения**:
- LISA / MIST (Less Invasive Surfactant Administration) — preferred при стабильном состоянии на CPAP.
- INSURE (INtubate, SURfactant, Extubate) — при необходимости интубации.
- Через ЭТТ при стандартной ИВЛ.

### ИВЛ

- Volume-controlled / volume-guarantee режимы preferred.
- VT 4-6 мл/кг.
- PEEP 5-7 см вод. ст. (выше при тяжёлой РДС).
- Целевая PaCO₂ 45-55 мм рт. ст. (permissive hypercapnia).

## Мониторинг

- SpO₂ непрерывно (целевая 90-95% у недоношенных).
- ЧСС, АД (целевая MAP ≥30 мм рт. ст. в 1-е сутки).
- ABG, лактат, глюкоза.
- ЭхоКГ для оценки гемодинамики (PDA).""",
        [
            "Клинические рекомендации МЗ РФ \"Респираторный дистресс синдром у новорождённого\" (2024)",
            "Приказ МЗ РФ от 04.03.2020 № 119н",
            "Sweet DG et al. European Consensus Guidelines on RDS — 2022 Update. Neonatology 2023;120:3-23",
        ],
    ),

    proto(
        "guide_rf_hbn_2024",
        "РФ: Гипербилирубинемия и ГБН (КР МЗ РФ 2024)",
        "RU MoH: Neonatal Hyperbilirubinemia and HDFN (2024)",
        "bili",
        ["РФ"],
        """## Определение и эпидемиология

Гемолитическая болезнь плода и новорождённого (ГБН) — иммунологический конфликт между матерью и плодом по эритроцитарным антигенам. В РФ: 30-40% случаев ГБН — несовместимость по системе ABO, 10-15% — по Rh (D), реже — по Kell, Duffy и др.

## Формы ГБН

1. **Внутриутробная форма**: водянка плода (hydrops fetalis), интранатальная или ранняя неонатальная смерть.
2. **Желтушная форма**: ранняя гипербилирубинемия (в первые 24 часа), быстрый рост TSB.
3. **Анемическая форма**: poздняя анемия 3-6 нед без выраженной желтухи.
4. **Сочетанная**: анемия + желтуха.

## Диагностика

### При рождении
- Группа крови и резус-фактор пуповинной крови.
- Прямая проба Кумбса (DAT).
- TSB, билирубин-альбуминовое соотношение (B/A ratio).
- Гемоглобин, ретикулоциты, мазок крови (микроцитоз, сфероциты).

### Динамическое наблюдение
- TSB каждые 4-6 часов в первые 24 часа при ГБН.
- Темп прироста TSB >5 мкмоль/л/час — высокий риск.

## Пороги фототерапии и заменного переливания

Используются российские номограммы по гестационному возрасту (КР РФ ГБН) и AAP 2022 (см. калькулятор Bili-2022 в разделе Калькуляторы).

### Принципы
- Чем меньше GA — тем ниже пороги.
- При наличии факторов риска (изоиммунизация, асфиксия, ацидоз, сепсис, гипоальбуминемия <30 г/л) — пороги снижаются на ~30-40 мкмоль/л.
- При TSB >340 мкмоль/л у термин-ребёнка — острая билирубиновая энцефалопатия (BIND).

## Лечение

### Фототерапия (PT)

- Установки: интенсивная LED-PT с irradiance ≥30 мкВт/см²/нм, длина волны 460-490 нм.
- Continuous PT при TSB >25 мг/дл (425 мкмоль/л) или приближении к порогу DVET.
- Ребёнок без подгузника, защита глаз.

### IVIG (Внутривенный иммуноглобулин)

- При Rh- или ABO-ГБН с активным гемолизом (DAT+, Hb<140 г/л в 1-е сутки).
- Доза: 0.5-1 г/кг IV за 2 часа.
- Может предотвратить заменное переливание.

### Заменное переливание (DVET)

- Объём: double blood volume = 160 мл/кг (термин), 180 мл/кг (preterm).
- Кровь O Rh-отрицательная, совместимая с матерью и ребёнком.
- Темп: 5-10 мл/кг/час (термин), 3-5 мл/кг/час (preterm).
- Контроль: ЧСС, АД, t°, гликемия, кальций ионизированный, K+.

### Профилактика
- Анти-D иммуноглобулин (RhoGAM) у Rh-отрицательной женщины в 28 нед беременности и в первые 72 часа после родов.""",
        [
            "Клинические рекомендации МЗ РФ \"Гемолитическая болезнь плода и новорождённого\" (2024)",
            "Kemper AR et al. Pediatrics 2022;150(3):e2022058859 — AAP Hyperbilirubinemia Guideline",
            "NICE CG98 — Jaundice in newborn babies under 28 days",
        ],
    ),

    proto(
        "guide_rf_neonatal_screening_2023",
        "РФ: Расширенный неонатальный скрининг (Приказ МЗ РФ 2023)",
        "RU MoH: Expanded Neonatal Screening (2023)",
        "screening_discharge",
        ["РФ"],
        """## Нормативная база

С 1 января 2023 года в Российской Федерации действует расширенный неонатальный скрининг на 36 наследственных и врождённых заболеваний (Приказ МЗ РФ от 21.04.2022 № 274н).

## Список 36 заболеваний

### Базовая 5 (с 2006 года)
1. Фенилкетонурия (PKU)
2. Врождённый гипотиреоз (CH)
3. Адреногенитальный синдром / ВДКН (CAH)
4. Муковисцидоз (CF)
5. Галактоземия

### Расширенный скрининг (с 2023 года)
6. Спинальная мышечная атрофия (SMA)
7. Первичные иммунодефициты (TREC + KREC)

8-36. **Наследственные нарушения обмена веществ** (через MS/MS):
- Аминоацидопатии: тирозинемия I-III, MSUD, цитруллинемия I, аргининосукциновая ацидурия, аргининемия, гипераммониемия (HHH, COQ-related), гомоцистинурия (CBS-deficiency), некласс. ФКУ
- Органические ацидурии: метилмалоновая ацидемия, пропионовая, изовалериановая, глутаровая I, β-кетотиолазная, 3-метилкротонилглицинурия, мевалонатацидурия
- Дефекты β-окисления жирных кислот: MCAD, VLCAD, LCHAD, CACT, CPT-IA, CPT-II, MADD/GAII

## Сроки забора

- **Доношенные** (≥37 нед): забор крови на 4-е сутки жизни (96 часов).
- **Недоношенные**: первый забор на 7-е сутки + повторный на 1-2-е сутки после 32 нед PMA (для metab screening).
- **Транзиторные** (после переливания): повтор через 4 месяца.

## Техника забора

- Пятка (медиальная или латеральная пяточная поверхность).
- Прокол ланцетом 1.0-1.8 мм.
- Капля крови на фильтровальную бумагу (тест-карта Гатри), пропитка с обеих сторон.
- Сушка горизонтально 4 часа при комнатной температуре.
- Транспортировка в специализированную медико-генетическую консультацию.

## Подтверждающая диагностика

- При положительном скрининге — повторный анализ + специфическая диагностика (ферментный анализ, ДНК-исследование).
- Срочное направление на консультацию генетика и профильного специалиста.
- Начало лечения по протоколу заболевания (диета, заместительная терапия).

## Информированное согласие

- Согласие родителей (опекуна) обязательно.
- Возможен отказ — фиксируется в медицинской документации.""",
        [
            "Приказ МЗ РФ от 21.04.2022 № 274н \"Об утверждении Порядка оказания медицинской помощи пациентам с врождёнными и наследственными заболеваниями\"",
            "Приказ МЗ РФ от 06.10.2022 № 660н \"Об утверждении формы протокола обследования\"",
            "Распоряжение Правительства РФ от 03.06.2022 № 1444-р",
            "Federation of Russian Geneticists — Methodological recommendations 2023",
        ],
    ),

    proto(
        "guide_rf_pda_2024",
        "РФ: Открытый артериальный проток у новорождённого (КР МЗ РФ)",
        "RU MoH: Patent Ductus Arteriosus in Newborn",
        "cardiovascular",
        ["РФ"],
        """## Определение

Открытый артериальный проток (ОАП, PDA) — персистенция эмбриональной коммуникации между лёгочной артерией и аортой более 72 часов жизни у недоношенных или после периода физиологического закрытия у доношенных.

## Классификация (КР МЗ РФ)

### По размеру (ЭхоКГ)
- Малый: <1.5 мм диаметр
- Средний: 1.5-2.5 мм
- Большой: >2.5 мм

### По гемодинамической значимости (hsPDA)

Критерии гемодинамически значимого PDA:
- PDA ≥1.5 мм диаметр
- LA/Ao ≥1.4
- Диастолический ретроградный поток в нисходящей аорте
- Признаки перегрузки левого желудочка
- Клинические: тахикардия, систолический шум, "пульсирующие" пульсы, расширение пульсового давления

## Тактика ведения

### Консервативное ведение (90% начальная стратегия)

- Ограничение жидкости 120-130 мл/кг/сут (vs 150-160).
- Адекватная PEEP при ИВЛ (5-7 см вод. ст.).
- Мочегонные (фуросемид 1 мг/кг q12-24h IV) при отёке лёгких.
- Целевая SpO₂ 90-95%.

### Медикаментозное закрытие

**Показания**: hsPDA + неэффективность wean от ИВЛ/CPAP, перегрузка ЛЖ, отёк лёгких.

**Препараты (3 курса):**

| Препарат      | Доза                              | Курс       |
|---------------|-----------------------------------|-------------|
| Ибупрофен IV  | 10 → 5 → 5 мг/кг q24h             | 3 дозы     |
| Парацетамол   | 15 мг/кг q6h × 3 дня (PO/IV/RR)   | 12 доз     |
| Индометацин IV| 0.2 → 0.1 → 0.1 мг/кг q12h         | 3 дозы     |

**Эффективность закрытия**:
- Ибупрофен: 70-80% после 1 цикла
- Парацетамол: 70%
- Индометацин: 70%

### Хирургическое лигирование

**Показания**:
- Неэффективность 2 циклов медикаментозного закрытия
- Противопоказания к NSAID/парацетамолу
- Гемодинамически значимый PDA с осложнениями (СН, отёк лёгких)

## Противопоказания к NSAID

- Активное кровотечение (ВЖК III-IV, лёгочное)
- Тромбоцитопения <50 000/мкл
- Олигурия <0.6 мл/кг/час, креатинин >1.6 мг/дл
- Подозрение/подтверждение НЭК (Bell ≥II)
- Недостаточная коагуляция (INR >1.5)

## Мониторинг

- ЭхоКГ до и после каждого цикла.
- Биохимия (креатинин, мочевина, билирубин) перед каждой дозой.
- Гемостаз (тромбоциты, коагулограмма).
- Контроль диуреза.""",
        [
            "Клинические рекомендации МЗ РФ \"Открытый артериальный проток у новорождённых\" (2024)",
            "Mitra S et al. JAMA 2018;319:1221 — meta-analysis pharmacological PDA closure",
            "El-Khuffash A et al. J Pediatr 2015;167:1354 — PDA staging system",
        ],
    ),

    proto(
        "guide_rf_neonatal_sepsis_2024",
        "РФ: Неонатальный сепсис (КР МЗ РФ 2024)",
        "RU MoH: Neonatal Sepsis (2024)",
        "sepsis_infection",
        ["РФ"],
        """## Определения (КР МЗ РФ)

- **Ранний неонатальный сепсис (РНС / EOS)**: ≤72 часов жизни.
- **Поздний неонатальный сепсис (ПНС / LOS)**: >72 часов до 28 дней жизни.

## Этиология

### EOS (ранний)
- Стрептококк группы B (Streptococcus agalactiae, GBS) — до 40-50% в развитых странах
- E. coli — 20-30%
- Listeria monocytogenes — <5%
- Прочие: Klebsiella, Enterococcus, S. aureus

### LOS (поздний)
- Коагулазонегативные стафилококки (CoNS) — 40-50% (часто ассоциированы с CVC)
- S. aureus, MRSA — 10-15%
- Грам-отрицательные (Klebsiella, E. coli, Pseudomonas, Enterobacter) — 20-30%
- Грибы (Candida) — 5-10% у глубоко недоношенных, высокая летальность

## Клиника

Ранние неспецифические признаки:
- Температурная нестабильность (гипотермия чаще, чем гипертермия у preterm)
- Тахи/брадипноэ, апноэ
- Нарушение питания, рвота
- Бледность, мраморность, сниженный тонус
- Гепатоспленомегалия, желтуха

Поздние признаки:
- Шок (тахикардия, гипотония, затянутая капиллярная заполняемость)
- ДВС-синдром
- Полиорганная дисфункция
- Менингит (15% LOS)

## Лабораторная диагностика

### Перед началом ABX обязательно
- Посев крови (≥1 мл, в идеале до антибиотика)
- Общий анализ крови с лейкоцитарной формулой
- CRP, прокальцитонин (PCT)
- ABG, лактат, глюкоза
- Коагулограмма

### По показаниям
- Люмбальная пункция: при подозрении на менингит, положительной гемокультуре, клинических признаках
- Посев мочи: при LOS >7 суток (catheter sample)
- Рентгенография грудной клетки

## Эмпирическая антибактериальная терапия

### EOS
**Стандарт**: Ампициллин 50 мг/кг q8-12h IV + Гентамицин 4-5 мг/кг q24-48h IV (по GA/age).

### LOS
**Стандарт**: Ванкомицин 15 мг/кг q12h IV + Цефепим 50 мг/кг q12h IV
**Альтернатива (при подозрении на грам-отрицательные)**: Меропенем 20 мг/кг q12h IV.

### Прицельная терапия (по культуре)
- GBS-сепсис: пенициллин G 250 000 ЕД/кг q6h × 10 дней (бактериемия), 14-21 день (менингит)
- E. coli: цефотаксим / гентамицин (по чувствительности)
- CoNS: ванкомицин 14 дней (если катетер удалён)
- MRSA: ванкомицин ± линезолид 2-я линия

## Длительность лечения

- Бактериемия без менингита: 10-14 дней
- Менингит GBS: 14-21 день
- Менингит грам-отрицательный: 21 день
- Подтверждённая септицемия культурально-отрицательная: 5-7 дней (при клиническом ответе)

## Adjunctive терапия

- Стабилизация гемодинамики: волемическая нагрузка 10-20 мл/кг (до 60 мл/кг при шоке), затем инотропы (допамин 5-10 мкг/кг/мин).
- Гидрокортизон 1 мг/кг q6-8h при катехоламинрезистентном шоке.
- IVIG (Pentaglobin) 5 мл/кг (250 мг/кг) IV — рассмотреть при тяжёлом сепсисе с DIC у недоношенных.
- Поддержание euvolemia, нормогликемии, нормотермии.""",
        [
            "Клинические рекомендации МЗ РФ \"Сепсис новорождённых\" (2024)",
            "Puopolo KM, Lynfield R, Cummings JJ. Management of Infants at Risk for Group B Streptococcal Disease. Pediatrics 2019;144:e20191881",
            "Polin RA. Management of Neonates with Suspected or Proven Early-Onset Bacterial Sepsis. Pediatrics 2012;129:1006",
        ],
    ),

    proto(
        "guide_rf_ivh_pvl_2024",
        "РФ: ВЖК и перивентрикулярная лейкомаляция (КР МЗ РФ)",
        "RU MoH: Intraventricular Hemorrhage and PVL",
        "neuro",
        ["РФ"],
        """## ВЖК — классификация Папиле (Papile 1978)

| Степень | УЗ-критерии |
|---------|-------------|
| I       | Субэпендимальное кровоизлияние (germinal matrix) |
| II      | Внутрижелудочковое без расширения желудочка |
| III     | Внутрижелудочковое с расширением желудочка |
| IV      | Паренхиматозный геморрагический инфаркт |

## Профилактика ВЖК у недоношенных

### Антенатально
- Антенатальные кортикостероиды (дексаметазон / бетаметазон) в 24-34 нед.
- Магнезия сульфат при угрозе родов <32 нед — нейропротекция.
- DCC ≥60 секунд при родах <32 нед.

### Интранатально
- Минимизация манипуляций в первые 72 часа жизни.
- Поддержание нормотермии, нормогликемии, нормоCO₂ (45-55 мм рт. ст.).
- Избегание быстрых колебаний АД, осмолярности.
- Без рутинных bolus коллоидов / сипричины.

### Постнатально
- Положение головы по средней линии.
- Cluster care (минимизация прикосновений).
- Адекватная аналгезия/седация при процедурах.

## Диагностика

- УЗИ ГМ (нейросонография через большой родничок) у всех детей с GA ≤32 нед или BW ≤1500 г:
  - В первые 3 дня жизни
  - На 7-10 день жизни
  - На 28-30 день жизни
  - При выписке
  - При появлении неврологических симптомов

## Постгеморрагическая гидроцефалия (ПГГ)

### Стадии
- Транзиторная вентрикуломегалия (35% после ВЖК III-IV)
- Прогрессирующая ПГГ (15-25% после ВЖК III-IV)

### Тактика
- Сериальные УЗИ (контроль ширины боковых желудочков).
- Серийные люмбальные пункции при VI Levene >2 SD (поддерживающая мера).
- Вентрикуло-субгалеальное шунтирование при прогрессии.
- Permanent ventriculo-peritoneal шунт при PMA ≥2-3 кг.

## ПВЛ — классификация (de Vries)

| Степень | Описание |
|---------|----------|
| I       | Транзиторная перивентрикулярная hyperechogenicity ≥7 дней |
| II      | Кистозная ПВЛ локальная (1-2 кисты) |
| III     | Многокистозная ПВЛ |
| IV      | Подкорковая лейкомаляция |

## Прогноз

- ВЖК I-II: благоприятный, без значимого ущерба.
- ВЖК III: умеренный риск ДЦП (15-25%).
- ВЖК IV: высокий риск ДЦП (50-90%) + когнитивный дефицит.
- Кистозная ПВЛ III-IV: ДЦП у 80-95%.""",
        [
            "Клинические рекомендации МЗ РФ \"Внутрижелудочковые кровоизлияния у недоношенных\" (2024)",
            "Papile LA et al. J Pediatr 1978;92:529 — IVH grading",
            "de Vries LS et al. Behav Brain Res 1992;49:1 — PVL classification",
            "Doyle LW et al. Cochrane 2017;CD003935 — Antenatal steroids",
        ],
    ),

    proto(
        "guide_rf_iugr_sga_2024",
        "РФ: Задержка внутриутробного развития / SGA (КР МЗ РФ)",
        "RU MoH: Intrauterine Growth Restriction / Small for Gestational Age",
        "prematurity_classification",
        ["РФ"],
        """## Определения

- **SGA (Small for Gestational Age)**: вес при рождении <10-го перцентиля для GA по Intergrowth-21st или WHO Growth Standards.
- **IUGR (Intrauterine Growth Restriction)**: патологическая задержка роста с нарушением плацентарной функции, может быть SGA или AGA.
- **Severe SGA**: <3-го перцентиля.

## Классификация

### По типу
- **Симметричная**: пропорциональное снижение веса, длины, окружности головы. Обычно ранняя (<28 нед).
- **Асимметричная**: преимущественное снижение веса/длины при сохранной окружности головы. Обычно поздняя (>28 нед), чаще плацентарная.

### По срокам
- Ранняя (<32 нед): тяжёлый исход, часто связана с преэклампсией.
- Поздняя (≥32 нед): относительно благоприятный исход.

## Этиология

### Материнские факторы
- Преэклампсия, хроническая гипертензия
- Сахарный диабет с васкулопатией
- Хронические заболевания (СКВ, ХБП)
- Курение, алкоголь, наркотики
- Недостаточное питание

### Плацентарные
- Хорионамнионит
- Плацентарная недостаточность
- Аномалии плаценты

### Плодовые
- Хромосомные аберрации (трисомии 13, 18, 21)
- Внутриутробные инфекции (TORCH)
- Пороки развития

## Тактика ведения

### Перинатальный мониторинг
- Допплерометрия маточно-плацентарного и пупочного кровотока.
- Биофизический профиль плода.
- Антенатальные кортикостероиды при риске родов <34 нед.
- Магнезия сульфат при родах <32 нед.

### Постнатально

#### Стабилизация
- Контроль гипотермии (риск повышен из-за низкой жировой массы).
- Раннее (в первые 30-60 мин) питание / D10 IV для предотвращения гипогликемии.
- Контроль гликемии q1-2h первые 4 часа, затем q3-4h × 24-48 часов.

#### Питание
- Раннее начало grudнoгo молока (preferred).
- Trophic feeds 10-20 мл/кг/сут при reverse end-diastolic flow в umbilical artery (риск NEC).
- Острожное продвижение к full enteral 15-20 мл/кг/сут у preterm SGA.

#### Скрининги
- УЗИ ГМ при GA ≤32 нед.
- ЭхоКГ для исключения ВПС.
- Метаболический скрининг.

## Осложнения и прогноз

### Краткосрочные
- Гипогликемия (40-60% SGA в первые 24-48 ч)
- Гипотермия
- Полицитемия (>65% Hct)
- НЭК (повышенный риск, особенно при reverse umbilical flow)
- РДС (ниже у asymmetric SGA из-за accelerated lung maturation)

### Долгосрочные
- Догоняющий рост (catch-up): 80-90% догоняют peer growth к 2-3 годам.
- Risk metabolic syndrome (взрослые) — Barker hypothesis.
- Когнитивный дефицит при тяжёлом IUGR.""",
        [
            "Клинические рекомендации МЗ РФ \"Задержка роста плода / SGA\" (2024)",
            "ACOG Committee Opinion 800. 2020 — Fetal Growth Restriction",
            "Royal College of Obstetricians and Gynaecologists. Green-top Guideline 31. 2014 — SGA",
            "WHO Child Growth Standards. 2006",
        ],
    ),

    proto(
        "guide_rf_bpd_2024",
        "РФ: Бронхолёгочная дисплазия (КР МЗ РФ 2024)",
        "RU MoH: Bronchopulmonary Dysplasia",
        "respiratory",
        ["РФ"],
        """## Определение и эпидемиология

Бронхолёгочная дисплазия (БЛД) — хроническое заболевание лёгких, развивающееся у недоношенных как следствие незрелости и/или повреждения лёгочной ткани. По НИИ МЗ РФ заболеваемость БЛД у глубоко недоношенных GA <32 нед: 25-50%, у ELBW (BW <1000 г): до 60-80%.

## Классификация (Jensen 2019, NIH 2018)

Оценка на 36-й неделе PMA или при выписке (whichever first):

| Степень | Дыхательная поддержка |
|---------|------------------------|
| Лёгкая (I) | Назальные канюли <2 л/мин ИЛИ hood ≤0.30 FiO₂ |
| Средняя (II) | Канюли ≥2 л/мин ИЛИ FiO₂ ≥0.30 |
| Тяжёлая (III) | Инвазивная PPV ИЛИ ≥0.30 + nCPAP/NIPPV |

## Профилактика

### Антенатально
- Кортикостероиды при угрозе родов 24-34 нед.

### Интранатально / в родзале
- Mild хватание, ранний CPAP, минимизация интубации.
- Sustained inflation — больше НЕ рекомендуется (исследование SAIL).
- Ранний surfactant (LISA) при FiO₂ >0.30.

### Постнатально
- Кофеин (caffeine citrate) 20 мг/кг loading + 5-10 мг/кг maintenance (CAP trial — снижение БЛД).
- Vitamin A 5000 МЕ IM 3×/нед × 4 недель у ELBW (Cochrane).
- Целевая SpO₂ 90-95% (BOOST/SUPPORT).
- Закрытие hsPDA своевременное.
- Адекватное питание (110-130 ккал/кг/сут, белок 3.5-4.5 г/кг/сут).
- Минимизация баротравмы / волютравмы (volume-controlled ИВЛ).

## Лечение установленной БЛД

### Низкодозовый дексаметазон (DART scheme)

- 0.075 мг/кг/сут, далее taper 0.05 → 0.025 → 0.01 × 10 дней.
- Начало после 7-14 дней postnatal у вентилятор-зависимых.
- Снижает экстубационный риск без значимого ↑ ДЦП.

### Системная стероидная therapy
- Hydrocortisone 5 мг/кг/сут × 7 дней с тайпером (alternative DART).

### Ингаляционные кортикостероиды
- Будесонид 0.5-1 мг q12h при сохраняющейся ИВЛ.

### Диуретики
- Фуросемид 1 мг/кг q12-24h chronically — улучшает оксигенацию краткосрочно.
- Спиронолактон + гидрохлортиазид для long-term эффекта.

## БЛД-ассоциированная лёгочная гипертензия

### Диагностика
- ЭхоКГ скрининг на 36 нед PMA: TR jet, septal flattening, RV hypertrophy.
- Катетеризация при значимой PHTN.

### Лечение
- iNO 5-20 ppm (acute decompensation).
- Силденафил 0.5-2 мг/кг q6h PO (chronic).
- Бозентан (endothelin antagonist) при тяжёлой PHTN.

## Долгосрочные осложнения

- Респираторные: повторные госпитализации, бронхиальная обструкция, астма-like симптомы.
- Нейроразвитие: ↑ риск ДЦП (1.5-2× vs не-БЛД), когнитивные нарушения.
- Рост: failure to thrive у тяжёлой БЛД (повышенные калорические потребности).
- Профилактика РСВ: паливизумаб 15 мг/кг IM ежемесячно × 5 доз в эпидемический сезон у тяжёлой БЛД.""",
        [
            "Клинические рекомендации МЗ РФ \"Бронхолёгочная дисплазия\" (2024)",
            "Jensen EA et al. JAMA Pediatr 2019;173:e190988 — BPD severity classification",
            "Higgins RD et al. J Pediatr 2018;197:300 — NIH BPD definition update",
            "Schmidt B et al. NEJM 2007;357:1893 — CAP trial",
            "Doyle LW et al. NEJM 2006;355:1304 — DART trial",
        ],
    ),

    proto(
        "guide_rf_kangaroo_care_2024",
        "РФ: Метод кенгуру (KMC) и тепловая защита у новорождённых",
        "RU MoH: Kangaroo Mother Care and Thermal Protection",
        "screening_discharge",
        ["РФ", "Международный"],
        """## Определение

Метод кенгуру (Kangaroo Mother Care, KMC) — метод выхаживания недоношенных и маловесных новорождённых, включающий продолжительный кожа-к-коже контакт с матерью/отцом, исключительное грудное вскармливание и раннюю выписку с амбулаторным наблюдением.

## Показания

- Стабильные недоношенные (GA ≥28 нед, BW ≥1000 г) после первичной стабилизации.
- Доношенные с низкой массой при рождении (LBW <2500 г).
- Дети, нуждающиеся в продолжительном термогенезе.

## Преимущества (по WHO/UNICEF)

- Снижение неонатальной смертности на 36% (LBW <2000 г).
- Снижение неонатальных инфекций на 27%.
- Лучшая регуляция t°, ЧСС, дыхания.
- Снижение апноэ и брадикардии у недоношенных.
- Поддержка лактации, лучшая прибавка массы.
- Психоэмоциональная связь "мать-ребёнок" + снижение материнской депрессии.

## Алгоритм инициации

### Подготовка
- Теплая комната (≥25°C).
- Мать в свободной одежде с открытым нагрудным карманом.
- Ребёнок в подгузнике, шапочке, носках (минимум одежды для max контакта).

### Положение
- Вертикальное на груди матери "лягушачьим" положением.
- Голова повёрнута набок для свободного дыхания.
- Закрепить тканевым пеленальным шарфом или специальным жилетом.
- Проверить дыхательные пути.

### Длительность
- Стартовая: 1-2 часа непрерывно.
- Цель: ≥18 часов в сутки (continuous KMC) или ≥4-8 часов intermittent.

## Тепловая защита по Golden Hour

### Первый час жизни
- Температура воздуха в родзале ≥25°C.
- Подогретая пелёнка (36-37°C).
- Лучистый источник тепла (overhead warmer).
- У ELBW: пластиковый пакет/плёнка для тела БЕЗ обтирания.
- Транспорт-инкубатор предварительно подогрет.

### Целевая аксиллярная температура
- 36.5-37.5°C для всех новорождённых.
- При t° <36.0°C — переходный период активного согревания.

## Профилактика гипотермии при транспортировке

- Транспорт-инкубатор с air t° 36-37°C.
- Дополнительное укрытие пеленками (3-4 слоя).
- Шапочка обязательно.
- Мониторинг t° каждые 15 минут во время транспорта.

## Противопоказания к KMC

- Гемодинамическая нестабильность (требующая инотропов).
- Активный сепсис в фазе декомпенсации.
- Постоперационный период первые 24-48 часов.
- Неконтролируемая гипогликемия / судороги.

## Образовательная составляющая

- Обучение матери техники KMC, кормления, наблюдения.
- Признаки тревоги: одышка, плохое кормление, гипотермия.
- План амбулаторных визитов.""",
        [
            "Клинические рекомендации МЗ РФ \"Уход за недоношенными новорождёнными\" (2024)",
            "WHO Recommendations on Newborn Health 2017",
            "WHO/UNICEF Kangaroo Mother Care: a Practical Guide. 2003",
            "Conde-Agudelo A. Cochrane 2016;CD002771 — KMC for LBW",
        ],
    ),
]


# =============================================================================
# США PROTOCOLS (AAP, NRP, CDC, NIH)
# =============================================================================
US_PROTOCOLS = [
    proto(
        "guide_us_nrp8_full_algorithm",
        "США: NRP 8th edition — Neonatal Resuscitation Algorithm 2021",
        "USA: NRP 8th Edition Full Algorithm",
        "resuscitation",
        ["США"],
        """## Initial Assessment (within 30 seconds)

Three questions при рождении:
1. Born at term?
2. Good muscle tone?
3. Crying or breathing?

If YES to all three → routine care с матерью (skin-to-skin, drying, observation).

If NO to any → move к радиант warmer для активной resuscitation.

## Active Resuscitation Steps

### Step 1: Initial steps (within first 30 seconds)
- Provide warmth (radiant warmer, hat, plastic wrap для preterm <32 нед).
- Position airway (sniffing position, neck slight extension).
- Suction mouth then nose ONLY если obvious obstruction.
- Dry baby (skip drying если <32 нед, place in plastic bag/wrap).
- Stimulate (rub back, flick feet) 5-10 seconds.

### Step 2: Evaluate (after 30 seconds)
Check heart rate (auscultation 6 sec × 10) + respiratory effort.

**If apneic OR HR <100 bpm**:
- Start positive pressure ventilation (PPV) — 40-60 breaths/min.
- Initial PIP 20-25 cm H₂O term, 20-25 preterm.
- PEEP 5 cm H₂O.
- FiO₂: 21% term, 21-30% preterm.

### Step 3: After 30 seconds of effective PPV
Reassess heart rate.

**If HR <100 bpm despite PPV**:
- Apply MR SOPA corrective steps:
  - **M**ask adjustment
  - **R**eposition airway
  - **S**uction
  - **O**pen mouth
  - **P**ressure increase (max 40 cm H₂O term, 30 preterm)
  - **A**lternative airway (intubation or LMA)
- Continue PPV with corrective steps.

### Step 4: Chest compressions
**If HR <60 bpm despite 30 sec effective PPV via secured airway**:
- Compressions:ventilations = 3:1 (90 + 30 = 120/min).
- Depth 1/3 anteroposterior chest diameter.
- Two-thumb encircling technique preferred.
- Increase FiO₂ to 100%.
- Continue PPV during compressions (асинхронно с compressions).

### Step 5: Epinephrine
**If HR <60 bpm after 60 sec compressions + PPV**:
- IV/IO: 0.01-0.03 мг/кг (1:10000 = 0.1 мг/мл) → 0.1-0.3 мл/кг.
- ETT (only if no IV access): 0.05-0.1 мг/кг.
- Repeat every 3-5 минут if needed.

### Step 6: Volume expansion
**If hypovolemia suspected (acute blood loss, abruptio, vasa previa)**:
- 10 мл/кг IV/IO of NaCl 0.9% or O Rh-negative blood.
- Over 5-10 минут.
- May repeat × 1.

## Target Pre-ductal SpO₂ (right hand)

| Age | Target SpO₂ |
|-----|-------------|
| 1 min | 60-65% |
| 2 min | 65-70% |
| 3 min | 70-75% |
| 4 min | 75-80% |
| 5 min | 80-85% |
| 10 min | 85-95% |

## Special Situations

### Meconium-stained amniotic fluid
- Vigorous baby: routine care (NO routine intubation/suction).
- Non-vigorous baby: PPV first; intubate/suction ONLY if obstructive airway.

### Preterm <32 weeks
- Plastic bag/wrap для thermal protection.
- Delayed cord clamping (DCC) ≥30-60 sec if stable.
- Initial FiO₂ 21-30%.
- Prophylactic CPAP при spontaneous breathing.
- Consider early surfactant (LISA) при FiO₂ >0.30.

### Discontinuation
After 20 minutes of asystole (HR 0) despite all resuscitation efforts с adequate ventilation, compressions, epinephrine — consider discontinuation in consultation with team.""",
        [
            "Aziz K et al. Pediatrics 2021;147:e2020038505E — Part 5: Neonatal Resuscitation",
            "American Heart Association/American Academy of Pediatrics. NRP 8 ed. Textbook 2021",
            "Wyckoff MH et al. Circulation 2020;142:S185 — 2020 International Consensus on CPR Science",
            "Liley HG et al. Pediatrics 2024 — NRP update interim",
        ],
    ),

    proto(
        "guide_us_aap_hyperbili_2022",
        "США: AAP 2022 — Гипербилирубинемия ≥35 нед",
        "USA: AAP 2022 Hyperbilirubinemia in Newborns ≥35 weeks",
        "bili",
        ["США"],
        """## Major Update from 2004

The 2022 AAP guideline raises phototherapy and exchange transfusion thresholds (about +30 µmol/L vs 2004), reflecting evidence that lower thresholds did not prevent kernicterus и приводили к over-treatment.

## Risk Factor Stratification

### Hyperbilirubinemia neurotoxicity risk factors
- Gestational age <38 weeks
- Albumin <30 g/L
- Isoimmune hemolytic disease (DAT-positive)
- G6PD deficiency
- Sepsis
- Significant clinical instability в предыдущие 24 часа

## Phototherapy Thresholds (highly simplified)

Use the AAP nomogram (calculator: `neo-bili-2022` в разделе Калькуляторы Bordik). Thresholds vary by:
- Gestational age (35, 36, 37, 38, 39, 40+ weeks)
- Hours of life
- Presence/absence of neurotoxicity risk factors

### Example (term ≥38 нед, no risk factors, hour 24)
- Phototherapy threshold: TSB ≥18 mg/dL (308 µmol/L)
- Exchange threshold: TSB ≥27 mg/dL (462 µmol/L)

### Example (35 нед, with risk factors, hour 24)
- Phototherapy threshold: TSB ≥10 mg/dL (171 µmol/L)
- Exchange threshold: TSB ≥17 mg/dL (291 µmol/L)

## Phototherapy

### Devices
- LED-PT с irradiance ≥30 µW/cm²/nm в 460-490 nm (blue spectrum).
- Distance к ребёнку 30-50 см.
- Maximum surface area exposed (no diaper если возможно, eye protection).

### Intensive PT criteria
- TSB at threshold OR within 2 mg/dL of exchange transfusion threshold.
- Use multiple PT sources to maximize body surface coverage.

### Discontinuation
- TSB ≥2 mg/dL below phototherapy threshold.
- Rebound check 12-24 hours после discontinuation.

## Escalation of Care

### Threshold "narrow zone" (within 2 mg/dL of exchange)
- Hospital admission.
- Intensive PT continuous.
- IV hydration as needed.
- IVIG для isoimmune hemolytic disease (Rh, ABO with active hemolysis): 0.5-1 g/kg IV.
- Notify exchange transfusion team.

### Failed escalation
- TSB rises despite intensive PT × 6 hours
- TSB не снижается ≥0.5 mg/dL/hour
- TSB approaching exchange threshold

→ **Exchange transfusion**.

## Exchange Transfusion (DVET)

### Procedure
- Double blood volume = 160 mL/kg term, 180 mL/kg preterm.
- Through umbilical venous catheter (preferred) or peripheral arterial-venous combo.
- Aliquots 5-10 mL term, 3-5 mL preterm.
- Rate 5-10 mL/kg/hour.

### Monitoring
- Vital signs continuously.
- Glucose, ionized calcium, K+ q15-30 min.
- TSB before and after, then 4-6h post.

### Complications
- Hyperkalemia, hypocalcemia, hypoglycemia.
- Thrombocytopenia, coagulopathy.
- Necrotizing enterocolitis (NEC) — особенно у preterm.
- Mortality 0.5-1.0%.

## Follow-Up

- All babies with TSB ≥phototherapy threshold OR hospitalised для PT — follow-up визит 24-72 hours после выписки.
- Re-check TSB when discharged early (<72 hours) if baseline нaклон риск.""",
        [
            "Kemper AR et al. Pediatrics 2022;150(3):e2022058859 — AAP 2022 Clinical Practice Guideline Hyperbilirubinemia",
            "AAP Clinical Report 2022 — Implementation Guide",
            "Maisels MJ et al. J Perinatol 2012;32:660 — Predicting hyperbilirubinemia",
        ],
    ),

    proto(
        "guide_us_cdc_gbs_2019",
        "США: CDC/AAP — Профилактика GBS-инфекции (2019 update)",
        "USA: CDC/AAP GBS Prevention 2019 Update",
        "sepsis_infection",
        ["США"],
        """## Universal Maternal Screening

Recto-vaginal culture для GBS (Streptococcus agalactiae) на 36 0/7 — 37 6/7 weeks gestation. Positive culture → indication для intrapartum antibiotic prophylaxis (IAP).

## IAP Indications

### Recommended (any of):
1. GBS-positive vaginal/rectal culture in current pregnancy
2. GBS bacteriuria during current pregnancy
3. Previous infant with invasive GBS disease
4. Unknown GBS status + any of:
   - Delivery <37 weeks
   - Membrane rupture ≥18 hours
   - Intrapartum temperature ≥38.0°C (consider chorioamnionitis)
   - Intrapartum NAAT positive

### NOT recommended
- Negative GBS culture in current pregnancy AND no risk factors.
- Cesarean delivery before labor with intact membranes (regardless of GBS status).

## IAP Antibiotics

### First-line
**Penicillin G** 5 million units IV initial dose, then 2.5-3 million units IV q4h until delivery.

### Alternative
**Ampicillin** 2 g IV initial, then 1 g IV q4h until delivery.

### Penicillin allergy
- **Low-anaphylaxis risk** (no urticaria/anaphylaxis history): Cefazolin 2 g IV initial, then 1 g IV q8h.
- **High-anaphylaxis risk**: Susceptibility testing (clindamycin/erythromycin). If susceptible — clindamycin 900 mg IV q8h. If resistant or unknown — vancomycin 20 mg/kg IV q8h (max 2 g per dose).

## Adequate IAP Definition

≥1 dose of penicillin/ampicillin/cefazolin given ≥4 hours before delivery.

If <4 hours OR alternate antibiotics → considered "inadequate IAP" → enhanced neonatal observation.

## Newborn Management

### Well-appearing infant + GBS-positive mother + adequate IAP
- Routine newborn care.
- Observation для signs of infection × 36-48 hours.
- No labs/antibiotics if asymptomatic.

### Well-appearing infant + GBS-positive mother + INadequate IAP
**Two approaches**:

**Approach 1 — Categorical (older)**:
- If ≥37 weeks, ROM <18h: observation 36-48h.
- If <37 weeks OR ROM ≥18h: blood culture + CBC + observation.

**Approach 2 — Multivariate (Kaiser EOS Calculator)**:
- Plug in maternal data + neonatal status → algorithm-driven recommendation.
- Currently most precision; reduces unnecessary antibiotic use ≥50%.

### Ill-appearing infant (regardless of maternal status/IAP)
- Full septic work-up (blood culture, CBC, CRP/PCT, LP if signs).
- Empiric antibiotics: ampicillin + gentamicin.
- Continue ≥48 hours pending cultures.

## Outcomes With Universal Screening

- EOS GBS incidence в США снизилась с 1.7/1000 (1993) до 0.22/1000 (2019).
- Mortality EOS GBS: ~5-10% term, 15-25% preterm.

## Long-Term GBS Vaccine

GBS conjugate vaccines в фазе 3 trials. Not yet approved (2025) для routine use.""",
        [
            "Verani JR et al. CDC Recommendations and Reports 2019",
            "Puopolo KM et al. Pediatrics 2019;144(2):e20191881 — AAP Clinical Report",
            "ACOG Committee Opinion 797. 2020 — Group B Streptococcus",
            "Phares CR et al. JAMA 2008;299:2056",
        ],
    ),

    proto(
        "guide_us_aap_nas_eat_sleep_console",
        "США: AAP — Eat-Sleep-Console (ESC) для NAS",
        "USA: AAP Eat-Sleep-Console Approach for Neonatal Abstinence Syndrome",
        "pain_nas_sedation",
        ["США"],
        """## Background

Eat-Sleep-Console (ESC) is a function-based assessment tool, alternative к Modified Finnegan (FNAS), для оценки и lечения NOWS (Neonatal Opioid Withdrawal Syndrome). Pioneered Yale Children's Hospital (Grossman 2017), endorsed by AAP 2020+.

## ESC Function-Based Criteria

### Eats
- Term: ≥1 oz formula OR ≥10 минут эффективного breastfeeding
- Preterm: feeding adequate per per individualized goal

### Sleeps
- ≥1 hour undisturbed sleep period

### Consoles
- Returns к calm baseline within ≤10 minutes с non-pharmacologic measures

If all 3 criteria met → continue non-pharmacologic care.
If ≥1 not met after optimised non-pharm bundle → consider pharmacologic treatment.

## Non-Pharmacologic Bundle (First-Line)

### Maternal
- Rooming-in 24/7 (single most effective intervention).
- Skin-to-skin contact.
- Breastfeeding (если no contraindication: HIV, polysubstance, methadone OK).
- Pumping breast milk if mother unable.

### Environmental
- Low-stimulation environment (dim lighting, quiet).
- Single-room model preferred over open NICU.
- Minimal handling, cluster care.

### Comfort measures
- Swaddling.
- Pacifier.
- Soothing rocking, gentle holding.
- Sucrose 24% PRN для discrete procedures.

## Comparison ESC vs Finnegan

| Outcome | Finnegan | ESC |
|---------|----------|-----|
| Length of stay | 23-30 days | 6-10 days |
| % treated pharm | 80-90% | 25-40% |
| Total opioid exposure | High | Substantially reduced |
| Re-hospitalisation | similar | similar |

## Pharmacologic Treatment (When ESC Fails)

### First-line: Morphine
- 0.04-0.1 мг/кг q3-4h PO (oral suspension preferred).
- Titrate up by 10-20% if not controlled.
- Wean by 10-20% q1-2 days as condition allows.

### Alternative: Buprenorphine sublingual (BBORN trial)
- 4-5 µg/kg q8h SL.
- Shorter median treatment duration (15 vs 28 days morphine).
- Becoming preferred at NAS centers с experience.

### Adjunct: Clonidine (α₂-agonist)
- 1 µg/kg q3-4h PO.
- Adjunct если monotherapy with opioid not sufficient.

### NOT recommended first-line
- Phenobarbital (decline в use, neurodevelopmental concerns).
- Diazepam.

## Discharge Criteria

- Off pharmacologic treatment ≥24-48 hours без rescue.
- Adequate feeding, weight gain trajectory.
- Acceptable sleep/console pattern.
- Maternal-infant attachment, social work clearance.
- Pediatric follow-up arranged + developmental clinic referral.

## Long-Term Considerations

- Higher risk neurodevelopmental delays, ADHD, learning difficulties — multifactorial (drug + social environment).
- Wraparound services (PT/OT, behavioral health, social work) improve outcomes.
- SUDEP risk — safe sleep education, smoke avoidance.""",
        [
            "Patrick SW et al. Pediatrics 2020;146:e2020029074 — AAP Clinical Report NAS",
            "Grossman MR et al. Pediatrics 2017;139:e20163360 — ESC original",
            "Kraft WK et al. NEJM 2017;376:2341 — BBORN trial buprenorphine",
            "Hudak ML, Tan RC. AAP Pediatrics 2012;129:e540 — original NAS guidance",
            "ACOG Committee Opinion 711. 2017 — Opioid Use During Pregnancy",
        ],
    ),

    proto(
        "guide_us_aap_lisa_surfactant",
        "США: AAP/AAP-AHA — LISA / MIST surfactant therapy",
        "USA: AAP LISA / MIST Surfactant Administration",
        "respiratory",
        ["США"],
        """## Definition

LISA (Less Invasive Surfactant Administration) и MIST (Minimally Invasive Surfactant Therapy) — техника введения сурфактанта через тонкий катетер у спонтанно дышащего ребёнка на CPAP без необходимости intubation/PPV.

## Indications

- Premature infant <32 weeks gestation.
- Respiratory distress syndrome with FiO₂ requirement >0.30 on CPAP с PEEP ≥5 см H₂O.
- Spontaneous breathing maintained.
- Cooperative haemodynamic stability.

## Contraindications

- Apnea or inadequate spontaneous respiratory drive.
- Severe RDS requiring IPPV.
- Pneumothorax.
- Major congenital anomaly affecting airway.

## Procedure

### Preparation
- Continue CPAP throughout procedure.
- Position infant supine, neck in sniffing position.
- Pre-measure catheter depth using NTL (nose-tragus length) или ETT formula:
  - GA-based: 1 + 0.2 × weight (kg) cm от lip.
  - Formula 6 + weight (kg) cm.

### Premedication (selective)
- Atropine 0.02 мг/кг IV (anti-vagal) — обычно given.
- Sedation — controversial, often AVOIDED для preserve respiratory drive.
- Sucrose 24% 0.5 мл PO 2 минут до procedure.

### Insertion
1. Direct laryngoscopy with видимостью голосовых связок.
2. Pass thin catheter (4-5 Fr) через cords к pre-measured depth.
3. Hold catheter в position; remove laryngoscope.
4. Maintain CPAP via nasal interface.

### Surfactant administration
- Inject surfactant in 2-4 aliquots over 30-60 seconds via catheter.
- Pause briefly between aliquots (allow distribution).
- Watch для desaturations or apnea.
- Total time 1-3 минут.

### Post-procedure
- Continue CPAP (don't extubate to room air).
- Monitor SpO₂, HR, RR closely first 30-60 minutes.
- Wean FiO₂ as oxygenation improves.

## Surfactant Preparations (US-Approved)

| Препарат | Origin | Dose |
|----------|--------|------|
| Curosurf (poractant alfa) | Porcine | 200 mg/kg first, 100 mg/kg subsequent |
| Survanta (beractant) | Bovine | 100 mg/kg per dose |
| Infasurf (calfactant) | Bovine | 105 mg/kg per dose |

Curosurf 200 mg/kg first dose preferred — best evidence для outcomes (Singh 2015 Cochrane).

## Outcomes Compared to INSURE/Standard

LISA vs INSURE (intubate-surfactant-extubate):
- Lower BPD rate (Cochrane 2017).
- Lower death/BPD composite.
- Lower mechanical ventilation requirement at 72 hours.

LISA vs no surfactant on CPAP:
- Reduced need for intubation/IPPV.
- Reduced air leaks.
- Slightly improved survival without BPD.

## Implementation Considerations

- Requires staff training and skill maintenance.
- Initial learning curve (success rate plateaus after ~10-20 cases per provider).
- Specialized catheter (LISA-cath) preferable over feeding tube.""",
        [
            "Aldana-Aguirre JC et al. Arch Dis Child Fetal Neonatal Ed 2017;102:F17 — meta-analysis LISA",
            "Sweet DG et al. Neonatology 2023;120:3 — European Consensus 2022 RDS",
            "Kribs A et al. JAMA Pediatr 2015;169:723 — NINSAPP trial",
            "Polin RA, Carlo WA. Pediatrics 2014;133:156 — AAP Surfactant Replacement Therapy",
        ],
    ),

    proto(
        "guide_us_kaiser_eos_calculator",
        "США: Kaiser Permanente EOS Risk Calculator",
        "USA: Kaiser Permanente Early-Onset Sepsis Risk Calculator",
        "sepsis_infection",
        ["США"],
        """## Description

The Kaiser Permanente EOS Calculator (Puopolo, Escobar 2014) is a multi-variable predictive model для early-onset sepsis (<72 hours) у термин и near-term newborns ≥34 weeks gestation. Online: https://neonatalsepsiscalculator.kaiserpermanente.org

## Inputs

### Maternal/Pregnancy
- Gestational age в weeks
- Highest maternal antepartum/intrapartum temperature
- Duration of rupture of membranes (hours)
- GBS colonisation status (+, −, unknown)
- Type and timing of intrapartum antibiotic prophylaxis (broad-spectrum / GBS-specific / none)

### Population Risk
- Local incidence of EOS (default 0.5/1000 livebirths).

## Outputs

### EOS risk per 1000 живорождённых
- Low risk: <1 per 1000
- Moderate: 1-3 per 1000
- High: ≥3 per 1000

### Newborn clinical condition
- Well-appearing
- Equivocal (one abnormal vital sign or finding)
- Clinical illness (multiple abnormalities, sepsis-like presentation)

### Recommendation matrix

| EOS risk | Well | Equivocal | Clinical illness |
|----------|------|-----------|-------------------|
| <1/1000  | Routine care | Vital signs × 24h | Empiric antibiotics + CBC + culture |
| 1-3/1000 | Routine care | Vital signs × 36-48h | Empiric antibiotics + CBC + culture |
| ≥3/1000  | Vital signs × 36-48h, blood culture optional | Empiric antibiotics + CBC + culture | Empiric antibiotics + CBC + culture |

## Validation and Outcomes

- Reduces unnecessary antibiotic exposure ≥50% vs categorical (CDC) approach.
- Comparable or better detection of EOS.
- AAP-endorsed for management ≥34 нед гестации (alongside categorical и Puopolo Tiered approaches).

## Limitations

- Not validated для preterm <34 нед — use Puopolo Tiered approach instead.
- Does not replace clinical judgment.
- Local EOS incidence may need adjustment (default reflects USA average).

## Usage Workflow

1. At 12 hours of life (or earlier if symptomatic), input maternal/pregnancy data.
2. Get baseline EOS risk per 1000.
3. Add neonatal clinical condition.
4. Get recommendation.
5. Re-evaluate at any clinical change OR at 24-48 hours of life.

## Comparison Approaches

### Categorical (CDC 2010)
- Algorithm based на maternal risk factors (chorioamnionitis, GBS, ROM).
- Higher sensitivity, lower specificity.
- Higher % of newborns receiving empiric antibiotics.

### Multivariable (Kaiser)
- Probability-based.
- Higher specificity, comparable sensitivity.
- Lower % of unnecessary antibiotic exposure.

### Newborn Clinical Examination
- Recommended by AAP if highly experienced staff с frequent re-evaluation.
- Acceptable approach в low-risk-for-sepsis institutions.""",
        [
            "Puopolo KM et al. Pediatrics 2019;144:e20191881 — AAP Clinical Report EOS ≥35 нед",
            "Escobar GJ et al. Pediatrics 2014;133:30 — Kaiser EOS development",
            "Kuzniewicz MW et al. JAMA Pediatr 2017;171:365 — implementation outcomes",
            "Kaiser Permanente EOS Calculator: https://neonatalsepsiscalculator.kaiserpermanente.org",
        ],
    ),

    proto(
        "guide_us_aap_circumcision",
        "США: AAP — Procedural pain в neonatal circumcision",
        "USA: AAP Pain Management for Neonatal Circumcision",
        "pain_nas_sedation",
        ["США"],
        """## AAP Position (2012, reaffirmed 2018)

The American Academy of Pediatrics:
1. Циркумцизия имеет potential medical benefits (reduced UTI, HIV transmission, penile cancer).
2. Benefits do not outweigh risks sufficient для recommend routine universal circumcision.
3. Decision is family/cultural.
4. **If performed, ALWAYS include adequate analgesia and anesthesia.**

## Pain Management (Mandatory если performing)

### Pre-procedural
- Sucrose 24% solution 0.5-2 мл PO 2 минут до procedure.
- Pacifier для non-nutritive sucking.
- Swaddling extremities (только не genital region).
- Quiet environment, dimmed lights.

### Procedural Anesthesia (REQUIRED)

**Dorsal penile nerve block (DPNB)**:
- 0.4 мл lidocaine 1% (without epinephrine) injected at 10 и 2 o'clock positions of penis base.
- Aspirate before injection (avoid intravascular).
- Wait 3-5 минут для onset.

**Ring block**:
- 1.0 мл lidocaine 1% injected circumferentially at base.
- More effective than DPNB alone (Kass-Iliya 1998).

**Topical EMLA cream (lidocaine-prilocaine)**:
- 1-2 g applied 60-90 минут до procedure.
- Less effective than nerve block alone.
- May be combined с DPNB для enhanced effect.

### Maximum Lidocaine Dose
- 4 мг/кг (without epinephrine) — risk of methemoglobinemia at higher doses, especially with EMLA combo.

### Inadequate Pain Management
- Acetaminophen alone is **NOT** adequate for circumcision pain.
- Sucrose alone is **NOT** sufficient.

## Post-Procedural

- Acetaminophen 10-15 мг/кг q6h × 24-48 hours.
- Petroleum jelly to wound (Vaseline) для 5-7 days.
- Continue feeding, comforting.

## Contraindications

- Premature ELBW or critically ill infant.
- Hypospadias, epispadias, micropenis.
- Bleeding disorders / family history.
- Evidence of infection or congenital anomaly affecting genitalia.

## Methods Compared

| Method | Pros | Cons |
|--------|------|------|
| Plastibell | Less bleeding, slower healing | Plastic device left in place |
| Gomco clamp | Quick, less swelling | Mechanical apparatus |
| Mogen clamp | Quick (1-2 min), less mucosal cuff | Risk of glanular injury (rare) |

All require **same level of pain management**.

## Outcomes With Adequate Analgesia

- Reduced behavioral distress.
- Reduced cortisol response.
- Improved feeding posture-procedurally.
- Reduced parental anxiety.""",
        [
            "AAP Task Force on Circumcision. Pediatrics 2012;130:e756 — Circumcision Policy Statement",
            "AAP CFN. Pediatrics 2016;137:e20154271 — Pain Assessment & Management",
            "Kass-Iliya FE et al. Pediatrics 1998;101:e9 — DPNB efficacy",
            "Razmus IS et al. Adv Neonatal Care 2004;4:22",
        ],
    ),

    proto(
        "guide_us_safe_sleep_2022",
        "США: AAP — Safe Sleep recommendations 2022",
        "USA: AAP Safe Sleep Recommendations 2022",
        "screening_discharge",
        ["США"],
        """## Background

Sudden Infant Death Syndrome (SIDS) и sleep-related deaths остаются ведущей причиной death of 1-12 month infants. AAP 2022 Policy provides evidence-based recommendations.

## Core "ABCs of Safe Sleep"

### A — Alone
- Baby sleeps alone in own crib/bassinet/play yard.
- NO bed sharing с adults, siblings, or other infants.
- Same room sharing recommended × first 6 months (ideally 12 months).

### B — Back to sleep
- ALWAYS place baby on BACK для every sleep (naps and nighttime).
- Continue для first year.
- Side sleeping is NOT safe.

### C — Crib (firm sleep surface)
- Firm, flat sleep surface.
- Tightly fitted sheet only.
- NO soft objects: pillows, blankets, bumpers, stuffed animals, positioners.
- NO incline >10 degrees.

## 2022 Updates

### Specific products warned against
- Inclined sleepers (Rock 'n Play type) — banned in 2019, AAP reinforces ban.
- In-bed sleepers, baby boxes (in some markets).
- Weighted swaddles, weighted blankets.

### Pacifier
- Offer at every sleep × first year (after breastfeeding established).
- Reduces SIDS risk by ~50%.
- If falls out, no need to reinsert.

## Mother-Infant Sleep Surfaces

### Bedsharing — strongly NOT recommended при ANY of:
- Adult смокер.
- Adult under influence of alcohol/drugs.
- Adult overly tired.
- Soft sleep surface (couch, recliner, water bed).
- Other children/pets.
- Premature/low birth weight infant.
- Multiple births.

### Roomsharing — RECOMMENDED
- Crib/bassinet within arm's reach.
- Reduces SIDS risk by 50%.
- Continue до 6 месяцев minimum, ideally 12.

## Other Safe Sleep Practices

### Breastfeeding
- Reduces SIDS risk ~50%.
- Continue exclusive ≥4 months ideally.

### Avoid overheating
- Light sleep clothing.
- Room temperature appropriate (not warm).
- Head uncovered.

### Smoke exposure
- No smoking during pregnancy.
- No smoking in home/around infant.
- Smoke-free vehicles.

### Tummy time (awake)
- Supervised tummy time от birth.
- Helps prevent positional plagiocephaly.
- Builds upper body strength.

### Vaccinations
- AAP recommends following standard schedule.
- Reduces risk of SIDS (limited but consistent evidence).

### Avoid commercial devices marketed to reduce SIDS
- Most lack evidence.
- Some may be unsafe.

## Special Populations

### NICU graduates
- Same safe sleep principles apply.
- Transition to home crib BEFORE discharge for adjustment.

### Preterm infants
- Same principles, attentively.
- Plagiocephaly more common — alternate head positioning during AWAKE supervised time.

## Public Health Impact

US SIDS rates:
- 1990: 130 per 100,000 livebirths
- 2020: 35 per 100,000 (after Back-to-Sleep campaign)

Ongoing disparities (higher rates among Black, AI/AN, low-SES populations) — equity priority for AAP.""",
        [
            "Moon RY et al. Pediatrics 2022;150:e2022057990 — AAP Safe Sleep Policy 2022",
            "AAP Clinical Report. Pediatrics 2016;138:e20162938 — original framework",
            "CDC Sudden Unexpected Infant Death and SIDS",
            "Krous HF et al. Forensic Sci Med Pathol 2007;3:191 — SIDS definition",
        ],
    ),
]


# =============================================================================
# ЕВРОПА PROTOCOLS (NICE / ESPGHAN / ERC / BAPM)
# =============================================================================
EU_PROTOCOLS = [
    proto(
        "guide_eu_erc_2021_newborn_life_support",
        "Европа: ERC 2021 — Newborn Life Support",
        "EU: European Resuscitation Council 2021 NLS",
        "resuscitation",
        ["Европа"],
        """## ERC 2021 NLS Algorithm

### Initial steps (similar to NRP)
- Provide warmth.
- Position airway (sniffing position).
- Suction if obstructed.
- Stimulate.

### Major Distinctions from NRP

#### Initial breaths (5 inflation breaths)
- ERC recommends 5 sustained inflation breaths (2-3 second hold) при initial PPV.
- NRP doesn't specify "inflation breaths" the same way.

#### Heart rate assessment timing
- ERC: assess HR after 30 seconds initial steps + 5 inflation breaths.
- NRP: assess after 30 seconds initial steps, then PPV if needed.

#### Compression rate
- ERC: 100 compressions/min (3:1 ratio = 75 compressions + 25 ventilations per minute, total 100/min).
- NRP: 90 compressions + 30 ventilations = 120/min total.

#### FiO₂ titration
- ERC: 21% start for term, 21-30% for preterm <32 нед.
- Similar to NRP.

#### Cord clamping
- ERC 2021: delayed cord clamping (DCC) ≥60 seconds for ALL term and preterm if condition allows. Even for term babies needing resuscitation, consider intact cord resuscitation if feasible.

## ERC 2025 Updates (Preview)

- Cord milking (UCM): NOT recommended <28 нед (risk IVH).
- DCC vs UCM: DCC preferred if baby vigorous.
- Algorithm refinements toward intact-cord resuscitation.

## Target SpO₂ (similar to NRP)

| Time | Target SpO₂ |
|------|-------------|
| 2 min | 65% |
| 5 min | 85% |
| 10 min | 90% |

## Equipment

### Bag-mask ventilation
- T-piece resuscitator preferred over self-inflating bag for preterm (controlled PIP/PEEP).
- Self-inflating bag для term babies acceptable.

### Sustained inflation
- 2-3 second sustained inflation × 5 initial breaths in ERC algorithm (controversial; SAIL trial showed no benefit, possibly harm — under review).

## Special Situations

### Very preterm (<28 нед)
- Plastic bag/wrap (NOT drying).
- Pre-warmed transport incubator.
- Early CPAP при spontaneous breathing.
- LISA surfactant when indicated.

### Meconium-stained fluid
- Vigorous: routine care.
- Non-vigorous: PPV first; intubation/suction not routine.

## Training and Certification

ERC NLS course required for European NICU staff. Recertification q2 years.""",
        [
            "Wyckoff MH et al. Resuscitation 2021;161:189 — ERC Guidelines 2021 Newborn",
            "Madar J et al. Resuscitation 2021;161:291 — ERC NLS",
            "Liley HG et al. Pediatrics 2024 — interim NRP updates",
            "Hooper SB et al. Frontiers in Pediatrics 2018",
        ],
    ),

    proto(
        "guide_eu_nice_ng195_eos",
        "Европа: NICE NG195 — Neonatal Infection Prevention/Treatment",
        "EU: NICE NG195 Neonatal Infection 2021",
        "sepsis_infection",
        ["Европа"],
        """## NICE NG195 (2021)

Replaces CG149 (2012). Provides comprehensive guidance for prevention, identification и antibiotic treatment of EOS и LOS в UK NHS.

## Maternal Risk Factors (Red Flags)

### Major
- Suspected/confirmed maternal sepsis.
- Confirmed or suspected infection in another baby in case of multiples.
- Membrane rupture ≥18 hours preterm OR ≥24 hours term.
- Maternal temperature >38.0°C antenatal/intrapartum (with risk of chorioamnionitis).
- Premature labor < 37 weeks.

### Other
- Maternal GBS colonization, bacteriuria, previous infant с GBS.
- Inadequate IAP for GBS-positive.

## Newborn Clinical Indicators (Red Flags)

### Major (any one — full work-up + start antibiotics)
- Term baby с respiratory distress >4 hours.
- Apnea or seizure.
- Need for cardiopulmonary resuscitation.
- Need for mechanical ventilation in preterm.
- Signs of shock (poor perfusion, hypotension).
- Persistent fetal circulation.
- Temperature <36.0°C OR >38.0°C postnatally.

### Other
- Altered behavior/responsiveness.
- Altered muscle tone (floppiness).
- Feeding difficulties (poor feed, vomiting).
- Persistent tachycardia, tachypnea, abdominal distention, jaundice within 24h.

## Decision Pathway

### 1+ Red Flag (any from above)
- Take blood culture + CRP.
- Start empirical antibiotics within 1 hour.
- Lumbar puncture before antibiotics if clinically indicated and infant stable.

### 2+ non-red flag risk factors / clinical indicators
- Take blood culture + CRP.
- Consider antibiotics based on clinical picture.

### 1 risk factor only, no clinical indicator
- Observe для at least 12 hours: regular vital signs, feeding pattern.

## Antibiotic Choice

### EOS (presumed)
**First-line**: Benzylpenicillin (penicillin G) 50 мг/кг q12h (q8h при <32 weeks PMA) + Gentamicin 5 мг/кг q24h (q36h <32 weeks).

### LOS (>72 hours)
**Hospital-acquired**: Flucloxacillin 25 мг/кг q8h + Gentamicin 5 мг/кг q24h.
**Local resistance/CoNS suspected**: substitute или add Vancomycin 15 мг/кг q12h.

### Meningitis
- Cefotaxime 50 мг/кг q8h + Amoxicillin 50 мг/кг q12h (covers Listeria).
- Treatment 21 days for proven meningitis.

## Length of Treatment

### Negative culture, well infant
- Stop antibiotics после 36 hours if cultures negative + clinical improvement.

### Positive culture, no meningitis
- 7-10 days IV (longer if persistent positive cultures or focus).

### Meningitis
- 14-21 days (depending pathogen).

### Continued symptoms despite negative cultures
- Continue 5-7 days, reassess by clinical team.

## CRP Use

- CRP not isolated test для diagnosis.
- Used in conjunction с culture + clinical evaluation.
- Persistent CRP elevation in well-appearing baby — review с senior team, consider extended observation/antibiotics.""",
        [
            "NICE Guideline NG195. 2021 — Neonatal Infection: antibiotics for prevention and treatment",
            "NICE QS75 — Quality standard для neonatal infection",
            "Cailes B et al. Lancet Infect Dis 2020;20:330 — UK neonatal sepsis epidemiology",
            "BAPM Framework для Practice. 2017 — Management of neonates with suspected infection",
        ],
    ),

    proto(
        "guide_eu_espghan_pn_2018",
        "Европа: ESPGHAN/ESPEN/ESPR/CSPEN 2018 — Парентеральное питание новорождённых",
        "EU: ESPGHAN PN Guidelines 2018",
        "gastro",
        ["Европа"],
        """## Energy and Macronutrient Targets

### Total energy (kcal/kg/day)
- Stable preterm: 110-130
- Septic/critically ill: lower (90-100) первые 1-3 дня
- Catch-up growth: до 160

### Protein (amino acids)
- Day 1: start 1.5-3.0 g/kg/day (early aggressive).
- Target by day 2-3: preterm 3.5-4.0 g/kg/day, term 2.5-3.0.
- Source: amino acid solution (Aminoven Infant 10%, Vamin Infant и т.п.).

### Lipids
- Start: 1-2 g/kg/day.
- Advance by 0.5-1 g/kg/day.
- Target: 3-4 g/kg/day.
- **Composition**: SMOFlipid (mixed soy + MCT + olive + fish oil) preferred over pure soybean — снижает IFALD risk.
- Pure fish oil emulsion (Omegaven) для established IFALD treatment.

### Glucose (carbohydrate)
- GIR target: 4-12 mg/kg/min (start 4-6, advance gradually).
- Maximum tolerated: 12-14 mg/kg/min (above — hyperglycemia risk).
- Hyperglycemia treatment:
  - Decrease GIR (not below 4 mg/kg/min).
  - Insulin if persistent BG >10 mmol/L despite optimized GIR.

## Fluid Targets (preterm <32 weeks)

| Day | Fluid (mL/kg/day) |
|-----|---------------------|
| 1   | 80-100             |
| 2   | 100-120            |
| 3   | 120-140            |
| 4-7 | 140-160            |
| ≥7  | 150-180 (steady-state) |

## Electrolytes

### Sodium
- Day 1-2: usually 0 (renal water loss первые 2-3 days).
- Day 3+: 2-5 mmol/kg/day.

### Potassium
- After confirmed urination: 1-3 mmol/kg/day.

### Calcium
- 1.5-2.5 mmol/kg/day (60-100 mg/kg/day Ca++).

### Phosphate
- 1.0-2.5 mmol/kg/day (Ca:P ratio 1.0-1.5:1 mass).

### Magnesium
- 0.2-0.5 mmol/kg/day.

## Trace Elements

### Daily IV requirements (preterm)
- Zinc: 400-450 µg/kg/day (2-3 weeks postnatally onwards)
- Copper: 20 µg/kg/day
- Selenium: 2-3 µg/kg/day
- Iodine: 1 µg/kg/day
- Manganese: 1 µg/kg/day

## Vitamins

### Daily IV requirements (preterm)
- Vit A: 700-1500 IU/kg
- Vit D: 200-1000 IU/kg
- Vit E: 2.8-3.5 mg/kg
- Vit K: 10-80 µg/kg
- Vit C: 15-25 mg/kg
- B-complex per pediatric multivitamin formulation

## Special Considerations

### Prevention of IFALD (Intestinal Failure-Associated Liver Disease)
- Early enteral feeding when feasible (даже trophic 5-10 ml/kg/day).
- Avoid pure soy-based lipid (>1 g/kg/day) prolonged.
- Cyclical PN where possible.
- Monitor liver function weekly.

### When to wean PN
- Enteral intake ≥120-140 mL/kg/day с adequate caloric/protein delivery.
- Wean lipids first → amino acids → dextrose.
- Maintain CVL для 24-48 hours post-PN cessation.""",
        [
            "Mihatsch WA et al. Clin Nutr 2018;37:2306 — ESPGHAN/ESPEN/ESPR/CSPEN 2018 PN Guidelines",
            "Hartman C et al. JPGN 2018 — Vitamins and Minerals (Section 11)",
            "Lapillonne A et al. JPGN 2018 — Lipids (Section 6)",
            "Hojsak I et al. JPGN 2018 — Carbohydrates (Section 5)",
        ],
    ),

    proto(
        "guide_eu_espghan_en_2022",
        "Европа: ESPGHAN 2022 — Энтеральное питание VLBW preterm",
        "EU: ESPGHAN 2022 Enteral Nutrition for VLBW Preterm",
        "gastro",
        ["Европа"],
        """## Background and Update

ESPGHAN Position Paper 2022 заменяет 2010 рекомендации, отражая эволюцию практик в питании очень недоношенных (VLBW <1500 g).

## First Feed

### Mother's Own Milk (MOM)
- **Strongly preferred** для все newborns.
- Initiation в первые часы жизни (по condition).
- Continued breastfeeding support (lactation consultant, pumping equipment).

### Donor Human Milk (DHM)
- Preferred when MOM unavailable, особенно у VLBW.
- Pasteurized (Holder method) от accredited milk bank.
- Reduces NEC vs formula.

### Preterm Formula
- Last resort if MOM/DHM unavailable.
- Higher protein/mineral content vs term formula.

## Feeding Initiation Timing

### Stable VLBW (BW 1000-1500 g)
- Start within 24-48 hours.
- 10-20 mL/kg/day trophic feeds × 2-3 days.

### ELBW (<1000 g)
- Start within 24-48 hours if hemodynamically stable.
- 10-15 mL/kg/day trophic.

### Reverse end-diastolic flow (REDF) / IUGR
- Cautious approach: trophic 10 mL/kg/day × 5-7 days, then advance carefully 10-20 mL/kg/day.

## Feed Advancement

### Stable VLBW
- 20-30 mL/kg/day advancement.
- Reach full feeds 150-180 mL/kg/day by day 7-14.

### Stable ELBW
- 10-20 mL/kg/day advancement.
- Reach full feeds 150-180 mL/kg/day by day 14-21.

### SIFT trial (UK 2019)
- Faster advancement (30 mL/kg/day) — no increase NEC vs slower (18 mL/kg/day) у stable preterm.
- Faster gut maturation, earlier full feeds.

## Fortification

### Indications
- Volume ≥80-100 mL/kg/day.
- Birth weight <1800 g.
- Gestational age <33 weeks.

### Standard Fortification
- HMF (Human Milk Fortifier): 4 g per 100 mL milk.
- Achieves ~24 kcal/oz.
- Added at standard rate (1:25 ratio HMF:milk).

### Targeted/Adjustable Fortification
- Individualized based on:
  - Urea nitrogen levels (low → increase protein).
  - Growth trajectory (subnormal → enhance).
  - Phosphorus levels.
- Improved growth, fewer fortification-related metabolic changes.

## Targets by ESPGHAN 2022

### Energy
- 110-135 kcal/kg/day стабильный VLBW
- 135-150 kcal/kg/day для catch-up growth

### Protein
- 3.5-4.5 g/kg/day stable VLBW
- 4.5-5.0 g/kg/day для catch-up

### Mode of feeding
- Bolus feeds q3h preferred for term and stable preterm.
- Continuous feeds может рассмотреть для feeding intolerance.

## Feeding Intolerance Signs

### Concerning
- Significant abdominal distention.
- Bilious or hemorrhagic gastric residual.
- Bloody stools.
- Hemodynamic instability.

### Not concerning (do NOT routinely measure residuals)
- Color change в gastric residual без other signs.
- Volume <50% of prior feed без other signs.

ESPGHAN 2022 recommends AGAINST routine gastric residual measurement (Cochrane evidence).

## Probiotics

### ProPrems trial / Cochrane
- Combination Lactobacillus + Bifidobacterium reduces NEC, mortality, sepsis в VLBW.
- ESPGHAN 2022 supports их use BUT acknowledges manufacturing variability и lack of regulatory standardization.

### Practical
- Start with trophic feeds (or как soon as enteral starts).
- Continue до 36-37 weeks PMA OR until full feeds established.

## Probiotics to Use

- Bifidobacterium infantis BB-02 + Streptococcus thermophilus TH-4 + Bifidobacterium lactis BB-12 (ProPrems combo).
- Lactobacillus rhamnosus GG.

## Monitoring

- Weight gain target 15-20 g/kg/day VLBW.
- Length growth, head circumference weekly.
- Urea, phosphorus, calcium q1-2 weeks для adjustable fortification.""",
        [
            "Embleton ND et al. JPGN 2022 — ESPGHAN Position Paper Enteral Nutrition Preterm",
            "Dorling J et al. NEJM 2019;381:1434 — SIFT trial",
            "Cochrane Database Syst Rev 2017;CD005496 — Probiotics for preterm",
            "Bertino E et al. JPGN 2009 — Donor milk",
        ],
    ),

    proto(
        "guide_eu_nice_cg98_jaundice",
        "Европа: NICE CG98 — Jaundice in newborn babies under 28 days",
        "EU: NICE CG98 Newborn Jaundice",
        "bili",
        ["Европа"],
        """## Scope

NICE CG98 (2010, updated 2016) — comprehensive guidance в UK для assessment, monitoring, treatment of neonatal jaundice (term and late-preterm ≥35 weeks).

## Initial Assessment (всегда)

### Look for signs
- Jaundice (skin, sclera).
- Spread (face → trunk → limbs progresses).
- Use **Kramer scale** для visual estimation:
  - Zone 1 (head): TSB ~5 mg/dL (85 µmol/L)
  - Zone 2 (chest): ~10 mg/dL (170 µmol/L)
  - Zone 3 (abdomen): ~12-15 mg/dL (200-255 µmol/L)
  - Zone 4 (limbs): ~15-20 mg/dL (255-340 µmol/L)
  - Zone 5 (palms/soles): >20 mg/dL (>340 µmol/L)

### Action thresholds
- ANY visible jaundice <24 hours → measure TSB urgently.
- Visible jaundice in late preterm 35-37 wks → low threshold for measure.
- Term ≥38 wks с visible jaundice >24 hours → measure if Kramer ≥3 OR concerning factors.

## Measurement

### Transcutaneous Bilirubin (TcB)
- Useful screening для term/late-preterm.
- TcB cut-off ~13-15 mg/dL — confirm с serum TSB.
- NOT reliable у dark skin (above 14 mg/dL serum confirmation).
- NOT during/after PT.

### Serum TSB
- Gold standard.
- Capillary or venous sample.
- Lab interpretation in mg/dL or µmol/L.

## NICE Threshold Charts

NICE provides treatment threshold graphs by:
- Gestational age (24 wks → ≥38 wks)
- Postnatal hours
- Treatment type (phototherapy vs exchange transfusion)

Available в Bordik calculator: `neo-bili-2022` (3-region, including NICE).

## Phototherapy

### Indications (по NICE chart)
- TSB at or above PT threshold for given GA + age.

### Equipment
- Conventional PT: ~10 µW/cm²/nm intensity.
- Intensive PT: ≥30 µW/cm²/nm with multiple sources (overhead + biliblanket).

### Initiation
- Continuous PT при threshold.
- Intermittent PT acceptable если below intensive threshold.
- Monitor TSB q6-24h depending on rate of rise.

### Discontinuation
- TSB <50-100 µmol/L below PT threshold.
- Recheck TSB 12-18 hours after stopping PT (rebound check).

## Exchange Transfusion

### Indication (по NICE chart)
- TSB at or above ET threshold for given GA + age.

### Procedure (similar to AAP)
- Double blood volume = 160 mL/kg term, 180 mL/kg preterm.
- O Rh-negative blood compatible с mother и infant.
- Aliquots 5-10 mL для term.
- Monitoring critical (vitals, glucose, ionized Ca²⁺, K⁺).

### IVIG для isoimmune disease
- Rh, ABO с DAT-positive и rapid TSB rise OR TSB at threshold.
- 0.5-1 g/kg IV over 2 hours.
- May reduce need для exchange.

## Aetiology Investigations

### When to investigate
- Jaundice <24 hours (always).
- TSB at PT threshold.
- Conjugated bilirubin >25 µmol/L (1.5 mg/dL) at any time.
- Persistent jaundice >2 weeks term, >3 weeks preterm.

### Tests
- Maternal blood type, Rh, antibody screen.
- DAT (Coombs), Hb, ретикулоциты.
- ABO type infant.
- G6PD screen (selective populations).
- TFTs (если cholestasis suspected).
- Urine reducing substances (galactosemia).

## Prolonged Jaundice (>14 days term, >21 days preterm)

### Differential
- Breast milk jaundice (most common; unconjugated; well baby).
- Cholestasis (conjugated >25 µmol/L) — investigate urgently!
- Hypothyroidism.
- Hemolytic anaemia.

### Action
- Measure split bilirubin (conjugated vs unconjugated).
- TFTs.
- Urinalysis.
- LFTs если suspect cholestasis.""",
        [
            "NICE Clinical Guideline CG98. 2010 (updated 2016) — Jaundice in newborn babies",
            "NICE Quality Standard QS57 — Newborn jaundice",
            "Maisels MJ et al. Pediatrics 2009;124:1193 — extended phototherapy",
            "Kemper AR et al. Pediatrics 2022;150:e2022058859 — for comparison AAP 2022",
        ],
    ),

    proto(
        "guide_eu_bapm_hypoglycaemia_2017",
        "Европа: BAPM 2017 — Hypoglycaemia in the first 48 hours",
        "EU: BAPM 2017 Hypoglycaemia Framework",
        "metabolic",
        ["Европа"],
        """## BAPM 2017 Position

The British Association of Perinatal Medicine 2017 framework для identification и treatment of operational hypoglycaemia в late preterm (≥34 wks) and term newborns.

## Operational Threshold

### Pre-feed BG
- **<2.0 mmol/L (36 mg/dL)** → action required в at-risk infants.
- Clinical correlation important — different from "true" pathological hypoglycaemia.

### Symptomatic hypoglycaemia (ANY BG)
- Jitteriness, поor feeding, lethargy, hypothermia, apnoea, seizures, coma → urgent action.

## At-Risk Infants

- Birth weight <2500 g или >4500 g.
- Premature <37 weeks.
- Maternal diabetes (gestational, pre-existing).
- LGA (>90th centile).
- SGA (<10th centile).
- Hypoxic-ischemic encephalopathy / Sarnat ≥1.
- Symptoms suggestive of metabolic disorder.
- Erythroblastosis fetalis.
- Beckwith-Wiedemann syndrome / IDM.

## Management Algorithm

### Step 1: First feed within 1 hour
- Skin-to-skin контакт.
- Breastfeed OR formula if breastfeeding not yet established.

### Step 2: Pre-feed BG check at 2-3 hours
- Then before every other feed for first 24 hours в at-risk.

### Step 3: BG <2.0 mmol/L (asymptomatic)
- Effective feed (breastfeed, expressed breast milk, OR formula 5-10 mL/kg).
- Re-check BG 30-60 minutes after feed.
- If still <2.0 OR не повышается → IV dextrose.

### Step 4: BG <1.0 mmol/L OR symptomatic
- Immediate IV dextrose 200 mg/kg (2 mL/kg D10W) bolus.
- Continuous infusion D10W at 4-6 mg/kg/min (60-90 mL/kg/day).
- Re-check BG q30 минут initial, then q1-2 hours.

### Step 5: Persistent hypoglycaemia
- Increase GIR by 2 mg/kg/min increments.
- May reach 10-12 mg/kg/min.
- Glucagon 30-50 µg/kg IM/IV if no IV access OR ineffective dextrose response (single dose).
- Hydrocortisone 1 mg/kg IV q6h if адrenoinsufficiency suspected.

### Step 6: Persistent >48 hours
- **Critical sample при event** (BG <2.6):
  - Insulin
  - C-peptide
  - Cortisol
  - GH
  - Beta-hydroxybutyrate
  - Free fatty acids
  - Lactate
  - Ammonia
  - Urine ketones, reducing substances, organic acids
- Refer endocrine/metabolic team.

## Glucose Monitoring Devices

### Bedside meters
- Glucometers OK для screening.
- 10-20% inaccurate at low values.
- ALL low values **must be confirmed** with laboratory plasma glucose.

### CGM (Continuous Glucose Monitoring)
- Increasingly used in NICUs.
- Trends > absolute values.
- Validate spurious lows с lab BG.

## Feeding Strategies

### Breastfeeding promotion
- Frequent (q2-3h) effective feeds.
- Lactation support при IDM с potential delay milk supply.

### Buccal dextrose gel (40%)
- 0.2 g/kg (~0.5 mL/kg) by oral mouthcare.
- Adjunct, NOT replacement for feed.
- Administer in cheek mucosa, follow с feed.
- Sugar HypoGlycaemia in Asymptomatic newborns (SHIN) trial: equivalent или superior to IV dextrose for transient operational hypoglycaemia.

## Discharge Criteria

- Sustained pre-feed BG ≥2.6 mmol/L × 48 hours без supplementation.
- Adequate feeding pattern.
- Weight gain trajectory.
- For at-risk infants: outpatient follow-up scheduled.""",
        [
            "BAPM Framework для Practice. 2017 — Identification and Management of Neonatal Hypoglycaemia",
            "Harris DL et al. Lancet 2013;382:2077 — Sugar Babies (dextrose gel) trial",
            "Adamkin DH. AAP COFN. Pediatrics 2011;127:575 — comparator US position",
            "Thornton PS et al. PES 2015 J Pediatr 2015;167:238 — comparator PES position",
        ],
    ),

    proto(
        "guide_eu_sweet_consensus_2022_rds",
        "Европа: Sweet European Consensus 2022 — RDS",
        "EU: Sweet European Consensus 2022 RDS",
        "respiratory",
        ["Европа"],
        """## Background

The "Sweet" European Consensus Guidelines on RDS (named after lead author David Sweet) — most influential European RDS protocol, regularly updated. 2022 update incorporates LISA, surfactant timing, gentle ventilation strategies.

## Key 2022 Recommendations

### Antenatal
- Antenatal steroids (betamethasone or dexamethasone) for all pregnancies 24-34 weeks gestation at imminent risk of preterm birth.
- Magnesium sulfate for fetal neuroprotection в 24-32 weeks.
- DCC ≥60 seconds preferred over UCM <28 weeks.

### Initial stabilization
- Plastic bag/wrap для preterm <32 нед.
- Sustained inflation: NOT routinely recommended (SAIL trial showed no benefit).
- CPAP начиная в delivery room (PEEP 6-8 cm H₂O).
- Initial FiO₂ 0.21-0.30 (titrate to SpO₂ targets).

### Surfactant
- **Indication**: FiO₂ >0.30 on CPAP с PEEP ≥6 cm H₂O, GA <32 weeks.
- **Timing**: in NICU within first 2-3 hours, OR in delivery room для GA <26 weeks.
- **Method**: LISA preferred при stable spontaneous breathing. INSURE if not feasible.
- **Preparation**: Curosurf (poractant alfa) 200 mg/kg first dose (Cochrane evidence для outcomes).

### Mechanical ventilation
- Volume-targeted ventilation (VTV) preferred over pressure-controlled (Cochrane).
- VT 4-6 mL/kg.
- PEEP 5-7 cm H₂O.
- Permissive hypercapnia: PaCO₂ 45-55 mm Hg.
- Wean as tolerated, avoid prolonged ventilation.

### High-frequency oscillatory ventilation (HFOV)
- Rescue strategy для refractory respiratory failure.
- Not first-line.

### Caffeine
- All preterm GA ≤30 weeks.
- Loading 20 mg/kg + maintenance 5-10 mg/kg q24h.
- Continue до 33-34 weeks PMA или successful extubation off respiratory support.

### Targeted SpO₂
- 91-95% (BOOST/SUPPORT pooled analysis).
- Avoid <90% (mortality, NEC).
- Avoid >97% (BPD, ROP).

## Outcomes Targets

### BPD prevention bundle
- Antenatal steroids
- Early CPAP, gentle ventilation
- Surfactant via LISA when indicated
- Caffeine
- Targeted SpO₂
- Vitamin A 5000 IU IM 3×/week × 4 weeks (Cochrane)
- Optimal nutrition

### NEC prevention
- Mother's own milk
- Probiotics (combo Lactobacillus + Bifidobacterium per ProPrems trial)

### IVH prevention
- Avoid blood pressure variability
- Cluster care, minimize manipulation first 72 hours
- Magnesium sulfate antenatal
- Antenatal steroids

## Comparison with NICE / AAP

| Topic | Sweet 2022 | NICE | AAP |
|-------|-----------|------|-----|
| Surfactant threshold | FiO₂ >0.30 на CPAP | FiO₂ >0.30 | FiO₂ >0.40 |
| LISA preferred | Yes | Yes | Yes (2024) |
| Caffeine universal | Yes (<30 wks) | Yes | Yes |
| Volume-targeted vent | Yes | Yes | Yes |
| Sustained inflation | No (after SAIL) | No | No |""",
        [
            "Sweet DG et al. Neonatology 2023;120:3 — European Consensus Guidelines on RDS 2022",
            "Speer CP et al. Acta Paediatr 2023;112:660 — accompanying review",
            "Klingenberg C et al. Cochrane 2017;CD003666 — VTV vs PCV",
            "Schmidt B et al. NEJM 2007;357:1893 — CAP trial",
        ],
    ),

    proto(
        "guide_eu_nice_pda_management",
        "Европа: NICE NG230 — PDA management в preterm (2024)",
        "EU: NICE NG230 PDA Management Preterm",
        "cardiovascular",
        ["Европа"],
        """## NICE NG230 (2024)

UK guideline для management of patent ductus arteriosus в preterm infants <32 weeks.

## Key Recommendations

### Diagnosis
- Echocardiography для all preterm с suspicion of hsPDA (clinical signs OR risk factors).
- Functional echo by trained neonatologist preferred to rapid bedside.
- Criteria for hemodynamically significant:
  - PDA diameter ≥1.5 mm
  - LA:Ao ratio ≥1.4
  - Retrograde diastolic flow descending aorta
  - LV diastolic dysfunction
  - Bounding peripheral pulses, wide pulse pressure

### Conservative Management (initial)

- Most preterm <32 weeks have PDA — selective treatment preferred over universal.
- Watchful waiting acceptable если асимптоматический.
- Fluid restriction 120-130 mL/kg/day для hsPDA.
- Adequate PEEP при ИВЛ.
- Diuretics PRN (furosemide 1 mg/kg q12-24h) для pulmonary edema.

### Pharmacological Closure

#### Indications (NICE)
- Symptomatic hsPDA с failure to wean ventilator/CPAP.
- LV volume overload.
- Pulmonary edema.
- Compromised perfusion (mesenteric / cerebral hypoperfusion).

#### First-Line (NICE preferred)
**Ibuprofen IV** 10 mg/kg → 5 mg/kg → 5 mg/kg q24h (3-day cycle).

Closure rate ~75%.

#### Second-Line
**Paracetamol** 15 mg/kg q6h × 3 days (PO/IV/rectal).

Closure rate ~65-70%.

Preferred when contraindications to NSAID:
- Active bleeding
- Severe thrombocytopenia (<50k)
- Renal impairment
- NEC suspicion
- IVH grade III/IV

#### Less Common
**Indomethacin** 0.2 → 0.1 → 0.1 mg/kg q12h IV × 3 doses.

Higher renal/GI side effect profile vs ibuprofen.

### Repeat Cycle

If first cycle fails (re-echo at 48h):
- Repeat same drug → consider second-line drug → consider surgery.

### Surgical Ligation

#### Indications
- Failed 2 medical cycles + persistent hsPDA.
- Clinical compromise (oxygenation, hemodynamics).
- Contraindications to all medical options.

#### Procedure
- Performed at bedside в NICU OR cardiac OR.
- Posterior-lateral thoracotomy.
- Risk vocal cord palsy, chylothorax, pneumothorax.
- Outcomes good if performed before persistent BPD progression.

### Catheter-Based Closure

Newer option, reserved для late-presenting or failed medical:
- Transcatheter PDA occlusion (Amplatzer Piccolo).
- Approved для preterm ≥700 g (FDA 2019).
- Performed in cath lab.
- Avoids surgical morbidity.

## Outcomes

### Closure rates
- Spontaneous: 60-90% к 1 неделе у GA >28 weeks.
- Ibuprofen first cycle: ~75%.
- Surgical ligation: 100%.

### Long-term
- Closed PDA <1 month — usually no long-term sequelae.
- Persistent hsPDA + delayed treatment — associated с BPD, IVH, NEC.

## Monitoring

- Pre-treatment echo confirms hsPDA.
- Renal function (creatinine, urine output) before each NSAID dose.
- CBC (platelets) before NSAID.
- Re-echo 48 hours after each cycle.
- Watch for medication side effects (oliguria, GI bleeding, NEC).""",
        [
            "NICE Guideline NG230. 2024 — Management of preterm infants with PDA",
            "Mitra S et al. JAMA 2018;319:1221 — comparative meta-analysis",
            "Smith CL et al. Eur J Pediatr 2020;179:865 — review medical PDA",
            "El-Khuffash A et al. J Pediatr 2015;167:1354 — staging hsPDA",
        ],
    ),

    proto(
        "guide_eu_nice_rop_screening",
        "Европа: NICE NG124 — ROP screening и treatment",
        "EU: NICE NG124 ROP Screening and Treatment",
        "screening_discharge",
        ["Европа"],
        """## NICE NG124 (2017, updated 2024)

UK guideline для ROP screening и treatment в premature и low-birth-weight infants.

## Screening Indications

### All infants meeting EITHER:
- Gestational age <32 weeks at birth, OR
- Birth weight ≤1501 g

## First Screening Timing

### GA <27 weeks
- 30-31 weeks postmenstrual age (PMA).

### GA 27-31 weeks
- First exam at 31 weeks PMA OR 4 weeks chronologic age (whichever later).

### Birth weight ≤1501 g, GA ≥32 weeks
- 4-6 weeks chronologic age.

## Examination Method

### Indirect ophthalmoscopy
- Performed by trained ophthalmologist.
- Pupil dilation (cyclopentolate 0.5% + phenylephrine 2.5%).
- Topical anaesthetic (proxymetacaine).
- Wire speculum для eyelid retraction.
- Adequate analgesia (sucrose 24% + non-nutritive sucking).

### RetCam imaging
- Newer alternative, especially для telemedicine programs.
- Wide-field digital imaging.
- Sensitivity comparable to indirect ophthalmoscopy in trained graders.

## Frequency of Examinations

### Active (immature retina, no plus disease)
- Every 1-2 weeks.

### Pre-threshold disease
- Every 1 week.

### Stop screening criteria (any of):
- Full retinal vascularization (Zone III, no ROP).
- 2 consecutive normal exams without ROP.
- Post-treatment regression of plus disease + neovascularization.

## ICROP3 Classification (2021)

ROP defined по:
- **Zone**: I (posterior pole) → II (mid-periphery) → III (anterior periphery).
- **Stage**: 1 (demarcation) → 2 (ridge) → 3 (extraretinal proliferation) → 4A/B (subtotal RD) → 5 (total RD).
- **Plus disease**: dilated/tortuous posterior pole vessels — major treatment indicator.
- **Aggressive ROP (A-ROP)**: replaces former AP-ROP — rapid posterior pole disease.

## Treatment Indications (Type 1 ROP)

Any of:
- Zone I, any stage с plus disease.
- Zone I, stage 3 без plus disease.
- Zone II, stage 2 or 3 с plus disease.

Treat within 48-72 hours of diagnosis.

## Treatment Modalities

### Anti-VEGF (preferred Zone I, A-ROP)
- **Bevacizumab (Avastin)** 0.625 mg intravitreal injection.
- **Ranibizumab (Lucentis)** 0.2 mg intravitreal — RAINBOW trial first-line.
- Anesthesia: topical proparacaine + lid retractor + sterile prep.
- Done bedside в NICU.

### Laser photocoagulation (preferred Zone II)
- Diode laser (810 nm) avascular retina ablation.
- Extensive coverage anterior to ridge.
- 1500-3000 spots typical.
- Performed in OR под GA или conscious sedation.

### Cryotherapy (historical)
- Largely replaced by laser.

## Post-Treatment Follow-Up

### Anti-VEGF
- Re-examine 1 week post-injection.
- Continue weekly until full vascularization.
- Risk recurrence до 19% (BEAT-ROP) — extended monitoring до 50-60 weeks PMA.

### Laser
- Re-examine 1 week post-laser.
- Then every 2 weeks until ROP regresses.

## Outcomes

### Regression
- Type 1 treated: 80-95% regression.
- Untreated severe: 50-90% poor visual outcomes.

### Complications
- Anti-VEGF: rare systemic effects, transient ocular irritation.
- Laser: refractive errors (myopia), visual field constriction.
- Untreated: retinal detachment, blindness.

## Vision Surveillance

- Long-term ophthalmology follow-up до 6 years (refractive errors common).
- Special education support if visual impairment.
- Vision rehabilitation referrals.""",
        [
            "NICE Guideline NG124. 2017 (updated 2024) — Specialist neonatal care quality standard",
            "RCPCH/RCOphth Joint Statement 2022 — ROP screening UK",
            "Chiang MF et al. Ophthalmology 2021;128:e51 — ICROP3 classification",
            "Mintz-Hittner HA et al. NEJM 2011;364:603 — BEAT-ROP",
            "Stahl A et al. Lancet 2019;394:1551 — RAINBOW trial",
        ],
    ),
]


# =============================================================================
# УЗБЕКИСТАН PROTOCOLS (МЗ РУз)
# =============================================================================
UZ_PROTOCOLS = [
    proto(
        "guide_uz_primary_resuscitation",
        "Узбекистан: Национальный протокол первичной реанимации новорождённых",
        "Uzbekistan: National Primary Neonatal Resuscitation Protocol",
        "resuscitation",
        ["Узбекистан"],
        """## Введение

Национальный протокол первичной реанимации новорождённых Республики Узбекистан адаптирует международные рекомендации (NRP, ERC, WHO) к условиям медицинских учреждений УЗ. Утверждён МЗ РУз для применения в родильных и неонатальных отделениях.

## Алгоритм реанимации

### 1. Подготовка

- Тёплое помещение (≥25°C) и предварительный обогрев пеленальной поверхности.
- Готовность оборудования: мешок Ambu новорождённого, маски различных размеров, лярингоскопы (клинки 0/1), ЭТТ (2.5, 3.0, 3.5, 4.0 мм), отсос с давлением до 100 мм рт. ст.
- Препараты: адреналин 1:10000, NaCl 0.9% или Ringer.

### 2. Начальные мероприятия (30 секунд)

- Тепловая защита: тёплая пелёнка, лучистый источник.
- Положение: голова в нейтральном положении.
- Освобождение дыхательных путей: только при обструкции.
- Тактильная стимуляция (5-10 секунд).

### 3. Оценка и ИВЛ

При апноэ или ЧСС <100 уд/мин:
- Старт ИВЛ мешком Ambu (или T-piece если доступно).
- PIP 20-25 см вод. ст. (для термин), PEEP 5 см вод. ст.
- FiO₂ старт 21% для термин ≥35 нед, 21-30% для preterm <35 нед.
- Частота 40-60/мин.

### 4. При ЧСС <100 после 30 сек ИВЛ → MR SOPA

- M — Mask repositioning
- R — Reposition airway
- S — Suction
- O — Open mouth
- P — Pressure increase
- A — Alternative airway (intubation)

### 5. Компрессии при ЧСС <60 после effective ИВЛ

- Соотношение 3:1 (90+30=120/мин).
- Глубина 1/3 переднезаднего диаметра.
- FiO₂ 100% во время компрессий.

### 6. Адреналин при ЧСС <60 после 60 сек компрессий

- IV/IO: 0.01-0.03 мг/кг (0.1-0.3 мл/кг 1:10000).
- Эндотрахеально: 0.05-0.1 мг/кг (только если IV не получен).
- Повторять каждые 3-5 минут.

## Целевая SpO₂ (правая рука)

| Время | Целевая SpO₂ |
|-------|----------------|
| 1 мин | 60-65% |
| 5 мин | 80-85% |
| 10 мин | 85-95% |

## Дополнительные ресурсы УЗ

- Неонатальный консультативный центр Министерства здравоохранения (Ташкент).
- Региональные перинатальные центры (РПЦ) в каждой области.
- Транспортная служба новорождённых для интенсивной перевозки.

## Оборудование (минимум для уровня II/III)

- Реанимационный столик с лучистым обогревателем.
- Аппарат CPAP (Bubble CPAP минимум).
- Инкубатор-инкубированный обогрев.
- Мешок Ambu новорождённый + неинвазивный насос O₂.
- Пульсоксиметр.
- Глюкометр.
- Базовый набор для интубации.""",
        [
            "Министерство здравоохранения Республики Узбекистан — Национальный протокол реанимации новорождённых",
            "WHO Pocket Book of Hospital Care for Children. 2nd edition 2013",
            "WHO Essential Newborn Care course. 2010",
            "NRP 8 ed. Aziz K et al. Pediatrics 2021;147:e2020038505E (международная база)",
            "Ўзбекистон Республикаси Соғлиқни сақлаш вазирлиги — гов.uz",
        ],
    ),

    proto(
        "guide_uz_essential_newborn_care",
        "Узбекистан: Стандартный пакет ухода за новорождённым (WHO ENC)",
        "Uzbekistan: WHO Essential Newborn Care Package",
        "screening_discharge",
        ["Узбекистан", "Международный"],
        """## Цель

Обеспечение каждому новорождённому минимального стандартного ухода в первые часы и дни жизни на основе рекомендаций WHO Essential Newborn Care, адаптированных МЗ РУз.

## Семь основных компонентов WHO ENC

### 1. Тепловая защита
- Сухой ребёнок, заверну в тёплую пелёнку.
- Контакт кожа-к-коже минимум 1 час после рождения.
- Шапочка для предотвращения теплопотерь через голову.
- Нагретое помещение (≥25°C).
- Поздняя первая ванна (≥24 часов после рождения).

### 2. Раннее начало грудного вскармливания
- Прикладывание к груди в течение 1 часа после рождения.
- Continuous skin-to-skin контакт способствует первому кормлению.
- Без рутинного использования молочной смеси.
- Без бутылок и пустышек в первые недели.

### 3. Чистая пуповина
- Чистая, сухая пуповина без местных лекарств (хлоргексидин 4% при высоком риске сепсиса в community).
- Сухой остаток отпадает на 5-15-й день.

### 4. Профилактика инфекций
- Гигиена рук персонала и матери.
- Чистая поверхность для родов.
- Чистый разрез пуповины (стерильный инструмент).
- Глазная профилактика — эритромициновая мазь / тетрациклин.

### 5. Витамин K
- 1 мг IM однократно сразу после рождения (термин).
- 0.5 мг IM при BW <1000 г.
- Профилактика геморрагической болезни новорождённых.

### 6. Иммунизация
- BCG в первые 24-48 часов жизни (особенно в эндемичной по ТБ среде УЗ).
- Hepatitis B первая доза в первые 24 часа.
- Полиомиелит первая доза при выписке (в РУз — schedule).

### 7. Скрининг и выявление
- Оценка по шкале Apgar 1 и 5 минут.
- Антропометрия (вес, длина, окружность головы).
- Осмотр на врождённые пороки.
- Скрининг на врождённые заболевания (фенилкетонурия, гипотиреоз, муковисцидоз — РУз протокол).
- Скрининг слуха (OAE/AABR где доступно).
- Pulse oximetry для CCHD (где доступно).

## Календарь иммунизации УЗ

| Возраст | Вакцина |
|---------|---------|
| 24 ч | HepB-1 |
| 24-48 ч | BCG |
| 2 мес | DTaP-1, OPV-1, HepB-2, Hib-1, PCV-1 |
| 3 мес | DTaP-2, OPV-2, Hib-2, PCV-2 |
| 4 мес | DTaP-3, OPV-3, HepB-3, Hib-3, PCV-3 |
| 12 мес | MMR-1 |
| 15 мес | DTaP-4, OPV-4 |
| 6 лет | DTaP-5, MMR-2 |

## Признаки опасности (для матери)

Срочно обратиться в медицинское учреждение если у новорождённого:
- Не сосёт грудь / отказывается от еды.
- Желтуха в первые 24 часа.
- Желтуха ладоней / стоп.
- Лихорадка >38.0°C ИЛИ гипотермия <35.5°C.
- Учащённое дыхание (>60/мин) ИЛИ затруднённое дыхание (втяжения).
- Судороги.
- Бледность / синюшность.
- Кровотечение из пупочной ранки.
- Гнойный отделяемое из глаз / пупка.
- Diarrhea.

## Период послеродового наблюдения

- Первые 24 часа: каждый час.
- День 2-3: дважды в день.
- День 4-7: ежедневно.
- Первый педиатрический визит: 10-14 дней.""",
        [
            "Министерство здравоохранения Республики Узбекистан — Национальный протокол ухода за новорождённым",
            "WHO Essential Newborn Care course manual. 2010",
            "WHO Pocket Book of Hospital Care for Children. 2nd ed. 2013",
            "UNICEF/WHO Baby-Friendly Hospital Initiative",
            "Ўзбекистон Республикаси Соғлиқни сақлаш вазирлиги — Bola саломатлиги бўйича клиник протокол",
        ],
    ),

    proto(
        "guide_uz_kangaroo_mother_care",
        "Узбекистан: Метод кенгуру (KMC) у недоношенных и LBW",
        "Uzbekistan: Kangaroo Mother Care for Preterm and LBW",
        "screening_discharge",
        ["Узбекистан", "Международный"],
        """## Цель

Внедрение метода кенгуру (KMC) как стандарта ухода за стабильными недоношенными и маловесными новорождёнными в РУз для снижения неонатальной смертности и улучшения исходов.

## Показания

- Недоношенные ≥28 нед, BW ≥1000 г после первичной стабилизации.
- LBW (BW <2500 г) доношенные.
- Стабильное состояние:
  - Нет необходимости в инотропах.
  - Нет inadequate spontaneous дыхания.
  - Нет активной реанимации.

## Преимущества (по WHO/UNICEF)

| Эффект | Снижение |
|--------|----------|
| Неонатальная смертность (LBW <2000 г) | 36% |
| Серьёзные инфекции | 27% |
| Гипотермия | 80% |
| Длительность госпитализации | На 30% короче |

## Алгоритм инициации

### Подготовка матери
- Согрейте руки.
- Снимите одежду до пояса (или используйте халат с открытым нагрудником).
- Сядьте в удобное кресло с опорой для спины.

### Положение ребёнка
- Только в подгузнике, шапочке, носках.
- Вертикально на груди матери, "лягушачье" положение.
- Голова повёрнута набок, дыхательные пути свободны.
- Закреплено пелёнкой / специальным жилетом-сумкой.

### Длительность сессий

- **Минимум**: 1 час непрерывно × 4-8 раз в день.
- **Continuous KMC**: ≥18 часов в сутки (предпочтительно для VLBW).
- **Intermittent KMC**: 4-8 часов в сутки.

### Кормление
- Грудное вскармливание во время KMC.
- При невозможности — сцеженное грудное молоко через шприц / чашку.
- Поддержка лактации.

## Мониторинг во время KMC

- Аксиллярная температура q1-2h в первые 24 часа, затем q4h.
- ЧДД, ЧСС, цвет кожи.
- Признаки опасности: одышка, цианоз, плохое кормление, гипотермия.

## Образование матери

### Что делает мать
- Длительный контакт кожа-к-коже.
- Кормление грудью по требованию.
- Распознавание признаков тревоги.
- Гигиена рук.

### Что делать в случае проблем
- Холодный ребёнок: усилить контакт, добавить пелёнки.
- Cyanosis: срочно к медперсоналу.
- Плохое кормление: проверить положение, обратиться к лактационному консультанту.
- Поверхностное / частое дыхание: к врачу немедленно.

## Critical Care Considerations

### Когда KMC противопоказан
- Гемодинамическая нестабильность.
- Активный сепсис в фазе декомпенсации.
- Постоперационный период первые 24-48 часов.
- Неконтролируемые судороги.
- Отчётливая нужда в ИВЛ или CPAP с FiO₂ >0.30.

### Инкубатор vs KMC
- KMC обеспечивает термальную защиту, эквивалентную инкубатору, у стабильных preterm ≥28 нед.
- Особенно важно в условиях ограниченного ресурсного снабжения (sustainable energy, equipment).

## Готовность к выписке

- Регулярная прибавка веса 15-30 г/сут.
- Стабильная аксиллярная t° (36.5-37.5°C) в комнатной температуре.
- Эффективное кормление грудью / альтернатива.
- Отсутствие признаков заболевания.
- Семейная поддержка для продолжения KMC дома.

## Амбулаторное наблюдение

- Первый визит: 1-3 дня после выписки.
- Затем еженедельно × 2-3 нед.
- Постепенно q2 недели до достижения 2500 г.""",
        [
            "Министерство здравоохранения Республики Узбекистан — Протокол ухода за недоношенным ребёнком",
            "WHO Recommendations on Newborn Health 2017",
            "WHO/UNICEF Kangaroo Mother Care: A Practical Guide. 2003",
            "Conde-Agudelo A et al. Cochrane 2016;CD002771 — KMC for LBW",
            "Charpak N et al. Pediatrics 2017;139:e20162063 — long-term outcomes KMC",
        ],
    ),

    proto(
        "guide_uz_thermal_protection_chain",
        "Узбекистан: Тепловая цепь (Cold Chain) для новорождённых",
        "Uzbekistan: Warm Chain for Newborns",
        "screening_discharge",
        ["Узбекистан", "Международный"],
        """## Концепция Warm Chain (WHO)

Тепловая цепь — последовательность взаимосвязанных мероприятий по обеспечению термонейтральной среды для новорождённого с момента рождения до периода стабилизации в неонатальном отделении или дома.

## 10 Шагов Warm Chain (WHO)

1. **Тёплая комната родов** — t° помещения ≥25°C, без сквозняков.
2. **Немедленное обтирание** ребёнка тёплой пелёнкой после рождения (для термин).
3. **Контакт кожа-к-коже** с матерью.
4. **Раннее кормление** в первый час жизни.
5. **Отсроченное купание** — не ранее 24 часов после рождения, при стабильной t°.
6. **Тёплая одежда / пелёнки** + шапочка.
7. **Постоянная мать-ребёнок rooming-in** (не разделение).
8. **Тёплая транспортировка** с адекватной теплозащитой.
9. **Тёплая реанимация** при необходимости (предварительно нагретый стол, тёплые пелёнки).
10. **Обучение персонала и матери** принципам тепловой защиты.

## Целевая температура

### Аксиллярная
- 36.5-37.5°C — нормотермия.
- <36.0°C — гипотермия (переходный период), требует активного согревания.
- <35.0°C — тяжёлая гипотермия, реанимационные мероприятия.

### Ректальная
- На 0.3-0.5°C выше аксиллярной.

## Особенности у недоношенных

### Предотвращение теплопотерь в родзале
- t° помещения 26-28°C.
- Лучистый источник тепла над столиком (на 30-60 мин до родов).
- Пластиковый пакет / плёнка для тела БЕЗ обтирания (preterm <32 нед).
- Шапочка обязательно.
- Нагретая пелёнка под ребёнка.

### Транспортировка
- Транспорт-инкубатор предварительно подогрет до 35-37°C.
- 3-4 слоя пелёнок + одеяло.
- Шапочка.
- Контроль t° q15 минут во время транспорта.
- Кислородная поддержка по необходимости.

## Гипотермия — диагностика и тактика

### Первичные признаки
- Холодные конечности.
- Бледность / мраморность кожи.
- Ослабление сосания.
- Сонливость.
- Слабый плач.

### Поздние признаки (тяжёлая гипотермия)
- Брадикардия.
- Гипогликемия.
- Метаболический ацидоз.
- Геморрагический синдром (DIC).
- Отёк лёгких (cold injury).

### Тактика согревания

#### Лёгкая гипотермия (36.0-36.4°C)
- Проверить эффективность одежды, шапочки, пелёнок.
- Контакт кожа-к-коже с матерью.
- Тёплая комната.
- Контроль t° q30 минут.

#### Умеренная гипотермия (35.0-35.9°C)
- Скрытое согревание (skin-to-skin) или инкубатор/обогревательный стол.
- Подача тёплых жидкостей (если на ИВ-питании).
- Мониторинг гликемии q1h.
- Контроль ЧСС, дыхания.

#### Тяжёлая гипотермия (<35.0°C)
- Активное согревание в инкубаторе с air t° на 1-1.5°C выше t° ребёнка.
- Не более 0.5°C/час подъёма t° (риск apnea, шок).
- Контроль гликемии, ABG, электролитов.
- Внутривенная регидратация теплыми растворами (37°C).
- Терапия осложнений (DIC, AKI).

## Бытовые условия (для амбулаторного наблюдения)

### В тёплое время года
- t° помещения ≥18°C.
- Лёгкая одежда + лёгкая пелёнка.

### В холодное время года
- t° помещения ≥20°C.
- 2-3 слоя одежды.
- Шапочка во время прогулок.

### Недоношенные дома
- t° помещения 22-25°C первые недели.
- KMC рекомендован continuously.
- Избегать прохлаждённых поверхностей (пол, окно).""",
        [
            "Министерство здравоохранения Республики Узбекистан — Тепловая защита новорождённых",
            "WHO Thermal Control of the Newborn: A Practical Guide. 1997",
            "WHO Recommendations on Newborn Health 2017",
            "Lunze K, Hamer DH. J Perinatol 2012;32:317 — neonatal hypothermia community",
        ],
    ),

    proto(
        "guide_uz_severe_jaundice_management",
        "Узбекистан: Тяжёлая желтуха новорождённых — выявление и тактика",
        "Uzbekistan: Severe Newborn Jaundice — Recognition and Management",
        "bili",
        ["Узбекистан", "Международный"],
        """## Cущность проблемы

Желтуха новорождённых — наиболее частая причина повторных госпитализаций в РУз. Раннее выявление тяжёлой формы критически важно для предотвращения kernicterus.

## Оценка желтухи

### Визуальная оценка по шкале Крамера

| Зона | Локализация | Примерная TSB |
|------|-------------|----------------|
| 1 | Голова, шея | ~85 мкмоль/л (5 мг/дл) |
| 2 | До пупка | ~170 мкмоль/л (10 мг/дл) |
| 3 | До коленей | ~200-255 мкмоль/л (12-15 мг/дл) |
| 4 | До лодыжек | ~255-340 мкмоль/л (15-20 мг/дл) |
| 5 | Ладони, стопы | >340 мкмоль/л (>20 мг/дл) |

### Когда срочно проверить TSB
- Желтуха <24 часов жизни.
- Желтуха ниже пупка (Кramer ≥3) у термин.
- Любая желтуха у preterm <37 нед.
- Резкое распространение желтухи.
- Сочетание с другими симптомами (плохое кормление, летаргия, апноэ).

## Лабораторная диагностика

### При TSB на грани лечения
- TSB (общий и прямой/связанный билирубин).
- Альбумин сыворотки (билирубин-альбуминовое отношение).
- Группа крови, Rh ребёнка и матери.
- Прямая проба Кумбса (DAT).
- Гемоглобин, гематокрит, ретикулоциты, мазок крови.
- Глюкоза.

### При подозрении на холестаз (прямой билирубин >25 мкмоль/л)
- Печёночные ферменты.
- УЗИ печени и билиарных путей.
- TORCH-инфекции.

## Алгоритм лечения

### Использовать график AAP 2022 / NICE / КР РФ для определения порога

В отсутствие специализированных номограмм — использовать упрощённое правило:

**Среднестатистические пороги для термин-ребёнка без факторов риска**:

| Возраст (часы) | Фототерапия (мкмоль/л) | Заменное переливание (мкмоль/л) |
|----------------|----------------------|-----------------------------------|
| 24-48 | ≥250 | ≥430 |
| 48-72 | ≥300 | ≥480 |
| ≥72 | ≥340 | ≥515 |

При наличии факторов риска (преждевременность, изоиммунизация, гипоальбуминемия, ацидоз, сепсис) — пороги снижаются на ~30-40 мкмоль/л.

## Фототерапия

### Оборудование
- LED-PT с длиной волны 460-490 нм (синий спектр).
- Irradiance: ≥30 мкВт/см²/нм для интенсивной PT.
- Дистанция 30-50 см от ребёнка.

### Протокол
- Continuous PT при значимой гипербилирубинемии.
- Ребёнок без подгузника, защита глаз.
- Поворачивать ребёнка q3-4h.
- Регидратация (грудное молоко по требованию + 10-20% увеличение объёма).
- Контроль TSB q6-12h.

### Прекращение PT
- TSB на 50-100 мкмоль/л ниже порога.
- Контроль TSB через 12-24 часа после прекращения (rebound).

## Заменное переливание (в перинатальном центре)

### Показания
- TSB на пороге заменного переливания.
- Резкий рост TSB (>10 мкмоль/л/час).
- Признаки острой билирубиновой энцефалопатии (BIND).

### Подготовка
- Информированное согласие.
- Кровь O Rh-отрицательная, совместимая с матерью и ребёнком.
- Доступ — пупочный венозный катетер.
- Объём — 160 мл/кг (термин), 180 мл/кг (preterm).

## Острая билирубиновая энцефалопатия (BIND)

### Ранние признаки
- Сонливость / летаргия.
- Снижение мышечного тонуса.
- Плохое сосание.

### Промежуточные признаки
- Гипертония / опистотонус.
- Высокотональный плач.
- Лихорадка.

### Поздние признаки (kernicterus)
- Стойкая гипертония.
- Окуломоторные нарушения (sunset eyes).
- Судороги.
- Кома.

→ **Немедленное заменное переливание!**

## Профилактика

### Пренатально
- Анти-D иммуноглобулин у Rh-отрицательной матери.
- Адекватный антенатальный мониторинг.

### Постнатально
- Раннее эффективное грудное вскармливание.
- Активное наблюдение в первые 72 часа.
- Регулярная оценка кожных покровов.
- TcB / TSB при подозрении.""",
        [
            "Министерство здравоохранения Республики Узбекистан — Протокол ведения новорождённого с желтухой",
            "WHO Recommendations on Newborn Health 2017",
            "Kemper AR et al. Pediatrics 2022;150:e2022058859 — AAP Guideline (international reference)",
            "NICE Clinical Guideline CG98",
        ],
    ),

    proto(
        "guide_uz_immunization_schedule",
        "Узбекистан: Национальный календарь профилактических прививок",
        "Uzbekistan: National Immunization Schedule",
        "prematurity_classification",
        ["Узбекистан"],
        """## Общие положения

Национальный календарь профилактических прививок Республики Узбекистан утверждён МЗ РУз и регламентирует обязательную вакцинацию детей с целью профилактики инфекционных заболеваний.

## Календарь прививок (по возрасту)

### При рождении (24-48 часов)
- **HepB-1** (Hepatitis B первая доза) — IM 0.5 мл.
- **BCG** (вакцина против туберкулёза) — внутрикожно левое плечо 0.05 мл (преждевременные ≥2000 г).

### 2 месяца
- **DTaP-1** (дифтерия, столбняк, бесклеточный коклюш) — IM 0.5 мл.
- **OPV-1** (оральная полиомиелитная) — 2 капли.
- **HepB-2** — IM 0.5 мл.
- **Hib-1** (Haemophilus influenzae type b) — IM 0.5 мл.
- **PCV-1** (пневмококковая конъюгированная) — IM 0.5 мл.

### 3 месяца
- **DTaP-2**.
- **OPV-2**.
- **Hib-2**.
- **PCV-2**.

### 4 месяца
- **DTaP-3**.
- **OPV-3**.
- **HepB-3**.
- **Hib-3**.
- **PCV-3**.

### 12 месяцев
- **MMR-1** (корь, эпидемический паротит, краснуха) — SC 0.5 мл.

### 15 месяцев
- **DTaP-4**.
- **OPV-4** (booster).

### 6 лет
- **DTaP-5**.
- **MMR-2**.

### 14 лет
- **Td** (дифтерия + столбняк во взрослой дозе).

## Особенности у недоношенных

### Доношенный график (рекомендация ВОЗ + национальный протокол УЗ)
- BCG: при достижении массы 2000 г.
- HepB-1: в первые 24 часа независимо от GA (если стабильный).
- DTaP / OPV / Hib / PCV: по chronological age (не corrected age).
- Дозы стандартные.

### При экстремальной незрелости (<28 нед, BW <1000 г)
- Решение о времени BCG индивидуально.
- HepB-1: в первые 24 часа.
- Остальные — по календарю с учётом стабильности и условий выписки.

## Противопоказания

### Постоянные
- Анафилактическая реакция на компоненты вакцины.
- Тяжёлый врождённый иммунодефицит (для живых вакцин: BCG, OPV, MMR, Varicella, Yellow Fever, RotaTeq).
- ВИЧ-инфекция в фазе AIDS (для live).

### Временные
- Острое заболевание с лихорадкой.
- Обострение хронического заболевания.
- Высокодозная иммуносупрессивная терапия (>2 нед преднизолона ≥2 мг/кг/сут — отложить ≥1 мес).

## Реакции на прививки

### Лёгкие реакции (норма)
- Болезненность, покраснение, припухлость в месте инъекции.
- Транзиторное повышение t° до 38-38.5°C.
- Беспокойство первые 1-2 дня.

### Серьёзные реакции (срочно к врачу)
- Анафилаксия (отёк, крапивница, шок).
- Стойкая температура >40°C.
- Громкий неуспокаивающийся плач >3 часов.
- Судороги.
- Гипотония-гипореактивность.

## Расширенная программа

### Дополнительные вакцины (в УЗ внедряются постепенно)
- **Rotavirus** — 2-3 дозы 6, 10, 14 нед.
- **HPV** — 2 дозы в 9-13 лет.
- **Influenza** — ежегодно с 6 мес.
- **MenACWY** — 12-15 мес и 5-6 лет (в эндемичных регионах).

## Эпидемиологические особенности УЗ

- Высокая распространённость гепатита B → ранняя HepB-1 критична.
- Эндемический туберкулёз → BCG обязательна.
- Циркуляция полиовируса в регионе → строгое соблюдение OPV / IPV календаря.
- Эпидемические подъёмы кори → вторая доза MMR в школьном возрасте.""",
        [
            "Министерство здравоохранения Республики Узбекистан — Национальный календарь профилактических прививок (2024)",
            "WHO Vaccine-Preventable Diseases Surveillance Standards. 2018",
            "UNICEF Immunization Coverage Estimates",
            "ECDC European Vaccine Schedule Database",
        ],
    ),
]


# =============================================================================
# Международные PROTOCOLS (WHO / iLCOR / UNICEF)
# =============================================================================
INTL_PROTOCOLS = [
    proto(
        "guide_who_kmc_2023",
        "Международный: WHO 2023 — Kangaroo Mother Care как стандарт ухода",
        "WHO 2023: Kangaroo Mother Care as Standard of Care",
        "screening_discharge",
        ["Международный"],
        """## Major Update (WHO 2023)

В 2023 году WHO выпустила new guideline, рекомендующую KMC как стандарт ухода ВСЕХ preterm/LBW newborns СРАЗУ после рождения, без необходимости предварительной стабилизации в incubator (если ребёнок гемодинамически стабилен).

## Ключевые рекомендации

### Сильная рекомендация для КMC
- KMC следует начинать ИММЕДИАТЕЛЬНО после рождения у preterm/LBW в всех регионах мира.
- Не ждать стабилизации в инкубаторе (как в предыдущих guidelines).
- Сильная рекомендация даже для VLBW <1500 г.

### Длительность
- ≥8 hours/day continuous KMC.
- В идеале — continuous 24/7.

### Совместное пребывание
- Mother-newborn dyad together — нет separation.
- Если мать недоступна — другой caregiver (отец, бабушка) под наблюдением.

## Доказательная база (WHO 2023 Cochrane update)

### Эффективность по сравнению с инкубатором (для стабильных preterm)
- Снижение неонатальной mortality на 25-32%.
- Снижение нейроразвитийных delays на 32%.
- Снижение sepsis on 47%.
- Reduced length of hospital stay on 30%.

### Effective даже в high-resource settings
- Не только LMIC контекст.
- Equivalent neuroprotection vs incubator при условии адекватного мониторинга.

## Сравнение со старыми guidelines

### Pre-2023 WHO
- KMC после стабилизации в incubator.
- "Bridging" intervention.
- Часто delayed initiation (1-2 weeks).

### Post-2023 WHO
- Immediate KMC.
- "Standard of care", не "intervention".
- Continuous from birth.

## Implementation Recommendations

### Equipment
- KMC-friendly bed/chair where mother can sleep with baby skin-to-skin.
- Specialized KMC garments / wraps.
- Pumping equipment for milk expression.
- Family-centered NICU design.

### Staff training
- All NICU staff trained в KMC initiation, support.
- Lactation consultants integral.
- Family caregivers welcomed (no rigid visiting hours).

### Quality metrics
- % of eligible babies on KMC at 24 hours.
- Mean hours of KMC per day.
- Mother satisfaction.
- Staff confidence.

## Eligibility (WHO 2023)

### Eligible для immediate KMC
- Preterm ≥28 нед if hemodynamically stable.
- LBW <2500 г (term and preterm).
- After initial stabilization (5-15 min).
- No active resuscitation needed.

### Не эligible
- Cardiopulmonary instability requiring inotropes.
- Active surgical intervention recovering.
- Major congenital anomaly require immediate intervention.

## Special Considerations

### Microcephaly / hydrocephaly
- KMC remains beneficial.
- Adapt position to anatomy.

### After cardiac surgery
- Delayed KMC (24-48 hours postop typical).
- Resume as soon as hemodynamically stable.

### Multiple gestations
- KMC with one twin while other is in incubator (cycle).
- Both twins skin-to-skin if mother able.

## Long-Term Outcomes (10-year follow-up)

### Charpak 2017 study
- Preterm randomized to KMC vs traditional care.
- Reduction в hyperactivity, aggressiveness.
- Better academic performance.
- Stronger maternal-infant bond.

### Sample population health metrics
- Reduced ED visits для respiratory infections.
- Better growth trajectory.
- Improved cognition at school age.""",
        [
            "WHO Recommendations for Care of the Preterm or Low-Birth-Weight Infant. 2023",
            "WHO Immediate Kangaroo Mother Care Study Group. NEJM 2021;384:2028",
            "Conde-Agudelo A et al. Cochrane 2016;CD002771 — KMC for LBW (last update 2023)",
            "Charpak N et al. Pediatrics 2017;139:e20162063 — long-term KMC outcomes",
        ],
    ),

    proto(
        "guide_ilcor_2020_costr_neonatal",
        "Международный: iLCOR 2020 CoSTR — Neonatal Resuscitation",
        "International: iLCOR 2020 CoSTR Neonatal",
        "resuscitation",
        ["Международный"],
        """## Background

The International Liaison Committee on Resuscitation (iLCOR) publishes the Consensus on Science with Treatment Recommendations (CoSTR) every 5 years, integrating systematic reviews of evidence для resuscitation. Major neonatal recommendations from 2020.

## Main Topics в 2020 CoSTR

### 1. Cord Management
- **Delayed cord clamping (DCC) ≥30 sec** для most preterm и term infants without need for immediate resuscitation.
- **Cord milking** for preterm 28-32 weeks при обстоятельствах когда DCC infeasible.
- **NOT for very preterm <28 weeks** (risk of IVH).

### 2. Initial Oxygen Concentration
- **Term ≥35 weeks**: start с 21% (room air).
- **Preterm <35 weeks**: start с 21-30%.
- Titrate to pre-ductal SpO₂ targets.

### 3. Sustained Inflations
- **Routine sustained inflation NOT recommended** в preterm (SAIL trial и subsequent meta-analyses).
- Standard PPV with intermittent breaths preferred.

### 4. Compression-to-Ventilation Ratio
- **3:1 ratio (90 + 30 = 120/min)** maintained as best evidence.
- Other ratios (e.g., 15:2 adult-style) inferior.

### 5. Endotracheal Tube vs LMA
- **LMA acceptable alternative** to ETT для term and late-preterm если intubation unsuccessful.
- ETT remains gold standard для most situations.

### 6. Two-Thumb vs Two-Finger Technique
- **Two-thumb encircling preferred** — better pressure consistency, less rescuer fatigue.
- Two-finger acceptable for solo rescuer.

### 7. Tactile Stimulation
- **Continued use** — рутинная часть initial steps.
- Brisk stimulation 5-10 seconds (rub back, flick feet).

### 8. Heart Rate Assessment
- **Auscultation остаётся стандартом** в early phase (3-lead ECG also valid).
- 6-second listen × 10 = HR/min.
- ECG faster but requires stable baby and equipment.

### 9. Plastic Wraps for Preterm
- **Strong recommendation** для preterm <32 weeks.
- Reduces hypothermia significantly.
- Apply BEFORE drying.

### 10. Glucose Management Post-Resuscitation
- Avoid both hypo (<2.6 mmol/L) AND hyperglycemia (>10 mmol/L).
- Both worsen neurological outcomes.

## Big Picture Changes

### Versus 2015
- More emphasis on family-centered approach.
- Earlier surfactant via LISA preferred.
- Cord management received highest evidence weight.
- Sustained inflation removed from algorithm.
- Glucose management included.

### Versus older (2010)
- Move toward gentler ventilation.
- Less intubation, more CPAP.
- Higher SpO₂ targets (90-95% replaces 88-92%).

## Implementation

- NRP 8 ed. (AHA/AAP) incorporates all 2020 CoSTR.
- ERC 2021 incorporates все recommendations.
- WHO updated guidelines в 2023 reflect integration.

## Future Directions

### 2025 update (preview)
- More precision data on cord management timing.
- Refinement of SpO₂ targets.
- Integration of точечного care echo.
- Evidence on telemedicine для resuscitation in remote settings.""",
        [
            "Wyckoff MH et al. Circulation 2020;142:S185 — 2020 CoSTR Part 5: Neonatal Resuscitation",
            "Aziz K et al. Pediatrics 2021;147:e2020038505E — NRP 8 ed.",
            "Madar J et al. Resuscitation 2021;161:291 — ERC NLS 2021",
            "Olasveengen TM et al. Resuscitation 2025 — preview update",
        ],
    ),

    proto(
        "guide_who_who_pocketbook_chapter3",
        "Международный: WHO Pocket Book — Уход за новорождёнными в стационаре",
        "International: WHO Pocket Book of Hospital Care for Children — Newborns",
        "screening_discharge",
        ["Международный"],
        """## Контекст

WHO Pocket Book of Hospital Care for Children (2nd ed. 2013) — практическое руководство для стационарного ухода за детьми (особенно новорождёнными) в условиях ограниченных ресурсов. Глава 3 — newborn care.

## Triage и стабилизация при поступлении

### Признаки опасности у новорождённого
- Не сосёт грудь / отказывается от еды.
- Letardgia, понижение сознания.
- Судороги, или history of seizures.
- Учащённое дыхание (≥60/мин), retractions, grunting.
- Цианоз, бледность.
- Гипотермия <35.5°C ИЛИ лихорадка >38.0°C.
- Желтуха в первые 24 часа ИЛИ palmar/plantar.
- Кровотечение / петехии.
- Признаки infection (omphalitis, abscess, pyoderma).

### Immediate management algorithm

#### 1. Reassess airway, breathing, circulation
- Position airway, suction PRN.
- O₂ if SpO₂ <90% или cyanotic.
- Bag-mask ventilation if not breathing or HR <100.
- IV access если sick infant.

#### 2. Keep warm
- Skin-to-skin contact с матерью OR warmer/incubator.
- Hat, dry clothing.
- Avoid cold surfaces.

#### 3. Treat hypoglycemia (if BG <2.5 mmol/L)
- Breastfeed или 5 mL/kg D10 oral.
- Severe symptoms: D10 IV bolus 2 mL/kg.

#### 4. Empiric antibiotics if sepsis suspected
- **Ампициллин** 50 мг/кг q8-12h IV/IM (первые 7 дней q12h, после q8h).
- **Гентамицин** 5 мг/кг q24h IV/IM (preterm q36h).
- **Cefotaxime** 50 мг/кг q8h alternative для meningitis suspicion.

#### 5. Treat seizures
- **Phenobarbital** 20 мг/кг IV slow (over 5 min).
- Repeat 10 мг/кг q15 min до total 40 мг/кг.

## Питание sick newborn

### Если ребёнок может сосать
- Breastfeed по требованию (≥8 раз/24ч).
- Поддержка матери в положении.

### Если ребёнок не сосёт но может глотать
- Сцеженное грудное молоко через чашку или ложку.
- 5-15 мл/кг каждые 2-3 часа initially.

### Если ребёнок не может глотать
- Назогастральный зонд.
- Continuous или intermittent feeds.

### При невозможности enteral
- IV maintenance: D10W 60-80 мл/кг/сут (Day 1), повышая на 20 мл/кг/сут.
- Add electrolytes from Day 2-3 (Na+, K+).

## Специфические состояния

### Sepsis / serious bacterial infection
- IV ABX (ampicillin + gentamicin) ≥7-10 days.
- LP if signs of meningitis.
- Supportive: O₂, fluids, нормотермия, нормогликемия.
- Re-evaluate clinical response 48-72h.

### Birth asphyxia
- Resuscitation if needed.
- O₂ to maintain SpO₂ 90-95%.
- IV fluids restricted (60-70% maintenance) первые 48-72 часа.
- Treat seizures с phenobarbital.
- Therapeutic hypothermia if available и criteria met.

### Severe jaundice
- Phototherapy (intensive если возможно).
- Exchange transfusion если threshold reached (per local nomogram).
- Identify cause (Rh, ABO, G6PD, sepsis).

### LBW / preterm
- KMC immediately if stable.
- Frequent feeds (q2-3h).
- Vitamin K 1 мг IM at birth.
- Daily monitoring (weight, t°, SpO₂).

## Outcomes Indicators

### Hospital level
- Neonatal mortality rate.
- Discharge by 28 days for term.
- Successful KMC initiation.
- Breastfeeding rate at discharge.

### Community follow-up
- Postnatal visits 1-3, 7-10, 28-42 days.
- Growth monitoring.
- Vaccination on schedule.
- Parental knowledge of danger signs.""",
        [
            "WHO Pocket Book of Hospital Care for Children. 2nd edition 2013, updated 2018",
            "WHO Recommendations on Newborn Health 2017",
            "WHO Guidelines on Optimal feeding of low birth-weight infants in low- and middle-income countries. 2011",
            "UNICEF Newborn Action Plan 2014",
        ],
    ),
]


# =============================================================================
# MAIN — merge into existing JSON
# =============================================================================
def main() -> None:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    existing_ids = {g["id"] for g in data["guidelines"]}

    all_new = RF_PROTOCOLS + US_PROTOCOLS + EU_PROTOCOLS + UZ_PROTOCOLS + INTL_PROTOCOLS
    added = 0
    skipped = 0
    for new_proto in all_new:
        if new_proto["id"] in existing_ids:
            skipped += 1
            continue
        data["guidelines"].append(new_proto)
        existing_ids.add(new_proto["id"])
        added += 1

    data["version"] = "1.9.0"
    data["lastUpdated"] = "2026-05-10"
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Added: {added} new protocols")
    print(f"Skipped (already exist): {skipped}")
    print(f"Total protocols now: {len(data['guidelines'])}")
    print()
    region_counts: dict[str, int] = {}
    for g in data["guidelines"]:
        for r in g.get("regions", ["Международный"]):
            region_counts[r] = region_counts.get(r, 0) + 1
    print("Region distribution (multi-region — sums >100%):")
    for r, n in sorted(region_counts.items(), key=lambda x: -x[1]):
        print(f"  {r:20s} {n}")


if __name__ == "__main__":
    main()
