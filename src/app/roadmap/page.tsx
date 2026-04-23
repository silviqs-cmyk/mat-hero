import { AchievementBadge } from "@/components/AchievementBadge";
import { DayCard } from "@/components/DayCard";
import { getDays } from "@/lib/supabaseClient";

export default async function RoadmapPage() {
  const { data: days } = await getDays();

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
      <section className="panel-glow rounded-[30px] p-5 lg:col-span-2">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Пътна карта</p>
        <h2 className="mt-2 font-display text-2xl text-white">10 дни до успеха</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Първите 3 дни са активни. Следващите теми са заключени, за да вървиш спокойно
          стъпка по стъпка.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <AchievementBadge label="3 активни" unlocked />
          <AchievementBadge label="7 заключени" unlocked={false} />
          <AchievementBadge label="Финален тест" unlocked={false} />
        </div>
      </section>

      {days.map((day) => (
        <DayCard key={day.id} day={day} isCompleted={false} isCurrent={day.id === 1} />
      ))}
    </div>
  );
}
