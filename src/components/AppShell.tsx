"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BackgroundMathSymbols } from "@/components/BackgroundMathSymbols";
import { BottomNav } from "@/components/BottomNav";
import { useAppState } from "@/components/providers/AppStateProvider";
import { TopBar } from "@/components/TopBar";

function getRouteTitle(pathname: string): { title: string; subtitle: string } {
  if (pathname === "/") {
    return { title: "MatHero", subtitle: "Подготовка по математика за 7. клас" };
  }

  if (pathname.startsWith("/dashboard")) {
    return { title: "Табло", subtitle: "XP, серия и дневна мисия" };
  }

  if (pathname.startsWith("/design-system")) {
    return { title: "Design System", subtitle: "MatHero UI board и tokens" };
  }

  if (pathname.startsWith("/admin")) {
    return { title: "Admin Studio", subtitle: "Курсове, дни, уроци и preview" };
  }

  if (pathname.startsWith("/roadmap")) {
    return { title: "Пътна карта", subtitle: "10 дни до увереност" };
  }

  if (pathname.startsWith("/course/") && pathname.includes("/results")) {
    return { title: "Резултат", subtitle: "Реалният резултат от деня" };
  }

  if (pathname.startsWith("/course/") && pathname.includes("/quiz")) {
    return { title: "Тест", subtitle: "Завърши деня и запази резултата си" };
  }

  if (pathname.startsWith("/course/") && pathname.includes("/practice")) {
    return { title: "Задачи", subtitle: "Тренирай с реалните въпроси от деня" };
  }

  if (pathname.startsWith("/course/") && pathname.includes("/lesson")) {
    return { title: "Урок", subtitle: "Теория, пример и кратко видео" };
  }

  if (pathname.startsWith("/course/")) {
    return { title: "Дневен план", subtitle: "Текущият ден от твоя 10-дневен курс" };
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
    return { title: "Профил", subtitle: "Твоят напредък и силни теми" };
  }

  return { title: "MatHero", subtitle: "Математика с ритъм" };
}

function isAuthRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/admin/login"
  );
}

function isProtectedStudentRoute(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname === "/report" ||
    pathname.startsWith("/course/")
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { authUser } = useAppState();
  const { subtitle } = getRouteTitle(pathname);
  const landing = pathname === "/";
  const admin = pathname.startsWith("/admin");
  const auth = isAuthRoute(pathname);
  const protectedStudentRoute = isProtectedStudentRoute(pathname);
  const canShowProtectedChrome = !protectedStudentRoute || (authUser.isReady && !authUser.isGuest);
  const showTopBar = !landing && !admin && !auth && canShowProtectedChrome;
  const showBottomNav = !landing && !admin && !auth && canShowProtectedChrome;
  const lockShellViewport = showTopBar || showBottomNav;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative mx-auto flex w-full max-w-md flex-col overflow-x-hidden border-x border-white/8 bg-[rgba(8,11,22,0.88)] shadow-[0_24px_90px_rgba(0,0,0,0.7)] ${
        lockShellViewport ? "mh-shell-viewport overflow-y-hidden" : "min-h-screen overflow-y-visible"
      } ${
        landing ? "lg:max-w-[1440px]" : admin ? "lg:max-w-[1680px]" : auth ? "lg:max-w-full" : "lg:max-w-7xl"
      }`}
    >
      <BackgroundMathSymbols />
      {showTopBar ? (
        <div className="relative z-10">
          <TopBar subtitle={subtitle} />
        </div>
      ) : null}
      <main
        className={`relative z-10 flex-1 min-h-0 ${
          landing ? "p-0" : admin ? "p-0" : auth ? "p-0" : "px-4 pb-36 pt-5 sm:pb-32 lg:px-8 lg:pb-12 lg:pt-6"
        } ${showBottomNav ? "lg:pl-[17.5rem]" : ""} ${
          lockShellViewport ? "mh-shell-scroll overflow-y-auto overscroll-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" : ""
        }`}
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
