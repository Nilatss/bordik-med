# Bordik Backend Setup

Supabase-powered backend for cross-device progress sync, auth, and (later)
content management.

## 1. Provision a Supabase project

1. Go to https://app.supabase.com → **New project**.
2. Name it `bordik-prod` (and a separate `bordik-dev` if you like).
3. Pick a strong DB password; pick a region close to users (e.g. `eu-west-1`).
4. Wait ~2 min for the database to spin up.

## 2. Apply the schema

Open the SQL Editor in the Supabase dashboard and paste the contents of
[`supabase/schema.sql`](supabase/schema.sql) → **Run**. You should see:

- 5 tables created (profiles, course_progress, test_attempts, tool_settings, study_time)
- Row-Level Security enabled on all of them
- A trigger `on_auth_user_created` that creates a matching `profiles` row whenever a new auth user signs up.

## 3. Set environment variables

In **Vercel → Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase dashboard (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` public key (safe to ship to the browser) |

For local dev: copy `.env.local.example` → `.env.local` and fill in the same two values.

## 4. Configure Auth

In **Supabase → Authentication → URL Configuration**:

- **Site URL**: `https://ironmed-academy.vercel.app` (prod) or `http://localhost:3000` (dev)
- **Redirect URLs** — add **both**:
  - `https://ironmed-academy.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

In **Supabase → Authentication → Providers**:

- **Email** — enabled by default; magic-link via `signInWithOtp` (no password needed).
- **Google** (optional) — create OAuth credentials at https://console.cloud.google.com → enable Google+ API → OAuth client ID → Web → authorised redirect URI = `https://<your-project-ref>.supabase.co/auth/v1/callback`. Paste **Client ID + Client Secret** into Supabase Google provider config.

## 5. Email template (optional polish)

In **Authentication → Email Templates → Magic Link** swap to a Russian/English/Uzbek-friendly version. Default works fine for MVP.

## 6. Frontend integration (already done)

Code already in place:
- `lib/supabase/client.ts` — browser-side client (cookies via `@supabase/ssr`)
- `lib/supabase/server.ts` — server-side client for Route Handlers
- `app/auth/login/page.tsx` — magic-link + Google login UI
- `app/auth/callback/route.ts` — exchanges OAuth/magic-link code for session
- `app/api/sync/route.ts` — `GET` to pull state, `POST` to push state
- `lib/useSupabaseSync.ts` — Zustand ↔ Supabase bridge (called from `app/page.tsx`)

## 7. Architecture notes

### Storage model
- Local Zustand store stays the source of truth at runtime. The app keeps working **offline** — only when signed-in and online do we push/pull.
- `progress` rows are **upserted** on every push (last-write-wins). Conflict probability is low because all writes come from a single user across devices.
- `test_attempts` is append-only — last 50 per user kept; older rows can be auto-pruned via a cron later.

### Security
- RLS is the only access control. The anon key is safe to ship — it can do nothing without a valid JWT.
- API routes (`/api/sync`, `/api/test-attempts`) re-validate the user via `getSupabaseServerClient()` — no JWT-on-the-wire required.
- All writes are gated by `auth.uid() = user_id` policies.

### Local dev tips
- Supabase local stack: `npx supabase init && npx supabase start` — runs Postgres + GoTrue locally on port 54321. Useful when offline.
- For migrations under version control: `npx supabase db diff` after edits in the dashboard.

### Free-tier limits (as of 2026)
- 500 MB database (for our app: ~50 MB per 100k users)
- 50 K monthly active users
- 1 GB egress / month
- Plenty of headroom for the MVP. Upgrade to Pro ($25/mo) when we approach limits.

## Future work
- [ ] CMS for course content (lessons live in `lib/runners/`/`lib/content/` git-tracked; could move to a Supabase `lessons` table + admin UI)
- [ ] Stripe integration for paid tiers
- [ ] Offline-queue sync (currently we just retry on next change — fine for our cadence)
- [ ] Server-side test-result validation (anti-cheat: re-grade on POST instead of trusting the client score)
