#!/usr/bin/env node
/**
 * Generates the full icon set required by modern PWA + iOS/Android:
 *
 *   public/icons/icon-192.png         → manifest any
 *   public/icons/icon-512.png         → manifest any + splash
 *   public/icons/icon-maskable-192.png → manifest maskable (safe-zone padded)
 *   public/icons/icon-maskable-512.png
 *   public/icons/apple-touch-icon.png → iOS home screen (180×180)
 *   public/icons/favicon-32.png       → browser tab
 *   public/icons/favicon-16.png
 *   public/favicon.ico                → legacy fallback
 *
 * Source: public/logo-bordik.png
 *
 * Maskable variant adds ~10 % padding (safe-zone) so Android/iOS can crop
 * it into a rounded/pill shape without clipping the logo.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'public', 'logo-bordik.png');
const OUT = join(ROOT, 'public', 'icons');

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const BG = '#FAFAFA'; // matches site theme (light)
const src = readFileSync(SRC);

async function resize(size, filename, { padding = 0, bg = BG } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const img = sharp(src)
    .resize(inner, inner, { fit: 'contain', background: bg });

  if (padding > 0) {
    const pad = Math.round(size * padding);
    await img
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: bg })
      .png({ compressionLevel: 9 })
      .toFile(join(OUT, filename));
  } else {
    await sharp(src)
      .resize(size, size, { fit: 'contain', background: bg })
      .flatten({ background: bg })
      .png({ compressionLevel: 9 })
      .toFile(join(OUT, filename));
  }
}

await Promise.all([
  resize(192, 'icon-192.png'),
  resize(512, 'icon-512.png'),
  resize(192, 'icon-maskable-192.png', { padding: 0.10 }),
  resize(512, 'icon-maskable-512.png', { padding: 0.10 }),
  resize(180, 'apple-touch-icon.png'),
  resize(32, 'favicon-32.png'),
  resize(16, 'favicon-16.png'),
]);

// favicon.ico (16+32 combined). Use 32 as fallback — modern browsers prefer PNG from manifest.
await sharp(src)
  .resize(32, 32, { fit: 'contain', background: BG })
  .flatten({ background: BG })
  .toFile(join(ROOT, 'public', 'favicon.ico'));

console.log('✓ PWA icons generated in public/icons/ + favicon.ico');
