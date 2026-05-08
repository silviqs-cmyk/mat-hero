"use client";

import { useEffect, useState } from "react";
import type { QuestionGroup } from "@/lib/questionGroups";
import { getQuestionsWithOptionsForDay } from "@/services/questions";
import type { Question } from "@/types/course";

export function useDayQuestions(
  dayId: string | null,
  includeBonus = true,
  group?: QuestionGroup,
) {
  const [data, setData] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!dayId) {
        setData([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const questions = await getQuestionsWithOptionsForDay(dayId, includeBonus, group);
        if (active) {
          setData(questions);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load questions.");
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
  }, [dayId, includeBonus, group]);

  return { data, isLoading, error };
}
