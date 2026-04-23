"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface TopBarProps {
  title: string;
  subtitle: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[rgba(16,19,29,0.86)] px-4 py-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
            MatHero
          </p>
          <h1 className="mt-1 font-display text-2xl text-white">{title}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
        </div>
        <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -1 }}>
          <Link
            href={isHome ? "/dashboard" : "/roadmap"}
            className="btn-neon-outline rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            {isHome ? "Старт" : "План"}
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
