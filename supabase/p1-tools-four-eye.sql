-- ════════════════════════════════════════════════════════════════
-- P1-SEC (stage-2 audit) — enforce 4-eye + published-immutability on
-- public.tools AT THE DATABASE LAYER.
--
-- Finding (HIGH): the 4-eye principle for tool content was enforced ONLY
-- in the API route (app/api/admin/tools/[id]/route.ts). The existing
-- enforce_four_eye() trigger guards public.content_change_request, NOT
-- public.tools. Editors and reviewers share the same anon-key browser
-- client, so a med_reviewer could bypass the route entirely with a direct
-- PostgREST call:
--   sb.from('tools').update({ status:'published', reviewed_by:<self> })
-- ...self-approving their own edit, or silently mutating a live published
-- tool's formula/inputs with no second review and no version snapshot —
-- exactly the failure 4-eye exists to prevent (ISO 13485 / IEC 62304).
--
-- Why a trigger and not RLS: an RLS WITH CHECK clause sees only the NEW
-- row, never OLD, so it cannot express "publisher must differ from the
-- previous editor" or "published content must not change". A BEFORE UPDATE
-- trigger is the correct mechanism. Existing RLS policies stay as-is.
--
-- The check is column-agnostic (compares to_jsonb(old) vs to_jsonb(new)
-- minus metadata) so it stays correct regardless of the exact content
-- columns on public.tools.
--
-- Idempotent — safe to re-run. Apply once in Supabase SQL Editor.
-- service_role / direct-SQL (auth.uid() IS NULL) bypasses, matching the
-- admin-escape convention used by delete_user_cascade.
-- ════════════════════════════════════════════════════════════════

create or replace function public.enforce_tools_four_eye() returns trigger as $$
declare
  actor uuid := (select auth.uid());
begin
  -- Trusted server paths (service_role / SQL editor) carry no auth.uid();
  -- let them through so data fixes / migrations are not blocked.
  if actor is null then
    return new;
  end if;

  -- (1) 4-eye on publish: the actor publishing the row must NOT be its last
  --     editor. OLD.updated_by is the pre-update value, which the actor
  --     cannot forge in the same statement.
  if new.status = 'published' and old.status is distinct from 'published'
     and old.updated_by = actor then
    raise exception
      'four-eye violation: publisher must differ from the last editor'
      using errcode = '42501';
  end if;

  -- (2) published content is immutable while it stays published. Only the
  --     status + review/update metadata may change (e.g. archiving). To
  --     edit a live tool you must first move it back to status=review,
  --     which un-publishes it and forces a fresh approval cycle.
  if old.status = 'published' and new.status = 'published' then
    if (to_jsonb(old) - 'status' - 'reviewed_by' - 'reviewed_on' - 'updated_at' - 'updated_by')
       is distinct from
       (to_jsonb(new) - 'status' - 'reviewed_by' - 'reviewed_on' - 'updated_at' - 'updated_by')
    then
      raise exception
        'published tool content is immutable; set status=review to edit'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$ language plpgsql
   set search_path = public, pg_temp;

drop trigger if exists trg_tools_four_eye on public.tools;
create trigger trg_tools_four_eye
  before update on public.tools
  for each row execute function public.enforce_tools_four_eye();

-- ════════════════════════════════════════════════════════════════
-- Verification:
--
--   -- trigger present:
--   select tgname from pg_trigger
--     where tgrelid = 'public.tools'::regclass and not tgisinternal;
--   -- expected: trg_tools_four_eye
--
--   -- self-approval blocked (run as a med_reviewer who last edited row X):
--   update public.tools set status='published', reviewed_by=(select auth.uid())
--     where id='X';   -- expected: ERROR four-eye violation
--
--   -- silent published edit blocked:
--   update public.tools set guideline_doi='x' where id='<published id>';
--   -- expected: ERROR published tool content is immutable
-- ════════════════════════════════════════════════════════════════
