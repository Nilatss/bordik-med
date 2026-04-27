'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TestStartConsentProps {
  testLabel: string;
  questionCount: number;
  timeMinutes: number;
  onAccept: () => void;
  onDecline: () => void;
}

/* ──────────────────────────────────────────────────────────────────
   MediaCheck — camera preview + microphone level meter inside the
   consent screen. The user MUST see both working before they can
   click "Начать тест". onReady reports the live state up to the
   parent so it can gate the start button alongside the consent
   checkbox.
   ────────────────────────────────────────────────────────────────── */
function MediaCheck({ onReady }: { onReady: (ok: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0..100
  const [hasAudioSignal, setHasAudioSignal] = useState(false);

  // Request permissions once
  useEffect(() => {
    let cancelled = false;
    let acquired: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: 'user' },
      audio: true,
    })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        acquired = s;
        setStream(s);
        onReady(true);
      })
      .catch((err) => {
        const msg =
          err?.name === 'NotAllowedError' ? 'Доступ к камере и микрофону запрещён.'
          : err?.name === 'NotFoundError' ? 'Камера или микрофон не обнаружены.'
          : 'Не удалось получить доступ к камере и микрофону.';
        setError(msg);
        onReady(false);
      });
    return () => {
      cancelled = true;
      acquired?.getTracks().forEach((t) => t.stop());
      onReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wire stream into preview
  useEffect(() => {
    if (!videoRef.current) return;
    if (stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => { /* autoplay may be blocked */ });
    } else {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Audio analyser → animate level meter
  useEffect(() => {
    if (!stream) return;
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx: AudioContext = new Ctx();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length;          // 0..255
      const pct = Math.min(100, (avg / 80) * 100); // visual scale: 80 ≈ talking
      setAudioLevel(pct);
      if (avg > 8) setHasAudioSignal(true);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      try { src.disconnect(); } catch {/* */}
      try { ctx.close(); } catch {/* */}
    };
  }, [stream]);

  if (error) {
    return (
      <div style={{
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 18,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
          stroke="#B91C1C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5,
          color: '#991B1B',
        }}>
          <strong style={{ fontWeight: 700 }}>{error}</strong>
          {' '}Разрешите доступ в настройках браузера и обновите страницу.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 12,
      padding: 14,
      marginBottom: 18,
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr)',
      columnGap: 14,
      alignItems: 'center',
      borderLeft: '3px solid #3B82F6',
    }}>
      {/* Video preview */}
      <div style={{
        position: 'relative',
        width: 132, height: 100,
        borderRadius: 10,
        background: '#0F172A',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* REC dot */}
        <span style={{
          position: 'absolute', top: 6, left: 6,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 6px', borderRadius: 999,
          background: 'rgba(0,0,0,0.55)', color: '#FFFFFF',
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
          letterSpacing: '0.06em',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: stream ? '#F87171' : '#94A3B8',
            animation: stream ? 'media-check-pulse 1.4s ease-in-out infinite' : undefined,
          }} />
          {stream ? 'LIVE' : 'OFF'}
        </span>
      </div>

      {/* Status + mic meter */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 8,
        }}>
          <StatusDot ok={!!stream} />
          Камера {stream ? 'работает' : 'отключена'}
          <span style={{ width: 8 }} />
          <StatusDot ok={hasAudioSignal} />
          Микрофон {hasAudioSignal ? 'слышит звук' : 'ждёт звук'}
        </div>
        {/* Audio meter */}
        <div style={{
          position: 'relative',
          height: 10, borderRadius: 999,
          background: '#F1F3F6', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, width: `${audioLevel}%`,
            background: audioLevel > 70
              ? 'linear-gradient(90deg, #10B981, #F59E0B 70%, #B91C1C)'
              : audioLevel > 30
                ? 'linear-gradient(90deg, #10B981, #34D399)'
                : '#34D399',
            borderRadius: 999,
            transition: 'width 60ms linear, background 200ms',
          }} />
        </div>
        <p style={{
          margin: '8px 0 0',
          fontFamily: 'var(--font-body)', fontSize: 12, color: '#6B7280',
          lineHeight: 1.5,
        }}>
          Скажите что-нибудь — должна загореться зелёная шкала. Проследите, что лицо хорошо видно в кадре.
        </p>
      </div>

      <style jsx global>{`
        @keyframes media-check-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: ok ? '#10B981' : '#D1D5DB',
      flexShrink: 0,
      boxShadow: ok ? '0 0 0 2px rgba(16,185,129,0.18)' : 'none',
    }} />
  );
}

/**
 * Consent / rules screen shown before every test attempt.
 *
 * Design: neutral callout style that matches the rest of the app. No red /
 * orange block-captions inside the rules cards — all section labels are
 * uppercase grey mono (like field labels elsewhere). The warning icon in
 * the header is also neutral grey — we've already told the user this is
 * a test, they don't need a yellow hazard sign.
 */
export default function TestStartConsent({
  testLabel, questionCount, timeMinutes, onAccept, onDecline,
}: TestStartConsentProps) {
  const [agreed, setAgreed] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const canStart = agreed && mediaReady;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
      style={{
        padding: '28px 32px',
        background: '#F5F6F8',
        borderRadius: 20,
      }}
    >
      {/* Label */}
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
        margin: '0 0 8px 0',
      }}>
        {testLabel}
      </p>

      {/* Title + neutral icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#FFFFFF', color: '#6B7280',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(16,24,40,0.06)',
        }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11" />
          </svg>
        </span>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: '#1A1A1A', margin: 0,
          letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Правила прохождения теста
        </h3>
      </div>

      {/* Live camera + microphone preview — proves the user's hardware
           works before they commit to starting the test. */}
      <MediaCheck onReady={setMediaReady} />

      {/* Camera + microphone requirement — first because it gates the test */}
      <div style={{
        background: '#FFFFFF', borderRadius: 12,
        padding: '18px 20px', marginBottom: 10,
        borderLeft: '3px solid #3B82F6',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
          color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em',
          margin: '0 0 10px 0',
        }}>
          Обязательно для прохождения
        </p>
        <ul style={{
          margin: 0, paddingLeft: 18,
          fontFamily: 'var(--font-body)', fontSize: 13.5,
          color: '#374151', lineHeight: 1.7,
        }}>
          <li>Включённая камера и микрофон на протяжении всего теста</li>
          <li>Освещённая комната и хорошо видимое лицо в кадре</li>
          <li>Тишина — посторонние голоса будут засчитаны как нарушение</li>
        </ul>
      </div>

      {/* Forbidden — neutral callout style */}
      <div style={{
        background: '#FFFFFF', borderRadius: 12,
        padding: '18px 20px', marginBottom: 10,
        borderLeft: '3px solid #D1D5DB',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          margin: '0 0 10px 0',
        }}>
          Во время теста запрещено
        </p>
        <ul style={{
          margin: 0, paddingLeft: 18,
          fontFamily: 'var(--font-body)', fontSize: 13.5,
          color: '#374151', lineHeight: 1.7,
        }}>
          <li>Переключаться на другие вкладки или окна</li>
          <li>Сворачивать браузер</li>
          <li>Открывать режим разработчика (F12)</li>
          <li>Копировать вопросы или ответы</li>
          <li>Закрывать камеру или говорить вслух</li>
        </ul>
      </div>

      {/* Consequences — same neutral treatment */}
      <div style={{
        background: '#FFFFFF', borderRadius: 12,
        padding: '18px 20px', marginBottom: 18,
        borderLeft: '3px solid #D1D5DB',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          margin: '0 0 10px 0',
        }}>
          При нарушении
        </p>
        <ul style={{
          margin: 0, paddingLeft: 18,
          fontFamily: 'var(--font-body)', fontSize: 13.5,
          color: '#374151', lineHeight: 1.7,
        }}>
          <li>Даётся 10 секунд, чтобы вернуться в окно теста</li>
          <li>1-е и 2-е нарушения - предупреждение</li>
          <li>3-е нарушение - тест завершается, попытка не засчитывается</li>
          <li>Повторная попытка будет доступна только через 48 часов</li>
        </ul>
      </div>

      {/* Test params — chip pills in the muted-neutral palette */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 18,
      }}>
        <div style={{
          flex: 1, padding: '12px 16px',
          background: '#FFFFFF', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#F5F6F8', color: '#6B7280',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11" />
            </svg>
          </span>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Вопросов</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{questionCount}</p>
          </div>
        </div>
        <div style={{
          flex: 1, padding: '12px 16px',
          background: '#FFFFFF', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#F5F6F8', color: '#6B7280',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
            </svg>
          </span>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Время</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{timeMinutes} мин</p>
          </div>
        </div>
      </div>

      {/* Consent — matches the checkbox look used elsewhere in the app
          (square with black tick on check, white 1px shadow idle). */}
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px',
        background: '#FFFFFF',
        borderRadius: 12,
        cursor: 'pointer',
        marginBottom: 18,
        transition: 'background 180ms',
      }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          width: 20, height: 20, borderRadius: 6,
          background: agreed ? '#1A1A1A' : '#F5F6F8',
          boxShadow: agreed ? 'none' : '0 0 0 1px #E2E4EA inset',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 1,
          transition: 'background 150ms, box-shadow 150ms',
        }}>
          {agreed && (
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
              stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          )}
        </span>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
          color: '#1A1A1A', lineHeight: 1.5,
        }}>
          Я прочитал правила, согласен с ними и понимаю последствия нарушений.
        </span>
      </label>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={onDecline}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: 'transparent', color: '#6B7280',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            transition: 'color 180ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#1A1A1A'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
        >
          Отмена
        </button>
        <button
          onClick={onAccept}
          disabled={!canStart}
          title={
            !mediaReady ? 'Дождитесь, пока камера и микрофон будут готовы'
            : !agreed   ? 'Сначала примите правила'
            : undefined
          }
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 10,
            background: canStart ? '#1A1A1A' : '#E2E4EA',
            color: canStart ? '#FFFFFF' : '#9CA3AF',
            border: 'none',
            cursor: canStart ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            transition: 'background 180ms',
          }}
          onMouseEnter={(e) => { if (canStart) e.currentTarget.style.background = '#000000'; }}
          onMouseLeave={(e) => { if (canStart) e.currentTarget.style.background = '#1A1A1A'; }}
        >
          Начать тест
          {canStart && (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12,5 19,12 12,19" />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );
}
