"use client";

export type DayProgressStep = "theory" | "video" | "practice";

export interface DayProgressState {
  theory: boolean;
  video: boolean;
  practice: boolean;
}

const STORAGE_PREFIX = "maturohero-day-progress-v1";
const DAY_PROGRESS_EVENT = "maturohero:day-progress-change";

export const EMPTY_DAY_PROGRESS: DayProgressState = {
  theory: false,
  video: false,
  practice: false,
};

export function getDayProgressStorageKey(courseSlug: string, dayNumber: number) {
  return `${STORAGE_PREFIX}:${courseSlug}:${dayNumber}`;
}

export function sanitizeDayProgressState(value: unknown): DayProgressState {
  if (!value || typeof value !== "object") {
    return EMPTY_DAY_PROGRESS;
  }

  const record = value as Partial<Record<DayProgressStep, unknown>>;

  return {
    theory: record.theory === true,
    video: record.video === true,
    practice: record.practice === true,
  };
}

export function readDayProgress(courseSlug: string, dayNumber: number) {
  if (typeof window === "undefined") {
    return EMPTY_DAY_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(getDayProgressStorageKey(courseSlug, dayNumber));
    if (!raw) {
      return EMPTY_DAY_PROGRESS;
    }

    return sanitizeDayProgressState(JSON.parse(raw));
  } catch {
    return EMPTY_DAY_PROGRESS;
  }
}

export function writeDayProgress(courseSlug: string, dayNumber: number, value: DayProgressState) {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey = getDayProgressStorageKey(courseSlug, dayNumber);
  window.localStorage.setItem(storageKey, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(DAY_PROGRESS_EVENT, { detail: { storageKey, value } }));
}

export function countCompletedDayProgressSteps(value: DayProgressState) {
  return [value.theory, value.video, value.practice].filter(Boolean).length;
}

export function buildDayProgressSummary(value: DayProgressState) {
  const labels: string[] = [];

  if (value.theory) {
    labels.push("теория");
  }

  if (value.video) {
    labels.push("видео");
  }

  if (value.practice) {
    labels.push("задачи");
  }

  if (labels.length === 0) {
    return "Започни с теорията за деня";
  }

  if (labels.length === 3) {
    return "Денят е минат изцяло";
  }

  return `Готово: ${labels.join(", ")}`;
}

export function getDayProgressEventName() {
  return DAY_PROGRESS_EVENT;
}
