# Large-Dataset Section Pattern

> **Цель:** любой раздел Bordik с >5 000 записей (МКБ-10, МКБ-11, drug interactions, гайдлайны) должен загружаться <2 сек на 4G и не лагать на typing/scroll.
>
> Этот документ — checklist для новых разделов и playbook для оптимизации существующих.

## Опорный пример: МКБ-11 (34 663 кода)

### Метрики до оптимизации
| | First load | Search keystroke | Memory |
|---|---|---|---|
| Naive | 9.5 МБ raw / 1.85 МБ gzip · 5-15 сек на 3G | 100-300 ms лаг | ~200 МБ |
| После | 6.8 + 2.7 МБ split, lazy · 2nd visit instant | <5 ms (transparent) | ~60 МБ |

## Архитектурные слои

### Слой 1 — **Service Worker CacheFirst**
Файл: `app/sw.ts`. Любой большой data-файл получает правило:
```ts
{
  matcher: ({ url }) => /^\/big-data\.json$/.test(url.pathname),
  handler: new CacheFirst({
    cacheName: 'bordik-<section>',
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 180 * 86400 })],
  }),
},
```
**Эффект:** первый визит = network fetch, все последующие = ~50 мс из cache.
**Cache bust:** через `?v=X.Y.Z` в коде клиента — обновлённый URL = другой cache key.

### Слой 2 — **Split heavy payload**
Если данные >2 МБ raw, разбиваем на:
- **Core** (что нужно сразу при открытии страницы)
- **Extension/lazy** (что нужно для редких сценариев — детали, post-coordination, history)

Lazy-часть грузится через `requestIdleCallback` после core:
```ts
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(fetchExt, { timeout: 5000 });
} else {
  setTimeout(fetchExt, 1500);
}
```

Скрипт-генератор: см. `scripts/split-icd11-extensions.mjs`.

### Слой 3 — **Pre-computed search index (in-memory)**
Не используем MiniSearch — для нашего N (10-100 K) inverted index получается БОЛЬШЕ исходных данных. Используем **precomputed lowercased fields**:

```ts
// 1. При загрузке codes — один раз кэшируем lowercased поля
const indexed = useMemo(() => codes.map(c => ({
  ...c,
  _codeLc: c.code.toLowerCase(),
  _titleLc: displayTitle(c).toLowerCase().replace(/ё/g, 'е'),
})), [codes]);

// 2. Filter использует кэшированные поля — без runtime toLowerCase
const filtered = useMemo(() => {
  for (const c of indexed) {
    if (c._codeLc === query) score = 100;
    else if (c._codeLc.startsWith(query)) score = 80;
    // ... bucket по score
  }
}, [deferredQ, indexed]);
```

**Зачем bucket-сортировка вместо `.sort()`:** на 34 K элементов с одинаковым score стандартный stable sort O(n log n) делает ~500 K сравнений. Bucket сортировка по score-классам делает **по 5-7 buckets, ~10 K сравнений** — 50× быстрее.

### Слой 4 — **`useDeferredValue` для search input**
React 18+:
```ts
const [q, setQ] = useState('');
const deferredQ = useDeferredValue(q);  // low-priority work

// Filter использует deferredQ — пересчитывается в idle
const filtered = useMemo(() => /* ... */, [deferredQ]);

// Indicator когда results stale
const isStale = q !== deferredQ;
return <List style={{ opacity: isStale ? 0.5 : 1 }} />;
```

**Эффект:** input всегда обновляется мгновенно (high priority), filter pushed в low-priority queue. Печать никогда не лагает, даже на 100 K записей.

**Не используем** `setTimeout`-debounce — `useDeferredValue` лучше потому что React сам решает когда обработать в зависимости от нагрузки браузера.

### Слой 5 — **Chunked rendering для очень длинных списков**
Когда глава содержит >500 кодов (МКБ-11 0X = 16 841), не рендерим всё сразу:

```ts
const CHUNK_SIZE = 500;
const visibleCount = INITIAL + chunks * CHUNK_SIZE;
const visible = list.slice(0, visibleCount);
// + кнопка "Показать ещё 500"
```

При >5 000 элементов — `react-window` virtual scroll (TODO для drug interactions если вырастет).

## Антипаттерны

❌ **`.sort()` на каждый keystroke** — стабильная сортировка `Array.prototype.sort` это `O(n log n)` allocation-heavy
❌ **Inline `c.title.toLowerCase()` в filter** — на 34 K строк = ~10 МБ allocation на каждый keystroke, GC pressure
❌ **Loading all data upfront just because "search needs it"** — Web Worker + MessagePort для тяжёлой логики
❌ **MiniSearch для маленьких N (<10 K)** — overhead индекса больше выигрыша
❌ **Хранить full data в Zustand/Redux** — данные стабильны, useState достаточно

## Чеклист для нового раздела с >5 000 записей

- [ ] Размер raw JSON <10 МБ (gzip <2 МБ)? Если нет — split на core + lazy
- [ ] Service Worker правило в `app/sw.ts` с CacheFirst и cache bust
- [ ] Загрузка через `fetch()` с `?v=X.Y.Z` query param
- [ ] `useDeferredValue` на search input
- [ ] Pre-computed lowercased fields через `useMemo`
- [ ] Bucket-сортировка вместо `.sort()` если N >5 000
- [ ] Chunked render при N в одной группе >200
- [ ] InfoCard с правильным `codesCount` (общее, не текущее в state)
- [ ] Lighthouse perf score >90 на slow-3G profile
- [ ] No layout shift (CLS = 0) при загрузке lazy-секций

## Для МКБ-11 уже сделано
- ✅ Split: core (17 822) + extensions (16 841)
- ✅ SW CacheFirst rule
- ✅ Cache bust v=3.2.0
- ✅ Idle prefetch extensions
- ✅ useDeferredValue + precomputed _codeLc/_titleLc
- ✅ Bucket sort
- ✅ Chunked render для главы 0X

## Будущие разделы которые понадобятся такой же подход
- Drug interactions если вырастет за 2 000 пар
- Гайдлайны (планируется ~30 → 300+)
- ICD-10-CM (~73 000 кодов)
- ICD-10-PCS (~78 000 кодов)
- SNOMED-CT (если когда-нибудь интегрируем; ~350 000)
