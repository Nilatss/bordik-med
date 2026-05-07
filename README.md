# Bordik Med

Medical PWA для врачей и студентов в РФ и Узбекистане. 738+ калькуляторов,
ICD-10/11 lookup, drug interactions, образовательный курс, AI-driven
diagnostic test, неонатологический справочник (Fenton growth charts +
AAP 2022 bilirubin nomogram).

## Стек

Next.js 16 (App Router) · React 19 · TypeScript 5 (strict +
noUncheckedIndexedAccess + exactOptionalPropertyTypes) · Tailwind v4 ·
Supabase (auth + RLS + Postgres) · Sentry · Vercel · Serwist (PWA / SW
caching) · valibot (input schemas) · Vitest (golden tests).

## Setup

1. `cp .env.local.example .env.local` — заполнить:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `GEMINI_API_KEY` (для AI-диагностики)
   - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (rate-limit)
   - `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
2. `npm install`
3. `npm run dev`

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Dev server (порт 3000) |
| `npm run dev:https` | Dev с self-signed HTTPS — для PWA / SW тестов |
| `npm run build` | Production build (webpack) |
| `npm run start` | Запуск собранного билда |
| `npm test` | Vitest golden-tests на медицинские калькуляторы |
| `npm run check:leaks` | Сканер на secret-leaks в client bundle |
| `npm run validate:scales` | Проверка band-определений в калькуляторах |
| `npm run validate:runners` | Smoke-проход через все 741 runner |
| `npm run analyze` | Bundle analyzer (открывает HTML отчёт) |

`prebuild` автоматически синхронизирует MediaPipe-модели и пересобирает
content/curriculum/tool-meta JSON-источники.

## Архитектура (короткий обзор)

```
app/                 — Next.js App Router (routes + RSC)
components/          — feature-grouped (course/, tools/, drugs/, icd10/, neonatal/, layout/, ...)
lib/
  runners/           — 741 калькулятор (медицинский домен, JSON-driven compute)
  schemas/           — valibot input schemas
  i18n/              — translations
  store.ts           — Zustand store (UI/profile/progress)
  log.ts, rate-limit.ts, output-guard.ts, full-logout.ts — cross-cutting
data/                — TypeScript-типизированные JSON-источники (build-time)
public/              — runtime JSON (drug-interactions, ICD банки, neonatal monographs)
supabase/            — schema.sql, content-schema.sql, rls-hardening{,-2}.sql, rpc-*.sql
scripts/             — build + import scripts (.mjs, dev-only)
tests/calculators/   — Vitest golden tests (41 калькулятор покрыт)
docs/                — security/perf/code-review audits + ADR + IR runbook
```

## Документация

- [CLAUDE.md](./CLAUDE.md) — продуктовые стандарты + memory-система для AI-ассистентов
- [docs/SECURITY_SETUP.md](./docs/SECURITY_SETUP.md) — IR runbook + manual ops setup
- [docs/security-audit-2026-05.md](./docs/security-audit-2026-05.md)
- [docs/performance-audit-2026-05.md](./docs/performance-audit-2026-05.md)
- [docs/code-review-2026-05.md](./docs/code-review-2026-05.md)
- [docs/UI_GUIDELINES.md](./docs/UI_GUIDELINES.md)
- [docs/CONTENT_ROADMAP.md](./docs/CONTENT_ROADMAP.md)

## Гайды для контрибьюторов

- **Новый калькулятор**: см. `lib/tools-runners.ts` + `scripts/build-tool-meta.mjs`. Минимум 5 golden-tests в `tests/calculators/<id>.test.ts` (CI gate).
- **Изменение схемы БД**: новый файл в `supabase/`, applied вручную через `supabase db push` или SQL editor.
- **Новый API endpoint**: использовать `withAuthedSupabase` helper из `lib/api-helpers.ts` для consistency.
- **Inline-styles запрещены** для нового кода — используй Tailwind классы. Существующие 1500+ inline-стилей мигрируются постепенно.

## Контакты

- Общие вопросы / обратная связь: `hello@bordik.app`
- Privacy / GDPR-запросы: `privacy@bordik.app`
- Security disclosures: `security@bordik.app`

## Лицензия

Proprietary. Распространение и копирование без письменного разрешения
запрещены. Медицинские формулы и константы — public domain (источники
указаны в JSDoc каждого runner'а).
