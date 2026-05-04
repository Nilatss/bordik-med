/**
 * MediaPipe FaceLandmarker wrapper for proctoring.
 *
 * Lazy-initialised once the proctoring overlay decides it needs face
 * tracking — keeps the heavy WASM + 3 MB model out of the initial bundle.
 *
 * Detects:
 *   • face presence (no face → user looked away or left the room)
 *   • lip aperture (running variance → talking / whispering)
 */

import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';

// P1-SEC-2 — self-hosted under public/mediapipe/wasm. Files copied from
// node_modules by scripts/sync-mediapipe.mjs on every prebuild. Drops
// our reliance on third-party cdn.jsdelivr.net for WASM supply chain.
const WASM_BASE = '/mediapipe/wasm';
// Self-hosted face landmarker weights. Downloaded into
// public/mediapipe/models/ by scripts/sync-mediapipe-models.mjs at
// build time. Avoids the previous reliance on
// storage.googleapis.com, which Russian ISPs sporadically block /
// throttle — that surfaced as "Failed to fetch" inside the proctoring
// AI loader before the camera/mic check would unlock the test.
const MODEL_URL = '/mediapipe/models/face_landmarker.task';

/**
 * MediaPipe writes "INFO: Created TensorFlow Lite XNNPACK delegate for CPU."
 * via console.error even though it's just informational. Next.js dev overlay
 * catches console.error and shows it as a red error popup, which is alarming.
 * Patch console.error once to swallow this specific MediaPipe info line.
 */
let mpLogPatched = false;
function patchMediaPipeInfoLogs() {
  if (mpLogPatched || typeof window === 'undefined') return;
  mpLogPatched = true;
  const orig = console.error.bind(console);
  console.error = (...args: any[]) => {
    const first = args[0];
    if (typeof first === 'string' && /XNNPACK delegate|TensorFlow Lite/i.test(first)) {
      // Demote MediaPipe's INFO messages to console.info — they aren't errors.
      console.info(...args);
      return;
    }
    orig(...args);
  };
}

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

export function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (landmarkerPromise) return landmarkerPromise;
  patchMediaPipeInfoLogs();
  const p = (async () => {
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    // Try GPU first (faster), fall back to CPU if WebGL fails — GPU
    // delegate is sometimes blocked in incognito or on locked-down
    // corporate Chrome.
    try {
      return await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 2,
        outputFaceBlendshapes: true,   // needed for eye gaze (eyeLook* shapes)
        outputFacialTransformationMatrixes: false,
      });
    } catch (gpuErr) {
      console.warn('[proctoring] GPU delegate failed, falling back to CPU:', gpuErr);
      return await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numFaces: 2,
        outputFaceBlendshapes: true,   // needed for eye gaze (eyeLook* shapes)
        outputFacialTransformationMatrixes: false,
      });
    }
  })();
  // If loading fails (CDN blocked, network error), drop the cached
  // rejection so a manual retry actually re-fetches.
  p.catch(() => { landmarkerPromise = null; });
  landmarkerPromise = p;
  return landmarkerPromise;
}

/** Force a fresh load on next call - used by the "Проверить заново" button
 *  when AI loading initially failed (CDN blocked, transient network). */
export function resetFaceLandmarker(): void {
  landmarkerPromise = null;
}

/** MediaPipe FaceMesh landmark indices for the centre of upper / lower lips. */
const UPPER_LIP_INNER = 13;
const LOWER_LIP_INNER = 14;
const FACE_TOP        = 10;   // hairline
const FACE_BOTTOM     = 152;  // chin
const NOSE_TIP        = 1;
const LEFT_EYE_OUTER  = 33;   // viewer's right
const RIGHT_EYE_OUTER = 263;  // viewer's left

export interface FaceFrameStats {
  hasFace: boolean;
  multipleFaces: boolean;
  lipAperture: number;
  /** Horizontal head-yaw ratio: 0 = facing forward, ±1 = nose at one of the
   *  outer eye corners (head fully turned). Values |x| > 0.35 mean the user
   *  is looking distinctly to the side. */
  yaw: number;
  /** Vertical pitch ratio: ≈0 forward, +x looking down, −x looking up. */
  pitch: number;
  /** Eye gaze X (horizontal) from blendshapes: −1 = looking left, +1 = right.
   *  Independent of head yaw — catches users glancing sideways without
   *  turning the head. */
  gazeX: number;
  /** Eye gaze Y (vertical): −1 = looking up, +1 = looking down. */
  gazeY: number;
}

/** Pull a blendshape score by name, 0 if absent. */
function bs(cats: Array<{ categoryName: string; score: number }>, name: string): number {
  const m = cats.find((c) => c.categoryName === name);
  return m ? m.score : 0;
}

export function analyseFaceFrame(result: FaceLandmarkerResult): FaceFrameStats {
  const sets = result.faceLandmarks ?? [];
  const hasFace = sets.length === 1;
  const multipleFaces = sets.length > 1;
  let lipAperture = 0;
  let yaw = 0;
  let pitch = 0;
  let gazeX = 0;
  let gazeY = 0;
  const lm = sets[0];
  if (lm) {
    const upper = lm[UPPER_LIP_INNER];
    const lower = lm[LOWER_LIP_INNER];
    const top = lm[FACE_TOP];
    const bot = lm[FACE_BOTTOM];
    const nose = lm[NOSE_TIP];
    const lEye = lm[LEFT_EYE_OUTER];
    const rEye = lm[RIGHT_EYE_OUTER];
    if (upper && lower && top && bot) {
      const lipDist  = Math.abs(lower.y - upper.y);
      const faceDist = Math.abs(bot.y - top.y) || 1;
      lipAperture = lipDist / faceDist;
    }
    if (nose && lEye && rEye) {
      const cx = (lEye.x + rEye.x) / 2;
      const halfX = Math.abs(rEye.x - lEye.x) / 2 || 1;
      yaw = (nose.x - cx) / halfX;
    }
    if (nose && top && bot) {
      const cy = (top.y + bot.y) / 2;
      const halfY = Math.abs(bot.y - top.y) / 2 || 1;
      pitch = (nose.y - cy) / halfY;
    }
    // Eye gaze from blendshapes (0..1 each).
    // MediaPipe blendshape names are from the avatar's perspective:
    //   eyeLookInLeft  = left eye rotated toward nose  → user looks RIGHT
    //   eyeLookOutLeft = left eye rotated away from nose → user looks LEFT
    //   eyeLookInRight = right eye rotated toward nose → user looks LEFT
    //   eyeLookOutRight = right eye rotated away → user looks RIGHT
    const blends = result.faceBlendshapes?.[0]?.categories;
    if (blends && blends.length > 0) {
      const inL  = bs(blends, 'eyeLookInLeft');
      const outL = bs(blends, 'eyeLookOutLeft');
      const inR  = bs(blends, 'eyeLookInRight');
      const outR = bs(blends, 'eyeLookOutRight');
      const upL  = bs(blends, 'eyeLookUpLeft');
      const upR  = bs(blends, 'eyeLookUpRight');
      const dnL  = bs(blends, 'eyeLookDownLeft');
      const dnR  = bs(blends, 'eyeLookDownRight');
      // Average both eyes; positive X = looking right, positive Y = down
      gazeX = ((inL + outR) - (outL + inR)) / 2;
      gazeY = ((dnL + dnR) - (upL + upR)) / 2;
    }
  }
  return { hasFace, multipleFaces, lipAperture, yaw, pitch, gazeX, gazeY };
}
