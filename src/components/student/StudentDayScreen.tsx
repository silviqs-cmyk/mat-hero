"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { NeonButton } from "@/components/ui/NeonButton";
import { StudentDayOverview } from "@/components/student/StudentDayOverview";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCourse } from "@/hooks/useCourse";
import { useDayContentBundle } from "@/hooks/useDayContentBundle";
import { useUserProgress } from "@/hooks/useUserProgress";
import { getCurrentDayNumber } from "@/lib/studentFlow";

interface StudentDayScreenProps {
  courseSlug: string;
  forcedDayNumber?: number;
}

export function StudentDayScreen({ courseSlug, forcedDayNumber }: StudentDayScreenProps) {
  const { profile, isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseSlug);
  const { data: progress, isLoading: progressLoading, error: progressError } = useUserProgress(
    profile?.id ?? null,
    course?.id ?? null,
  );
  const activeDayNumber = forcedDayNumber ?? getCurrentDayNumber(progress, course?.duration_days ?? 10);
  const { data: bundle, isLoading: bundleLoading, error: bundleError } = useDayContentBundle(course?.slug ?? null, activeDayNumber);

  if (userLoading || courseLoading || progressLoading || bundleLoading) {
    return <LoadingState title="Зареждам деня" lines={5} />;
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Нужен е вход"
        description="Влез в MatHero, за да продължиш по плана си."
        action={<NeonButton href="/">Към входа</NeonButton>}
      />
    );
  }

  if (courseError || progressError || bundleError) {
    return (
      <ErrorState
        title="Не успях да заредя съдържанието"
        description={courseError ?? progressError ?? bundleError ?? "Възникна грешка при зареждането."}
        action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
      />
    );
  }

  if (!course || !bundle) {
    return (
      <EmptyState
        title="Няма налично съдържание"
        description="Този ден още няма публикуван урок или задачи."
      />
    );
  }

  return <StudentDayOverview course={course} bundle={bundle} progress={progress} profile={profile} />;
}
