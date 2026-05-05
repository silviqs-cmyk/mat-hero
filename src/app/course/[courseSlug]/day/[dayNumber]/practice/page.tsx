"use client";

import { useParams } from "next/navigation";
import { StudentQuestionFlow } from "@/components/student/StudentQuestionFlow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { NeonButton } from "@/components/ui/NeonButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCourse } from "@/hooks/useCourse";
import { useDayContentBundle } from "@/hooks/useDayContentBundle";
import { useDayQuestions } from "@/hooks/useDayQuestions";
import { useUserProgress } from "@/hooks/useUserProgress";

export default function CoursePracticePage() {
  const params = useParams<{ courseSlug: string; dayNumber: string }>();
  const dayNumber = Number(params.dayNumber);
  const { profile, isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(params.courseSlug);
  const { data: progress, isLoading: progressLoading } = useUserProgress(profile?.id ?? null, course?.id ?? null);
  const { data: bundle, isLoading: bundleLoading, error: bundleError } = useDayContentBundle(
    params.courseSlug,
    Number.isFinite(dayNumber) ? dayNumber : 1,
  );
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useDayQuestions(bundle?.day.id ?? null, false);

  if (userLoading || courseLoading || progressLoading || bundleLoading || questionsLoading) {
    return <LoadingState title="Зареждам задачите" lines={5} />;
  }

  if (!isAuthenticated || !profile) {
    return (
      <EmptyState
        title="Нужен е вход"
        description="Влез в MatHero, за да решаваш задачите и да запазваш напредъка си."
        action={<NeonButton href="/">Към входа</NeonButton>}
      />
    );
  }

  if (courseError || bundleError || questionsError) {
    return (
      <ErrorState
        title="Не успях да заредя задачите"
        description={courseError ?? bundleError ?? questionsError ?? "Възникна грешка."}
        action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
      />
    );
  }

  if (!course || !bundle || questions.length === 0) {
    return (
      <EmptyState
        title="Още няма задачи"
        description="Публикувай въпроси за този ден и те ще се появят тук."
      />
    );
  }

  return (
    <StudentQuestionFlow
      mode="practice"
      course={course}
      bundle={bundle}
      questions={questions.filter((question) => !question.is_bonus)}
      profile={profile}
      progress={progress}
    />
  );
}
