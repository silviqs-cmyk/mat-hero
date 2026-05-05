import { EmptyState } from "@/components/ui/EmptyState";
import { NeonButton } from "@/components/ui/NeonButton";
import { requireStudent } from "@/lib/auth/server";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const { profile, onboardingMessage } = await requireStudent();

  if (!profile) {
    return (
      <EmptyState
        title="Подготвяме student профила"
        description={
          onboardingMessage ??
          "Профилът ти още не е готов. Пробвай отново след малко или се впиши наново."
        }
        action={<NeonButton href="/login">Към входа</NeonButton>}
      />
    );
  }

  return <DashboardClient profile={profile} />;
}
