import { StudentDayScreen } from "@/components/student/StudentDayScreen";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { requireStudent } from "@/lib/auth/server";
import { getCurrentDayNumber } from "@/lib/studentFlow";
import {
  getCourseDayServer,
  getPublishedCourseBySlugServer,
  getUserCourseProgressServer,
} from "@/services/studentContent.server";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { profile } = await requireStudent();
  const { courseSlug } = await params;

  if (!profile) {
    return (
      <EmptyState
        title="Нужен е вход"
        description="Влез в MatHero, за да продължиш по плана си."
        action={<NeonButton href="/login">Към входа</NeonButton>}
      />
    );
  }

  const loadResult = await (async () => {
    const course = await getPublishedCourseBySlugServer(courseSlug);
    if (!course) {
      return { course: null, progress: null, bundle: null };
    }

    const progress = await getUserCourseProgressServer(profile.id, course.id);
    const activeDayNumber = getCurrentDayNumber(progress, course.duration_days);
    const bundle = await getCourseDayServer(course.slug, activeDayNumber);
    return { course, progress, bundle };
  })()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({ data: null, error: error instanceof Error ? error.message : "Възникна грешка при зареждането." }));

  if (loadResult.error) {
    return (
      <ErrorState
        title="Не успях да заредя деня"
        description={loadResult.error}
        action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
      />
    );
  }

  if (!loadResult.data?.course) {
    return <EmptyState title="Няма такъв курс" description="Този курс не е наличен или не е публикуван." />;
  }

  if (!loadResult.data.bundle) {
    return <EmptyState title="Няма налично съдържание" description="Текущият ден още няма публикуван урок или задачи." />;
  }

  return (
    <StudentDayScreen
      course={loadResult.data.course}
      bundle={loadResult.data.bundle}
      progress={loadResult.data.progress}
    />
  );
}
