#!/usr/bin/env node
/**
 * Finds runner `info:` markdown where a single-backtick formula is
 * followed on the next line by explanatory text WITHOUT a blank line
 * between them — the whole thing ends up in one paragraph, so the
 * CSS rule  .lesson-content.tool-info p:has(> code:only-child)  that
 * renders the pretty «ФОРМУЛА» callout never fires, and the output
 * looks like scattered inline-code pills.
 *
 * Transform:
 *   `foo` - bar                   → `foo`
 *                                     (blank)
 *                                    bar
 *
 * Handles both escaped (`\n`) and raw (`\n`) newlines.
 * Usage:  node scripts/fix-formula-callouts.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'lib', 'runners');
const DRY = process.argv.includes('--dry');

/**
 * Insert a blank line after a backtick-wrapped inline formula when the
 * following line is plain text (not another backtick line, not a bullet,
 * not a heading, not already separated by blank line).
 */
function fixInfoString(src) {
  let out = src;

  // Case 1: escaped newlines in a double-quoted info string.
  //   pattern:  \\n`formula`\\n<next non-special char>
  //   replace:  \\n`formula`\\n\\n<next>
  out = out.replace(
    /(\\n)(`[^`\n\\]+`)\\n(?!\\n|###|-|\*|`|\d+\.|\|)/g,
    (_, nl, code) => `${nl}${code}\\n\\n`
  );

  // Case 2: real newlines in a template-literal info string.
  //   pattern:  \n`formula`\n<next non-special char>
  out = out.replace(
    /(\n)(`[^`\n]+`)\n(?!\n|###|-|\*|`|\d+\.|\|)/g,
    (_, nl, code) => `${nl}${code}\n\n`
  );

  return out;
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
let modified = 0;

for (const file of files) {
  const path = join(DIR, file);
  const src = readFileSync(path, 'utf8');
  const out = fixInfoString(src);
  if (out !== src) {
    modified++;
    if (!DRY) writeFileSync(path, out);
    console.log(`${DRY ? '[dry]' : '✓'} ${file}`);
  }
}

console.log(`\n${DRY ? 'Would modify' : 'Modified'}: ${modified} runner files`);
