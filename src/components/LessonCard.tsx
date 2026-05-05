"use client";

import { Badge } from "@/components/ui/Badge";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Lesson } from "@/types";

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <NeonCard as="article" padding="md" className="overflow-hidden">
      <SectionHeader
        label="Урок"
        title={<h2 className="mh-heading-lg">{lesson.title}</h2>}
        action={<Badge tone="cyan">Теория</Badge>}
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
        <NeonCard as="section" tone="cyan" padding="sm" className="rounded-[24px]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Най-важното
          </p>
          <p className="mt-4 text-[1rem] leading-7 text-slate-200">{lesson.short_theory}</p>
        </NeonCard>

        <NeonCard as="aside" tone="purple" padding="sm" className="rounded-[24px]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
            Пример
          </p>
          <p className="mt-3 font-display text-xl leading-8 text-white">{lesson.example}</p>
          <p className="mt-4 text-[0.95rem] leading-6 text-white/65">
            Прегледай примера спокойно и после мини към задачите отдолу.
          </p>
        </NeonCard>
      </div>
    </NeonCard>
  );
}
