"use client";

import { useEffect, useState } from "react";
import { getUserCourseProgress } from "@/services/progress";
import type { UserProgress } from "@/types/user";

export function useUserProgress(userId: string | null, courseId: string | null) {
  const [data, setData] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!userId || !courseId) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const progress = await getUserCourseProgress(userId, courseId);
        if (active) {
          setData(progress);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load user progress.");
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
  }, [courseId, userId]);

  return { data, isLoading, error };
}
