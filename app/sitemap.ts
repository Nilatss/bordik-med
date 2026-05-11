import type { MetadataRoute } from 'next';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://bordik-med.vercel.app';

/**
 * Sitemap covering:
 *   - Static page routes (home, privacy, terms)
 *   - Per-tool landing pages at /tools/[id] — one entry per JSON in
 *     `public/tools-data/`.
 *   - Neonatology landing /neonatology + per-article SSG routes
 *     /neonatology/articles/[id] — one entry per article in
 *     `public/neonatal-articles.json` (audit 1.17 SEO closure).
 *
 * Build-time enumeration matches `generateStaticParams` in each route,
 * so adding new entries to the source JSONs automatically populates the
 * sitemap with no separate list to maintain.
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

function listNeonatologyArticleIds(): string[] {
  try {
    const raw = readFileSync(join(process.cwd(), 'public', 'neonatal-articles.json'), 'utf8');
    const json = JSON.parse(raw) as { articles?: { id: string }[] };
    if (!Array.isArray(json.articles)) return [];
    return json.articles
      .map((a) => a.id)
      .filter((id) => typeof id === 'string' && /^[a-z0-9][a-z0-9_-]*$/i.test(id));
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const root: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,             changeFrequency: 'weekly',  priority: 1.0, lastModified: now },
    { url: `${BASE}/icd10`,        changeFrequency: 'monthly', priority: 0.7, lastModified: now },
    { url: `${BASE}/drugs`,        changeFrequency: 'monthly', priority: 0.7, lastModified: now },
    { url: `${BASE}/neonatology`,  changeFrequency: 'weekly',  priority: 0.9, lastModified: now },
    { url: `${BASE}/releases`,     changeFrequency: 'monthly', priority: 0.4, lastModified: now },
    { url: `${BASE}/privacy`,      changeFrequency: 'yearly',  priority: 0.3, lastModified: now },
    { url: `${BASE}/terms`,        changeFrequency: 'yearly',  priority: 0.3, lastModified: now },
  ];
  const tools: MetadataRoute.Sitemap = listToolIds().map((id) => ({
    url: `${BASE}/tools/${id}`,
    changeFrequency: 'monthly',
    priority: 0.6,
    lastModified: now,
  }));
  const neonatalArticles: MetadataRoute.Sitemap = listNeonatologyArticleIds().map((id) => ({
    url: `${BASE}/neonatology/articles/${id}`,
    changeFrequency: 'monthly',
    priority: 0.55,
    lastModified: now,
  }));
  return [...root, ...tools, ...neonatalArticles];
}
