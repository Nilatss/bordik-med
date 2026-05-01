# Security setup & IR runbook — Bordik Med

> Living document. Owner: security@bordik.app. Review every quarter.
> Last reviewed: 2026-04-28.

This file covers everything that **cannot** be expressed in code:
external dashboards, secret rotation, manual toggles, incident response.
Everything in code (CSP, headers, leak guard, Valibot input/output, GDPR
endpoints, etc.) lives in the repo and is enforced by CI.

---

## 0. Domains & contacts

| Channel | Address |
|---|---|
| General | hello@bordik.app |
| Privacy / DSAR | privacy@bordik.app |
| Security disclosures | security@bordik.app |
| RFC 9116 file | `/.well-known/security.txt` |
| Production | https://bordik.app |
| Status / IR comms | TODO: status.bordik.app or pinned X/Telegram |

---

## 1. Supabase — manual checklist

Done from the Supabase dashboard, project: `bordik-med` (or whatever
the production project is named). All changes are logged in the project's
audit log.

### 1.1 Auth → URL configuration
- [ ] Site URL = `https://bordik.app` (no trailing slash, no preview URLs)
- [ ] Additional Redirect URLs: only the production confirm pages
      (`/auth/confirm`, `/account/delete-confirm`). **Not** `*.vercel.app`.
- [ ] JWT expiry ≤ 3600 s, refresh token reuse interval = 10 s
- [ ] Enable refresh token rotation

### 1.2 Auth → Providers
- [ ] Email: confirm signups = ON, secure email change = ON
- [ ] Magic link: enabled, OTP length ≥ 6, OTP expiry ≤ 600 s
- [ ] Telegram (custom OAuth) — optional, off until vetted
- [ ] Anonymous sign-in: OFF
- [ ] Phone provider: OFF (we do not collect phone numbers)

### 1.3 Auth → Rate limiting & captcha
- [ ] Email signups: ≤ 30 / hour / IP
- [ ] Token verifications: ≤ 30 / 5 min / IP
- [ ] **Cloudflare Turnstile** site key + secret added under
      Auth → Settings → Bot & abuse protection. Required for: signup,
      password reset, magic-link, account deletion.

### 1.4 Project → API keys
- [ ] Migrate from legacy `anon` / `service_role` JWTs to **publishable +
      secret** key model (Project Settings → API → "Migrate to new keys").
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is the only key exposed to
      the browser. Old `NEXT_PUBLIC_SUPABASE_ANON_KEY` removed.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` lives **only** on Vercel Production env
      (no Preview, no Development). Not in `.env.local` of any dev.
- [ ] Rotate keys on schedule: see §10 IR runbook.

### 1.5 Database → SMTP
- [ ] Custom SMTP provider configured (SendGrid / Resend / Postmark).
      Default Supabase SMTP has aggressive shared rate limits and is
      blocked by some MTAs.
- [ ] `From:` = `Bordik <noreply@bordik.app>` with SPF + DKIM + DMARC
      (DMARC at least `p=quarantine; rua=mailto:dmarc@bordik.app`).

### 1.6 Database → Network restrictions
- [ ] Only allow Vercel egress IPs (or "All" if Vercel CIDRs are not
      pinned — acceptable since service-role key is the gating control).
- [ ] Database webhooks → none unless explicitly needed.

### 1.7 RLS posture (verified by `supabase/schema.sql`)
- All public tables have `enable row level security` and at least one
  policy. Verify by running:
  ```sql
  select c.relname
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity = false;
  ```
  Expected result: 0 rows.
- Every policy:
  - uses `(select auth.uid())` (cached per query) instead of bare
    `auth.uid()`,
  - is restricted to `to authenticated` (not `to public`),
  - has both `using (...)` and (where it inserts/updates) `with check (...)`.

---

## 2. Vercel — manual checklist

### 2.1 Project settings
- [ ] Production branch = `master`. Auto-deploy on push.
- [ ] **Deployment protection** for Preview = "Standard Protection"
      (Vercel SSO, blocks public access). Set in
      Settings → Deployment Protection.
- [ ] Production deployment protection = OFF (public site).
- [ ] Edge functions region = `fra1` (closest to RU/EU users).

### 2.2 Environment variables
| Name | Scope |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview + Dev |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production + Preview + Dev |
| `SUPABASE_SERVICE_ROLE_KEY` | **Production only** |
| `GEMINI_API_KEY` | Production + Preview |
| `NEXT_PUBLIC_APP_URL` | Production = `https://bordik.app`, Preview blank |

- [ ] No env var name starts with `NEXT_PUBLIC_` for any secret.
- [ ] Service-role key never appears in `git log`, `gh pr view`, build
      logs, or the Vercel build cache. Run `npm run check:leaks` against
      the latest production build before any release.

### 2.3 Custom domain & DNS
- [ ] `bordik.app` and `www.bordik.app` connected, both with valid TLS.
- [ ] CAA record: `0 issue "letsencrypt.org"` (or whichever CA Vercel
      uses) — prevents a stolen DNS account from issuing certs through
      another CA without the CAA pointer changing.
- [ ] DNSSEC enabled at the registrar.
- [ ] Registrar account: 2FA + registry lock (`clientTransferProhibited`).

### 2.4 Bandwidth & cost alerts
- [ ] Spend limit alert at 50% / 80% / 100% of free tier.
- [ ] Function invocation alert at 80% of monthly budget.
- [ ] Web analytics → privacy mode = ON (no IP storage).

---

## 3. Google Cloud (Gemini) — manual checklist

- [ ] Create a separate API key per environment
      (`bordik-prod`, `bordik-preview`).
- [ ] **API restriction**: only `Generative Language API`.
- [ ] **Application restriction**: HTTP referrers? **No**, the key is
      used server-side. Use IP allowlist with Vercel egress CIDRs, or
      keep "None" + rely on the secret nature of the key.
- [ ] Quota: per-minute and per-day caps. We use Gemini for diagnostic
      questions only; cap at e.g. 10k requests/day, 100/min.
- [ ] Billing alert at $10 / $25 / $50.

---

## 4. GitHub — manual checklist

### 4.1 Repository settings
- [ ] Branch protection on `master`:
  - require PR review (1 approval)
  - require status checks: `typecheck`, `build`, `check:leaks`
  - require branches up-to-date
  - require signed commits **or** linear history
  - require conversation resolution
  - **disallow force pushes** + **disallow deletions**
- [ ] Default branch = `master`.
- [ ] Enable: Dependabot security updates, Dependabot version updates
      (handled by `.github/dependabot.yml`), Secret scanning, Push
      protection, Code scanning (CodeQL — `javascript-typescript`).

### 4.2 Org / personal account
- [ ] 2FA required for all maintainers.
- [ ] No PATs with `repo` scope older than 90 days. Prefer fine-grained
      tokens with explicit repo + scopes.
- [ ] No deploy keys with write access (Vercel does not need them).

---

## 5. Operational monitoring

| Signal | Source | Threshold | Action |
|---|---|---|---|
| 5xx burst | Vercel logs | > 1% of req/min for 5 min | open IR |
| CSP report spike | `/api/security/csp-report` (TODO add) | > 100/hour | review report-only logs, harden allowlist |
| Auth failures | Supabase logs | > 50 / 10 min from one IP | rate-limit / Turnstile bump |
| Bundle leaks | `npm run check:leaks` in CI | any hit | fail build, rotate the leaked secret |
| Dependabot alerts | GitHub | severity ≥ high | fix or pin within 7 days |
| Gemini cost | Google Cloud | > 80% of cap | freeze diagnostic endpoint, investigate |

We do not have paid SIEM. The free tier of Vercel Logs + Supabase Logs +
GitHub Security tab is sufficient for the current scale.

---

## 6. Backups

| Asset | Mechanism | Retention | Recovery RTO/RPO |
|---|---|---|---|
| `auth.users` + tenant rows | Supabase PITR (paid plan) or daily `pg_dump` to R2 | 30 days | RTO 1 h, RPO 24 h |
| Repo | GitHub itself + local clones | n/a | RTO < 30 min |
| Course content (DSL/JSON) | In-repo, version-controlled | n/a | n/a |

**TODO**: until we are on Supabase Pro (PITR), set up a weekly
GitHub Actions workflow that runs `pg_dump --schema-only` + a
sanitized `--data-only` export and uploads to Cloudflare R2 with
object-lock. Sketch:

```yaml
# .github/workflows/db-backup.yml — TODO, not yet committed
on:
  schedule: [{ cron: '0 3 * * 1' }]  # Mon 03:00 UTC
jobs:
  dump:
    runs-on: ubuntu-latest
    steps:
      - uses: supabase/setup-cli@v1
      - run: supabase db dump --db-url "$DB_URL" -f db.sql
        env: { DB_URL: ${{ secrets.SUPABASE_DB_URL_RO }} }
      - run: |
          aws s3 cp db.sql s3://bordik-backups/$(date -u +%Y-%m-%d).sql \
            --endpoint-url $R2_ENDPOINT
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.R2_KEY }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET }}
          R2_ENDPOINT: ${{ secrets.R2_ENDPOINT }}
```

---

## 7. Incident Response runbook

> Goal: stop the bleeding, preserve evidence, notify, recover. Every
> phase has a hard time budget. Anything taking longer than the budget
> is escalated and the rest of the team is paged.

### 7.1 Severities
- **SEV-1**: data exfiltration confirmed, RCE, auth bypass, or > 30 min
  full outage. Page everyone. T+24h public statement.
- **SEV-2**: partial outage, single-user account takeover, suspected
  but not confirmed exfiltration. Acknowledge in 1 h.
- **SEV-3**: bug with security implications, no exploitation seen.
  Patch within the sprint.

### 7.2 First 15 minutes (any severity)
1. **Acknowledge** in `#sec` (or DM if pre-team).
   Note: timestamp (UTC), reporter, observable symptom.
2. **Snapshot**: `git rev-parse HEAD`, current Vercel deployment id,
   Supabase audit log range. Save to a private gist.
3. **Stop the bleeding** — pick the smallest available switch:
   - take Vercel deployment → "Deploy previous"
   - flip `MAINTENANCE_MODE=true` env var (TODO: add a banner that
     reads this) and redeploy
   - in Supabase: pause project (Settings → General → Pause project)

### 7.3 Hour 1: containment
- [ ] Rotate **all** secrets that may have leaked:
  - Supabase service-role (Project → API → Generate new keys)
  - Gemini API key (delete, create new, update Vercel)
  - GitHub PATs and deploy tokens
  - DB password
- [ ] Force sign-out of all sessions:
  ```sql
  -- Supabase SQL editor, as service role
  delete from auth.refresh_tokens;
  ```
  This invalidates every refresh token; users will hit the magic-link
  flow again on next visit.
- [ ] If user data was exposed: revoke any sharing/Storage public URLs.

### 7.4 Hours 1–24: investigation
- [ ] Pull Supabase logs (auth, postgres, edge) for the last 7 days,
      filter by suspect IPs / users.
- [ ] Pull Vercel logs (function + edge + build) for the deployment
      window.
- [ ] Diff the leaked artifact (if any) against the last known-good
      `npm ls --all` and `package-lock.json`.
- [ ] Check `npm audit --omit=dev` and `npm run check:leaks` against
      every recent build.
- [ ] Identify root cause (RCA); start the post-mortem doc.

### 7.5 Hours 1–72: notification
We process personal data of users in EU/UK/RU/UZ. Disclosure rules:

- **GDPR Art. 33** (EU/UK): notify the supervisory authority within
  **72 hours** of becoming aware, if there is a risk to user rights.
- **GDPR Art. 34** (EU/UK): notify affected users **without undue
  delay** if the risk is high.
- **152-FZ ст. 21** (RU): notify Roskomnadzor within **24 hours** of
  the breach being detected, with a follow-up within **72 hours**.
- **PDP Law (UZ)**: notify the personal-data agency without undue delay.

**Templates**:

```
Subject: Уведомление о возможном инциденте безопасности — Bordik

Уважаемый пользователь,

<DATE> мы обнаружили инцидент, который мог затронуть данные вашей
учётной записи на платформе Bordik Med. Затронутые
данные: <CATEGORIES>. Доказательства фактического использования:
<YES / NO>.

Что мы сделали: <CONTAINMENT STEPS>.
Что просим сделать вас: <ACTIONS, e.g. сменить пароль, выйти со всех
устройств>.

Контакт по инциденту: security@bordik.app
ID инцидента: <UUID>
```

### 7.6 After: post-mortem
- [ ] Blameless post-mortem within 1 week. Sections: timeline, RCA,
      what worked, what didn't, action items with owners + due dates.
- [ ] Add a regression test or detection that would have caught the
      issue earlier.
- [ ] Update this runbook if anything in 7.1–7.5 was wrong.

---

## 8. Secret rotation schedule

| Secret | Cadence | Owner |
|---|---|---|
| Supabase service-role | every 90 days, or on suspicion | privacy@ |
| Gemini API key | every 180 days | security@ |
| Vercel SSO admin password | every 180 days, 2FA always on | maintainer |
| Domain registrar | 2FA always on, password every 365 days | maintainer |
| GitHub PATs | max 90 days, prefer fine-grained | maintainer |
| Resend / SMTP | every 365 days | privacy@ |

Rotation must be **logged** (date, who, why) in the private secrets vault
(1Password / Bitwarden — not in this repo).

---

## 9. Self-audit cadence

- **Monthly**: run `npm audit`, `npm run check:leaks`, review Dependabot
  alerts, check Vercel & Supabase audit logs for unexpected admin events.
- **Quarterly**: re-run §1.7 RLS query, review this file end-to-end,
  rotate any secret approaching its expiry, walk the IR runbook against
  a hypothetical scenario (tabletop exercise).
- **Annually**: review all subprocessors (Vercel, Supabase, Google,
  Resend, Cloudflare), refresh DPAs, update Privacy Policy if changed.

---

## 10. Subprocessors

Mirrors `/privacy` §4. Source of truth for the legal-facing list lives
in `app/privacy/page.tsx`; this section is the operational index.

| Vendor | Purpose | Region | DPA |
|---|---|---|---|
| Supabase | Auth + Postgres | EU (Frankfurt) | https://supabase.com/legal/dpa |
| Vercel | Hosting + edge | Global, primary `fra1` | https://vercel.com/legal/dpa |
| Google (Gemini) | LLM for diagnostic questions | Global | https://cloud.google.com/terms/data-processing-addendum |
| Resend | Transactional email | EU/US | https://resend.com/legal/dpa |
| Cloudflare | DNS, Turnstile | Global | https://www.cloudflare.com/cloudflare-customer-dpa/ |

If you add a subprocessor: update `/privacy`, this table, and the DPO
inbox notification list.
