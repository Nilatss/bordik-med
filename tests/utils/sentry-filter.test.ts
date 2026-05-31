/**
 * Tests for lib/sentry-filter.ts — the Sentry beforeSend predicates.
 *
 * Covers the issues fixed in NEXTJS-1F/19 (MetaMask extension noise)
 * and NEXTJS-12 (Serwist SW registration rejection).
 */
import { describe, it, expect } from 'vitest';
import { isExtensionScriptError, type SentryEventLike } from '@/lib/sentry-filter';

// ─── isExtensionScriptError ───────────────────────────────────────────────────

describe('isExtensionScriptError', () => {
  it('returns true when all frames are from MetaMask inpage.js (app:/// prefix)', () => {
    const event: SentryEventLike = {
      exception: {
        values: [
          {
            value: "Cannot read properties of undefined (reading 'emit')",
            stacktrace: {
              frames: [
                { filename: 'app:///inpage.js' },
                { filename: 'app:///inpage.js' },
              ],
            },
          },
        ],
      },
    };
    expect(isExtensionScriptError(event)).toBe(true);
  });

  it('returns true when frames mix inpage.js paths (scripts/inpage.js)', () => {
    const event: SentryEventLike = {
      exception: {
        values: [
          {
            value: 'Failed to connect to MetaMask',
            stacktrace: {
              frames: [
                { filename: 'app:///scripts/inpage.js' },
              ],
            },
          },
        ],
      },
    };
    expect(isExtensionScriptError(event)).toBe(true);
  });

  it('returns true for chrome-extension:// URLs', () => {
    const event: SentryEventLike = {
      exception: {
        values: [
          {
            stacktrace: {
              frames: [
                { filename: 'chrome-extension://abc123/inpage.js' },
              ],
            },
          },
        ],
      },
    };
    expect(isExtensionScriptError(event)).toBe(true);
  });

  it('returns false when at least one frame is from app code', () => {
    const event: SentryEventLike = {
      exception: {
        values: [
          {
            stacktrace: {
              frames: [
                { filename: 'app:///inpage.js' },
                { filename: 'app:///components/tools/ToolView.tsx' },
              ],
            },
          },
        ],
      },
    };
    expect(isExtensionScriptError(event)).toBe(false);
  });

  it('returns false when there are no frames', () => {
    const event: SentryEventLike = {
      exception: { values: [{ value: 'some error', stacktrace: { frames: [] } }] },
    };
    expect(isExtensionScriptError(event)).toBe(false);
  });

  it('returns false for a normal app error', () => {
    const event: SentryEventLike = {
      exception: {
        values: [
          {
            value: 'TypeError: Cannot read properties of null',
            stacktrace: {
              frames: [
                { filename: 'app:///lib/runners/bmi.ts' },
                { filename: 'app:///components/tools/ToolView.tsx' },
              ],
            },
          },
        ],
      },
    };
    expect(isExtensionScriptError(event)).toBe(false);
  });
});
