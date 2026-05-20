import { Target, Zap } from "lucide-react";
import { AchievementBadge } from "@/components/AchievementBadge";
import { DayCard } from "@/components/DayCard";
import { NeonCard } from "@/components/ui/NeonCard";
import { PageHeroHeader } from "@/components/ui/PageHeroHeader";
import { StatCard } from "@/components/ui/StatCard";
import { requireStudent } from "@/lib/auth/server";
import { resolveCourseProgress } from "@/lib/progress";
import {
  getDefaultCourseServer,
  listUserResultsServer,
} from "@/services/studentContent.server";

export default async function RoadmapPage() {
  const { profile, onboardingMessage } = await requireStudent();

  if (!profile) {
    return (
      <div className="space-y-6">
        <NeonCard padding="md">
          <PageHeroHeader
            label="Пътна карта"
            title={<h2 className="mh-heading-xl">Профилът още не е готов</h2>}
            description={onboardingMessage ?? "Опитай отново след малко."}
          />
        </NeonCard>
      </div>
    );
  }

  const course = await getDefaultCourseServer();

  if (!course) {
    return (
      <div className="space-y-6">
        <NeonCard padding="md">
          <PageHeroHeader
            label="Пътна карта"
            title={<h2 className="mh-heading-xl">Няма активен курс</h2>}
            description="Публикувай курс и пътната карта ще се покаже тук."
          />
        </NeonCard>
      </div>
    );
  }

  const [progress, results] = await Promise.all([
    import("@/services/studentContent.server").then((module) =>
      module.getUserCourseProgressServer(profile.id, course.id),
    ),
    listUserResultsServer(profile.id, course.id),
  ]);

  const dayNumberByCourseDayId = new Map(course.days.map((day) => [day.id, day.day_number]));
  const resolvedProgress = resolveCourseProgress({
    progress,
    resultDayNumbers: results.map((result) => dayNumberByCourseDayId.get(result.course_day_id) ?? null),
    totalDays: course.duration_days,
  });

  const maxUnlockedDay = Math.min(
    course.duration_days,
    Math.max(
      resolvedProgress.currentDayNumber,
      ...resolvedProgress.completedDayNumbers.map((dayNumber) => dayNumber + 1),
    ),
  );

  return (
    <div className="space-y-6">
      <NeonCard padding="md">
        <PageHeroHeader
          label="Пътна карта"
          title={<h2 className="mh-heading-xl">{`${course.duration_days} дни до увереност`}</h2>}
          description="Всеки ден отключва следващия. Пази ритъма, мини през урока, задачите и теста."
        />
      </NeonCard>

      <section className="grid gap-4 lg:grid-cols-3">
        <NeonCard padding="sm" className="rounded-[26px]">
          <StatCard icon={Zap} value={resolvedProgress.currentDayNumber} label="Текущ ден" tone="cyan" />
        </NeonCard>

        <NeonCard padding="sm" className="rounded-[26px]">
          <StatCard
            icon={Target}
            value={`${resolvedProgress.completedDaysCount}/${course.duration_days}`}
            label="Завършени дни"
            tone="gold"
          />
        </NeonCard>

        <NeonCard padding="sm" className="rounded-[26px]">
          <p className="text-sm text-slate-400">Планът ти</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <AchievementBadge label={`Ден ${resolvedProgress.currentDayNumber}`} unlocked />
            <AchievementBadge label={`${resolvedProgress.completedDaysCount} готови`} unlocked />
            <AchievementBadge label="Финал" unlocked={resolvedProgress.currentDayNumber >= course.duration_days} />
          </div>
        </NeonCard>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {course.days.map((day) => {
          const isCompleted = resolvedProgress.completedDayNumbers.includes(day.day_number);
          const isCurrent = day.day_number === resolvedProgress.currentDayNumber;
          const isUnlocked = day.day_number <= maxUnlockedDay || isCurrent || isCompleted;

          return (
            <DayCard
              key={day.id}
              day={{
                id: day.day_number,
                title: day.title,
                topic: day.subtitle || day.description || `План за ден ${day.day_number}`,
                is_active: isUnlocked,
                order_index: day.day_number,
              }}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isUnlocked={isUnlocked}
            />
          );
        })}
      </section>
    </div>
  );
}
