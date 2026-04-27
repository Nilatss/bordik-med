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
import { getFaceLandmarker, analyseFaceFrame } from '@/lib/proctoring/face';
import { getObjectDetector, findForbiddenObjects } from '@/lib/proctoring/objects';

interface ProctoringProps {
  /** Called whenever a suspicious action is detected. Same callback the
   *  rest of TestGuard uses so violations accumulate together. */
  onViolation: (reason?: string) => void;
  /** Soft warning — shown as a transient banner, doesn't bump the
   *  3-strikes counter. Used for sustained loud audio (above the
   *  natural-speech band but below the cheating threshold). */
  onWarning?: (reason: string, message: string) => void;
  /** Hard end — camera or microphone went away mid-test. Test ends
   *  immediately with the user's progress recorded as a failed attempt. */
  onForceEnd?: (reason: string) => void;
  /** Active state — when false, the overlay does nothing (stream stays
   *  released). The parent component disables monitoring when the test
   *  finishes / aborts. */
  active: boolean;
  /** Set by the parent to learn whether permissions were granted. The
   *  test overlay won't render its content until this returns true. */
  onReadyChange?: (ready: boolean) => void;
}

// Audio levels — getByteFrequencyData returns 0..255 mapped from
// minDecibels (default -100 dB) to maxDecibels (0 dB). Empirically:
//   <8   = silent room          → silence detector
//   8–25 = ambient typing/HVAC  → natural
//   25–40 = normal speech       → warn band
//   40+ = loud speech / shouting → violation
const AUDIO_NATURAL_MAX_AMP    = 25;
const AUDIO_WARNING_AMP        = 30;
const AUDIO_VIOLATION_AMP      = 45;
const AUDIO_HOLD_MS            = 1200;
const AUDIO_RESET_MS           = 9000;
// Silence band — if the mic stays this quiet for SILENCE_HOLD_MS the user
// is either muted at the OS level or is doing something we can't hear.
const AUDIO_SILENCE_AMP        = 3;
const AUDIO_SILENCE_HOLD_MS    = 15_000; // 15 seconds of dead silence
const AUDIO_SILENCE_RESET_MS   = 45_000;
const FRAME_DARK_THRESHOLD     = 18;
const FRAME_DARK_HOLD_MS       = 2000;
const FRAME_RESET_MS           = 15000;
// Camera sharpness watchdog — if the camera goes from "in-focus" at the
// start to "blurry" mid-test, the user almost certainly nudged or covered
// the lens. Sustained drop = immediate test termination.
const FRAME_SHARP_BLUR_LIMIT   = 3;     // edge-magnitude per pixel below this = blurry
const FRAME_BLUR_HOLD_MS       = 1500;

// Face / lip / yaw detection thresholds
const FACE_MISSING_HOLD_MS     = 2000;
const FACE_MISSING_RESET_MS    = 8000;
const MULTI_FACE_RESET_MS      = 10000;
const LIP_APERTURE_THRESHOLD   = 0.010;
const LIP_TALK_HITS_REQUIRED   = 5;
const LIP_TALK_WINDOW_MS       = 2000;
const LIP_TALK_RESET_MS        = 8000;
const YAW_TURNED_THRESHOLD     = 0.12;   // |yaw| > this → head turned to the side
const YAW_TURNED_HOLD_MS       = 350;
const YAW_TURNED_RESET_MS      = 4000;
// Pitch — head tilted up/down. Pitch is in head-aspect-ratio units; the
// resting pose already sits around ±0.10–0.15 depending on camera height,
// so the threshold has to be quite forgiving to avoid false positives.
const PITCH_TILTED_THRESHOLD   = 0.35;
const PITCH_TILTED_HOLD_MS     = 1500;
const PITCH_TILTED_RESET_MS    = 6000;
// Eye gaze — blendshape sum, 0..1. 0.35 = clearly looking sideways with eyes
// (without turning head). Holds shorter than head — eyes move quickly.
const GAZE_OFF_THRESHOLD       = 0.35;
const GAZE_OFF_HOLD_MS         = 700;
const GAZE_OFF_RESET_MS        = 5000;

// Convert 0–255 amplitude to a friendly approximate dBFS for tooltips.
function ampToDb(amp: number): number {
  if (amp <= 0) return -100;
  return Math.round(20 * Math.log10(amp / 255));
}

export default function Proctoring({
  onViolation, onWarning, onForceEnd, active, onReadyChange,
}: ProctoringProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Visible debug — so the user can see at a glance whether face/audio
  // detection is actually running without opening DevTools.
  const [faceState, setFaceState] = useState<{
    status: 'loading' | 'ready' | 'error';
    faces: number;
    aperture: number;
    yaw: number;
    error?: string;
  }>({ status: 'loading', faces: 0, aperture: 0, yaw: 0 });

  // Pre-warm the cached models in parallel — the consent screen has
  // already loaded them in most cases, so this resolves immediately.
  // Once model promise settles, flip the badge to "ready" without waiting
  // for the first inference frame so the user doesn't see stale "loading".
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    Promise.all([
      import('@/lib/proctoring/face').then((m) => m.getFaceLandmarker()),
      import('@/lib/proctoring/objects').then((m) => m.getObjectDetector()),
    ])
      .then(() => {
        if (!cancelled) {
          setFaceState((prev) => prev.status === 'loading'
            ? { ...prev, status: 'ready' }
            : prev);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setFaceState((prev) => ({
            ...prev,
            status: 'error',
            error: err?.message?.slice(0, 80) || 'load-failed',
          }));
        }
      });
    return () => { cancelled = true; };
  }, [active]);
  const [audioDb, setAudioDb] = useState<number>(-100);

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

  // ── Audio level monitor — 3-tier:
  //   • below AUDIO_NATURAL_MAX_AMP → all good
  //   • AUDIO_WARNING_AMP held 1.5s   → soft warning (banner)
  //   • AUDIO_VIOLATION_AMP held 1.5s → hard violation (counter +1)
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
    let lastWarning = 0;
    let lastViolation = 0;
    let lastSilence = 0;
    let warningSince = 0;
    let violationSince = 0;
    let silenceSince = 0;
    let lastDbPush = 0;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length;
      const now = performance.now();
      // Throttle React re-renders to 5 Hz — pushing 60 Hz to setState causes
      // heavy main-thread reconciliation that visibly stutters CSS animations.
      if (now - lastDbPush > 200) {
        lastDbPush = now;
        setAudioDb(ampToDb(avg));
      }
      // Violation tier — overrides warning
      if (avg >= AUDIO_VIOLATION_AMP) {
        if (violationSince === 0) violationSince = now;
        else if (
          now - violationSince > AUDIO_HOLD_MS &&
          now - lastViolation > AUDIO_RESET_MS
        ) {
          lastViolation = now;
          violationSince = 0;
          warningSince = 0;
          onViolation('audio-loud');
        }
      } else {
        violationSince = 0;
      }
      // Warning tier (between natural and violation)
      if (avg >= AUDIO_WARNING_AMP && avg < AUDIO_VIOLATION_AMP) {
        if (warningSince === 0) warningSince = now;
        else if (
          now - warningSince > AUDIO_HOLD_MS &&
          now - lastWarning > AUDIO_RESET_MS
        ) {
          lastWarning = now;
          warningSince = 0;
          onWarning?.(
            'audio-loud',
            `Слишком громко (${ampToDb(avg)} dB). Говорите тише — следующее превышение будет засчитано как нарушение.`,
          );
        }
      } else if (avg < AUDIO_NATURAL_MAX_AMP) {
        warningSince = 0;
      }
      // Silence tier — mic stuck below baseline (likely muted at OS level)
      if (avg <= AUDIO_SILENCE_AMP) {
        if (silenceSince === 0) silenceSince = now;
        else if (
          now - silenceSince > AUDIO_SILENCE_HOLD_MS &&
          now - lastSilence > AUDIO_SILENCE_RESET_MS
        ) {
          lastSilence = now;
          silenceSince = 0;
          onWarning?.(
            'audio-silent',
            'Микрофон не ловит ни звука — проверьте, что он не выключен в настройках системы.',
          );
        }
      } else {
        silenceSince = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      try { src.disconnect(); } catch {/* */}
      try { ctx.close(); } catch {/* */}
    };
  }, [stream, active, onViolation, onWarning]);

  // ── Camera frame monitor — measures both brightness (covered camera)
  //    and sharpness (sudden blur = lens was bumped/covered with cloth).
  useEffect(() => {
    if (!stream || !videoRef.current || !active) return;
    const canvas = document.createElement('canvas');
    canvas.width = 96; canvas.height = 72;
    const g = canvas.getContext('2d');
    if (!g) return;
    let lastDark = 0;
    let darkSince = 0;
    let blurSince = 0;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && v.readyState >= 2) {
        try {
          g.drawImage(v, 0, 0, canvas.width, canvas.height);
          const w = canvas.width, h = canvas.height;
          const px = g.getImageData(0, 0, w, h).data;
          // Brightness + luminance grid for sharpness
          const lum = new Float32Array(w * h);
          let sum = 0;
          for (let i = 0, p = 0; i < px.length; i += 4, p++) {
            const y = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
            lum[p] = y;
            sum += y;
          }
          const avg = sum / (w * h);
          let edges = 0; let n = 0;
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const c = lum[y * w + x];
              edges += Math.abs(c - lum[y * w + x + 1]);
              edges += Math.abs(c - lum[(y + 1) * w + x]);
              n++;
            }
          }
          const sharpness = edges / n;
          const now = performance.now();

          // Covered camera (very dark)
          if (avg < FRAME_DARK_THRESHOLD) {
            if (darkSince === 0) darkSince = now;
            else if (
              now - darkSince > FRAME_DARK_HOLD_MS &&
              now - lastDark > FRAME_RESET_MS
            ) {
              lastDark = now;
              darkSince = 0;
              onViolation('camera-covered');
            }
          } else {
            darkSince = 0;
          }

          // Suddenly blurry — instant termination, no tolerance.
          if (sharpness < FRAME_SHARP_BLUR_LIMIT && avg >= FRAME_DARK_THRESHOLD) {
            if (blurSince === 0) blurSince = now;
            else if (now - blurSince > FRAME_BLUR_HOLD_MS) {
              blurSince = 0;
              onViolation('camera-blurry');
              onForceEnd?.('camera-blurry');
              setError('Камера потеряла фокус — тест завершён.');
            }
          } else {
            blurSince = 0;
          }
        } catch { /* CORS or readback failure — ignore */ }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stream, active, onViolation, onForceEnd]);

  // ── Face landmark monitor — runs FaceMesh once per ~100 ms.
  //    Detects:  no face / multiple faces / lip movement (talking).
  useEffect(() => {
    if (!stream || !active || !videoRef.current) return;
    let stopped = false;
    let raf = 0;
    let lastInfer = 0;
    let prevAperture = -1;
    const lipHits: number[] = [];
    let lastLipTalk = 0;
    let lipTalkCount = 0;          // how many times we already triggered
    let missingSince = 0;
    let lastMissing = 0;
    let lastMulti = 0;
    let yawSince = 0;
    let lastYaw = 0;
    let yawTurnCount = 0;
    let pitchSince = 0;
    let lastPitch = 0;
    let pitchCount = 0;
    let gazeSince = 0;
    let lastGaze = 0;
    let gazeCount = 0;

    // Read calibration baseline captured on the consent screen — yaw/pitch
    // are *relative* to the user's natural pose, so a low-mounted webcam
    // doesn't constantly trip the pitch detector.
    let yawBase = 0, pitchBase = 0;
    try {
      const raw = sessionStorage.getItem('proctoring-baseline');
      if (raw) {
        const b = JSON.parse(raw);
        if (typeof b?.yaw === 'number') yawBase = b.yaw;
        if (typeof b?.pitch === 'number') pitchBase = b.pitch;
      }
    } catch {/* ignore parse errors */}

    const loop = async () => {
      if (stopped) return;
      const now = performance.now();
      // Throttle to ~10 inferences / second
      if (now - lastInfer < 100) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastInfer = now;

      try {
        const lm = await getFaceLandmarker();
        const v = videoRef.current;
        if (!v || v.readyState < 2) {
          raf = requestAnimationFrame(loop);
          return;
        }
        const r = lm.detectForVideo(v, now);
        const stats = analyseFaceFrame(r);
        setFaceState({
          status: 'ready',
          faces: r.faceLandmarks?.length ?? 0,
          aperture: stats.lipAperture,
          yaw: stats.yaw - yawBase,
        });

        // Multiple faces → instant violation (cooldown). Red banner only.
        if (stats.multipleFaces && now - lastMulti > MULTI_FACE_RESET_MS) {
          lastMulti = now;
          onViolation('face-multiple');
        }

        // No face for a while → warning
        if (!stats.hasFace && !stats.multipleFaces) {
          if (missingSince === 0) missingSince = now;
          else if (
            now - missingSince > FACE_MISSING_HOLD_MS &&
            now - lastMissing > FACE_MISSING_RESET_MS
          ) {
            lastMissing = now;
            missingSince = 0;
            onWarning?.(
              'face-missing',
              'Не вижу лица в кадре. Сядьте по центру и держите камеру направленной на лицо.',
            );
          }
        } else {
          missingSince = 0;
        }

        // Subtract calibrated baseline so the "neutral" pose reads ~0.
        const yawRel   = stats.yaw   - yawBase;
        const pitchRel = stats.pitch - pitchBase;

        // Head-turn detection — yaw ratio above threshold sustained.
        // 1st time = warning, 2nd+ = violation.
        if (stats.hasFace && Math.abs(yawRel) > YAW_TURNED_THRESHOLD) {
          if (yawSince === 0) yawSince = now;
          else if (
            now - yawSince > YAW_TURNED_HOLD_MS &&
            now - lastYaw > YAW_TURNED_RESET_MS
          ) {
            lastYaw = now;
            yawSince = 0;
            yawTurnCount += 1;
            if (yawTurnCount === 1) {
              onWarning?.(
                'face-turned',
                'Голова повёрнута в сторону. Смотрите прямо в камеру — следующее срабатывание будет нарушением.',
              );
            } else {
              onViolation('face-turned');
            }
          }
        } else {
          yawSince = 0;
        }

        // Head pitch detection — looking up or down for too long.
        if (stats.hasFace && Math.abs(pitchRel) > PITCH_TILTED_THRESHOLD) {
          if (pitchSince === 0) pitchSince = now;
          else if (
            now - pitchSince > PITCH_TILTED_HOLD_MS &&
            now - lastPitch > PITCH_TILTED_RESET_MS
          ) {
            lastPitch = now;
            pitchSince = 0;
            pitchCount += 1;
            const dir = pitchRel < 0 ? 'вверх' : 'вниз';
            if (pitchCount === 1) {
              onWarning?.(
                'face-pitch',
                `Голова сильно наклонена ${dir}. Держите лицо в кадре фронтально — следующее срабатывание будет нарушением.`,
              );
            } else {
              onViolation('face-pitch');
            }
          }
        } else {
          pitchSince = 0;
        }

        // Eye gaze detection — eyes off-center even if head stays still.
        const gazeMag = Math.max(Math.abs(stats.gazeX), Math.abs(stats.gazeY));
        if (stats.hasFace && gazeMag > GAZE_OFF_THRESHOLD) {
          if (gazeSince === 0) gazeSince = now;
          else if (
            now - gazeSince > GAZE_OFF_HOLD_MS &&
            now - lastGaze > GAZE_OFF_RESET_MS
          ) {
            lastGaze = now;
            gazeSince = 0;
            gazeCount += 1;
            if (gazeCount === 1) {
              onWarning?.(
                'eye-gaze',
                'Глаза смотрят не в экран. Сосредоточьтесь на тесте — следующее срабатывание будет нарушением.',
              );
            } else {
              onViolation('eye-gaze');
            }
          }
        } else {
          gazeSince = 0;
        }

        // Lip movement detection — sliding window of frames where the
        // aperture jumped more than the threshold; if too many in 2 s and
        // the audio level is in the silent band → likely whispering.
        if (stats.hasFace) {
          if (prevAperture >= 0) {
            const delta = Math.abs(stats.lipAperture - prevAperture);
            if (delta > LIP_APERTURE_THRESHOLD) lipHits.push(now);
          }
          prevAperture = stats.lipAperture;
          // Drop old hits outside the window
          while (lipHits.length && now - lipHits[0] > LIP_TALK_WINDOW_MS) lipHits.shift();
          if (
            lipHits.length >= LIP_TALK_HITS_REQUIRED &&
            now - lastLipTalk > LIP_TALK_RESET_MS
          ) {
            lastLipTalk = now;
            lipHits.length = 0;
            lipTalkCount += 1;
            if (lipTalkCount === 1) {
              onWarning?.(
                'lip-movement',
                'Замечено движение губ. Если вы что-то проговариваете — следующее срабатывание будет нарушением.',
              );
            } else {
              onViolation('lip-movement');
            }
          }
        } else {
          prevAperture = -1;
        }
      } catch (err: any) {
        setFaceState({
          status: 'error',
          faces: 0,
          aperture: 0,
          yaw: 0,
          error: err?.message?.slice(0, 80) || 'load-failed',
        });
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [stream, active, onViolation, onWarning]);

  // ── Object detector — phones, books, laptops, monitors in frame.
  //    Runs ~3 inferences / sec to keep CPU usage low. First detection
  //    of a forbidden object → instant violation (it's hard to detect a
  //    phone by accident, so no warning tier).
  useEffect(() => {
    if (!stream || !active || !videoRef.current) return;
    let stopped = false;
    let raf = 0;
    let lastInfer = 0;
    let lastViolation = 0;
    const RESET_MS = 8000;

    const loop = async () => {
      if (stopped) return;
      const now = performance.now();
      if (now - lastInfer < 350) {  // ~3 fps
        raf = requestAnimationFrame(loop);
        return;
      }
      lastInfer = now;

      try {
        const det = await getObjectDetector();
        const v = videoRef.current;
        if (!v || v.readyState < 2) {
          raf = requestAnimationFrame(loop);
          return;
        }
        const r = det.detectForVideo(v, now);
        const hits = findForbiddenObjects(r);
        if (hits.length > 0 && now - lastViolation > RESET_MS) {
          lastViolation = now;
          const top = hits.sort((a, b) => b.score - a.score)[0];
          // Red violation banner only (no duplicate yellow warning).
          onViolation('object-' + top.cls);
        }
      } catch { /* model load failure — silently skip */ }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => { stopped = true; cancelAnimationFrame(raf); };
  }, [stream, active, onViolation, onWarning]);

  // ── Track-ended monitor — camera or microphone went away mid-test.
  //    Per the proctoring spec this is an immediate test termination, not
  //    a "warn and continue". We notify the parent via onForceEnd; the
  //    parent records the attempt as a failed/aborted try.
  useEffect(() => {
    if (!stream || !active) return;
    const tracks = stream.getTracks();
    const handleEnded = (kind: 'camera' | 'microphone') => () => {
      const reason = kind === 'camera' ? 'camera-stopped' : 'microphone-stopped';
      const message = kind === 'camera'
        ? 'Камера отключилась. Тест завершён.'
        : 'Микрофон отключился. Тест завершён.';
      onViolation(reason);
      onForceEnd?.(reason);
      setError(message);
    };
    const handleVideoEnd = handleEnded('camera');
    const handleAudioEnd = handleEnded('microphone');
    stream.getVideoTracks().forEach((t) => t.addEventListener('ended', handleVideoEnd));
    stream.getAudioTracks().forEach((t) => t.addEventListener('ended', handleAudioEnd));
    return () => {
      stream.getVideoTracks().forEach((t) => t.removeEventListener('ended', handleVideoEnd));
      stream.getAudioTracks().forEach((t) => t.removeEventListener('ended', handleAudioEnd));
    };
  }, [stream, active, onViolation, onForceEnd]);

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
      {/* Discreet bottom-of-screen proctoring status pill — visible enough
           to confirm detection is alive, but not so prominent that it
           steals attention from the test content. Errors get a clearly
           red palette so the user can't miss a model failure. */}
      <div style={{
        position: 'fixed',
        bottom: 14, left: 16,
        zIndex: 61,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '5px 11px',
        borderRadius: 999,
        background: faceState.status === 'error' ? '#FEF2F2'
          : faceState.status === 'ready' ? 'rgba(255,255,255,0.85)'
          : '#FFF7ED',
        color: faceState.status === 'error' ? '#991B1B'
          : faceState.status === 'ready' ? '#64748B'
          : '#9A3412',
        border: `1px solid ${
          faceState.status === 'error' ? '#FCA5A5'
          : faceState.status === 'ready' ? '#E2E8F0'
          : '#FCD34D'
        }`,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        backdropFilter: 'blur(6px)',
        fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 600,
        letterSpacing: '0.03em',
        maxWidth: '70vw',
        whiteSpace: 'nowrap',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: faceState.status === 'error' ? '#DC2626'
            : faceState.status === 'ready' ? '#10B981'
            : '#F59E0B',
        }} />
        {faceState.status === 'error' ? (
          <>прокторинг: ошибка - {faceState.error ?? 'unknown'}</>
        ) : faceState.status === 'ready' ? (
          <>прокторинг активен · лиц {faceState.faces} · yaw {faceState.yaw.toFixed(2)} · мик {audioDb} dB</>
        ) : (
          <>загружаем AI-модель прокторинга…</>
        )}
      </div>

      {/* Compact REC dot on the preview itself */}
      <div style={{
        position: 'fixed',
        right: 24, bottom: 'calc(clamp(120px, 18vw, 180px) * 0.75 + 22px)',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 9px', borderRadius: 999,
        background: '#1A1A1A', color: '#FFFFFF',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        zIndex: 61,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: '#F87171',
        }} />
        REC
      </div>
      <style jsx global>{`
        @keyframes pulse {
          0%   { opacity: 1.00; }
          25%  { opacity: 0.85; }
          50%  { opacity: 0.55; }
          75%  { opacity: 0.85; }
          100% { opacity: 1.00; }
        }
      `}</style>
    </>
  );
}
