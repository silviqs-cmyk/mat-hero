"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/TopBar";

const hiddenBottomNavRoutes = ["/", "/quiz", "/explanation"];

function getRouteTitle(pathname: string): { title: string; subtitle: string } {
  if (pathname === "/") {
    return {
      title: "MatHero",
      subtitle: "Мобилна подготовка за 7. клас",
    };
  }

  if (pathname.startsWith("/dashboard")) {
    return { title: "Твоят табло", subtitle: "Следи прогреса си всеки ден" };
  }

  if (pathname.startsWith("/roadmap")) {
    return { title: "10-дневен план", subtitle: "Само 3 активни мисии наведнъж" };
  }

  if (pathname.startsWith("/lesson")) {
    return { title: "Урок", subtitle: "Кратка теория + пример" };
  }

  if (pathname.startsWith("/quiz")) {
    return { title: "Бърз куиз", subtitle: "Един въпрос наведнъж" };
  }

  if (pathname.startsWith("/explanation")) {
    return { title: "Обяснение", subtitle: "Стъпка по стъпка" };
  }

  if (pathname.startsWith("/results")) {
    return { title: "Резултат", subtitle: "Как се справи днес" };
  }

  if (pathname.startsWith("/report")) {
    return { title: "Финален отчет", subtitle: "Слабите теми и напредъкът" };
  }

  return { title: "MatHero", subtitle: "Математика с ритъм" };
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { title, subtitle } = getRouteTitle(pathname);
  const showBottomNav = !hiddenBottomNavRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[rgba(16,19,29,0.92)] shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
    >
      <TopBar title={title} subtitle={subtitle} />
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
      {showBottomNav ? <BottomNav /> : null}
    </motion.div>
  );
}
