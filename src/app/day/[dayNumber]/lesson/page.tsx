import CourseLessonPage from "@/app/course/[courseSlug]/day/[dayNumber]/lesson/page";
import { DEFAULT_COURSE_SLUG } from "@/services/courses";

export default async function DayLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ dayNumber: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { dayNumber } = await params;

  return CourseLessonPage({
    params: Promise.resolve({ courseSlug: DEFAULT_COURSE_SLUG, dayNumber }),
    searchParams,
  });
}
