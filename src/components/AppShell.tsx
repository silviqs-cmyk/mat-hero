"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BackgroundMathSymbols } from "@/components/BackgroundMathSymbols";
import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/TopBar";

function getRouteTitle(pathname: string): { title: string; subtitle: string } {
  if (pathname === "/") {
    return { title: "MatHero", subtitle: "Подготовка по математика за 7. клас" };
  }

  if (pathname.startsWith("/dashboard")) {
    return { title: "Табло", subtitle: "XP, серия и днешна мисия" };
  }

  if (pathname.startsWith("/roadmap")) {
    return { title: "Пътна карта", subtitle: "10 дни до увереност" };
  }

  if (pathname.startsWith("/lesson")) {
    return { title: "Урок", subtitle: "Кратко обяснение и пример" };
  }

  if (pathname.startsWith("/quiz")) {
    return { title: "Тест", subtitle: "Един въпрос наведнъж" };
  }

  if (pathname.startsWith("/explanation")) {
    return { title: "Обяснение", subtitle: "Решение стъпка по стъпка" };
  }

  if (pathname.startsWith("/results")) {
    return { title: "Резултати", subtitle: "Как се справи днес" };
  }

  if (pathname.startsWith("/report")) {
    return { title: "Отчет", subtitle: "Слаби теми и напредък" };
  }

  return { title: "MatHero", subtitle: "Математика с ритъм" };
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { title, subtitle } = getRouteTitle(pathname);
  const isLanding = pathname === "/";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden border-x border-white/8 bg-[rgba(5,7,13,0.94)] shadow-[0_24px_90px_rgba(0,0,0,0.7)] ${
        isLanding ? "lg:max-w-md" : "lg:max-w-7xl"
      }`}
    >
      <BackgroundMathSymbols />
      {isLanding ? null : (
        <div className="relative z-10">
          <TopBar title={title} subtitle={subtitle} />
        </div>
      )}
      <main
        className={`relative z-10 flex-1 ${
          isLanding ? "p-0" : "px-4 pb-28 pt-4 lg:px-8 lg:pb-10"
        } lg:pl-64`}
      >
        {children}
      </main>
      <div className="relative z-10">
        <BottomNav />
      </div>
    </motion.div>
  );
}
