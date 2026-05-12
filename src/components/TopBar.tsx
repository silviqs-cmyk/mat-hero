"use client";

import Link from "next/link";
import { ChevronRight, Flame, Target } from "lucide-react";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useTopBarProgress } from "@/components/providers/TopBarProgressProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getGoalModel } from "@/lib/studentFlow";

export function TopBar() {
  const { authUser, progress } = useAppState();
  const { progress: topBarProgress } = useTopBarProgress();
  const { profile } = useCurrentUser();
  const goal = getGoalModel(profile);
  const planProgress = Math.max(10, Math.min(100, Math.round((progress.current_day / 10) * 100)));
  const userLabel = authUser.isReady ? authUser.displayName : "Зареждане...";
  const secondaryLabel = authUser.isReady
    ? authUser.gradeLabel ?? (authUser.isGuest ? "Гост режим" : null)
    : null;
  const avatarLetter = userLabel.charAt(0).toUpperCase();
  const planMessage =
    progress.current_day >= 8 ? "Финалната права е близо" : progress.current_day >= 4 ? "Държиш добър ритъм" : "Строиш стабилна основа";
  const activeProgress = topBarProgress
    ? {
        label: topBarProgress.label,
        summary: topBarProgress.summary,
        helper: topBarProgress.helper,
        percent:
          topBarProgress.max > 0
            ? Math.max(0, Math.min(100, Math.round((topBarProgress.value / topBarProgress.max) * 100)))
            : 0,
        tone: topBarProgress.tone,
      }
    : {
        label: "Напредък в плана",
        summary: `Ден ${progress.current_day} от 10`,
        helper: planMessage,
        percent: planProgress,
        tone: "cyan" as const,
      };

  const progressToneClasses = {
    shell: "border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,29,56,0.58),rgba(8,18,36,0.8))] shadow-[0_0_24px_rgba(34,211,238,0.1)]",
    label: "text-cyan-200/90",
    icon: "mh-icon-shell--cyan",
    bar: "bg-[linear-gradient(90deg,#2563eb,var(--mh-accent-cyan))] shadow-[0_0_14px_rgba(34,211,238,0.28)]",
  };

  const brandSubtitle = "Математика с ритъм";

  return (
    <header className="relative sticky top-0 z-50 px-5 py-5 sm:px-6 sm:py-5 lg:px-10 lg:py-5">
      <div className="flex flex-col gap-4 rounded-[26px] border border-white/10 bg-[rgba(7,11,22,0.86)] px-5 py-5 sm:px-6 sm:py-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:flex-row lg:items-center lg:px-8">
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center">
          <div className="mh-card-muted flex h-12 w-12 items-center justify-center rounded-2xl p-2">
            <AnimatedHeroMascot size="sm" animated={false} />
          </div>
          <div className="min-w-0">
            <p className="font-logo text-[1.9rem] font-extrabold leading-none text-white">MatHero</p>
            <p className="mt-1 truncate text-sm leading-6 text-[var(--mh-text-muted)]">{brandSubtitle}</p>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-stretch">
          <div className="flex h-full w-full flex-col gap-3 rounded-[22px] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(50,30,7,0.58),rgba(27,18,8,0.8))] px-4 py-3 shadow-[0_0_24px_rgba(245,158,11,0.1)] sm:flex-row sm:items-center">
            <span className="mh-icon-shell mh-icon-shell--gold flex h-10 w-10 items-center justify-center">
              <Target className="h-5 w-5" />
            </span>
            <div className="min-w-0 w-full sm:w-[8rem]">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-amber-200/90">{goal.title}</p>
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

          {activeProgress ? (
            <div className={`flex h-full w-full flex-col gap-3 rounded-[22px] border px-4 py-3 ${progressToneClasses.shell} sm:flex-row sm:items-center`}>
              <span className={`mh-icon-shell flex h-10 w-10 items-center justify-center ${progressToneClasses.icon}`}>
                <Flame className="h-5 w-5" />
              </span>
              <div className="min-w-0 w-full sm:w-[8rem]">
                <p className={`text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${progressToneClasses.label}`}>{activeProgress.label}</p>
                <p className="truncate text-sm font-semibold text-white">{activeProgress.summary}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={`h-full rounded-full ${progressToneClasses.bar}`}
                    style={{ width: `${activeProgress.percent}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{activeProgress.percent}%</p>
                <p className="text-[0.7rem] text-[var(--mh-text-muted)]">{activeProgress.helper}</p>
              </div>
            </div>
          ) : null}

          <Link
            href="/profile"
            className="order-first absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] transition hover:border-cyan-300/20 hover:bg-white/[0.05] sm:relative sm:right-0 sm:top-0 sm:w-full sm:max-w-none sm:justify-between sm:gap-3 sm:px-3 sm:py-2 sm:order-none"
            aria-label="Към профила"
          >
            <div className="mh-avatar flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white">
              {avatarLetter}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-white">{userLabel}</p>
              {secondaryLabel ? <p className="text-xs text-[var(--mh-text-muted)]">{secondaryLabel}</p> : null}
            </div>
            <ChevronRight className="hidden h-4 w-4 text-white/70 sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
}
