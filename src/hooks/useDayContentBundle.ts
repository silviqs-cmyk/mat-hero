"use client";

import { useEffect, useState } from "react";
import { getCourseDay } from "@/services/courseDays";
import type { DayContentBundle } from "@/types/course";

export function useDayContentBundle(courseSlug: string | null, dayNumber: number | null) {
  const [data, setData] = useState<DayContentBundle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!courseSlug || !dayNumber) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const next = await getCourseDay(courseSlug, dayNumber);
        if (active) {
          setData(next);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load day content.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [courseSlug, dayNumber]);

  return { data, isLoading, error };
}
