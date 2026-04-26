"use client";

import type { Lesson } from "@/types";

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <article className="overflow-hidden rounded-[32px] border border-cyan-400/25 bg-[radial-gradient(circle_at_top_right,rgba(37,221,255,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,78,209,0.14),transparent_26%),linear-gradient(180deg,rgba(10,16,29,0.98),rgba(5,8,16,0.98))] p-6 shadow-[0_0_0_1px_rgba(37,221,255,0.14),0_0_34px_rgba(37,221,255,0.18),0_28px_80px_rgba(0,0,0,0.52)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Урок
          </p>
          <h2 className="mt-2 font-display text-[2rem] leading-tight text-white drop-shadow-[0_0_18px_rgba(37,221,255,0.18)]">
            {lesson.title}
          </h2>
        </div>
        <div className="rounded-full border border-cyan-300/45 bg-cyan-400/12 px-3 py-1 text-xs font-semibold text-cyan-100 shadow-[0_0_18px_rgba(37,221,255,0.16)]">
          Теория
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-[24px] border border-cyan-400/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_22px_rgba(37,221,255,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Най-важното
          </p>
          <p className="panel-copy mt-3 text-slate-200">{lesson.short_theory}</p>
        </section>

        <aside className="rounded-[24px] border border-pink-400/28 bg-[radial-gradient(circle_at_top_right,rgba(255,78,209,0.2),transparent_35%),linear-gradient(180deg,rgba(34,13,36,0.96),rgba(11,11,21,0.96))] p-5 shadow-[0_0_24px_rgba(255,78,209,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
            Пример
          </p>
          <p className="mt-3 font-display text-xl leading-8 text-white drop-shadow-[0_0_14px_rgba(255,78,209,0.16)]">
            {lesson.example}
          </p>
          <p className="panel-copy mt-4 text-white/65">
            Прегледай примера спокойно и после мини към задачите отдолу.
          </p>
        </aside>
      </div>

    </article>
  );
}
