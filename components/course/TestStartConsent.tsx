'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFaceLandmarker } from '@/lib/proctoring/face';
import { getObjectDetector, findForbiddenObjects } from '@/lib/proctoring/objects';

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
        console.error('[proctoring] AI model load failed:', err);
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
    setTimeout(() => setEnvChecking(false), 350);
  }, [stream]);

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
      if (idx >= 0 && prev[idx].text === text) return prev;
      const next = prev.filter((h) => h.id !== 'ai-failed');
      return [...next, { id: 'ai-failed', level: 'block', text }];
    });
  }, [aiModelStatus, aiError]);

  // Tell parent whether calibration is done. Calibration also auto-resets
  // if the user later changes camera quality (e.g. the camera goes dark).
  useEffect(() => {
    onCalibrated(calibStatus === 'done');
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const r = data[i], g = data[i + 1], b = data[i + 2];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, aiModelStatus]);

  // Reset calibration if any object is currently detected - the user has
  // to clear the desk and re-fixate.
  useEffect(() => {
    const hasObject = hints.some((h) => h.id.startsWith('object-'));
    if (hasObject && calibStatus === 'done') {
      setCalibStatus('idle');
      try { sessionStorage.removeItem('proctoring-baseline'); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      borderLeft: '3px solid #3B82F6',
    }}>
    <div style={{
      display: isNarrow ? 'flex' : 'grid',
      flexDirection: isNarrow ? 'column' : undefined,
      gridTemplateColumns: isNarrow ? undefined : 'auto minmax(0, 1fr)',
      columnGap: 14,
      rowGap: isNarrow ? 12 : undefined,
      alignItems: isNarrow ? 'stretch' : 'center',
    }}>
      {/* Video preview */}
      <div style={{
        position: 'relative',
        width: isNarrow ? '100%' : 132,
        height: isNarrow ? 180 : 100,
        borderRadius: 10,
        background: '#0F172A',
        overflow: 'hidden',
        flexShrink: 0,
        aspectRatio: isNarrow ? '16 / 9' : undefined,
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
        {/* Audio meter - fill width is the live amplitude; coloured zones
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
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            margin: '10px 0 0',
          }}>
            <ul style={{
              margin: 0, padding: 0,
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
            {/* Manual recheck - some platforms don't fire devicechange when
                a Bluetooth headset disconnects, or the user wants to re-try
                after they unplugged/removed something. */}
            <button
              type="button"
              onClick={runEnvCheck}
              disabled={envChecking}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                background: '#FFFFFF',
                color: '#1A1A1A',
                border: '1px solid #CBD5E1',
                fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                cursor: envChecking ? 'wait' : 'pointer',
                opacity: envChecking ? 0.65 : 1,
                transition: 'background 150ms, border-color 150ms',
              }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
                style={{
                  animation: envChecking ? 'consent-recheck-spin 0.8s linear infinite' : undefined,
                }}>
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
        <div style={{
          marginTop: 12,
          padding: '12px 14px',
          borderRadius: 10,
          background: calibStatus === 'done' ? '#ECFDF5' : '#F8FAFC',
          border: `1px solid ${calibStatus === 'done' ? '#A7F3D0' : '#E2E8F0'}`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            flexWrap: 'wrap',
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6,
              background: calibStatus === 'done' ? '#10B981' : '#94A3B8',
              color: '#FFFFFF',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
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
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                margin: 0,
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                color: '#1A1A1A', lineHeight: 1.4,
              }}>
                {calibStatus === 'done'
                  ? 'Камера зафиксирована'
                  : calibStatus === 'capturing'
                    ? 'Идёт калибровка - смотрите прямо в камеру'
                    : calibStatus === 'error'
                      ? 'Не удалось зафиксировать камеру'
                      : 'Зафиксируйте положение камеры'}
              </p>
              <p style={{
                margin: '2px 0 0',
                fontFamily: 'var(--font-body)', fontSize: 11.5, color: '#6B7280',
                lineHeight: 1.45,
              }}>
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
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  background: calibStatus === 'done' ? '#FFFFFF' : '#1A1A1A',
                  color: calibStatus === 'done' ? '#1A1A1A' : '#FFFFFF',
                  border: calibStatus === 'done' ? '1px solid #CBD5E1' : 'none',
                  fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                {calibStatus === 'done' ? 'Перекалибровать' : 'Зафиксировать'}
              </button>
            )}
          </div>
          {calibStatus === 'capturing' && (
            <div style={{
              marginTop: 10, height: 4, borderRadius: 999,
              background: '#E2E8F0', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${calibProgress * 100}%`,
                background: '#3B82F6',
                transition: 'width 90ms linear',
              }} />
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
    <div style={{
      background: '#FFFFFF', borderRadius: 14,
      marginBottom: 12,
      border: `1px solid ${m.border}`,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={open}
      >
        <span style={{
          width: 32, height: 32, borderRadius: 8,
          background: m.bg, color: m.color,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          border: `1px solid ${m.border}`,
        }}>
          <SeverityIcon severity={severity} />
        </span>
        <h4 style={{
          margin: 0, flex: 1,
          fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
          color: '#1A1A1A', letterSpacing: '-0.01em',
        }}>
          {m.title}
        </h4>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          color: '#9CA3AF',
        }}>
          {rules.length}
        </span>
        <motion.svg
          width={16} height={16} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
          style={{ color: '#6B7280', flexShrink: 0 }}
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
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 18px' }}>
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
                    display: 'flex', gap: 12,
                    paddingTop: 10,
                    borderTop: i === 0 ? 'none' : '1px solid #F0F1F5',
                  }}>
                    <span style={{
                      minWidth: 22, height: 22, padding: '0 6px',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 6,
                      background: m.bg, color: m.color,
                      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                      flexShrink: 0, marginTop: 1,
                      border: `1px solid ${m.border}`,
                    }}>
                      {i + 1}
                    </span>
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
          </motion.div>
        )}
      </AnimatePresence>
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
      style={{
        padding: 'clamp(16px, 4vw, 32px)',
        background: '#F5F6F8',
        borderRadius: 'clamp(12px, 2vw, 20px)',
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

      {/* Live camera + microphone preview - proves the user's hardware
           works before they commit to starting the test. */}
      <MediaCheck onReady={setMediaReady} onCalibrated={setCalibrated} />

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
          <li>Дверь закрыта, рядом нет людей - никто не появится в кадре</li>
        </ul>
      </div>

      {/* Test params - chip pills in the muted-neutral palette */}
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

      {/* Self-attestation: user explicitly confirms they removed forbidden
          items / are not wearing headphones. Backstop for cases where
          auto-detection (device labels, object detector) misses the item. */}
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px',
        background: '#FFFFFF',
        borderRadius: 12,
        cursor: 'pointer',
        marginBottom: 10,
        transition: 'background 180ms',
      }}>
        <input
          type="checkbox"
          checked={confirmedClean}
          onChange={(e) => setConfirmedClean(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          width: 20, height: 20, borderRadius: 6,
          background: confirmedClean ? '#1A1A1A' : '#F5F6F8',
          boxShadow: confirmedClean ? 'none' : '0 0 0 1px #E2E4EA inset',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 1,
          transition: 'background 150ms, box-shadow 150ms',
        }}>
          {confirmedClean && (
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
          На мне нет наушников и гарнитуры, на столе нет телефона, книги, второго экрана и других посторонних предметов.
        </span>
      </label>

      {/* Consent - matches the checkbox look used elsewhere in the app
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
            !mediaReady       ? 'Дождитесь, пока камера и микрофон будут готовы'
            : !calibrated     ? 'Сначала зафиксируйте положение камеры'
            : !confirmedClean ? 'Подтвердите, что убрали посторонние предметы и наушники'
            : !agreed         ? 'Сначала примите правила'
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
