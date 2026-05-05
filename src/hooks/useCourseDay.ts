"use client";

import { useEffect, useState } from "react";
import { getCourseDayById } from "@/lib/courseDayService";
import type { CourseDayScreenData } from "@/types";

interface UseCourseDayState {
  data: CourseDayScreenData | null;
  isLoading: boolean;
  error: string | null;
}

export function useCourseDay(dayId: string) {
  const [state, setState] = useState<UseCourseDayState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    async function loadCourseDay() {
      setState((current) => ({ ...current, isLoading: true, error: null }));
      const response = await getCourseDayById(dayId);

      if (!active) {
        return;
      }

      setState({
        data: response.data,
        isLoading: false,
        error: response.error,
      });
    }

    void loadCourseDay();

    return () => {
      active = false;
    };
  }, [dayId]);

  return state;
}
