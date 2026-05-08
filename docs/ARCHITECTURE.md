# Bordik Med — Architecture Overview

> **P2-CR-13 (2026-05-08)** — single-page обзор архитектуры. Цель — дать новому
> контрибьютору достаточно контекста за 15 минут, чтобы сориентироваться,
> где что лежит и почему.

## TL;DR

Next.js 16 App Router PWA для медиков. Frontend-heavy: 740+ калькуляторов,
МКБ-10/11/CM/CA/PCS банки (~80 000 кодов суммарно), drug-interactions
(~160 000 пар), курсы + диагностический AI-тест, неонатологический
справочник. Backend: Supabase (auth + RLS + Postgres) + Cloudflare-style
Edge на Vercel.

```
Browser (PWA + IDB)
   ↕ fetch / SW cache
Next.js 16 (Vercel) — App Router routes + RSC + API
   ↕
Supabase (Postgres, RLS, Auth, Storage)
   ↕
Gemini 2.x (Google) — diagnostic AI
   ↕
Upstash Redis — rate limit + Gemini daily quota
   ↕
Sentry — errors + RUM web vitals
```

---

## 1. Directory layout

```
app/
  api/                 — route handlers (диагностический AI, sync, feedback, healthz)
  admin/               — content editor (review-flow, four-eye approval)
  auth/login/          — Supabase auth UI (email magic link)
  drugs/               — drug interactions checker
  icd10/               — ICD банки (10/11/CM/CA/PCS)
  tools/[id]/          — динамический калькулятор по ID
  privacy/, terms/     — legal pages
  releases/            — changelog + RSS
  ~offline/            — Service Worker fallback page
  layout.tsx           — корневой layout + metadata + SEO + JSON-LD
  page.tsx             — главная (catalogue + dashboard)
  sw.ts                — Serwist Service Worker (precache + runtime caches)

components/            — feature-grouped React-components
  course/              — TabbedLessonViewer, TestPanel, InlineQuiz, illustrations
  drugs/               — DrugChecker, interaction tables
  icd10/               — Icd10Lookup (виртуализованный via react-virtuoso)
  layout/              — Sidebar, MobileNavBar, Header
  neonatal/            — Fenton growth charts, AAP bilirubin nomogram
  search/              — CommandPalette (⌘K global search)
  tests/               — DiagnosticTest (16-question adaptive)
  tools/               — ToolView, ToolCard, ToolsPage
  layout/              — sidebar, header, mobile nav

lib/
  runners/             — 740+ автогенерированных tool runners (lazy-imported)
  schemas/             — valibot input schemas (server-side validation)
  i18n/                — TODO RU/UZ translations (currently RU-only)
  supabase/            — typed clients (server.ts, client.ts)
  prompts/             — Gemini system-prompts (versioned, langs)
  proctoring/          — MediaPipe face/object detection (test integrity)
  api-helpers.ts       — withAuthedSupabase, withSameOrigin, parseJsonBody
  api-errors.ts        — apiError/apiOk + ERR const map (kebab-case codes)
  origin-check.ts      — CSRF guard (origin allowlist + Sec-Fetch-Site backup)
  output-guard.ts      — XSS-defence на AI-output (parse5 + entity decode)
  rate-limit.ts        — Upstash sliding-window + in-memory fallback
  gemini-quota.ts      — daily quota counter (50k cap default)
  log.ts               — structured logging с PII redaction
  store.ts             — Zustand global store (UI/profile/progress) + persist
  database.types.ts    — hand-typed Supabase Database scaffold (P1-CR-5)

data/                  — build-time JSON (catalog meta, content, dictionaries)
public/                — runtime JSON (drug-int 2.5MB, ICD банки 3-5MB каждый)
supabase/              — schema.sql + content-schema.sql + RLS hardening
                       — apply вручную через SQL Editor / supabase db push
scripts/               — генераторы (.mjs): mediapipe-sync, content-build,
                         tool-meta-build, split-runners, validate-scales

tests/calculators/     — Vitest golden tests (~41 калькулятор покрыт сейчас,
                         цель P0-CR-2 — 30-50%)

docs/                  — audit-отчёты, IR runbook, UI guidelines, этот файл
```

---

## 2. Cross-cutting concerns

### Authentication
- Supabase magic-link → cookie session (httpOnly).
- `getSupabaseServerClient()` (server.ts) — для API routes / RSC.
- `getSupabaseBrowserClient()` (client.ts) — для client components.
- `lib/api-helpers.withAuthedSupabase` обёрнул pattern: origin guard →
  client init → user check → handler. Закрывает P1-CR-7.

### Authorization
- Все user-scoped tables (profiles, course_progress, …) защищены RLS.
- Content tables (tools, tools_versions) — review-flow с `editor_role`
  в JWT app_metadata, four-eye principle (proposer ≠ approver).
- Helper-функции SECURITY DEFINER с pinned `search_path = public, pg_temp`
  (P3-NEW-4 закрывает CVE-2018-1058).

### CSRF / SSRF
- Origin allowlist (PROD + bordik-med-* preview + localhost dev).
- Sec-Fetch-Site backup на запросы без Origin (P3-NEW-5).
- Все внешние fetch'и: `redirect: 'error'` (P2-NEW-4) — на DNS-hijack
  не последуем на 169.254.169.254 (cloud metadata).

### Rate limiting + cost control
- `lib/rate-limit.identifyAndLimit` — Upstash sliding-window, 30/мин IP,
  60/мин per-user. Fallback in-memory token bucket.
- `lib/gemini-quota.reserveGeminiQuota` — daily INCR в `gemini:quota:YYYY-MM-DD`
  с TTL 36h. Hard cap 50k req/день (configurable). Защита от runaway
  ботнета.

### Observability
- Sentry: автотрассировки (10% sample rate), error capture, RUM web vitals
  (LCP/CLS/INP/FCP/TTFB) с device tier (mobile/tablet/desktop, P3-PERF-NEW-2).
- `lib/log` — structured JSON через console.{log,warn,error}, PII-redaction
  (email/name/token/ip → [redacted]), MAX 500 chars per value.
- audit.events — application-level event log (P3-NEW-2).

### XSS hardening
- `lib/output-guard.isOutputSafe` — multi-pass entity decode + control-char
  strip + parse5 walk. Блокирует HTML-entity smuggling, SVG onload,
  javascript:/vbscript:/data:text/html, MathML.
- AI-output (Gemini bank questions, diagnostic finalize) проходит через
  guard перед serializing (P2-NEW-7).
- CSP с nonce (но `unsafe-inline` всё ещё для Tailwind-injected styles —
  P2-NEW-10 на 2-4 недели до миграции на CSS modules).

---

## 3. Performance

### Bundle size
- Runners разбиты per-file через `scripts/split-runners.mjs` → каждый
  калькулятор 5-30 KB lazy chunk.
- Supabase wrapped via `<SupabaseSyncMounter>` через `next/dynamic({ ssr: false })`
  → 45.9 KB chunk не входит в anonymous home.
- ICD банки + drug-interactions грузятся по требованию через
  `useEffect` + IDB cache (StaleWhileRevalidate в SW).

### Service Worker (Serwist)
- Precache: catalog meta, manifest, ~20 critical tool detail JSONs.
- Runtime: NetworkFirst для HTML, CacheFirst для JSON и static assets.
- Offline fallback → `/~offline` (P3-PERF-NEW-1).

### Skeleton loading
- `loading.tsx` для /admin /tools /drugs /icd10 — мгновенный paint
  на сегмент-навигации (P2-PERF-NEW-5).

### Memoization
- `TabbedLessonViewer.activeBody` — useMemo на preprocessContent
  (P1-PERF-NEW-2): em-dash + multi-pass scan не пересчитывается на
  hover/scroll/resize, только при смене tab.

---

## 4. Build pipeline

```
prebuild
├─ sync-mediapipe.mjs           → public/mediapipe/*.wasm
├─ sync-mediapipe-models.mjs    → public/mediapipe/models/
├─ build-curriculum-stats.mjs   → lib/curriculum-stats.ts
├─ build-tool-meta.mjs          → public/tool-meta.json + per-id JSONs
└─ build-content.mjs            → public/content/*.json (lessons + tests)

build
└─ next build                   → .next/ (server + static)

post-build CI gates
├─ tsc --noEmit                 → 0 TS errors
├─ vitest run                   → golden tests pass
├─ eslint --max-warnings 200    → P1-CR-1
└─ check:leaks                  → bundle scanned for secrets
```

---

## 5. Deployment

- **Production**: Vercel (https://bordik-med.vercel.app + apex bordik.app).
  Custom domain через Vercel Project Settings.
- **Preview**: per-PR на bordik-med-git-<branch>-<team>.vercel.app.
  Origin-check сужен до `bordik-med-*` префикса (P2-NEW-3).
- **Supabase**: schema-миграции применяются ВРУЧНУЮ через Dashboard →
  SQL Editor. Файлы — supabase/*.sql + supabase/p3-*.sql (idempotent
  ALTER'ы для post-deploy hardening).
- **CI** (.github/workflows/ci.yml): type-check + tests + ESLint +
  build + leak-scan на каждый push в master.

---

## 6. Что нужно знать перед изменениями

| Изменение | Где / как |
|---|---|
| Новый калькулятор | Edit lib/runners/<id>.ts (auto-gen, но source-of-truth теперь там). 5+ golden tests в tests/calculators/ обязательны. |
| Изменение API | Используй `withAuthedSupabase` / `withSameOrigin` из api-helpers. Errors через `apiError(code, status)` для consistency. |
| Изменение БД-схемы | Создай новый файл supabase/<descriptive>.sql, ОДНОЗНАЧНО idempotent (CREATE IF NOT EXISTS, ALTER ... SET). Применить вручную через SQL Editor. |
| Inline-styles | Запрещены в новом коде. Используй Tailwind или design-system tokens. Существующие 1500+ inline'ов — P1-CR-4 backlog. |
| Новый Gemini-промпт | lib/prompts/<name>.<lang>.ts с структурой { id, version, lang, content }. Не хардкодь в роуте. |
| New Supabase table | Обнови lib/database.types.ts (hand-typed). При получении SUPABASE_PROJECT_ID — мигрировать на auto-gen. |
| Тесты | `npm test` (Vitest). Golden tests на калькуляторы — в tests/calculators/<id>.test.ts. |

---

## 7. Известные технические долги

- **P0-CR-1** — 739 runners с `@ts-nocheck`. Generator не типизирует.
  Multi-week task: переписать `scripts/split-runners.mjs` чтобы он
  выдавал типизированные модули.
- **P0-CR-2** — Test coverage 5.5%. Цель 30-50%. Включает
  property-based testing для калькуляторов.
- **P1-CR-3** — 7 god-components >1200 LOC (DiagnosticTest, ToolView,
  TabbedLessonViewer, …). Нужна аккуратная декомпозиция.
- **P1-CR-4** — 1585 inline-styles. Миграция на Tailwind theme + CSS modules.
- **P1-PERF-NEW-1** — `app/page.tsx` всё ещё `'use client'` целиком.
  Server Component миграция дает ~40 KB JS reduction.
- **P2-NEW-10** — CSP `unsafe-inline` для Tailwind. Решение —
  `style-src 'nonce-...'` + миграция всех style props на CSS modules.

См. полный backlog в `docs/code-review-2026-05.md` + audit-отчёты.

---

## 8. Полезные ссылки

- [README.md](../README.md) — quick-start
- [docs/SECURITY_SETUP.md](./SECURITY_SETUP.md) — IR runbook + manual ops
- [docs/security-audit-2026-05.md](./security-audit-2026-05.md)
- [docs/performance-audit-2026-05.md](./performance-audit-2026-05.md)
- [docs/code-review-2026-05.md](./code-review-2026-05.md)
- [docs/UI_GUIDELINES.md](./UI_GUIDELINES.md) — visual design rules
- [docs/architecture/large-dataset-pattern.md](./architecture/large-dataset-pattern.md) — IDB + Worker pattern для ICD/drug-int
