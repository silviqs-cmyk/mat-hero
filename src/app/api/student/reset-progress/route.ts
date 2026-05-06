import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleSupabaseClient();

  const operations = await Promise.all([
    supabase.from("user_answers").delete().eq("user_id", user.id),
    supabase.from("day_results").delete().eq("user_id", user.id),
    supabase.from("user_progress").delete().eq("user_id", user.id),
    supabase.from("user_achievements").delete().eq("user_id", user.id),
  ]);

  const firstError = operations.find((result) => result.error)?.error;

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
