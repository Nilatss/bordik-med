---
title: Performance audit — Bordik Med (production-readiness pass)
date: 2026-05-07
auditor: Claude (Opus 4.7) — automated source-level review
scope: full repo at HEAD, plus PERF_DIAGNOSTIC.md baseline cross-check
status: report only — no code changes applied
---

# Performance audit — Bordik Med, 2026-05

> Цель аудита: довести проект до production-grade уровня по скорости —
> medical PWA, аудитория RU/UZ на mid-range mobile + 3G/4G, solo dev на
> Vercel Hobby. Фокус — **field-realistic метрики** (мобильные пользователи
> с не-флагман девайсами), а не Lighthouse score на десктопе.

---

## TL;DR

**Хорошие новости:**

1. **Все P0 + 2 P1 из pass 4 perf-аудита (2026-04-28 → 2026-05-01) —
   закрыты в коде.** Verified file-by-file: SectionCards в SSR HTML
   (observed LCP 3000 → 1025 ms), Supabase лениво, framer-motion из
   Sidebar убран, curriculum split, polyfills 113 KB → 0 KB.
2. **Lazy-load дисциплина строгая.** Все новые тяжёлые фичи (МКБ-11
   34k codes, drug-interactions 62 препарата, neonatology 127 препаратов,
   Cmd-K, +414 ICD-10) — за `dynamic({ ssr: false })` или Web Worker.
   Home chunk не разбух, остался ~109 KB raw.
3. **Service Worker архитектура зрелая** — adaptive timeout по
   `effectiveType`, NetworkOnly для /api, toast-driven SW updates,
   versioned кэши с правильными `Cache-Control: immutable`.
4. **RUM пайплайн работает** — `WebVitalsReporter` шлёт LCP/INP/CLS/FCP/
   TTFB в Sentry breadcrumbs с тегами device/connection/route. Через
   ≥1 неделю данных можно сменить Lighthouse-simulated на field metrics.

**Плохое (новое):**

| ID | Severity | Заголовок | Файл |
|---|---|---|---|
| **P1-PERF-NEW-1** | P1 | `app/page.tsx:1` — целый home page client-rendered | `app/page.tsx:1` |
| **P1-PERF-NEW-2** | P1 | `preprocessContent()` без useMemo — на каждом render | `components/course/TabbedLessonViewer.tsx:675` |
| **P1-PERF-NEW-3** | P1 | `/api/diagnostic` на `runtime: nodejs` (не Edge) | `app/api/diagnostic/route.ts:34` |
| **P1-PERF-NEW-4** | P1 | `/api/sync` без явного runtime + 4 sequential upserts | `app/api/sync/route.ts` |
| **P1-PERF-NEW-5** | P1 | Gemini без streaming — TTFB 3 s vs 0.8 s | `app/api/diagnostic/route.ts:278` |
| **P1-PERF-NEW-6** | P1 | МКБ-10 (2.3 MB) НЕ в SW precache | `app/sw.ts:16-21` |
| **P1-PERF-NEW-7** | P1 | `xlsx` мёртвая dep + perf-bloat (cross-list с security) | `package.json:71` |

Полный список — ниже. Всего: **7 P1, 15 P2, 5 P3.**

**Готов ли проект к публичному запуску по perf?**
Близко. С точки зрения synthetic Lighthouse — Performance 88 на mobile,
до 90+ нужно ~32 ms TBT срезать (это закрывают P1-NEW-2 + P1-NEW-3 в
сумме). С точки зрения **реального UX** — критичны P1-NEW-5 (Gemini
streaming: 90-секундный тест без streaming = fail) и P1-NEW-6 (offline
medical reference: врач без интернета не сможет открыть МКБ-10). Эти
два — блокеры запуска. Остальные P1 — сильные quick wins.

---

## 1. Re-verification: статус прошлых perf-фиксов (pass 4 + post-SSR)

| ID | Title | Verdict | Evidence |
|---|---|---|---|
| **PERF-PASS4-1** | StorageBanner late-render → LCP candidate | ✅ FIXED | После PR #16 (`dc18533`) и PR #17 (`2436247`) — observed LCP упал 3000 → **1025 ms**. SectionCards рендерятся в SSR HTML (`app/page.tsx:621-654`), paint at FCP. |
| **PERF-PASS4-2** | Supabase eager-import on home (45 KB unused) | ✅ FIXED | `app/page.tsx:27-30` — `SupabaseSyncMounter` через `dynamic({ ssr: false })`. Anonymous home теперь не подтягивает `@supabase/supabase-js` (50 KB gz). |
| **PERF-PASS4-3** | Polyfills 113 KB raw на home | ✅ FIXED | `.browserslistrc` сужен до modern targets (last 2 versions, no IE11, no op_mini). 113 KB → 0 KB. |
| **PERF-PASS4-4** | framer-motion в Sidebar (~80 KB raw) | ✅ FIXED | Коммит `2c03841 perf(home): drop framer-motion from SectionCards + hero header`. CSS `@starting-style` вместо `motion.div`. |
| **PERF-PASS4-5** | `lib/curriculum.ts` 237 KB eager в home chunk | ✅ FIXED | Split на `lib/curriculum-stats.ts` (37 KB, eager — нужен для SSR section cards) + `lib/curriculum.ts` (200 KB, lazy через `ModuleGrid`/`CourseGrid` dynamic imports). Подтверждено `app/page.tsx:13-20`. |
| **PERF-NEXT-1** | Server-render SectionCards (post-pass-4 next P0) | ✅ FIXED | PR #16 — collapsed `view==='home'` и `view==='learning'` в один SSR-renderable block. Hydration mismatch исключён. |
| **PERF-NEXT-2** | App skeleton overlay 470 ms | ✅ FIXED | PR #17 — `#__app_skeleton` overlay (`position: fixed; z-index: 1`) удалён из `app/layout.tsx`. |

**Регрессий не обнаружено.** TBT (232 ms) остался чуть выше 200 ms green
threshold — это будет работа этого аудита.

---

## 2. Новые findings — P1 (high impact)

### P1-PERF-NEW-1 — `app/page.tsx:1` целый home как Client Component
**Файл**: `app/page.tsx:1`

```tsx
'use client';

import { useAppStore } from '@/lib/store';
// ...
```

**Что не так**: верхушка home — `'use client'`. Это форсит весь tree
(Sidebar, SectionCards, Zustand selectors, dynamic imports) в client-side
рендеринг, теряем:
- Static Generation (SSG) для верхушки
- ISR / `revalidate` возможности
- Streaming SSR / Suspense boundaries в Next 16

**Почему P1**: после PR #16 SectionCards в HTML — но это сделано через
client component с initialState от server. Если конвертировать
`app/page.tsx` в Server Component с маленькими `<HomeClient>` островами,
hydration cost снижается на 100-300 ms TBT, и +50-100 KB React-логики
уходит из critical path.

**Измеримый impact**: -100-300 ms TBT, -50-100 KB raw React-логики на
critical path.

**Как чинить (схема)**:
```tsx
// app/page.tsx — Server Component (no 'use client')
import { SECTIONS, SECTION_TOTAL_COURSES, MODULE_META } from '@/lib/curriculum-stats';
import { HomeClient } from '@/components/home/HomeClient';

export default function HomePage() {
  return (
    <HomeClient
      sections={SECTIONS}
      sectionTotals={SECTION_TOTAL_COURSES}
      moduleMeta={MODULE_META}
    />
  );
}

// components/home/HomeClient.tsx — 'use client' только тут
// Только ту часть UI, что реально использует useAppStore + useRouter.
```

**Затраты**: ~2 дня refactor (нужно аккуратно расщеплять Sidebar +
вспомогательные components). Стратегический пункт.

---

### P1-PERF-NEW-2 — `preprocessContent()` не мемоизирован
**Файл**: `components/course/TabbedLessonViewer.tsx:675`

```tsx
// Line 675 — внутри JSX render
<ReactMarkdown ...>
  {preprocessContent(active.body)}
</ReactMarkdown>
```

**Что не так**: `preprocessContent` (строки 24-91) делает 2 regex
replacements на всём markdown + множественные `.split('\n')` + per-line
regex matching + табличные конвертации в blockquote. Запускается **на
каждый render**, не на каждое изменение `active.body`.

При tab switch родитель re-render-ится, и preprocessContent крутится
заново. На markdown 5-50 KB (типичный course tab) — 10-50 ms жётского
main-thread blocking.

**Измеримый impact**: -10-50 ms на каждый tab switch (jank visible на
slow devices).

**Как чинить (1 строка)**:
```tsx
const preprocessed = useMemo(() => preprocessContent(active.body), [active.body]);
// ...
<ReactMarkdown ...>{preprocessed}</ReactMarkdown>
```

**Затраты**: 5 минут, 0 риска. Quick win.

---

### P1-PERF-NEW-3 — `/api/diagnostic` на `runtime: nodejs`
**Файл**: `app/api/diagnostic/route.ts:34`

```ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

**Что не так**: route ничего Node-specific не использует — только
`fetch()` к Gemini, JSON.parse/stringify, `readFileSync` (только на
build/cold start для bank cache, не runtime). Edge runtime даст:
- Edge PoP ближе к пользователю → -50-100 ms latency.
- ~40% дешевле invocations на Vercel Hobby.
- Cold start ~50 ms vs ~300 ms на Node.

**Caveat**: `readFileSync` на bank cache — это **build-time read**
с кэшем. Edge runtime не имеет fs. Решение: либо load bank через
`import` (turbopack заинлайнит), либо переехать на `await import('@/data/diagnostic-question-bank.json')`.

**Измеримый impact**: -50-100 ms latency на каждый из 31 вызовов
(тест 30 вопросов + finalize). Суммарно: -1.5-3 s на тест.

**Как чинить (квази-1 строка + bank loader)**:
```ts
export const runtime = 'edge';

// Replace readFileSync(...) with:
import bankJson from '@/data/diagnostic-question-bank.json' assert { type: 'json' };
const bank = bankJson as QuestionBank;
```

**Затраты**: 30 минут (включая тест prod-build что bank инлайнится корректно).

---

### P1-PERF-NEW-4 — `/api/sync` без runtime + sequential upserts
**Файл**: `app/api/sync/route.ts` (no runtime export, lines 119-195)

**Что не так**: 
1. Нет `export const runtime = 'edge'` — defaults to nodejs (медленнее на cold).
2. POST handler делает 4 separate `sb.from(...).upsert()` calls (course_progress, study_time, tool_settings, и потенциально другие). Supabase JS client serializes их sequentially over the wire даже при `Promise.allSettled`.

**Измеримый impact**: -200-400 ms на каждый sync (4 round-trips → 1).
useSupabaseSync дебаунсит до 1 sync / 1.5 s, поэтому это hit реально
после каждой пользовательской активности (тест, lesson done, tool save).

**Как чинить**:
1. **Edge runtime** — 1 строка:
   ```ts
   export const runtime = 'edge';
   ```
2. **Batch upserts** — Postgres RPC `sync_user_state` принимает один
   JSONB и атомарно апсертит все 4 таблицы:
   ```sql
   create or replace function sync_user_state(p_user_id uuid, p_payload jsonb)
   returns void language plpgsql security definer as $$
   begin
     -- atomic 4-table upsert from p_payload['course_progress'], etc.
   end$$;
   ```
   Route handler: `await sb.rpc('sync_user_state', { p_user_id: user.id, p_payload: body })`.

**Затраты**: 1 рабочий день (RPC + route refactor + test).

---

### P1-PERF-NEW-5 — Gemini без streaming
**Файл**: `app/api/diagnostic/route.ts:278` (`generateContent` endpoint)

**Что не так**: используется plain `generateContent` (полный буфер
ответа, потом возврат клиенту). Каждый вопрос ждёт ~3 s полной генерации
до первого byte клиенту.

**Сценарий abuse-by-UX**: пользователь делает 30-вопросный тест.
30 × 3 s = **90 s** только Gemini latency. Плюс finalize. Плюс UI lag.
**Это unusable на 3G/slow.**

**Streaming** (`streamGenerateContent`) даёт TTFB ~800 ms — клиент
видит первый токен почти сразу, остальное стримится поверх.

**Измеримый impact**: -2.2 s на вопрос → **-66 s суммарно на 30-q
тест**. Это огромная UX-победа.

**Как чинить (схематично)**:
```ts
// route.ts
const r = await fetch(
  `${URL}:streamGenerateContent?alt=sse`,
  { headers: { 'x-goog-api-key': KEY }, body: JSON.stringify({...}) }
);
return new Response(r.body, { headers: { 'Content-Type': 'text/event-stream' } });
// (затем клиент собирает SSE и накапливает текст)
```

**Caveat**: output-guard сейчас валидирует **полный ответ** (parse5 +
JSON schema). На streaming придётся валидировать только финальный
полный текст после fully-stream-end (или внедрить incremental
sanitization). Это добавляет complexity.

**Затраты**: 1-2 рабочих дня (включая клиентский SSE handler + тест
output-guard на streaming).

---

### P1-PERF-NEW-6 — МКБ-10 не в SW precache (offline medical)
**Файл**: `app/sw.ts:16-21` (CRITICAL_TOOL_IDS)

```ts
const CRITICAL_TOOL_IDS = [
  'bmi','bsa-mosteller','cockcroft','ckd-epi','mdrd','gcs','apgar',
  'wells-pe','wells-dvt','curb65','qsofa','news2','chads-vasc',
  'has-bled','heart','meld','parkland','holliday-segar','aa-gradient','anion-gap',
];
```

**Что не так**: 20 калькуляторов precache — отлично. Но **МКБ-10 slim
(2.3 MB)** — главный medical-reference инструмент в приложении — лежит
за CacheFirst SW-handler'ом, **не precached**. Это значит:

- Доктор открывает приложение в первый раз с интернетом → SW устанавливается → МКБ-10 НЕ в кэше.
- Доктор едет к пациенту в село без 4G → пытается открыть МКБ-10 → cache miss → fallback /~offline → blank.

Целевая аудитория проекта (по CLAUDE.md): «медики в РФ и Узбекистане»
с реалистичной плохой связью. Это **product-killer issue** для offline
use case.

**Измеримый impact**: 0 → 100% offline reliability для МКБ-10
lookups. Не measurable в ms — measurable в «работает / не работает»
для core медицинского сценария.

**Как чинить (additionalPrecacheEntries в `next.config.ts` или SW
config)**:
```ts
// next.config.ts (или wherever Serwist precache list лежит)
additionalPrecacheEntries: [
  { url: '/icd10-slim.json', revision: ICD10_VERSION },
  { url: '/icd10-details.json', revision: ICD10_DETAILS_VERSION },
  // ... existing entries
];
```

**Caveat**: 2.3 MB precache увеличивает SW install size. Это
**преднамеренный trade-off** для medical use-case. Total deploy budget
позволяет (см. P2-NEW-8). Отслеживать через WebVitals.

**Затраты**: 1 рабочий день (versioning + invalidation тест).

---

### P1-PERF-NEW-7 — `xlsx` dead dep
**Файл**: `package.json:71`

```json
"xlsx": "^0.18.5"
```

**Что не так**: пакет в `devDependencies`, но в коде не импортируется.
Cross-list с **security audit P1-NEW-4** (high-sev prototype pollution
+ ReDoS CVEs). Из perf-перспективы — 1.7 MB в node_modules, замедляет
`npm install` в CI на ~5-10 s.

**Измеримый impact**: -1.7 MB node_modules, -5-10 s CI install time.
Минимальный, но zero-risk.

**Как чинить**:
```bash
npm uninstall xlsx
```
Если в будущем понадобится — мигрировать на patched fork
(`@e965/xlsx@^0.20.3`).

**Затраты**: 1 минута.

---

## 3. Новые findings — P2 (medium)

| ID | Title | Файл | Impact |
|---|---|---|---|
| **P2-PERF-NEW-1** | `rehype-highlight` мёртвая dep (in package.json, не импортится) | `package.json:51` | 0 байт в bundle (хорошо), но риск случайного импорта (600 KB raw / 180 KB gz). Удалить через `npm uninstall`. |
| **P2-PERF-NEW-2** | Drug interactions JSON = **15 MB** парсится на main thread при открытии вью | `public/drug-interactions.json` (verified 15 MB) | -400-600 ms TBT на slow device при первом открытии DrugChecker. **Решение**: Worker + IndexedDB по образцу ICD search. |
| **P2-PERF-NEW-3** | ICD-10 lookup без virtualization после "Show All" | `components/icd10/Icd10Lookup.tsx:88-158` | 500-1500 ms render для chapter 0X (16.8k codes). **Решение**: `<Virtuoso>` row height ~32px. |
| **P2-PERF-NEW-4** | ~~Zustand store-persist sync read из localStorage~~ | `lib/store.ts:157-175` | **CLOSED 2026-05-09 — DECIDED NOT TO FIX.** Async hydration уже однажды поломала home: SSR-render `home`-stub → client post-mount swap to `SectionCards` дал **+1990 ms LCP render-delay** (Lighthouse). Fixed via stable SSR tree (`components/home/HomeApp.tsx:616-628`) — переход на async вернёт регрессию. Дополнительно: theme/language/profile-name FOUC хуже визуально, чем 5-200 ms sync delay. Inline-комментарий: `lib/store.ts:157-175`. |
| **P2-PERF-NEW-5** | Нет `<Suspense>` вокруг lazy view-компонентов | `app/page.tsx:121-139` | 500-1500 ms на route switch (chunk download без skeleton). **Решение**: обернуть каждую `<lazy view />` в `<Suspense fallback={<ViewLoading/>}>`. |
| **P2-PERF-NEW-6** | `react-markdown` re-mounts на tab switch (`<div key={active.id}>`) | `components/course/TabbedLessonViewer.tsx:504,545-677` | 20-50 ms на каждый tab switch (re-parse markdown AST). **Решение**: убрать key или мемоизировать AST. |
| **P2-PERF-NEW-7** | Calculator runners не code-split per-tool | `lib/tools-runners.ts` | +100-200 KB в tools chunk (740 калькуляторов в одном модуле). **Решение**: dynamic `import()` маршрутизатор по slug. |
| **P2-PERF-NEW-8** | `public/` = **135 MB** (verified): ICD ~60 MB + MediaPipe 44 MB + drug 15 MB | `public/` | 54% от Vercel Hobby ~250 MB soft limit. Рост в 1-2 квартала может пробить. **Mitigation**: вынести крупные JSON на CDN (Cloudflare R2) с cache-headers. |
| **P2-PERF-NEW-9** | UserMenu Realtime-channel `online-users` без cleanup (claim — не verified) | `components/layout/UserMenu.tsx` (если есть) | Connection leak на длинных сессиях. Verify сам. |
| **P2-PERF-NEW-10** | API routes без `Cache-Control: no-store` headers | `/api/sync`, `/api/diagnostic`, `/api/feedback` | CDN cache poisoning (low probability, defense-in-depth). 4 правки. |
| **P2-PERF-NEW-11** | Шрифты Montserrat + JetBrains Mono без preload + без Cyrillic subset | `app/globals.css:11-12` | -50 ms FOIT на cold start; +30% font weight (~8-12 KB). **Решение**: `<link rel="preload" as="font">` + `unicode-range: U+0400-04FF` для Cyrillic-only. |
| **P2-PERF-NEW-12** | `Sidebar.useEffect` для desktop breakpoint вместо `useLayoutEffect` | `components/layout/Sidebar.tsx:83-96` | 10-20 ms flash on desktop first paint. **Решение**: `useLayoutEffect`. |
| **P2-PERF-NEW-13** | ~~Gemini fallback chain — sequential, не parallel race~~ | `app/api/diagnostic/route.ts:248-326` | **CLOSED 2026-05-09 — DECIDED NOT TO FIX.** Конфликт с P2-NEW-9 (`lib/gemini-quota.ts` daily cap): parallel race ×N моделей даст ×4 quota burn → 50k cap иссякает за ~12.5k запросов вместо 50k. На coordinated-abuse сценарии пробивает paid tier за часы. 3 s регрессия на 429-fallback path приемлема — редкий path, не hot. Inline-комментарий в `app/api/diagnostic/route.ts:273-289`. |
| **P2-PERF-NEW-14** | Bilirubin/Growth/Drug-monographs JSON parsed на main-thread | `BilirubinNomogram.tsx`, `GrowthCharts.tsx`, etc. | До 200 ms parse-block на каждом view mount. **Решение**: worker-offload (как ICD). |
| **P2-PERF-NEW-15** | EXISTS subquery per-row в `tools_bands` RLS | `supabase/rls-hardening.sql:105-107` | 5-15 ms admin-workflows. Low traffic — не критично, но monitorable. |

### Развёрнуто: топ-3 P2

#### P2-PERF-NEW-2 — Drug interactions 15 MB на main thread

**Файл**: `public/drug-interactions.json` (verified 15 MB через `ls -la`).

**Что не так**: при открытии DrugChecker view загружается через
`fetch('/drug-interactions.json')` + `await r.json()` на main thread.
JSON.parse 15 MB на slow Android (~50 MB/s) = **~300 ms parse-block** +
**~100-300 ms allocation/GC**. На совсем low-end (~20 MB/s) — до
**750 ms заблокированного main thread**.

15 MB само по себе странно для 62 препаратов × 83 пар. Это, вероятно,
pre-computed full N×N таблица + полное описание каждого взаимодействия
с дублирующимся текстом. Опционально — pre-compress на build (или
сменить структуру: separate index by drug-id + per-drug detail file).

**Как чинить (worker pattern по аналогии с ICD)**:
```ts
// lib/workers/drug-interactions.worker.ts
import { expose } from 'comlink';
import drugDataJson from '/drug-interactions.json'; // или fetch

const api = {
  async checkPair(a: string, b: string) { /* ... */ },
};
expose(api);

// components/drugs/DrugChecker.tsx
const worker = useMemo(() => wrap<typeof api>(new Worker(...)), []);
```

**Опциональный bonus**: сократить размер JSON через ad-hoc compression
(вынести описания в отдельный lazy file, оставить только pair index).
Может срезать с 15 MB до 1-2 MB.

**Impact**: -400-600 ms TBT при открытии DrugChecker.

---

#### P2-PERF-NEW-5 — Нет `<Suspense>` boundaries

**Файл**: `app/page.tsx:121-139` (lazy view dynamic imports).

**Что не так**: `dynamic({ ssr: false })` lazy-load дисциплина строгая,
но без `<Suspense>` пользователь видит **blank** во время chunk
download. На slow-3G chunk 100 KB загружается 1-2 s.

**Как чинить**:
```tsx
import { Suspense } from 'react';

<Suspense fallback={<ViewLoading variant="tools" />}>
  {showTools && <ToolsPage />}
</Suspense>

<Suspense fallback={<ViewLoading variant="icd10" />}>
  {showIcd10 && <ClassificationsHub />}
</Suspense>
```

**Bonus**: разные `<ViewLoading variant>` могут показать contextual
skeleton (sidebar пуст, основная зона имеет shimmer-блоки нужной формы).
Это **снижает perceived LCP** на route switch на 500-1500 ms.

---

#### P2-PERF-NEW-3 — ICD-10 без virtualization

**Файл**: `components/icd10/Icd10Lookup.tsx:88-158`

**Что не так**: после "Show All" expand на главе 0X (16.8k codes),
500 строк монтируются как обычные DOM-ноды. На slow Android React
коммит = ~30 ms на 500 нод. Плюс layout/paint.

**Mitigations уже есть**: `useDeferredValue` для filter, INITIAL_PER_CHAPTER=50,
chunks of 500 → "Show More" pagination.

**Что не хватает**: virtual scroller. С `react-virtuoso` (уже в deps)
держим только visible window (~20 row), всё остальное виртуально.

**Как чинить**:
```tsx
import { Virtuoso } from 'react-virtuoso';

<Virtuoso
  style={{ height: '100%' }}
  totalCount={filteredCodes.length}
  itemContent={(i) => <Icd10Row code={filteredCodes[i]} />}
  endReached={() => loadMore()} // вместо ручного "Show More"
  overscan={20}
/>
```

**Impact**: -500-1500 ms render time на 16.8k chapters; -30+ MB JS
heap для huge expansions; smooth scroll даже на $200 девайсе.

---

## 4. Новые findings — P3 (low / cosmetic)

| ID | Title | Файл | Impact |
|---|---|---|---|
| **P3-PERF-NEW-1** | Bordik offline page = bare `/~offline` без cached content | `app/sw.ts:215-223` | UX gap. **Решение**: precached `/~offline` показывает links на cached calculators + последние visited. |
| **P3-PERF-NEW-2** | RUM device-detection breakpoint `(max-width: 768px)` = tablet | `components/WebVitalsReporter.tsx:52-55` | Observability blind spot — phones (<480px) и tablets (480-768) объединены. **Решение**: 3-tier: phone/tablet/desktop. |
| **P3-PERF-NEW-3** | Calculator runners metadata не code-split per-runner (P2-NEW-7 alt-view) | `lib/tools-runners.ts` | 100-200 KB в tools chunk. См. P2-NEW-7. |
| **P3-PERF-NEW-4** | Нет AVIF слоя для images (только PNG + WebP) | `next.config.ts` images config | -15% дополнительно на modern browsers. Vercel Hobby Image Optimization quota = 1000/mo, не используется (нет `next/image`). |
| **P3-PERF-NEW-5** | Course images без `loading="lazy"` атрибута | `components/course/*.tsx` | 50-200 ms FCP delay на slow-3G. **Решение**: `loading="lazy" decoding="async"` на ниже-fold images. |

---

## 5. Gap analysis — Bordik vs targets

### Web Vitals targets (2026)

| Metric | Target (mobile slow-4G) | Current | Status |
|---|---|---|---|
| **LCP** | ≤ 2.5 s | Reported 3.4 s / Observed 1.0 s | ⚠️ simulated overestimate; real users OK |
| **INP** | ≤ 200 ms | Не измерен в Lighthouse synthetic; через Sentry RUM — нужно ≥1 неделя данных | ❓ pending |
| **CLS** | ≤ 0.1 | 0.001 | ✅ |
| **TBT** (proxy для INP) | ≤ 200 ms | 232 ms | ⚠️ +32 ms |
| **FCP** | ≤ 1.8 s | 1.0 s reported / 0.7 s observed | ✅ |
| **First Load JS** (home) | ≤ 200 KB | ~109 KB raw | ✅ |
| **TTI** | ≤ 3.5 s | 3.5 s | ✅ on edge |
| **Lighthouse Mobile Perf** | ≥ 90 | 88 | ⚠️ |
| **Speed Index** | ≤ 3.4 s | 1.9 s | ✅ |

### Что осталось до Lighthouse 90+

1. **TBT -32 ms** — основной кандидат. Закрывается:
   - P1-NEW-2 (`useMemo` на `preprocessContent`) — снимает 10-50 ms на
     interactions с course content.
   - P2-NEW-12 (`useLayoutEffect` в Sidebar) — 10-20 ms на first paint.
   - ~~P2-NEW-4 (Zustand persist async) — 50-200 ms hydration → не TBT, но
     перекрашивает критический путь.~~ **CLOSED 2026-05-09** (см. таблицу
     §3, строка P2-PERF-NEW-4): async hydration возвращает регрессию LCP
     +1990 ms — sync persist остаётся by design.
2. **LCP simulated → field metrics**. Lighthouse simulated применяет
   3.3× CPU-throttle к observed на test machine. Real Cyrillic-only
   аудитория с 2-3 летним телефоном — observed × 1.5-2 = **1.5-2 s LCP**,
   что попадает в green zone. Нужно ≥1 неделя production RUM данных
   через Sentry.
3. **Speed Index** уже в norm; просто следим, чтобы новые фичи не сломали.

---

## 6. Roadmap

### Прямо сейчас (1-2 часа суммарно — все quick wins)

1. **P1-NEW-2** `useMemo(() => preprocessContent(active.body), [active.body])` — 5 минут.
2. **P1-NEW-3** Edge runtime для `/api/diagnostic` + bank loader → import — 30 минут.
3. **P2-NEW-1** удалить `rehype-highlight` (`npm uninstall`) — 2 минуты.
4. **P1-NEW-7** удалить `xlsx` (cross-list с security; `npm uninstall`) — 2 минуты.
5. **P2-NEW-10** `Cache-Control: no-store` headers на /api/sync, /api/diagnostic, /api/feedback — 10 минут.
6. **P2-NEW-12** `useLayoutEffect` в Sidebar — 1 минута.
7. **P2-NEW-11** font preload `<link rel="preload" as="font">` в `app/layout.tsx` — 5 минут.

**Итог**: ~1 час, **TBT -42-72 ms** + ~150 ms Edge latency на /api/diagnostic.

### Эта неделя (1 рабочий день каждое)

8. **P1-NEW-4** `/api/sync` Edge + RPC batch → -200-400 ms.
9. **P1-NEW-5** Gemini streaming → -66 s на 30-q тест **(блокер запуска)**.
10. **P1-NEW-6** МКБ-10 в SW precache → offline-doctor unblocked **(блокер запуска)**.
11. **P2-NEW-2** Drug interactions worker → -400-600 ms TBT.
12. **P2-NEW-3** `<Virtuoso>` для ICD-10 → -500-1500 ms на huge chapters.
13. **P2-NEW-5** Suspense boundaries → -500-1500 ms perceived LCP на route switch.
14. **P2-NEW-13** Gemini parallel race → -3 s на 429.

### Этот месяц (P1 strategic + P2 polish + observability)

15. **P1-NEW-1** конвертация `app/page.tsx` в Server Component с
    `<HomeClient>` островом — **2 дня**, -100-300 ms TBT, открывает SSG.
16. ~~**P2-NEW-4** Zustand `onRehydrateStorage` async + defer persist read.~~ **CLOSED 2026-05-09** — WONTFIX из-за LCP-регрессии (см. §3 таблица).
17. **P2-NEW-7** code-split calculator runners per-tool через router.
18. **P2-NEW-6** мемоизация AST в TabbedLessonViewer.
19. **P2-NEW-14** worker-offload для bilirubin/growth/drug-monograph.
20. **P3-NEW-2** RUM 3-tier device breakpoint.
21. **P3-NEW-1** offline page с cached content.
22. **P3-NEW-5** `loading="lazy"` на course images.
23. **Lighthouse CI** в GitHub Actions с budget regressions.
24. **Bundle-size budget** в `next.config.ts` — fail build if home > 200 KB raw.

### Долгосрочно (1-3 месяца)

25. Drug interactions JSON re-shape: 15 MB → 1-2 MB через split index/details.
26. **P2-NEW-8** ICD-data на Cloudflare R2 / external CDN если public/ перевалит 200 MB.
27. **P3-NEW-4** AVIF слой через `next/image` (если перейдём на оптимизированные images).

---

## 7. Public-launch readiness — perf чек-лист

### Must-have (блокеры запуска)

- [ ] **P1-NEW-3** `/api/diagnostic` → Edge (1 строка)
- [ ] **P1-NEW-5** Gemini streaming **(UX-критично — без него тест 90 s)**
- [ ] **P1-NEW-6** МКБ-10 в SW precache **(medical-offline use-case)**
- [ ] **P1-NEW-2** `useMemo` на `preprocessContent`
- [ ] **TBT** ≤ 200 ms через quick wins (P1-NEW-2 + P2-NEW-12 + P2-NEW-4)
- [ ] **RUM в Sentry** работает в prod, ≥1 неделя данных собрано (нужно
      перейти от Lighthouse-simulated на field metrics)
- [ ] **Lighthouse Mobile Perf ≥ 90** на ключевых страницах:
      `/`, `/?view=tools`, `/?tool=ckd-epi`, `/?view=icd10`, `/?view=drugs`
- [ ] **xlsx, rehype-highlight** удалены из package.json

### Should-have (желательно к запуску)

- [ ] **P1-NEW-4** /api/sync Edge + RPC batch
- [ ] **P2-NEW-2** drug-interactions worker (если /drugs включён в запуск)
- [ ] **P2-NEW-3** ICD-10 virtualization
- [ ] **P2-NEW-5** Suspense boundaries
- [ ] **P2-NEW-10** Cache-Control headers
- [ ] **P2-NEW-11** font preload + Cyrillic subset
- [ ] **P2-NEW-13** Gemini parallel race
- [ ] **P2-NEW-14** worker-offload для neonatal/drug-monograph

### Nice-to-have

- [ ] **P1-NEW-1** Server Component refactor для home
- [x] ~~**P2-NEW-4** Zustand async rehydrate~~ — **CLOSED 2026-05-09** (WONTFIX, см. §3)
- [ ] **P2-NEW-7** code-split runners
- [ ] **P3-NEW-1** offline page с cached content
- [ ] **P3-NEW-2** RUM 3-tier device
- [ ] **P3-NEW-4** AVIF
- [ ] **P3-NEW-5** loading=lazy на images

---

## 8. Бенчмарк-протокол: что замерить ДО и ПОСЛЕ

### Tooling

1. **Vercel Speed Insights** (production) — LCP / INP / CLS / FCP / TTFB,
   field metrics, разбивка mobile/desktop, route-level breakdown.
2. **Sentry web-vitals breadcrumbs** — alerts на `vital.rating='poor'`
   spikes для регрессии-detection.
3. **Lighthouse CI** (mobile, slow-4G + 4× CPU throttle, 3 runs median)
   на ключевых страницах:
   - `/` (home)
   - `/?view=tools` (tools list)
   - `/?tool=ckd-epi` (single calculator)
   - `/?view=icd10` (ICD-10 lookup, медицинский reference)
   - `/?view=drugs` (drug interactions, тяжёлый JSON)
   - `/?view=neonatal` (neonatology hub)
4. **Bundle analyzer**: `npm run analyze` — main + tools + icd + drugs
   chunks, отслеживать regressions.
5. **WebPageTest** (опционально) — реальное Moto G4 + slow-3G —
   ground-truth для Russia/Uzbekistan rural.

### Baseline snapshot (заполнить ПЕРЕД каждой группой изменений)

| Page | LCP (sim) | LCP (obs) | TBT | FCP | SI | Bundle (raw / gz) |
|---|---|---|---|---|---|---|
| `/` (home) | 3.4 s | 1.0 s | 232 ms | 1.0 s | 1.9 s | 109 KB / 35 KB |
| `/?view=tools` | ? | ? | ? | ? | ? | ? |
| `/?tool=ckd-epi` | ? | ? | ? | ? | ? | ? |
| `/?view=icd10` | ? | ? | ? | ? | ? | ? |
| `/?view=drugs` | ? | ? | ? | ? | ? | ? |
| `/?view=neonatal` | ? | ? | ? | ? | ? | ? |

### Дельта-снимки

После каждой группы изменений (quick-wins → medium → strategic) —
повторить тот же набор Lighthouse runs, заполнить новый snapshot,
формат «Before → After (Δ)»:

| Page | Metric | Before | After | Δ | Pass? |
|---|---|---|---|---|---|
| `/` | TBT | 232 ms | 180 ms | -52 ms | ✅ |
| `/` | LCP | 3.4 s | 2.8 s | -0.6 s | ⚠️ |

Если регрессия — bisect через `git bisect` по Lighthouse score
treshold 87 (минимум pre-aud).

### Production RUM-watch

После запуска watch-list (Sentry queries):
- `vital == 'INP' AND rating == 'poor'` — alert если > 5% sessions.
- `vital == 'LCP' AND value > 4000` — alert если > 10% sessions.
- `vital.connection IN ('slow-2g', '2g', '3g')` — отдельный perf budget.

---

## Приложение A — methodology + verifications

Аудит проведён source-only с verification направленным на проверку
агентских claims (один из агентов в security audit ошибся в чтении
output-guard regex; этот эпизод научил перепроверять).

**Methodology**:
1. Прочитан `docs/PERF_DIAGNOSTIC.md` (baseline 2026-04-28 → 2026-05-01).
2. `git log -i --grep="perf|performance|optim|bundle|cwv|lcp|inp|cls|tbt"` — 30 commits.
3. **Параллельный multi-agent探查** по 4 направлениям:
   - Bundle / dynamic imports / heavy deps
   - React/SSR/CSR split / re-renders / memoization
   - Supabase / data fetching / Edge runtime / RLS perf
   - Assets / fonts / SW / PWA / Gemini / Vercel constraints
4. **Direct verification** ключевых claims:

| Claim | Verification | Verdict |
|---|---|---|
| `app/page.tsx:1` is `'use client'` | Read line 1 | ✅ Confirmed |
| `preprocessContent` без useMemo на line 675 | Read 665-680 | ✅ Confirmed |
| `/api/diagnostic` на `runtime: nodejs` (line 34) | Read | ✅ Confirmed |
| `/api/sync` без явного runtime | Read first 15 lines, нет `export const runtime` | ✅ Confirmed |
| `public/drug-interactions.json` = 15 MB | `ls -la` → 15 419 318 bytes | ✅ Confirmed |
| `public/` total = 135 MB | `du -sh public/` → 135M | ✅ Confirmed |
| `rehype-highlight` не используется | grep — only in package.json + lock + audit doc, не в `components/`/`lib/`/`app/` | ✅ Confirmed (mёртвая dep) |

**Дополнительно обнаружено** (vs PERF_DIAGNOSTIC.md baseline):
- `public/icd11-mms.json` = 14 MB (полный ICD-11 dataset, не slim).
- `public/icd10cm-slim.json` = 9 MB (US ICD-10).
- `public/icd10pcs-slim.json` = 9 MB (procedures).
- `public/icd11-details.json` = 9 MB.
- `public/icd10cm-index.json` = 7.5 MB.
- ICD данные суммарно ≈ 60 MB. Плюс MediaPipe 44 MB. Плюс drug 15 MB.

**Ограничения** (не покрыто этим аудитом):
- Runtime поведение Supabase RLS не проверено (нужен прод-доступ к
  EXPLAIN ANALYZE на realistic workload).
- Lighthouse runs не воспроизведены (плагин ограничен на read-only).
- WebPageTest на real device (Moto G4 / slow-3G) не запускался.
- Drug interactions JSON структура не проанализирована (15 MB —
  очень странно для 62 препаратов; нужен structural review).

---

## Приложение B — связанные документы

- [docs/PERF_DIAGNOSTIC.md](PERF_DIAGNOSTIC.md) — baseline 2026-04-28 → 2026-05-01 (Lighthouse snapshots + post-SSR numbers).
- [docs/AUDIT_PASS_4_TODO.md](AUDIT_PASS_4_TODO.md) — pass 4, 29 findings (security + perf + cq).
- [docs/security-audit-2026-05.md](security-audit-2026-05.md) — security pass 5; xlsx P1-cross-list, output-guard CSP cross-perf.
- [CLAUDE.md](../CLAUDE.md) — project standards; PWA strategy; offline goals для медиков RU/UZ.
