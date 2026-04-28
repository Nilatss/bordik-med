'use client';

/**
 * Lazy MiniSearch loader for the tool catalog.
 *
 * Strategy: keep the 194 KB index OUT of the page bundle. Fetch it the
 * first time the user actually types in the search box, deserialize once,
 * then cache the instance for the rest of the session. The Service Worker
 * precaches /search-ru.json so subsequent page loads are instant.
 *
 * The hook returns a function `search(query)` that returns ranked tool ids
 * (best match first), or `null` when:
 *   - the user hasn't typed anything yet
 *   - the index is still loading (treat as "no results yet")
 *   - the index failed to load (caller falls back to substring match)
 */

import { useEffect, useRef, useState } from 'react';
import MiniSearch from 'minisearch';

// One global instance keyed by locale. Built once per session.
const cache: Record<string, MiniSearch | null> = Object.create(null);
const inFlight: Record<string, Promise<MiniSearch | null>> = Object.create(null);

const FIELDS = ['title', 'description', 'category', 'subcategory'];

async function loadIndex(locale: string): Promise<MiniSearch | null> {
  const cached = cache[locale];
  if (cached) return cached;
  const flight = inFlight[locale];
  if (flight) return flight;
  inFlight[locale] = (async () => {
    try {
      const r = await fetch(`/search-${locale}.json`, { cache: 'force-cache' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.text();
      const ms = MiniSearch.loadJSON(json, {
        fields: FIELDS,
        storeFields: ['id'],
        searchOptions: {
          boost: { title: 4, subcategory: 2, category: 1.5 },
          prefix: true,
          fuzzy: 0.2,
        },
      });
      cache[locale] = ms;
      return ms;
    } catch (err) {
      console.warn('[tool-search] failed to load index', err);
      cache[locale] = null;
      return null;
    } finally {
      delete inFlight[locale];
    }
  })();
  return inFlight[locale];
}

/**
 * Returns:
 *   - `null`       index not ready or failed (caller should fall back to substring match)
 *   - `Set<string>` ranked tool IDs that match `query`
 */
export function useToolSearch(query: string, locale: 'ru' = 'ru'): Set<string> | null {
  const [indexReady, setIndexReady] = useState(!!cache[locale]);
  const lastQueryRef = useRef('');
  const lastResultRef = useRef<Set<string> | null>(null);

  // Trigger lazy load on first non-empty query.
  useEffect(() => {
    if (!query.trim() || cache[locale]) return;
    let cancelled = false;
    loadIndex(locale).then((ms) => {
      if (cancelled) return;
      if (ms) setIndexReady(true);
    });
    return () => { cancelled = true; };
  }, [query, locale]);

  if (!query.trim()) {
    lastQueryRef.current = '';
    lastResultRef.current = null;
    return null;          // empty query - no filter applied
  }
  if (!indexReady || !cache[locale]) {
    return null;          // not ready - caller falls back to substring
  }

  // Avoid recomputing on every render for the same query
  if (query === lastQueryRef.current && lastResultRef.current) {
    return lastResultRef.current;
  }
  const ms = cache[locale]!;
  const hits = ms.search(query, {
    combineWith: 'AND',
    prefix: true,
    fuzzy: 0.2,
    boost: { title: 4, subcategory: 2, category: 1.5 },
  });
  const ids = new Set<string>();
  // hits are pre-sorted by relevance; preserve order via an array if needed
  for (const h of hits) ids.add(String(h.id));
  lastQueryRef.current = query;
  lastResultRef.current = ids;
  return ids;
}
