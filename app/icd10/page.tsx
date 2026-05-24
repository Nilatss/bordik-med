/**
 * МКБ-10 lookup — публичная страница со справочником кодов.
 *
 * Server-rendered shell: читает data/icd10-starter.json при сборке,
 * передаёт в клиентский компонент. Никаких runtime fetch'ей.
 *
 * Архитектурные планы (см. docs/CONTENT_ROADMAP.md, фича #3):
 *   - Сейчас: ~90 наиболее частых кодов из стартовой базы
 *   - Phase 2: расширение до полных ~14 000 кодов через build-script
 *   - Phase 3: индекс MiniSearch (как для каталога tools) — для
 *     полнотекстового поиска
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import Icd10Lookup from '@/components/icd10/Icd10Lookup';
import { jsonLdHtml } from '@/lib/json-ld';

interface Chapter {
  id: string;
  range: string;
  title: string;
}
interface CodeEntry {
  code: string;
  title: string;
  chapter: string;
}
interface Bank {
  version: string;
  lastUpdated: string;
  source: string;
  chapters: Chapter[];
  codes: CodeEntry[];
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://bordik-med.vercel.app';

export const metadata: Metadata = {
  title: 'МКБ-10 справочник',
  description:
    'Поиск кодов МКБ-10 по диагнозу или коду. Все 22 главы Международной классификации болезней 10-го пересмотра в редакции ВОЗ.',
  alternates: { canonical: '/icd10' },
  openGraph: {
    type: 'website',
    title: 'МКБ-10 справочник — Bordik',
    description:
      'Поиск по коду или по названию диагноза. Все 22 главы МКБ-10.',
    url: `${BASE_URL}/icd10`,
    siteName: 'Bordik',
  },
};

function loadBank(): Bank {
  const filePath = join(process.cwd(), 'data', 'icd10-starter.json');
  const raw = readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as Bank;
}

function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export default function Icd10Page() {
  const bank = loadBank();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: 'МКБ-10 справочник',
    description:
      'Поиск кодов МКБ-10 по диагнозу или коду. Все 22 главы.',
    url: `${BASE_URL}/icd10`,
    inLanguage: 'ru',
    dateModified: bank.lastUpdated,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Bordik',
      alternateName: 'Bordik Med',
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
      <Icd10Lookup
        chapters={bank.chapters}
        codes={bank.codes}
        version={bank.version}
        lastUpdated={formatDate(bank.lastUpdated)}
        source={bank.source}
      />
    </>
  );
}
