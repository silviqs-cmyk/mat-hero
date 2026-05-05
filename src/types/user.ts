import type {
  DatabaseDayResult,
  DatabaseProfile,
  DatabaseUserAnswer,
  DatabaseUserProgress,
} from "@/types/database";

export type UserProfile = DatabaseProfile;

export type UserProgress = DatabaseUserProgress;

export type UserAnswer = DatabaseUserAnswer;

export type DayResult = DatabaseDayResult;

export interface CurrentUser {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
