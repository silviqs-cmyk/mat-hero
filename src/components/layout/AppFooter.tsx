"use client";

import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="hidden border-t border-white/10 bg-white/[0.02] md:block">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-10 px-6 py-8 lg:px-8">
        <div className="max-w-md space-y-2">
          <p className="font-[family:var(--font-logo-app)] text-lg tracking-[0.18em] text-cyan-100">
            Мат Hero
          </p>
          <p className="font-[family:var(--font-display-app)] text-base font-semibold text-white/90">
            Математика с ритъм
          </p>
          <p className="text-sm leading-6 text-[var(--mh-text-muted)]">
            Подготовка за НВО по математика за 7. клас.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 text-sm md:items-end">
          <nav className="flex flex-wrap gap-5 text-[var(--mh-text-muted)]">
            <Link href="/dashboard" className="transition hover:text-cyan-100">
              Табло
            </Link>
            <Link href="/roadmap" className="transition hover:text-cyan-100">
              Карта
            </Link>
            <Link href="/results" className="transition hover:text-cyan-100">
              Резултати
            </Link>
          </nav>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            © 2026 Мат Hero. Всички права запазени.
          </p>
        </div>
      </div>
    </footer>
  );
}
