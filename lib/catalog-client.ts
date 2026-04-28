'use client';

/**
 * Client-side accessor for the catalog metadata. Replaces the heavy
 * `import { CATALOG_TOOLS } from '@/lib/tools-catalog'` pattern with a
 * small fetch from a static JSON asset that the Service Worker precaches.
 *
 * Why fetch instead of import:
 *   - lib/tools-catalog.ts is 1038 lines (~150 KB JS after minify) and
 *     it gets parsed by V8 on every page load even if the user never
 *     opens /tools. Moving to /catalog.meta.json shrinks the page bundle
 *     and lets the browser use its native JSON parser (faster than JS).
 *   - The same JSON is what the Service Worker stores in CacheStorage,
 *     so subsequent visits are instant (no network).
 *   - Future Supabase-driven content reuses the same fetch path - the
 *     route swaps for /api/snapshot/<rev>.json without touching consumers.
 *
 * IMPORTANT: this module is `'use client'` so it never accidentally bloats
 * a Server Component. Server-side code should read from `data/` directly.
 */

import { useEffect, useState } from 'react';
import type { CatalogMetaItem, ToolDetail, ContentManifest } from './schemas/catalog';

export type { CatalogMetaItem, ToolDetail, ContentManifest };

/* ── Singleton caches: one fetch per session per resource ─────────── */
let catalogPromise: Promise<readonly CatalogMetaItem[]> | null = null;
let manifestPromise: Promise<ContentManifest> | null = null;
const detailPromises = new Map<string, Promise<ToolDetail>>();

const CATALOG_URL = '/catalog.meta.json';
const MANIFEST_URL = '/content-manifest.json';
const TOOL_DETAIL_URL = (id: string) => `/tools-data/${id}.json`;

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: 'force-cache' });
  if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
  return (await r.json()) as T;
}

/** Catalog metadata - the array used to render /tools list. */
export function getCatalog(): Promise<readonly CatalogMetaItem[]> {
  if (!catalogPromise) {
    catalogPromise = fetchJson<readonly CatalogMetaItem[]>(CATALOG_URL).catch((err) => {
      // On failure, drop the cached rejected promise so a manual retry
      // (or the SW re-priming the cache) can recover.
      catalogPromise = null;
      throw err;
    });
  }
  return catalogPromise;
}

/** Per-tool detail (description, references) - lazy on first open. */
export function getToolDetail(id: string): Promise<ToolDetail> {
  if (!detailPromises.has(id)) {
    const p = fetchJson<ToolDetail>(TOOL_DETAIL_URL(id)).catch((err) => {
      detailPromises.delete(id);
      throw err;
    });
    detailPromises.set(id, p);
  }
  return detailPromises.get(id)!;
}

/** Content manifest - per-file revisions for staleness checks. */
export function getManifest(): Promise<ContentManifest> {
  if (!manifestPromise) {
    manifestPromise = fetchJson<ContentManifest>(MANIFEST_URL).catch((err) => {
      manifestPromise = null;
      throw err;
    });
  }
  return manifestPromise;
}

/* ── Hook helpers for components ──────────────────────────────────── */

/** React hook: subscribes to the catalog. Returns `null` until the first
 *  fetch resolves, after which it returns the cached array on every render
 *  (no more network). The component re-renders once on data arrival. */
export function useCatalog(): readonly CatalogMetaItem[] | null {
  const [data, setData] = useState<readonly CatalogMetaItem[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getCatalog().then((rows) => { if (!cancelled) setData(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return data;
}

/** React hook: per-tool detail. Returns `null` while loading, an object on
 *  success, and `'error'` on failure (so the consumer can show a retry UI). */
export function useToolDetail(id: string | null | undefined): ToolDetail | 'error' | null {
  const [data, setData] = useState<ToolDetail | 'error' | null>(null);
  useEffect(() => {
    if (!id) { setData(null); return; }
    let cancelled = false;
    setData(null);
    getToolDetail(id)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData('error'); });
    return () => { cancelled = true; };
  }, [id]);
  return data;
}

/* ── Server-side helper (used by RSC / API routes / build scripts) ── */
export const _SERVER_CATALOG_PATH = 'data/catalog.meta.json';
