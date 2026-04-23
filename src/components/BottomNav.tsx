"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BarChart3, Map, Trophy, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Табло", icon: BarChart3 },
  { href: "/roadmap", label: "Карта", icon: Map },
  { href: "/results", label: "Резултат", icon: Trophy },
  { href: "/report", label: "Профил", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 gap-2 rounded-[24px] border border-white/10 bg-[rgba(8,11,18,0.96)] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.68)] backdrop-blur-xl lg:bottom-auto lg:left-[max(1rem,calc(50%-40rem+2rem))] lg:top-28 lg:w-52 lg:max-w-none lg:translate-x-0 lg:flex-col lg:rounded-[28px] lg:p-3">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);

        return (
          <motion.div key={item.href} className="flex-1 lg:flex-none" whileTap={{ scale: 0.97 }}>
            <Link
              href={item.href}
              className={`block rounded-[18px] px-2 py-2.5 text-center text-xs font-semibold transition lg:flex lg:items-center lg:gap-3 lg:px-4 lg:py-3 lg:text-left lg:text-sm ${
                active
                  ? "bg-lime-300/10 text-lime-200 shadow-[0_0_20px_rgba(201,255,0,0.18)] ring-1 ring-lime-300/35"
                  : "text-slate-400 hover:bg-white/6 hover:text-white"
              }`}
            >
              <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-lg border border-current/20 text-xs leading-none lg:mx-0">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="mt-1 block lg:mt-0">{item.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
