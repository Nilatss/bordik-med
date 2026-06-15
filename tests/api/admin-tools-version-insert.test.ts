/**
 * Tests for Bug-2: missing error detection on `tools_versions.insert` in
 * app/api/admin/tools/[id]/route.ts.
 *
 * Root cause: `await sb.from('tools_versions').insert({...})` was called
 * without destructuring or checking the returned `error` field. When the
 * insert fails (unique constraint, FK violation, network error), the
 * failure was invisible — the approval was logged as successful, but no
 * version snapshot existed in tools_versions.
 *
 * Fix: destructure `{ error: versionErr }` and console.error when it is set.
 * The approval itself is not rolled back (tools status was already set to
 * 'published' in the prior update call) — version archiving is best-effort
 * audit logging, so apiOk() is still returned but the failure is now visible.
 *
 * These tests validate the error-detection contract without requiring a live
 * Supabase connection, by testing the same conditional pattern the route uses.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => vi.restoreAllMocks());

/** Minimal shape of what Supabase's `.insert()` returns on success vs failure. */
interface InsertResult {
  error: { message: string; code?: string } | null;
}

/**
 * Mirrors the FIXED logic from the approve branch in route.ts.
 * Before: `await sb.from(...).insert(...)` — return value discarded.
 * After:  `const { error: versionErr } = await sb.from(...).insert(...)` +
 *         `if (versionErr) console.error(...)`.
 */
async function saveVersionSnapshot(
  insert: () => Promise<InsertResult>,
  logger: (msg: string) => void = () => {},
): Promise<boolean> {
  const { error: versionErr } = await insert();
  if (versionErr) {
    logger(`tools_versions insert failed: ${versionErr.message}`);
    return false;
  }
  return true;
}

describe('admin/tools approve — tools_versions insert error detection (Bug-2)', () => {
  it('detects and logs a failed insert without throwing', async () => {
    const logs: string[] = [];
    const failingInsert = vi.fn<() => Promise<InsertResult>>().mockResolvedValue({
      error: { message: 'duplicate key value violates unique constraint', code: '23505' },
    });

    const saved = await saveVersionSnapshot(failingInsert, (msg) => logs.push(msg));

    expect(saved).toBe(false);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toContain('duplicate key');
  });

  it('returns true on successful insert (no error)', async () => {
    const logs: string[] = [];
    const okInsert = vi.fn<() => Promise<InsertResult>>().mockResolvedValue({ error: null });

    const saved = await saveVersionSnapshot(okInsert, (msg) => logs.push(msg));

    expect(saved).toBe(true);
    expect(logs).toHaveLength(0);
  });

  it('pre-fix pattern (discarded return) cannot detect the error', async () => {
    // This simulates the bug: the return value of insert() is never inspected.
    // Even when the insert fails, `savedVersionOk` is always true.
    async function saveVersionBuggy(
      insert: () => Promise<InsertResult>,
    ): Promise<boolean> {
      await insert(); // BUG: { error } not destructured → failure invisible
      return true;
    }

    const failingInsert = vi.fn<() => Promise<InsertResult>>().mockResolvedValue({
      error: { message: 'FK violation', code: '23503' },
    });

    const saved = await saveVersionBuggy(failingInsert);

    // Bug confirmed: caller believes insert succeeded even though it failed.
    expect(saved).toBe(true);
    // No way to know an error occurred — audit trail silently broken.
  });

  it('FK violation scenario (tool_id not in tools table)', async () => {
    const logs: string[] = [];
    const fkViolation = vi.fn<() => Promise<InsertResult>>().mockResolvedValue({
      error: { message: 'insert or update on table "tools_versions" violates foreign key constraint', code: '23503' },
    });

    const saved = await saveVersionSnapshot(fkViolation, (msg) => logs.push(msg));

    expect(saved).toBe(false);
    expect(logs[0]).toContain('foreign key constraint');
  });

  it('approval flow still returns ok even when version snapshot fails', async () => {
    // Contract: the tool's status is 'published' before the insert runs.
    // A failed insert must not roll back the approval — it's audit-only.
    // The route calls `return apiOk()` regardless of versionErr.
    const failingInsert = vi.fn<() => Promise<InsertResult>>().mockResolvedValue({
      error: { message: 'network timeout', code: 'PGRST' },
    });

    // The approval response (apiOk) is NOT conditioned on the insert result.
    let approvalReturned = false;
    async function approveFlow(insert: () => Promise<InsertResult>): Promise<{ ok: true }> {
      const { error: versionErr } = await insert();
      if (versionErr) {
        console.error('[admin/tools] tools_versions insert failed:', versionErr.message);
      }
      // apiOk() is always returned — the publish already happened above.
      approvalReturned = true;
      return { ok: true };
    }

    const result = await approveFlow(failingInsert);
    expect(result).toEqual({ ok: true });
    expect(approvalReturned).toBe(true);
  });
});
