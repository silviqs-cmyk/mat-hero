import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Course, CourseWithDays } from "@/types/course";

export const DEFAULT_COURSE_SLUG = "nvo-matematika-7-klas";

export async function listPublishedCourses(): Promise<Course[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("grade", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Course[];
}

export async function getPublishedCourseBySlug(courseSlug: string): Promise<Course | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Course | null) ?? null;
}

export async function getDefaultPublishedCourse(): Promise<Course | null> {
  return getPublishedCourseBySlug(DEFAULT_COURSE_SLUG);
}

export async function getDefaultCourse(): Promise<Course | null> {
  return getDefaultPublishedCourse();
}

export async function getCourseBySlug(courseSlug: string): Promise<CourseWithDays | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .single();

  if (error || !course) {
    return null;
  }

  const { data: days } = await supabase
    .from("course_days")
    .select("*")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return {
    ...(course as Course),
    days: (days ?? []) as CourseWithDays["days"],
  };
}
