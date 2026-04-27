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

export interface FaceFrameStats {
  /** True iff exactly one face was detected. */
  hasFace: boolean;
  /** True iff more than one face is in the frame. */
  multipleFaces: boolean;
  /** Vertical distance between the inner-lip points, normalised by face
   *  height (0 = closed, ~0.04+ = open mouth). */
  lipAperture: number;
}

export function analyseFaceFrame(result: FaceLandmarkerResult): FaceFrameStats {
  const sets = result.faceLandmarks ?? [];
  const hasFace = sets.length === 1;
  const multipleFaces = sets.length > 1;
  let lipAperture = 0;
  if (sets.length >= 1) {
    const lm = sets[0];
    const upper = lm[UPPER_LIP_INNER];
    const lower = lm[LOWER_LIP_INNER];
    const top = lm[FACE_TOP];
    const bot = lm[FACE_BOTTOM];
    if (upper && lower && top && bot) {
      const lipDist  = Math.abs(lower.y - upper.y);
      const faceDist = Math.abs(bot.y - top.y) || 1;
      lipAperture = lipDist / faceDist;
    }
  }
  return { hasFace, multipleFaces, lipAperture };
}
