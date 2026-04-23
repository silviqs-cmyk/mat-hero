import { AchievementBadge } from "@/components/AchievementBadge";
import Link from "next/link";
import { getDays } from "@/lib/supabaseClient";

export default async function LandingPage() {
  const { data: days } = await getDays();
  const activeDays = days.filter((day) => day.is_active).length;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[32px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,rgba(57,215,255,0.18),transparent_28%),linear-gradient(135deg,rgba(20,23,34,0.98),rgba(18,22,36,0.96)_45%,rgba(41,24,60,0.92))] p-6 text-white shadow-[0_0_36px_rgba(57,215,255,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
          7. клас математика
        </p>
        <h2 className="mt-4 max-w-xs font-display text-4xl leading-tight">
          Математика като игра с XP, мисии и малки победи.
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
          10-дневен roadmap, неонови награди, кратки уроци и куизове с мигновена
          обратна връзка. Създадено да държи вниманието и да дава чувство за напредък.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/dashboard"
            className="btn-neon-primary rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Влез в таблото
          </Link>
          <Link
            href="/roadmap"
            className="btn-neon-outline rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Виж плана
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="panel rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--text-muted)]">План</p>
          <h3 className="mt-2 font-display text-3xl text-white">10 дни</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Активни днес: {activeDays}</p>
        </article>
        <article className="panel rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--text-muted)]">Теми</p>
          <h3 className="mt-2 font-display text-3xl text-white">3 ядра</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Проценти, дроби, геометрия</p>
        </article>
        <article className="panel rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--text-muted)]">Финал</p>
          <h3 className="mt-2 font-display text-3xl text-white">Отчет</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Препоръки за последен преговор</p>
        </article>
      </section>

      <section className="panel-glow rounded-[28px] p-5">
        <h3 className="font-display text-2xl text-white">Подготовка без паника</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Всеки ден има ясна мисия: кратък урок, няколко задачи и моментална обратна
          връзка. Така виждаш какво вече владееш и кои теми да повториш преди изпита.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <AchievementBadge label="Дневна мисия" unlocked />
          <AchievementBadge label="XP прогрес" unlocked />
          <AchievementBadge label="Финален отчет" unlocked />
        </div>
      </section>
    </div>
  );
}
