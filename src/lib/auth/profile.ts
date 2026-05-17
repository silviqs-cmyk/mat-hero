import type { UserProfile } from "@/types/user";

export const DEFAULT_STUDENT_GRADE = 7;
export const DEFAULT_GOAL_SCORE = 80;

export function normalizeProfileFullName(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function hasRequiredProfileName(value: string | null | undefined) {
  return normalizeProfileFullName(value).length >= 2;
}

export function getPostAuthRedirectPath(profile: UserProfile | null | undefined) {
  return profile?.role === "admin" ? "/admin" : "/dashboard";
}
