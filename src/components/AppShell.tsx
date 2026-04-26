"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BackgroundMathSymbols } from "@/components/BackgroundMathSymbols";
import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/TopBar";

function getRouteTitle(pathname: string): { title: string; subtitle: string } {
  // Landing screen before the user enters the main app flow.
  if (pathname === "/") {
    return { title: "MatHero", subtitle: "Подготовка по математика за 7. клас" };
  }

  // Main dashboard with today's progress and quick actions.
  if (pathname.startsWith("/dashboard")) {
    return { title: "Табло", subtitle: "XP, серия и днешна мисия" };
  }

  // 10-day roadmap page.
  if (pathname.startsWith("/roadmap")) {
    return { title: "Пътна карта", subtitle: "10 дни до увереност" };
  }

  // Daily lesson screen with theory and examples.
  if (pathname.startsWith("/lesson")) {
    return { title: "Урок", subtitle: "Кратко обяснение и пример" };
  }

  // Quiz/test flow.
  if (pathname.startsWith("/quiz")) {
    return { title: "Тест", subtitle: "Един въпрос наведнъж" };
  }

  // Explanation page for a selected question.
  if (pathname.startsWith("/explanation")) {
    return { title: "Обяснение", subtitle: "Решение стъпка по стъпка" };
  }

  // Results shown after completing a quiz.
  if (pathname.startsWith("/results")) {
    return { title: "Резултати", subtitle: "Как се справи днес" };
  }

  // User profile page.
  if (pathname.startsWith("/report")) {
    return { title: "Профил", subtitle: "" };
  }

  // Fallback title for any route outside the main mapped pages.
  return { title: "MatHero", subtitle: "Математика с ритъм" };
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { subtitle } = getRouteTitle(pathname);
  const isLanding = pathname === "/";
  const showBottomNav = !isLanding;

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
          <TopBar subtitle={subtitle} />
        </div>
      )}
      <main
        className={`relative z-10 flex-1 ${
          isLanding ? "p-0" : "px-4 pb-28 pt-4 lg:px-8 lg:pb-10"
        } ${showBottomNav ? "lg:pl-64" : ""}`}
      >
        {children}
      </main>
      {showBottomNav ? (
        <div className="relative z-10">
          <BottomNav />
        </div>
      ) : null}
    </motion.div>
  );
}
