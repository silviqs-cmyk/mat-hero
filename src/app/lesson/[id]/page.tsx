"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LessonCard } from "@/components/LessonCard";
import { MascotCharacter } from "@/components/MascotCharacter";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
  const cards: Array<{
    id: string;
    eyebrow: string;
    title: string;
    helper: string;
    tone: "purple" | "cyan" | "green" | "gold";
  }> = [
    {
      id: "read",
      eyebrow: "1. ПРОЧЕТИ",
      title: "Урокът",
      helper: "Теория и пример",
      tone: "purple" as const,
    },
    {
      id: "main",
      eyebrow: "2. УПРАЖНИ",
      title: `${mainTaskCount} основни задачи`,
      helper: "Задачи",
      tone: "cyan" as const,
    },
    {
      id: "quiz",
      eyebrow: "3. ПРОВЕРИ",
      title: `${quizQuestionCount} въпроса`,
      helper: "Тест за деня",
      tone: "green" as const,
    },
  ];

  if (extraTaskCount > 0) {
    cards.push({
      id: "extra",
      eyebrow: "БОНУС",
      title: `${extraTaskCount} допълнителни`,
      helper: "За още прогрес",
      tone: "gold" as const,
    });
  }

  return (
    <NeonCard padding="md">
      <SectionHeader
        label="План за деня"
        title={<h2 className="mh-heading-xl">Как да минеш урока без хаос</h2>}
        action={<span className="mh-badge mh-badge--cyan">Ясен ред</span>}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div key={card.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <NeonCard as="article" tone={card.tone} padding="sm" hoverable className="rounded-[26px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">{card.eyebrow}</p>
              <p className="mt-3 font-display text-xl text-white">{card.title}</p>
              <div className="mt-5 inline-flex rounded-full border border-current/25 px-4 py-2 text-sm font-semibold">
                {card.helper}
              </div>
            </NeonCard>
          </motion.div>
        ))}
      </div>
    </NeonCard>
  );
}

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const dayId = Number(params.id);
  const tasks = dayTaskData[dayId] ?? { main: [], extra: [] };
  const quizQuestionCount = getPracticeQuestionsForDay(dayId, "main").length;
  const [lesson, setLesson] = useState<Lesson | null>(demoLessons.find((item) => item.day_id === dayId) ?? null);

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
      <NeonCard padding="sm">
        <p className="mh-copy-muted">Няма урок за този ден.</p>
      </NeonCard>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <LessonOverview
        mainTaskCount={tasks.main.length}
        extraTaskCount={tasks.extra.length}
        quizQuestionCount={quizQuestionCount}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <LessonCard lesson={lesson} />
        <MascotCharacter
          mood="happy"
          message="Мини първо през кратката теория, после отвори основните задачи една по една и чак накрая тръгни към теста."
          xpText="+25 XP след тест"
        />
      </section>

      {lesson.extended_theory?.length ? (
        <NeonCard padding="md">
          <p className="mh-label">Още теория</p>
          <div className="mt-4 space-y-3">
            {lesson.extended_theory.map((item) => (
              <p key={item} className="rounded-[20px] border border-white/8 bg-white/[0.03] px-5 py-4 text-[1rem] leading-7 text-slate-200">
                {item}
              </p>
            ))}
          </div>
        </NeonCard>
      ) : null}

      <section className="flex flex-wrap gap-3">
        <NeonButton href={`/quiz/${lesson.day_id}`}>Започни теста</NeonButton>
        {tasks.extra.length > 0 ? (
          <NeonButton href={`/quiz/${lesson.day_id}?mode=extra`} variant="secondary">
            Бонус задачи
          </NeonButton>
        ) : null}
      </section>
    </div>
  );
}
