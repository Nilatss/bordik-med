'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFaceLandmarker } from '@/lib/proctoring/face';
import { getObjectDetector, findForbiddenObjects } from '@/lib/proctoring/objects';
import { log } from '@/lib/log';

interface TestStartConsentProps {
  testLabel: string;
  questionCount: number;
  timeMinutes: number;
  onAccept: () => void;
  onDecline: () => void;
}

/* ──────────────────────────────────────────────────────────────────
   MediaCheck - camera preview + microphone level meter inside the
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

function MediaCheck({ onReady, onCalibrated }: {
  onReady: (ok: boolean) => void;
  onCalibrated: (ok: boolean) => void;
}) {
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
  // Pre-test environment hints - informational, don't block start unless
  // explicitly fatal (remote desktop). Each has a `severity` so the UI
  // can colour them accordingly.
  const [hints, setHints] = useState<Array<{ id: string; level: 'warn' | 'block'; text: string }>>([]);
  // Camera calibration - captures the user's neutral yaw / pitch so the
  // proctoring detector compares against THEIR resting pose instead of
  // absolute zero. Without this a low-mounted webcam constantly trips the
  // pitch detector, and a slightly off-axis camera trips yaw.
  const [calibStatus, setCalibStatus] = useState<'idle' | 'capturing' | 'done' | 'error'>('idle');
  const [calibProgress, setCalibProgress] = useState(0);  // 0..1 during capture

  // Clear any stale baseline from a previous test session - calibration must
  // happen fresh on this consent screen.
  useEffect(() => {
    try { sessionStorage.removeItem('proctoring-baseline'); } catch {}
  }, []);
  // Pre-load the MediaPipe Face Landmarker model in the background while
  // the user reads the rules - by the time they click Начать тест the
  // model is cached, so detection starts the moment the test opens.
  const [aiModelStatus, setAiModelStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [aiError, setAiError] = useState<string | null>(null);

  // Mobile / narrow viewport detection - switches layout to stacked single
  // column when the viewport is too narrow for the side-by-side preview.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Warm up both AI models - face landmarker (~3 MB) + object detector
  // (~4 MB) so the test page starts detection immediately. Mobile webviews
  // (in-app browsers in Telegram, Gmail, Instagram) often lack the WASM /
  // WebGL features the models require - surface a useful message when that
  // happens so the user knows to open the page in a real browser.
  useEffect(() => {
    let cancelled = false;
    Promise.all([getFaceLandmarker(), getObjectDetector()])
      .then(() => { if (!cancelled) setAiModelStatus('ready'); })
      .catch((err: any) => {
        if (cancelled) return;
        // P2-NEW-12 — структурный лог через lib/log с redaction.
        log.error({
          event: 'proctoring_model_load_failed',
          message: (err as Error)?.message ?? String(err).slice(0, 200),
        });
        setAiModelStatus('error');

        // Pull a usable diagnostic string out of whatever was rejected.
        // MediaPipe / script-load failures often reject with a DOM Event
        // object whose .toString() is "[object Event]" - useless to the user.
        // Build a structured message in those cases.
        const isDomEvent = typeof Event !== 'undefined' && err instanceof Event;
        let msg: string;
        if (isDomEvent) {
          // ErrorEvent has .filename / .message; generic Event has .type
          const ev = err as ErrorEvent & { type: string };
          const target = (ev.target as HTMLScriptElement | null);
          const src = target?.src ?? '';
          msg = ev.message || src || `${ev.type}-event`;
        } else if (err && typeof err === 'object') {
          msg = String(err.message ?? err.name ?? '');
        } else {
          msg = String(err ?? '');
        }

        // Pick the most likely cause based on the message content
        if (/wasm|simd|webassembly/i.test(msg)) {
          setAiError('Браузер не поддерживает WebAssembly SIMD. Откройте сайт в Chrome или Safari вместо встроенного браузера.');
        } else if (/webgl|gpu|gl context/i.test(msg)) {
          setAiError('Не удалось инициализировать WebGL. Откройте сайт в обычном Chrome / Safari, не во встроенном браузере мессенджера.');
        } else if (isDomEvent || /network|fetch|cors|cdn|abort|jsdelivr|googleapis|load|script/i.test(msg)) {
          // Most "[object Event]" failures are CDN script/asset load rejections
          setAiError('Не удалось скачать AI-модель с CDN (jsdelivr / mediapipe-models). Проверьте интернет, отключите AdBlock и попробуйте «Проверить заново».');
        } else {
          setAiError(msg.slice(0, 140) || 'Неизвестная ошибка загрузки модели.');
        }
      });
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
        // Don't report ready yet - wait for the camera-quality + mic-signal
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run-once on mount. This effect acquires camera/mic. Re-running on onReady identity change would tear down the stream and ask permission again. Latest onReady is captured via closure at cleanup time, which is the only call site.
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

  // Camera quality monitor - measures brightness + sharpness of the frame.
  // Sharpness is approximated via an edge-magnitude sum (Sobel-style on the
  // luminance channel) - blurry frames have a much lower edge total.
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
            const y = 0.299 * (data[i] ?? 0) + 0.587 * (data[i + 1] ?? 0) + 0.114 * (data[i + 2] ?? 0);
            lum[p] = y;
            sum += y;
          }
          const bright = sum / lum.length; // 0..255
          // Edge magnitude (simplified: |∂x| + |∂y|)
          let edges = 0; let n = 0;
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const c = lum[y * w + x] ?? 0;
              const dx = Math.abs(c - (lum[y * w + (x + 1)] ?? 0));
              const dy = Math.abs(c - (lum[(y + 1) * w + x] ?? 0));
              edges += dx + dy;
              n++;
            }
          }
          const sharpness = edges / n; // higher = sharper
          let ok = true;
          let reason: string | null = null;
          if (bright < 35) {
            ok = false; reason = 'Слишком темно - включите свет.';
          } else if (bright > 235) {
            ok = false; reason = 'Засветка кадра - отойдите от лампы или окна.';
          } else if (sharpness < 4) {
            ok = false; reason = 'Изображение размыто - протрите камеру и наведите фокус.';
          }
          setCameraQuality({ bright, sharpness, ok, reason });
        } catch { /* ignore */ }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stream]);

  // Animation tick for the "Проверить" button when it's running, so the
  // user gets visual feedback that something is happening.
  const [envChecking, setEnvChecking] = useState(false);
  const envCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Cross-check signal for the visual headphone detector: only trust
  // visual evidence when audio devices ALSO look suspicious. Without a
  // plausible audio path (multi-output or brand-tokened device), a "dark
  // ear region" is much more likely to be hair, glasses, or shadow than
  // headphones. Holds the result of the latest env check.
  const audioSuspiciousRef = useRef(false);

  /** Re-detects environment hints (earphones, RDP/VM, screen mismatch).
   *  Replaces previous env hints in the list, but PRESERVES object-* hints
   *  (those come from the live object detector and have their own lifecycle).
   *  Runs automatically on stream acquisition and on `devicechange` events,
   *  and can be triggered manually via the "Проверить заново" button when
   *  the user thinks they fixed something. */
  // Mirror reactive aiModelStatus into a ref so the stable runEnvCheck
  // callback always sees the current value without changing identity.
  const aiModelStatusRef = useRef(aiModelStatus);
  useEffect(() => { aiModelStatusRef.current = aiModelStatus; }, [aiModelStatus]);

  const runEnvCheck = useCallback(async () => {
    if (!stream) return;
    setEnvChecking(true);
    const collected: typeof hints = [];

    // 0. If the AI model previously failed (CDN blocked, transient network),
    //    retry loading it on this manual recheck. resetXxx() drops the cached
    //    rejected promise so the next getXxx() actually re-fetches.
    if (aiModelStatusRef.current === 'error') {
      try {
        const [{ resetFaceLandmarker, getFaceLandmarker }, { resetObjectDetector, getObjectDetector }] = await Promise.all([
          import('@/lib/proctoring/face'),
          import('@/lib/proctoring/objects'),
        ]);
        resetFaceLandmarker();
        resetObjectDetector();
        setAiError(null);
        setAiModelStatus('loading');
        try {
          await Promise.all([getFaceLandmarker(), getObjectDetector()]);
          setAiModelStatus('ready');
        } catch (err: any) {
          setAiModelStatus('error');
          const msg = err && typeof err === 'object'
            ? String((err as Error).message ?? '')
            : String(err ?? '');
          setAiError(msg.slice(0, 140) || 'Повтор загрузки не удался. Проверьте интернет и AdBlock.');
        }
      } catch {/* ignore - main loader will retry on next mount */}
    }

    // 1. Headphones / earbuds detection via device labels.
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      const audioOuts = devs.filter((d) => d.kind === 'audiooutput');
      // CRITICAL: only check audio OUTPUT labels for headphones. Microphones
      // (audioinput) often share brand names with headsets - HyperX makes
      // QuadCast mic AND Cloud headset, Razer makes Kraken mic AND Kraken
      // headset, Shure / Audio-Technica / RODE all make mics too. Matching
      // "hyperx" against an input would block users with a HyperX QuadCast
      // standalone microphone (which they need to start the test!).
      const outLabels = audioOuts.map((d) => d.label.toLowerCase());

      // Tokens that are SPECIFICALLY headphones / headsets (not mic models)
      const earpieceTokens = [
        'airpods', 'earbuds', 'earpods',
        'наушник', 'наушники', 'гарнитур',
        'headset', 'headphone', 'headphones', 'earphone',
        'gear iconx', 'powerbeats', 'beats', 'galaxy buds', 'pixel buds',
        'wf-', 'wh-',
        'sony wh', 'sony wf', 'sony lin',
        'bose qc', 'bose 700', 'sennheiser hd', 'sennheiser momentum',
        'hyperx cloud', 'logitech g pro x', 'logitech g733', 'logitech g435',
        'razer kraken', 'razer barracuda', 'razer blackshark',
        'steelseries arctis', 'corsair void', 'corsair virtuoso',
        'jbl tune', 'jbl live', 'jbl quantum',
        'soundcore liberty', 'soundcore life',
        'jabra elite', 'jabra evolve',
        'akg n', 'marshall major', 'marshall monitor',
        'skullcandy', 'plantronics voyager', 'poly voyager', 'arctis',
        'opencomm', 'vivo tws', 'mi true', 'redmi buds',
        'huawei freebuds', 'oneplus buds', 'realme buds',
      ];
      const matchedLabel = outLabels.find((l) => earpieceTokens.some((t) => l.includes(t)));

      // We only block on KNOWN headphone brands. Counting `audioOuts.length`
      // produces too many false positives - HDMI / DisplayPort monitor
      // speakers, NVIDIA High Definition Audio, S/PDIF outputs, virtual mix
      // devices etc. all show up as separate audiooutput entries even when
      // the user has no headphones at all and can't physically disable them.
      // The mandatory self-attestation checkbox covers the case of cheap
      // unbranded wired headphones that we genuinely can't fingerprint.
      if (matchedLabel) {
        collected.push({
          id: 'earphones',
          level: 'block',
          text: `Похоже, к компьютеру подключены наушники (${matchedLabel}). Снимите их и отключите - в наушниках тест проходить нельзя.`,
        });
      }

      // Audio suspicion - is there ANY plausible audio path that could be
      // a headphone? Used to gate the visual heuristic so dark hair / shadows
      // don't trigger headphone detection on people without any headset.
      // Generic broader tokens (just brand prefix) are enough here because
      // we only USE this to allow the visual detector, not to block on its own.
      const broadHeadphoneTokens = [
        'headphone', 'headset', 'earphone', 'earbud', 'earpod', 'airpod',
        'наушник', 'гарнитур',
        'beats', 'jabra', 'jbl', 'sony wh', 'sony wf', 'sony lin',
        'bose', 'sennheiser', 'hyperx cloud', 'logitech g',
        'razer kraken', 'razer barracuda', 'razer blackshark', 'razer opus',
        'steelseries', 'corsair void', 'corsair virtuoso',
        'soundcore', 'arctis', 'plantronics', 'poly', 'skullcandy',
        'galaxy buds', 'pixel buds', 'redmi buds', 'huawei freebuds',
        'oneplus buds', 'realme buds', 'mi true',
        'akg n', 'marshall major', 'marshall monitor',
      ];
      const broadMatch = outLabels.some((l) => broadHeadphoneTokens.some((t) => l.includes(t)));
      // Multiple non-builtin audio outputs is also "suspicious enough"
      const externalLikeOuts = audioOuts.filter((d) => {
        const l = d.label.toLowerCase();
        // Don't count display-attached / virtual outputs
        return !/(high definition audio|hdmi|displayport|display audio|monitor|s\/pdif|virtual|nvidia|amd display|intel display)/.test(l);
      });
      audioSuspiciousRef.current = broadMatch || externalLikeOuts.length > 1;
    } catch {/* enumerateDevices failed - skip headphone check */}

    // 2. WebGL renderer fingerprint - flags virtual GPUs typical of RDP/VM
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

    // 3. Screen vs window mismatch - common with RDP/screen mirroring
    try {
      const sw = window.screen?.width || 0;
      const ww = window.innerWidth || 0;
      if (sw > 0 && ww > 0 && sw / ww > 4) {
        collected.push({
          id: 'screen-mismatch',
          level: 'warn',
          text: 'Размер экрана и окна сильно расходятся - возможно, идёт удалённое подключение или дублирование экрана.',
        });
      }
    } catch {/* */}

    // Merge with existing hints from OTHER sources (object-*, ai-failed)
    setHints((prev) => {
      const ENV_IDS = new Set(['earphones', 'rdp', 'screen-mismatch']);
      const fromOtherSources = prev.filter((h) => !ENV_IDS.has(h.id));
      return [...collected, ...fromOtherSources];
    });
    // Spinner stays for a tiny bit so the user perceives the check
    envCheckTimerRef.current = setTimeout(() => setEnvChecking(false), 350);
  }, [stream]);

  // Clear the envChecking spinner timer on unmount so it can't fire
  // setEnvChecking on an already-unmounted component.
  useEffect(() => () => {
    if (envCheckTimerRef.current) clearTimeout(envCheckTimerRef.current);
  }, []);

  // Run env check on initial stream acquisition + whenever the OS reports
  // a device change (headphone unplugged / plugged in, USB swap, etc.).
  useEffect(() => {
    if (!stream) return;
    runEnvCheck();
    const handler = () => { runEnvCheck(); };
    navigator.mediaDevices.addEventListener?.('devicechange', handler);
    return () => {
      navigator.mediaDevices.removeEventListener?.('devicechange', handler);
    };
  }, [stream, runEnvCheck]);

  // Surface AI-model failure as a blocker
  useEffect(() => {
    if (aiModelStatus !== 'error') return;
    setHints((prev) => {
      const text = aiError
        ? `Не удалось загрузить AI-модель прокторинга. ${aiError}`
        : 'Не удалось загрузить AI-модель прокторинга. Проверьте интернет и попробуйте снова - без неё тест начать нельзя.';
      const idx = prev.findIndex((h) => h.id === 'ai-failed');
      if (idx >= 0 && prev[idx]?.text === text) return prev;
      const next = prev.filter((h) => h.id !== 'ai-failed');
      return [...next, { id: 'ai-failed', level: 'block', text }];
    });
  }, [aiModelStatus, aiError]);

  // Tell parent whether calibration is done. Calibration also auto-resets
  // if the user later changes camera quality (e.g. the camera goes dark).
  useEffect(() => {
    onCalibrated(calibStatus === 'done');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onCalibrated is a parent callback; adding it would re-fire this effect whenever the parent re-renders (callback identity churn). The semantic invariant we want is "fire when calibStatus changes" — exactly what the current deps express.
  }, [calibStatus]);

  // Live forbidden-object detection on the consent screen - phones, books,
  // laptops, monitors visible in the camera frame BEFORE the test starts.
  // The user has to clear the desk before they can begin so we don't
  // immediately rack up violations on the first frame after start.
  // Detected objects are surfaced as 'block' hints that gate the start
  // button (canStart = ... && !blocked).
  useEffect(() => {
    if (!stream || !videoRef.current || aiModelStatus !== 'ready') return;
    let stopped = false;
    let raf = 0;
    let lastInfer = 0;
    // Hysteresis: object must be missing for several consecutive frames
    // before we clear its hint, so a momentary detection drop doesn't
    // flicker the warning on/off.
    const missingFrames: Record<string, number> = {};
    const presentClasses = new Set<string>();
    const CLEAR_MISS = 4;          // frames-without-hit before clearing
    // ~1 fps on mobile / ~2 fps on desktop. Forbidden items show up for
    // many seconds so this is plenty.
    const isLp = typeof window !== 'undefined' &&
      (window.matchMedia('(max-width: 900px)').matches ||
       window.matchMedia('(pointer: coarse)').matches);
    const PERIOD_MS = isLp ? 1000 : 450;

    // Offscreen canvas for sampling pixel colour around face landmarks
    // (used by the headphone heuristic - we compare luminance of the ear
    // region to the cheek to detect over-ear / on-ear headphones, which
    // COCO can't recognise on its own).
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 320;
    sampleCanvas.height = 240;
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    const updateHints = () => {
      const labels: Record<string, string> = {
        'cell phone':  'телефон',
        'book':        'книгу или конспект',
        'laptop':      'второй ноутбук',
        'tv':          'монитор / экран',
        'keyboard':    'внешнюю клавиатуру',
        'remote':      'пульт',
        'mouse':       'постороннюю мышь',
        'headphones':  'наушники / гарнитуру',
      };
      setHints((prev) => {
        // Drop any previous object-* hints, then re-add for currently visible ones
        const kept = prev.filter((h) => !h.id.startsWith('object-'));
        const next = [...kept];
        presentClasses.forEach((cls) => {
          const isHeadphones = cls === 'headphones';
          next.push({
            id: 'object-' + cls,
            level: 'block',
            text: isHeadphones
              ? 'Камера видит, что вы в наушниках или гарнитуре. Снимите их - в наушниках тест проходить нельзя.'
              : `В кадре виден ${labels[cls] ?? cls}. Уберите со стола - во время теста этот предмет запрещён.`,
          });
        });
        return next;
      });
    };

    /** Sample mean luminance + saturation + redness of a region from the
     *  live video. Skin has a characteristic colour signature - moderate
     *  saturation, R > G > B - while headphones (black/gray/white plastic
     *  or metal) are nearly grayscale regardless of how light hits them.
     *  This is what saves us when monitor glare brightens dark headphones
     *  to ~skin luminance: the chroma still gives them away. */
    const samplePatch = (lmx: number, lmy: number, size = 15):
      { lum: number; sat: number; redness: number } | null => {
      if (!sampleCtx) return null;
      const w = sampleCanvas.width, h = sampleCanvas.height;
      const half = Math.floor(size / 2);
      const cx = Math.max(half, Math.min(w - half - 1, Math.round(lmx * w)));
      const cy = Math.max(half, Math.min(h - half - 1, Math.round(lmy * h)));
      try {
        const data = sampleCtx.getImageData(cx - half, cy - half, size, size).data;
        let lumSum = 0, satSum = 0, redSum = 0;
        const n = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] ?? 0;
          const g = data[i + 1] ?? 0;
          const b = data[i + 2] ?? 0;
          lumSum += 0.299 * r + 0.587 * g + 0.114 * b;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          // HSV saturation, 0..1
          satSum += max > 0 ? (max - min) / max : 0;
          // Redness: how much R dominates G and B (skin tone marker, 0..255)
          redSum += r - (g + b) / 2;
        }
        return {
          lum: lumSum / n,
          sat: satSum / n,
          redness: redSum / n,
        };
      } catch { return null; }
    };

    /** Heuristic headphone detection using both luminance AND chroma:
     *  - Luminance ratio: black headphones go very dark, white AirPods very bright
     *  - Saturation:      headphones are nearly grayscale (any colour); skin always has chroma
     *  - Redness:         skin has R > G > B; headphones don't
     *  Saturation/redness checks save us when bright monitor glare lights up
     *  dark headphones until they're as bright as skin - the chroma still
     *  gives them away. */
    const detectHeadphones = async (v: HTMLVideoElement): Promise<boolean> => {
      if (!sampleCtx) return false;
      try {
        const { getFaceLandmarker } = await import('@/lib/proctoring/face');
        const lm = await getFaceLandmarker();
        sampleCtx.drawImage(v, 0, 0, sampleCanvas.width, sampleCanvas.height);
        const fr = lm.detectForVideo(v, performance.now());
        const set0 = fr.faceLandmarks?.[0];
        if (!set0) return false;

        const earL = set0[234], earR = set0[454];
        const chL  = set0[50],  chR  = set0[280];
        const fh   = set0[10];
        if (!earL || !earR || !chL || !chR || !fh) return false;

        // Skin reference - average forehead + both cheeks
        const sampChL = samplePatch(chL.x, chL.y);
        const sampChR = samplePatch(chR.x, chR.y);
        const sampFh  = samplePatch(fh.x,  fh.y);
        if (!sampChL || !sampChR || !sampFh) return false;
        const skinLum     = (sampChL.lum     + sampChR.lum     + sampFh.lum)     / 3;
        const skinSat     = (sampChL.sat     + sampChR.sat     + sampFh.sat)     / 3;
        const skinRedness = (sampChL.redness + sampChR.redness + sampFh.redness) / 3;
        if (skinLum < 30 || skinLum > 240) return false;
        // Need a visible skin-colour signature to make a useful comparison
        if (skinSat < 0.06 || skinRedness < 4) return false;

        // The tragus landmark sits inside the ear, but the headphone cup
        // is OUTSIDE the head. Direction of "outside" depends on which
        // side of the frame the ear lands on (camera may or may not be
        // mirrored, so we don't assume): always step AWAY from the face
        // centre line, and SCALE the offset by the actual face size in
        // the frame so this works at any distance from the camera.
        const faceCenterX = (earL.x + earR.x) / 2;
        const earSpan     = Math.abs(earR.x - earL.x) || 0.3;
        // 18% of inter-ear span = solid distance to where headphone cup sits.
        // For a typical face filling ~50% of frame width, that's ~0.09.
        const OUTWARD = earSpan * 0.18;
        const VERT_SPAN = earSpan * 0.10;  // 3 vertical samples on the cup
        const sideOf = (x: number) => (x >= faceCenterX ? +1 : -1);

        const sampleSide = (
          xBase: number, yBase: number, dir: number,
        ): { lum: number; sat: number; redness: number } | null => {
          const offsets = [-VERT_SPAN, 0, VERT_SPAN];
          let lum = 0, sat = 0, red = 0; let count = 0;
          for (const dy of offsets) {
            const p = samplePatch(xBase + OUTWARD * dir, yBase + dy, 19);
            if (p) { lum += p.lum; sat += p.sat; red += p.redness; count++; }
          }
          return count > 0
            ? { lum: lum / count, sat: sat / count, redness: red / count }
            : null;
        };

        const earSampL = sampleSide(earL.x, earL.y, sideOf(earL.x));
        const earSampR = sampleSide(earR.x, earR.y, sideOf(earR.x));
        if (!earSampL || !earSampR) return false;

        // Score each ear: how "non-skin-like" is it? Three independent
        // signals, each with a tighter threshold than before so dark hair
        // / shadows / glasses frames don't accidentally trigger.
        const score = (s: { lum: number; sat: number; redness: number }): number => {
          const lumRatio = s.lum / skinLum;
          // 1) Luminance way off (very dark or very bright). Tightened
          //    from 0.70/1.40 to 0.60/1.50 - hair sits around 0.55 already
          //    so this barely changes the catch rate but cuts mid-shadow false positives.
          const lumOff = lumRatio < 0.60 || lumRatio > 1.50;
          // 2) Region is dramatically less saturated than skin (grayscale plastic).
          //    Tightened from 0.60 to 0.40 - hair is naturally less saturated
          //    than skin but not THIS much, while plastic/metal cups are.
          const satOff = skinSat > 0.10 && s.sat < skinSat * 0.40;
          // 3) Region severely lacks the warm-skin redness signature.
          //    Tightened from 0.50 to 0.30.
          const redOff = skinRedness > 8 && s.redness < skinRedness * 0.30;
          return Number(lumOff) + Number(satOff) + Number(redOff);
        };
        const sL = score(earSampL);
        const sR = score(earSampR);
        // Strict: BOTH ears must score ≥2 of 3 signals AND combined ≥5/6.
        // Removed the previous "sum >= 4 with uneven split" fallback which
        // was firing on one strong ear + one weak one (often hair vs skin).
        return sL >= 2 && sR >= 2 && (sL + sR) >= 5;
      } catch { return false; }
    };

    const tick = async () => {
      if (stopped) return;
      const now = performance.now();
      if (now - lastInfer < PERIOD_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastInfer = now;
      try {
        const det = await getObjectDetector();
        const v = videoRef.current;
        if (!v || v.readyState < 2) {
          raf = requestAnimationFrame(tick);
          return;
        }
        const r = det.detectForVideo(v, now);
        const hits = findForbiddenObjects(r);
        const seenNow = new Set(hits.map((h) => h.cls));
        // Visual headphone heuristic - gated by audio-device cross-check.
        // Without a plausible audio path, dark hair / shadows around the
        // ears trigger the heuristic too easily. With a suspicious audio
        // device present, the visual signal becomes a strong corroborator.
        if (audioSuspiciousRef.current && await detectHeadphones(v)) {
          seenNow.add('headphones');
        }
        let changed = false;
        // Add newly seen
        seenNow.forEach((cls) => {
          missingFrames[cls] = 0;
          if (!presentClasses.has(cls)) {
            presentClasses.add(cls);
            changed = true;
          }
        });
        // Increment miss counters; drop after threshold
        Array.from(presentClasses).forEach((cls) => {
          if (!seenNow.has(cls)) {
            missingFrames[cls] = (missingFrames[cls] ?? 0) + 1;
            if (missingFrames[cls] >= CLEAR_MISS) {
              presentClasses.delete(cls);
              delete missingFrames[cls];
              changed = true;
            }
          }
        });
        if (changed) updateHints();
      } catch {/* model load failure already surfaced via aiModelStatus */}
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      // Clear any residual object-* hints when the effect tears down
      setHints((prev) => prev.filter((h) => !h.id.startsWith('object-')));
    };
     
  }, [stream, aiModelStatus]);

  // Reset calibration if any object is currently detected - the user has
  // to clear the desk and re-fixate.
  useEffect(() => {
    const hasObject = hints.some((h) => h.id.startsWith('object-'));
    if (hasObject && calibStatus === 'done') {
      setCalibStatus('idle');
      try { sessionStorage.removeItem('proctoring-baseline'); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- calibStatus intentionally omitted. We only want to RESET calibration when a NEW object is detected, not when calibStatus changes. Adding calibStatus would re-fire on every calibStatus transition and loop infinitely after setCalibStatus('idle') above.
  }, [hints]);

  /** Capture neutral pose: average yaw + pitch over ~2 seconds and store
   *  baseline in sessionStorage so Proctoring can subtract it at runtime. */
  const runCalibration = async () => {
    if (!videoRef.current || !stream) return;
    setCalibStatus('capturing');
    setCalibProgress(0);
    try {
      const { getFaceLandmarker, analyseFaceFrame } = await import('@/lib/proctoring/face');
      const lm = await getFaceLandmarker();
      const samples: { yaw: number; pitch: number }[] = [];
      const start = performance.now();
      const DURATION = 2200;
      while (performance.now() - start < DURATION) {
        const v = videoRef.current;
        if (!v || v.readyState < 2) {
          await new Promise((r) => setTimeout(r, 80));
          continue;
        }
        const r = lm.detectForVideo(v, performance.now());
        const s = analyseFaceFrame(r);
        if (s.hasFace) samples.push({ yaw: s.yaw, pitch: s.pitch });
        setCalibProgress(Math.min(1, (performance.now() - start) / DURATION));
        await new Promise((r) => setTimeout(r, 90));
      }
      if (samples.length < 8) {
        setCalibStatus('error');
        return;
      }
      // Median is more robust than mean against the odd jitter frame.
      const med = (arr: number[]) => {
        const sorted = [...arr].sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length / 2)];
      };
      const yawBase = med(samples.map((s) => s.yaw));
      const pitchBase = med(samples.map((s) => s.pitch));
      sessionStorage.setItem(
        'proctoring-baseline',
        JSON.stringify({ yaw: yawBase, pitch: pitchBase, ts: Date.now() }),
      );
      setCalibStatus('done');
    } catch {
      setCalibStatus('error');
    }
  };

  // Combine quality + signal + env hints + AI model into final ready flag
  useEffect(() => {
    const blocked = hints.some((h) => h.level === 'block');
    const ok =
      !!stream && !!cameraQuality?.ok && hasAudioSignal &&
      !blocked && aiModelStatus === 'ready';
    onReady(ok);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onReady is a parent callback whose identity churns on every parent render. We want the effect to re-fire when any of the readiness inputs change, not when the callback re-identifies — adding onReady would compute ok identically and re-call the parent for no semantic reason.
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
      for (let i = 0; i < data.length; i++) sum += data[i] ?? 0;
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
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-3.5 mb-[18px] flex items-start gap-2.5">
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
          stroke="#B91C1C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 mt-px">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="font-[var(--font-body)] text-[13px] leading-[1.5] text-[#991B1B]">
          <strong className="font-bold">{error}</strong>
          {' '}Разрешите доступ в настройках браузера и обновите страницу.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-3.5 mb-[18px] border-l-[3px] border-l-[#3B82F6]">
    <div className="flex flex-col items-stretch gap-y-3 sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3.5 sm:gap-y-0 sm:items-center sm:flex-row">
      {/* Video preview */}
      <div className="relative w-full sm:w-[132px] h-[180px] sm:h-[100px] aspect-video sm:aspect-auto rounded-[10px] bg-[#0F172A] overflow-hidden shrink-0">
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="w-full h-full object-cover"
        />
        {/* REC dot */}
        <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/55 text-white font-[var(--font-mono)] text-[9px] font-bold tracking-[0.06em]">
          <span className={`w-1.5 h-1.5 rounded-full ${stream ? 'bg-[#F87171]' : 'bg-[#94A3B8]'}`} />
          {stream ? 'LIVE' : 'OFF'}
        </span>
      </div>

      {/* Status + mic meter */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap font-[var(--font-mono)] text-[10.5px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-2">
          <StatusDot ok={!!stream && !!cameraQuality?.ok} />
          Камера {stream ? (cameraQuality?.ok ? 'готова' : 'не годится') : 'отключена'}
          <span className="w-2" />
          <StatusDot ok={hasAudioSignal} />
          Микрофон {hasAudioSignal ? 'слышит звук' : 'ждёт звук'}
          <span className="w-2" />
          <StatusDot ok={aiModelStatus === 'ready'} />
          AI {
            aiModelStatus === 'ready' ? 'готов' :
            aiModelStatus === 'error' ? 'ошибка' : 'грузится'
          }
        </div>
        {/* Audio meter - fill width is the live amplitude; coloured zones
             behind it mark the natural / warning / violation bands. */}
        <div>
          <div className="relative h-3 rounded-full bg-[#F1F3F6] overflow-hidden">
            {/* Background zones */}
            <div
              className="absolute inset-0 bg-[image:var(--audio-meter-bg)]"
              // eslint-disable-next-line react/forbid-dom-props -- dynamic gradient stops driven by amplitude thresholds
              style={{
                ['--audio-meter-bg' as string]: `linear-gradient(90deg,
                rgba(16,185,129,0.18) 0%,
                rgba(16,185,129,0.18) ${(MEDIA_CHECK_NATURAL_MAX_AMP / MEDIA_CHECK_METER_MAX) * 100}%,
                rgba(245,158,11,0.20) ${(MEDIA_CHECK_NATURAL_MAX_AMP / MEDIA_CHECK_METER_MAX) * 100}%,
                rgba(245,158,11,0.20) ${(MEDIA_CHECK_VIOLATION_AMP / MEDIA_CHECK_METER_MAX) * 100}%,
                rgba(220,38,38,0.22) ${(MEDIA_CHECK_VIOLATION_AMP / MEDIA_CHECK_METER_MAX) * 100}%,
                rgba(220,38,38,0.22) 100%)`,
              }}
            />
            {/* Live fill */}
            <div
              className="absolute top-0 left-0 bottom-0 rounded-full bg-[var(--fill-color)] w-[var(--fill-width)] transition-[width,background-color] duration-[60ms]"
              // eslint-disable-next-line react/forbid-dom-props -- live amplitude → width/color
              style={{
                ['--fill-width' as string]: `${Math.min(100, (audioAmp / MEDIA_CHECK_METER_MAX) * 100)}%`,
                ['--fill-color' as string]: audioAmp >= MEDIA_CHECK_VIOLATION_AMP
                  ? '#DC2626'
                  : audioAmp >= MEDIA_CHECK_WARNING_AMP
                    ? '#F59E0B'
                    : '#10B981',
              }}
            />
            {/* Threshold ticks */}
            <ThresholdTick pct={(MEDIA_CHECK_NATURAL_MAX_AMP / MEDIA_CHECK_METER_MAX) * 100} />
            <ThresholdTick pct={(MEDIA_CHECK_VIOLATION_AMP / MEDIA_CHECK_METER_MAX) * 100} />
          </div>
          {/* Threshold + live readouts */}
          <div className="flex justify-between items-baseline mt-1.5 font-[var(--font-mono)] text-[10px] text-[#9CA3AF] tracking-[0.03em]">
            <span><strong className="text-[#10B981]">норма</strong> ≤ {ampToDb(MEDIA_CHECK_NATURAL_MAX_AMP)} dB</span>
            <span><strong className="text-[#F59E0B]">предупр.</strong> {ampToDb(MEDIA_CHECK_NATURAL_MAX_AMP)}…{ampToDb(MEDIA_CHECK_VIOLATION_AMP)} dB</span>
            <span><strong className="text-[#DC2626]">наруш.</strong> {`>`} {ampToDb(MEDIA_CHECK_VIOLATION_AMP)} dB</span>
          </div>
          {/* Live measurement */}
          <p className="mt-2 mb-0 font-[var(--font-body)] text-xs text-[#6B7280] leading-[1.5]">
            Сейчас:{' '}
            <strong
              className="font-[var(--font-mono)] text-[var(--db-color)]"
              // eslint-disable-next-line react/forbid-dom-props -- live dB color reflects current amplitude band
              style={{
                ['--db-color' as string]: audioAmp >= MEDIA_CHECK_VIOLATION_AMP ? '#B91C1C'
                  : audioAmp >= MEDIA_CHECK_WARNING_AMP ? '#B45309'
                  : '#047857',
              }}
            >
              {ampToDb(audioAmp)} dB
            </strong>
            {' · '}
            Скажите что-нибудь, чтобы убедиться, что микрофон ловит звук. Проследите, что лицо хорошо видно в кадре.
          </p>
        </div>
        {/* Per-issue hint when camera quality blocks the start */}
        {stream && cameraQuality && !cameraQuality.ok && cameraQuality.reason && (
          <p className="mt-2 mb-0 font-[var(--font-body)] text-xs font-semibold text-[#B91C1C] leading-[1.5]">
            {cameraQuality.reason}
          </p>
        )}
        {/* Environment hints (earphones / RDP / VM / screen mismatch). */}
        {hints.length > 0 && (
          <div className="flex flex-col gap-2 mt-2.5">
            <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
              {hints.map((h) => (
                <li
                  key={h.id}
                  className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border font-[var(--font-body)] text-xs leading-[1.5] ${
                    h.level === 'block'
                      ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                      : 'bg-[#FFFBEB] border-[#FCD34D] text-[#92400E]'
                  }`}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                    className="shrink-0 mt-0.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>{h.text}</span>
                </li>
              ))}
            </ul>
            {/* Manual recheck - some platforms don't fire devicechange when
                a Bluetooth headset disconnects, or the user wants to re-try
                after they unplugged/removed something. */}
            <button
              type="button"
              onClick={runEnvCheck}
              disabled={envChecking}
              className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#1A1A1A] border border-[#CBD5E1] font-[var(--font-body)] text-xs font-semibold transition-[background-color,border-color] duration-150 ${
                envChecking ? 'cursor-wait opacity-[0.65]' : 'cursor-pointer opacity-100'
              }`}
            >
              <svg
                width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
                className={envChecking ? 'animate-[consent-recheck-spin_0.8s_linear_infinite]' : ''}
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              {envChecking ? 'Проверяю…' : 'Проверить заново'}
            </button>
          </div>
        )}
      </div>
      </div>

      {/* Camera calibration - capture the user's neutral pose so the
           proctoring detector compares to THEIR resting position. Lives
           outside the camera/status grid so it can span full width and
           visually anchor under the camera preview. */}
      {stream && cameraQuality?.ok && aiModelStatus === 'ready' && (
        <div
          className={`mt-3 px-3.5 py-3 rounded-[10px] border ${
            calibStatus === 'done'
              ? 'bg-[#ECFDF5] border-[#A7F3D0]'
              : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`w-[22px] h-[22px] rounded-md text-white inline-flex items-center justify-center shrink-0 ${
                calibStatus === 'done' ? 'bg-[#10B981]' : 'bg-[#94A3B8]'
              }`}
            >
              {calibStatus === 'done' ? (
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
                </svg>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 font-[var(--font-body)] text-[13px] font-semibold text-[#1A1A1A] leading-[1.4]">
                {calibStatus === 'done'
                  ? 'Камера зафиксирована'
                  : calibStatus === 'capturing'
                    ? 'Идёт калибровка - смотрите прямо в камеру'
                    : calibStatus === 'error'
                      ? 'Не удалось зафиксировать камеру'
                      : 'Зафиксируйте положение камеры'}
              </p>
              <p className="mt-0.5 mb-0 font-[var(--font-body)] text-[11.5px] text-[#6B7280] leading-[1.45]">
                {calibStatus === 'done'
                  ? 'После старта теста не двигайте камеру и не меняйте позу - система запомнила ваш базовый ракурс.'
                  : calibStatus === 'capturing'
                    ? 'Сядьте ровно, смотрите в центр камеры - ~2 секунды.'
                    : calibStatus === 'error'
                      ? 'Лицо не было видно достаточно стабильно. Сядьте по центру и попробуйте снова.'
                      : 'Сядьте, как будете сидеть весь тест, и нажмите кнопку. Это базовая поза для детектора поворотов.'}
              </p>
            </div>
            {calibStatus !== 'capturing' && (
              <button
                type="button"
                onClick={runCalibration}
                className={`px-3.5 py-2 rounded-lg font-[var(--font-body)] text-[12.5px] font-semibold cursor-pointer shrink-0 ${
                  calibStatus === 'done'
                    ? 'bg-white text-[#1A1A1A] border border-[#CBD5E1]'
                    : 'bg-[#1A1A1A] text-white border-0'
                }`}
              >
                {calibStatus === 'done' ? 'Перекалибровать' : 'Зафиксировать'}
              </button>
            )}
          </div>
          {calibStatus === 'capturing' && (
            <div className="mt-2.5 h-1 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div
                className="h-full bg-[#3B82F6] w-[var(--calib-progress)] transition-[width] duration-[90ms] ease-linear"
                // eslint-disable-next-line react/forbid-dom-props -- dynamic calibration progress (0..1)
                style={{ ['--calib-progress' as string]: `${calibProgress * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes media-check-pulse {
          0%   { opacity: 1.00; }
          25%  { opacity: 0.85; }
          50%  { opacity: 0.55; }
          75%  { opacity: 0.85; }
          100% { opacity: 1.00; }
        }
        @keyframes consent-recheck-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   RulesAccordion - full proctoring catalogue split by severity:
     • Soft warning  (yellow)
     • Violation     (orange - counts toward 3-strike lockout)
     • Instant end   (red - test terminates on first occurrence)
   Each rule lists the trigger, the threshold, and what happens.
   ────────────────────────────────────────────────────────────────── */
type Severity = 'warn' | 'violation' | 'instant';
interface Rule {
  title: string;
  detail?: string;
}
const WARN_RULES: Rule[] = [
  { title: 'Полная тишина с микрофона', detail: 'Если микрофон не ловит ни звука дольше 15 секунд - возможно, он выключен в системе или вы в шумоизолирующих наушниках.' },
  { title: 'Громкий звук (1-я зона)', detail: 'Уровень микрофона перешёл из зелёной в жёлтую зону шкалы и удерживается 1.2 сек - разговор рядом, включённая музыка.' },
  { title: 'Лицо пропало из кадра', detail: 'Не видно лица дольше 2 секунд - отвернулись, ушли, наклонили камеру.' },
  { title: 'Голова повёрнута в сторону', detail: 'Лицо в кадре, но смотрите не в камеру дольше 1 секунды.' },
  { title: 'Движение губ (1-е срабатывание)', detail: 'Камера зафиксировала, что вы что-то проговариваете. Следующее срабатывание - нарушение.' },
  { title: 'Размер экрана и окна не сходятся', detail: 'Возможно, идёт зеркалирование экрана или удалённое подключение.' },
];
const VIOLATION_RULES: Rule[] = [
  { title: 'Очень громкий звук', detail: 'Уровень микрофона перешёл в красную зону шкалы и удерживается 1.5 сек - крик, разговор в полный голос или громкая музыка.' },
  { title: 'Камера закрыта', detail: 'Тёмный кадр (закрытая или направленная вниз камера) дольше 2 секунд.' },
  { title: 'Несколько лиц в кадре', detail: 'В кадр попал второй человек - рядом стоит подсказчик или зашли посторонние.' },
  { title: 'Запрещённый предмет в кадре', detail: 'AI-детектор увидел телефон, книгу, ноутбук, монитор, клавиатуру или другой посторонний предмет.' },
  { title: 'Повторное движение губ', detail: 'Второе и последующие срабатывания после первого предупреждения - считаются как нарушение.' },
  { title: 'Переключение вкладки или окна', detail: 'Свернули браузер, переключились на Telegram, новую вкладку, второй монитор.' },
  { title: 'Потеря фокуса окна (Alt+Tab)', detail: 'Окно теста перестало быть активным.' },
  { title: 'Открытие DevTools', detail: 'F12, Ctrl+Shift+I / J / C, контекстное меню «Просмотр кода».' },
  { title: 'Копирование / вставка', detail: 'Ctrl+C, Ctrl+A, Ctrl+V - попытка вытащить вопросы или вставить готовый ответ.' },
  { title: 'Скриншот / печать', detail: 'PrintScreen, Ctrl+P, инструменты захвата экрана.' },
  { title: '3 нарушения подряд', detail: 'После третьего нарушения тест завершается принудительно, попытка не засчитывается.' },
];
const INSTANT_RULES: Rule[] = [
  { title: 'Камера резко потеряла фокус', detail: 'Изображение стало мутным дольше 1.5 сек (камеру задели, накрыли тканью, навели на стену).' },
  { title: 'Камера или микрофон отключены пользователем', detail: 'Закрыли крышку камеры, выдернули USB, вышли в системные настройки и сняли разрешение.' },
  { title: 'Запуск из удалённой сессии или виртуальной машины', detail: 'WebGL-рендерер показывает VirtualBox / VMware / Parallels / RDP / SwiftShader / llvmpipe - система не даст начать.' },
  { title: 'Прерывание теста кнопкой', detail: 'Если вы сами нажали «Прервать» - тест блокируется на 12 часов.' },
];

const SEVERITY_META: Record<Severity, { color: string; bg: string; border: string; label: string; title: string; subtitle: string }> = {
  warn: {
    color: '#92400E', bg: '#FFFBEB', border: '#FCD34D',
    label: 'Предупреждение', title: 'Предупреждения',
    subtitle: 'Не штрафуют - система просто покажет жёлтый баннер. После него поведение надо исправить.',
  },
  violation: {
    color: '#9A3412', bg: '#FFF7ED', border: '#FDBA74',
    label: 'Нарушение', title: 'Нарушения',
    subtitle: 'Считаются как «strikes». 1-е и 2-е - предупреждение, 3-е - принудительное завершение и блокировка теста на 24 часа.',
  },
  instant: {
    color: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5',
    label: 'Мгновенно', title: 'Мгновенное завершение',
    subtitle: 'Тест закрывается с первого срабатывания, попытка засчитывается как провал, повтор недоступен 48 часов.',
  },
};

/** SVG icons for each severity. Stroke-based so they inherit the section
 *  colour and stay crisp at any size. */
function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === 'warn') {
    // Yellow triangle with exclamation
    return (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  if (severity === 'violation') {
    // Shield with exclamation - represents "strikes"
    return (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  // instant - octagonal stop sign
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function RuleSection({ severity, rules }: { severity: Severity; rules: Rule[] }) {
  const m = SEVERITY_META[severity];
  // Collapsed by default - these sections are reference material, not
  // something the user has to read on every test attempt.
  const [open, setOpen] = useState(false);
  return (
    <div
      className="bg-white rounded-[14px] mb-3 overflow-hidden border border-[var(--sev-border)]"
      // eslint-disable-next-line react/forbid-dom-props -- severity palette injected via CSS-var
      style={{ ['--sev-border' as string]: m.border, ['--sev-bg' as string]: m.bg, ['--sev-color' as string]: m.color }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-[18px] py-3.5 bg-transparent border-0 cursor-pointer text-left"
        aria-expanded={open}
      >
        <span className="w-8 h-8 rounded-lg bg-[var(--sev-bg)] text-[var(--sev-color)] inline-flex items-center justify-center shrink-0 border border-[var(--sev-border)]">
          <SeverityIcon severity={severity} />
        </span>
        <h4 className="m-0 flex-1 font-[var(--font-display)] text-[15px] font-bold text-[#1A1A1A] tracking-[-0.01em]">
          {m.title}
        </h4>
        <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
          {rules.length}
        </span>
        <motion.svg
          width={16} height={16} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
          className="text-[#6B7280] shrink-0"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>
      {/* Same accordion animation pattern as TestPanel.tsx (the test list
          on the course page) - AnimatePresence + height:auto, 250ms with
          the project's standard ease curve [0.05, 0.7, 0.1, 1]. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-[18px]">
              <p className="mt-0 mb-3 font-[var(--font-body)] text-[12.5px] text-[#6B7280] leading-[1.55]">
                {m.subtitle}
              </p>
              <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
                {rules.map((r, i) => (
                  <li
                    key={i}
                    className={`flex gap-3 pt-2.5 ${i === 0 ? '' : 'border-t border-[#F0F1F5]'}`}
                  >
                    <span className="min-w-[22px] h-[22px] px-1.5 inline-flex items-center justify-center rounded-md bg-[var(--sev-bg)] text-[var(--sev-color)] font-[var(--font-mono)] text-[11px] font-bold shrink-0 mt-px border border-[var(--sev-border)]">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="m-0 font-[var(--font-body)] text-[13.5px] font-semibold text-[#1A1A1A] leading-[1.45]">
                        {r.title}
                      </p>
                      {r.detail && (
                        <p className="mt-0.5 mb-0 font-[var(--font-body)] text-[12.5px] text-[#6B7280] leading-[1.55]">
                          {r.detail}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RulesAccordion() {
  return (
    <div className="mb-2">
      {/* Section heading */}
      <p className="font-[var(--font-mono)] text-[10.5px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mt-1.5 mb-2">
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
      className="absolute -top-0.5 -bottom-0.5 left-[var(--tick-pos)] w-[1.5px] bg-[rgba(15,23,42,0.42)] rounded-[1px]"
      // eslint-disable-next-line react/forbid-dom-props -- dynamic horizontal position (% across meter)
      style={{ ['--tick-pos' as string]: `${pct}%` }}
    />
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${
        ok ? 'bg-[#10B981] shadow-[0_0_0_2px_rgba(16,185,129,0.18)]' : 'bg-[#D1D5DB]'
      }`}
    />
  );
}

/**
 * Consent / rules screen shown before every test attempt.
 *
 * Design: neutral callout style that matches the rest of the app. No red /
 * orange block-captions inside the rules cards - all section labels are
 * uppercase grey mono (like field labels elsewhere). The warning icon in
 * the header is also neutral grey - we've already told the user this is
 * a test, they don't need a yellow hazard sign.
 */
export default function TestStartConsent({
  testLabel, questionCount, timeMinutes, onAccept, onDecline,
}: TestStartConsentProps) {
  const [agreed, setAgreed] = useState(false);
  const [confirmedClean, setConfirmedClean] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const canStart = agreed && confirmedClean && mediaReady && calibrated;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
      className="p-[clamp(16px,4vw,32px)] bg-[#F5F6F8] rounded-[clamp(12px,2vw,20px)]"
    >
      {/* Label */}
      <p className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] mt-0 mb-2">
        {testLabel}
      </p>

      {/* Title + neutral icon */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-9 h-9 rounded-[10px] bg-white text-[#6B7280] inline-flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11" />
          </svg>
        </span>
        <h3 className="font-[var(--font-display)] text-[22px] font-bold text-[#1A1A1A] m-0 tracking-[-0.02em] leading-[1.2]">
          Правила прохождения теста
        </h3>
      </div>

      {/* Live camera + microphone preview - proves the user's hardware
           works before they commit to starting the test. */}
      <MediaCheck onReady={setMediaReady} onCalibrated={setCalibrated} />

      <RulesAccordion />

      {/* Pre-flight requirements card */}
      <div className="bg-white rounded-xl px-5 py-[18px] mb-[18px] border-l-[3px] border-l-[#3B82F6]">
        <p className="font-[var(--font-mono)] text-[10.5px] font-bold text-[#2563EB] uppercase tracking-[0.08em] mt-0 mb-2.5">
          Перед стартом проверьте
        </p>
        <ul className="m-0 pl-[18px] font-[var(--font-body)] text-[13.5px] text-[#374151] leading-[1.7] list-disc">
          <li>Камера и микрофон включены, лицо хорошо освещено</li>
          <li>Никаких наушников, гарнитур, earbuds в ушах</li>
          <li>Тест не запущен из удалённого рабочего стола или виртуальной машины</li>
          <li>Стол свободен от телефона, листов с конспектами и второго монитора</li>
          <li>Дверь закрыта, рядом нет людей - никто не появится в кадре</li>
        </ul>
      </div>

      {/* Test params - chip pills in the muted-neutral palette */}
      <div className="flex gap-2.5 mb-[18px]">
        <div className="flex-1 px-4 py-3 bg-white rounded-xl flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-[#F5F6F8] text-[#6B7280] inline-flex items-center justify-center">
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11" />
            </svg>
          </span>
          <div>
            <p className="font-[var(--font-mono)] text-[10px] text-[#9CA3AF] uppercase tracking-[0.06em] m-0">Вопросов</p>
            <p className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] m-0">{questionCount}</p>
          </div>
        </div>
        <div className="flex-1 px-4 py-3 bg-white rounded-xl flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-[#F5F6F8] text-[#6B7280] inline-flex items-center justify-center">
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
            </svg>
          </span>
          <div>
            <p className="font-[var(--font-mono)] text-[10px] text-[#9CA3AF] uppercase tracking-[0.06em] m-0">Время</p>
            <p className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] m-0">{timeMinutes} мин</p>
          </div>
        </div>
      </div>

      {/* Self-attestation: user explicitly confirms they removed forbidden
          items / are not wearing headphones. Backstop for cases where
          auto-detection (device labels, object detector) misses the item. */}
      <label className="flex items-start gap-3 px-4 py-3.5 bg-white rounded-xl cursor-pointer mb-2.5 transition-[background-color] duration-[180ms] relative">
        <input
          type="checkbox"
          checked={confirmedClean}
          onChange={(e) => setConfirmedClean(e.target.checked)}
          className="absolute opacity-0 w-0 h-0"
        />
        <span
          className={`w-5 h-5 rounded-md inline-flex items-center justify-center shrink-0 mt-px transition-[background-color,box-shadow] duration-150 ${
            confirmedClean
              ? 'bg-[#3B82F6] shadow-none'
              : 'bg-[#F5F6F8] shadow-[0_0_0_1px_#E2E4EA_inset]'
          }`}
        >
          {confirmedClean && (
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
              stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          )}
        </span>
        <span className="font-[var(--font-body)] text-sm font-medium text-[#1A1A1A] leading-[1.5]">
          На мне нет наушников и гарнитуры, на столе нет телефона, книги, второго экрана и других посторонних предметов.
        </span>
      </label>

      {/* Consent - matches the checkbox look used elsewhere in the app
          (square with black tick on check, white 1px shadow idle). */}
      <label className="flex items-start gap-3 px-4 py-3.5 bg-white rounded-xl cursor-pointer mb-[18px] transition-[background-color] duration-[180ms] relative">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="absolute opacity-0 w-0 h-0"
        />
        <span
          className={`w-5 h-5 rounded-md inline-flex items-center justify-center shrink-0 mt-px transition-[background-color,box-shadow] duration-150 ${
            agreed
              ? 'bg-[#3B82F6] shadow-none'
              : 'bg-[#F5F6F8] shadow-[0_0_0_1px_#E2E4EA_inset]'
          }`}
        >
          {agreed && (
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
              stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          )}
        </span>
        <span className="font-[var(--font-body)] text-sm font-medium text-[#1A1A1A] leading-[1.5]">
          Я прочитал правила, согласен с ними и понимаю последствия нарушений.
        </span>
      </label>

      {/* P1-A11Y-2 — Accessibility fallback link.
          Some users physically cannot use a webcam (motor disability,
          prosthetic, wheelchair-bound with restricted line of sight).
          We don't lock them out; instead we surface a mailto link to
          arrange examiner-supervised testing (proctor-code mode reuses
          the existing 4-eye editorial inviting flow). */}
      <p className="mt-3 text-xs text-[#6B7280] text-center leading-[1.55]">
        Не можете использовать камеру (нарушения подвижности, протез, технические причины)?{' '}
        <a
          href="mailto:hello@bordik.app?subject=Accessibility%3A%20alternative%20proctoring"
          className="text-[#3B82F6] underline"
        >
          Запросить тест без камеры
        </a>
      </p>

      {/* Actions */}
      <div className="flex gap-2.5 justify-end">
        <button
          onClick={onDecline}
          className="px-5 py-2.5 rounded-[10px] bg-transparent text-[#6B7280] hover:text-[#1A1A1A] border-0 cursor-pointer font-[var(--font-body)] text-[13px] font-semibold transition-[color] duration-[180ms]"
        >
          Отмена
        </button>
        <button
          onClick={() => {
            // Fire-and-forget: log the consent acceptance for legal evidence.
            // Failure does not block the test start — see lib/consent.ts.
            void import('@/lib/consent').then(({ recordConsent }) => {
              recordConsent('proctoring_camera', true);
            });
            onAccept();
          }}
          disabled={!canStart}
          title={
            !mediaReady       ? 'Дождитесь, пока камера и микрофон будут готовы'
            : !calibrated     ? 'Сначала зафиксируйте положение камеры'
            : !confirmedClean ? 'Подтвердите, что убрали посторонние предметы и наушники'
            : !agreed         ? 'Сначала примите правила'
            : undefined
          }
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] border-0 font-[var(--font-body)] text-[13px] font-semibold transition-[background-color] duration-[180ms] ${
            canStart
              ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white cursor-pointer'
              : 'bg-[#E2E4EA] text-[#9CA3AF] cursor-not-allowed'
          }`}
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
