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
  latestResult: number;
}

interface ProgressCardProps {
  currentDayNumber: number;
  completedDaysCount: number;
  totalDays: number;
}

function GoalCard({ profile, latestResult }: GoalCardProps) {
  const goal = getGoalModel(profile, latestResult);

  return (
    <div className="flex h-full min-w-0 items-center gap-4 rounded-[22px] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(50,30,7,0.58),rgba(27,18,8,0.8))] p-4 shadow-[0_0_24px_rgba(245,158,11,0.1)]">
      <span className="mh-icon-shell mh-icon-shell--gold flex h-10 w-10 shrink-0 items-center justify-center self-start">
        <Target className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-amber-200/90">
          Последен резултат
        </p>
        <p className="truncate text-sm font-semibold text-white">{goal.target}</p>
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--mh-accent-gold),var(--mh-accent-amber))] shadow-[0_0_14px_rgba(245,158,11,0.3)]"
            style={{ width: `${latestResult}%` }}
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center text-right">
        <p className="text-lg font-bold text-white">{latestResult}%</p>
        <p className="text-[0.7rem] text-[var(--mh-text-muted)]">{`цел: ${goal.target}`}</p>
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
    <div className="flex h-full min-w-0 items-center gap-4 rounded-[22px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,29,56,0.58),rgba(8,18,36,0.8))] p-4 shadow-[0_0_24px_rgba(34,211,238,0.1)]">
      <span className="mh-icon-shell mh-icon-shell--cyan flex h-10 w-10 shrink-0 items-center justify-center self-start">
        <Flame className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-cyan-200/90">
          {activeProgress.label}
        </p>
        <p className="truncate text-sm font-semibold text-white">{activeProgress.summary}</p>
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,var(--mh-accent-cyan))] shadow-[0_0_14px_rgba(34,211,238,0.28)]"
            style={{ width: `${activeProgress.percent}%` }}
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center text-right">
        <p className="text-lg font-bold text-white">{activeProgress.percent}%</p>
        <p className="max-w-[9rem] truncate text-[0.7rem] text-[var(--mh-text-muted)]">
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
  const greetingLabel =
    authUser.isReady && authUser.displayName.trim().length > 0 ? `Здравей, ${authUser.displayName}` : "Здравей";
  const secondaryLabel = authUser.isReady ? authUser.gradeLabel : null;
  const avatarLetter = userLabel.charAt(0).toUpperCase();

  return (
    <Link
      href="/profile"
      className="flex h-full min-w-0 items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] p-4 transition hover:border-cyan-300/20 hover:bg-white/[0.05] lg:w-full"
      aria-label="Към профила"
    >
      <div className="mh-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
        {avatarLetter}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{greetingLabel}</p>
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
  const latestResult = useMemo(() => results[0]?.percentage ?? 0, [results]);

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
        <div className="flex items-center gap-3 lg:hidden">
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

        <div className="mt-4 grid gap-3 lg:hidden">
          <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
            <GoalCard profile={profile} latestResult={resultsLoaded ? latestResult : 0} />
            <ProgressCard
              currentDayNumber={currentDayNumber}
              completedDaysCount={completedDaysCount}
              totalDays={totalDays}
            />
          </div>
          <div className="w-full md:col-span-2 md:justify-self-end md:max-w-[280px]">
            <ProfileLink />
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(220px,280px)] lg:items-stretch lg:gap-4">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3 self-center text-white">
            <div className="mh-card-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl p-2">
              <AnimatedHeroMascot size="sm" animated={false} />
            </div>
            <div className="min-w-0">
              <p className="font-logo text-[1.9rem] font-extrabold leading-none text-white">MatHero</p>
              <p className="mt-1 truncate text-sm leading-6 text-[var(--mh-text-muted)]">Математика с ритъм</p>
            </div>
          </Link>

          <div className="grid min-w-0 grid-cols-2 gap-4">
            <GoalCard profile={profile} latestResult={resultsLoaded ? latestResult : 0} />
            <ProgressCard
              currentDayNumber={currentDayNumber}
              completedDaysCount={completedDaysCount}
              totalDays={totalDays}
            />
          </div>

          <div className="min-w-0 justify-self-end w-full max-w-[280px]">
            <ProfileLink />
          </div>
        </div>
      </div>
    </header>
  );
}
