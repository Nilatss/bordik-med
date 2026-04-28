# Supabase setup

This folder holds the SQL migrations for the IronMed Academy backend.

## Files

| File | What it does | When to apply |
|---|---|---|
| `schema.sql` | Per-user state: profiles, course progress, test attempts, tool settings, study time. RLS-scoped to `auth.uid()`. | Required for the app to work with sign-in. |
| `content-schema.sql` | Editorial content tables: `tools`, `tools_bands`, `tools_info_md`, `tools_versions`, `content_change_request` + `supa_audit` extension + `editor_role` enum + 4-eye review trigger + RLS policies for `med_editor` / `med_reviewer` / `auditor` roles. | Optional — apply when migrating content from `lib/tools-catalog.ts` to the database. The app falls back to the bundled JSON catalog when this schema is absent. |

## How to apply

### Option A — Supabase CLI (recommended)

```bash
# Once, link the local project to your Supabase project
supabase link --project-ref <your-ref>

# Apply both files (in order)
supabase db push --include-all
```

### Option B — Web SQL Editor

1. Open the Supabase project dashboard → **SQL Editor**.
2. Run `schema.sql` first (creates `auth`-coupled tables + RLS).
3. Run `content-schema.sql` next (depends on `auth.users`).
4. Verify in **Table Editor** that all tables appear.

### Option C — npx supabase db reset (local dev)

```bash
npx supabase start                # spins up local Postgres
npx supabase db reset             # applies migrations
```

## Granting the `med_editor` / `med_reviewer` role

Roles live in the JWT `app_metadata` and can only be set via the
service-role key (never from the client). Easiest path:

```sql
-- Replace with the user's UUID
update auth.users
set raw_app_meta_data = jsonb_set(
  coalesce(raw_app_meta_data, '{}'::jsonb),
  '{editor_role}',
  '"med_editor"'
)
where id = '00000000-0000-0000-0000-000000000000';
```

Or use the Supabase dashboard → Authentication → Users → click user →
edit `app_metadata` → set `{ "editor_role": "med_editor" }`.

After the JWT refresh (sign-out + sign-in, or 1-hour token expiry) the
RLS policies will start honouring the role.

## Snapshot exporter

`scripts/snapshot-content.mjs` reads `tool_published` view and writes
`public/snapshot.json` for the Service Worker to precache.

```bash
# Required env (set via .env.local for local runs, or CI secrets)
export NEXT_PUBLIC_SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...     # NEVER commit this

npm run snapshot:content
```

When `content-schema.sql` is not applied, the script exits 0 with a
"schema not migrated yet" message — it's safe to wire into `prebuild`
without breaking dev environments.

## Audit log queries

History of a single tool:

```sql
select ts, op, record, old_record
from audit.record_version
where table_name = 'tools'
  and (record->>'id' = 'cha2ds2-vasc' or old_record->>'id' = 'cha2ds2-vasc')
order by ts desc;
```

Diff between two versions:

```sql
select
  jsonb_object_agg(key, value) filter (where record->>key is distinct from old_record->>key) as changes
from audit.record_version,
     lateral jsonb_each_text(coalesce(record, old_record))
where id = '<audit-row-uuid>'
group by id;
```

## Stage 3.3 (Admin UI) status

The `/admin` route with forms for editor workflow is **not yet built** — it
lives in the audit roadmap as a separate sub-project. The schema, RLS, and
4-eye trigger are in place so the app can begin migrating to DB-driven
content as soon as the UI lands.
