# AUDIT_REPORT_2026-05-06

**Проект:** Bordik Med — медицинская образовательная платформа
**Стек:** Next.js 16.2.3 · React 19.2.4 · TypeScript 5 (strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`) · Tailwind 4 · Supabase · Serwist PWA · Sentry · Vercel fra1
**Версия:** 0.1.0 (MVP)
**Дата:** 2026-05-06 · Аудитор: Claude Opus 4.7
**Режим:** READ-ONLY (правки запрещены, кроме самого отчёта)

---

## Executive Summary

1. **Базовый уровень — крепкий.** TypeScript-strict проходит чисто (`tsc --noEmit` exit 0); 1010 vitest-тестов в 39 файлах проходят за 2.6s; CSP enforced с per-request nonce; security headers + RLS hardening pass 2 + GDPR Art.17 cascade — на профессиональном уровне. Sentry с `sendDefaultPii: false`, Replay выключен, beforeSend-скруб PII. Это инфраструктурно заметно лучше типичного MVP.
2. **Критическая дыра в калькуляторах: defense-in-depth провален у GFR-формул.** В `cockcroft.ts:88`, `ckd-epi.ts:71-73`, `mdrd.ts:68` нет guard на `creatinine ≤ 0`. UI ставит `min=10`, но это HTML-валидация (легко обходится paste/программным POST/preset-edit). При `creatinine=0` `Math.pow(0, -1.154) → Infinity`, а `ToolView.tsx:208` фильтрует только NaN — `Infinity.toFixed(0)` зарендерится строкой `"Infinity"` в результате eGFR/CrCl. Для медицинского продукта это **P0**.
3. **740 раннеров калькуляторов помечены `// @ts-nocheck`.** Источник истины (`lib/tools-runners.ts`) типизирован, но `scripts/split-runners.mjs` в каждый сгенерированный файл вставляет `// @ts-nocheck`, поэтому ручная правка в `lib/runners/*.ts` обходит проверки типов. **P0** для медконтекста (любой ручной фикс в формуле может молча сломать совместимость).
4. **Тестовое покрытие калькуляторов ≈ 5%** (≈40 из 740 раннеров). Стратегия зафиксирована в `vitest.config.ts:11-15` (расширять от `CRITICAL_TOOL_IDS` поэтапно), но 700 раннеров без golden-tests — медицинский регресс-риск. **P1**.
5. **Архитектура без P0-замечаний.** RSC/RCC разделены аккуратно, нет Pages Router, `await params` / `await cookies()` корректны (Next 16), Serwist SW с разумной cache-стратегией (NetworkOnly для `/api/*` и `/auth/*`), manifest.json полный, layer separation выдержан. Большие файлы (`lib/curriculum.ts` 2490 LOC, `ToolView.tsx` 1912, `StatisticsPage.tsx` 1928) — кандидаты на split, но не блокирующие.

---

## Сводка по направлениям

| Направление | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Безопасность (XSS, секреты, RLS, API) | 0 | 1 | 1 | 1 |
| Медицинская корректность калькуляторов | 2 | 4 | 2 | 0 |
| Качество кода | 0 | 1 | 2 | 1 |
| Архитектура | 0 | 0 | 1 | 0 |
| Next.js 16 / React 19 / PWA | 0 | 0 | 0 | 0 |
| **Итого** | **2** | **6** | **6** | **2** |

---

## P0 — критично (медицинская безопасность)

### P0-1. GFR-калькуляторы могут вывести `Infinity`/`-Infinity` в результат
**Файлы:** `lib/runners/cockcroft.ts:88`, `lib/runners/ckd-epi.ts:71-73`, `lib/runners/mdrd.ts:68`
**Что:** в `compute()` нет guard на `creatinine ≤ 0`. UI ставит `min=10`, но валидация HTML-only — обходится paste/программным POST/правкой preset.
**Демонстрация:**
```js
// MDRD, creatinine=0
const scr_mgdl = 0 / 88.4;        // 0
Math.pow(0, -1.154);              // Infinity
// 175 * Infinity * ... = Infinity
// "Infinity".toFixed(0) → "Infinity"  (строка зарендерится в UI)
```
**Defense-in-depth провален:** `components/tools/ToolView.tsx:206-208` ставит `ready=false` только при `isNaN(v)`, но **НЕ** при `!isFinite(v)` и **НЕ** при недопустимых физиологических значениях.
**Рекомендация:**
1. В каждой формуле GFR: `if (!Number.isFinite(scr_mgdl) || scr_mgdl <= 0) return { value: 'N/A', interpretation: 'Введите корректный креатинин (> 0)' };`
2. В `ToolView.tsx:213-214` после `runner.compute(values)` проверить `isFinite(parseFloat(result.value))`, иначе подменить на N/A.
**Усилие:** S (≈15 мин на формулу, +30 мин на ToolView guard, +тесты)
**Затронуто файлов:** ~8 GFR-related (cockcroft, ckd-epi, mdrd, schwartz, grace, lille, maggic, meld) — нужна ручная сверка списка через `grep "/ scr_mgdl\|Math.pow(scr_mgdl"`.

### P0-2. Все 740 раннеров с `// @ts-nocheck`
**Что:** `lib/runners/*.ts` (740 файлов) начинаются с `// @ts-nocheck`, добавленным `scripts/split-runners.mjs`. Тип-проверка не работает на сгенерированных файлах.
**Подтверждение:** Grep `@ts-nocheck` → 740+ совпадений в `lib/runners/`.
**Риск:** ручная правка раннера для срочного фикса (типичный сценарий — редакторская правка) обходит TypeScript. Любая опечатка `creatinine` → `creatinin` или `Number(v.weight)` → `v.weight` (без приведения) пройдёт билд молча.
**Рекомендация:**
- Снять `// @ts-nocheck` с раннеров — это auto-generated, но единый интерфейс `CalculatorTool` уже есть; если генератор корректен, раннеры должны проходить strict TS как любой другой `.ts`. Проверить, что генератор не оставляет `any`-промахов.
- В `scripts/split-runners.mjs` либо удалить вставку `@ts-nocheck`, либо хотя бы заменить на `// @ts-expect-error AUTO` для конкретных строк.
**Усилие:** M (1 день — снять nocheck, починить выявленные TS-errors).

---

## P1 — важно (в ближайшие дни)

### P1-1. Возможный дубликат `aa-grad.ts` ↔ `aa-gradient.ts`
**Файлы:** `lib/runners/aa-grad.ts`, `lib/runners/aa-gradient.ts`
**Что:** оба калькулятора решают одну задачу (Alveolar–arterial oxygen gradient). По наблюдению Explore-агента — формулы и единицы разные. Если оба в каталоге, врач может загрузить «не тот» и получить ошибочный результат.
**Рекомендация:** прочитать оба файла, выбрать актуальный, отметить старый `deprecated: true` в `lib/tool-meta-data.ts` либо удалить из каталога. Это решение требует подписи мед-редактора.
**Усилие:** S (review + 1 правка). **Открытый вопрос:** см. ниже, требует решения автора.

### P1-2. Покрытие golden-тестов калькуляторов ≈ 5%
**Что:** vitest проходит 1010 тестов в 39 test-файлах (`tests/calculators/*.test.ts`), но в `lib/runners/` 740 раннеров. Стратегия зафиксирована (`vitest.config.ts:11-15` — start with `CRITICAL_TOOL_IDS`, expand over time), но не выполнена.
**Категории без golden-tests, важные клинически:** аминогликозиды, гентамицин-номограммы, варфарин-INR, фенитоин/дигоксин-PK, эхокардиография (PISA, vena contracta), электролитные дефициты (гиперкалиемия-протоколы), травматология (ISS/NISS).
**Рекомендация:**
1. CI-гейт: при добавлении нового раннера в `lib/runners/` требовать соответствующий `tests/calculators/<id>.test.ts`. Можно реализовать через GitHub Action.
2. Расширить `CRITICAL_TOOL_IDS` в `next.config.ts:16-21` (сейчас 20 калькуляторов) — синхронизировать с приоритетным списком из `docs/AUDIT_TODO_2026-05.md`.
**Усилие:** L (постепенно — 4 калькулятора в неделю даст ~95% покрытие за год).

### P1-3. Шкалы (`scale.segments`) — 288 issues (по `validate-scales.mjs`)
**Что:** Explore-агент сослался на `scripts/validate-scales.mjs` со списком из 288 проблем, включая 4 GAP'а — пропуски между интервалами (например, в `wells-pe`: `[0-1.9]` и `[2-6.4]` — значения 1.9-2 не попадают ни в один сегмент).
**Подтверждение:** `npm run validate:scales` (или через npx tsx). Я этот скрипт лично не запустил, доверяю агенту — отметил **открытым вопросом**.
**Рекомендация:** запустить скрипт перед фиксом, посмотреть детальный лог, починить 4 GAP'а сразу (S), остальные 284 (overlaps/orderings) — постепенно.
**Усилие:** S (на gaps) + L (на оставшиеся issues).

### P1-4. Конвертация единиц СИ ↔ традиционные не централизована
**Что:** креатинин принимается в мкмоль/л (`hint: "В СИ: ×88.4 от mg/dL"`), но переключателя единиц нет. Врач из США, привыкший к mg/dL, может ввести `1.2` (mg/dL) вместо `106` (мкмоль/л) → eGFR взлетит.
**Рекомендация:**
1. Добавить в `_dsl-runner.ts` (или в шапку `CalculatorTool` interface) поле `units?: { primary: 'SI'|'US', altUnit?: string, conversionFactor?: number }`.
2. В UI компоненте input'а (`components/tools/`) — toggle между SI/US, при переключении пересчитывать значение и подсвечивать.
**Усилие:** M (1-2 дня + миграция метаданных).

### P1-5. `/api/sync POST` без `assertSameOrigin` и без valibot-валидации
**Файл:** `app/api/sync/route.ts:69-78`
**Что:** все остальные mutating endpoints (`/api/account/delete`, `/api/diagnostic`, `/api/feedback`) вызывают `assertSameOrigin(req)` в начале и валидируют тело через `valibot`. `/api/sync` POST полагается только на `auth.getUser()` + RLS.
**Влияние:** RLS защищает данные на уровне БД, но в случае проксирования через расширения / cross-subdomain (`*.vercel.app` preview без Cookie SameSite=Lax) теоретически возможна замена тела. Низкая вероятность, но defense-in-depth не выдержан.
**Рекомендация:** добавить `const blocked = assertSameOrigin(req); if (blocked) return blocked;` перед `getSupabaseServerClient()` + valibot-схему `SyncPayloadSchema` с `maxLength` для всех string-массивов.
**Усилие:** S (≈30 мин).

### P1-6. Большие файлы — kandidаты на split (cognitive load + bundle)
| Файл | LOC | Замечание |
|---|---|---|
| `lib/curriculum.ts` | 2490 | Статика курсов; уже частично разгружено через `curriculum-stats.ts`. Acceptable. |
| `lib/tool-meta-data.ts` | 2129 | Auto-generated. OK. |
| `components/stats/StatisticsPage.tsx` | 1928 | Heatmap + analytics — split на 3 sub-component. |
| `components/tools/ToolView.tsx` | 1912 | Markdown render + SVG inline + compute pipe — выделить compute-обёртку в `lib/`. |
| `components/course/TestStartConsent.tsx` | 1696 | Form + legal. Form-логику в `lib/`. |
| `components/layout/Sidebar.tsx` | 1169 | Nav + search; command palette в отдельный компонент. |

**Рекомендация:** эти 4 (`StatisticsPage`, `ToolView`, `TestStartConsent`, `Sidebar`) — разделить на 2-3 sub-компонента каждый. **Не P0**, но облегчит поддержку.
**Усилие:** M (4-8 часов на файл) — итого ≈ 1 спринт.

---

## P2 — желательно (бэклог)

### P2-1. Дисклеймер «не для клинического применения» — не унифицирован
**Что:** в `lib/runners/*.ts` нет общего поля `disclaimer` в `CalculatorTool`-интерфейсе. Дисклеймеры встречаются в `info`-markdown/`caveats`-массивах, но не у каждого раннера. Юридически уязвимо для медпродукта.
**Рекомендация:** добавить обязательное поле `disclaimer: string` в `CalculatorTool`-тип; default-значение в UI-обёртке (`ToolView.tsx`) с возможностью override на уровне раннера.
**Усилие:** S (тип + UI) + L (заполнить 740 раннеров — можно auto-generate default).

### P2-2. Источники формул (PMID/DOI) — текстовые, не структурированные
**Что:** у `cockcroft.ts:234` поле `reference: "Cockcroft-Gault 1976: ..."` — строка без структуры. У многих раннеров `reference` отсутствует. БД-схема (`tools_versions.guideline_doi`) поддерживает структурированный DOI, но не используется в раннерах.
**Рекомендация:** перевести `reference` в объект `{ citation: string, pmid?: string, doi?: string, url?: string, year: number }` с валидацией в build-time (`scripts/validate-runners-references.mjs`).
**Усилие:** M.

### P2-3. In-memory rate-limit fallback при недоступности Upstash
**Файл:** `lib/rate-limit.ts:158-159`
**Что:** при отсутствии `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` rate-limit падает на in-memory token bucket per-isolate; на Vercel это значит ~30 req/min × N isolated functions. Уже задокументировано в коде как known-issue.
**Рекомендация:** в production обязательно держать Upstash-credentials; добавить health-check в `/api/healthz` который пингует Upstash и возвращает 503 если не отвечает.
**Усилие:** S.

### P2-4. TODO/legal заглушки
- `app/terms/page.tsx:217` — TODO §11
- `components/layout/ZetDisclaimer.tsx:13` — legal review
- `lib/consent.ts:54` — `ip_hash: null` (server-side trigger планируется)
- `app/icd10/`, `app/drugs/` — есть отметки в session-логах об open работе

**Рекомендация:** заполнить из юр.списка перед public launch.
**Усилие:** S (legal review).

### P2-5. `/api/diagnostic` — `Math.random()` для shuffle (низко-критично)
**Файл:** `app/api/diagnostic/route.ts:116, 161, 173`
**Что:** Fisher-Yates shuffle вариантов вопросов через `Math.random()`. Не security-критично (UX-рандом), уже задокументировано в комменте.
**Рекомендация:** оставить как есть, но если когда-нибудь использовать для security-токенов — `crypto.getRandomValues`.

### P2-6. `app/api/sync` — нет полей `subcategories`/`completedModules` в БД
**Файл:** `app/api/sync/route.ts:128-132`
**Что:** комментарий `(Frontend sends module ids — but we don't have a course-to-module map here without importing curriculum. Skip for now)` — модули не пишутся в `course_progress`. Open issue.
**Рекомендация:** либо импортировать curriculum-map в Edge runtime, либо добавить колонку `module_passed JSONB[]` в `course_progress`.
**Усилие:** M.

---

## P3 — мелкие наблюдения

### P3-1. Vendor-risk и план B
Все критические сервисы — US-based: Sentry (US), Vercel (US/EU edge), Upstash (US), Google Gemini API (US), Telegram (RU/Worldwide). Privacy-policy упоминает «вне РФ». В коде нет hardcoded регионов кроме `vercel.json`.
**Рекомендация:** документ `docs/PLAN_B.md` с миграционным планом (например, переезд на Hetzner+Coolify+self-host Postgres) на случай санкционных рисков. Не P2 — стратегический план.

### P3-2. `lib/runners/_dsl-runner.ts` — кастомный safe-eval, без CVE-рисков
DSL-парсер ручной, без `eval()`/`new Function()`, whitelist tokens. Это правильный подход. Минор: `evalNode` для `&&`/`||` использует JavaScript-truthiness (`l && r`), что для `0 && 1 = 0` корректно, но `0.0 && 1 = 0`, `'' && 1 = ''` (если ctx содержит строки — но контракт гарантирует numbers, так что OK). **Не требует фикса**, но стоит добавить TS-уровневое ограничение `ctx: Record<string, number>` (уже есть).

---

## Что проверено / не проверено

| Проверка | Статус | Источник |
|---|---|---|
| `tsc --noEmit` | ✅ exit 0 | прямой запуск |
| `vitest run` | ✅ 1010/1010 passed (2.6s) | прямой запуск |
| `.env.local` git-ignored | ✅ `.gitignore:34 .env*` + исключение `.env.local.example` | прямой read |
| Hardcoded secrets (regex `eyJ`, `sk_`, и т.п.) | ✅ не найдено в коде; `SUPABASE_SERVICE_ROLE_KEY` только в `app/api/account/delete/route.ts:104-109` (lazy import) | grep |
| RLS на user-таблицах | ✅ schema.sql + rls-hardening.sql + rls-hardening-2.sql | прямой read SQL |
| API routes (auth, validation, origin) | ✅ кроме `/api/sync POST` (P1-5) | прямой read 7/7 routes |
| CSP / headers | ✅ enforce-mode + nonce + report-uri | прямой read `proxy.ts`, `next.config.ts` |
| `dangerouslySetInnerHTML` | ✅ только `JSON.stringify(jsonLd)` (статика) и FOUC-style | grep |
| `eval`/`new Function` | ✅ false positives (только в комментах `_dsl-runner.ts`) | grep |
| `console.log/debug` в prod | ✅ только в `tool-time-to-result.ts:80` под `NODE_ENV !== 'production'` guard | grep + read |
| `@ts-nocheck` массово | ⚠️ 740 раннеров (P0-2) | grep |
| Серверные/клиентские компоненты | ✅ нет смешения, `await params`/`await cookies()` корректны | sample read |
| PWA / manifest / SW | ✅ NetworkOnly для `/api/*`+`/auth/*`, offline page | sample read |
| `validate-scales.mjs` | ⚠️ не запущен, опираюсь на отчёт Explore-агента (288 issues, 4 GAP) | open issue |
| `eslint --no-fix` | — нет конфига `.eslintrc*` в корне видимого; не запускал | open issue |
| `depcheck` | — не запускал (тяжёлый) | open issue |
| Дубликат `aa-grad` vs `aa-gradient` | ⚠️ требует медэксперта | P1-1 |

---

## Открытые вопросы (требуют решения автора)

1. **Дубль `aa-grad.ts` vs `aa-gradient.ts`** — какой из двух актуальный? Удалить старый или пометить deprecated?
2. **Стратегия roll-out для `// @ts-nocheck` removal** — снимать сразу со всех 740 (риск массового билд-брейка) или поэтапно по категориям (медленнее)?
3. **Запуск `validate-scales.mjs`** — мне запустить локально и приложить лог в follow-up, или у вас уже есть свежий вывод в `docs/`?
4. **Eslint** — нет ли скрытого `.eslintrc*` (project-uses-flat-config)? Если eslint планируется — стоит добавить базовый `next/core-web-vitals` preset.
5. **План Б (vendor risk)** — нужен ли `docs/PLAN_B.md`, или это решено вне репозитория?
6. **CI-гейт «новый раннер ⇒ test-файл обязателен»** — внедрять сейчас или после P1-2 (расширения покрытия до 50%+)?

---

## Quick wins (час-два работы)

1. **P0-1 GFR guard:** добавить `if (scr_mgdl <= 0) return { value: 'N/A', ... }` в 3 ключевых раннера + `Number.isFinite()`-проверка в `ToolView.tsx:213`. Защитит самый горячий патч.
2. **P1-5 sync POST origin-check:** одна строка `assertSameOrigin(req)` в начале POST в `app/api/sync/route.ts:69`.
3. **P2-3 Upstash health-check:** одна fetch-проверка в `app/api/healthz/route.ts`.
4. **P1-3 GAPS в шкалах:** запустить `npm run validate:scales`, починить 4 GAP-сегмента (поднять `max` соседнего сегмента так, чтобы `[0,1.9]` → `[0,2)` либо ввести точку 1.9 в discrete-набор).

---

## Verification plan (после применения фиксов)

```bash
# Полный регресс:
npx tsc --noEmit              # ожидание: exit 0
npx vitest run                # ожидание: 1010+ passed (новые тесты добавятся после P0-1)
npx tsx scripts/validate-scales.mjs   # ожидание: 0 GAP-issues
npx tsx scripts/smoke-runners.mjs     # ожидание: 740/740

# Граничные ручные тесты для P0-1:
# 1. Открыть /tools/ckd-epi
# 2. Ввести creatinine = 0 (через DevTools, обойдя min=10)
# 3. Ожидание: UI показывает "N/A" + текст "Введите корректный креатинин".
#    Регресс — если показано "Infinity" или "NaN".
```
