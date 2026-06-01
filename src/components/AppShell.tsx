"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BackgroundMathSymbols } from "@/components/BackgroundMathSymbols";
import { BottomNav } from "@/components/BottomNav";
import { AppFooter } from "@/components/layout/AppFooter";
import { StudentSideNav } from "@/components/StudentSideNav";
import { useAppState } from "@/components/providers/AppStateProvider";
import { TopBarProgressProvider } from "@/components/providers/TopBarProgressProvider";
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
    pathname === "/profile" ||
    pathname === "/report" ||
    pathname.startsWith("/day/") ||
    pathname.startsWith("/course/")
  );
}

function isStudentAppRoute(pathname: string) {
  return (
    isProtectedStudentRoute(pathname) ||
    pathname === "/results" ||
    pathname === "/roadmap" ||
    pathname.startsWith("/lesson/") ||
    pathname.startsWith("/quiz/") ||
    pathname.startsWith("/explanation/")
  );
}

function shouldShowDesktopFooter(pathname: string) {
  if (
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/report"
  ) {
    return false;
  }

  return true;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { authUser } = useAppState();
  const landing = pathname === "/";
  const admin = pathname.startsWith("/admin");
  const auth = isAuthRoute(pathname);
  const studentAppRoute = isStudentAppRoute(pathname);
  const protectedStudentRoute = isProtectedStudentRoute(pathname);
  const canShowProtectedChrome =
    !protectedStudentRoute || (authUser.isReady && Boolean(authUser.id) && Boolean(authUser.displayName.trim()));
  const showStudentChrome = !landing && !admin && !auth && studentAppRoute && canShowProtectedChrome;
  const showDesktopFooter = shouldShowDesktopFooter(pathname);

  return (
    <TopBarProgressProvider>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`relative mx-auto min-h-screen w-full overflow-x-hidden border-x border-white/8 bg-[rgba(8,11,22,0.88)] shadow-[0_24px_90px_rgba(0,0,0,0.7)] ${
          landing ? "max-w-md lg:max-w-[1440px]" : admin ? "max-w-md lg:max-w-[1680px]" : auth ? "max-w-md lg:max-w-full" : "max-w-md lg:max-w-7xl"
        }`}
      >
        <BackgroundMathSymbols />

        {showStudentChrome ? (
          <div className="relative z-10 grid min-h-screen grid-rows-[auto_minmax(0,1fr)_auto]">
            <TopBar />

            <div className="flex min-h-0 flex-col lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
              <div className="hidden lg:block">
                <StudentSideNav />
              </div>

              <div className="min-w-0 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6">
                <main className="min-w-0">{children}</main>
              </div>
            </div>

            {showDesktopFooter ? <AppFooter /> : null}

            <BottomNav />
          </div>
        ) : (
          <div className="relative z-10 flex min-h-screen flex-col">
            <main
              className={`flex-1 ${
                landing ? "p-0" : admin ? "p-0" : auth ? "p-0" : "px-4 py-5 sm:px-6 lg:px-8 lg:py-6"
              }`}
            >
              {children}
            </main>

            {showDesktopFooter ? <AppFooter /> : null}
          </div>
        )}
      </motion.div>
    </TopBarProgressProvider>
  );
}
