"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { NeonButton } from "@/components/ui/NeonButton";
import { StudentDayOverview } from "@/components/student/StudentDayOverview";
import { useCourse } from "@/hooks/useCourse";
import { useDayContentBundle } from "@/hooks/useDayContentBundle";
import { usePublishedCourse } from "@/hooks/usePublishedCourse";
import { useUserProgress } from "@/hooks/useUserProgress";
import { getCurrentDayNumber } from "@/lib/studentFlow";
import type { UserProfile } from "@/types/user";

interface DashboardClientProps {
  profile: UserProfile;
}

export function DashboardClient({ profile }: DashboardClientProps) {
  const {
    data: publishedCourse,
    isLoading: publishedCourseLoading,
    error: publishedCourseError,
  } = usePublishedCourse();
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(publishedCourse?.slug ?? "");
  const {
    data: progress,
    isLoading: progressLoading,
    error: progressError,
  } = useUserProgress(profile.id, course?.id ?? null);
  const activeDayNumber = getCurrentDayNumber(progress, course?.duration_days ?? 10);
  const {
    data: bundle,
    isLoading: bundleLoading,
    error: bundleError,
  } = useDayContentBundle(course?.slug ?? null, activeDayNumber);

  if (publishedCourseLoading || courseLoading || progressLoading || bundleLoading) {
    return <LoadingState title="Зареждам таблото" lines={5} />;
  }

  if (publishedCourseError || courseError || progressError || bundleError) {
    return (
      <ErrorState
        title="Не успях да заредя таблото"
        description={
          publishedCourseError ??
          courseError ??
          progressError ??
          bundleError ??
          "Възникна неочаквана грешка."
        }
        action={<NeonButton href="/dashboard">Опитай отново</NeonButton>}
      />
    );
  }

  if (!course || !bundle) {
    return (
      <ErrorState
        title="Все още няма активен курс"
        description="Публикувай курс в Supabase CMS, за да се появи student dashboard."
        action={<NeonButton href="/dashboard">Обнови таблото</NeonButton>}
      />
    );
  }

  return (
    <StudentDayOverview
      course={course}
      bundle={bundle}
      progress={progress}
      profile={profile}
    />
  );
}
