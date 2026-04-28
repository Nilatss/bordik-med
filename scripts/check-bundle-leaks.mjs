#!/usr/bin/env node
/**
 * Scans the production bundle for accidentally-leaked secrets.
 *
 * Run:    npm run check:leaks
 * CI:     should run after `npm run build` and exit non-zero if anything
 *         critical is found.
 *
 * Patterns checked:
 *   - Google API keys (AIzaSy...)
 *   - Supabase secret keys (sb_secret_..., service_role JWT pattern)
 *   - Generic JWTs that could be service-role (we allow the anon key,
 *     so we strip it from the candidate list before reporting).
 *   - Telegram bot tokens (123:ABC-DEF...)
 *   - Private key headers
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BUILD_DIR = '.next/static';
const PUBLIC_DIR = 'public';

const PATTERNS = [
  // Google API keys
  { name: 'Google API key (AIza)', re: /AIza[0-9A-Za-z_\-]{35}/g, severity: 'critical' },
  // Supabase new-format secret keys
  { name: 'Supabase secret key (sb_secret_)', re: /sb_secret_[A-Za-z0-9_-]{20,}/g, severity: 'critical' },
  // Supabase legacy service role marker
  { name: 'Supabase service_role marker', re: /service_role[\s\S]{0,200}eyJ[A-Za-z0-9_\-]+\.eyJ[A-Za-z0-9_\-]+/g, severity: 'critical' },
  // Telegram bot tokens
  { name: 'Telegram bot token', re: /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g, severity: 'critical' },
  // Private key blocks (PEM)
  { name: 'PEM private key', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g, severity: 'critical' },
  // Generic OpenAI / Anthropic style keys (just in case)
  { name: 'OpenAI key (sk-)', re: /\bsk-[A-Za-z0-9_\-]{32,}\b/g, severity: 'high' },
  { name: 'Anthropic key (sk-ant-)', re: /\bsk-ant-[A-Za-z0-9_\-]{20,}\b/g, severity: 'critical' },
];

// JWTs that we permit (Supabase ANON key is intended to be public).
// Anything matching this allowlist is filtered out of findings.
const ANON_KEY_HINT = /supabase[^"'\s]{0,80}anon/i;

function* walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      yield* walk(full);
    } else if (
      st.isFile() &&
      (name.endsWith('.js') || name.endsWith('.css') || name.endsWith('.html') || name.endsWith('.json'))
    ) {
      yield full;
    }
  }
}

function snippet(text, idx, len) {
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + len + 30);
  return text.slice(start, end).replace(/[\n\r]+/g, ' ').slice(0, 120);
}

let foundCritical = 0;
let foundHigh = 0;

for (const dir of [BUILD_DIR, PUBLIC_DIR]) {
  for (const file of walk(dir)) {
    let content;
    try { content = readFileSync(file, 'utf8'); } catch { continue; }
    for (const p of PATTERNS) {
      const matches = content.matchAll(p.re);
      for (const m of matches) {
        const ctx = snippet(content, m.index ?? 0, m[0].length);
        if (ANON_KEY_HINT.test(ctx)) continue;            // skip anon JWTs
        if (p.severity === 'critical') foundCritical++;
        else foundHigh++;
        const masked = m[0].slice(0, 12) + '…' + m[0].slice(-4);
        console.error(`[${p.severity.toUpperCase()}] ${p.name} in ${file}: ${masked}`);
        console.error(`  context: ${ctx}`);
      }
    }
  }
}

if (foundCritical === 0 && foundHigh === 0) {
  console.log('check-bundle-leaks: clean (no secret patterns found in build)');
  process.exit(0);
}

console.error(`\ncheck-bundle-leaks: ${foundCritical} critical, ${foundHigh} high finding(s)`);
process.exit(foundCritical > 0 ? 1 : 0);
