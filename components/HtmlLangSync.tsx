'use client';

import { useEffect } from 'react';
import { useLang } from '@/lib/i18n';

/**
 * Keeps the document's <html lang> attribute in sync with the user's
 * active locale.
 *
 * The server renders `lang="ru"` as the SSR default — the chosen locale
 * lives in client localStorage (zustand persist), so the server has no
 * way to know it at render time. Once hydrated, this corrects the
 * attribute to the real active language (ru / en / uz). That matters for:
 *   - screen readers (announce content with the correct pronunciation),
 *   - the browser's translate / spell-check picking the right language,
 *   - assistive tech and SEO crawlers that read the lang attribute.
 *
 * Renders nothing — it only runs the side effect.
 */
export function HtmlLangSync(): null {
  const lang = useLang();
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);
  return null;
}
