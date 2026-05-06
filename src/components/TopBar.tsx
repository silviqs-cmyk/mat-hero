"use client";

import Link from "next/link";
import { ChevronRight, Flame, Target } from "lucide-react";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useTopBarProgress } from "@/components/providers/TopBarProgressProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getGoalModel } from "@/lib/studentFlow";

interface TopBarProps {
  subtitle: string;
}

export function TopBar({ subtitle }: TopBarProps) {
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

  const progressToneClasses =
    activeProgress.tone === "lime"
      ? {
          shell: "border-lime-400/20 bg-[linear-gradient(180deg,rgba(17,59,44,0.58),rgba(10,28,21,0.8))] shadow-[0_0_24px_rgba(34,197,94,0.1)]",
          label: "text-emerald-200/90",
          icon: "mh-icon-shell--green",
          bar: "bg-[linear-gradient(90deg,var(--mh-accent-lime),#86efac)] shadow-[0_0_14px_rgba(34,197,94,0.28)]",
        }
      : {
          shell: "border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,29,56,0.58),rgba(8,18,36,0.8))] shadow-[0_0_24px_rgba(34,211,238,0.1)]",
          label: "text-cyan-200/90",
          icon: "mh-icon-shell--cyan",
          bar: "bg-[linear-gradient(90deg,#2563eb,var(--mh-accent-cyan))] shadow-[0_0_14px_rgba(34,211,238,0.28)]",
        };

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(7,11,22,0.82)] px-4 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="mh-card-muted flex h-12 w-12 items-center justify-center rounded-2xl p-2">
            <AnimatedHeroMascot size="sm" animated={false} />
          </div>
          <div className="min-w-0">
            <p className="font-logo text-[1.9rem] font-extrabold leading-none text-white">MatHero</p>
            {subtitle ? <p className="mt-1 truncate text-sm leading-6 text-[var(--mh-text-muted)]">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-[22px] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(50,30,7,0.58),rgba(27,18,8,0.8))] px-4 py-3 shadow-[0_0_24px_rgba(245,158,11,0.1)] lg:flex">
            <span className="mh-icon-shell mh-icon-shell--gold flex h-10 w-10 items-center justify-center">
              <Target className="h-5 w-5" />
            </span>
            <div className="min-w-0 w-[11rem]">
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

          <div className={`hidden items-center gap-3 rounded-[22px] border px-4 py-3 lg:flex ${progressToneClasses.shell}`}>
            <span className={`mh-icon-shell flex h-10 w-10 items-center justify-center ${progressToneClasses.icon}`}>
              <Flame className="h-5 w-5" />
            </span>
            <div className="min-w-0 w-[11rem]">
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

          <Link
            href="/report"
            className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-2 py-2 transition hover:border-cyan-300/20 hover:bg-white/[0.05] sm:gap-3 sm:px-3"
            aria-label="Към профила"
          >
            <div className="mh-avatar flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white">
              {avatarLetter}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-white">{userLabel}</p>
              {secondaryLabel ? <p className="text-xs text-[var(--mh-text-muted)]">{secondaryLabel}</p> : null}
            </div>
            <ChevronRight className="h-4 w-4 text-white/70" />
          </Link>
        </div>
      </div>
    </header>
  );
}
