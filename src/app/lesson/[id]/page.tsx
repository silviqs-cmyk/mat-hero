"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LessonCard } from "@/components/LessonCard";
import { MascotCharacter } from "@/components/MascotCharacter";
import { SupplementaryMaterialsCard } from "@/components/SupplementaryMaterialsCard";
import { getLessonsByDay } from "@/lib/supabaseClient";
import { demoLessons } from "@/lib/demoData";
import type { Lesson } from "@/types";

function AnimatedVisualization({ lesson }: { lesson: Lesson }) {
  if (lesson.animation_type === "fraction-stack") {
    return (
      <div className="panel-glow grid grid-cols-4 gap-2 rounded-[28px] p-5">
        {[1, 2, 3, 4].map((part) => (
          <motion.div
            key={part}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: part <= 3 ? 1 : 0.35 }}
            transition={{ delay: part * 0.08 }}
            className="h-18 rounded-2xl bg-[linear-gradient(180deg,rgba(57,215,255,0.85),rgba(110,107,255,0.8))]"
          />
        ))}
      </div>
    );
  }

  if (lesson.animation_type === "geometry-pulse") {
    return (
      <div className="panel-glow flex items-center justify-center rounded-[28px] p-5">
        <motion.div
          initial={{ scale: 0.8, rotate: 0 }}
          animate={{ scale: [0.9, 1.04, 0.9], rotate: [0, 4, -4, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
          className="h-32 w-32 rounded-[2rem] border-[12px] border-cyan-300 bg-cyan-300/10 shadow-[0_0_24px_rgba(57,215,255,0.14)]"
        />
      </div>
    );
  }

  return (
    <div className="panel-glow space-y-3 rounded-[28px] p-5">
      {[35, 60, 85].map((value, index) => (
        <div key={value}>
          <div className="mb-2 flex justify-between text-sm font-semibold text-slate-300">
            <span>Стъпка {index + 1}</span>
            <span>{value}%</span>
          </div>
          <div className="h-4 rounded-full bg-white/8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand),var(--accent))]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const dayId = Number(params.id);
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
        <p className="text-sm text-[var(--text-muted)]">Няма урок за този ден.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <MascotCharacter
        mood="happy"
        message="Това е кратък, силен урок. Вземи идеята, реши примера и после удари куиза."
        xpText="+25 XP след завършен куиз"
      />
      <AnimatedVisualization lesson={lesson} />
      <LessonCard lesson={lesson} />
      <SupplementaryMaterialsCard
        title="Мини cheat sheet"
        description="Тук по-късно можем да добавим формули, бързи подсказки или 30-секундно видео обяснение."
      />
      <Link
        href={`/quiz/${lesson.day_id}`}
        className="btn-neon-primary block rounded-[28px] p-5 text-center text-sm font-semibold"
      >
        Готов съм за куиза
      </Link>
    </div>
  );
}
