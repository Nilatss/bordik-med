/**
 * Pure helpers for the tools-catalog page.
 *
 * P1-CR-3 — extracted from ToolsPage.tsx step 1/N.
 */
import type { CatalogMetaItem } from '@/lib/catalog-client';
import { primaryCountriesFor } from '@/lib/tool-meta-helpers';
import type { CatalogTool } from './types';

/** Strips the leading "N. " numeric prefix from a category string. */
export function stripCategoryNumber(label: string): string {
  return label.replace(/^\d+\.\s*/, '');
}

/** Stable empty-catalog reference (used as default value when async fetch is in-flight). */
export const EMPTY_CATALOG: readonly CatalogMetaItem[] = Object.freeze([]);

/**
 * Cache per-tool country tags — parsed once per catalogue entry, reused
 * on every ToolCard re-render. The raw countries string is immutable
 * metadata; no need to re-parse on every render.
 */
const toolCountriesCache: Record<string, { name: string; flag: string }[]> = Object.create(null);

export function getToolCountries(tool: CatalogTool): { name: string; flag: string }[] {
  const cached = toolCountriesCache[tool.id];
  if (cached) return cached;
  const result = primaryCountriesFor(tool.countries);
  toolCountriesCache[tool.id] = result;
  return result;
}
