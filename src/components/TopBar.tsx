"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Flame, Target } from "lucide-react";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useTopBarProgress } from "@/components/providers/TopBarProgressProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePublishedCourse } from "@/hooks/usePublishedCourse";
import { useUserProgress } from "@/hooks/useUserProgress";
import { calculatePercentage, resolveCourseProgress } from "@/lib/progress";
import { getGoalModel } from "@/lib/studentFlow";
import { listUserResults } from "@/services/results";
import type { DayResult, UserProfile } from "@/types/user";

interface TopBarProps {}

interface GoalCardProps {
  profile: UserProfile | null;
  averageResult: number;
}

interface ProgressCardProps {
  currentDayNumber: number;
  completedDaysCount: number;
  totalDays: number;
}

function GoalCard({ profile, averageResult }: GoalCardProps) {
  const goal = getGoalModel(profile, averageResult);

  return (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-[22px] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(50,30,7,0.58),rgba(27,18,8,0.8))] px-4 py-3 shadow-[0_0_24px_rgba(245,158,11,0.1)] sm:flex-row sm:items-center">
      <span className="mh-icon-shell mh-icon-shell--gold flex h-10 w-10 shrink-0 items-center justify-center">
        <Target className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-amber-200/90">
          {goal.title}
        </p>
        <p className="truncate text-sm font-semibold text-white">{goal.target}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--mh-accent-gold),var(--mh-accent-amber))] shadow-[0_0_14px_rgba(245,158,11,0.3)]"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-white">{goal.progress}%</p>
        <p className="text-[0.7rem] text-[var(--mh-text-muted)]">
          {averageResult > 0 ? `средно ${averageResult}%` : "няма резултати"}
        </p>
      </div>
    </div>
  );
}

function ProgressCard({ currentDayNumber, completedDaysCount, totalDays }: ProgressCardProps) {
  const { progress: topBarProgress } = useTopBarProgress();
  const planProgress = calculatePercentage(completedDaysCount, totalDays);
  const nextDayLabel = totalDays > 0 ? `Следва: ${Math.min(currentDayNumber, totalDays)}` : "";

  const activeProgress = topBarProgress
    ? {
        label: topBarProgress.label,
        summary: topBarProgress.summary,
        helper: topBarProgress.helper,
        percent: calculatePercentage(topBarProgress.value, topBarProgress.max),
      }
    : {
        label: "Напредък",
        summary: `Завършени ${completedDaysCount} от ${totalDays}`,
        helper: nextDayLabel,
        percent: planProgress,
      };

  return (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-[22px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,29,56,0.58),rgba(8,18,36,0.8))] px-4 py-3 shadow-[0_0_24px_rgba(34,211,238,0.1)] sm:flex-row sm:items-center">
      <span className="mh-icon-shell mh-icon-shell--cyan flex h-10 w-10 shrink-0 items-center justify-center">
        <Flame className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-cyan-200/90">
          {activeProgress.label}
        </p>
        <p className="truncate text-sm font-semibold text-white">{activeProgress.summary}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,var(--mh-accent-cyan))] shadow-[0_0_14px_rgba(34,211,238,0.28)]"
            style={{ width: `${activeProgress.percent}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-white">{activeProgress.percent}%</p>
        <p className="max-w-[10rem] truncate text-[0.7rem] text-[var(--mh-text-muted)]">
          {activeProgress.helper}
        </p>
      </div>
    </div>
  );
}

function ProfileLink() {
  const { authUser } = useAppState();
  const userLabel =
    authUser.isReady && authUser.displayName.trim().length > 0 ? authUser.displayName : "Зареждане...";
  const secondaryLabel = authUser.isReady ? authUser.gradeLabel : null;
  const avatarLetter = userLabel.charAt(0).toUpperCase();

  return (
    <Link
      href="/profile"
      className="flex h-full min-w-0 items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-3 py-3 transition hover:border-cyan-300/20 hover:bg-white/[0.05] lg:ml-auto lg:min-w-[14rem] lg:max-w-[16rem]"
      aria-label="Към профила"
    >
      <div className="mh-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
        {avatarLetter}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{userLabel}</p>
        {secondaryLabel ? (
          <p className="truncate text-xs text-[var(--mh-text-muted)]">{secondaryLabel}</p>
        ) : null}
      </div>
      <ChevronRight className="hidden h-4 w-4 shrink-0 text-white/70 lg:block" />
    </Link>
  );
}

export function TopBar({}: TopBarProps) {
  const { profile } = useCurrentUser();
  const { data: course } = usePublishedCourse();
  const { data: persistedProgress } = useUserProgress(profile?.id ?? null, course?.id ?? null);
  const [results, setResults] = useState<DayResult[]>([]);
  const [resultsLoaded, setResultsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadResults() {
      if (!profile?.id) {
        if (active) {
          setResults([]);
          setResultsLoaded(true);
        }
        return;
      }

      try {
        const loadedResults = await listUserResults(profile.id);
        if (active) {
          setResults(loadedResults);
        }
      } catch (error) {
        console.error("Failed to load top bar results", error);
        if (active) {
          setResults([]);
        }
      } finally {
        if (active) {
          setResultsLoaded(true);
        }
      }
    }

    setResultsLoaded(false);
    void loadResults();

    return () => {
      active = false;
    };
  }, [profile?.id]);

  const averageResult = useMemo(() => {
    if (results.length === 0) {
      return 0;
    }

    return Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length);
  }, [results]);

  const totalDays = course?.duration_days ?? 10;
  const resolvedProgress = resolveCourseProgress({
    progress: persistedProgress,
    totalDays,
  });
  const currentDayNumber = resolvedProgress.currentDayNumber;
  const completedDaysCount = resolvedProgress.completedDaysCount;

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
      <div className="rounded-[26px] border border-white/10 bg-[rgba(7,11,22,0.86)] px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-5 sm:py-5 lg:px-6">
        <div className="flex items-start gap-3 lg:hidden">
          <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-3 text-white">
            <div className="mh-card-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl p-2">
              <AnimatedHeroMascot size="sm" animated={false} />
            </div>
            <div className="min-w-0">
              <p className="font-logo text-[1.8rem] font-extrabold leading-none text-white">MatHero</p>
              <p className="mt-1 truncate text-sm text-[var(--mh-text-muted)]">Математика с ритъм</p>
            </div>
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
          <GoalCard profile={profile} averageResult={resultsLoaded ? averageResult : 0} />
          <ProgressCard
            currentDayNumber={currentDayNumber}
            completedDaysCount={completedDaysCount}
            totalDays={totalDays}
          />
        </div>

        <div className="hidden lg:flex lg:min-w-0 lg:items-stretch lg:gap-3">
          <Link href="/dashboard" className="flex min-w-0 max-w-[16rem] items-center gap-3 text-white">
            <div className="mh-card-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl p-2">
              <AnimatedHeroMascot size="sm" animated={false} />
            </div>
            <div className="min-w-0">
              <p className="font-logo text-[1.9rem] font-extrabold leading-none text-white">MatHero</p>
              <p className="mt-1 truncate text-sm leading-6 text-[var(--mh-text-muted)]">Математика с ритъм</p>
            </div>
          </Link>

          <div className="min-w-0 flex-1">
            <GoalCard profile={profile} averageResult={resultsLoaded ? averageResult : 0} />
          </div>

          <div className="min-w-0 flex-1">
            <ProgressCard
              currentDayNumber={currentDayNumber}
              completedDaysCount={completedDaysCount}
              totalDays={totalDays}
            />
          </div>

          <ProfileLink />
        </div>
      </div>
    </header>
  );
}
