'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

// useSearchParams() inside client component requires a Suspense boundary
// at the page level — Next 15 enforces this so prerender doesn't bail.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

/**
 * Login / sign-up screen.
 *
 * UX:
 *   - One unified form. Type email → click «Получить ссылку».
 *   - Supabase sends a magic link; clicking it lands on /auth/callback,
 *     which sets cookies and redirects home.
 *   - Optional Google OAuth — single button.
 *
 * Why magic-link over password:
 *   - No password reset flow to maintain.
 *   - No leaked-credentials risk.
 *   - Fits the «open, low-friction» tone of the app.
 */
function LoginInner() {
  const sp = useSearchParams();
  const initialError = sp.get('error');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(initialError);

  const sendLink = async () => {
    if (!email.trim()) return;
    setPhase('sending');
    setError(null);
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setError('Backend ещё не настроен (нет NEXT_PUBLIC_SUPABASE_* переменных).');
      setPhase('idle');
      return;
    }
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setPhase('idle');
      return;
    }
    setPhase('sent');
  };

  const signInWithGoogle = async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setError('Backend ещё не настроен.');
      return;
    }
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F1F5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '32px 28px',
        boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)',
      }}>
        <picture>
          <source srcSet="/logo-bordik.webp" type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-bordik.png" alt="Bordik" style={{ height: 28, marginBottom: 28 }} />
        </picture>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.01em',
        }}>
          Войти в Bordik
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
          marginBottom: 24, lineHeight: 1.5,
        }}>
          Введите email — мы пришлём одноразовую ссылку для входа. Пароль не нужен.
        </p>

        {phase === 'sent' ? (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #BBF7D0',
            borderRadius: 12,
            padding: '16px 18px',
            color: '#065F46',
          }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              Письмо отправлено
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.5 }}>
              Откройте письмо от Supabase на <strong>{email}</strong> и нажмите ссылку — вернётесь сюда уже залогиненным.
            </p>
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#F5F6F8',
                border: '1px solid transparent',
                borderRadius: 10,
                fontFamily: 'var(--font-body)', fontSize: 14, color: '#1A1A1A',
                outline: 'none',
                marginBottom: 12,
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') sendLink(); }}
            />

            <button
              onClick={sendLink}
              disabled={!email.trim() || phase === 'sending'}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 10,
                background: !email.trim() || phase === 'sending' ? '#9CA3AF' : '#3B82F6',
                color: '#FFFFFF',
                border: 'none',
                cursor: !email.trim() || phase === 'sending' ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                marginBottom: 12,
                transition: 'background 180ms',
              }}
            >
              {phase === 'sending' ? 'Отправляем…' : 'Получить ссылку'}
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              margin: '14px 0',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              <span style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
              или
              <span style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            </div>

            <button
              onClick={signInWithGoogle}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 10,
                background: '#FFFFFF',
                color: '#1A1A1A',
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'background 180ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <svg width={16} height={16} viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.331C2.438 15.983 5.482 18 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.331z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.892 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
              </svg>
              Войти через Google
            </button>

            {error && (
              <div style={{
                marginTop: 14,
                padding: '10px 14px',
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 10,
                color: '#B91C1C',
                fontSize: 12, lineHeight: 1.4,
              }}>
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
