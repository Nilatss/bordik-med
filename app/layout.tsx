import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bordik - Платформа медицинского обучения',
  description:
    'Полный академический курс медицины. Обучение, тестирование, сертификация.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#FAFAFA',
  width: 'device-width',
  initialScale: 1,
};

import CopyProtection from '@/components/CopyProtection';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-theme="light">
      <body>
        <CopyProtection />
        {children}
      </body>
    </html>
  );
}
