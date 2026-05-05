import type { ReactNode } from "react";
import { requireStudent } from "@/lib/auth/server";

export default async function StudentDayLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireStudent();
  return <>{children}</>;
}
