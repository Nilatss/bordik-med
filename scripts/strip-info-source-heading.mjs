#!/usr/bin/env node
/**
 * Removes `### Источник` / `### Источники` / `### Литература` / `### References`
 * sections (header + trailing body until next `###` or end-of-string) from runner
 * `info:` strings. The dedicated `referenceTab` already shows `runner.reference`,
 * so any in-info source block is redundant duplication.
 *
 * Applies only to top-level info heading, not nested mentions.
 * Usage:  node scripts/strip-info-source-heading.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'lib', 'runners');
const DRY = process.argv.includes('--dry');

// Match `### Источник(и)`/`### Литература`/`### References` + body up to next ### or end of string
// Handles both real \n newlines and escaped \\n in double-quoted strings.
const PATTERNS = [
  // Single-quoted / double-quoted with \n escape sequences
  /\\n\\n### (?:Источник[иа]?|Литература|References?)\\n[\s\S]*?(?=\\n\\n###|['"`]\s*,?\s*[\r\n])/gi,
  /\\n### (?:Источник[иа]?|Литература|References?)\\n[\s\S]*?(?=\\n\\n###|\\n### |['"`]\s*,?\s*[\r\n])/gi,
  // Template literal with real newlines
  /\n\n### (?:Источник[иа]?|Литература|References?)\n[\s\S]*?(?=\n\n###|`[\s,])/gi,
  /\n### (?:Источник[иа]?|Литература|References?)\n[\s\S]*?(?=\n\n###|\n### |`[\s,])/gi,
];

let modified = 0;
const files = readdirSync(DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');

for (const file of files) {
  const path = join(DIR, file);
  const src = readFileSync(path, 'utf8');
  let out = src;
  for (const p of PATTERNS) out = out.replace(p, '');
  if (out !== src) {
    modified++;
    if (!DRY) writeFileSync(path, out);
    console.log(`${DRY ? '[dry]' : '✓'} ${file}`);
  }
}

console.log(`\n${DRY ? 'Would modify' : 'Modified'}: ${modified} runner files`);
