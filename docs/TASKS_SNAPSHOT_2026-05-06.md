# Реестр задач Bordik Med — снимок 2026-05-06

> Обновлено после расширения МКБ-10 (3742 → 6060) и drug interactions (62→116
> препаратов / 186→386 пар), хаба классификаций и код-ревью всей сессии.
> Источники: `AUDIT_TODO_2026-05.md`, `AUDIT_PASS_4_TODO.md`, `BACKLOG.md`,
> `CONTENT_ROADMAP.md`, `STRESS_TEST_TODO.md`, `TODO_PASS_2.md`,
> `SECURITY_SETUP.md`, `docs/specs/`, код-ревью HEAD `31af1ff`.

---

## 🔴 НАЙДЕНО КОД-РЕВЬЮ HEAD `31af1ff` (2026-05-06)

| ID | Задача | Файл | Severity |
|---|---|---|---|
| **CR-1** | Хардкод «83 пары» — заменить на `{data.interactions.length}` | `components/drugs/DrugChecker.tsx:779` | 🔴 видим в проде, виден на скриншоте пользователя |
| **CR-2** | Стейл-комментарий `?v=0.6.0` / 3742 кодов — обновить на текущие 1.0.0 / 6060 | `components/classifications/ClassificationsHub.tsx:162-169` | 🟡 doc drift |

**Размер фикса:** 2 строки. Время: 2 минуты. Должно идти в первую очередь.

---

## 🚨 Блокеры коммерческого запуска

| ID | Задача | Размер | Бюджет | Спека |
|---|---|---|---|---|
| **K1-Verify** | Аудит **386 пар** взаимодействий клин-фармакологом | 50-70 ч | 75-200 тыс ₽ | `docs/specs/drug-interactions-verification.md` |
| **A10** | Внешний юр-аудит ФЗ 28-ФЗ + Росздравнадзор + 152-ФЗ | внеш. юрист | договор | — |
| **B2** | Платежи: Stripe / CloudPayments / SberBusinessOnline | M | — | — |

---

## 🟡 P1 — killer-фичи

| ID | Задача | Размер | Статус |
|---|---|---|---|
| **K1-P2** | Drug Interactions Phase 2 (200+ препаратов / 500+ пар) | M, 1-2 нед | ждёт K1-Verify |
| **K2** | Dose adjustment ХБП/ХПБ для топ-50 препаратов | M, 1 нед | не начато |
| **K3** | Pediatric dose calc (80+ препаратов) | M, 1 нед | не начато |
| **K4** | Guidelines catalog MVP (~30 карточек) | XL, 3-6 нед | спека `docs/specs/guidelines-catalog.md` |
| **#3a-2** | МКБ-11 (~17k кодов с icd.who.int) | M, 3-5 дней | заглушка готова, ETA Q3 2026 |
| **#3a-3** | ICD-10-CM (~73k кодов с CDC) | M-L, 5-7 дней | заглушка готова, ETA Q3 2026 |
| **#3a-4** | ICD-10-GM (~16k кодов с BfArM) | S, 3-5 дней | заглушка готова, ETA Q4 2026 |
| **#3a-5** | ICD-10-PCS (~78k процедур, отдельная UX) | L, 5-7 дней | заглушка готова, ETA Q4 2026 |
| **#3a-6** | ICD-10-CA / ICD-10-AM (лицензионные) | M | блок: переговоры с CIHI/IHACPA |
| **#3a-7** | Cross-walk между системами + универсальный поиск | M, 3-5 дней | данные нужны |

---

## 🟡 P1 — AI-слой

| ID | Задача | Стек |
|---|---|---|
| AI1 | RAG разбор ошибок в тестах поверх КР Минздрав | pgvector в Supabase, YandexGPT/Gigachat (RU), GPT-4o (EN) |
| AI2 | AI-генерация vignette-кейсов под уровень студента | LLM + шаблоны |
| AI3 | AI-переводчик гайдлайнов EU/US → формат СНГ + поправка на ГРЛС | LLM |
| AI4 | AI-помощник по калькуляторам | LLM |
| AI-инфра | Кеширование (~70% экономии), rate-limit, гардрейлы | Supabase |

## 🟡 P1 — UX/педагогика

| ID | Задача | Эффект |
|---|---|---|
| U1 | 3 onboarding-ветки (студент / ординатор / врач) | retention |
| U2 | Spaced repetition queue с FSRS-алгоритмом | D30 retention +25% |
| U3 | Vignette-style вопросы ≥120 слов с разбором каждого дистрактора | C4 |
| U4 | Mapping каждого курса на ФГОС / USMLE Step | C2 |
| U5 | WCAG 2.2 AA аудит + фиксы (Lighthouse Accessibility ≥95) | a11y |
| U6 | Сертификаты с QR-верификацией | S5 |
| U7 | Voice TTS аудиоконспектов | Yandex SpeechKit |

## 🟡 P1 — Бизнес/юр

| ID | Задача | Параметры |
|---|---|---|
| B1 | Цены B2C | Студент 390 ₽/мес, врач 990 ₽/мес, AI-pack +500 ₽ |
| B2 | Платежи | Stripe / CloudPayments / SberBO |
| B3 | B2B-pitch для 2 медвузов (УГМУ, СамГМУ) | лицензия 200-500 ₽/студент/год |
| B4 | Партнёрство с лицензированным ДПО-провайдером | путь «к ЗЕТ» |
| B5 | Партнёрство с обществом специалистов (РКО / РОАГ) | S4 |
| B6 | Whiteboard-видео по 30 топ-нозологиям | 1 врач + 1 аниматор |

---

## 🟢 Wishlist / отложено

| ID | Задача | Статус |
|---|---|---|
| A5 | Тёмная тема — CSS-переменные, ~600 хардкоженных цветов | отложено: ~6-8 ч + риск регрессий |
| Test coverage | Расширение direct compute() golden tests (23/531 → ASCVD, APACHE, KDIGO AKI...) | nice-to-have |
| Sentry RUM | Связать с Vercel Speed Insights | nice-to-have |
| Playwright E2E | Smoke-тест diagnostic flow | nice-to-have |
| i18n EN/UZ | hreflang готов, переводов нет | nice-to-have |
| DSL runner snapshot tests | golden tests на eval'ed `when_expr` | nice-to-have |
| DOM-testing для Proctoring | UI-тесты на `getUserMedia` фейке | nice-to-have |

## 🔵 P2 — масштаб (7-12 мес)

| ID | Задача |
|---|---|
| P2-1 | Виртуальные пациенты Healer-lite (Markdown decision tree) |
| P2-2 | Symptom checker для тренировки |
| P2-3 | API/embed-виджеты калькуляторов |
| P2-4 | Узбекистан-локализация (UZ латиница + ТIPME) |
| P2-5 | Казахстан-локализация (210 ЗЕ нюансы) |

---

## 🛠 Manual setup (вне кода)

| Задача | Что нужно |
|---|---|
| Supabase SQL миграции | `rpc-delete-user-cascade.sql`, `rls-hardening-2.sql` через SQL editor |
| Upstash Redis | env vars `UPSTASH_REDIS_REST_URL` + `_TOKEN` в Vercel Production+Preview |
| GitHub Secrets | `SUPABASE_DB_URL`, `R2_*` |
| CSP enforcement | После 14 дней Report-Only с 0 violations — флипнуть в `middleware.ts` |
| `wrangler secret put ESKIZ_TOKEN` | Если используется backend проекта castar |
| `wrangler secret put GOOGLE_CLOUD_STT_KEY` | Voice STT |

## 🔵 Сознательно пропущено (документировано)

| Item | Причина |
|---|---|
| `__Host-` cookie prefix | Renaming Supabase auth-token cookie сломает все живые sessions |
| `eslint-plugin-jsx-a11y` без baseline | Нет существующего eslint flat config |
| `apple-touch-startup-image` full set | Требует pwa-asset-generator pipeline + ~50 PNG |
| LQTS / START в score-bands-integrity | LQTS .5 increments; START — overlapping bands by design |
| `score2` direct test | ESC 2021 со специфичными regional recalibration tables |

---

## ✅ Закрыто за сессию 2026-05-05/06

| ID | Задача | Метрики/коммит |
|---|---|---|
| **МКБ-10 расширение** | 92 → 506 → 1381 → 2357 → 3067 → 3742 → 4416 → 4926 → 5428 → **6060 кодов**, milestone v1.0.0 | 9 батчей, 0 дублей |
| **Drug Interactions** | 62 → 116 препаратов, 186 → 324 → **386 пар**, severity 4 уровня | v0.5.0 BETA |
| **Хаб классификаций** | 7 табов «Классификации», МКБ-10 рабочая, 6 заглушек с ETA | `5b5ebc0`, этап 1 |
| **Memory system** | claude-code-memory-setup pattern (CLAUDE.md + sessions/) | `4adb1ba` |
| **CredibleMeds fix** | scale shape соответствует ResultExtras контракту | `15d508e` |
| **TASKS_SNAPSHOT** | реестр задач сохранён | `5b5ebc0` |
| **CONTENT_ROADMAP #3a** | план хаба классификаций задокументирован | `811841a` |

## ✅ Закрыто ранее (P0 + Sprint 0/Pass 4)

| Группа | Что |
|---|---|
| P0 quick wins (A1-A9) | ЗЕТ-дисклеймер, Cmd-K, recent tools, schema.org, TTR, перелинковка |
| Sprint 0 / Pass 4 (27/29) | API key headers, AbortController, Upstash rate-limit, RPC cascade delete, output guard, golden tests, Sentry+UptimeRobot |
| P1-SEC-1..7 | CSP nonce, RLS hardening, supa_audit RLS |
| Stress fixes | Удалён зомби-пакет next-pwa (5 CVE), Serwist PWA |

---

## 📊 Текущий счётчик

| Метрика | Значение |
|---|---|
| Калькуляторы | 732 рабочих |
| Тесты | 948/948 pass |
| Type-check | clean |
| **МКБ-10** | **6060 кодов**, 22 главы, v1.0.0 |
| **Drug interactions** | **116 препаратов / 386 пар**, v0.5.0 BETA |
| Question bank | 225 вопросов |
| Открытых проблем код-ревью | **2** (CR-1, CR-2) |
| Открытых P1 | 23 |
| Открытых P2 | 5 |
| Блокеров запуска | 3 (K1-Verify, A10, B2) |

---

## 🎯 Следующие шаги по приоритету

1. **CR-1 + CR-2** — 2-минутный фикс, видимая регрессия в проде
2. **K2 (renal dosing)** — высокая клиническая ценность, 1 неделя
3. **МКБ-10 → 8000+ кодов** — продолжить слабые главы (VIII ухо, III кровь, V психиатрия)
4. **K1-Verify** — без peer-review 386 пар не могут быть commercial use
5. **#3a-2 (МКБ-11)** — приоритетная заглушка, открытый источник WHO

## 🌟 North Star Metric

WAU-врачей, использовавших инструмент или модуль ≥3 раза за неделю.

| Vital sign | Цель |
|---|---|
| DAU/MAU stickiness | ≥20% |
| Retention D7 (врач) | ≥45% |
| Retention D30 | ≥28% |
| Calculator-to-course conversion | ≥5% |
| Time-to-result медиана | ≤3 сек, ≤2 тапа |
| NPS | ≥40 |
| CME-completion rate | ≥40% |
| AI-usage / token cost | ≥30% / ≤$0.30/MAU |
