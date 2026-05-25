/**
 * Per-article SSG route — audit 1.17 SEO closure for neonatology articles.
 *
 * Each article in `public/neonatal-articles.json` gets a dedicated static
 * HTML route at `/neonatology/articles/<id>` with:
 *
 *   - Real <title> + meta description tuned to the article
 *   - JSON-LD `MedicalScholarlyArticle` schema
 *   - The article body rendered as actual HTML (so crawlers see the
 *     content, not just metadata)
 *   - Canonical link + OG/Twitter cards for sharing
 *   - CTA to open the article inside the live SPA
 *
 * `generateStaticParams` enumerates every article at build time, so
 * adding new articles to the JSON automatically creates routes on next
 * deploy.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { jsonLdHtml } from '@/lib/json-ld';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://bordik-med.vercel.app';

interface Article {
  id: string;
  title_ru: string;
  title_en: string;
  topic: string;
  audience: string;
  level: 'basic' | 'intermediate' | 'advanced' | string;
  summary: string;
  content: string;
  references: string[];
  related_calculators?: string[];
}

interface ArticlesBank {
  articles: Article[];
  version?: string;
  lastUpdated?: string;
}

function readArticles(): ArticlesBank | null {
  try {
    const raw = readFileSync(join(process.cwd(), 'public', 'neonatal-articles.json'), 'utf8');
    return JSON.parse(raw) as ArticlesBank;
  } catch {
    return null;
  }
}

function readArticle(id: string): Article | null {
  // Defensive: reject anything that isn't a safe id slug.
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(id)) return null;
  const bank = readArticles();
  if (!bank) return null;
  return bank.articles.find((a) => a.id === id) ?? null;
}

export async function generateStaticParams() {
  const bank = readArticles();
  if (!bank) return [];
  return bank.articles.map((a) => ({ id: a.id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const TOPIC_LABELS: Record<string, string> = {
  respiratory: 'Респираторная',
  cardiopulmonary: 'Сердечно-лёгочная',
  neuro: 'Неврология',
  infection: 'Инфекции',
  gastro: 'ЖКТ',
  metabolic: 'Метаболизм',
  hepatic: 'Гепатобилиарная',
  hematology: 'Гематология',
  ophthalmology: 'Офтальмология',
  screening: 'Скрининг',
  growth: 'Рост и развитие',
  vaccination: 'Иммунизация',
  pain_nas_sedation: 'Аналгезия / NAS',
  surgical: 'Хирургия',
  endocrine: 'Эндокринная',
  procedures: 'Процедуры',
  renal: 'Нефрология',
  discharge: 'Выписка',
  screening_discharge: 'Скрининг / выписка',
  neonatal: 'Общие неонатальные',
};

const LEVEL_LABELS: Record<string, string> = {
  basic: 'Базовый',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const a = readArticle(id);
  if (!a) {
    return { title: 'Статья не найдена | Bordik Неонатология' };
  }
  const title = `${a.title_ru} | Bordik Неонатология`;
  return {
    title,
    description: a.summary.slice(0, 200),
    alternates: { canonical: `/neonatology/articles/${id}` },
    openGraph: {
      type: 'article',
      title: a.title_ru,
      description: a.summary.slice(0, 200),
      url: `${BASE_URL}/neonatology/articles/${id}`,
      siteName: 'Bordik',
    },
    twitter: {
      card: 'summary',
      title: a.title_ru,
      description: a.summary.slice(0, 200),
    },
  };
}

/** Minimal markdown → plain HTML for SSG body.
 *
 *  Handles: # / ## / ### headings, **bold**, bullet lists, paragraphs,
 *  GFM tables. The SPA uses a richer parser (`parseGuidelineContent` в
 *  `NeonatalHandbook.tsx`), но для crawler-friendly SSG достаточно
 *  semantic HTML — Google indexes plain markup.
 */
function renderArticleBody(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let i = 0;
  let inList = false;
  const closeListIfOpen = () => {
    if (inList) { html += '</ul>'; inList = false; }
  };
  const inlineBold = (s: string): string =>
    s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
     .replace(/`([^`]+)`/g, '<code>$1</code>');
  const escapeHtml = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (!line.trim()) { closeListIfOpen(); i++; continue; }

    // Headings
    const h = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (h && h[1] && h[2]) {
      closeListIfOpen();
      const level = Math.min(h[1].length + 1, 6); // # → h2, ## → h3, etc.
      html += `<h${level}>${inlineBold(escapeHtml(h[2]))}</h${level}>`;
      i++;
      continue;
    }

    // Tables (GFM-style): header | sep | rows
    const tableLine = /^\s*\|.*\|\s*$/.test(line);
    const sepLine = /^\s*\|[\s|:-]+\|\s*$/.test(lines[i + 1] ?? '');
    if (tableLine && sepLine) {
      closeListIfOpen();
      const headers = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      html += '<table><thead><tr>';
      for (const h2 of headers) html += `<th>${inlineBold(escapeHtml(h2))}</th>`;
      html += '</tr></thead><tbody>';
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i] ?? '')) {
        const cells = (lines[i] ?? '').trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        html += '<tr>';
        for (const c of cells) html += `<td>${inlineBold(escapeHtml(c))}</td>`;
        html += '</tr>';
        i++;
      }
      html += '</tbody></table>';
      continue;
    }

    // Bullets
    const bullet = /^\s*[-*]\s+(.+)$/.exec(line);
    if (bullet && bullet[1]) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inlineBold(escapeHtml(bullet[1]))}</li>`;
      i++;
      continue;
    }

    // Paragraph (collect consecutive non-blank, non-special lines)
    closeListIfOpen();
    const buf: string[] = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i] ?? '';
      if (!next.trim()) break;
      if (/^#{1,6}\s+/.test(next)) break;
      if (/^\s*\|.*\|\s*$/.test(next)) break;
      if (/^\s*[-*]\s+/.test(next)) break;
      buf.push(next);
      i++;
    }
    html += `<p>${inlineBold(escapeHtml(buf.join(' ')))}</p>`;
  }
  closeListIfOpen();
  return html;
}

export default async function NeonatologyArticlePage({ params }: PageProps) {
  const { id } = await params;
  const a = readArticle(id);
  if (!a) notFound();

  const topicLabel = TOPIC_LABELS[a.topic] ?? a.topic;
  const levelLabel = LEVEL_LABELS[a.level] ?? a.level;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalScholarlyArticle',
    '@id': `${BASE_URL}/neonatology/articles/${id}#article`,
    headline: a.title_ru,
    alternativeHeadline: a.title_en,
    description: a.summary,
    url: `${BASE_URL}/neonatology/articles/${id}`,
    inLanguage: 'ru',
    audience: {
      '@type': 'MedicalAudience',
      audienceType: a.audience,
    },
    about: {
      '@type': 'MedicalCondition',
      name: topicLabel,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bordik',
      url: BASE_URL,
    },
    isAccessibleForFree: true,
    citation: a.references,
  };

  return (
    <main
      id="main-content"
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '48px 24px',
        fontFamily: 'var(--font-body, system-ui)',
        color: 'var(--md-sys-color-on-surface, #1A1A1A)',
        minHeight: '70vh',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />

      <nav style={{ marginBottom: 24, fontSize: 13 }}>
        <a href="/neonatology" style={{ color: '#6B7280', textDecoration: 'none' }}>
          ← Неонатология
        </a>
      </nav>

      <div style={{
        display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
        marginBottom: 16, fontSize: 12, color: '#6B7280',
      }}>
        <span style={{ padding: '4px 10px', background: '#F0F1F5', borderRadius: 999 }}>{topicLabel}</span>
        <span style={{ padding: '4px 10px', background: '#F0F1F5', borderRadius: 999 }}>{levelLabel}</span>
        <span style={{ padding: '4px 10px', background: '#F0F1F5', borderRadius: 999 }}>{a.audience}</span>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display, system-ui)',
        fontSize: 30, fontWeight: 700, lineHeight: 1.2,
        letterSpacing: '-0.015em', marginBottom: 16, marginTop: 0,
      }}>
        {a.title_ru}
      </h1>

      <p style={{ fontSize: 16, lineHeight: 1.6, color: '#4B5563', marginBottom: 24 }}>
        {a.summary}
      </p>

      <a
        href={`/?neonatal=articles&id=${encodeURIComponent(id)}`}
        style={{
          display: 'inline-block',
          padding: '12px 22px',
          background: '#1A1A1A',
          color: '#FFFFFF',
          borderRadius: 12,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 14,
          marginBottom: 32,
        }}
      >
        Открыть в приложении →
      </a>

      <article
        className="neonatology-article-body"
        style={{
          fontSize: 15, lineHeight: 1.65, color: '#1F2937',
        }}
        dangerouslySetInnerHTML={{ __html: renderArticleBody(a.content) }}
      />

      {a.references.length > 0 && (
        <section style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid #E5E7EB' }}>
          <h2 style={{
            fontFamily: 'var(--font-display, system-ui)',
            fontSize: 18, fontWeight: 700, marginBottom: 12,
            letterSpacing: '-0.01em',
          }}>
            Источники
          </h2>
          <ol style={{ paddingLeft: 22, fontSize: 13.5, lineHeight: 1.6, color: '#374151' }}>
            {a.references.map((ref, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>{ref}</li>
            ))}
          </ol>
        </section>
      )}

      <p
        role="note"
        style={{
          marginTop: 36, paddingTop: 18,
          borderTop: '1px solid #E5E7EB',
          fontSize: 12, color: '#6B7280', lineHeight: 1.55,
        }}
      >
        <strong style={{ color: '#1A1A1A' }}>Не заменяет клиническое решение.</strong>{' '}
        Bordik — справочный инструмент для медицинских специалистов. Решение по
        конкретному пациенту принимает врач, опираясь на полный клинический
        контекст и действующие рекомендации.
      </p>
    </main>
  );
}
