import { AdminPlanWorkspace } from "@/components/admin/AdminPlanWorkspace";

export default async function AdminDayPreviewPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;
  return <AdminPlanWorkspace mode="preview" dayNumber={Number(dayNumber)} />;
}
