# Реестр задач Bordik Med — снимок 2026-05-05

> Сводка по всем планировочным документам: `AUDIT_TODO_2026-05.md`,
> `AUDIT_PASS_4_TODO.md`, `BACKLOG.md`, `CONTENT_ROADMAP.md`,
> `STRESS_TEST_TODO.md`, `TODO_PASS_2.md`, `PERF_DIAGNOSTIC.md`,
> `SECURITY_SETUP.md`, `docs/specs/`.

---

## ✅ Закрыто — P0 quick wins (аудит 2026-05)

| ID | Задача | Коммит |
|---|---|---|
| A1 | ЗЕТ-дисклеймер на лендинге + Terms §11 | `a06d8db`, `f9a0d64`, `209b5e4` |
| A2 | Roadmap-ETA на разделах "Скоро" | `1fb32c4` |
| A3 | Сайдбар-меню сокращено до 7 пунктов | `15d508e` |
| A4 | Cmd-K глобальный поиск (synonyms RU/LAT/EN, fuzzy 0.7) | `308ff5c` |
| A6 | Last used calculators виджет top-5 | `7a97ae5` |
| A7 | schema.org `MedicalCalculator` / `MedicalRiskCalculator` / `MedicalScale` | `1976c25` |
| A8 | Sentry "время до результата" (`tool-ttr`) | `8975a95` |
| A9 | Перелинковка калькулятор ↔ МКБ-10 ↔ КР Минздрав (599/738 = 81%) | `a581f4d` |

## ✅ Закрыто — Sprint 0 / pass 4 (security)

| ID | Задача |
|---|---|
| P0-SEC-1 | GEMINI_API_KEY в headers вместо query string |
| P0-SEC-2 | AbortController для каскадного fallback (8.5s budget) |
| P0-SEC-3 | Upstash Redis sliding-window rate-limit |
| P0-SEC-4 | `/api/account/delete` через RPC `delete_user_cascade` (атомарно) |
| P0-SEC-5 | Output guard через DOMParser + multi-pass entity decode |
| P0-CQ-1 | Vitest + golden snapshots — 948 тестов, 27 файлов, 181 unique tools |
| P0-DEVOPS-1 | Sentry + Vercel Speed Insights + UptimeRobot + `/api/healthz` + `global-error.tsx` |
| P1-SEC-1..7 | CSP nonce, RLS hardening, supa_audit RLS, editor_role STABLE, correctIndex bounds |
| Stress #1 | Удалён зомби-пакет `@ducanh2912/next-pwa` (5 high CVE) |
| Stress #2 | PWA через Serwist — офлайн-доступ работает |

## ✅ Закрыто — контент

| ID | Задача | Метрики |
|---|---|---|
| Calc | 732 рабочих калькулятора | `public/tools-data/` |
| Tests | Static question bank | 225 вопросов |
| T6 | МКБ-10 lookup | 3742 кода v0.6.0, 22 главы, 0 дублей |
| K1 | Drug Interaction Checker Phase 1 | 116 препаратов, 324 пары v0.4.0 |
| Memory | claude-code-memory-setup pattern | CLAUDE.md + sessions/ + Graphify-ready |
| UI Kit | UI_GUIDELINES.md, UI_KIT.md | tokens/spacing/typography |

---

## 🚨 Блокеры коммерческого запуска

| ID | Задача | Размер | Бюджет | Спека |
|---|---|---|---|---|
| **K1-Verify** | Аудит 324 пар клин-фармакологом | 40-60 ч | 60-180 тыс ₽ | `docs/specs/drug-interactions-verification.md` |
| **A10** | Внешний юр-аудит ФЗ 28-ФЗ + Росздравнадзор + 152-ФЗ | внеш. юрист | договор | — |
| **B2** | Платежи: Stripe / CloudPayments / SberBusinessOnline | M | — | — |

---

## 🟡 P1 — killer-фичи для практики

| ID | Задача | Размер | ETA | Спека |
|---|---|---|---|---|
| **K1-P2** | Drug Interaction Checker Phase 2 (200+ препаратов / 300+ пар) | M, 1-2 нед | после K1-Verify | — |
| **K2** | Dose adjustment ХБП/ХПБ для топ-50 препаратов | M, 1 нед | — | roadmap #2 |
| **K3** | Pediatric dose calc (80+ препаратов) | M, 1 нед | — | roadmap #4 |
| **K4** | Guidelines catalog MVP (~30 карточек) | XL, 3-6 нед | — | `docs/specs/guidelines-catalog.md` |
| **#3a** | Унифицированный хаб классификаций (МКБ-10/11, ICD-10-CM/PCS/CA/GM/AM) | L, 2-3 нед | — | CONTENT_ROADMAP #3a |

## 🟡 P1 — AI-слой

| ID | Задача | Стек |
|---|---|---|
| AI1 | RAG разбор ошибок в тестах поверх КР Минздрав | pgvector в Supabase, YandexGPT/Gigachat (RU), GPT-4o (EN) |
| AI2 | AI-генерация vignette-кейсов под уровень студента | LLM + шаблоны |
| AI3 | AI-переводчик гайдлайнов EU/US → формат СНГ + поправка на ГРЛС | LLM |
| AI4 | AI-помощник по калькуляторам ("как интерпретировать CHA₂DS₂-VASc=4") | LLM |
| AI-инфра | Кеширование (~70% экономии), rate-limit, гардрейлы (запрет на ввод данных пациентов) | Supabase |

## 🟡 P1 — UX/педагогика

| ID | Задача | Эффект |
|---|---|---|
| U1 | 3 onboarding-ветки (студент / ординатор / врач) с разными default-курсами | retention |
| U2 | Spaced repetition queue с FSRS-алгоритмом | D30 retention +25% |
| U3 | Vignette-style вопросы ≥120 слов с разбором каждого дистрактора | C4 |
| U4 | Mapping каждого курса на ФГОС / USMLE Step | C2 |
| U5 | WCAG 2.2 AA аудит + фиксы (Lighthouse Accessibility ≥95) | a11y |
| U6 | Сертификаты с QR-верификацией (UUID + endpoint /verify) | S5 |
| U7 | Voice TTS аудиоконспектов (Yandex SpeechKit для рус) | — |

## 🟡 P1 — Бизнес/юр

| ID | Задача | Параметры |
|---|---|---|
| B1 | Цены B2C | Студент 390 ₽/мес (2900 ₽/год), врач 990 ₽/мес (8900 ₽/год), AI-pack +500 ₽ |
| B2 | Платежи | Stripe / CloudPayments / SberBusinessOnline |
| B3 | B2B-pitch для 2 медвузов (УГМУ, СамГМУ) | лицензия 200-500 ₽/студент/год |
| B4 | Партнёрство с 1 лицензированным ДПО-провайдером | путь "к ЗЕТ" |
| B5 | Партнёрство с 1 обществом специалистов (РКО / РОАГ) | S4 |
| B6 | Whiteboard-видео по 30 топ-нозологиям | 1 врач + 1 аниматор |

---

## 🟢 Wishlist / отложенное (Phase 2 backlog)

| ID | Задача | Статус |
|---|---|---|
| A5 | Тёмная тема — CSS переменные, ~600 хардкоженных цветов | отложено: ~6-8 ч + риск регрессий |
| Test coverage | Расширение direct compute() golden tests | 23/531 готово; следующая партия: ASCVD, APACHE II/III/IV, AKIN/RIFLE/KDIGO AKI, Atlanta 2012, ALSFRS-R, ARR, ANC |
| Sentry RUM | Связать с Vercel Speed Insights | nice-to-have |
| Playwright E2E | Smoke-тест diagnostic flow (15 вопросов → finalize → /modules) | nice-to-have |
| i18n EN/UZ | hreflang готов, переводы — нет | nice-to-have |
| DSL runner snapshot tests | golden tests на eval'ed `when_expr` строки | nice-to-have |
| DOM-testing для Proctoring | UI-тесты на `getUserMedia` фейке | nice-to-have |

## 🔵 P2 — масштаб (7-12 мес)

| ID | Задача |
|---|---|
| P2-1 | Виртуальные пациенты Healer-lite (Markdown decision tree) |
| P2-2 | Symptom checker для тренировки |
| P2-3 | API/embed-виджеты калькуляторов для медвузов и блогов |
| P2-4 | Узбекистан-локализация (UZ латиница + ТIPME-партнёр) |
| P2-5 | Казахстан-локализация (210 ЗЕ нюансы) |

---

## 🛠 Manual setup (вне кода)

| Задача | Что нужно |
|---|---|
| Supabase SQL миграции | `rpc-delete-user-cascade.sql`, `rls-hardening-2.sql` через SQL editor |
| Upstash Redis | env vars `UPSTASH_REDIS_REST_URL` + `_TOKEN` в Vercel Production+Preview |
| GitHub Secrets для backup workflow | `SUPABASE_DB_URL`, `R2_*` |
| CSP enforcement | После 14 дней Report-Only с 0 violations — флипнуть в `middleware.ts` |

## 🔵 Сознательно пропущено (документировано)

| Item | Причина |
|---|---|
| `__Host-` cookie prefix | Renaming Supabase auth-token cookie сломает все живые sessions |
| `eslint-plugin-jsx-a11y` без baseline | Нет существующего eslint flat config |
| `apple-touch-startup-image` full set | Требует pwa-asset-generator pipeline + ~50 PNG |
| LQTS / START в score-bands-integrity | LQTS .5 increments; START — overlapping bands by design |
| `score2` direct test | ESC 2021 со специфичными regional recalibration tables |

---

## 📊 Итоговый счётчик

| Метрика | Значение |
|---|---|
| Закрыто | P0/A1-A9, Sprint 0/Pass 4 (27/29), K1 Phase 1, МКБ-10 v0.6.0 |
| Тесты | 948/948 pass, 27 файлов, 181 unique tools |
| Type-check | clean (strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes) |
| Контент | 732 калькулятора, 3742 МКБ-10, 116 препаратов / 324 пары, 225 вопросов |
| i18n | RU только (EN/UZ — backlog) |
| Открытых P1 задач | 5 killer-фич + 5 AI + 7 UX + 6 бизнес = 23 P1 |
| Открытых P2 задач | 5 |
| Блокеров запуска | 3 (K1-Verify, A10, B2) |

## 🎯 Топ-5 рисков

| # | Риск | Митигация |
|---|---|---|
| 1 | Регуляторный ФЗ № 28-ФЗ — модель «онлайн → ЗЕТ» закрыта без лицензии | Позиционирование «помощник подготовки» (A1) |
| 2 | Контентный — не догнать AMBOSS/UpToDate по объёму | Фокус на инструментах + AI-слой |
| 3 | Конкурентный — MDCalc, Medscape, Manual MSD на русском | Ниша «инструменты + образование + локальная регуляторика» |
| 4 | Монетизационный — низкая платежеспособность врачей РФ/СНГ | B2B-канал (медвузы) |
| 5 | Технический — Vercel single point of failure в РФ | P2-8 runbook + Supabase RLS аудит |

## 🌟 North Star Metric
**WAU-врачей, использовавших инструмент или модуль ≥3 раза за неделю.**

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
