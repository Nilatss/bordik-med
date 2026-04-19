# Stress Test Report — TODO на завтра

> Дата отчёта: 2026-04-20
> Состояние на момент отчёта: **428/719 runners готово (59.5%)**, последний коммит `b098423`

---

## ✅ Что прошло чисто (трогать не нужно)

| Проверка | Результат |
|---|---|
| `npx tsc --noEmit` | 0 ошибок |
| `next build` prod | ✓ за 5.3 s, static export OK |
| Дубликаты runner id в `lib/runners/index.ts` | нет |
| Registry ↔ файлы | 428 ↔ 428, 0 рассинхронов |
| Все runners имеют `kind`, `inputs`, `export default` | ✓ |
| `@ts-nocheck` в каждом runner | 428/428 |
| `console.log` / `TODO` / `FIXME` в hot-коде (components/tools/, lib/runners/index.ts) | пусто |
| ToolView error handling (`compute` в try/catch → `null`) | ✓ |
| Код-сплит сработал | 448 чанков, avg runner ≤10 KB, суммарно 6.2 MB |

---

## ⚠️ Проблемы — фиксить в этом порядке

### 🔴 1. 5 high-severity CVE в dead dependency

- **Что:** `@ducanh2912/next-pwa` установлен в `package.json`, но **нигде не используется** (`grep -rE "next-pwa" app/ components/ lib/` — пусто; `next.config.ts` не импортирует `withPWA`).
- **Риск:** тянет транзитивно уязвимый `serialize-javascript` (RCE через RegExp.flags + CPU DoS) через `workbox-build` / `@rollup/plugin-terser`.
- **Фикс (5 мин):**
  ```bash
  npm uninstall @ducanh2912/next-pwa
  npm audit
  ```
  Ожидаемо: 5 high → 0. Ничего не сломается, т.к. пакет никем не импортируется.

### 🔴 2. PWA не работает — нет офлайн-доступа

- **Что:** пакет next-pwa висит зомби, но SW не зарегистрирован, offline-cache пустой. В критической ситуации (плохая связь в отделении / приёмнике) ранее открытые инструменты **не откроются повторно без интернета**.
- **Решение на выбор:**
  - (A) Вкрутить `withPWA` в `next.config.ts` с precache на главные чанки + runtime-cache на runner-чанки (`/_next/static/chunks/...`).
  - (B) Явно задокументировать «офлайн не поддерживается» и удалить пакет (см. п.1).
- **Рекомендация:** (A) — для мед-приложения офлайн критичен. Потребует настройки `next-pwa@10.2.9` + SW manifest + добавить в `app/layout.tsx` `<link rel="manifest">`.

### 🟠 3. 12 orphan-runners — написаны, но не видны в каталоге

Существуют файлы в `lib/runners/`, но id отсутствует в `lib/tools-catalog.ts`. В UI недоступны через каталог, только если юзер знает id и руками вбьёт в URL.

**Список:**
```
wells-pe, gbs, pf-ratio, winter, audit-c, cage,
ottawa-ankle, bisap, wfns, aims65, act, lille
```

**Вероятная причина:** переименования в каталоге. Соответствия:
- `wells-pe` → в каталоге `wells-pe` отсутствует, есть только `wells-dvt`
- `gbs` → в каталоге `hughes-gbs`
- `cage` → в каталоге `cage-audit`
- `audit-c` → в каталоге `cage-audit`
- остальные — надо проверить вручную

**Решения на выбор (для каждого orphan):**
1. Добавить запись `T('<id>', ...)` в `tools-catalog.ts`
2. Переименовать runner-файл + ключ в `index.ts` под существующий catalog id
3. Удалить runner, если он дубликат

### 🟠 4. Duplicate id `npi` в каталоге

- **Где:** `lib/tools-catalog.ts:364` (`NPI — Neuropsychiatric Inventory`, деменция) и `:634` (`Nottingham Prognostic Index`, онкология).
- **Проблема:** один id на два клинически разных инструмента. В поиске/фильтрах второй затирается первым.
- **Фикс:** переименовать строку 634 → `npi-breast` (или `npi-nottingham`).

### 🟡 5. 303 инструмента каталога без runner'а (42.1%)

- Показывают «СКОРО». Это ожидаемо по прогрессу (428/719), но:
- В критической ситуации врач не сможет найти, скажем, PECARN-cspine — это фрустрирует.
- **Решение:** в «СКОРО»-карточке добавить fallback-ссылку на MDCalc по id (если у тула есть английское соответствие) или на `reference` автора.
- **Долгосрочно:** добить 303 шт. — это 30+ батчей.

### 🟡 6. Runtime smoke-test не проведён

- `tsc` ловит типы, но не ловит runtime-crash внутри `compute()` при специфических значениях (деление на ноль, `NaN`, `undefined` в select).
- UI прикрыт try/catch → «тихо пустой результат». Врач вбьёт значения, получит пустоту, подумает что сломалось.
- **Нужно:** написать `scripts/smoke-runners.mjs`, который через `tsx` подгружает каждый runner, вызывает `compute()` с дефолтными значениями из `inputs[].quickValues?.[0]` или `options?.[0].value`, ловит throw. Репортит список упавших.

---

## Порядок работ завтра

1. **(5 мин)** `npm uninstall @ducanh2912/next-pwa` + `npm audit` → коммит `chore(deps): remove unused next-pwa (5 high CVE)`
2. **(10 мин)** Переименовать дубль `npi` → `npi-breast` в `lib/tools-catalog.ts:634`. Ничего в `lib/runners/` не меняется (там ни одного нет).
3. **(30 мин)** Разобрать 12 orphan-runners: по каждому решить add/rename/delete. Отдельным коммитом.
4. **(1 ч)** Написать `scripts/smoke-runners.mjs`. Прогнать. Починить упавшие.
5. **(по решению)** Либо (A) вкрутить PWA с нуля, либо (B) удалить next-pwa окончательно и забыть. Вариант (A) — 2-3 часа с тестом offline.
6. Продолжить по плану: Re-add Cat 9 Психиатрия (18 шт.), потом Cat 10-22 (~273 шт.).

---

## Полезные команды для проверки после фиксов

```bash
# TypeCheck
npx tsc --noEmit

# Prod build
npx next build

# Registry integrity
node -e "
const fs = require('fs');
const src = fs.readFileSync('lib/tools-catalog.ts', 'utf8');
const catSet = new Set([...src.matchAll(/T\(\s*'([\w-]+)'/g)].map(m=>m[1]));
const reg = fs.readFileSync('lib/runners/index.ts', 'utf8');
const ids = [...reg.matchAll(/\"([\w-]+)\":\s*\(\)\s*=>/g)].map(m=>m[1]);
const runnerIds = new Set(ids);
console.log('Catalog:', catSet.size, 'Runners:', runnerIds.size);
console.log('Orphans:', [...runnerIds].filter(id=>!catSet.has(id)));
console.log('Duplicates in catalog:', [...src.matchAll(/T\(\s*'([\w-]+)'/g)].map(m=>m[1]).filter((id,i,a)=>a.indexOf(id)!==i));
"

# Security audit
npm audit --omit=dev
```
