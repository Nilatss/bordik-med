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
    if (!sb) { setLoading(false); return; }
    sb.auth.getUser()
      .then(({ data: { user } }) => {
        setEmail(user?.email ?? null);
        setLoading(false);
      })
      .catch(() => {
        // Network error or auth service unavailable — settle to signed-out
        // state so `loading` never stays `true` and the sidebar renders.
        setLoading(false);
      });
    const { data: sub } = sb.auth.onAuthStateChange((_evt, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return null;
  // Backend not configured → don't render the user menu at all.
  if (!getSupabaseBrowserClient()) return null;

  if (!email) {
    return (
      <a
        href="/auth/login"
        className="flex items-center gap-2.5 py-2.5 px-3.5 my-2 mx-3 rounded-[12px] bg-[#1A1A1A] hover:bg-[#2B2B2B] text-white no-underline font-[var(--font-body)] text-[13px] font-semibold transition-colors duration-[180ms]"
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
    // Use the project-wide fullLogout helper so signing out also clears
    // localStorage / IndexedDB / Cache Storage / Service Worker. Critical
    // for shared/clinical devices where the next user must not see prior
    // session data. See lib/full-logout.ts for the full sequence.
    try {
      const { fullLogout } = await import('@/lib/full-logout');
      await fullLogout();
    } catch {
      // Chunk load failure or unexpected error: the full cleanup sequence
      // didn't run, so do a minimal best-effort clear with the already-loaded
      // Supabase client before navigating away. Without this the session
      // cookie and localStorage stay intact and the next page load re-auths
      // the same user — the logout appears to work but doesn't.
      try {
        const sb = getSupabaseBrowserClient();
        if (sb) await sb.auth.signOut({ scope: 'global' });
        localStorage.clear();
        sessionStorage.clear();
      } catch { /* best effort — network may be down */ }
      location.replace('/');
    }
  };

  return (
    <div className="my-2 mx-3 py-2.5 px-3 rounded-[12px] bg-[#E2E4EA] flex items-center gap-2.5 min-w-0">
      <span className="w-7 h-7 shrink-0 rounded-full bg-[#1A1A1A] text-white inline-flex items-center justify-center font-[var(--font-display)] text-xs font-bold uppercase">
        {email.charAt(0)}
      </span>
      <span className="flex-1 min-w-0 font-[var(--font-body)] text-[12.5px] font-medium text-[#1A1A1A] overflow-hidden text-ellipsis whitespace-nowrap">
        {email}
      </span>
      <button
        onClick={signOut}
        title="Выйти"
        className="bg-transparent hover:bg-[#D1D4DA] border-none cursor-pointer text-[#6B7280] hover:text-[#1A1A1A] shrink-0 inline-flex items-center p-1 rounded-md transition-[color,background] duration-150"
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
