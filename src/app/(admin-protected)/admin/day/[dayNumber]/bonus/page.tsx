import { AdminPlanWorkspace } from "@/components/admin/AdminPlanWorkspace";

export default async function AdminDayBonusPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;
  return <AdminPlanWorkspace mode="bonus" dayNumber={Number(dayNumber)} />;
}
