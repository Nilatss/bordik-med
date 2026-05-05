import type { MetadataRoute } from 'next';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://bordik-med.vercel.app';

/**
 * Sitemap covering:
 *   - Static page routes (home, privacy, terms)
 *   - Per-tool landing pages at /tools/[id] — one entry per JSON in
 *     `public/tools-data/`. Build-time enumeration matches the
 *     `generateStaticParams` in the route, so any tool with a manifest
 *     entry shows up automatically with no separate list to maintain.
 *
 * Courses + lessons are still SPA-state-driven and don't have stable
 * URLs; revisit when those land.
 */
function listToolIds(): string[] {
  try {
    return readdirSync(join(process.cwd(), 'public', 'tools-data'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.slice(0, -'.json'.length));
  } catch {
    // Sitemap should never fail the build — return [] if the prebuild
    // step that populates tools-data hasn't run yet.
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const root: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,         changeFrequency: 'weekly',  priority: 1.0, lastModified: now },
    { url: `${BASE}/icd10`,    changeFrequency: 'monthly', priority: 0.7, lastModified: now },
    { url: `${BASE}/releases`, changeFrequency: 'monthly', priority: 0.4, lastModified: now },
    { url: `${BASE}/privacy`,  changeFrequency: 'yearly',  priority: 0.3, lastModified: now },
    { url: `${BASE}/terms`,    changeFrequency: 'yearly',  priority: 0.3, lastModified: now },
  ];
  const tools: MetadataRoute.Sitemap = listToolIds().map((id) => ({
    url: `${BASE}/tools/${id}`,
    changeFrequency: 'monthly',
    priority: 0.6,
    lastModified: now,
  }));
  return [...root, ...tools];
}
