"use client";

import Link from "next/link";
import { ChevronRight, Flame, Menu, Target, X } from "lucide-react";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useTopBarProgress } from "@/components/providers/TopBarProgressProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getGoalModel } from "@/lib/studentFlow";

interface TopBarProps {
  mobileMenuOpen?: boolean;
  onToggleMenu?: () => void;
}

function GoalCard() {
  const { profile } = useCurrentUser();
  const goal = getGoalModel(profile);

  return (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-[22px] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(50,30,7,0.58),rgba(27,18,8,0.8))] px-4 py-3 shadow-[0_0_24px_rgba(245,158,11,0.1)] sm:flex-row sm:items-center">
      <span className="mh-icon-shell mh-icon-shell--gold flex h-10 w-10 items-center justify-center shrink-0">
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
        <p className="text-[0.7rem] text-[var(--mh-text-muted)]">напредък</p>
      </div>
    </div>
  );
}

function ProgressCard() {
  const { progress } = useAppState();
  const { progress: topBarProgress } = useTopBarProgress();
  const planProgress = Math.max(10, Math.min(100, Math.round((progress.current_day / 10) * 100)));
  const planMessage =
    progress.current_day >= 8
      ? "Финалната права е близо"
      : progress.current_day >= 4
        ? "Държиш добър ритъм"
        : "Строиш стабилна основа";

  const activeProgress = topBarProgress
    ? {
        label: topBarProgress.label,
        summary: topBarProgress.summary,
        helper: topBarProgress.helper,
        percent:
          topBarProgress.max > 0
            ? Math.max(0, Math.min(100, Math.round((topBarProgress.value / topBarProgress.max) * 100)))
            : 0,
      }
    : {
        label: "Напредък",
        summary: `Ден ${progress.current_day} от 10`,
        helper: planMessage,
        percent: planProgress,
      };

  return (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-[22px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,29,56,0.58),rgba(8,18,36,0.8))] px-4 py-3 shadow-[0_0_24px_rgba(34,211,238,0.1)] sm:flex-row sm:items-center">
      <span className="mh-icon-shell mh-icon-shell--cyan flex h-10 w-10 items-center justify-center shrink-0">
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
        <p className="text-[0.7rem] text-[var(--mh-text-muted)]">{activeProgress.helper}</p>
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

export function TopBar({ mobileMenuOpen = false, onToggleMenu }: TopBarProps) {
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

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/profile"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-white transition hover:border-cyan-300/20 hover:bg-white/[0.05]"
              aria-label="Профил"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>

            <button
              type="button"
              onClick={onToggleMenu}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-white transition hover:border-cyan-300/20 hover:bg-white/[0.05]"
              aria-label={mobileMenuOpen ? "Затвори менюто" : "Отвори менюто"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
          <GoalCard />
          <ProgressCard />
        </div>

        <div className="hidden lg:flex lg:min-w-0 lg:items-stretch lg:gap-3">
          <Link
            href="/dashboard"
            className="flex min-w-0 max-w-[16rem] items-center gap-3 text-white"
          >
            <div className="mh-card-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl p-2">
              <AnimatedHeroMascot size="sm" animated={false} />
            </div>
            <div className="min-w-0">
              <p className="font-logo text-[1.9rem] font-extrabold leading-none text-white">MatHero</p>
              <p className="mt-1 truncate text-sm leading-6 text-[var(--mh-text-muted)]">Математика с ритъм</p>
            </div>
          </Link>

          <div className="min-w-0 flex-1">
            <GoalCard />
          </div>

          <div className="min-w-0 flex-1">
            <ProgressCard />
          </div>

          <ProfileLink />
        </div>
      </div>
    </header>
  );
}
