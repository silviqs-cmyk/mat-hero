"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BarChart3, Map, Trophy, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Табло", icon: BarChart3 },
  { href: "/roadmap", label: "Карта", icon: Map },
  { href: "/results", label: "Резултати", icon: Trophy },
  { href: "/report", label: "Профил", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 gap-2 rounded-[var(--mh-radius-card-lg)] border border-white/10 bg-[rgba(8,11,22,0.94)] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.52)] backdrop-blur-xl lg:bottom-auto lg:left-[max(1rem,calc(50%-40rem+2rem))] lg:top-28 lg:w-60 lg:max-w-none lg:translate-x-0 lg:flex-col lg:p-3">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);

        return (
          <motion.div key={item.href} className="flex-1 lg:flex-none" whileTap={{ scale: 0.97 }}>
            <Link
              href={item.href}
              className={`block rounded-[16px] px-2 py-2.5 text-center text-xs font-semibold transition lg:flex lg:items-center lg:gap-3 lg:px-4 lg:py-3 lg:text-left lg:text-sm ${
                active
                  ? "bg-[linear-gradient(180deg,rgba(16,27,63,0.96),rgba(10,17,39,0.96))] text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.18),0_0_18px_rgba(34,211,238,0.08)]"
                  : "text-[var(--mh-text-muted)] hover:bg-white/6 hover:text-white"
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

      <div className="hidden lg:block">
        <div className="mt-3 overflow-hidden rounded-[20px] border border-cyan-400/14 bg-[linear-gradient(180deg,rgba(8,12,25,0.96),rgba(11,18,34,0.96))] p-3 shadow-[0_0_28px_rgba(34,211,238,0.08)]">
          <div className="flex justify-center">
            <Image
              src="/choose.gif"
              alt="MatHero mascot animation"
              width={220}
              height={220}
              className="h-auto w-full max-w-[170px] rounded-[16px] object-contain"
              priority
              unoptimized
            />
          </div>
          <p className="mt-3 text-center text-xs font-medium text-[var(--mh-text-muted)]">
            MatHero мисли за следващата ти победа.
          </p>
        </div>
      </div>
    </nav>
  );
}
