import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://ironmed-academy.vercel.app';

/**
 * Static sitemap — listing only the routes that actually exist as pages
 * in the App Router. Tools/courses/lessons are state-driven inside the
 * SPA shell and don't have individual URLs (yet); when we add per-tool
 * routes (e.g. `/tools/[slug]`), extend this with a dynamic source from
 * `/public/content-manifest.json`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`,        changeFrequency: 'weekly',  priority: 1.0, lastModified: now },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly',  priority: 0.3, lastModified: now },
    { url: `${BASE}/terms`,   changeFrequency: 'yearly',  priority: 0.3, lastModified: now },
  ];
}
