import CourseDayPage from "@/app/course/[courseSlug]/day/[dayNumber]/page";
import { DEFAULT_COURSE_SLUG } from "@/services/courses";

export default async function DayPage({
  params,
  searchParams,
}: {
  params: Promise<{ dayNumber: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { dayNumber } = await params;

  return CourseDayPage({
    params: Promise.resolve({ courseSlug: DEFAULT_COURSE_SLUG, dayNumber }),
    searchParams,
  });
}
