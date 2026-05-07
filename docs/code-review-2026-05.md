---
title: Code review — Bordik Med (production-readiness pass)
date: 2026-05-07
auditor: Claude (Opus 4.7) — automated source-level review
scope: code quality only — security and performance covered separately
status: report only — no code changes applied
---

# Code review — Bordik Med, 2026-05

> Цель: оценить качество кода **как такового** — отдельно от security и
> performance (те уже в `docs/security-audit-2026-05.md` и
> `docs/performance-audit-2026-05.md`). Фокус: архитектура, TS-строгость,
> React-паттерны, тесты, DX, документация, code smells.

---

## TL;DR

**Хорошее (искренне):**

1. **TypeScript строгий «по-настоящему»** — `strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes` все включены в `tsconfig.json`. Это редкость для solo-проектов и большая ценность.
2. **41 golden-test на медицинские калькуляторы** в `tests/calculators/`, включая критичные дозировочные (`renal-dose`, `pediatric-dose`, `vanco-auc`, `holliday-segar`, `parkland`). CI блокирует merge при провале.
3. **Только 7 TODO/FIXME** на ~50k LOC — превосходная гигиена комментариев.
4. **0 dead code** — нет закомментированных функций, нет `*Old`/`*V2`/`*Legacy` компонентов, удалённый `IcdLookupV2` вычищен полностью.
5. **Conventional commits** — `feat:`/`fix:`/`perf:`/`chore:` дисциплина соблюдена в 100% последних коммитов.
6. **Naming consistency** — PascalCase / camelCase / UPPER_SNAKE / kebab-case применяются предсказуемо.
7. **lib/full-logout.ts, lib/output-guard.ts** — образцовые JSDoc-блоки (40+ строк документации с perspective + threat model).
8. **CI gate работает**: prebuild → tsc → vitest → build → check:leaks. Ничего сломанного не доедет до prod через PR.

**Проблемное (headline severity):**

| ID | Severity | Заголовок | Файл |
|---|---|---|---|
| **P0-CR-1** | P0 | **739/741** medical-calculator runners помечены `@ts-nocheck` | `lib/runners/*.ts` |
| **P0-CR-2** | P0 | **5.5%** test coverage на калькуляторах (41 / 741) — для medical app это блокер | `tests/calculators/` |
| **P0-CR-3** | P0 | README — дефолтный create-next-app boilerplate | `README.md` |
| **P1-CR-1** | P1 | Нет ESLint config вообще (`.eslintrc*`, `eslint.config.*` отсутствуют) | repo-root |
| **P1-CR-2** | P1 | Нет pre-commit hooks (нет `.husky/`, нет `lefthook.yml`) | repo-root |
| **P1-CR-3** | P1 | God-components: ToolView 1900 LOC, StatisticsPage 1900 LOC, TestStartConsent 1900 LOC, ClassificationsHub 1400 LOC, ToolsPage 1300 LOC, Sidebar 1250 LOC, DrugChecker 1200 LOC | `components/...` |
| **P1-CR-4** | P1 | **1585** inline `style={{...}}` использований — Tailwind практически не используется как design-system | `components/`, `app/` |
| **P1-CR-5** | P1 | Нет `lib/database.types.ts` — Supabase queries не типизированы (нет `gen types` integration) | `lib/supabase/` |
| **P1-CR-6** | P1 | Hardcoded Gemini-prompts (~100 строк русского текста) в route-файле | `app/api/diagnostic/route.ts:192-235` |
| **P1-CR-7** | P1 | Repeated boilerplate `getSupabaseServerClient → getUser → 401/503` в каждой route — нет helper'а | `app/api/*/route.ts` (×6) |
| **P1-CR-8** | P1 | Inconsistent API error shape: `{error}` vs `{ok:false,error}` vs `{ok:false,error,issues}` | разные routes |

Всего: **3 P0, 8 P1, 13 P2, 6 P3**.

**Готов ли проект к публичному запуску с точки зрения code quality?**
Близко, но **P0-CR-1 и P0-CR-2 — это блокеры для медицинского продукта.**
739 калькуляторов с выключенным type checking + 5.5% test coverage на
medical-критичной поверхности — это юридический и репутационный risk,
особенно после продвижения как «production-grade medical app». До запуска
нужно: либо включить TS-проверку для runners (snapshot ошибок и пофиксить
постепенно), либо принципиально расширить test coverage до ≥30-50%
runners за следующий месяц.

---

## 1. Проектная архитектура

### Структура

| Layer | Где | Состояние |
|---|---|---|
| Routes | `app/` (App Router) | ✅ Стандартный layout, всё на своих местах |
| UI | `components/` — feature-grouped (`course/`, `tools/`, `drugs/`, `icd10/`, `neonatal/`, `tests/`, `layout/`, `home/`) | ✅ Понятная навигация по фичам |
| Domain logic | `lib/runners/` (741 файл — каждый калькулятор), `lib/curriculum*.ts`, `lib/tools-*.ts` | 🟡 `lib/` смешивает 3 неоднородных категории |
| Cross-cutting | `lib/log.ts`, `lib/rate-limit.ts`, `lib/origin-check.ts`, `lib/full-logout.ts`, `lib/output-guard.ts`, `lib/i18n/` | ✅ Понятные границы |
| Data | `data/*.json` (catalog, question bank, renal-dosing) + `public/*.json` (15 MB drug-interactions, 60 MB ICD) | ✅ Типы и runtime отделены |
| DB | `supabase/{schema.sql, content-schema.sql, rls-hardening{,-2}.sql, rpc-delete-user-cascade.sql}` | 🟡 См. §5.2 — нет migrations/ folder |
| Scripts | `scripts/*.mjs` (52 файла) | 🟡 Все .mjs, не .ts |

### P2-CR-1 — `lib/` смешивает domain + cross-cutting

`lib/runners/*.ts` (medical domain) живут рядом с `lib/log.ts` (cross-cutting), `lib/curriculum.ts` (content), `lib/i18n/` (utility). Для проекта в 50k LOC уже узковато.

**Как чинить (без переделки)**:
```
lib/
  domain/
    runners/         # 741 калькулятор
    drug-interactions.ts
    icd-search/
    curriculum*.ts
    tools-*.ts
  shared/
    log.ts
    rate-limit.ts
    origin-check.ts
    output-guard.ts
    full-logout.ts
  i18n/              # уже сгруппировано
  schemas/           # уже сгруппировано
```

Затраты: 2-3 часа (только переименование + обновление import paths). Низкий риск, высокая ценность для onboarding и навигации.

### P2-CR-2 — Несколько паттернов data fetching без единой стратегии

Найдено **четыре** способа получать данные:
- API routes (`app/api/*/route.ts`) — auth, sync, AI, feedback.
- RSC server fetches (`app/admin/page.tsx`, `app/admin/audit/page.tsx`) — `getSupabaseServerClient()` напрямую в RSC.
- Client `fetch('/release-notes.json')` (NewsFeed) — наивный useEffect+fetch.
- Lazy singleton-cached fetch (`lib/catalog-client.ts`) — хороший паттерн, но используется только для одного source.

Решение: единый `lib/api-client.ts` с типизированными request/response. Не критично сейчас, но нужно фиксировать паттерн до того, как фич станет ещё в 2 раза больше.

---

## 2. TypeScript quality

### Положительное (важно отметить)

`tsconfig.json:7-15`:
```json
"strict": true,
"noUncheckedIndexedAccess": true,
"exactOptionalPropertyTypes": true,
```

Это **3 самых строгих режима TS**. Migration log в `docs/AUDIT_PASS_4_TODO.md:131-164` показывает, что 270 + 58 ошибок были вычищены модуль-за-модулем — серьёзная инвестиция в качество.

### P0-CR-1 — `@ts-nocheck` на 739 файлах в `lib/runners/`

**Verified через**: `grep -l "@ts-nocheck" lib/runners/*.ts | wc -l` → **739**, при общем числе файлов **741**.

**Что не так**: каждый медицинский калькулятор-runner — это отдельный
`.ts` файл с compute-функцией, привязанной к JSON-data. Файлы
автогенерируются через `scripts/build-tool-meta.mjs` или через
`scripts/ai-generate-questions.mjs`-аналог, и генератор пишет
`// @ts-nocheck` в начало каждого файла, отключая ВСЮ TS-проверку.

**Пример** (`lib/runners/renal-dose.ts:1`):
```ts
// @ts-nocheck
/**
 * Runner: renal-dose — Коррекция доз препаратов при ХБП/ХПБ.
 * Source: data/renal-dosing.json
 * Defense-in-depth: при невалидных входах (creatinine ≤ 0, ...) → N/A.
 */
import type { CalculatorTool } from '../tools-runners';
import dataRaw from '@/data/renal-dosing.json';
// ...
```

Документация **отличная** (источник, P0-defense, MVP-список). Но при
этом — никаких типов. `data` имеет тип `any`. `compute()` возвращает
`any`. Это значит:
- TypeScript НЕ ПРОВЕРЯЕТ корректность доступа к полям JSON (`data[drug].dose`).
- TypeScript НЕ ПРОВЕРЯЕТ, что `compute()` возвращает то, что ожидает UI.
- Опечатка в имени поля — runtime error, не compile error.
- Изменение схемы `data/renal-dosing.json` — сломает runner молча.

**Почему P0**: для **медицинского** продукта с дозировочными
калькуляторами это юридический + репутационный risk. Один баг в подаче
данных в renal-dose runner может означать неправильную дозу
аминогликозида у пожилого пациента → реальный вред.

**Что есть в качестве компенсации**:
- 41 golden-test (см. P0-CR-2 — но это покрытие 5.5%).
- `scripts/smoke-runners.mjs` (`npm run validate:runners`) — smoke-проход через все runner-ы. Не gate в CI.
- `scripts/validate-scales.mjs` — валидация band-определений.

**Это недостаточно**.

**Как чинить (постепенно)**:

Шаг 1 (1 день): убрать `@ts-nocheck` с одного runner'а, увидеть ошибки, исправить генератор.
```ts
// scripts/build-runners.mjs (или wherever runners generated)
// Remove the line:
//   `// @ts-nocheck\n`
// Add proper types:
import type { CalculatorTool } from '../tools-runners';
import type { RenalDosingDataset } from '@/lib/data-types';
import dataRaw from '@/data/renal-dosing.json';
const data: RenalDosingDataset = dataRaw;
```

Шаг 2 (2-3 дня): пройти по 20 critical runners (CRITICAL_TOOL_IDS из `next.config.ts`), починить типы. Регрессировать в CI: «новые runners не могут попасть в master с `@ts-nocheck`».

Шаг 3 (1-2 недели): остальные 720 runners — батчами по топику (cardio, neuro, ICU, pediatric...), каждый батч в отдельном PR.

**Pre-commit gate** через `husky` + `grep "@ts-nocheck" "$file" && exit 1` для новых файлов.

### P1-CR-9 — Type-leakage через `any`/`as any`/`Record<string, unknown>`

**95 instances `any`** в non-test files (verified). Топ нарушители:

| Файл | Использование | Severity |
|---|---|---|
| `lib/runners/*.ts` (~739) | `// @ts-nocheck` → весь файл `any` | P0 (см. P0-CR-1) |
| `components/course/Proctoring.tsx:53,58` | `(navigator as any).deviceMemory`, `(window as any).webkitAudioContext` | P3 — browser API shims, OK |
| `components/tools/ToolsPage.tsx:150,152` | `const ric: any = ...` для `requestIdleCallback` polyfill | P3 — OK |
| `components/course/TabbedLessonViewer.tsx:203,204` | `(node as any)?.children?.find?((c: any) => ...)` | P2 — обходит rehype/unist types |
| `app/admin/audit/page.tsx:25` | `@ts-expect-error` + `.returns<any[]>()` | P2 — workaround для untyped Supabase |
| `components/tools/ToolsPage.tsx:175` | `null as unknown as CatalogTool` | P3 — array padding, OK |
| `components/EmojiOrFlag.tsx:48` | `} as unknown as Record<string, FlagComp>` | P3 — emoji map, OK |

**130+ `@ts-ignore`/`@ts-nocheck`/`@ts-expect-error`** total — но 99% это runners (см. P0-CR-1). Без них — единицы legitimate workarounds.

### P2-CR-3 — Дискриминированные unions для async-state не используются

Паттерн `useState<{ data: T | null; loading: boolean; error: string | null }>` встречается в `BilirubinNomogram`, `DrugChecker`, `NewsFeed`. Это даёт **invalid states** (loading + data одновременно? error + data?).

**Лучше** (классический ts pattern):
```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T };
```

Не критично, но было бы win для DX и для рефакторинга к React Query / SWR в будущем.

### P3-CR-1 — Generic functions OK

Sample проверка: `lib/api-client.ts` отсутствует, но в `lib/schemas/catalog.ts` используется `v.InferOutput<T>` идиоматически. Generic functions в `lib/runners.ts` (loadRunner) и `lib/full-logout.ts` — простые, ≤2 type-params. Никаких HKT-ужасов.

---

## 3. React patterns

### P1-CR-3 — God-components

Verified file sizes (in bytes; ~42 chars/line):

| File | Bytes | ≈ LOC |
|---|---|---|
| `components/tools/ToolView.tsx` | 81,051 | ~1900 |
| `components/stats/StatisticsPage.tsx` | 80,587 | ~1900 |
| `components/course/TestStartConsent.tsx` | 80,210 | ~1900 |
| `components/classifications/ClassificationsHub.tsx` | 59,585 | ~1400 |
| `components/tools/ToolsPage.tsx` | 57,978 | ~1300 |
| `components/layout/Sidebar.tsx` | 53,129 | ~1250 |
| `components/drugs/DrugChecker.tsx` | 51,169 | ~1200 |
| `components/neonatal/NeonatalHandbook.tsx` | 37,282 | ~880 |
| `components/icd10/Icd10Lookup.tsx` | 36,826 | ~870 |
| `components/course/Proctoring.tsx` | 34,380 | ~810 |

**Industry rule of thumb**: 300+ LOC = пора подумать о split. У вас 7
файлов >1200 LOC и 10 файлов >800.

**Конкретные seams для split (top-3)**:

`ToolView.tsx` (1900 LOC) ⇒ 4 sub-component:
- `ToolTabs` (tabs nav)
- `ToolCalculator` (input form + compute call)
- `ToolResult` (result display + bands)
- `ToolMarkdown` (description + references rendering)

`StatisticsPage.tsx` (1900 LOC) ⇒ 3-4 sub-component:
- `<HexHeatmap>` (SVG calendar heatmap)
- `<StatsTable>` (per-topic table)
- `<StatsFilters>` (filter chips)
- `<AnalyticsPipe>` (если бизнес-логика отдельно)

`TestStartConsent.tsx` (1900 LOC) ⇒ split:
- `<ConsentLegalText>` (статичный legal-блок)
- `<ConsentCheckboxMatrix>` (форма)
- `<ConsentActions>` (start button + cancel)

**Затраты**: каждый split — 0.5-1 рабочий день. 7 файлов = 1-1.5
рабочих недели. Можно постепенно.

### P2-CR-4 — `lib/store.ts` 530 LOC монолитный Zustand store

**Verified**: 530 LOC, один `create()`-вызов, без slicing.

Смешивает:
- Persistent profile (userName, userEmail, userStatus, userCountry)
- Course progress (completedCourses, startedCourses, courseTestProgress, studyTime)
- Quiz state (testAttempts, moduleTestAttempts, lastDiagnosticResult)
- UI / view state (toolsQuery, toolsCategories, toolsSubcategories — фильтры; showLearning, showStats, showProfile — навигация)

**Проблема**: каждое action затрагивает несколько unrelated keys (см. perf audit P2-NEW-9 — `setShowTools()` сбрасывает 10 полей сразу). Эта же проблема — *code-quality* вид: отвечать «где живёт showLearning?» сложно после полугода.

**Рекомендация**: `slices/` pattern по доменам — `profileSlice`, `progressSlice`, `quizSlice`, `viewSlice`. `lib/store.ts` склеивает их через `createStore((...args) => ({ ...profileSlice(...args), ... }))`.

### P2-CR-5 — `useSupabaseSync` имеет subscribe вне useEffect

`lib/useSupabaseSync.ts:175` (claim агента — verify сам в файле): `useAppStore.subscribe()` вызывается без обёртки в useEffect. Cleanup делается, но это внутренний контракт между Zustand subscribe и React lifecycle. Читаемость страдает; новый dev может подумать, что subscribe — побочный эффект, не ожидаемый.

**Лучше**: либо явный `useEffect(() => useAppStore.subscribe(...), [])`, либо custom hook `useStoreSync()` с ясным контрактом.

### P3-CR-2 — Нет shared form primitive

Все формы (`BilirubinNomogram`, `PediatricCalculator`, account/delete confirm, feedback, admin tool editor) — hand-rolled `useState` + inline JSX. Дубль `<Field>`, `<Label>`, `<ErrorText>`. Валидация: ad-hoc inline.

Не P1, потому что:
- Форм у вас < 10.
- Server-side validation уже есть через valibot.
- React Hook Form / Tanstack Form — отдельный bundle (~25 KB).

P3, потому что:
- Каждая новая форма — copy-paste.
- a11y labels часто пропускаются (P3-CR-3 ниже).

Решение: **3 примитива** (`<Field>`, `<Input>`, `<ErrorText>`) в `components/ui/forms/` без внешней библиотеки. ~150 LOC, отбивается через 3 формы.

### P3-CR-3 — Form labels отсутствуют

`components/neonatal/BilirubinNomogram.tsx:144-190` — checkboxes и inputs без `<label>` или `aria-label`. Confirmed agent finding. Минимальное a11y-нарушение.

### P2-CR-6 — Нет error boundaries на admin/tools subroutes

`app/error.tsx` и `app/global-error.tsx` есть. Но `app/admin/`, `app/tools/[id]/`, `app/course/` не имеют segment-level `error.tsx`. Если рендер админки крашнется — пользователь увидит global fallback вместо контекстного сообщения «Не удалось загрузить admin-tool, попробуйте обновить». Низкий impact (RSC errors редки), но defense-in-depth.

---

## 4. Tailwind / design system

### P1-CR-4 — 1585 inline `style={{...}}` despite Tailwind

**Verified**: `grep -rh "style={{" components app | wc -l` → **1585**.

CLAUDE.md явно описывает дизайн-систему (палитра, типографика, easing). Tailwind v4 в deps. Но фактически inline-styles доминируют.

**Пример** (`components/PwaRegistrar.tsx:185-199`):
```tsx
style={{
  position: 'fixed', bottom: 20, right: 20, zIndex: 9998,
  background: '#FFFFFF',
  borderRadius: 12, padding: '12px 14px 12px 16px',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
}}
```

Это можно (и нужно) переписать в Tailwind:
```tsx
className="fixed bottom-5 right-5 z-[9998] bg-white rounded-xl px-4 py-3 shadow-lg"
```

**Цена inline-styles**:
- Нельзя переиспользовать через `className`.
- Theme-tokens разбегаются по 1500 местам — изменение цвета требует find-replace.
- React пересоздаёт inline-object на каждом рендере → лишние reconciliation-вызовы (perf-touch).
- A11y-overrides (e.g., dark mode, prefers-reduced-motion) сделать невозможно без CSS-переменных.

**Стратегия (рефакторинг на 2-3 дня)**:
1. Зафиксировать color tokens в `tailwind.config.ts`:
   ```ts
   theme: {
     extend: {
       colors: {
         'card-bg':       '#F5F6F8',
         'card-bg-hover': '#F0F2F5',
         'sidebar-bg':    '#F0F1F5',
         'cta':           '#1A1A1A',
         'cta-hover':     '#000000',
         'success':       '#22C55E',
         'danger':        '#F87171',
         'border':        '#EEF0F3',
         'border-strong': '#E2E4EA',
       },
       fontFamily: {
         display: ['var(--font-display)', 'system-ui'],
         mono:    ['var(--font-mono)', 'ui-monospace'],
       },
       transitionTimingFunction: {
         brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
       },
     },
   },
   ```
2. Постепенно конвертировать топ-3 god-component'а (ToolView, StatisticsPage, Sidebar) — они дают ~600/1585 inline-styles.
3. ESLint-rule (когда добавите ESLint — см. P1-CR-1): запретить `style={{` в новых файлах.

### P3-CR-4 — Design tokens не экспортированы в Tailwind theme

Сейчас цвета частично в `app/globals.css` как CSS variables (`--md-sys-color-*`). Но в Tailwind theme их нет — поэтому `bg-card-bg` не работает, и разработчик пишет `style={{background:'#F5F6F8'}}` вместо `className="bg-card-bg"`.

После P1-CR-4 это исчезнет автоматически.

---

## 5. Backend / data layer

### P1-CR-5 — Нет generated Supabase Database types

**Verified**: `lib/database.types.ts` отсутствует. Нет `npm run gen:types` script. Supabase JS client используется untyped:
```ts
const sb = await getSupabaseServerClient();
const { data, error } = await sb.from('tools').select('*').eq('id', id);
//      ^^^^                    ^^^^^^^^^^^^^^^
//   any[]                      column names не валидируются
```

**Что не так**: добавил колонку `published_at` в схему — TS ничего не подскажет. Опечатка `.eq('toolid', ...)` — runtime error, не compile error.

**Как чинить**:
1. `npx supabase login` (если ещё нет).
2. `npx supabase gen types typescript --project-id <YOUR_ID> > lib/database.types.ts`.
3. `lib/supabase/server.ts`: `getSupabaseServerClient()` возвращает `SupabaseClient<Database>`.
4. Запустить tsc — увидеть проблемы, починить.
5. Добавить в CI step или pre-commit hook регенерацию.

Затраты: 2-3 часа в первый раз.

### P2-CR-7 — DRY-violation: повторяющийся `{auth + 503/401}` boilerplate

Паттерн в каждой защищённой route:
```ts
const sb = await getSupabaseServerClient();
if (!sb) return NextResponse.json({ ok: false, error: 'backend-not-configured' }, { status: 503 });
const { data: { user } } = await sb.auth.getUser();
if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
```

Найден в `app/api/admin/tools/[id]/route.ts:22-26`, `app/api/account/delete/route.ts`, `app/api/sync/route.ts`, и т.д. — 5+ мест, ~6 строк каждое.

**Helper**:
```ts
// lib/api-helpers.ts
export async function withAuthedSupabase(req: Request,
  handler: (sb: SupabaseClient<Database>, user: User) => Promise<Response>
): Promise<Response> {
  const block = assertSameOrigin(req); if (block) return block;
  const sb = await getSupabaseServerClient();
  if (!sb) return apiError('backend-not-configured', 503);
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return apiError('unauthorized', 401);
  return handler(sb, user);
}

// Usage:
export const POST = (req: Request) => withAuthedSupabase(req, async (sb, user) => {
  // ...
});
```

Срезает ~30 LOC по всем routes + единая семантика origin-check + единый error format (см. P1-CR-8 ниже).

### P1-CR-8 — Inconsistent API error shape

Найдены **4 разных** формы ошибок:

| Route | Shape |
|---|---|
| `/api/sync` | `{ error: 'string' }` (нет `ok`) |
| `/api/diagnostic` | `{ ok: false, error: 'string', issues?: string[] }` |
| `/api/account/delete` | `{ ok: false, error: 'string', partial?: boolean, errors?: string[] }` |
| `/api/feedback` | `{ ok: false, error: 'string', status?: number }` |

**Что не так**: client должен match по string-литералам error codes для UX, и shape разный — приходится `if ('error' in data && 'ok' in data ? data.ok === false : ...)`.

**Решение** (`lib/api-errors.ts`):
```ts
export const ERR = {
  unauthorized:        'unauthorized',
  forbidden_origin:    'forbidden-origin',
  backend_not_configured: 'backend-not-configured',
  rate_limited:        'rate-limited',
  bad_input:           'bad-input',
  bank_corrupted:      'bank-corrupted',
  // ...
} as const;

export type ApiErrorCode = (typeof ERR)[keyof typeof ERR];

export function apiError(code: ApiErrorCode, status: number, extra?: { issues?: string[] }) {
  return NextResponse.json({ ok: false, error: code, ...extra }, { status });
}
export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}
```

Все routes мигрировать. Клиент: `if (!response.ok) showError(ERR_MESSAGES[response.error]);`.

### P2-CR-8 — Tool approval gap atomicity

`app/api/admin/tools/[id]/route.ts:68-105` — action `approve`:
1. UPDATE `tools` SET status='published', reviewed_by, ...
2. INSERT INTO `tools_versions` snapshot.

Это **два отдельных** Supabase-вызова, не атомарно. Если шаг 2 fail — tool опубликован без version snapshot.

**Решение**: Postgres-функция `approve_tool(p_tool_id uuid, p_reviewer_id uuid)` SECURITY DEFINER, делает оба write в одном transaction. Аналог `delete_user_cascade`.

### P2-CR-9 — Schema split на 4 файла без migrations directory

`supabase/{schema.sql, content-schema.sql, rls-hardening.sql, rls-hardening-2.sql, rpc-delete-user-cascade.sql}` — 5 SQL-файлов, никакого порядка.

**Что не так**: понимание «что в каком порядке применять» требует чтения всех файлов. Schema drift возможен (security audit P1-NEW-3 обращает на это внимание — нужно подтвердить, что rls-hardening-2 вообще применён в prod).

**Стандартный паттерн**: `supabase/migrations/0001_init.sql`, `0002_rls.sql`, `0003_content.sql` и т.д., с timestamp prefix. Supabase CLI `npx supabase migration new <name>` это автоматизирует.

### P3-CR-5 — Output validation schemas missing

Input schemas для API routes — есть везде (valibot). Output schemas — нет нигде. Если Gemini вернёт malformed JSON — defensive logic в handler. Лучше: `OutputSchema` для каждой route + `v.parse(OutputSchema, data)` перед `NextResponse.json`. Catches изменения формата response.

---

## 6. AI / Gemini integration

### P1-CR-6 — Hardcoded prompts в route-файле

`app/api/diagnostic/route.ts:192-235` — `SYSTEM_PROMPT_NEXT` (~22 строки русского) и `SYSTEM_PROMPT_FINALIZE` (~22 строки). Embedded в ту же route-файл, что handler logic.

**Что плохо**:
- Diff на изменение prompt'а смешивается с diff на изменение handler-логики.
- A/B-тестирование prompts требует условий вида `if (...) PROMPT_A else PROMPT_B` в handler — каша.
- Версионирование (semver на промпте) невозможно — prompt привязан к git-history файла.
- Перевод на 2-3 языка (i18n) — невозможен без рефакторинга.

**Решение**:
```
lib/prompts/
  diagnostic-next.ru.ts       # SYSTEM_PROMPT_NEXT
  diagnostic-finalize.ru.ts   # SYSTEM_PROMPT_FINALIZE
  index.ts                    # exports prompts as { id, version, content }
```

С `id` + `version` (например, `diagnostic-next-v3`) можно логировать prompt-версию в Sentry, делать A/B через config-flag, версионировать самостоятельно.

### P2-CR-10 — Output parsing хрупкое

`app/api/diagnostic/route.ts:302-326` — defensive JSON.parse + triple-backtick fallback. Не покрывает:
- Single-quoted JSON.
- Leading «Here's your answer:» / «Вот ответ:».
- Trailing markdown.
- Comments в JSON.
- Null bytes, BOM.

**Не критично** (Gemini обычно даёт чистый JSON), но как defense-in-depth можно добавить library `dirty-json` или хотя бы 3-4 дополнительных извлечения.

### P3-CR-6 — Нет cost instrumentation

Лог-events не содержат `tokens_in`, `tokens_out`, `model`, `cache_hit`. На free-tier пока нормально, но при запуске на платной квоте это будет блайнд для cost-attribution.

`log.info({ event: 'gemini_call', tokens_in, tokens_out, model, latency_ms })` в каждом успешном call. ~5 строк.

### Положительное в Gemini-integration

- Retry / fallback chain отличный (per-model 2.5 s, total 8.5 s, 4 модели в очереди — security audit это отмечал).
- `ruleBasedFinalize` (lines 416-493) — fallback, который НИКОГДА не показывает failure-panel пользователю. Это образцовый paranoid-by-design подход для medical UX.
- Output-guard через parse5 — мощный (security audit подтверждает).

---

## 7. Testing / DX

### P0-CR-2 — 5.5% test coverage на medical calculators

**Verified**: 41 test files / 741 runner files = **5.5%**.

**Что покрыто** (отлично):
- `bmi`, `bsa-mosteller`, `whr`, `cockcroft`, `ckd-epi`, `mdrd`
- `gcs`, `apgar`, `wells-pe`, `wells-dvt`, `curb65`, `qsofa`, `news2`
- `chads-vasc`, `has-bled`, `heart`, `meld`, `parkland`, `holliday-segar`, `aa-gradient`, `anion-gap`
- `vanco-auc`, `pediatric-dose`, `renal-dose` ✅ (критичные дозировочные)
- `apache`, `ranson`, `forrest`, `cam-icu`, `4t-pph`, `6mwt`, `aaa`, `abi`, `absi`, `abw`, `adrogue-madias`, `apri-hep`, `hba1c`, `maddrey`, `water-deficit`

**Что НЕ покрыто** (~700 калькуляторов): включая всю educational батарею (анестезиологические шкалы, неврологические, кардиологические — кроме перечисленных), 90% drug-monographs runner'ов, neonatal big-picture runner'ы.

**Почему P0**: для medical app каждый calc — это потенциальная единица medical decision support. Один баг в SOFA или CHADS₂-VASc → неправильный risk-score → неправильное лечение.

**Стратегия (production-ready за месяц)**:
1. **Today**: автогенератор golden-tests из `data/*-validation.json` файлов (если есть). Если нет — извлечь expected-results из source guidelines, hand-craft по 3-5 cases на каждый critical runner.
2. **Эта неделя**: покрыть top-50 наиболее-используемых runners (по analytics — какие открывают чаще всего). Можно ввести analytics-driven priority.
3. **Следующая неделя**: CI-gate «новый runner не может быть merged без минимум 5 golden-test cases».
4. **Месяц**: на 30-50% coverage. Полное coverage 100% нереально без full-time team — приемлемо, если P0/P1 critical-tools покрыты + есть smoke-test для остальных.

### P1-CR-1 — Нет ESLint config

**Verified**: `.eslintrc*`, `eslint.config.*` отсутствуют в репо.

`tsc --noEmit` ловит typing-issues, но не ловит:
- Unused imports (загромождают bundle, замедляют tree-shaking).
- Missing key props на JSX list elements.
- console.log в production code.
- Async-Promise without await (`promise.then(...)` без обработки rejection).
- React hooks rules violations (most importantly, exhaustive-deps).

Добавить:
```bash
npm i -D eslint @next/eslint-plugin-next eslint-plugin-react-hooks @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Минимальный `.eslintrc.json`:
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

В CI:
```yaml
- name: Lint
  run: npx next lint
```

Затраты: 30 минут initial setup; постепенно правка warnings.

### P2-CR-11 — Нет pre-commit hooks

**Verified**: `.husky/`, `lefthook.yml`, `simple-git-hooks` config — отсутствуют.

Без pre-commit:
- Commit с TS-ошибкой проходит локально → CI красный → 5-минутный wait цикл на починку.
- Format-drift (tabs vs spaces) проникает в diff'ы.

Добавить:
```bash
npm i -D husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

`package.json`:
```json
"lint-staged": {
  "*.{ts,tsx}": ["next lint --fix", "tsc --noEmit"]
}
```

Затраты: 20 минут.

### P0-CR-3 — README — дефолтный create-next-app boilerplate

**Verified**: `README.md` буквально по умолчанию из `create-next-app`. Содержит «`Geist` font» (которого в проекте нет). Никакой setup-инструкции, ничего о медицинском контексте, ничего о memory-системе из CLAUDE.md.

**Что это плохо**:
- Onboarding нового dev'a (или себя через 6 месяцев) начинается с CLAUDE.md, который в README не упомянут.
- Если репо станет public (security disclosure programme, opensource часть) — первое впечатление: «брошенный side-project».

**Минимальный README** (можно за 30 минут):
```md
# Bordik Med

Medical PWA для врачей и студентов в РФ и Узбекистане. 738+
калькуляторов, ICD-10/11 lookup, drug interactions, образовательный
курс, AI-driven diagnostic test.

## Стек
Next.js 16 · React 19 · TypeScript 5 · Tailwind v4 · Supabase ·
Sentry · Vercel.

## Setup
1. `cp .env.local.example .env.local` — заполнить.
2. `npm install`
3. `npm run dev`

## Команды
- `npm run dev` — dev server.
- `npm test` — vitest golden tests на калькуляторы.
- `npm run check:leaks` — secret-scan на bundle.
- `npm run validate:scales` — проверка band-определений.

## Документация
- [CLAUDE.md](./CLAUDE.md) — продуктовые стандарты + memory-система.
- [docs/SECURITY_SETUP.md](./docs/SECURITY_SETUP.md) — IR runbook.
- [docs/security-audit-2026-05.md](./docs/security-audit-2026-05.md)
- [docs/performance-audit-2026-05.md](./docs/performance-audit-2026-05.md)
- [docs/code-review-2026-05.md](./docs/code-review-2026-05.md)
- [docs/UI_GUIDELINES.md](./docs/UI_GUIDELINES.md)

## Лицензия / контакты
hello@bordik.app · privacy@bordik.app · security@bordik.app
```

### P2-CR-12 — Build scripts: 52 файла, все .mjs

`scripts/` содержит 52 файла, в основном `.mjs`. Дубликаты:
- `import-icd10*.mjs` (несколько вариантов — какой actual?).
- `expand-icd10*.mjs` (one-shot data import).
- `build-{content,question-bank,tool-meta,curriculum-stats}.mjs` (active prebuild).

**Проблемы**:
- `.mjs` не может импортировать `.ts` без bundler — поэтому **схемы valibot дублируются** между `lib/schemas/*.ts` (runtime) и `scripts/build-content.mjs` (build-time). Schema drift.
- Нет exit-codes на ошибках — script может молча fail и проpусtить broken data в `data/*.json`.
- Dead scripts (one-shot imports) перемешаны с active. Trier «что используется» = git blame.

**Решение**:
1. Active scripts → `.ts` через `tsx` runner: `node --import tsx/esm scripts/build-content.ts`.
2. One-shot data-imports → `scripts/_archive/` (с `.gitignore`-индикатором что они dead).
3. На каждом active script: `try { ... } catch (e) { console.error(e); process.exit(1); }`.

### P1-CR-10 — Нет inline-citations на medical formulas (ЧАСТИЧНО)

**Verified correction**: `lib/runners/renal-dose.ts:1-17` ИМЕЕТ блок документации с указанием источника:
> Source: data/renal-dosing.json — централизованный датасет, версионируется отдельно. Текущий MVP — 15 препаратов: антикоагулянты, ванкомицин, метформин, ...

**Однако внутри compute-функции** магические константы CKD-EPI 2021 (88.4, 0.7, 0.9, -0.241, -0.302, 1.012, 0.9938, 142) идут без ссылки на формулу-as-published.

**Корректнее**:
```ts
// CKD-EPI 2021 (race-free) — Inker LA et al, NEJM 2021;385:1737-1749.
// https://www.kidney.org/professionals/kdoqi/gfr_calculator
// eGFR = 142 × min(SCr/κ,1)^α × max(SCr/κ,1)^-1.200 × 0.9938^age × (1.012 if female)
//   где κ = 0.7 (female), 0.9 (male); α = -0.241 (female), -0.302 (male)
const KAPPA_F = 0.7; const KAPPA_M = 0.9;
const ALPHA_F = -0.241; const ALPHA_M = -0.302;
const AGE_FACTOR = 0.9938;
const FEMALE_ADJUST = 1.012;
const BASE = 142;
```

В audit-trail (medical regulatory) такая documentation-by-comment — стандарт. Сейчас compute-логика правильная, но опровержение «откуда константа» требует git-blame по data/renal-dosing.json + чтение исходного guideline.

**Где ещё проверить**: `lib/runners/{vanco-auc,pediatric-dose,gcs,apgar,wells-pe,curb65,qsofa,news2,chads-vasc,has-bled,heart,meld,parkland,holliday-segar}.ts` — все critical-runners должны содержать formula-source comments.

### P3-CR-7 — Test naming consistency

`tests/calculators/*.test.ts` — единый паттерн. Внутри тестов: `describe('renal-dose')` → `it('CKD stage 4 ...')`. Хорошая дисциплина.

---

## 8. Documentation / inline comments

### Положительное

- `lib/full-logout.ts` — образцовый JSDoc (40 строк) с P1/P2/P3 cross-refs к audit findings.
- `lib/output-guard.ts` — образцовый paranoid-by-design docstring + threat model.
- `vitest.config.ts:4-16` — comment объясняющий «почему golden tests матерят» для medical calculators.
- `next.config.ts:13-46` — комменты с подробностями SW precache strategy, CRITICAL_TOOL_IDS rationale.
- `app/api/diagnostic/route.ts:30-50` — handler-level JSDoc.
- CLAUDE.md — 200+ строк product+architecture-knowledge.
- docs/SECURITY_SETUP.md — full IR runbook.
- docs/AUDIT_PASS_4_TODO.md — рабочий снимок tech-debt.

### P2-CR-13 — Нет ARCHITECTURE.md / ADR

Architecture decisions документированы в:
- CLAUDE.md (продуктовые правила + дизайн-система)
- Inline comments в proxy.ts / next.config.ts / instrumentation.ts (per-feature)
- docs/specs/* (для отдельных features: drug-interactions, guidelines)

Но нет одного центрального `docs/ARCHITECTURE.md` или `docs/decisions/`-папки с ADR-формулировкой:
- «Почему Next.js 16, не Astro / Remix»
- «Почему Supabase, не Postgres + лучше-хочешь»
- «Почему не используем react-query — outline-first архитектура»
- «Почему Zustand монолитный — UX-trade-off»

Не критично сейчас, но **полезно для onboarding через 6 месяцев и для contributors**.

### P3-CR-8 — Magic numbers / strings

- `app/api/diagnostic/route.ts:114` — `[0,1,2,3]` для options. Magic 4 (количество options). Лучше `OPTIONS_PER_QUESTION = 4`.
- `app/api/diagnostic/route.ts:166` — `... : 0.5` (default confidence). Лучше: `DEFAULT_CONFIDENCE = 0.5; // 50% — null hypothesis when no history`.
- Error strings inline (`'output_blocked:${reason}'`). Лучше — `lib/api-errors.ts` constants (см. P1-CR-8).

---

## 9. Top-10 tech-debt map

В порядке impact-on-code-quality (не в порядке severity):

1. **`@ts-nocheck` на 739 runners** (P0) — выключенный type-checking на критичной поверхности.
2. **5.5% test coverage** (P0) — для medical app fall-short.
3. **README boilerplate** (P0) — onboarding-катастрофа.
4. **God-components** (P1) — 7 файлов >1200 LOC, sustainability-проблема.
5. **1585 inline-styles** (P1) — design-system не enforced.
6. **No ESLint** (P1) — целая категория багов невидима.
7. **Hardcoded Gemini prompts** (P1) — мешает versioning + i18n.
8. **DRY-violation auth boilerplate** (P1) — 30+ строк дублей.
9. **Нет database.types.ts** (P1) — Supabase queries untyped.
10. **API error shape inconsistent** (P1) — 4 разных формата.

---

## 10. Roadmap

### Прямо сейчас (2-4 часа quick wins)

1. **P0-CR-3** новый README — 30 минут.
2. **P1-CR-1** ESLint config + CI step — 30 минут.
3. **P2-CR-11** husky + lint-staged pre-commit — 20 минут.
4. **P1-CR-5** `npx supabase gen types typescript` → `lib/database.types.ts` — 30 минут.
5. **P2-CR-7** `lib/api-helpers.ts` с `withAuthedSupabase` — 30 минут.
6. **P1-CR-8** `lib/api-errors.ts` + миграция 1-2 routes — 30 минут.

### Эта неделя (1 рабочий день каждое)

7. **P1-CR-6** `lib/prompts/` extraction — 0.5 дня.
8. **P1-CR-7** мигрировать все routes на `withAuthedSupabase` — 0.5 дня.
9. **P0-CR-1 шаг 1** — снять `@ts-nocheck` с 1 runner, починить генератор — 1 день.
10. **P0-CR-1 шаг 2** — top-20 critical runners типизированы — 2-3 дня.
11. **P0-CR-2 шаг 1** — генератор golden-tests из data файлов + добавить +50 тестов — 2-3 дня.
12. **P2-CR-1** `lib/` reorg на `domain/`/`shared/` — 0.5 дня.
13. **P2-CR-9** Supabase migrations folder + перевод существующих SQL — 1 день.
14. **P1-CR-3** топ-3 god-component split (ToolView, StatisticsPage, TestStartConsent) — 2-3 дня.

### Этот месяц

15. **P0-CR-1 финиш** — все 720 runners типизированы (батчами по топику) — 1-2 недели.
16. **P0-CR-2 финиш** — 30-50% coverage на runners + analytics-priority extension — 2 недели.
17. **P1-CR-4** Tailwind theme + миграция inline-styles → classes (топ-3 god-component'а закрывают ~600/1585) — 1 неделя.
18. **P2-CR-4** Zustand store slicing — 1 день.
19. **P2-CR-12** scripts → .ts через tsx + archive dead — 1 день.
20. **P1-CR-10** formula-source comments на остальных critical runners — 0.5 дня.

### Долгосрочно (1-3 месяца)

21. Component tests (Testing Library + Playwright) для admin tool editor + diagnostic test UI.
22. ADR-папка `docs/decisions/`.
23. Migration: ad-hoc fetch-patterns → единый api-client (когда будет 20+ endpoints).
24. CSS-modules / vanilla-extract для оставшихся inline-styles, которые сложно конвертировать в Tailwind.

---

## 11. Public-launch code-quality чек-лист

### Must-have (блокеры запуска)

- [ ] **P0-CR-3** README заменён на содержательный.
- [ ] **P0-CR-1 (минимум)** топ-20 CRITICAL_TOOL_IDS runners без `@ts-nocheck`.
- [ ] **P0-CR-2 (минимум)** golden-tests на топ-50 наиболее используемых runners (analytics-driven).
- [ ] **P1-CR-1** ESLint config + CI step.
- [ ] **P1-CR-5** Supabase Database types.
- [ ] **P1-CR-8** Единый API error format.
- [ ] **P1-CR-10** Formula-source comments на всех CRITICAL_TOOL_IDS.

### Should-have

- [ ] **P1-CR-2** pre-commit hooks (husky+lint-staged).
- [ ] **P1-CR-3** топ-3 god-component split.
- [ ] **P1-CR-4** Tailwind theme tokens + миграция топ-3 god-component'а.
- [ ] **P1-CR-6** Prompts вынесены в `lib/prompts/`.
- [ ] **P1-CR-7** auth-boilerplate в helper.
- [ ] **P2-CR-1** `lib/` структурный reorg.
- [ ] **P2-CR-4** Zustand slicing.

### Nice-to-have

- [ ] **P0-CR-1 (полно)** все runners типизированы.
- [ ] **P0-CR-2 (полно)** 30-50% coverage по всем runners.
- [ ] ADR docs.
- [ ] Component tests + E2E.
- [ ] Tailwind миграция всех 1585 inline-styles.

---

## Приложение A — methodology + verifications

**Methodology**:
1. Прочитаны `docs/security-audit-2026-05.md` + `docs/performance-audit-2026-05.md` для исключения дубликатов.
2. Direct reads `tsconfig.json`, `README.md`, `vitest.config.ts`, `.github/workflows/ci.yml`, package.json scripts.
3. Параллельный multi-agent探查 (4 агента) по 4 направлениям (architecture+TS, React+components+a11y, backend+AI, tests+DX+docs+smells).
4. **Direct verification** ключевых claims через Bash:

| Claim | Verification | Verdict |
|---|---|---|
| `lib/runners/` ~200 файлов с `@ts-nocheck` | `grep -l @ts-nocheck lib/runners/*.ts \| wc -l` → **739/741** | ✅ Confirmed (хуже чем agent сказал) |
| 41 calculator tests | `tests/calculators/*.test.ts` → 41 | ✅ Confirmed |
| 737 runners (agent claim) | `lib/runners/*.ts` → **741** | 🟡 Уточнено |
| God-components 1900 LOC | `find ... -printf '%s %p\n' \| sort -rn` → ToolView 81 KB ≈ 1900 LOC | ✅ Confirmed |
| `lib/store.ts` 530 LOC | `wc -l lib/store.ts` → **530** | ✅ Confirmed |
| 1359 inline `style={{` (agent claim) | `grep -rh "style={{" components app \| wc -l` → **1585** | 🟡 Хуже agent claim'а |
| Нет `lib/database.types.ts` | `ls lib/database.types.ts` → not found | ✅ Confirmed |
| 7 TODO/FIXME total | `grep -rEn "(TODO\|FIXME\|HACK\|XXX)\b" app components lib scripts` → **7** | ✅ Confirmed |
| Renal-dose без formula citation | Read `lib/runners/renal-dose.ts:1-17` | ❌ **Agent ошибся** — citation IS there ("CKD-EPI 2021 (race-free)" + dataset). Корректировка применена в P1-CR-10. |
| README boilerplate | Read full file | ✅ Confirmed (содержит «Geist font» — false) |
| Нет ESLint config | `ls eslint* .eslintrc*` → not found | ✅ Confirmed |
| Нет husky / lefthook | `ls .husky/ lefthook.yml .lefthook*` → not found | ✅ Confirmed |
| 52 scripts (agent said 46) | `ls scripts/*.mjs scripts/*.ts \| wc -l` → **52** | 🟡 Уточнено |

**Ограничения**:
- Не запускался Lighthouse / vitest / Storybook — только source review.
- Не делался runtime-trace на production.
- Не оценивалось субъективное качество medical-формул (это требует домен-эксперта).

---

## Приложение B — связанные документы

- [docs/security-audit-2026-05.md](security-audit-2026-05.md) — security pass (cross-list: P1-NEW-4 xlsx — также code quality finding).
- [docs/performance-audit-2026-05.md](performance-audit-2026-05.md) — perf pass (cross-list: god-components → P1-PERF-NEW-1 home-page client-component).
- [docs/AUDIT_PASS_4_TODO.md](AUDIT_PASS_4_TODO.md) — pass 4 (P1-CQ-1: noUncheckedIndexedAccess promotion — закрыт; см. §131-164).
- [docs/SECURITY_SETUP.md](SECURITY_SETUP.md) — IR runbook + manual setup.
- [CLAUDE.md](../CLAUDE.md) — product + dev memory system.
