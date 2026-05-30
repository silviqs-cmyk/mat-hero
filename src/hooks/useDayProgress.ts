"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildDayProgressSummary,
  countCompletedDayProgressSteps,
  EMPTY_DAY_PROGRESS,
  getDayProgressEventName,
  getDayProgressStorageKey,
  type DayProgressState,
  type DayProgressStep,
  readDayProgress,
  writeDayProgress,
} from "@/lib/dayProgress";

export function useDayProgress(courseSlug: string, dayNumber: number) {
  const [progress, setProgress] = useState<DayProgressState>(EMPTY_DAY_PROGRESS);
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = getDayProgressStorageKey(courseSlug, dayNumber);
    setProgress(readDayProgress(courseSlug, dayNumber));
    setLoadedStorageKey(storageKey);

    const eventName = getDayProgressEventName();
    const handleProgressChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ storageKey?: string; value?: DayProgressState }>;
      if (customEvent.detail?.storageKey !== storageKey || !customEvent.detail.value) {
        return;
      }

      setProgress(customEvent.detail.value);
    };

    window.addEventListener(eventName, handleProgressChange as EventListener);

    return () => {
      window.removeEventListener(eventName, handleProgressChange as EventListener);
    };
  }, [courseSlug, dayNumber]);

  useEffect(() => {
    const storageKey = getDayProgressStorageKey(courseSlug, dayNumber);
    if (loadedStorageKey !== storageKey) {
      return;
    }

    writeDayProgress(courseSlug, dayNumber, progress);
  }, [courseSlug, dayNumber, loadedStorageKey, progress]);

  const markStepCompleted = useCallback(
    (step: DayProgressStep) => {
      setProgress((current) => {
        if (current[step]) {
          return current;
        }

        return { ...current, [step]: true };
      });
    },
    [],
  );

  const completedSteps = useMemo(() => countCompletedDayProgressSteps(progress), [progress]);
  const summary = useMemo(() => buildDayProgressSummary(progress), [progress]);

  return {
    progress,
    completedSteps,
    summary,
    markStepCompleted,
  };
}
