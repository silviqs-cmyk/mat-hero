import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";

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
            <BrandMark
              layout="stacked"
              size="md"
              title="MatHero Admin"
              subtitle="Контрол и яснота на едно място."
              titleClassName="font-black tracking-tight"
            />
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
