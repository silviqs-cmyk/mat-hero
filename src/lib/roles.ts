import type { UserProfile } from "@/types/user";

export function isAdminRole(role: UserProfile["role"] | null | undefined) {
  return role === "admin";
}

export function isStudentRole(role: UserProfile["role"] | null | undefined) {
  return role === "student";
}
