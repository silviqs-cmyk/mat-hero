"use client";

import { useEffect } from "react";
import { TopBarProgressSync } from "@/components/providers/TopBarProgressSync";
import { type DayProgressStep } from "@/lib/dayProgress";
import { useDayProgress } from "@/hooks/useDayProgress";

interface DayTopBarProgressProps {
  courseSlug: string;
  dayNumber: number;
  label: string;
  helper: string;
  currentStep?: DayProgressStep;
  currentStepCompleted?: boolean;
}

export function DayTopBarProgress({
  courseSlug,
  dayNumber,
  label,
  helper,
  currentStep,
  currentStepCompleted = false,
}: DayTopBarProgressProps) {
  const { completedSteps, summary, markStepCompleted } = useDayProgress(courseSlug, dayNumber);

  useEffect(() => {
    if (currentStep && currentStepCompleted) {
      markStepCompleted(currentStep);
    }
  }, [currentStep, currentStepCompleted, markStepCompleted]);

  return (
    <TopBarProgressSync
      value={{
        label,
        summary: `Дневен прогрес ${completedSteps}/3`,
        helper: `${summary} • ${helper}`,
        value: completedSteps,
        max: 3,
        tone: "cyan",
      }}
    />
  );
}
