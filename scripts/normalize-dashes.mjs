#!/usr/bin/env node
/**
 * Replaces em-dash (—, U+2014) and en-dash (–, U+2013) with hyphen-minus (-, U+002D)
 * across source files. Skips node_modules, .next, .git, and lock files.
 *
 * Usage:  node scripts/normalize-dashes.mjs [--dry]
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'out', '.vercel', '.turbo', 'scripts', 'tmp-pdf']);
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const SKIP_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'STRESS_TEST_TODO.md', 'CLAUDE.md', 'README.md',
  'tool-meta-data.ts', // auto-generated from runners, will pick up changes on rebuild
  'normalize-dashes.mjs', // don't rewrite self (contains dash chars in regex)
  'tools-runners.ts', // stub, dashes are in doc comments only
]);

async function walk(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.git') && e.name !== '.github') continue;
    if (SKIP_DIRS.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, acc);
    else if (EXTS.has(extname(e.name)) && !SKIP_FILES.has(e.name)) acc.push(p);
  }
  return acc;
}

const files = await walk(ROOT);
let modified = 0;
let totalReplacements = 0;

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const emCount = (src.match(/—/g) || []).length;
  const enCount = (src.match(/–/g) || []).length;
  if (emCount + enCount === 0) continue;
  const out = src.replace(/[—–]/g, '-');
  if (out !== src) {
    totalReplacements += emCount + enCount;
    modified++;
    if (!DRY) writeFileSync(f, out);
    console.log(`${DRY ? '[dry]' : '✓'} ${relative(ROOT, f)}  (em:${emCount} en:${enCount})`);
  }
}

console.log(`\n${DRY ? 'Would modify' : 'Modified'}: ${modified} files, ${totalReplacements} replacements`);
