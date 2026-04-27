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

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

export function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (landmarkerPromise) return landmarkerPromise;
  landmarkerPromise = (async () => {
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    // Try GPU first (faster), fall back to CPU if WebGL fails — GPU
    // delegate is sometimes blocked in incognito or on locked-down
    // corporate Chrome.
    try {
      return await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 2,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
    } catch (gpuErr) {
      console.warn('[proctoring] GPU delegate failed, falling back to CPU:', gpuErr);
      return await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numFaces: 2,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
    }
  })();
  return landmarkerPromise;
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
  /** Vertical pitch ratio similar to yaw (above/below eye line). */
  pitch: number;
}

export function analyseFaceFrame(result: FaceLandmarkerResult): FaceFrameStats {
  const sets = result.faceLandmarks ?? [];
  const hasFace = sets.length === 1;
  const multipleFaces = sets.length > 1;
  let lipAperture = 0;
  let yaw = 0;
  let pitch = 0;
  if (sets.length >= 1) {
    const lm = sets[0];
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
  }
  return { hasFace, multipleFaces, lipAperture, yaw, pitch };
}
