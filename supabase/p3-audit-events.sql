-- ════════════════════════════════════════════════════════════════
-- P3-NEW-2 — audit.events таблица для application-level событий.
--
-- Существующий audit.record_version (supa_audit) покрывает CRUD на
-- content tables (tools, bands, и т.д.). НЕ покрывает события
-- безопасности и identity:
--   - login attempts (success / fail)
--   - password resets
--   - role changes (set_editor_role)
--   - admin-actions (delete user, ban, и т.д.)
--   - rate-limit lockouts
--   - feedback submissions
--   - test results (для proctoring-аудита)
--
-- Этот файл — отдельная append-only таблица + helper-функция для
-- структурного логирования из API-routes / Edge functions.
--
-- Apply:
--   psql $DATABASE_URL < supabase/p3-audit-events.sql
--   ИЛИ через Supabase Dashboard → SQL Editor.
-- ════════════════════════════════════════════════════════════════

-- Создаём схему audit, если её ещё нет (supa_audit обычно её ставит,
-- но на чистом Supabase project'е может отсутствовать).
create schema if not exists audit;

-- ── Таблица событий ─────────────────────────────────────────────
create table if not exists audit.events (
  id           bigserial primary key,
  ts           timestamptz not null default now(),
  -- event type — kebab-case (login.success, role.changed, ...).
  -- 100 chars макс — индексируется, не блобный.
  event_type   varchar(100) not null,
  -- actor: user который сделал действие (NULL = system / anonymous).
  actor_id     uuid references auth.users(id) on delete set null,
  -- target: на кого направлено (для role-change'ей) — может быть NULL.
  target_id    uuid references auth.users(id) on delete set null,
  -- метаданные — IP-hash, UA, request id, etc. Никогда не raw PII.
  metadata     jsonb not null default '{}'::jsonb,
  -- severity для алёртов (info / warning / error / critical).
  severity     varchar(20) not null default 'info'
    check (severity in ('debug', 'info', 'warning', 'error', 'critical'))
);

-- ── Индексы ─────────────────────────────────────────────────────
-- Filtering by event_type + временное окно — основной запрос.
create index if not exists ix_audit_events_type_ts
  on audit.events (event_type, ts desc);

-- Быстрый lookup по actor_id (e.g., "show me everything user X did").
create index if not exists ix_audit_events_actor_ts
  on audit.events (actor_id, ts desc) where actor_id is not null;

-- Severity filtering для dashboard'ов (только critical / errors).
create index if not exists ix_audit_events_severity_ts
  on audit.events (severity, ts desc) where severity in ('error', 'critical');

-- ── RLS ─────────────────────────────────────────────────────────
-- Append-only через RLS:
--   - service_role может писать (всегда)
--   - authenticated не может читать (audit-data sensitive)
--   - SELECT доступен только из SECURITY DEFINER helper'ов или из
--     dashboard'ов под admin role
alter table audit.events enable row level security;

-- Запрет всем authenticated UPDATE / DELETE — append-only.
revoke update, delete on audit.events from authenticated, anon;

-- Service role bypass'ит RLS by default — INSERT идёт без политики.

-- ── SECURITY DEFINER helper для логирования из app-кода ─────────
-- Из Edge / API routes мы не хотим раздавать service_role креды.
-- Helper'ом (SECURITY DEFINER) пишем event'ы под прав'ами postgres,
-- но с явным search_path (P3-NEW-4).
create or replace function audit.log_event(
  p_event_type varchar(100),
  p_actor_id   uuid default null,
  p_target_id  uuid default null,
  p_metadata   jsonb default '{}'::jsonb,
  p_severity   varchar(20) default 'info'
) returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id bigint;
begin
  -- Нормализуем metadata: обрезаем большие значения, чтобы атакующий
  -- не залил БД строкой 1MB.
  if jsonb_typeof(p_metadata) = 'object' then
    -- jsonb может быть >5KB — это уже подозрительно. Cap'аем.
    if octet_length(p_metadata::text) > 5000 then
      p_metadata := jsonb_build_object('truncated', true,
                      'original_size', octet_length(p_metadata::text));
    end if;
  end if;
  insert into audit.events (event_type, actor_id, target_id, metadata, severity)
  values (p_event_type, p_actor_id, p_target_id, p_metadata, p_severity)
  returning id into v_id;
  return v_id;
end;
$$;

-- Authenticated users могут вызывать log_event только через helper.
grant execute on function audit.log_event(
  varchar, uuid, uuid, jsonb, varchar
) to authenticated;

-- ── Verification ────────────────────────────────────────────────
-- После apply:
--   select event_type, count(*), max(ts)
--     from audit.events
--    where ts > now() - interval '7 days'
--    group by event_type
--    order by 2 desc;
--
-- Из app-кода:
--   select audit.log_event(
--     'login.success',
--     (auth.uid())::uuid,
--     null,
--     jsonb_build_object('ip_hash', 'abcd1234', 'ua', 'Mozilla/...')
--   );
-- ════════════════════════════════════════════════════════════════
