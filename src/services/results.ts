import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { DayResult } from "@/types/user";

export async function listUserResults(userId: string): Promise<DayResult[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("day_results")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DayResult[];
}

export async function saveDayResult(result: Omit<DayResult, "id" | "created_at"> & Partial<Pick<DayResult, "id" | "created_at">>) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("day_results")
    .upsert(result, { onConflict: "user_id,course_day_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DayResult;
}

export async function getUserDayResult(userId: string, courseDayId: string): Promise<DayResult | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("day_results")
    .select("*")
    .eq("user_id", userId)
    .eq("course_day_id", courseDayId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as DayResult | null) ?? null;
}
