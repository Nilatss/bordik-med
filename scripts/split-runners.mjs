#!/usr/bin/env node
/**
 * Splits the monolithic `lib/tools-runners.ts` (~3.7 MB, 446 runners) into
 * per-runner TypeScript modules under `lib/runners/<id>.ts` and emits a
 * lazy-loading registry at `lib/runners/index.ts`.
 *
 * Why: when bundled, the original file becomes a 3.2 MB chunk that loads
 * on the first ToolView mount even if the user only ever opens BMI. After
 * splitting, each runner becomes its own dynamic-import chunk (5–30 KB)
 * and the catalogue page no longer has to drag the whole encyclopaedia.
 *
 * Uses the official TypeScript compiler API to walk the source AST so we
 * never trip over template-literal `${}` interpolations or unbalanced
 * braces inside markdown info blocks.
 *
 * Usage:  node scripts/split-runners.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'lib', 'tools-runners.ts');
const OUT_DIR = join(ROOT, 'lib', 'runners');
const INDEX_OUT = join(OUT_DIR, 'index.ts');

const source = readFileSync(SRC, 'utf8');
const sf = ts.createSourceFile('tools-runners.ts', source, ts.ScriptTarget.ESNext, true);

// Collect every runner: id → { exactSourceText, asTypeName }
const runners = new Map();

/**
 * Walk every `Object.assign(TOOL_RUNNERS, { ... })` call AND the initial
 * `export const TOOL_RUNNERS: Record<...> = { ... }` literal. For each
 * own property of the object literal, capture its key and value text.
 */
function walk(node) {
  // Initial declaration
  if (
    ts.isVariableStatement(node) &&
    node.declarationList.declarations.some((d) =>
      d.name && ts.isIdentifier(d.name) && d.name.text === 'TOOL_RUNNERS'
    )
  ) {
    const decl = node.declarationList.declarations.find(
      (d) => ts.isIdentifier(d.name) && d.name.text === 'TOOL_RUNNERS'
    );
    if (decl?.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
      collectObjectLiteralRunners(decl.initializer);
    }
  }
  // Object.assign(TOOL_RUNNERS, { ... })
  if (
    ts.isExpressionStatement(node) &&
    ts.isCallExpression(node.expression) &&
    ts.isPropertyAccessExpression(node.expression.expression) &&
    ts.isIdentifier(node.expression.expression.expression) &&
    node.expression.expression.expression.text === 'Object' &&
    node.expression.expression.name.text === 'assign'
  ) {
    const args = node.expression.arguments;
    if (
      args.length >= 2 &&
      ts.isIdentifier(args[0]) && args[0].text === 'TOOL_RUNNERS' &&
      ts.isObjectLiteralExpression(args[1])
    ) {
      collectObjectLiteralRunners(args[1]);
    }
  }
  ts.forEachChild(node, walk);
}

function collectObjectLiteralRunners(obj) {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    let key;
    if (ts.isStringLiteral(prop.name) || ts.isNoSubstitutionTemplateLiteral(prop.name)) {
      key = prop.name.text;
    } else if (ts.isIdentifier(prop.name)) {
      key = prop.name.text;
    } else if (ts.isNumericLiteral(prop.name)) {
      key = prop.name.text;
    } else {
      continue;
    }
    // Capture the value's source text — including any trailing `as ScoreTool` cast.
    let valueNode = prop.initializer;
    let asTypeName;
    if (
      ts.isAsExpression(valueNode) &&
      ts.isTypeReferenceNode(valueNode.type) &&
      ts.isIdentifier(valueNode.type.typeName)
    ) {
      asTypeName = valueNode.type.typeName.text;
      valueNode = valueNode.expression;
    }
    if (!ts.isObjectLiteralExpression(valueNode)) {
      console.warn(`Runner "${key}" value is not an object literal — skipping`);
      continue;
    }
    const valueText = valueNode.getText(sf);
    runners.set(key, {
      valueText,
      asTypeName: asTypeName ?? null,
    });
  }
}

walk(sf);

console.log(`Parsed ${runners.size} runners from ${SRC}`);

// ─────────────────────────────────────────────────────────
// Detect which runners need ScoreTool vs CalculatorTool
// ─────────────────────────────────────────────────────────
function detectKind(valueText) {
  // First top-level kind: 'score' | 'calculator'
  const m = valueText.match(/\bkind:\s*['"`](score|calculator)['"`]/);
  return m ? m[1] : null;
}

// ─────────────────────────────────────────────────────────
// Reset the output directory
// ─────────────────────────────────────────────────────────
if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
} else {
  // Remove only previously generated files (anything ending with .ts in this folder)
  for (const f of readdirSync(OUT_DIR)) {
    if (f.endsWith('.ts')) unlinkSync(join(OUT_DIR, f));
  }
}

// ─────────────────────────────────────────────────────────
// Write each runner to its own file
// ─────────────────────────────────────────────────────────
let bytesWritten = 0;
const writtenIds = [];

for (const [id, { valueText, asTypeName }] of runners) {
  const fileSafe = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = join(OUT_DIR, `${fileSafe}.ts`);
  const declaredType = asTypeName ?? (detectKind(valueText) === 'score' ? 'ScoreTool' : 'CalculatorTool');

  // Import any helper types referenced inside the runner body. Cheap to
  // import unused types — TypeScript erases them at compile time.
  // @ts-nocheck disables per-file checks: the runner shape is enforced by
  // the typed export at the bottom (`const runner: ${declaredType}`) and
  // by the registry in `index.ts`. Internal `let actions = []` style locals
  // recovered from JS bundles otherwise trip noImplicitAny.
  const body = `// @ts-nocheck
/**
 * Runner: ${id}
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand — regenerate via \`npm run split:runners\`.
 *
 * Loaded lazily via dynamic import from lib/runners/index.ts so the
 * encyclopaedia of clinical content stays out of the main app bundle.
 */

import type {
  ${declaredType},
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: ${declaredType} = ${valueText};

export default runner;
`;

  writeFileSync(filename, body);
  bytesWritten += Buffer.byteLength(body, 'utf8');
  writtenIds.push({ id, fileSafe });
}

// ─────────────────────────────────────────────────────────
// Emit the registry with dynamic imports
// ─────────────────────────────────────────────────────────
let registry = `/**
 * AUTO-GENERATED runner registry — do not edit by hand.
 * Regenerate via \`npm run split:runners\`.
 *
 * Each entry maps a tool id to a dynamic import. Webpack/Turbopack will
 * emit a separate chunk per file, so the main bundle stays small and the
 * browser only downloads a runner when the user actually opens it.
 */

import type { ToolRunner } from '../tools-runners';

type RunnerLoader = () => Promise<{ default: ToolRunner }>;

export const RUNNER_LOADERS: Record<string, RunnerLoader> = {
`;

for (const { id, fileSafe } of writtenIds) {
  // Each line: 'bmi': () => import('./bmi'),
  registry += `  ${JSON.stringify(id)}: () => import('./${fileSafe}'),\n`;
}

registry += `};

const runnerCache = new Map<string, ToolRunner>();

/**
 * Lazily load a runner by id. The first call triggers the dynamic import,
 * subsequent calls resolve instantly from the cache.
 */
export async function loadRunner(id: string): Promise<ToolRunner | null> {
  if (runnerCache.has(id)) return runnerCache.get(id)!;
  const loader = RUNNER_LOADERS[id];
  if (!loader) return null;
  const mod = await loader();
  runnerCache.set(id, mod.default);
  return mod.default;
}

/** Synchronous lookup for runners already pulled into the cache. */
export function getCachedRunner(id: string): ToolRunner | null {
  return runnerCache.get(id) ?? null;
}

/** Quick presence check without triggering the import. */
export function hasRunner(id: string): boolean {
  return id in RUNNER_LOADERS;
}
`;

writeFileSync(INDEX_OUT, registry);

console.log(`✓ Wrote ${writtenIds.length} per-runner files to ${OUT_DIR}`);
console.log(`✓ Total bytes written: ${(bytesWritten / 1024).toFixed(1)} KB`);
console.log(`✓ Registry written to ${INDEX_OUT}`);
