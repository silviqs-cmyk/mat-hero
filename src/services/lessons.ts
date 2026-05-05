import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Lesson, LessonSection } from "@/types/course";

export async function getLessonWithSections(lessonId: string): Promise<(Lesson & { sections: LessonSection[] }) | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: lesson, error } = await supabase.from("lessons").select("*").eq("id", lessonId).single();

  if (error || !lesson) {
    return null;
  }

  const { data: sections } = await supabase
    .from("lesson_sections")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  return {
    ...(lesson as Lesson),
    sections: (sections ?? []) as LessonSection[],
  };
}
