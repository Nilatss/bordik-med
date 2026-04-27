'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { getFaceLandmarker } from '@/lib/proctoring/face';

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
// Mirror the thresholds used by Proctoring at runtime so the consent meter
// shows the SAME natural / warning / violation bands the user will see
// during the test itself.
const MEDIA_CHECK_NATURAL_MAX_AMP = 50;
const MEDIA_CHECK_WARNING_AMP     = 65;
const MEDIA_CHECK_VIOLATION_AMP   = 90;
const MEDIA_CHECK_METER_MAX       = 110; // amp value that fills the meter

function ampToDb(amp: number): number {
  if (amp <= 0) return -100;
  return Math.round(20 * Math.log10(amp / 255));
}

function MediaCheck({ onReady }: { onReady: (ok: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioAmp, setAudioAmp] = useState(0);
  const [hasAudioSignal, setHasAudioSignal] = useState(false);
  const [cameraQuality, setCameraQuality] = useState<{
    bright: number;
    sharpness: number;
    ok: boolean;
    reason: string | null;
  } | null>(null);
  // Pre-test environment hints — informational, don't block start unless
  // explicitly fatal (remote desktop). Each has a `severity` so the UI
  // can colour them accordingly.
  const [hints, setHints] = useState<Array<{ id: string; level: 'warn' | 'block'; text: string }>>([]);
  // Pre-load the MediaPipe Face Landmarker model in the background while
  // the user reads the rules — by the time they click Начать тест the
  // model is cached, so detection starts the moment the test opens.
  const [aiModelStatus, setAiModelStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Warm up the face-landmarker model — loads the 3 MB MediaPipe assets
  // from CDN so the test page doesn't have to wait for them.
  useEffect(() => {
    let cancelled = false;
    getFaceLandmarker()
      .then(() => { if (!cancelled) setAiModelStatus('ready'); })
      .catch(() => { if (!cancelled) setAiModelStatus('error'); });
    return () => { cancelled = true; };
  }, []);

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
        // Don't report ready yet — wait for the camera-quality + mic-signal
        // checks below to confirm the room is usable.
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

  // Camera quality monitor — measures brightness + sharpness of the frame.
  // Sharpness is approximated via an edge-magnitude sum (Sobel-style on the
  // luminance channel) — blurry frames have a much lower edge total.
  useEffect(() => {
    if (!stream || !videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 96; canvas.height = 72;
    const g = canvas.getContext('2d');
    if (!g) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && v.readyState >= 2) {
        try {
          g.drawImage(v, 0, 0, canvas.width, canvas.height);
          const w = canvas.width, h = canvas.height;
          const data = g.getImageData(0, 0, w, h).data;
          // Build luminance grid
          const lum = new Float32Array(w * h);
          let sum = 0;
          for (let i = 0, p = 0; i < data.length; i += 4, p++) {
            const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            lum[p] = y;
            sum += y;
          }
          const bright = sum / lum.length; // 0..255
          // Edge magnitude (simplified: |∂x| + |∂y|)
          let edges = 0; let n = 0;
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const c = lum[y * w + x];
              const dx = Math.abs(c - lum[y * w + (x + 1)]);
              const dy = Math.abs(c - lum[(y + 1) * w + x]);
              edges += dx + dy;
              n++;
            }
          }
          const sharpness = edges / n; // higher = sharper
          let ok = true;
          let reason: string | null = null;
          if (bright < 35) {
            ok = false; reason = 'Слишком темно — включите свет.';
          } else if (bright > 235) {
            ok = false; reason = 'Засветка кадра — отойдите от лампы или окна.';
          } else if (sharpness < 4) {
            ok = false; reason = 'Изображение размыто — протрите камеру и наведите фокус.';
          }
          setCameraQuality({ bright, sharpness, ok, reason });
        } catch { /* ignore */ }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stream]);

  // Environment hints — earphones / remote desktop / virtual machine.
  // Run once after stream is acquired (so labels are populated).
  useEffect(() => {
    if (!stream) return;
    const collected: typeof hints = [];

    // 1. Headphones / earbuds detection via device labels
    navigator.mediaDevices.enumerateDevices().then((devs) => {
      const labels = devs
        .filter((d) => d.kind === 'audiooutput' || d.kind === 'audioinput')
        .map((d) => d.label.toLowerCase());
      const earpieceTokens = [
        'airpods', 'earbuds', 'наушник', 'headset', 'headphone', 'наушники', 'gear iconx',
        'powerbeats', 'beats', 'galaxy buds', 'pixel buds', 'wf-', 'wh-', 'jabra',
      ];
      const found = labels.find((l) => earpieceTokens.some((t) => l.includes(t)));
      if (found) {
        collected.push({
          id: 'earphones',
          level: 'warn',
          text: `Похоже, к компьютеру подключены наушники (${found}). Снимите их перед началом — наушники во время теста запрещены.`,
        });
      }
      finalise();
    }).catch(finalise);

    // 2. WebGL renderer fingerprint — flags virtual GPUs typical of RDP/VM
    try {
      const c = document.createElement('canvas');
      const gl = (c.getContext('webgl') ?? c.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)).toLowerCase() : '';
        const blockedTokens = ['vmware', 'virtualbox', 'parallels', 'swiftshader', 'llvmpipe', 'remote', 'rdp'];
        if (blockedTokens.some((t) => renderer.includes(t))) {
          collected.push({
            id: 'rdp',
            level: 'block',
            text: 'Похоже, тест запущен в виртуальной машине, через удалённый рабочий стол или с программным рендерингом. Это запрещено.',
          });
        }
      }
    } catch {/* ignore */}

    // 3. Pointer/touch + battery sanity — RDP-type sessions usually have
    //    no battery and inconsistent screen dimensions.
    try {
      const sw = window.screen?.width || 0;
      const ww = window.innerWidth || 0;
      // RDP sessions sometimes report HUGE screen-vs-window mismatch
      if (sw > 0 && ww > 0 && sw / ww > 4) {
        collected.push({
          id: 'screen-mismatch',
          level: 'warn',
          text: 'Размер экрана и окна сильно расходятся — возможно, идёт удалённое подключение или дублирование экрана.',
        });
      }
    } catch {/* */}

    function finalise() {
      setHints(collected);
    }
  }, [stream]);

  // Surface AI-model failure as a blocker
  useEffect(() => {
    if (aiModelStatus !== 'error') return;
    setHints((prev) => {
      if (prev.some((h) => h.id === 'ai-failed')) return prev;
      return [
        ...prev,
        {
          id: 'ai-failed',
          level: 'block',
          text: 'Не удалось загрузить AI-модель прокторинга. Проверьте интернет и попробуйте снова — без неё тест начать нельзя.',
        },
      ];
    });
  }, [aiModelStatus]);

  // Combine quality + signal + env hints + AI model into final ready flag
  useEffect(() => {
    const blocked = hints.some((h) => h.level === 'block');
    const ok =
      !!stream && !!cameraQuality?.ok && hasAudioSignal &&
      !blocked && aiModelStatus === 'ready';
    onReady(ok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, cameraQuality?.ok, hasAudioSignal, hints, aiModelStatus]);

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
      setAudioAmp(avg);
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
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 8,
        }}>
          <StatusDot ok={!!stream && !!cameraQuality?.ok} />
          Камера {stream ? (cameraQuality?.ok ? 'готова' : 'не годится') : 'отключена'}
          <span style={{ width: 8 }} />
          <StatusDot ok={hasAudioSignal} />
          Микрофон {hasAudioSignal ? 'слышит звук' : 'ждёт звук'}
          <span style={{ width: 8 }} />
          <StatusDot ok={aiModelStatus === 'ready'} />
          AI {
            aiModelStatus === 'ready' ? 'готов' :
            aiModelStatus === 'error' ? 'ошибка' : 'грузится'
          }
        </div>
        {/* Audio meter — fill width is the live amplitude; coloured zones
             behind it mark the natural / warning / violation bands. */}
        <div>
          <div style={{
            position: 'relative',
            height: 12, borderRadius: 999,
            background: '#F1F3F6', overflow: 'hidden',
          }}>
            {/* Background zones */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(90deg,
                rgba(16,185,129,0.18) 0%,
                rgba(16,185,129,0.18) ${(MEDIA_CHECK_NATURAL_MAX_AMP / MEDIA_CHECK_METER_MAX) * 100}%,
                rgba(245,158,11,0.20) ${(MEDIA_CHECK_NATURAL_MAX_AMP / MEDIA_CHECK_METER_MAX) * 100}%,
                rgba(245,158,11,0.20) ${(MEDIA_CHECK_VIOLATION_AMP / MEDIA_CHECK_METER_MAX) * 100}%,
                rgba(220,38,38,0.22) ${(MEDIA_CHECK_VIOLATION_AMP / MEDIA_CHECK_METER_MAX) * 100}%,
                rgba(220,38,38,0.22) 100%)`,
            }} />
            {/* Live fill */}
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: `${Math.min(100, (audioAmp / MEDIA_CHECK_METER_MAX) * 100)}%`,
              background: audioAmp >= MEDIA_CHECK_VIOLATION_AMP
                ? '#DC2626'
                : audioAmp >= MEDIA_CHECK_WARNING_AMP
                  ? '#F59E0B'
                  : '#10B981',
              borderRadius: 999,
              transition: 'width 60ms linear, background 200ms',
            }} />
            {/* Threshold ticks */}
            <ThresholdTick pct={(MEDIA_CHECK_NATURAL_MAX_AMP / MEDIA_CHECK_METER_MAX) * 100} />
            <ThresholdTick pct={(MEDIA_CHECK_VIOLATION_AMP / MEDIA_CHECK_METER_MAX) * 100} />
          </div>
          {/* Threshold + live readouts */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginTop: 6,
            fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF',
            letterSpacing: '0.03em',
          }}>
            <span><strong style={{ color: '#10B981' }}>норма</strong> ≤ {ampToDb(MEDIA_CHECK_NATURAL_MAX_AMP)} dB</span>
            <span><strong style={{ color: '#F59E0B' }}>предупр.</strong> {ampToDb(MEDIA_CHECK_NATURAL_MAX_AMP)}…{ampToDb(MEDIA_CHECK_VIOLATION_AMP)} dB</span>
            <span><strong style={{ color: '#DC2626' }}>наруш.</strong> {`>`} {ampToDb(MEDIA_CHECK_VIOLATION_AMP)} dB</span>
          </div>
          {/* Live measurement */}
          <p style={{
            margin: '8px 0 0',
            fontFamily: 'var(--font-body)', fontSize: 12, color: '#6B7280',
            lineHeight: 1.5,
          }}>
            Сейчас:{' '}
            <strong style={{
              fontFamily: 'var(--font-mono)',
              color: audioAmp >= MEDIA_CHECK_VIOLATION_AMP ? '#B91C1C'
                : audioAmp >= MEDIA_CHECK_WARNING_AMP ? '#B45309'
                : '#047857',
            }}>
              {ampToDb(audioAmp)} dB
            </strong>
            {' · '}
            Скажите что-нибудь, чтобы убедиться, что микрофон ловит звук. Проследите, что лицо хорошо видно в кадре.
          </p>
        </div>
        {/* Per-issue hint when camera quality blocks the start */}
        {stream && cameraQuality && !cameraQuality.ok && cameraQuality.reason && (
          <p style={{
            margin: '8px 0 0',
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
            color: '#B91C1C', lineHeight: 1.5,
          }}>
            {cameraQuality.reason}
          </p>
        )}
        {/* Environment hints (earphones / RDP / VM / screen mismatch). */}
        {hints.length > 0 && (
          <ul style={{
            margin: '10px 0 0', padding: 0,
            listStyle: 'none',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {hints.map((h) => (
              <li key={h.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '8px 10px', borderRadius: 8,
                background: h.level === 'block' ? '#FEF2F2' : '#FFFBEB',
                border: `1px solid ${h.level === 'block' ? '#FECACA' : '#FCD34D'}`,
                fontFamily: 'var(--font-body)', fontSize: 12,
                color: h.level === 'block' ? '#991B1B' : '#92400E',
                lineHeight: 1.5,
              }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>{h.text}</span>
              </li>
            ))}
          </ul>
        )}
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

/* ──────────────────────────────────────────────────────────────────
   RulesAccordion — full proctoring catalogue split by severity:
     • Soft warning  (yellow)
     • Violation     (orange — counts toward 3-strike lockout)
     • Instant end   (red — test terminates on first occurrence)
   Each rule lists the trigger, the threshold, and what happens.
   ────────────────────────────────────────────────────────────────── */
type Severity = 'warn' | 'violation' | 'instant';
interface Rule {
  title: string;
  detail?: string;
}
const WARN_RULES: Rule[] = [
  { title: 'Полная тишина с микрофона', detail: 'Если микрофон не ловит ни звука дольше 15 секунд — возможно, он выключен в системе или вы в шумоизолирующих наушниках.' },
  { title: 'Громкий звук', detail: `Уровень от ${ampToDb(MEDIA_CHECK_NATURAL_MAX_AMP)} до ${ampToDb(MEDIA_CHECK_VIOLATION_AMP)} dB удерживается 1.5 сек — например, разговор рядом или включённая музыка.` },
  { title: 'Лицо пропало из кадра', detail: 'Не видно лица дольше 3 секунд — отвернулись, ушли, наклонили камеру.' },
  { title: 'Движение губ (1-е срабатывание)', detail: 'Камера зафиксировала, что вы что-то проговариваете. Следующее срабатывание — нарушение.' },
  { title: 'Размер экрана и окна не сходятся', detail: 'Возможно, идёт зеркалирование экрана или удалённое подключение.' },
];
const VIOLATION_RULES: Rule[] = [
  { title: 'Очень громкий звук', detail: `Уровень выше ${ampToDb(MEDIA_CHECK_VIOLATION_AMP)} dB удерживается 1.5 сек — крик, разговор в полный голос или громкая музыка.` },
  { title: 'Камера закрыта', detail: 'Тёмный кадр (закрытая или направленная вниз камера) дольше 2 секунд.' },
  { title: 'Несколько лиц в кадре', detail: 'В кадр попал второй человек — рядом стоит подсказчик или зашли посторонние.' },
  { title: 'Повторное движение губ', detail: 'Второе и последующие срабатывания после первого предупреждения.' },
  { title: 'Переключение вкладки или окна', detail: 'Свернули браузер, переключились на Telegram, новую вкладку, второй монитор.' },
  { title: 'Потеря фокуса окна (Alt+Tab)', detail: 'Окно теста перестало быть активным.' },
  { title: 'Открытие DevTools', detail: 'F12, Ctrl+Shift+I / J / C, контекстное меню «Просмотр кода».' },
  { title: 'Копирование / вставка', detail: 'Ctrl+C, Ctrl+A, Ctrl+V — попытка вытащить вопросы или вставить готовый ответ.' },
  { title: 'Скриншот / печать', detail: 'PrintScreen, Ctrl+P, инструменты захвата экрана.' },
  { title: '3 нарушения подряд', detail: 'После третьего нарушения тест завершается принудительно, попытка не засчитывается.' },
];
const INSTANT_RULES: Rule[] = [
  { title: 'Камера резко потеряла фокус', detail: 'Изображение стало мутным дольше 1.5 сек (камеру задели, накрыли тканью, навели на стену).' },
  { title: 'Камера или микрофон отключены пользователем', detail: 'Закрыли крышку камеры, выдернули USB, вышли в системные настройки и сняли разрешение.' },
  { title: 'Запуск из удалённой сессии или виртуальной машины', detail: 'WebGL-рендерер показывает VirtualBox / VMware / Parallels / RDP / SwiftShader / llvmpipe — система не даст начать.' },
  { title: 'Прерывание теста кнопкой', detail: 'Если вы сами нажали «Прервать» — тест блокируется на 12 часов.' },
];

const SEVERITY_META: Record<Severity, { color: string; bg: string; border: string; label: string; title: string; subtitle: string }> = {
  warn: {
    color: '#92400E', bg: '#FFFBEB', border: '#FCD34D',
    label: 'Предупреждение', title: 'Предупреждения',
    subtitle: 'Не штрафуют — система просто покажет жёлтый баннер. После него поведение надо исправить.',
  },
  violation: {
    color: '#9A3412', bg: '#FFF7ED', border: '#FDBA74',
    label: 'Нарушение', title: 'Нарушения',
    subtitle: 'Считаются как «strikes». 1-е и 2-е — предупреждение, 3-е — принудительное завершение и блокировка теста на 24 часа.',
  },
  instant: {
    color: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5',
    label: 'Мгновенно', title: 'Мгновенное завершение',
    subtitle: 'Тест закрывается с первого срабатывания, попытка засчитывается как провал, повтор недоступен 48 часов.',
  },
};

function RuleSection({ severity, rules }: { severity: Severity; rules: Rule[] }) {
  const m = SEVERITY_META[severity];
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 14,
      padding: '18px 20px', marginBottom: 12,
      border: `1px solid ${m.border}`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 10,
        marginBottom: 4, flexWrap: 'wrap',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '3px 10px', borderRadius: 999,
          background: m.bg, color: m.color,
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {m.label}
        </span>
        <h4 style={{
          margin: 0, fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
          color: '#1A1A1A', letterSpacing: '-0.01em',
        }}>
          {m.title}
        </h4>
      </div>
      <p style={{
        margin: '0 0 12px 0',
        fontFamily: 'var(--font-body)', fontSize: 12.5, color: '#6B7280',
        lineHeight: 1.55,
      }}>
        {m.subtitle}
      </p>
      <ul style={{
        margin: 0, padding: 0, listStyle: 'none',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {rules.map((r, i) => (
          <li key={i} style={{
            display: 'flex', gap: 10,
            paddingTop: 10,
            borderTop: i === 0 ? 'none' : '1px solid #F0F1F5',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: m.color, flexShrink: 0, marginTop: 8,
            }} />
            <div style={{ minWidth: 0 }}>
              <p style={{
                margin: 0,
                fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600,
                color: '#1A1A1A', lineHeight: 1.45,
              }}>
                {r.title}
              </p>
              {r.detail && (
                <p style={{
                  margin: '2px 0 0',
                  fontFamily: 'var(--font-body)', fontSize: 12.5, color: '#6B7280',
                  lineHeight: 1.55,
                }}>
                  {r.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RulesAccordion() {
  return (
    <div style={{ marginBottom: 8 }}>
      {/* Section heading */}
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
        margin: '6px 0 8px 0',
      }}>
        Что отслеживает прокторинг
      </p>
      <RuleSection severity="warn" rules={WARN_RULES} />
      <RuleSection severity="violation" rules={VIOLATION_RULES} />
      <RuleSection severity="instant" rules={INSTANT_RULES} />
    </div>
  );
}

function ThresholdTick({ pct }: { pct: number }) {
  return (
    <span
      style={{
        position: 'absolute', top: -2, bottom: -2,
        left: `${pct}%`,
        width: 1.5, background: 'rgba(15, 23, 42, 0.42)',
        borderRadius: 1,
      }}
    />
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

      <RulesAccordion />

      {/* Pre-flight requirements card */}
      <div style={{
        background: '#FFFFFF', borderRadius: 12,
        padding: '18px 20px', marginBottom: 18,
        borderLeft: '3px solid #3B82F6',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
          color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em',
          margin: '0 0 10px 0',
        }}>
          Перед стартом проверьте
        </p>
        <ul style={{
          margin: 0, paddingLeft: 18,
          fontFamily: 'var(--font-body)', fontSize: 13.5,
          color: '#374151', lineHeight: 1.7,
        }}>
          <li>Камера и микрофон включены, лицо хорошо освещено</li>
          <li>Никаких наушников, гарнитур, earbuds в ушах</li>
          <li>Тест не запущен из удалённого рабочего стола или виртуальной машины</li>
          <li>Стол свободен от телефона, листов с конспектами и второго монитора</li>
          <li>Дверь закрыта, рядом нет людей — никто не появится в кадре</li>
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
