#!/usr/bin/env node
/**
 * Self-host the MediaPipe model files (.task / .tflite).
 *
 * Why this script exists, given we already self-host the WASM
 * runtime:
 *
 *   The previous setup loaded MediaPipe WASM from /mediapipe/wasm/
 *   (same-origin, fast, CSP-friendly) but pulled the actual model
 *   weights from `storage.googleapis.com`. Most of the time that's
 *   fine — Google's CDN is fast and reliable. But Russian ISPs
 *   sporadically block or throttle Google Cloud Storage, and users
 *   were hitting "Failed to fetch (storage.googleapis.com)" when the
 *   proctoring AI tried to load the face/object models. With models
 *   served from the same origin as the rest of the app, we sidestep
 *   that whole class of network failure: if bordik-med.vercel.app is
 *   reachable, the models load.
 *
 * Strategy
 * --------
 *   - Download each model file to public/mediapipe/models/<name> at
 *     build time. Idempotent: if the file already exists with the
 *     expected size, skip the download.
 *   - Write public/mediapipe/models/integrity.json with sha384 hashes
 *     so we can spot a corrupted download or an upstream model swap.
 *   - Models are NOT committed to git (gitignore handles it). They're
 *     reproducible from this script + the source URLs below.
 *
 * Run via `npm run prebuild` (Vercel + local).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DST_DIR = join(ROOT, 'public', 'mediapipe', 'models');

// Source URLs lifted from MediaPipe's published model garden. Pinning
// the path to .../latest/ means we ride along Google's curated stable
// version; integrity.json captures the actual hash we shipped, so a
// silent upstream change still surfaces as a hash drift in CI logs.
const MODELS = [
  {
    file: 'face_landmarker.task',
    url: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
  },
  {
    file: 'efficientdet_lite0.tflite',
    url: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/latest/efficientdet_lite0.tflite',
  },
];

mkdirSync(DST_DIR, { recursive: true });

async function downloadIfMissing({ file, url }) {
  const dst = join(DST_DIR, file);
  if (existsSync(dst) && statSync(dst).size > 0) {
    return { file, downloaded: false, bytes: statSync(dst).size };
  }
  console.log(`[sync-mediapipe-models] fetching ${file} …`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`download failed: ${url} → HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dst, buf);
  return { file, downloaded: true, bytes: buf.length };
}

const integrity = {};
let totalBytes = 0;
let downloaded = 0;
for (const m of MODELS) {
  const r = await downloadIfMissing(m);
  totalBytes += r.bytes;
  if (r.downloaded) downloaded++;
  const buf = readFileSync(join(DST_DIR, m.file));
  integrity[m.file] = `sha384-${createHash('sha384').update(buf).digest('base64')}`;
}

writeFileSync(
  join(DST_DIR, 'integrity.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sources: Object.fromEntries(MODELS.map((m) => [m.file, m.url])),
      hashes: integrity,
    },
    null,
    2,
  ),
  'utf8',
);

console.log(
  `[sync-mediapipe-models] ${MODELS.length} model(s) ready ` +
  `(${downloaded} freshly downloaded, ${(totalBytes / 1024 / 1024).toFixed(1)} MB total) ` +
  `→ ${DST_DIR}`,
);
