/**
 * Per-tool landing page (SEO + sharing target).
 *
 * The Bordik tool catalog is rendered as an SPA inside the home route:
 * a single URL (`/`) hosts every tool view, switching them via Zustand
 * state. That gives a fast in-app experience but leaves search engines
 * with a single page describing 700+ tools, which crushes our rankings
 * for queries like "ASCVD calculator", "Wells score", etc.
 *
 * This dynamic route bridges the gap. For every tool with a published
 * detail JSON in `public/tools-data/<id>.json`, Next builds a static
 * HTML page at `/tools/<id>` containing:
 *
 *   - Real <title> + meta description tuned for the tool
 *   - JSON-LD MedicalScale / Calculator schema (per schema.org/MedicalScale)
 *   - A canonical link to the tool inside the SPA so users who land here
 *     from Google end up in the live calculator one click later
 *   - The tool's full description copy (so the page actually has body
 *     content for crawlers, not just metadata)
 *
 * generateStaticParams enumerates every JSON in the tools-data dir, so
 * adding a new tool to the catalog automatically gives it a route on the
 * next build — no manual list to maintain.
 *
 * Why a separate route and not e.g. opening the tool in-place via search
 * params on `/?tool=<id>`: search engines would still land on `/` for
 * everything, the canonical URL would collapse, and we'd get one
 * indexable page per platform instead of one per tool. The dedicated
 * route lets each tool stand on its own as an entry point.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ToolMeta {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  hasRunner: boolean;
  countries?: string;
  kind: 'calculator' | 'score' | string;
  version?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://bordik-med.vercel.app';

function readToolMeta(id: string): ToolMeta | null {
  // Reject anything that escapes the tools-data directory. `id` comes
  // from the route param and is technically attacker-controlled; even
  // though Next normalises slashes, a defensive check is cheap.
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(id)) return null;
  const filePath = join(process.cwd(), 'public', 'tools-data', `${id}.json`);
  try {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as ToolMeta;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  // Build-time enumeration: one route per tool JSON. Reading the
  // directory is fine here — `generateStaticParams` only runs at build,
  // never at request time.
  const dir = join(process.cwd(), 'public', 'tools-data');
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ id: f.slice(0, -'.json'.length) }));
  } catch {
    // No tools-data directory means we're on a partial checkout (e.g.
    // CI before prebuild script runs). Returning [] makes Next skip
    // pre-rendering until the directory exists.
    return [];
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const t = readToolMeta(id);
  if (!t) {
    // Falling back to generic metadata when the tool doesn't exist —
    // notFound() in the page component will trigger Next's 404 anyway.
    return { title: 'Инструмент не найден' };
  }
  // The catalog title often packs `English / Русский (Author)` shape into
  // a single line; for SEO we prefer the catalog version raw — Google
  // ranks on the visible text, and trimming would lose synonyms.
  return {
    title: `${t.title} - Bordik`,
    description: t.description,
    alternates: { canonical: `/tools/${id}` },
    openGraph: {
      type: 'article',
      title: t.title,
      description: t.description,
      url: `${BASE_URL}/tools/${id}`,
      siteName: 'Bordik',
    },
    twitter: { card: 'summary', title: t.title, description: t.description },
  };
}

export default async function ToolLandingPage({ params }: PageProps) {
  const { id } = await params;
  const t = readToolMeta(id);
  if (!t) notFound();

  // schema.org type selection. `MedicalScale` covers scoring instruments
  // (CHA2DS2-VASc, Glasgow Coma Scale, etc.) which is the dominant
  // pattern in our catalog. Pure formulas (BMI, BSA) get
  // `MedicalCalculator` (a Bordik-internal type — schema.org doesn't
  // have a dedicated calculator class, so we fall back to MedicalScale
  // which Google understands and which matches the medical-context
  // crawlers care about).
  const schemaType = t.kind === 'score' ? 'MedicalScale' : 'MedicalScale';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: t.title,
    description: t.description,
    url: `${BASE_URL}/tools/${id}`,
    inLanguage: 'ru',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Bordik',
      alternateName: 'Bordik Med',
      url: BASE_URL,
    },
    about: {
      '@type': 'MedicalCondition',
      name: t.subcategory,
    },
    medicalSpecialty: t.category,
    ...(t.countries ? { audience: { '@type': 'MedicalAudience', audienceType: t.countries } } : {}),
  };

  return (
    <main
      id="main-content"
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '48px 24px',
        fontFamily: 'var(--font-body, system-ui)',
        color: 'var(--md-sys-color-on-surface, #1A1A1A)',
        minHeight: '70vh',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav style={{ marginBottom: 24, fontSize: 13 }}>
        <a href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>← Все инструменты</a>
      </nav>
      <h1 style={{
        fontFamily: 'var(--font-display, system-ui)',
        fontSize: 28, fontWeight: 700, lineHeight: 1.2,
        letterSpacing: '-0.01em', marginBottom: 12,
      }}>
        {t.title}
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.55, color: '#4B5563', marginBottom: 24 }}>
        {t.description}
      </p>
      <div style={{
        display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
        marginBottom: 32, fontSize: 13, color: '#6B7280',
      }}>
        <span style={{ padding: '4px 10px', background: '#F0F1F5', borderRadius: 999 }}>{t.category}</span>
        <span style={{ padding: '4px 10px', background: '#F0F1F5', borderRadius: 999 }}>{t.subcategory}</span>
        {t.countries ? (
          <span style={{ padding: '4px 10px', background: '#F0F1F5', borderRadius: 999 }}>{t.countries}</span>
        ) : null}
      </div>
      <a
        href={`/?tool=${encodeURIComponent(id)}`}
        style={{
          display: 'inline-block',
          padding: '12px 22px',
          background: '#1A1A1A',
          color: '#FFFFFF',
          borderRadius: 12,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Открыть калькулятор →
      </a>
    </main>
  );
}
