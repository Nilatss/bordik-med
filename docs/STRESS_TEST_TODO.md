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

### 🟠 7. Тест-раннер: UX кнопок + отсутствует таймер

**Файл:** `components/course/TestActiveView.tsx:236-250`

**Что не так:**
- Внизу карточки слева кнопка «Отменить» — но в UX-паттерне тестов там ожидается «← Назад» (к предыдущему вопросу).
- «Отмена» (выйти из теста целиком) — это деструктивное действие, должна быть в другом месте: в шапке теста (крестик ✕ в правом верхнем углу карточки прогресса) или как текст-ссылка под основной кнопкой «Завершить тест».
- **Нет таймера**. Тест должен идти 1 час — нужен обратный отсчёт 60:00 → 00:00, при истечении автозавершение с показом «Время вышло».

**Как должно быть (предложение):**

```
┌──────────────────────────────────────────────┐
│ ТЕСТ 1 — ОСНОВЫ        ⏱ 58:24       ✕      │  ← таймер + выход
│ Вопрос 3 из 20                                │
│ ▓▓▓░░░░░░░░░░░░░░░░░                          │
├──────────────────────────────────────────────┤
│ [Вопрос + варианты A/B/C/D]                   │
├──────────────────────────────────────────────┤
│ [← Назад]                        [Далее →]    │  ← назад к пред. вопросу
└──────────────────────────────────────────────┘
            Прервать тест (ссылка-подтверждение)
```

**Что надо сделать:**
1. Переименовать кнопку «Отменить» → «← Назад». Логика: `setCurrentQ(q => Math.max(0, q - 1))`. Disabled на первом вопросе.
2. Перенести «Отменить» → крестик ✕ в правом верхнем углу прогресс-карточки (строка с «Вопрос N из M»). С `confirm()` или модалкой «Вы уверены? Прогресс не сохранится».
3. Добавить `useTimer` хук:
   ```ts
   const [timeLeft, setTimeLeft] = useState(3600); // 60 мин в сек
   useEffect(() => {
     const t = setInterval(() => setTimeLeft(v => v - 1), 1000);
     return () => clearInterval(t);
   }, []);
   useEffect(() => {
     if (timeLeft <= 0) finishTest();
   }, [timeLeft]);
   ```
   Отображение: `${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,'0')}`.
4. При `timeLeft < 300` (последние 5 мин) — подсветить таймер оранжевым, при `< 60` — красным + pulse-анимация.
5. Сохранять `startedAt` в localStorage на случай перезагрузки страницы: `timeLeft = 3600 - Math.floor((Date.now() - startedAt) / 1000)`.

**Оценка времени:** 1-1.5 часа вместе с модалкой подтверждения выхода.

### 🟠 8. Test Guard: предупреждение ДО начала + grace-period 10 сек + 48ч блокировка

**Файл:** `components/course/TestGuard.tsx` (+ новый `TestStartConsent.tsx` + `TestActiveView.tsx`)

**Что не так сейчас:**
- Модалка «Нарушение зафиксировано» появляется **после** первого свёртывания вкладки — пользователь не знает правил заранее.
- Нет grace-period: моргнул alt-tab'ом случайно → сразу нарушение.
- После трёх нарушений тест просто завершается, но можно тут же пересдать — санкций нет.

**Что нужно добавить:**

#### 8.1. Consent-экран ПЕРЕД стартом теста
Перед кнопкой «Начать тест» — модалка с правилами:
```
┌────────────────────────────────────────────┐
│  ⚠  Правила прохождения теста               │
├────────────────────────────────────────────┤
│ Во время теста ЗАПРЕЩЕНО:                  │
│  • Переключаться на другие вкладки/окна     │
│  • Сворачивать браузер                      │
│  • Открывать режим разработчика (F12)       │
│  • Копировать вопросы                       │
│                                             │
│ При нарушении:                              │
│  • 1-е — предупреждение, 10 сек на возврат  │
│  • 2-е — предупреждение, 10 сек на возврат  │
│  • 3-е — тест завершается, попытка          │
│    не засчитывается                         │
│  • Повторная попытка — через 48 часов       │
│                                             │
│ Время на тест: 60 минут                     │
│                                             │
│  [ ] Я прочитал и согласен с правилами      │
│                                             │
│           [Отмена]    [Начать тест]         │
└────────────────────────────────────────────┘
```
Кнопка «Начать тест» активна только после чекбокса.

#### 8.2. Grace-period 10 сек при нарушении
Сейчас логика в `TestGuard.tsx:37` — мгновенный counter++. Надо:
1. При `visibilitychange` (hidden) → запустить 10-сек таймер.
2. Если вернулся до истечения → **не считать нарушением**, показать короткое уведомление «Вернитесь в окно, осталось 7 сек» (обратный отсчёт).
3. Если 10 сек истекли вне вкладки → тогда `violationCount++`, показать модалку.
4. При `violationCount >= 3` → завершить тест + пометить как `failed_with_violation`.

**Алгоритм в коде:**
```ts
const GRACE_MS = 10_000;
const [awayTimer, setAwayTimer] = useState<number | null>(null);
const [awaySecondsLeft, setAwaySecondsLeft] = useState(10);

useEffect(() => {
  const onVis = () => {
    if (document.hidden) {
      // запустили grace-период
      const startedAt = Date.now();
      const tick = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        setAwaySecondsLeft(Math.max(0, Math.ceil((GRACE_MS - elapsed) / 1000)));
        if (elapsed >= GRACE_MS) {
          clearInterval(tick);
          registerViolation(); // только здесь
        }
      }, 200);
      setAwayTimer(tick as any);
    } else {
      // вернулся — отменить grace
      if (awayTimer) { clearInterval(awayTimer); setAwayTimer(null); }
      setAwaySecondsLeft(10);
    }
  };
  document.addEventListener('visibilitychange', onVis);
  return () => document.removeEventListener('visibilitychange', onVis);
}, [awayTimer]);
```
UI: если `awayTimer !== null` и `!document.hidden` (только что вернулся, grace ещё не засчиталось) — показать toast «⚠ Вы отсутствовали — больше так не делайте».

#### 8.3. 48-часовой lockout
1. В localStorage: при `failed_with_violation` писать `test_lockout_<testId> = Date.now() + 48*60*60*1000`.
2. В TabbedLessonViewer (где запускается тест) — проверять ключ перед запуском:
   ```ts
   const lockout = Number(localStorage.getItem(`test_lockout_${testId}`) || 0);
   if (lockout > Date.now()) {
     const hoursLeft = Math.ceil((lockout - Date.now()) / 3_600_000);
     return <LockoutNotice hoursLeft={hoursLeft} />;
   }
   ```
3. Компонент `LockoutNotice`: «Тест временно недоступен. Повторная попытка будет доступна через ~X часов (DD.MM.YYYY в HH:MM)».
4. **Важно:** localStorage можно обойти через DevTools. Для реальной блокировки нужно хранить на backend — отметить в TODO отдельным пунктом когда появится backend для tests.

**Оценка времени:** 2 часа (consent + grace logic + lockout + тестирование всех trigger'ов).

### 🟠 9. Дубликат таба «Источник» в правой TOC у инструментов

**Файл:** `components/tools/ToolView.tsx:118-126`

**Что не так:** если `runner.info` содержит секцию `### Источник`, `buildInfoTabs()` создаёт для неё таб. Затем `referenceTab` добавляется отдельно строкой 119-125 → получается два таба «Источник» подряд (видно на скриншоте insulin-correction).

**Фикс:**
```ts
// В buildInfoTabs (или после):
const infoTabs: Tab[] = (runner.info ? buildInfoTabs(runner.info) : [])
  .filter(t => t.title.trim().toLowerCase() !== 'источник');
```
Тогда встроенный `### Источник` в markdown игнорируется, остаётся только дедикейтед `referenceTab`.

**Проверка:** пройтись по всем 428 runners, у кого в `info:` есть `### Источник` — либо убрать секцию (дублирует `reference:`), либо пусть TOC-фильтр её режет. Второй путь проще.

---

### 🟠 10. Формулы рендерятся как inline-code с обратными кавычками

**Файл:** `components/tools/ToolView.tsx` (markdown renderer для info-табов) + все runner-файлы с формулами

**Что не так:** в info-блоке формулы написаны как `Коэффициент коррекции CF = 1800 / TDD` (бэктики) → рендерятся одной серой плашкой в которую слипаются подписи «— быстродействующие аналоги». Выглядит как код-кашу (видно на скриншоте insulin-correction → Формулы).

**Что нужно:**
1. Ввести единый визуальный паттерн формул — `<div class="formula">` блочный, с нормальным шрифтом (JetBrains Mono для переменных, обычный для текста), серым фоном, отступами. Не inline-backticks.
2. В runner info использовать либо fenced code-block ` ```formula ... ``` ` с кастомным `components.code` в react-markdown, либо markdown-таблицу:
   ```
   | Формула | Описание |
   |---|---|
   | CF = 1800 / TDD | быстродействующие аналоги |
   | CF = 1500 / TDD | короткий человеческий инсулин |
   | I:C ratio = 500 / TDD | грамм углеводов на 1 Ед |
   ```
3. Пройтись по всем 428 runners grep'ом на `` ` `` внутри `info:` и привести к единому стилю.

**Grep для поиска:**
```bash
grep -lE "info:.*\\\\`" lib/runners/*.ts
# или найти runners с формулами в info
grep -lE "###\s*Формулы" lib/runners/*.ts
```

**Оценка:** 3-4 часа (дизайн паттерна + обновить ~50-80 runners с формулами).

---

### 🟠 11. Звёздочки `**...**` рендерятся буквально вместо bold

**Файлы:** runner `.ts` в `lib/runners/` (строки с `interpretation:`, `details:`, внутри `actions[]` и `caveats[]`)

**Что не так:** в клинической интерпретации (скриншот DOAC) вылезает `**dabigatran · vteProph**` буквальным текстом с `**`. Причина: эти поля отображаются как plain text (или text-component без markdown parse), а в runner код был написан с markdown-разметкой.

**Два пути фикса:**
- **(A)** Убрать `**` из всех runner полей `interpretation` / `details` / `actions[]` / `caveats[]` — не использовать markdown там, где не рендерится.
- **(B)** Пропустить эти поля через `<ReactMarkdown>` — тогда `**word**` станет `<strong>`.

**Рекомендация:** (A) быстрее и безопаснее. Для выделения завести отдельное поле `highlights?: string[]` или ключевое слово `<strong>` через JSX в компоненте результата.

**Grep-скан:**
```bash
grep -cE "\\*\\*[^*]+\\*\\*" lib/runners/*.ts | grep -v ":0"
```
→ список runners со звёздочками внутри. Пройти sed'ом: `sed -i 's/\*\*\([^*]\+\)\*\*/\1/g' lib/runners/*.ts` — но аккуратно, не трогать info (там markdown валиден).

**Альтернатива:** запустить скрипт который парсит TS AST и чистит звёздочки только в `interpretation`/`details`/`actions`/`caveats`, не трогая `info`.

**Оценка:** 1 час (скрипт + прогон + точечные правки).

---

### 🟠 12. Длинные тире (em-dash `—`) → короткие (en-dash `–` или дефис `-`)

**Где искать:**
```bash
grep -rn "—" lib/runners/ lib/tools-catalog.ts components/ 2>/dev/null | wc -l
# ожидаемо тысячи — em-dash везде в русском тексте
```

**Решение пользователя (уточнено):** заменить все em-dash `—` (U+2014) на hyphen-minus `-` (U+002D).
Также проверить en-dash `–` (U+2013) — его тоже заменить на `-`.

**Что делать:**
```bash
# Один проход по всей кодовой базе (исключая node_modules, .next, .git)
find lib app components -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" \) \
  -exec sed -i 's/—/-/g; s/–/-/g' {} \;

# Проверка что нигде не осталось
grep -rnE "[—–]" lib app components --include="*.ts" --include="*.tsx" --include="*.md"
```

**⚠️ Осторожно:**
- НЕ трогать `node_modules/`, `.next/`, `.git/`
- Проверить что в `.claude/` тоже не затерлось что-то важное
- После замены прогнать `npx tsc --noEmit` и `next build` — возможны регрессии если где-то `—` был частью специфичного regex или test fixture
- Для unicode-safe работы с sed на Windows — использовать `gsed` из git-bash или запустить через node-скрипт (иначе sed может сломать кодировку)

**Альтернатива sed — node-скрипт** (кроссплатформенно, безопасно):
```js
// scripts/normalize-dashes.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import fg from 'fast-glob';
const files = await fg(['lib/**/*.ts', 'components/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', '**/*.md'], {
  ignore: ['node_modules', '.next', '.git']
});
let total = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const out = src.replace(/[—–]/g, '-');
  if (out !== src) { writeFileSync(f, out); total++; console.log('✓', f); }
}
console.log('Modified:', total, 'files');
```

**Оценка:** 15 мин (скрипт + прогон + typecheck + визуальный контроль ~10 инструментов).

---

### 🟠 13. Баг «Powered by Bordik» под компонентом

**Файл:** вероятно `components/course/DownloadableTable.tsx:120` (`footer.textContent = 'Powered by Bordik · bordik.academy'`) — утекает в DOM не только при PDF-экспорте, но и при обычном рендере.

**Что проверить:**
```bash
grep -rnE "Powered by|powered by" components/ app/ 2>/dev/null
```
→ единственное вхождение `DownloadableTable.tsx:120`. Значит этот компонент где-то рендерится в live-страницу, хотя предназначался для PDF.

**Фикс:**
1. Найти где используется `DownloadableTable` — должен вызываться только в обработчике «Скачать PDF», не в основном рендере.
2. Если он в JSX tree — обернуть footer с watermark в условие `if (renderForExport)`.
3. Проверить что на всех страницах инструмента/курса ничего не показывает «Powered by Bordik».

**Оценка:** 30 мин.

---

### 🟠 14. Баги шкалы результата (Kigali и подобные)

**Файл:** `components/tools/ToolView.tsx` (scale rendering section) или отдельный `ScaleBar.tsx`

**Что не так на скриншоте Kigali:**
- Текущий маркер стоит на `100 SF`, но зона «Тяжёлый» (< 100) визуально занимает крохотный левый край, остальное — пустая серая зона
- Подпись «500 SF» справа обрезана/смещена
- Цветовые полосы сегментов не заполнены — белое пространство между `Тяжёлый` и `Средний`

**Причины (гипотезы):**
- `ScaleSegment.min/max` в runner'е Kigali заданы с пробелами: `[{min:0,max:100},{min:100,max:235},...]` — но есть runners где интервалы не покрывают всю шкалу, образуя дыры.
- Текущее значение (`current`) выходит за пределы `max` последнего сегмента → рендер сдвигается.
- Подписи не вмещаются когда сегментов много (>4).

**Что нужно:**
1. Найти компонент шкалы (`grep -rn "ScaleSegment\|scale:" components/tools/`).
2. Добавить валидацию: непрерывность сегментов, `current` clamp'ится в `[segments[0].min, segments.last.max]`.
3. Для Kigali и похожих runners проверить `scale.segments` — заполнить дыры, убрать overlap.
4. Label-overflow: длинные подписи вниз-в-angle или tooltip при наведении.

**Инструменты под подозрением** (`grep -l "scale:" lib/runners/*.ts | wc -l` → сколько runners имеют scale — пройти все).

**Оценка:** 2-3 часа (починить компонент + прогнать валидацию по всем ~150-200 runners со scale).

---

## Порядок работ завтра

1. **(5 мин)** `npm uninstall @ducanh2912/next-pwa` + `npm audit` → коммит `chore(deps): remove unused next-pwa (5 high CVE)`
2. **(10 мин)** Переименовать дубль `npi` → `npi-breast` в `lib/tools-catalog.ts:634`. Ничего в `lib/runners/` не меняется (там ни одного нет).
3. **(30 мин)** Разобрать 12 orphan-runners: по каждому решить add/rename/delete. Отдельным коммитом.
4. **(1 ч)** Написать `scripts/smoke-runners.mjs`. Прогнать. Починить упавшие.
5. **(1-1.5 ч)** Test UX: «Назад» вместо «Отменить» + ✕ выход в шапке + таймер 1 ч с автозавершением. Файл `components/course/TestActiveView.tsx`. См. п.7.
6. **(2 ч)** Test Guard: consent-экран правил + grace 10 сек + 48ч lockout. Файлы `components/course/TestGuard.tsx` + новый `TestStartConsent.tsx`. См. п.8.
7. **(5 мин)** Дубликат «Источник» в TOC — фильтр в `buildInfoTabs`. См. п.9.
8. **(30 мин)** Убрать «Powered by Bordik» из live-рендера. См. п.13.
9. **(1 ч)** Убрать `**...**` из `interpretation`/`details`/`actions`/`caveats`. См. п.11.
10. **(15 мин)** Тире: `—` и `–` → `-` (дефис-минус). Node-скрипт в п.12.
11. **(3-4 ч)** Формулы: единый паттерн, обновить ~50-80 runners. См. п.10.
12. **(2-3 ч)** Баги шкалы: валидация сегментов, clamp current, пройти все runners со scale. См. п.14.
13. **(по решению)** Либо (A) вкрутить PWA с нуля, либо (B) удалить next-pwa окончательно и забыть. Вариант (A) — 2-3 часа с тестом offline.
14. Продолжить по плану: Re-add Cat 9 Психиатрия (18 шт.), потом Cat 10-22 (~273 шт.).

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
