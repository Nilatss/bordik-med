#!/usr/bin/env node
/**
 * Content build pipeline. Reads the canonical TypeScript sources of truth -
 * `lib/tools-catalog.ts`, `lib/tool-meta-data.ts` - and produces:
 *
 *   data/catalog.meta.json     - light metadata (id, title, category, ...)
 *                                used by /tools list rendering. Stripped of
 *                                long descriptions so it's small enough to
 *                                fit in the route's RSC payload.
 *   data/tools/<id>.json       - per-tool detail (description, category,
 *                                tags). Loaded on demand when a user opens
 *                                an inspector. Per-file revisions allow
 *                                Service Worker to update single tools.
 *   public/search-ru.json      - prebuilt MiniSearch index. Loaded only on
 *                                first keystroke in the search box.
 *   data/manifest.json         - { catalog: <hash>, tools: { id: <hash> } }
 *                                per-file revisions for granular SW cache
 *                                invalidation.
 *
 * Run via `npm run build:content`. Hooked into `prebuild` so production
 * deploys regenerate everything before `next build` reads it.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import MiniSearch from 'minisearch';
import * as v from 'valibot';

/* ── Inline schema (mirror of lib/schemas/catalog.ts).
   We don't import the .ts file from a .mjs build script - keeping the
   schema duplicated here lets the build run without tsx/ts-node. The
   shapes MUST stay in sync; CI checks are the safety net. ─────────── */
const ToolKindSchema = v.picklist(['calculator', 'score']);
const CatalogMetaItemSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.string(),
  category: v.string(),
  subcategory: v.string(),
  hasRunner: v.boolean(),
  available: v.boolean(),
  countries: v.nullable(v.string()),
  kind: v.nullable(ToolKindSchema),
});
const ToolDetailSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.string(),
  category: v.string(),
  subcategory: v.string(),
  hasRunner: v.boolean(),
  countries: v.nullable(v.string()),
  kind: v.nullable(ToolKindSchema),
  version: v.pipe(v.string(), v.regex(/^\d+\.\d+\.\d+(-[\w.]+)?$/)),
});

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG_TS = join(ROOT, 'lib', 'tools-catalog.ts');
const META_DATA_TS = join(ROOT, 'lib', 'tool-meta-data.ts');

const OUT_DATA_DIR = join(ROOT, 'data');
const OUT_DATA_TOOLS_DIR = join(OUT_DATA_DIR, 'tools');
const OUT_PUBLIC_DIR = join(ROOT, 'public');
// Public mirror - same files served as static assets so the client can
// fetch them and the Service Worker can precache them.
const OUT_PUBLIC_TOOLS_DIR = join(OUT_PUBLIC_DIR, 'tools-data');
const OUT_CATALOG_PRIVATE = join(OUT_DATA_DIR, 'catalog.meta.json');
const OUT_CATALOG_PUBLIC = join(OUT_PUBLIC_DIR, 'catalog.meta.json');
const OUT_MANIFEST_PRIVATE = join(OUT_DATA_DIR, 'manifest.json');
const OUT_MANIFEST_PUBLIC = join(OUT_PUBLIC_DIR, 'content-manifest.json');
const OUT_SEARCH_RU = join(OUT_PUBLIC_DIR, 'search-ru.json');

/* ── 1. Parse lib/tools-catalog.ts ─────────────────────────────────── */
// We don't run TS at build time - it's faster and dependency-free to do a
// regex pass over the well-known `T(...)` factory calls.
function parseCatalog() {
  const src = readFileSync(CATALOG_TS, 'utf8');
  const tools = [];
  // Match T('id', 'title', 'description', 'category', 'subcategory', true|false?)
  // Strings may contain escaped quotes so we accept both single and double
  // and don't allow newlines inside them.
  // We also support the trailing arg being absent (defaults to false).
  const re = /T\(\s*'([^']+)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*(?:,\s*(true|false))?\s*\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    tools.push({
      id: m[1],
      title: unescapeString(m[2]),
      description: unescapeString(m[3]),
      category: unescapeString(m[4]),
      subcategory: unescapeString(m[5]),
      available: m[6] === 'true',
    });
  }
  return tools;
}

function unescapeString(s) {
  return s.replace(/\\(['"\\])/g, '$1');
}

/* ── 2. Read runner ids + countries (already auto-generated) ───────── */
function parseMeta() {
  const src = readFileSync(META_DATA_TS, 'utf8');

  const idMatch = src.match(/RUNNER_IDS:\s*readonly string\[\]\s*=\s*\[([\s\S]*?)\];/);
  const ids = new Set();
  if (idMatch) {
    const inside = idMatch[1];
    const idRe = /"([^"]+)"/g;
    let mm;
    while ((mm = idRe.exec(inside)) !== null) ids.add(mm[1]);
  }

  const countries = {};
  const cMatch = src.match(/RUNNER_COUNTRIES:[\s\S]*?=\s*\{([\s\S]*?)\};/);
  if (cMatch) {
    const inside = cMatch[1];
    const cRe = /"([^"]+)":\s*"([^"]+)"/g;
    let mm;
    while ((mm = cRe.exec(inside)) !== null) countries[mm[1]] = mm[2];
  }

  const kinds = {};
  const kMatch = src.match(/RUNNER_KINDS:[\s\S]*?=\s*\{([\s\S]*?)\};/);
  if (kMatch) {
    const inside = kMatch[1];
    const kRe = /"([^"]+)":\s*"([^"]+)"/g;
    let mm;
    while ((mm = kRe.exec(inside)) !== null) kinds[mm[1]] = mm[2];
  }

  return { ids, countries, kinds };
}

function sha(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 12);
}

/* ── 3. Compose outputs ────────────────────────────────────────────── */
function main() {
  const tools = parseCatalog();
  const { ids: runnerIds, countries: runnerCountries, kinds: runnerKinds } = parseMeta();

  if (tools.length === 0) {
    console.error('build-content: no tools found in tools-catalog.ts');
    process.exit(1);
  }

  // Wipe + recreate output dirs (server-only AND public mirror)
  if (existsSync(OUT_DATA_TOOLS_DIR)) rmSync(OUT_DATA_TOOLS_DIR, { recursive: true, force: true });
  if (existsSync(OUT_PUBLIC_TOOLS_DIR)) rmSync(OUT_PUBLIC_TOOLS_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DATA_TOOLS_DIR, { recursive: true });
  mkdirSync(OUT_PUBLIC_TOOLS_DIR, { recursive: true });
  mkdirSync(OUT_PUBLIC_DIR, { recursive: true });

  // ── catalog.meta.json (lightweight, list-rendering payload) ──
  // Validate every row before writing - a malformed entry should fail the
  // build, not ship a broken catalog. We collect all issues so a single
  // build run reports every bad tool at once.
  const issues = [];
  const meta = tools.map((t, idx) => {
    const row = {
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      subcategory: t.subcategory,
      hasRunner: runnerIds.has(t.id),
      available: t.available || runnerIds.has(t.id),
      countries: runnerCountries[t.id] ?? null,
      kind: runnerKinds[t.id] ?? null,
    };
    const r = v.safeParse(CatalogMetaItemSchema, row);
    if (!r.success) {
      const path = r.issues.slice(0, 1).map((i) => i.path?.map((p) => p.key).join('.') ?? '$').join(', ');
      issues.push(`row #${idx} id=${t.id || '<empty>'}: ${r.issues[0]?.message} at [${path}]`);
    }
    return row;
  });
  if (issues.length > 0) {
    console.error('build-content: schema validation failed for catalog.meta.json:');
    for (const m of issues.slice(0, 10)) console.error('  ' + m);
    if (issues.length > 10) console.error(`  ...and ${issues.length - 10} more`);
    process.exit(1);
  }
  const catalogJson = JSON.stringify(meta);
  writeFileSync(OUT_CATALOG_PRIVATE, catalogJson);
  writeFileSync(OUT_CATALOG_PUBLIC, catalogJson);

  // ── data/tools/<id>.json (full per-tool detail) ──
  const perToolHashes = {};
  for (const t of tools) {
    const detail = {
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      subcategory: t.subcategory,
      hasRunner: runnerIds.has(t.id),
      countries: runnerCountries[t.id] ?? null,
      kind: runnerKinds[t.id] ?? null,
      version: '1.0.0',
    };
    const r = v.safeParse(ToolDetailSchema, detail);
    if (!r.success) {
      console.error(`build-content: tool detail invalid for id=${t.id}: ${r.issues[0]?.message}`);
      process.exit(1);
    }
    const json = JSON.stringify(detail);
    writeFileSync(join(OUT_DATA_TOOLS_DIR, `${t.id}.json`), json);
    writeFileSync(join(OUT_PUBLIC_TOOLS_DIR, `${t.id}.json`), json);
    perToolHashes[t.id] = sha(json);
  }

  // ── public/search-ru.json (prebuilt MiniSearch index) ──
  const ms = new MiniSearch({
    fields: ['title', 'description', 'category', 'subcategory'],
    storeFields: ['id'],
    searchOptions: {
      boost: { title: 4, subcategory: 2, category: 1.5 },
      prefix: true,
      fuzzy: 0.2,
    },
  });
  ms.addAll(tools.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    subcategory: t.subcategory,
  })));
  const searchJson = JSON.stringify(ms.toJSON());
  writeFileSync(OUT_SEARCH_RU, searchJson);

  // ── data/manifest.json (granular per-file revisions) ──
  const manifest = {
    generatedAt: new Date().toISOString(),
    catalogRev: sha(catalogJson),
    searchRev: { ru: sha(searchJson) },
    toolRevs: perToolHashes,
    counts: {
      tools: tools.length,
      runners: runnerIds.size,
      withCountries: Object.keys(runnerCountries).length,
    },
  };
  const manifestJson = JSON.stringify(manifest, null, 2);
  writeFileSync(OUT_MANIFEST_PRIVATE, manifestJson);
  writeFileSync(OUT_MANIFEST_PUBLIC, manifestJson);

  // Console summary so CI logs are useful
  console.log(`build-content: ${tools.length} tools`);
  console.log(`  catalog.meta.json     ${(catalogJson.length / 1024).toFixed(1)} KB    rev=${manifest.catalogRev}`);
  console.log(`  search-ru.json        ${(searchJson.length / 1024).toFixed(1)} KB    rev=${manifest.searchRev.ru}`);
  console.log(`  data/tools/*.json     ${tools.length} files (avg ${
    (tools.reduce((s, t) => s + JSON.stringify(t).length, 0) / tools.length / 1024).toFixed(2)
  } KB)`);
  console.log(`  ${runnerIds.size} runners with code, ${Object.keys(runnerCountries).length} carry countries`);
}

main();
