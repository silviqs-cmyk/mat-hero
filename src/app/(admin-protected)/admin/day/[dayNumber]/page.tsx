import { AdminPlanWorkspace } from "@/components/admin/AdminPlanWorkspace";

export default async function AdminDayPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;
  return <AdminPlanWorkspace mode="day" dayNumber={Number(dayNumber)} />;
}
