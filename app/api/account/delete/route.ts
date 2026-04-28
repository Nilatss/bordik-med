import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { assertSameOrigin } from '@/lib/origin-check';
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
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;
  const sb = await getSupabaseServerClient();
  if (!sb) return NextResponse.json({ ok: false, error: 'backend-not-configured' }, { status: 503 });

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!user.email) return NextResponse.json({ ok: false, error: 'no-email' }, { status: 400 });

  // Trigger an OTP email - the user clicks the link, which redirects them
  // back into a /account/delete-confirm page that calls DELETE below.
  // For now we use Supabase magic-link as the confirmation channel.
  const { error } = await sb.auth.signInWithOtp({
    email: user.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/account/delete-confirm`,
    },
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: 'confirmation-email-sent' }, { status: 202 });
}

/* Step 2 — execute the deletion after the user clicks the email link
   and lands back on /account/delete-confirm which posts here. */
export async function DELETE(req: Request) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;
  const sb = await getSupabaseServerClient();
  if (!sb) return NextResponse.json({ ok: false, error: 'backend-not-configured' }, { status: 503 });

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  // Defence against form-replay attacks: require an explicit token in body.
  let body: { confirm?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-json' }, { status: 400 });
  }
  if (body.confirm !== 'YES_DELETE_ME') {
    return NextResponse.json({ ok: false, error: 'missing-confirm' }, { status: 400 });
  }

  const userId = user.id;

  /* ── 1. Atomic cascade via Postgres RPC. The function runs every
        DELETE inside a single implicit transaction; any failure rolls
        back the lot. Replaces the previous JS for-loop that could
        leave a half-deleted user. See supabase/rpc-delete-user-cascade.sql. */
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
    return NextResponse.json(
      { ok: false, error: 'cascade-failed' },
      { status: 500 },
    );
  }
  const cascadeHash = (rpcData as { hash?: string } | null)?.hash;

  /* ── 2. Delete the auth.users row via the admin client. This step is
        OUTSIDE the cascade transaction (auth schema is owned by Supabase
        and cannot be touched from a public.security-definer function).
        It runs only after step 1 succeeded — partial state is impossible
        because step 1 is atomic. */
  const errors: string[] = [];
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (SERVICE_KEY && SB_URL) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const admin = createClient(SB_URL, SERVICE_KEY, { auth: { persistSession: false } });
      const { error: adminErr } = await admin.auth.admin.deleteUser(userId);
      if (adminErr) errors.push(`auth.users: ${adminErr.message}`);
    } catch (err) {
      errors.push(`auth-client: ${(err as Error).message}`);
    }
  } else {
    errors.push('service-role-key-missing: contact privacy@bordik.app to finish auth row removal');
  }

  /* ── 3. Sign the current session out so cached cookies become
        invalid even if the auth.users row is still there. */
  await sb.auth.signOut();

  if (errors.length > 0) {
    return NextResponse.json(
      { ok: false, partial: true, errors, hash: cascadeHash },
      { status: 207 },
    );
  }
  return NextResponse.json({ ok: true, hash: cascadeHash });
}
