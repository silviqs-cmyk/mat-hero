import Link from "next/link";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7">
      <path
        d="M8 3 H22 L17 13 H24 L10 29 L14 17 H7 Z"
        fill="rgba(182,92,255,0.12)"
        stroke="#d779ff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070d] px-5 py-5 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(37,221,255,0.16),transparent_18%),radial-gradient(circle_at_22%_74%,rgba(182,92,255,0.16),transparent_24%),radial-gradient(circle_at_82%_55%,rgba(255,78,209,0.12),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,rgba(143,244,255,0.7)_0_1px,transparent_1px)] [background-position:18px_32px] [background-size:58px_58px]" />

      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="drop-shadow-[0_0_12px_rgba(182,92,255,0.65)]">
            <LogoMark />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">MatHero</span>
        </div>
        <button
          type="button"
          aria-label="Меню"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/90"
        >
          <span className="space-y-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
          </span>
        </button>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center text-center">
        <section className="pt-9">
          <h1 className="mx-auto max-w-[330px] font-display text-[28px] font-extrabold leading-tight tracking-tight text-[#d8cbff] drop-shadow-[0_0_18px_rgba(182,92,255,0.55)]">
            Твоят герой
            <br />
            за матурата по математика
          </h1>
          <p className="mx-auto mt-4 max-w-[310px] text-sm leading-5 text-white/78">
            10 дни. Ясна стратегия. Реални резултати.
            <br />
            Подготви се уверено и постигни отличен резултат!
          </p>
        </section>

        <section className="relative mt-5 w-full">
          <div className="absolute left-6 top-20 text-4xl font-light text-cyan-300 drop-shadow-[0_0_12px_rgba(37,221,255,0.8)]">
            %
          </div>
          <div className="absolute right-10 top-16 text-4xl font-light text-pink-400 drop-shadow-[0_0_12px_rgba(255,78,209,0.75)]">
            x²
          </div>
          <svg
            viewBox="0 0 70 70"
            className="absolute left-0 top-32 h-16 w-16 overflow-visible text-indigo-300 drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]"
          >
            <path d="M8 60 L24 8 L62 56 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="49" cy="50" r="1.5" fill="currentColor" />
          </svg>
          <AnimatedHeroMascot />
        </section>

        <section className="relative z-10 mt-1 w-full">
          <Link
            href="/dashboard"
            className="mx-auto flex h-12 w-[205px] items-center justify-center gap-3 rounded-xl bg-[#c9ff00] text-sm font-extrabold text-[#101604] shadow-[0_0_28px_rgba(201,255,0,0.48)] transition hover:brightness-110"
          >
            Започни приключението
            <span className="text-lg leading-none">›</span>
          </Link>
          <button
            type="button"
            className="mt-5 inline-flex items-center gap-3 text-sm text-[#d8cbff]"
          >
            Как работи?
            <span className="text-lg text-white">⌄</span>
          </button>
        </section>
      </main>
    </div>
  );
}
