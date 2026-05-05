---
title: Внедрение memory-system от claude-code-memory-setup
date: 2026-05-05
duration: ~30 мин
status: completed
tags: [infra, memory, claude-code]
commits: []
---

# Внедрение memory-system от claude-code-memory-setup

## Контекст

После большого спринта по K1 (Drug Interaction Checker) пользователь попросил внедрить https://github.com/lucasrosati/claude-code-memory-setup — структуру для постоянной памяти Claude Code между сессиями.

Полная установка (Obsidian vault + Graphify + cron-pipeline) — это пользовательская работа на машине, **не делается через коммит**. Внедрена **проектная часть**, которая работает прямо из репозитория.

## Сделано

- **`CLAUDE.md`** — расширен секцией «🧠 Memory System»:
  - Слои памяти (CLAUDE.md / sessions / specs / roadmap / UI_GUIDELINES)
  - Команды `/resume` и `/save` с явными шагами
  - Правила «всегда / никогда»
  - Документация Graphify-интеграции (опциональная)
  - Приоритет источников при поиске информации (CLAUDE → guidelines → sessions → specs → graph → реальные файлы)

- **`docs/sessions/`** — новая папка с README + шаблоном:
  - `README.md` — формат, frontmatter, правила
  - `_template.md` — пустой шаблон с YAML + 5 секциями (Контекст, Сделано, Решения, Открытые задачи, Связанные документы)

- **`.gitignore`** — добавлен `graphify-out/cache/` (если пользователь установит Graphify локально, кэш не уйдёт в git)

- **Этот файл** — первый реальный лог как пример для следующих сессий

## Решения

- **Не создавать `~/vault` и `~/scripts`** в репо — это пользовательская инфраструктура (Obsidian, cron, Python). Документировано в CLAUDE.md как опциональная часть.
- **Не дублировать существующие docs/** — в гайде упоминается `architecture/`, `pipeline/`, `data/`, `features/`, но у нас уже есть `docs/specs/`, `docs/AUDIT_TODO_2026-05.md`, `docs/CONTENT_ROADMAP.md` — это и есть наша архитектурная память.
- **Wikilinks через `[[docs/...]]`** — markdown-style относительные пути, работают в Obsidian + Markdown viewers + читаются Claude Code.
- **Команды `/resume` и `/save`** — описаны как поведенческие инструкции в CLAUDE.md (не slash-commands в Claude Code конфиге, но Claude умеет распознать их в сообщении пользователя).

## Открытые задачи

- [ ] Пользователю установить Obsidian + указать vault на `~/vault/bordik-med` (опционально)
- [ ] Пользователю установить Graphify (`pip install graphifyy && graphify install`) для снижения токенов в новых сессиях
- [ ] Использовать `/save` в конце следующих сессий чтобы накапливать историю
- [ ] Использовать `/resume` в начале новых сессий чтобы Claude быстро вошёл в контекст

## Что узнали о проекте

- В `CLAUDE.md` уже была сильная база (продуктовые стандарты PDF-таблиц, цвета, типографика, анимации). Memory-system добавлен **поверх** без удаления существующего.
- В `docs/` уже есть рабочая структура — `specs/`, `roadmap`, `audit`, `guidelines`. Не нужно ломать на «правильную» Zettelkasten-структуру — то что есть, уже работает как Memory of Connections.
- Graphify — реально полезный инструмент для проекта на 80+ файлов (наш масштаб). Но это инфра-задача пользователя.

## Связанные документы

- [[CLAUDE.md]] — главный memory-файл
- [[docs/AUDIT_TODO_2026-05.md]] — открытые P0/P1/P2 задачи
- [[docs/CONTENT_ROADMAP.md]] — killer-фичи
- [[docs/UI_GUIDELINES.md]] — UI-стандарты
- [[docs/sessions/README.md]] — формат session logs
- [[docs/sessions/_template.md]] — шаблон для новых логов

## Источник паттерна

https://github.com/lucasrosati/claude-code-memory-setup
