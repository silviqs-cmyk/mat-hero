"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { useAppState } from "@/components/providers/AppStateProvider";

interface TopBarProps {
  subtitle: string;
}

export function TopBar({ subtitle }: TopBarProps) {
  const { authUser } = useAppState();
  const userLabel = authUser.isReady ? authUser.displayName : "Р—Р°СЂРµР¶РґР°РЅРµ...";
  const secondaryLabel = authUser.isReady
    ? authUser.gradeLabel ?? (authUser.isGuest ? "Р“РѕСЃС‚ СЂРµР¶РёРј" : "MatHero РїСЂРѕС„РёР»")
    : "РџСЂРѕС„РёР»";
  const avatarLetter = userLabel.charAt(0).toUpperCase();

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
          <Link
            href="/report"
            className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-2 py-2 transition hover:border-cyan-300/20 hover:bg-white/[0.05] sm:gap-3 sm:px-3"
            aria-label="РљСЉРј РїСЂРѕС„РёР»Р°"
          >
            <div className="mh-avatar flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white">
              {avatarLetter}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-white">{userLabel}</p>
              <p className="text-xs text-[var(--mh-text-muted)]">{secondaryLabel}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/70" />
          </Link>
        </div>
      </div>
    </header>
  );
}
