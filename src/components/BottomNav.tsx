"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BarChart3, Map, Trophy } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Табло", icon: BarChart3 },
  { href: "/roadmap", label: "Карта", icon: Map },
  { href: "/results", label: "Резултати", icon: Trophy },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 gap-2 rounded-[var(--mh-radius-card-lg)] border border-white/10 bg-[rgba(8,11,22,0.94)] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.52)] backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <motion.div key={item.href} className="flex-1" whileTap={{ scale: 0.97 }}>
            <Link
              href={item.href}
              className={`block rounded-[16px] px-2 py-2.5 text-center text-xs font-semibold transition ${
                active
                  ? "bg-[linear-gradient(180deg,rgba(16,27,63,0.96),rgba(10,17,39,0.96))] text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.18),0_0_18px_rgba(34,211,238,0.08)]"
                  : "text-[var(--mh-text-muted)] hover:bg-white/6 hover:text-white"
              }`}
            >
              <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-lg border border-current/20 text-xs leading-none">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="mt-1 block">{item.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
