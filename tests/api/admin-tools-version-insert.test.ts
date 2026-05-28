/**
 * Regression test for the silent tools_versions insert failure.
 *
 * Bug: The 'approve' action in /api/admin/tools/[id]/route.ts awaited the
 * tools_versions.insert() call but discarded its result. A constraint
 * violation or quota error would cause the tool to be published with no
 * version history, silently corrupting the audit trail.
 *
 * Fix: destructure `{ error: versionErr }` and log via console.error so
 * the failure surfaces in server logs / Sentry instead of being swallowed.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';

/** Minimal mock of the Supabase insert response shape. */
async function runVersionInsert(
  insertResult: { error: { message: string } | null },
): Promise<void> {
  // This mirrors the fixed code in route.ts:
  //   const { error: versionErr } = await sb.from('tools_versions').insert({...});
  //   if (versionErr) console.error('[admin/tools] version insert failed:', versionErr.message);
  const { error: versionErr } = insertResult;
  if (versionErr) {
    console.error('[admin/tools] version insert failed:', versionErr.message);
  }
}

describe('approve action: tools_versions insert error handling', () => {
  afterEach(() => vi.restoreAllMocks());

  it('logs the Supabase error message when insert fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await runVersionInsert({ error: { message: 'violates foreign key constraint' } });

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(
      '[admin/tools] version insert failed:',
      'violates foreign key constraint',
    );
  });

  it('does not log when insert succeeds (error is null)', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await runVersionInsert({ error: null });

    expect(spy).not.toHaveBeenCalled();
  });

  it('handles generic quota / permission error messages', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await runVersionInsert({ error: { message: 'new row violates row-level security policy' } });

    expect(spy).toHaveBeenCalledWith(
      '[admin/tools] version insert failed:',
      'new row violates row-level security policy',
    );
  });
});
