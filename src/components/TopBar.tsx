"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { signOutUser } from "@/lib/supabaseClient";

interface TopBarProps {
  title: string;
  subtitle: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[rgba(5,7,13,0.9)] px-4 py-4 backdrop-blur-xl">
      <div className="flex min-h-[88px] items-start justify-between gap-4">
        <div className="flex items-start gap-3 text-left">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center">
            <AnimatedHeroMascot size="sm" animated={false} />
          </div>
          <div className="pt-1">
            <p className="font-logo text-[1.7rem] font-extrabold leading-none text-white">
              MatHero
            </p>
            <p className="mt-2 max-w-[220px] text-xs leading-5 text-[var(--muted)]">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -1 }}>
            <Link
              href="/report"
              className="btn-neon-outline rounded-xl px-3 py-2 text-sm font-semibold transition"
            >
              Профил
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -1 }}>
            <button
              type="button"
              onClick={() => {
                void handleSignOut();
              }}
              className="rounded-xl border border-pink-400/35 bg-pink-400/8 px-3 py-2 text-sm font-semibold text-pink-100 shadow-[0_0_18px_rgba(255,78,209,0.12)] transition hover:bg-pink-400/12"
            >
              Изход
            </button>
          </motion.div>
        </div>
      </div>

      <div className="mt-2 text-center">
        <h1 className="font-display text-2xl text-white">{title}</h1>
      </div>
    </header>
  );
}
