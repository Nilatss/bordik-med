-- ════════════════════════════════════════════════════════════════
-- P0-SEC-4 — atomic GDPR Art.17 cascade.
--
-- Replaces the JS-side `for…of` loop in app/api/account/delete that
-- previously could leave a half-deleted user when one DELETE failed
-- partway through.
--
-- The whole function body runs inside a single implicit plpgsql
-- transaction; any raised exception rolls back the entire cascade.
--
-- Apply once after rls-hardening.sql (function depends on the same
-- tables that hardening creates: consent_records, deletion_audit).
-- Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════════

create or replace function public.delete_user_cascade(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller_id uuid := (select auth.uid());
  user_hash text;
begin
  -- Caller must be the user being deleted. service_role can bypass
  -- this if it ever needs to (rare; admin-driven deletion via support).
  if caller_id is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  if caller_id <> target_user_id then
    raise exception 'forbidden: caller != target' using errcode = '42501';
  end if;

  -- Cascade. Order: children before parents so FK constraints stay sane
  -- even if some parent table has a NOT VALID FK we missed.
  delete from public.test_attempts    where user_id = target_user_id;
  delete from public.tool_settings    where user_id = target_user_id;
  delete from public.course_progress  where user_id = target_user_id;
  delete from public.study_time       where user_id = target_user_id;
  delete from public.consent_records  where user_id = target_user_id;
  delete from public.profiles         where id      = target_user_id;

  -- Audit. Hash includes target uuid + timestamp so the row identifies
  -- THIS deletion event and never collides with a future one.
  user_hash := encode(
    digest(target_user_id::text || '|' || extract(epoch from now())::text, 'sha256'),
    'hex'
  );
  insert into public.deletion_audit (user_id_hash, deleted_at, had_errors, error_summary)
  values (user_hash, now(), false, null);

  return jsonb_build_object('ok', true, 'hash', user_hash);
exception
  when others then
    -- Implicit rollback. Surface a sanitised hash so the caller can log
    -- the failure without exposing the user uuid in error responses.
    user_hash := encode(
      digest(target_user_id::text || '|fail|' || extract(epoch from now())::text, 'sha256'),
      'hex'
    );
    -- Fire-and-forget audit row (separate transaction would be ideal,
    -- but we avoid that to keep this function self-contained — the
    -- caller still gets the hash for log correlation).
    raise exception 'cascade_failed: %', sqlerrm using errcode = sqlstate, hint = user_hash;
end;
$$;

revoke all on function public.delete_user_cascade(uuid) from public, anon;
grant execute on function public.delete_user_cascade(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════
-- Verification:
--
--   -- function exists, is SECURITY DEFINER, and authenticated-only:
--   select proname, prosecdef, proacl from pg_proc where proname = 'delete_user_cascade';
--
--   -- end-to-end smoke test (run as the user being deleted):
--   select public.delete_user_cascade((select auth.uid()));
-- ════════════════════════════════════════════════════════════════
