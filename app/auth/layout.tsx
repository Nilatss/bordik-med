import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// P3-SEC — noindex для всех auth-страниц (/auth/login, /auth/callback).
// Robots не должны видеть login URL и кэшировать его — defence-in-depth
// против фишинговых-clones и phishing-toolkit'ов, использующих SERP.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
