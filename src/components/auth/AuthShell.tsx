import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  hideIntro?: boolean;
  hideHeader?: boolean;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  hideIntro = false,
  hideHeader = false,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(34,211,238,0.1),transparent_18%)]" />

      <div className="relative z-10 w-full max-w-md">
        {!hideHeader ? (
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex flex-col items-center gap-3 text-white transition">
              <div className="mh-card-muted flex h-16 w-16 items-center justify-center rounded-3xl p-2">
                <AnimatedHeroMascot size="sm" animated={false} />
              </div>
              <div className="space-y-2">
                <div className="font-logo text-4xl font-black tracking-tight text-white">MatHero</div>
                <p className="mh-copy-sm font-medium">
                  Учи уверено. Решавай смело.
                </p>
              </div>
            </Link>
          </div>
        ) : null}

        {!hideIntro ? (
          <div className="mb-6 text-center">
            <SectionLabel>{eyebrow}</SectionLabel>
            <h1 className="mh-heading-lg mt-3">{title}</h1>
            <p className="mh-copy mt-3">{description}</p>
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
