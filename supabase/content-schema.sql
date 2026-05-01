-- ════════════════════════════════════════════════════════════════
-- Bordik Med — Content schema (Stage 3.1 of the audit plan)
--
-- This is a SEPARATE migration from supabase/schema.sql (which carries the
-- per-user state). Run once in the Supabase SQL editor or push via
-- `supabase db push --include-all` after configuring `supabase/config.toml`.
--
-- Architecture rationale:
--   - Editable content (tool meta, bands, info markdown, references) lives
--     in Postgres so medics-editors can publish corrections without a
--     code deploy.
--   - The compute() functions stay in TypeScript - never put executable
--     logic in plain DB text (security + regulatory risk).
--   - supa_audit captures every change with old/new jsonb diff so we have
--     the medical aud
-- it trail (who, when, what, why).
--   - 4-eye principle: a change cannot be self-approved.
-- ════════════════════════════════════════════════════════════════

-- ── 1. Audit extension (Supabase official) ─────────────────────────
-- Provides audit.record_version with append-only INSERT triggers.
create extension if not exists supa_audit cascade;

-- ── 2. Editorial roles (used in JWT claims via RLS) ────────────────
-- The role is stored in the `app_metadata` of auth.users; client never
-- sets it. Only the project owner / service-role function can grant it.
do $$ begin
  create type public.editor_role as enum ('med_editor', 'med_reviewer', 'auditor');
exception
  when duplicate_object then null;
end $$;

-- ── 3. Tools (canonical metadata) ──────────────────────────────────
create table if not exists public.tools (
  id            text primary key,                  -- matches CATALOG_TOOLS id
  version       text not null default '1.0.0',     -- semver
  -- i18n labels: { ru: "BMI / Индекс…", en: "Body Mass Index", … }
  name          jsonb not null,
  description   jsonb not null default '{}'::jsonb,
  category      text not null,
  subcategory   text not null,
  countries     text,                              -- "Международный (WHO)"
  kind          text check (kind in ('calculator', 'score')),
  status        text not null default 'draft'
                  check (status in ('draft', 'review', 'published', 'archived')),
  has_runner    boolean not null default false,    -- mirrors lib/runners
  reviewed_by   uuid references auth.users,        -- last medical reviewer
  reviewed_on   date,
  guideline_source text,                           -- "ESC 2024 AF Guidelines"
  guideline_doi text,
  created_at    timestamptz not null default now(),
  created_by    uuid references auth.users,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users
);

create index if not exists idx_tools_status on public.tools (status);
create index if not exists idx_tools_category on public.tools (category);

-- ── 4. Bands (sum-of-points scoring lookup) ────────────────────────
-- For score-kind tools: each band has a `when` predicate (DSL expression)
-- and the resulting interpretation. Order column drives display + match.
create table if not exists public.tools_bands (
  id            uuid primary key default gen_random_uuid(),
  tool_id       text not null references public.tools(id) on delete cascade,
  ord           smallint not null,                 -- display order
  when_expr     text not null,                     -- "score >= 5 && score < 7"
  severity      text check (severity in ('low','moderate','high','critical')),
  label         jsonb not null,                    -- i18n
  details       jsonb not null default '{}'::jsonb,
  unique (tool_id, ord)
);

create index if not exists idx_bands_tool on public.tools_bands (tool_id);

-- ── 5. Per-locale info markdown ────────────────────────────────────
create table if not exists public.tools_info_md (
  tool_id  text not null references public.tools(id) on delete cascade,
  locale   text not null,
  body     text not null,
  primary key (tool_id, locale)
);

-- ── 6. Version history (semver snapshots) ─────────────────────────
-- Stores the FULL payload of a tool at a published version - useful when
-- a clinician wants to compare current rules with what they were taught.
create table if not exists public.tools_versions (
  tool_id          text not null references public.tools(id) on delete cascade,
  version          text not null,                  -- semver
  changelog_md     text not null,
  guideline_source text not null,
  guideline_doi    text,
  approved_by      uuid not null references auth.users,
  approved_at      timestamptz not null default now(),
  payload          jsonb not null,                 -- full snapshot
  primary key (tool_id, version)
);

create index if not exists idx_versions_approved on public.tools_versions (approved_at desc);

-- ── 7. Editorial change requests (workflow + 4-eye review) ────────
create table if not exists public.content_change_request (
  id              uuid primary key default gen_random_uuid(),
  table_name      text not null,                   -- 'tools', 'tools_bands', etc.
  record_pk       text not null,                   -- the PK as text
  proposed_diff   jsonb not null,                  -- partial update payload
  rationale       text not null,                   -- mandatory medical reasoning
  guideline_source text not null,                  -- "ESC 2024 AF, Eur Heart J 2024;45:3314"
  guideline_doi   text,
  status          text not null default 'draft'
                    check (status in ('draft','review','approved','rejected','published')),
  proposed_by     uuid not null references auth.users,
  reviewed_by     uuid references auth.users,
  approved_by     uuid references auth.users,
  proposed_at     timestamptz not null default now(),
  reviewed_at     timestamptz,
  approved_at     timestamptz,
  rejection_reason text
);

create index if not exists idx_ccr_status on public.content_change_request (status);
create index if not exists idx_ccr_proposed_by on public.content_change_request (proposed_by);

-- ── 8. 4-eye principle trigger ─────────────────────────────────────
-- A change cannot be approved by the same person who proposed it. Catches
-- the "rubber-stamp my own change" failure mode that ISO 13485 / IEC 62304
-- explicitly warn about.
create or replace function public.enforce_four_eye() returns trigger as $$
begin
  if new.status = 'approved' and old.status <> 'approved' then
    if new.approved_by is null then
      raise exception 'Approval requires approved_by';
    end if;
    if new.approved_by = new.proposed_by then
      raise exception 'Four-eye principle violated: proposer cannot self-approve';
    end if;
    if new.approved_at is null then
      new.approved_at := now();
    end if;
  end if;
  if new.status = 'review' and old.status <> 'review' then
    if new.reviewed_by is null then
      raise exception 'Review requires reviewed_by';
    end if;
    if new.reviewed_at is null then
      new.reviewed_at := now();
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_ccr_four_eye on public.content_change_request;
create trigger trg_ccr_four_eye
  before update on public.content_change_request
  for each row execute function public.enforce_four_eye();

-- ── 9. Append-only audit on content tables ────────────────────────
-- supa_audit creates audit.record_version with old_record/record + ts.
-- Enabling tracking means every INSERT/UPDATE/DELETE writes a jsonb diff
-- row that we keep forever (SaMD aud
-- it requirement).
select audit.enable_tracking('public.tools'::regclass);
select audit.enable_tracking('public.tools_bands'::regclass);
select audit.enable_tracking('public.tools_info_md'::regclass);
select audit.enable_tracking('public.tools_versions'::regclass);
select audit.enable_tracking('public.content_change_request'::regclass);

-- Append-only: revoke UPDATE/DELETE on the audit table itself.
revoke update, delete on audit.record_version from authenticated, anon;

-- ── 10. RLS policies ───────────────────────────────────────────────
alter table public.tools                    enable row level security;
alter table public.tools_bands              enable row level security;
alter table public.tools_info_md            enable row level security;
alter table public.tools_versions           enable row level security;
alter table public.content_change_request   enable row level security;
alter table audit.record_version            enable row level security;

-- Helper: read the role from the JWT app_metadata (set by service role).
create or replace function public.editor_role_of(uid uuid) returns text language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'editor_role'), '')
$$;

-- Published tools readable by everyone (drives the public catalog).
create policy "tools published readable"
  on public.tools for select
  using (status = 'published' or public.editor_role_of(auth.uid()) in ('med_editor','med_reviewer','auditor'));
create policy "bands published readable"
  on public.tools_bands for select
  using (
    exists (select 1 from public.tools t where t.id = tool_id and t.status = 'published')
    or public.editor_role_of(auth.uid()) in ('med_editor','med_reviewer','auditor')
  );
create policy "info_md published readable"
  on public.tools_info_md for select
  using (
    exists (select 1 from public.tools t where t.id = tool_id and t.status = 'published')
    or public.editor_role_of(auth.uid()) in ('med_editor','med_reviewer','auditor')
  );
create policy "versions readable"
  on public.tools_versions for select
  using (true);                              -- public history

-- Editors can write drafts (and update their own), reviewers can review,
-- only reviewers/admins can flip to published.
create policy "editors write tools"
  on public.tools for insert
  with check (public.editor_role_of(auth.uid()) in ('med_editor','med_reviewer'));
create policy "editors update non-published tools"
  on public.tools for update
  using (
    public.editor_role_of(auth.uid()) in ('med_editor','med_reviewer')
    and status <> 'published'
  );
create policy "reviewers can publish tools"
  on public.tools for update
  using (public.editor_role_of(auth.uid()) = 'med_reviewer');

create policy "ccr proposer can read own"
  on public.content_change_request for select
  using (
    proposed_by = auth.uid()
    or public.editor_role_of(auth.uid()) in ('med_reviewer','auditor')
  );
create policy "ccr proposer creates draft"
  on public.content_change_request for insert
  with check (proposed_by = auth.uid());
create policy "ccr update by reviewer or proposer"
  on public.content_change_request for update
  using (
    proposed_by = auth.uid() and status in ('draft','rejected')
    or public.editor_role_of(auth.uid()) = 'med_reviewer'
  );

-- Audit log readable only by reviewers and auditors.
create policy "audit readable by reviewers"
  on audit.record_version for select
  using (public.editor_role_of(auth.uid()) in ('med_reviewer','auditor'));

-- ── 11. Convenience view for clients ───────────────────────────────
-- Single SELECT joins published tools + bands + first locale into one row.
create or replace view public.tool_published as
  select
    t.id, t.version, t.name, t.description, t.category, t.subcategory,
    t.countries, t.kind, t.has_runner,
    coalesce(jsonb_agg(b.* order by b.ord) filter (where b.id is not null), '[]'::jsonb) as bands
  from public.tools t
  left join public.tools_bands b on b.tool_id = t.id
  where t.status = 'published'
  group by t.id;

-- ════════════════════════════════════════════════════════════════
-- Done. Next steps (Stage 3.4):
--   - Cron snapshot: pg_cron + supabase.functions write
--     /public/snapshot-<rev>.json into Storage so the SW can precache
--     the canonical published state for offline use.
--   - Stage 3.3 builds the /admin UI on top of these tables.
-- ════════════════════════════════════════════════════════════════
