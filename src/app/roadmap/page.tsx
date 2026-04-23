import { AchievementBadge } from "@/components/AchievementBadge";
import { DayCard } from "@/components/DayCard";
import { getDays } from "@/lib/supabaseClient";

export default async function RoadmapPage() {
  const { data: days } = await getDays();

  return (
    <div className="space-y-4">
      <section className="panel-glow rounded-[30px] p-5">
        <h2 className="font-display text-2xl text-white">10-дневен маршрут</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Само първите 3 дни са отключени, за да имаш ясен ритъм. Бъдещите мисии стоят
          заключени като mini boss нива и се усещат като награда, а не като претоварване.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <AchievementBadge label="3 active" unlocked />
          <AchievementBadge label="7 locked" unlocked={false} />
          <AchievementBadge label="Boss day" unlocked={false} />
        </div>
      </section>

      {days.map((day) => (
        <DayCard key={day.id} day={day} isCompleted={false} isCurrent={day.id === 1} />
      ))}
    </div>
  );
}
