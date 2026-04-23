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
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[rgba(5,7,13,0.88)] px-4 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-400/8 shadow-[0_0_18px_rgba(37,221,255,0.24)]">
            <svg viewBox="0 0 48 48" className="h-8 w-8 overflow-visible" aria-hidden="true">
              <circle
                cx="24"
                cy="15"
                r="9"
                fill="rgba(37,221,255,0.06)"
                stroke="#8ff4ff"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M16 10 Q24 5 32 11"
                fill="none"
                stroke="#b65cff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="20.5" cy="15" r="1.4" fill="#8ff4ff" />
              <circle cx="27.5" cy="15" r="1.4" fill="#8ff4ff" />
              <path
                d="M19 20 Q24 24 29 20"
                fill="none"
                stroke="#c9ff00"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M24 25 L24 37" stroke="#8ff4ff" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M24 29 L15 36" stroke="#8ff4ff" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M24 29 L34 35" stroke="#8ff4ff" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M24 37 L18 45" stroke="#8ff4ff" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M24 37 L31 45" stroke="#8ff4ff" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-white">MatHero</p>
            <p className="text-xs text-[var(--muted)]">{subtitle}</p>
          </div>
        </div>
        <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -1 }}>
          <Link
            href={isHome ? "/dashboard" : "/roadmap"}
            className="btn-neon-outline rounded-xl px-3 py-2 text-sm font-semibold transition"
          >
            {isHome ? "Старт" : "План"}
          </Link>
        </motion.div>
      </div>
      <div className="mt-3">
        <h1 className="font-display text-2xl text-white">{title}</h1>
      </div>
    </header>
  );
}
