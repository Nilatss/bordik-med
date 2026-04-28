import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

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
export async function POST() {
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

  /* ── 1. Cascade delete of all dependent user rows.
        order: children first to satisfy FK constraints (where they exist). */
  const tables = [
    'test_attempts',
    'tool_settings',
    'course_progress',
    'study_time',
    'consent_records',                // (will be created by S4.3)
    'profiles',
  ];

  const errors: string[] = [];
  for (const t of tables) {
    const { error } = await sb.from(t).delete().eq('user_id', userId);
    if (error) {
      // Ignore "relation does not exist" - some tables may not yet be created.
      if (!/relation .* does not exist|does not exist/i.test(error.message)) {
        errors.push(`${t}: ${error.message}`);
      }
    }
  }

  /* ── 2. Delete the auth.users row via the admin client. Without the
        service role key this step fails - we surface that to the user. */
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
    // No service key - leave auth row in place and tell the user that the
    // remaining cleanup needs admin help.
    errors.push('service-role-key-missing: contact privacy@bordik.app to finish auth row removal');
  }

  /* ── 3. Audit trail. We deliberately log only a hash of the userId,
        no PII, so the audit can survive even after the user row is gone. */
  try {
    const hash = await sha256Hex(userId);
    await sb.from('deletion_audit').insert({
      user_id_hash: hash,
      deleted_at: new Date().toISOString(),
      had_errors: errors.length > 0,
      error_summary: errors.slice(0, 3).join(' | ').slice(0, 500),
    });
  } catch {/* deletion_audit might not exist yet - silent skip */}

  /* ── 4. Sign the current session out so any cached cookies become
        invalid even if the auth.users row is still there. */
  await sb.auth.signOut();

  if (errors.length > 0) {
    return NextResponse.json(
      { ok: false, partial: true, errors },
      { status: 207 },                  // Multi-Status — partial success
    );
  }
  return NextResponse.json({ ok: true });
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
