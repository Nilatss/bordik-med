-- ════════════════════════════════════════════════════════════════
-- P3-NEW-4 — Set search_path on SECURITY DEFINER / unsafe functions.
--
-- Без явного `set search_path = public, pg_temp` функция выполняет
-- поиск объектов (таблиц, других функций) по search_path юзера. Если
-- атакующий создал в своей схеме `attack_schema.profiles` или
-- `attack_schema.auth.uid()`, он может перехватить выполнение
-- security-критичных триггеров и помощников.
--
-- CVE-classа: CVE-2018-1058. Подтверждённый attack-vector через
-- pg_dump'нутые public-схемы у нескольких клиентов Supabase.
--
-- Apply:
--   psql $DATABASE_URL < supabase/p3-search-path-hardening.sql
--   ИЛИ через Supabase Dashboard → SQL Editor.
--
-- Idempotent: ALTER FUNCTION ... SET перезаписывает существующее
-- значение, не падает на повторный run.
-- ════════════════════════════════════════════════════════════════

-- 1. enforce_four_eye() — trigger на content-tables (review-flow).
--    Был SECURITY INVOKER неявно (default), но всё равно безопаснее
--    привязать к public+pg_temp, чтобы NEW.proposed_by / NEW.status
--    не разрешались через атакующую схему.
alter function public.enforce_four_eye() set search_path = public, pg_temp;

-- 2. editor_role_of(uuid) — читает auth.jwt(), возвращает app_metadata.
--    Используется в RLS-политиках. Если кто-то shadow'нет auth.jwt()
--    в своей схеме, RLS-проверка может выдать чужой role-claim.
alter function public.editor_role_of(uuid) set search_path = public, pg_temp;

-- 3. handle_new_user() — уже имел `set search_path = public` в исходном
--    schema.sql, но добавим pg_temp для consistency и идемпотентности.
alter function public.handle_new_user() set search_path = public, pg_temp;

-- 4. delete_user_cascade(uuid) — уже корректен (`set search_path =
--    public, pg_temp` прописан в rpc-delete-user-cascade.sql), но
--    повторный alter не повредит.
alter function public.delete_user_cascade(uuid) set search_path = public, pg_temp;

-- ════════════════════════════════════════════════════════════════
-- Verification: проверить, что у всех SECURITY DEFINER функций
-- search_path задан явно.
--
--   select n.nspname, p.proname, p.prosecdef, p.proconfig
--     from pg_proc p
--     join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public'
--      and p.proname in ('enforce_four_eye', 'editor_role_of',
--                         'handle_new_user', 'delete_user_cascade');
--
-- Должно вернуть proconfig вида `{search_path=public, pg_temp}`.
-- ════════════════════════════════════════════════════════════════
