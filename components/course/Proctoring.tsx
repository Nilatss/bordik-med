'use client';

/**
 * Camera + microphone proctoring overlay used during a test attempt.
 *
 * Responsibilities:
 *   1. Hard-gate the test on camera / microphone access — without
 *      permissions the test cannot start.
 *   2. Render a small live preview of the camera in the corner so the
 *      user knows monitoring is active.
 *   3. Watch for "странные действия" and call onViolation:
 *        • microphone level above the talking threshold → user is
 *          speaking aloud or there's noise in the room
 *        • camera frame brightness drops to near-black → camera is
 *          covered or pointed at a dark surface
 *        • video track ends unexpectedly (user stops sharing)
 */

import { useEffect, useRef, useState } from 'react';

interface ProctoringProps {
  /** Called whenever a suspicious action is detected. Same callback the
   *  rest of TestGuard uses so violations accumulate together. The
   *  argument is the reason for logging — parent can ignore it. */
  onViolation: (reason?: string) => void;
  /** Active state — when false, the overlay does nothing (stream stays
   *  released). The parent component disables monitoring when the test
   *  finishes / aborts. */
  active: boolean;
  /** Set by the parent to learn whether permissions were granted. The
   *  test overlay won't render its content until this returns true. */
  onReadyChange?: (ready: boolean) => void;
}

const AUDIO_VIOLATION_THRESHOLD = 38;   // 0–255 average frequency amplitude
const AUDIO_VIOLATION_HOLD_MS   = 1500; // must be loud for this long
const AUDIO_RESET_MS            = 12000; // cool-down between audio violations
const FRAME_DARK_THRESHOLD      = 18;   // 0–255 average brightness
const FRAME_DARK_HOLD_MS        = 2000;
const FRAME_RESET_MS            = 15000;

export default function Proctoring({ onViolation, active, onReadyChange }: ProctoringProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ── Acquire stream once, release on unmount or when `active` flips off
  useEffect(() => {
    if (!active) return;
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
        onReadyChange?.(true);
      })
      .catch((err) => {
        const msg =
          err?.name === 'NotAllowedError' ? 'Доступ к камере и микрофону запрещён.'
          : err?.name === 'NotFoundError' ? 'Камера или микрофон не обнаружены.'
          : 'Не удалось получить доступ к камере и микрофону.';
        setError(msg);
        onReadyChange?.(false);
      });
    return () => {
      cancelled = true;
      acquired?.getTracks().forEach((t) => t.stop());
      onReadyChange?.(false);
    };
    // onReadyChange intentionally omitted to keep effect stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // ── Pipe the stream into the <video> element
  useEffect(() => {
    if (!videoRef.current) return;
    if (stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => { /* autoplay may be blocked, ignore */ });
    } else {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // ── Audio level monitor
  useEffect(() => {
    if (!stream || !active) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx: AudioContext = new Ctx();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let lastTriggered = 0;
    let loudSince = 0;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length;
      const now = performance.now();
      if (avg > AUDIO_VIOLATION_THRESHOLD) {
        if (loudSince === 0) loudSince = now;
        else if (
          now - loudSince > AUDIO_VIOLATION_HOLD_MS &&
          now - lastTriggered > AUDIO_RESET_MS
        ) {
          lastTriggered = now;
          loudSince = 0;
          onViolation('audio');
        }
      } else {
        loudSince = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      try { src.disconnect(); } catch {/* */}
      try { ctx.close(); } catch {/* */}
    };
  }, [stream, active, onViolation]);

  // ── Camera frame brightness monitor (covered camera detection)
  useEffect(() => {
    if (!stream || !videoRef.current || !active) return;
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 48;
    const g = canvas.getContext('2d');
    if (!g) return;
    let lastTriggered = 0;
    let darkSince = 0;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && v.readyState >= 2) {
        try {
          g.drawImage(v, 0, 0, canvas.width, canvas.height);
          const px = g.getImageData(0, 0, canvas.width, canvas.height).data;
          let sum = 0;
          for (let i = 0; i < px.length; i += 4) {
            sum += (px[i] + px[i + 1] + px[i + 2]) / 3;
          }
          const avg = sum / (px.length / 4);
          const now = performance.now();
          if (avg < FRAME_DARK_THRESHOLD) {
            if (darkSince === 0) darkSince = now;
            else if (
              now - darkSince > FRAME_DARK_HOLD_MS &&
              now - lastTriggered > FRAME_RESET_MS
            ) {
              lastTriggered = now;
              darkSince = 0;
              onViolation('camera-covered');
            }
          } else {
            darkSince = 0;
          }
        } catch { /* CORS or readback failure — ignore */ }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stream, active, onViolation]);

  // ── Track-ended monitor (user revoked access mid-test)
  useEffect(() => {
    if (!stream || !active) return;
    const tracks = stream.getTracks();
    const handleEnded = () => {
      onViolation('media-stopped');
      setError('Доступ к камере или микрофону прекращён. Тест завершается.');
    };
    tracks.forEach((t) => t.addEventListener('ended', handleEnded));
    return () => tracks.forEach((t) => t.removeEventListener('ended', handleEnded));
  }, [stream, active, onViolation]);

  if (error) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)',
        padding: 20,
      }}>
        <div style={{
          maxWidth: 440, width: '100%',
          background: '#FFFFFF', borderRadius: 18,
          padding: '28px 28px 24px', textAlign: 'center',
          boxShadow: '0 24px 48px rgba(15,23,42,0.24)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 14,
            background: '#FEF2F2', color: '#B91C1C', marginBottom: 14,
          }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
            color: '#1A1A1A', margin: '0 0 8px 0', letterSpacing: '-0.01em',
          }}>
            Доступ к камере и микрофону обязателен
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13.5, color: '#6B7280',
            lineHeight: 1.55, margin: '0 0 20px 0',
          }}>
            {error}{' '}Разрешите доступ в настройках браузера и попробуйте начать тест ещё раз.
          </p>
          <button
            onClick={() => {
              setError(null);
              setStream(null);
              // Trigger re-acquisition by toggling active via parent re-render —
              // here we just reload as the simplest cross-browser approach.
              window.location.reload();
            }}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: '#3B82F6', color: '#FFFFFF',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FFFFFF',
      }}>
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-body)', fontSize: 14,
          color: '#6B7280', lineHeight: 1.6,
        }}>
          <div style={{
            width: 36, height: 36, margin: '0 auto 12px',
            border: '3px solid #E2E4EA', borderTopColor: '#3B82F6',
            borderRadius: '50%', animation: 'spin 0.9s linear infinite',
          }} />
          <p>Запрашиваем доступ к камере и микрофону…</p>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>
            Разрешите доступ в подсказке браузера, чтобы начать тест.
          </p>
        </div>
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        style={{
          position: 'fixed',
          right: 16, bottom: 16,
          width: 'clamp(120px, 18vw, 180px)',
          aspectRatio: '4 / 3',
          borderRadius: 12,
          background: '#000000',
          objectFit: 'cover',
          zIndex: 60,
          boxShadow: '0 12px 32px rgba(15,23,42,0.18), 0 0 0 1px rgba(255,255,255,0.6)',
        }}
      />
      {/* "REC" badge so the user is reminded monitoring is live */}
      <div style={{
        position: 'fixed',
        right: 24, bottom: 'calc(clamp(120px, 18vw, 180px) * 0.75 + 24px)',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 999,
        background: '#1A1A1A', color: '#FFFFFF',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        zIndex: 61,
        boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: '#F87171',
          animation: 'pulse 1.4s ease-in-out infinite',
        }} />
        REC
      </div>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
      `}</style>
    </>
  );
}
