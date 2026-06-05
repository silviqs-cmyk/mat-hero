"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Map, Trophy } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Табло", icon: BarChart3 },
  { href: "/roadmap", label: "Карта", icon: Map },
  { href: "/results", label: "Резултати", icon: Trophy },
] as const;

const accentStyles = {
  "/dashboard": {
    active:
      "border-cyan-300/35 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),rgba(16,27,63,0.96)_52%,rgba(10,17,39,0.96))] text-cyan-50 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.22),0_0_20px_rgba(34,211,238,0.2),0_0_42px_rgba(37,99,235,0.14)]",
    idle:
      "border-cyan-400/10 text-[var(--mh-text-muted)] hover:border-cyan-300/20 hover:bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),rgba(255,255,255,0.04)_55%,rgba(255,255,255,0.02))] hover:text-cyan-50 hover:shadow-[0_0_18px_rgba(34,211,238,0.08)]",
    icon: "from-cyan-300/30 to-blue-400/12",
  },
  "/roadmap": {
    active:
      "border-fuchsia-300/35 bg-[radial-gradient(circle_at_top,rgba(232,121,249,0.2),rgba(43,18,62,0.96)_52%,rgba(20,12,35,0.96))] text-fuchsia-50 shadow-[inset_0_0_0_1px_rgba(232,121,249,0.22),0_0_20px_rgba(217,70,239,0.18),0_0_42px_rgba(168,85,247,0.14)]",
    idle:
      "border-fuchsia-400/10 text-[var(--mh-text-muted)] hover:border-fuchsia-300/20 hover:bg-[radial-gradient(circle_at_top,rgba(232,121,249,0.1),rgba(255,255,255,0.04)_55%,rgba(255,255,255,0.02))] hover:text-fuchsia-50 hover:shadow-[0_0_18px_rgba(217,70,239,0.08)]",
    icon: "from-fuchsia-300/30 to-violet-400/12",
  },
  "/results": {
    active:
      "border-amber-300/35 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.2),rgba(58,33,8,0.96)_52%,rgba(27,17,8,0.96))] text-amber-50 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.22),0_0_20px_rgba(251,191,36,0.18),0_0_42px_rgba(245,158,11,0.14)]",
    idle:
      "border-amber-400/10 text-[var(--mh-text-muted)] hover:border-amber-300/20 hover:bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.1),rgba(255,255,255,0.04)_55%,rgba(255,255,255,0.02))] hover:text-amber-50 hover:shadow-[0_0_18px_rgba(251,191,36,0.08)]",
    icon: "from-amber-300/30 to-orange-400/12",
  },
} as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 gap-2 rounded-[var(--mh-radius-card-lg)] border border-white/10 bg-[rgba(8,11,22,0.94)] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.52)] backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const accent = accentStyles[item.href];

        return (
          <motion.div key={item.href} className="flex-1" whileTap={{ scale: 0.97 }}>
            <Link
              href={item.href}
              className={`block rounded-[18px] border px-2 py-2.5 text-center text-xs font-semibold transition duration-200 ${
                active ? accent.active : accent.idle
              }`}
            >
              <span
                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-xl border border-current/20 bg-gradient-to-br ${accent.icon} text-xs leading-none shadow-[0_0_18px_rgba(255,255,255,0.06)]`}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <span className="mt-1.5 block tracking-[0.01em]">{item.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
