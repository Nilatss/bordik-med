# Bordik UI Guidelines

> Правила, которые должны соблюдаться **во всех новых компонентах**.
> Если делаешь новое место поиска / новую карточку / новую страницу —
> читать этот файл перед коммитом.

## 1. Подсветка совпадений в поиске

**Всегда использовать `<Highlight/>` из `@/components/ui/Highlight`.**

Не дублировать логику в каждом компоненте. Цвет, ё-нормализация,
multi-token matching — всё уже там.

```tsx
import Highlight from '@/components/ui/Highlight';

<Highlight text={item.title} query={searchQuery} />
```

**Где применять:**
- Все dropdown-фильтры с поиском (FilterDropdown в /tools)
- Sidebar-поиск
- Cmd-K глобальный поиск
- /icd10 result list
- Drug Interaction search suggestions
- Любой новый search-input + result-list

**Цвет подсветки:** `#2563EB` (наш брендовый синий) — по умолчанию
в компоненте. Не переопределять без веской причины.

## 2. Цветовая палитра

| Назначение | Hex | Где |
|---|---|---|
| Primary text | `#1A1A1A` | заголовки, body |
| Secondary text | `#4B5563` | description |
| Muted text | `#6B7280` | подсказки |
| Disabled / labels | `#9CA3AF` | mono-meta |
| Brand blue | `#2563EB` | акценты, ссылки, highlight |
| Light blue tint | `#EFF6FF` | hover info-tone |
| Light blue border | `#DBEAFE` | info-tone border |
| Standard grey bg | `#F5F6F8` | cards, search bar, ZetDisclaimer |
| Soft hover grey | `#EFF1F4` | hover на серых элементах |
| Border light | `#F0F1F5` | разделители, рамки cards |
| Border medium | `#E5E7EB` | сильные разделители |

**НЕ использовать чёрные акценты** — везде где была «жирная чёрная
полоска» (#1A1A1A bg, #000000) — заменено на синий `#2563EB`. Если
встречаешь такое в legacy-коде — приведи к синему.

## 3. Размерная сетка типографики

Единый ритм для всех страниц:

| Уровень | Размер | Шрифт | Где |
|---|---|---|---|
| h2 page-title | 28px | display, weight 700 | заголовок страницы |
| h3 section-title | 15-16px | display, weight 700 | секции внутри страницы |
| Body primary | 14px | body | основной текст |
| Body small | 13px | body | hints, descriptions |
| Tag/meta | 12px | body | counters, dates |
| Mono-uppercase | 10-11px | mono, weight 700 | labels, бейджи |

`letterSpacing: -0.02em` для h2, `-0.01em` для h3.

## 4. Spacing (вертикальный ритм)

| Между секциями | **24px** (`marginBottom`) |
|---|---|
| Внутри карточки | 8-10px gap |
| Padding cards | 14-22px (зависит от плотности) |
| Padding pills | 4-8px |

## 5. Card-патtern

**Стандартная карточка** в каталоге:
- `background: #FFFFFF` или `#F5F6F8`
- `border: 1px solid #F0F1F5` (если белая)
- `borderRadius: 12-14`
- На hover: `background: #F5F6F8` (если белая) → `#EFF1F4`

**Hero/info-карточка**:
- `background: #F5F6F8`
- Без рамки
- `borderRadius: 14`

## 6. Анимации

- **Easing:** `[0.05, 0.7, 0.1, 1]` (cubic-bezier)
- **Duration:** 250-350 мс для входа, 150-200 мс для hover
- **Stagger:** delay 0.06-0.12 между секциями (header → search → list)
- **Reduce motion:** `prefers-reduced-motion` отключает анимации

CSS-only альтернатива framer-motion — `.bordik-fade-up` в
`app/globals.css` (используем где не хочется тащить framer-motion runtime).

## 7. Доступность

- Все интерактивные элементы должны иметь `aria-label`
- Все таблицы — настоящий `<table><tr><th><td>` (НЕ div-grid)
- Все формы — `<label htmlFor>` или `aria-label`
- Контраст текста минимум **4.5:1** к фону

## 8. Дисклеймеры

- **Медицинский**: «Не заменяет клиническое суждение» — обязательно
  на всех клин-инструментах
- **ЗЕТ**: компонент `<ZetDisclaimer/>` (`components/layout/`) —
  использовать на любой view с упоминанием обучения медиков
- **BETA**: жёлтый бейдж + явная пометка в provenance (как в
  `/drugs` чекере)

## 9. Provenance-блок

Все клинические инструменты должны иметь блок «Источник и обновление»
внизу страницы (см. `app/tools/[id]/page.tsx`, `Icd10Lookup`,
`DrugChecker`):

- `background: #F5F6F8`, `borderRadius: 14`, `padding: 20px 22px`
- Поля: Версия, Обновлено (mono), Источник, Покрытие
- Дисклеймер «Не заменяет клиническое суждение» снизу

## 10. Что НЕЛЬЗЯ

- ❌ Хардкодить чёрный `#000` или `#1A1A1A` на интерактивных
  элементах (используй синий `#2563EB`)
- ❌ Создавать локальный `<Highlight>` в новом компоненте — импортируй
  общий
- ❌ Использовать оранжевый/красный без severity-причины (только для
  warnings/errors/Phase-BETA)
- ❌ Менять размер h2 page-title (28px фиксирован)
- ❌ Дублировать ZET-дисклеймер прозой — только через `<ZetDisclaimer/>`
- ❌ Использовать framer-motion для тривиальных fade-in (есть CSS-классы)
