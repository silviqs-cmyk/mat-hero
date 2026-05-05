"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import { signOut } from "@/lib/auth/client";

interface AdminRouteShellProps {
  children: ReactNode;
}

export function AdminRouteShell({ children }: AdminRouteShellProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 border-b border-white/8 bg-[rgba(6,9,20,0.88)] px-4 py-4 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="min-w-0">
            <Link href="/admin" className="inline-flex items-center gap-3 text-white transition hover:text-cyan-100">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100 shadow-[0_0_24px_rgba(217,70,239,0.16)]">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="font-logo text-[1.8rem] font-extrabold leading-none text-white">MatHero Admin</p>
                <p className="mt-1 text-sm text-slate-400">Управление на курсове, уроци и задачи</p>
              </div>
            </Link>
          </div>

          <NeonButton
            type="button"
            onClick={() => void handleSignOut()}
            variant="danger"
            className="min-h-0 px-4 py-3 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Изход
          </NeonButton>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
