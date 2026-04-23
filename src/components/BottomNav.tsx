"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Табло" },
  { href: "/roadmap", label: "План" },
  { href: "/results", label: "Резултат" },
  { href: "/report", label: "Отчет" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 gap-2 rounded-[28px] border border-white/8 bg-[rgba(12,15,24,0.95)] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);

        return (
          <motion.div key={item.href} className="flex-1" whileTap={{ scale: 0.97 }}>
            <Link
              href={item.href}
              className={`block rounded-[20px] px-3 py-3 text-center text-sm font-semibold transition ${
                active
                  ? "bg-[linear-gradient(135deg,rgba(57,215,255,0.24),rgba(248,78,200,0.22))] text-white shadow-[0_0_24px_rgba(57,215,255,0.18)]"
                  : "text-slate-300 hover:bg-white/6 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
