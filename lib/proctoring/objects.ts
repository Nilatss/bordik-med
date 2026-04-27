/**
 * MediaPipe ObjectDetector for proctoring — flags forbidden items in
 * the camera frame (phone, book, laptop, keyboard, monitor).
 *
 * Uses the EfficientDet-Lite0 COCO model (~4 MB). Loads from Google's
 * mediapipe-models CDN once and is cached by the browser.
 */

import {
  ObjectDetector,
  FilesetResolver,
  type ObjectDetectorResult,
} from '@mediapipe/tasks-vision';

const WASM_BASE  = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm';
const MODEL_URL  = 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/latest/efficientdet_lite0.tflite';

/* COCO classes we care about (others are silently ignored). */
export const FORBIDDEN_OBJECTS: Record<string, string> = {
  'cell phone': 'телефон',
  'book':       'книга / блокнот',
  'laptop':     'ноутбук',
  'tv':         'монитор / телевизор',
  'keyboard':   'внешняя клавиатура',
  'remote':     'пульт',
  'mouse':      'компьютерная мышь рядом с другим устройством',
};

let detectorPromise: Promise<ObjectDetector> | null = null;

export function getObjectDetector(): Promise<ObjectDetector> {
  if (detectorPromise) return detectorPromise;
  const p = (async () => {
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    try {
      return await ObjectDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        scoreThreshold: 0.4,
        runningMode: 'VIDEO',
        maxResults: 5,
      });
    } catch {
      return await ObjectDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
        scoreThreshold: 0.4,
        runningMode: 'VIDEO',
        maxResults: 5,
      });
    }
  })();
  // Drop cached rejection on failure so a manual retry can re-fetch.
  p.catch(() => { detectorPromise = null; });
  detectorPromise = p;
  return detectorPromise;
}

/** Force a fresh load on next call - used by the "Проверить заново" button. */
export function resetObjectDetector(): void {
  detectorPromise = null;
}

export interface ForbiddenHit {
  /** Lower-cased COCO class name (e.g. "cell phone"). */
  cls: string;
  /** Russian label for UI. */
  label: string;
  score: number;
}

export function findForbiddenObjects(result: ObjectDetectorResult): ForbiddenHit[] {
  const out: ForbiddenHit[] = [];
  for (const det of result.detections ?? []) {
    for (const cat of det.categories ?? []) {
      const name = (cat.categoryName ?? '').toLowerCase();
      const ru = FORBIDDEN_OBJECTS[name];
      if (ru) out.push({ cls: name, label: ru, score: cat.score });
    }
  }
  return out;
}
