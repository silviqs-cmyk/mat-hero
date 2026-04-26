"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { signOutUser } from "@/lib/supabaseClient";

interface TopBarProps {
  subtitle: string;
}

export function TopBar({ subtitle }: TopBarProps) {
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
            {subtitle ? (
              <p className="mt-2 max-w-[220px] text-xs leading-5 text-[var(--muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -1 }}>
            <Link
              href="/report"
              className="btn-neon-outline rounded-xl px-3 py-2 text-sm"
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
              className="btn-neon-danger rounded-xl px-3 py-2 text-sm"
            >
              Изход
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
