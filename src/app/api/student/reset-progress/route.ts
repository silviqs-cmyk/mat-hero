import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { getOptionalServiceRoleKey } from "@/lib/supabase/env";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";

export async function POST() {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getOptionalServiceRoleKey()
      ? createServiceRoleSupabaseClient()
      : await createServerSupabaseClient();

    const tables = [
      "user_answers",
      "day_results",
      "user_progress",
      "user_achievements",
    ] as const;

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq("user_id", user.id);

      if (error) {
        console.error("Failed to reset student progress", {
          table,
          userId: user.id,
          error,
        });

        return NextResponse.json(
          {
            error: `Не успях да зануля данните в ${table}: ${error.message}`,
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected reset-progress failure", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Не успях да зануля прогреса.",
      },
      { status: 500 },
    );
  }
}
