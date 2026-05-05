"use client";

import { useEffect, useState } from "react";
import { getCourseBySlug } from "@/services/courses";
import type { CourseWithDays } from "@/types/course";

export function useCourse(courseSlug: string) {
  const [data, setData] = useState<CourseWithDays | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const next = await getCourseBySlug(courseSlug);
        if (active) {
          setData(next);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load course.");
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
  }, [courseSlug]);

  return { data, isLoading, error };
}
