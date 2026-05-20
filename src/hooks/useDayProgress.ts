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

  useEffect(() => {
    setProgress(readDayProgress(courseSlug, dayNumber));

    const storageKey = getDayProgressStorageKey(courseSlug, dayNumber);
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

  const markStepCompleted = useCallback(
    (step: DayProgressStep) => {
      setProgress((current) => {
        if (current[step]) {
          return current;
        }

        const next = { ...current, [step]: true };
        writeDayProgress(courseSlug, dayNumber, next);
        return next;
      });
    },
    [courseSlug, dayNumber],
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
