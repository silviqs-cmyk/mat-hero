"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Lesson } from "@/types";

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <article className="panel-glow rounded-[28px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Теория</p>
      <h2 className="mt-2 font-display text-2xl text-white">{lesson.title}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{lesson.short_theory}</p>
      <div className="panel-pink mt-4 rounded-2xl p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Пример</p>
        <p className="mt-2 text-base font-semibold text-white">{lesson.example}</p>
      </div>
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
        <Link
          href={`/quiz/${lesson.day_id}`}
          className="btn-neon-primary mt-5 inline-flex rounded-2xl px-5 py-3 text-sm font-semibold transition"
        >
          Към теста
        </Link>
      </motion.div>
    </article>
  );
}
