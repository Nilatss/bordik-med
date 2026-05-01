import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://bordik-med.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Authenticated areas, API surface, OAuth callbacks — keep them
        // out of the index. /api/* especially because crawled error
        // payloads can leak schema info.
        disallow: ['/admin/', '/account/', '/api/', '/auth/', '/reset/'],
      },
      // GPTBot / CCBot opt-out for the medical content. We want our
      // material referenceable by humans + Google Search, but not
      // ingested for LLM training without explicit licensing.
      { userAgent: 'GPTBot',           disallow: '/' },
      { userAgent: 'ClaudeBot',        disallow: '/' },
      { userAgent: 'CCBot',            disallow: '/' },
      { userAgent: 'anthropic-ai',     disallow: '/' },
      { userAgent: 'Google-Extended',  disallow: '/' },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
