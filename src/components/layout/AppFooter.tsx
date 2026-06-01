"use client";

import Link from "next/link";
import { Activity, Grid2x2, Map, Trophy } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

export function AppFooter() {
  return (
    <footer className="hidden border-t border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(32,55,112,0.16),transparent_58%),linear-gradient(180deg,rgba(4,10,24,0.94),rgba(3,8,19,0.98))] md:block">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] lg:items-start">
          <div className="space-y-4">
            <BrandMark iconShellClassName="shadow-[0_0_24px_rgba(34,211,238,0.16)]" subtitle="" />

            <div className="flex items-center gap-3 text-cyan-200">
              <Activity className="h-4 w-4 shrink-0 text-cyan-300" />
              <p className="font-[family:var(--font-display-app)] text-base font-semibold tracking-[0.02em] text-cyan-200">
                Математика с ритъм
              </p>
            </div>

            <p className="max-w-md text-sm leading-6 text-[var(--mh-text-muted)]">
              Подготовка за НВО по математика за 7. клас.
            </p>
          </div>

          <nav className="flex flex-col items-start gap-4 justify-self-end text-sm text-white/88">
            <Link href="/dashboard" className="flex items-center gap-3 transition hover:text-cyan-100">
              <Grid2x2 className="h-5 w-5 text-cyan-300" />
              <span>Табло</span>
            </Link>
            <Link href="/roadmap" className="flex items-center gap-3 transition hover:text-fuchsia-200">
              <Map className="h-5 w-5 text-fuchsia-300" />
              <span>Карта</span>
            </Link>
            <Link href="/results" className="flex items-center gap-3 transition hover:text-cyan-100">
              <Trophy className="h-5 w-5 text-cyan-300" />
              <span>Резултати</span>
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-white/8 pt-5 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">
            © 2026 MatHero. Всички права запазени.
          </p>
        </div>
      </div>
    </footer>
  );
}
