"use client";

import { StudentQuestionFlow } from "@/components/student/StudentQuestionFlow";
import type { QuestionGroup } from "@/lib/questionGroups";
import type { CourseWithDays, DayContentBundle, Question } from "@/types/course";
import type { UserProfile, UserProgress } from "@/types/user";

interface CourseQuestionPageProps {
  mode: QuestionGroup;
  course: CourseWithDays;
  bundle: DayContentBundle;
  questions: Question[];
  profile: UserProfile;
  progress: UserProgress | null;
}

export function CourseQuestionPage({
  mode,
  course,
  bundle,
  questions,
  profile,
  progress,
}: CourseQuestionPageProps) {
  return (
    <StudentQuestionFlow
      mode={mode}
      course={course}
      bundle={bundle}
      questions={questions}
      profile={profile}
      progress={progress}
    />
  );
}
