"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BackgroundMathSymbols } from "@/components/BackgroundMathSymbols";
import { BottomNav } from "@/components/BottomNav";
import { useAppState } from "@/components/providers/AppStateProvider";
import { TopBar } from "@/components/TopBar";

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
          <TopBar />
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
