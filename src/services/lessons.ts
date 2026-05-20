import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { listPublishedLessonSectionsCompat } from "@/services/lessonSectionsCompat";
import type { Lesson, LessonSection } from "@/types/course";

export async function getLessonWithSections(lessonId: string): Promise<(Lesson & { sections: LessonSection[] }) | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: lesson, error } = await supabase.from("lessons").select("*").eq("id", lessonId).single();

  if (error || !lesson) {
    return null;
  }

  return {
    ...(lesson as Lesson),
    sections: await listPublishedLessonSectionsCompat(supabase, lessonId),
  };
}
