import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { listPublishedLessonSectionsCompat } from "@/services/lessonSectionsCompat";
import type { CourseDay, DayContentBundle } from "@/types/course";

export async function getCourseDay(courseSlug: string, dayNumber: number): Promise<DayContentBundle | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .single();

  if (courseError || !course) {
    return null;
  }

  const { data: day, error: dayError } = await supabase
    .from("course_days")
    .select("*")
    .eq("course_id", course.id)
    .eq("day_number", dayNumber)
    .eq("is_published", true)
    .single();

  if (dayError || !day) {
    return null;
  }

  const [{ data: lessons }, { data: questions }] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .eq("course_day_id", day.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("questions")
      .select("*")
      .eq("course_day_id", day.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);

  const lessonsWithSections = await Promise.all(
    ((lessons ?? []) as DayContentBundle["lessons"]).map(async (lesson) => {
      return {
        ...lesson,
        sections: await listPublishedLessonSectionsCompat(supabase, lesson.id),
      };
    }),
  );

  return {
    course: course,
    day: day as CourseDay,
    lessons: lessonsWithSections,
    questions: (questions ?? []) as DayContentBundle["questions"],
  };
}
