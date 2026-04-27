'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from './store';

/**
 * Auto-tracks study time while a course is open.
 * Saves every 10 seconds to avoid excessive writes.
 */
export function useStudyTimer(courseId: string | null) {
  const addStudyTime = useAppStore((s) => s.addStudyTime);
  const accumulatedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!courseId) return;

    accumulatedRef.current = 0;

    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        accumulatedRef.current += 1;
        if (accumulatedRef.current >= 10) {
          addStudyTime(courseId, accumulatedRef.current);
          accumulatedRef.current = 0;
        }
      }, 1000);
    };
    const stop = () => {
      if (!intervalRef.current) return;
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      // Flush partial bucket so the user doesn't lose seconds on tab switch
      if (accumulatedRef.current > 0) {
        addStudyTime(courseId, accumulatedRef.current);
        accumulatedRef.current = 0;
      }
    };

    // Run only while the tab is visible. On mobile this also pauses when
    // the user switches apps - saves battery and avoids the ticker getting
    // throttled by the browser to 1Hz/30s anyway.
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [courseId, addStudyTime]);
}
