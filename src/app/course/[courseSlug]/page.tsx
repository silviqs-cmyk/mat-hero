"use client";

import { useParams } from "next/navigation";
import { StudentDayScreen } from "@/components/student/StudentDayScreen";

export default function CoursePage() {
  const params = useParams<{ courseSlug: string }>();

  return <StudentDayScreen courseSlug={params.courseSlug} />;
}
