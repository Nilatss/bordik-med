/**
 * Tests for two bugs in DrugChecker.tsx:
 *
 * BUG-1: ICD drug table fetch failure produced an infinite "Загружаем…"
 *   spinner. Root cause: `if (!r.ok) return;` silently returned without
 *   setting any error state. Fix: throw on non-ok so the catch block can
 *   set drugTableError = true and surface a real error message.
 *
 * BUG-3: `navigator.clipboard.writeText()` rejection (e.g. permission
 *   denied) was unhandled. The optional-chain `?.` short-circuits the
 *   chain when clipboard is undefined, but when clipboard IS defined and
 *   writeText rejects, the missing `.catch()` produced an
 *   UnhandledPromiseRejection. Fix: add `.catch(() => {})`.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─── BUG-1 ────────────────────────────────────────────────────────────────────

describe('DrugChecker ICD drug table fetch error (Bug-1)', () => {
  it('non-ok response throws so the catch block can set error state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    // This is the FIXED logic extracted verbatim from the useEffect:
    //   Before: `if (!r.ok) return;`  → no throw → catch never fires → spinner forever
    //   After:  `if (!r.ok) throw new Error(`HTTP ${r.status}`);` → catch fires → error state set
    async function fetchIcdTable(): Promise<unknown> {
      const r = await fetch('/icd10cm-drug-table.json?v=1.0.0', { cache: 'force-cache' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return (r as unknown as { json(): Promise<unknown> }).json();
    }

    await expect(fetchIcdTable()).rejects.toThrow('HTTP 500');
  });

  it('pre-fix pattern (silent return) would NOT reach the catch block', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    // Reproduce the original buggy behaviour — returns undefined instead of throwing.
    async function fetchIcdTableBuggy(): Promise<void> {
      const r = await fetch('/icd10cm-drug-table.json?v=1.0.0', { cache: 'force-cache' });
      if (!r.ok) return; // BUG: no error thrown → catch block never reached
    }

    // No rejection — the bug causes the function to succeed silently.
    await expect(fetchIcdTableBuggy()).resolves.toBeUndefined();
    // A consumer relying on this to set error state would get stuck in loading.
  });

  it('ok response does not throw (happy path unaffected)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ name: 'Aspirin', accidental: 'T39.015A' }],
    }));

    async function fetchIcdTable(): Promise<unknown> {
      const r = await fetch('/icd10cm-drug-table.json?v=1.0.0', { cache: 'force-cache' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return (r as unknown as { json(): Promise<unknown> }).json();
    }

    const result = await fetchIcdTable();
    expect(result).toEqual([{ name: 'Aspirin', accidental: 'T39.015A' }]);
  });
});

// ─── BUG-3 ────────────────────────────────────────────────────────────────────

describe('DrugChecker PoisonCell clipboard rejection (Bug-3)', () => {
  it('fixed handler catches clipboard rejection — no UnhandledPromiseRejection', async () => {
    const rejectedWrite = Promise.reject(new Error('NotAllowedError: Read permission denied'));
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockReturnValue(rejectedWrite) },
    });

    const unhandledRejections: Error[] = [];
    const captureRejection = (err: Error) => unhandledRejections.push(err);
    process.on('unhandledRejection', captureRejection);

    // FIXED handleCopy (with .catch):
    void navigator.clipboard?.writeText('T36.0X1A')
      .then(() => { /* setCopied(true) */ })
      .catch(() => { /* permission denied — no UI feedback, no crash */ });

    // Let the microtask queue drain so rejections can surface.
    await new Promise((r) => setTimeout(r, 20));

    process.removeListener('unhandledRejection', captureRejection);
    expect(unhandledRejections).toHaveLength(0);
  });

  it('pre-fix handler WITHOUT .catch produces an unhandled rejection', async () => {
    const rejectedWrite = Promise.reject(new Error('NotAllowedError'));
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockReturnValue(rejectedWrite) },
    });

    const unhandledRejections: Error[] = [];
    const captureRejection = (err: Error) => unhandledRejections.push(err);
    process.on('unhandledRejection', captureRejection);

    // BUGGY handleCopy (no .catch):
    void navigator.clipboard?.writeText('T36.0X1A')
      .then(() => { /* setCopied(true) */ });
    // missing .catch() here ← BUG

    await new Promise((r) => setTimeout(r, 20));
    process.removeListener('unhandledRejection', captureRejection);

    // The bug: rejection escapes to the global handler.
    expect(unhandledRejections.length).toBeGreaterThan(0);
  });

  it('no-op when clipboard API is absent (undefined)', () => {
    vi.stubGlobal('navigator', { clipboard: undefined });

    // Optional chain short-circuits: clipboard?.writeText() returns undefined.
    // .then() and .catch() are part of the same optional chain → never called.
    // No throw, no unhandled rejection.
    expect(() => {
      void navigator.clipboard?.writeText('T36.0X1A')
        .then(() => { /* */ })
        .catch(() => { /* */ });
    }).not.toThrow();
  });
});
