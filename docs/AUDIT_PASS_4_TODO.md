# Аудит-итерация 4 — TODO

> Источник: `compass_artifact_wf-59796ba3.md` (29 проблем, 7 направлений).
> Сверено с реальным кодом репо HEAD `5fc04af` от 2026-04-28.

Легенда: ✅ готово · 🟡 частично · ❌ не сделано.

---

## Sprint 0 — все P0 (1 неделя)

### P0-SEC-1 ❌ — GEMINI_API_KEY в query string
**Где**: `app/api/diagnostic/route.ts:130` — `?key=${KEY}` в URL.
**Риск**: ключ попадает в Vercel access logs, в `console.error` upstream-исключений, в Sentry breadcrumbs.
**Фикс**: убрать `?key=` из URL, добавить `x-goog-api-key: ${KEY}` в headers.
**LOC**: 5 строк.

### P0-SEC-2 ❌ — Cascaded fallback не помещается в 10s function timeout
**Где**: `app/api/diagnostic/route.ts:128-163` — последовательно 4 модели без AbortController.
**Риск**: 4 × 3-5s = 12-20s → гарантированный 504 на Hobby при первой деградации модели.
**Фикс**: per-model AbortController (`PER_MODEL_BUDGET_MS = 2500`), total budget 8.5s.
**LOC**: 15 строк.

### P0-SEC-3 ❌ — In-memory rate-limit бесполезен на Vercel
**Где**: `lib/rate-limit.ts` (весь файл).
**Риск**: лимит 30/min × N изолятов ≈ 150-300/min фактически. На Gemini это **деньги в Google Cloud Billing**.
**Фикс**: заменить на `@upstash/ratelimit` sliding window. Free tier 10K commands/day хватит.
**Зависимость**: завести Upstash Redis (free), env vars `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

### P0-SEC-4 ❌ — `/api/account/delete` non-atomic
**Где**: `app/api/account/delete/route.ts:71-91` — `for…of` без транзакции.
**Риск**: partial-deletion → пользователь в полу-удалённом состоянии, по закону «удалено».
**Фикс**: Postgres RPC `delete_user_cascade(target_user_id uuid) SECURITY DEFINER` с `BEGIN;…COMMIT;`. Route handler делает `rpc('delete_user_cascade')` + потом `admin.deleteUser`.
**LOC**: 30 строк SQL + рефакторинг ~20 строк route.

### P0-SEC-5 ❌ — Output guard regex однопроходный
**Где**: `app/api/diagnostic/route.ts:226-228` — `FORBIDDEN_OUTPUT` regex над сырым text.
**Риск**: HTML-entity smuggling (`&#x6A;avascript:`, `jav&#x09;ascript:`), SVG `onload`, MathML.
**Фикс**: `lib/output-guard.ts` с DOMParser/parse5 + multi-pass entity decode + tag-walk. Schema из приложения C аудита.
**LOC**: ~70 строк новый модуль + замена в route.

### P0-CQ-1 ❌ — Нет golden-tests на calc compute()
**Где**: нет `tests/` директории, нет vitest/jest.
**Риск**: KRITICHESKY — для медицинских калькуляторов цена ошибки = жизнь. Один багфикс Wells DVT formula → wrong DVT prediction.
**Фикс**: vitest + golden snapshots на 20 CRITICAL_TOOL_IDS (BMI, Wells, CHA₂DS₂-VASc, GCS, APGAR…), минимум 5 cases per band per calc. CI gate: PR не мержится без 100% coverage compute().
**LOC**: ~500 строк тестов + 20 строк CI.

### P0-DEVOPS-1 ❌ — Нет RUM / Sentry / Uptime
**Где**: production blind.
**Фикс пакетный**:
1. `npx @sentry/wizard@latest -i nextjs` + DSN из Sentry free tier.
2. `npm i @vercel/speed-insights` + `<SpeedInsights />` в layout.
3. UptimeRobot free, 3 monitors: `/`, `/api/healthz`, `/sw.js`, 5-min interval.
4. Создать `app/api/healthz/route.ts` (edge runtime, no upstream pings).
5. Создать `app/global-error.tsx` с `Sentry.captureException`.

---

## Sprint 1 — P1 (2 недели)

### P1-SEC-1 🟡 — CSP миграция Report-Only → Enforce
**Что есть**: `middleware.ts` уже выставляет CSP с nonce в `Report-Only`.
**Чего нет**:
1. ❌ `app/api/csp-report/route.ts` — endpoint для агрегации violations.
2. ❌ `Reporting-Endpoints` header.
3. ❌ Sentry hook на `/api/csp-report` (после интеграции Sentry).
4. ❌ Через 14 дней с 0 violations — флипнуть `Content-Security-Policy-Report-Only` → `Content-Security-Policy`.

### P1-SEC-2 ❌ — SRI отсутствует на CDN
**Где**: MediaPipe грузится с `cdn.jsdelivr.net` без `integrity=`.
**Риск**: jsdelivr compromise → injection в WASM.
**Фикс**:
1. Self-host model в `/public/mediapipe/{vision_wasm_internal.wasm,.js}` через `npm i @mediapipe/tasks-vision` + copy на postinstall.
2. `scripts/pin-mediapipe.mjs` генерирует `integrity.json` с sha384.
3. Component MediaPipe loader читает manifest и ставит `integrity=` атрибут.

### P1-SEC-3 ❌ — RLS leak `versions readable USING (true)`
**Где**: `supabase/content-schema.sql:202-203` (изначальная политика; в `rls-hardening.sql` тоже сохранена).
**Риск**: anon видит payload jsonb всех версий, включая internal_notes / reviewer_comments.
**Фикс**: миграция `supabase/migrations/0004_versions_scoped.sql` — переписать политику на `WHERE EXISTS (… status='published')` + создать VIEW `tools_versions_public` с `payload - 'internal_notes' - 'reviewer_comments'`.

### P1-SEC-4 ❌ — WITH CHECK на UPDATE editorial недостаточно строгий
**Где**: `supabase/rls-hardening.sql` — `ccr update by reviewer or proposer`.
**Риск**: можно через UPDATE сменить `proposed_by`/`approved_by` на чужой uid → обход 4-eye.
**Фикс**: `WITH CHECK` явно фиксирует:
- `proposed_by` неизменяем (`= (SELECT proposed_by FROM ... WHERE id = ...)`),
- `approved_by` ставит только reviewer/admin **и не равен** `proposed_by` (4-eye).

### P1-SEC-5 ❌ — `editor_role_of()` без STABLE
**Где**: `supabase/content-schema.sql:181-183`.
**Риск**: initPlan-кеш не сработает в OR-ветке политик → функция вызывается per-row.
**Фикс**: `ALTER FUNCTION editor_role_of(uuid) STABLE;` (читает из `auth.jwt()` — IMMUTABLE на самом деле, но STABLE безопаснее).

### P1-SEC-6 ❌ — supa_audit RLS на SELECT
**Где**: `supabase/content-schema.sql:170` — REVOKE есть только на UPDATE/DELETE.
**Риск**: editor видит **все** изменения других editor'ов; auditor — оставлено целью, но anon SELECT?
**Фикс**: `ALTER TABLE audit.record_version ENABLE ROW LEVEL SECURITY; REVOKE SELECT FROM anon, authenticated; GRANT SELECT TO service_role;` + создать VIEW `audit.my_changes` для editor self-history.

### P1-SEC-7 ❌ — `correctIndex` bounds vs `options.length`
**Где**: `app/api/diagnostic/route.ts:284` — `q.correctIndex < 0 || q.correctIndex > 3`.
**Риск**: hardcoded 3, не проверяет `< q.options.length`. Сейчас по input-Schema `options.length === 4`, но output Gemini может вернуть и 5 (если в prompt'е попросить).
**Фикс**: `if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length)`.

### P1-SEC-8 ❌ — SW kill-switch
**Где**: `app/sw.ts:168-172` — есть только `SKIP_WAITING`.
**Фикс**: добавить `FORCE_UPDATE_AND_RELOAD` message handler + создать `/admin/sw-kill` страницу с broadcasting.

### P1-SEC-9 ❌ — BFCacheGuard race vs Supabase session restore
**Где**: `components/BFCacheGuard.tsx` — синхронно reload на `event.persisted`.
**Риск**: если session expired во время bfcache, zustand-state думает что user logged-in → race с следующим API call.
**Фикс**: synchronously check `document.cookie` на `sb-…-auth-token`; если zustand has user, но cookie пустой → reload. Спецификация в lib/full-logout уже есть, перенести pattern.

### P1-SEC-10 ❌ — Account enumeration на /signup (constant-time)
**Где**: Supabase Auth /signup default behavior.
**Фикс**: либо custom SMTP (Resend) c унифицированным response, либо artificial constant-time delay 600ms.

### P1-DEVOPS-1 ❌ — Vercel Speed Insights
**Где**: нет `@vercel/speed-insights`.
**Фикс**: 1 строка `<SpeedInsights />` в `app/layout.tsx`.

### P1-DEVOPS-2 ❌ — Cost monitoring & alerts
**Где**: нет alert'ов.
**Фикс**: см. `docs/SECURITY_SETUP.md` §2.4 — настроить вручную в Vercel + Google Cloud + Supabase dashboards.

### P1-DEVOPS-3 ❌ — Weekly pg_dump → R2
**Где**: нет `.github/workflows/backup-supabase.yml`.
**Фикс**: workflow из приложения G аудита (cron `0 3 * * 0`, supabase CLI dump → R2 с object-lock).

### P1-DEVOPS-4 ❌ — Disaster recovery runbook (actionable)
**Где**: `docs/SECURITY_SETUP.md` уже описывает scenarios, но не пошаговые команды.
**Фикс**: добавить секцию «Recovery commands» с конкретным `gh`/`vercel`/`supabase` CLI инструкциями для: vercel-down, supabase-down, gh-compromised, gemini-quota-exhausted.

### P1-CQ-1 🟡 — Strict TypeScript flags (in progress)
**Где**: `tsconfig.json` имеет только `strict: true`.
**Прогресс**: создан `tsconfig.strict.json` с `noUncheckedIndexedAccess: true`. Запуск: `npx tsc --noEmit -p tsconfig.strict.json`.

| Snapshot | Errors |
|---|---|
| Initial (2026-04-28) | 270 |
| After admin/page.tsx + EmojiOrFlag.tsx + lib/quiz.ts | 255 |

**Migration plan**: модули по одному; когда strict вернёт 0 — promote `noUncheckedIndexedAccess` в основной `tsconfig.json` и удалить strict-конфиг.

### P1-CQ-2 ❌ — Pino structured logging + PII redact
**Где**: голый `console.log` / `console.error` повсюду.
**Фикс**: `lib/log.ts` с pino + redact `['email','*.email','name','*.name','ip','*.ip','userId','*.userId','access_token','*.access_token','refresh_token','authorization']`.

### P1-CQ-3 ❌ — `error.tsx` coverage
**Где**: нет ни одного `error.tsx`/`global-error.tsx`.
**Фикс**: `app/error.tsx`, `app/global-error.tsx` (с `Sentry.captureException`), `app/admin/error.tsx`, `app/course/error.tsx`, `app/tools/error.tsx`.

### P1-A11Y-1 ❌ — `prefers-reduced-motion` gate
**Фикс**: обернуть root в `<MotionConfig reducedMotion="user">` из framer-motion.

### P1-A11Y-2 ❌ — Прокторинг accessibility fallback
**Фикс**: добавить «не могу использовать камеру» кнопку → `examiner-supervised` режим с proctor-кодом (использует уже существующую 4-eye инфраструктуру).

### P1-A11Y-3 ❌ — Severity color-coding не только цветом
**Где**: bands в калькуляторах (low/moderate/high/critical).
**Фикс**: добавить иконку/label на каждую severity (WCAG 1.4.1).

### P1-A11Y-4 ❌ — Markdown heading hierarchy lint
**Фикс**: `rehype-lint-heading-increment` plugin в pipeline ReactMarkdown.

### P1-UX-1, P1-UX-2, P1-UX-3 ❌ — `lib/full-logout.ts` race fixes
**Фиксы**:
- IDB Safari fallback: known-DBs allowlist (`localforage`, `serwist-precache-v1`, `serwist-runtime-v1`, `castar-biometric`, `ironmed-offline-queue`).
- Шаг 6: `await controllerchange` event с 2s safety timeout перед reload.
- Шаг 1 offline: на fail регистрировать `sync.register('logout-retry')` для retry на online.

### P1-UX-4 ❌ — Custom install-prompt UX
**Фикс**: `components/InstallPrompt.tsx` с `beforeinstallprompt` deferring; кнопка «Установить» появляется после первого пройденного теста/урока.

### P1-PERF-1 ❌ — Adaptive Serwist timeout
**Фикс**: в `app/sw.ts` — `navigationTimeout()` функция читает `navigator.connection.effectiveType` (slow-2g/2g → 12s, 3g → 6s, иначе 3s).

### P1-PERF-2 ❌ — MediaPipe lazy import
**Где**: проверить `components/course/Proctoring.tsx` — должен быть `dynamic({ ssr: false })`.

### P1-PERF-3 ❌ — fra1 single-region для UZ rural
**Фикс**: либо переход на Pro для multi-region, либо CloudFlare CDN перед Vercel для статики.

### P1-SEO-1 ❌ — `app/sitemap.ts`
**Фикс**: динамический sitemap с tools + courses URLs.

### P1-SEO-2 ❌ — `app/robots.ts`
**Фикс**: Disallow `/admin/`, `/account/`, `/api/`, `/auth/`; sitemap link.

### P1-SEO-3 ❌ — JSON-LD `MedicalScale` per-tool
**Фикс**: `<script type="application/ld+json" nonce={…}>` в `app/tools/[slug]/page.tsx` со схемой MedicalScale + relevantSpecialty + url.

### P1-SEO-4 ❌ — `app/layout.tsx` `metadataBase` + per-route `robots: { index: false }`
**Фикс**: `metadataBase: new URL(...)` в layout; для `/admin/*` `/account/*` `/auth/*` — `robots: { index: false }`.

---

## Sprint 2 — P2 (1 месяц)

### P2-SEC-1 — `safeUrlTransform` whitelist
✅ корректен.

### P2-SEC-2 ❌ — `check-bundle-leaks` дополнительные паттерны
**Фикс**: добавить grep на:
- `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_AUTH_TOKEN`
- `TURNSTILE_SECRET`
- `RESEND_API_KEY`
- `sb_publishable_`, `sb_secret_`
- `POSTGRES_(?:URL|PASSWORD)`
- hardcoded literals: `process\.env\..*=.*['"][A-Za-z0-9_-]{20,}`

### P2-SEC-3 ❌ — security.txt expiry calendar reminder (на 2027-01-28)
**Фикс**: GitHub issue + календарь.

### P2-SEC-4 ❌ — Origin check на POST endpoints
**Фикс**: helper `assertSameOrigin(req)` для `/api/diagnostic`, `/api/account/delete`, любых других POST. Allowlist: prod URL + preview pattern.

### P2-SEC-5 ❌ — `__Host-` cookie prefix
**Фикс**: `createServerClient({ cookieOptions: { name: '__Host-sb-…', secure: true, sameSite: 'lax', path: '/' } })`.

### P2-PERF-1 ❌ — `rehype-highlight` whitelist languages
**Где**: импортирует все 600 KB hljs registry.
**Фикс**: импорт из `rehype-highlight/lib/common` + явный whitelist `['typescript','javascript','json','sql','bash']`.

### P2-PERF-2 ❌ — framer-motion → CSS `@starting-style`
**Где**: простые fade/slide.
**Фикс**: убирает ~80 KB из bundle на простых анимациях.

### P2-PERF-3 ❌ — `<link rel="preconnect">`
**Где**: `app/layout.tsx`.
**Фикс**: preconnect на `*.supabase.co` + `generativelanguage.googleapis.com`. Экономит 100-300ms TLS handshake.

### P2-PERF-4 ❌ — middleware skip на router-prefetch
**Где**: prefetch-only пути не должны генерить новый nonce.
**Уже частично**: matcher в middleware.ts уже есть `missing: [{ key: 'next-router-prefetch' }]`. ✅

### P2-PERF-5 ❌ — Tools icons → SVG-sprite + AVIF thumbnails
**Где**: 700 PNG близко к 50MB iOS quota.

### P2-A11Y-1 ❌ — Touch target 24×24 (WCAG 2.2 AA)
**Где**: иконки tabs, прокторинг controls, mobile sidebar.
**Фикс**: visual audit + size adjustments.

### P2-A11Y-2 ❌ — `aria-live="polite"` для toast и diagnostic streaming
### P2-A11Y-3 ❌ — Skip link
### P2-A11Y-4 ❌ — Контраст dark theme audit (axe-core)

### P2-SEO-1 ❌ — `app/opengraph-image.tsx` per-tool через `next/og`
### P2-SEO-2 ❌ — hreflang RU/UZ
### P2-SEO-3 ❌ — `BreadcrumbList` JSON-LD

### P2-UX-1 ❌ — `100vh` → `100dvh`
### P2-UX-2 ❌ — apple-touch-startup-image full set
### P2-UX-3 ❌ — Web Share API для шаринга курсов

### P2-CQ-1 ❌ — Pre-commit hook (lefthook): `tsc --noEmit && eslint && check-bundle-leaks`
### P2-CQ-2 ❌ — `npm dedupe` cron в Dependabot
### P2-CQ-3 ❌ — `eslint-plugin-jsx-a11y`

### P2-DEVOPS-1 ❌ — Staging Supabase project отдельно от prod
### P2-DEVOPS-2 ❌ — Feature flags (Vercel Edge Config)

---

## Backlog — P3

- Web Share API
- apple-touch-startup-image full set
- Telemetry на calc-usage для приоритизации precache
- Migration on Supabase Pro + branched DB для staging
- Vercel WAF / Trusted IPs (Enterprise)

---

## Гипотезы владельца — статус

| Код | Гипотеза | Вердикт аудита |
|---|---|---|
| А | nonce flow в SSR | Частично подтверждена (PPR + nonce несовместимы) |
| Б | fullLogout race conditions | Подтверждена (Safari IDB, controllerchange, offline signOut) |
| В | Output guard regex однопроходный | Подтверждена (HTML entity smuggling) |
| Г | RLS edge cases | Частично подтверждена (versions leak, editor_role_of не STABLE) |
| Д | Serwist /api/* path-traversal | Опровергнута |
| Е | Token-bucket bypass через XFF | Подтверждена с нюансом (использовать `x-vercel-forwarded-for`) |
| Ж | GEMINI_API_KEY в query string | Подтверждена полностью |

---

## Что уже сделано (для контекста, НЕ переделывать)

| Категория | Готово |
|---|---|
| Headers | ✅ HSTS, COOP/COEP/CORP, Permissions-Policy, X-Frame DENY |
| CSP | 🟡 nonce per-request, но ещё в Report-Only |
| RLS | 🟡 cached `(select auth.uid())`, `to authenticated`, `with check` — но видим P1-SEC-3/4/5 |
| Validation | 🟡 Valibot input/output — но output guard regex слабый (P0-SEC-5) |
| Markdown sanitize | ✅ rehype-sanitize на всех ReactMarkdown |
| Rate limit | 🟡 in-memory token bucket — заменить на Upstash (P0-SEC-3) |
| GDPR | 🟡 /privacy, /terms, /api/account/delete — последний non-atomic (P0-SEC-4) |
| Service Worker | ✅ NetworkOnly /api/* /auth/* /account/*; toast-driven update |
| fullLogout | 🟡 7-step есть, но Safari IDB + controllerchange + offline retry (P1-UX-1/2/3) |
| Persist | ✅ Zustand v3 defensive migrate с type-guards |
| Storage banner | ✅ informational (no ad cookies) |
| Supply chain | 🟡 Dependabot + check-bundle-leaks; но без новых паттернов (P2-SEC-2) |
| security.txt | ✅ RFC 9116 |
| docs | ✅ SECURITY_SETUP.md (IR runbook + manual setup) |

---

## Приоритизация для следующего sprint'а

**Топ-5 на «прямо сейчас» (1 день каждый):**

1. **P0-SEC-1** GEMINI_API_KEY → header (5 строк, мгновенный win)
2. **P0-SEC-2** Per-model AbortController (15 строк, защищает от 504)
3. **P1-SEO-1+2+4** sitemap.ts + robots.ts + metadataBase (40 строк, SEO uplift)
4. **P1-DEVOPS-1** Vercel Speed Insights (1 строка, RUM)
5. **P0-DEVOPS-1** Sentry wizard (1 команда, observability)

**Топ-3 «в течение недели»:**

6. **P0-CQ-1** Golden tests на CRITICAL_TOOL_IDS (медицинская критичность)
7. **P0-SEC-3** Upstash Ratelimit (стоит реальных денег на Gemini)
8. **P0-SEC-4** Postgres RPC delete_user_cascade (GDPR compliance)

**Топ-3 «в течение sprint'а»:**

9. **P0-SEC-5** DOMParser output guard
10. **P1-SEC-3+4+5+6** RLS полный hardening pass
11. **P1-UX-1/2/3** fullLogout fixes
