'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Tiny user-state pill that lives at the bottom of the Sidebar.
 *
 *   • Signed-out → «Войти / зарегистрироваться» button → /auth/login
 *   • Signed-in  → small chip with email + «Выйти» link
 *
 * The chip never blocks usage of the app — Bordik works fully signed-out;
 * sign-in only enables cross-device progress sync.
 */
export default function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabaseBrowserClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_evt, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!email) {
    return (
      <a
        href="/auth/login"
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', margin: '8px 12px',
          borderRadius: 12,
          background: '#1A1A1A',
          color: '#FFFFFF',
          textDecoration: 'none',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          transition: 'background 180ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#2B2B2B'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Войти
      </a>
    );
  }

  const signOut = async () => {
    const sb = getSupabaseBrowserClient();
    await sb.auth.signOut();
  };

  return (
    <div style={{
      margin: '8px 12px',
      padding: '10px 12px',
      borderRadius: 12,
      background: '#E2E4EA',
      display: 'flex', alignItems: 'center', gap: 10,
      minWidth: 0,
    }}>
      <span style={{
        width: 28, height: 28, flexShrink: 0,
        borderRadius: '50%',
        background: '#1A1A1A', color: '#FFFFFF',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
        textTransform: 'uppercase',
      }}>
        {email.charAt(0)}
      </span>
      <span style={{
        flex: 1, minWidth: 0,
        fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 500,
        color: '#1A1A1A',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {email}
      </span>
      <button
        onClick={signOut}
        title="Выйти"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#6B7280', flexShrink: 0,
          display: 'inline-flex', alignItems: 'center',
          padding: 4, borderRadius: 6,
          transition: 'color 150ms, background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#1A1A1A'; e.currentTarget.style.background = '#D1D4DA'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'transparent'; }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}
