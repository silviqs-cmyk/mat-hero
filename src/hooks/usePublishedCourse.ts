"use client";

import { useEffect, useState } from "react";
import { getDefaultPublishedCourse } from "@/services/courses";
import type { Course } from "@/types/course";

export function usePublishedCourse() {
  const [data, setData] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const course = await getDefaultPublishedCourse();
        if (active) {
          setData(course);
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
  }, []);

  return { data, isLoading, error };
}
