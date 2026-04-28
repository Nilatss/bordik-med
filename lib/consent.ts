'use client';
/**
 * Consent recording helper.
 *
 * Inserts an append-only row in `consent_records` for legal evidence
 * that the user accepted/withdrew a specific consent at a specific
 * version of the policy. The table is RLS-protected to the user's own
 * rows (see supabase/rls-hardening.sql).
 *
 * Failure is non-fatal: if the network is down or Supabase is paused,
 * we log to console but do NOT block the UI flow. The legal record will
 * be missing but the user is not punished for our infra.
 */
import { getSupabaseBrowserClient } from './supabase/client';

export type ConsentType =
  | 'proctoring_camera'
  | 'ai_generated_content'
  | 'privacy_policy'
  | 'terms_of_use'
  | 'biometric_processing';

// Bump this when the wording / scope of the consent meaningfully changes.
// Keep the ISO date so we can audit which version each user saw.
export const CONSENT_VERSIONS: Record<ConsentType, string> = {
  proctoring_camera:    '2026-04-28',
  ai_generated_content: '2026-04-28',
  privacy_policy:       '2026-04-28',
  terms_of_use:         '2026-04-28',
  biometric_processing: '2026-04-28',
};

export async function recordConsent(
  type: ConsentType,
  granted: boolean,
): Promise<void> {
  try {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    // Truncate UA so we don't store a fingerprint.
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent)
      ? navigator.userAgent.slice(0, 200)
      : null;

    await sb.from('consent_records').insert({
      user_id:        user.id,
      consent_type:   type,
      consent_version: CONSENT_VERSIONS[type],
      granted,
      user_agent:     ua,
      ip_hash:        null,   // server-side ip_hash via DB trigger or edge fn (TODO)
    });
  } catch (err) {
    console.warn('[consent] record failed (non-fatal)', err);
  }
}
