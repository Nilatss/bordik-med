import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import CopyProtection from '@/components/CopyProtection';
import PwaRegistrar from '@/components/PwaRegistrar';
import { BFCacheGuard } from '@/components/BFCacheGuard';
import { StorageBanner } from '@/components/StorageBanner';
import { InstallPrompt } from '@/components/InstallPrompt';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

// Real-user web-vitals reporter → Sentry. Lazy + ssr:false because the
// `web-vitals` package only runs in the browser and we don't want it
// in the SSR payload.
const WebVitalsReporter = dynamic(
  () => import('@/components/WebVitalsReporter'),
  { ssr: false },
);

const APP_NAME = 'Bordik';
const APP_TITLE = 'Bordik - Платформа медицинского обучения';
const APP_DESCRIPTION =
  'Платформа медицинского обучения: курсы, тесты, клинические калькуляторы и шкалы.';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://bordik-med.vercel.app',
  ),
  applicationName: APP_NAME,
  title: {
    default: APP_TITLE,
    template: '%s - Bordik',
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  // Default robots stance: index home + content. Auth-gated routes set
  // `robots: { index: false }` per-route below.
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  // Canonical + hreflang. Russian-only for now; expansion to UZ/EN
  // happens once the i18n routing is wired up — see P2-SEO-2.
  alternates: {
    canonical: '/',
    languages: {
      'ru-RU':     '/',
      'x-default': '/',
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#FAFAFA' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  // iOS: allow content to extend into notch area
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-theme="light">
      <head>
        {/* Preconnect: warm up TLS + TCP for the two hottest paths so
            the first auth check / first AI call doesn't pay for the
            handshake. Saves ~100-300 ms each on cold navigations. */}
        <link rel="preconnect" href="https://generativelanguage.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://storage.googleapis.com" />
        {/* cdn.jsdelivr.net retired — MediaPipe WASM is self-hosted. */}
        {/* Supabase host comes from env; fall back to a sensible default
            string just so the browser sees a hint at HTML parse time. */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
          <link
            rel="preconnect"
            href={process.env.NEXT_PUBLIC_SUPABASE_URL}
            crossOrigin="anonymous"
          />
        ) : null}
        {/* JSON-LD: organisation-level schema. Drives Google Knowledge
            Panel, LinkedIn rich previews, MedicalScale ranking signals.
            P1-SEO-3 will add per-tool schema once /tools/[slug] routes
            exist; this root-level entry is the high-value baseline. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: APP_NAME,
            alternateName: 'Bordik Med',
            url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://bordik-med.vercel.app',
            description: APP_DESCRIPTION,
            sameAs: ['https://t.me/bordik_app'],
            email: 'hello@bordik.app',
            educationalCredentialAwarded: 'Continuing Medical Education',
            // Primary audience — student / clinician medics.
            audience: { '@type': 'EducationalAudience', educationalRole: 'medical professional' },
          }) }}
        />
        {/* Prevent FOUC — paint the page background before any CSS arrives. */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body { background: #F0F1F5; margin: 0; padding: 0; }
        `}} />
      </head>
      <body>
        {/* P2-A11Y-3 — Skip link. Hidden until focused via Tab; lets
            screen-reader and keyboard users jump past the sidebar /
            navigation directly to main content. The target #main-content
            is rendered by the route segments that wrap their primary
            <main> with id="main-content" (home, privacy, terms, etc.). */}
        <a href="#main-content" className="skip-link">
          Перейти к основному контенту
        </a>
        {/*
          Pre-hydration skeleton was removed when SectionCards moved into
          the SSR HTML payload. Previously the skeleton was a full-screen
          fixed overlay (z-index: 1) that hid the SSR'd page content until
          a useEffect timeout cleared it ~470 ms after first paint. With
          real content already in the initial HTML, the skeleton was
          actively delaying LCP — Lighthouse mobile measured the LCP
          element (a section card below the fold) at 3.4 s purely because
          of the skeleton fade.
        */}
        <PwaRegistrar />
        <CopyProtection />
        <BFCacheGuard />
        <StorageBanner />
        <InstallPrompt />
        {children}
        {/* Vercel RUM. Analytics is privacy-friendly (no IP store). */}
        <SpeedInsights />
        <Analytics />
        {/* Sentry RUM — Core Web Vitals → Sentry events with route /
            device / connection tags. Mounts after `children` so it
            doesn't compete with critical render path. */}
        <WebVitalsReporter />
      </body>
    </html>
  );
}
