"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreCard } from "@/components/ScoreCard";
import { WeakTopicCard } from "@/components/WeakTopicCard";
import { useAppState } from "@/components/providers/AppStateProvider";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="4" y="6" width="16" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 4v4M16 4v4M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="14" r="1.2" fill="currentColor" />
      <circle cx="13" cy="14" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M8 4h8v3a4 4 0 1 1-8 0V4Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 11v4M9 19h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 3c1 3-1 4 1 6 1 1 3 2 3 5a4 4 0 1 1-8 0c0-2 1-3 2-4 1-1 1-2 2-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 9l5-5M15 4h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GeometryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M5 18 9 6l10 10Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="9" cy="6" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FractionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="7" cy="7" r="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="17" r="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const { progress } = useAppState();
  const currentProgress = progress.current_day;
  const currentTopic = "Проценти";

  return (
    <div className="space-y-4 lg:mx-auto lg:max-w-5xl">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-glow overflow-hidden rounded-[28px] p-4"
      >
        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-400/35 bg-pink-400/10 text-pink-300 shadow-[0_0_18px_rgba(255,78,209,0.18)]">
                <CalendarIcon />
              </div>
              <div>
                <h2 className="font-display text-3xl font-bold text-white">Ден {progress.current_day} от 10</h2>
                <p className="mt-1 text-lg text-slate-300">Днес: {currentTopic}</p>
              </div>
            </div>
            <div className="mt-5">
              <ProgressBar
                label="Прогрес за деня"
                value={currentProgress * 10}
                max={100}
                helperText="Поддържай темпото и завърши урока."
                accent="cyan"
              />
            </div>
          </div>
          <div className="justify-self-center md:justify-self-end">
            <AnimatedHeroMascot size="md" />
          </div>
        </div>
      </motion.section>

      <section className="grid gap-3 md:grid-cols-3">
        <ScoreCard
          title="XP"
          value={`${progress.xp}`}
          helper="натрупани точки"
          icon={<TrophyIcon />}
          accent="pink"
        />
        <ScoreCard
          title="Серия"
          value={`${progress.streak} дни`}
          helper="без прекъсване"
          icon={<FireIcon />}
          accent="orange"
        />
        <ScoreCard
          title="Успеваемост"
          value={`${Math.max(progress.last_quiz_score, 68)}%`}
          helper="общ резултат"
          icon={<TargetIcon />}
          accent="cyan"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold text-white">Слаби теми</h3>
            <Link href="/report" className="text-sm font-semibold text-cyan-300">
              Виж отчет
            </Link>
          </div>
          <div className="space-y-3">
            <WeakTopicCard topic="Геометрия" score={42} icon={<GeometryIcon />} accent="pink" />
            <WeakTopicCard topic="Дроби" score={61} icon={<FractionIcon />} accent="purple" />
            <WeakTopicCard topic="Проценти" score={75} icon={<PercentIcon />} accent="lime" />
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          className="rounded-[24px] border border-pink-400/20 bg-[linear-gradient(180deg,rgba(19,13,26,0.98),rgba(9,10,19,0.98))] p-5 shadow-[0_18px_46px_rgba(0,0,0,0.42)]"
        >
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <h3 className="max-w-[220px] font-display text-3xl font-bold leading-tight text-white">
                Продължи от където си спрял
              </h3>
              <p className="mt-4 text-2xl text-slate-300">Проценти - Въведение</p>
              <Link
                href={`/lesson/${progress.current_day}`}
                className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(90deg,#ff4ed1,#c9ff00)] px-6 py-3 text-base font-bold text-[#111] shadow-[0_0_28px_rgba(201,255,0,0.2)] transition hover:brightness-110"
              >
                Продължи
                <span className="text-lg">›</span>
              </Link>
            </div>
            <div className="justify-self-center">
              <AnimatedHeroMascot size="sm" />
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
