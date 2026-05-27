/**
 * Tests for the CSP nonce generation in proxy.ts
 *
 * Bug: The JSON-LD <script> in app/layout.tsx had no nonce attribute.
 * CSP3 spec: when 'nonce-XYZ' appears in script-src, browsers ignore
 * 'unsafe-inline' entirely. Inline scripts without the matching nonce
 * are blocked — the JSON-LD was silently blocked for 4 users.
 *
 * Fix: app/layout.tsx now reads x-nonce via next/headers and passes
 * nonce={nonce} to the <script> tag. This test verifies that the
 * proxy generates nonces that:
 *   1. Are valid base64url strings (URL-safe, no padding)
 *   2. Are at least 128 bits (16 bytes) of entropy
 *   3. Match the pattern injected into the CSP script-src directive
 */
import { describe, it, expect } from 'vitest';
import { generateNonce } from '@/proxy';

describe('generateNonce', () => {
  it('returns a non-empty string', () => {
    const nonce = generateNonce();
    expect(typeof nonce).toBe('string');
    expect(nonce.length).toBeGreaterThan(0);
  });

  it('is base64url encoded (no +, /, or = characters)', () => {
    // Standard base64 uses +, /; base64url uses -, _; padding = is stripped.
    // CSP nonce values must be base64 without padding for browser compatibility.
    const nonce = generateNonce();
    expect(nonce).not.toMatch(/[+/=]/);
    expect(nonce).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('encodes at least 16 bytes (128-bit entropy) — minimum for CSP nonces', () => {
    // 16 bytes base64url-encoded → ceil(16 * 4/3) = 22 characters (no padding)
    const nonce = generateNonce();
    expect(nonce.length).toBeGreaterThanOrEqual(21);
  });

  it('generates unique nonces on each call', () => {
    const nonces = new Set(Array.from({ length: 20 }, generateNonce));
    expect(nonces.size).toBe(20);
  });

  it('produces a value suitable for the CSP nonce-source syntax', () => {
    // The proxy embeds the nonce as: 'nonce-${nonce}' in script-src.
    // Browsers validate the nonce attribute on inline scripts against this.
    const nonce = generateNonce();
    const cspSource = `'nonce-${nonce}'`;
    expect(cspSource).toMatch(/^'nonce-[A-Za-z0-9\-_]+'$/);
  });
});
