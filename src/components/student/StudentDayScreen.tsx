"use client";

import { StudentDayOverview } from "@/components/student/StudentDayOverview";
import type { CourseWithDays, DayContentBundle } from "@/types/course";
import type { UserProgress } from "@/types/user";

interface StudentDayScreenProps {
  course: CourseWithDays;
  bundle: DayContentBundle;
  progress: UserProgress | null;
}

export function StudentDayScreen({ course, bundle, progress }: StudentDayScreenProps) {
  return <StudentDayOverview course={course} bundle={bundle} progress={progress} />;
}
