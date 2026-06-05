import { AdminPlanWorkspace } from "@/components/admin/AdminPlanWorkspace";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default async function AdminCmsDayPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;
  const resolvedDayNumber = Number(dayNumber);

  return (
    <div className="space-y-6">
      <NeonCard tone="muted" padding="md">
        <SectionHeader
          label={`CMS • Ден ${resolvedDayNumber}`}
          title="Редакция на деня"
        />
        <p className="mt-3 text-sm text-[var(--mh-text-muted)]">
          Тук редактираш реалното съдържание за ученика: деня, видеото, lesson sections и задачите за ПРОВЕРИ,
          УПРАЖНИ и ИЗПИТАЙ СЕ.
        </p>
      </NeonCard>

      <AdminPlanWorkspace mode="day" dayNumber={resolvedDayNumber} embedded />
      <AdminPlanWorkspace mode="theory" dayNumber={resolvedDayNumber} embedded />
      <AdminPlanWorkspace mode="video" dayNumber={resolvedDayNumber} embedded />
      <AdminPlanWorkspace mode="quiz" dayNumber={resolvedDayNumber} embedded />
      <AdminPlanWorkspace mode="practice" dayNumber={resolvedDayNumber} embedded />
      <AdminPlanWorkspace mode="bonus" dayNumber={resolvedDayNumber} embedded />
    </div>
  );
}
