import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// P3-SEC — noindex: /admin не должен индексироваться поисковиками.
// Defense-in-depth (auth-gate уже скрывает контент, но если кто-то
// откроет админ-URL без сессии — Google не должен запоминать).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Admin layout - server-side auth guard.
 *
 * Two checks:
 *   1. User must be signed in (Supabase session exists).
 *   2. User's JWT must carry `app_metadata.editor_role` of
 *      'med_editor' / 'med_reviewer' / 'auditor'.
 *
 * The role is set server-side via the service-role key (see
 * supabase/README.md). Without the role we 404-redirect to keep the
 * route invisible from the public surface.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const sb = await getSupabaseServerClient();
  if (!sb) {
    return (
      <main style={{ padding: 40, fontFamily: 'var(--font-body)' }}>
        <h1>Backend not configured</h1>
        <p>Supabase env vars are missing. Apply the migration first.</p>
      </main>
    );
  }

  let user;
  try {
    const { data, error } = await sb.auth.getUser();
    if (error) redirect('/auth/login?next=/admin');
    user = data.user;
  } catch {
    redirect('/auth/login?next=/admin');
  }
  if (!user) redirect('/auth/login?next=/admin');

  // app_metadata can only be set via service-role key, so it's safe to
  // trust here (unlike user_metadata which the user can self-update).
  const role = (user.app_metadata?.editor_role as string | undefined) ?? '';
  const allowed = ['med_editor', 'med_reviewer', 'auditor'].includes(role);
  if (!allowed) {
    return (
      <main style={{
        padding: 40, fontFamily: 'var(--font-body)', maxWidth: 600, margin: '40px auto',
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)' }}>Доступ закрыт</h1>
        <p style={{ color: '#6B7280', lineHeight: 1.6, marginTop: 12 }}>
          Этот раздел доступен только редакторам медицинского контента.
          Если вы должны иметь доступ - попросите администратора назначить
          вам роль <code>med_editor</code>, <code>med_reviewer</code> или
          <code>auditor</code> в <code>app_metadata</code>.
        </p>
        <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 16 }}>
          Текущий пользователь: {user.email ?? user.id}
        </p>
      </main>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#F8FAFC',
      fontFamily: 'var(--font-body)',
    }}>
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{
            margin: 0, fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
            color: '#1A1A1A',
          }}>
            Admin · IronMed Editor
          </h1>
          <p style={{
            margin: 0, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9CA3AF',
            letterSpacing: '0.04em',
          }}>
            Роль: {role} · {user.email}
          </p>
        </div>
        <nav style={{ display: 'flex', gap: 18, fontSize: 13 }}>
          <a href="/admin" style={{ color: '#1A1A1A', textDecoration: 'none', fontWeight: 600 }}>Tools</a>
          <a href="/admin/audit" style={{ color: '#6B7280', textDecoration: 'none' }}>Аудит</a>
          <a href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>← На сайт</a>
        </nav>
      </header>
      <div style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}
