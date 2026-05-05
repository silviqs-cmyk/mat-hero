"use client";

import { useParams } from "next/navigation";
import { StudentDayScreen } from "@/components/student/StudentDayScreen";

export default function CourseDayPage() {
  const params = useParams<{ courseSlug: string; dayNumber: string }>();
  const dayNumber = Number(params.dayNumber);

  return <StudentDayScreen courseSlug={params.courseSlug} forcedDayNumber={Number.isFinite(dayNumber) ? dayNumber : 1} />;
}
