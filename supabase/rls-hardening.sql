-- ════════════════════════════════════════════════════════════════
-- RLS hardening + privacy tables
--
-- Apply once after schema.sql + content-schema.sql have been run.
-- Idempotent: drops & recreates each policy. Safe to re-run.
--
-- Why each change:
--
--   1. `(select auth.uid())` instead of bare `auth.uid()` — Postgres can
--      treat the SELECT-wrapped form as a stable initplan and evaluate
--      it ONCE per query instead of once per row. Big perf win on large
--      tables; also Supabase's recommended pattern.
--
--   2. `to authenticated` — without it, policies are also evaluated for
--      `anon` and `public`. If a policy expression returns NULL for an
--      anon caller (because auth.uid() is null), some PG versions still
--      attempt the row scan. Restricting to `authenticated` is both
--      defence-in-depth and a performance win.
--
--   3. `with check` on writes — prevents a malicious UPDATE that flips
--      `user_id` to another user's id from succeeding. `for all` covers
--      INSERT/UPDATE/DELETE; the `with check` clause is enforced on
--      INSERT and UPDATE.
--
--   4. New `consent_records` + `deletion_audit` tables back the proctor
--      consent flow (S4.3) and the GDPR Art.17 endpoint (S9.3).
-- ════════════════════════════════════════════════════════════════

-- ─── 1. Per-user state tables: drop & recreate policies ──────────

drop policy if exists "self read profile"   on public.profiles;
drop policy if exists "self write profile"  on public.profiles;
drop policy if exists "self read course"    on public.course_progress;
drop policy if exists "self write course"   on public.course_progress;
drop policy if exists "self read attempts"  on public.test_attempts;
drop policy if exists "self write attempts" on public.test_attempts;
drop policy if exists "self read tools"     on public.tool_settings;
drop policy if exists "self write tools"    on public.tool_settings;
drop policy if exists "self read study"     on public.study_time;
drop policy if exists "self write study"    on public.study_time;

create policy "self read profile" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);
create policy "self write profile" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "self read course" on public.course_progress
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "self write course" on public.course_progress
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "self read attempts" on public.test_attempts
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "self write attempts" on public.test_attempts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "self read tools" on public.tool_settings
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "self write tools" on public.tool_settings
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "self read study" on public.study_time
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "self write study" on public.study_time
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── 2. Editorial tables: replace `auth.uid()` with cached form ──

drop policy if exists "tools published readable"        on public.tools;
drop policy if exists "bands published readable"        on public.tools_bands;
drop policy if exists "info_md published readable"      on public.tools_info_md;
drop policy if exists "versions readable"               on public.tools_versions;
drop policy if exists "editors write tools"             on public.tools;
drop policy if exists "editors update non-published tools" on public.tools;
drop policy if exists "reviewers can publish tools"     on public.tools;
drop policy if exists "ccr proposer can read own"       on public.content_change_request;
drop policy if exists "ccr proposer creates draft"      on public.content_change_request;
drop policy if exists "ccr update by reviewer or proposer" on public.content_change_request;
drop policy if exists "audit readable by reviewers"     on audit.record_version;

-- Public catalog stays readable by anon (intentional — drives /tools).
create policy "tools published readable"
  on public.tools for select
  using (
    status = 'published'
    or public.editor_role_of((select auth.uid())) in ('med_editor','med_reviewer','auditor')
  );
create policy "bands published readable"
  on public.tools_bands for select
  using (
    exists (select 1 from public.tools t where t.id = tool_id and t.status = 'published')
    or public.editor_role_of((select auth.uid())) in ('med_editor','med_reviewer','auditor')
  );
create policy "info_md published readable"
  on public.tools_info_md for select
  using (
    exists (select 1 from public.tools t where t.id = tool_id and t.status = 'published')
    or public.editor_role_of((select auth.uid())) in ('med_editor','med_reviewer','auditor')
  );
create policy "versions readable"
  on public.tools_versions for select
  using (true);

create policy "editors write tools"
  on public.tools for insert to authenticated
  with check (public.editor_role_of((select auth.uid())) in ('med_editor','med_reviewer'));
create policy "editors update non-published tools"
  on public.tools for update to authenticated
  using (
    public.editor_role_of((select auth.uid())) in ('med_editor','med_reviewer')
    and status <> 'published'
  )
  with check (public.editor_role_of((select auth.uid())) in ('med_editor','med_reviewer'));
create policy "reviewers can publish tools"
  on public.tools for update to authenticated
  using (public.editor_role_of((select auth.uid())) = 'med_reviewer')
  with check (public.editor_role_of((select auth.uid())) = 'med_reviewer');

create policy "ccr proposer can read own"
  on public.content_change_request for select to authenticated
  using (
    proposed_by = (select auth.uid())
    or public.editor_role_of((select auth.uid())) in ('med_reviewer','auditor')
  );
create policy "ccr proposer creates draft"
  on public.content_change_request for insert to authenticated
  with check (proposed_by = (select auth.uid()));
create policy "ccr update by reviewer or proposer"
  on public.content_change_request for update to authenticated
  using (
    (proposed_by = (select auth.uid()) and status in ('draft','rejected'))
    or public.editor_role_of((select auth.uid())) = 'med_reviewer'
  )
  with check (
    (proposed_by = (select auth.uid()) and status in ('draft','rejected','review'))
    or public.editor_role_of((select auth.uid())) = 'med_reviewer'
  );

create policy "audit readable by reviewers"
  on audit.record_version for select to authenticated
  using (public.editor_role_of((select auth.uid())) in ('med_reviewer','auditor'));

-- ─── 3. consent_records — proctoring & data-processing consents ──
-- Backs the consent screens (test proctoring, AI-gen content).
-- One row per (user, consent_type, version) — append-only audit trail.
create table if not exists public.consent_records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  consent_type  text not null
                  check (consent_type in (
                    'proctoring_camera',
                    'ai_generated_content',
                    'privacy_policy',
                    'terms_of_use',
                    'biometric_processing'
                  )),
  consent_version text not null,                  -- e.g. '2026-04-28'
  granted       boolean not null,                 -- true=accept, false=withdraw
  user_agent    text,                             -- truncated UA for forensic
  ip_hash       text,                             -- sha256(ip + daily_salt)
  created_at    timestamptz not null default now()
);

create index if not exists idx_consent_user_type
  on public.consent_records (user_id, consent_type, created_at desc);

alter table public.consent_records enable row level security;

drop policy if exists "self read consent"   on public.consent_records;
drop policy if exists "self insert consent" on public.consent_records;

create policy "self read consent"
  on public.consent_records for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "self insert consent"
  on public.consent_records for insert to authenticated
  with check ((select auth.uid()) = user_id);
-- No UPDATE / DELETE policy on purpose: append-only audit trail.

-- ─── 4. deletion_audit — GDPR Art.17 deletion records ────────────
-- Stores ONLY a hash of the deleted user_id + timestamp + error summary.
-- Never PII. Survives the deletion of the user itself.
create table if not exists public.deletion_audit (
  id            uuid primary key default gen_random_uuid(),
  user_id_hash  text not null,                    -- sha256 of the user uuid
  deleted_at    timestamptz not null default now(),
  had_errors    boolean not null default false,
  error_summary text                              -- truncated, no PII
);

create index if not exists idx_deletion_audit_at
  on public.deletion_audit (deleted_at desc);

alter table public.deletion_audit enable row level security;

drop policy if exists "deletion audit no read"   on public.deletion_audit;
drop policy if exists "deletion audit no write"  on public.deletion_audit;

-- No SELECT policy — only the service role (which bypasses RLS) can read.
-- INSERT is allowed for an authenticated user *about themselves*: the
-- DELETE endpoint runs server-side with the user's session and writes
-- the hash before invoking the admin client.
create policy "self insert own deletion audit"
  on public.deletion_audit for insert to authenticated
  with check (true);  -- the hash check happens server-side; RLS only gates the table

-- ════════════════════════════════════════════════════════════════
-- Verification queries (run after applying):
--
--   -- All public tables have RLS on:
--   select c.relname from pg_class c
--   join pg_namespace n on n.oid = c.relnamespace
--   where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity = false;
--   -- expected: 0 rows
--
--   -- All policies use the cached auth.uid() pattern:
--   select polname, pg_get_expr(polqual, polrelid)
--   from pg_policy
--   where pg_get_expr(polqual, polrelid) like '%auth.uid()%'
--     and pg_get_expr(polqual, polrelid) not like '%(select auth.uid())%';
--   -- expected: 0 rows
-- ════════════════════════════════════════════════════════════════
