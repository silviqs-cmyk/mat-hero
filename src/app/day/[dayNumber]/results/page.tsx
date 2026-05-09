import CourseDayResultsPage from "@/app/course/[courseSlug]/day/[dayNumber]/results/page";
import { DEFAULT_COURSE_SLUG } from "@/services/courses";

export default async function DayResultsPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;

  return CourseDayResultsPage({
    params: Promise.resolve({ courseSlug: DEFAULT_COURSE_SLUG, dayNumber }),
  });
}
