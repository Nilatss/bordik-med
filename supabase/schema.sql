-- ════════════════════════════════════════════════════════════════
-- Bordik Med — Supabase schema
-- Run once in the Supabase SQL editor (or via `supabase db push`).
-- All tables are user-scoped via Row-Level Security (RLS) so each
-- authenticated user only ever sees their own rows.
-- ════════════════════════════════════════════════════════════════

-- Per-user profile fields not held by Supabase Auth (auth.users).
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  email text,
  status text,           -- school / university / working
  country text,
  specialty text,
  language text default 'ru',
  goal text,
  updated_at timestamptz default now()
);

-- Course progress: any course the user has touched.
-- `started_at` set when «Начать обучение» pressed; `completed_at` when
-- the final test of the course is passed.
create table if not exists public.course_progress (
  user_id uuid not null references auth.users on delete cascade,
  course_id text not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  highest_test_level smallint default 0,    -- max passed level 0–5
  module_passed boolean default false,
  updated_at timestamptz default now(),
  primary key (user_id, course_id)
);

-- Per-test attempts (lightweight log; we keep last 50 per user).
create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  course_id text not null,
  level smallint not null,                  -- 1–5 or 0 = module final
  score smallint not null,
  total smallint not null,
  passed boolean not null,
  violations smallint default 0,
  created_at timestamptz default now()
);
create index if not exists idx_test_attempts_user_course
  on public.test_attempts (user_id, course_id);

-- Tools page persistent settings (filters, favourites).
create table if not exists public.tool_settings (
  user_id uuid primary key references auth.users on delete cascade,
  query text default '',
  categories jsonb default '[]'::jsonb,
  subcategories jsonb default '[]'::jsonb,
  countries jsonb default '[]'::jsonb,
  only_available boolean default false,
  favourites jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- Aggregate study time (seconds) per course id.
create table if not exists public.study_time (
  user_id uuid not null references auth.users on delete cascade,
  course_id text not null,
  seconds integer default 0,
  updated_at timestamptz default now(),
  primary key (user_id, course_id)
);

-- ─── Row-Level Security ────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.course_progress enable row level security;
alter table public.test_attempts enable row level security;
alter table public.tool_settings enable row level security;
alter table public.study_time enable row level security;

-- Each user can read & write only their own rows. Auth uid is taken
-- from the JWT claim Supabase injects on every authenticated request.
create policy "self read profile"  on public.profiles
  for select using (auth.uid() = id);
create policy "self write profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "self read course"   on public.course_progress
  for select using (auth.uid() = user_id);
create policy "self write course"  on public.course_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "self read attempts" on public.test_attempts
  for select using (auth.uid() = user_id);
create policy "self write attempts" on public.test_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "self read tools"    on public.tool_settings
  for select using (auth.uid() = user_id);
create policy "self write tools"   on public.tool_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "self read study"    on public.study_time
  for select using (auth.uid() = user_id);
create policy "self write study"   on public.study_time
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Auto-create profile on signup ─────────────────────────────
-- New auth user → matching `profiles` row with email pulled from JWT.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
-- P3-NEW-4 — добавлен pg_temp в search_path: защита от CVE-2018-1058
-- (атакующий через свою временную схему может shadow'ить public.profiles).
security definer set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
