#!/usr/bin/env node
/**
 * Normalises inline formula patterns in runner `info:` markdown.
 *
 * Before (ugly — multiple backticks on adjacent lines render as one cluttered paragraph):
 *   `CF = 1800 / TDD` - быстродействующие аналоги
 *   `CF = 1500 / TDD` - короткий человеческий
 *
 * After (clean — each formula a separate bullet):
 *
 *   - `CF = 1800 / TDD` - быстродействующие аналоги
 *   - `CF = 1500 / TDD` - короткий человеческий
 *
 * The bullet list renders each formula with its nice inline-code pill and
 * the description on the same line, visually distinct and scannable.
 *
 * Usage:  node scripts/fix-formula-format.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'lib', 'runners');
const DRY = process.argv.includes('--dry');

// Match a line that starts with a single-backtick-wrapped formula followed
// by " - description" (any content). Must NOT be part of a fenced code block
// (which starts with ``` — three backticks).
//
// We match within escaped string literals, so `\n` is an actual two-char sequence.
const PATTERN = /(\\n)(`[^`\n\\]+`\s+-\s+[^\\]+?)(?=\\n|$)/g;

// Track so we don't double-bullet already-bulleted lines
function transformBlock(src) {
  // Case 1: escaped newline style (most files use this — single-line string)
  //   ...\n`formula` - text\n`formula2` - text\n...
  let out = src.replace(
    /(\\n)(`[^`\n\\]+`\s+-\s+[^\\]+?)(?=\\n)/g,
    (m, nl, body) => `${nl}\\n- ${body}`
  );

  // Case 2: real newline style (template literals)
  //   ...\n`formula` - text\n`formula2` - text\n...
  out = out.replace(
    /(\n)(`[^`\n]+`\s+-\s+[^\n]+?)(?=\n)/g,
    (m, nl, body) => `${nl}\n- ${body}`
  );

  return out;
}

let modified = 0;
const files = readdirSync(DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');

for (const file of files) {
  const path = join(DIR, file);
  const src = readFileSync(path, 'utf8');
  // Only touch files that mention `### Формулы` or similar section
  if (!/Формулы|Формула/.test(src)) continue;
  const out = transformBlock(src);
  if (out !== src) {
    modified++;
    if (!DRY) writeFileSync(path, out);
    console.log(`${DRY ? '[dry]' : '✓'} ${file}`);
  }
}

console.log(`\n${DRY ? 'Would modify' : 'Modified'}: ${modified} runners`);
