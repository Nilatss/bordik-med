/**
 * Public release log.
 *
 * Renders every entry from `public/release-notes.json` in reverse
 * chronological order. Build-time read (Node fs) so the page is
 * statically generated — no client JS needed beyond the layout chrome.
 *
 * Linked from the PwaRegistrar update toast ("Что нового") and from
 * the footer / changelog references.
 *
 * Editing the page is editing the JSON: append a new entry to the top
 * of `releases` in release-notes.json, redeploy, and the next visit
 * picks it up automatically.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';

interface ReleaseEntry {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: string[];
}

interface ReleasesFile {
  releases?: ReleaseEntry[];
}

export const metadata: Metadata = {
  title: 'Что нового',
  description: 'История обновлений Bordik — список релизов с описанием изменений.',
  alternates: { canonical: '/releases' },
};

function readReleases(): ReleaseEntry[] {
  try {
    const filePath = join(process.cwd(), 'public', 'release-notes.json');
    const data = JSON.parse(readFileSync(filePath, 'utf8')) as ReleasesFile;
    return data.releases ?? [];
  } catch {
    return [];
  }
}

function formatDate(iso: string): string {
  // Inputs are ISO YYYY-MM-DD; format as "DD.MM.YYYY" for the audience.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export default function ReleasesPage() {
  const releases = readReleases();

  return (
    <main
      id="main-content"
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '48px 24px',
        fontFamily: 'var(--font-body, system-ui)',
        color: 'var(--md-sys-color-on-surface, #1A1A1A)',
        minHeight: '70vh',
      }}
    >
      <nav style={{ marginBottom: 24, fontSize: 13 }}>
        <a href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>← На главную</a>
      </nav>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--font-display, system-ui)',
          fontSize: 32, fontWeight: 700, lineHeight: 1.2,
          letterSpacing: '-0.02em', marginBottom: 8,
        }}>
          Что нового
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: '#6B7280' }}>
          История заметных обновлений Bordik. Косметические правки и
          инфраструктурные деплои сюда не попадают — только то, что меняет
          ваш опыт.
        </p>
      </header>

      {releases.length === 0 ? (
        <p style={{ color: '#6B7280' }}>Релизов пока нет.</p>
      ) : (
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {releases.map((r) => (
            <li
              key={r.version}
              style={{
                marginBottom: 36,
                paddingBottom: 36,
                borderBottom: '1px solid #F0F1F5',
              }}
            >
              <div style={{
                display: 'inline-flex', gap: 8, alignItems: 'center',
                marginBottom: 12, fontSize: 12, color: '#6B7280',
                fontFamily: 'var(--font-mono, ui-monospace)',
              }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 999,
                  background: '#F0F1F5', color: '#1A1A1A',
                  fontWeight: 600,
                }}>
                  v{r.version}
                </span>
                <span>{formatDate(r.date)}</span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display, system-ui)',
                fontSize: 22, fontWeight: 700, lineHeight: 1.25,
                letterSpacing: '-0.01em', marginBottom: 10,
              }}>
                {r.title}
              </h2>
              <p style={{
                fontSize: 15, lineHeight: 1.6, color: '#374151',
                marginBottom: r.changes.length > 0 ? 16 : 0,
              }}>
                {r.summary}
              </p>
              {r.changes.length > 0 && (
                <ul style={{
                  paddingLeft: 0, margin: 0, listStyle: 'none',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  fontSize: 14, lineHeight: 1.55, color: '#4B5563',
                }}>
                  {r.changes.map((c, i) => (
                    <li key={i} style={{ paddingLeft: 18, position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: 0, top: 8,
                        width: 6, height: 6, borderRadius: 999,
                        background: '#9CA3AF',
                      }} />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
