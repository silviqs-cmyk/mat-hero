"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  ensurePlanDay,
  getAdminPlanSnapshot,
  savePlanDay,
  type AdminPlanSnapshot,
} from "@/services/adminPlan";

function getDayStatusBadge(status: "draft" | "published" | "missing") {
  if (status === "published") {
    return <Badge tone="green">Published</Badge>;
  }

  if (status === "draft") {
    return <Badge tone="gold">Unpublished</Badge>;
  }

  return <Badge tone="neutral">Missing</Badge>;
}

export function AdminProgramOverview() {
  const [snapshot, setSnapshot] = useState<AdminPlanSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyDayNumber, setBusyDayNumber] = useState<number | null>(null);

  const loadSnapshot = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSnapshot = await getAdminPlanSnapshot();
      setSnapshot(nextSnapshot);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не успях да заредя admin програмата.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  async function handleCreateOrToggle(dayNumber: number) {
    setBusyDayNumber(dayNumber);

    try {
      const existingDay = snapshot?.dayCards.find((card) => card.dayNumber === dayNumber)?.day ?? null;

      if (!existingDay) {
        await ensurePlanDay(dayNumber);
      } else {
        await savePlanDay(existingDay.id, {
          course_id: existingDay.course_id,
          day_number: existingDay.day_number,
          title: existingDay.title,
          subtitle: existingDay.subtitle,
          description: existingDay.description,
          estimated_minutes: existingDay.estimated_minutes,
          is_published: !existingDay.is_published,
          sort_order: existingDay.sort_order,
        });
      }

      await loadSnapshot();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Не успях да обновя деня.");
    } finally {
      setBusyDayNumber(null);
    }
  }

  if (isLoading) {
    return <LoadingState title="Зареждам 10-дневната програма" lines={8} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Не успях да заредя admin панела"
        description={error}
        action={<NeonButton onClick={() => void loadSnapshot()}>Опитай отново</NeonButton>}
      />
    );
  }

  if (!snapshot) {
    return (
      <EmptyState
        title="Няма admin данни"
        description="Опитай отново след малко."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        label="Admin CMS"
        title="10-дневната програма"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {snapshot.dayCards.map((card) => (
          <NeonCard key={card.dayNumber} padding="md" className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mh-label">Ден {card.dayNumber}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{card.title}</h2>
                <p className="mt-2 text-sm text-[var(--mh-text-muted)]">{card.subtitle}</p>
              </div>
              {getDayStatusBadge(card.status)}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge tone={card.sectionCount > 0 ? "cyan" : "neutral"}>{card.sectionCount} theory sections</Badge>
              <Badge tone={card.hasVideo ? "green" : "neutral"}>{card.hasVideo ? "Има видео" : "Без видео"}</Badge>
              <Badge tone="green">{card.quizCount} ПРОВЕРИ</Badge>
              <Badge tone="purple">{card.practiceCount} УПРАЖНИ</Badge>
              <Badge tone="gold">{card.bonusCount} ИЗПИТАЙ СЕ</Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              <NeonButton href={`/admin/days/${card.dayNumber}`}>
                Редактирай
              </NeonButton>
              <NeonButton
                type="button"
                variant={card.day?.is_published ? "ghost" : "success"}
                disabled={busyDayNumber === card.dayNumber}
                onClick={() => void handleCreateOrToggle(card.dayNumber)}
              >
                {!card.day ? "Създай ден" : card.day.is_published ? "Скрий" : "Публикувай"}
              </NeonButton>
            </div>
          </NeonCard>
        ))}
      </div>
    </div>
  );
}
