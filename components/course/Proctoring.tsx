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
import { log } from '@/lib/log';

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

/** Detect low-power / mobile device once on the client. Used to throttle
 *  every rAF loop in this component so the test stays smooth on phones. */
function detectLowPower(): boolean {
  if (typeof window === 'undefined') return false;
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  // navigator.deviceMemory is non-standard but supported in Chromium.
  // Treat ≤ 4 GB or unknown-but-coarse as "low power".
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mem = (navigator as any).deviceMemory as number | undefined;
  return narrow || coarse || (typeof mem === 'number' && mem <= 4);
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
  // Detected once on mount. We use it to throttle every analysis loop
  // and lower the camera resolution on phones / low-RAM devices.
  // Audit B-7: lazy initialiser pattern instead of `useRef(false) +
  // useEffect`. Pre-fix the ref was `false` during the render that
  // declared monitoring effects, then updated by a follow-up effect.
  // Monitoring effects ran ONCE on mount and captured `lowPowerRef
  // .current` into a local const — if the timing changed (effect order,
  // suspense boundary) they could lock in the placeholder `false`.
  // `useState(() => detectLowPower())` guarantees the value is correct
  // on the FIRST render, before any monitoring effects fire. We use
  // useState (not useRef) so React knows about the value and can
  // include it in effect deps if needed later. Initial-state function
  // runs once per component instance, same cost as the previous effect.
  const [lowPower] = useState(() => detectLowPower());
  const lowPowerRef = useRef<boolean>(lowPower);
  lowPowerRef.current = lowPower;

  // ── Acquire stream once, release on unmount or when `active` flips off
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let acquired: MediaStream | null = null;
    // Smaller resolution on mobile - getImageData scans, MediaPipe inference
    // and FFT are all O(pixels). 240x180 is plenty for face detection while
    // 4× cheaper than 320x240 to process.
    const lp = detectLowPower();
    const videoConstraints = lp
      ? { width: 240, height: 180, frameRate: 24, facingMode: 'user' }
      : { width: 320, height: 240, facingMode: 'user' };
    navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
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
    let lastAnalysis = 0;
    const lp = lowPowerRef.current;
    // FFT + integration is O(fftSize). At 60Hz that's a noticeable chunk of
    // main-thread budget on phones. Throttle the actual analysis to 10Hz
    // on mobile / 30Hz on desktop - violation-detection holds are 1+ sec
    // anyway so this loses no fidelity.
    const ANALYSIS_PERIOD = lp ? 100 : 33;
    const tick = () => {
      const now = performance.now();
      if (now - lastAnalysis < ANALYSIS_PERIOD) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastAnalysis = now;
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] ?? 0;
      const avg = sum / data.length;
      // (now defined above; keep variable name in scope)
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
      // Audit B-9: WebAudio cleanup is best-effort. Source disconnection
      // can throw if the source was already detached (e.g. mid-cleanup
      // race); AudioContext.close() rejects on already-closed contexts.
      // Both are no-ops that don't need a Sentry breadcrumb.
      try { src.disconnect(); } catch {/* docs: silent ok */}
      try { ctx.close(); } catch {/* docs: silent ok */}
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
    let lastAnalysis = 0;
    // Was running at 60Hz - that's tens of thousands of pixel ops per second
    // for no benefit. Brightness/blur thresholds use 1.5-2 second hold times,
    // so 4Hz on mobile / 10Hz on desktop is more than enough.
    const FRAME_PERIOD = lowPowerRef.current ? 250 : 100;
    const tick = () => {
      const tnow = performance.now();
      if (tnow - lastAnalysis < FRAME_PERIOD) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastAnalysis = tnow;
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
            const y = 0.299 * (px[i] ?? 0) + 0.587 * (px[i + 1] ?? 0) + 0.114 * (px[i + 2] ?? 0);
            lum[p] = y;
            sum += y;
          }
          const avg = sum / (w * h);
          let edges = 0; let n = 0;
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const c = lum[y * w + x] ?? 0;
              edges += Math.abs(c - (lum[y * w + x + 1] ?? 0));
              edges += Math.abs(c - (lum[(y + 1) * w + x] ?? 0));
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
        } catch {
          // Audit B-9: getImageData inside RAF can throw on cross-origin
          // canvas taint or readback failure (rare GPU driver issue).
          // RAF fires 10-30×/sec — logging would flood. The detector
          // re-tries on the next frame; one missed frame is invisible
          // to the violation-hold heuristics (which require 1+ sec of
          // sustained signal). Silent is correct here.
        }
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
    } catch (e) {
      // Audit B-9: corrupted calibration baseline. Recovers by re-using
      // defaults; clinician's first frame becomes the implicit baseline.
      // Worth logging because a sustained spike could indicate sessionStorage
      // corruption (privacy mode, quota issue) needing investigation.
      log.warn({ event: 'proctoring_baseline_parse_failed', error: String(e).slice(0, 200) });
    }

    // Mobile: 5 fps face inference (200 ms). Desktop: 10 fps (100 ms).
    // Face landmarker + blendshapes is the heaviest single op in this
    // component - 5 fps on phones halves the CPU load with no UX regression
    // because all detection holds are ≥500 ms anyway.
    const FACE_PERIOD = lowPowerRef.current ? 200 : 100;
    const loop = async () => {
      if (stopped) return;
      const now = performance.now();
      if (now - lastInfer < FACE_PERIOD) {
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
          while (lipHits.length && now - (lipHits[0] ?? now) > LIP_TALK_WINDOW_MS) lipHits.shift();
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
    // Object detector is heavy and a forbidden item rarely flickers in/out
    // in <1 sec, so we can cut to ~1 fps on mobile / 3 fps on desktop.
    const OBJ_PERIOD = lowPowerRef.current ? 900 : 350;

    const loop = async () => {
      if (stopped) return;
      const now = performance.now();
      if (now - lastInfer < OBJ_PERIOD) {
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
          if (top) onViolation('object-' + top.cls);
        }
      } catch {
        // Audit B-9: object detector load failure. The model loader
        // surfaces its own status via aiModelStatus state, and this
        // is the per-frame inference loop — logging would flood at
        // 4-10 Hz. Setup-time failures are caught earlier with a user
        // banner ("AI-модель прокторинга недоступна"); silent skip
        // here is the correct fallback.
      }

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
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,23,42,0.6)] backdrop-blur-[6px] p-5">
        <div className="max-w-[440px] w-full bg-white rounded-[18px] pt-7 px-7 pb-6 text-center shadow-[0_24px_48px_rgba(15,23,42,0.24)]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[14px] bg-[#FEF2F2] text-[#B91C1C] mb-[14px]">
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h3 className="font-[var(--font-display)] text-lg font-bold text-[#1A1A1A] mt-0 mb-2 mx-0 tracking-[-0.01em]">
            Доступ к камере и микрофону обязателен
          </h3>
          <p className="font-[var(--font-body)] text-[13.5px] text-[#6B7280] leading-[1.55] mt-0 mb-5 mx-0">
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
            className="py-2.5 px-[18px] rounded-[10px] bg-[#3B82F6] text-white border-none cursor-pointer font-[var(--font-body)] text-[13px] font-semibold"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white">
        <div className="text-center font-[var(--font-body)] text-sm text-[#6B7280] leading-[1.6]">
          <div className="w-9 h-9 mx-auto mb-3 border-[3px] border-[#E2E4EA] border-t-[#3B82F6] rounded-full animate-[spin_0.9s_linear_infinite]" />
          <p>Запрашиваем доступ к камере и микрофону…</p>
          <p className="text-xs text-[#9CA3AF] mt-1.5">
            Разрешите доступ в подсказке браузера, чтобы начать тест.
          </p>
        </div>
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const statusBg = faceState.status === 'error'
    ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]'
    : faceState.status === 'ready'
      ? 'bg-white/85 text-[#64748B] border-[#E2E8F0]'
      : 'bg-[#FFF7ED] text-[#9A3412] border-[#FCD34D]';
  const statusDot = faceState.status === 'error'
    ? 'bg-[#DC2626]'
    : faceState.status === 'ready'
      ? 'bg-[#10B981]'
      : 'bg-[#F59E0B]';
  return (
    <>
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className="fixed right-4 bottom-4 w-[clamp(120px,18vw,180px)] aspect-[4/3] rounded-[12px] bg-black object-cover z-[60] shadow-[0_12px_32px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.6)]"
      />
      {/* Discreet bottom-of-screen proctoring status pill — visible enough
           to confirm detection is alive, but not so prominent that it
           steals attention from the test content. Errors get a clearly
           red palette so the user can't miss a model failure. */}
      <div className={`fixed bottom-[14px] left-4 z-[61] inline-flex items-center gap-2 py-[5px] px-[11px] rounded-full border shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${lowPowerRef.current ? '' : 'backdrop-blur-[6px]'} font-[var(--font-mono)] text-[10.5px] font-semibold tracking-[0.03em] max-w-[70vw] whitespace-nowrap ${statusBg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
        {faceState.status === 'error' ? (
          <>прокторинг: ошибка - {faceState.error ?? 'unknown'}</>
        ) : faceState.status === 'ready' ? (
          <>прокторинг активен · лиц {faceState.faces} · yaw {faceState.yaw.toFixed(2)} · мик {audioDb} dB</>
        ) : (
          <>загружаем AI-модель прокторинга…</>
        )}
      </div>

      {/* Compact REC dot on the preview itself */}
      <div className="fixed right-6 bottom-[calc(clamp(120px,18vw,180px)*0.75+22px)] inline-flex items-center gap-1.5 py-[3px] px-[9px] rounded-full bg-[#1A1A1A] text-white font-[var(--font-mono)] text-[10px] font-bold tracking-[0.08em] uppercase z-[61]">
        <span className="w-[7px] h-[7px] rounded-full bg-[#F87171]" />
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
