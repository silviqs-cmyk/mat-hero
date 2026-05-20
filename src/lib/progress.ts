import type { DayResult, UserProgress } from "@/types/user";

type ProgressLike = Pick<UserProgress, "completed_days"> | null | undefined;

interface ResolvedCourseProgressInput {
  progress: UserProgress | null | undefined;
  resultDayNumbers?: Array<number | null | undefined>;
  totalDays: number;
}

interface ResolvedCourseProgress {
  currentDayNumber: number;
  completedDayNumbers: number[];
  completedDaysCount: number;
  progressPercent: number;
}

export function clampPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculatePercentage(value: number, max: number) {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return clampPercentage((value / max) * 100);
}

export function getCompletedDayNumbers(progress: ProgressLike) {
  return Array.from(new Set(progress?.completed_days ?? [])).sort((left, right) => left - right);
}

export function getCompletedDaysCount(progress: ProgressLike) {
  return getCompletedDayNumbers(progress).length;
}

export function getCourseProgressPercent(progress: ProgressLike, totalDays: number) {
  return calculatePercentage(getCompletedDaysCount(progress), totalDays);
}

export function getResultDayNumbers(
  results: Array<Pick<DayResult, "course_day_id">> | Array<{ dayNumber: number | null | undefined }>,
  dayNumberByCourseDayId?: Map<string, number>,
) {
  if (results.length === 0) {
    return [];
  }

  const dayNumbers = results.map((result) => {
    if ("dayNumber" in result) {
      return result.dayNumber;
    }

    return dayNumberByCourseDayId?.get(result.course_day_id) ?? null;
  });

  return Array.from(
    new Set(
      dayNumbers.filter(
        (dayNumber): dayNumber is number =>
          typeof dayNumber === "number" && Number.isInteger(dayNumber) && dayNumber > 0,
      ),
    ),
  ).sort((left, right) => left - right);
}

export function resolveCourseProgress({
  progress,
  resultDayNumbers = [],
  totalDays,
}: ResolvedCourseProgressInput): ResolvedCourseProgress {
  const completedDayNumbers = Array.from(
    new Set([
      ...getCompletedDayNumbers(progress),
      ...resultDayNumbers.filter(
        (dayNumber): dayNumber is number =>
          typeof dayNumber === "number" && Number.isInteger(dayNumber) && dayNumber > 0,
      ),
    ]),
  ).sort((left, right) => left - right);

  const derivedCurrentDay =
    completedDayNumbers.length > 0
      ? Math.min(totalDays, Math.max(...completedDayNumbers) + 1)
      : 1;

  const currentDayNumber = Math.min(
    totalDays,
    Math.max(progress?.current_day_number ?? 1, derivedCurrentDay),
  );

  return {
    currentDayNumber,
    completedDayNumbers,
    completedDaysCount: completedDayNumbers.length,
    progressPercent: calculatePercentage(completedDayNumbers.length, totalDays),
  };
}
