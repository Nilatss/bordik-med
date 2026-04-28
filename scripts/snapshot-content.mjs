#!/usr/bin/env node
/**
 * Content snapshot exporter (Stage 3.4 of the audit plan).
 *
 * Reads the canonical published state from Supabase (view `tool_published`)
 * and writes it to `public/snapshot.json` so the Service Worker can precache
 * the offline-pack for all clients on next deploy.
 *
 * Designed to be run:
 *   - Locally on demand: `npm run snapshot:content`
 *   - From CI as part of a scheduled GitHub Action (every 6 hours)
 *   - From a Supabase Edge Function on a pg_cron trigger
 *
 * Required env (loaded from .env or CI secrets):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (server-only secret - never expose client-side)
 *
 * Graceful fallback: when env vars or the schema are missing, exits with
 * code 0 and a clear message so it can be wired into prebuild without
 * blocking devs who haven't run the SQL migration yet.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_PUBLIC = join(ROOT, 'public', 'snapshot.json');
const OUT_PRIVATE = join(ROOT, 'data', 'snapshot.json');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.log('snapshot-content: skipped (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set)');
  process.exit(0);
}

async function fetchPublished() {
  const url = `${SUPABASE_URL}/rest/v1/tool_published?select=*`;
  const r = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'accept-profile': 'public',
    },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    if (r.status === 404 || /relation .* does not exist/i.test(txt) || /tool_published/.test(txt)) {
      console.log(`snapshot-content: schema not migrated yet (HTTP ${r.status}). Run supabase/content-schema.sql first.`);
      return null;
    }
    throw new Error(`Supabase ${r.status}: ${txt.slice(0, 200)}`);
  }
  return await r.json();
}

function sha(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 12);
}

(async () => {
  try {
    const rows = await fetchPublished();
    if (rows == null) {
      // Graceful skip - SQL not yet applied. Don't fail the build.
      process.exit(0);
    }
    const snapshot = {
      generatedAt: new Date().toISOString(),
      count: rows.length,
      tools: rows,
    };
    const json = JSON.stringify(snapshot);
    mkdirSync(dirname(OUT_PUBLIC), { recursive: true });
    mkdirSync(dirname(OUT_PRIVATE), { recursive: true });
    writeFileSync(OUT_PUBLIC, json);
    writeFileSync(OUT_PRIVATE, json);
    console.log(`snapshot-content: wrote ${rows.length} tools (${(json.length / 1024).toFixed(1)} KB) rev=${sha(json)}`);
  } catch (err) {
    console.error('snapshot-content: failed -', err.message ?? err);
    process.exit(1);
  }
})();
