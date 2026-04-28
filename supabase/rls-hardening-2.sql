-- ════════════════════════════════════════════════════════════════
-- RLS hardening pass 2 — closes findings P1-SEC-3, 5, 6 from
-- audit pass 4. Apply once after rls-hardening.sql. Idempotent.
--
-- Changes:
--
--   1. tools_versions: replace blanket `USING (true)` with a published-
--      tool gate, and create `tools_versions_public` view that scrubs
--      internal_notes / reviewer_comments from the payload.
--
--   2. content_change_request UPDATE: tighten WITH CHECK so a malicious
--      proposer cannot rewrite proposed_by/approved_by mid-flight, and
--      so 4-eye is enforced at row level (approved_by != proposed_by).
--
--   3. editor_role_of(uuid): mark STABLE so PostgreSQL can cache the
--      result per query — the OR-branch that calls it stops firing
--      once-per-row.
--
--   4. audit.record_version: enable RLS and tighten SELECT to
--      service_role only (auditor view via a SECURITY DEFINER function
--      can grant scoped read later).
-- ════════════════════════════════════════════════════════════════

-- ── 1. tools_versions: scope SELECT to published parents ────────

drop policy if exists "versions readable" on public.tools_versions;

create policy "versions readable scoped"
  on public.tools_versions for select
  using (
    exists (
      select 1 from public.tools t
      where t.id = tools_versions.tool_id
        and t.status = 'published'
    )
    or public.editor_role_of((select auth.uid())) in ('med_editor','med_reviewer','auditor')
  );

-- Public-facing view with internal_notes / reviewer_comments scrubbed
-- from the payload. Frontend should read from this view, not the table.
create or replace view public.tools_versions_public as
  select
    tv.tool_id,
    tv.version,
    tv.changelog_md,
    tv.guideline_source,
    tv.guideline_doi,
    tv.approved_by,
    tv.approved_at,
    -- jsonb minus operator strips two specific keys; safe even when
    -- they are absent.
    (tv.payload - 'internal_notes' - 'reviewer_comments') as payload
  from public.tools_versions tv
  join public.tools t on t.id = tv.tool_id
  where t.status = 'published';

grant select on public.tools_versions_public to anon, authenticated;

-- ── 2. content_change_request UPDATE: tighten WITH CHECK ────────

drop policy if exists "ccr update by reviewer or proposer" on public.content_change_request;

-- Helper: the row's existing proposed_by (so WITH CHECK can compare
-- against it). Inline subquery referencing the row is safe because
-- WITH CHECK runs after the UPDATE has materialised the new row.
create policy "ccr update strict"
  on public.content_change_request for update to authenticated
  using (
    proposed_by = (select auth.uid())
    or public.editor_role_of((select auth.uid())) in ('med_reviewer','auditor')
  )
  with check (
    -- proposed_by cannot change. We compare against OLD via a sub-
    -- select on the same row id — this works because the row already
    -- exists by definition of UPDATE.
    proposed_by = (
      select cr.proposed_by from public.content_change_request cr
      where cr.id = content_change_request.id
    )
    -- approved_by may be set only by reviewers, and never by the
    -- proposer themselves (4-eye principle).
    and (
      approved_by is null
      or (
        public.editor_role_of((select auth.uid())) in ('med_reviewer','auditor')
        and approved_by <> proposed_by
      )
    )
  );

-- ── 3. editor_role_of(uuid): mark STABLE ────────────────────────

-- The function reads only auth.jwt() which is constant for the duration
-- of the query. Marking STABLE lets the planner hoist the call out of
-- the per-row loop in OR-branches.
do $$
begin
  alter function public.editor_role_of(uuid) stable;
exception
  when undefined_function then null;  -- function may have been dropped
  when others then raise notice 'editor_role_of mark STABLE skipped: %', sqlerrm;
end $$;

-- ── 4. audit.record_version: lock down SELECT ────────────────────

-- supa_audit ships RLS off by default on the audit table itself. Our
-- previous schema added a "audit readable by reviewers" policy, but
-- the policy permitted any authenticated user with an editor role to
-- see ALL changes by ALL editors. For the medical-edu use case that's
-- still too broad — auditors get the data they need via a SECURITY
-- DEFINER function, regular editors see only their own changes.

alter table audit.record_version enable row level security;

drop policy if exists "audit readable by reviewers" on audit.record_version;

-- Strict: only service_role (which bypasses RLS anyway) can SELECT
-- raw rows. authenticated users go through the view below.
revoke select on audit.record_version from anon, authenticated;
grant  select on audit.record_version to service_role;

-- View for editors to see their OWN changes only. JOIN-time filter,
-- not RLS-time, so works regardless of policy.
create or replace view audit.my_changes as
  select id, table_oid, table_schema, table_name, record_version,
         op, ts, record, old_record
  from audit.record_version
  where (record ->> 'updated_by')::uuid = (select auth.uid())
     or (old_record ->> 'updated_by')::uuid = (select auth.uid())
     or (record ->> 'created_by')::uuid = (select auth.uid())
     or (record ->> 'proposed_by')::uuid = (select auth.uid());

grant select on audit.my_changes to authenticated;

-- ════════════════════════════════════════════════════════════════
-- Verification:
--
--   -- 1. versions readable scoped — anon should only see published:
--   set role anon;
--   select count(*) from public.tools_versions where exists (...) ;
--
--   -- 2. ccr 4-eye — should fail:
--   update content_change_request set approved_by = proposed_by
--     where id = '<some-id>';
--
--   -- 3. editor_role_of STABLE check:
--   select proname, provolatile from pg_proc where proname='editor_role_of';
--   -- expected: provolatile = 's'
--
--   -- 4. audit.record_version no anon/authenticated SELECT:
--   set role authenticated;
--   select * from audit.record_version limit 1;  -- expected: permission denied
--   select * from audit.my_changes limit 1;      -- expected: zero or own rows
-- ════════════════════════════════════════════════════════════════
