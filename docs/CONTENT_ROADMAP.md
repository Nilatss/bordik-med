# Контентная дорожная карта Bordik

Большие фичи, которые требуют существенной работы по сбору и верификации
медицинских данных. У платформы 732 рабочих калькулятора, но эти 4
направления — критические дыры с точки зрения практикующего врача
(сравнение с Medscape, UpToDate, MDCalc).

Документ обновляется по мере поставки. Каждая фича декомпозирована до
конкретных шагов с реалистичной оценкой времени.

---

## Статус по 4 фичам

| # | Фича | Статус | Размер | Оценка |
|---|---|---|---|---|
| 1 | Drug Interaction Checker | 🔴 не начато | XL (контент) | 2–4 недели |
| 2 | Dose adjustment (renal/hepatic) | 🔴 не начато | M (контент) | 1 неделя |
| 3 | МКБ-10 lookup | ✅ выкачен (starter ~90 кодов) | S | done |
| 4 | Педиатрические дозы | 🔴 не начато | M (контент + UI) | 1 неделя |
| 5 | Guidelines (каталог клин. рекомендаций) | 🔴 не начато | XL (контент + UX) | 3–6 недель |

---

## #1. Drug Interaction Checker

**Что делать:** проверка совместимости 2+ препаратов на serious /
moderate / minor interactions.

**Эталон:** Medscape (9 200 препаратов, до 30 одновременно, бесплатно).

### Почему это XL

- Парные взаимодействия = N² / 2. Даже 500 препаратов = 125 000 пар.
- Источник данных в РФ — РЛС, Видаль, ГРЛС Минздрава. Лицензионные
  ограничения для коммерческого использования.
- Ошибка в interaction = реальный клинический риск (контралатеральная
  ответственность).

### Прагматичный подход

**MVP (Phase 1, ~1 неделя):** топ-50 наиболее значимых препаратов из
русской аптеки + ~250 ручкой выверенных interaction-пар (только
clinically significant: contraindicated + major). Источник — DrugBank
(public domain CC0 данные с мажорными interactions).

**Phase 2 (~2 недели):** парсер ГРЛС + автомат
flag-извлечения «противопоказан с» из инструкций → ~500 препаратов.

**Phase 3 (~ещё 2 недели):** интеграция с Drugbank Open Data API для
auto-обновления + UI multi-select до 30 препаратов одновременно.

### Архитектурный план

- `data/drug-interactions.json` — `{ drugA, drugB, severity, mechanism, source, refs[] }`
- `lib/runners/drug-interactions.ts` — особый kind `'interaction-check'`
- UI: multi-select (3–30 препаратов) → grid pairwise результатов с
  цветовой кодировкой severity

### Acceptance criteria

- [ ] 50+ препаратов в стартовой базе
- [ ] 250+ верифицированных пар (clinically significant)
- [ ] UI поддерживает 3–30 препаратов
- [ ] Каждое взаимодействие имеет цитированный первоисточник
- [ ] Дисклеймер «не заменяет клиническое суждение» как у других tools

---

## #2. Dose Adjustment (Renal / Hepatic)

**Что делать:** для конкретного препарата + CrCl/MELD-Na показать
скорректированную дозу.

**Эталон:** UpToDate Pro Plus Kidney Dosing Tool (запущен в 2025).

### Размер: M

- Не нужны pairwise — каждый препарат самостоятелен.
- ~50–80 наиболее часто корректируемых препаратов (β-лактамы, NOAC,
  digoxin, vancomycin, gabapentin, allopurinol, metformin, и т.д.).
- Данные есть в FDA labels + UpToDate + KDIGO 2024. Public domain
  references.

### Архитектурный план

- Расширить существующие калькуляторы CrCl (Cockcroft-Gault, CKD-EPI,
  MDRD) добавив выбор препарата → автоматический показ нужной дозы.
- Или: новый tool `dose-adjustment` где пользователь вводит препарат
  + CrCl → таблица доз для разных диапазонов почечной функции.
- Данные: `data/dose-adjustments.json` со схемой
  `{ drug, normalDose, crcl_60_90, crcl_30_60, crcl_15_30, crcl_lt_15, hepatic_mild, hepatic_severe }`.

### Acceptance criteria

- [ ] 50+ препаратов в базе с верифицированными порогами CrCl
- [ ] Интеграция с существующими CrCl-калькуляторами (один клик из
      результата CrCl → подбор препарата)
- [ ] Раздельные таблицы для почечной и печёночной коррекции
- [ ] Источник для каждого препарата (FDA label / UpToDate /
      monograph)

---

## #3. МКБ-10 Lookup ✅ ИДЁТ СЕГОДНЯ

**Что делать:** searchable справочник всех кодов МКБ-10 с поиском по
коду и по названию диагноза.

**Эталон:** [мкб-10.com](https://мкб-10.com).

### Размер: S

- Данные публичные (Минздрав использует МКБ-10 с письма
  № 13-2/1664 от 05.12.2014; WHO ICD-10 Russian translation тоже
  open).
- Полная база: ~14 000 кодов. JSON-файл ~2 MB, легко загружается на
  клиенте.
- Поиск — обычный fuzzy на клиенте (MiniSearch у нас уже есть для
  каталога tools).

### Архитектурный план — РЕАЛИЗАЦИЯ ⬇

См. коммит, реализующий эту фичу.

1. `data/icd10-starter.json` — стартовая база с 22 главами + ~80
   самых частых кодов.
2. `app/icd10/page.tsx` — server-rendered shell со скриптом
   подгрузки полной базы по требованию.
3. `components/icd10/Icd10Search.tsx` — клиентская часть с поиском
   и навигацией по главам.
4. `scripts/build-icd10.mjs` — placeholder для импорта полной базы
   (~14 000 кодов) из официального источника. На стартовой базе
   работает сразу.
5. Линк в сайдбаре под «Справочники».

### Acceptance criteria

- [x] Все 22 главы МКБ-10 (I–XXII)
- [x] 80+ ручкой выверенных кодов из стартовой базы
- [x] Поиск по коду И по названию диагноза
- [x] Навигация по главам
- [ ] Скрипт подгрузки полной базы (~14k кодов) — заглушка с
      инструкцией куда класть JSON

---

## #4. Педиатрические дозы

**Что делать:** для конкретного препарата + возраст/вес ребёнка
показать дозу в мг/кг с проверкой на максимум.

**Эталон:** APLS / WHO Pediatric Formulary.

### Размер: M

- ~80–120 наиболее частых педиатрических препаратов
- Дозы зависят от: возраст (newborn / infant / child / adolescent),
  вес, иногда BSA, путь введения, частота
- Данные: WHO Pocket Book of Hospital Care for Children (open) +
  BNF for Children (выписки)

### Архитектурный план

- `data/pediatric-doses.json` со схемой `{ drug, ageRange,
  doseMgPerKg, maxSingleDose, maxDailyDose, frequency, route, refs }`
- Новый tool `lib/runners/pediatric-dose.ts` (или отдельная страница)
- Интеграция с уже существующими: BSA-Mosteller, Holliday-Segar
  (поддерживающая жидкость), pediatric Apgar/GCS

### Acceptance criteria

- [ ] 80+ препаратов с возрастным разбиением
- [ ] Расчёт mg/kg + проверка не превышен ли максимум по
      single/daily dose
- [ ] Связка с BSA, IBW (Devine), Holliday-Segar для комплексных
      назначений (например, антибиотик + жидкость)
- [ ] Цвет flagging: зелёный — норма, жёлтый — у максимума,
      красный — превышение

---

## Общая стратегия

Не пытаемся за один спринт сделать клон Medscape. Каждый MVP
поставляет реальную ценность сразу с ограниченным набором данных,
дальше — поэтапное расширение по реальной обратной связи от врачей.

**Принципы:**
- Каждая запись с цитированным первоисточником
- Дисклеймер «не заменяет клиническое суждение» на каждой странице
  (как уже сделано в `app/tools/[id]/page.tsx`)
- Никаких AI-генерированных дозировок — только выверенные данные
- Версионирование: `lastUpdated` для каждой entry, чтобы видеть когда
  данные пересматривались

---

## #5. Guidelines (каталог клинических рекомендаций)

**Что делать:** структурированный справочник международных + национальных
КР (ESC, ACC/AHA, NICE, KDIGO, WHO, NCCN, ESMO, EASL, EAU, EULAR, ECCO,
ADA, GINA, GOLD, ATS/IDSA, ACOG, AAP, EAN, КР МЗ РФ и др.) — около
**~250 ключевых документов** в стартовом наполнении и до **~900** при
полной интеграции с Рубрикатором cr.minzdrav.gov.ru.

**Эталон:** Medscape Guidelines, BMJ Best Practice, MDCalc Guidelines.

**Полная спецификация:** `docs/specs/guidelines-catalog.md` (25 разделов,
системы классификации COR/LOE, GRADE, NICE, SIGN, USPSTF, NCCN, УУР/УДД).

### Почему это XL

- Сотни документов, у каждого: издатель, год, заменяемые версии,
  ключевые рекомендации с COR/LOE, изменения vs предыдущей версии,
  связанные калькуляторы из нашего раздела Tools.
- Юридический режим разный: NICE/WHO Open Access, ESC/ACC-AHA — личное
  + образовательное, NCCN/UpToDate/BMJ BP — закрытые.
- Living guidelines (ADA, AASLD/IDSA HCV, GINA, GOLD, NCCN, WHO COVID/
  HIV/Malaria) требуют квартальной автопроверки версий.
- Локализация: где есть русский (КР МЗ РФ, переводы РКО, GINA/GOLD на
  русском) — указывать.

### Прагматичный подход

**MVP (Phase 1, ~1 неделя):** скелет UX + ~30 карточек по самым
востребованным разделам — кардиология (ОКС, АГ, ХСН, ФП, дислипидемии),
эндокринология (СД2), пульмонология (астма, ХОБЛ), неотложка (АНА CPR
2025, SSC 2026), нефрология (KDIGO 2024 CKD). Двухуровневое дерево
«Специальность → Нозология → Список гайдлайнов».

**Phase 2 (~2 недели):** расширение до 100 карточек, таблицы сравнения
расходящихся рекомендаций (ACC/AHA vs ESC vs МЗ РФ vs NICE) для топ-нозологий
(АГ, ОКС, ФП, дислипидемии). Связь many-to-many с разделом Tools — у
каждой шкалы (TIMI, GRACE, HEART, CHA₂DS₂-VA, HAS-BLED, Wells, PESI и
т.д.) обратный список «Используется в гайдлайнах».

**Phase 3 (~2–3 недели):** парсер cr.minzdrav.gov.ru → автодобавление
карточек КР МЗ РФ; cron-проверка living guidelines по DOI/URL раз в
квартал; локализация.

### Схема карточки гайдлайна (из спецификации)

```ts
interface GuidelineCard {
  id: string;
  title_orig: string;
  title_ru: string;
  organization: string;        // ESC, ACC/AHA, NICE, KDIGO, NCCN...
  country: string;             // US, EU, UK, RU, Global
  region: 'US' | 'EU' | 'UK' | 'RU' | 'Asia' | 'LATAM' | 'Global';
  specialty: string;           // cardiology, endocrinology...
  subtopic: string;            // ACS, AF, dyslipidaemia...
  year_active: number;
  year_previous: number | null;
  status: 'ACTIVE' | 'SUPERSEDED' | 'DRAFT';
  classification_system: 'ACC-AHA' | 'GRADE' | 'NICE' | 'SIGN'
                       | 'USPSTF' | 'NCCN' | 'MZ-RF';
  key_recommendations: Array<{
    text: string;
    cor?: string;              // I, IIa, IIb, III
    loe?: string;              // A, B-R, B-NR, C-LD, C-EO
    grade?: string;            // strong/conditional + High/Moderate/Low
  }>;
  algorithms: string[];
  related_calculators_ids: string[];
  related_guidelines_ids: string[];
  doi: string | null;
  url_pdf: string | null;
  url_html: string;
  last_updated: string;        // YYYY-MM-DD
  mkb10_codes: string[];       // связь с /icd10
  language_versions: string[]; // ru, en
  who_endorsed: boolean;
  license: 'open-access' | 'educational' | 'subscription';
}
```

### UX

- Двухуровневое дерево: Специальность → Нозология → Список гайдлайнов.
- Фильтры: регион, год, организация, класс рекомендаций.
- На странице нозологии: таблица сравнения ACC/AHA vs ESC vs МЗ РФ vs
  NICE (для АГ, ОКС, ФП, дислипидемий — где они расходятся).
- Связь с разделом Tools (калькуляторы): у каждой шкалы — обратная
  ссылка «Используется в гайдлайнах».

### Юридический режим

- Все резюме — собственные, со ссылкой на первоисточник.
- Полные тексты NCCN/UpToDate/BMJ BP **не воспроизводятся**.
- NICE и WHO — Open Access (атрибуция).
- ESC и ACC/AHA — личное и образовательное использование разрешено,
  коммерческое требует разрешения.
- КР МЗ РФ — открытый доступ через cr.minzdrav.gov.ru.

### Acceptance criteria для MVP

- [ ] Маршрут `/guidelines` с двухуровневой навигацией.
- [ ] ~30 карточек в стартовом наполнении (кардио + неотложка + СД2 +
      ХОБЛ/астма + KDIGO 2024 CKD).
- [ ] Provenance + дисклеймер на каждой карточке (как в `/tools/[id]`).
- [ ] Связь с калькуляторами Tools (двусторонняя).
- [ ] Связь с МКБ-10 (mkb10_codes → ссылки на /icd10).
- [ ] JSON-LD `MedicalGuideline` / `MedicalScholarlyArticle`.
- [ ] sitemap entries для всех карточек.
- [ ] 11 ключевых сравнительных таблиц (ACC/AHA vs ESC vs МЗ РФ vs NICE).

### Источники данных

См. `docs/specs/guidelines-catalog.md` — там перечислены все 25
разделов, агрегаторы (MDCalc, BMJ BP, UpToDate, DynaMed, Manual MSD,
ECRI Guidelines Trust) и первоисточники по каждой организации.

**Реализация откладывается** — спецификация сохранена в репо,
имплементация начнётся после согласования приоритета относительно фич
#1, #2, #4.
