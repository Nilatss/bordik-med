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
import RelatedLinks from '@/components/tools/RelatedLinks';
import { jsonLdHtml } from '@/lib/json-ld';

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
  lastUpdated?: string;        // YYYY-MM-DD
  reference?: string | null;   // primary source citation
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
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

  // schema.org type selection (P0-A7 из аудита):
  //
  //   - score-инструменты (TIMI, GRACE, CHA2DS2-VASc, Wells, qSOFA, GCS) →
  //     MedicalRiskCalculator — точно описывает «scoring instrument для
  //     оценки клинического риска». Подкласс MedicalRiskEstimator.
  //   - calculator-инструменты (BMI, BSA, eGFR, anion gap) → MedicalScale,
  //     который Google понимает как «medical scale producing a value».
  //     Schema.org не имеет отдельного MedicalFormula, MedicalScale —
  //     ближайший корректный тип для расчётных инструментов.
  //
  // Двойной типизация (additionalType="MedicalCalculator") даёт
  // дополнительный сигнал AI-агрегаторам (ChatGPT Search, Perplexity,
  // MDCalc-аналоги): это калькулятор, не текстовая статья.
  const schemaType = t.kind === 'score' ? 'MedicalRiskCalculator' : 'MedicalScale';

  // medicalSpecialty по schema.org должен быть из enum значений
  // (Cardiovascular, Endocrine, Pulmonary, ...). Маппим из категории
  // нашего каталога. Для категорий без точного совпадения отдаём
  // generic «Medical» — Google это принимает.
  const specialtyMap: Record<string, string> = {
    '1. Клинические калькуляторы':            'PrimaryCare',
    '2. Диагностические шкалы':                'PrimaryCare',
    '3. Педиатрические инструменты':           'Pediatric',
    '4. Кардиология и сосуды':                 'Cardiovascular',
    '5. Неврология и нейрохирургия':            'Neurologic',
    '6. Анестезиология и ICU':                  'Anesthesia',
    '7. Травматология и военная медицина':      'Emergency',
    '8. Акушерство и гинекология':             'Obstetric',
    '9. Психиатрия и психология':              'Psychiatric',
    '10. Онкология':                          'Oncologic',
    '11. Инфекционные болезни':                'Infectious',
    '12. Нефрология и урология':                'Nephrologic',
    '13. Пульмонология':                      'Pulmonary',
    '14. Фармакология и лекарства':             'PharmacySpecialty',
    '15. Лабораторная медицина':              'Pathology',
    '17. Протоколы экстренной помощи':         'Emergency',
  };
  const specialty = specialtyMap[t.category];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    // additionalType — кастомный сигнал для AI-парсеров и Google
    // Knowledge Graph: «это калькулятор, не текстовая статья»
    additionalType: 'https://schema.org/MedicalCalculator',
    '@id': `${BASE_URL}/tools/${id}#tool`,
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
    // medicalSpecialty — schema.org enum (Cardiovascular, Pulmonary, ...).
    // Если нашли соответствие — отдаём enum; иначе fallback на текстовое
    // имя категории (Google примет string).
    medicalSpecialty: specialty ?? t.category,
    // keywords помогают Google и поисковым агрегаторам сопоставить
    // запрос с тулом (особенно когда юзер ищет аббревиатуру).
    keywords: [t.subcategory, t.category, t.kind].filter(Boolean).join(', '),
    ...(t.lastUpdated
      ? {
          dateModified: t.lastUpdated,
          // lastReviewed — schema.org-предпочитаемое поле для медицинской
          // достоверности; Google использует его в knowledge graph.
          lastReviewed: t.lastUpdated,
        }
      : {}),
    ...(t.reference
      ? {
          citation: t.reference,
          // subjectOf — связывает калькулятор с гайдлайном-источником
          // как сущностью. Google строит граф «калькулятор ↔ guideline».
          subjectOf: {
            '@type': 'MedicalGuideline',
            name: t.reference.split('.').slice(0, 1).join('.') + '.',
            guidelineDate: t.lastUpdated ?? undefined,
          },
        }
      : {}),
    ...(t.countries
      ? {
          audience: { '@type': 'MedicalAudience', audienceType: t.countries },
          // recognizingAuthority — позволяет указать организацию
          // (ВОЗ, ESC, AHA), которая признаёт инструмент. Если мы храним
          // только country-string, оборачиваем в Organization.
          recognizingAuthority: {
            '@type': 'Organization',
            name: t.countries,
          },
        }
      : {}),
    // potentialAction — для voice-ассистентов и AI: «здесь можно
    // вычислить значение». Yandex Алиса, Google Assistant используют
    // ActionType, чтобы понять что страница интерактивная.
    potentialAction: {
      '@type': 'CalculateAction',
      target: `${BASE_URL}/tools/${id}`,
      name: t.kind === 'score' ? 'Рассчитать балл' : 'Рассчитать значение',
    },
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
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
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
          marginBottom: 40,
        }}
      >
        Открыть калькулятор →
      </a>

      {/*
        Provenance + safety block — meets the FDA Cures Act CDS Guidance
        pattern (and the equivalent EU MDR §1.6.3) that medical
        decision-support tools must surface to the clinician:
          1. Function of the device + intended user
          2. Basis for the recommendation (the cited primary source)
          3. Indication of how recently the data was reviewed
          4. Independent ability to override / disregard the output
        MDCalc / UpToDate / Medscape all expose this metadata block
        prominently. We mirror their structure so the user can decide
        whether the output is trustworthy without leaving the page.
      */}
      <section
        aria-labelledby="provenance-heading"
        style={{
          marginTop: 8,
          padding: '20px 22px',
          background: '#F5F6F8',
          borderRadius: 14,
          fontSize: 13,
          color: '#4B5563',
          lineHeight: 1.55,
        }}
      >
        <h2
          id="provenance-heading"
          style={{
            margin: '0 0 12px',
            fontFamily: 'var(--font-mono, ui-monospace)',
            fontSize: 11,
            fontWeight: 700,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Источник и обновление
        </h2>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 8 }}>
          {formatDate(t.lastUpdated) ? (
            <>
              <dt style={{ color: '#6B7280' }}>Обновлено</dt>
              <dd style={{ margin: 0, color: '#1A1A1A', fontFamily: 'var(--font-mono, ui-monospace)' }}>
                {formatDate(t.lastUpdated)}
              </dd>
            </>
          ) : null}
          <dt style={{ color: '#6B7280' }}>Первоисточник</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            {t.reference ?? 'Не аннотирован — внутренняя редакция Bordik. Сверяйтесь с актуальными клиническими рекомендациями.'}
          </dd>
          <dt style={{ color: '#6B7280' }}>Тип</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            {t.kind === 'calculator' ? 'Калькулятор (формула)' : t.kind === 'score' ? 'Балльная шкала' : t.kind}
          </dd>
        </dl>

        {/*
          Standard "not a substitute for clinical judgement" disclaimer.
          The wording mirrors the FDA Cures Act CDS Guidance §6.B —
          decision-support tools that meet the carve-out from device
          regulation must explicitly inform the clinician that they are
          intended as an adjunct, not a replacement, for independent
          clinical assessment.
        */}
        <p
          role="note"
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid #E5E7EB',
            fontSize: 12,
            color: '#6B7280',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: '#1A1A1A' }}>Не заменяет клиническое суждение.</strong>{' '}
          Этот инструмент предназначен для медицинских специалистов как вспомогательный
          расчёт. Решение о тактике принимает врач, опираясь на полный клинический
          контекст и действующие рекомендации. Заметили ошибку — напишите через
          «Обратную связь» в сайдбаре.
        </p>
      </section>

      {/* P0-A9: блок «Связанные ресурсы» — МКБ-10 коды + поиск
          в Рубрикаторе Минздрава по соответствующим кодам.
          Компонент сам решает рендерить ли блок (null если нет
          связанных кодов — для tools-«ресурсов» Справочники, Россия,
          Конверсии единиц и т.д. блок не отображается). */}
      <RelatedLinks toolId={t.id} subcategory={t.subcategory} />
    </main>
  );
}
