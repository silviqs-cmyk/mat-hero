import CourseVideoPage from "@/app/course/[courseSlug]/day/[dayNumber]/video/page";
import { DEFAULT_COURSE_SLUG } from "@/services/courses";

export default async function DayVideoPage({
  params,
  searchParams,
}: {
  params: Promise<{ dayNumber: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { dayNumber } = await params;

  return CourseVideoPage({
    params: Promise.resolve({ courseSlug: DEFAULT_COURSE_SLUG, dayNumber }),
    searchParams,
  });
}
