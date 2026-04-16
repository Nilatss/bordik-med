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

    // Tick every second
    intervalRef.current = setInterval(() => {
      accumulatedRef.current += 1;

      // Flush to store every 10 seconds
      if (accumulatedRef.current >= 10) {
        addStudyTime(courseId, accumulatedRef.current);
        accumulatedRef.current = 0;
      }
    }, 1000);

    return () => {
      // Flush remaining on unmount
      if (accumulatedRef.current > 0) {
        addStudyTime(courseId, accumulatedRef.current);
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [courseId, addStudyTime]);
}
