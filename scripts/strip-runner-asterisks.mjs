#!/usr/bin/env node
/**
 * Strips markdown **bold** markers from runner fields that are rendered as plain text:
 *   interpretation, details, value, unit, items of actions[], caveats[]
 *
 * Does NOT touch:
 *   info: `...` (rendered through ReactMarkdown, markdown is valid there)
 *
 * Strategy: TypeScript AST. For each runner file, find PropertyAssignment
 * nodes named `interpretation` | `details` | `value` | `unit`, or
 * `actions` | `caveats` whose value is an ArrayLiteralExpression of strings.
 * Replace ** in those string literals only.
 *
 * Usage:  node scripts/strip-runner-asterisks.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'lib', 'runners');
const DRY = process.argv.includes('--dry');

const PLAIN_KEYS = new Set(['interpretation', 'details', 'value', 'unit', 'label']);
const ARRAY_KEYS = new Set(['actions', 'caveats']);

function stripAsterisks(s) {
  // Remove all double-asterisk markers in plain-text fields.
  // These fields are rendered as plain text (no markdown), so ** leaks to the user.
  // Handles both balanced **word** and broken **${foo}** where the pair is split
  // across template interpolation boundaries.
  return s.replace(/\*\*/g, '');
}

let filesModified = 0;
let totalReplacements = 0;

const files = readdirSync(DIR)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts')
  .map(f => join(DIR, f));

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (!src.includes('**')) continue;

  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ESNext, true);
  const edits = []; // { start, end, replacement }

  function visit(node) {
    // "interpretation: '...**bold**...'"
    if (ts.isPropertyAssignment(node) && node.name) {
      const keyName = ts.isIdentifier(node.name) ? node.name.text
                    : ts.isStringLiteral(node.name) ? node.name.text : null;

      if (keyName && PLAIN_KEYS.has(keyName)) {
        collectStrings(node.initializer, edits);
      } else if (keyName && ARRAY_KEYS.has(keyName) && ts.isArrayLiteralExpression(node.initializer)) {
        for (const el of node.initializer.elements) collectStrings(el, edits);
      }
    }
    ts.forEachChild(node, visit);
  }

  function collectStrings(expr, edits) {
    if (!expr) return;
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      if (expr.text.includes('**')) {
        const stripped = stripAsterisks(expr.text);
        if (stripped !== expr.text) {
          // Rebuild literal preserving quote style
          const quote = src.slice(expr.getStart(sf), expr.getStart(sf) + 1);
          // Escape quote char inside
          const esc = stripped.replace(new RegExp(quote === '`' ? '`' : `\\${quote}`, 'g'), `\\${quote}`);
          edits.push({
            start: expr.getStart(sf),
            end: expr.getEnd(),
            replacement: quote + esc + quote,
          });
        }
      }
    } else if (ts.isTemplateExpression(expr)) {
      // Template `foo ${x} bar` — strip ** in raw text parts (head + middle + tail)
      // Each "raw" span text lives at [start+1 .. end-N] depending on separator.
      // Easier: substring-replace across each template text token, using source text offsets.
      const parts = [expr.head, ...expr.templateSpans.map(s => s.literal)];
      for (const part of parts) {
        const raw = src.slice(part.getStart(sf), part.getEnd());
        if (raw.includes('**')) {
          const stripped = raw.replace(/\*\*/g, '');
          if (stripped !== raw) {
            edits.push({
              start: part.getStart(sf),
              end: part.getEnd(),
              replacement: stripped,
            });
          }
        }
      }
    } else if (ts.isConditionalExpression(expr)) {
      collectStrings(expr.whenTrue, edits);
      collectStrings(expr.whenFalse, edits);
    }
  }

  visit(sf);

  if (edits.length === 0) continue;

  // Apply edits in reverse order
  edits.sort((a, b) => b.start - a.start);
  let out = src;
  for (const e of edits) {
    out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  }

  if (out !== src) {
    filesModified++;
    totalReplacements += edits.length;
    if (!DRY) writeFileSync(file, out);
    console.log(`${DRY ? '[dry]' : '✓'} ${file.slice(ROOT.length + 1)} (${edits.length} literals)`);
  }
}

console.log(`\n${DRY ? 'Would modify' : 'Modified'}: ${filesModified} runner files, ${totalReplacements} string literals`);
