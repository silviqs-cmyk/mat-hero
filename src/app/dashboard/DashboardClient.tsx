"use client";

import { StudentDayOverview } from "@/components/student/StudentDayOverview";
import type { CourseWithDays, DayContentBundle } from "@/types/course";
import type { UserProgress } from "@/types/user";

interface DashboardClientProps {
  course: CourseWithDays;
  bundle: DayContentBundle;
  progress: UserProgress | null;
}

export function DashboardClient({ course, bundle, progress }: DashboardClientProps) {
  return <StudentDayOverview course={course} bundle={bundle} progress={progress} />;
}
