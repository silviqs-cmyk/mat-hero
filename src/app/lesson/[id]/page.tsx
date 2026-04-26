"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LessonCard } from "@/components/LessonCard";
import { MascotCharacter } from "@/components/MascotCharacter";
import { demoLessons } from "@/lib/demoData";
import { dayTaskData } from "@/lib/dayTaskData";
import { getPracticeQuestionsForDay } from "@/lib/practiceQuestions";
import { getLessonsByDay } from "@/lib/supabaseClient";
import type { Lesson } from "@/types";

function LessonOverview({
  mainTaskCount,
  extraTaskCount,
  quizQuestionCount,
}: {
  mainTaskCount: number;
  extraTaskCount: number;
  quizQuestionCount: number;
}) {
  const cards = [
    {
      id: "read",
      eyebrow: "1. Прочети",
      title: "Урокът",
      helper: "Теория и пример",
      accent: "border-cyan-400/30 bg-cyan-400/12 text-cyan-100",
    },
    {
      id: "main",
      eyebrow: "2. Упражни",
      title: `${mainTaskCount} основни задачи`,
      helper: "Задължителният пакет",
      accent: "border-lime-400/30 bg-lime-400/12 text-lime-100",
    },
    {
      id: "quiz",
      eyebrow: "3. Провери",
      title: `${quizQuestionCount} въпроса`,
      helper: "Тест за деня",
      accent: "border-pink-400/30 bg-pink-400/12 text-pink-100",
    },
  ];

  if (extraTaskCount > 0) {
    cards.push({
      id: "extra",
      eyebrow: "Бонус",
      title: `${extraTaskCount} допълнителни`,
      helper: "За още прогрес",
      accent: "border-white/12 bg-white/8 text-white/85",
    });
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-cyan-400/24 bg-[radial-gradient(circle_at_top_right,rgba(37,221,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(182,92,255,0.16),transparent_24%),linear-gradient(180deg,rgba(10,16,29,0.98),rgba(6,9,17,0.98))] p-5 shadow-[0_0_0_1px_rgba(37,221,255,0.12),0_0_36px_rgba(37,221,255,0.16),0_26px_80px_rgba(0,0,0,0.52)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            План за деня
          </p>
          <h2 className="mt-2 font-display text-3xl text-white drop-shadow-[0_0_18px_rgba(37,221,255,0.16)]">
            Как да минеш урока без хаос
          </h2>
        </div>
        <div className="rounded-full border border-cyan-400/30 bg-cyan-400/12 px-3 py-1 text-xs font-semibold text-cyan-100 shadow-[0_0_18px_rgba(37,221,255,0.14)]">
          Ясен ред
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <motion.article
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              {card.eyebrow}
            </p>
            <p className="mt-3 font-display text-xl text-white">{card.title}</p>
            <div
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold shadow-[0_0_18px_rgba(255,255,255,0.06)] ${card.accent}`}
            >
              {card.helper}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const dayId = Number(params.id);
  const tasks = dayTaskData[dayId] ?? { main: [], extra: [] };
  const quizQuestionCount = getPracticeQuestionsForDay(dayId, "main").length;
  const [lesson, setLesson] = useState<Lesson | null>(
    demoLessons.find((item) => item.day_id === dayId) ?? null,
  );

  useEffect(() => {
    let ignore = false;

    async function loadLesson() {
      const { data } = await getLessonsByDay(dayId);

      if (!ignore) {
        setLesson(data[0] ?? null);
      }
    }

    void loadLesson();
    return () => {
      ignore = true;
    };
  }, [dayId]);

  if (!lesson) {
    return (
      <div className="panel rounded-[28px] p-5">
        <p className="panel-copy-muted">Няма урок за този ден.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <LessonOverview
        mainTaskCount={tasks.main.length}
        extraTaskCount={tasks.extra.length}
        quizQuestionCount={quizQuestionCount}
      />

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <LessonCard lesson={lesson} />
        <MascotCharacter
          mood="happy"
          message="Мини първо през кратката теория, после отвори основните задачи една по една и чак накрая тръгни към теста."
          xpText="+25 XP след тест"
        />
      </section>

      {lesson.extended_theory?.length ? (
        <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Още теория
          </p>
          <div className="mt-4 space-y-3">
            {lesson.extended_theory.map((item) => (
              <p
                key={item}
                className="panel-copy rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-slate-200"
              >
                {item}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-wrap gap-3">
        <Link
          href={`/quiz/${lesson.day_id}`}
          className="btn-neon-primary inline-flex rounded-2xl px-6 py-4 text-sm font-semibold"
        >
          Започни теста
        </Link>
        {tasks.extra.length > 0 ? (
          <Link
            href={`/quiz/${lesson.day_id}?mode=extra`}
            className="btn-neon-outline inline-flex rounded-2xl px-6 py-4 text-sm font-semibold"
          >
            Бонус задачи
          </Link>
        ) : null}
      </section>
    </div>
  );
}
