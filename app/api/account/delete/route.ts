import { withAuthedSupabase, parseJsonBody, apiError, apiOk } from '@/lib/api-helpers';
import { identifyAndLimit } from '@/lib/rate-limit';
import { log } from '@/lib/log';

/**
 * GDPR Art. 17 / 152-ФЗ ст. 14 — right to erasure.
 *
 * Two-step flow to prevent CSRF / accidental deletion:
 *   1. POST without body → server emails a confirmation link
 *      (handled by Supabase auth.signInWithOtp + custom template).
 *      Returns 202 Accepted.
 *   2. DELETE with `{ confirm: 'YES_DELETE_ME' }` → cascades the wipe.
 *
 * Cascade order matters - we delete dependent rows BEFORE the auth row
 * so the foreign keys don't trip.
 *
 * NOTE: deleting `auth.users` requires service-role / admin client. We
 * lazy-import that client only here to keep the secret out of any
 * accidentally bundled module path.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Step 1 — request a deletion confirmation email. */
export async function POST(req: Request) {
  return withAuthedSupabase(req, async (sb, user) => {
    if (!user.email) return apiError('bad-input', 400, { reason: 'no-email' });

    // Rate-limit OTP-email sends per authenticated user so a client can't
    // spam the mailbox / burn the Supabase+Resend email quota. Supabase
    // enforces its own ~1/60s OTP limit; this is defence-in-depth at our
    // layer (a real user never requests account deletion 60x/min, so the
    // per-user bucket never trips legitimately).
    const decision = await identifyAndLimit(req, user.id);
    if (!decision.ok) {
      const limited = apiError('rate-limited', 429, { retryAfter: decision.retryAfter });
      for (const [k, v] of Object.entries(decision.headers)) limited.headers.set(k, v);
      return limited;
    }

    // Trigger an OTP email - user clicks link, lands on /account/delete-confirm
    // which calls DELETE below. Supabase magic-link as confirmation channel.
    const { error } = await sb.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/account/delete-confirm`,
      },
    });
    if (error) return apiError(error.message, 400);
    return apiOk({ message: 'confirmation-email-sent' }, 202);
  });
}

/* Step 2 — execute the deletion after the user clicks the email link
   and lands back on /account/delete-confirm which posts here. */
export async function DELETE(req: Request) {
  return withAuthedSupabase(req, async (sb, user) => {
    // Defence against form-replay attacks: require explicit token in body.
    const parsed = await parseJsonBody<{ confirm?: string }>(req);
    if (!parsed.ok) return parsed.response;
    if (parsed.data.confirm !== 'YES_DELETE_ME') {
      return apiError('bad-input', 400, { reason: 'missing-confirm' });
    }

    const userId = user.id;

    /* ── 1. Atomic cascade via Postgres RPC. */
    const { data: rpcData, error: rpcErr } = await sb.rpc('delete_user_cascade', {
      target_user_id: userId,
    });
    if (rpcErr) {
      log.error({
        event: 'cascade_rpc_failed',
        code: rpcErr.code,
        hint: rpcErr.hint,
        message: rpcErr.message?.slice(0, 200),
      });
      return apiError('internal-error', 500, { reason: 'cascade-failed' });
    }
    const cascadeHash = (rpcData as { hash?: string } | null)?.hash;

    /* ── 2. Delete auth.users row via admin client (outside RPC transaction). */
    let authRowDeleted = true;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (SERVICE_KEY && SB_URL) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const admin = createClient(SB_URL, SERVICE_KEY, { auth: { persistSession: false } });
        const { error: adminErr } = await admin.auth.admin.deleteUser(userId);
        if (adminErr) {
          authRowDeleted = false;
          // Log raw reason server-side only — do NOT return Supabase/driver
          // messages to the client (they may leak table/column names).
          log.error({ event: 'delete_auth_user_failed', code: adminErr.code, message: adminErr.message?.slice(0, 200) });
        }
      } catch (err) {
        authRowDeleted = false;
        log.error({ event: 'delete_auth_client_threw', message: (err as Error).message?.slice(0, 200) });
      }
    } else {
      authRowDeleted = false;
      log.warn({ event: 'delete_auth_skipped', reason: 'service-role-key-missing' });
    }

    /* ── 3. Sign session out so cached cookies become invalid. */
    await sb.auth.signOut();

    if (!authRowDeleted) {
      // Cascade RPC succeeded (user data wiped), but the auth.users row
      // could not be removed — user should contact support for full cleanup.
      return apiError('internal-error', 207, { partial: true, reason: 'auth-row-pending', hash: cascadeHash });
    }
    return apiOk({ hash: cascadeHash });
  });
}
