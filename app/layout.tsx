import type { Metadata, Viewport } from 'next';
import './globals.css';
import CopyProtection from '@/components/CopyProtection';
import PwaRegistrar from '@/components/PwaRegistrar';

const APP_NAME = 'Bordik';
const APP_TITLE = 'Bordik - Платформа медицинского обучения';
const APP_DESCRIPTION =
  'Платформа медицинского обучения: курсы, тесты, клинические калькуляторы и шкалы.';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_TITLE,
    template: '%s - Bordik',
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
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
      <body>
        <PwaRegistrar />
        <CopyProtection />
        {children}
      </body>
    </html>
  );
}
