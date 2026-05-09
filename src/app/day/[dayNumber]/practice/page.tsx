import CoursePracticePage from "@/app/course/[courseSlug]/day/[dayNumber]/practice/page";
import { DEFAULT_COURSE_SLUG } from "@/services/courses";

export default async function DayPracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ dayNumber: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { dayNumber } = await params;

  return CoursePracticePage({
    params: Promise.resolve({ courseSlug: DEFAULT_COURSE_SLUG, dayNumber }),
    searchParams,
  });
}
