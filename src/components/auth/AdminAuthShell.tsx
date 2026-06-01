import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

interface AdminAuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AdminAuthShell({ title, description, children }: AdminAuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.14),transparent_22%),radial-gradient(circle_at_84%_10%,rgba(34,211,238,0.1),transparent_18%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3 text-white transition">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100 shadow-[0_0_28px_rgba(217,70,239,0.16)]">
              <ShieldCheck className="h-8 w-8" />
            </span>
            <div className="space-y-2">
              <div className="font-logo text-4xl font-black tracking-tight text-white">MatHero Admin</div>
              <p className="text-sm font-medium text-[var(--mh-text-muted)]">Контрол и яснота на едно място.</p>
            </div>
          </Link>
        </div>

        <div className="mb-6 text-center">
          <p className="mh-label">Админ панел</p>
          <h1 className="mh-heading-lg mt-3">{title}</h1>
          <p className="mh-copy mt-3">{description}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
