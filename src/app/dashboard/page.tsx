"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { NeonButton } from "@/components/ui/NeonButton";
import { StudentDayOverview } from "@/components/student/StudentDayOverview";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCourse } from "@/hooks/useCourse";
import { useDayContentBundle } from "@/hooks/useDayContentBundle";
import { usePublishedCourse } from "@/hooks/usePublishedCourse";
import { useUserProgress } from "@/hooks/useUserProgress";
import { getCurrentDayNumber } from "@/lib/studentFlow";

export default function DashboardPage() {
  const { profile, isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const { data: publishedCourse, isLoading: publishedCourseLoading, error: publishedCourseError } = usePublishedCourse();
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(publishedCourse?.slug ?? "");
  const {
    data: progress,
    isLoading: progressLoading,
    error: progressError,
  } = useUserProgress(profile?.id ?? null, course?.id ?? null);
  const activeDayNumber = getCurrentDayNumber(progress, course?.duration_days ?? 10);
  const { data: bundle, isLoading: bundleLoading, error: bundleError } = useDayContentBundle(course?.slug ?? null, activeDayNumber);

  if (userLoading || publishedCourseLoading || courseLoading || progressLoading || bundleLoading) {
    return <LoadingState title="Зареждам таблото" lines={5} />;
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Нужен е вход"
        description="Влез в MatHero, за да видиш личния си 10-дневен план и напредък."
        action={<NeonButton href="/">Към входа</NeonButton>}
      />
    );
  }

  if (publishedCourseError || courseError || progressError || bundleError) {
    return (
      <ErrorState
        title="Не успях да заредя таблото"
        description={publishedCourseError ?? courseError ?? progressError ?? bundleError ?? "Възникна неочаквана грешка."}
        action={<NeonButton href="/dashboard">Опитай отново</NeonButton>}
      />
    );
  }

  if (!course || !bundle) {
    return (
      <EmptyState
        title="Още няма активен курс"
        description="Когато публикуваш курс в Supabase CMS-а, таблото ще се появи тук."
      />
    );
  }

  return <StudentDayOverview course={course} bundle={bundle} progress={progress} profile={profile} />;
}
