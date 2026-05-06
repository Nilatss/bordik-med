# Backlog — открытые задачи

> Снимок состояния на 2026-04-28. Аудит pass 4 (`AUDIT_PASS_4_TODO.md`)
> закрыт на 27/29 находок. Этот файл — то, что остаётся после аудита.

---

## 🟡 1. Расширение coverage калькуляторов (test automation)

**Статус**: 23/531 calculator-kind прошли direct compute() golden tests.
158/160 score-kind покрыты integrity-тестом.

**Где остановились**: 948 тестов, 27 файлов, 181 unique tool под автоматизацией.
Последний commit — `2b8b56e`. Test runner: `npm test`.

**Что закрыто по доменам (calculator-kind direct)**:

| Domain | Tools |
|---|---|
| Metabolic | BMI, BSA Mosteller, WHR, HbA1c |
| Renal | Cockcroft-Gault, MDRD, CKD-EPI |
| Acid-base / Pulm | Anion Gap, A-a Gradient, 6MWT |
| ICU / Critical care | Parkland, water-deficit, CAM-ICU, Adrogué-Madias |
| Hepatology | MELD, Maddrey, APRI/FIB-4 |
| GI | Forrest, Ranson/Glasgow/HAPS |
| Paediatric | Holliday-Segar |
| Antibiotic dosing | vanco-AUC, ABW |
| Vascular | ABI |
| Burns | ABSI/Baux/Revised Baux |

**Следующие приоритеты** (high-impact, хорошо тестируются):

- **ASCVD** Pooled Cohort Equation (10-yr ASCVD risk; широко применяется в первичной профилактике)
- **4T-PPH** (postpartum hemorrhage causes — категорийный)
- **Ann Arbor** / **Cotswolds** (lymphoma staging)
- **AAA** (abdominal aortic aneurysm risk)
- **APACHE II/III/IV** (ICU mortality)
- **Atlanta 2012** (pancreatitis severity)
- **ABCDE** (skin lesion melanoma triage)
- **ALSFRS-R** (ALS function)
- **ASSIST** / **DAST** (substance use)
- **ARR** (aldosterone-renin)
- **TIMI** / **GRACE** (если ещё не прямые тесты)
- **ANC** (absolute neutrophil count for chemotherapy)
- **AKIN** / **RIFLE** / **KDIGO AKI** stage
- **CHA₂DS₂-VA / EHRA-AF** уже в integrity (нет direct semantic)

**Если хочешь продолжить**: скажи "продолжай test coverage" — я возьму следующую партию из ~5-10.

---

## 🟡 2. Manual setup (вне кода — задокументировано в SECURITY_SETUP.md)

| Task | Что нужно |
|---|---|
| **Supabase SQL миграции** | Apply `supabase/rpc-delete-user-cascade.sql` + `supabase/rls-hardening-2.sql` через Supabase SQL editor |
| **Upstash Redis** | Provision free tier на console.upstash.com → env vars `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` в Vercel **Production + Preview** (НЕ Dev) |
| **GitHub Secrets** для backup workflow | `SUPABASE_DB_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET` |
| **Sentry** | `npx @sentry/wizard@latest -i nextjs` + DSN из Sentry free tier |
| **UptimeRobot** | 3 monitors на `/`, `/api/healthz`, `/sw.js`, 5-min interval. Опционально `/api/readyz` (deep-check Upstash) с custom-header `x-readyz-token: $READYZ_TOKEN`, alert при HTTP ≥ 500 — закрыто в P2-3 |
| **`READYZ_TOKEN` env var** | Vercel **Production**: сгенерировать `openssl rand -hex 32`, прописать в Vercel и в UptimeRobot custom header. Без токена /api/readyz публично доступен — это нормально в preview/dev, но в проде он жжёт Upstash-кредиты на каждый probe |
| **CSP enforcement** | После 14 дней Report-Only с 0 violations — флипнуть header в `middleware.ts` `Content-Security-Policy-Report-Only` → `Content-Security-Policy` |

---

## 🔴 3. Vercel deploy queue

**Статус**: 19 коммитов сегодня (28-04-26) превысили 100/day Hobby квоту.

**Действие**: дождаться сброса (примерно midnight UTC, через ~1-2 часа от текущего момента) → Vercel auto-deploy подхватит master HEAD `2b8b56e` через GitHub integration. Никаких ручных действий не нужно — но если хочешь форсировать, после сброса лимита запусти `npx vercel --prod --yes` локально.

**Не задеплоено**:

19 коммитов от `c284a38` (security `/api/diagnostic`) до `2b8b56e` (test goldens). Все они **в master**, **type-check clean**, **948/948 tests pass**. Production пока показывает старую версию (`4b8523e` или раньше — последний успешный deploy сегодня утром).

---

## 🟢 4. Wishlist / nice-to-have (не из аудита)

| Task | Why |
|---|---|
| **Sentry RUM** | Связать с аудит P0-DEVOPS-1 + Vercel Speed Insights |
| **DOM-testing для Proctoring** | Proctoring компонент сейчас покрыт только TypeScript уровнем; UI-тесты на `getUserMedia` фейке имели бы смысл |
| **E2E через Playwright** | Smoke-тест diagnostic flow (15 вопросов → finalize → /modules) |
| **i18n EN/UZ** | Сейчас всё на русском; hreflang уже подготовлен для расширения |
| **DSL runner snapshot tests** | `_dsl-runner.ts` парсит `when_expr` строки; golden tests на eval'ed выражения |

---

## 🔵 5. Сознательно пропущенные (документировано)

| Item | Причина |
|---|---|
| `__Host-` cookie prefix | Renaming Supabase auth-token cookie сломает все живые sessions |
| `eslint-plugin-jsx-a11y` без baseline | Нет существующего eslint flat config — full setup инвазивен |
| `apple-touch-startup-image` full set | Требует pwa-asset-generator pipeline и ~50 PNG в репо |
| LQTS / START в score-bands-integrity | LQTS использует .5 increments; START — category classifier с overlapping bands by design |
| `score2` direct test | ESC 2021 уравнение со специфичными regional recalibration tables — слишком brittle для unit-теста |

---

## 📊 Текущий счёт

- **Audit pass 4**: 27/29 closed (93%)
- **Test coverage**: 948 tests, 181 unique tools, 27 test files
- **Type-check**: clean (`strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes`)
- **Master HEAD**: `2b8b56e`
- **Production**: HEAD ~`4b8523e` (deploy queue, ratelimit'ed)

Last update: 2026-04-28 21:55 UTC.
