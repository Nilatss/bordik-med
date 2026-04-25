#!/usr/bin/env node
/**
 * Optimise public-folder PNGs:
 *   • Convert each PNG → WebP (quality 80) sibling file.
 *   • Re-encode the original PNG with stronger compression
 *     (palette + zlib level 9) so legacy <img> usage also benefits.
 *
 * The converter is idempotent: re-running on already-optimised assets
 * is fine, every output gets fully rewritten from the source PNG.
 *
 * Targets:
 *   • public/course/(any)/*.png   — lesson illustrations (1–5 MB each)
 *   • public/logo-bordik.png      — sidebar logo (140 KB)
 *
 * Usage:  node scripts/optimize-images.mjs
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(here, '..', 'public');

const sharp = (await import('sharp')).default;

/** Recursively collect every PNG path under root. */
function walk(dir) {
  const out = [];
  for (const ent of readdirSync(dir)) {
    const p = join(dir, ent);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (st.isFile() && extname(p).toLowerCase() === '.png') out.push(p);
  }
  return out;
}

function fmtKb(bytes) { return `${(bytes / 1024).toFixed(1)} KB`; }

const pngs = walk(PUBLIC);
console.log(`Found ${pngs.length} PNG(s)\n`);

let totalSaved = 0;

for (const png of pngs) {
  const original = readFileSync(png);
  const beforeBytes = original.length;
  const rel = png.replace(PUBLIC, '').replace(/\\/g, '/');

  // 1. Encode WebP next to it. quality 80 is visually identical to PNG
  //    for medical illustrations (no fine gradients) but ~10× smaller.
  const webpPath = png.replace(/\.png$/i, '.webp');
  const webpBuf = await sharp(original).webp({ quality: 80, effort: 6 }).toBuffer();
  writeFileSync(webpPath, webpBuf);

  // 2. Re-encode the PNG itself with palette + max zlib compression.
  //    For large flat-illustration PNGs this typically halves the size.
  const optPng = await sharp(original)
    .png({ palette: true, compressionLevel: 9, effort: 10 })
    .toBuffer();
  // Only overwrite if smaller — palette-encoding can occasionally be
  // worse for photographic images (rare here).
  if (optPng.length < beforeBytes) {
    writeFileSync(png, optPng);
  }

  const after = readFileSync(png).length;
  const saved = beforeBytes - after;
  totalSaved += saved;
  console.log(
    `${rel.padEnd(48)} png ${fmtKb(beforeBytes)} → ${fmtKb(after)}  (saved ${fmtKb(saved)})  webp ${fmtKb(webpBuf.length)}`
  );
}

console.log(`\nTotal PNG savings: ${fmtKb(totalSaved)}`);
console.log('Webp siblings written next to every PNG — use with <picture> or .webp suffix.');
