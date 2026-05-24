/**
 * Neonatology section — SSG landing page (audit 1.17 SEO closure).
 *
 * The full Neonatology Module is rendered as SPA state inside the home
 * route (set via `showNeonatal` in Zustand). That gives a fast in-app
 * experience but leaves search engines with a single page for the entire
 * раздел — same problem the tool catalog had before per-tool SSG landed.
 *
 * This static route exists purely as an SEO entry point + a shareable
 * deep-link target. It renders a real <h1> + body copy describing the
 * раздел, a JSON-LD `MedicalWebPage` schema, and a CTA that opens the
 * live SPA via `/?neonatal=1`.
 *
 * Per-article SSG routes live at `app/neonatology/articles/[id]/`.
 *
 * Sitemap entries managed in `app/sitemap.ts`.
 */
import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { jsonLdHtml } from '@/lib/json-ld';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://bordik-med.vercel.app';

interface BankStats {
  drugs: number;
  protocols: number;
  calculators: number;
  articles: number;
  cases: number;
  mistakes: number;
  checklists: number;
  videos: number;
  atlas: number;
  lactmed: number;
  nurse: number;
  quizzes: number;
  labValues: number;
}

/** Build-time read of bank sizes — runs once at SSG, never at request. */
function readBankStats(): BankStats {
  const dir = join(process.cwd(), 'public');
  const safeLen = (file: string, key: string): number => {
    try {
      const raw = readFileSync(join(dir, file), 'utf8');
      const json = JSON.parse(raw);
      const arr = json[key];
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  };
  const safeLabValues = (): number => {
    try {
      const raw = readFileSync(join(dir, 'neonatal-lab-norms.json'), 'utf8');
      const json = JSON.parse(raw);
      const groups = json.groups;
      if (!Array.isArray(groups)) return 0;
      return groups.reduce((sum: number, g: { values?: unknown[] }) =>
        sum + (Array.isArray(g.values) ? g.values.length : 0), 0);
    } catch {
      return 0;
    }
  };
  return {
    drugs:      safeLen('neonatal-monographs.json', 'drugs'),
    protocols:  safeLen('neonatal-guidelines.json', 'guidelines'),
    calculators: (() => {
      try {
        const raw = readFileSync(join(dir, 'neonatal-calculators.json'), 'utf8');
        const json = JSON.parse(raw);
        const groups = json.groups;
        if (!Array.isArray(groups)) return 0;
        return groups.reduce((sum: number, g: { calculators?: unknown[] }) =>
          sum + (Array.isArray(g.calculators) ? g.calculators.length : 0), 0);
      } catch {
        return 0;
      }
    })(),
    articles:   safeLen('neonatal-articles.json', 'articles'),
    cases:      safeLen('neonatal-clinical-cases.json', 'cases'),
    mistakes:   safeLen('neonatal-common-mistakes.json', 'mistakes'),
    checklists: safeLen('neonatal-procedure-checklists.json', 'checklists'),
    videos:     safeLen('neonatal-procedure-videos.json', 'videos'),
    atlas:      safeLen('neonatal-atlas.json', 'atlas'),
    lactmed:    safeLen('neonatal-lactmed.json', 'drugs'),
    nurse:      safeLen('neonatal-nurse-procedures.json', 'procedures'),
    quizzes:    safeLen('neonatal-quizzes.json', 'quizzes'),
    labValues:  safeLabValues(),
  };
}

export const metadata: Metadata = {
  title: 'Неонатология — справочник для врачей и медсестёр | Bordik',
  description:
    'Справочник по неонатологии: дозы препаратов NICU, клинические протоколы (КР МЗ РФ + AAP/NICE/ESPGHAN/WHO), калькуляторы (Apgar, Ballard, Bili-2022, Kaiser EOS, Fenton), статьи + клинические случаи + чек-листы процедур + типичные ошибки. Multi-region: РФ / США / Европа / Узбекистан.',
  keywords: [
    'неонатология',
    'NICU',
    'дозы препаратов новорождённых',
    'NRP',
    'Apgar',
    'Bili-2022',
    'Kaiser EOS',
    'Fenton',
    'недоношенные',
    'клинические рекомендации МЗ РФ',
    'КР неонатология',
    'neonatology',
    'newborn drug dosing',
  ],
  alternates: { canonical: '/neonatology' },
  openGraph: {
    type: 'website',
    title: 'Неонатология — справочник Bordik',
    description:
      'Полный русско/узбекоязычный модуль для NICU: 214 препаратов, 91 протокол, 59 калькуляторов, 107 статей, 38 клинических случаев, 21 чек-лист, 49 LactMed entries — с PMID/DOI citations.',
    url: `${BASE_URL}/neonatology`,
    siteName: 'Bordik',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Неонатология — справочник Bordik',
    description:
      '214 препаратов NICU + 91 протокол (КР МЗ РФ / AAP / NICE / WHO) + 59 калькуляторов + 107 статей.',
  },
};

export default function NeonatologyLandingPage() {
  const stats = readBankStats();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${BASE_URL}/neonatology#page`,
    name: 'Неонатология — справочник для врачей и медсестёр',
    url: `${BASE_URL}/neonatology`,
    description: metadata.description,
    audience: {
      '@type': 'MedicalAudience',
      audienceType: 'Medical professionals (педиатры, неонатологи, медсёстры NICU, фельдшеры)',
    },
    medicalSpecialty: 'Pediatric',
    about: {
      '@type': 'MedicalCondition',
      name: 'Neonatal care (NICU)',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bordik',
      url: BASE_URL,
    },
    isAccessibleForFree: true,
    inLanguage: ['ru', 'en', 'uz'],
  };

  return (
    <main
      id="main-content"
      style={{
        maxWidth: 880,
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
        <a href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>← Главная Bordik</a>
      </nav>

      <h1 style={{
        fontFamily: 'var(--font-display, system-ui)',
        fontSize: 36, fontWeight: 700, lineHeight: 1.15,
        letterSpacing: '-0.02em', marginBottom: 16,
      }}>
        Неонатология — справочник для врачей и медсестёр
      </h1>

      <p style={{ fontSize: 17, lineHeight: 1.6, color: '#374151', marginBottom: 28 }}>
        Полный клинико-образовательный модуль по неонатологии: дозы препаратов NICU,
        клинические протоколы (КР МЗ РФ + AAP / NICE / ESPGHAN / WHO), калькуляторы,
        статьи, клинические случаи, чек-листы процедур, типичные ошибки. Multi-region:
        РФ / США / Европа / Узбекистан. Все формулы с PMID / DOI / URL цитированием.
      </p>

      <a
        href="/?neonatal=1"
        style={{
          display: 'inline-block',
          padding: '14px 28px',
          background: '#1A1A1A',
          color: '#FFFFFF',
          borderRadius: 14,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 15,
          marginBottom: 40,
        }}
      >
        Открыть раздел →
      </a>

      <h2 style={{
        fontFamily: 'var(--font-display, system-ui)',
        fontSize: 22, fontWeight: 700, lineHeight: 1.3,
        letterSpacing: '-0.01em', marginTop: 40, marginBottom: 16,
      }}>
        Что внутри
      </h2>

      <dl style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr',
        columnGap: 20, rowGap: 10,
        fontSize: 14, lineHeight: 1.55,
        marginBottom: 32,
      }}>
        <dt style={{ color: '#6B7280' }}>Препараты NICU</dt>
        <dd style={{ margin: 0 }}><strong>{stats.drugs}</strong> монографий с дозированием по гестационному возрасту, путём введения, метаболизмом, предостережениями (NeoFax / BNFc baseline + КР МЗ РФ)</dd>

        <dt style={{ color: '#6B7280' }}>Клинические протоколы</dt>
        <dd style={{ margin: 0 }}><strong>{stats.protocols}</strong> протоколов с региональным фильтром (РФ / США / Европа / Узбекистан / Международный) — каждый с цитатой первоисточника</dd>

        <dt style={{ color: '#6B7280' }}>Калькуляторы и шкалы</dt>
        <dd style={{ margin: 0 }}><strong>{stats.calculators}</strong> инструментов: Apgar + таймер, Ballard, Сильверман, Bili-2022 (3-region), Kaiser EOS (3-region), Fenton 2025, Intergrowth-21st, NRP реан-дозы (3-region), TPN ESPGHAN, NIPS / PIPP-R / N-PASS, Bell NEC, Papile ВЖК, ICROP3 ROP, NIH BPD, и многие другие</dd>

        <dt style={{ color: '#6B7280' }}>Образовательные статьи</dt>
        <dd style={{ margin: 0 }}><strong>{stats.articles}</strong> статей по респираторной патологии, сепсису, неврологии, метаболизму, скринингам, питанию, выписке — с PMID / DOI</dd>

        <dt style={{ color: '#6B7280' }}>Клинические случаи</dt>
        <dd style={{ margin: 0 }}><strong>{stats.cases}</strong> кейсов (виньетка → presenting features → differential → management → pearls → references)</dd>

        <dt style={{ color: '#6B7280' }}>Типичные ошибки</dt>
        <dd style={{ margin: 0 }}><strong>{stats.mistakes}</strong> pitfalls с severity (low / medium / high) — что часто делают неправильно, почему, как должно быть, последствия</dd>

        <dt style={{ color: '#6B7280' }}>Чек-листы процедур</dt>
        <dd style={{ margin: 0 }}><strong>{stats.checklists}</strong> интерактивных чек-листов (UVC, UAC, интубация, LP, LISA, DVET, chest tube, CPAP init, golden hour, TH init, phototherapy, breastfeeding, head-to-toe exam) — прогресс сохраняется локально</dd>

        <dt style={{ color: '#6B7280' }}>Видео процедур</dt>
        <dd style={{ margin: 0 }}><strong>{stats.videos}</strong> linkouts на authoritative источники (AAP NRP, WHO, NEJM, Stanford, EFCNI, UNICEF, AAO, CDC)</dd>

        <dt style={{ color: '#6B7280' }}>Атласы</dt>
        <dd style={{ margin: 0 }}><strong>{stats.atlas}</strong> reference linkouts (Radiopaedia CC BY, NEJM, Stanford 25, ICROP / AAO)</dd>

        <dt style={{ color: '#6B7280' }}>LactMed</dt>
        <dd style={{ margin: 0 }}><strong>{stats.lactmed}</strong> препаратов с совместимостью при грудном вскармливании (NCBI LactMed)</dd>

        <dt style={{ color: '#6B7280' }}>Процедуры медсестры</dt>
        <dd style={{ margin: 0 }}><strong>{stats.nurse}</strong> bedside reference: PPV, suction, IV / NG установка, vital signs, glucose monitoring, фототерапия, CPAP care, heel stick, KMC, infection control, помощь при экстубации</dd>

        <dt style={{ color: '#6B7280' }}>Тесты</dt>
        <dd style={{ margin: 0 }}><strong>{stats.quizzes}</strong> квизов с randomized retry (Fisher-Yates) без повторов — RDS, hyperbili, EOS / LOS, HIE, NEC, IEM, screening, PPHN, PDA, NAS, и др.</dd>

        <dt style={{ color: '#6B7280' }}>Лаб + imaging нормы</dt>
        <dd style={{ margin: 0 }}><strong>{stats.labValues}</strong> референсных значений в 15 группах (газы крови, электролиты, CBC, коагуляция, CSF, моча, ЭХО, УЗИ ГМ, R-ОГК, MRI)</dd>
      </dl>

      <h2 style={{
        fontFamily: 'var(--font-display, system-ui)',
        fontSize: 22, fontWeight: 700, lineHeight: 1.3,
        letterSpacing: '-0.01em', marginTop: 40, marginBottom: 16,
      }}>
        Источники
      </h2>

      <ul style={{ fontSize: 14, lineHeight: 1.65, color: '#374151', paddingLeft: 22, marginBottom: 32 }}>
        <li>КР МЗ РФ 2023-2025 (cr.minzdrav.gov.ru) — обязательны с 01.01.2024</li>
        <li>NRP 8 ed. 2021 (American Heart Association / AAP)</li>
        <li>ERC 2021 / 2025 Newborn Life Support</li>
        <li>AAP 2022 Hyperbilirubinemia Guideline (Kemper et al. Pediatrics 2022;150:e2022058859)</li>
        <li>ESPGHAN PN 2018 + EN 2022 consensus</li>
        <li>WHO Pocket Book of Hospital Care for Children + ENC</li>
        <li>NICE CG98 + NG195 + NG194</li>
        <li>Узбекистан: gov.uz / ssv протоколы 2024</li>
        <li>BAPM, Kaiser EOS Calculator, Sweet 2022 European Consensus RDS</li>
      </ul>

      <p
        role="note"
        style={{
          marginTop: 24, paddingTop: 18,
          borderTop: '1px solid #E5E7EB',
          fontSize: 12.5, color: '#6B7280', lineHeight: 1.55,
        }}
      >
        <strong style={{ color: '#1A1A1A' }}>Не заменяет клиническое решение.</strong>{' '}
        Дозы у новорождённых критически зависят от гестационного возраста, дней жизни,
        веса, функции почек и печени. Решение по конкретному пациенту принимает
        врач / клин-фармаколог / неонатолог. Bordik — справочный инструмент, не нормативный
        документ.
      </p>
    </main>
  );
}
