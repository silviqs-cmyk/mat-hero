import CourseQuizPage from "@/app/course/[courseSlug]/day/[dayNumber]/quiz/page";
import { DEFAULT_COURSE_SLUG } from "@/services/courses";

export default async function DayQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ dayNumber: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { dayNumber } = await params;

  return CourseQuizPage({
    params: Promise.resolve({ courseSlug: DEFAULT_COURSE_SLUG, dayNumber }),
    searchParams,
  });
}
