/**
 * Canonical content schemas. Used by:
 *   - scripts/build-content.mjs at build time (validate before writing JSON)
 *   - lib/proctoring/* (no - typo, just illustrative)
 *   - public Service Worker fetch interceptor (validate fetched JSON
 *     before caching - so a corrupted/tampered file never gets stored)
 *   - Server actions / future Supabase admin (write validation)
 *
 * Valibot is chosen for the small bundle (1-2 KB per schema, vs Zod's 16 KB)
 * - this matters because the SW imports it on every fetch.
 */

import * as v from 'valibot';

/* ── Tool kind: clinical calculator vs scoring scale ─────────────── */
export const ToolKindSchema = v.picklist(['calculator', 'score']);
export type ToolKind = v.InferOutput<typeof ToolKindSchema>;

/* ── Catalog meta (light row used in /tools list) ────────────────── */
export const CatalogMetaItemSchema = v.object({
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
export type CatalogMetaItem = v.InferOutput<typeof CatalogMetaItemSchema>;

export const CatalogMetaSchema = v.array(CatalogMetaItemSchema);

/* ── Per-tool detail (data/tools/<id>.json) ──────────────────────── */
export const ToolDetailSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.string(),
  category: v.string(),
  subcategory: v.string(),
  hasRunner: v.boolean(),
  countries: v.nullable(v.string()),
  kind: v.nullable(ToolKindSchema),
  /** Semver. Bumped when bands / thresholds / formula change. */
  version: v.pipe(v.string(), v.regex(/^\d+\.\d+\.\d+(-[\w.]+)?$/)),
});
export type ToolDetail = v.InferOutput<typeof ToolDetailSchema>;

/* ── Manifest (data/manifest.json) ───────────────────────────────── */
export const ContentManifestSchema = v.object({
  generatedAt: v.string(),
  catalogRev: v.string(),
  searchRev: v.record(v.string(), v.string()),
  toolRevs: v.record(v.string(), v.string()),
  counts: v.object({
    tools: v.number(),
    runners: v.number(),
    withCountries: v.number(),
  }),
});
export type ContentManifest = v.InferOutput<typeof ContentManifestSchema>;

/** Helper: parse + throw if invalid, return typed value. */
export function parseOrThrow<T>(schema: v.BaseSchema<unknown, T, v.BaseIssue<unknown>>, value: unknown, context: string): T {
  const r = v.safeParse(schema, value);
  if (!r.success) {
    const summary = r.issues.slice(0, 3).map((i) => `[${i.path?.map((p) => p.key).join('.') ?? '$'}] ${i.message}`).join('; ');
    throw new Error(`Schema mismatch (${context}): ${summary}`);
  }
  return r.output;
}
