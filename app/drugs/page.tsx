/**
 * Чекер взаимодействий — публичная SSG-страница.
 *
 * Server-rendered shell с MedicalCalculator JSON-LD для SEO. Сам UI
 * (interactive multi-select + результаты) — клиентский компонент
 * <DrugChecker/>, который грузится lazy.
 *
 * Архитектурные планы:
 *   - Phase 1 (сейчас): 62 препарата + 83 ручкой выверенных пары
 *   - Phase 2: парсер ГРЛС → 200+ препаратов, все severity
 *   - Phase 3: интеграция с DrugBank Open Data API для auto-обновления
 */
import type { Metadata } from 'next';
import DrugChecker from '@/components/drugs/DrugChecker';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://bordik-med.vercel.app';

export const metadata: Metadata = {
  title: 'Чекер взаимодействий лекарств',
  description:
    'Проверка совместимости лекарств. 62 препарата, 83 ручкой выверенных пары взаимодействий с механизмом, клиническим следствием и тактикой. Источники: UpToDate Lexidrug, Stockley\'s, ESC/AHA, FDA.',
  alternates: { canonical: '/drugs' },
  openGraph: {
    type: 'website',
    title: 'Чекер взаимодействий лекарств — Bordik',
    description:
      'Совместимость лекарств: проверьте 2-30 препаратов одновременно. Тактика по каждому взаимодействию — что делать.',
    url: `${BASE_URL}/drugs`,
    siteName: 'Bordik',
  },
};

export default function DrugsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    additionalType: 'https://schema.org/MedicalCalculator',
    name: 'Чекер взаимодействий лекарств',
    description:
      'Проверка совместимости лекарств с механизмом, клиническим следствием и тактикой по каждой паре.',
    url: `${BASE_URL}/drugs`,
    inLanguage: 'ru',
    medicalSpecialty: 'PharmacySpecialty',
    keywords: 'лекарственные взаимодействия, фармакология, drug interactions, совместимость препаратов',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{
        maxWidth: 1040, margin: '0 auto',
        padding: '32px 24px 80px',
      }}>
        <DrugChecker />
      </main>
    </>
  );
}
