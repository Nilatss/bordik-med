/**
 * Tests for the offline-first async error boundary:
 *   - AsyncErrorCard renders a visible title/description/retry (the fallback
 *     shown when useAsyncInit fails)
 *   - getCatalog drops its cached rejected promise so a retry can recover
 *     (the singleton-recovery contract useCatalogState relies on)
 *
 * The useAsyncInit hook itself is effect-driven; the repo's vitest setup is
 * node-env with no jsdom/testing-library, so we cover the two pure,
 * deterministic pieces here and rely on TS + manual QA for the React glue.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AsyncErrorCard } from '@/components/ui/AsyncErrorCard';

describe('AsyncErrorCard', () => {
  it('renders a default title, description and a retry button', () => {
    const html = renderToStaticMarkup(
      createElement(AsyncErrorCard, { onRetry: () => {} }),
    );
    expect(html).toContain('Не удалось загрузить данные');
    expect(html).toContain('Повторить');
    expect(html).toContain('role="alert"');
  });

  it('renders a custom title + description', () => {
    const html = renderToStaticMarkup(
      createElement(AsyncErrorCard, {
        title: 'Каталог недоступен',
        description: 'Проверьте сеть.',
        onRetry: () => {},
      }),
    );
    expect(html).toContain('Каталог недоступен');
    expect(html).toContain('Проверьте сеть.');
  });
});

describe('getCatalog · singleton error recovery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('rethrows on failure and recovers on a subsequent call', async () => {
    // Fresh module instance so the singleton promise starts null.
    const mod = await import('@/lib/catalog-client');
    const { getCatalog } = mod;

    // First call: fetch rejects → getCatalog rejects, cached promise dropped.
    const failing = vi.fn().mockRejectedValueOnce(new Error('cache blocked'));
    vi.stubGlobal('fetch', failing);
    await expect(getCatalog()).rejects.toThrow(/cache blocked/);

    // Second call: fetch now succeeds → getCatalog resolves (proves the
    // rejected promise was NOT permanently cached, so retry() recovers).
    const ok = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'x', title: 'X' }],
    });
    vi.stubGlobal('fetch', ok);
    const rows = await getCatalog();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows[0]?.id).toBe('x');
  });
});
