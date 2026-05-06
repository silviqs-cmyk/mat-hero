import { AdminPlanWorkspace } from "@/components/admin/AdminPlanWorkspace";

export default async function AdminDayPracticePage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;
  return <AdminPlanWorkspace mode="practice" dayNumber={Number(dayNumber)} />;
}
