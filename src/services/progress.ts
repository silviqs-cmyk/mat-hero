import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { UserProgress } from "@/types/user";

export async function getUserCourseProgress(userId: string, courseId: string): Promise<UserProgress | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as UserProgress | null) ?? null;
}

export async function upsertUserCourseProgress(progress: Partial<UserProgress> & Pick<UserProgress, "user_id" | "course_id">) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_progress")
    .upsert(progress, { onConflict: "user_id,course_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProgress;
}

export async function ensureUserCourseProgress(userId: string, courseId: string) {
  const existing = await getUserCourseProgress(userId, courseId);
  if (existing) {
    return existing;
  }

  return upsertUserCourseProgress({
    user_id: userId,
    course_id: courseId,
    current_day_number: 1,
    completed_days: [],
    total_xp: 0,
    streak_days: 0,
    last_active_at: new Date().toISOString(),
  });
}
