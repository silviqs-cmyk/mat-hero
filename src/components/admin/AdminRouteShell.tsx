"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LayoutDashboard, LogOut, Map } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { NeonButton } from "@/components/ui/NeonButton";
import { signOut } from "@/lib/auth/client";

interface AdminRouteShellProps {
  children: ReactNode;
}

export function AdminRouteShell({ children }: AdminRouteShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboardActive = pathname === "/admin" || pathname.startsWith("/admin/days/");
  const isPlanActive = pathname === "/admin/plan" || pathname.startsWith("/admin/day/");

  async function handleSignOut() {
    await signOut();
    router.push("/admin/login");
  }

  return (
    <div className="space-y-6">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(7,11,22,0.82)] px-4 py-4 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin" className="inline-flex min-w-0 items-center gap-3 text-white transition hover:text-cyan-100">
              <BrandMark />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <NeonButton
              href="/admin"
              variant={isDashboardActive ? "primary" : "ghost"}
              className="min-h-0 px-4 py-3 text-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              Програма
            </NeonButton>
            <NeonButton
              href="/admin/plan"
              variant={isPlanActive ? "primary" : "ghost"}
              className="min-h-0 px-4 py-3 text-sm"
            >
              <Map className="h-4 w-4" />
              План
            </NeonButton>
            <NeonButton
              type="button"
              onClick={() => void handleSignOut()}
              variant="ghost"
              className="min-h-0 px-4 py-3 text-sm"
            >
              <LogOut className="h-4 w-4" />
              Изход
            </NeonButton>
          </div>
        </div>
      </header>

      <div>{children}</div>
    </div>
  );
}
