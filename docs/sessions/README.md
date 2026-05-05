# Session Logs

> Memory layer для команды `/save` Claude Code.
> Адаптация **claude-code-memory-setup** (lucasrosati): https://github.com/lucasrosati/claude-code-memory-setup

## Зачем

Каждая сессия Claude Code — это контекст, который **теряется** между перезапусками. Логи сессий восстанавливают что было сделано, какие решения приняты и что осталось — без необходимости пересказывать весь проект.

## Формат файла

`YYYY-MM-DD-<короткий-slug>.md`

Примеры:
- `2026-05-05-drug-interaction-checker-phase-1.md`
- `2026-05-05-icd10-expansion.md`
- `2026-05-05-audit-fixes.md`

При нескольких сессиях за один день — добавить порядковый номер: `2026-05-05-2-drug-interactions-ui-polish.md`.

## Шаблон

См. `_template.md` в этой же папке.

## Frontmatter

```yaml
---
title: <короткий заголовок>
date: 2026-05-05
duration: ~3 часа
status: completed | partial | blocked
tags: [feature, ui, content]
commits: [a1b2c3d, e4f5g6h]
---
```

## Правила

- Один файл = одна логически завершённая сессия
- НЕ удалять старые логи — это историческая память проекта
- Wikilinks через `[[docs/path/to/file.md]]` для связи с другими документами
- Минимум 3 секции: **Сделано**, **Решения**, **Открытые задачи**

## Команда /save в действии

При получении `/save` Claude должен:

1. Создать файл по формату выше
2. Заполнить из git log + контекста сессии
3. Связать wikilinks к затронутым docs/* файлам
4. **Не делать commit/push** если пользователь явно не сказал

## Чтение при /resume

При `/resume` Claude читает 3 последних файла (по дате в имени) и кратко резюмирует.
