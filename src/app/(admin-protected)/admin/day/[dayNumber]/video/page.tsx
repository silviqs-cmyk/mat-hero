import { AdminPlanWorkspace } from "@/components/admin/AdminPlanWorkspace";

export default async function AdminDayVideoPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;
  return <AdminPlanWorkspace mode="video" dayNumber={Number(dayNumber)} />;
}
