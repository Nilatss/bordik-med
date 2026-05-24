#!/usr/bin/env node
/**
 * P1-SEC-2 — Self-host MediaPipe WASM.
 *
 * Copies @mediapipe/tasks-vision/wasm/* from node_modules into
 * public/mediapipe/wasm/ and writes integrity.json with sha384 hashes.
 * Run: as part of `prebuild` (Vercel + local) so the deployed bundle
 * always carries the WASM matching the installed npm version.
 *
 * Why self-host:
 *   - Drops `cdn.jsdelivr.net` from script-src + connect-src CSP
 *     (smaller blast radius, no third-party CDN trust needed).
 *   - Same-origin fetch ⇒ Service Worker can cache it offline without
 *     extra opaque-response handling.
 *   - integrity.json records the sha384 of every WASM file we ship: a
 *     build-time MANIFEST for audit + detecting unexpected version drift
 *     across builds. NOTE: it is NOT verified at runtime today —
 *     MediaPipe's FilesetResolver fetches the .wasm internally, so there
 *     is no SRI hook. Treat it as a forensic record, not an enforced
 *     control. A real load-time check would have to fetch+digest each
 *     asset and hand MediaPipe a verified blob URL (not yet implemented).
 *
 * The WASM blobs are NOT committed to git (see .gitignore); they are
 * regenerated from node_modules on every install / build.
 */
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SRC_DIR = join(ROOT, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
const DST_DIR = join(ROOT, 'public', 'mediapipe', 'wasm');

if (!existsSync(SRC_DIR)) {
  console.warn(`[sync-mediapipe] source dir not found: ${SRC_DIR} — skipping (npm install not run yet?)`);
  process.exit(0);
}

mkdirSync(DST_DIR, { recursive: true });

const integrity = {};
let copied = 0;
for (const entry of readdirSync(SRC_DIR)) {
  const src = join(SRC_DIR, entry);
  const dst = join(DST_DIR, entry);
  const st = statSync(src);
  if (!st.isFile()) continue;
  copyFileSync(src, dst);
  const buf = readFileSync(dst);
  integrity[entry] = `sha384-${createHash('sha384').update(buf).digest('base64')}`;
  copied++;
}

writeFileSync(
  join(DST_DIR, 'integrity.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      // Lock to the version we resolved at install time so an unexpected
      // upgrade trips the integrity check rather than silently changing
      // hashes.
      packageVersion: JSON.parse(
        readFileSync(join(ROOT, 'node_modules', '@mediapipe', 'tasks-vision', 'package.json'), 'utf8'),
      ).version,
      hashes: integrity,
    },
    null,
    2,
  ) + '\n',
);

console.log(`[sync-mediapipe] copied ${copied} files into ${DST_DIR.replace(ROOT, '')}; integrity.json written`);
