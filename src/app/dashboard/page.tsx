import { DashboardClient } from "@/app/dashboard/DashboardClient";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { requireStudent } from "@/lib/auth/server";
import { getCurrentDayNumber } from "@/lib/studentFlow";
import {
  getCourseDayServer,
  getDefaultPublishedCourseServer,
  getUserCourseProgressServer,
} from "@/services/studentContent.server";

export default async function DashboardPage() {
  const { profile, onboardingMessage } = await requireStudent();

  if (!profile) {
    return (
      <EmptyState
        title="Подготвяме student профила"
        description={
          onboardingMessage ??
          "Профилът ти още не е готов. Пробвай отново след малко или се впиши наново."
        }
        action={<NeonButton href="/login">Към входа</NeonButton>}
      />
    );
  }

  const loadResult = await (async () => {
    const course = await getDefaultPublishedCourseServer();
    if (!course) {
      return { course: null, progress: null, bundle: null };
    }

    const progress = await getUserCourseProgressServer(profile.id, course.id);
    const activeDayNumber = getCurrentDayNumber(progress, course.duration_days);
    const bundle = await getCourseDayServer(course.slug, activeDayNumber);
    return { course, progress, bundle };
  })()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({ data: null, error: error instanceof Error ? error.message : "Възникна неочаквана грешка." }));

  if (loadResult.error) {
    return (
      <ErrorState
        title="Не успях да заредя таблото"
        description={loadResult.error}
        action={<NeonButton href="/dashboard">Опитай отново</NeonButton>}
      />
    );
  }

  if (!loadResult.data?.course) {
    return (
      <ErrorState
        title="Все още няма активен курс"
        description="Публикувай курса в CMS-а и student dashboard-ът ще се появи тук."
        action={<NeonButton href="/dashboard">Обнови таблото</NeonButton>}
      />
    );
  }

  if (!loadResult.data.bundle) {
    return (
      <EmptyState
        title="Няма налично съдържание"
        description="Текущият ден още няма публикувано student съдържание."
        action={<NeonButton href="/dashboard">Обнови таблото</NeonButton>}
      />
    );
  }

  return (
    <DashboardClient
      course={loadResult.data.course}
      bundle={loadResult.data.bundle}
      progress={loadResult.data.progress}
    />
  );
}
