import type { Metadata, Viewport } from 'next';
import './globals.css';
import CopyProtection from '@/components/CopyProtection';
import PwaRegistrar from '@/components/PwaRegistrar';
import { BFCacheGuard } from '@/components/BFCacheGuard';
import { StorageBanner } from '@/components/StorageBanner';
import { SkeletonHider } from '@/components/SkeletonHider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

const APP_NAME = 'Bordik';
const APP_TITLE = 'Bordik - Платформа медицинского обучения';
const APP_DESCRIPTION =
  'Платформа медицинского обучения: курсы, тесты, клинические калькуляторы и шкалы.';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://ironmed-academy.vercel.app',
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
        {/* Prevent FOUC — paint the page background before any CSS arrives. */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body { background: #F0F1F5; margin: 0; padding: 0; }
          /* Initial skeleton — visible the instant the HTML lands, before
             React/JS finish parsing. Animated shimmer reassures the user
             that something is loading. The real UI replaces this once the
             client component tree mounts. */
          #__app_skeleton {
            position: fixed; inset: 0; z-index: 1;
            display: flex; min-height: 100vh; pointer-events: none;
            background: #F0F1F5;
          }
          #__app_skeleton .sk-side {
            width: 280px; min-width: 280px;
            background: #F0F1F5;
            padding: 32px 24px 0;
          }
          #__app_skeleton .sk-main {
            flex: 1;
            background: #FFFFFF;
            border-top-left-radius: 32px;
            border-bottom-left-radius: 32px;
            padding: 32px;
          }
          #__app_skeleton .sk-block {
            border-radius: 14px;
            background: linear-gradient(90deg, #F1F3F6 0%, #E8EAEE 50%, #F1F3F6 100%);
            background-size: 200% 100%;
            animation: sk-shimmer 1.4s ease-in-out infinite;
          }
          #__app_skeleton .sk-logo { width: 110px; height: 28px; }
          #__app_skeleton .sk-greet { width: 180px; height: 36px; margin-top: 28px; }
          #__app_skeleton .sk-search { width: 100%; height: 40px; margin-top: 24px; }
          #__app_skeleton .sk-row { width: 100%; height: 38px; margin-top: 8px; }
          #__app_skeleton .sk-card { width: 100%; height: 120px; margin-top: 18px; }
          @keyframes sk-shimmer {
            0%, 100% { background-position: 200% 50%; }
            50% { background-position: 0% 50%; }
          }
          @media (max-width: 768px) {
            #__app_skeleton .sk-side { display: none; }
            #__app_skeleton .sk-main {
              border-radius: 0; padding: 16px;
            }
          }
          /* React sets html[data-ready="1"] from a top-level useEffect on
             the first client render. Skeleton fades out instead of snapping. */
          html[data-ready="1"] #__app_skeleton {
            opacity: 0;
            transition: opacity 220ms ease-out;
          }
          html[data-ready="2"] #__app_skeleton {
            display: none;
          }
        `}} />
      </head>
      <body>
        {/* Pre-hydration skeleton — auto-hides as soon as the React tree
            paints. Inline script swaps display:none after the next paint
            tick (rAF) so users don't see any flash. */}
        <div id="__app_skeleton" aria-hidden="true">
          <div className="sk-side">
            <div className="sk-block sk-logo" />
            <div className="sk-block sk-greet" />
            <div className="sk-block sk-search" />
            <div className="sk-block sk-row" style={{ marginTop: 18 }} />
            <div className="sk-block sk-row" />
            <div className="sk-block sk-row" />
            <div className="sk-block sk-row" style={{ marginTop: 18 }} />
            <div className="sk-block sk-row" />
            <div className="sk-block sk-row" />
          </div>
          <div className="sk-main">
            <div className="sk-block sk-greet" style={{ width: 240, height: 28, marginTop: 0 }} />
            <div className="sk-block sk-card" />
            <div className="sk-block sk-card" />
            <div className="sk-block sk-card" />
          </div>
        </div>
        <SkeletonHider />
        <PwaRegistrar />
        <CopyProtection />
        <BFCacheGuard />
        <StorageBanner />
        {children}
        {/* Vercel RUM. Analytics is privacy-friendly (no IP store). */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
