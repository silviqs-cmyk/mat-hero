import CourseBonusPage from "@/app/course/[courseSlug]/day/[dayNumber]/bonus/page";
import { DEFAULT_COURSE_SLUG } from "@/services/courses";

export default async function DayBonusPage({
  params,
  searchParams,
}: {
  params: Promise<{ dayNumber: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { dayNumber } = await params;

  return CourseBonusPage({
    params: Promise.resolve({ courseSlug: DEFAULT_COURSE_SLUG, dayNumber }),
    searchParams,
  });
}
