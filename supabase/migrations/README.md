# Supabase Migrations

> P2-CR-9 (2026-05-08) — структура для timestamp-prefixed миграций.

## Зачем

Supabase CLI ожидает миграции в `supabase/migrations/` с именами
вида `YYYYMMDDHHMMSS_description.sql`. CLI применяет их по
лексическому порядку, отслеживает применённые в `supabase_migrations.schema_migrations`,
и не запускает один файл дважды.

Существующие SQL-файлы в `supabase/` (без `migrations/`) — **legacy**
монолитные snapshot'ы (`schema.sql`, `content-schema.sql`,
`rls-hardening*.sql`, `rpc-*.sql`, `p3-*.sql`). Они применялись
вручную через Dashboard → SQL Editor.

С этого момента **все новые** изменения схемы — через timestamp-файлы
здесь.

## Как добавить миграцию

```bash
# Сгенерируй timestamp:
date -u +%Y%m%d%H%M%S      # 20260508052300

# Создай файл:
echo "-- description" > supabase/migrations/20260508052300_add_consent_log.sql

# Напиши миграцию (idempotent! CREATE IF NOT EXISTS, ALTER ... SET):
# ...

# Apply локально (если есть supabase CLI):
supabase db push

# Apply на prod через Dashboard:
# Дашборд → SQL Editor → New query → paste content → Run
```

## Конвенции

1. **Idempotent** — `CREATE IF NOT EXISTS`, `ALTER FUNCTION ... SET`,
   `INSERT ... ON CONFLICT DO NOTHING`. Файл должен пробрасываться
   без падения, даже если уже применён.
2. **Никогда не редактировать** уже применённый файл — пиши новый
   ALTER миграцией поверх.
3. **Atomic** — одна логическая фича на файл (consent log = один файл,
   audit events = другой).
4. **Comment-heavy** — в начале каждого файла:
   - что и зачем (1-2 предложения)
   - apply instruction (psql или Dashboard)
   - verification SQL в конце
5. **Search_path** — все SECURITY DEFINER функции должны иметь
   `set search_path = public, pg_temp` (P3-NEW-4 / CVE-2018-1058).

## Текущие миграции

| File | Дата | Назначение |
|---|---|---|
| (пока пусто — все актуальные SQL живут в supabase/*.sql) |

## Migration plan для legacy SQL

Когда / если нужно перейти полностью на CLI workflow:

1. Создать `00000000000001_baseline_schema.sql` = current `schema.sql + content-schema.sql + rls-hardening{,-2}.sql`
2. Создать `00000000000002_p3_search_path.sql` = `p3-search-path-hardening.sql`
3. Создать `00000000000003_p3_audit_events.sql` = `p3-audit-events.sql`
4. Запустить `supabase db push` локально для marking как applied
5. На prod: `supabase migration repair` чтобы синхронизировать
   `supabase_migrations.schema_migrations` без повторного apply

До тех пор — параллельная работа: legacy SQL для baseline, новые
изменения через `migrations/`.

## Внешний instructions

Apply на prod выполняется **вручную** через Supabase Dashboard:
1. Open project → SQL Editor
2. New query → paste content из migration file
3. Run → проверить verification block в конце файла
4. Tag commit'a с migration в release notes (нужно для rollback ref)

См. `supabase/SECURITY_SETUP.md` если такой файл появится — пока
всё тут.
